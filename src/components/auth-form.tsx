"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase/client";

const inputClass =
  "h-11 w-full rounded-sm border border-slate-300 bg-white px-3 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-teal-600";

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const supabase = getBrowserSupabase();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/account";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!supabase) {
    return (
      <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-6 text-sm leading-6 text-slate-800">
        <p className="font-semibold">Authentication is not configured yet.</p>
        <p className="mt-2">
          Set <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in your
          environment to enable accounts. See the README for setup steps.
        </p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setSubmitting(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase!.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
          },
        });
        if (error) throw error;
        if (data.session) {
          router.push(next);
          router.refresh();
        } else {
          setNotice(
            "Check your inbox — we sent a confirmation link to finish creating your account."
          );
        }
      } else {
        const { error } = await supabase!.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push(next);
        router.refresh();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Authentication failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-slate-200 bg-white p-6 md:p-8"
    >
      <div className="grid gap-5">
        {mode === "signup" && (
          <div>
            <label className="font-mono text-xs text-slate-600" htmlFor="fullName">
              Full Name
            </label>
            <input
              id="fullName"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={`${inputClass} mt-1.5`}
              placeholder="Johnathan Miller"
            />
          </div>
        )}
        <div>
          <label className="font-mono text-xs text-slate-600" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`${inputClass} mt-1.5`}
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="font-mono text-xs text-slate-600" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${inputClass} mt-1.5`}
            placeholder="Minimum 8 characters"
          />
        </div>

        {error && (
          <p className="rounded-sm border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}
        {notice && (
          <p className="rounded-sm border border-teal-200 bg-teal-50 p-3 text-sm text-teal-800">
            {notice}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="flex h-12 items-center justify-center rounded-sm bg-yellow-400 font-semibold text-slate-900 transition-colors hover:bg-yellow-300 disabled:opacity-60"
        >
          {submitting
            ? "Working…"
            : mode === "signup"
              ? "Create Account"
              : "Sign In"}
        </button>
      </div>

      <p className="mt-6 text-center text-sm text-slate-600">
        {mode === "signup" ? (
          <>
            Already have an account?{" "}
            <Link
              href={`/login?next=${encodeURIComponent(next)}`}
              className="font-semibold text-teal-700 hover:text-teal-800"
            >
              Sign in
            </Link>
          </>
        ) : (
          <>
            New to GridShift?{" "}
            <Link
              href={`/signup?next=${encodeURIComponent(next)}`}
              className="font-semibold text-teal-700 hover:text-teal-800"
            >
              Create an account
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
