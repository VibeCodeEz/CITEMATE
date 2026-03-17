import { cache } from "react";

import { calculateWorkspaceAnalytics } from "@/lib/analytics/workspace";
import { getWorkspaceSourceReminders } from "@/lib/reminders/source-reminders";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  ChecklistItemWithProgress,
  Note,
  Source,
  SourceReminderDismissal,
  SourceWithRelations,
  Subject,
  SubjectWithCount,
} from "@/types/app";

export type SourceFilters = {
  q?: string;
  subjectId?: string;
  year?: string;
  tag?: string;
  sourceType?: string;
  citationStylePreference?: string;
};

export type NoteWithSource = Note & {
  source: Source | null;
};

function sortByMostRecent<T extends { updated_at: string }>(items: T[]) {
  return [...items].sort(
    (a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
  );
}

async function getWorkspaceCollections() {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  const [
    profileResult,
    subjectsResult,
    sourcesResult,
    linksResult,
    notesResult,
    reminderDismissalsResult,
  ] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase.from("subjects").select("*").eq("user_id", user.id).order("name"),
      supabase
        .from("sources")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase.from("source_subjects").select("*").eq("user_id", user.id),
      supabase
        .from("notes")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false }),
      supabase
        .from("source_reminder_dismissals")
        .select("*")
        .eq("user_id", user.id),
    ]);

  if (profileResult.error) throw profileResult.error;
  if (subjectsResult.error) throw subjectsResult.error;
  if (sourcesResult.error) throw sourcesResult.error;
  if (linksResult.error) throw linksResult.error;
  if (notesResult.error) throw notesResult.error;
  if (reminderDismissalsResult.error) throw reminderDismissalsResult.error;

  return {
    profile: profileResult.data,
    subjects: subjectsResult.data ?? [],
    sources: sourcesResult.data ?? [],
    sourceLinks: linksResult.data ?? [],
    notes: notesResult.data ?? [],
    reminderDismissals: reminderDismissalsResult.data ?? [],
    user,
  };
}

function hydrateSources(
  sources: Source[],
  subjects: Subject[],
  sourceLinks: { source_id: string; subject_id: string }[],
  notes: Note[],
) {
  const subjectMap = new Map(subjects.map((subject) => [subject.id, subject]));
  const notesBySource = new Map<string, Note[]>();

  notes.forEach((note) => {
    if (!note.source_id) return;

    const bucket = notesBySource.get(note.source_id) ?? [];
    bucket.push(note);
    notesBySource.set(note.source_id, bucket);
  });

  const subjectsBySource = new Map<string, Subject[]>();

  sourceLinks.forEach((link) => {
    const subject = subjectMap.get(link.subject_id);
    if (!subject) return;

    const bucket = subjectsBySource.get(link.source_id) ?? [];
    bucket.push(subject);
    subjectsBySource.set(link.source_id, bucket);
  });

  return sources.map<SourceWithRelations>((source) => ({
    ...source,
    notes: sortByMostRecent(notesBySource.get(source.id) ?? []),
    subjects: (subjectsBySource.get(source.id) ?? []).sort((a, b) =>
      a.name.localeCompare(b.name),
    ),
  }));
}

function matchesSourceFilters(source: SourceWithRelations, filters: SourceFilters) {
  const query = filters.q?.trim().toLowerCase();
  const subjectId = filters.subjectId?.trim();
  const year = filters.year?.trim();
  const tag = filters.tag?.trim().toLowerCase();
  const sourceType = filters.sourceType?.trim();
  const citationStylePreference = filters.citationStylePreference?.trim();

  if (query) {
    const haystack = [
      source.title,
      source.authors.join(" "),
      source.publisher ?? "",
      source.abstract ?? "",
      source.tags.join(" "),
      source.doi ?? "",
      source.url ?? "",
      source.source_type,
    ]
      .join(" ")
      .toLowerCase();

    if (!haystack.includes(query)) {
      return false;
    }
  }

  if (subjectId && !source.subjects.some((subject) => subject.id === subjectId)) {
    return false;
  }

  if (year && String(source.year ?? "") !== year) {
    return false;
  }

  if (tag && !source.tags.some((sourceTag) => sourceTag.toLowerCase() === tag)) {
    return false;
  }

  if (sourceType && source.source_type !== sourceType) {
    return false;
  }

  if (
    citationStylePreference &&
    source.citation_style !== citationStylePreference
  ) {
    return false;
  }

  return true;
}

export const getWorkspaceData = cache(async () => {
  const workspace = await getWorkspaceCollections();
  const hydratedSources = hydrateSources(
    workspace.sources,
    workspace.subjects,
    workspace.sourceLinks,
    workspace.notes,
  );

  const subjectsWithCount: SubjectWithCount[] = workspace.subjects.map(
    (subject) => ({
      ...subject,
      sourceCount: hydratedSources.filter((source) =>
        source.subjects.some((sourceSubject) => sourceSubject.id === subject.id),
      ).length,
    }),
  );

  const notesWithSource: NoteWithSource[] = workspace.notes.map((note) => ({
    ...note,
    source:
      hydratedSources.find((source) => source.id === note.source_id) ?? null,
  }));
  const sourceReminders = getWorkspaceSourceReminders({
    sources: hydratedSources,
    dismissals: workspace.reminderDismissals as SourceReminderDismissal[],
  });

  return {
    ...workspace,
    hydratedSources,
    subjectsWithCount,
    notesWithSource,
    sourceReminders,
  };
});

export async function getDashboardData() {
  const [{ hydratedSources, notesWithSource, subjectsWithCount, sourceReminders }, checklistItems] =
    await Promise.all([getWorkspaceData(), getChecklistData()]);
  const checklistCompleted = checklistItems.filter((item) => item.completed).length;
  const checklistTotal = checklistItems.length;
  const checklistCompletion =
    checklistTotal === 0
      ? 0
      : Math.round((checklistCompleted / checklistTotal) * 100);

  return {
    stats: {
      sources: hydratedSources.length,
      notes: notesWithSource.length,
      subjects: subjectsWithCount.length,
      checklistCompleted,
      checklistTotal,
      checklistCompletion,
      reminders: sourceReminders.length,
    },
    recentSources: hydratedSources.slice(0, 5),
    recentNotes: notesWithSource.slice(0, 5),
    reminders: sourceReminders.slice(0, 5),
  };
}

export async function getSourcesData(filters: SourceFilters = {}) {
  const { hydratedSources, subjectsWithCount } = await getWorkspaceData();
  const filteredSources = hydratedSources.filter((source) =>
    matchesSourceFilters(source, filters),
  );
  const years = Array.from(
    new Set(
      hydratedSources
        .map((source) => source.year)
        .filter((year): year is number => typeof year === "number"),
    ),
  ).sort((a, b) => b - a);
  const tags = Array.from(
    new Set(hydratedSources.flatMap((source) => source.tags)),
  ).sort((a, b) => a.localeCompare(b));

  return {
    subjects: subjectsWithCount,
    sources: filteredSources,
    allSources: hydratedSources,
    summary: {
      total: hydratedSources.length,
      filtered: filteredSources.length,
      tagged: hydratedSources.filter((source) => source.tags.length > 0).length,
    },
    filters,
    availableYears: years,
    availableTags: tags,
  };
}

export async function getSourceDetailsData(sourceId: string) {
  const { hydratedSources, subjectsWithCount } = await getWorkspaceData();
  const source =
    hydratedSources.find((currentSource) => currentSource.id === sourceId) ??
    null;

  return {
    source,
    subjects: subjectsWithCount,
  };
}

export async function getSubjectsData() {
  const { subjectsWithCount, hydratedSources, notes } = await getWorkspaceData();

  return {
    subjects: subjectsWithCount,
    analytics: calculateWorkspaceAnalytics({
      sources: hydratedSources,
      subjects: subjectsWithCount,
      notes,
    }),
  };
}

export async function getNotesData() {
  const { notesWithSource, hydratedSources } = await getWorkspaceData();

  return {
    notes: notesWithSource,
    sources: hydratedSources,
  };
}

export async function getChecklistData() {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  const [itemsResult, progressResult] = await Promise.all([
    supabase.from("checklist_items").select("*").order("position"),
    supabase.from("checklist_progress").select("*").eq("user_id", user.id),
  ]);

  if (itemsResult.error) throw itemsResult.error;
  if (progressResult.error) throw progressResult.error;

  const progressMap = new Map(
    (progressResult.data ?? []).map((progress) => [
      progress.checklist_item_id,
      {
        completed: progress.completed,
        updatedAt: progress.updated_at,
      },
    ]),
  );

  return (itemsResult.data ?? []).map<ChecklistItemWithProgress>((item) => ({
    ...item,
    completed: progressMap.get(item.id)?.completed ?? false,
    progress_updated_at: progressMap.get(item.id)?.updatedAt ?? null,
  }));
}

export async function getDashboardShellData() {
  const { profile, user } = await getWorkspaceData();

  return {
    email: user.email ?? profile?.email ?? "",
    fullName: profile?.full_name || user.user_metadata.full_name || "Student",
  };
}

export async function getNeedsAttentionData() {
  const { sourceReminders } = await getWorkspaceData();

  return {
    reminders: sourceReminders,
    summary: {
      total: sourceReminders.length,
      withAbstractReminder: sourceReminders.filter(
        (reminder) => reminder.key === "missing_abstract",
      ).length,
      withLinkReminder: sourceReminders.filter(
        (reminder) =>
          reminder.key === "missing_link" ||
          reminder.key === "missing_website_url",
      ).length,
    },
  };
}
