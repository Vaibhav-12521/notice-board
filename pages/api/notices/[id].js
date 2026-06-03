import { prisma } from "../../../lib/prisma";
import { validateNotice } from "../../../lib/validation";

// Single-resource endpoint:
//   GET    /api/notices/:id  -> fetch one notice (used to prefill the edit form)
//   PUT    /api/notices/:id  -> update a notice (server-side validation)
//   DELETE /api/notices/:id  -> delete a notice
export default async function handler(req, res) {
  const { id } = req.query;

  try {
    if (req.method === "GET") {
      const notice = await prisma.notice.findUnique({ where: { id } });
      if (!notice) {
        return res.status(404).json({ error: "Notice not found." });
      }
      return res.status(200).json(notice);
    }

    if (req.method === "PUT" || req.method === "PATCH") {
      const existing = await prisma.notice.findUnique({ where: { id } });
      if (!existing) {
        return res.status(404).json({ error: "Notice not found." });
      }

      const { valid, errors, data } = validateNotice(req.body);
      if (!valid) {
        return res.status(400).json({ errors });
      }

      const notice = await prisma.notice.update({ where: { id }, data });
      return res.status(200).json(notice);
    }

    if (req.method === "DELETE") {
      const existing = await prisma.notice.findUnique({ where: { id } });
      if (!existing) {
        return res.status(404).json({ error: "Notice not found." });
      }

      await prisma.notice.delete({ where: { id } });
      return res.status(204).end();
    }

    res.setHeader("Allow", ["GET", "PUT", "PATCH", "DELETE"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed.` });
  } catch (err) {
    console.error(`[/api/notices/${id}]`, err);
    return res.status(500).json({ error: "Internal server error." });
  }
}
