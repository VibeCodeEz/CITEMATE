import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";

import { NoteMarkdown } from "@/components/app/note-markdown";

test("renders markdown headings, emphasis, lists, and blockquotes", () => {
  const html = renderToStaticMarkup(
    <NoteMarkdown
      content={[
        "## Main idea",
        "",
        "**Bold** and _italic_ text",
        "",
        "- first",
        "- second",
        "",
        "> Quoted point",
      ].join("\n")}
    />,
  );

  assert.match(html, /<h2>Main idea<\/h2>/);
  assert.match(html, /<strong>Bold<\/strong>/);
  assert.match(html, /<em>italic<\/em>/);
  assert.match(html, /<ul>/);
  assert.match(html, /<blockquote>/);
});

test("does not render unsafe raw html tags", () => {
  const html = renderToStaticMarkup(
    <NoteMarkdown content={"Safe text\n\n<script>alert('xss')</script>"} />,
  );

  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /Safe text/);
});
