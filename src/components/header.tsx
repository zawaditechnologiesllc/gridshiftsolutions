"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { CartIcon, SearchIcon, UserIcon } from "./icons";

const NAV_LINKS = [
  { label: "Panels", href: "/products?category=panels" },
  { label: "Batteries", href: "/products?category=batteries" },
  { label: "Inverters", href: "/products?category=inverters" },
  { label: "Solutions", href: "/solutions" },
  { label: "Support", href: "/support" },
];

export default function Header() {
  const { count, ready } = useCart();
  const { user, configured } = useAuth();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-slate-50/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-mark.svg" alt="" width={30} height={30} className="h-[30px] w-[30px]" />
          <span className="text-lg font-bold tracking-tight">GridShift Solutions</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-700 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="transition-colors hover:text-teal-700"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <form
            className="relative hidden lg:block"
            onSubmit={(e) => {
              e.preventDefault();
              const q = new FormData(e.currentTarget).get("q")?.toString().trim();
              router.push(q ? `/products?q=${encodeURIComponent(q)}` : "/products");
            }}
          >
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="search"
              name="q"
              placeholder="Search systems..."
              className="h-9 w-56 rounded-sm border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-teal-600"
            />
          </form>

          <Link
            href="/cart"
            aria-label="Project cart"
            className="relative rounded-sm p-2 text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <CartIcon className="h-5 w-5" />
            {ready && count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-yellow-400 px-1 font-mono text-[10px] font-bold text-slate-900">
                {count}
              </span>
            )}
          </Link>

          <Link
            href={user ? "/account" : configured ? "/login" : "/account"}
            aria-label="Account"
            className="hidden items-center gap-2 rounded-sm p-2 text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 md:flex"
          >
            {user ? (
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 font-mono text-xs font-bold text-white">
                {(user.email ?? "U").slice(0, 1).toUpperCase()}
              </span>
            ) : (
              <UserIcon className="h-5 w-5" />
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
