import fs from "fs";
import path from "path";
import { paths } from "../../config/paths.js";

export function appendChatLog(entry) {
  // ensure directory exists
  fs.mkdirSync(path.dirname(paths.chatLog), { recursive: true });

  // append NDJSON line (creates file if missing)
  fs.appendFileSync(paths.chatLog, JSON.stringify(entry) + "\n", "utf8");
}
