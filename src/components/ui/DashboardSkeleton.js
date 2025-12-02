export default function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center">
        <div className="h-8 w-48 bg-slate-200 rounded-lg"></div>
      </div>

      {/* 4 Stat Cards Skeleton */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-32 rounded-3xl bg-white p-6 border border-slate-100 shadow-sm"
          >
            <div className="flex justify-between">
              <div className="space-y-3">
                <div className="h-4 w-24 bg-slate-200 rounded"></div>
                <div className="h-8 w-32 bg-slate-200 rounded"></div>
              </div>
              <div className="h-12 w-12 bg-slate-100 rounded-2xl"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Grafik Besar */}
        <div className="lg:col-span-2 h-[400px] bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
          <div className="h-6 w-40 bg-slate-200 rounded mb-8"></div>
          <div className="h-64 w-full bg-slate-100 rounded-xl"></div>
        </div>

        {/* Side Widget */}
        <div className="lg:col-span-1 h-[400px] bg-white rounded-3xl border border-slate-100 p-8 shadow-sm space-y-6">
          <div className="h-6 w-32 bg-slate-200 rounded"></div>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-12 w-12 bg-slate-100 rounded-2xl"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 w-full bg-slate-200 rounded"></div>
                <div className="h-3 w-1/2 bg-slate-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
