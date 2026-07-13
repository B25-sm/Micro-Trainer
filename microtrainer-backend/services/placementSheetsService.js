// =======================================================
// 📤 PLACEMENT SHEETS
// Two forwardable Google Sheets tabs for the placement team:
//   • "Placement Summary"  — one upserted row per candidate (skill levels)
//   • "Interview Feedback" — one row per interview question (feedback text)
// All writes are best-effort and no-op when Sheets is not configured.
// =======================================================

const { getSheetsApi, isSheetsWriteEnabled } = require("./googleSheetsAuth");
const { SKILL_ROWS } = require("./placementScorecardService");

const SPREADSHEET_ID = process.env.SHEET_ID;
const SUMMARY_SHEET = "Placement Summary";
const FEEDBACK_SHEET = "Interview Feedback";

// Deterministic column order for the summary tab.
const SKILL_LABELS = [
  ...SKILL_ROWS.map((r) => r.label),
  "Problem-solving",
  "Communication",
];
const SUMMARY_HEADER = [
  "Updated",
  "Student ID",
  "Name",
  "Batch",
  "Track",
  ...SKILL_LABELS,
  "Overall",
  "Verdict",
  "Focus areas",
];

const FEEDBACK_HEADER = [
  "Timestamp",
  "Student ID",
  "Name",
  "Subject",
  "Session ID",
  "Status",
  "Q#",
  "Difficulty",
  "Question",
  "Score (/10)",
  "Communication",
  "Technical",
  "Strengths",
  "Mistakes",
  "Improvement",
];

function safe(val) {
  if (val === undefined || val === null) return "";
  if (Array.isArray(val)) return val.join(", ");
  return val;
}

function colLetter(n) {
  // 1 -> A, 26 -> Z, 27 -> AA
  let s = "";
  while (n > 0) {
    const rem = (n - 1) % 26;
    s = String.fromCharCode(65 + rem) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

/** Create a tab with a frozen header row if it doesn't already exist. */
async function ensureSheet(sheets, title, header) {
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  const exists = spreadsheet.data.sheets?.some((s) => s.properties?.title === title);
  if (exists) return;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    resource: {
      requests: [
        {
          addSheet: {
            properties: { title, gridProperties: { frozenRowCount: 1 } },
          },
        },
      ],
    },
  });
  const endCol = colLetter(header.length);
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${title}!A1:${endCol}1`,
    valueInputOption: "USER_ENTERED",
    resource: { values: [header] },
  });
  console.log(`✅ Google Sheets: created tab "${title}"`);
}

/** Turn a scorecard into a single summary row (aligned to SUMMARY_HEADER). */
function scorecardToRow(scorecard) {
  const levelByKey = {};
  for (const s of scorecard.skills || []) levelByKey[s.key] = s.level;

  const skillCells = [
    ...SKILL_ROWS.map((r) => safe(levelByKey[r.key])),
    safe(levelByKey["problem-solving"]),
    safe(levelByKey["communication"]),
  ];

  const focusAreas = (scorecard.topWeakConcepts || [])
    .map((c) => `${c.technology}: ${c.label}`)
    .join("; ");

  return [
    new Date(scorecard.generatedAt || Date.now()).toISOString(),
    safe(scorecard.studentId),
    safe(scorecard.name),
    safe(scorecard.batch),
    safe(scorecard.careerTrack),
    ...skillCells,
    safe(scorecard.overall?.level),
    safe(scorecard.overall?.message),
    safe(focusAreas),
  ];
}

/**
 * Upsert one candidate's summary row (matched by Student ID in column B).
 * Pass an array to write many candidates in one refresh.
 */
async function logPlacementSummary(scorecardOrList) {
  if (!isSheetsWriteEnabled()) return false;
  const list = Array.isArray(scorecardOrList) ? scorecardOrList : [scorecardOrList];
  if (list.length === 0) return false;

  try {
    const sheets = await getSheetsApi();
    await ensureSheet(sheets, SUMMARY_SHEET, SUMMARY_HEADER);

    // Read existing Student IDs (column B) to decide update vs. append.
    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SUMMARY_SHEET}!B:B`,
    });
    const idColumn = existing.data.values || []; // [["Student ID"], ["s1"], ...]
    const rowById = new Map();
    idColumn.forEach((cell, idx) => {
      if (idx === 0) return; // header
      const id = cell?.[0];
      if (id) rowById.set(String(id), idx + 1); // 1-based sheet row
    });

    const endCol = colLetter(SUMMARY_HEADER.length);
    const toAppend = [];

    for (const scorecard of list) {
      const row = scorecardToRow(scorecard);
      const existingRow = rowById.get(String(scorecard.studentId));
      if (existingRow) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: `${SUMMARY_SHEET}!A${existingRow}:${endCol}${existingRow}`,
          valueInputOption: "USER_ENTERED",
          resource: { values: [row] },
        });
      } else {
        toAppend.push(row);
      }
    }

    if (toAppend.length > 0) {
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SUMMARY_SHEET}!A:${endCol}`,
        valueInputOption: "USER_ENTERED",
        insertDataOption: "INSERT_ROWS",
        resource: { values: toAppend },
      });
    }

    console.log(
      `✅ Google Sheets: placement summary synced (${list.length} candidate${list.length === 1 ? "" : "s"})`
    );
    return true;
  } catch (error) {
    console.warn("⚠️  Google Sheets: placement summary skipped —", error.message);
    return false;
  }
}

/** Append one row per answered question from an interview history record. */
async function logInterviewFeedback(record) {
  if (!isSheetsWriteEnabled()) return false;
  const questions = record?.questionScores || [];
  if (questions.length === 0) return false;

  try {
    const sheets = await getSheetsApi();
    await ensureSheet(sheets, FEEDBACK_SHEET, FEEDBACK_HEADER);

    let name = "";
    try {
      name = require("./studentProfileStore").getStudentProfile(record.studentId)?.name || "";
    } catch (_) {
      /* name is optional */
    }

    const rows = questions.map((q) => [
      new Date(record.endedAt || Date.now()).toISOString(),
      safe(record.studentId),
      safe(name),
      safe(record.subject),
      safe(record.sessionId),
      safe(record.status),
      safe(q.index),
      safe(q.difficulty),
      safe(q.question || q.questionPreview),
      safe(q.score),
      safe(q.communication),
      safe(q.technical),
      safe(q.strengths),
      safe(q.mistakes),
      safe(q.improvement),
    ]);

    const endCol = colLetter(FEEDBACK_HEADER.length);
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${FEEDBACK_SHEET}!A:${endCol}`,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      resource: { values: rows },
    });

    console.log(`✅ Google Sheets: logged ${rows.length} feedback row(s) for ${record.studentId}`);
    return true;
  } catch (error) {
    console.warn("⚠️  Google Sheets: interview feedback skipped —", error.message);
    return false;
  }
}

module.exports = { logPlacementSummary, logInterviewFeedback };
