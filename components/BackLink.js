import Link from "next/link";

/**
 * Styled "back" link with an animated arrow. Used on the create/edit pages.
 */
export default function BackLink({ href = "/", children = "Back to notices" }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 shadow-sm transition hover:border-gray-300 hover:text-indigo-600"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M12.79 5.23a.75.75 0 0 1 0 1.06L9.06 10l3.73 3.71a.75.75 0 1 1-1.06 1.06l-4.25-4.24a.75.75 0 0 1 0-1.06l4.25-4.24a.75.75 0 0 1 1.06 0Z"
          clipRule="evenodd"
        />
      </svg>
      {children}
    </Link>
  );
}
