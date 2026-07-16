import Link from "next/link";

const COLUMNS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "Products",
    links: [
      { label: "Solar Panels", href: "/products?category=panels" },
      { label: "Storage Batteries", href: "/products?category=batteries" },
      { label: "Hybrid Inverters", href: "/products?category=inverters" },
      { label: "Mounting & Accessories", href: "/products?category=accessories" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Tax Credits", href: "/support#tax-credits" },
      { label: "Installation Guide", href: "/support#installation" },
      { label: "Sustainability Report", href: "/solutions#sustainability" },
      { label: "Warranty", href: "/support#warranty" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Contact Engineering", href: "/support" },
      { label: "Privacy Policy", href: "/support#privacy" },
      { label: "My Account", href: "/account" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[2fr_1fr_1fr_1fr]">
        <div className="max-w-xs">
          <div className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-mark.svg" alt="" width={28} height={28} className="h-7 w-7" />
            <p className="text-lg font-bold tracking-tight">GridShift Solutions</p>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Advanced energy engineering for residential and commercial
            independence. Sustainably sourced, technically superior.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.heading}>
            <p className="font-mono text-xs font-medium uppercase tracking-wider text-slate-500">
              {col.heading}
            </p>
            <ul className="mt-4 space-y-3 text-sm text-slate-700">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="transition-colors hover:text-teal-700">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-slate-200">
        <p className="mx-auto max-w-7xl px-4 py-6 text-sm text-slate-500 sm:px-6">
          © {new Date().getFullYear()} GridShift Solutions. Engineered for Independence.
        </p>
      </div>
    </footer>
  );
}
