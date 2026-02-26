export function buildSystemPrompt({ fileContext = "", memoryContext = "" }) {
  let base = `You are a local AI assistant running entirely on the user's machine.

You may be given:
- Relevant file excerpts from the user's indexed documents
- Relevant previous chat memory

Use the provided context when relevant.
If context is insufficient, say so honestly.
Do not fabricate file contents.
`;

  if (memoryContext) {
    base += `\n\n=== Relevant Previous Conversations ===\n${memoryContext}`;
  }

  if (fileContext) {
    base += `\n\n=== Relevant File Excerpts ===\n${fileContext}`;
  }

  return base;
}
