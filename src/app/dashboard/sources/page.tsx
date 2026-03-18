import Link from "next/link";
import { Search } from "lucide-react";

import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { SourceDiscoveryPanel } from "@/components/app/source-discovery-panel";
import { SourceFormDialog } from "@/components/app/source-form-dialog";
import { SourceImportDialog } from "@/components/app/source-import-dialog";
import { SourcesCollection } from "@/components/app/sources-collection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getSourcesData } from "@/lib/data/citemate";
import { citationStyleOptions, sourceTypeOptions } from "@/lib/validations/source";

type SourcesPageProps = {
  searchParams: Promise<{
    q?: string;
    subjectId?: string;
    year?: string;
    tag?: string;
    sourceType?: string;
    citationStylePreference?: string;
  }>;
};

export default async function SourcesPage({ searchParams }: SourcesPageProps) {
  const filters = await searchParams;
  const { sources, subjects, allSources, summary, availableYears, availableTags } =
    await getSourcesData(filters);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Library"
        title="Sources"
        description="Save, search, compare, and edit your references in one organized workspace with subjects, tags, citation preferences, and literature discovery."
        actions={
          <>
            <SourceImportDialog existingSources={allSources} />
            <SourceFormDialog subjects={subjects} existingSources={allSources} />
          </>
        }
      />
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card className="border-border/70 bg-card/90">
          <CardContent className="space-y-2 py-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Total sources
            </p>
            <p className="font-serif text-4xl tracking-tight">{summary.total}</p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/90">
          <CardContent className="space-y-2 py-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Filtered results
            </p>
            <p className="font-serif text-4xl tracking-tight">{summary.filtered}</p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/90">
          <CardContent className="space-y-2 py-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Tagged sources
            </p>
            <p className="font-serif text-4xl tracking-tight">{summary.tagged}</p>
          </CardContent>
        </Card>
      </section>
      <SourceDiscoveryPanel />
      <Card className="border-border/70 bg-card/90">
        <CardContent className="space-y-4 py-5">
          <form className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
            <div className="relative md:col-span-2 xl:col-span-2">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="q"
                defaultValue={filters.q}
                placeholder="Search title, authors, linked notes, DOI, URL, abstract, subjects, or tags"
                className="pl-9"
              />
            </div>
            <select
              name="subjectId"
              defaultValue={filters.subjectId ?? ""}
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="">All subjects</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
            <select
              name="sourceType"
              defaultValue={filters.sourceType ?? ""}
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="">All source types</option>
              {sourceTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              name="year"
              defaultValue={filters.year ?? ""}
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="">All years</option>
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <select
              name="citationStylePreference"
              defaultValue={filters.citationStylePreference ?? ""}
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="">All citation styles</option>
              {citationStyleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <Input
              name="tag"
              defaultValue={filters.tag}
              placeholder="Exact tag"
            />
            <div className="flex flex-wrap gap-2 xl:col-span-6">
              <Button type="submit" variant="outline">
                Apply filters
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/dashboard/sources">Clear</Link>
              </Button>
            </div>
          </form>
          {availableTags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {availableTags.slice(0, 10).map((tag) => (
                <Button key={tag} variant="outline" size="sm" asChild>
                  <Link href={`/dashboard/sources?tag=${encodeURIComponent(tag)}`}>
                    #{tag}
                  </Link>
                </Button>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>
      {sources.length === 0 ? (
        <EmptyState
          title="No sources found"
          description="Create your first source, use the discovery panel, or adjust the current filters to expand the list."
          action={
            <div className="flex flex-wrap gap-3">
              <SourceImportDialog existingSources={allSources} />
              <SourceFormDialog subjects={subjects} existingSources={allSources} />
            </div>
          }
        />
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-full">
              {summary.filtered} result{summary.filtered === 1 ? "" : "s"}
            </Badge>
            {filters.subjectId ? (
              <Badge variant="outline" className="rounded-full">
                Subject filter active
              </Badge>
            ) : null}
            {filters.sourceType ? (
              <Badge variant="outline" className="rounded-full">
                Source type filtered
              </Badge>
            ) : null}
          </div>
          <SourcesCollection sources={sources} subjects={subjects} />
        </div>
      )}
    </div>
  );
}
