import { useEffect, useRef, useState } from "react";
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
  const firstRun = useRef(true);

  // Debounce the text search (350ms) so we don't hit the API on every keypress.
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    const timer = setTimeout(() => onChange({ q: q.trim() }), 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const hasActiveFilter = Boolean(value.q || value.category || value.priority);

  const selectClass =
    "rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onChange({ q: q.trim() });
        }}
        className="flex-1"
        role="search"
      >
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search notices..."
          aria-label="Search notices"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </form>

      <div className="flex gap-2">
        <select
          value={value.category}
          onChange={(e) => onChange({ category: e.target.value })}
          aria-label="Filter by category"
          className={selectClass}
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
          className={selectClass}
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
            className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
