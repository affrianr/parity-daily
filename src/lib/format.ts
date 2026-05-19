const formatters = new Map<string, Intl.NumberFormat>();

function getFormatter(code: string, maxFractionDigits: number): Intl.NumberFormat {
  const key = `${code}:${maxFractionDigits}`;
  let f = formatters.get(key);
  if (!f) {
    f = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code,
      maximumFractionDigits: maxFractionDigits,
      minimumFractionDigits: maxFractionDigits === 0 ? 0 : 2,
    });
    formatters.set(key, f);
  }
  return f;
}

export function formatCurrency(amount: number, code: string): string {
  const fractionDigits = code === "JPY" || code === "KRW" || code === "IDR" ? 0 : 2;
  try {
    return getFormatter(code, fractionDigits).format(amount);
  } catch {
    return `${amount.toFixed(fractionDigits)} ${code}`;
  }
}

export function formatRate(rate: number): string {
  if (rate >= 1000) return rate.toFixed(2);
  if (rate >= 1) return rate.toFixed(4);
  return rate.toFixed(6);
}

export function formatNumber(n: number, fractionDigits = 2): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits === 0 ? 0 : 2,
  }).format(n);
}

export function formatDateLong(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function formatDateShort(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
