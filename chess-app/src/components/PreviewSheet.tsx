import { useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import Board from './Board';
import LinePlayer from './LinePlayer';
import type { Preview } from '../lib/richtext';
import type { DrawShape } from 'chessground/draw';

let openSheets = 0;
const sheetEntry = () => !!(history.state as { sheet?: number } | null)?.sheet;

/**
 * While the sheet is open, the phone's back button (and Escape) closes it instead of leaving the page: opening pushes a
 * same-URL history entry, closing pops it again. Written to survive React StrictMode's mount/unmount/mount.
 */
function useBackCloses(open: boolean, onClose: () => void) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    if (!open) return;
    openSheets++;
    if (!sheetEntry()) {
      try {
        history.pushState({ ...((history.state as object | null) ?? {}), sheet: 1 }, '');
      } catch {
        /* ignore */
      }
    }
    const onPop = () => {
      if (!sheetEntry()) closeRef.current();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeRef.current();
    };
    window.addEventListener('popstate', onPop);
    window.addEventListener('keydown', onKey);
    return () => {
      openSheets--;
      window.removeEventListener('popstate', onPop);
      window.removeEventListener('keydown', onKey);
      window.setTimeout(() => {
        if (openSheets === 0 && sheetEntry()) history.back();
      }, 0);
    };
  }, [open]);
}

/** Bottom sheet with a small board, used where the page has no board of its own. */
export default function PreviewSheet({ preview, onClose, orientation = 'white' }: { preview: Preview | null; onClose: () => void; orientation?: 'white' | 'black' }) {
  useBackCloses(!!preview, onClose);
  if (!preview) return null;
  let turn: 'white' | 'black' = 'white';
  let check: 'white' | 'black' | false = false;
  try {
    const c = new Chess(preview.fen);
    turn = c.turn() === 'w' ? 'white' : 'black';
    check = c.inCheck() ? turn : false;
  } catch {
    /* display-only position */
  }
  const shapes: DrawShape[] = (preview.squares ?? []).map((s) => ({ orig: s, brush: 'yellow' }));
  // a move inside a sequence ("Sau 3...Nd4"): replay the moves that led here, from the first one
  const intro = sansOf(preview.path ?? []);
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={preview.label} onClick={(e) => e.stopPropagation()}>
        <div className="row-between mb">
          <b className="small">{preview.label}</b>
          <button className="chip" onClick={onClose}>
            Đóng
          </button>
        </div>
        {intro.length >= 2 ? (
          <LinePlayer key={preview.label} fen={preview.fen} intro={intro} introFen={preview.path![0]} orientation={orientation} lastMove={preview.lastMove} target={`Thế cờ sau ${preview.label}`} />
        ) : (
          <Board fen={preview.fen} orientation={orientation} turnColor={turn} lastMove={preview.lastMove} check={check} viewOnly sides shapes={shapes} />
        )}
      </div>
    </div>
  );
}

/** the SAN moves between consecutive positions (stops at the first gap) */
function sansOf(path: string[]): string[] {
  const out: string[] = [];
  const key = (f: string) => f.split(' ').slice(0, 4).join(' ');
  for (let i = 0; i + 1 < path.length; i++) {
    let found = '';
    try {
      const c = new Chess(path[i]);
      for (const m of c.moves({ verbose: true })) {
        if (key(m.after) === key(path[i + 1])) {
          found = m.san;
          break;
        }
      }
    } catch {
      /* not a legal position */
    }
    if (!found) return [];
    out.push(found);
  }
  return out;
}
