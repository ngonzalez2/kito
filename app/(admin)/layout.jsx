export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-sand/20">
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">{children}</main>
    </div>
  );
}
