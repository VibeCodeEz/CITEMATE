import { getSourceTypeLabel } from "@/lib/validations/source";
import type { Note, SourceWithRelations, SubjectWithCount } from "@/types/app";

export type AnalyticsBreakdownItem = {
  key: string;
  label: string;
  count: number;
  share: number;
  color?: string;
};

export type WorkspaceAnalytics = {
  totalSources: number;
  totalSubjects: number;
  taggedSources: number;
  topTags: AnalyticsBreakdownItem[];
  subjectDistribution: AnalyticsBreakdownItem[];
  sourceTypeDistribution: AnalyticsBreakdownItem[];
  notesBySubject: AnalyticsBreakdownItem[];
};

function calculateShare(count: number, total: number) {
  if (total === 0) return 0;

  return Math.round((count / total) * 100);
}

function buildSortedBreakdown(
  entries: Array<Omit<AnalyticsBreakdownItem, "share">>,
  total: number,
) {
  return entries
    .filter((entry) => entry.count > 0)
    .sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }

      return a.label.localeCompare(b.label);
    })
    .map((entry) => ({
      ...entry,
      share: calculateShare(entry.count, total),
    }));
}

export function calculateWorkspaceAnalytics(input: {
  sources: SourceWithRelations[];
  subjects: SubjectWithCount[];
  notes: Note[];
}): WorkspaceAnalytics {
  const { notes, sources, subjects } = input;
  const totalSources = sources.length;
  const taggedSources = sources.filter((source) => source.tags.length > 0).length;
  const tagCounts = new Map<string, number>();
  const sourceTypeCounts = new Map<string, number>();
  const notesBySubjectCounts = new Map<string, number>();
  const notesBySourceId = new Map<string, Note[]>();

  notes.forEach((note) => {
    if (!note.source_id) return;

    const bucket = notesBySourceId.get(note.source_id) ?? [];
    bucket.push(note);
    notesBySourceId.set(note.source_id, bucket);
  });

  sources.forEach((source) => {
    source.tags.forEach((tag) => {
      const normalizedTag = tag.trim();

      if (!normalizedTag) return;

      tagCounts.set(normalizedTag, (tagCounts.get(normalizedTag) ?? 0) + 1);
    });

    sourceTypeCounts.set(
      source.source_type,
      (sourceTypeCounts.get(source.source_type) ?? 0) + 1,
    );

    const noteCount = notesBySourceId.get(source.id)?.length ?? 0;

    if (noteCount === 0) {
      return;
    }

    source.subjects.forEach((subject) => {
      notesBySubjectCounts.set(
        subject.id,
        (notesBySubjectCounts.get(subject.id) ?? 0) + noteCount,
      );
    });
  });

  const topTags = buildSortedBreakdown(
    Array.from(tagCounts.entries()).map(([tag, count]) => ({
      key: tag,
      label: `#${tag}`,
      count,
    })),
    Math.max(taggedSources, 1),
  ).slice(0, 8);

  const subjectDistribution = buildSortedBreakdown(
    subjects.map((subject) => ({
      key: subject.id,
      label: subject.name,
      count: subject.sourceCount,
      color: subject.color,
    })),
    Math.max(totalSources, 1),
  );

  const sourceTypeDistribution = buildSortedBreakdown(
    Array.from(sourceTypeCounts.entries()).map(([sourceType, count]) => ({
      key: sourceType,
      label: getSourceTypeLabel(sourceType as SourceWithRelations["source_type"]),
      count,
    })),
    Math.max(totalSources, 1),
  );

  const notesBySubject = buildSortedBreakdown(
    subjects.map((subject) => ({
      key: subject.id,
      label: subject.name,
      count: notesBySubjectCounts.get(subject.id) ?? 0,
      color: subject.color,
    })),
    Math.max(notes.filter((note) => Boolean(note.source_id)).length, 1),
  );

  return {
    totalSources,
    totalSubjects: subjects.length,
    taggedSources,
    topTags,
    subjectDistribution,
    sourceTypeDistribution,
    notesBySubject,
  };
}
