/** @param {string} title @param {string[]} topics @param {string|null} [project] */
function mod(title, topics, project = null) {
  return { title, topics, project };
}

module.exports = { mod };
