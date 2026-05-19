import { useState } from "react";

type Props = {
  date?: string;
};

export default function StaleBadge({ date }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-flex">
      <button
        type="button"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="inline-flex items-center gap-2 rounded-full border border-bone-50/12 bg-ink-900/60 px-3 py-1.5 font-mono-tabular text-[11px] uppercase tracking-wide-meta text-bone-300 transition-colors hover:border-lime-accent/40 hover:text-bone-50"
      >
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lime-accent" />
        ECB reference · daily
        <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="8" cy="8" r="6.5" stroke="currentColor" />
          <path d="M8 7v4M8 5v.5" stroke="currentColor" strokeLinecap="square" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-1/2 top-[calc(100%+8px)] z-30 w-72 -translate-x-1/2 rounded-xl border border-bone-50/10 bg-ink-900/95 p-3.5 text-xs leading-relaxed text-bone-200 shadow-2xl backdrop-blur">
          Rates come from the European Central Bank reference fixing, published
          once per business day at approximately 16:00 CET. Not suitable for
          high-frequency trading.
          {date && (
            <div className="mt-2 font-mono-tabular text-[10px] text-bone-400">
              Last update: {date}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
