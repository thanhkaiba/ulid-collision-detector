import { Chess } from 'chess.js';
import { toWhitePov, winPercent, type Engine } from './engine';
import { moveToUci, uciLineToSan, START_FEN } from './chess-utils';
import type { GameAnalysis, Judgment, Mistake, PlyAnalysis, StoredGame } from './storage';

type Score = { cp?: number; mate?: number };

/** Position the game starts from: the PGN's FEN tag for a game set up from a position, else the usual start. */
export function startFenOf(game: { pgn?: string }): string {
  const m = game.pgn?.match(/\[FEN\s+"([^"]+)"\]/);
  if (m) {
    try {
      return new Chess(m[1]).fen();
    } catch {
      /* broken tag: fall back to the normal start */
    }
  }
  return START_FEN;
}

/** Side to move in a FEN: the side that plays the move made from it. */
export const sideOf = (fen: string): 'w' | 'b' => (fen.split(' ')[1] === 'b' ? 'b' : 'w');

/** "12." or "12..." for the move played from `fen`, numbered as in the game (a set-up position may start at move 30). */
export function moveNumberOf(fen: string): string {
  const n = Number(fen.split(' ')[5]) || 1;
  return `${n}${sideOf(fen) === 'w' ? '.' : '...'}`;
}

/** Replay a game's SAN moves from its start position. Throws a readable error if a move does not fit. */
export function replayGame(game: StoredGame): { fenBefore: string; fenAfter: string; san: string; uci: string; from: string; to: string }[] {
  const chess = new Chess(startFenOf(game));
  const out: { fenBefore: string; fenAfter: string; san: string; uci: string; from: string; to: string }[] = [];
  for (const san of game.moves) {
    const fenBefore = chess.fen();
    let m;
    try {
      m = chess.move(san);
    } catch {
      throw new Error(`Không đọc được ván này: nước ${moveNumberOf(fenBefore)} ${san} không hợp lệ.`);
    }
    out.push({ fenBefore, fenAfter: chess.fen(), san: m.san, uci: moveToUci(m), from: m.from, to: m.to });
  }
  return out;
}

export function judge(winLoss: number, isBest: boolean): Judgment {
  if (isBest) return 'best';
  if (winLoss >= 30) return 'blunder';
  if (winLoss >= 20) return 'mistake';
  if (winLoss >= 10) return 'inaccuracy';
  return 'good';
}

/** Lichess accuracy formula for a single move. */
export function moveAccuracy(winLoss: number): number {
  return Math.max(0, Math.min(100, 103.1668 * Math.exp(-0.04354 * Math.max(0, winLoss)) - 3.1669));
}

const emptyCounts = (): Record<Judgment, number> => ({ best: 0, good: 0, inaccuracy: 0, mistake: 0, blunder: 0, book: 0 });

/**
 * Analyse a game move by move with the local engine.
 * If the game carries Lichess server evals, those are used for the eval curve and the engine is
 * only consulted (for the best move) on positions where the player lost ground.
 */
export async function analyzeGame(
  game: StoredGame,
  engine: Engine,
  depth: number,
  onProgress?: (done: number, total: number, partial: PlyAnalysis[]) => void,
  signal?: { cancelled: boolean },
): Promise<GameAnalysis | null> {
  const verbose = replayGame(game);
  const total = verbose.length;
  const startFen = startFenOf(game);
  await engine.fullStrength();
  const useServer = total > 0 && !!game.serverEvals && game.serverEvals.length >= total - 1;

  // evals[k] = eval of the position after k plies (white POV); evals[0] = start position
  const evals: (Score | undefined)[] = new Array(total + 1);
  const bests: (string[] | undefined)[] = new Array(total + 1); // pv in position k

  const evalPos = async (k: number) => {
    const fen = k === 0 ? startFen : verbose[k - 1].fenAfter;
    const c = new Chess(fen);
    if (c.isGameOver()) {
      evals[k] = c.isCheckmate() ? { mate: c.turn() === 'w' ? -0 : 0, cp: undefined } : { cp: 0 };
      if (c.isCheckmate()) evals[k] = c.turn() === 'w' ? { mate: -1 } : { mate: 1 }; // mated side has no moves
      bests[k] = [];
      return;
    }
    const r = await engine.evaluate(fen, { depth });
    const line = r.lines[0];
    // with server evals the curve stays the server's: the local engine only supplies lines
    if (!useServer || evals[k] === undefined) evals[k] = line ? toWhitePov(line, c.turn()) : { cp: 0 };
    bests[k] = line?.pv ?? [r.bestmove];
  };

  if (useServer) {
    // the usual start is worth a little for White; a set-up position gets a real evaluation
    if (startFen === START_FEN) evals[0] = { cp: 15 };
    else await evalPos(0);
    for (let k = 1; k <= total; k++) {
      const s = game.serverEvals![k - 1];
      evals[k] = s ?? evals[k - 1];
    }
    // a mated final position may be missing from server evals
    const last = new Chess(verbose[total - 1].fenAfter);
    if (last.isCheckmate()) evals[total] = last.turn() === 'w' ? { mate: -1 } : { mate: 1 };
  }

  const plies: PlyAnalysis[] = [];
  for (let i = 0; i < total; i++) {
    if (signal?.cancelled) return null;
    const mover = sideOf(verbose[i].fenBefore);
    if (!useServer) {
      if (evals[i] === undefined) await evalPos(i);
      if (evals[i + 1] === undefined) await evalPos(i + 1);
    }
    const before = evals[i]!;
    const after = evals[i + 1]!;
    const wpBefore = winPercent(before);
    const wpAfter = winPercent(after);
    const winLoss = mover === 'w' ? wpBefore - wpAfter : wpAfter - wpBefore;
    let pv = bests[i];
    if (!pv && (winLoss >= 10 || !useServer)) {
      await evalPos(i);
      pv = bests[i];
    }
    // refutation of the played move, needed to explain the mistake in words
    if (winLoss >= 10 && bests[i + 1] === undefined) await evalPos(i + 1);
    if (signal?.cancelled) return null;
    const best = pv?.[0] ?? verbose[i].uci;
    // without an engine pv (server evals, no ground lost) we cannot claim the move was best
    const isBest = !!pv?.length && best === verbose[i].uci;
    const judgment = judge(winLoss, isBest);
    plies.push({
      ply: i,
      san: verbose[i].san,
      uci: verbose[i].uci,
      fenBefore: verbose[i].fenBefore,
      evalBefore: before,
      evalAfter: after,
      best,
      bestSan: uciLineToSan(verbose[i].fenBefore, [best])[0] ?? best,
      bestPv: pv ?? [best],
      refPv: winLoss >= 10 ? bests[i + 1] : undefined,
      judgment,
      winLoss: Math.max(0, winLoss),
    });
    onProgress?.(i + 1, total, plies);
  }

  const counts = { w: emptyCounts(), b: emptyCounts() };
  const acc = { w: [] as number[], b: [] as number[] };
  for (const p of plies) {
    const side = sideOf(p.fenBefore);
    counts[side][p.judgment]++;
    acc[side].push(moveAccuracy(p.winLoss));
  }
  const mean = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
  return {
    gameId: game.id,
    depth: useServer ? 0 : depth,
    at: Date.now(),
    plies,
    accuracy: { w: Math.round(mean(acc.w)), b: Math.round(mean(acc.b)) },
    counts,
  };
}

/** Extract the user's own mistakes as spaced-repetition items. */
export function extractMistakes(game: StoredGame, analysis: GameAnalysis): Mistake[] {
  if (!game.me) return [];
  const out: Mistake[] = [];
  for (const p of analysis.plies) {
    const side = sideOf(p.fenBefore);
    if (side !== game.me) continue;
    if (p.judgment !== 'mistake' && p.judgment !== 'blunder') continue;
    // skip positions that were already lost: there is nothing to learn from -8 -> -12
    const wpBefore = winPercent(p.evalBefore);
    const myWp = side === 'w' ? wpBefore : 100 - wpBefore;
    if (myWp < 8) continue;
    if (p.best === p.uci) continue;
    out.push({
      id: `${game.id}:${p.ply}`,
      gameId: game.id,
      ply: p.ply,
      fen: p.fenBefore,
      played: p.uci,
      playedSan: p.san,
      best: p.best,
      bestSan: p.bestSan,
      bestPv: p.bestPv,
      judgment: p.judgment,
      winLoss: p.winLoss,
      color: side,
      at: Date.now(),
      due: Date.now(),
      interval: 0,
      reps: 0,
    });
  }
  return out;
}
