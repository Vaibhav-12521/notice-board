import Link from "next/link";

const CATEGORY_STYLES = {
  Exam: "bg-purple-100 text-purple-700",
  Event: "bg-blue-100 text-blue-700",
  General: "bg-gray-100 text-gray-700",
};

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function NoticeCard({ notice, onDelete }) {
  const isUrgent = notice.priority === "Urgent";

  return (
    <article
      className={`flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition hover:shadow-md ${
        isUrgent ? "border-red-300 ring-1 ring-red-200" : "border-gray-200"
      }`}
    >
      {notice.imageUrl && (
        // Plain <img> keeps remote, user-supplied URLs simple and avoids
        // next/image host configuration surprises on the free tier.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={notice.imageUrl}
          alt={notice.title}
          className="h-40 w-full object-cover"
        />
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
          <span className="ml-auto text-xs text-gray-500">
            {formatDate(notice.publishDate)}
          </span>
        </div>

        <h2 className="mb-1 text-lg font-semibold text-gray-900">
          {notice.title}
        </h2>
        <p className="mb-4 flex-1 whitespace-pre-line text-sm text-gray-600">
          {notice.body}
        </p>

        <div className="mt-auto flex gap-2">
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
    </article>
  );
}
