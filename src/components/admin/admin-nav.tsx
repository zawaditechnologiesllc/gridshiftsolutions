"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BoltIcon, GridIcon, CartIcon, ArrowRightIcon } from "@/components/icons";
import SignOutButton from "@/components/sign-out-button";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: GridIcon, exact: true },
  { href: "/admin/products", label: "Products", icon: BoltIcon },
  { href: "/admin/products/new", label: "Add / Import", icon: ArrowRightIcon },
  { href: "/admin/orders", label: "Orders", icon: CartIcon },
];

export default function AdminNav({ email }: { email: string }) {
  const pathname = usePathname();

  return (
    <aside className="lg:w-60 lg:shrink-0">
      <div className="flex items-center gap-2.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-mark.svg" alt="" width={28} height={28} className="h-7 w-7" />
        <div>
          <p className="font-bold leading-tight">GridShift</p>
          <p className="font-mono text-[10px] uppercase tracking-wider text-teal-700">
            Admin Console
          </p>
        </div>
      </div>

      <nav className="mt-6 flex gap-2 overflow-x-auto lg:flex-col lg:gap-1">
        {LINKS.map((link) => {
          const active = link.exact
            ? pathname === link.href
            : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex shrink-0 items-center gap-2.5 rounded-sm px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-slate-900 text-white"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 hidden border-t border-slate-200 pt-4 lg:block">
        <p className="truncate font-mono text-xs text-slate-500" title={email}>
          {email}
        </p>
        <div className="mt-3 flex flex-col gap-2">
          <Link
            href="/"
            className="text-sm font-medium text-teal-700 hover:text-teal-800"
          >
            View store →
          </Link>
          <SignOutButton />
        </div>
      </div>
    </aside>
  );
}
