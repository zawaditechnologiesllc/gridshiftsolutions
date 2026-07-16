import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSupabase } from "@/lib/supabase/server";
import AdminNav from "@/components/admin/admin-nav";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await getServerSupabase();

  if (!supabase) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6">
        <h1 className="text-2xl font-bold">Admin is unavailable</h1>
        <p className="mt-3 text-slate-600">
          Supabase environment variables are not configured. See the README to
          connect the database, then run migrations 001 and 002.
        </p>
      </div>
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin");

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6">
        <h1 className="text-2xl font-bold">Not authorized</h1>
        <p className="mt-3 text-slate-600">
          Your account ({user.email}) doesn&apos;t have admin access. Ask an
          existing admin to add you, or run the grant statement in
          <code className="mx-1 font-mono text-sm">supabase/migrations/002</code>
          with your email.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex h-11 items-center rounded-sm bg-slate-900 px-5 text-sm font-semibold text-white hover:bg-teal-700"
        >
          Back to store
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:flex-row">
      <AdminNav email={user.email ?? ""} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
