export function makeRepos(db) {
  const insertChunk = db.prepare(`
    INSERT INTO chunks (source, chunk_index, content, embedding)
    VALUES (?, ?, ?, ?)
  `);

  const deleteChunks = db.prepare(`DELETE FROM chunks WHERE source = ?`);

  const insertMemory = db.prepare(`
    INSERT INTO chat_memory (ts, role, content, embedding)
    VALUES (?, ?, ?, ?)
  `);

  return {
    chunks: {
      deleteBySource: (s) => deleteChunks.run(s),
      insert: (row) => insertChunk.run(row.source, row.chunk_index, row.content, row.embedding),
      getAll: () => db.prepare(`SELECT * FROM chunks`).all()
    },
    memory: {
      insert: (row) => insertMemory.run(row.ts, row.role, row.content, row.embedding),
      getAll: () => db.prepare(`SELECT * FROM chat_memory`).all()
    }
  };
}
