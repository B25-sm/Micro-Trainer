// =======================================================
// MongoDB interview questions — specific, answerable prompts
// =======================================================

const MONGODB_QUESTION_BANK = {
  easy: [
    "Write a MongoDB find query for users with status active",
    "MongoDB document vs SQL row — give one example of each",
    "Mongoose User schema — define name and email as required fields",
    "insertOne vs insertMany in MongoDB — when do you use each?",
    "What is a collection in MongoDB? Give a real app example",
    "find() vs findOne() in Mongoose — what does each return?",
    "Write a MongoDB update using $set to change a user's city",
    "BSON types — name two types JSON does not have natively",
    "MongoDB Atlas — why use managed hosting vs self-hosted?",
    "How do you connect a Node app to MongoDB with Mongoose?",
  ],
  medium: [
    "Embedding vs referencing — when would you embed orders inside a user doc?",
    "Write an aggregation: count orders per customer with $group",
    "Mongoose validators — add minlength on a password field",
    "Compound index on { email: 1, createdAt: -1 } — why both fields?",
    "findOneAndUpdate vs updateOne — what is the key difference?",
    "Write a query using $in to match status in pending or shipped",
    "$lookup — join users to orders in an aggregation pipeline",
    "Pagination in MongoDB — show skip, limit, and sort together",
    "Mongoose populate — fetch a post with its author document",
    "MongoDB vs SQL — when would you NOT choose MongoDB?",
  ],
  hard: [
    "Aggregation pipeline — $match, $group, $sort for monthly revenue",
    "Transactions in MongoDB — when are multi-document transactions needed?",
    "Shard key selection — what makes a bad shard key?",
    "Index strategy — when does a multikey index hurt write performance?",
    "Schema migration — how do you add a required field to millions of docs?",
    "Change streams — give a real-time use case in production",
    "Write concern and read preference — explain a replica-set trade-off",
    "Bucket pattern — when would you use it for time-series data?",
    "Text index search — query products by keyword with scoring",
    "Anti-pattern: unbounded array growth — how do you fix it?",
  ],
};

function getRandomMongoQuestion(difficulty = "easy") {
  const pool = MONGODB_QUESTION_BANK[difficulty] || MONGODB_QUESTION_BANK.easy;
  return pool[Math.floor(Math.random() * pool.length)];
}

module.exports = { MONGODB_QUESTION_BANK, getRandomMongoQuestion };
