import { env } from "../config/env.js";

export function makeChatClient() {
  return {
    async chat(messages) {
      const r = await fetch(`${env.OLLAMA_BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: env.CHAT_MODEL, messages, stream: false })
      });
      const j = await r.json();
      return j.message.content;
    }
  };
}
