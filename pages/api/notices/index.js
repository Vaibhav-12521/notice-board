import { prisma } from "../../../lib/prisma";
import { validateNotice } from "../../../lib/validation";

// Collection endpoint:
//   GET  /api/notices  -> list all notices (Urgent first, ordered in the DB)
//   POST /api/notices  -> create a notice (with server-side validation)
export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const notices = await prisma.notice.findMany({
        // Urgent-first ordering is done in the database query, not in JS.
        // `priority` desc puts Urgent above Normal; newest publishDate first
        // is the chosen order within each priority group.
        orderBy: [{ priority: "desc" }, { publishDate: "desc" }],
      });
      return res.status(200).json(notices);
    }

    if (req.method === "POST") {
      const { valid, errors, data } = validateNotice(req.body);
      if (!valid) {
        return res.status(400).json({ errors });
      }

      const notice = await prisma.notice.create({ data });
      return res.status(201).json(notice);
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed.` });
  } catch (err) {
    console.error("[/api/notices]", err);
    return res.status(500).json({ error: "Internal server error." });
  }
}
