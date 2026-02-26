// src/retrieval/retriever.js
import { cosine } from "./cosine.js";
import { env } from "../config/env.js";

function bufferToFloat32Array(buf) {
  return new Float32Array(buf.buffer, buf.byteOffset, buf.byteLength / 4);
}

function pickTop(scored, topK, minScore) {
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK).filter((x) => x.score >= minScore);
}

export async function retrieveContext({ repos, embedClient, query }) {
  const qVec = await embedClient.embed(query);

  // --- File chunks ---
  const chunkRows = repos.chunks.getAll();
  const chunkScored = chunkRows.map((r) => ({
    r,
    score: cosine(qVec, bufferToFloat32Array(r.embedding)),
  }));

  const topChunks = pickTop(chunkScored, env.TOPK_FILES, env.MIN_SCORE);

  const fileContext = topChunks
    .map((s) => `SOURCE: ${s.r.source}\n${s.r.content}`)
    .join("\n\n---\n\n");

  // --- Chat memory ---
  const memRows = repos.memory.getAll();
  const memScored = memRows.map((r) => ({
    r,
    score: cosine(qVec, bufferToFloat32Array(r.embedding)),
  }));

  const topMem = pickTop(memScored, env.TOPK_MEMORY, env.MIN_SCORE);

  const memoryContext = topMem
    .map((s) => `[${s.r.ts}] ${s.r.role.toUpperCase()}: ${s.r.content}`)
    .join("\n");

  return { fileContext, memoryContext };
}