import assert from "node:assert/strict";
import test from "node:test";

import {
  buildCitationExportDocument,
  formatBibTeX,
  formatBibTeXEntry,
  formatRis,
  formatRisEntry,
} from "@/lib/citation-export";
import type { CitationExportSource } from "@/lib/citation-export/types";

const journalSource: CitationExportSource = {
  id: "source-1",
  title: "Social Capital in College Success",
  authors: ["Dana Moore", "Priya Shah"],
  year: 2023,
  publisher: "Journal of Student Research",
  url: "https://example.com/social-capital",
  doi: "10.1000/social-capital",
  abstract: "Examines how social capital shapes outcomes.",
  tags: ["college", "sociology"],
  sourceType: "journal_article",
};

test("formats a BibTeX entry for a journal article", () => {
  const entry = formatBibTeXEntry(journalSource);

  assert.match(entry, /^@article\{/);
  assert.match(entry, /title = \{Social Capital in College Success\}/);
  assert.match(entry, /author = \{Moore, Dana and Shah, Priya\}/);
  assert.match(entry, /journal = \{Journal of Student Research\}/);
  assert.match(entry, /doi = \{10\.1000\/social-capital\}/);
  assert.match(entry, /url = \{https:\/\/doi\.org\/10\.1000\/social-capital\}/);
});

test("creates unique BibTeX keys for repeated author-year-title combinations", () => {
  const content = formatBibTeX([
    journalSource,
    {
      ...journalSource,
      id: "source-2",
    },
  ]);

  assert.match(content, /@article\{moore-2023-social-capital,/);
  assert.match(content, /@article\{moore-2023-social-capital-2,/);
});

test("formats RIS and omits missing metadata cleanly", () => {
  const entry = formatRisEntry({
    id: "source-3",
    title: "",
    authors: [],
    year: null,
    publisher: null,
    url: null,
    doi: null,
    abstract: null,
    tags: [],
    sourceType: "website",
  });

  assert.equal(
    entry,
    ["TY  - ELEC", "TI  - Untitled source", "ER  -"].join("\n"),
  );
});

test("formats RIS for journal sources with authors, DOI, URL, abstract, and tags", () => {
  const content = formatRis([journalSource]);

  assert.match(content, /^TY  - JOUR/m);
  assert.match(content, /^AU  - Dana Moore$/m);
  assert.match(content, /^AU  - Priya Shah$/m);
  assert.match(content, /^PY  - 2023$/m);
  assert.match(content, /^JO  - Journal of Student Research$/m);
  assert.match(content, /^DO  - 10\.1000\/social-capital$/m);
  assert.match(content, /^KW  - college$/m);
  assert.match(content, /^KW  - sociology$/m);
});

test("builds single-source and bulk export documents with the right filenames", () => {
  const singleDocument = buildCitationExportDocument(
    [journalSource],
    "bibtex",
    new Date("2026-03-17T00:00:00.000Z"),
  );
  const bulkDocument = buildCitationExportDocument(
    [
      journalSource,
      {
        ...journalSource,
        id: "source-4",
        title: "Second Source",
      },
    ],
    "ris",
    new Date("2026-03-17T00:00:00.000Z"),
  );

  assert.equal(singleDocument.fileName, "social-capital-in-college-success.bib");
  assert.equal(singleDocument.extension, "bib");
  assert.equal(bulkDocument.fileName, "citemate-sources-2026-03-17.ris");
  assert.equal(bulkDocument.extension, "ris");
  assert.equal(bulkDocument.sourceCount, 2);
});
