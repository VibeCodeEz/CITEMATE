import type { SourceReminderDismissal, SourceWithRelations } from "@/types/app";

export type SourceReminderKey =
  | "missing_author"
  | "missing_year"
  | "missing_title"
  | "missing_abstract"
  | "missing_link"
  | "missing_publisher"
  | "missing_website_url";

export type SourceReminder = {
  id: string;
  key: SourceReminderKey;
  title: string;
  description: string;
  sourceId: string;
  sourceTitle: string;
  sourceUpdatedAt: string;
  sourceType: SourceWithRelations["source_type"];
  subjectLabels: string[];
};

type ReminderRule = {
  key: SourceReminderKey;
  title: string;
  description: string;
  when: (source: SourceWithRelations) => boolean;
};

const sharedRules: ReminderRule[] = [
  {
    key: "missing_author",
    title: "Missing author",
    description: "Add at least one author so your citation has a clear creator.",
    when: (source) => source.authors.length === 0,
  },
  {
    key: "missing_year",
    title: "Missing year",
    description: "Add a publication year to complete the citation details.",
    when: (source) => source.year === null,
  },
  {
    key: "missing_title",
    title: "Missing source title",
    description: "Add a clear source title so the reference is identifiable.",
    when: (source) => source.title.trim().length === 0,
  },
  {
    key: "missing_abstract",
    title: "Missing abstract",
    description: "Save a short abstract or summary so you can review the source faster later.",
    when: (source) => !source.abstract?.trim(),
  },
];

const sourceTypeRules: Partial<Record<SourceWithRelations["source_type"], ReminderRule[]>> = {
  journal_article: [
    {
      key: "missing_link",
      title: "Missing URL or DOI",
      description: "Journal articles are easier to verify later when they include a DOI or source link.",
      when: (source) => !source.url?.trim() && !source.doi?.trim(),
    },
    {
      key: "missing_publisher",
      title: "Missing journal or publisher",
      description: "Add the journal or publisher name to round out the citation.",
      when: (source) => !source.publisher?.trim(),
    },
  ],
  book: [
    {
      key: "missing_publisher",
      title: "Missing publisher",
      description: "Books usually need a publisher for a complete citation.",
      when: (source) => !source.publisher?.trim(),
    },
  ],
  website: [
    {
      key: "missing_website_url",
      title: "Missing website URL",
      description: "Web sources should include a working URL so you can revisit them later.",
      when: (source) => !source.url?.trim(),
    },
  ],
  report: [
    {
      key: "missing_publisher",
      title: "Missing publisher or institution",
      description: "Reports are easier to cite accurately when the issuing organization is saved.",
      when: (source) => !source.publisher?.trim(),
    },
    {
      key: "missing_link",
      title: "Missing URL or DOI",
      description: "Add a report link or DOI so the source is easy to verify later.",
      when: (source) => !source.url?.trim() && !source.doi?.trim(),
    },
  ],
  thesis: [
    {
      key: "missing_publisher",
      title: "Missing school or publisher",
      description: "Theses are clearer to cite when the school or repository is included.",
      when: (source) => !source.publisher?.trim(),
    },
    {
      key: "missing_link",
      title: "Missing URL or DOI",
      description: "Add a repository link or DOI to make the thesis easier to revisit later.",
      when: (source) => !source.url?.trim() && !source.doi?.trim(),
    },
  ],
  conference_paper: [
    {
      key: "missing_publisher",
      title: "Missing conference or publisher",
      description: "Conference papers are easier to cite when the conference or proceedings title is saved.",
      when: (source) => !source.publisher?.trim(),
    },
    {
      key: "missing_link",
      title: "Missing URL or DOI",
      description: "Add a DOI or proceedings link so the paper stays easy to verify.",
      when: (source) => !source.url?.trim() && !source.doi?.trim(),
    },
  ],
};

export function buildSourceReminders(source: SourceWithRelations): SourceReminder[] {
  const rules = [...sharedRules, ...(sourceTypeRules[source.source_type] ?? [])];

  return rules
    .filter((rule) => rule.when(source))
    .map((rule) => ({
      id: `${source.id}:${rule.key}`,
      key: rule.key,
      title: rule.title,
      description: rule.description,
      sourceId: source.id,
      sourceTitle: source.title || "Untitled source",
      sourceUpdatedAt: source.updated_at,
      sourceType: source.source_type,
      subjectLabels: source.subjects.map((subject) => subject.name),
    }));
}

export function filterDismissedSourceReminders(args: {
  reminders: SourceReminder[];
  dismissals: SourceReminderDismissal[];
}) {
  const dismissalMap = new Map(
    args.dismissals.map((dismissal) => [
      `${dismissal.source_id}:${dismissal.reminder_key}`,
      dismissal,
    ]),
  );

  return args.reminders.filter((reminder) => {
    const dismissal = dismissalMap.get(`${reminder.sourceId}:${reminder.key}`);

    if (!dismissal) {
      return true;
    }

    return dismissal.source_updated_at !== reminder.sourceUpdatedAt;
  });
}

export function getWorkspaceSourceReminders(args: {
  sources: SourceWithRelations[];
  dismissals: SourceReminderDismissal[];
}) {
  const reminders = args.sources.flatMap((source) => buildSourceReminders(source));

  return filterDismissedSourceReminders({
    reminders,
    dismissals: args.dismissals,
  }).sort((a, b) => {
    if (a.sourceTitle !== b.sourceTitle) {
      return a.sourceTitle.localeCompare(b.sourceTitle);
    }

    return a.title.localeCompare(b.title);
  });
}
