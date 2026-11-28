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
    // scroll only the list itself: scrollIntoView would also scroll the page and push the board away
    const box = ref.current;
    const el = box?.querySelector<HTMLElement>('.mv.cur');
    if (!box || !el) return;
    const top = el.offsetTop - box.offsetTop;
    if (top < box.scrollTop) box.scrollTop = top;
    else if (top + el.offsetHeight > box.scrollTop + box.clientHeight) box.scrollTop = top + el.offsetHeight - box.clientHeight;
  }, [current]);
  const rows: { n: number; w?: number; b?: number }[] = [];
  for (let i = 0; i < moves.length; i += 2) rows.push({ n: i / 2 + 1, w: i, b: i + 1 < moves.length ? i + 1 : undefined });
  const glyph = (j?: Judgment) =>
    j === 'blunder' ? '??' : j === 'mistake' ? '?' : j === 'inaccuracy' ? '?!' : '';
  return (
    <div className="moves" ref={ref}>
      {moves.length === 0 && <span className="moves-empty">Chưa có nước nào. Biên bản hiện ở đây khi ván bắt đầu.</span>}
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
