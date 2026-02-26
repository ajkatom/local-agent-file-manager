import { env } from "../config/env.js";

export function makeEmbedClient() {
  return {
    async embed(text) {
      const r = await fetch(`${env.OLLAMA_BASE_URL}/api/embeddings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: env.EMBED_MODEL, prompt: text })
      });
      const j = await r.json();
      return j.embedding;
    }
  };
}
