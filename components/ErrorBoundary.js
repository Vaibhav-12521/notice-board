import { Component } from "react";
import Link from "next/link";

// Catches unexpected render errors anywhere in the app and shows a friendly,
// non-technical fallback instead of a blank or broken screen.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Log technical details for developers; the user never sees these.
    console.error("[ErrorBoundary]", error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-md text-center">
          <p className="font-serif text-5xl font-semibold tracking-tight text-stone-900">
            Oops!
          </p>
          <h1 className="mt-3 font-serif text-xl text-stone-700">Something went wrong</h1>
          <p className="mt-1.5 text-sm text-stone-500">
            Sorry about that — the page ran into a problem. Refreshing usually fixes it.
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-md bg-stone-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-stone-700"
            >
              Refresh the page
            </button>
            <Link
              href="/"
              onClick={() => this.setState({ hasError: false })}
              className="rounded-md border border-stone-300 px-4 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
            >
              Go to notices
            </Link>
          </div>
        </div>
      </main>
    );
  }
}
