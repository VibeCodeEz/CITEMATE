import assert from "node:assert/strict";
import test from "node:test";

import {
  buildSourceReminders,
  filterDismissedSourceReminders,
  getWorkspaceSourceReminders,
} from "@/lib/reminders/source-reminders";
import type { SourceReminderDismissal, SourceWithRelations, Subject } from "@/types/app";

const subject: Subject = {
  id: "subject-1",
  user_id: "user-1",
  name: "History 201",
  description: null,
  color: "#0f766e",
  created_at: "2026-03-17T00:00:00.000Z",
  updated_at: "2026-03-17T00:00:00.000Z",
};

const baseSource: SourceWithRelations = {
  id: "source-1",
  user_id: "user-1",
  title: "Archival Research",
  authors: [],
  year: null,
  publisher: null,
  url: null,
  doi: null,
  tags: [],
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
  subjects: [subject],
  notes: [],
};

test("builds flexible reminders based on missing source fields and source type", () => {
  const reminders = buildSourceReminders(baseSource);

  assert.deepEqual(
    reminders.map((reminder) => reminder.key),
    [
      "missing_author",
      "missing_year",
      "missing_abstract",
      "missing_link",
      "missing_publisher",
    ],
  );
});

test("filters dismissed reminders until the source changes again", () => {
  const reminders = buildSourceReminders(baseSource);
  const dismissals: SourceReminderDismissal[] = [
    {
      user_id: "user-1",
      source_id: "source-1",
      reminder_key: "missing_author",
      source_updated_at: "2026-03-17T00:00:00.000Z",
      dismissed_at: "2026-03-17T01:00:00.000Z",
    },
  ];

  const filtered = filterDismissedSourceReminders({
    reminders,
    dismissals,
  });

  assert.equal(filtered.some((reminder) => reminder.key === "missing_author"), false);
  assert.equal(filtered.some((reminder) => reminder.key === "missing_year"), true);
});

test("shows dismissed reminders again after the source is updated", () => {
  const updatedSource = {
    ...baseSource,
    updated_at: "2026-03-18T00:00:00.000Z",
  };

  const reminders = getWorkspaceSourceReminders({
    sources: [updatedSource],
    dismissals: [
      {
        user_id: "user-1",
        source_id: "source-1",
        reminder_key: "missing_author",
        source_updated_at: "2026-03-17T00:00:00.000Z",
        dismissed_at: "2026-03-17T01:00:00.000Z",
      },
    ],
  });

  assert.equal(reminders.some((reminder) => reminder.key === "missing_author"), true);
});
