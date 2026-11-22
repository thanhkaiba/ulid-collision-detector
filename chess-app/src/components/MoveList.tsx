import { useEffect, useRef } from 'react';
import type { Judgment } from '../lib/storage';

export default function MoveList({
  moves,
  current,
  onSelect,
  judgments,
}: {
  moves: string[];
  /** index of the current ply (-1 = start position) */
  current: number;
  onSelect?: (ply: number) => void;
  judgments?: (Judgment | undefined)[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current?.querySelector('.mv.cur');
    el?.scrollIntoView({ block: 'nearest' });
  }, [current]);
  const rows: { n: number; w?: number; b?: number }[] = [];
  for (let i = 0; i < moves.length; i += 2) rows.push({ n: i / 2 + 1, w: i, b: i + 1 < moves.length ? i + 1 : undefined });
  const glyph = (j?: Judgment) =>
    j === 'blunder' ? '??' : j === 'mistake' ? '?' : j === 'inaccuracy' ? '?!' : j === 'best' ? '!' : '';
  return (
    <div className="moves" ref={ref}>
      {rows.map((r) => (
        <Row key={r.n} r={r} />
      ))}
    </div>
  );
  function Row({ r }: { r: { n: number; w?: number; b?: number } }) {
    return (
      <>
        <span className="num">{r.n}.</span>
        {r.w !== undefined ? (
          <span className={`mv ${current === r.w ? 'cur' : ''} ${judgments?.[r.w] ?? ''}`} onClick={() => onSelect?.(r.w!)}>
            {moves[r.w]}
            {glyph(judgments?.[r.w])}
          </span>
        ) : (
          <span />
        )}
        {r.b !== undefined ? (
          <span className={`mv ${current === r.b ? 'cur' : ''} ${judgments?.[r.b] ?? ''}`} onClick={() => onSelect?.(r.b!)}>
            {moves[r.b]}
            {glyph(judgments?.[r.b])}
          </span>
        ) : (
          <span />
        )}
      </>
    );
  }
}
