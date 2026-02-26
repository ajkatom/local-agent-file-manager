export function migrate(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS file_index (
      source TEXT PRIMARY KEY,
      size INTEGER,
      mtime_ms INTEGER
    );

    CREATE TABLE IF NOT EXISTS chunks (
      id INTEGER PRIMARY KEY,
      source TEXT,
      chunk_index INTEGER,
      content TEXT,
      embedding BLOB
    );

    CREATE TABLE IF NOT EXISTS chat_memory (
      id INTEGER PRIMARY KEY,
      ts TEXT,
      role TEXT,
      content TEXT,
      embedding BLOB
    );
  `);
}
