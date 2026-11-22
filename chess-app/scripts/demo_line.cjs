/**
 * node scripts/demo_line.cjs "<fen>" [--plies N] [--depth D] [-- san san ...]
 * Plays the given moves ('_' = let the engine choose that ply), then lets Stockfish continue for both sides (best play) and prints the whole line
 * with the engine evaluation after every ply. Used to build the animated method demos in src/data/practice.ts.
 */
const path = require('path');
const { spawn } = require('child_process');
const { Chess } = require('chess.js');
const args = process.argv.slice(2);
const dd = args.indexOf('--');
const given = dd >= 0 ? args.slice(dd + 1) : [];
const opts = dd >= 0 ? args.slice(0, dd) : args;
const fen = opts[0];
const get = (k, d) => { const i = opts.indexOf(k); return i >= 0 ? Number(opts[i + 1]) : d; };
const maxPlies = get('--plies', 60), depth = get('--depth', 18);
const sf = spawn(process.execPath, [path.join(__dirname, '..', 'node_modules/stockfish/src/stockfish-17.1-lite-single-03e3232.js')], { stdio: ['pipe', 'pipe', 'ignore'] });
let buf = ''; let on = () => {};
sf.stdout.on('data', (d) => { buf += d; let i; while ((i = buf.indexOf('\n')) >= 0) { const l = buf.slice(0, i).trim(); buf = buf.slice(i + 1); on(l); } });
const go = (f) => new Promise((res) => { let sc = ''; on = (l) => { const m = /score (cp|mate) (-?\d+)/.exec(l); if (m) sc = (m[1] === 'mate' ? '#' : '') + m[2]; if (l.startsWith('bestmove')) res({ move: l.split(' ')[1], sc }); }; sf.stdin.write(`position fen ${f}\ngo depth ${depth}\n`); });
(async () => {
  sf.stdin.write('uci\n');
  const c = new Chess(fen);
  const out = [];
  const white = (s) => s; // eval printed from White's view
  for (let i = 0; i < maxPlies && !c.isGameOver(); i++) {
    let san;
    const r = await go(c.fen());
    const sign = c.turn() === 'w' ? 1 : -1;
    const ev = r.sc.startsWith('#') ? '#' + Number(r.sc.slice(1)) * sign : String(Number(r.sc) * sign);
    if (i < given.length && given[i] !== '_') { try { san = c.move(given[i]).san; } catch { console.log('ILLEGAL', given[i], 'at ply', i, c.fen(), 'legal:', c.moves().join(' ')); process.exit(1); } out.push(`${san}{${ev}}`); }
    else { const m = c.move({ from: r.move.slice(0, 2), to: r.move.slice(2, 4), promotion: r.move[4] }); out.push(`${m.san}(${ev})`); }
  }
  const n0 = Number(fen.split(' ')[5]); const bl = fen.split(' ')[1] === 'b';
  console.log(out.map((s, i) => { const ply = i + (bl ? 1 : 0); return (ply % 2 === 0 ? `${n0 + ply / 2}.` : i === 0 ? `${n0}...` : '') + s; }).join(' '));
  console.log(c.fen(), c.isCheckmate() ? 'MATE' : c.isDraw() ? 'DRAW' : '');
  process.exit(0);
})();
