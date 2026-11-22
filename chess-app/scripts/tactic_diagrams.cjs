/**
 * Finds a clear, simple example of each tactic in the Lichess puzzle set and describes it from the board itself
 * (which piece attacks what, what stands behind), so the caption cannot claim something the position does not show.
 * Prints JSON: { theme: { id, fen, lastMove, marks, caption } }.
 *   node scripts/tactic_diagrams.cjs
 */
const { Chess } = require('chess.js');
const rows = require('../src/data/puzzles.json');
const USED = new Set(['I4VEG', 'TMHl9', 'uO1oi', 'IoVwY', 'Bgpzt', 'RYsfN', 'Vq7Es', '2cGjV']);
const VAL = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 100 };
const NAME = { p: 'Tốt', n: 'Mã', b: 'Tượng', r: 'Xe', q: 'Hậu', k: 'Vua' };
const SIDE = { w: 'Trắng', b: 'Đen' };
const F = 'abcdefgh';
const sq = (f, r) => (f >= 0 && f < 8 && r >= 1 && r <= 8 ? F[f] + r : null);
const DIRS = { r: [[1, 0], [-1, 0], [0, 1], [0, -1]], b: [[1, 1], [1, -1], [-1, 1], [-1, -1]] };
DIRS.q = [...DIRS.r, ...DIRS.b];
/** pieces met walking from `from` in direction d: up to two */
function ray(c, from, d) {
  const out = [];
  let f = F.indexOf(from[0]) + d[0], r = Number(from[1]) + d[1];
  while (sq(f, r) && out.length < 2) {
    const s = sq(f, r); const p = c.get(s);
    if (p) out.push({ s, p });
    f += d[0]; r += d[1];
  }
  return out;
}
const attackedBy = (c, s, color) => c.attackers(s, color).length > 0;
function analyse(row, theme) {
  const [id, fen0, mv] = row; const u = mv.split(' ');
  const c = new Chess(fen0);
  c.move({ from: u[0].slice(0, 2), to: u[0].slice(2, 4), promotion: u[0][4] });
  const fenBefore = c.fen();
  const me = c.turn(); const opp = me === 'w' ? 'b' : 'w';
  const m = c.move({ from: u[1].slice(0, 2), to: u[1].slice(2, 4), promotion: u[1][4] });
  const t = m.to; const piece = c.get(t);
  const head = `${SIDE[me]} đi ${m.san}.`;
  // where the solver's next move captures: the example must win exactly what the picture points at
  const gain = u[3] ? u[3].slice(2, 4) : null;
  const legalReplies = c.moves().length;
  if (theme === 'fork') {
    const targets = [];
    for (const row2 of c.board()) for (const p of row2) {
      if (!p || p.color !== opp) continue;
      if (!c.attackers(p.square, me).includes(t)) continue;
      if (p.type === 'k' || VAL[p.type] > VAL[piece.type] || !attackedBy(c, p.square, opp)) targets.push(p);
    }
    if (targets.length < 2 || !targets.some((x) => x.type === 'k' || x.type === 'q' || x.type === 'r')) return null;
    if (legalReplies < 2 || !targets.some((x) => x.square === gain)) return null;
    const names = targets.map((x) => `${NAME[x.type]} ${x.square}`);
    return { id, fen: c.fen(), lastMove: u[1].slice(0, 4), marks: targets.map((x) => `${t}${x.square}:red`),
      caption: `${head} ${NAME[piece.type]} ${t} cùng lúc tấn công ${names.join(' và ')} (mũi tên đỏ). ${SIDE[opp]} chỉ cứu được một.` };
  }
  if (theme === 'pin' || theme === 'skewer') {
    if (!'rbq'.includes(piece.type)) return null;
    for (const d of DIRS[piece.type]) {
      const hit = ray(c, t, d);
      if (hit.length < 2 || hit[0].p.color !== opp || hit[1].p.color !== opp) continue;
      const [x, y] = hit;
      const front = VAL[x.p.type], back = VAL[y.p.type];
      if (theme === 'pin' && back > front && x.p.type !== 'k' && (gain === x.s || gain === t)) {
        return { id, fen: c.fen(), lastMove: u[1].slice(0, 4), marks: [`${t}${y.s}:red`, `${x.s}:yellow`],
          caption: `${head} ${NAME[piece.type]} ${t} tấn công ${NAME[x.p.type]} ${x.s} (vòng tròn), và ngay sau nó trên cùng đường là ${NAME[y.p.type]} ${y.s}. ${NAME[x.p.type]} bị ghim: ${y.p.type === 'k' ? 'rời khỏi đường thẳng đó là để Vua bị chiếu, luật không cho' : 'chạy đi thì mất quân lớn hơn ở phía sau'}.` };
      }
      if (theme === 'skewer' && front > back && gain === y.s) {
        return { id, fen: c.fen(), lastMove: u[1].slice(0, 4), marks: [`${t}${y.s}:red`, `${x.s}:yellow`],
          caption: `${head} ${NAME[piece.type]} ${t} ${x.p.type === 'k' ? 'chiếu' : 'tấn công'} ${NAME[x.p.type]} ${x.s} (vòng tròn). ${NAME[x.p.type]} phải tránh, và ${NAME[y.p.type]} ${y.s} đứng ngay sau nó trên cùng đường bị ăn. Đó là xiên.` };
      }
    }
    return null;
  }
  if (theme === 'discoveredAttack') {
    // an own long-range piece that looked through the square the moved piece left
    for (const row2 of c.board()) for (const p of row2) {
      if (!p || p.color !== me || !'rbq'.includes(p.type) || p.square === t) continue;
      for (const d of DIRS[p.type]) {
        const hit = ray(c, p.square, d);
        if (!hit.length || hit[0].p.color !== opp || VAL[hit[0].p.type] < 3 || gain !== hit[0].s) continue;
        // the line must pass through the square just vacated
        const before = new Chess(fenBefore); const hb = ray(before, p.square, d);
        if (!hb.length || hb[0].s !== m.from) continue;
        const own = c.attackers(hit[0].s, me);
        const second = [];
        for (const row3 of c.board()) for (const q of row3) if (q && q.color === opp && (q.type === 'k' || VAL[q.type] >= 3) && c.attackers(q.square, me).includes(t)) second.push(q);
        if (!second.length) continue;
        const sec = second.find((q) => q.type === 'k') ?? second[0];
        return { id, fen: c.fen(), lastMove: u[1].slice(0, 4), marks: [`${p.square}${hit[0].s}:red`, `${t}${sec.square}:blue`],
          caption: `${head} ${NAME[piece.type]} vừa rời ${m.from}, mở đường cho ${NAME[p.type]} ${p.square} đánh ${NAME[hit[0].p.type]} ${hit[0].s} (mũi tên đỏ). Cùng lúc ${NAME[piece.type]} ${t} ${sec.type === 'k' ? 'chiếu Vua' : 'tấn công ' + NAME[sec.type] + ' ' + sec.square} (mũi tên xanh). Hai đe dọa một lúc, ${SIDE[opp]} chỉ đỡ được một.` };
      }
    }
    return null;
  }
  if (theme === 'backRankMate') {
    if (!c.isCheckmate()) return null;
    let k = ''; for (const row2 of c.board()) for (const p of row2) if (p && p.type === 'k' && p.color === opp) k = p.square;
    const kr = Number(k[1]);
    if (kr !== 1 && kr !== 8) return null;
    const fwd = opp === 'w' ? 1 : -1; const kf = F.indexOf(k[0]);
    const blockers = [-1, 0, 1].map((df) => sq(kf + df, kr + fwd)).filter((s) => s && c.get(s)?.color === opp && c.get(s)?.type === 'p');
    if (blockers.length < 2) return null;
    return { id, fen: c.fen(), lastMove: u[1].slice(0, 4), marks: [`${t}${k}:red`, ...blockers.map((s) => `${s}:yellow`)],
      caption: `${head} ${NAME[piece.type]} chiếu Vua ${k} dọc hàng cuối. Vua không lên được vì chính các Tốt ${blockers.join(', ')} của mình chắn (vòng tròn), không quân nào che được: chiếu hết.` };
  }
}
const out = {};
for (const theme of ['fork', 'pin', 'skewer', 'discoveredAttack', 'backRankMate']) {
  const cands = rows.filter((r) => !USED.has(r[0]) && r[3] <= 1000 && r[4].split(' ').includes(theme) && r[2].split(' ').length <= 4).sort((a, b) => a[3] - b[3]);
  for (const r of cands) { const a = analyse(r, theme); if (a) { out[theme] = { ...a, rating: r[3] }; break; } }
}
console.log(JSON.stringify(out, null, 1));
