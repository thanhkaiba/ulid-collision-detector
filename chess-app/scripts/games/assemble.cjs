/** Validate annotation files and publish them into src/data/games (annotated/*.json + meta.json). */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const META = JSON.parse(fs.readFileSync(path.join(__dirname, 'meta.json'), 'utf8'));
// display order, difficulty, and which side the reader sits on
const ORDER = [
  ['opera', 1, 'w'], ['steinitz-bardeleben', 1, 'w'], ['lasker-bauer', 1, 'w'],
  ['rotlewi-rubinstein', 2, 'b'], ['byrne-fischer', 2, 'b'], ['capablanca-tartakower', 2, 'w'],
  ['alekhine-nimzowitsch', 2, 'w'], ['saemisch-nimzowitsch', 2, 'b'],
  ['botvinnik-capablanca', 3, 'w'], ['fischer-spassky-6', 3, 'w'], ['karpov-unzicker', 3, 'w'], ['karpov-kasparov-16', 3, 'b'],
];
const outDir = path.join(__dirname, '..', '..', 'src', 'data', 'games', 'annotated');
fs.mkdirSync(outDir, { recursive: true });
for (const f of fs.readdirSync(outDir)) fs.unlinkSync(path.join(outDir, f));
const meta = [];
for (const [id, level, side] of ORDER) {
  const src = path.join(__dirname, 'annotations', id + '.json');
  if (!fs.existsSync(src)) { console.log('missing', id); continue; }
  try { execFileSync(process.execPath, [path.join(__dirname, 'tool.cjs'), 'check', src], { stdio: 'pipe' }); }
  catch (e) { console.log('INVALID', id, '\n' + (e.stdout || '').toString().split('\n').slice(0, 8).join('\n')); continue; }
  const a = JSON.parse(fs.readFileSync(src, 'utf8'));
  const g = META[id];
  const clean = { id, title: a.title, theme: a.theme, intro: a.intro, moves: a.moves.map((m) => ({ san: m.san, c: m.c.replace(/\s*\n\s*/g, ' ').trim() })), outro: a.outro, lessons: a.lessons };
  fs.writeFileSync(path.join(outDir, id + '.json'), JSON.stringify(clean));
  const words = clean.moves.reduce((n, m) => n + m.c.split(/\s+/).length, 0);
  meta.push({ id, white: g.white, black: g.black, event: g.event, year: g.year, result: g.result, level, side, title: a.title, theme: a.theme, plies: g.moves.length, words });
  console.log('ok', id.padEnd(24), String(g.moves.length).padStart(3), 'plies', String(words).padStart(5), 'words');
}
fs.writeFileSync(path.join(outDir, '..', 'meta.json'), JSON.stringify(meta, null, 1));
console.log(meta.length, 'games published');
