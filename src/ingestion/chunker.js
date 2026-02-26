import { env } from "../config/env.js";

export function chunkText(text) {
  const size = Math.max(1, Number(env.CHUNK_SIZE) || 1);
  const overlap = Math.max(0, Number(env.CHUNK_OVERLAP) || 0);
  const step = Math.max(1, size - overlap);
  const chunks = [];
  let i = 0;

  while (i < text.length) {
    chunks.push(text.slice(i, i + size));
    i += step;
  }
  return chunks;
}
