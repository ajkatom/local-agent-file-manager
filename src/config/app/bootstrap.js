import fs from "fs";
import { env } from "../config/env.js";

export function ensureDirs() {
  fs.mkdirSync(env.DATA_DIR, { recursive: true });
  fs.mkdirSync(env.LOG_DIR, { recursive: true });
}