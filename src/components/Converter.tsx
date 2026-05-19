import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CurrencySelect from "./CurrencySelect";
import { fetchLatest } from "@/lib/frankfurter";
import { getCurrency } from "@/lib/currencies";
import { formatCurrency, formatDateLong, formatRate } from "@/lib/format";
import { serializeState } from "@/lib/url-state";
import clsx from "clsx";

type Props = {
  initialFrom: string;
  initialTo: string;
  initialAmount: number;
  initialRate?: number;
  initialDate?: string;
};

export default function Converter({
  initialFrom,
  initialTo,
  initialAmount,
  initialRate,
  initialDate,
}: Props) {
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [amountInput, setAmountInput] = useState(String(initialAmount));
  const [rate, setRate] = useState<number | null>(initialRate ?? null);
  const [date, setDate] = useState<string | null>(initialDate ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const reqId = useRef(0);

  const share = useCallback(async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      } catch {
        setError("Could not copy link");
      } finally {
        document.body.removeChild(ta);
      }
    }
  }, []);

  const amount = useMemo(() => {
    const n = Number(amountInput.replace(/,/g, ""));
    return Number.isFinite(n) && n >= 0 ? n : 0;
  }, [amountInput]);

  const converted = rate !== null ? amount * rate : null;

  const refresh = useCallback(
    async (nextFrom: string, nextTo: string) => {
      if (nextFrom === nextTo) {
        setRate(1);
        setError(null);
        return;
      }
      const id = ++reqId.current;
      setLoading(true);
      setError(null);
      try {
        const data = await fetchLatest(nextFrom, nextTo, 1);
        if (id !== reqId.current) return;
        const r = data.rates[nextTo];
        if (typeof r !== "number") throw new Error("Rate unavailable");
        setRate(r);
        setDate(data.date);
      } catch (err) {
        if (id !== reqId.current) return;
        setError(err instanceof Error ? err.message : "Failed to load rate");
        setRate(null);
      } finally {
        if (id === reqId.current) setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (initialRate == null) {
      refresh(from, to);
    }
  }, []);

  useEffect(() => {
    refresh(from, to);
  }, [from, to, refresh]);

  useEffect(() => {
    const safeAmount = Number.isFinite(amount) ? amount : 0;
    const qs = serializeState({ from, to, amount: safeAmount });
    const next = `${window.location.pathname}?${qs}`;
    if (next !== window.location.pathname + window.location.search) {
      window.history.replaceState(null, "", next);
    }
  }, [from, to, amount]);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("converter:pair", { detail: { from, to } }),
    );
  }, [from, to]);

  function swap() {
    setFrom(to);
    setTo(from);
  }

  const fromMeta = getCurrency(from);
  const toMeta = getCurrency(to);

  return (
    <div className="panel grain relative overflow-hidden rounded-[28px] p-6 md:p-8">
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-lime-accent/15 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative flex flex-col gap-6">
        <div className="flex items-center justify-between gap-3">
          <span className="font-mono-tabular text-[10px] uppercase tracking-wide-meta text-bone-400">
            Converter
          </span>
          <button
            type="button"
            onClick={share}
            aria-label="Copy share link"
            className={clsx(
              "group inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono-tabular text-[10px] uppercase tracking-wide-meta transition-colors",
              copied
                ? "border-lime-accent bg-lime-accent text-ink-950"
                : "border-bone-50/15 bg-ink-900/60 text-bone-300 hover:border-lime-accent/40 hover:text-bone-50",
            )}
          >
            {copied ? (
              <>
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" />
                </svg>
                Copied
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <rect x="4" y="4" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M11 4V2.5A1 1 0 0 0 10 1.5H2.5A1 1 0 0 0 1.5 2.5v8a1 1 0 0 0 1 1H4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square" />
                </svg>
                Share link
              </>
            )}
          </button>
        </div>

        <div>
          <span className="font-mono-tabular text-[10px] uppercase tracking-wide-meta text-bone-400">
            You send
          </span>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="font-display text-2xl text-bone-300">
              {fromMeta.symbol}
            </span>
            <input
              type="text"
              inputMode="decimal"
              value={amountInput}
              onChange={(e) => {
                const cleaned = e.target.value.replace(/[^0-9.,]/g, "");
                setAmountInput(cleaned);
              }}
              className="font-display w-full bg-transparent text-display-lg font-medium tracking-tight-display text-bone-50 focus:outline-none"
              aria-label="Amount to convert"
            />
          </div>
          <div className="mt-2 h-px w-full bg-gradient-to-r from-bone-50/30 via-bone-50/10 to-transparent" />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto_1fr] md:items-end">
          <CurrencySelect
            value={from}
            onChange={setFrom}
            label="From"
            excludeCode={to}
          />

          <button
            type="button"
            onClick={swap}
            className="group mx-auto grid h-12 w-12 place-items-center rounded-full border border-bone-50/15 bg-ink-900/80 transition-all hover:border-lime-accent hover:bg-lime-accent hover:text-ink-950 md:mb-1"
            aria-label="Swap currencies"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              className="transition-transform duration-500 group-hover:rotate-180"
              aria-hidden="true"
            >
              <path
                d="M7 4v16m0 0l-3-3m3 3l3-3M17 20V4m0 0l-3 3m3-3l3 3"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="square"
              />
            </svg>
          </button>

          <CurrencySelect
            value={to}
            onChange={setTo}
            label="To"
            excludeCode={from}
            align="right"
          />
        </div>

        <div className="relative mt-2 rounded-2xl border border-bone-50/8 bg-ink-950/60 p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="font-mono-tabular text-[10px] uppercase tracking-wide-meta text-bone-400">
              You receive
            </span>
            <span className="flex items-center gap-2 font-mono-tabular text-[11px] text-bone-400">
              <span
                className={clsx(
                  "h-1.5 w-1.5 rounded-full transition-colors",
                  loading
                    ? "animate-pulse bg-lime-accent"
                    : error
                      ? "bg-red-400"
                      : "bg-lime-accent",
                )}
              />
              {loading ? "Updating" : error ? "Error" : "Live"}
            </span>
          </div>

          <div className="mt-3 flex items-baseline gap-3">
            <span className="font-display text-2xl text-bone-300">
              {toMeta.symbol}
            </span>
            <span className="font-display text-display-lg font-medium tracking-tight-display text-bone-50">
              {converted == null
                ? "—"
                : formatCurrency(converted, to).replace(/^[^\d-]+/, "")}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-bone-50/10 pt-4 text-xs text-bone-400">
            <span className="font-mono-tabular">
              1 {from} ={" "}
              <span className="text-bone-100">
                {rate != null ? formatRate(rate) : "—"}
              </span>{" "}
              {to}
            </span>
            <span className="font-mono-tabular">
              {date ? `ECB · ${formatDateLong(date)}` : "—"}
            </span>
          </div>

          {error && (
            <div className="mt-3 rounded-lg border border-red-400/20 bg-red-500/10 px-3 py-2 text-xs text-red-200">
              {error}. Tap retry to try again.{" "}
              <button
                type="button"
                onClick={() => refresh(from, to)}
                className="underline underline-offset-2"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
