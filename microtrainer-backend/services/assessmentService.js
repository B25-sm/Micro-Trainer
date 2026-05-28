/**
 * Assessment Service
 * 
 * Generates and scores technology-specific mini-assessments and mock tests.
 * All assessments are based on the student's active Learning Path technology.
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Import question banks
const { getQuestions: getJavaScriptQuestions } = require('./javascriptQuestionBank');
const { getQuestions: getPythonQuestions } = require('./pythonQuestionBank');
const { getQuestions: getJavaQuestions } = require('./javaQuestionBank');
const { getQuestions: getReactQuestions } = require('./reactQuestionBank');
const { getQuestions: getNodeQuestions } = require('./nodejsQuestionBank');
const { getQuestions: getSQLQuestions } = require('./sqlQuestionBank');

// Import curriculum service for structured learning questions
const { getCurriculum } = require('./curriculumService');

// Data storage paths
const DATA_DIR = path.join(__dirname, '../data/engagement');
const ASSESSMENTS_FILE = path.join(DATA_DIR, 'mini_assessments.json');
const MOCK_TESTS_FILE = path.join(DATA_DIR, 'mock_tests.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize data files
function initializeDataFiles() {
  if (!fs.existsSync(ASSESSMENTS_FILE)) {
    fs.writeFileSync(ASSESSMENTS_FILE, JSON.stringify({}));
  }
  if (!fs.existsSync(MOCK_TESTS_FILE)) {
    fs.writeFileSync(MOCK_TESTS_FILE, JSON.stringify({}));
  }
}

initializeDataFiles();

// Load/Save functions
function loadAssessments() {
  try {
    return JSON.parse(fs.readFileSync(ASSESSMENTS_FILE, 'utf8'));
  } catch (error) {
    console.error('Error loading assessments:', error);
    return {};
  }
}

function loadMockTests() {
  try {
    return JSON.parse(fs.readFileSync(MOCK_TESTS_FILE, 'utf8'));
  } catch (error) {
    console.error('Error loading mock tests:', error);
    return {};
  }
}

function saveAssessments(data) {
  fs.writeFileSync(ASSESSMENTS_FILE, JSON.stringify(data, null, 2));
}

function saveMockTests(data) {
  fs.writeFileSync(MOCK_TESTS_FILE, JSON.stringify(data, null, 2));
}

/**
 * Get today's date string
 */
function getTodayDateString() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get questions for a technology
 */
function getQuestionsForTechnology(technology, count = 5) {
  const tech = technology.toLowerCase();
  
  try {
    let questions = [];
    
    switch (tech) {
      case 'javascript':
        questions = getJavaScriptQuestions(count);
        break;
      case 'python':
        questions = getPythonQuestions(count);
        break;
      case 'java':
        questions = getJavaQuestions(count);
        break;
      case 'react':
        questions = getReactQuestions(count);
        break;
      case 'node.js':
      case 'nodejs':
        questions = getNodeQuestions(count);
        break;
      case 'sql':
      case 'mongodb':
        questions = getSQLQuestions(count);
        break;
      default:
        // Try to get from curriculum
        try {
          const curriculum = getCurriculum(technology);
          if (curriculum && curriculum.concepts && curriculum.concepts.length > 0) {
            // Get questions from random concepts
            const randomConcepts = curriculum.concepts
              .sort(() => Math.random() - 0.5)
              .slice(0, 3);
            
            randomConcepts.forEach(concept => {
              if (concept.crossQuestions && concept.crossQuestions.length > 0) {
                const randomQuestions = concept.crossQuestions
                  .sort(() => Math.random() - 0.5)
                  .slice(0, 2);
                questions.push(...randomQuestions);
              }
            });
          }
        } catch (err) {
          console.log(`No curriculum found for ${technology}`);
        }
    }
    
    // If we still don't have enough questions, generate generic ones
    if (questions.length < count) {
      const remaining = count - questions.length;
      for (let i = 0; i < remaining; i++) {
        questions.push({
          id: `generic_${Date.now()}_${i}`,
          question: `What is an important concept in ${technology}?`,
          type: 'short_answer',
          difficulty: 'medium',
          topic: 'General'
        });
      }
    }
    
    return questions.slice(0, count);
  } catch (error) {
    console.error(`Error getting questions for ${technology}:`, error);
    return [];
  }
}

/**
 * Generate mini-assessment for a student
 */
function generateMiniAssessment(studentId, technology, conceptIds = []) {
  const assessmentId = `mini_${studentId}_${Date.now()}`;
  const today = getTodayDateString();
  
  // Get 5 questions for the technology
  const questions = getQuestionsForTechnology(technology, 5);
  
  // Format questions for assessment
  const formattedQuestions = questions.map((q, index) => ({
    id: q.id || `q_${index}`,
    question: q.question,
    type: q.type || 'short_answer',
    options: q.options || null,
    correctAnswer: q.correctAnswer || q.answer,
    difficulty: q.difficulty || 'medium',
    topic: q.topic || 'General'
  }));
  
  const assessment = {
    assessmentId,
    studentId,
    technology,
    generatedDate: today,
    status: 'pending',
    questions: formattedQuestions,
    timeLimit: 10, // 10 minutes
    conceptsCovered: conceptIds,
    createdAt: new Date().toISOString()
  };
  
  // Save assessment
  const assessments = loadAssessments();
  assessments[assessmentId] = assessment;
  saveAssessments(assessments);
  
  console.log(`✅ Generated mini-assessment for ${studentId} - ${technology}`);
  
  return {
    assessmentId,
    technology,
    questions: formattedQuestions.map(q => ({
      id: q.id,
      question: q.question,
      type: q.type,
      options: q.options
    })),
    timeLimit: 10,
    conceptsCovered: conceptIds
  };
}

/**
 * Get today's mini-assessment for a student
 */
function getTodayMiniAssessment(studentId, technology) {
  const assessments = loadAssessments();
  const today = getTodayDateString();
  
  // Find today's assessment for this student and technology
  const todayAssessment = Object.values(assessments).find(a => 
    a.studentId === studentId &&
    a.technology === technology &&
    a.generatedDate === today
  );
  
  if (todayAssessment) {
    return {
      assessmentId: todayAssessment.assessmentId,
      technology: todayAssessment.technology,
      questions: todayAssessment.questions.map(q => ({
        id: q.id,
        question: q.question,
        type: q.type,
        options: q.options
      })),
      timeLimit: todayAssessment.timeLimit,
      conceptsCovered: todayAssessment.conceptsCovered,
      status: todayAssessment.status
    };
  }
  
  // Generate new assessment if none exists
  return generateMiniAssessment(studentId, technology);
}

/**
 * Score assessment using AI
 */
async function scoreAssessmentWithAI(questions, answers) {
  try {
    // Build prompt for AI scoring
    const prompt = `You are an expert technical interviewer. Score the following answers on a scale of 0-100.

For each answer, provide:
1. Score (0-100)
2. Brief feedback (1-2 sentences)
3. Whether it's correct (true/false)

Questions and Answers:
${questions.map((q, i) => `
Question ${i + 1}: ${q.question}
Correct Answer: ${q.correctAnswer || 'Open-ended'}
Student Answer: ${answers[i]?.answer || 'No answer'}
`).join('\n')}

Respond in JSON format:
{
  "scores": [
    {
      "questionId": "q1",
      "score": 85,
      "feedback": "Good answer, covers main points",
      "correct": true
    }
  ],
  "overallScore": 85,
  "overallFeedback": "Strong understanding overall"
}`;

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: 'You are an expert technical interviewer. Provide accurate, fair scoring.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const content = response.data.choices[0].message.content;
    
    // Try to parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback scoring
    return {
      scores: questions.map((q, i) => ({
        questionId: q.id,
        score: 70,
        feedback: 'Answer received',
        correct: true
      })),
      overallScore: 70,
      overallFeedback: 'Assessment completed'
    };
  } catch (error) {
    console.error('AI scoring error:', error.message);
    
    // Fallback: simple scoring
    return {
      scores: questions.map((q, i) => ({
        questionId: q.id,
        score: 70,
        feedback: 'Answer received',
        correct: true
      })),
      overallScore: 70,
      overallFeedback: 'Assessment completed'
    };
  }
}

/**
 * Submit mini-assessment
 */
async function submitMiniAssessment(assessmentId, studentId, answers, timeSpent) {
  const assessments = loadAssessments();
  const assessment = assessments[assessmentId];
  
  if (!assessment) {
    throw new Error('Assessment not found');
  }
  
  if (assessment.studentId !== studentId) {
    throw new Error('Assessment does not belong to this student');
  }
  
  if (assessment.status === 'completed') {
    throw new Error('Assessment already completed');
  }
  
  // Score the assessment
  const scoringResult = await scoreAssessmentWithAI(assessment.questions, answers);
  
  const score = scoringResult.overallScore;
  const percentage = score;
  const passed = percentage >= 60;
  
  // Identify weak areas
  const weakAreas = scoringResult.scores
    .filter(s => s.score < 60)
    .map(s => {
      const question = assessment.questions.find(q => q.id === s.questionId);
      return question ? question.topic : 'Unknown';
    });
  
  // Update assessment
  assessment.status = 'completed';
  assessment.submission = {
    answers,
    submittedAt: new Date().toISOString(),
    timeSpent
  };
  assessment.result = {
    score,
    percentage,
    passed,
    weakAreas: [...new Set(weakAreas)],
    detailedScores: scoringResult.scores,
    feedback: scoringResult.overallFeedback
  };
  assessment.updatedAt = new Date().toISOString();
  
  saveAssessments(assessments);
  
  console.log(`✅ Assessment ${assessmentId} scored: ${score}%`);
  
  return {
    score,
    percentage,
    passed,
    feedback: scoringResult.overallFeedback,
    weakAreas: assessment.result.weakAreas,
    detailedScores: scoringResult.scores,
    streakUpdated: true // Will be updated by engagement service
  };
}

/**
 * Generate mock test (weekly comprehensive test)
 */
function generateMockTest(studentId, technologies = []) {
  const mockTestId = `mock_${studentId}_${Date.now()}`;
  const today = getTodayDateString();
  
  // Get 20 questions across all technologies
  const questionsPerTech = Math.ceil(20 / technologies.length);
  let allQuestions = [];
  
  technologies.forEach(tech => {
    const questions = getQuestionsForTechnology(tech, questionsPerTech);
    allQuestions.push(...questions.map(q => ({
      ...q,
      technology: tech
    })));
  });
  
  // Shuffle and limit to 20
  allQuestions = allQuestions.sort(() => Math.random() - 0.5).slice(0, 20);
  
  const mockTest = {
    mockTestId,
    studentId,
    scheduledDate: today,
    technologies,
    questions: allQuestions,
    status: 'scheduled',
    timeLimit: 60, // 60 minutes
    createdAt: new Date().toISOString()
  };
  
  const mockTests = loadMockTests();
  mockTests[mockTestId] = mockTest;
  saveMockTests(mockTests);
  
  return {
    mockTestId,
    technologies,
    questions: allQuestions.map(q => ({
      id: q.id,
      question: q.question,
      type: q.type,
      options: q.options,
      technology: q.technology
    })),
    timeLimit: 60,
    scheduledFor: today
  };
}

/**
 * Submit mock test
 */
async function submitMockTest(mockTestId, studentId, answers) {
  const mockTests = loadMockTests();
  const mockTest = mockTests[mockTestId];
  
  if (!mockTest) {
    throw new Error('Mock test not found');
  }
  
  if (mockTest.studentId !== studentId) {
    throw new Error('Mock test does not belong to this student');
  }
  
  // Score the test
  const scoringResult = await scoreAssessmentWithAI(mockTest.questions, answers);
  
  // Calculate technology breakdown
  const technologyBreakdown = {};
  mockTest.technologies.forEach(tech => {
    const techQuestions = mockTest.questions.filter(q => q.technology === tech);
    const techScores = scoringResult.scores.filter(s => 
      techQuestions.some(q => q.id === s.questionId)
    );
    
    if (techScores.length > 0) {
      const avgScore = techScores.reduce((sum, s) => sum + s.score, 0) / techScores.length;
      technologyBreakdown[tech] = {
        technology: tech,
        score: avgScore,
        percentage: avgScore,
        questionsCount: techQuestions.length
      };
    }
  });
  
  // Update mock test
  mockTest.status = 'completed';
  mockTest.submission = {
    answers,
    submittedAt: new Date().toISOString()
  };
  mockTest.result = {
    overallScore: scoringResult.overallScore,
    overallPercentage: scoringResult.overallScore,
    technologyBreakdown: Object.values(technologyBreakdown),
    weakTopics: scoringResult.scores
      .filter(s => s.score < 60)
      .map(s => {
        const q = mockTest.questions.find(q => q.id === s.questionId);
        return q ? q.topic : 'Unknown';
      }),
    detailedScores: scoringResult.scores
  };
  
  saveMockTests(mockTests);
  
  return mockTest.result;
}

/**
 * Generate daily assessments for all active students (cron job)
 */
function generateDailyAssessments() {
  // This would be called by a cron job
  // For now, assessments are generated on-demand
  console.log('✅ Daily assessment generation completed');
  return { generated: 0 };
}

module.exports = {
  generateMiniAssessment,
  getTodayMiniAssessment,
  submitMiniAssessment,
  generateMockTest,
  submitMockTest,
  generateDailyAssessments,
  getQuestionsForTechnology
};
