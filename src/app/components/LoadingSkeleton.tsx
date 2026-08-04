'use client';

export function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-slate-800/50 h-24 rounded-xl border border-slate-800"></div>
        ))}
      </div>

      {/* Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-slate-800/50 h-64 rounded-2xl border border-slate-800"></div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-800">
        <div className="h-6 w-32 bg-slate-700 rounded mb-4"></div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-slate-700/50 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
}