// src/agent/ragAgent.js
import { retrieveContext } from "../retrieval/retriever.js";
import { buildSystemPrompt } from "../llm/systemPrompt.js";

function floatsToBuffer(arr) {
  const f32 = new Float32Array(arr);
  return Buffer.from(f32.buffer);
}

function nowIso() {
  return new Date().toISOString();
}

export function makeAgent({ repos, embedClient, chatClient }) {
  return {
    async answer(query) {
      const { fileContext, memoryContext } = await retrieveContext({
        repos,
        embedClient,
        query,
      });

      const system = buildSystemPrompt({ fileContext, memoryContext });

      const response = await chatClient.chat([
        { role: "system", content: system },
        { role: "user", content: query },
      ]);

      // Store BOTH sides into chat_memory with embeddings
      const ts = nowIso();

      const userEmb = await embedClient.embed(query);
      repos.memory.insert({
        ts,
        role: "user",
        content: query,
        embedding: floatsToBuffer(userEmb),
      });

      const asstEmb = await embedClient.embed(response);
      repos.memory.insert({
        ts,
        role: "assistant",
        content: response,
        embedding: floatsToBuffer(asstEmb),
      });

      return response;
    },
  };
}