import { prisma } from "../../../lib/prisma";
import { validateNotice } from "../../../lib/validation";
import { buildNoticeQuery } from "../../../lib/notices";

// Collection endpoint:
//   GET  /api/notices  -> list notices (filtered + Urgent-first, all in the DB)
//                         optional query params: ?q=&category=&priority=
//   POST /api/notices  -> create a notice (with server-side validation)
export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      // Filtering and Urgent-first ordering are both done in the DB query,
      // not in JS, via the shared query builder.
      const notices = await prisma.notice.findMany(buildNoticeQuery(req.query));
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
