export default function SourcesLoading() {
  return (
    <div className="space-y-6">
      <div className="h-24 animate-pulse rounded-[2rem] border border-border bg-background/70" />
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-[2rem] border border-border bg-background/70"
          />
        ))}
      </div>
      <div className="h-40 animate-pulse rounded-[2rem] border border-border bg-background/70" />
      <div className="grid gap-5">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-80 animate-pulse rounded-[2rem] border border-border bg-background/70"
          />
        ))}
      </div>
    </div>
  );
}
