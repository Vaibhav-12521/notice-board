import Link from "next/link";
import BackLink from "../../components/BackLink";
import NoticeForm from "../../components/NoticeForm";

export default function NewNotice() {
  return (
    <main className="min-h-screen">
      {/* Masthead */}
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="font-serif text-xl font-semibold tracking-tight text-stone-900">
            Notice Board
          </Link>
          <BackLink />
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <div className="mb-7 border-b border-stone-200 pb-5">
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-stone-900">
            New notice
          </h1>
          <p className="mt-1.5 text-sm text-stone-500">
            Fill in the details below. Fields marked <span className="text-red-500">*</span> are required.
          </p>
        </div>

        <NoticeForm mode="create" />
      </div>
    </main>
  );
}
