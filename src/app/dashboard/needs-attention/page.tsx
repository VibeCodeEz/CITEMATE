import { EmptyState } from "@/components/app/empty-state";
import { NeedsAttentionBoard } from "@/components/app/needs-attention-board";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getNeedsAttentionData } from "@/lib/data/citemate";

export default async function NeedsAttentionPage() {
  const { reminders, summary } = await getNeedsAttentionData();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Research cleanup"
        title="Needs attention"
        description="Review missing citation details and incomplete source metadata before those gaps slow you down later."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/70 bg-card/90">
          <CardContent className="space-y-2 py-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Active reminders
            </p>
            <p className="font-serif text-4xl tracking-tight">{summary.total}</p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/90">
          <CardContent className="space-y-2 py-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Missing abstracts
            </p>
            <p className="font-serif text-4xl tracking-tight">{summary.withAbstractReminder}</p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/90">
          <CardContent className="space-y-2 py-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Missing links
            </p>
            <p className="font-serif text-4xl tracking-tight">{summary.withLinkReminder}</p>
          </CardContent>
        </Card>
      </section>

      {reminders.length === 0 ? (
        <EmptyState
          title="Nothing needs attention right now"
          description="Your saved sources look complete enough to keep moving. If details go missing later, reminders will appear here."
        />
      ) : (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-full">
              {reminders.length} reminder{reminders.length === 1 ? "" : "s"}
            </Badge>
          </div>
          <NeedsAttentionBoard reminders={reminders} />
        </section>
      )}
    </div>
  );
}
