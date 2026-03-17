import assert from "node:assert/strict";
import test from "node:test";

import { calculateWorkspaceAnalytics } from "@/lib/analytics/workspace";
import type { Note, SourceWithRelations, SubjectWithCount } from "@/types/app";

const historySubject: SubjectWithCount = {
  id: "subject-history",
  user_id: "user-1",
  name: "History 201",
  description: "Primary sources and historiography",
  color: "#0f766e",
  created_at: "2026-03-17T00:00:00.000Z",
  updated_at: "2026-03-17T00:00:00.000Z",
  sourceCount: 2,
};

const sociologySubject: SubjectWithCount = {
  id: "subject-soc",
  user_id: "user-1",
  name: "Sociology 330",
  description: "Methods and literature review",
  color: "#b45309",
  created_at: "2026-03-17T00:00:00.000Z",
  updated_at: "2026-03-17T00:00:00.000Z",
  sourceCount: 1,
};

const notes: Note[] = [
  {
    id: "note-1",
    user_id: "user-1",
    source_id: "source-1",
    title: "Archive quote",
    content: "Quote note",
    created_at: "2026-03-17T00:00:00.000Z",
    updated_at: "2026-03-17T00:00:00.000Z",
  },
  {
    id: "note-2",
    user_id: "user-1",
    source_id: "source-1",
    title: "Second note",
    content: "Another note",
    created_at: "2026-03-17T00:00:00.000Z",
    updated_at: "2026-03-17T00:00:00.000Z",
  },
  {
    id: "note-3",
    user_id: "user-1",
    source_id: "source-2",
    title: "Methods note",
    content: "Methods note",
    created_at: "2026-03-17T00:00:00.000Z",
    updated_at: "2026-03-17T00:00:00.000Z",
  },
];

const sources: SourceWithRelations[] = [
  {
    id: "source-1",
    user_id: "user-1",
    title: "Archival Research and Student Writing",
    authors: ["Jamie Lee"],
    year: 2024,
    publisher: "Journal of Historical Methods",
    url: null,
    doi: null,
    tags: ["archive", "analysis"],
    abstract: null,
    source_type: "journal_article",
    citation_style: "apa",
    file_name: null,
    file_path: null,
    file_type: null,
    file_size_bytes: null,
    file_uploaded_at: null,
    created_at: "2026-03-17T00:00:00.000Z",
    updated_at: "2026-03-17T00:00:00.000Z",
    subjects: [historySubject],
    notes: notes.filter((note) => note.source_id === "source-1"),
  },
  {
    id: "source-2",
    user_id: "user-1",
    title: "Interview Coding Handbook",
    authors: ["Avery Patel"],
    year: 2025,
    publisher: "Methods Press",
    url: null,
    doi: null,
    tags: ["analysis", "coding"],
    abstract: null,
    source_type: "book",
    citation_style: "mla",
    file_name: null,
    file_path: null,
    file_type: null,
    file_size_bytes: null,
    file_uploaded_at: null,
    created_at: "2026-03-17T00:00:00.000Z",
    updated_at: "2026-03-17T00:00:00.000Z",
    subjects: [historySubject, sociologySubject],
    notes: notes.filter((note) => note.source_id === "source-2"),
  },
];

test("calculates tag, subject, source type, and note analytics from workspace data", () => {
  const analytics = calculateWorkspaceAnalytics({
    sources,
    subjects: [historySubject, sociologySubject],
    notes,
  });

  assert.equal(analytics.totalSources, 2);
  assert.equal(analytics.taggedSources, 2);
  assert.deepEqual(
    analytics.topTags.map((item) => [item.label, item.count]),
    [
      ["#analysis", 2],
      ["#archive", 1],
      ["#coding", 1],
    ],
  );
  assert.deepEqual(
    analytics.subjectDistribution.map((item) => [item.label, item.count]),
    [
      ["History 201", 2],
      ["Sociology 330", 1],
    ],
  );
  assert.deepEqual(
    analytics.sourceTypeDistribution.map((item) => [item.label, item.count]),
    [
      ["Book", 1],
      ["Journal article", 1],
    ],
  );
  assert.deepEqual(
    analytics.notesBySubject.map((item) => [item.label, item.count]),
    [
      ["History 201", 3],
      ["Sociology 330", 1],
    ],
  );
});

test("returns empty analytics arrays when there is little data", () => {
  const analytics = calculateWorkspaceAnalytics({
    sources: [],
    subjects: [],
    notes: [],
  });

  assert.equal(analytics.totalSources, 0);
  assert.deepEqual(analytics.topTags, []);
  assert.deepEqual(analytics.subjectDistribution, []);
  assert.deepEqual(analytics.sourceTypeDistribution, []);
  assert.deepEqual(analytics.notesBySubject, []);
});
