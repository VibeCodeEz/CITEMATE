import assert from "node:assert/strict";
import test from "node:test";

import {
  extractMetadataFromHtml,
  fetchSourceMetadata,
  normalizeDoi,
} from "@/lib/source-metadata/fetch";
import {
  mergeMetadataIntoSourceForm,
  metadataToSourceFormValues,
} from "@/lib/source-metadata/form";
import type { SourceInput } from "@/lib/validations/source";

test("normalizes plain DOI strings and doi.org URLs", () => {
  assert.equal(normalizeDoi("10.1000/xyz-123"), "10.1000/xyz-123");
  assert.equal(
    normalizeDoi("https://doi.org/10.1000/xyz-123"),
    "10.1000/xyz-123",
  );
  assert.equal(normalizeDoi("not-a-doi"), null);
});

test("fetches metadata from DOI lookup first", async () => {
  const calls: string[] = [];
  const fetchImpl: typeof fetch = async (input) => {
    calls.push(String(input));

    return new Response(
      JSON.stringify({
        message: {
          DOI: "10.1000/test-doi",
          URL: "https://doi.org/10.1000/test-doi",
          type: "journal-article",
          title: ["A Better Research Workflow"],
          author: [
            { given: "Ava", family: "Nguyen" },
            { given: "Noah", family: "Patel" },
          ],
          publisher: "Scholarly Press",
          "container-title": ["Journal of Research Systems"],
          issued: { "date-parts": [[2025, 3, 1]] },
          abstract: "<jats:p>Structured abstract.</jats:p>",
        },
      }),
      {
        status: 200,
        headers: { "content-type": "application/json" },
      },
    );
  };

  const result = await fetchSourceMetadata(
    { doi: "https://doi.org/10.1000/test-doi" },
    fetchImpl,
  );

  assert.equal(calls.length, 1);
  assert.match(calls[0], /api\.crossref\.org\/works\//);
  assert.equal(result.success, true);

  if (!result.success) {
    return;
  }

  assert.equal(result.lookupType, "doi");
  assert.equal(result.metadata.title, "A Better Research Workflow");
  assert.deepEqual(result.metadata.authors, ["Ava Nguyen", "Noah Patel"]);
  assert.equal(result.metadata.year, 2025);
  assert.equal(result.metadata.journalOrPublisher, "Journal of Research Systems");
  assert.equal(result.metadata.publisher, "Scholarly Press");
  assert.equal(result.metadata.abstract, "Structured abstract.");
});

test("extracts metadata from article HTML when DOI lookup is unavailable", async () => {
  const html = `
    <html>
      <head>
        <title>Ignored fallback title</title>
        <meta name="citation_title" content="Understanding Citation Helpers" />
        <meta name="citation_author" content="Jamie Lee" />
        <meta name="citation_author" content="Morgan Cruz" />
        <meta name="citation_publication_date" content="2024-09-18" />
        <meta property="og:site_name" content="Open Research Notes" />
        <meta name="description" content="A practical overview of citation tooling." />
        <link rel="canonical" href="https://example.com/articles/citation-helper" />
      </head>
      <body></body>
    </html>
  `;

  const result = await fetchSourceMetadata(
    { url: "https://example.com/articles/citation-helper" },
    async () =>
      new Response(html, {
        status: 200,
        headers: { "content-type": "text/html" },
      }),
  );

  assert.equal(result.success, true);

  if (!result.success) {
    return;
  }

  assert.equal(result.lookupType, "url");
  assert.equal(result.metadata.title, "Understanding Citation Helpers");
  assert.deepEqual(result.metadata.authors, ["Jamie Lee", "Morgan Cruz"]);
  assert.equal(result.metadata.year, 2024);
  assert.equal(result.metadata.journalOrPublisher, "Open Research Notes");
  assert.equal(result.metadata.url, "https://example.com/articles/citation-helper");
  assert.equal(result.metadata.abstract, "A practical overview of citation tooling.");
});

test("extracts DOI from HTML metadata when available", () => {
  const metadata = extractMetadataFromHtml(
    `
      <html>
        <head>
          <meta name="citation_title" content="Linked Article" />
          <meta name="citation_doi" content="10.7777/example-doi" />
        </head>
      </html>
    `,
    "https://publisher.test/article",
  );

  assert.equal(metadata.doi, "10.7777/example-doi");
  assert.equal(metadata.sourceType, "journal_article");
});

test("merges fetched metadata without overwriting dirty fields unless requested", () => {
  const currentValues: SourceInput = {
    title: "Manual title",
    authorsText: "Taylor Brooks",
    year: "",
    journalOrPublisher: "",
    doi: "10.1000/manual",
    url: "",
    tagsText: "",
    abstract: "",
    sourceType: "website",
    citationStylePreference: "apa",
    subjectIds: [],
  };
  const fetchedValues = metadataToSourceFormValues({
    title: "Fetched title",
    authors: ["Avery Chen"],
    year: 2026,
    journalOrPublisher: "Research Weekly",
    publisher: "Research Weekly",
    doi: "10.1000/fetched",
    url: "https://example.com/fetched",
    abstract: "Fetched abstract",
    sourceType: "journal_article",
  });

  const mergedWithoutOverwrite = mergeMetadataIntoSourceForm(
    currentValues,
    fetchedValues,
    {
      title: true,
      authorsText: true,
      doi: true,
    },
  );

  assert.deepEqual(mergedWithoutOverwrite.conflictingFields, [
    "title",
    "authorsText",
    "doi",
  ]);
  assert.equal(mergedWithoutOverwrite.nextValues.year, "2026");
  assert.equal(mergedWithoutOverwrite.nextValues.url, "https://example.com/fetched");

  const mergedWithOverwrite = mergeMetadataIntoSourceForm(
    currentValues,
    fetchedValues,
    {
      title: true,
      authorsText: true,
      doi: true,
    },
    true,
  );

  assert.equal(mergedWithOverwrite.nextValues.title, "Fetched title");
  assert.equal(mergedWithOverwrite.nextValues.authorsText, "Avery Chen");
  assert.equal(mergedWithOverwrite.nextValues.doi, "10.1000/fetched");
});
