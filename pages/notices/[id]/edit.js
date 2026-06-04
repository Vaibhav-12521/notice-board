import Link from "next/link";
import { prisma } from "../../../lib/prisma";
import BackLink from "../../../components/BackLink";
import NoticeForm from "../../../components/NoticeForm";

export default function EditNotice({ notice }) {
  return (
    <main className="min-h-screen">
      {/* Masthead */}
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4 sm:px-6">
          <BackLink />
          <Link href="/" className="font-serif text-xl font-semibold tracking-tight text-stone-900">
            Notice Board
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <div className="mb-7 border-b border-stone-200 pb-5">
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-stone-900">
            Edit notice
          </h1>
          <p className="mt-1.5 text-sm text-stone-500">
            Update the details below and save your changes.
          </p>
        </div>

        <NoticeForm mode="edit" initialNotice={notice} />
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
