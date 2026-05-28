const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "../../microtrainer-frontend/src/components/ConceptList.jsx");
const wrongClose = "</" + "motion.div>";
const rightClose = "</" + "div>";

const arr = fs.readFileSync(file, "utf8").split("\n");
const lineIndexesToFix = [88, 142, 156, 170, 172, 184, 203, 204, 205, 241, 250, 251, 264, 268, 269, 271, 276];

for (const idx of lineIndexesToFix) {
  if (arr[idx] && arr[idx].includes(wrongClose)) {
    arr[idx] = arr[idx].replace(wrongClose, rightClose);
  }
}

fs.writeFileSync(file, arr.join("\n"));
console.log("wrongClose=", wrongClose, "rightClose=", rightClose);
console.log("Fixed line 89:", arr[88]);
