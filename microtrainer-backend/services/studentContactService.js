/**
 * Resolve student email/name for notifications.
 */

const fs = require("fs");
const path = require("path");

const OAUTH_FILE = path.join(__dirname, "../data/progress/oauth-accounts.json");

function getContactByStudentId(studentId) {
  const id = String(studentId || "").trim();
  if (!id) return { email: null, name: "Student" };

  if (id.includes("@")) {
    return { email: id, name: id.split("@")[0] };
  }

  try {
    if (fs.existsSync(OAUTH_FILE)) {
      const accounts = JSON.parse(fs.readFileSync(OAUTH_FILE, "utf8"));
      for (const link of Object.values(accounts)) {
        if (link.studentId === id) {
          return {
            email: link.email || null,
            name: link.name || id,
          };
        }
      }
    }
  } catch (error) {
    console.error("studentContactService:", error.message);
  }

  return { email: null, name: id };
}

module.exports = {
  getContactByStudentId,
};
