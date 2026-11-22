import { winPercent, formatScore } from '../lib/engine';

export default function EvalBar({
  score,
  orientation = 'white',
  label,
}: {
  score?: { cp?: number; mate?: number };
  orientation?: 'white' | 'black';
  /** text to show instead of the formatted score (e.g. "1-0" once the game is over) */
  label?: string;
}) {
  const wp = score ? winPercent(score) : 50;
  const whiteFrac = wp / 100;
  const flipped = orientation === 'black';
  const text = label ?? (score ? formatScore(score) : '');
  // write the number on the side that is ahead, in a colour that reads on that side's fill
  const whiteAhead = wp >= 50;
  const atBottom = whiteAhead !== flipped;
  return (
    <div className={`evalbar ${flipped ? 'flipped' : ''}`} title={text}>
      <div className="evalbar-white" style={{ height: `${whiteFrac * 100}%` }} />
      <span
        className="evalbar-label"
        style={{
          top: atBottom ? 'auto' : 2,
          bottom: atBottom ? 2 : 'auto',
          color: whiteAhead ? '#333' : '#ddd',
          fontSize: '0.65rem',
          fontWeight: 600,
        }}
      >
        {text}
      </span>
    </div>
  );
}
