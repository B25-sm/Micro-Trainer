const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "../../microtrainer-frontend/src/pages/Home.jsx");
const wrongClose = "</" + "motion.div>";
const rightClose = "</" + "motion>";
const rightCloseDiv = rightClose.replace("/motion>", "/div>");

const lines = fs.readFileSync(file, "utf8").split("\n");

if (lines[127].includes(wrongClose)) {
  lines[127] = lines[127].replace(wrongClose, rightCloseDiv);
}

for (const idx of [130, 134, 154]) {
  if (lines[idx] && lines[idx].includes("<motion.div")) {
    lines[idx] = lines[idx].replace("<motion.div", "<motion");
    lines[idx] = lines[idx].replace("<motion", "<div");
  }
}

for (const idx of [150, 151]) {
  if (lines[idx] && lines[idx].includes(wrongClose)) {
    lines[idx] = lines[idx].replace(wrongClose, rightCloseDiv);
  }
}

fs.writeFileSync(file, lines.join("\n"));
console.log("Done:", lines[127], lines[130]);
