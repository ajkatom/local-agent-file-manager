import { createContainer } from "./app/container.js";
import { indexFolder } from "./ingestion/indexer.js";
import readline from "readline";
import { appendChatLog } from "./storage/logs/chatLog.js";

function getArg(flag) {
  const i = process.argv.indexOf(flag);
  return i === -1 ? null : (process.argv[i + 1] || null);
}

function nowIso() {
  return new Date().toISOString();
}

async function runChat(container) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "> "
  });

  function nowIso() {
    return new Date().toISOString();
  }

  console.log("Local chat ready (type 'exit' to quit).");
  rl.prompt();

  rl.on("line", async (line) => {
    const q = line.trim();
    if (!q) return rl.prompt();
    if (q.toLowerCase() === "exit") return rl.close();

    // ✅ Log user message
    appendChatLog({
      ts: nowIso(),
      role: "user",
      content: q
    });

    const a = await container.agent.answer(q);

    console.log("\n" + a + "\n");

    // ✅ Log assistant response
    appendChatLog({
      ts: nowIso(),
      role: "assistant",
      content: a
    });

    rl.prompt();
  });

  rl.on("close", () => {
    container.db.close();
    process.exit(0);
  });
}


async function main() {
  const cmd = process.argv[2];
  const container = createContainer();

  try {
    if (cmd === "init") {
      console.log("DB initialized (migrations applied).");
      return;
    }

    if (cmd === "index") {
      const rootPath = getArg("--path") || process.cwd();
      await indexFolder({ rootPath, repos: container.repos, embedClient: container.embedClient });
      console.log("Index complete.");
      return;
    }

    if (cmd === "chat") {
      await runChat(container);
      return; // runChat will close db on exit
    }

    console.log(`
Usage:
  npm run init
  npm run index -- --path "/path/to/folder"
  npm run chat
`.trim());
  } finally {
    // For non-chat paths, close DB here
    if (cmd !== "chat") container.db.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
