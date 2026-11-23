import { Chess } from 'chess.js';
import { getEngine, toWhitePov, winPercent } from './engine';
import { playUci } from './chess-utils';

/**
 * Reject when `p` takes longer than `ms`. The engine never answers if its worker failed to load (offline before the
 * 7 MB file was cached, a slow phone still downloading it): callers must not wait on it forever.
 */
export function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = window.setTimeout(() => reject(new Error('engine timeout')), ms);
    p.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      },
    );
  });
}

/**
 * Is `uci` practically as good as the engine's first choice? Used when a solver leaves the scripted solution:
 * the move passes if it loses at most 6% winning chances, and in a mating task only if the mate is still forced.
 */
export async function judgeMove(uci: string, fenBefore: string, opts: { mate?: boolean } = {}): Promise<boolean> {
  const engine = getEngine();
  await engine.fullStrength();
  const side = fenBefore.split(' ')[1] as 'w' | 'b';
  const c = new Chess(fenBefore);
  if (!playUci(c, uci)) return false;
  if (c.isCheckmate()) return true;
  const mine = await engine.evaluate(c.fen(), { depth: 12 });
  if (!mine.lines[0]) return false;
  // after the move the opponent is to move: a negative mate score for them is a mate for the solver
  if (opts.mate) return mine.lines[0].mate !== undefined && mine.lines[0].mate < 0;
  const best = await engine.evaluate(fenBefore, { depth: 12 });
  if (!best.lines[0]) return false;
  const wpBest = winPercent(toWhitePov(best.lines[0], side));
  const wpMine = winPercent(toWhitePov(mine.lines[0], side === 'w' ? 'b' : 'w'));
  const loss = side === 'w' ? wpBest - wpMine : wpMine - wpBest;
  return loss <= 6;
}
