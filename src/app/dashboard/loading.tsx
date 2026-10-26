export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Top Banner Skeleton */}
      <div className="rounded-[2rem] border border-border/80 bg-card/60 p-6 shadow-sm backdrop-blur-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2.5">
            <div className="h-3.5 w-28 rounded-full bg-muted/80" />
            <div className="h-8 w-56 rounded-xl bg-muted" />
            <div className="h-4 w-80 max-w-full rounded-lg bg-muted/60" />
          </div>
          <div className="h-10 w-32 rounded-xl bg-muted" />
        </div>
      </div>

      {/* Content Skeleton: 4 stat cards or table representation */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="flex flex-col justify-between rounded-2xl border border-border/70 bg-card/60 p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 rounded-md bg-muted/80" />
              <div className="h-8 w-8 rounded-lg bg-muted/60" />
            </div>
            <div className="mt-4 space-y-2">
              <div className="h-7 w-20 rounded-lg bg-muted" />
              <div className="h-3 w-32 rounded-md bg-muted/50" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Table / Detail Section Skeleton */}
      <div className="rounded-[2rem] border border-border/70 bg-card/60 p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <div className="h-5 w-40 rounded-lg bg-muted/80" />
          <div className="h-9 w-64 rounded-xl bg-muted/60" />
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-xl bg-muted/30 p-3.5"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-muted" />
                <div className="space-y-1.5">
                  <div className="h-4 w-36 rounded-md bg-muted/80" />
                  <div className="h-3 w-24 rounded-md bg-muted/50" />
                </div>
              </div>
              <div className="h-6 w-16 rounded-full bg-muted/60" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
