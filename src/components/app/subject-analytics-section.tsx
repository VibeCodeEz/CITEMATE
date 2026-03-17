import { BarChart3, FolderKanban, Hash, NotebookPen } from "lucide-react";

import { EmptyState } from "@/components/app/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  AnalyticsBreakdownItem,
  WorkspaceAnalytics,
} from "@/lib/analytics/workspace";

type SubjectAnalyticsSectionProps = {
  analytics: WorkspaceAnalytics;
};

function OverviewStat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: typeof FolderKanban;
}) {
  return (
    <Card className="border-border/70 bg-card/90">
      <CardContent className="space-y-3 py-6">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-secondary/60">
          <Icon className="size-5 text-primary" />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            {label}
          </p>
          <p className="font-serif text-4xl tracking-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function BreakdownCard({
  title,
  description,
  items,
  emptyTitle,
  emptyDescription,
  showHash = false,
}: {
  title: string;
  description: string;
  items: AnalyticsBreakdownItem[];
  emptyTitle: string;
  emptyDescription: string;
  showHash?: boolean;
}) {
  return (
    <Card className="border-border/70 bg-card/90">
      <CardHeader className="space-y-1">
        <CardTitle className="font-serif text-3xl tracking-tight">{title}</CardTitle>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyState title={emptyTitle} description={emptyDescription} />
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.key} className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {item.color ? (
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                    ) : null}
                    <p className="text-sm font-medium">
                      {showHash ? `#${item.label.replace(/^#/, "")}` : item.label}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="rounded-full">
                      {item.count}
                    </Badge>
                    <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      {item.share}%
                    </span>
                  </div>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${Math.max(item.share, item.count > 0 ? 8 : 0)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function SubjectAnalyticsSection({
  analytics,
}: SubjectAnalyticsSectionProps) {
  const hasMeaningfulAnalytics =
    analytics.totalSources > 0 || analytics.totalSubjects > 0;

  if (!hasMeaningfulAnalytics) {
    return (
      <EmptyState
        title="Analytics will appear as you organize research"
        description="Add some sources, tags, and subjects first. Then CiteMate can show which classes have the most material and which tags you rely on most."
      />
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h2 className="font-serif text-3xl tracking-tight">Organization insights</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Quick patterns from your saved sources, subjects, tags, and notes.
          </p>
        </div>
        <Badge variant="outline" className="rounded-full">
          <BarChart3 className="mr-1 size-3.5" />
          Lightweight analytics
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <OverviewStat
          label="Tagged sources"
          value={`${analytics.taggedSources}/${analytics.totalSources}`}
          icon={Hash}
        />
        <OverviewStat
          label="Subjects with sources"
          value={analytics.subjectDistribution.filter((item) => item.count > 0).length}
          icon={FolderKanban}
        />
        <OverviewStat
          label="Subjects with notes"
          value={analytics.notesBySubject.filter((item) => item.count > 0).length}
          icon={NotebookPen}
        />
      </div>

      <div className="grid gap-4 2xl:grid-cols-2">
        <BreakdownCard
          title="Most-used tags"
          description="See which keywords show up most across your current research set."
          items={analytics.topTags}
          emptyTitle="No tag trends yet"
          emptyDescription="Add tags to your sources to surface recurring themes and topics."
          showHash
        />
        <BreakdownCard
          title="Sources by subject"
          description="Spot which classes or topics have the strongest source coverage."
          items={analytics.subjectDistribution}
          emptyTitle="No subject distribution yet"
          emptyDescription="Assign sources to subjects to compare your research coverage by class or theme."
        />
      </div>

      <div className="grid gap-4 2xl:grid-cols-2">
        <BreakdownCard
          title="Source type mix"
          description="Understand whether your library leans more on articles, books, websites, or reports."
          items={analytics.sourceTypeDistribution}
          emptyTitle="No source types yet"
          emptyDescription="Save a few sources and the source type distribution will appear here."
        />
        <BreakdownCard
          title="Notes by subject"
          description="Check which classes already have reading notes attached to their sources."
          items={analytics.notesBySubject}
          emptyTitle="No notes by subject yet"
          emptyDescription="Link notes to sources and we’ll show which subjects already have active note coverage."
        />
      </div>
    </section>
  );
}
