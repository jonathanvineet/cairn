import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-forest-900 text-white">
      {/* Header skeleton */}
      <header className="border-b border-white/10 bg-forest-900/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-28 rounded-full" />
            <Skeleton className="h-6 w-32 rounded-full" />
            <Skeleton className="h-8 w-36 rounded-lg" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6 space-y-6">
        {/* Title */}
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="mt-2 h-4 w-80" />
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-3"
            >
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>

        {/* Map + Mission */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3 rounded-xl border border-white/10 bg-white/5 p-5">
            <Skeleton className="h-4 w-48 mb-3" />
            <Skeleton className="h-52 w-full rounded-lg" />
          </div>
          <div className="lg:col-span-2 rounded-xl border border-white/10 bg-white/5 p-5 space-y-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-36 w-full rounded-lg" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-2 w-full rounded-full" />
            <div className="flex gap-2">
              <Skeleton className="h-8 flex-1 rounded-lg" />
              <Skeleton className="h-8 flex-1 rounded-lg" />
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-4">
          <Skeleton className="h-4 w-32" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-3 w-3 rounded-full shrink-0 mt-1" />
              <div className="flex-1 space-y-2">
                <div className="flex gap-2">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-5 w-12 rounded-full" />
                  <Skeleton className="h-5 w-14 rounded-full" />
                </div>
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
