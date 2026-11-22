/**
 * Author tooling for the "Từng nước một" series.
 *   node scripts/games/tool.cjs evals <id> [depth]         -> engine table for every move of the game
 *   node scripts/games/tool.cjs line <id> <ply> <san...>   -> check a variation starting AFTER ply <ply> (0 = start position)
 *                                                            (to test an alternative to move N, pass the ply BEFORE it)
 *   node scripts/games/tool.cjs board <id> <ply> [sq...]    -> board after <ply> half-moves, attackers/defenders of squares, open files
 *   node scripts/games/tool.cjs deep <id> <ply> [depth]     -> top 3 engine moves at higher depth (default 22)
 *   node scripts/games/tool.cjs check <annotations.json>   -> validate an annotation file
 * Scores are in pawns from White's point of view (+ = White better). "#3" = mate in 3 for White, "#-3" for Black.
 */
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { Chess } = require('chess.js');
const META = JSON.parse(fs.readFileSync(path.join(__dirname, 'meta.json'), 'utf8'));
const ENGINE = path.join(__dirname, '..', '..', 'node_modules/stockfish/src/stockfish-17.1-lite-single-03e3232.js');

function engine() {
  const sf = spawn(process.execPath, [ENGINE], { stdio: ['pipe', 'pipe', 'ignore'] });
  let buf = ''; const waiters = [];
  sf.stdout.on('data', (d) => { buf += d.toString(); let i; while ((i = buf.indexOf('\n')) >= 0) { const l = buf.slice(0, i).trim(); buf = buf.slice(i + 1); for (const w of [...waiters]) w(l); } });
  const send = (c) => sf.stdin.write(c + '\n');
  const until = (pred) => new Promise((res) => { const fn = (l) => { if (pred(l)) { waiters.splice(waiters.indexOf(fn), 1); res(l); } }; waiters.push(fn); });
  return {
    async init() { send('uci'); await until((l) => l === 'uciok'); send('setoption name Hash value 128'); send('isready'); await until((l) => l === 'readyok'); },
    /** returns {cp|mate (white POV), pv: [uci]} */
    async go(fen, depth) {
      let last = null;
      const fn = (l) => { if (l.startsWith('info') && l.includes(' pv ') && / multipv 1 /.test(l + ' ')) { const m = /score (cp|mate) (-?\d+)/.exec(l); if (m) last = { kind: m[1], v: Number(m[2]), pv: l.split(' pv ')[1].split(' ') }; } };
      waiters.push(fn);
      send(`position fen ${fen}`); send(`go depth ${depth}`);
      await until((l) => l.startsWith('bestmove'));
      waiters.splice(waiters.indexOf(fn), 1);
      const sign = fen.split(' ')[1] === 'w' ? 1 : -1;
      if (!last) return { cp: 0, pv: [] };
      return last.kind === 'cp' ? { cp: last.v * sign, pv: last.pv } : { mate: last.v * sign, pv: last.pv };
    },
    quit() { send('quit'); },
  };
}
const fmt = (s) => (s.mate !== undefined ? `#${s.mate}` : (s.cp >= 0 ? '+' : '') + (s.cp / 100).toFixed(2));
const num = (s) => (s.mate !== undefined ? (s.mate > 0 ? 100 - s.mate * 0.01 : -100 - s.mate * 0.01) : s.cp / 100);
function pvSan(fen, pv, n = 6) { const c = new Chess(fen); const out = []; for (const u of pv.slice(0, n)) { try { const m = c.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] }); out.push(m.san); } catch { break; } } return out.join(' '); }
function label(ply) { return `${Math.floor(ply / 2) + 1}${ply % 2 === 0 ? '.' : '...'}`; }

async function evals(id, depth) {
  const g = META[id]; if (!g) throw new Error('unknown game ' + id);
  const e = engine(); await e.init();
  const c = new Chess();
  let prev = await e.go(c.fen(), depth);
  const lines = [`# ${g.white} – ${g.black}, ${g.event} ${g.year} (${g.result}). Depth ${depth}. Scores: pawns, White's point of view.`,
    '# ply | move | eval after | engine preferred (if different) and its line | flag'];
  for (let i = 0; i < g.moves.length; i++) {
    const fenBefore = c.fen();
    const bestSan = pvSan(fenBefore, prev.pv, 1);
    const bestLine = pvSan(fenBefore, prev.pv, 6);
    c.move(g.moves[i]);
    const after = c.isGameOver() ? (c.isCheckmate() ? { mate: i % 2 === 0 ? 0.0001 : -0.0001 } : { cp: 0 }) : await e.go(c.fen(), depth);
    const mover = i % 2 === 0 ? 1 : -1;
    const loss = (num(prev) - num(after)) * mover;
    const flag = loss > 2 ? 'BLUNDER' : loss > 0.9 ? 'MISTAKE' : loss > 0.4 ? 'inaccuracy' : '';
    const diff = bestSan && bestSan !== g.moves[i];
    lines.push(`${String(i + 1).padStart(3)} | ${label(i)}${g.moves[i]} | ${c.isCheckmate() ? 'mate' : fmt(after)} | ${diff ? `best ${bestSan} (${fmt(prev)}): ${bestLine}` : 'engine agrees'} | ${flag}`);
    prev = after;
  }
  e.quit();
  return lines.join('\n');
}

async function line(id, ply, sans) {
  const g = META[id]; const c = new Chess();
  for (let i = 0; i < ply; i++) c.move(g.moves[i]);
  console.log(`start: after ply ${ply}${ply ? ' (' + label(ply - 1) + g.moves[ply - 1] + ')' : ''}  fen ${c.fen()}`);
  for (const s of sans) { try { c.move(s); } catch { console.log(`ILLEGAL: ${s} in ${c.fen()}  legal: ${c.moves().join(' ')}`); process.exit(1); } }
  if (c.isCheckmate()) { console.log('line ends in CHECKMATE'); return; }
  if (c.isStalemate()) { console.log('line ends in STALEMATE'); return; }
  const e = engine(); await e.init();
  const r = await e.go(c.fen(), 18);
  console.log(`after line: eval ${fmt(r)} (White POV); material ${material(c)}; engine continues: ${pvSan(c.fen(), r.pv, 8)}`);
  e.quit();
}
function material(c) { const v = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 }; let w = 0, b = 0; for (const row of c.board()) for (const sq of row) if (sq) { if (sq.color === 'w') w += v[sq.type]; else b += v[sq.type]; } return `W${w}-B${b}`; }

/** Variation markup inside comments: {san san ...} starts AFTER the annotated move; {^san ...} starts BEFORE it (an alternative). */
function check(file) {
  const a = JSON.parse(fs.readFileSync(file, 'utf8'));
  const g = META[a.id]; const errs = []; const warn = [];
  if (!g) { console.log('unknown id', a.id); process.exit(1); }
  for (const k of ['title', 'theme', 'intro', 'outro']) if (!a[k] || typeof a[k] !== 'string') errs.push(`missing ${k}`);
  if (!Array.isArray(a.lessons) || a.lessons.length < 3) errs.push('lessons: need at least 3 takeaways');
  if (!Array.isArray(a.moves) || a.moves.length !== g.moves.length) errs.push(`moves: expected ${g.moves.length} entries, got ${a.moves && a.moves.length}`);
  const c = new Chess(); let words = 0; let vars = 0;
  const checkText = (text, where, before, after) => {
    for (const m of text.matchAll(/\{([^}]*)\}/g)) {
      vars++;
      let body = m[1].trim(); let pos = after;
      if (body.startsWith('^')) { body = body.slice(1).trim(); pos = before; }
      if (!pos) { errs.push(`${where}: variation not allowed here: {${m[1]}}`); continue; }
      const t = new Chess(pos);
      for (const s of body.split(/\s+/).filter(Boolean)) {
        if (/^\d+\.+$/.test(s)) { errs.push(`${where}: no move numbers inside braces: {${m[1]}}`); break; }
        try { t.move(s); } catch { errs.push(`${where}: illegal "${s}" in {${m[1]}} (legal here: ${t.moves().slice(0, 40).join(' ')})`); break; }
      }
    }
    if (/[{}]/.test(text.replace(/\{[^{}]*\}/g, ''))) errs.push(`${where}: unbalanced braces`);
  };
  checkText(a.intro || '', 'intro', null, new Chess().fen());
  (a.moves || []).forEach((mv, i) => {
    const where = `${label(i)}${g.moves[i] ?? '?'}`;
    if (mv.san !== g.moves[i]) errs.push(`${where}: san mismatch (file has ${mv.san})`);
    const before = c.fen();
    try { c.move(g.moves[i]); } catch { return; }
    if (!mv.c || !mv.c.trim()) errs.push(`${where}: empty comment`);
    else { words += mv.c.split(/\s+/).length; checkText(mv.c, where, before, c.fen()); if (mv.c.split(/\s+/).length < 6) warn.push(`${where}: very short comment`); }
  });
  checkText(a.outro || '', 'outro', null, c.fen());
  console.log(`${a.id}: ${a.moves ? a.moves.length : 0} moves, ${words} words of commentary, ${vars} variations, ${errs.length} errors, ${warn.length} warnings`);
  for (const e of errs) console.log('  ERROR', e);
  for (const w of warn.slice(0, 10)) console.log('  warn ', w);
  process.exit(errs.length ? 1 : 0);
}

/** Board after <ply> half-moves, with who attacks/defends the given squares and which files are open. */
function board(id, ply, squares) {
  const g = META[id]; const c = new Chess();
  for (let i = 0; i < ply; i++) c.move(g.moves[i]);
  console.log(`after ply ${ply}${ply ? ' (' + label(ply - 1) + g.moves[ply - 1] + ')' : ''}, ${c.turn() === 'w' ? 'White' : 'Black'} to move`);
  console.log(c.ascii()); console.log(c.fen());
  const files = 'abcdefgh'.split('');
  const pawns = { w: new Set(), b: new Set() };
  for (const row of c.board()) for (const sq of row) if (sq && sq.type === 'p') pawns[sq.color].add(sq.square[0]);
  console.log('open files (no pawns):', files.filter((f) => !pawns.w.has(f) && !pawns.b.has(f)).join(' ') || '-',
    '| half-open for White (no white pawn):', files.filter((f) => !pawns.w.has(f) && pawns.b.has(f)).join(' ') || '-',
    '| half-open for Black:', files.filter((f) => pawns.w.has(f) && !pawns.b.has(f)).join(' ') || '-');
  for (const sq of squares) {
    const pc = c.get(sq);
    console.log(`${sq}: ${pc ? (pc.color === 'w' ? 'white ' : 'black ') + pc.type.toUpperCase() : 'empty'} | attacked by White from: ${c.attackers(sq, 'w').join(' ') || '-'} | by Black from: ${c.attackers(sq, 'b').join(' ') || '-'}`);
  }
}

/** Deeper look at one position of the game: top 3 engine moves. */
async function deep(id, ply, depth) {
  const g = META[id]; const c = new Chess();
  for (let i = 0; i < ply; i++) c.move(g.moves[i]);
  const { execFileSync } = require('child_process');
  console.log(execFileSync(process.execPath, [path.join(__dirname, '..', 'eval_fen.cjs'), c.fen(), String(depth || 22), '3'], { encoding: 'utf8' }));
}

(async () => {
  const [cmd, a, b, ...rest] = process.argv.slice(2);
  if (cmd === 'evals') { const txt = await evals(a, Number(b) || 16); fs.writeFileSync(path.join(__dirname, 'evals', a + '.txt'), txt + '\n'); console.log(txt); process.exit(0); }
  else if (cmd === 'line') { await line(a, Number(b), rest); process.exit(0); }
  else if (cmd === 'board') { board(a, Number(b), rest); process.exit(0); }
  else if (cmd === 'deep') { await deep(a, Number(b), Number(rest[0]) || 22); process.exit(0); }
  else if (cmd === 'check') check(a);
  else { console.log('usage: evals <id> [depth] | line <id> <ply> <san...> | check <file.json>'); process.exit(1); }
})();
