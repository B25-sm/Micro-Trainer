// =======================================================
// 🔗 OAuth account ↔ student profile links
// =======================================================

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "../data/progress");
const OAUTH_FILE = path.join(DATA_DIR, "oauth-accounts.json");

let accounts = {};

function load() {
  try {
    if (fs.existsSync(OAUTH_FILE)) {
      accounts = JSON.parse(fs.readFileSync(OAUTH_FILE, "utf8"));
    }
  } catch (err) {
    console.error("Error loading oauth accounts:", err.message);
    accounts = {};
  }
}

function save() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(OAUTH_FILE, JSON.stringify(accounts, null, 2));
  } catch (err) {
    console.error("Error saving oauth accounts:", err.message);
  }
}

load();

function oauthKey(provider, providerUserId) {
  return `${provider}:${providerUserId}`;
}

function getLink(provider, providerUserId) {
  return accounts[oauthKey(provider, providerUserId)] || null;
}

function upsertLink({
  provider,
  providerUserId,
  email,
  name,
  picture,
  studentId,
  profileComplete,
}) {
  const key = oauthKey(provider, providerUserId);
  accounts[key] = {
    provider,
    providerUserId,
    email: email || "",
    name: name || "",
    picture: picture || "",
    studentId: studentId || null,
    profileComplete: Boolean(profileComplete),
    updatedAt: new Date().toISOString(),
  };
  save();
  return accounts[key];
}

function bindStudentProfile(provider, providerUserId, studentId) {
  const key = oauthKey(provider, providerUserId);
  if (!accounts[key]) return null;
  accounts[key].studentId = studentId;
  accounts[key].profileComplete = true;
  accounts[key].updatedAt = new Date().toISOString();
  save();
  return accounts[key];
}

module.exports = {
  getLink,
  upsertLink,
  bindStudentProfile,
  oauthKey,
};
