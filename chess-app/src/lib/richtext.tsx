import type { ReactNode } from 'react';
import { Chess } from 'chess.js';
import type { Key } from 'chessground/types';

/** What a click in the text asks the board to show. */
export interface Preview {
  fen: string;
  lastMove?: Key[];
  /** squares to highlight */
  squares?: Key[];
  label: string;
  /** positions from the start of the sequence up to this one, so the sheet can play the moves that lead here */
  path?: string[];
  /** which side to show at the bottom (the board the text belongs to may be flipped) */
  orientation?: 'white' | 'black';
}

export interface RichOptions {
  onShow: (p: Preview) => void;
  /** `{san san}` variations start from `after`; `{^san}` from `before` */
  braces?: { before?: string; after?: string };
  /** numbered references like `12.O-O-O` / `9...b5` that point into a known main line */
  mainline?: { sans: string[]; fens: string[] }; // fens[i] = position after i plies (fens[0] = start)
  /** free numbered sequences (`1.e4 e5 2.Nf3`) are played from this position */
  seqStart?: string;
  /** optional shared state so a sequence can continue across paragraphs of one block */
  seq?: { line: string[] };
  /** board on which a clicked square is highlighted */
  squareFen?: string;
  activeLabel?: string;
}

const SAN = String.raw`(?:O-O(?:-O)?|[KQRBN]?[a-h]?[1-8]?x?[a-h][1-8](?:=[QRBN])?)[+#]?`;
const TOKEN_SRC = new RegExp(
  String.raw`\{([^}]*)\}` + // 1: variation
    String.raw`|(\d+)(\.\.\.|\.)\s?(${SAN})((?:\s+${SAN}(?![\w.]))*)` + // 2,3,4: numbered move; 5: unnumbered continuation
    String.raw`|\*\*([^*]+)\*\*` + // 6: bold
    String.raw`|\*([^*]+)\*` + // 7: italic
    String.raw`|(?<![\w/])([a-h][1-8])(?![\w/])`, // 8: square
  'g',
);

function label(fenBefore: string, san: string, first: boolean): string {
  const parts = fenBefore.split(' ');
  const n = parts[5];
  if (parts[1] === 'w') return `${n}.${san}`;
  return first ? `${n}...${san}` : san;
}

function tryMove(fen: string, san: string) {
  try {
    const c = new Chess(fen);
    const m = c.move(san);
    return { fen: c.fen(), lastMove: [m.from as Key, m.to as Key], san: m.san };
  } catch {
    return null;
  }
}

/**
 * Render commentary text with clickable moves, variations and squares.
 * Stateless: every call re-walks the text, so free sequences are resolved in reading order.
 */
export function renderRich(text: string, opts: RichOptions): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let k = 0;
  // running line for free numbered sequences
  const seq = opts.seq ?? { line: opts.seqStart ? [opts.seqStart] : [] };
  if (!seq.line.length && opts.seqStart) seq.line = [opts.seqStart];
  let line = seq.line;
  const setLine = (l: string[]) => {
    line = l;
    seq.line = l;
  };
  const chip = (lbl: string, p: Preview | null) =>
    p ? (
      <button key={k++} className={`mv-chip ${opts.activeLabel === p.label ? 'active' : ''}`} onClick={() => opts.onShow(p)}>
        {lbl}
      </button>
    ) : (
      <span key={k++} className="mv-plain">
        {lbl}
      </span>
    );

  // a fresh regex per call: renderRich recurses for bold/italic and must not share lastIndex
  const TOKEN = new RegExp(TOKEN_SRC.source, 'g');
  let m: RegExpExecArray | null;
  while ((m = TOKEN.exec(text))) {
    if (m.index > last) out.push(<span key={k++}>{text.slice(last, m.index)}</span>);
    last = m.index + m[0].length;

    if (m[1] !== undefined) {
      // ---- variation in braces ----
      let body = m[1].trim();
      let fen = opts.braces?.after;
      if (body.startsWith('^')) {
        body = body.slice(1).trim();
        fen = opts.braces?.before;
      }
      const sans = body.split(/\s+/).filter(Boolean);
      if (!fen) {
        out.push(<span key={k++} className="mv-plain">{sans.join(' ')}</span>);
        continue;
      }
      let cur = fen;
      let ok = true;
      const trail: string[] = [];
      const fens: string[] = [fen];
      sans.forEach((s, i) => {
        if (!ok) return out.push(<span key={k++} className="mv-plain"> {s}</span>);
        const r = tryMove(cur, s);
        if (!r) {
          ok = false;
          return out.push(<span key={k++} className="mv-plain"> {s}</span>);
        }
        const lbl = label(cur, r.san, i === 0);
        trail.push(lbl);
        fens.push(r.fen);
        out.push(chip(lbl, { fen: r.fen, lastMove: r.lastMove, label: trail.join(' '), path: [...fens] }));
        cur = r.fen;
      });
      continue;
    }

    if (m[2] !== undefined) {
      // ---- numbered move (+ optional continuation) ----
      const n = Number(m[2]);
      const black = m[3] === '...';
      const first = m[4];
      const rest = m[5] ? m[5].trim().split(/\s+/).filter(Boolean) : [];
      const ml = opts.mainline;
      const plyIdx = (n - 1) * 2 + (black ? 1 : 0); // index into sans
      const strip = (s: string) => s.replace(/[+#]/g, '');
      if (ml && ml.sans[plyIdx] && strip(ml.sans[plyIdx]) === strip(first)) {
        // reference into the main line
        const fenBefore = ml.fens[plyIdx];
        const r = tryMove(fenBefore, ml.sans[plyIdx]);
        const lbl = `${n}${black ? '...' : '.'}${ml.sans[plyIdx]}`;
        out.push(chip(lbl, r ? { fen: r.fen, lastMove: r.lastMove, label: lbl, path: ml.fens.slice(0, plyIdx + 2) } : null));
        let idx = plyIdx + 1;
        for (const s of rest) {
          if (ml.sans[idx] && strip(ml.sans[idx]) === strip(s)) {
            const r2 = tryMove(ml.fens[idx], ml.sans[idx]);
            const l2 = label(ml.fens[idx], ml.sans[idx], false);
            out.push(<span key={k++}> </span>);
            out.push(chip(l2, r2 ? { fen: r2.fen, lastMove: r2.lastMove, label: `${lbl} ${l2}`, path: ml.fens.slice(0, idx + 2) } : null));
            idx++;
          } else out.push(<span key={k++} className="mv-plain"> {s}</span>);
        }
        continue;
      }
      if (line.length) {
        // free sequence resolved against the running line
        const start = line[0].split(' ');
        const startNum = Number(start[5]);
        const idx = (n - startNum) * 2 + (black ? 1 : 0) - (start[1] === 'b' ? 1 : 0);
        if (idx >= 0 && idx < line.length) {
          const r = tryMove(line[idx], first);
          if (r) {
            setLine([...line.slice(0, idx + 1), r.fen]);
            const lbl = `${n}${black ? '...' : '.'}${r.san}`;
            out.push(chip(lbl, { fen: r.fen, lastMove: r.lastMove, label: lbl, path: [...line] }));
            let trail = lbl;
            for (const s of rest) {
              const cur = line[line.length - 1];
              const r2 = tryMove(cur, s);
              out.push(<span key={k++}> </span>);
              if (r2) {
                const l2 = label(cur, r2.san, false);
                trail += ` ${l2}`;
                setLine([...line, r2.fen]);
                out.push(chip(l2, { fen: r2.fen, lastMove: r2.lastMove, label: trail, path: [...line] }));
              } else out.push(<span key={k++} className="mv-plain">{s}</span>);
            }
            continue;
          }
        }
      }
      out.push(<span key={k++} className="mv-plain">{m[0]}</span>);
      continue;
    }

    if (m[6] !== undefined) {
      out.push(<b key={k++}>{renderRich(m[6], opts)}</b>);
      continue;
    }
    if (m[7] !== undefined) {
      out.push(<i key={k++}>{renderRich(m[7], opts)}</i>);
      continue;
    }
    if (m[8] !== undefined) {
      const sq = m[8] as Key;
      const fen = opts.squareFen;
      out.push(
        fen ? (
          <button key={k++} className="sq-chip" onClick={() => opts.onShow({ fen, squares: [sq], label: `ô ${sq}` })}>
            {sq}
          </button>
        ) : (
          <span key={k++}>{sq}</span>
        ),
      );
      continue;
    }
  }
  if (last < text.length) out.push(<span key={k++}>{text.slice(last)}</span>);
  return out;
}
