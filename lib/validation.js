// Server-side validation for notices.
// This runs inside the API routes so the rules hold even if the browser is
// bypassed. The same constants are imported by the form for the UI dropdowns.

export const CATEGORIES = ["Exam", "Event", "General"];
export const PRIORITIES = ["Normal", "Urgent"];

/**
 * Validate and normalise a notice payload coming from the client.
 *
 * @param {object} input raw request body
 * @returns {{ valid: boolean, errors: object, data?: object }}
 *   On success, `data` holds cleaned values ready for Prisma.
 */
export function validateNotice(input) {
  const errors = {};
  const body = input && typeof input === "object" ? input : {};

  // title — required, non-empty after trimming
  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) {
    errors.title = "Title is required.";
  } else if (title.length > 200) {
    errors.title = "Title must be 200 characters or fewer.";
  }

  // body — required, non-empty after trimming
  const text = typeof body.body === "string" ? body.body.trim() : "";
  if (!text) {
    errors.body = "Body is required.";
  }

  // category — must be one of the allowed values
  const category = typeof body.category === "string" ? body.category : "";
  if (!CATEGORIES.includes(category)) {
    errors.category = `Category must be one of: ${CATEGORIES.join(", ")}.`;
  }

  // priority — must be one of the allowed values
  const priority = typeof body.priority === "string" ? body.priority : "";
  if (!PRIORITIES.includes(priority)) {
    errors.priority = `Priority must be one of: ${PRIORITIES.join(", ")}.`;
  }

  // publishDate — required and must be a valid date
  const rawDate = body.publishDate;
  let publishDate = null;
  if (!rawDate) {
    errors.publishDate = "Publish date is required.";
  } else {
    const parsed = new Date(rawDate);
    if (Number.isNaN(parsed.getTime())) {
      errors.publishDate = "Publish date must be a valid date.";
    } else {
      publishDate = parsed;
    }
  }

  // imageUrl — optional. If present it must be a valid http(s) URL.
  let imageUrl = null;
  if (body.imageUrl !== undefined && body.imageUrl !== null) {
    const raw = String(body.imageUrl).trim();
    if (raw) {
      try {
        const url = new URL(raw);
        if (url.protocol !== "http:" && url.protocol !== "https:") {
          errors.imageUrl = "Image URL must start with http:// or https://.";
        } else {
          imageUrl = raw;
        }
      } catch {
        errors.imageUrl = "Image URL must be a valid URL.";
      }
    }
  }

  const valid = Object.keys(errors).length === 0;

  return {
    valid,
    errors,
    data: valid
      ? { title, body: text, category, priority, publishDate, imageUrl }
      : undefined,
  };
}
