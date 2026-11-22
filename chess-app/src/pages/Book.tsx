import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Chess } from 'chess.js';
import type { Key } from 'chessground/types';
import type { DrawShape } from 'chessground/draw';
import Board from '../components/Board';
import { Button, Card, Spinner } from '../components/ui';
import { navigate, type Route } from '../lib/router';
import { loadLessonProgress, saveLessonProgress, setLessonStatus, type LessonProgress } from '../lib/storage';
import MarkBar from '../components/MarkBar';
import { logActivity } from '../lib/activity';

/* ---------- data shape produced by scripts/book (Capablanca, Chess Fundamentals, public domain) ---------- */
type BookMoveRow = [number, string, string, string]; // id, san, uci, fen
interface BookMove { id: number; san: string; uci: string; fen: string }
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
  if (route.parts.length >= 4 && !Number.isNaN(s)) return <SectionView book={book} pi={p} ci={c} si={s} />;
  return <Toc book={book} />;
}

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
  const nextKey = keys.find((k) => !st(k));
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
            {doneCount + skippedCount > 0 ? 'Đọc tiếp' : 'Bắt đầu đọc'}
          </Button>
        )}
      </Card>
      {book.parts.map((part, pi) => (
        <div key={pi}>
          <h2 className="mt">{part.title}</h2>
          {part.chapters.map((ch, ci) => (
            <div key={ci}>
              <h3 className="mt">
                {ch.title} <span className="muted small">{ch.heading}</span>
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

function SectionView({ book, pi, ci, si }: { book: BookData; pi: number; ci: number; si: number }) {
  const ch = book.parts[pi]?.chapters[ci];
  const sec = ch?.sections[si];
  const [active, setActive] = useState<{ fen: string; lastMove?: Key[]; label?: string; squares?: Key[] } | null>(null);
  const moveById = useMemo(() => new Map<number, BookMove>((sec?.moves ?? []).map((m) => [m[0], { id: m[0], san: m[1], uci: m[2], fen: m[3] }])), [sec]);
  const boardRef = useRef<HTMLDivElement>(null);
  const statusKey = `book:${pi}.${ci}.${si}`;
  const [status, setStatus] = useState<'done' | 'skipped' | undefined>(undefined);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    setActive(null);
    loadLessonProgress().then((lp) => {
      const key = `book:${pi}.${ci}.${si}`;
      setStatus(lp.status[key]);
      if (!lp.read[key]) saveLessonProgress({ ...lp, read: { ...lp.read, [key]: 1 } });
    });
  }, [pi, ci, si]);

  if (!sec) return <p>Không tìm thấy mục.</p>;
  const all = ch.sections;
  const prev = si > 0 ? `learn/book/${pi}/${ci}/${si - 1}` : ci > 0 ? `learn/book/${pi}/${ci - 1}/${book.parts[pi].chapters[ci - 1].sections.length - 1}` : null;
  const next =
    si < all.length - 1
      ? `learn/book/${pi}/${ci}/${si + 1}`
      : ci < book.parts[pi].chapters.length - 1
        ? `learn/book/${pi}/${ci + 1}/0`
        : pi < book.parts.length - 1
          ? `learn/book/${pi + 1}/0/0`
          : null;

  const onMove = (id: number, label: string) => {
    const m = moveById.get(id);
    if (!m) return;
    setActive({ fen: m.fen, lastMove: [m.uci.slice(0, 2) as Key, m.uci.slice(2, 4) as Key], label });
    // keep the sticky board visible on phones
    if (window.innerWidth < 640) boardRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  };

  const firstFigFen = (sec.blocks.find((b) => b.t === 'fig' && b.fen) as { fen?: string } | undefined)?.fen;
  const boardFen = active?.fen ?? (pi === 1 ? undefined : firstFigFen) ?? 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  const showSquare = (sq: Key) => setActive({ fen: boardFen, lastMove: active?.lastMove, label: active?.label, squares: [sq] });
  /** a move the converter could not place: try it on the board as it stands, else just point at its square */
  const tryLoose = (label: string) => {
    try {
      const c = new Chess(boardFen);
      const m = c.move(label.replace(/^\d+\.+/, ''));
      setActive({ fen: c.fen(), lastMove: [m.from as Key, m.to as Key], label });
    } catch {
      const sq = /[a-h][1-8]/.exec(label);
      if (sq) showSquare(sq[0] as Key);
    }
  };
  const withSquares = (s: string, key: number): ReactNode => {
    const parts = s.split(/(?<![\w/])([a-h][1-8])(?![\w/])/g);
    return (
      <span key={key}>
        {parts.map((part, i) =>
          i % 2 === 1 ? (
            <button key={i} className="sq-chip" onClick={() => showSquare(part as Key)}>
              {part}
            </button>
          ) : (
            <span key={i}>{inline(part)}</span>
          ),
        )}
      </span>
    );
  };

  const renderText = (text: string): ReactNode[] => {
    const out: ReactNode[] = [];
    let last = 0;
    let m: RegExpExecArray | null;
    TOKEN.lastIndex = 0;
    let k = 0;
    while ((m = TOKEN.exec(text))) {
      if (m.index > last) out.push(withSquares(text.slice(last, m.index), k++));
      const id = m[1] === '-' ? null : Number(m[1]);
      const label = m[2];
      if (id !== null && moveById.has(id)) {
        out.push(
          <button key={k++} className={`mv-chip ${active?.label === label && active?.fen === moveById.get(id)!.fen ? 'active' : ''}`} onClick={() => onMove(id, label)}>
            {label}
          </button>,
        );
      } else
        out.push(
          <button key={k++} className="mv-chip loose" onClick={() => tryLoose(label)}>
            {label}
          </button>,
        );
      last = m.index + m[0].length;
    }
    if (last < text.length) out.push(withSquares(text.slice(last), k++));
    return out;
  };

  // which figure the active position belongs to: show the board under the nearest preceding figure instead? Simpler: one sticky board.
  const firstFig = sec.blocks.find((b) => b.t === 'fig' && b.fen) as { fen?: string } | undefined;
  const isGame = pi === 1;
  const shownFen = active?.fen ?? (isGame ? undefined : firstFig?.fen) ?? 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  const chess = safeChess(shownFen);

  return (
    <div className="lesson-body">
      <div className="topbar">
        <button className="back" onClick={() => navigate('learn/book')} aria-label="Mục lục">
          ‹
        </button>
        <div>
          <div className="tiny muted">
            {ch.title} · {ch.heading}
          </div>
          <h2 style={{ margin: 0 }}>{sec.heading}</h2>
        </div>
      </div>

      <div className="book-layout">
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
            <span className="muted">{active ? `Sau ${active.label}` : 'Bấm vào một nước đi trong bài'}</span>
            {active && (
              <button className="chip" onClick={() => setActive(null)}>
                về hình gốc
              </button>
            )}
          </div>
        </div>

        <div className="book-text">
          {sec.blocks.map((b, i) => {
            if (b.t === 'fig') {
              if (!b.fen) return null;
              const c = safeChess(b.fen);
              return (
                <div key={i} className="book-fig">
                  <button className="chip" onClick={() => setActive({ fen: b.fen!, label: `Hình ${b.n}` })}>
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
                      <span>{renderText(r.w ?? '')}</span>
                      <span>{renderText(r.b ?? '')}</span>
                    </div>
                  ))}
                </div>
              );
            }
            if (b.t === 'h') return <h3 key={i}>{renderText(b.text)}</h3>;
            return <p key={i}>{renderText(b.text)}</p>;
          })}
        </div>
      </div>

      <MarkBar
        status={status}
        onMark={async (v) => {
          const lp = await setLessonStatus(statusKey, v);
          if (v === 'done') logActivity('lessons');
          setStatus(lp.status[statusKey]);
          if (v) navigate(next ?? 'learn/book');
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
          <Button kind="primary" onClick={() => navigate(next)}>
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
