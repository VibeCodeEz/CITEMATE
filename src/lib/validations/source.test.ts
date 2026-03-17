import assert from "node:assert/strict";
import test from "node:test";

import {
  normalizeSourceDoi,
  sourceMetadataLookupSchema,
  sourceSchema,
} from "@/lib/validations/source";

test("normalizes DOI input for saved sources", () => {
  assert.equal(normalizeSourceDoi("doi:10.1234/example"), "10.1234/example");
  assert.equal(
    normalizeSourceDoi("https://doi.org/10.1234/example"),
    "10.1234/example",
  );
});

test("rejects invalid DOI values in source form validation", () => {
  const result = sourceSchema.safeParse({
    title: "Research article",
    authorsText: "Jamie Lee",
    year: "2025",
    journalOrPublisher: "Research Journal",
    url: "https://example.com/article",
    doi: "bad-doi",
    tagsText: "",
    abstract: "",
    sourceType: "journal_article",
    citationStylePreference: "apa",
    subjectIds: [],
  });

  assert.equal(result.success, false);

  if (result.success) {
    return;
  }

  assert.match(result.error.flatten().fieldErrors.doi?.[0] ?? "", /valid DOI/i);
});

test("requires a DOI or URL for metadata lookup", () => {
  const result = sourceMetadataLookupSchema.safeParse({
    doi: "",
    url: "",
  });

  assert.equal(result.success, false);

  if (result.success) {
    return;
  }

  assert.match(result.error.flatten().fieldErrors.doi?.[0] ?? "", /DOI or URL/i);
});
