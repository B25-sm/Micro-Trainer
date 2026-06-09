/** Section 11 — System Design (MNC-Level) (Q467–501) */
module.exports = {
  sectionId: 11,
  sectionName: "System Design (MNC-Level)",
  defaultTier: 2,
  blocks: [
    {
      topic: "Recommendation Systems",
      tier: 2,
      questions: [
        "Design Amazon Recommendation System — collaborative filtering + DL",
        "Design YouTube Recommendation System — two-tower, engagement signals",
        "Design Netflix Recommendation Engine — matrix factorization, contextual",
        "Design LinkedIn Job Recommendation — candidate-job matching",
        "Design Personalized Feed Ranking — multi-objective, diversity",
        "Design Ad Click Prediction System — logistic regression → DNN",
        "How Would You Rank Products in E-Commerce",
        "Collaborative Filtering — user-based, item-based, matrix factorization",
        "Content-Based Filtering vs Collaborative Filtering",
        "Two-Tower Architecture for Retrieval",
        "Cold Start Problem — new user, new item strategies",
      ],
    },
    {
      topic: "Search & Retrieval",
      tier: 2,
      questions: [
        "Design Google Search Ranking System — multi-stage ranking",
        "Semantic Search — embedding-based vs keyword-based",
        "Hybrid Search — BM25 + dense retrieval",
        "Learning to Rank — pointwise, pairwise, listwise",
        "Embedding Search vs Keyword Search — tradeoffs",
      ],
    },
    {
      topic: "Fraud & Safety",
      tier: 2,
      questions: [
        "Design Real-Time Fraud Detection — feature engineering, streaming",
        "Design Spam Detection System — text classification, behavioral signals",
        "How to Predict Customer Churn",
        "How to Improve CTR by 10% — feature ideas, model improvements",
        "Anomaly Detection — isolation forest, autoencoders, statistical",
      ],
    },
    {
      topic: "ML Infrastructure Design",
      tier: 2,
      questions: [
        "Design Large-Scale Feature Store",
        "Design Auto Labeling System — active learning, pseudo-labeling",
        "Design Predictive Typing System — n-gram + neural, latency constraints",
        "Design End-to-End ML Platform",
        "Design ML Pipeline for 1M Users",
        "Tradeoffs Between Cost, Latency, and Quality",
      ],
    },
    {
      topic: "LLM & Agent System Design",
      tier: 2,
      questions: [
        "Design LLM-Based Customer Support Agent — RAG + tools + escalation",
        "Design AI Copilot for Developers — code completion, context awareness",
        "Design a Chatbot from Scratch",
        "Design a Resume Screening System",
        "Design a Document Classification Pipeline",
        "How to Evaluate an LLM Chatbot — automated + human eval",
        "Build RAG for Company Documents — full architecture",
        "Design a Local AI Stack Using Ollama",
      ],
    },
  ],
};
