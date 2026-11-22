import { winPercent, formatScore } from '../lib/engine';

export default function EvalBar({
  score,
  orientation = 'white',
}: {
  score?: { cp?: number; mate?: number };
  orientation?: 'white' | 'black';
}) {
  const wp = score ? winPercent(score) : 50;
  const whiteFrac = wp / 100;
  const flipped = orientation === 'black';
  return (
    <div className={`evalbar ${flipped ? 'flipped' : ''}`} title={score ? formatScore(score) : ''}>
      <div className="evalbar-white" style={{ height: `${whiteFrac * 100}%` }} />
      <span className="evalbar-label">{score ? formatScore(score) : ''}</span>
    </div>
  );
}
