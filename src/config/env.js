import dotenv from "dotenv";
dotenv.config();

export const env = {
  OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
  CHAT_MODEL: process.env.CHAT_MODEL || "llama3.1",
  EMBED_MODEL: process.env.EMBED_MODEL || "nomic-embed-text",

  DATA_DIR: process.env.DATA_DIR || "./data",
  LOG_DIR: process.env.LOG_DIR || "./data/logs",

  CHUNK_SIZE: Number(process.env.CHUNK_SIZE || 2000),
  CHUNK_OVERLAP: Number(process.env.CHUNK_OVERLAP || 250),

  TOPK_FILES: Number(process.env.TOPK_FILES || 6),
  TOPK_MEMORY: Number(process.env.TOPK_MEMORY || 6),
  MIN_SCORE: Number(process.env.MIN_SCORE || 0.25),

  OCR_LANG: process.env.OCR_LANG || "eng",
  OCR_MAX_CHARS: Number(process.env.OCR_MAX_CHARS || 20000),

  LIBREOFFICE_PATH: (process.env.LIBREOFFICE_PATH || "").trim()
};
