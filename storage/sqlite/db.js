import Database from "better-sqlite3";
import { paths } from "../../config/paths.js";

export function openDb() {
  const db = new Database(paths.db);
  db.pragma("journal_mode = WAL");
  return db;
}