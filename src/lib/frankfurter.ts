export type LatestResponse = {
  amount: number;
  base: string;
  date: string;
  rates: Record<string, number>;
};

export type HistoryResponse = {
  amount: number;
  base: string;
  start_date: string;
  end_date: string;
  rates: Record<string, Record<string, number>>;
};

export type CurrenciesResponse = Record<string, string>;

const FRANKFURTER = "https://api.frankfurter.dev/v1";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const proxy = isBrowser() ? `/api/rates?path=${encodeURIComponent(path)}` : null;
  const url = proxy ?? `${FRANKFURTER}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: { Accept: "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    throw new Error(`Frankfurter ${res.status}: ${path}`);
  }
  return (await res.json()) as T;
}

export async function fetchLatest(
  from: string,
  to: string,
  amount = 1,
): Promise<LatestResponse> {
  if (from === to) {
    const today = new Date().toISOString().slice(0, 10);
    return { amount, base: from, date: today, rates: { [to]: 1 } };
  }
  return call<LatestResponse>(
    `/latest?base=${from}&symbols=${to}&amount=${amount}`,
  );
}

export async function fetchMultiLatest(
  from: string,
  symbols: string[],
): Promise<LatestResponse> {
  const ours = symbols.filter((s) => s !== from);
  if (ours.length === 0) {
    const today = new Date().toISOString().slice(0, 10);
    return { amount: 1, base: from, date: today, rates: {} };
  }
  return call<LatestResponse>(`/latest?base=${from}&symbols=${ours.join(",")}`);
}

export async function fetchHistory(
  from: string,
  to: string,
  startDate: string,
  endDate: string,
): Promise<HistoryResponse> {
  if (from === to) {
    return {
      amount: 1,
      base: from,
      start_date: startDate,
      end_date: endDate,
      rates: {},
    };
  }
  return call<HistoryResponse>(
    `/${startDate}..${endDate}?base=${from}&symbols=${to}`,
  );
}

export async function fetchCurrencies(): Promise<CurrenciesResponse> {
  return call<CurrenciesResponse>(`/currencies`);
}

export function rangeDates(days: number): { start: string; end: string } {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days);
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}
