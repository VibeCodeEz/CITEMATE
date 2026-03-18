"use client";

import { Copy, Eraser, FilePenLine, NotebookPen } from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AssistantResponse } from "@/lib/ai/types";

type AssistantResponseCardProps = {
  response: AssistantResponse;
  onUseAsDraft: (value: string) => void;
  onInsertIntoNote: (value: string) => void;
  onDismiss: () => void;
};

export function AssistantResponseCard({
  response,
  onUseAsDraft,
  onInsertIntoNote,
  onDismiss,
}: AssistantResponseCardProps) {
  return (
    <Card className="border-border/70 bg-card/90">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <Badge variant="secondary" className="rounded-full">
              AI-generated suggestion
            </Badge>
            <CardTitle className="font-serif text-3xl tracking-tight">
              {response.title}
            </CardTitle>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={async () => {
                await navigator.clipboard.writeText(response.content);
                toast.success("Copied suggestion.");
              }}
            >
              <Copy className="size-4" />
              Copy
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onInsertIntoNote(response.content)}
            >
              <NotebookPen className="size-4" />
              Insert into note
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onUseAsDraft(response.content)}
            >
              <FilePenLine className="size-4" />
              Use as draft
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={onDismiss}
            >
              <Eraser className="size-4" />
              Dismiss
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="prose prose-sm max-w-none prose-p:leading-7 prose-li:leading-7">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
            {response.content}
          </ReactMarkdown>
        </div>
        {response.suggestions.length > 0 ? (
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Suggested next steps
            </p>
            <div className="space-y-3">
              {response.suggestions.map((suggestion) => (
                <div
                  key={`${suggestion.label}:${suggestion.value}`}
                  className="rounded-[1.5rem] border border-border/80 bg-secondary/25 p-4"
                >
                  <p className="font-medium">{suggestion.label}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {suggestion.value}
                  </p>
                  {suggestion.reason ? (
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                      {suggestion.reason}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}
        {response.warnings.length > 0 ? (
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Warnings
            </p>
            <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
              {response.warnings.map((warning) => (
                <li key={warning} className="rounded-2xl border border-border/80 bg-background/70 px-4 py-3">
                  {warning}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <div className="rounded-[1.5rem] border border-amber-200/70 bg-amber-50/80 p-4 text-sm leading-6 text-amber-950">
          {response.disclaimer}
        </div>
      </CardContent>
    </Card>
  );
}
