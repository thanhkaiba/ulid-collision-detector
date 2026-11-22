/** node scripts/eval_fen.cjs "<fen>" [depth] [multipv] [-- san san ...]  : play optional moves, print board, top engine lines (White POV). */
const path = require('path');
const { spawn } = require('child_process');
const { Chess } = require('chess.js');
const args = process.argv.slice(2);
const dd = args.indexOf('--');
const sans = dd >= 0 ? args.slice(dd + 1) : [];
const [fen, depth = '20', mpv = '4'] = dd >= 0 ? args.slice(0, dd) : args;
const c = new Chess(fen);
for (const s of sans) { try { c.move(s); } catch { console.log('ILLEGAL', s, 'legal:', c.moves().join(' ')); process.exit(1); } }
console.log(c.ascii()); console.log(c.fen());
if (c.isGameOver()) { console.log('game over', c.isCheckmate() ? 'mate' : 'draw'); process.exit(0); }
const sf = spawn(process.execPath, [path.join(__dirname, '..', 'node_modules/stockfish/src/stockfish-17.1-lite-single-03e3232.js')], { stdio: ['pipe', 'pipe', 'ignore'] });
const lines = {}; let buf = '';
const sign = c.turn() === 'w' ? 1 : -1;
sf.stdout.on('data', (d) => { buf += d; let i; while ((i = buf.indexOf('\n')) >= 0) { const l = buf.slice(0, i).trim(); buf = buf.slice(i + 1);
  const m = /multipv (\d+) score (cp|mate) (-?\d+).* pv (.*)$/.exec(l); if (m) lines[m[1]] = { s: m[2] === 'cp' ? ((Number(m[3]) * sign) / 100).toFixed(2) : '#' + Number(m[3]) * sign, pv: m[4].split(' ') };
  if (l.startsWith('bestmove')) { for (const k of Object.keys(lines)) { const t = new Chess(c.fen()); const out = []; for (const u of lines[k].pv.slice(0, 8)) { try { out.push(t.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] }).san); } catch { break; } } console.log(`${k}. ${lines[k].s}  ${out.join(' ')}`); } process.exit(0); } } });
sf.stdin.write(`uci\nsetoption name MultiPV value ${mpv}\nposition fen ${c.fen()}\ngo depth ${depth}\n`);
