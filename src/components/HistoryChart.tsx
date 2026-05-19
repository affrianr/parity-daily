import { useEffect, useMemo, useRef, useState } from "react";
import RangeToggle from "./RangeToggle";
import { fetchHistory, rangeDates } from "@/lib/frankfurter";
import { formatRate } from "@/lib/format";
import type uPlotType from "uplot";

type Props = {
  initialFrom: string;
  initialTo: string;
};

export default function HistoryChart({ initialFrom, initialTo }: Props) {
  const [days, setDays] = useState(90);
  const [data, setData] = useState<{ dates: string[]; values: number[] } | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<uPlotType | null>(null);
  const reqId = useRef(0);

  const [pair, setPair] = useState<{ from: string; to: string }>({
    from: initialFrom,
    to: initialTo,
  });

  useEffect(() => {
    function onPair(e: Event) {
      const detail = (e as CustomEvent).detail as { from: string; to: string };
      if (detail?.from && detail?.to) setPair(detail);
    }
    window.addEventListener("converter:pair", onPair as EventListener);
    return () =>
      window.removeEventListener("converter:pair", onPair as EventListener);
  }, []);

  useEffect(() => {
    const { from, to } = pair;
    if (from === to) {
      setData({ dates: [], values: [] });
      return;
    }
    const id = ++reqId.current;
    setLoading(true);
    setError(null);
    const { start, end } = rangeDates(days);
    fetchHistory(from, to, start, end)
      .then((res) => {
        if (id !== reqId.current) return;
        const entries = Object.entries(res.rates).sort(([a], [b]) =>
          a.localeCompare(b),
        );
        const dates = entries.map(([d]) => d);
        const values = entries.map(([, r]) => r[to] ?? NaN);
        setData({ dates, values });
      })
      .catch((err) => {
        if (id !== reqId.current) return;
        setError(err instanceof Error ? err.message : "Failed to load history");
      })
      .finally(() => {
        if (id === reqId.current) setLoading(false);
      });
  }, [pair, days]);

  useEffect(() => {
    let active = true;
    if (!hostRef.current || !data || data.dates.length === 0) return;
    (async () => {
      const mod = await import("uplot");
      await import("uplot/dist/uPlot.min.css");
      if (!active || !hostRef.current) return;
      const UPlot = mod.default;
      const xs = data.dates.map((d) => Math.floor(new Date(d).getTime() / 1000));
      const ys = data.values;
      const min = Math.min(...ys);
      const max = Math.max(...ys);
      const pad = (max - min) * 0.1 || max * 0.01;

      const opts: uPlotType.Options = {
        width: hostRef.current.clientWidth,
        height: 360,
        padding: [20, 16, 8, 16],
        cursor: {
          drag: { x: false, y: false },
          points: { size: 6 },
        },
        legend: { show: false },
        scales: {
          x: { time: true },
          y: { range: [min - pad, max + pad] },
        },
        axes: [
          {
            stroke: "#8b876f",
            grid: { stroke: "rgba(247,245,238,0.04)" },
            ticks: { stroke: "rgba(247,245,238,0.08)" },
            values: (_u, ticks) =>
              ticks.map((t) =>
                new Date(t * 1000).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                }),
              ),
          },
          {
            stroke: "#8b876f",
            grid: { stroke: "rgba(247,245,238,0.04)" },
            ticks: { show: false },
            size: 56,
          },
        ],
        series: [
          {},
          {
            label: `${pair.from}/${pair.to}`,
            stroke: "#c8ff4d",
            width: 2,
            fill: (u: uPlotType) => {
              const ctx = u.ctx;
              const grad = ctx.createLinearGradient(0, 0, 0, u.bbox.height);
              grad.addColorStop(0, "rgba(200, 255, 77, 0.25)");
              grad.addColorStop(1, "rgba(200, 255, 77, 0)");
              return grad;
            },
            points: { show: false },
          },
        ],
      };

      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
      chartRef.current = new UPlot(opts, [xs, ys], hostRef.current);

      const ro = new ResizeObserver(() => {
        if (chartRef.current && hostRef.current) {
          chartRef.current.setSize({
            width: hostRef.current.clientWidth,
            height: 360,
          });
        }
      });
      ro.observe(hostRef.current);
      return () => ro.disconnect();
    })();

    return () => {
      active = false;
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [data, pair.from, pair.to]);

  const summary = useMemo(() => {
    if (!data || data.values.length < 2) return null;
    const first = data.values[0];
    const last = data.values[data.values.length - 1];
    const change = last - first;
    const pct = (change / first) * 100;
    const high = Math.max(...data.values);
    const low = Math.min(...data.values);
    return { first, last, change, pct, high, low };
  }, [data]);

  return (
    <div className="relative">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <span className="font-mono-tabular text-[11px] uppercase tracking-wide-meta text-bone-400">
            Trailing performance
          </span>
          <h3 className="font-display mt-2 text-display-md font-medium tracking-tight-display text-bone-50">
            {pair.from} <span className="text-bone-400">/</span> {pair.to}
          </h3>
        </div>
        <RangeToggle value={days} onChange={setDays} />
      </div>

      <div className="mt-8 grid grid-cols-2 gap-px bg-bone-50/8 md:grid-cols-4">
        <Stat
          label="Latest"
          value={summary ? formatRate(summary.last) : "—"}
        />
        <Stat
          label="Change"
          value={
            summary
              ? `${summary.change >= 0 ? "+" : ""}${formatRate(summary.change)}`
              : "—"
          }
          accent={summary ? (summary.change >= 0 ? "up" : "down") : "neutral"}
        />
        <Stat
          label={`${days}D High`}
          value={summary ? formatRate(summary.high) : "—"}
        />
        <Stat
          label={`${days}D Low`}
          value={summary ? formatRate(summary.low) : "—"}
        />
      </div>

      <div className="relative mt-10 overflow-hidden rounded-3xl border border-bone-50/8 bg-ink-900/40 p-4 md:p-6">
        <div ref={hostRef} className="h-[360px] w-full" />
        {(loading || !data) && !error && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center text-xs text-bone-400">
            Loading chart…
          </div>
        )}
        {error && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center text-xs text-red-300">
            {error}
          </div>
        )}
      </div>

      <p className="mt-6 max-w-2xl text-sm leading-relaxed text-bone-400">
        Sourced from the European Central Bank reference rates published once
        per business day around 16:00 CET. Weekends and bank holidays carry the
        previous trading session forward.
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  accent = "neutral",
}: {
  label: string;
  value: string;
  accent?: "up" | "down" | "neutral";
}) {
  const color =
    accent === "up"
      ? "text-lime-accent"
      : accent === "down"
        ? "text-orange-300"
        : "text-bone-50";
  return (
    <div className="bg-ink-950 p-5">
      <span className="font-mono-tabular text-[10px] uppercase tracking-wide-meta text-bone-400">
        {label}
      </span>
      <span
        className={`mt-2 block font-mono-tabular text-2xl font-medium tracking-tight ${color}`}
      >
        {value}
      </span>
    </div>
  );
}
