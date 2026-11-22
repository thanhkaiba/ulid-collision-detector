import { useCallback, useEffect, useMemo, useState } from 'react';
import { Chess } from 'chess.js';
import type { Key } from 'chessground/types';
import type { DrawShape } from 'chessground/draw';
import Board from '../components/Board';
import MoveList from '../components/MoveList';
import MarkBar from '../components/MarkBar';
import PromotionPicker from '../components/PromotionPicker';
import { Button, Card, Spinner, Tag } from '../components/ui';
import { GAMES, loadGame, type AnnotatedGame, type GameMeta } from '../data/games';
import { renderRich, type Preview } from '../lib/richtext';
import { loadLessonProgress, setLessonStatus, type LessonProgress } from '../lib/storage';
import { needsPromotion, toDests } from '../lib/chess-utils';
import { navigate, type Route } from '../lib/router';
import { logActivity } from '../lib/activity';

const LEVEL = { 1: 'Cơ bản', 2: 'Trung bình', 3: 'Nâng cao' } as const;
const GUESS_KEY = 'games-guess';

/** ply the reader stopped at in a game (0 = not started) */
function savedPly(id: string): number {
  try {
    return Number(localStorage.getItem(`game-ply:${id}`) ?? 0) || 0;
  } catch {
    return 0;
  }
}

export default function Games({ route }: { route: Route }) {
  const id = route.parts[1];
  const meta = GAMES.find((g) => g.id === id);
  if (id && meta) return <GameView meta={meta} />;
  return <GameList />;
}

function GameList() {
  const [lp, setLp] = useState<LessonProgress | null>(null);
  useEffect(() => {
    loadLessonProgress().then(setLp);
  }, []);
  const st = (id: string) => lp?.status[`game:${id}`];
  const done = GAMES.filter((g) => st(g.id) === 'done').length;
  // a game already under way comes first, then the first one not yet marked
  const next = GAMES.find((g) => !st(g.id) && savedPly(g.id) > 0) ?? GAMES.find((g) => !st(g.id));
  const started = !!next && savedPly(next.id) > 0;
  return (
    <div>
      <div className="topbar">
        <button className="back" onClick={() => navigate('learn')} aria-label="Quay lại">
          ‹
        </button>
        <h2 style={{ margin: 0 }}>Từng nước một</h2>
      </div>
      <Card>
        <p className="small" style={{ margin: 0 }}>
          {GAMES.length} ván cờ kinh điển, <b>mọi nước đi của cả hai bên đều được giải thích</b>. Bình luận do ứng dụng tự biên soạn bằng tiếng Việt và đối chiếu với Stockfish.
          Bấm vào nước đi, biến phụ hay tên ô trong bài để xem ngay trên bàn cờ. Nên bật “Tự đoán nước” để nghĩ trước khi đọc.
        </p>
        <div className="row-between mt small">
          <span>
            Đã học <b>{done}</b>/{GAMES.length} ván
          </span>
        </div>
        <div className="progress mt">
          <div style={{ width: `${(100 * done) / Math.max(1, GAMES.length)}%` }} />
        </div>
        {next && (
          <Button kind="primary" className="mt" onClick={() => navigate(`learn/games/${next.id}`)}>
            {done > 0 || started ? 'Học tiếp' : 'Bắt đầu'}: {next.title}
          </Button>
        )}
      </Card>
      {GAMES.map((g, i) => (
        <Card key={g.id} onClick={() => navigate(`learn/games/${g.id}`)}>
          <div className="row-between">
            <b>
              {i + 1}. {g.title}
            </b>
            {st(g.id) === 'done' ? <Tag tone="good">✓</Tag> : st(g.id) === 'skipped' ? <Tag>bỏ qua</Tag> : <Tag tone={g.level === 1 ? 'good' : g.level === 2 ? 'info' : 'warn'}>{LEVEL[g.level]}</Tag>}
          </div>
          <div className="small muted">
            {g.white} – {g.black}, {g.event} {g.year} · {Math.ceil(g.plies / 2)} nước
            {!st(g.id) && savedPly(g.id) > 0 && (
              <>
                {' '}
                · <b>đang xem nước {Math.ceil(Math.min(savedPly(g.id), g.plies) / 2)}</b>
              </>
            )}
          </div>
          <p className="small" style={{ margin: '6px 0 0' }}>
            {g.theme}
          </p>
        </Card>
      ))}
    </div>
  );
}

function GameView({ meta }: { meta: GameMeta }) {
  const [game, setGame] = useState<AnnotatedGame | null>(null);
  const storeKey = `game-ply:${meta.id}`;
  const [ply, setPlyRaw] = useState(0);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [flip, setFlip] = useState(false);
  const [guess, setGuessRaw] = useState(() => {
    try {
      return localStorage.getItem(GUESS_KEY) === '1';
    } catch {
      return false;
    }
  });
  const setGuess = (v: boolean) => {
    setGuessRaw(v);
    try {
      localStorage.setItem(GUESS_KEY, v ? '1' : '0');
    } catch {
      /* ignore */
    }
  };
  const [guessMsg, setGuessMsg] = useState<{ tone: 'ok' | 'info'; text: string } | null>(null);
  const [showList, setShowList] = useState(false);
  const [status, setStatus] = useState<'done' | 'skipped' | undefined>();
  const [pendingPromo, setPendingPromo] = useState<{ from: Key; to: Key } | null>(null);

  useEffect(() => {
    setGame(null);
    loadGame(meta.id).then(setGame);
    loadLessonProgress().then((lp) => setStatus(lp.status[`game:${meta.id}`]));
    let saved = 0;
    try {
      saved = Number(localStorage.getItem(storeKey) ?? 0) || 0;
    } catch {
      /* ignore */
    }
    setPlyRaw(Math.min(saved, meta.plies));
    setPreview(null);
    setGuessMsg(null);
  }, [meta.id, meta.plies, storeKey]);

  /** after a step, bring the new comment back into view if the reader had scrolled down a long one */
  const toTop = () => {
    if (window.scrollY > 0) window.scrollTo({ top: 0 });
  };

  const line = useMemo(() => {
    if (!game) return null;
    const c = new Chess();
    const fens = [c.fen()];
    const last: (Key[] | undefined)[] = [undefined];
    for (const m of game.moves) {
      const mv = c.move(m.san);
      fens.push(c.fen());
      last.push([mv.from as Key, mv.to as Key]);
    }
    return { fens, last, sans: game.moves.map((m) => m.san) };
  }, [game]);

  const total = game?.moves.length ?? meta.plies;
  const setPly = useCallback(
    (p: number) => {
      const v = Math.max(0, Math.min(total, p));
      setPlyRaw(v);
      setPreview(null);
      setGuessMsg(null);
      try {
        localStorage.setItem(storeKey, String(v));
      } catch {
        /* ignore */
      }
      if (window.scrollY > 0) window.scrollTo({ top: 0 });
    },
    [total, storeKey],
  );

  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setPly(ply + 1);
      if (e.key === 'ArrowLeft') setPly(ply - 1);
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, [ply, setPly]);

  if (!game || !line) return <Spinner label="Đang tải ván cờ..." />;

  const mainFen = line.fens[ply];
  const shownFen = preview?.fen ?? mainFen;
  const inPreview = !!preview && (preview.fen !== mainFen || !preview.squares);
  let chess: Chess | null = null;
  try {
    chess = new Chess(shownFen);
  } catch {
    chess = null;
  }
  const orientation = (meta.side === 'b') !== flip ? 'black' : 'white';
  const shapes: DrawShape[] = (preview?.squares ?? []).map((s) => ({ orig: s, brush: 'yellow' }));
  const moveLabel = (i: number) => `${Math.floor(i / 2) + 1}${i % 2 === 0 ? '.' : '...'}${game.moves[i].san}`;
  const atEnd = ply >= total;
  const canGuess = guess && !inPreview && !atEnd;

  const rich = (text: string, before?: string, after?: string) =>
    renderRich(text, {
      onShow: setPreview,
      braces: { before, after },
      mainline: { sans: line.sans, fens: line.fens },
      squareFen: mainFen,
      activeLabel: preview?.label,
    });

  const tryGuess = (from: Key, to: Key, promotion?: 'q' | 'r' | 'b' | 'n') => {
    const c = new Chess(mainFen);
    let san = '';
    try {
      san = c.move({ from, to, promotion }).san;
    } catch {
      return;
    }
    const actual = game.moves[ply].san;
    const ok = san === actual;
    setPlyRaw(ply + 1);
    setPreview(null);
    toTop();
    try {
      localStorage.setItem(storeKey, String(ply + 1));
    } catch {
      /* ignore */
    }
    setGuessMsg(
      ok
        ? { tone: 'ok', text: `Trùng với ván đấu: ${actual}.` }
        : { tone: 'info', text: `Bạn chọn ${san}, ván đấu đi ${actual}. Khác ván đấu chưa chắc là sai: đọc lời bình bên dưới để so sánh.` },
    );
  };

  return (
    <div>
      <div className="topbar">
        <button className="back" onClick={() => navigate('learn/games')} aria-label="Danh sách ván">
          ‹
        </button>
        <div className="grow">
          <div className="tiny muted">
            {meta.white} – {meta.black} · {meta.event} {meta.year} · {meta.result}
          </div>
          <h2 style={{ margin: 0 }}>{game.title}</h2>
        </div>
        <Button kind="ghost" className="small" onClick={() => setFlip(!flip)}>
          ⇅
        </Button>
      </div>

      <div className="gm-layout">
        <div className="gm-board">
          <Board
            fen={shownFen}
            orientation={orientation}
            turnColor={chess?.turn() === 'b' ? 'black' : 'white'}
            lastMove={preview ? preview.lastMove ?? (preview.fen === mainFen ? line.last[ply] : undefined) : line.last[ply]}
            check={chess?.inCheck() ? (chess.turn() === 'w' ? 'white' : 'black') : false}
            shapes={shapes}
            movableColor={canGuess ? (chess?.turn() === 'b' ? 'black' : 'white') : undefined}
            dests={canGuess && chess ? toDests(chess) : new Map()}
            onMove={(from, to) => {
              if (!canGuess || !chess) return;
              if (needsPromotion(chess, from, to)) setPendingPromo({ from, to });
              else tryGuess(from, to);
            }}
          />
          {inPreview ? (
            <div className="feedback info small" style={{ marginTop: 6 }}>
              Đang xem: {preview!.label}{' '}
              <button className="chip" onClick={() => setPreview(null)}>
                về ván chính
              </button>
            </div>
          ) : (
            canGuess && <div className="feedback info small" style={{ marginTop: 6 }}>{chess?.turn() === 'w' ? 'Trắng' : 'Đen'} đi. Bạn sẽ đi nước nào?</div>
          )}
          <div className="gm-nav">
            <button type="button" className="btn btn-ghost" onClick={() => setPly(0)} disabled={ply === 0} aria-label="Về đầu ván" title="Về đầu ván">
              ⏮
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setPly(ply - 1)} disabled={ply === 0} aria-label="Nước trước" title="Nước trước">
              ◀
            </button>
            <Button kind="primary" onClick={() => setPly(ply + 1)} disabled={atEnd}>
              {ply === 0 ? 'Bắt đầu ▶' : atEnd ? 'Hết ván' : 'Nước tiếp ▶'}
            </Button>
            <button type="button" className="btn btn-ghost" onClick={() => setPly(total)} disabled={atEnd} aria-label="Tới cuối ván" title="Tới cuối ván">
              ⏭
            </button>
          </div>
          <div className="row-between tiny muted" style={{ marginTop: 6 }}>
            <span>
              Nước {Math.ceil(ply / 2)}/{Math.ceil(total / 2)}
            </span>
            <span className="row" style={{ gap: 6 }}>
              <button className={`chip ${guess ? 'active' : ''}`} onClick={() => { setGuess(!guess); setGuessMsg(null); }}>
                Tự đoán nước
              </button>
              <button className={`chip ${showList ? 'active' : ''}`} onClick={() => setShowList(!showList)}>
                Biên bản
              </button>
            </span>
          </div>
          <div className="progress" style={{ marginTop: 6 }}>
            <div style={{ width: `${(100 * ply) / Math.max(1, total)}%` }} />
          </div>
        </div>

        <div>
          {showList && (
            <Card>
              <MoveList moves={line.sans} current={ply - 1} onSelect={(i) => setPly(i + 1)} />
            </Card>
          )}
          {guessMsg && <div className={`feedback ${guessMsg.tone} mb`}>{guessMsg.text}</div>}
          {ply === 0 ? (
            <Card>
              <div className="row mb">
                <Tag tone={meta.level === 1 ? 'good' : meta.level === 2 ? 'info' : 'warn'}>{LEVEL[meta.level]}</Tag>
                <span className="small muted">{Math.ceil(total / 2)} nước · khoảng {Math.max(10, Math.round(meta.words / 180))} phút</span>
              </div>
              <p>
                <b>{game.theme}</b>
              </p>
              <p className="gm-comment">{rich(game.intro, undefined, line.fens[0])}</p>
            </Card>
          ) : (
            <Card>
              <div className="gm-move-title">{moveLabel(ply - 1)}</div>
              <div className="gm-comment">{rich(game.moves[ply - 1].c, line.fens[ply - 1], line.fens[ply])}</div>
            </Card>
          )}
          {atEnd && (
            <>
              <Card>
                <h3>Tổng kết</h3>
                <p className="gm-comment">{rich(game.outro, undefined, line.fens[total])}</p>
                <h3>Bài học rút ra</h3>
                <ul>
                  {game.lessons.map((l, i) => (
                    <li key={i}>{rich(l)}</li>
                  ))}
                </ul>
              </Card>
              <MarkBar
                status={status}
                onMark={async (v) => {
                  const lp = await setLessonStatus(`game:${meta.id}`, v);
                  if (v === 'done') logActivity('lessons', 1, `Từng nước một: ${meta.white} – ${meta.black}`);
                  setStatus(lp.status[`game:${meta.id}`]);
                  if (v) {
                    const idx = GAMES.findIndex((g) => g.id === meta.id);
                    const nx = GAMES[idx + 1];
                    navigate(nx ? `learn/games/${nx.id}` : 'learn/games');
                  }
                }}
              />
            </>
          )}
          {!atEnd && ply > 0 && (
            <p className="tiny muted center">Bấm vào nước đi, biến phụ hoặc tên ô trong lời bình để xem trên bàn cờ.</p>
          )}
        </div>
      </div>
      {pendingPromo && (
        <PromotionPicker
          color={chess?.turn() === 'b' ? 'black' : 'white'}
          onPick={(p) => {
            tryGuess(pendingPromo.from, pendingPromo.to, p);
            setPendingPromo(null);
          }}
          onCancel={() => setPendingPromo(null)}
        />
      )}
    </div>
  );
}
