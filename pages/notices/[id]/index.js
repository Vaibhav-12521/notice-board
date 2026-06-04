import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { prisma } from "../../../lib/prisma";
import BackLink from "../../../components/BackLink";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// Deterministic, UTC-based format (matches NoticeCard; hydration-safe).
function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

export default function NoticeDetail({ notice }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const isUrgent = notice.priority === "Urgent";

  async function handleDelete() {
    setDeleting(true);
    setError("");
    try {
      const res = await fetch(`/api/notices/${notice.id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error || "Failed to delete notice.");
      }
      router.push("/");
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  }

  return (
    <main className="min-h-screen">
      {/* Masthead */}
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4 sm:px-6">
          <BackLink />
          <Link href="/" className="font-serif text-xl font-semibold tracking-tight text-stone-900">
            Notice Board
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <div className="mb-3 flex items-center gap-2.5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-500">
            {notice.category}
          </span>
          {isUrgent && (
            <span className="rounded-sm bg-red-600 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
              Urgent
            </span>
          )}
          <span className="ml-auto text-sm text-stone-400">{formatDate(notice.publishDate)}</span>
        </div>

        <h1 className="font-serif text-3xl font-semibold leading-tight tracking-tight text-stone-900 sm:text-4xl">
          {notice.title}
        </h1>

        {notice.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={notice.imageUrl}
            alt={notice.title}
            className="mt-6 max-h-96 w-full rounded-lg border border-stone-200 object-cover"
          />
        )}

        <div className="mt-6 whitespace-pre-line text-base leading-relaxed text-stone-700">
          {notice.body}
        </div>

        <div className="mt-8 flex gap-2 border-t border-stone-200 pt-6">
          <Link
            href={`/notices/${notice.id}/edit`}
            className="rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-700"
          >
            Edit
          </Link>
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </article>

      {/* Delete confirmation dialog */}
      {confirming && (
        <div
          className="fixed inset-0 z-10 flex items-center justify-center bg-stone-900/50 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => !deleting && setConfirming(false)}
        >
          <div
            className="w-full max-w-sm rounded-lg border border-stone-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-serif text-xl font-semibold text-stone-900">Delete this notice?</h2>
            <p className="mt-1.5 text-sm text-stone-600">
              &ldquo;{notice.title}&rdquo; will be permanently removed. This cannot be undone.
            </p>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirming(false)}
                disabled={deleting}
                className="rounded-md border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

// Load the notice on the server so a direct link / refresh shows full content.
// Render fresh per request (no caching) so an edited or deleted notice is always
// reflected immediately — a removed notice 404s right away.
export async function getServerSideProps({ params, res }) {
  res.setHeader("Cache-Control", "no-store");

  const notice = await prisma.notice.findUnique({ where: { id: params.id } });

  if (!notice) {
    return { notFound: true };
  }

  return {
    props: {
      notice: {
        ...notice,
        publishDate: notice.publishDate.toISOString(),
        createdAt: notice.createdAt.toISOString(),
        updatedAt: notice.updatedAt.toISOString(),
      },
    },
  };
}
