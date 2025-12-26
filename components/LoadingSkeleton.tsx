export function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse space-y-6">
          {/* Header skeleton */}
          <div className="h-12 bg-slate-800 rounded w-1/3 mb-8"></div>
          
          {/* Cards skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <div className="h-6 bg-slate-700 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-slate-700 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-slate-700 rounded w-2/3 mb-4"></div>
                <div className="h-10 bg-slate-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 animate-pulse">
      <div className="h-6 bg-slate-700 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-slate-700 rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-slate-700 rounded w-2/3 mb-4"></div>
      <div className="h-10 bg-slate-700 rounded"></div>
    </div>
  )
}

export function TableSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex space-x-4">
            <div className="h-12 bg-slate-700 rounded flex-1"></div>
            <div className="h-12 bg-slate-700 rounded w-32"></div>
            <div className="h-12 bg-slate-700 rounded w-32"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

