import { Chess } from 'chess.js';
import Board from './Board';
import type { Preview } from '../lib/richtext';
import type { DrawShape } from 'chessground/draw';

/** Bottom sheet with a small board, used where the page has no board of its own. */
export default function PreviewSheet({ preview, onClose, orientation = 'white' }: { preview: Preview | null; onClose: () => void; orientation?: 'white' | 'black' }) {
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
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="row-between mb">
          <b className="small">{preview.label}</b>
          <button className="chip" onClick={onClose}>
            Đóng
          </button>
        </div>
        <Board fen={preview.fen} orientation={orientation} turnColor={turn} lastMove={preview.lastMove} check={check} viewOnly shapes={shapes} />
      </div>
    </div>
  );
}
