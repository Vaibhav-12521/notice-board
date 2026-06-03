import Link from "next/link";
import { prisma } from "../../../lib/prisma";
import NoticeForm from "../../../components/NoticeForm";

export default function EditNotice({ notice }) {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Link href="/" className="text-sm text-indigo-600 hover:underline">
          &larr; Back to notices
        </Link>
        <h1 className="mb-6 mt-2 text-2xl font-bold text-gray-900">Edit notice</h1>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <NoticeForm mode="edit" initialNotice={notice} />
        </div>
      </div>
    </main>
  );
}

// Load the notice on the server so the form opens pre-filled with current values.
export async function getServerSideProps({ params }) {
  const notice = await prisma.notice.findUnique({ where: { id: params.id } });

  if (!notice) {
    return { notFound: true };
  }

  return {
    props: {
      notice: {
        ...notice,
        publishDate: notice.publishDate.toISOString(),
        createdAt: notice.createdAt.toISOString(),
        updatedAt: notice.updatedAt.toISOString(),
      },
    },
  };
}
