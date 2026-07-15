"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { BoltIcon, CartIcon, GridIcon, UserIcon } from "./icons";

const TABS = [
  { label: "Shop", href: "/products", icon: GridIcon },
  { label: "Solutions", href: "/solutions", icon: BoltIcon },
  { label: "Cart", href: "/cart", icon: CartIcon },
  { label: "Account", href: "/account", icon: UserIcon },
];

export default function MobileNav() {
  const pathname = usePathname();
  const { count, ready } = useCart();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white md:hidden">
      <div className="grid grid-cols-4">
        {TABS.map((tab) => {
          const active =
            tab.href === "/products"
              ? pathname.startsWith("/products")
              : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.label}
              href={tab.href}
              className={`relative flex flex-col items-center gap-1 py-2.5 font-mono text-[10px] uppercase tracking-wide ${
                active ? "text-teal-700" : "text-slate-500"
              }`}
            >
              <tab.icon className="h-5 w-5" />
              {tab.label === "Cart" && ready && count > 0 && (
                <span className="absolute right-[22%] top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-yellow-400 px-1 text-[9px] font-bold text-slate-900">
                  {count}
                </span>
              )}
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
