"use client";

import type { ComponentPropsWithoutRef } from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";

type NoteMarkdownProps = {
  content: string;
  className?: string;
};

const noteMarkdownSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    a: [
      ...(defaultSchema.attributes?.a ?? []),
      ["href"],
      ["title"],
      ["target"],
      ["rel"],
    ],
  },
};

function MarkdownParagraph({
  className,
  ...props
}: ComponentPropsWithoutRef<"p">) {
  return <p className={cn("leading-7 [&:not(:first-child)]:mt-4", className)} {...props} />;
}

export function NoteMarkdown({ content, className }: NoteMarkdownProps) {
  return (
    <div
      className={cn(
        "prose prose-stone max-w-none break-words text-sm text-muted-foreground prose-headings:font-serif prose-headings:text-foreground prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:text-muted-foreground prose-strong:text-foreground prose-code:rounded prose-code:bg-background prose-code:px-1 prose-code:py-0.5 prose-code:text-foreground prose-pre:overflow-x-auto prose-pre:rounded-2xl prose-pre:border prose-pre:border-border/80 prose-pre:bg-background prose-blockquote:border-l-4 prose-blockquote:border-primary/30 prose-blockquote:pl-4 prose-blockquote:text-muted-foreground prose-li:marker:text-primary",
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeSanitize, noteMarkdownSchema]]}
        components={{
          p: MarkdownParagraph,
          a: ({ className: linkClassName, ...props }) => (
            <a
              className={cn(
                "text-primary underline underline-offset-4 hover:text-primary/80",
                linkClassName,
              )}
              target="_blank"
              rel="noreferrer"
              {...props}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
