import { useEffect, useState } from "react";
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
    // Left empty on the server; defaulted to "today" after mount (below) so the
    // statically-rendered create page doesn't cause a hydration mismatch.
    publishDate: toDateInputValue(initialNotice?.publishDate),
    imageUrl: initialNotice?.imageUrl ?? "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [imageBroken, setImageBroken] = useState(false);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  // On a fresh "create" form, default the publish date to today (client-side
  // only, to keep the statically-rendered page hydration-safe).
  useEffect(() => {
    if (mode === "create" && !form.publishDate) {
      update("publishDate", toDateInputValue(new Date()));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        // Field-level validation messages (already written for humans).
        setErrors(payload.errors);
      } else {
        setFormError("Something went wrong while saving. Please try again.");
      }
    } catch {
      setFormError("Couldn't reach the server. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-900 placeholder-stone-400 transition focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900";

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {formError && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {formError}
        </p>
      )}

      <div>
        <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-stone-700">
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
        <label htmlFor="body" className="mb-1.5 block text-sm font-medium text-stone-700">
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
          <label htmlFor="category" className="mb-1.5 block text-sm font-medium text-stone-700">
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
          <label htmlFor="priority" className="mb-1.5 block text-sm font-medium text-stone-700">
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
        <label htmlFor="publishDate" className="mb-1.5 block text-sm font-medium text-stone-700">
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
        <label htmlFor="imageUrl" className="mb-1.5 block text-sm font-medium text-stone-700">
          Image URL <span className="text-stone-400">(optional)</span>
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
            className="mt-2 h-36 w-full rounded-md border border-stone-200 object-cover"
          />
        )}
        {imageBroken && (
          <p className="mt-1 text-xs text-stone-400">Could not load a preview for this URL.</p>
        )}
      </div>

      <div className="flex items-center gap-3 border-t border-stone-100 pt-5">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-stone-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-stone-700 disabled:opacity-60"
        >
          {submitting ? "Saving…" : mode === "edit" ? "Update notice" : "Publish notice"}
        </button>
        <Link
          href="/"
          className="rounded-md px-4 py-2.5 text-sm font-medium text-stone-500 transition hover:text-stone-900"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
