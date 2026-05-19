import { CURRENCIES } from "./currencies";

export type ConverterState = {
  from: string;
  to: string;
  amount: number;
};

const DEFAULTS: ConverterState = { from: "USD", to: "EUR", amount: 100 };

function validCode(code: string | null): string | null {
  if (!code) return null;
  const up = code.toUpperCase();
  return CURRENCIES[up] ? up : null;
}

function clampAmount(raw: string | null): number | null {
  if (!raw) return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.min(n, 1_000_000_000);
}

export function parseState(params: URLSearchParams): ConverterState {
  const from = validCode(params.get("from")) ?? DEFAULTS.from;
  const to = validCode(params.get("to")) ?? DEFAULTS.to;
  const amount = clampAmount(params.get("amount")) ?? DEFAULTS.amount;
  return { from, to: from === to ? DEFAULTS.to : to, amount };
}

export function serializeState(state: ConverterState): string {
  const p = new URLSearchParams();
  p.set("from", state.from);
  p.set("to", state.to);
  p.set("amount", String(state.amount));
  return p.toString();
}

export function isDefault(state: ConverterState): boolean {
  return (
    state.from === DEFAULTS.from &&
    state.to === DEFAULTS.to &&
    state.amount === DEFAULTS.amount
  );
}
