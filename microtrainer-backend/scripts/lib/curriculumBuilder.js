/**
 * Build full curriculum JSON from section/module syllabus definitions.
 */

function buildTeachingContent(title, topics, project, domainHint) {
  const topicSummary = topics.slice(0, 4).join("; ");
  const projectNote = project ? ` Project: ${project}.` : "";
  const domain = domainHint || "this technology";
  return {
    beginner: `Introduction to ${title}. ${topicSummary}.${projectNote} Use clear, runnable examples in ${domain}.`,
    intermediate: `${title}: ${topics.join(" ")}.${projectNote} Connect theory to hands-on practice with realistic scenarios.`,
    advanced: `Deep dive: ${title}. ${topics.join(" ")}.${projectNote} Cover edge cases, production patterns, and common interview topics.`,
  };
}

function buildLessonBrief(title, topics, project, domainHint) {
  const lines = [
    `MODULE BRIEF — ${title}`,
    "",
    "TOPICS TO COVER (in order):",
    ...topics.map((t) => `- ${t}`),
  ];
  if (project) lines.push("", `HANDS-ON PROJECT: ${project}`);
  lines.push(
    "",
    `TEACHING STYLE: Practical mentor for ${domainHint || "this stack"}.`,
    "Every lesson needs runnable examples and quiz questions tied to THIS module only."
  );
  return lines.join("\n");
}

function buildCrossQuestions(title, topics) {
  const t0 = topics[0]?.split(":")[0] || title;
  const t1 = topics[1]?.split(":")[0] || "this topic";
  const t2 = topics[2]?.split(":")[0] || title;
  return [
    `Explain ${t0} with a concrete example.`,
    `How would you apply ${t1} in a real project?`,
    `What is a common beginner mistake with ${t2}, and how do you avoid it?`,
  ];
}

function buildCurriculum({ technology, idPrefix, domainHint, sections }) {
  const concepts = [];
  let order = 0;

  for (const section of sections) {
    section.modules.forEach((mod, moduleIndex) => {
      order += 1;
      const moduleNum = moduleIndex + 1;
      const objectives = mod.topics.slice(0, 6);
      if (mod.project) objectives.push(`Project: ${mod.project}`);

      concepts.push({
        id: `${idPrefix}-${order}`,
        order,
        sectionId: section.id,
        sectionTitle: section.title,
        moduleNumber: moduleNum,
        title: `Module ${order}: ${mod.title}`,
        description: mod.topics[0] || mod.title,
        topics: mod.topics,
        project: mod.project || null,
        objectives,
        teachingContent: buildTeachingContent(
          mod.title,
          mod.topics,
          mod.project,
          domainHint
        ),
        lessonBrief: buildLessonBrief(
          mod.title,
          mod.topics,
          mod.project,
          domainHint
        ),
        crossQuestions: buildCrossQuestions(mod.title, mod.topics),
      });
    });
  }

  return {
    technology,
    totalConcepts: concepts.length,
    sections: sections.map((s) => ({
      id: s.id,
      title: s.title,
      moduleCount: s.modules.length,
    })),
    concepts,
  };
}

module.exports = {
  buildCurriculum,
  buildTeachingContent,
  buildLessonBrief,
  buildCrossQuestions,
};
