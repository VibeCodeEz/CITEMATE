import { Skeleton } from "@/components/ui/skeleton";

type DashboardPageSkeletonProps = {
  cards?: number;
};

export function DashboardPageSkeleton({
  cards = 6,
}: DashboardPageSkeletonProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Skeleton className="h-4 w-24 rounded-full" />
        <Skeleton className="h-12 w-72 rounded-2xl" />
        <Skeleton className="h-5 w-full max-w-2xl rounded-2xl" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: cards }).map((_, index) => (
          <div
            key={index}
            className="rounded-[2rem] border border-border/70 bg-card/80 p-6"
          >
            <Skeleton className="h-10 w-10 rounded-2xl" />
            <Skeleton className="mt-4 h-4 w-24 rounded-full" />
            <Skeleton className="mt-3 h-10 w-28 rounded-2xl" />
            <Skeleton className="mt-5 h-20 w-full rounded-[1.5rem]" />
          </div>
        ))}
      </div>
    </div>
  );
}
