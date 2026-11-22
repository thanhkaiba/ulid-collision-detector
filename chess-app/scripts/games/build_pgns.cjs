/** Validate the selected game scores with chess.js and write clean PGNs + meta.json. */
const fs = require('fs');
const path = require('path');
const { Chess } = require('chess.js');
const SRC = process.argv[2];
const PICK = {
  'opera': (h) => /Isouard/.test(h.Black),
  'steinitz-bardeleben': () => true,
  'lasker-bauer': (h, n) => n === 38,
  'rotlewi-rubinstein': (h) => h.ECO === 'D40',
  'capablanca-tartakower': () => true,
  'saemisch-nimzowitsch': (h) => /Saemisch/.test(h.White),
  'alekhine-nimzowitsch': () => true,
  'botvinnik-capablanca': () => true,
  'byrne-fischer': () => true,
  'fischer-spassky-6': (h) => h.Round === '6',
  'karpov-unzicker': () => true,
  'karpov-kasparov-16': (h) => h.Round === '16',
};
const META = {
  'opera': { white: 'Paul Morphy', black: 'Công tước Brunswick & Bá tước Isouard', event: 'Nhà hát Opera Paris', year: 1858 },
  'steinitz-bardeleben': { white: 'Wilhelm Steinitz', black: 'Curt von Bardeleben', event: 'Hastings', year: 1895 },
  'lasker-bauer': { white: 'Emanuel Lasker', black: 'Johann Bauer', event: 'Amsterdam', year: 1889 },
  'rotlewi-rubinstein': { white: 'Georg Rotlewi', black: 'Akiba Rubinstein', event: 'Lodz', year: 1907 },
  'capablanca-tartakower': { white: 'José Raúl Capablanca', black: 'Savielly Tartakower', event: 'New York', year: 1924 },
  'saemisch-nimzowitsch': { white: 'Friedrich Sämisch', black: 'Aron Nimzowitsch', event: 'Copenhagen', year: 1923 },
  'alekhine-nimzowitsch': { white: 'Alexander Alekhine', black: 'Aron Nimzowitsch', event: 'San Remo', year: 1930 },
  'botvinnik-capablanca': { white: 'Mikhail Botvinnik', black: 'José Raúl Capablanca', event: 'AVRO, Hà Lan', year: 1938 },
  'byrne-fischer': { white: 'Donald Byrne', black: 'Bobby Fischer (13 tuổi)', event: 'New York, Rosenwald', year: 1956 },
  'fischer-spassky-6': { white: 'Bobby Fischer', black: 'Boris Spassky', event: 'Tranh ngôi vô địch thế giới, ván 6, Reykjavik', year: 1972 },
  'karpov-unzicker': { white: 'Anatoly Karpov', black: 'Wolfgang Unzicker', event: 'Olympiad Nice', year: 1974 },
  'karpov-kasparov-16': { white: 'Anatoly Karpov', black: 'Garry Kasparov', event: 'Tranh ngôi vô địch thế giới, ván 16, Moskva', year: 1985 },
};
const out = {};
for (const id of Object.keys(PICK)) {
  const cands = JSON.parse(fs.readFileSync(path.join(SRC, id + '.cands.json'), 'utf8'));
  const sel = cands.filter((c) => PICK[id](c.headers, (c.body.match(/\d+\./g) || []).length));
  if (sel.length !== 1) { console.log('!!', id, 'matches', sel.length); continue; }
  const c = sel[0];
  const body = c.body.replace(/\{[^}]*\}/g, ' ').replace(/\s+/g, ' ').trim();
  const result = c.headers.Result;
  const toks = body.replace(/\d+\.(\.\.)?/g, ' ').split(/\s+/).filter((t) => t && !/^(1-0|0-1|1\/2-1\/2|\*)$/.test(t));
  const chess = new Chess();
  const sans = [];
  for (const t of toks) { const m = chess.move(t); sans.push(m.san); }
  out[id] = { ...META[id], result, eco: c.headers.ECO, moves: sans, finalFen: chess.fen(), mate: chess.isCheckmate() };
  let pgn = '';
  sans.forEach((s, i) => { pgn += (i % 2 === 0 ? `${i / 2 + 1}. ` : '') + s + ' '; });
  fs.writeFileSync(path.join(__dirname, 'pgn', id + '.pgn'), `[White "${META[id].white}"]\n[Black "${META[id].black}"]\n[Date "${META[id].year}"]\n[Result "${result}"]\n\n${pgn}${result}\n`);
  console.log(id.padEnd(24), String(sans.length).padStart(3), 'plies', result, chess.isCheckmate() ? 'MATE' : '', '| last:', sans.slice(-3).join(' '));
}
fs.writeFileSync(path.join(__dirname, 'meta.json'), JSON.stringify(out, null, 1));
