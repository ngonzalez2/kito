export default function ListingsLoading() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 pb-20 pt-6 sm:px-6" role="status" aria-live="polite">
      <div className="h-8 w-48 rounded-full bg-sand/60" />
      <div className="flex flex-col gap-4 rounded-3xl bg-white/80 p-4 shadow-lg">
        <div className="h-4 w-32 rounded-full bg-sand/40" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-10 rounded-full bg-sand/30" />
          ))}
        </div>
      </div>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="animate-pulse rounded-3xl bg-white/80 p-6 shadow-inner">
            <div className="mb-4 h-48 rounded-3xl bg-sand/40" />
            <div className="h-4 w-3/4 rounded-full bg-sand/60" />
            <div className="mt-3 h-3 w-1/2 rounded-full bg-sand/40" />
            <div className="mt-4 h-3 w-full rounded-full bg-sand/20" />
          </div>
        ))}
      </div>
    </div>
  );
}
