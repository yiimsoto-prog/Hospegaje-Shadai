/** Lightweight SVG sparkline — no chart library dependency. */
export function Sparkline({
  values,
  className,
  stroke = "var(--brass)",
}: {
  values: number[];
  className?: string;
  stroke?: string;
}) {
  const w = 160;
  const h = 48;
  if (!values.length) return null;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const span = Math.max(max - min, 1);
  const pts = values
    .map((v, i) => {
      const x = (i / Math.max(values.length - 1, 1)) * w;
      const y = h - ((v - min) / span) * (h - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} role="img" aria-hidden>
      <polyline fill="none" stroke={stroke} strokeWidth="2.2" points={pts} />
    </svg>
  );
}
