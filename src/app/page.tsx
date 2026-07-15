import Link from "next/link";
import { getProducts } from "@/lib/catalog";
import SavingsModel from "@/components/savings-model";
import { ArrowRightIcon, BatteryIcon, BoltIcon, CheckIcon, PanelIcon } from "@/components/icons";

const TESTIMONIALS = [
  {
    quote:
      "The GridShift team approached our project with an engineering mindset. They didn't just sell us panels; they designed an optimized energy ecosystem for our manufacturing facility.",
    name: "Marcus Thorne",
    role: "Director of Operations, Aeroform",
  },
  {
    quote:
      "Seamless integration. The ShiftCore battery system took us through a 48-hour grid failure without a flicker. This is the independence we were looking for.",
    name: "Sarah Jenkins",
    role: "Residential Microgrid Owner",
  },
  {
    quote:
      "As a developer, I value precision. The Vertex panels have consistently outperformed their rated wattage, even in the coastal fog of the Pacific Northwest.",
    name: "David Chen",
    role: "Principal, Horizon Development",
  },
];

export default async function HomePage() {
  const products = await getProducts();
  const heroPanel = products.find((p) => p.slug === "gs-450-mono-max") ?? products[0];
  const heroBattery = products.find((p) => p.slug === "shiftcell-10-5");
  const heroInverter = products.find((p) => p.slug === "gridshift-inverter-7-6");

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-900 text-white">
        <div
          aria-hidden
          className="absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(80% 90% at 85% 10%, rgba(13,148,136,0.35) 0%, transparent 60%), radial-gradient(60% 70% at 15% 90%, rgba(250,204,21,0.18) 0%, transparent 55%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.08) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 md:py-32">
          <span className="inline-block bg-teal-700 px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-wider text-white">
            Tech Specs Available
          </span>
          <h1 className="mt-6 max-w-2xl text-4xl font-bold leading-tight tracking-tight md:text-5xl md:leading-[56px]">
            Engineered for Energy Independence.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-7 text-slate-300">
            High-performance solar and storage solutions designed for those who
            demand precision, reliability, and total control over their energy
            future.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/products?category=panels"
              className="flex h-12 items-center rounded-sm bg-yellow-400 px-6 font-semibold text-slate-900 transition-colors hover:bg-yellow-300"
            >
              Switch to Solar
            </Link>
            <Link
              href="/support"
              className="flex h-12 items-center rounded-sm border border-slate-600 px-6 font-semibold text-white transition-colors hover:border-teal-500 hover:text-teal-300"
            >
              View Technical Documentation
            </Link>
          </div>
        </div>
      </section>

      {/* Core Components */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold leading-8">Core Components</h2>
            <p className="mt-1 text-slate-600">
              Industrial-grade hardware for residential applications.
            </p>
          </div>
          <Link
            href="/products"
            className="hidden items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-800 sm:flex"
          >
            See all <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-5">
          <Link
            href={`/products/${heroPanel.slug}`}
            className="group rounded-lg border border-slate-200 bg-white transition-colors hover:border-teal-600 lg:col-span-3"
          >
            <div className="relative border-b border-slate-100 bg-gradient-to-br from-teal-600/10 via-slate-50 to-yellow-400/10 p-8">
              <span className="absolute left-4 top-4 bg-slate-900 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-white">
                {heroPanel.specs.find((s) => s.label === "Efficiency")?.value ?? "22.8%"}{" "}
                Efficiency
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={heroPanel.image}
                alt={heroPanel.name}
                className="mx-auto h-56 w-full object-contain"
              />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold">{heroPanel.name}</h3>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                {heroPanel.description}
              </p>
              <div className="mt-5 grid grid-cols-3 divide-x divide-slate-200 rounded-sm bg-slate-100">
                {heroPanel.key_specs.map((s) => (
                  <div key={s.label} className="px-4 py-3">
                    <p className="font-mono text-[9px] uppercase tracking-wider text-slate-500">
                      {s.label}
                    </p>
                    <p className="mt-1 font-mono text-sm font-medium">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </Link>

          <div className="flex flex-col gap-6 lg:col-span-2">
            {heroBattery && (
              <Link
                href={`/products/${heroBattery.slug}`}
                className="group flex-1 rounded-lg border border-slate-200 bg-white transition-colors hover:border-teal-600"
              >
                <div className="relative border-b border-slate-100 bg-gradient-to-br from-teal-600/10 via-slate-50 to-yellow-400/10 p-6">
                  <span className="absolute right-4 top-4 bg-yellow-400 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-slate-900">
                    Stackable
                  </span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={heroBattery.image}
                    alt={heroBattery.name}
                    className="mx-auto h-32 object-contain"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold">ShiftCore Storage</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {heroBattery.capacity_kwh}kWh capacity per module. Integrated smart
                    thermal management.
                  </p>
                  <span className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-teal-700">
                    Technical Specs <ArrowRightIcon className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            )}
            {heroInverter && (
              <Link
                href={`/products/${heroInverter.slug}`}
                className="group rounded-lg border border-slate-200 bg-white p-6 transition-colors hover:border-teal-600"
              >
                <BoltIcon className="h-5 w-5 text-teal-700" />
                <h3 className="mt-3 text-lg font-semibold">Quantum Inverters</h3>
                <p className="mt-1 text-sm text-slate-600">
                  99.1% CEC efficiency with integrated rapid shutdown and module-level
                  monitoring.
                </p>
                <p className="mt-4 border-t border-slate-100 pt-3 font-mono text-xs text-slate-500">
                  NEMA 4X Rated
                </p>
              </Link>
            )}
          </div>
        </div>

        {/* Microgrid banner */}
        <div className="mt-6 grid overflow-hidden rounded-lg bg-slate-900 text-white md:grid-cols-2">
          <div className="p-8 md:p-10">
            <h3 className="text-xl font-semibold text-teal-300">Microgrid Solutions</h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-300">
              Custom-engineered systems for off-grid luxury estates and
              mission-critical remote infrastructure.
            </p>
            <Link
              href="/solutions"
              className="mt-6 inline-flex h-11 items-center rounded-sm bg-teal-700 px-5 text-sm font-semibold transition-colors hover:bg-teal-600"
            >
              Request Design Consultation
            </Link>
          </div>
          <div
            aria-hidden
            className="min-h-40 bg-[radial-gradient(120%_120%_at_80%_20%,rgba(13,148,136,0.5)_0%,rgba(15,23,42,0.2)_50%),linear-gradient(135deg,#1e293b_0%,#0f172a_100%)]"
          >
            <div
              className="h-full w-full"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(148,163,184,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.12) 1px, transparent 1px)",
                backgroundSize: "32px 32px",
              }}
            />
          </div>
        </div>
      </section>

      {/* Model Your Independence */}
      <section className="bg-slate-100/70">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Model Your Independence.
            </h2>
            <p className="mt-4 max-w-lg leading-7 text-slate-600">
              Our proprietary estimation engine uses local utility rates, LIDAR
              topographical data, and 30-year weather patterns to calculate your
              exact ROI.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-slate-700">
              {[
                "Parcel-level solar irradiance mapping",
                "Automatic calculation of ITC and state-level credits",
                "30-year weather pattern modeling",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <CheckIcon className="h-4 w-4 text-teal-700" /> {item}
                </li>
              ))}
            </ul>
          </div>
          <SavingsModel />
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <p className="text-center text-xl font-semibold italic tracking-tight md:text-2xl">
          “Reliability isn&apos;t a feature, it&apos;s the foundation.”
        </p>
        <div className="mt-12 grid gap-8 border-t border-slate-200 pt-12 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure key={t.name}>
              <div className="flex gap-1 text-yellow-500" aria-label="5 out of 5 stars">
                {"★★★★★".split("").map((s, i) => (
                  <span key={i} aria-hidden>
                    {s}
                  </span>
                ))}
              </div>
              <blockquote className="mt-4 text-sm leading-6 text-slate-600">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-4 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 font-mono text-xs font-bold text-white">
                  {t.name.split(" ").map((n) => n[0]).join("")}
                </span>
                <span>
                  <span className="block text-sm font-medium">{t.name}</span>
                  <span className="block font-mono text-[10px] uppercase tracking-wider text-slate-500">
                    {t.role}
                  </span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Category quick links (mobile parity with design) */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 md:hidden">
        <h2 className="text-xl font-semibold">Core Components</h2>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            { label: "Panels", href: "/products?category=panels", icon: PanelIcon },
            { label: "Batteries", href: "/products?category=batteries", icon: BatteryIcon },
            { label: "Inverters", href: "/products?category=inverters", icon: BoltIcon },
          ].map((c) => (
            <Link
              key={c.label}
              href={c.href}
              className="flex flex-col items-center gap-2 rounded-lg border border-slate-200 bg-white py-5 transition-colors hover:border-teal-600"
            >
              <c.icon className="h-6 w-6 text-slate-700" />
              <span className="font-mono text-xs">{c.label}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
