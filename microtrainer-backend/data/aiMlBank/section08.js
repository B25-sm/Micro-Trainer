/** Section 8 — AI Engineering & Infrastructure (Q396–419) */
module.exports = {
  sectionId: 8,
  sectionName: "AI Engineering & Infrastructure",
  defaultTier: 1,
  blocks: [
    {
      topic: "API & Serving",
      tier: 1,
      questions: [
        "FastAPI Architecture for AI — async endpoints, dependency injection",
        "Async Programming in FastAPI — async def, await, event loop",
        "Server-Sent Events (SSE) — streaming token output",
        "WebSockets vs SSE — bidirectional vs unidirectional streaming",
        "Streaming Response in FastAPI — StreamingResponse",
        "Building a Production AI API — auth, rate limiting, logging",
        "Pydantic Models — validation, JSON mode",
        "Structured Outputs — JSON mode, tool-use extraction",
      ],
    },
    {
      topic: "LLM Serving Frameworks",
      tier: 1,
      questions: [
        "Ollama — local LLM serving, model management",
        "vLLM — PagedAttention, high-throughput serving",
        "TGI (Text Generation Inference) — HuggingFace serving",
        "LM Studio — GUI-based local inference",
        "Ollama vs vLLM — use cases comparison",
        "GPU Optimization — batching, quantization, tensor parallelism",
        "Quantized Deployment — GGUF, GPTQ, AWQ on consumer GPUs",
        "Latency Optimization — KV cache, speculative decoding, batching",
        "Cost Optimization — choosing model size, caching, batching",
        "Scaling LLM Systems — horizontal scaling, load balancing",
      ],
    },
    {
      topic: "Infrastructure",
      tier: 1,
      questions: [
        "Docker — containerization for AI services",
        "Kubernetes — orchestration, scaling pods",
        "Nginx — reverse proxy, load balancing",
        "Redis — caching embeddings, session state",
        "Celery + RabbitMQ — async task queues for ML jobs",
        "Deploying an LLM Application — cloud vs on-prem",
      ],
    },
  ],
};
