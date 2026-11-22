/**
 * Convert Capablanca's descriptive-notation book (book.json) into algebraic notation with
 * position tracking + legality verification. Produces book_alg.json and report.json.
 */
const fs = require('fs');
const path = require('path');
const { Chess } = require('/home/user/ulid-collision-detector/chess-app/node_modules/chess.js');

const book = JSON.parse(fs.readFileSync('book.json', 'utf8'));
const fens = JSON.parse(fs.readFileSync('fens.json', 'utf8'));
const overrides = fs.existsSync('overrides.json') ? JSON.parse(fs.readFileSync('overrides.json', 'utf8')) : {};

const FILES = { QR: ['a'], QKT: ['b'], QB: ['c'], Q: ['d'], K: ['e'], KB: ['f'], KKT: ['g'], KR: ['h'], R: ['a', 'h'], KT: ['b', 'g'], B: ['c', 'f'] };
const PIECE = { K: 'k', Q: 'q', R: 'r', B: 'b', KT: 'n', P: 'p' };

/* ---------------- descriptive parsing ---------------- */
function parseDesc(raw) {
  let s = raw.replace(/\bto\b/gi, '-').replace(/\s+/g, '').toUpperCase().replace(/KNIGHT|N(?![A-Z])/g, 'KT');
  s = s.split(',')[0].replace(/\.$/, '').replace(/\([^)]*[A-Z]{4,}[^)]*\)/g, '');
  const out = { raw, check: false, mate: false, ep: false, promo: null };
  s = s.replace(/[!?]+$/g, '');
  if (/MATE$/.test(s)) { out.mate = true; s = s.replace(/MATE$/, ''); }
  if (/(DIS|DBL|DOUBLE|DISC)?CH$/.test(s)) { out.check = true; s = s.replace(/(DIS|DBL|DOUBLE|DISC)?CH$/, ''); }
  s = s.replace(/[!?]+$/g, '');
  if (/E\.?P\.?$/.test(s)) { out.ep = true; s = s.replace(/E\.?P\.?$/, ''); }
  const pm = /[=(](Q|R|B|KT)\)?$/.exec(s);
  if (pm) { out.promo = PIECE[pm[1]]; s = s.slice(0, pm.index); }
  if (/^CASTLES|^O-O/.test(s)) { out.castle = /QR|O-O-O/.test(s) ? 'q' : /KR|^O-O$/.test(s) ? 'k' : 'any'; return out; }
  if (!/[-X]/.test(s)) return null;
  const m = /^((?:Q|K)?(?:R|KT|B|Q|K)?P|(?:Q|K)?(?:R|KT|B)|Q|K)(?:\((.+?)\))?([-X])(.+)$/.exec(s);
  if (!m) return null;
  const mover = m[1];
  out.origin = m[2] || null;
  out.capture = m[3] === 'X';
  let pieceKey = mover.endsWith('KT') ? 'KT' : mover.slice(-1);
  out.moverPrefix = null; out.pawnFile = null;
  if (mover === 'K' || mover === 'Q') pieceKey = mover;
  else if (pieceKey === 'P') { const pre = mover.slice(0, -1); out.pawnFile = pre ? FILES[pre] || null : null; }
  else out.moverPrefix = mover.slice(0, mover.length - pieceKey.length) || null;
  out.piece = PIECE[pieceKey];
  const target = m[4];
  if (!out.capture) {
    const t = /^((?:Q|K)?(?:R|KT|B|Q|K))(\d)/.exec(target);
    if (!t) return null;
    out.destFile = t[1]; out.destRank = Number(t[2]);
  } else {
    const t = /^((?:Q|K)?(?:R|KT|B|Q|K)?P|KT|B|R|Q|K)(?:\((.+?)\))?/.exec(target);
    if (!t) return null;
    const cap = t[1];
    out.capSquare = t[2] || null;
    if (cap.endsWith('P')) { out.capPiece = 'p'; out.capPrefix = cap.slice(0, -1) || null; }
    else { out.capPiece = PIECE[cap]; out.capPrefix = null; }
  }
  return out;
}
function descSquare(fileKey, rank, color) {
  const files = FILES[fileKey] || [];
  const r = color === 'w' ? rank : 9 - rank;
  return files.map((f) => f + r);
}
/** Resolve a parsed descriptive move in a position -> {move} | {candidates} */
function resolve(p, chess) {
  const color = chess.turn();
  let moves = chess.moves({ verbose: true });
  const soft = (arr, pred) => { const f = arr.filter(pred); return f.length ? f : arr; };
  if (p.castle) {
    moves = moves.filter((m) => m.flags.includes('k') || m.flags.includes('q'));
    if (p.castle === 'k') moves = moves.filter((m) => m.flags.includes('k'));
    if (p.castle === 'q') moves = moves.filter((m) => m.flags.includes('q'));
    return finish(moves);
  }
  moves = moves.filter((m) => m.piece === p.piece);
  if (p.origin) {
    const o = /^((?:Q|K)?(?:R|KT|B|Q|K))(\d)$/.exec(p.origin);
    if (o) { const sqs = descSquare(o[1], Number(o[2]), color); moves = moves.filter((m) => sqs.includes(m.from)); }
  }
  if (p.moverPrefix) { const side = p.moverPrefix === 'Q' ? ['a', 'b', 'c', 'd'] : ['e', 'f', 'g', 'h']; moves = soft(moves, (m) => side.includes(m.from[0])); }
  if (p.piece === 'p' && p.pawnFile) moves = moves.filter((m) => p.pawnFile.includes(m.from[0]));
  if (!p.capture) {
    const sqs = descSquare(p.destFile, p.destRank, color);
    moves = moves.filter((m) => sqs.includes(m.to) && !m.captured);
  } else {
    moves = moves.filter((m) => m.captured === p.capPiece || (p.ep && m.flags.includes('e')));
    if (p.capPrefix) { const files = FILES[p.capPrefix] || []; moves = soft(moves, (m) => files.includes(m.to[0])); }
    if (p.capSquare) { const o = /^((?:Q|K)?(?:R|KT|B|Q|K))(\d)$/.exec(p.capSquare); if (o) { const sqs = descSquare(o[1], Number(o[2]), color); moves = moves.filter((m) => sqs.includes(m.to)); } }
  }
  if (p.promo) moves = moves.filter((m) => m.promotion === p.promo);
  else if (moves.some((m) => m.promotion)) moves = moves.filter((m) => !m.promotion || m.promotion === 'q');
  if (moves.length > 1 && (p.check || p.mate)) moves = soft(moves, (m) => m.san.includes('+') || m.san.includes('#'));
  if (moves.length > 1 && !p.check && !p.mate) moves = soft(moves, (m) => !m.san.includes('+') && !m.san.includes('#'));
  return finish(moves);
  function finish(ms) { return ms.length === 1 ? { move: ms[0] } : { candidates: ms }; }
}

/* ---------------- engine tie-break ---------------- */
const { spawn } = require('child_process');
const sf = spawn(process.execPath, ['/home/user/ulid-collision-detector/chess-app/node_modules/stockfish/src/stockfish-17.1-lite-single-03e3232.js'], { stdio: ['pipe', 'pipe', 'ignore'] });
let sfBuf = ''; const sfWaiters = [];
sf.stdout.on('data', (d) => { sfBuf += d.toString(); let i; while ((i = sfBuf.indexOf('\n')) >= 0) { const line = sfBuf.slice(0, i).trim(); sfBuf = sfBuf.slice(i + 1); for (const w of [...sfWaiters]) w(line); } });
const sfSend = (c) => sf.stdin.write(c + '\n');
function sfUntil(pred) { return new Promise((res) => { const fn = (l) => { if (pred(l)) { sfWaiters.splice(sfWaiters.indexOf(fn), 1); res(l); } }; sfWaiters.push(fn); }); }
async function sfScore(fen, uci) {
  let last = null;
  const fn = (l) => { const m = /score (cp|mate) (-?\d+)/.exec(l); if (l.startsWith('info') && m) last = m[1] === 'cp' ? Number(m[2]) : (Number(m[2]) > 0 ? 100000 - Number(m[2]) : -100000 - Number(m[2])); };
  sfWaiters.push(fn);
  sfSend(`position fen ${fen}`); sfSend(`go depth 12 searchmoves ${uci}`);
  await sfUntil((l) => l.startsWith('bestmove'));
  sfWaiters.splice(sfWaiters.indexOf(fn), 1);
  return last ?? -99999;
}
const engineChoices = [];
async function pickByEngine(cands, pos, ctx, tok) {
  let best = null, bestScore = -Infinity;
  for (const m of cands) { const sc = await sfScore(pos.fen(), m.from + m.to + (m.promotion || '')); if (sc > bestScore) { bestScore = sc; best = m; } }
  engineChoices.push({ ctx, tok, chosen: best.san, among: cands.map((x) => x.san).join(' '), fen: pos.fen() });
  return best;
}

/* ---------------- tracker ---------------- */
class Tracker {
  constructor(fen) { this.main = [new Chess(fen)]; this.cur = null; this.stack = []; this.curSource = null; }
  pushLine() { this.stack.push({ cur: this.cur, curSource: this.curSource }); }
  popLine() { if (this.stack.length) { const s = this.stack.pop(); this.cur = s.cur; this.curSource = s.curSource; return true; } return false; }
  current() { return this.cur ? this.cur[this.cur.length - 1] : this.main[this.main.length - 1]; }
  expectedNum() { const c = this.current(); return { n: parseInt(c.fen().split(' ')[5]), color: c.turn() }; }
  mainExpects(n, color) { const c = this.main[this.main.length - 1]; return parseInt(c.fen().split(' ')[5]) === n && c.turn() === color; }
  curExpects(n, color) { if (!this.cur) return false; const e = this.expectedNum(); return e.n === n && e.color === color; }
  static plyIndex(line, n, color) {
    const startColor = line[0].turn();
    const startNum = parseInt(line[0].fen().split(' ')[5]);
    return (n - startNum) * 2 + (color === 'b' ? 1 : 0) - (startColor === 'b' ? 1 : 0);
  }
  /** fork at move n/color: inside the current variation if it covers it, else on the main line */
  rewindTo(n, color, restart) {
    const start0 = this.main[0];
    if (restart && parseInt(start0.fen().split(' ')[5]) === n && start0.turn() !== color) {
      const f = start0.fen().split(' '); f[1] = color; f[3] = '-';
      try { this.main = [new Chess(f.join(' '))]; this.cur = null; return true; } catch { /* fall through */ }
    }
    if (this.cur) { const i = Tracker.plyIndex(this.cur, n, color); if (i > 0 && i < this.cur.length) { this.cur = this.cur.slice(0, i + 1); return true; } }
    const i = Tracker.plyIndex(this.main, n, color);
    if (i === 0 && restart) { this.main = [this.main[0]]; this.cur = null; return true; }
    if (i >= 0 && i < this.main.length) { this.cur = [new Chess(this.main[i].fen())]; this.curSource = 'prose'; return true; }
    // "1. ........ P-Kt3": same start position but the other side moves first
    const start = this.main[0];
    if (parseInt(start.fen().split(' ')[5]) === n && start.turn() !== color) {
      const f = start.fen().split(' '); f[1] = color; f[3] = '-';
      try { const c = new Chess(f.join(' ')); if (restart) { this.main = [c]; this.cur = null; } else { this.cur = [c]; this.curSource = 'prose'; } return true; } catch { return false; }
    }
    return false;
  }
  forkFrom(pos) { this.cur = [new Chess(pos.fen())]; this.curSource = 'prose'; }
  play(move) { const c = new Chess(this.current().fen()); c.move(move.san); if (this.cur) this.cur.push(c); else this.main.push(c); return c; }
  backToMain() { this.cur = null; }
}

/* ---------------- tokens ---------------- */
const MOVE_RE = String.raw`(?:Castles(?:\s*\(?[QK]\s*R\)?)?|O\s*-\s*O(?:\s*-\s*O)?|(?:[QK]\s*)?(?:Kt|[KQRB])?\s*P\s*(?:\(\s*[QK]?\s*(?:Kt|[KQRB])\s*\d\s*\))?\s*[-x]\s*(?:(?:[QK]\s*)?(?:Kt|[KQRB])\s*\d|(?:[QK]\s*)?(?:Kt|[KQRB])?\s*P(?:\s*\(\s*[QK]?\s*(?:Kt|[KQRB])\s*\d\s*\))?|Kt|[QRBK])(?:\s*\(?\s*=?\s*(?:Kt|[QRB])\s*\)?)?(?:\s*e\.?\s*p\.?)?(?:\s*(?:dis\s*|dbl\s*|disc\s*|double\s*)?ch)?(?:\s*mate)?[!?]*|(?:[QK]\s*)?(?:Kt|[KQRB])\s*(?:\(\s*[QK]?\s*(?:Kt|[KQRB])\s*\d\s*\))?\s*[-x]\s*(?:(?:[QK]\s*)?(?:Kt|[KQRB])\s*\d|(?:[QK]\s*)?(?:Kt|[KQRB])?\s*P(?:\s*\(\s*[QK]?\s*(?:Kt|[KQRB])\s*\d\s*\))?|Kt|[QRBK])(?:\s*e\.?\s*p\.?)?(?:\s*(?:dis\s*|dbl\s*|disc\s*|double\s*)?ch)?(?:\s*mate)?[!?]*)`;
const NUM_RE = new RegExp(String.raw`(\d+)\s*(\.\.\.|\.(?!\.)|(?=\s*[A-Z]))\s*(` + MOVE_RE + String.raw`)((?:\s*[,;]\s*` + MOVE_RE + `)*)`, 'g');
const LONE_RE = new RegExp(String.raw`(?<![\w⟦])` + MOVE_RE + String.raw`(?![\w])`, 'g');
const CUE = /\b(if|instead|not|could|would|should|alternative|alternatives|better|or|suppose|had|might|say|e\.g\.|for instance|variation|worse|wrong|threat|threatens|threatening|answer|reply|against|one by|the other|preferable|possible|option|was|were)\b/i;

const report = [];
let moveId = 0;
const flip = (pos) => { try { const f = pos.fen().split(' '); f[1] = f[1] === 'w' ? 'b' : 'w'; f[3] = '-'; return new Chess(f.join(' ')); } catch { return null; } };

/** Resolve one token in pos with override/lookahead/engine. nextTok: following token in the same chain for disambiguation. */
async function resolveTok(tok, pos, ctx, nextToks) {
  const p = parseDesc(tok);
  if (!p) return { error: 'unparseable' };
  const r = resolve(p, pos);
  const key = `${ctx}|${tok.replace(/\s+/g, '')}|${pos.fen().split(' ').slice(0, 2).join(' ')}`;
  if (overrides[key]) { const c2 = new Chess(pos.fen()); try { const mv = c2.move(overrides[key]); if (mv) return { move: mv }; } catch {} }
  if (r.move) return { move: r.move };
  if (!r.candidates || !r.candidates.length) return { error: 'illegal', key };
  // lookahead: keep candidates after which the next token(s) resolve
  let cands = r.candidates;
  if (nextToks && nextToks.length) {
    const lineOk = (pos0, toks, depth) => {
      if (!toks.length || depth === 0) return true;
      const np = parseDesc(toks[0]);
      if (!np) return true;
      const nr = resolve(np, pos0);
      const ms = nr.move ? [nr.move] : nr.candidates || [];
      if (!ms.length) return false;
      return ms.some((mv) => { const c3 = new Chess(pos0.fen()); c3.move(mv.san); return lineOk(c3, toks.slice(1), depth - 1); });
    };
    const ok = cands.filter((c) => { const c2 = new Chess(pos.fen()); c2.move(c.san); return lineOk(c2, nextToks, 4); });
    if (ok.length === 1) return { move: ok[0] };
    if (ok.length) cands = ok;
  }
  return { move: await pickByEngine(cands, pos, ctx, tok), ambiguous: true };
}

async function convertText(text, tracker, ctx, forkOnly, isGame) {
  const movesOut = [];
  const items = [];
  let m;
  while ((m = NUM_RE.exec(text))) items.push({ kind: 'num', start: m.index, end: m.index + m[0].length, m });
  while ((m = LONE_RE.exec(text))) {
    const s = m.index, e = s + m[0].length;
    if (items.some((c) => c.kind === 'num' && s >= c.start && e <= c.end)) continue;
    items.push({ kind: 'lone', start: s, end: e, tok: m[0] });
  }
  items.sort((a, b) => a.start - b.start);
  const repls = [];
  let hypo = null, hypoEnd = -1, lastNumEnd = -1, lastNumInParens = false, parenLine = false;
  const inParens = (pos) => { const before = text.slice(0, pos); return (before.match(/\(/g) || []).length > (before.match(/\)/g) || []).length; };
  for (const it of items) {
    if (it.kind === 'num') {
      const mm = it.m;
      const num = Number(mm[1]);
      const isBlack = mm[2] === '...';
      const tokens = [mm[3], ...(mm[4] ? mm[4].split(/\s*[,;]\s*/).filter(Boolean) : [])];
      const wantColor = isBlack ? 'b' : 'w';
      const before = text.slice(Math.max(0, it.start - 32), it.start);
      const cue = CUE.test(before);
      const adjacent = lastNumEnd >= 0 && text.slice(lastNumEnd, it.start).length < 40 && !/[.]\s/.test(text.slice(lastNumEnd, it.start));
      const hypoGap = hypoEnd >= 0 ? text.slice(hypoEnd, it.start) : '';
      const hypoExpects = hypo && hypoEnd >= 0 && (hypoGap.length < 120 || (hypoGap.length < 220 && !/[.]\s/.test(hypoGap))) && parseInt(hypo.fen().split(' ')[5]) === num && hypo.turn() === wantColor;
      if (parenLine && !inParens(it.start)) { tracker.popLine(); parenLine = false; }
      const startsParen = inParens(it.start) && !parenLine;
      const mainExp = tracker.mainExpects(num, wantColor);
      const curExp = tracker.curExpects(num, wantColor);
      if (startsParen && !(tracker.cur && adjacent && curExp)) { tracker.pushLine(); parenLine = true; }
      if (process.env.DEBUG_CTX && ctx.startsWith(process.env.DEBUG_CTX)) console.error('NUM', ctx, JSON.stringify(mm[0]), JSON.stringify({ num, wantColor, cue, adjacent, hypoExpects, mainExp, curExp, hasCur: !!tracker.cur, exp: tracker.expectedNum(), mainTop: tracker.main[tracker.main.length - 1].fen(), curTop: tracker.cur ? tracker.cur[tracker.cur.length-1].fen() : null }));
      if (tracker.cur && adjacent && curExp) { /* continue variation */ }
      else if (hypoExpects && !(mainExp && !cue && !isGame)) tracker.forkFrom(hypo);
      else if (mainExp && !cue && !isGame) tracker.backToMain();
      else if (mainExp) tracker.rewindTo(num, wantColor);
      else if (curExp) { /* continue variation */ }
      else if (!tracker.rewindTo(num, wantColor, !isGame && num === 1 && !cue)) {
        report.push({ ctx, text: mm[0], reason: `cannot place move ${num}${isBlack ? '...' : '.'} (expected ${tracker.expectedNum().n}${tracker.expectedNum().color === 'b' ? '...' : '.'})` });
        continue;
      }
      hypo = null; lastNumEnd = it.end; lastNumInParens = inParens(it.start);
      const parts = [];
      for (let i = 0; i < tokens.length; i++) {
        const tok = tokens[i];
        const pos = tracker.current();
        const r = await resolveTok(tok, pos, ctx, tokens.slice(i + 1));
        if (!r.move) {
          report.push({ ctx, text: tok, fen: pos.fen(), reason: `chain ${r.error}`, key: r.key });
          parts.push(`[?${tok}]`);
          const f = flip(pos); const nxt = tokens[i + 1] ? parseDesc(tokens[i + 1]) : null;
          if (f && nxt) { const nr = resolve(nxt, f); if (nr.move || (nr.candidates && nr.candidates.length)) { if (tracker.cur) tracker.cur.push(f); else tracker.main.push(f); continue; } }
          break;
        }
        const after = tracker.play(r.move);
        const id = moveId++;
        movesOut.push({ id, san: r.move.san, uci: r.move.from + r.move.to + (r.move.promotion || ''), fen: after.fen(), color: r.move.color });
        const numStr = i === 0 ? (isBlack ? `${num}...` : `${num}.`) : r.move.color === 'w' ? `${parseInt(pos.fen().split(' ')[5])}.` : '';
        parts.push(`⟦${id}|${numStr}${r.move.san}⟧`);
      }
      repls.push({ start: it.start, end: it.end, repl: parts.join(' ') });
      continue;
    }
    // ---- lone move ----
    const tok = it.tok, s = it.start, e = it.end;
    const p = parseDesc(tok);
    if (!p) continue;
    const cur = tracker.current();
    const gapNum = lastNumEnd >= 0 ? text.slice(lastNumEnd, s) : null;
    const gapStripped = gapNum === null ? null : gapNum.replace(/\([^()]*\)/g, '');
    const continuesChain = gapNum !== null && gapStripped.length < 25 && !/[.]\s/.test(gapStripped) && !inParens(s);
    // a chain that started inside a parenthesis and now continues outside it is back on the line the parenthesis interrupted
    if (parenLine && !inParens(s)) { tracker.popLine(); parenLine = false; }
    const prefix = text.slice(Math.max(0, s - 45), s);
    const altCue = /\b(if|not|instead(?: of)?|or|alternative|better|should have|could have|would have|might have|right move|best move|was|preferable|possible|threat|threatens)\b[^.;]{0,30}$/i.test(prefix);
    const around = text.slice(Math.max(0, s - 80), s);
    const wIdx = around.search(/\bWhite(?:'s)?\b(?![^.]*\bBlack)/i), bIdx = around.search(/\bBlack(?:'s)?\b(?![^.]*\bWhite)/i);
    const colorHint = wIdx >= 0 && bIdx < 0 ? 'w' : bIdx >= 0 && wIdx < 0 ? 'b' : wIdx >= 0 && bIdx >= 0 ? (wIdx > bIdx ? 'w' : 'b') : null;
    const tried = [];
    if (continuesChain) tried.push(cur);
    const between = text.slice(hypoEnd, s);
    if (hypo && hypoEnd >= 0 && (between.length < 40 || (between.length < 120 && !/[.]\s/.test(between)))) { tried.push(hypo); const hf = flip(hypo); if (hf) tried.push(hf); }
    const line = tracker.cur || tracker.main;
    const prev = line.length >= 2 ? line[line.length - 2] : null;
    if (altCue && prev) tried.push(prev);
    if (colorHint && cur.turn() !== colorHint && prev && prev.turn() === colorHint) tried.push(prev);
    { const mm = /\bmove\s+(\d+)\b[^.;]{0,60}$/i.exec(text.slice(Math.max(0, s - 80), s)); const ord = /\b(\d+)(?:st|nd|rd|th)\s+move\b[^.;]{0,60}$/i.exec(text.slice(Math.max(0, s - 80), s));
      const n = mm ? Number(mm[1]) : ord ? Number(ord[1]) : null;
      if (n) { const blackCue = /black/i.test(text.slice(Math.max(0, s - 80), s)); for (const col of blackCue ? ['b', 'w'] : ['w', 'b']) { const i = Tracker.plyIndex(tracker.main, n, col); if (i >= 0 && i < tracker.main.length) tried.push(tracker.main[i]); } } }
    tried.push(cur);
    if (prev) tried.push(prev);
    { const cf = flip(cur); if (cf) tried.push(cf); }
    if (tracker.cur) for (let i = tracker.cur.length - 2; i >= Math.max(0, tracker.cur.length - 4); i--) tried.push(tracker.cur[i]);
    for (let i = tracker.main.length - 1; i >= Math.max(0, tracker.main.length - 6); i--) tried.push(tracker.main[i]);
    let found = null, firstAmb = null;
    const key = `${ctx}|${tok.replace(/\s+/g, '')}|lone`;
    if (process.env.DEBUG_CTX && ctx.startsWith(process.env.DEBUG_CTX)) console.error('LONE', ctx, JSON.stringify(tok), JSON.stringify({ continuesChain, altCue, colorHint, lastNumInParens, tried: tried.map((t) => t.fen().split(' ').slice(0, 2).join(' ')) }));
    if (overrides[key]) {
      const c2 = new Chess(cur.fen()); let mv = null; try { mv = c2.move(overrides[key]); } catch {}
      if (mv) found = { pos: cur, move: mv };
      else { repls.push({ start: s, end: e, repl: `⟦-|${overrides[key]}⟧` }); hypo = null; continue; }
    }
    if (!found) for (const pos of tried) {
      const r = resolve(p, pos);
      if (r.move) { found = { pos, move: r.move }; break; }
      if (r.candidates && r.candidates.length && !firstAmb) firstAmb = { pos, cands: r.candidates };
    }
    if (!found && firstAmb) found = { pos: firstAmb.pos, move: await pickByEngine(firstAmb.cands, firstAmb.pos, ctx, tok) };
    if (!found) {
      const naive = naiveSan(p, cur);
      report.push({ ctx, text: tok, fen: cur.fen(), reason: `lone unresolved -> naive ${naive}`, key, naive: true });
      repls.push({ start: s, end: e, repl: naive ? `⟦-|${naive}⟧` : `[?${tok}]` });
      hypo = null;
      continue;
    }
    const playOnTracker = continuesChain && found.pos === cur;
    let c2;
    if (playOnTracker) { c2 = tracker.play(found.move); lastNumEnd = e; lastNumInParens = inParens(s); }
    else { c2 = new Chess(found.pos.fen()); c2.move(found.move.san); }
    const id = moveId++;
    movesOut.push({ id, san: found.move.san, uci: found.move.from + found.move.to + (found.move.promotion || ''), fen: c2.fen(), color: found.move.color, lone: !playOnTracker });
    repls.push({ start: s, end: e, repl: `⟦${id}|${found.move.san}⟧` });
    if (!playOnTracker) { hypo = c2; hypoEnd = e; }
  }
  repls.sort((a, b) => a.start - b.start);
  let out = '', last = 0;
  for (const c of repls) { out += text.slice(last, c.start) + c.repl; last = c.end; }
  out += text.slice(last);
  return { text: out, moves: movesOut, hypo, hypoEnd };
}

function naiveSan(p, pos) {
  const color = pos.turn();
  if (p.castle) return p.castle === 'q' ? 'O-O-O' : 'O-O';
  if (!p.piece) return null;
  const letter = p.piece === 'p' ? '' : p.piece.toUpperCase();
  const pieces = [];
  for (const r of '12345678') for (const f of 'abcdefgh') { const q = pos.get(f + r); if (q && q.type === p.piece) pieces.push({ sq: f + r, color: q.color }); }
  const dist = (a, b) => Math.max(Math.abs(a.charCodeAt(0) - b.charCodeAt(0)), Math.abs(Number(a[1]) - Number(b[1])));
  const pick = (sqs, col) => { const mine = pieces.filter((x) => x.color === col); if (!mine.length) return sqs[0]; return sqs.map((sq) => ({ sq, d: Math.min(...mine.map((x) => dist(x.sq, sq))) })).sort((a, b) => a.d - b.d)[0].sq; };
  if (!p.capture) {
    const opts = [];
    for (const col of [color, color === 'w' ? 'b' : 'w']) { const sqs = descSquare(p.destFile, p.destRank, col); if (sqs.length) { const sq = pick(sqs, col); const mine = pieces.filter((x) => x.color === col); opts.push({ col, sq, d: mine.length ? Math.min(...mine.map((x) => dist(x.sq, sq))) : 99 }); } }
    opts.sort((a, b) => a.d - b.d);
    if (!opts.length) return null;
    return `${letter}${opts[0].sq}${p.check ? '+' : ''}${p.mate ? '#' : ''}`;
  }
  const cap = p.capPiece === 'n' ? 'N' : p.capPiece.toUpperCase();
  return `${letter}x${cap}${p.check ? '+' : ''}${p.mate ? '#' : ''}`;
}

/* ---------------- walk ---------------- */
let figMismatch = 0, figChecked = 0; const figMissing = [], figIllegal = [];
const result = JSON.parse(JSON.stringify(book));
(async () => {
  sfSend('uci'); await sfUntil((l) => l === 'uciok');
  for (const part of result.parts) for (const ch of part.chapters) for (const sec of ch.sections) {
    const isGame = sec.heading.startsWith('GAME');
    const hasTables = sec.blocks.some((b) => b.t === 'moves');
    const forkOnly = isGame || hasTables;
    let tracker = isGame ? new Tracker(undefined) : null;
    const ctxBase = sec.heading.slice(0, 20);
    sec.moves = [];
    let hypo = null; // carried across adjacent blocks (prose -> table)
    for (let bi = 0; bi < sec.blocks.length; bi++) {
      const b = sec.blocks[bi];
      const ctx = `${ctxBase}#${bi}`;
      if (b.t === 'fig') {
        hypo = null;
        const placement = fens[String(b.n)];
        if (!placement) { figMissing.push(b.n); tracker = null; continue; }
        if (tracker && isGame) {
          figChecked++;
          const tp = tracker.current().fen().split(' ')[0];
          if (tp !== placement) { figMismatch++; report.push({ ctx, reason: `FIG ${b.n} placement differs from tracked game position`, expected: tp, got: placement }); }
          b.fen = tracker.current().fen();
          continue;
        }
        // side to move + move number from the first move after the figure
        let stm = 'w', num = 1, firstTok = null; const nm_found = false;
        const numLook = new RegExp(String.raw`(\d+)\s*(\.\.\.|\.(?!\.)|(?=\s*[A-Z]))\s*(` + MOVE_RE + ')');
        for (let j = bi + 1; j < sec.blocks.length; j++) {
          const nb = sec.blocks[j];
          if (nb.t === 'fig') break;
          if (nb.t === 'p' || nb.t === 'h') {
            const nm = numLook.exec(nb.text);
            const lm = new RegExp(MOVE_RE).exec(nb.text);
            if (nm) {
              stm = nm[2] === '...' ? 'b' : 'w'; num = Number(nm[1]);
              // "If Kt-B4, P-K7!; 39 KtxP": unnumbered chain moves right before the number shift the start back
              let k = 0; let head = nb.text.slice(0, nm.index);
              const tail = new RegExp('(' + MOVE_RE + ')[!?]*\\s*[,;]\\s*$');
              while (true) { const t = tail.exec(head); if (!t) break; k++; head = head.slice(0, t.index); }
              if (k) { const p = 2 * num + (stm === 'b' ? 1 : 0) - k; num = Math.floor(p / 2); stm = p % 2 ? 'b' : 'w'; }
              if (!firstTok) firstTok = (lm && lm.index < nm.index) ? lm[0] : nm[3]; break; }
            if (lm && !firstTok) firstTok = lm[0];
          }
          if (nb.t === 'moves' && nb.rows.length) { const tstm = /^\s*\d+\.?\s*\.{3,}/.test(nb.rows[0].n) ? 'b' : 'w'; const mm = /(\d+)/.exec(nb.rows[0].n); if (mm) num = Number(mm[1]); if (!firstTok) { stm = tstm; firstTok = (stm === 'b' ? nb.rows[0].b : nb.rows[0].n.replace(/^\s*\d+\.?\s*/, '')); } else if (firstTok && !nm_found) { /* a lone move came first: the table's side is the OTHER side if the lone move is the student's reply... keep stm from the lone-move probe below */ } break; }
        }
        const rows = placement.split('/');
        const at = (sq) => { const f = sq.charCodeAt(0) - 97, r = 8 - Number(sq[1]); let i = 0; for (const c of rows[r]) { if (/\d/.test(c)) i += Number(c); else { if (i === f) return c; i++; } if (i > f) break; } return ''; };
        let cr = '';
        if (at('e1') === 'K') { if (at('h1') === 'R') cr += 'K'; if (at('a1') === 'R') cr += 'Q'; }
        if (at('e8') === 'k') { if (at('h8') === 'r') cr += 'k'; if (at('a8') === 'r') cr += 'q'; }
        const mk = (side) => `${placement} ${side} ${cr || '-'} - 0 ${num}`;
        let fen = mk(stm);
        let pos;
        if (tracker && firstTok) {
          // a mid-example figure should equal the tracked position; if the figure fails the first move but the tracked position works, trust the tracking
          const tp = tracker.current();
          const p = parseDesc(firstTok);
          if (p) {
            let figPos = null; try { figPos = new Chess(fen); } catch {}
            const okFig = figPos && (resolve(p, figPos).move || (resolve(p, figPos).candidates || []).length);
            const tf = flip(tp);
            const okTr = resolve(p, tp).move || (resolve(p, tp).candidates || []).length;
            const okTrF = tf && (resolve(p, tf).move || (resolve(p, tf).candidates || []).length);
            if (!okFig && (okTr || okTrF)) {
              const base = okTr ? tp : tf;
              const f = base.fen().split(' '); f[5] = String(num); fen = f.join(' ');
              report.push({ ctx, reason: `FIG ${b.n}: transcription (${placement}) rejected, using tracked position (${base.fen().split(' ')[0]})`, info: true, figSuspect: b.n });
            }
          }
        }
        try { pos = new Chess(fen); } catch (e) { b.fen = fen; b.displayOnly = true; if (!/king/i.test(e.message)) report.push({ ctx, reason: `FIG ${b.n} invalid: ${e.message}`, fen }); tracker = null; continue; }
        // the side NOT to move must not be in check
        { const f2 = flip(pos); if (f2 && f2.inCheck()) figIllegal.push({ fig: b.n, ctx, fen }); }
        // if the first token only works with the other side to move, flip
        if (firstTok) {
          const p = parseDesc(firstTok);
          if (p) { const r1 = resolve(p, pos); const f2 = flip(pos); const r2 = f2 ? resolve(p, f2) : null;
            if (!r1.move && !(r1.candidates && r1.candidates.length) && r2 && (r2.move || (r2.candidates && r2.candidates.length))) { fen = mk(stm === 'w' ? 'b' : 'w'); pos = new Chess(fen); report.push({ ctx, reason: `FIG ${b.n}: flipped side to move to ${pos.turn()} so that ${firstTok} is legal`, info: true }); } }
        }
        b.fen = fen;
        tracker = new Tracker(fen);
        continue;
      }
      if (!tracker) continue;
      if (b.t === 'p' || b.t === 'h') {
        const r = await convertText(b.text, tracker, ctx, forkOnly, isGame);
        b.text = r.text; sec.moves.push(...r.moves);
        hypo = r.hypo && r.text.length - r.hypoEnd < 60 ? r.hypo : null;
      } else if (b.t === 'moves') {
        for (let ri = 0; ri < b.rows.length; ri++) {
          const row = b.rows[ri];
          const nm = /^\s*(\d+)\.?\s*(.*)$/.exec(row.n);
          const num = nm ? Number(nm[1]) : null;
          const wtxt = nm ? nm[2].trim() : row.n.trim();
          const btxt = (row.b || '').trim();
          const cells = [];
          const colsTxt = [['w', wtxt], ['b', btxt]];
          for (let ci = 0; ci < 2; ci++) {
            const [col, txt] = colsTxt[ci];
            if (!txt || /^[.\s]+$/.test(txt)) { cells.push(txt ? '…' : ''); continue; }
            const p0 = parseDesc(txt);
            if (!p0) {
              cells.push(txt);
              // "K moves", "any", "K to R 1 or R 2": the side did move; keep the line in sync with a null move
              if (/moves|any|or/i.test(txt) && !/resign|draw|wins|mate|abandon/i.test(txt)) { const cur = tracker.current(); if (cur.turn() === col) { const f = flip(cur); if (f) { if (tracker.cur) tracker.cur.push(f); else tracker.main.push(f); } } }
              continue;
            }
            if (num) {
              const mainExp = tracker.mainExpects(num, col);
              const curExp = tracker.curExpects(num, col);
              const hypoExp = hypo && parseInt(hypo.fen().split(' ')[5]) === num && hypo.turn() === col && !mainExp && !curExp;
              if (hypoExp) { tracker.forkFrom(hypo); hypo = null; }
              else if (curExp && !isGame && tracker.curSource === 'table') { /* continue the variation line (a)/(b) */ }
              else if (mainExp) tracker.backToMain();
              else if (curExp) { /* continue */ }
              else if (!tracker.rewindTo(num, col, num === 1 || (ri === 0 && ci === 0))) { report.push({ ctx, text: txt, reason: `table move ${num} ${col} out of sync (expected ${tracker.expectedNum().n}${tracker.expectedNum().color})` }); cells.push(`[?${txt}]`); continue; }
            }
            if (tracker.cur && tracker.curSource === 'prose' && ri === 0 && ci === 0) tracker.curSource = 'table';
            const pos = tracker.current();
            const next = [];
            if (ci === 0 && btxt) next.push(btxt);
            for (let rj = ri + 1; rj < b.rows.length && next.length < 4; rj++) { next.push(b.rows[rj].n.replace(/^\s*\d+\.?\s*/, '')); if (b.rows[rj].b) next.push(b.rows[rj].b); }
            const r = await resolveTok(txt, pos, ctx, next.filter((x) => x && !/^[.\s]+$/.test(x)));
            if (!r.move) {
              report.push({ ctx, text: txt, fen: pos.fen(), reason: `table ${r.error}`, key: r.key });
              cells.push(`[?${txt}]`);
              // keep the line in sync if the following cell resolves after a null move
              const f = flip(pos); const nxt = next[0] ? parseDesc(next[0]) : null;
              if (f && nxt) { const nr = resolve(nxt, f); if (nr.move || (nr.candidates && nr.candidates.length)) { if (tracker.cur) tracker.cur.push(f); else tracker.main.push(f); } }
              continue;
            }
            const after = tracker.play(r.move);
            const id = moveId++;
            sec.moves.push({ id, san: r.move.san, uci: r.move.from + r.move.to + (r.move.promotion || ''), fen: after.fen(), color: r.move.color });
            cells.push(`⟦${id}|${r.move.san}⟧`);
          }
          row.n = num ? `${num}.` : ''; row.w = cells[0]; row.b = cells[1];
        }
        hypo = null;
      }
    }
  }
  fs.writeFileSync('book_alg.json', JSON.stringify(result, null, 1));
  fs.writeFileSync('report.json', JSON.stringify(report, null, 1));
  fs.writeFileSync('engine_choices.json', JSON.stringify(engineChoices, null, 1));
  fs.writeFileSync('fig_illegal.json', JSON.stringify(figIllegal, null, 1));
  const total = result.parts.flatMap((p) => p.chapters.flatMap((c) => c.sections.map((s) => s.moves.length))).reduce((a, b) => a + b, 0);
  const hard = report.filter((r) => !r.naive && !r.info && !/placement differs/.test(r.reason));
  console.log(`moves converted: ${total}; hard issues: ${hard.length}; naive: ${report.filter((r) => r.naive).length}; game fig mismatches: ${figMismatch}/${figChecked}; figs with side-not-to-move in check: ${figIllegal.length}; engine tie-breaks: ${engineChoices.length}`);
  sfSend('quit'); process.exit(0);
})();
