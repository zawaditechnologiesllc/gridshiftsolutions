"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function SignOutButton() {
  const { signOut } = useAuth();
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={async () => {
        await signOut();
        router.push("/");
        router.refresh();
      }}
      className="h-10 rounded-sm border border-slate-300 px-4 text-sm font-semibold transition-colors hover:border-teal-600 hover:text-teal-700"
    >
      Sign Out
    </button>
  );
}
