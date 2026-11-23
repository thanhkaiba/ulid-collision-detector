import { useEffect, useMemo, useState } from 'react';
import { Chess, type Square } from 'chess.js';
import type { Key } from 'chessground/types';
import Board from './Board';
import { Button } from './ui';
import type { PracticePosition } from '../data/practice';
import type { PracticeMethod } from '../data/practiceMethods';

const FILES = 'abcdefgh';

/** Squares the lone king can still walk to without stepping on an attacked square: the "box" of the basic mates. */
function boxOf(c: Chess, def: 'w' | 'b'): Set<string> {
  const att = def === 'w' ? 'b' : 'w';
  let start = '';
  for (const row of c.board()) for (const p of row) if (p && p.type === 'k' && p.color === def) start = p.square;
  // look at the board without the king: a square behind it on a checking line is attacked once it steps there
  const bare = new Chess(c.fen());
  bare.remove(start as Square);
  const seen = new Set([start]);
  const q = [start];
  while (q.length) {
    const s = q.shift()!;
    const f = FILES.indexOf(s[0]);
    const r = Number(s[1]);
    for (let df = -1; df <= 1; df++)
      for (let dr = -1; dr <= 1; dr++) {
        const nf = f + df;
        const nr = r + dr;
        if (nf < 0 || nf > 7 || nr < 1 || nr > 8) continue;
        const n = FILES[nf] + nr;
        if (seen.has(n)) continue;
        const p = c.get(n as Square);
        if (p && p.color === att) continue;
        if (bare.isAttacked(n as Square, att)) continue;
        seen.add(n);
        q.push(n);
      }
  }
  return seen;
}

/**
 * Animated model solution: the board plays the line by itself (or step by step), each move with a short
 * explanation; for the basic mates the area the lone king can still reach is shaded.
 */
export default function MethodDemo({ pos, method }: { pos: PracticePosition; method: PracticeMethod }) {
  const frames = useMemo(() => {
    const c = new Chess(pos.fen);
    const out: { fen: string; lastMove?: Key[]; san?: string; note?: string; mover?: 'w' | 'b' }[] = [{ fen: c.fen() }];
    for (const [san, note] of method.demo) {
      const mover = c.turn();
      const m = c.move(san);
      out.push({ fen: c.fen(), lastMove: [m.from as Key, m.to as Key], san: m.san, note, mover });
    }
    return out;
  }, [pos, method]);
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing) return;
    if (i >= frames.length - 1) {
      setPlaying(false);
      return;
    }
    // linger on moves that carry an explanation
    const t = setTimeout(() => setI((x) => x + 1), i === 0 ? 1200 : frames[i].note ? 2600 : 1100);
    return () => clearTimeout(t);
  }, [i, playing, frames]);

  const f = frames[i];
  const c = new Chess(f.fen);
  const def = pos.me === 'w' ? 'b' : 'w';
  const box = method.box && !c.isCheckmate() ? boxOf(c, def) : null;
  const classes = new Map<Key, string>();
  if (box) for (const s of box) classes.set(s as Key, 'box');
  // the note to show: this move's, or the last note given before it
  let note = '';
  for (let k = i; k >= 1; k--)
    if (frames[k].note) {
      note = k === i ? frames[k].note! : '';
      break;
    }
  const moveNo = (k: number) => {
    const startNo = Number(pos.fen.split(' ')[5]);
    const blackFirst = pos.fen.split(' ')[1] === 'b';
    const ply = k - 1 + (blackFirst ? 1 : 0);
    const n = startNo + Math.floor(ply / 2);
    return ply % 2 === 0 ? `${n}.` : k === 1 ? `${n}...` : '';
  };

  return (
    <div className="method-demo">
      <Board
        fen={f.fen}
        orientation={pos.me === 'w' ? 'white' : 'black'}
        turnColor={c.turn() === 'w' ? 'white' : 'black'}
        lastMove={f.lastMove}
        check={c.inCheck() ? (c.turn() === 'w' ? 'white' : 'black') : false}
        squareClasses={classes}
        viewOnly
        sides
      />
      <div className="demo-caption">
        <div className="tiny muted">
          {i === 0 ? 'Thế cờ ban đầu' : `${moveNo(i) || `${moveNo(i - 1).replace('.', '')}...`} ${f.san}`}
          {box && <span> · Vua {def === 'w' ? 'Trắng' : 'Đen'} còn {box.size} ô (vùng tô đỏ)</span>}
        </div>
        <div>
          {i === 0
            ? playing
              ? 'Lời giải đang tự chạy. Bấm ⏸ Dừng để xem chậm, rồi ◀ ▶ để đi từng nước.'
              : 'Bấm “▶ Chạy” để xem tự động, hoặc nút ▶ bên phải để đi từng nước.'
            : note || (f.mover === pos.me ? '' : 'Đối phương đi.')}
        </div>
      </div>
      <div className="row" style={{ justifyContent: 'center', gap: 6 }}>
        <Button kind="ghost" onClick={() => { setPlaying(false); setI(0); }}>⏮</Button>
        <Button kind="ghost" onClick={() => { setPlaying(false); setI(Math.max(0, i - 1)); }}>◀</Button>
        <Button
          kind="primary"
          onClick={() => {
            if (i >= frames.length - 1) setI(0);
            setPlaying(!playing || i >= frames.length - 1);
          }}
        >
          {playing ? '⏸ Dừng' : '▶ Chạy'}
        </Button>
        <Button kind="ghost" onClick={() => { setPlaying(false); setI(Math.min(frames.length - 1, i + 1)); }}>▶</Button>
        <Button kind="ghost" onClick={() => { setPlaying(false); setI(frames.length - 1); }}>⏭</Button>
      </div>
      <div className="demo-moves">
        {frames.slice(1).map((fr, k) => (
          <button key={k} className={`mv ${i === k + 1 ? 'cur' : ''} ${fr.note && fr.mover === pos.me ? 'noted' : ''}`} onClick={() => { setPlaying(false); setI(k + 1); }}>
            {moveNo(k + 1)}
            {fr.san}
          </button>
        ))}
      </div>
    </div>
  );
}
