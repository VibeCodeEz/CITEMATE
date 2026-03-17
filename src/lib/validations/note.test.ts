import assert from "node:assert/strict";
import test from "node:test";

import { noteSchema } from "@/lib/validations/note";

test("accepts plain-text note content for backward compatibility", () => {
  const result = noteSchema.safeParse({
    title: "Plain text note",
    content: "This is a regular note with no markdown at all.",
    sourceId: null,
  });

  assert.equal(result.success, true);
});

test("accepts markdown note content in the existing save schema", () => {
  const result = noteSchema.safeParse({
    title: "Markdown note",
    content: "## Main idea\n\n**Bold thought**\n\n- point one\n- point two",
    sourceId: null,
  });

  assert.equal(result.success, true);
});
