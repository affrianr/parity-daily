import { useEffect, useMemo, useRef, useState } from "react";
import { CURRENCIES, CURRENCY_CODES, getCurrency } from "@/lib/currencies";
import clsx from "clsx";

type Props = {
  value: string;
  onChange: (code: string) => void;
  label: string;
  excludeCode?: string;
  align?: "left" | "right";
};

export default function CurrencySelect({
  value,
  onChange,
  label,
  excludeCode,
  align = "left",
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const current = getCurrency(value);

  const filtered = useMemo(() => {
    const codes = CURRENCY_CODES.filter((c) => c !== excludeCode);
    if (!query) return codes;
    const q = query.toLowerCase();
    return codes.filter((c) => {
      const meta = CURRENCIES[c];
      return (
        c.toLowerCase().includes(q) || meta.name.toLowerCase().includes(q)
      );
    });
  }, [query, excludeCode]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  function pick(code: string) {
    onChange(code);
    setOpen(false);
  }

  return (
    <div ref={wrapRef} className="relative">
      <span className="block font-mono-tabular text-[10px] uppercase tracking-wide-meta text-bone-400 mb-2">
        {label}
      </span>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="group flex w-full items-center justify-between gap-3 rounded-2xl border border-bone-50/10 bg-ink-900/70 px-4 py-3.5 text-left transition-colors hover:border-lime-accent/40 hover:bg-ink-800/80"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-bone-50/5 font-mono-tabular text-[10px] font-semibold text-bone-100">
            {current.flag}
          </span>
          <span>
            <span className="block font-display text-2xl font-medium leading-none tracking-tight-display">
              {current.code}
            </span>
            <span className="mt-1 block text-xs text-bone-400">
              {current.name}
            </span>
          </span>
        </span>
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          className={clsx(
            "text-bone-300 transition-transform duration-300",
            open && "rotate-180",
          )}
          aria-hidden="true"
        >
          <path
            d="M5 8l5 5 5-5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="square"
          />
        </svg>
      </button>

      {open && (
        <div
          className={clsx(
            "absolute top-[calc(100%+8px)] z-50 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-bone-50/10 bg-ink-900/95 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] backdrop-blur-2xl",
            align === "right" ? "right-0" : "left-0",
          )}
        >
          <div className="border-b border-bone-50/10 px-3 py-2">
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search currency"
              className="w-full bg-transparent px-2 py-2 text-sm text-bone-50 placeholder:text-bone-400 focus:outline-none"
            />
          </div>
          <ul
            role="listbox"
            className="max-h-72 overflow-y-auto py-1"
          >
            {filtered.length === 0 && (
              <li className="px-4 py-3 text-sm text-bone-400">No matches</li>
            )}
            {filtered.map((code) => {
              const meta = CURRENCIES[code];
              const selected = code === value;
              return (
                <li key={code}>
                  <button
                    type="button"
                    onClick={() => pick(code)}
                    role="option"
                    aria-selected={selected}
                    className={clsx(
                      "flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors",
                      selected
                        ? "bg-lime-accent/10 text-lime-accent"
                        : "text-bone-100 hover:bg-bone-50/5",
                    )}
                  >
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-bone-50/5 font-mono-tabular text-[10px] font-semibold">
                      {meta.flag}
                    </span>
                    <span className="font-mono-tabular text-sm font-medium tracking-wide">
                      {meta.code}
                    </span>
                    <span className="truncate text-sm text-bone-400">
                      {meta.name}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
