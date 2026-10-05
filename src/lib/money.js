const takaFormat = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

export function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function formatTaka(n) {
  const value = round2(Number(n) || 0);
  return `${value < 0 ? "−" : ""}৳${takaFormat.format(Math.abs(value))}`;
}

export function formatNumber(n) {
  return takaFormat.format(round2(Number(n) || 0));
}
