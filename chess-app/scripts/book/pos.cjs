/** node pos.cjs <unit id e.g. 0.1.5.37>  : context for reviewing one translated paragraph of the book. */
const fs = require('fs');
const { Chess } = require('/home/user/ulid-collision-detector/chess-app/node_modules/chess.js');
const orig = JSON.parse(fs.readFileSync(__dirname + '/book.json', 'utf8'));
const alg = JSON.parse(fs.readFileSync(__dirname + '/book_alg.json', 'utf8'));
const [pi, ci, si, bi] = process.argv[2].split('.').map((x) => (x === 'h' ? 'h' : Number(x)));
const sec = alg.parts[pi].chapters[ci].sections[si], osec = orig.parts[pi].chapters[ci].sections[si];
console.log('SECTION:', sec.heading);
const byId = new Map(sec.moves.map((m) => [String(m.id), m]));
const board = (fen) => { try { return new Chess(fen).ascii(); } catch { return '(position without kings: ' + fen + ')'; } };
if (bi === 'h' || bi === undefined) { console.log('(heading unit) ORIGINAL:', osec.heading); process.exit(0); }
let lastFig = null, lastFen = null;
for (let j = 0; j < bi; j++) {
  const b = sec.blocks[j];
  if (b.t === 'fig' && b.fen) { lastFig = b; lastFen = b.fen; }
  const txt = b.t === 'moves' ? b.rows.map((r) => (r.w || '') + ' ' + (r.b || '')).join(' ') : b.text || '';
  for (const m of txt.matchAll(/⟦(\d+)\|/g)) { const mv = byId.get(m[1]); if (mv && !mv.lone) lastFen = mv.fen; }
}
if (lastFig) { console.log(`\nLAST DIAGRAM before this paragraph (Fig ${lastFig.n}): ${lastFig.fen}`); console.log(board(lastFig.fen)); }
if (lastFen && (!lastFig || lastFen !== lastFig.fen)) { console.log('\nMAIN-LINE POSITION just before this paragraph:', lastFen); console.log(board(lastFen)); }
for (let j = Math.max(0, bi - 2); j <= Math.min(sec.blocks.length - 1, bi + 1); j++) {
  const b = sec.blocks[j], o = osec.blocks[j];
  const show = (x) => (x.t === 'moves' ? x.rows.map((r) => `${r.n} ${r.w ?? ''} ${r.b ?? ''}`).join(' | ') : x.t === 'fig' ? `[figure ${x.n}] ${x.fen ?? ''}` : x.text);
  console.log(`\n[block ${j}${j === bi ? '  <== THIS UNIT' : ''}]`);
  console.log('  1921 TEXT :', show(o));
  console.log('  CONVERTED :', show(b));
}
const b = sec.blocks[bi];
if (b && b.text) { console.log('\nTOKENS IN THIS UNIT (position after each):'); for (const m of b.text.matchAll(/⟦(\d+)\|([^⟧]*)⟧/g)) { const mv = byId.get(m[1]); if (mv) console.log(`  ⟦${m[1]}|${m[2]}⟧ -> ${mv.fen}`); } }
