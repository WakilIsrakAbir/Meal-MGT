// Shown instantly while a page loads its data, so clicks feel immediate.
function Block({ className }) {
  return <div className={`animate-pulse rounded-xl bg-zinc-200/70 ${className}`} />;
}

export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <div className="mb-8 space-y-3">
        <Block className="h-7 w-48" />
        <Block className="h-4 w-72" />
      </div>
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm">
            <Block className="h-4 w-24" />
            <Block className="mt-4 h-7 w-32" />
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm">
        <Block className="mb-6 h-5 w-40" />
        <div className="space-y-4">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <Block className="h-8 w-8 rounded-full" />
              <Block className="h-4 flex-1" />
              <Block className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
