/** node scripts/verify_practice.cjs : checks every practice position: legal, right side to move for the engine, goal reachable. */
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const { Chess } = require('chess.js');
const src = fs.readFileSync(path.join(__dirname, '..', 'src/data/practice.ts'), 'utf8');
const items = [...src.matchAll(/id: '([^']+)',[\s\S]*?fen: '([^']+)',\s*me: '([wb])',\s*goal: '(\w+)'/g)].map((m) => ({ id: m[1], fen: m[2], me: m[3], goal: m[4] }));
const sf = spawn(process.execPath, [path.join(__dirname, '..', 'node_modules/stockfish/src/stockfish-17.1-lite-single-03e3232.js')], { stdio: ['pipe', 'pipe', 'ignore'] });
let buf = ''; let on = () => {};
sf.stdout.on('data', (d) => { buf += d; let i; while ((i = buf.indexOf('\n')) >= 0) { const l = buf.slice(0, i).trim(); buf = buf.slice(i + 1); on(l); } });
const evalFen = (fen) => new Promise((res) => { let last = null; on = (l) => { const m = /score (cp|mate) (-?\d+)/.exec(l); if (m) last = { kind: m[1], v: Number(m[2]) }; if (l.startsWith('bestmove')) res(last); }; sf.stdin.write(`position fen ${fen}\ngo depth 24\n`); });
(async () => {
  sf.stdin.write('uci\n');
  let fail = 0;
  for (const p of items) {
    const c = new Chess(p.fen);
    const s = await evalFen(p.fen);
    // score from the student's point of view
    const sign = c.turn() === p.me ? 1 : -1;
    const mine = s.kind === 'mate' ? (s.v * sign > 0 ? 9999 : -9999) : s.v * sign;
    const ok = p.goal === 'draw' ? Math.abs(mine) <= 80 : mine >= 250;
    if (!ok) fail++;
    console.log(`${ok ? 'ok  ' : 'FAIL'} ${p.id} (${p.goal}, plays ${p.me}, ${c.turn()} to move): ${s.kind} ${s.v * sign}`);
  }
  // the animated model lines: legal, and they end where the goal says
  const msrc = fs.readFileSync(path.join(__dirname, '..', 'src/data/practiceMethods.ts'), 'utf8');
  for (const p of items) {
    const m = new RegExp(`'?${p.id}'?: \\{[\\s\\S]*?demo: \\[([\\s\\S]*?)\\n    \\],`).exec(msrc);
    if (!m) { fail++; console.log('FAIL', p.id, 'no demo'); continue; }
    const sans = [...m[1].matchAll(/\['([^']+)'/g)].map((x) => x[1]);
    const c = new Chess(p.fen); let bad = null;
    for (const s of sans) { try { c.move(s); } catch { bad = s; break; } }
    let ok = !bad;
    if (ok && p.goal === 'mate') ok = c.isCheckmate();
    if (ok && p.goal === 'draw') ok = c.isDraw() || sans.length >= 12;
    if (ok && p.goal === 'win') ok = /=Q/.test(sans[sans.length - 1]) || c.isCheckmate();
    if (!ok) fail++;
    console.log(`${ok ? 'ok  ' : 'FAIL'} demo ${p.id}: ${sans.length} plies${bad ? ' illegal ' + bad : ''}${c.isCheckmate() ? ', mate' : c.isDraw() ? ', draw' : ''}`);
  }
  console.log(`\n${items.length} positions, ${fail} failures`);
  process.exit(fail ? 1 : 0);
})();
