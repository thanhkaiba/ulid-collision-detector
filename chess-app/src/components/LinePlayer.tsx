import { useEffect, useMemo, useState } from 'react';
import { Chess } from 'chess.js';
import type { Key } from 'chessground/types';
import type { DrawShape } from 'chessground/draw';
import Board from './Board';
import { Button } from './ui';

/**
 * A diagram that plays a sequence of moves by itself: ▶ runs it, ◀ ▶ step, and every move is listed with its number,
 * the current one highlighted. The opening frame keeps the diagram's arrows; a move's note shows while it is on the board.
 */
export default function LinePlayer({
  fen,
  line = [],
  notes = [],
  intro = [],
  introFen,
  orientation = 'white',
  shapes = [],
  lastMove,
}: {
  fen: string;
  line?: string[];
  notes?: string[];
  /** moves leading to `fen` from the starting position (or `introFen`) */
  intro?: string[];
  introFen?: string;
  orientation?: 'white' | 'black';
  shapes?: DrawShape[];
  lastMove?: Key[];
}) {
  /** frames 0..base-1 lead to the diagram, frame `base` is the diagram itself, then the line played on from it */
  const { frames, base, first } = useMemo(() => {
    const out: { fen: string; san: string; lastMove?: Key[]; note?: string }[] = [];
    const first = introFen ?? new Chess().fen();
    if (intro.length) {
      const c = new Chess(first);
      out.push({ fen: c.fen(), san: '' });
      intro.forEach((raw, k) => {
        const m = c.move(raw.replace(/[?!]+$/, ''));
        // the last intro move lands on the diagram: keep the diagram's exact FEN there
        out.push({ fen: k === intro.length - 1 ? fen : c.fen(), san: m.san, lastMove: [m.from as Key, m.to as Key] });
      });
    } else out.push({ fen, san: '', lastMove });
    const base = out.length - 1;
    const c = new Chess(fen);
    line.forEach((raw, k) => {
      const m = c.move(raw.replace(/[?!]+$/, ''));
      out.push({ fen: c.fen(), san: m.san + (raw.match(/[?!]+$/)?.[0] ?? ''), lastMove: [m.from as Key, m.to as Key], note: notes[k] || undefined });
    });
    return { frames: out, base, first: intro.length ? first : fen };
  }, [fen, line, notes, intro, introFen, lastMove]);
  const [i, setI] = useState(base);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing) return;
    if (i >= frames.length - 1) {
      setPlaying(false);
      return;
    }
    const t = window.setTimeout(() => setI((x) => x + 1), i === 0 ? 700 : frames[i].note ? 2400 : 1200);
    return () => clearTimeout(t);
  }, [i, playing, frames]);

  const startNo = Number(first.split(' ')[5]) || 1;
  const blackFirst = first.split(' ')[1] === 'b';
  /** "7." before a White move, "7..." before a Black move that starts the list, nothing otherwise */
  const num = (k: number) => {
    const ply = k + (blackFirst ? 1 : 0);
    const n = startNo + Math.floor(ply / 2);
    return ply % 2 === 0 ? `${n}.` : k === 0 ? `${n}...` : '';
  };
  const label = (k: number) => {
    const ply = k + (blackFirst ? 1 : 0);
    const n = startNo + Math.floor(ply / 2);
    return `${n}${ply % 2 === 0 ? '.' : '...'} ${frames[k + 1].san}`;
  };
  const f = frames[i];
  const c = new Chess(f.fen);
  const go = (k: number) => {
    setPlaying(false);
    setI(Math.max(0, Math.min(frames.length - 1, k)));
  };
  return (
    <div className="line-player">
      <Board
        fen={f.fen}
        orientation={orientation}
        turnColor={c.turn() === 'w' ? 'white' : 'black'}
        lastMove={f.lastMove}
        check={c.inCheck() ? (c.turn() === 'w' ? 'white' : 'black') : false}
        shapes={i === base ? shapes : []}
        viewOnly
        sides
      />
      <div className="demo-caption">
        <div className="tiny muted">
          {i === base ? 'Thế cờ trên hình' : i === 0 ? 'Thế cờ ban đầu' : `Nước ${i}/${frames.length - 1}: ${label(i - 1)}`}
          {i < base && i > 0 ? ' · trước thế cờ trên hình' : ''}
        </div>
        <div>
          {i === base && !playing
            ? line.length
              ? `Bấm “▶ Chạy” để xem ${line.length} nước tiếp theo lần lượt${intro.length ? ', ⏮ để xem từ nước đầu ván' : ''}, hoặc bấm vào từng nước bên dưới.`
              : `Bấm “▶ Chạy” để xem lần lượt ${intro.length} nước dẫn tới thế cờ này.`
            : (frames[i].note ?? '')}
        </div>
      </div>
      <div className="row" style={{ justifyContent: 'center', gap: 6 }}>
        <Button kind="ghost" onClick={() => go(0)} aria-label="Về đầu">
          ⏮
        </Button>
        <Button kind="ghost" onClick={() => go(i - 1)} aria-label="Lùi một nước">
          ◀
        </Button>
        <Button
          kind="primary"
          onClick={() => {
            if (playing) return setPlaying(false);
            // at the end (or on a diagram with nothing after it): start over from the first move
            if (i >= frames.length - 1) setI(0);
            setPlaying(true);
          }}
        >
          {playing ? '⏸ Dừng' : '▶ Chạy'}
        </Button>
        <Button kind="ghost" onClick={() => go(i + 1)} aria-label="Tiến một nước">
          ▶
        </Button>
        <Button kind="ghost" onClick={() => go(frames.length - 1)} aria-label="Tới cuối">
          ⏭
        </Button>
      </div>
      <div className="demo-moves">
        {frames.slice(1).map((fr, k) => (
          <span key={k} style={{ display: 'contents' }}>
            <button className={`mv ${i === k + 1 ? 'cur' : ''} ${fr.note ? 'noted' : ''}`} onClick={() => go(k + 1)}>
              {num(k)}
              {fr.san}
            </button>
            {k + 1 === base && line.length > 0 && (
              <button className={`mv diagram-mark ${i === base ? 'cur' : ''}`} onClick={() => go(base)} aria-label="Thế cờ trên hình">
                ◆ hình
              </button>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
