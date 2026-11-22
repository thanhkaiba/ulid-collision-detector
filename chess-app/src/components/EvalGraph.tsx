import { winPercent } from '../lib/engine';
import type { PlyAnalysis } from '../lib/storage';

export default function EvalGraph({
  plies,
  current,
  onSelect,
}: {
  plies: PlyAnalysis[];
  current: number;
  onSelect?: (ply: number) => void;
}) {
  const w = 600;
  const h = 70;
  const n = plies.length;
  if (!n) return <svg className="evalgraph" viewBox={`0 0 ${w} ${h}`} />;
  // keep a small margin so the mistake dots at the edges (mate, last move) are not cut in half
  const pad = 4;
  const x = (i: number) => (i / Math.max(1, n)) * (w - 2 * pad) + pad;
  const y = (wp: number) => h - pad - (wp / 100) * (h - 2 * pad);
  let d = `M0 ${y(50)} L${x(0)} ${y(50)}`;
  plies.forEach((p, i) => {
    d += ` L${x(i + 1)} ${y(winPercent(p.evalAfter))}`;
  });
  const last = n ? y(winPercent(plies[n - 1].evalAfter)) : y(50);
  const area = `${d} L${w} ${last} L${w} ${h} L0 ${h} Z`;
  const cx = x(current + 1);
  return (
    <svg
      className="evalgraph"
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      role="img"
      aria-label="Biểu đồ đánh giá theo từng nước, chạm để tới nước đó"
      onClick={(e) => {
        const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
        const frac = ((e.clientX - rect.left) / rect.width) * w;
        onSelect?.(Math.min(n - 1, Math.max(-1, Math.round(((frac - pad) / (w - 2 * pad)) * n) - 1)));
      }}
    >
      <rect x={0} y={0} width={w} height={h} fill="#3b3b3b" />
      <path d={area} fill="#e9e9e9" />
      <line x1={0} x2={w} y1={y(50)} y2={y(50)} stroke="#888" strokeDasharray="4 4" strokeWidth={1} />
      {plies.map((p, i) =>
        p.judgment === 'blunder' || p.judgment === 'mistake' ? (
          <circle key={i} cx={x(i + 1)} cy={y(winPercent(p.evalAfter))} r={3.5} fill={p.judgment === 'blunder' ? '#d33' : '#e08a52'} />
        ) : null,
      )}
      <line x1={cx} x2={cx} y1={0} y2={h} stroke="#5fae84" strokeWidth={2} />
    </svg>
  );
}
