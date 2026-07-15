const STYLES: Record<string, string> = {
  "HIGH EFFICIENCY": "bg-teal-700 text-white",
  "BEST VALUE": "bg-yellow-500 text-slate-900",
  "NEW TECH": "bg-slate-900 text-white",
  "BEST SELLER": "bg-yellow-400 text-slate-900",
  "TAX CREDIT ELIGIBLE": "bg-teal-100 text-teal-800",
};

export default function BadgeChip({ label }: { label: string }) {
  const style = STYLES[label.toUpperCase()] ?? "bg-slate-900 text-white";
  return (
    <span
      className={`inline-block px-2 py-1 font-mono text-[10px] font-medium uppercase tracking-wider ${style}`}
    >
      {label}
    </span>
  );
}
