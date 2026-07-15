"use client";

export default function QuantityStepper({
  value,
  onChange,
  min = 1,
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
}) {
  return (
    <div className="flex h-10 items-stretch overflow-hidden rounded-sm border border-slate-300 bg-white">
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="w-9 text-slate-600 transition-colors hover:bg-slate-100"
      >
        −
      </button>
      <span className="flex w-11 items-center justify-center border-x border-slate-200 font-mono text-sm">
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => onChange(value + 1)}
        className="w-9 text-slate-600 transition-colors hover:bg-slate-100"
      >
        +
      </button>
    </div>
  );
}
