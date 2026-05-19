import clsx from "clsx";

export type RangeOption = { label: string; days: number };

export const RANGES: RangeOption[] = [
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
  { label: "1Y", days: 365 },
];

type Props = {
  value: number;
  onChange: (days: number) => void;
};

export default function RangeToggle({ value, onChange }: Props) {
  return (
    <div
      role="tablist"
      aria-label="Chart range"
      className="inline-flex rounded-full border border-bone-50/12 bg-ink-900/70 p-1 backdrop-blur"
    >
      {RANGES.map((r) => {
        const active = r.days === value;
        return (
          <button
            key={r.days}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(r.days)}
            type="button"
            className={clsx(
              "px-4 py-1.5 font-mono-tabular text-[11px] uppercase tracking-wide-meta transition-all rounded-full",
              active
                ? "bg-lime-accent text-ink-950"
                : "text-bone-300 hover:text-bone-50",
            )}
          >
            {r.label}
          </button>
        );
      })}
    </div>
  );
}
