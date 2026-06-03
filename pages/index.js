import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { prisma } from "../lib/prisma";
import { buildNoticeQuery, readFilters } from "../lib/notices";
import NoticeCard from "../components/NoticeCard";
import NoticeFilters from "../components/NoticeFilters";
import Toast from "../components/Toast";

export default function Home({ notices, filters }) {
  const router = useRouter();
  const [target, setTarget] = useState(null); // notice pending delete confirmation
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [navLoading, setNavLoading] = useState(false);

  const hasActiveFilter = Boolean(filters.q || filters.category || filters.priority);

  // Loading indicator while navigating (filter changes, delete refresh).
  useEffect(() => {
    const start = () => setNavLoading(true);
    const done = () => setNavLoading(false);
    router.events.on("routeChangeStart", start);
    router.events.on("routeChangeComplete", done);
    router.events.on("routeChangeError", done);
    return () => {
      router.events.off("routeChangeStart", start);
      router.events.off("routeChangeComplete", done);
      router.events.off("routeChangeError", done);
    };
  }, [router]);

  // Show a toast after a create/update redirect (?flash=created|updated), then
  // strip the param from the URL so it doesn't re-fire on refresh.
  useEffect(() => {
    const flash = router.query.flash;
    if (!flash) return;
    if (flash === "created") setToast({ type: "success", message: "Notice created." });
    else if (flash === "updated") setToast({ type: "success", message: "Notice updated." });

    const { flash: _omit, ...rest } = router.query;
    router.replace({ pathname: "/", query: rest }, undefined, { shallow: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.flash]);

  async function confirmDelete() {
    if (!target) return;
    setDeleting(true);
    setError("");
    try {
      const res = await fetch(`/api/notices/${target.id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error || "Failed to delete notice.");
      }
      setTarget(null);
      setToast({ type: "success", message: "Notice deleted." });
      router.replace(router.asPath); // re-run getServerSideProps
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notice Board</h1>
            <p className="text-sm text-gray-500">
              {notices.length} {notices.length === 1 ? "notice" : "notices"}
              {hasActiveFilter ? " match your filters" : " · Urgent shown first"}
            </p>
          </div>
          <Link
            href="/notices/new"
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            + Add notice
          </Link>
        </header>

        <NoticeFilters filters={filters} />

        {navLoading ? (
          // Lightweight skeleton grid while the server responds.
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-44 animate-pulse rounded-xl border border-gray-200 bg-white"
              />
            ))}
          </div>
        ) : notices.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
            {hasActiveFilter ? (
              <>
                <p className="text-gray-600">No notices match your filters.</p>
                <button
                  type="button"
                  onClick={() => router.push({ pathname: "/" })}
                  className="mt-2 text-sm font-medium text-indigo-600 hover:underline"
                >
                  Clear filters
                </button>
              </>
            ) : (
              <>
                <p className="text-gray-600">No notices yet.</p>
                <Link
                  href="/notices/new"
                  className="mt-2 inline-block text-sm font-medium text-indigo-600 hover:underline"
                >
                  Create the first one
                </Link>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {notices.map((notice) => (
              <NoticeCard key={notice.id} notice={notice} onDelete={setTarget} />
            ))}
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      {target && (
        <div
          className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => !deleting && setTarget(null)}
        >
          <div
            className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-gray-900">Delete notice?</h2>
            <p className="mt-1 text-sm text-gray-600">
              &ldquo;{target.title}&rdquo; will be permanently removed. This cannot be undone.
            </p>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setTarget(null);
                  setError("");
                }}
                disabled={deleting}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
      )}
    </main>
  );
}

// Read happens server-side through Prisma. Filtering and Urgent-first ordering
// are the DB query's responsibility (buildNoticeQuery), not client-side sorting.
export async function getServerSideProps({ query }) {
  const notices = await prisma.notice.findMany(buildNoticeQuery(query));

  // Dates are not JSON-serialisable, so convert them to ISO strings for props.
  const serialised = notices.map((n) => ({
    ...n,
    publishDate: n.publishDate.toISOString(),
    createdAt: n.createdAt.toISOString(),
    updatedAt: n.updatedAt.toISOString(),
  }));

  return { props: { notices: serialised, filters: readFilters(query) } };
}
