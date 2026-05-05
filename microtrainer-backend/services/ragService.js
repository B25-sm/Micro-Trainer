const fs = require("fs");
const path = require("path");

function getRelevantContext(question, subject) {
  try {
    const filePath = path.join(__dirname, `../info/${subject}.txt`);

    if (!fs.existsSync(filePath)) return "";

    return fs.readFileSync(filePath, "utf-8");

  } catch (error) {
    console.error("RAG Error:", error.message);
    return "";
  }
}

module.exports = { getRelevantContext };