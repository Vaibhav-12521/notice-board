import { useEffect, useState } from "react";
import Link from "next/link";

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

  // Absolute date on the server / first paint, relative label after mount.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <article
      className={`flex flex-col overflow-hidden rounded-lg border border-stone-200 bg-white transition hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.18)] ${
        isUrgent ? "border-l-4 border-l-red-500" : ""
      }`}
    >
      {notice.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={notice.imageUrl}
          alt={notice.title}
          loading="lazy"
          decoding="async"
          className="h-40 w-full bg-stone-100 object-cover"
        />
      ) : (
        // Monochrome editorial placeholder for image-less notices.
        <div className="flex h-40 w-full items-center justify-center border-b border-stone-200 bg-stone-100">
          <span className="font-serif text-3xl italic text-stone-300">{notice.category}</span>
        </div>
      )}

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center gap-2.5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-500">
            {notice.category}
          </span>
          {isUrgent && (
            <span className="rounded-sm bg-red-600 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
              Urgent
            </span>
          )}
          <span
            className="ml-auto text-xs text-stone-400"
            title={formatDate(notice.publishDate)}
          >
            {mounted ? relativeLabel(notice.publishDate) : formatDate(notice.publishDate)}
          </span>
        </div>

        <h2 className="mb-1.5 font-serif text-lg font-semibold leading-snug text-stone-900">
          {notice.title}
        </h2>
        <p className="mb-4 line-clamp-3 flex-1 whitespace-pre-line text-sm leading-relaxed text-stone-600">
          {notice.body}
        </p>

        <div className="mt-auto flex items-center justify-between border-t border-stone-100 pt-3">
          <span className="text-xs text-stone-400">{formatDate(notice.publishDate)}</span>
          <div className="flex gap-1">
            <Link
              href={`/notices/${notice.id}/edit`}
              className="rounded-md px-2.5 py-1.5 text-sm font-medium text-stone-600 transition hover:bg-stone-100 hover:text-stone-900"
            >
              Edit
            </Link>
            <button
              type="button"
              onClick={() => onDelete(notice)}
              className="rounded-md px-2.5 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
