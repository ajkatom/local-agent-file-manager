import test from 'node:test';
import assert from 'node:assert/strict';

import { env } from '../src/config/env.js';
import { chunkText } from '../src/ingestion/chunker.js';

function withChunkEnv(chunkSize, overlap, fn) {
  const prevSize = env.CHUNK_SIZE;
  const prevOverlap = env.CHUNK_OVERLAP;
  env.CHUNK_SIZE = chunkSize;
  env.CHUNK_OVERLAP = overlap;
  try {
    fn();
  } finally {
    env.CHUNK_SIZE = prevSize;
    env.CHUNK_OVERLAP = prevOverlap;
  }
}

test('chunkText chunks with configured overlap under normal settings', () => {
  withChunkEnv(4, 1, () => {
    const chunks = chunkText('abcdefghij');
    assert.deepEqual(chunks, ['abcd', 'defg', 'ghij', 'j']);
  });
});

test('chunkText still makes progress when overlap >= size', () => {
  withChunkEnv(3, 3, () => {
    const chunks = chunkText('abcde');
    assert.deepEqual(chunks, ['abc', 'bcd', 'cde', 'de', 'e']);
  });
});

test('chunkText handles invalid numeric env values safely', () => {
  withChunkEnv('not-a-number', -50, () => {
    const chunks = chunkText('abc');
    assert.deepEqual(chunks, ['a', 'b', 'c']);
  });
});

