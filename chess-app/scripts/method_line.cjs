/**
 * Builds a "method" line for the basic mates: the attacker follows the box method (shrink the area the lone
 * king can reach, never hang a piece, never stalemate, bring the king when the box cannot shrink), the defender
 * plays Stockfish's most stubborn move. Prints the SAN line and the box size after each attacker move.
 *   node scripts/method_line.cjs "<fen>" [maxPlies]
 */
const path = require('path');
const { spawn } = require('child_process');
const { Chess } = require('chess.js');
const fen = process.argv[2];
const maxPlies = Number(process.argv[3] || 80);
const sf = spawn(process.execPath, [path.join(__dirname, '..', 'node_modules/stockfish/src/stockfish-17.1-lite-single-03e3232.js')], { stdio: ['pipe', 'pipe', 'ignore'] });
let buf = ''; let on = () => {};
sf.stdout.on('data', (d) => { buf += d; let i; while ((i = buf.indexOf('\n')) >= 0) { const l = buf.slice(0, i).trim(); buf = buf.slice(i + 1); on(l); } });
const best = (f) => new Promise((res) => { on = (l) => { if (l.startsWith('bestmove')) res(l.split(' ')[1]); }; sf.stdin.write(`position fen ${f}\ngo depth 14\n`); });
const files = 'abcdefgh';
const sqs = []; for (const f of files) for (let r = 1; r <= 8; r++) sqs.push(f + r);
const kingSq = (c, color) => { for (const row of c.board()) for (const p of row) if (p && p.type === 'k' && p.color === color) return p.square; };
/** squares the lone king can reach by walking, avoiding attacked squares and the attacker's pieces */
function box(c, def) {
  const att = def === 'w' ? 'b' : 'w';
  const start = kingSq(c, def);
  const seen = new Set([start]); const q = [start];
  while (q.length) {
    const s = q.shift();
    const f = files.indexOf(s[0]), r = Number(s[1]);
    for (let df = -1; df <= 1; df++) for (let dr = -1; dr <= 1; dr++) {
      const nf = f + df, nr = r + dr; if (nf < 0 || nf > 7 || nr < 1 || nr > 8) continue;
      const n = files[nf] + nr; if (seen.has(n)) continue;
      const p = c.get(n);
      if (p && p.color === att) continue;
      if (c.isAttacked(n, att)) continue;
      seen.add(n); q.push(n);
    }
  }
  return seen;
}
const dist = (a, b) => Math.max(Math.abs(files.indexOf(a[0]) - files.indexOf(b[0])), Math.abs(Number(a[1]) - Number(b[1])));
(async () => {
  sf.stdin.write('uci\n');
  const c = new Chess(fen);
  const att = c.turn(); const def = att === 'w' ? 'b' : 'w';
  const out = [];
  for (let ply = 0; ply < maxPlies && !c.isGameOver(); ply++) {
    if (c.turn() === def) { const u = await best(c.fen()); out.push(c.move({ from: u.slice(0, 2), to: u.slice(2, 4) }).san); continue; }
    const cur = box(c, def).size;
    const ak = kingSq(c, att);
    const cands = [];
    for (const m of c.moves({ verbose: true })) {
      const t = new Chess(c.fen()); t.move(m);
      if (t.isCheckmate()) { cands.length = 0; cands.push({ m, mate: true }); break; }
      if (t.isStalemate()) continue;
      if (t.moves({ verbose: true }).some((x) => x.captured)) continue; // never hang a piece
      const dk = kingSq(t, def);
      // a piece the king can attack next move must be guarded by our king
      if (m.piece !== 'k' && dist(m.to, dk) <= 2 && dist(m.to, kingSq(t, att)) > 1) continue;
      cands.push({ m, size: box(t, def).size, kd: dist(kingSq(t, att), dk), far: dist(m.to, dk) });
    }
    let pick;
    if (cands[0]?.mate) pick = cands[0];
    else {
      const shrink = cands.filter((x) => x.m.piece !== 'k' && x.size < cur).sort((a, b) => a.size - b.size || b.far - a.far)[0];
      const approach = cands.filter((x) => x.m.piece === 'k' && x.size <= cur).sort((a, b) => a.kd - b.kd || a.size - b.size)[0];
      const wait = cands.filter((x) => x.m.piece !== 'k' && x.size <= cur).sort((a, b) => b.far - a.far)[0];
      const dkNow = kingSq(c, def);
      pick = shrink ?? (approach && approach.kd < dist(ak, dkNow) ? approach : null) ?? (approach && approach.kd <= 2 ? approach : null) ?? wait ?? approach ?? cands[0];
    }
    pick.size = pick.size ?? 0;
    const mv = c.move(pick.m);
    out.push(`${mv.san}[${c.isCheckmate() ? 'mate' : pick.size}]`);
  }
  console.log(out.join(' '));
  console.log(c.fen(), c.isCheckmate() ? 'MATE' : c.isDraw() ? 'DRAW' : '');
  process.exit(0);
})();
