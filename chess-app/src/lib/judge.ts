import { Chess } from 'chess.js';
import { getEngine, toWhitePov, winPercent } from './engine';
import { playUci } from './chess-utils';

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
