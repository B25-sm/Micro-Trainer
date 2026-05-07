// =======================================================
// 🔹 NODE.JS QUESTION BANK
// Comprehensive question bank covering 6 days of Node.js concepts
// =======================================================

const NODEJS_QUESTION_BANK = {
  
  // =======================================================
  // DAY 1: Node.js Core Concepts
  // =======================================================
  day1: {
    topic: "Node.js Fundamentals & Core Concepts",
    concepts: [
      "Node.js runtime & V8 engine",
      "Event Loop & Non-blocking Architecture",
      "REPL",
      "Global Objects (__dirname, __filename, process, global)",
      "Node.js Modules (CommonJS & ES Modules)",
      "npm & package.json"
    ],
    questions: {
      easy: [
        "What is Node.js?",
        "What is the V8 engine?",
        "What is the Event Loop?",
        "What is REPL?",
        "What is __dirname?",
        "What is __filename?",
        "What is the process object?",
        "What is npm?",
        "What is package.json?",
        "What is a Node.js module?"
      ],
      medium: [
        "What is the difference between CommonJS and ES Modules?",
        "How does the Event Loop work in Node.js?",
        "What is non-blocking I/O?",
        "What is the difference between require and import?",
        "How do you create a custom module in Node.js?",
        "What is the difference between global and window?",
        "How do you access environment variables in Node.js?",
        "What is the difference between dependencies and devDependencies?",
        "How does Node.js handle single-threaded operations?",
        "What is the purpose of module.exports?"
      ],
      hard: [
        "Explain the phases of the Node.js Event Loop.",
        "What is the difference between setImmediate and process.nextTick?",
        "How does Node.js achieve concurrency with a single thread?",
        "What are the performance implications of blocking the Event Loop?",
        "How do you implement ES Modules in Node.js?",
        "What is the module wrapper function in Node.js?",
        "How does Node.js resolve module paths?",
        "What is the difference between named exports and default exports?",
        "How do you handle circular dependencies in Node.js?",
        "What are the best practices for structuring Node.js applications?"
      ]
    }
  },

  // =======================================================
  // DAY 2: File System, Async Programming & Timers
  // =======================================================
  day2: {
    topic: "File System, Async Operations & Timers",
    concepts: [
      "fs, path, os modules",
      "Timers (setTimeout, setInterval)",
      "Async Programming (Callbacks, Promises, async/await)",
      "Error handling",
      "File operations"
    ],
    questions: {
      easy: [
        "What is the fs module?",
        "What is the path module?",
        "What is the os module?",
        "What is setTimeout?",
        "What is setInterval?",
        "What is a callback function?",
        "What is a Promise?",
        "What is async/await?",
        "How do you read a file in Node.js?",
        "How do you write to a file?"
      ],
      medium: [
        "What is the difference between fs and fs.promises?",
        "How do you handle errors in async/await?",
        "What is the difference between setTimeout and setImmediate?",
        "How do you read a file using callbacks vs Promises?",
        "What is callback hell? How do you avoid it?",
        "How do you get system information using the os module?",
        "What is the difference between path.join and path.resolve?",
        "How do you handle file streams in Node.js?",
        "What is the difference between readFile and createReadStream?",
        "How do you implement error-first callbacks?"
      ],
      hard: [
        "Explain the difference between microtasks and macrotasks in Node.js.",
        "How do you implement a custom Promise?",
        "What are the performance implications of using sync vs async file operations?",
        "How do you handle large file processing efficiently?",
        "What is the difference between Promise.all and Promise.allSettled?",
        "How do you implement retry logic for failed async operations?",
        "What are the best practices for error handling in Node.js?",
        "How do you implement a file watcher using fs.watch?",
        "What is the difference between clearTimeout and clearInterval?",
        "How do you handle concurrent file operations?"
      ]
    }
  },

  // =======================================================
  // DAY 3: HTTP Server & Express Foundations
  // =======================================================
  day3: {
    topic: "HTTP Server & Express Framework",
    concepts: [
      "http module",
      "Express setup & middleware",
      "Request & response objects",
      "Router separation",
      "Environment variables (dotenv)",
      "CORS & security (helmet, cors)"
    ],
    questions: {
      easy: [
        "What is the http module?",
        "What is Express?",
        "What is middleware?",
        "What is a route in Express?",
        "What is the request object?",
        "What is the response object?",
        "What is CORS?",
        "What is dotenv?",
        "What is helmet?",
        "How do you create a basic HTTP server?"
      ],
      medium: [
        "What is the difference between app.use and app.get?",
        "How do you handle POST requests in Express?",
        "What is the difference between req.params and req.query?",
        "How do you implement custom middleware?",
        "What is the purpose of express.json()?",
        "How do you separate routes in Express?",
        "What is the difference between res.send and res.json?",
        "How do you handle 404 errors in Express?",
        "What is the order of middleware execution?",
        "How do you enable CORS in Express?"
      ],
      hard: [
        "Explain the Express middleware chain and error handling.",
        "How do you implement authentication middleware?",
        "What are the security best practices for Express apps?",
        "How do you handle file uploads in Express?",
        "What is the difference between app-level and router-level middleware?",
        "How do you implement rate limiting in Express?",
        "What is the purpose of helmet and what headers does it set?",
        "How do you implement request validation middleware?",
        "What are the performance implications of middleware order?",
        "How do you implement API versioning in Express?"
      ]
    }
  },

  // =======================================================
  // DAY 4: MongoDB & Mongoose Integration
  // =======================================================
  day4: {
    topic: "Database Integration with MongoDB & Mongoose",
    concepts: [
      "MongoDB setup",
      "Mongoose connection",
      "Schemas and Models",
      "CRUD operations",
      "Mongoose methods",
      "Relationships between collections"
    ],
    questions: {
      easy: [
        "What is MongoDB?",
        "What is Mongoose?",
        "What is a Schema in Mongoose?",
        "What is a Model in Mongoose?",
        "What is CRUD?",
        "How do you connect to MongoDB?",
        "What is MongoDB Atlas?",
        "What is a collection in MongoDB?",
        "What is a document in MongoDB?",
        "How do you create a new document?"
      ],
      medium: [
        "What is the difference between MongoDB and SQL databases?",
        "How do you define a Mongoose schema?",
        "What are Mongoose validators?",
        "How do you implement CRUD operations with Mongoose?",
        "What is the difference between .find() and .findOne()?",
        "How do you update a document in MongoDB?",
        "What is the difference between .save() and .create()?",
        "How do you delete a document in MongoDB?",
        "What are Mongoose middleware (hooks)?",
        "How do you implement relationships in Mongoose?"
      ],
      hard: [
        "Explain Mongoose schema types and their validation options.",
        "How do you implement complex queries with Mongoose?",
        "What is the difference between populate and manual joins?",
        "How do you implement pagination in MongoDB?",
        "What are the performance implications of indexing?",
        "How do you implement transactions in MongoDB?",
        "What is the aggregation pipeline in MongoDB?",
        "How do you handle schema migrations in Mongoose?",
        "What are the best practices for MongoDB schema design?",
        "How do you implement full-text search in MongoDB?"
      ]
    }
  },

  // =======================================================
  // DAY 5: Authentication & Security
  // =======================================================
  day5: {
    topic: "Authentication, Authorization & Security",
    concepts: [
      "JWT Authentication",
      "OAuth Basics",
      "Password hashing (bcrypt)",
      "HTTPS setup",
      "Security best practices",
      "Token management"
    ],
    questions: {
      easy: [
        "What is JWT?",
        "What is OAuth?",
        "What is bcrypt?",
        "What is HTTPS?",
        "What is authentication?",
        "What is authorization?",
        "What is a token?",
        "What is password hashing?",
        "What is a salt in bcrypt?",
        "What is a refresh token?"
      ],
      medium: [
        "What is the difference between authentication and authorization?",
        "How do you implement JWT authentication?",
        "What is the structure of a JWT token?",
        "How do you hash passwords using bcrypt?",
        "What is the difference between HTTP and HTTPS?",
        "How do you protect routes with JWT?",
        "What is the difference between access token and refresh token?",
        "How do you implement OAuth with Google?",
        "What is passport.js?",
        "How do you store JWT tokens securely?"
      ],
      hard: [
        "Explain the JWT authentication flow with refresh tokens.",
        "What are the security vulnerabilities of JWT?",
        "How do you implement role-based access control (RBAC)?",
        "What is the difference between OAuth 1.0 and OAuth 2.0?",
        "How do you implement token blacklisting?",
        "What are the best practices for storing sensitive data?",
        "How do you implement two-factor authentication?",
        "What is the difference between session-based and token-based auth?",
        "How do you handle token expiration and renewal?",
        "What are the OWASP Top 10 security risks for Node.js?"
      ]
    }
  },

  // =======================================================
  // DAY 6: Streams, Workers & Real-time Communication
  // =======================================================
  day6: {
    topic: "Advanced Node.js - Streams, Workers & WebSockets",
    concepts: [
      "Streams (Readable, Writable, Transform)",
      "Child Processes",
      "Worker Threads",
      "Cluster Module",
      "WebSockets (Socket.io)",
      "Rate Limiting & Throttling"
    ],
    questions: {
      easy: [
        "What are Streams in Node.js?",
        "What is a Readable stream?",
        "What is a Writable stream?",
        "What is a Transform stream?",
        "What are Child Processes?",
        "What are Worker Threads?",
        "What is the Cluster module?",
        "What is Socket.io?",
        "What is WebSocket?",
        "What is rate limiting?"
      ],
      medium: [
        "What is the difference between Streams and Buffers?",
        "How do you pipe streams in Node.js?",
        "What is the difference between fork and spawn?",
        "How do you communicate between parent and child processes?",
        "What is the difference between Worker Threads and Child Processes?",
        "How do you implement a WebSocket server?",
        "What is the difference between WebSocket and HTTP?",
        "How do you implement rate limiting in Express?",
        "What is the Cluster module used for?",
        "How do you handle backpressure in streams?"
      ],
      hard: [
        "Explain the four types of streams and their use cases.",
        "How do you implement a custom Transform stream?",
        "What are the performance implications of using Worker Threads?",
        "How do you implement load balancing with the Cluster module?",
        "What is the difference between Socket.io and native WebSockets?",
        "How do you implement real-time chat with Socket.io rooms?",
        "What are the best practices for handling large file uploads?",
        "How do you implement throttling vs debouncing in Node.js?",
        "What is the difference between process.fork and cluster.fork?",
        "How do you handle memory leaks in Node.js applications?"
      ]
    }
  }
};

// =======================================================
// 🔹 GET RANDOM QUESTION BY DIFFICULTY
// =======================================================
function getRandomNodeQuestion(difficulty = "easy", day = null) {
  const days = day ? [NODEJS_QUESTION_BANK[`day${day}`]] : Object.values(NODEJS_QUESTION_BANK);
  
  const allQuestions = days.flatMap(d => d.questions[difficulty] || []);
  
  if (allQuestions.length === 0) {
    return "What is Node.js? Where is it used?";
  }
  
  const randomIndex = Math.floor(Math.random() * allQuestions.length);
  return allQuestions[randomIndex];
}

// =======================================================
// 🔹 GET QUESTIONS BY TOPIC
// =======================================================
function getQuestionsByTopic(topic, difficulty = "easy") {
  for (const day of Object.values(NODEJS_QUESTION_BANK)) {
    if (day.topic.toLowerCase().includes(topic.toLowerCase())) {
      return day.questions[difficulty] || [];
    }
  }
  return [];
}

// =======================================================
// 🔹 GET ALL CONCEPTS
// =======================================================
function getAllNodeConcepts() {
  return Object.values(NODEJS_QUESTION_BANK).flatMap(day => day.concepts);
}

module.exports = {
  NODEJS_QUESTION_BANK,
  getRandomNodeQuestion,
  getQuestionsByTopic,
  getAllNodeConcepts
};
