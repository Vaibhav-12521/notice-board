import { useState } from "react";
import { useRouter } from "next/router";
import { CATEGORIES, PRIORITIES } from "../lib/validation";

/**
 * Search + category/priority filter bar. Pushes the chosen filters into the URL
 * query string, which re-runs getServerSideProps so filtering stays on the
 * server. Initial values come from the `filters` prop (the current URL state).
 */
export default function NoticeFilters({ filters }) {
  const router = useRouter();
  const [q, setQ] = useState(filters.q || "");

  const hasActiveFilter = Boolean(filters.q || filters.category || filters.priority);

  // Build the next query, dropping empty values so the URL stays clean.
  function navigate(next) {
    const merged = {
      q: next.q ?? filters.q,
      category: next.category ?? filters.category,
      priority: next.priority ?? filters.priority,
    };
    const query = {};
    if (merged.q) query.q = merged.q;
    if (merged.category) query.category = merged.category;
    if (merged.priority) query.priority = merged.priority;
    router.push({ pathname: "/", query });
  }

  const selectClass =
    "rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          navigate({ q: q.trim() });
        }}
        className="flex flex-1 gap-2"
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
        <button
          type="submit"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
        >
          Search
        </button>
      </form>

      <div className="flex gap-2">
        <select
          value={filters.category}
          onChange={(e) => navigate({ category: e.target.value })}
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
          value={filters.priority}
          onChange={(e) => navigate({ priority: e.target.value })}
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
              router.push({ pathname: "/" });
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
