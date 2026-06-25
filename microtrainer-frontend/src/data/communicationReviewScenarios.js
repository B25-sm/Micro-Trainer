/** Built-in prompts — mirrored from backend for offline / pre-deploy fallback */
export const COMMUNICATION_REVIEW_SCENARIOS = [
  {
    id: "intro-yourself",
    category: "Introduction",
    prompt: "Tell me about yourself.",
    hint: "Keep it 60–90 seconds. Present → past → future. No life story.",
  },
  {
    id: "why-role",
    category: "Introduction",
    prompt: "Why are you interested in this role and our company?",
    hint: "Show genuine motivation — role fit, not generic praise.",
  },
  {
    id: "challenging-project",
    category: "Behavioral",
    prompt: "Describe a challenging project you worked on. What was your role?",
    hint: "Use STAR: Situation, Task, Action, Result — your actions first.",
  },
  {
    id: "team-conflict",
    category: "Behavioral",
    prompt: "Tell me about a time you disagreed with a teammate. How did you handle it?",
    hint: "Stay professional. Focus on resolution, not blame.",
  },
  {
    id: "mistake-learned",
    category: "Behavioral",
    prompt: "Tell me about a mistake you made at work or in a project. What did you learn?",
    hint: "Own the mistake. End with a concrete lesson.",
  },
  {
    id: "explain-to-manager",
    category: "Technical explanation",
    prompt:
      "Explain what an API is to a non-technical product manager in under a minute.",
    hint: "No jargon. Use a simple analogy, then one real example.",
  },
  {
    id: "explain-database",
    category: "Technical explanation",
    prompt:
      "How would you explain the difference between SQL and NoSQL to a junior developer?",
    hint: "Compare trade-offs, not definitions only.",
  },
  {
    id: "debug-approach",
    category: "Situational",
    prompt: "Walk me through how you approach debugging a bug you have never seen before.",
    hint: "Structured steps: reproduce → isolate → hypothesize → verify → fix.",
  },
  {
    id: "tight-deadline",
    category: "Situational",
    prompt:
      "You have a tight deadline and incomplete requirements. How do you communicate with your team?",
    hint: "Show clarity, prioritization, and proactive updates.",
  },
  {
    id: "weakness",
    category: "Introduction",
    prompt: "What is your greatest weakness, and how are you working on it?",
    hint: "Real weakness + specific improvement — not a humble brag.",
  },
];
