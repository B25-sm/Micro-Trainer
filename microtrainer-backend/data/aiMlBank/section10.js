/** Section 10 — MLOps & Production ML (Q444–466) */
module.exports = {
  sectionId: 10,
  sectionName: "MLOps & Production ML",
  defaultTier: 1,
  blocks: [
    {
      topic: "MLOps Lifecycle",
      tier: 1,
      questions: [
        "What is MLOps — DevOps + ML lifecycle",
        "CI/CD for ML — data validation, model training, deployment gates",
        "Model Registry — versioning, lineage, promotion stages",
        "MLflow — experiment tracking, model registry, serving",
        "Kubeflow — Kubernetes-native ML pipelines",
        "Airflow — workflow orchestration, DAGs",
        "Feature Store — offline vs online store, consistency",
        "Feature Pipelines — real-time vs batch feature computation",
        "End-to-End ML Platform Design",
      ],
    },
    {
      topic: "Drift & Monitoring",
      tier: 1,
      questions: [
        "Model Drift — performance degradation over time",
        "Data Drift — input distribution shift",
        "Concept Drift — label relationship change",
        "How to Monitor ML Models — metrics, dashboards, alerts",
        "Model Versioning — tracking artifacts and metadata",
        "Retraining Triggers — scheduled vs drift-based",
      ],
    },
    {
      topic: "Deployment Strategies",
      tier: 1,
      questions: [
        "Blue-Green Deployment — zero-downtime switching",
        "Canary Deployment — gradual traffic ramp-up",
        "Shadow Deployment — offline evaluation on live traffic",
        "A/B Testing Models — online model comparison",
        "Online vs Batch Inference — latency vs throughput tradeoff",
        "Scaling RAG Systems — indexing, retrieval, generation layers",
        "Scaling Agent Systems — task queues, parallelism",
        "Production Failure Scenarios — debugging model degradation",
      ],
    },
  ],
};
