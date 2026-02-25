import path from "path";
import { env } from "./env.js";

export const paths = {
  db: path.join(env.DATA_DIR, "agent.sqlite"),
  chatLog: path.join(env.LOG_DIR, "chats.ndjson")
};