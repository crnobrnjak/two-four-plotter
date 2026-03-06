const FALLBACK_PALETTE = [
  "#1f77b4",
  "#d62728",
  "#2ca02c",
  "#9467bd",
  "#ff7f0e",
  "#8c564b",
  "#e377c2",
  "#17becf",
  "#bcbd22",
  "#7f7f7f",
];

function isCssColor(value: string): boolean {
  if (typeof document === "undefined") {
    return true;
  }

  const option = new Option();
  option.style.color = "";
  option.style.color = value;
  return option.style.color !== "";
}

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function resolveSeriesColor(
  value: string | null,
  index: number,
): string {
  if (!value || value.trim().length === 0) {
    return "#222222";
  }

  if (isCssColor(value)) {
    return value;
  }

  return (
    FALLBACK_PALETTE[hashString(value) % FALLBACK_PALETTE.length] ??
    FALLBACK_PALETTE[index % FALLBACK_PALETTE.length]
  );
}
