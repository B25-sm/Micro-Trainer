/** Section 9 — Document AI, OCR & PDF (Q420–443) */
module.exports = {
  sectionId: 9,
  sectionName: "Document AI, OCR & PDF",
  defaultTier: 1,
  blocks: [
    {
      topic: "PDF Processing",
      tier: 1,
      questions: [
        "Text PDFs vs Scanned PDFs — fundamental difference",
        "Can Scanned PDFs Be Read by PyPDF? (No — needs OCR)",
        "PyPDF — text extraction from native PDFs",
        "PDFPlumber — table-aware extraction, bounding boxes",
        "PyMuPDF (fitz) — fast extraction, image rendering",
        "Combining Text Extraction + OCR in One Pipeline",
        "RAG with PDFs — chunking strategies for documents",
      ],
    },
    {
      topic: "OCR",
      tier: 1,
      questions: [
        "What is OCR — character recognition pipeline",
        "Tesseract — open-source OCR, language packs",
        "EasyOCR — deep learning-based, multi-language",
        "Tesseract vs EasyOCR — accuracy, speed, use cases",
        "Azure Document Intelligence — cloud OCR with structure",
        "AWS Textract — table/form extraction",
        "Google Document AI",
        "Preprocessing for Better OCR — deskewing, binarization, denoising",
        "Common Causes of OCR Failures",
      ],
    },
    {
      topic: "Document Extraction & Pipelines",
      tier: 1,
      questions: [
        "Invoice Data Extraction — field detection, structured output",
        "Contract Extraction — clause identification, NER",
        "Resume Parsing — section detection, entity extraction",
        "Extracting Structured JSON with LLM — prompt design",
        "Building a Document Processing Pipeline — OCR → chunk → embed → index",
        "Design a Production Document Processing Pipeline",
        "ChromaDB vs FAISS — local vector stores comparison",
        "Building a Local AI Stack with Ollama",
      ],
    },
  ],
};
