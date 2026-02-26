import { env } from "../config/env.js";

export function chunkText(text) {
  const size = env.CHUNK_SIZE;
  const overlap = env.CHUNK_OVERLAP;
  const chunks = [];
  let i = 0;

  while (i < text.length) {
    chunks.push(text.slice(i, i + size));
    i += size - overlap;
  }
  return chunks;
}
