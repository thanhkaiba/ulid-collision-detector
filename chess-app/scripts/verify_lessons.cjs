/**
 * Verifies every lesson position with chess.js (legality) and Stockfish (tactical correctness).
 * Usage: node scripts/verify_lessons.cjs [--depth 20] [--only lessonId]
 */
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execSync, spawn } = require('child_process');
const { Chess } = require('chess.js');

const args = process.argv.slice(2);
const depth = Number(args[args.indexOf('--depth') + 1] || 20);
const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : null;

// 1. transpile lessons to CJS in a temp dir
const out = fs.mkdtempSync(path.join(os.tmpdir(), 'lessons-'));
execSync(
  `npx tsc src/data/lessons/*.ts --outDir ${out} --module commonjs --target es2020 --moduleResolution bundler --skipLibCheck --esModuleInterop --ignoreConfig`,
  { stdio: 'inherit', cwd: path.join(__dirname, '..') },
);
const { LESSONS } = require(path.join(out, 'index.js'));

// 2. engine
const enginePath = path.join(__dirname, '..', 'node_modules/stockfish/src/stockfish-17.1-lite-single-03e3232.js');
const sf = spawn(process.execPath, [enginePath], { stdio: ['pipe', 'pipe', 'inherit'] });
let buf = '';
const waiters = [];
sf.stdout.on('data', (d) => {
  buf += d.toString();
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i).trim();
    buf = buf.slice(i + 1);
    for (const w of waiters) w(line);
  }
});
const send = (s) => sf.stdin.write(s + '\n');
function until(pred) {
  return new Promise((res) => {
    const fn = (line) => {
      if (pred(line)) {
        waiters.splice(waiters.indexOf(fn), 1);
        res(line);
      }
    };
    waiters.push(fn);
  });
}
async function go(fen, extra = '') {
  // returns {bestmove, cp, mate} from side-to-move POV
  let last = null;
  const fn = (line) => {
    if (line.startsWith('info') && line.includes(' pv ') && line.includes('multipv 1')) {
      const m = /score (cp|mate) (-?\d+)/.exec(line);
      if (m) last = { kind: m[1], v: Number(m[2]), line };
    }
  };
  waiters.push(fn);
  send(`position fen ${fen}`);
  send(`go depth ${depth}${extra}`);
  const bm = await until((l) => l.startsWith('bestmove'));
  waiters.splice(waiters.indexOf(fn), 1);
  const best = bm.split(/\s+/)[1];
  return { best, cp: last?.kind === 'cp' ? last.v : undefined, mate: last?.kind === 'mate' ? last.v : undefined };
}
const toWin = (s) => (s.mate !== undefined ? (s.mate > 0 ? 100000 - s.mate : -100000 - s.mate) : s.cp ?? 0);

(async () => {
  send('uci');
  await until((l) => l === 'uciok');
  send('setoption name Hash value 64');
  send('isready');
  await until((l) => l === 'readyok');

  let fails = 0,
    checks = 0;
  const fail = (lesson, i, msg) => {
    fails++;
    console.log(`FAIL  ${lesson.id} #${i}: ${msg}`);
  };
  for (const lesson of LESSONS) {
    if (only && lesson.id !== only) continue;
    lesson.blocks.forEach((b, i) => {
      if (b.kind === 'diagram' || b.kind === 'task') {
        try {
          const c = new Chess(b.fen);
          if (b.kind === 'diagram' && b.mate && !c.isCheckmate()) fail(lesson, i, 'diagram flagged mate is not checkmate');
          // the side that just moved may not be in check (an impossible position)
          const t = b.fen.split(' ');
          t[1] = t[1] === 'w' ? 'b' : 'w';
          t[3] = '-';
          try {
            if (new Chess(t.join(' ')).inCheck()) fail(lesson, i, 'impossible position: the side not to move is in check');
          } catch {
            /* chess.js refuses some flipped positions; the original FEN was valid */
          }
          for (const m of b.kind === 'diagram' ? b.marks ?? [] : []) if (!/^([a-h][1-8]){1,2}$/.test(m)) fail(lesson, i, `bad mark ${m}`);
        } catch (e) {
          fail(lesson, i, `invalid FEN ${b.fen}: ${e.message}`);
        }
      }
    });
    for (let i = 0; i < lesson.blocks.length; i++) {
      const b = lesson.blocks[i];
      if (b.kind !== 'task') continue;
      let c;
      try {
        c = new Chess(b.fen);
      } catch {
        continue;
      }
      checks++;
      // legality of the whole line
      let ok = true;
      for (const u of b.moves) {
        try {
          c.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] });
        } catch {
          fail(lesson, i, `illegal move ${u} in line ${b.moves.join(' ')}`);
          ok = false;
          break;
        }
      }
      for (const u of b.alternatives ?? []) {
        const t = new Chess(b.fen);
        try {
          t.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] });
        } catch {
          fail(lesson, i, `illegal alternative ${u}`);
        }
      }
      if (!ok) continue;
      if (b.verify === 'line') {
        // a guided line still must not ask for a clearly bad move: each student move within 2 pawns of the best
        // (a hanging piece next to the demonstrated rule was missed this way once)
        const cl = new Chess(b.fen);
        for (let k = 0; k < b.moves.length; k++) {
          if (k % 2 === 0) {
            const o = await go(cl.fen());
            if (o.best !== b.moves[k]) {
              const m = await go(cl.fen(), ` searchmoves ${b.moves[k]}`);
              const d = toWin(o) - toWin(m);
              if (d > 200) fail(lesson, i, `guided move #${k} ${b.moves[k]} is ${d}cp worse than ${o.best}`);
            }
          }
          cl.move({ from: b.moves[k].slice(0, 2), to: b.moves[k].slice(2, 4), promotion: b.moves[k][4] });
        }
        continue;
      }
      const first = b.moves[0];
      const accepted = [first, ...(b.alternatives ?? [])];
      const overall = await go(b.fen);
      if (b.verify === 'mate') {
        const mine = await go(b.fen, ` searchmoves ${first}`);
        if (mine.mate === undefined || mine.mate <= 0) fail(lesson, i, `${first} does not mate (${JSON.stringify(mine)})`);
        else if (overall.mate !== undefined && overall.mate < mine.mate)
          fail(lesson, i, `${first} mates in ${mine.mate} but ${overall.best} mates in ${overall.mate}`);
        // ensure the scripted line's length matches a mate
        const end = new Chess(b.fen);
        for (const u of b.moves) end.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] });
        if (!end.isCheckmate()) fail(lesson, i, `scripted line does not end in checkmate`);
        for (const alt of b.alternatives ?? []) {
          const a = await go(b.fen, ` searchmoves ${alt}`);
          if (a.mate === undefined || a.mate <= 0) fail(lesson, i, `alternative ${alt} does not mate`);
        }
        continue;
      }
      // 'best': the solution must actually work: after it the student must not stand worse.
      // (Being the engine's top move is not enough: in a lost position the top move can still lose,
      // e.g. a "fork" whose pawn is simply taken.)
      {
        const sol = await go(b.fen, ` searchmoves ${first}`);
        if (toWin(sol) < -100) fail(lesson, i, `${first} leaves the student worse (${JSON.stringify(sol)}): the idea does not work`);
      }
      // and it must be as good as the engine's best (within 30cp), and the engine's best must be accepted
      if (!accepted.includes(overall.best)) {
        const mine = await go(b.fen, ` searchmoves ${first}`);
        const diff = toWin(overall) - toWin(mine);
        const bw = toWin(overall), mw = toWin(mine);
        const sameResult = (bw > 150 && mw > 150) || (bw < -150 && mw < -150) || (Math.abs(bw) <= 150 && Math.abs(mw) <= 150);
        if (diff > 30 && !(sameResult && diff < 400)) fail(lesson, i, `engine prefers ${overall.best} (${JSON.stringify(overall)}) over ${first} (${JSON.stringify(mine)})`);
        else console.log(`note  ${lesson.id} #${i}: engine best ${overall.best} ~ solution ${first} (diff ${diff}cp); consider adding alternative`);
      }
      for (const alt of b.alternatives ?? []) {
        if (alt === overall.best) continue;
        const a = await go(b.fen, ` searchmoves ${alt}`);
        const diff = toWin(overall) - toWin(a);
        // opening theory accepts moves within about 3/4 of a pawn (e.g. the Fritz 5...Nd4 next to 5...Na5)
        if (diff > 80) fail(lesson, i, `alternative ${alt} is clearly worse (${diff}cp) than ${overall.best}`);
      }
      // scripted opponent replies should be reasonable (not blunders): check each student move in line is still best-ish
      const cc = new Chess(b.fen);
      for (let k = 0; k < b.moves.length; k++) {
        if (k % 2 === 0 && k > 0) {
          const o = await go(cc.fen());
          if (o.best !== b.moves[k]) {
            const m = await go(cc.fen(), ` searchmoves ${b.moves[k]}`);
            // the scripted move must keep the result: a win stays a win, a draw stays a draw
            const bw = toWin(o), mw = toWin(m);
            if ((bw > 150 && mw < 150) || (Math.abs(bw) <= 150 && mw < -150))
              fail(lesson, i, `student move #${k} ${b.moves[k]} throws away the result (${mw}cp vs ${bw}cp for ${o.best})`);
          }
        }
        cc.move({ from: b.moves[k].slice(0, 2), to: b.moves[k].slice(2, 4), promotion: b.moves[k][4] });
      }
    }
  }
  console.log(`\n${checks} tasks checked, ${fails} failures`);
  send('quit');
  process.exit(fails ? 1 : 0);
})();
