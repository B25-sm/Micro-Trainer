/**
 * Career tracks / roles. IDs align with backend CATEGORIES in
 * personalScheduleSyllabus.js. Only tracks with real question banks and
 * curriculum are `available`; the rest are shown as "Coming soon".
 */

export const CAREER_TRACKS = [
  {
    id: "fullstack",
    label: "Full Stack Developer",
    interviewSubject: "MERN Stack",
    coreTechnologies: ["JavaScript", "React", "Node.js", "MongoDB", "SQL"],
    available: true,
  },
  {
    id: "data_science",
    label: "Data Science",
    interviewSubject: "Data Science",
    coreTechnologies: ["Python", "Statistics", "Machine Learning", "SQL", "Pandas"],
    available: true,
  },
  {
    id: "data_analyst",
    label: "Data Analyst",
    interviewSubject: "Data Analyst",
    coreTechnologies: ["SQL", "Excel", "Python", "Visualization", "Statistics"],
    available: true,
  },
  {
    id: "ai_ml",
    label: "AI / ML Engineer",
    interviewSubject: "ML Engineer",
    coreTechnologies: ["Python", "Machine Learning", "Deep Learning", "NLP", "Statistics"],
    available: true,
  },
  { id: "data_scientist", label: "Data Scientist", available: false },
  { id: "cyber_security", label: "Cyber Security", available: false },
];

export const AVAILABLE_TRACKS = CAREER_TRACKS.filter((t) => t.available);

export function getTrack(id) {
  return CAREER_TRACKS.find((t) => t.id === id) || null;
}

/** Career track from the JWT payload (falls back to localStorage). */
export function getCareerTrack(authUser) {
  return authUser?.careerTrack || localStorage.getItem("careerTrack") || null;
}
