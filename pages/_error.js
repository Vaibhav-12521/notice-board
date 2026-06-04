import Link from "next/link";

// Friendly, non-technical page shown for server errors (e.g. a 500) instead of
// Next.js's bare default error screen.
function ErrorPage({ statusCode }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <p className="font-serif text-5xl font-semibold tracking-tight text-stone-900">
          {statusCode ? `Error ${statusCode}` : "Error"}
        </p>
        <h1 className="mt-3 font-serif text-xl text-stone-700">Something went wrong</h1>
        <p className="mt-1.5 text-sm text-stone-500">
          We hit a snag loading this page. Please try again in a moment.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-md bg-stone-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-stone-700"
        >
          Back to notices
        </Link>
      </div>
    </main>
  );
}

ErrorPage.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default ErrorPage;
