import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support",
  description:
    "Technical documentation, warranty coverage, and engineering support for GridShift systems.",
};

const SECTIONS = [
  {
    id: "installation",
    title: "Installation Guide",
    body: "Every system ships with a roof-specific engineering packet: structural attachment plan, string sizing, and rapid-shutdown wiring diagrams. Certified installer network available in all 50 states. Download the comprehensive technical PDF from your account after purchase.",
  },
  {
    id: "tax-credits",
    title: "Tax Credits",
    body: "Most GridShift panels, batteries, and inverters are eligible for the 30% U.S. Federal Investment Tax Credit (ITC). The credit is claimed on your federal tax return — our checkout shows an estimate, and your invoice includes the itemized documentation your tax preparer needs. State and utility incentives are tracked automatically in the Energy Estimator.",
  },
  {
    id: "warranty",
    title: "Warranty",
    body: "Panels carry a 25-year linear power warranty (≥ 87% rated output at year 25). Storage systems carry a 10–12 year warranty. Inverters carry a 12-year warranty extendable to 20. All warranties are transferable once to a new property owner.",
  },
  {
    id: "privacy",
    title: "Privacy Policy",
    body: "We collect only the data required to fulfill orders and provide monitoring services. Payment card data is processed by Paystack and never touches GridShift servers. Account data is stored with Supabase with row-level security; you may request deletion at any time.",
  },
];

export default function SupportPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-bold tracking-tight">Support &amp; Documentation</h1>
      <p className="mt-3 max-w-xl leading-7 text-slate-600">
        Engineering-grade documentation for every stage of your energy
        independence project.
      </p>

      <div className="mt-10 rounded-lg bg-slate-900 p-7 text-white">
        <h2 className="text-lg font-semibold">Contact Engineering</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Schedule a technical assessment or design consultation with our
          engineering team.
        </p>
        <p className="mt-4 font-mono text-sm text-teal-300">
          engineering@gridshift.example · Mon–Fri, 8:00–18:00
        </p>
      </div>

      <div className="mt-10 space-y-8">
        {SECTIONS.map((s) => (
          <section
            key={s.id}
            id={s.id}
            className="scroll-mt-24 rounded-lg border border-slate-200 bg-white p-7"
          >
            <h2 className="text-xl font-semibold">{s.title}</h2>
            <p className="mt-3 leading-7 text-slate-600">{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
