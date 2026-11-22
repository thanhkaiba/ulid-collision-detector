/**
 * Picks Lichess puzzles for lesson slots and checks each with Stockfish:
 * the first solving move must be the engine's best and leave the solver clearly better.
 *   node scripts/pick_lesson_puzzles.cjs
 */
const path = require('path');
const { spawn } = require('child_process');
const { Chess } = require('chess.js');
const rows = require('../src/data/puzzles.json');
const sf = spawn(process.execPath, [path.join(__dirname, '..', 'node_modules/stockfish/src/stockfish-17.1-lite-single-03e3232.js')], { stdio: ['pipe', 'pipe', 'ignore'] });
let buf = ''; let on = () => {};
sf.stdout.on('data', (d) => { buf += d; let i; while ((i = buf.indexOf('\n')) >= 0) { const l = buf.slice(0, i).trim(); buf = buf.slice(i + 1); on(l); } });
const go = (fen, extra = '') => new Promise((res) => { let last = null; on = (l) => { const m = /multipv 1 score (cp|mate) (-?\d+).* pv (\S+)/.exec(l); if (m) last = { kind: m[1], v: +m[2], move: m[3] }; if (l.startsWith('bestmove')) res({ best: l.split(' ')[1], ...last }); }; sf.stdin.write(`position fen ${fen}\ngo depth 16${extra}\n`); });
const score = (r) => (r.kind === 'mate' ? (r.v > 0 ? 10000 - r.v : -10000 - r.v) : r.v);
const SLOTS = [
  { slot: 'fork-knight', theme: 'fork', piece: 'n', lo: 600, hi: 1000 },
  { slot: 'fork-pawn', theme: 'fork', piece: 'p', lo: 600, hi: 1100 },
  { slot: 'fork-queen', theme: 'fork', piece: 'q', lo: 600, hi: 1000 },
  { slot: 'pin', theme: 'pin', lo: 600, hi: 1000 },
  { slot: 'skewer', theme: 'skewer', lo: 600, hi: 1100 },
  { slot: 'discovered', theme: 'discoveredAttack', lo: 600, hi: 1100 },
  { slot: 'backrank', theme: 'backRankMate', lo: 600, hi: 1000 },
  { slot: 'hanging', theme: 'hangingPiece', lo: 500, hi: 800 },
];
(async () => {
  sf.stdin.write('uci\n');
  for (const s of SLOTS) {
    const cands = rows
      .filter(([, , mv, r, th]) => r >= s.lo && r <= s.hi && th.split(' ').includes(s.theme) && mv.split(' ').length <= 4)
      .filter(([, fen, mv]) => { if (!s.piece) return true; const c = new Chess(fen); const u = mv.split(' '); c.move({ from: u[0].slice(0, 2), to: u[0].slice(2, 4), promotion: u[0][4] }); return c.get(u[1].slice(0, 2))?.type === s.piece; })
      .sort((a, b) => a[3] - b[3]);
    const ok = [];
    for (const [id, fen, mv, r, th] of cands) {
      if (ok.length >= 3) break;
      const u = mv.split(' ');
      const c = new Chess(fen); c.move({ from: u[0].slice(0, 2), to: u[0].slice(2, 4), promotion: u[0][4] });
      const pos = c.fen();
      const all = await go(pos);
      const sol = await go(pos, ` searchmoves ${u[1]}`);
      if (all.best !== u[1] || score(sol) < 250) continue;
      // the solver must not be already winning before the tactic (a real turning point)
      const before = await go(fen);
      const solverBefore = -score(before);
      if (solverBefore > 300) continue;
      const pieces = c.board().flat().filter(Boolean).length;
      ok.push(`${id} r${r} pieces${pieces} sol${score(sol)} before${solverBefore} [${th}] ${mv}`);
    }
    console.log(`== ${s.slot} (${cands.length} candidates)\n  ` + ok.join('\n  '));
  }
  process.exit(0);
})();
