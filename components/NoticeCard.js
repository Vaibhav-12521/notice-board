import { useEffect, useState } from "react";
import Link from "next/link";

const CATEGORY_STYLES = {
  Exam: "bg-purple-100 text-purple-700",
  Event: "bg-blue-100 text-blue-700",
  General: "bg-gray-100 text-gray-700",
};

// Gradient used as a placeholder banner for notices without an image, so every
// card has a consistent header.
const CATEGORY_GRADIENT = {
  Exam: "from-purple-500 to-indigo-500",
  Event: "from-blue-500 to-cyan-500",
  General: "from-slate-500 to-slate-600",
};

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// Deterministic, UTC-based date format so the server and the browser always
// produce the same string (no locale/timezone differences -> no hydration
// mismatch). publishDate is stored at UTC midnight, so UTC parts are correct.
function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

// Friendly relative label, e.g. "Today", "in 3 days", "2 days ago".
// Depends on "now", so it is only rendered on the client (after mount).
function relativeLabel(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const utcDay = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const now = new Date();
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const days = Math.round((utcDay - today) / 86400000);

  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days === -1) return "Yesterday";
  if (days > 1) return `in ${days} days`;
  return `${Math.abs(days)} days ago`;
}

export default function NoticeCard({ notice, onDelete }) {
  const isUrgent = notice.priority === "Urgent";

  // Render the absolute date on the server / first paint, then upgrade to the
  // relative label once mounted on the client. This avoids a hydration mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <article
      className={`flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition hover:shadow-md ${
        isUrgent ? "border-red-300 ring-1 ring-red-200" : "border-gray-200"
      }`}
    >
      {notice.imageUrl ? (
        // Plain <img> keeps remote, user-supplied URLs simple and avoids
        // next/image host configuration surprises on the free tier.
        // Lazy + async decoding keeps the list snappy with many images.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={notice.imageUrl}
          alt={notice.title}
          loading="lazy"
          decoding="async"
          className="h-40 w-full bg-gray-100 object-cover"
        />
      ) : (
        // Consistent header for notices without an image.
        <div
          className={`flex h-40 w-full items-center justify-center bg-gradient-to-br ${
            CATEGORY_GRADIENT[notice.category] || CATEGORY_GRADIENT.General
          }`}
        >
          <span className="text-xl font-bold uppercase tracking-widest text-white/80">
            {notice.category}
          </span>
        </div>
      )}

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              CATEGORY_STYLES[notice.category] || CATEGORY_STYLES.General
            }`}
          >
            {notice.category}
          </span>
          {isUrgent && (
            <span className="rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-semibold text-white">
              Urgent
            </span>
          )}
          <span
            className="ml-auto text-xs text-gray-500"
            title={formatDate(notice.publishDate)}
          >
            {mounted ? relativeLabel(notice.publishDate) : formatDate(notice.publishDate)}
          </span>
        </div>

        <h2 className="mb-1 text-lg font-semibold text-gray-900">
          {notice.title}
        </h2>
        <p className="mb-4 line-clamp-3 flex-1 whitespace-pre-line text-sm text-gray-600">
          {notice.body}
        </p>

        <div className="mt-auto flex items-center justify-between">
          <span className="text-xs text-gray-400">{formatDate(notice.publishDate)}</span>
          <div className="flex gap-2">
            <Link
              href={`/notices/${notice.id}/edit`}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Edit
            </Link>
            <button
              type="button"
              onClick={() => onDelete(notice)}
              className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
