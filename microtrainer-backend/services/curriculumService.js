// =======================================================
// 📚 CURRICULUM SERVICE
// Manages structured learning paths and concept curriculums
// =======================================================

const fs = require('fs');
const path = require('path');

// Load curriculum data
const curriculums = {};

function loadCurriculums() {
  const curriculumDir = path.join(__dirname, '../data/curriculums');
  
  try {
    const files = fs.readdirSync(curriculumDir);
    
    files.forEach(file => {
      if (file.endsWith('.json')) {
        const technology = file.replace('.json', '');
        const filePath = path.join(curriculumDir, file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        curriculums[technology.toLowerCase()] = data;
      }
    });
    
    console.log(`✅ Loaded ${Object.keys(curriculums).length} curriculums`);
  } catch (error) {
    console.error('Failed to load curriculums:', error.message);
  }
}

// Load curriculums on startup
loadCurriculums();

// =======================================================
// GET AVAILABLE TECHNOLOGIES
// =======================================================
function getAvailableTechnologies() {
  return Object.keys(curriculums).map(tech => ({
    id: tech,
    name: curriculums[tech].technology,
    totalConcepts: curriculums[tech].totalConcepts
  }));
}

// =======================================================
// GET CURRICULUM FOR TECHNOLOGY
// =======================================================
function getCurriculum(technology) {
  const tech = technology.toLowerCase();
  
  if (!curriculums[tech]) {
    throw new Error(`Curriculum not found for ${technology}`);
  }
  
  return curriculums[tech];
}

// =======================================================
// GET SPECIFIC CONCEPT
// =======================================================
function getConcept(technology, conceptId) {
  const curriculum = getCurriculum(technology);
  
  const concept = curriculum.concepts.find(c => c.id === conceptId);
  
  if (!concept) {
    throw new Error(`Concept ${conceptId} not found in ${technology}`);
  }
  
  return concept;
}

// =======================================================
// GET CONCEPT BY ORDER
// =======================================================
function getConceptByOrder(technology, order) {
  const curriculum = getCurriculum(technology);
  
  const concept = curriculum.concepts.find(c => c.order === order);
  
  if (!concept) {
    throw new Error(`Concept at order ${order} not found in ${technology}`);
  }
  
  return concept;
}

// =======================================================
// GET NEXT CONCEPT
// =======================================================
function getNextConcept(technology, currentConceptId) {
  const curriculum = getCurriculum(technology);
  const currentConcept = getConcept(technology, currentConceptId);
  
  const nextOrder = currentConcept.order + 1;
  
  if (nextOrder > curriculum.totalConcepts) {
    return null; // Course complete
  }
  
  return getConceptByOrder(technology, nextOrder);
}

// =======================================================
// GET TEACHING CONTENT FOR LEVEL
// =======================================================
function getTeachingContent(technology, conceptId, studentLevel) {
  const concept = getConcept(technology, conceptId);
  
  const level = studentLevel?.toLowerCase() || 'beginner';
  
  return {
    title: concept.title,
    description: concept.description,
    objectives: concept.objectives,
    topics: concept.topics || [],
    lessonBrief: concept.lessonBrief || null,
    content: concept.teachingContent[level] || concept.teachingContent.beginner,
    crossQuestions: concept.crossQuestions,
  };
}

module.exports = {
  getAvailableTechnologies,
  getCurriculum,
  getConcept,
  getConceptByOrder,
  getNextConcept,
  getTeachingContent
};
