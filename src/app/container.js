// src/app/container.js
import { ensureDirs } from "./bootstrap.js";
import { openDb } from "../storage/sqlite/db.js";
import { migrate } from "../storage/sqlite/migrations.js";
import { makeRepos } from "../storage/sqlite/repos.js";
import { makeEmbedClient } from "../llm/embedClient.js";
import { makeChatClient } from "../llm/chatClient.js";
import { makeAgent } from "../agent/ragAgent.js";

export function createContainer() {
  ensureDirs();

  const db = openDb();
  migrate(db);

  const repos = makeRepos(db);
  const embedClient = makeEmbedClient();
  const chatClient = makeChatClient();
  const agent = makeAgent({ repos, embedClient, chatClient });

  return { db, repos, embedClient, chatClient, agent };
}