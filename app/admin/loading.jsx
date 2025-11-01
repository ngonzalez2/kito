export default function AdminLoading() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 pb-16 pt-10" role="status" aria-live="polite">
      <div className="h-8 w-60 self-center rounded-full bg-sand/60" />
      <div className="flex flex-col gap-4 rounded-3xl bg-white/80 p-6 shadow-lg">
        <div className="h-4 w-40 rounded-full bg-sand/50" />
        <div className="h-3 w-32 rounded-full bg-sand/30" />
      </div>
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="animate-pulse rounded-3xl bg-white/70 p-6 shadow-inner">
          <div className="h-4 w-1/3 rounded-full bg-sand/60" />
          <div className="mt-4 h-3 w-1/2 rounded-full bg-sand/40" />
          <div className="mt-6 h-24 rounded-3xl bg-sand/30" />
        </div>
      ))}
    </div>
  );
}
