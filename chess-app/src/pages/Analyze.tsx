import { useEffect, useMemo, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import type { Key } from 'chessground/types';
import type { DrawShape } from 'chessground/draw';
import Board from '../components/Board';
import EvalBar from '../components/EvalBar';
import EvalGraph from '../components/EvalGraph';
import MoveList from '../components/MoveList';
import { Button, Card, Spinner, Tag } from '../components/ui';
import { getEngine, formatScore, toWhitePov, type EngineLine } from '../lib/engine';
import { analyzeGame, extractMistakes } from '../lib/analysis';
import {
  explainPly,
  isError,
  buildWeaknessReport,
  CATEGORY_VI,
  CATEGORY_ADVICE,
  PHASE_VI,
  PHASE_ADVICE,
  type ErrorCategory,
  type Phase,
  type WeaknessInput,
  type WeaknessReport,
} from '../lib/explain';
import { fetchChesscomGames, fetchLichessGames, parsePgnText } from '../lib/import';
import { kingInCheckColor, turnColor, uciLineToSan, toDests, playUci } from '../lib/chess-utils';
import {
  loadGames,
  upsertGames,
  loadAnalysis,
  saveAnalysis,
  loadSettings,
  saveSettings,
  loadMistakes,
  saveMistakes,
  listAnalyzedIds,
  type GameAnalysis,
  type Settings,
  type StoredGame,
  type Judgment,
} from '../lib/storage';
import { navigate, type Route } from '../lib/router';

export default function Analyze({ route }: { route: Route }) {
  if (route.parts[0] === 'game' && route.parts[1]) {
    return (
      <GameAnalysisView
        key={`${route.parts[1]}?${route.query.get('ply') ?? ''}`}
        gameId={route.parts[1]}
        initialPly={route.query.get('ply') ? Number(route.query.get('ply')) : undefined}
        back={route.query.get('from') === 'stats' ? 'analyze/stats' : route.query.get('from') === 'mistakes' ? 'puzzles/mistakes' : 'analyze'}
      />
    );
  }
  if (route.parts[0] === 'stats') return <Weaknesses />;
  return <GamesList />;
}

/**
 * Save an analysis and add the user's own mistakes to the spaced-repetition queue.
 * Returns how many of the user's mistakes the game has, and how many of them were not in the queue yet.
 */
async function storeAnalysis(game: StoredGame, res: GameAnalysis): Promise<{ found: number; added: number }> {
  await saveAnalysis(res);
  return addMistakes(game, res);
}

async function addMistakes(game: StoredGame, res: GameAnalysis): Promise<{ found: number; added: number }> {
  const mine = extractMistakes(game, res);
  const existing = await loadMistakes();
  const ids = new Set(existing.map((m) => m.id));
  const fresh = mine.filter((m) => !ids.has(m.id));
  if (fresh.length) await saveMistakes([...existing, ...fresh].slice(-500));
  return { found: mine.length, added: fresh.length };
}

const resultVi = (r: string) => (r === '1-0' ? 'Trắng thắng' : r === '0-1' ? 'Đen thắng' : r === '1/2-1/2' ? 'Hòa' : 'Chưa rõ kết quả');

/** Half-moves to full moves, as players count them ("nước 12" = White's and Black's 12th move). */
const fullMoves = (plies: number) => Math.ceil(plies / 2);

const SOURCE_VI: Record<StoredGame['source'], string> = { app: 'ván với máy', lichess: 'Lichess', chesscom: 'Chess.com', pgn: 'PGN' };
const SPEED_VI: Record<string, string> = {
  ultraBullet: 'cờ siêu chớp',
  bullet: 'cờ siêu chớp',
  blitz: 'cờ chớp',
  rapid: 'cờ nhanh',
  classical: 'cờ tiêu chuẩn',
  correspondence: 'cờ thư',
  daily: 'cờ thư',
};

/* ------------------------------------------------------------------ */

function GamesList() {
  const [games, setGames] = useState<StoredGame[] | null>(null);
  const [analyzed, setAnalyzed] = useState<Set<string>>(new Set());
  const [settings, setSettings] = useState<Settings | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [pgn, setPgn] = useState('');
  const [showPgn, setShowPgn] = useState(false);

  useEffect(() => {
    loadGames().then(setGames);
    listAnalyzedIds().then((ids) => setAnalyzed(new Set(ids)));
    loadSettings().then(setSettings);
  }, []);

  /** Store imported games and say how many were new. */
  const addGames = async (list: StoredGame[], from: string) => {
    const known = new Set((games ?? []).map((g) => g.id));
    const fresh = list.filter((g) => !known.has(g.id)).length;
    setGames(await upsertGames(list));
    return list.length === 0
      ? `Không tìm thấy ván nào ${from} (chỉ lấy ván cờ vua tiêu chuẩn).`
      : fresh === 0
        ? `${list.length} ván ${from} đã có sẵn trong danh sách.`
        : `Đã thêm ${fresh} ván mới ${from}${list.length > fresh ? ` (${list.length - fresh} ván đã có sẵn)` : ''}.`;
  };

  const doImport = async (source: 'lichess' | 'chesscom') => {
    if (!settings) return;
    const site = source === 'lichess' ? 'Lichess' : 'Chess.com';
    const user = source === 'lichess' ? settings.lichessUser : settings.chesscomUser;
    setOk(null);
    if (!user.trim()) {
      setErr(`Nhập tên người dùng ${site} trước.`);
      return;
    }
    setErr(null);
    setBusy(source);
    try {
      await saveSettings(settings);
      const fetched = source === 'lichess' ? await fetchLichessGames(user.trim(), 30) : await fetchChesscomGames(user.trim(), 30);
      setOk(await addGames(fetched, `từ ${site}`));
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  };

  const doPgn = async () => {
    setOk(null);
    if (!pgn.trim()) {
      setErr('Dán nội dung PGN của ván vào ô trên trước đã.');
      return;
    }
    const { games: parsed, failed } = parsePgnText(pgn, [settings?.lichessUser ?? '', settings?.chesscomUser ?? '']);
    if (!parsed.length) {
      setErr('Không đọc được ván nào. Kiểm tra lại PGN: cần có các nước đi dạng "1. e4 e5 2. Nf3 ...", nước nào sai luật thì cả ván bị bỏ qua.');
      return;
    }
    const msg = await addGames(parsed, 'từ PGN');
    setPgn('');
    setShowPgn(false);
    setErr(failed ? `Có ${failed} ván không đọc được (sai định dạng hoặc có nước sai luật) nên đã bỏ qua.` : null);
    setOk(msg);
  };

  const batchCancel = useRef<{ cancelled: boolean }>({ cancelled: false });
  const [batch, setBatch] = useState<{ game: number; games: number; done: number; total: number } | null>(null);
  useEffect(() => () => {
    batchCancel.current.cancelled = true;
  }, []);

  if (!games || !settings) return <Spinner label="Đang tải..." />;

  const allPending = games.filter((g) => !analyzed.has(g.id) && g.moves.length >= 10);
  const pendingGames = allPending.slice(0, 20);
  const runBatch = async () => {
    const engine = getEngine();
    batchCancel.current = { cancelled: false };
    // games that already carry Lichess evals are quick: do them first
    const queue = [...pendingGames].sort((a, b) => Number(!!b.serverEvals) - Number(!!a.serverEvals));
    for (let i = 0; i < queue.length; i++) {
      const g = queue[i];
      setBatch({ game: i + 1, games: queue.length, done: 0, total: g.moves.length });
      await engine.newGame();
      const res = await analyzeGame(g, engine, Math.min(settings.analysisDepth, 12), (done, total) => setBatch({ game: i + 1, games: queue.length, done, total }), batchCancel.current);
      if (!res) break;
      await storeAnalysis(g, res);
      setAnalyzed((s) => new Set([...s, g.id]));
    }
    setBatch(null);
  };

  return (
    <div>
      <h1>Phân tích ván đấu</h1>
      {games.length > 0 && (
        <Card>
          <div className="row-between">
            <div>
              <b>Điểm yếu của bạn</b>
              <div className="small muted">
                {analyzed.size > 0
                  ? `Tổng hợp lỗi từ ${analyzed.size} ván đã phân tích: loại lỗi, giai đoạn, khai cuộc.`
                  : 'Phân tích vài ván để biết bạn hay sai ở đâu: loại lỗi, giai đoạn, khai cuộc.'}
              </div>
            </div>
            {analyzed.size > 0 && (
              <Button kind="primary" onClick={() => navigate('analyze/stats')}>
                Xem
              </Button>
            )}
          </div>
          {batch ? (
            <div className="mt">
              <div className="row-between small">
                <span>
                  Đang phân tích ván {batch.game}/{batch.games} · nước {fullMoves(batch.done)}/{fullMoves(batch.total)}
                </span>
                <button
                  className="chip"
                  onClick={() => {
                    batchCancel.current.cancelled = true;
                    getEngine().stop();
                  }}
                >
                  dừng
                </button>
              </div>
              <div className="progress mt">
                <div style={{ width: `${(100 * (batch.game - 1 + batch.done / Math.max(1, batch.total))) / batch.games}%` }} />
              </div>
            </div>
          ) : (
            pendingGames.length > 0 && (
              <div className="mt">
                <Button kind="ghost" className="small" onClick={runBatch}>
                  {allPending.length > pendingGames.length
                    ? `Phân tích ${pendingGames.length} ván gần nhất chưa phân tích`
                    : `Phân tích ${pendingGames.length} ván chưa phân tích`}
                </Button>
                <div className="tiny muted">Cứ để máy chạy và ở lại trang này, có thể dừng bất cứ lúc nào. Ván đã xong được lưu ngay.</div>
              </div>
            )
          )}
        </Card>
      )}
      <Card>
        <label className="field">
          <span>Tên người dùng Lichess</span>
          <div className="row" style={{ flexWrap: 'nowrap' }}>
            <input
              value={settings.lichessUser}
              onChange={(e) => setSettings({ ...settings, lichessUser: e.target.value })}
              placeholder="vd: DrNykterstein"
              autoCapitalize="off"
            />
            <Button kind="primary" onClick={() => doImport('lichess')} disabled={busy !== null}>
              <span style={{ whiteSpace: 'nowrap' }}>{busy === 'lichess' ? 'Đang lấy…' : 'Lấy ván'}</span>
            </Button>
          </div>
        </label>
        <label className="field">
          <span>Tên người dùng Chess.com</span>
          <div className="row" style={{ flexWrap: 'nowrap' }}>
            <input
              value={settings.chesscomUser}
              onChange={(e) => setSettings({ ...settings, chesscomUser: e.target.value })}
              placeholder="vd: Hikaru"
              autoCapitalize="off"
            />
            <Button kind="primary" onClick={() => doImport('chesscom')} disabled={busy !== null}>
              <span style={{ whiteSpace: 'nowrap' }}>{busy === 'chesscom' ? 'Đang lấy…' : 'Lấy ván'}</span>
            </Button>
          </div>
        </label>
        <Button kind="ghost" onClick={() => setShowPgn(!showPgn)}>
          {showPgn ? 'Ẩn ô dán PGN' : 'Hoặc dán PGN'}
        </Button>
        {showPgn && (
          <div className="mt">
            <textarea value={pgn} onChange={(e) => setPgn(e.target.value)} placeholder="[Event ...]&#10;1. e4 e5 2. Nf3 ..." />
            <div className="tiny muted">Dán được nhiều ván một lúc. Nếu tên của bạn trong PGN trùng tên Lichess/Chess.com ở trên, app tự biết bạn cầm bên nào.</div>
            <Button className="mt" onClick={doPgn}>
              Nhập PGN
            </Button>
          </div>
        )}
        {err && <div className="feedback bad mt">{err}</div>}
        {ok && <div className="feedback ok mt">{ok}</div>}
        <p className="small muted mt" style={{ marginBottom: 0 }}>
          Lấy 30 ván gần nhất. Ván Lichess đã có phân tích máy chủ sẽ hiển thị ngay, các ván khác được phân tích bằng Stockfish trong máy bạn.
        </p>
      </Card>

      {games.length === 0 && (
        <Card>
          <p className="muted">Chưa có ván nào. Nhập tên người dùng ở trên, dán PGN, hoặc chơi một ván ở tab Chơi.</p>
        </Card>
      )}
      {games.map((g) => (
        <GameRow key={g.id} g={g} analyzed={analyzed.has(g.id)} />
      ))}
    </div>
  );
}

function GameRow({ g, analyzed }: { g: StoredGame; analyzed: boolean }) {
  const d = new Date(g.date);
  const myResult =
    g.me && g.result !== '*'
      ? g.result === '1/2-1/2'
        ? 'Hòa'
        : (g.result === '1-0') === (g.me === 'w')
          ? 'Thắng'
          : 'Thua'
      : resultVi(g.result);
  const tone = myResult === 'Thắng' ? 'good' : myResult === 'Thua' ? 'bad' : 'default';
  return (
    <div className="list-item" onClick={() => navigate(`analyze/game/${g.id}`)}>
      <div style={{ minWidth: 0 }}>
        <div>
          <b>{g.white}</b> {g.whiteElo && <span className="muted small">({g.whiteElo})</span>} – <b>{g.black}</b>{' '}
          {g.blackElo && <span className="muted small">({g.blackElo})</span>}
        </div>
        <div className="small muted">
          {d.toLocaleDateString('vi-VN')} · {g.speed ? (SPEED_VI[g.speed] ?? g.speed) : SOURCE_VI[g.source]} · {fullMoves(g.moves.length)} nước
          {g.opening ? ` · ${g.opening}` : ''}
        </div>
      </div>
      <div className="row" style={{ flexWrap: 'nowrap', flexShrink: 0, whiteSpace: 'nowrap' }}>
        {analyzed && <Tag tone="info">đã phân tích</Tag>}
        <Tag tone={tone}>{myResult}</Tag>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

const JUDGE_VI: Record<Judgment, string> = {
  best: 'Nước tốt nhất',
  good: 'Nước ổn',
  inaccuracy: 'Không chính xác',
  mistake: 'Sai lầm',
  blunder: 'Sai nghiêm trọng',
  book: 'Lý thuyết',
};

function GameAnalysisView({ gameId, initialPly, back }: { gameId: string; initialPly?: number; back: string }) {
  const [game, setGame] = useState<StoredGame | null | undefined>(undefined);
  const [analysis, setAnalysis] = useState<GameAnalysis | null>(null);
  const [analysisLoaded, setAnalysisLoaded] = useState(false);
  const [ply, setPly] = useState<number>(initialPly ?? -1); // -1 = start position
  const [running, setRunning] = useState<{ done: number; total: number } | null>(null);
  const [live, setLive] = useState<EngineLine[]>([]);
  const [liveDepth, setLiveDepth] = useState(0);
  const [showBest, setShowBest] = useState(true);
  const [flip, setFlip] = useState(false);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [mistakeCount, setMistakeCount] = useState<{ found: number; added: number } | null>(null);
  const cancel = useRef<{ cancelled: boolean }>({ cancelled: false });
  const engine = useMemo(() => getEngine(), []);
  // "try a move" sandbox: user can play moves from the current position
  const [variation, setVariation] = useState<string[]>([]); // SAN from the main-line position
  // a line opened from an explanation ("Xem vì sao sai"): stepped through with ▶, `from` = the explained ply
  const [line, setLine] = useState<{ sans: string[]; from: number } | null>(null);

  // arriving from a scrolled list (games, report, trainer): start with the board in view. Runs once the game
  // is on screen, after the move list has scrolled its current move into view (which also moves the page).
  const shown = !!game && !!settings;
  useEffect(() => {
    if (!shown) return;
    const id = requestAnimationFrame(() => window.scrollTo(0, 0));
    return () => cancelAnimationFrame(id);
  }, [shown]);

  useEffect(() => {
    loadGames().then((gs) => setGame(gs.find((g) => g.id === gameId) ?? null));
    loadAnalysis(gameId).then((a) => {
      if (a) setAnalysis(a);
      setAnalysisLoaded(true);
    });
    loadSettings().then(setSettings);
  }, [gameId]);

  const positions = useMemo(() => {
    if (!game) return [];
    const c = new Chess();
    const fens = [c.fen()];
    const lm: (Key[] | undefined)[] = [undefined];
    for (const san of game.moves) {
      const m = c.move(san);
      fens.push(c.fen());
      lm.push([m.from as Key, m.to as Key]);
    }
    return fens.map((fen, i) => ({ fen, lastMove: lm[i] }));
  }, [game]);

  const mainFen = positions[ply + 1]?.fen ?? positions[0]?.fen;
  const chess = useMemo(() => {
    const c = new Chess(mainFen);
    for (const san of variation) {
      try {
        c.move(san);
      } catch {
        break;
      }
    }
    return c;
  }, [mainFen, variation]);
  const fen = chess.fen();
  // highlight the last move of a try-out line too, so the user sees what just happened
  const varLastMove = useMemo(() => {
    const h = chess.history({ verbose: true });
    const m = h[h.length - 1];
    return m ? ([m.from, m.to] as Key[]) : undefined;
  }, [chess]);

  // live engine evaluation of the shown position
  useEffect(() => {
    if (!game) return;
    setLive([]);
    setLiveDepth(0);
    if (running) return;
    const c = new Chess(fen);
    if (c.isGameOver()) return;
    let active = true;
    engine.stop();
    engine
      .fullStrength()
      .then(() =>
        engine.evaluate(fen, {
        depth: 18,
        multipv: 2,
        onInfo: (lines) => {
          if (!active) return;
          setLive(lines);
          setLiveDepth(lines[0]?.depth ?? 0);
        },
      })
      )
      .then((r) => active && setLive(r.lines));
    return () => {
      active = false;
      engine.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fen, game, running]);

  const run = async () => {
    if (!game || !settings) return;
    cancel.current = { cancelled: false };
    engine.stop();
    setRunning({ done: 0, total: game.moves.length });
    await engine.newGame();
    const res = await analyzeGame(game, engine, settings.analysisDepth, (done, total) => setRunning({ done, total }), cancel.current);
    setRunning(null);
    if (!res) return;
    setAnalysis(res);
    setMistakeCount(await storeAnalysis(game, res));
  };

  useEffect(() => () => {
    cancel.current.cancelled = true;
  }, []);

  // Lichess games that carry the server's analysis take a second: show it right away, as the import screen promises
  const autoRan = useRef(false);
  useEffect(() => {
    if (autoRan.current || !game || !settings || !analysisLoaded || analysis || running) return;
    if (!game.serverEvals || game.serverEvals.length < game.moves.length - 1) return;
    autoRan.current = true;
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game, settings, analysisLoaded, analysis, running]);

  if (game === undefined || !settings) return <Spinner label="Đang tải..." />;
  if (game === null)
    return (
      <div>
        <p>Không tìm thấy ván.</p>
        <Button onClick={() => navigate('analyze')}>Quay lại</Button>
      </div>
    );

  // while a line from an explanation is on the board, keep showing the move it explains
  const onLine = !!line && variation.length > 0 && variation.every((s, i) => line.sans[i] === s);
  const cardPly = onLine ? line!.from : ply;
  const cur = analysis?.plies[cardPly];
  const curExplain = cur && isError(cur.judgment) ? explainPly(cur, analysis?.plies[cardPly - 1], !!game.me && (cardPly % 2 === 0 ? 'w' : 'b') === game.me) : null;
  /** Step back to the position before the move and step through a line on the board, one move at a time. */
  const showLine = (sans: string[]) => {
    setLine({ sans, from: cardPly });
    setPly(cardPly - 1);
    setVariation(sans.slice(0, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  /** Leave the try-out variation and go back to the move the user was looking at. */
  const backToGame = () => {
    if (line) setPly(line.from);
    setLine(null);
    setVariation([]);
  };
  const lineHasMore = onLine && variation.length < line!.sans.length;
  const judgments = analysis?.plies.map((p) => p.judgment);
  const sideToMove = chess.turn();
  const over = chess.isGameOver();
  const overScore = chess.isCheckmate() ? (sideToMove === 'w' ? { mate: -1 } : { mate: 1 }) : over ? { cp: 0 } : undefined;
  const overLabel = chess.isCheckmate() ? (sideToMove === 'w' ? '0-1' : '1-0') : over ? '½' : undefined;
  const liveScore = overScore ?? (live[0] ? toWhitePov(live[0], sideToMove) : variation.length === 0 && cur ? cur.evalAfter : undefined);
  const orientation = flip ? (game.me === 'b' ? 'white' : 'black') : game.me === 'b' ? 'black' : 'white';
  /** Score text, saying "chiếu hết" once the mate is on the board instead of "#1". */
  const scoreAfter = (p: { ply: number; evalAfter: { cp?: number; mate?: number } }) =>
    positions[p.ply + 1] && new Chess(positions[p.ply + 1].fen).isCheckmate() ? 'chiếu hết' : formatScore(p.evalAfter);

  const shapes: DrawShape[] = [];
  if (showBest && variation.length === 0) {
    if (cur && cur.judgment !== 'best' && cur.judgment !== 'good') {
      // show what should have been played instead of the move that led here
      // (drawn on the position BEFORE the move, so only when browsing back one ply) -> we show best in current pos
    }
    const bestNow = live[0]?.pv[0];
    if (bestNow && bestNow.length >= 4) shapes.push({ orig: bestNow.slice(0, 2) as Key, dest: bestNow.slice(2, 4) as Key, brush: 'paleGreen' });
  }

  const go = (p: number) => {
    setVariation([]);
    setLine(null);
    setPly(Math.max(-1, Math.min(game.moves.length - 1, p)));
  };
  /** Jump to a move from a list further down the page: bring the board back into view. */
  const goAndShow = (p: number) => {
    go(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const forward = () => (lineHasMore ? setVariation(line!.sans.slice(0, variation.length + 1)) : go(ply + 1));
  const backward = () => (variation.length ? setVariation(variation.slice(0, -1)) : go(ply - 1));

  const onBoardMove = (from: Key, to: Key) => {
    const c = new Chess(fen);
    const m = playUci(c, from + to) ?? playUci(c, from + to + 'q');
    if (!m) return;
    setVariation([...variation, m.san]);
  };

  const chooseSide = async (me: 'w' | 'b') => {
    const updated = { ...game, me };
    await upsertGames([updated]);
    setGame(updated);
    if (analysis) setMistakeCount(await addMistakes(updated, analysis));
  };


  return (
    <div>
      <div className="topbar">
        <button className="back" onClick={() => navigate(back)} aria-label="Quay lại">
          ‹
        </button>
        <div className="grow">
          <div>
            <b>{game.white}</b> – <b>{game.black}</b> <span className="muted small">{resultVi(game.result)}</span>
          </div>
          <div className="tiny muted">
            {game.opening ?? ''} {game.url && (
              <a href={game.url} target="_blank" rel="noreferrer">
                nguồn
              </a>
            )}
          </div>
        </div>
        <Button kind="ghost" onClick={() => setFlip(!flip)} className="small">
          ⇅
        </Button>
      </div>

      <div className="board-layout">
        <div>
          <div className="board-area">
            <EvalBar score={liveScore} orientation={orientation} label={overLabel} />
            <Board
              fen={fen}
              orientation={orientation}
              turnColor={turnColor(chess)}
              lastMove={variation.length ? varLastMove : positions[ply + 1]?.lastMove}
              check={kingInCheckColor(chess)}
              movableColor="both"
              dests={toDests(chess)}
              onMove={onBoardMove}
              shapes={shapes}
            />
          </div>
          <div className="row mt" style={{ justifyContent: 'center' }}>
            <Button kind="ghost" onClick={() => go(-1)}>
              ⏮
            </Button>
            <Button kind="ghost" onClick={backward} disabled={ply < 0 && variation.length === 0}>
              ◀
            </Button>
            <Button kind="ghost" onClick={forward} disabled={!lineHasMore && ply >= game.moves.length - 1}>
              ▶
            </Button>
            <Button kind="ghost" onClick={() => go(game.moves.length - 1)}>
              ⏭
            </Button>
          </div>
          {variation.length > 0 && (
            <div className="feedback info small">
              {onLine ? (
                <>
                  {line!.sans.map((s, i) => (
                    <span key={i} style={{ opacity: i < variation.length ? 1 : 0.45, fontWeight: i === variation.length - 1 ? 700 : undefined }}>
                      {s}{' '}
                    </span>
                  ))}
                  <div className="tiny" style={{ marginTop: 2 }}>
                    {lineHasMore ? `${variation.length}/${line!.sans.length} · bấm ▶ để xem nước tiếp theo.` : 'Hết biến.'} Có thể tự đi thử quân trên bàn cờ.
                  </div>
                </>
              ) : (
                <>Biến thử: {variation.join(' ')} </>
              )}
              <button className="chip mt" onClick={backToGame}>
                ← về ván chính
              </button>
            </div>
          )}
        </div>

        <div>
          {/* engine line */}
          <Card>
            <div className="row-between small">
              <b>Stockfish {liveDepth ? `· độ sâu ${liveDepth}` : ''}</b>
              <label className="row small" style={{ gap: 4 }}>
                <input type="checkbox" checked={showBest} onChange={(e) => setShowBest(e.target.checked)} style={{ width: 'auto' }} /> mũi tên
              </label>
            </div>
            {live.length === 0 && !over && running && <div className="small muted">Tạm dừng trong lúc phân tích toàn ván.</div>}
            {live.length === 0 && !over && !running && <Spinner label="đang tính..." />}
            {live.map((l) => (
              <div key={l.multipv} className="small" style={{ marginTop: 4 }}>
                <b>{formatScore(toWhitePov(l, sideToMove))}</b> {uciLineToSan(fen, l.pv.slice(0, 8)).join(' ')}
              </div>
            ))}
            {over && (
              <div className="small muted">
                {chess.isCheckmate() ? `Chiếu hết. ${sideToMove === 'w' ? 'Đen' : 'Trắng'} thắng.` : 'Ván kết thúc, hòa.'}
              </div>
            )}
          </Card>

          {/* current move judgement */}
          {cur && (variation.length === 0 || onLine) && (
            <Card>
              <div className="row-between">
                <b>
                  {Math.floor(cardPly / 2) + 1}
                  {cardPly % 2 === 0 ? '.' : '...'} {cur.san}
                </b>
                <span style={{ flexShrink: 0, whiteSpace: 'nowrap' }}>
                  <Tag tone={cur.judgment === 'blunder' ? 'bad' : cur.judgment === 'mistake' ? 'warn' : cur.judgment === 'inaccuracy' ? 'warn' : cur.judgment === 'best' ? 'good' : 'default'}>
                    {JUDGE_VI[cur.judgment]}
                  </Tag>
                </span>
              </div>
              <div className="small muted">
                {formatScore(cur.evalBefore)} → {scoreAfter(cur)}
                {cur.judgment !== 'best' && cur.judgment !== 'good' && (
                  <>
                    {' '}
                    · Nên đi <b>{cur.bestSan}</b> ({uciLineToSan(cur.fenBefore, cur.bestPv.slice(0, 5)).join(' ')})
                  </>
                )}
              </div>
              {curExplain && (
                <div className="explain mt">
                  <div className="tiny muted">{CATEGORY_VI[curExplain.category]}</div>
                  <div>{curExplain.text}</div>
                  {curExplain.line && curExplain.line.length > 0 && !onLine && (
                    <div className="row mt" style={{ gap: 6 }}>
                      <button className="chip" onClick={() => showLine(curExplain.line!)}>
                        ▶ {curExplain.lineIsRefutation ? 'Xem vì sao sai' : 'Xem nước đúng'}: {curExplain.line.slice(0, 5).join(' ')}
                        {curExplain.line.length > 5 ? ' …' : ''}
                      </button>
                    </div>
                  )}
                  {!cur.refPv && analysis && <div className="tiny muted mt">Bấm “Phân tích lại” để có lời giải thích chi tiết hơn cho ván này.</div>}
                </div>
              )}
            </Card>
          )}

          {/* analysis summary / run */}
          <Card>
            {!analysis && !running && (
              <>
                <p className="small muted">Chạy Stockfish qua từng nước để tìm sai lầm. Độ sâu {settings.analysisDepth} (đổi ở Cài đặt).</p>
                <Button kind="primary" onClick={run}>
                  Phân tích toàn ván
                </Button>
              </>
            )}
            {running && (
              <>
                <div className="row-between small">
                  <span>
                    Đang phân tích… nước {fullMoves(running.done)}/{fullMoves(running.total)}
                  </span>
                  <button
                    className="chip"
                    onClick={() => {
                      cancel.current.cancelled = true;
                      engine.stop();
                    }}
                  >
                    dừng
                  </button>
                </div>
                <div className="progress mt">
                  <div style={{ width: `${(100 * running.done) / Math.max(1, running.total)}%` }} />
                </div>
              </>
            )}
            {analysis && !running && (
              <>
                <EvalGraph plies={analysis.plies} current={cardPly} onSelect={go} />
                <div className="grid-2 mt">
                  <Summary label={game.white} mine={game.me === 'w'} acc={analysis.accuracy.w} counts={analysis.counts.w} />
                  <Summary label={game.black} mine={game.me === 'b'} acc={analysis.accuracy.b} counts={analysis.counts.b} />
                </div>
                {mistakeCount && mistakeCount.found > 0 && (
                  <p className="small muted mt" style={{ margin: '8px 0 0' }}>
                    {mistakeCount.added > 0 ? `Đã thêm ${mistakeCount.added} vị trí bạn đi sai vào` : `${mistakeCount.found} vị trí bạn đi sai đã có sẵn trong`}{' '}
                    <a onClick={() => navigate('puzzles/mistakes')}>Lỗi của chính bạn</a> để ôn lại.
                  </p>
                )}
                <div className="row mt">
                  <Button kind="ghost" className="small" onClick={run}>
                    Phân tích lại
                  </Button>
                  {analysis.depth === 0 && <span className="tiny muted">(dùng phân tích máy chủ Lichess)</span>}
                </div>
              </>
            )}
          </Card>

          <Card>
            <MoveList moves={game.moves} current={ply} onSelect={go} judgments={judgments} />
          </Card>

          {analysis && game.me && <ReviewList analysis={analysis} me={game.me} onGo={goAndShow} />}
          {!game.me && (
            <Card>
              <b className="small">Bạn cầm quân nào trong ván này?</b>
              <p className="small muted" style={{ margin: '4px 0 8px' }}>
                Chọn để app gom nước sai của bạn vào “Lỗi của chính bạn” và báo cáo “Điểm yếu của bạn”. Bỏ qua nếu đây không phải ván của bạn.
              </p>
              <div className="row">
                <Button onClick={() => chooseSide('w')}>Tôi cầm Trắng</Button>
                <Button onClick={() => chooseSide('b')}>Tôi cầm Đen</Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function ReviewList({ analysis, me, onGo }: { analysis: GameAnalysis; me: 'w' | 'b'; onGo: (ply: number) => void }) {
  const [all, setAll] = useState(false);
  const mine = analysis.plies.filter((p) => (p.ply % 2 === 0 ? 'w' : 'b') === me && isError(p.judgment));
  const serious = mine.filter((p) => p.judgment !== 'inaccuracy');
  const list = all ? mine : serious;
  return (
    <Card>
      <div className="row-between" style={{ flexWrap: 'wrap' }}>
        <h3 style={{ margin: 0 }}>Nước cần xem lại của bạn</h3>
        {mine.length > serious.length && (
          <button className="chip" style={{ whiteSpace: 'nowrap' }} onClick={() => setAll(!all)}>
            {all ? 'chỉ lỗi lớn' : `xem cả ${mine.length - serious.length} nước thiếu chính xác`}
          </button>
        )}
      </div>
      {list.length === 0 && <p className="small muted">Không có sai lầm lớn. Tốt!</p>}
      {list.map((p) => {
        const ex = explainPly(p, analysis.plies[p.ply - 1], true);
        return (
          <div key={p.ply} className="list-item" style={{ alignItems: 'flex-start' }} onClick={() => onGo(p.ply)}>
            <span>
              <b>
                {Math.floor(p.ply / 2) + 1}
                {p.ply % 2 === 0 ? '.' : '...'} {p.san}
              </b>{' '}
              <span className="muted small">nên {p.bestSan}</span>
              <div className="small">{ex.text}</div>
            </span>
            <span style={{ flexShrink: 0, whiteSpace: 'nowrap' }}>
              <Tag tone={p.judgment === 'blunder' ? 'bad' : 'warn'}>{JUDGE_VI[p.judgment]}</Tag>
            </span>
          </div>
        );
      })}
    </Card>
  );
}

/* ------------------------------------------------------------------ */

function Bar({ label, value, max, note, tone = 'accent' }: { label: string; value: number; max: number; note?: string; tone?: 'accent' | 'bad' }) {
  return (
    <div className="wk-bar">
      <div className="row-between small">
        <span>{label}</span>
        <span className="muted">{note ?? value}</span>
      </div>
      <div className="progress">
        <div style={{ width: `${max > 0 && value > 0 ? Math.max(2, (100 * value) / max) : 0}%`, background: tone === 'bad' ? 'var(--bad)' : undefined }} />
      </div>
    </div>
  );
}

function Weaknesses() {
  const [rep, setRep] = useState<WeaknessReport | null | undefined>(undefined);
  const [unknownSide, setUnknownSide] = useState(0);
  const [cat, setCat] = useState<ErrorCategory | null>(null);

  useEffect(() => {
    (async () => {
      const games = await loadGames();
      const ids = new Set(await listAnalyzedIds());
      const inputs: WeaknessInput[] = [];
      let unknown = 0;
      for (const g of games) {
        if (!ids.has(g.id)) continue;
        if (!g.me) {
          unknown++;
          continue;
        }
        const a = await loadAnalysis(g.id);
        if (a) inputs.push({ gameId: g.id, me: g.me, result: g.result, opening: g.opening, date: g.date, plies: a.plies, accuracy: a.accuracy });
      }
      setUnknownSide(unknown);
      setRep(inputs.length ? buildWeaknessReport(inputs) : null);
    })();
  }, []);

  const top = (
    <div className="topbar">
      <button className="back" onClick={() => navigate('analyze')} aria-label="Quay lại">
        ‹
      </button>
      <h2 style={{ margin: 0 }}>Điểm yếu của bạn</h2>
    </div>
  );
  if (rep === undefined) return <Spinner label="Đang tổng hợp..." />;
  if (rep === null)
    return (
      <div>
        {top}
        <Card>
          <p className="muted">
            Chưa có ván nào đã phân tích mà biết bạn cầm quân nào. Hãy lấy ván từ Lichess hoặc Chess.com, hoặc chơi với máy, rồi bấm “Phân tích” ở danh sách ván.
            {unknownSide > 0 && ` Có ${unknownSide} ván đã phân tích nhưng chưa rõ bạn cầm bên nào nên không tính: mở ván đó và chọn “Tôi cầm Trắng/Đen”.`}
          </p>
        </Card>
      </div>
    );

  const cats = (Object.keys(rep.byCategory) as ErrorCategory[]).sort((a, b) => rep.byCategory[b] - rep.byCategory[a]);
  const totalErr = cats.reduce((n, c) => n + rep.byCategory[c], 0);
  const maxCat = Math.max(1, ...cats.map((c) => rep.byCategory[c]));
  const phases: Phase[] = ['opening', 'middlegame', 'endgame'];
  const rate = (ph: Phase) => (rep.byPhase[ph].moves ? (100 * rep.byPhase[ph].errors) / rep.byPhase[ph].moves : 0);
  const maxRate = Math.max(1, ...phases.map(rate));
  const worstPhase = [...phases].filter((ph) => rep.byPhase[ph].moves >= 20).sort((a, b) => rate(b) - rate(a))[0];
  const worstCat = totalErr > 0 ? cats[0] : null;
  const perGame = (totalErr / rep.games).toFixed(1);
  const shown = rep.examples.filter((e) => !cat || e.category === cat).slice(0, 8);

  return (
    <div>
      {top}
      <Card>
        <div className="grid-3">
          <div className="stat">
            <b>{rep.games}</b>
            <span>ván đã phân tích</span>
          </div>
          <div className="stat">
            <b>{rep.accuracy.all ?? '–'}%</b>
            <span>độ chính xác</span>
          </div>
          <div className="stat">
            <b>{perGame}</b>
            <span>lỗi lớn mỗi ván</span>
          </div>
        </div>
        <p className="small muted mt" style={{ marginBottom: 0 }}>
          Thắng {rep.score.win} · Hòa {rep.score.draw} · Thua {rep.score.loss}.
          {rep.thrownWins > 0 && ` Có ${rep.thrownWins} ván bạn từng thắng thế rõ nhưng không thắng được.`}
          {rep.games < 10 && ' Mới có ít ván nên số liệu chỉ để tham khảo: từ khoảng 10 ván trở lên mới đáng tin.'}
        </p>
      </Card>

      {worstCat && (
        <Card>
          <h3>Nên sửa trước</h3>
          <p className="small">{CATEGORY_ADVICE[worstCat].text}</p>
          <Button kind="primary" onClick={() => navigate(CATEGORY_ADVICE[worstCat].to)}>
            {CATEGORY_ADVICE[worstCat].cta}
          </Button>
          {worstPhase && rep.byPhase[worstPhase].errors > 0 && (
            <p className="small mt" style={{ marginBottom: 0 }}>
              {PHASE_ADVICE[worstPhase].text}{' '}
              <a onClick={() => navigate(PHASE_ADVICE[worstPhase].to)}>{PHASE_ADVICE[worstPhase].cta}</a>
            </p>
          )}
        </Card>
      )}

      <Card>
        <h3>Lỗi lớn theo loại</h3>
        {totalErr === 0 && <p className="small muted">Chưa thấy sai lầm lớn nào trong các ván đã phân tích.</p>}
        {cats.map((c) => (
          <div key={c} onClick={() => setCat(cat === c ? null : c)} style={{ cursor: 'pointer', opacity: cat && cat !== c ? 0.5 : 1 }}>
            <Bar label={CATEGORY_VI[c]} value={rep.byCategory[c]} max={maxCat} tone="bad" note={`${rep.byCategory[c]} lần`} />
          </div>
        ))}
        <p className="tiny muted" style={{ marginBottom: 0 }}>Chạm vào một loại để lọc các ví dụ bên dưới. Lỗi lớn gồm “sai lầm” và “sai nghiêm trọng”.</p>
      </Card>

      <Card>
        <h3>Theo giai đoạn ván cờ</h3>
        {phases.map((ph) => (
          <Bar
            key={ph}
            label={PHASE_VI[ph]}
            value={rate(ph)}
            max={maxRate}
            tone="bad"
            note={rep.byPhase[ph].moves ? `${rep.byPhase[ph].errors} lỗi lớn / ${rep.byPhase[ph].moves} nước (${rate(ph).toFixed(1)}%)` : 'chưa có nước nào'}
          />
        ))}
        <h3 className="mt">Theo màu quân</h3>
        {(['w', 'b'] as const).map((c) => (
          <Bar
            key={c}
            label={c === 'w' ? `Cầm Trắng · ${rep.gamesByColor.w} ván` : `Cầm Đen · ${rep.gamesByColor.b} ván`}
            value={rep.gamesByColor[c] ? (rep.accuracy[c] ?? 0) : 0}
            max={100}
            note={rep.gamesByColor[c] ? `chính xác ${rep.accuracy[c]}% · ${rep.byColor[c].errors} lỗi lớn` : 'chưa có ván'}
          />
        ))}
      </Card>

      {rep.openings.length > 0 && (
        <Card>
          <h3>Khai cuộc hay gặp</h3>
          {rep.openings.map((o) => (
            <div key={o.name} className="row-between small" style={{ padding: '6px 0', borderBottom: '1px solid var(--line)' }}>
              <span>{o.name}</span>
              <span className="muted" style={{ whiteSpace: 'nowrap' }}>
                {o.games} ván · {o.points}/{o.games} điểm · chính xác {o.accuracy}%
              </span>
            </div>
          ))}
        </Card>
      )}

      <Card>
        <h3>Ví dụ từ ván của bạn{cat ? `: ${CATEGORY_VI[cat]}` : ''}</h3>
        {shown.length === 0 && <p className="small muted">Không có ví dụ.</p>}
        {shown.map((e) => (
          <div key={`${e.gameId}:${e.ply}`} className="list-item" style={{ alignItems: 'flex-start' }} onClick={() => navigate(`analyze/game/${e.gameId}?ply=${e.ply}&from=stats`)}>
            <span>
              <b>{e.label}</b> <span className="muted small">{PHASE_VI[e.phase]} · {CATEGORY_VI[e.category]}</span>
              <div className="small">{e.text}</div>
            </span>
            <span style={{ flexShrink: 0, whiteSpace: 'nowrap' }}>
              <Tag tone={e.judgment === 'blunder' ? 'bad' : 'warn'}>{JUDGE_VI[e.judgment]}</Tag>
            </span>
          </div>
        ))}
        {unknownSide > 0 && <p className="tiny muted">{unknownSide} ván chưa rõ bạn cầm bên nào nên không tính: mở ván đó và chọn “Tôi cầm Trắng/Đen”.</p>}
      </Card>
    </div>
  );
}

function Summary({ label, mine, acc, counts }: { label: string; mine: boolean; acc: number; counts: Record<Judgment, number> }) {
  return (
    <div className="stat" style={{ textAlign: 'left', minWidth: 0 }}>
      <div className="small" style={{ overflowWrap: 'anywhere' }}>
        <b style={{ display: 'inline', fontSize: '1rem' }}>{label}</b>
        {mine && <span className="muted"> (bạn)</span>}
      </div>
      <div className="small">
        Chính xác <b style={{ display: 'inline', fontSize: '1rem' }}>{acc}%</b>
      </div>
      <div className="tiny muted">
        {counts.blunder} sai nghiêm trọng (??)
        <br />
        {counts.mistake} sai lầm (?)
        <br />
        {counts.inaccuracy} không chính xác (?!)
      </div>
    </div>
  );
}
