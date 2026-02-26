// src/ingestion/indexer.js
import fs from "fs";
import path from "path";
import crypto from "crypto";

import { scanFiles } from "./scanner.js";
import { loadFileToText } from "./loader.js";
import { chunkText } from "./chunker.js";

function floatsToBuffer(arr) {
  const f32 = new Float32Array(arr);
  return Buffer.from(f32.buffer);
}

function sha256File(filePath) {
  const hash = crypto.createHash("sha256");
  const fd = fs.openSync(filePath, "r");
  try {
    const bufSize = 1024 * 1024;
    const buf = Buffer.allocUnsafe(bufSize);
    let bytesRead = 0;
    while ((bytesRead = fs.readSync(fd, buf, 0, bufSize, null)) > 0) {
      hash.update(buf.subarray(0, bytesRead));
    }
  } finally {
    fs.closeSync(fd);
  }
  return hash.digest("hex");
}

export async function indexFolder({ rootPath, repos, embedClient }) {
  const files = await scanFiles(rootPath);
  console.log(`Found ${files.length} candidate files under: ${rootPath}`);

  let indexed = 0;
  let skipped = 0;

  for (const absPath of files) {
    try {
      const st = fs.statSync(absPath);
      if (!st.isFile()) {
        skipped++;
        continue;
      }

      const textRaw = await loadFileToText(absPath);
      const text = String(textRaw || "").replace(/\u0000/g, "").trim();

      // Still record-ish: if empty/too small, skip embedding
      if (text.length < 30) {
        skipped++;
        continue;
      }

      const chunks = chunkText(text);
      if (!chunks.length) {
        skipped++;
        continue;
      }

      // Clear prior chunks for this file
      repos.chunks.deleteBySource(absPath);

      for (let i = 0; i < chunks.length; i++) {
        const emb = await embedClient.embed(chunks[i]);
        repos.chunks.insert({
          source: absPath,
          chunk_index: i,
          content: chunks[i],
          embedding: floatsToBuffer(emb),
        });
      }

      // (Optional) you can store file_index info here later
      // const hash = sha256File(absPath);

      indexed++;
      if (indexed % 10 === 0) console.log(`Indexed ${indexed} files...`);
    } catch (e) {
      console.warn(`Skip (error): ${absPath}\n  ${e.message}`);
      skipped++;
    }
  }

  console.log(`Index complete. Indexed: ${indexed}, Skipped: ${skipped}`);
}
