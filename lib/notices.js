import { CATEGORIES, PRIORITIES } from "./validation";

/**
 * Build the Prisma query (where + orderBy) for listing notices from a set of
 * URL query params. Filtering and ordering both happen on the server, never in
 * the browser. Shared by the API route and the list page's getServerSideProps.
 *
 * Supported params: q (text search), category, priority.
 */
export function buildNoticeQuery(query = {}) {
  const q = typeof query.q === "string" ? query.q.trim() : "";
  const category = typeof query.category === "string" ? query.category : "";
  const priority = typeof query.priority === "string" ? query.priority : "";

  const where = {};

  if (CATEGORIES.includes(category)) {
    where.category = category;
  }
  if (PRIORITIES.includes(priority)) {
    where.priority = priority;
  }
  if (q) {
    // Case-insensitive search across title and body (Postgres supports `mode`).
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { body: { contains: q, mode: "insensitive" } },
    ];
  }

  return {
    where,
    // Urgent above Normal (DB-level), newest publishDate first within a group.
    orderBy: [{ priority: "desc" }, { publishDate: "desc" }],
  };
}

/** Normalise the raw query into clean filter values for the UI. */
export function readFilters(query = {}) {
  return {
    q: typeof query.q === "string" ? query.q : "",
    category: CATEGORIES.includes(query.category) ? query.category : "",
    priority: PRIORITIES.includes(query.priority) ? query.priority : "",
  };
}
