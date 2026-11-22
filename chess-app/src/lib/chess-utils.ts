import { Chess, type Square, type Move } from 'chess.js';
import type { Key, Color } from 'chessground/types';

export type Dests = Map<Key, Key[]>;

/** Legal destinations map for chessground. */
export function toDests(chess: Chess): Dests {
  const dests: Dests = new Map();
  for (const m of chess.moves({ verbose: true })) {
    const arr = dests.get(m.from as Key) ?? [];
    arr.push(m.to as Key);
    dests.set(m.from as Key, arr);
  }
  return dests;
}

export function turnColor(chess: Chess): Color {
  return chess.turn() === 'w' ? 'white' : 'black';
}

export function fullColor(c: 'w' | 'b'): Color {
  return c === 'w' ? 'white' : 'black';
}

/** Play a UCI move (e2e4, e7e8q) on a Chess instance. Returns the move or null if illegal. */
export function playUci(chess: Chess, uci: string): Move | null {
  const from = uci.slice(0, 2) as Square;
  const to = uci.slice(2, 4) as Square;
  const promotion = uci.length > 4 ? uci[4] : undefined;
  try {
    return chess.move({ from, to, promotion });
  } catch {
    return null;
  }
}

export function moveToUci(m: Move): string {
  return m.from + m.to + (m.promotion ?? '');
}

/** Convert a UCI move list from a FEN into SAN list. Stops at the first illegal move. */
export function uciLineToSan(fen: string, ucis: string[]): string[] {
  const c = new Chess(fen);
  const out: string[] = [];
  for (const u of ucis) {
    const m = playUci(c, u);
    if (!m) break;
    out.push(m.san);
  }
  return out;
}

/** Does the move need a promotion choice? */
export function needsPromotion(chess: Chess, from: Key, to: Key): boolean {
  const piece = chess.get(from as Square);
  if (!piece || piece.type !== 'p') return false;
  const rank = to[1];
  return (piece.color === 'w' && rank === '8') || (piece.color === 'b' && rank === '1');
}

export function kingInCheckColor(chess: Chess): Color | false {
  return chess.inCheck() ? turnColor(chess) : false;
}

export interface GameEnd {
  over: boolean;
  result?: '1-0' | '0-1' | '1/2-1/2';
  reason?: string;
}

export function gameEnd(chess: Chess): GameEnd {
  if (chess.isCheckmate()) {
    return { over: true, result: chess.turn() === 'w' ? '0-1' : '1-0', reason: 'Chiếu hết' };
  }
  if (chess.isStalemate()) return { over: true, result: '1/2-1/2', reason: 'Hết nước đi (pat)' };
  if (chess.isThreefoldRepetition()) return { over: true, result: '1/2-1/2', reason: 'Lặp lại 3 lần' };
  if (chess.isInsufficientMaterial()) return { over: true, result: '1/2-1/2', reason: 'Không đủ quân chiếu hết' };
  if (chess.isDrawByFiftyMoves()) return { over: true, result: '1/2-1/2', reason: 'Luật 50 nước' };
  return { over: false };
}

export function fmtClock(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (m >= 60) {
    const h = Math.floor(m / 60);
    return `${h}:${String(m % 60).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
  }
  return `${m}:${String(r).padStart(2, '0')}`;
}

export const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
