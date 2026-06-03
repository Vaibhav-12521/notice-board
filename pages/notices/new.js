import Link from "next/link";
import NoticeForm from "../../components/NoticeForm";

export default function NewNotice() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Link href="/" className="text-sm text-indigo-600 hover:underline">
          &larr; Back to notices
        </Link>
        <h1 className="mb-6 mt-2 text-2xl font-bold text-gray-900">Add notice</h1>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <NoticeForm mode="create" />
        </div>
      </div>
    </main>
  );
}
