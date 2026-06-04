import { useEffect, useState } from "react";
import { CATEGORIES, PRIORITIES } from "../lib/validation";

/**
 * Search + category/priority filter bar.
 *
 * Calls `onChange(partialFilters)` so the parent can fetch from the API
 * (which still filters in the database) without a full page reload. The text
 * search is debounced so it filters live as you type.
 *
 * @param {{ value: {q:string,category:string,priority:string}, onChange: (p:object)=>void, onClear: ()=>void }} props
 */
export default function NoticeFilters({ value, onChange, onClear }) {
  const [q, setQ] = useState(value.q || "");

  // Keep the input in sync when the URL changes externally (e.g. browser
  // back/forward, the Clear button, or the page reconciling on load).
  useEffect(() => {
    setQ(value.q || "");
  }, [value.q]);

  // Debounce the text search (350ms). Only fire when the input actually differs
  // from what's already in the URL — this avoids redundant requests AND ensures
  // clearing the box (including the native × button) resets the list.
  useEffect(() => {
    if (q.trim() === (value.q || "")) return;
    const timer = setTimeout(() => onChange({ q: q.trim() }), 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const hasActiveFilter = Boolean(value.q || value.category || value.priority);

  const fieldClass =
    "rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 transition focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900";

  return (
    <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onChange({ q: q.trim() });
        }}
        className="relative flex-1"
        role="search"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
            clipRule="evenodd"
          />
        </svg>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search notices…"
          aria-label="Search notices"
          className={`w-full rounded-md border border-stone-300 bg-white py-2 pl-9 pr-3 text-sm text-stone-900 transition focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900`}
        />
      </form>

      <div className="flex gap-2">
        <select
          value={value.category}
          onChange={(e) => onChange({ category: e.target.value })}
          aria-label="Filter by category"
          className={fieldClass}
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={value.priority}
          onChange={(e) => onChange({ priority: e.target.value })}
          aria-label="Filter by priority"
          className={fieldClass}
        >
          <option value="">All priorities</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        {hasActiveFilter && (
          <button
            type="button"
            onClick={() => {
              setQ("");
              onClear();
            }}
            className="rounded-md px-3 py-2 text-sm font-medium text-stone-500 transition hover:text-stone-900"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
