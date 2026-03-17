import assert from "node:assert/strict";
import test from "node:test";

import { applyNoteMarkdownAction } from "@/lib/notes/editor";

test("wraps selected note text in bold markdown", () => {
  const result = applyNoteMarkdownAction(
    "important point",
    { start: 0, end: 9 },
    "bold",
  );

  assert.equal(result.value, "**important** point");
});

test("prefixes selected lines as a bullet list", () => {
  const result = applyNoteMarkdownAction(
    "first point\nsecond point",
    { start: 0, end: 23 },
    "bulletList",
  );

  assert.equal(result.value, "- first point\n- second point");
});

test("creates numbered list markdown across multiple lines", () => {
  const result = applyNoteMarkdownAction(
    "Plan\nDraft\nReview",
    { start: 0, end: 17 },
    "numberedList",
  );

  assert.equal(result.value, "1. Plan\n2. Draft\n3. Review");
});

test("wraps selected text in a fenced code block", () => {
  const result = applyNoteMarkdownAction(
    "const x = 1;",
    { start: 0, end: 12 },
    "codeBlock",
  );

  assert.equal(result.value, "```\nconst x = 1;\n```");
});
