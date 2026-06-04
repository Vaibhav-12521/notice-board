import Link from "next/link";

// Friendly, on-brand 404. Shown when a notice no longer exists — e.g. pressing
// the browser back button onto a notice that was just deleted.
export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        <p className="font-serif text-6xl font-semibold tracking-tight text-stone-900">404</p>
        <h1 className="mt-3 font-serif text-xl text-stone-700">This notice isn’t here</h1>
        <p className="mt-1.5 text-sm text-stone-500">
          It may have been deleted, or the link is incorrect.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-md bg-stone-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-stone-700"
        >
          Back to notices
        </Link>
      </div>
    </main>
  );
}
