import type {
  AssistantApplyAction,
  AssistantRequest,
  AssistantTaskType,
} from "@/lib/ai/types";

const taskGuidance: Record<AssistantTaskType, string> = {
  summarize_source:
    "Summarize the source using only the metadata and abstract provided. Separate extracted facts from suggestions.",
  suggest_missing_metadata:
    "Identify missing citation metadata, explain why it matters, and suggest tags or subjects based only on the context. Never invent factual metadata.",
  explain_citation:
    "Explain the current citation in simple student-friendly language, compare APA vs MLA vs Chicago at a high level, and warn when the data is incomplete.",
  notes_to_outline:
    "Turn the current notes into a clean bullet outline with clear headings.",
  rewrite_notes:
    "Rewrite rough notes into cleaner study notes while preserving meaning and uncertainty.",
  generate_study_questions:
    "Generate concise study questions from the current notes that help review key ideas and evidence.",
  resolve_reminder:
    "Explain what the current reminder means, name the smallest missing detail needed next, and suggest the next practical fix without inventing facts.",
};

const defaultDisclaimer =
  "AI-generated suggestion. Review against the original source before saving or citing.";

const applyActionMap: Record<AssistantTaskType, AssistantApplyAction[]> = {
  summarize_source: [
    { type: "copy", label: "Copy" },
    { type: "insert_into_note", label: "Insert into note" },
    { type: "use_as_draft", label: "Use as draft" },
    { type: "dismiss", label: "Dismiss" },
  ],
  suggest_missing_metadata: [
    { type: "copy", label: "Copy" },
    { type: "use_as_draft", label: "Use as draft" },
    { type: "dismiss", label: "Dismiss" },
  ],
  explain_citation: [
    { type: "copy", label: "Copy" },
    { type: "use_as_draft", label: "Use as draft" },
    { type: "dismiss", label: "Dismiss" },
  ],
  notes_to_outline: [
    { type: "copy", label: "Copy" },
    { type: "insert_into_note", label: "Insert into note" },
    { type: "use_as_draft", label: "Use as draft" },
    { type: "dismiss", label: "Dismiss" },
  ],
  rewrite_notes: [
    { type: "copy", label: "Copy" },
    { type: "insert_into_note", label: "Insert into note" },
    { type: "use_as_draft", label: "Use as draft" },
    { type: "dismiss", label: "Dismiss" },
  ],
  generate_study_questions: [
    { type: "copy", label: "Copy" },
    { type: "insert_into_note", label: "Insert into note" },
    { type: "use_as_draft", label: "Use as draft" },
    { type: "dismiss", label: "Dismiss" },
  ],
  resolve_reminder: [
    { type: "copy", label: "Copy" },
    { type: "use_as_draft", label: "Use as draft" },
    { type: "dismiss", label: "Dismiss" },
  ],
};

export function getAssistantApplyActions(taskType: AssistantTaskType) {
  return applyActionMap[taskType];
}

export function buildAssistantSystemPrompt() {
  return [
    "You are CiteMate Research Assistant, an AI helper for academic organization.",
    "You help students understand source metadata, notes, reminders, and citation differences.",
    "You do not replace formal citation validation or source verification.",
    "Never fabricate missing authors, titles, years, publishers, URLs, DOIs, or quotations.",
    "If a fact is missing, say it is unknown and state the smallest missing detail needed.",
    "Keep responses concise, useful, and structured for direct UI display.",
    "When summarizing, clearly separate extracted facts from inferred suggestions.",
    "When discussing citations, explain limitations and never claim the result is guaranteed correct.",
    "Return valid JSON only with keys: title, content, suggestions, warnings, disclaimer.",
  ].join(" ");
}

export function buildAssistantUserPrompt(request: AssistantRequest) {
  return JSON.stringify(
    {
      task: request.taskType,
      taskGuidance: taskGuidance[request.taskType],
      rules: {
        labelOutputAsSuggestion: true,
        noFabrication: true,
        nonDestructive: true,
        askForSmallestMissingDetailIfNeeded: true,
      },
      context: {
        source: request.sourceContext ?? null,
        note: request.noteContext ?? null,
        subject: request.subjectContext ?? null,
        reminder: request.reminderContext ?? null,
      },
      userMessage: request.userMessage?.trim() || null,
      outputShape: {
        title: "short title",
        content: "concise markdown-friendly content",
        suggestions: [
          {
            label: "short label",
            value: "specific suggestion",
            reason: "optional reason",
          },
        ],
        warnings: ["important limitations or caution"],
        disclaimer: defaultDisclaimer,
      },
    },
    null,
    2,
  );
}
