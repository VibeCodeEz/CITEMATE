"use client";

import { useState } from "react";
import { BookmarkPlus, LayoutTemplate, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type SavedTemplate = {
  id: string;
  title: string;
  content: string;
};

type NoteTemplatePanelProps = {
  currentTitle: string;
  currentContent: string;
  onApply: (template: { title: string; content: string }) => void;
};

const storageKey = "citemate:rrl-note-templates";

const presetTemplates: SavedTemplate[] = [
  {
    id: "rrl-summary",
    title: "RRL Summary Note",
    content: `## Summary\n\n- Main topic:\n- Purpose of the study:\n- Central argument:\n\n## Methodology\n\n- Research design:\n- Participants or sample:\n- Data gathering:\n\n## Findings\n\n- Key findings:\n- Important evidence:\n\n## Research Gap\n\n- Limitation or missing area:\n- What remains underexplored:\n\n## Relevance To My Study\n\n- Why this source matters:\n- Where I may cite it:\n`,
  },
  {
    id: "related-study",
    title: "Related Study Matrix Draft",
    content: `## Study Profile\n\n- Author and year:\n- Title:\n- Topic:\n\n## Method\n\n- Design:\n- Sample:\n- Setting:\n\n## Findings\n\n- Main finding 1:\n- Main finding 2:\n\n## Limitation Or Gap\n\n- Reported limitation:\n- Implied gap:\n\n## Connection To My Review\n\n- Similar to:\n- Different from:\n- Best theme:\n`,
  },
  {
    id: "thematic-synthesis",
    title: "Thematic Synthesis Note",
    content: `## Theme\n\n- Theme label:\n- Shared idea across studies:\n\n## Supporting Sources\n\n- Source 1:\n- Source 2:\n- Source 3:\n\n## Synthesis\n\n- What the studies agree on:\n- What they disagree on:\n- What remains unclear:\n\n## Gap Direction\n\n- Underexplored area:\n- Possible contribution of my study:\n`,
  },
];

export function NoteTemplatePanel({
  currentTitle,
  currentContent,
  onApply,
}: NoteTemplatePanelProps) {
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    try {
      const raw = window.localStorage.getItem(storageKey);

      if (!raw) {
        return [];
      }

      const parsed = JSON.parse(raw) as SavedTemplate[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  function persist(nextTemplates: SavedTemplate[]) {
    setSavedTemplates(nextTemplates);
    window.localStorage.setItem(storageKey, JSON.stringify(nextTemplates));
  }

  function saveCurrentAsTemplate() {
    if (!currentTitle.trim() || !currentContent.trim()) {
      toast.error("Add a note title and content before saving a template.");
      return;
    }

    const nextTemplate: SavedTemplate = {
      id: crypto.randomUUID(),
      title: currentTitle.trim(),
      content: currentContent,
    };

    persist([nextTemplate, ...savedTemplates].slice(0, 8));
    toast.success("Saved note template on this device.");
  }

  function removeTemplate(id: string) {
    persist(savedTemplates.filter((template) => template.id !== id));
    toast.success("Removed saved template.");
  }

  return (
    <div className="space-y-3 rounded-[1.5rem] border border-border/80 bg-secondary/20 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <LayoutTemplate className="size-4 text-primary" />
            <p className="text-sm font-medium">Saved RRL templates</p>
          </div>
          <p className="text-xs leading-5 text-muted-foreground">
            Start from a reusable note structure or save your current note as a template on this device.
          </p>
        </div>
        <Button type="button" size="sm" variant="outline" onClick={saveCurrentAsTemplate}>
          <BookmarkPlus className="size-4" />
          Save current as template
        </Button>
      </div>
      <div className="space-y-3">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Starter templates
          </p>
          <div className="flex flex-wrap gap-2">
            {presetTemplates.map((template) => (
              <Button
                key={template.id}
                type="button"
                size="sm"
                variant="outline"
                onClick={() => onApply(template)}
              >
                {template.title}
              </Button>
            ))}
          </div>
        </div>
        {savedTemplates.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Your saved templates
            </p>
            <div className="space-y-2">
              {savedTemplates.map((template) => (
                <div
                  key={template.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border/80 bg-background/70 p-3"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="rounded-full">
                      Saved
                    </Badge>
                    <p className="text-sm font-medium">{template.title}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => onApply(template)}
                    >
                      Use template
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removeTemplate(template.id)}
                    >
                      <Trash2 className="size-4" />
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
