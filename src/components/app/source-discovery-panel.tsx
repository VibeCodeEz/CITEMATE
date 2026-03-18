"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  BookOpenText,
  Database,
  ExternalLink,
  FileSearch,
  HeartPulse,
  SearchCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const discoverySources = [
  {
    name: "Google Scholar",
    href: "https://scholar.google.com/",
    category: "General discovery",
    summary:
      "Best starting point for most thesis topics across articles, theses, books, and conference papers.",
    bestFor: "Broad literature searches and finding related or newer studies.",
    icon: SearchCheck,
  },
  {
    name: "Crossref Metadata Search",
    href: "https://search.crossref.org/",
    category: "Citation metadata",
    summary:
      "Helpful when you already have a title or partial citation and want accurate DOI, journal, and author details.",
    bestFor: "Verifying bibliographic metadata before saving a source.",
    icon: Database,
  },
  {
    name: "DOAJ",
    href: "https://doaj.org/",
    category: "Open access",
    summary:
      "Strong directory for peer-reviewed open-access journals that users can actually read without a paywall.",
    bestFor: "Free full-text journal articles.",
    icon: BookOpenText,
  },
  {
    name: "PubMed",
    href: "https://pubmed.ncbi.nlm.nih.gov/",
    category: "Health and life sciences",
    summary:
      "Excellent for medicine, biology, nursing, psychology, public health, and related thesis topics.",
    bestFor: "Biomedical citations and discipline-specific literature searching.",
    icon: HeartPulse,
  },
  {
    name: "PubMed Central",
    href: "https://pmc.ncbi.nlm.nih.gov/",
    category: "Free full text",
    summary:
      "Useful when PubMed gives you the citation but you still need the full biomedical or life sciences article.",
    bestFor: "Open full-text biomedical papers.",
    icon: FileSearch,
  },
  {
    name: "OpenAlex",
    href: "https://openalex.org/",
    category: "Research mapping",
    summary:
      "Large open scholarly catalog for tracing works, authors, institutions, and related research paths.",
    bestFor: "Literature discovery, relationship tracing, and topic mapping.",
    icon: ExternalLink,
  },
] as const;

export function SourceDiscoveryPanel() {
  return (
    <Card className="border-border/70 bg-card/90">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            New
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Source discovery
          </Badge>
        </div>
        <div className="space-y-2">
          <CardTitle className="font-serif text-3xl tracking-tight">
            Best places to find RRL or RLL sources
          </CardTitle>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            Use these research databases and indexes to find literature first,
            then bring the best sources back into CiteMate with a DOI or URL for
            faster metadata lookup.
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 xl:grid-cols-2">
          {discoverySources.map((source) => {
            const Icon = source.icon;

            return (
              <Link
                key={source.name}
                href={source.href}
                target="_blank"
                rel="noreferrer"
                className="rounded-[1.5rem] border border-border/80 bg-secondary/20 p-5 transition-colors hover:bg-secondary/35"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-background shadow-sm">
                      <Icon className="size-5 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{source.name}</p>
                        <Badge variant="outline" className="rounded-full">
                          {source.category}
                        </Badge>
                      </div>
                      <p className="text-sm leading-6 text-muted-foreground">
                        {source.summary}
                      </p>
                      <p className="text-xs leading-5 text-muted-foreground">
                        Best for: {source.bestFor}
                      </p>
                    </div>
                  </div>
                  <ArrowUpRight className="mt-1 size-4 shrink-0 text-muted-foreground" />
                </div>
              </Link>
            );
          })}
        </div>
        <div className="rounded-[1.5rem] border border-border/80 bg-background/70 p-4">
          <p className="text-sm font-medium">Recommended category in the product</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Treat this as a <span className="font-medium text-foreground">Source discovery</span> feature
            inside the broader <span className="font-medium text-foreground">Research workflow</span> category.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
