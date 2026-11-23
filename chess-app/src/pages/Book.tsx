import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Chess } from 'chess.js';
import type { Key } from 'chessground/types';
import type { DrawShape } from 'chessground/draw';
import Board from '../components/Board';
import { Button, Card, Spinner } from '../components/ui';
import { navigate, type Route } from '../lib/router';
import { loadLessonProgress, saveLessonProgress, setLessonStatus, type LessonProgress } from '../lib/storage';
import MarkBar from '../components/MarkBar';
import { logActivity, unlogLesson } from '../lib/activity';

/* ---------- data shape produced by scripts/book (Capablanca, Chess Fundamentals, public domain) ---------- */
type BookMoveRow = [number, string, string, string, 1?]; // id, san, uci, fen, inferred position
interface BookMove { id: number; san: string; uci: string; fen: string; inferred?: boolean }
type BookBlock =
  | { t: 'p' | 'h'; text: string }
  | { t: 'fig'; n: number; fen?: string; displayOnly?: boolean }
  | { t: 'moves'; rows: { n: string; w?: string; b?: string }[] };
interface BookSection { heading: string; blocks: BookBlock[]; moves: BookMoveRow[] }
interface BookChapter { title: string; heading: string; sections: BookSection[] }
interface BookData { parts: { title: string; chapters: BookChapter[] }[]; meta?: { title: string; author: string; note: string } }

let cache: BookData | null = null;
async function loadBook(): Promise<BookData> {
  if (cache) return cache;
  const mod = await import('../data/book.json');
  cache = mod.default as unknown as BookData;
  return cache;
}

export default function Book({ route }: { route: Route }) {
  const [book, setBook] = useState<BookData | null>(null);
  useEffect(() => {
    loadBook().then(setBook);
  }, []);
  if (!book) return <Spinner label="Đang tải sách..." />;
  // route: learn/book            -> table of contents
  //        learn/book/<p>/<c>/<s> -> one section
  const [p, c, s] = route.parts.slice(1).map(Number);
  // keyed by section: the board state of one section must not flash on the next
  if (route.parts.length >= 4 && !Number.isNaN(s)) return <SectionView key={`${p}/${c}/${s}`} book={book} pi={p} ci={c} si={s} />;
  return <Toc book={book} />;
}

/** last section opened, so "Đọc tiếp" resumes there even when the reader moved on with "Tiếp" without marking */
const LAST_KEY = 'book-last';
function loadLast(): string | null {
  try {
    return localStorage.getItem(LAST_KEY);
  } catch {
    return null;
  }
}

/** Part II's chapter "heading" is really game 1's venue (the converter lifted it from the first game), so it is only shown there. */
const chapterHeading = (pi: number, si: number | null, ch: BookChapter) => (pi === 1 && si !== 0 ? '' : ch.heading);

function Toc({ book }: { book: BookData }) {
  const [lp, setLp] = useState<LessonProgress | null>(null);
  useEffect(() => {
    loadLessonProgress().then(setLp);
  }, []);
  const keys: string[] = [];
  book.parts.forEach((part, pi) => part.chapters.forEach((ch, ci) => ch.sections.forEach((_, si) => keys.push(`${pi}/${ci}/${si}`))));
  const st = (k: string) => lp?.status[`book:${k.replace(/\//g, '.')}`];
  const doneCount = keys.filter((k) => st(k) === 'done').length;
  const skippedCount = keys.filter((k) => st(k) === 'skipped').length;
  const last = loadLast();
  const lastIdx = last ? keys.indexOf(last) : -1;
  const nextKey = (lastIdx >= 0 ? keys.slice(lastIdx).find((k) => !st(k)) : undefined) ?? keys.find((k) => !st(k));
  return (
    <div>
      <div className="topbar">
        <button className="back" onClick={() => navigate('learn')} aria-label="Quay lại">
          ‹
        </button>
        <h2 style={{ margin: 0 }}>{book.meta?.title ?? 'Chess Fundamentals'}</h2>
      </div>
      <Card>
        <p className="small" style={{ margin: 0 }}>
          <b>{book.meta?.author ?? 'José Raúl Capablanca'}</b> (1921). {book.meta?.note ?? ''} Mỗi hình đều tương tác: bấm vào một nước trong văn bản để xem thế cờ trên bàn.
        </p>
        <div className="row-between mt small">
          <span>
            Đã học <b>{doneCount}</b>/{keys.length} mục{skippedCount > 0 && <span className="muted"> · bỏ qua {skippedCount}</span>}
          </span>
        </div>
        <div className="progress mt">
          <div style={{ width: `${(100 * doneCount) / Math.max(1, keys.length)}%` }} />
        </div>
        {nextKey && (
          <Button kind="primary" className="mt" onClick={() => navigate(`learn/book/${nextKey}`)}>
            {doneCount + skippedCount > 0 || lastIdx >= 0 ? 'Đọc tiếp' : 'Bắt đầu đọc'}
          </Button>
        )}
      </Card>
      {book.parts.map((part, pi) => (
        <div key={pi}>
          <h2 className="mt">{part.title}</h2>
          {part.chapters.map((ch, ci) => (
            <div key={ci}>
              <h3 className="mt">
                {ch.title} <span className="muted small">{chapterHeading(pi, null, ch)}</span>
              </h3>
              {ch.sections.map((sec, si) => (
                <div key={si} className="list-item" onClick={() => navigate(`learn/book/${pi}/${ci}/${si}`)}>
                  <span>{sec.heading}</span>
                  <span className="muted">
                    {st(`${pi}/${ci}/${si}`) === 'done' ? '✓' : st(`${pi}/${ci}/${si}`) === 'skipped' ? 'bỏ qua' : lp?.read[`book:${pi}.${ci}.${si}`] ? 'đang đọc' : '›'}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

const TOKEN = /⟦(-|\d+)\|([^⟧]*)⟧/g;
const TOKEN_TEST = /⟦/;
const SQUARE_TEST = /(?<![\w/])[a-h][1-8](?![\w/])/;

function SectionView({ book, pi, ci, si }: { book: BookData; pi: number; ci: number; si: number }) {
  const ch = book.parts[pi]?.chapters[ci];
  const sec = ch?.sections[si];
  /**
   * what the board shows instead of the section's opening diagram. `base` is the figure (its number) the position belongs
   * to: a square or an unplaced move in the text is shown on the figure the paragraph talks about, not on whatever the board
   * showed before. `caption` is the line under the board; `label` marks the active move chip.
   */
  const [active, setActive] = useState<{ fen: string; lastMove?: Key[]; label?: string; squares?: Key[]; caption: string; base?: number } | null>(null);
  const moveById = useMemo(() => new Map<number, BookMove>((sec?.moves ?? []).map((m) => [m[0], { id: m[0], san: m[1], uci: m[2], fen: m[3], inferred: !!m[4] }])), [sec]);
  const boardRef = useRef<HTMLDivElement>(null);
  const statusKey = `book:${pi}.${ci}.${si}`;
  const [status, setStatus] = useState<'done' | 'skipped' | undefined>(undefined);
  const marking = useRef(false);

  useEffect(() => {
    setActive(null);
    try {
      localStorage.setItem(LAST_KEY, `${pi}/${ci}/${si}`);
    } catch {
      /* ignore */
    }
    loadLessonProgress().then((lp) => {
      const key = `book:${pi}.${ci}.${si}`;
      setStatus(lp.status[key]);
      if (!lp.read[key]) saveLessonProgress({ ...lp, read: { ...lp.read, [key]: 1 } });
    });
  }, [pi, ci, si]);

  if (!sec)
    return (
      <div>
        <div className="topbar">
          <button className="back" onClick={() => navigate('learn/book')} aria-label="Mục lục">
            ‹
          </button>
          <h2 style={{ margin: 0 }}>Không tìm thấy mục</h2>
        </div>
        <p className="muted">Đường dẫn này không trỏ tới mục nào trong sách.</p>
        <Button kind="primary" onClick={() => navigate('learn/book')}>
          Về mục lục
        </Button>
      </div>
    );
  const all = ch.sections;
  const lastOf = (p: number, c: number) => `learn/book/${p}/${c}/${book.parts[p].chapters[c].sections.length - 1}`;
  const prev =
    si > 0
      ? `learn/book/${pi}/${ci}/${si - 1}`
      : ci > 0
        ? lastOf(pi, ci - 1)
        : pi > 0
          ? lastOf(pi - 1, book.parts[pi - 1].chapters.length - 1)
          : null;
  const next =
    si < all.length - 1
      ? `learn/book/${pi}/${ci}/${si + 1}`
      : ci < book.parts[pi].chapters.length - 1
        ? `learn/book/${pi}/${ci + 1}/0`
        : pi < book.parts.length - 1
          ? `learn/book/${pi + 1}/0/0`
          : null;

  const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  const isGame = pi === 1;
  const figs = sec.blocks.map((b, i) => ({ b, i })).filter((x): x is { b: { t: 'fig'; n: number; fen: string }; i: number } => x.b.t === 'fig' && !!x.b.fen);
  // the board opens on the first figure (Part II's games start from the initial position instead)
  const defaultFig = isGame ? undefined : figs[0]?.b;
  const defaultFen = defaultFig?.fen ?? START_FEN;
  /** the figure a block of text belongs to: the nearest one above it, else the board the section opens with */
  const figOf = (blockIdx: number) => [...figs].reverse().find((f) => f.i < blockIdx)?.b ?? defaultFig;
  const shownFen = active?.fen ?? defaultFen;
  /** position a square or an unplaced move in block `bi` refers to: the board as shown if it belongs to that block's figure */
  const contextOf = (bi: number) => {
    const fig = figOf(bi);
    if (active && active.base === fig?.n) return { fen: active.fen, lastMove: active.lastMove, label: active.label, caption: active.caption, base: fig?.n };
    if (!active && fig === defaultFig) return { fen: defaultFen, caption: fig ? `Hình ${fig.n}` : 'Thế cờ ban đầu', base: fig?.n };
    return { fen: fig?.fen ?? START_FEN, caption: fig ? `Hình ${fig.n}` : 'Thế cờ ban đầu', base: fig?.n };
  };

  const onMove = (id: number, label: string, bi: number) => {
    const m = moveById.get(id);
    if (!m) return;
    setActive({ fen: m.fen, lastMove: [m.uci.slice(0, 2) as Key, m.uci.slice(2, 4) as Key], label, caption: `Sau ${label}`, base: figOf(bi)?.n });
    // keep the sticky board visible on phones
    if (window.innerWidth < 640) boardRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  };

  const showSquare = (sq: Key, bi: number) => setActive({ ...contextOf(bi), squares: [sq] });
  /** a move the converter could not place: try it on the board the paragraph is about, else just point at its square */
  const tryLoose = (label: string, bi: number) => {
    const ctx = contextOf(bi);
    try {
      const c = new Chess(ctx.fen);
      const m = c.move(label.replace(/^\d+\.+/, ''));
      setActive({ fen: c.fen(), lastMove: [m.from as Key, m.to as Key], label, caption: `Sau ${label}`, base: ctx.base });
    } catch {
      const sq = /[a-h][1-8]/.exec(label);
      if (sq) showSquare(sq[0] as Key, bi);
    }
  };
  const withSquares = (s: string, key: number, bi: number): ReactNode => {
    const parts = s.split(/(?<![\w/])([a-h][1-8])(?![\w/])/g);
    return (
      <span key={key}>
        {parts.map((part, i) =>
          i % 2 === 1 ? (
            <button key={i} className="sq-chip" onClick={() => showSquare(part as Key, bi)}>
              {part}
            </button>
          ) : (
            <span key={i}>{inline(part)}</span>
          ),
        )}
      </span>
    );
  };

  const renderText = (text: string, bi: number): ReactNode[] => {
    const out: ReactNode[] = [];
    let last = 0;
    let m: RegExpExecArray | null;
    TOKEN.lastIndex = 0;
    let k = 0;
    while ((m = TOKEN.exec(text))) {
      if (m.index > last) out.push(withSquares(text.slice(last, m.index), k++, bi));
      const id = m[1] === '-' ? null : Number(m[1]);
      const label = m[2];
      const chip =
        id !== null && moveById.has(id) ? (
          <button
            key={k++}
            className={`mv-chip ${moveById.get(id)!.inferred ? 'inferred' : ''} ${active?.label === label && active?.fen === moveById.get(id)!.fen ? 'active' : ''}`}
            onClick={() => onMove(id, label, bi)}
          >
            {label}
          </button>
        ) : (
          <button key={k++} className="mv-chip loose" onClick={() => tryLoose(label, bi)}>
            {label}
          </button>
        );
      last = m.index + m[0].length;
      // punctuation right after a move stays on its line instead of wrapping alone to the next one
      const punct = /^[.,;:!?)\]]+/.exec(text.slice(last))?.[0];
      if (punct) {
        out.push(
          <span key={k++} style={{ whiteSpace: 'nowrap' }}>
            {chip}
            {punct}
          </span>,
        );
        last += punct.length;
      } else out.push(chip);
    }
    if (last < text.length) out.push(withSquares(text.slice(last), k++, bi));
    return out;
  };

  /** "back" from a move or a marked square returns to the figure it belongs to */
  const baseFig = active ? figs.find((f) => f.b.n === active.base)?.b : undefined;
  const atBase = !!active && !active.lastMove && !active.squares?.length && active.fen === (baseFig?.fen ?? defaultFen);
  const backToBase = () => {
    if (!baseFig || baseFig === defaultFig) setActive(null);
    else setActive({ fen: baseFig.fen, caption: `Hình ${baseFig.n}`, base: baseFig.n });
  };
  const chess = safeChess(shownFen);
  // chapter openers and a few prose-only sections have nothing to show on a board
  const hasBoard = sec.moves.length > 0 || sec.blocks.some((b) => (b.t === 'fig' && b.fen) || ((b.t === 'p' || b.t === 'h') && (TOKEN_TEST.test(b.text) || SQUARE_TEST.test(b.text))));
  const sub = chapterHeading(pi, si, ch);
  const subtitle = sub && sub !== sec.heading ? `${ch.title} · ${sub}` : ch.title;

  return (
    <div className="lesson-body">
      <div className="topbar">
        <button className="back" onClick={() => navigate('learn/book')} aria-label="Mục lục">
          ‹
        </button>
        <div>
          <div className="tiny muted">{subtitle}</div>
          <h2 style={{ margin: 0 }}>{sec.heading}</h2>
        </div>
      </div>

      <div className={hasBoard ? 'book-layout' : undefined}>
        {hasBoard && (
        <div className="book-board" ref={boardRef}>
          <Board
            fen={shownFen}
            orientation="white"
            turnColor={chess ? (chess.turn() === 'w' ? 'white' : 'black') : 'white'}
            lastMove={active?.lastMove}
            check={chess && chess.inCheck() ? (chess.turn() === 'w' ? 'white' : 'black') : false}
            viewOnly
            coordinates
            shapes={(active?.squares ?? []).map((sq): DrawShape => ({ orig: sq, brush: 'yellow' }))}
          />
          <div className="row-between small mt">
            <span className="muted">{active ? active.caption : defaultFig ? `Hình ${defaultFig.n} · bấm vào một nước đi trong bài` : 'Bấm vào một nước đi trong bài'}</span>
            {active && !atBase && (
              <button className="chip" onClick={backToBase}>
                {baseFig ? `về Hình ${baseFig.n}` : 'về thế ban đầu'}
              </button>
            )}
          </div>
        </div>
        )}

        <div className="book-text">
          {sec.blocks.map((b, i) => {
            if (b.t === 'fig') {
              if (!b.fen) return null;
              const c = safeChess(b.fen);
              return (
                <div key={i} className="book-fig">
                  <button className="chip" onClick={() => setActive(b === defaultFig ? null : { fen: b.fen!, caption: `Hình ${b.n}`, base: b.n })}>
                    ♟ Hình {b.n}{c ? (c.turn() === 'w' ? ' · Trắng đi' : ' · Đen đi') : ''}
                  </button>
                  <MiniBoard fen={b.fen} />
                </div>
              );
            }
            if (b.t === 'moves') {
              return (
                <div key={i} className="book-moves">
                  {b.rows.map((r, j) => (
                    <div key={j} className="book-move-row">
                      <span className="num">{r.n}</span>
                      <span>{renderText(r.w ?? '', i)}</span>
                      <span>{renderText(r.b ?? '', i)}</span>
                    </div>
                  ))}
                </div>
              );
            }
            if (b.t === 'h') return <h3 key={i}>{renderText(b.text, i)}</h3>;
            return <p key={i}>{renderText(b.text, i)}</p>;
          })}
        </div>
      </div>

      <MarkBar
        status={status}
        onMark={async (v) => {
          if (marking.current) return; // a double tap must not log the section twice
          marking.current = true;
          try {
            const was = (await loadLessonProgress()).status[statusKey];
            const lp = await setLessonStatus(statusKey, v);
            // today's plan counts what was learned: unmarking takes the section back off, re-marking does not count it twice
            const title = `Sách: ${sec.heading}`;
            if (v === 'done' && was !== 'done') await logActivity('lessons', 1, title);
            else if (v !== 'done' && was === 'done') await unlogLesson(title);
            setStatus(lp.status[statusKey]);
            if (v) navigate(next ?? 'learn/book');
          } finally {
            marking.current = false;
          }
        }}
      />
      <div className="row-between mt">
        {prev ? (
          <Button kind="ghost" onClick={() => navigate(prev)}>
            ‹ Trước
          </Button>
        ) : (
          <span />
        )}
        {next && (
          // while the section is unmarked, "✓ Đã học" above is the main way on; this one only turns the page
          <Button kind={status ? 'primary' : 'ghost'} onClick={() => navigate(next)}>
            Tiếp ›
          </Button>
        )}
      </div>
    </div>
  );
}

function MiniBoard({ fen }: { fen: string }) {
  const c = safeChess(fen);
  return <Board fen={fen} viewOnly coordinates={false} turnColor={c && c.turn() === 'b' ? 'black' : 'white'} className="mini" animate={false} />;
}

function safeChess(fen: string): Chess | null {
  try {
    return new Chess(fen);
  } catch {
    return null;
  }
}

function inline(s: string): ReactNode[] {
  const parts = s.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((p, i) =>
    p.startsWith('**') && p.endsWith('**') ? <b key={i}>{p.slice(2, -2)}</b> : p.startsWith('*') && p.endsWith('*') && p.length > 2 ? <i key={i}>{p.slice(1, -1)}</i> : <span key={i}>{p}</span>,
  );
}
