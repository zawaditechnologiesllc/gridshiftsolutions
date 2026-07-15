import type { Metadata } from "next";
import Link from "next/link";
import { BatteryIcon, BoltIcon, LeafIcon, PanelIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Solutions",
  description:
    "Custom-engineered energy systems for residential, commercial, and off-grid applications.",
};

const SOLUTIONS = [
  {
    icon: PanelIcon,
    title: "Residential Solar",
    body: "Rooftop arrays engineered from parcel-level irradiance data. Typical systems pay back in under 7 years while offsetting 90% of household consumption.",
    href: "/products?category=panels",
    cta: "Shop Panels",
  },
  {
    icon: BatteryIcon,
    title: "Whole-Home Storage",
    body: "LFP battery systems with sub-20ms transfer keep critical circuits live through multi-day outages, with EV charging headroom to spare.",
    href: "/products?category=batteries",
    cta: "Shop Storage",
  },
  {
    icon: BoltIcon,
    title: "Microgrid Solutions",
    body: "Custom-engineered systems for off-grid luxury estates and mission-critical remote infrastructure. Our engineers design, model, and commission end-to-end.",
    href: "/support",
    cta: "Request Design Consultation",
  },
];

export default function SolutionsPage() {
  return (
    <div>
      <section className="bg-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <span className="inline-block bg-teal-700 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider">
            Engineering-Led Design
          </span>
          <h1 className="mt-5 max-w-2xl text-4xl font-bold tracking-tight md:text-5xl">
            Systems, not products.
          </h1>
          <p className="mt-4 max-w-xl leading-7 text-slate-300">
            Every GridShift installation begins with load analysis, irradiance
            modeling, and incentive optimization — then we specify the hardware.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 md:grid-cols-3">
          {SOLUTIONS.map((s) => (
            <div
              key={s.title}
              className="flex flex-col rounded-lg border border-slate-200 bg-white p-7 transition-colors hover:border-teal-600"
            >
              <s.icon className="h-6 w-6 text-teal-700" />
              <h2 className="mt-4 text-xl font-semibold">{s.title}</h2>
              <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{s.body}</p>
              <Link
                href={s.href}
                className="mt-6 inline-flex h-11 items-center justify-center rounded-sm bg-slate-900 px-5 text-sm font-semibold text-white transition-colors hover:bg-teal-700"
              >
                {s.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section id="sustainability" className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="rounded-lg border border-slate-200 bg-white p-8 md:p-10">
          <div className="flex items-center gap-3">
            <LeafIcon className="h-6 w-6 text-teal-700" />
            <h2 className="text-2xl font-semibold">Sustainability Report</h2>
          </div>
          <p className="mt-4 max-w-2xl leading-7 text-slate-600">
            GridShift hardware is sustainably sourced and engineered for a 25+ year
            service life. Across our installed base, customers offset an estimated
            0.7 kg of CO2 for every kilowatt-hour produced — the equivalent of
            planting 40 trees per year for a typical residential array.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { label: "Installed Capacity", value: "48 MW" },
              { label: "CO2 Offset / Year", value: "31k Tons" },
              { label: "Avg. System Life", value: "25+ Yrs" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-sm bg-slate-100 p-5">
                <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                  {stat.label}
                </p>
                <p className="mt-1 text-2xl font-bold tracking-tight">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
