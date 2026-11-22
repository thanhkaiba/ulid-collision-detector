/**
 * Post-processing of src/data/book.json (run after assemble.py):
 *  1. hand fixes for the last table cells the converter could not read (section 25, moves 41-43);
 *  2. gives the hand-corrected "loose" moves ⟦-|SAN⟧ a concrete position where the context allows it.
 *
 * A loose move is tried, in order, on: the position after the previous move in the text, the position
 * before it (an alternative), the same position with the other side to move (a threat), the last diagram.
 * It is accepted as certain when a move number in the text agrees with the position, or when it directly
 * continues the previous move. Otherwise the first legal placement is kept but flagged as inferred
 * (5th field of the move entry = 1) so the reader sees a dashed chip.
 *
 *   node scripts/book/resolve_loose.cjs [book.json] [--report]
 */
const fs = require('fs');
const path = require('path');
const { Chess } = require('chess.js');
const file = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : path.join(__dirname, '..', '..', 'src/data/book.json');
const REPORT = process.argv.includes('--report');
const book = JSON.parse(fs.readFileSync(file, 'utf8'));
const START = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const key = (fen) => fen.split(' ').slice(0, 3).join(' ');

let nextId = 0;
for (const p of book.parts) for (const c of p.chapters) for (const s of c.sections) for (const m of s.moves) nextId = Math.max(nextId, m[0]);
nextId++;

function play(fen, san) {
  try { const c = new Chess(fen); const m = c.move(san); return { san: m.san, uci: m.from + m.to + (m.promotion || ''), fen: c.fen() }; } catch { return null; }
}
function flip(fen) {
  const f = fen.split(' ');
  f[1] = f[1] === 'w' ? 'b' : 'w'; f[3] = '-';
  try {
    const c = new Chess(f.join(' '));
    // the side that just "moved" must not be left in check
    const other = f[1] === 'w' ? 'b' : 'w';
    for (const row of c.board()) for (const q of row) if (q && q.type === 'k' && q.color === other && c.isAttacked(q.square, f[1])) return null;
    return c.fen();
  } catch { return null; }
}

/* ---------- 1. hand fixes ---------- */
let handFixed = 0;
for (const p of book.parts) for (const c of p.chapters) for (const s of c.sections) {
  const txt = JSON.stringify(s.blocks);
  if (!txt.includes('[?B x B]')) continue;
  // main line after 40...Rxc4 is diagram 72; the converter had continued from the 40...Rh6 side line
  // (the stored diagram has Black to move; it shows the position after 40...Rxc4, so White is to move)
  const fig72 = s.blocks.find((b) => b.t === 'fig' && b.n === 72).fen.replace(/ b - - \d+ \d+$/, ' w - - 0 41');
  const byId = new Map(s.moves.map((m) => [m[0], m]));
  const redo = (id, base, san) => { const r = play(base, san); if (!r) throw new Error('hand fix failed ' + san); const m = byId.get(id); m[1] = r.san; m[2] = r.uci; m[3] = r.fen; return r.fen; };
  const afterQxc4 = redo(1266, fig72, 'Qxc4');
  redo(1267, fig72, 'Rxf5');
  const add = (base, san) => { const r = play(base, san); if (!r) throw new Error('hand fix failed ' + san); const id = nextId++; s.moves.push([id, r.san, r.uci, r.fen]); return { id, fen: r.fen }; };
  const bxd3 = add(afterQxc4, 'Bxd3');
  redo(1268, afterQxc4, 'Rh6'); redo(1269, byId.get(1268)[3], 'd6+');
  const rxf6 = add(bxd3.fen, 'Rxf6');
  const bxc4 = add(rxf6.fen, 'Bxc4');
  const nf4 = add(bxc4.fen, 'Nf4');
  const e2 = add(nf4.fen, 'e2');
  const fig73 = s.blocks.find((b) => b.t === 'fig' && b.n === 73).fen;
  if (key(e2.fen) !== key(fig73)) throw new Error('hand-fixed line does not reach diagram 73');
  const cells = { '[?B x B]': `⟦${bxd3.id}|Bxd3⟧`, '[?R x R]': `⟦${rxf6.id}|Rxf6⟧`, '[?B x Q]': `⟦${bxc4.id}|Bxc4⟧`, '[?Kt - B 4]': `⟦${nf4.id}|Nf4⟧`, '[?P - K 7 !]': `⟦${e2.id}|e2⟧ !` };
  for (const b of s.blocks) if (b.t === 'moves') for (const r of b.rows) for (const k of ['w', 'b']) if (cells[r[k]]) { r[k] = cells[r[k]]; handFixed++; }
}

/* ---------- 2. loose moves ---------- */
const TOKEN = /⟦(-|\d+)\|([^⟧]*)⟧/g;
const stats = { strong: 0, weak: 0, unresolved: 0 };
const log = [];
book.parts.forEach((p, pi) => p.chapters.forEach((c, ci) => c.sections.forEach((s, si) => {
  const byId = new Map(s.moves.map((m) => [m[0], m]));
  const known = [START, ...s.blocks.filter((b) => b.t === 'fig' && b.fen).map((b) => b.fen), ...s.moves.map((m) => m[3])];
  const beforeOf = (m, hintFen) => {
    for (const f of [hintFen, ...known]) { if (!f) continue; const r = play(f, { from: m[2].slice(0, 2), to: m[2].slice(2, 4), promotion: m[2][4] }); if (r && key(r.fen) === key(m[3])) return f; }
    return null;
  };
  let prev = null; // { before, after }
  let fig = pi === 1 ? START : null;
  const handle = (text, where) => {
    let out = ''; let last = 0; let m; TOKEN.lastIndex = 0;
    let prevEnd = -1;
    while ((m = TOKEN.exec(text))) {
      const gap = text.slice(Math.max(last, 0), m.index);
      out += gap;
      const tight = prevEnd === last && /^[\s;,]*(\d+\.(\.\.)?\s*)?$/.test(gap);
      if (m[1] !== '-') {
        const mv = byId.get(Number(m[1]));
        if (mv) prev = { before: beforeOf(mv, prev?.after), after: mv[3] };
        out += m[0];
      } else {
        const label = m[2];
        const num = /^(\d+)(\.\.\.|\.)/.exec(label) || /(\d+)(\.\.\.|\.)\s*$/.exec(gap);
        const san = label.replace(/^\d+\.+\s*/, '').replace(/[!?]+$/, '');
        const hintSide = num ? (num[2] === '...' ? 'b' : 'w') : null;
        const hintNo = num ? Number(num[1]) : null;
        const cands = [];
        if (prev?.after) cands.push(['after', prev.after]);
        if (prev?.before) cands.push(['before', prev.before]);
        if (prev?.after) { const f = flip(prev.after); if (f) cands.push(['threat', f]); }
        if (fig) { cands.push(['fig', fig]); const f = flip(fig); if (f) cands.push(['figflip', f]); }
        let pick = null;
        for (const [kind, fen] of cands) {
          const f = fen.split(' ');
          if (hintSide && f[1] !== hintSide) continue;
          const r = play(fen, san);
          if (!r) continue;
          const numOk = hintNo !== null && Number(f[5]) === hintNo;
          const strong = (hintSide && numOk && kind !== 'threat' && kind !== 'figflip') || (kind === 'after' && tight);
          if (!pick || (strong && !pick.strong)) pick = { kind, fen, r, strong };
          if (strong) break;
        }
        if (pick) {
          const id = nextId++;
          const entry = [id, pick.r.san, pick.r.uci, pick.r.fen];
          if (!pick.strong) entry.push(1);
          s.moves.push(entry); byId.set(id, entry); known.push(pick.r.fen);
          prev = { before: pick.fen, after: pick.r.fen };
          out += `⟦${id}|${label}⟧`;
          stats[pick.strong ? 'strong' : 'weak']++;
          log.push(`${pick.strong ? 'OK  ' : 'weak'} ${pi}.${ci}.${si} ${where} ${label} via ${pick.kind}`);
        } else {
          prev = null;
          out += m[0];
          stats.unresolved++;
          log.push(`??   ${pi}.${ci}.${si} ${where} ${label}  …${text.slice(Math.max(0, m.index - 60), m.index).replace(/⟦[^|]*\|([^⟧]*)⟧/g, '$1')}`);
        }
      }
      last = m.index + m[0].length; prevEnd = last;
    }
    return out + text.slice(last);
  };
  s.blocks.forEach((b, bi) => {
    if (b.t === 'fig') { if (b.fen) fig = b.fen; return; }
    if (b.t === 'p' || b.t === 'h') b.text = handle(b.text, `#${bi}`);
    else if (b.t === 'moves') for (const r of b.rows) { r.w = handle(r.w || '', `#${bi}`); r.b = handle(r.b || '', `#${bi}`); }
  });
})));

book.meta.note = 'Bản dịch tiếng Việt từ nguyên tác tiếng Anh năm 1921 (public domain). Ký hiệu nước đi đã được chuyển từ kiểu mô tả cũ sang ký hiệu đại số và kiểm bằng máy; 150 hình được chép lại từ bản in. Nước có viền đứt là nước đã được hiệu đính tay, vị trí trên bàn do máy suy ra từ ngữ cảnh nên đôi khi có thể lệch. Nước màu xám là nước chưa xác định được vị trí: chạm vào sẽ thử đi trên bàn cờ đang hiện.';
fs.writeFileSync(file, JSON.stringify(book));
const all = JSON.stringify(book);
console.log(`hand-fixed cells: ${handFixed} | loose moves placed: ${stats.strong} certain, ${stats.weak} inferred, ${stats.unresolved} still loose | placeholders left: ${(all.match(/\[\?/g) || []).length}`);
if (REPORT) console.log(log.join('\n'));
