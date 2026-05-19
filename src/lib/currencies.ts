export type CurrencyMeta = {
  code: string;
  name: string;
  symbol: string;
  flag: string;
};

export const CURRENCIES: Record<string, CurrencyMeta> = {
  AUD: { code: "AUD", name: "Australian Dollar", symbol: "A$", flag: "AU" },
  BGN: { code: "BGN", name: "Bulgarian Lev", symbol: "лв", flag: "BG" },
  BRL: { code: "BRL", name: "Brazilian Real", symbol: "R$", flag: "BR" },
  CAD: { code: "CAD", name: "Canadian Dollar", symbol: "C$", flag: "CA" },
  CHF: { code: "CHF", name: "Swiss Franc", symbol: "CHF", flag: "CH" },
  CNY: { code: "CNY", name: "Chinese Yuan", symbol: "¥", flag: "CN" },
  CZK: { code: "CZK", name: "Czech Koruna", symbol: "Kč", flag: "CZ" },
  DKK: { code: "DKK", name: "Danish Krone", symbol: "kr", flag: "DK" },
  EUR: { code: "EUR", name: "Euro", symbol: "€", flag: "EU" },
  GBP: { code: "GBP", name: "British Pound", symbol: "£", flag: "GB" },
  HKD: { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$", flag: "HK" },
  HUF: { code: "HUF", name: "Hungarian Forint", symbol: "Ft", flag: "HU" },
  IDR: { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp", flag: "ID" },
  ILS: { code: "ILS", name: "Israeli New Shekel", symbol: "₪", flag: "IL" },
  INR: { code: "INR", name: "Indian Rupee", symbol: "₹", flag: "IN" },
  ISK: { code: "ISK", name: "Icelandic Króna", symbol: "kr", flag: "IS" },
  JPY: { code: "JPY", name: "Japanese Yen", symbol: "¥", flag: "JP" },
  KRW: { code: "KRW", name: "South Korean Won", symbol: "₩", flag: "KR" },
  MXN: { code: "MXN", name: "Mexican Peso", symbol: "Mex$", flag: "MX" },
  MYR: { code: "MYR", name: "Malaysian Ringgit", symbol: "RM", flag: "MY" },
  NOK: { code: "NOK", name: "Norwegian Krone", symbol: "kr", flag: "NO" },
  NZD: { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$", flag: "NZ" },
  PHP: { code: "PHP", name: "Philippine Peso", symbol: "₱", flag: "PH" },
  PLN: { code: "PLN", name: "Polish Złoty", symbol: "zł", flag: "PL" },
  RON: { code: "RON", name: "Romanian Leu", symbol: "lei", flag: "RO" },
  SEK: { code: "SEK", name: "Swedish Krona", symbol: "kr", flag: "SE" },
  SGD: { code: "SGD", name: "Singapore Dollar", symbol: "S$", flag: "SG" },
  THB: { code: "THB", name: "Thai Baht", symbol: "฿", flag: "TH" },
  TRY: { code: "TRY", name: "Turkish Lira", symbol: "₺", flag: "TR" },
  USD: { code: "USD", name: "US Dollar", symbol: "$", flag: "US" },
  ZAR: { code: "ZAR", name: "South African Rand", symbol: "R", flag: "ZA" },
};

export const CURRENCY_CODES = Object.keys(CURRENCIES).sort();

export function getCurrency(code: string): CurrencyMeta {
  return CURRENCIES[code] ?? {
    code,
    name: code,
    symbol: code,
    flag: "",
  };
}

export const POPULAR_PAIRS: Array<{ from: string; to: string }> = [
  { from: "USD", to: "EUR" },
  { from: "USD", to: "JPY" },
  { from: "GBP", to: "USD" },
  { from: "EUR", to: "GBP" },
  { from: "USD", to: "CAD" },
  { from: "AUD", to: "USD" },
];
