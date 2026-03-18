"use client";

import {
  Blocks,
  BookOpenText,
  Compass,
  FileQuestion,
  FileSearch2,
  ListTree,
  Rows3,
  ScanSearch,
  Sparkles,
  TableProperties,
  WandSparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { AssistantTaskType } from "@/lib/ai/types";

const taskConfig: Record<
  AssistantTaskType,
  { label: string; icon: typeof Sparkles }
> = {
  summarize_source: {
    label: "Summarize source",
    icon: BookOpenText,
  },
  suggest_missing_metadata: {
    label: "Suggest missing fields",
    icon: Sparkles,
  },
  explain_citation: {
    label: "Explain this citation",
    icon: FileQuestion,
  },
  notes_to_outline: {
    label: "Turn notes into outline",
    icon: ListTree,
  },
  rewrite_notes: {
    label: "Rewrite notes",
    icon: WandSparkles,
  },
  generate_study_questions: {
    label: "Generate study questions",
    icon: FileSearch2,
  },
  resolve_reminder: {
    label: "Help fix this reminder",
    icon: Sparkles,
  },
  discover_literature: {
    label: "Find literature",
    icon: Compass,
  },
  build_rrl_note: {
    label: "Build RRL note",
    icon: Blocks,
  },
  group_sources_by_theme: {
    label: "Group by theme",
    icon: ListTree,
  },
  build_related_studies_matrix: {
    label: "Build studies matrix",
    icon: TableProperties,
  },
  generate_rrl_outline: {
    label: "Generate RRL outline",
    icon: Rows3,
  },
  find_research_gaps: {
    label: "Find research gaps",
    icon: ScanSearch,
  },
};

type TaskActionButtonsProps = {
  tasks: AssistantTaskType[];
  activeTask?: AssistantTaskType | null;
  disabled?: boolean;
  onSelect: (task: AssistantTaskType) => void;
};

export function TaskActionButtons({
  tasks,
  activeTask,
  disabled = false,
  onSelect,
}: TaskActionButtonsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {tasks.map((task) => {
        const config = taskConfig[task];
        const Icon = config.icon;

        return (
          <Button
            key={task}
            type="button"
            size="sm"
            variant={activeTask === task ? "default" : "outline"}
            disabled={disabled}
            title={`Ask AI to ${config.label.toLowerCase()}`}
            onClick={() => onSelect(task)}
          >
            <Icon className="size-4" />
            {config.label}
          </Button>
        );
      })}
    </div>
  );
}
