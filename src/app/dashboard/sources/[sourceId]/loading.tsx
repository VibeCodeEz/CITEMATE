import { Card, CardContent } from "@/components/ui/card";

export default function SourceDetailsLoading() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="h-4 w-20 animate-pulse rounded-full bg-secondary" />
        <div className="h-12 w-2/3 animate-pulse rounded-2xl bg-secondary" />
        <div className="h-5 w-full animate-pulse rounded-2xl bg-secondary" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          {[0, 1, 2].map((index) => (
            <Card key={index} className="border-border/70 bg-card/90">
              <CardContent className="space-y-4 py-6">
                <div className="h-6 w-40 animate-pulse rounded-2xl bg-secondary" />
                <div className="h-24 animate-pulse rounded-[1.5rem] bg-secondary" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="border-border/70 bg-card/90">
          <CardContent className="space-y-4 py-6">
            <div className="h-8 w-52 animate-pulse rounded-2xl bg-secondary" />
            <div className="h-10 w-full animate-pulse rounded-[1.5rem] bg-secondary" />
            <div className="h-32 animate-pulse rounded-[1.5rem] bg-secondary" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
