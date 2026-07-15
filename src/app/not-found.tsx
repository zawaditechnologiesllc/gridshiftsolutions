import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-28 text-center sm:px-6">
      <p className="font-mono text-xs uppercase tracking-wider text-slate-500">
        Error 404
      </p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight">Signal lost.</h1>
      <p className="mt-4 text-slate-600">
        The page you&apos;re looking for is off-grid. Let&apos;s get you back to a
        powered route.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex h-12 items-center rounded-sm bg-yellow-400 px-6 font-semibold text-slate-900 transition-colors hover:bg-yellow-300"
      >
        Back to Homepage
      </Link>
    </div>
  );
}
