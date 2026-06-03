import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { prisma } from "../lib/prisma";
import { buildNoticeQuery, readFilters } from "../lib/notices";
import NoticeCard from "../components/NoticeCard";
import NoticeFilters from "../components/NoticeFilters";
import Toast from "../components/Toast";

export default function Home({ notices: initialNotices, filters: initialFilters }) {
  const router = useRouter();
  const [notices, setNotices] = useState(initialNotices);
  const [filters, setFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(false);
  const [target, setTarget] = useState(null); // notice pending delete confirmation
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  const hasActiveFilter = Boolean(filters.q || filters.category || filters.priority);

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

  // Fetch the (server-filtered) list from the API without a full page reload.
  async function fetchNotices(nextFilters) {
    const params = new URLSearchParams();
    if (nextFilters.q) params.set("q", nextFilters.q);
    if (nextFilters.category) params.set("category", nextFilters.category);
    if (nextFilters.priority) params.set("priority", nextFilters.priority);
    const qs = params.toString();

    setLoading(true);
    try {
      const res = await fetch(`/api/notices${qs ? `?${qs}` : ""}`);
      if (!res.ok) throw new Error();
      setNotices(await res.json());
      // Keep the URL in sync (shareable / back button) without re-running SSR.
      router.push(`/${qs ? `?${qs}` : ""}`, undefined, { shallow: true });
    } catch {
      setToast({ type: "error", message: "Could not load notices." });
    } finally {
      setLoading(false);
    }
  }

  function handleFilterChange(partial) {
    const next = { ...filters, ...partial };
    setFilters(next);
    fetchNotices(next);
  }

  function clearFilters() {
    const next = { q: "", category: "", priority: "" };
    setFilters(next);
    fetchNotices(next);
  }

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
      // Remove from local state immediately — no full reload needed.
      setNotices((prev) => prev.filter((n) => n.id !== target.id));
      setTarget(null);
      setToast({ type: "success", message: "Notice deleted." });
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
              {loading
                ? "Loading…"
                : `${notices.length} ${notices.length === 1 ? "notice" : "notices"}${
                    hasActiveFilter ? " match your filters" : " · Urgent shown first"
                  }`}
            </p>
          </div>
          <Link
            href="/notices/new"
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            + Add notice
          </Link>
        </header>

        <NoticeFilters value={filters} onChange={handleFilterChange} onClear={clearFilters} />

        {notices.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
            {hasActiveFilter ? (
              <>
                <p className="text-gray-600">No notices match your filters.</p>
                <button
                  type="button"
                  onClick={clearFilters}
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
          <div
            className={`grid grid-cols-1 gap-5 transition-opacity sm:grid-cols-2 lg:grid-cols-3 ${
              loading ? "pointer-events-none opacity-50" : ""
            }`}
          >
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

// Initial load is server-rendered through Prisma (fast first paint + deep-link
// support). Filtering and Urgent-first ordering are the DB query's job
// (buildNoticeQuery). Later filter changes fetch the same server-filtered API.
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
