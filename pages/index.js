import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { prisma } from "../lib/prisma";
import { buildNoticeQuery, readFilters } from "../lib/notices";
import NoticeCard from "../components/NoticeCard";
import NoticeFilters from "../components/NoticeFilters";
import Toast from "../components/Toast";

export default function Home({ notices: initialNotices }) {
  const router = useRouter();
  const [allNotices, setAllNotices] = useState(initialNotices);
  const [filters, setFilters] = useState({ q: "", category: "", priority: "" });
  const [target, setTarget] = useState(null); // notice pending delete confirmation
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const didInit = useRef(false);

  const hasActiveFilter = Boolean(filters.q || filters.category || filters.priority);

  // Filtering happens instantly in the client over the already server-ordered
  // list — no network round-trip per keystroke. (Urgent-first ordering is still
  // done in the DB; this only narrows the ordered list, never re-sorts it.)
  const notices = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    return allNotices.filter((n) => {
      if (filters.category && n.category !== filters.category) return false;
      if (filters.priority && n.priority !== filters.priority) return false;
      if (q && !`${n.title} ${n.body}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [allNotices, filters]);

  // Keep filters in sync with the URL (deep links + browser back/forward).
  useEffect(() => {
    if (!router.isReady) return;
    setFilters(readFilters(router.query));
  }, [router.isReady, router.query.q, router.query.category, router.query.priority]);

  // Fetch the full, server-ordered list once on load to reconcile with live
  // data (beyond the static snapshot). Filtering then runs entirely client-side.
  useEffect(() => {
    if (!router.isReady) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/notices");
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (!cancelled) setAllNotices(data);
      } catch {
        /* keep the statically rendered snapshot if the refresh fails */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router.isReady]);

  // Show a toast after a create/update redirect (?flash=created|updated), then
  // strip the param from the URL so it doesn't re-fire on refresh.
  useEffect(() => {
    const flash = router.query.flash;
    if (!flash) return;
    if (flash === "created") setToast({ type: "success", message: "Notice published." });
    else if (flash === "updated") setToast({ type: "success", message: "Notice updated." });

    const { flash: _omit, ...rest } = router.query;
    router.replace({ pathname: "/", query: rest }, undefined, { shallow: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.flash]);

  // Filter changes apply instantly (state) and sync to the URL for shareable
  // links. `replace` avoids polluting history while typing a search.
  function handleFilterChange(partial) {
    const next = { ...filters, ...partial };
    setFilters(next);
    const params = new URLSearchParams();
    if (next.q) params.set("q", next.q);
    if (next.category) params.set("category", next.category);
    if (next.priority) params.set("priority", next.priority);
    const qs = params.toString();
    router.replace(`/${qs ? `?${qs}` : ""}`, undefined, { shallow: true });
  }

  function clearFilters() {
    setFilters({ q: "", category: "", priority: "" });
    router.replace("/", undefined, { shallow: true });
  }

  async function confirmDelete() {
    if (!target) return;
    setDeleting(true);
    setError("");
    try {
      const res = await fetch(`/api/notices/${target.id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) throw new Error("delete failed");
      setAllNotices((prev) => prev.filter((n) => n.id !== target.id));
      setTarget(null);
      setToast({ type: "success", message: "Notice deleted." });
    } catch {
      setError("Couldn't delete the notice. Please check your connection and try again.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        {/* Masthead */}
        <header className="mb-8">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-stone-900 pb-4">
            <div>
              <h1 className="font-serif text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
                Notice Board
              </h1>
              <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500">
                Exams &middot; Events &middot; General
              </p>
            </div>
            <Link
              href="/notices/new"
              className="rounded-md bg-stone-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-stone-700"
            >
              New notice
            </Link>
          </div>
          <p className="mt-3 text-sm text-stone-500">
            {`${notices.length} ${notices.length === 1 ? "notice" : "notices"}${
              hasActiveFilter ? " matching your filters" : " · urgent shown first"
            }`}
          </p>
        </header>

        <NoticeFilters value={filters} onChange={handleFilterChange} onClear={clearFilters} />

        {notices.length === 0 ? (
          <div className="rounded-lg border border-dashed border-stone-300 bg-white p-16 text-center">
            {hasActiveFilter ? (
              <>
                <p className="text-stone-600">No notices match your filters.</p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-2 text-sm font-medium text-stone-900 underline underline-offset-4 hover:text-stone-600"
                >
                  Clear filters
                </button>
              </>
            ) : (
              <>
                <p className="font-serif text-lg text-stone-700">The board is empty.</p>
                <Link
                  href="/notices/new"
                  className="mt-2 inline-block text-sm font-medium text-stone-900 underline underline-offset-4 hover:text-stone-600"
                >
                  Post the first notice
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
          className="fixed inset-0 z-10 flex items-center justify-center bg-stone-900/50 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => !deleting && setTarget(null)}
        >
          <div
            className="w-full max-w-sm rounded-lg border border-stone-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-serif text-xl font-semibold text-stone-900">Delete this notice?</h2>
            <p className="mt-1.5 text-sm text-stone-600">
              &ldquo;{target.title}&rdquo; will be permanently removed. This cannot be undone.
            </p>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setTarget(null);
                  setError("");
                }}
                disabled={deleting}
                className="rounded-md border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? "Deleting…" : "Delete"}
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

// Statically generated (served instantly from the CDN) and rebuilt in the
// background every 30s (ISR). Ordering is the DB query's job (buildNoticeQuery).
// The client reconciles to live data + URL filters on mount.
export async function getStaticProps() {
  try {
    const notices = await prisma.notice.findMany(buildNoticeQuery({}));

    const serialised = notices.map((n) => ({
      ...n,
      publishDate: n.publishDate.toISOString(),
      createdAt: n.createdAt.toISOString(),
      updatedAt: n.updatedAt.toISOString(),
    }));

    return { props: { notices: serialised }, revalidate: 30 };
  } catch (err) {
    // If the database is briefly unreachable at build/revalidation time, don't
    // fail the build — render an empty board and let the client fetch live data
    // on mount. The page will self-correct on the next revalidation.
    console.error("[getStaticProps] notice fetch failed:", err.message);
    return { props: { notices: [] }, revalidate: 10 };
  }
}
