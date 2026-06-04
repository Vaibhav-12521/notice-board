import Link from "next/link";
import { prisma } from "../../../lib/prisma";
import BackLink from "../../../components/BackLink";
import NoticeForm from "../../../components/NoticeForm";

export default function EditNotice({ notice }) {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2 text-base font-semibold text-gray-900">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600 text-xs font-bold text-white">
              N
            </span>
            Notice Board
          </Link>
          <BackLink />
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Edit notice</h1>
          <p className="mt-1 text-sm text-gray-500">
            Update the details below and save your changes.
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500" />
          <div className="p-6">
            <NoticeForm mode="edit" initialNotice={notice} />
          </div>
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
