import assert from "node:assert/strict";
import test from "node:test";

import { generateCitation } from "@/lib/citations";
import type { CitationSource } from "@/lib/citations/types";

const journalSource: CitationSource = {
  title: "Social Capital in College Success",
  authors: ["Dana Moore", "Priya Shah"],
  year: 2023,
  journalOrPublisher: "Journal of Student Research",
  url: "https://example.com/social-capital",
  doi: "10.1000/social-capital",
  abstract: null,
  sourceType: "journal_article",
  citationStylePreference: "apa",
};

test("formats APA citation with DOI", () => {
  assert.equal(
    generateCitation(journalSource, "apa"),
    "Moore, D. & Shah, P. (2023). Social Capital in College Success. Journal of Student Research. https://doi.org/10.1000/social-capital",
  );
});

test("formats MLA citation with publisher and year", () => {
  assert.equal(
    generateCitation(journalSource, "mla"),
    'Dana Moore and Priya Shah. "Social Capital in College Success." Journal of Student Research, 2023. https://doi.org/10.1000/social-capital',
  );
});

test("formats Chicago citation with publisher and DOI", () => {
  assert.equal(
    generateCitation(journalSource, "chicago"),
    'Dana Moore and Priya Shah. "Social Capital in College Success." Journal of Student Research, 2023. https://doi.org/10.1000/social-capital',
  );
});

test("formats newly supported citation styles for a journal article", () => {
  assert.equal(
    generateCitation(journalSource, "harvard"),
    "Moore, D. and Shah, P. (2023) Social Capital in College Success. Journal of Student Research. https://doi.org/10.1000/social-capital",
  );
  assert.equal(
    generateCitation(journalSource, "ieee"),
    '[1] Moore D, Shah P. "Social Capital in College Success." Journal of Student Research. 2023. https://doi.org/10.1000/social-capital',
  );
  assert.equal(
    generateCitation(journalSource, "ama"),
    "1. Moore D, Shah P. Social Capital in College Success. 2023. Journal of Student Research. https://doi.org/10.1000/social-capital",
  );
  assert.equal(
    generateCitation(journalSource, "vancouver"),
    "1. Moore D, Shah P. Social Capital in College Success. 2023. Journal of Student Research. https://doi.org/10.1000/social-capital",
  );
  assert.equal(
    generateCitation(journalSource, "turabian"),
    'Dana Moore and Priya Shah. "Social Capital in College Success." Journal of Student Research, 2023. https://doi.org/10.1000/social-capital',
  );
  assert.equal(
    generateCitation(journalSource, "acs"),
    "1. Moore D, Shah P. Social Capital in College Success. Journal of Student Research. 2023. https://doi.org/10.1000/social-capital",
  );
  assert.equal(
    generateCitation(journalSource, "cse"),
    "1. Moore D, Shah P. Social Capital in College Success. Journal of Student Research. 2023. https://doi.org/10.1000/social-capital",
  );
  assert.equal(
    generateCitation(journalSource, "oscola"),
    "Dana Moore and Priya Shah, 'Social Capital in College Success' (Journal of Student Research 2023) https://doi.org/10.1000/social-capital",
  );
  assert.equal(
    generateCitation(journalSource, "bluebook"),
    "Dana Moore and Priya Shah, Social Capital in College Success (Journal of Student Research 2023) https://doi.org/10.1000/social-capital",
  );
  assert.equal(
    generateCitation(journalSource, "asa"),
    'Moore, D., and Shah, P.. 2023. "Social Capital in College Success." Journal of Student Research. https://doi.org/10.1000/social-capital',
  );
  assert.equal(
    generateCitation(journalSource, "apsa"),
    "Moore, D. and Shah, P. (2023) Social Capital in College Success. Journal of Student Research. https://doi.org/10.1000/social-capital",
  );
  assert.equal(
    generateCitation(journalSource, "nlm"),
    "1. Moore D, Shah P. Social Capital in College Success. 2023. Journal of Student Research. https://doi.org/10.1000/social-capital",
  );
});

test("handles missing fields gracefully", () => {
  assert.equal(
    generateCitation(
      {
        title: "",
        authors: [],
        year: null,
        journalOrPublisher: null,
        url: null,
        doi: null,
        abstract: null,
        sourceType: "other",
        citationStylePreference: "chicago",
      },
      "chicago",
    ),
    'Unknown author. "Untitled source." n.d.',
  );
});
