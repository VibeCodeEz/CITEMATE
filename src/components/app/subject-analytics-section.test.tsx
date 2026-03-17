import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";

import { SubjectAnalyticsSection } from "@/components/app/subject-analytics-section";
import type { WorkspaceAnalytics } from "@/lib/analytics/workspace";

const emptyAnalytics: WorkspaceAnalytics = {
  totalSources: 0,
  totalSubjects: 0,
  taggedSources: 0,
  topTags: [],
  subjectDistribution: [],
  sourceTypeDistribution: [],
  notesBySubject: [],
};

const populatedAnalytics: WorkspaceAnalytics = {
  totalSources: 4,
  totalSubjects: 2,
  taggedSources: 3,
  topTags: [
    {
      key: "analysis",
      label: "#analysis",
      count: 2,
      share: 67,
    },
  ],
  subjectDistribution: [
    {
      key: "subject-1",
      label: "History 201",
      count: 3,
      share: 75,
      color: "#0f766e",
    },
  ],
  sourceTypeDistribution: [
    {
      key: "journal_article",
      label: "Journal article",
      count: 2,
      share: 50,
    },
  ],
  notesBySubject: [
    {
      key: "subject-1",
      label: "History 201",
      count: 2,
      share: 100,
      color: "#0f766e",
    },
  ],
};

test("renders an empty analytics state when the workspace has no organization data", () => {
  const html = renderToStaticMarkup(
    <SubjectAnalyticsSection analytics={emptyAnalytics} />,
  );

  assert.match(html, /Analytics will appear as you organize research/);
});

test("renders the analytics widgets and breakdown headings when data is available", () => {
  const html = renderToStaticMarkup(
    <SubjectAnalyticsSection analytics={populatedAnalytics} />,
  );

  assert.match(html, /Organization insights/);
  assert.match(html, /Most-used tags/);
  assert.match(html, /Sources by subject/);
  assert.match(html, /Source type mix/);
  assert.match(html, /Notes by subject/);
  assert.match(html, /History 201/);
  assert.match(html, /#analysis/);
});
