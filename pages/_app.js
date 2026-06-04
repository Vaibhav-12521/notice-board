import "../styles/globals.css";
import Head from "next/head";
import ErrorBoundary from "../components/ErrorBoundary";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Notice Board</title>
        <meta name="description" content="A simple notice board built with Next.js and Prisma." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <ErrorBoundary>
        <Component {...pageProps} />
      </ErrorBoundary>
    </>
  );
}
