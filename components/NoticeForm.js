import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { CATEGORIES, PRIORITIES } from "../lib/validation";

// Turn an ISO date (or Date) into the yyyy-mm-dd value an <input type="date">
// expects. Returns "" when there is no usable date.
function toDateInputValue(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

/**
 * Shared create/edit form.
 *
 * @param {object|null} initialNotice existing notice when editing, else null
 * @param {string} mode "create" | "edit"
 */
export default function NoticeForm({ initialNotice = null, mode = "create" }) {
  const router = useRouter();

  const [form, setForm] = useState({
    title: initialNotice?.title ?? "",
    body: initialNotice?.body ?? "",
    category: initialNotice?.category ?? "General",
    priority: initialNotice?.priority ?? "Normal",
    publishDate: toDateInputValue(initialNotice?.publishDate) || toDateInputValue(new Date()),
    imageUrl: initialNotice?.imageUrl ?? "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [imageBroken, setImageBroken] = useState(false);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setErrors({});
    setFormError("");

    const isEdit = mode === "edit" && initialNotice;
    const endpoint = isEdit ? `/api/notices/${initialNotice.id}` : "/api/notices";
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        router.push(`/?flash=${isEdit ? "updated" : "created"}`);
        return;
      }

      const payload = await res.json().catch(() => ({}));
      if (payload.errors) {
        setErrors(payload.errors);
      } else {
        setFormError(payload.error || "Something went wrong. Please try again.");
      }
    } catch {
      setFormError("Could not reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {formError && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {formError}
        </p>
      )}

      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium text-gray-700">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          className={inputClass}
          placeholder="e.g. Mid-term exam schedule"
        />
        {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
      </div>

      <div>
        <label htmlFor="body" className="mb-1 block text-sm font-medium text-gray-700">
          Body <span className="text-red-500">*</span>
        </label>
        <textarea
          id="body"
          rows={5}
          value={form.body}
          onChange={(e) => update("body", e.target.value)}
          className={inputClass}
          placeholder="Write the notice details here..."
        />
        {errors.body && <p className="mt-1 text-xs text-red-600">{errors.body}</p>}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="category" className="mb-1 block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            id="category"
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
            className={inputClass}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {errors.category && <p className="mt-1 text-xs text-red-600">{errors.category}</p>}
        </div>

        <div>
          <label htmlFor="priority" className="mb-1 block text-sm font-medium text-gray-700">
            Priority
          </label>
          <select
            id="priority"
            value={form.priority}
            onChange={(e) => update("priority", e.target.value)}
            className={inputClass}
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          {errors.priority && <p className="mt-1 text-xs text-red-600">{errors.priority}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="publishDate" className="mb-1 block text-sm font-medium text-gray-700">
          Publish date <span className="text-red-500">*</span>
        </label>
        <input
          id="publishDate"
          type="date"
          value={form.publishDate}
          onChange={(e) => update("publishDate", e.target.value)}
          className={inputClass}
        />
        {errors.publishDate && <p className="mt-1 text-xs text-red-600">{errors.publishDate}</p>}
      </div>

      <div>
        <label htmlFor="imageUrl" className="mb-1 block text-sm font-medium text-gray-700">
          Image URL <span className="text-gray-400">(optional)</span>
        </label>
        <input
          id="imageUrl"
          type="url"
          value={form.imageUrl}
          onChange={(e) => {
            update("imageUrl", e.target.value);
            setImageBroken(false);
          }}
          className={inputClass}
          placeholder="https://example.com/image.jpg"
        />
        {errors.imageUrl && <p className="mt-1 text-xs text-red-600">{errors.imageUrl}</p>}

        {/* Live preview when a valid-looking image URL is entered */}
        {/^https?:\/\//i.test(form.imageUrl) && !imageBroken && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={form.imageUrl}
            alt="Preview"
            onError={() => setImageBroken(true)}
            className="mt-2 h-36 w-full rounded-md border border-gray-200 object-cover"
          />
        )}
        {imageBroken && (
          <p className="mt-1 text-xs text-gray-400">Could not load a preview for this URL.</p>
        )}
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {submitting ? "Saving..." : mode === "edit" ? "Update notice" : "Create notice"}
        </button>
        <Link
          href="/"
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
