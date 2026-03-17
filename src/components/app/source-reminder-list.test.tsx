import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";

import { SourceReminderList } from "@/components/app/source-reminder-list";
import type { SourceReminder } from "@/lib/reminders/source-reminders";

const reminders: SourceReminder[] = [
  {
    id: "source-1:missing_author",
    key: "missing_author",
    title: "Missing author",
    description: "Add at least one author so your citation has a clear creator.",
    sourceId: "source-1",
    sourceTitle: "Archival Research",
    sourceUpdatedAt: "2026-03-17T00:00:00.000Z",
    sourceType: "journal_article",
    subjectLabels: ["History 201"],
  },
];

test("renders reminder cards with source links and dismiss action", () => {
  const html = renderToStaticMarkup(<SourceReminderList reminders={reminders} />);

  assert.match(html, /Archival Research/);
  assert.match(html, /Missing author/);
  assert.match(html, /Open source/);
  assert.match(html, /Dismiss/);
});
