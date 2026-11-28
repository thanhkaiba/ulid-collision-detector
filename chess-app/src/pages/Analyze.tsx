import { useEffect, useMemo, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import type { Key } from 'chessground/types';
import type { DrawShape } from 'chessground/draw';
import Board from '../components/Board';
import EvalBar from '../components/EvalBar';
import EvalGraph from '../components/EvalGraph';
import MoveList from '../components/MoveList';
import PromotionPicker from '../components/PromotionPicker';
import { Button, Card, Icon, Spinner, Tag, askConfirm } from '../components/ui';
import { getEngine, formatScore, toWhitePov, type Engine, type EngineLine } from '../lib/engine';
import { analyzeGame, extractMistakes, replayGame, startFenOf, sideOf, moveNumberOf } from '../lib/analysis';
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
import { kingInCheckColor, turnColor, uciLineToSan, toDests, playUci, needsPromotion } from '../lib/chess-utils';
import {
  loadGames,
  saveGames,
  upsertGames,
  loadAnalysis,
  saveAnalysis,
  deleteAnalysis,
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

const ENGINE_DOWN = 'Không khởi động được Stockfish (bộ máy cờ chưa tải xong hoặc bị chặn). Kiểm tra mạng rồi tải lại trang.';
/** Start a fresh engine game, giving up (instead of waiting forever) when the engine never answers. */
function engineNewGame(engine: Engine, ms = 20000): Promise<void> {
  let timer: ReturnType<typeof setTimeout>;
  return Promise.race([
    engine.newGame(),
    new Promise<void>((_, reject) => {
      timer = setTimeout(() => reject(new Error(ENGINE_DOWN)), ms);
    }),
  ]).finally(() => clearTimeout(timer));
}

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
  const addGames = async (all: StoredGame[], from: string) => {
    // the same game twice in one answer counts once
    const list = [...new Map(all.map((g) => [g.id, g])).values()];
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
    const { games: parsed, failed, variants } = parsePgnText(pgn, [settings?.lichessUser ?? '', settings?.chesscomUser ?? '']);
    // the names typed above were used to find the user's side: keep them, as "Lấy ván" does
    if (settings) await saveSettings(settings);
    const skipped = [
      failed ? `${failed} ván không đọc được (sai định dạng hoặc có nước sai luật)` : '',
      variants.length ? `${variants.length} ván cờ biến thể (${[...new Set(variants)].join(', ')}), app chỉ phân tích cờ vua tiêu chuẩn` : '',
    ].filter(Boolean);
    if (!parsed.length) {
      setErr(
        variants.length && !failed
          ? `Không nhập được: ${skipped.join('; ')}.`
          : 'Không đọc được ván nào. Kiểm tra lại PGN: cần có các nước đi dạng "1. e4 e5 2. Nf3 ...", nước nào sai luật thì cả ván bị bỏ qua.',
      );
      return;
    }
    const msg = await addGames(parsed, 'từ PGN');
    setPgn('');
    setShowPgn(false);
    setErr(skipped.length ? `Đã bỏ qua ${skipped.join('; ')}.` : null);
    setOk(msg);
  };

  const batchCancel = useRef<{ cancelled: boolean }>({ cancelled: true });
  const [batch, setBatch] = useState<{ game: number; games: number; done: number; total: number } | null>(null);
  const [batchNote, setBatchNote] = useState<string | null>(null);
  useEffect(() => () => {
    // leaving the page stops the batch, and the search in progress with it
    if (!batchCancel.current.cancelled) getEngine().stop();
    batchCancel.current.cancelled = true;
  }, []);

  if (!games || !settings) return <Spinner label="Đang tải…" />;

  const allPending = games.filter((g) => !analyzed.has(g.id) && g.moves.length >= 10);
  const pendingGames = allPending.slice(0, 20);
  // count as the report does: games still in the list (it keeps the newest 400) whose side is known
  const analyzedCount = games.filter((g) => analyzed.has(g.id) && g.me).length;
  const analyzedNoSide = games.filter((g) => analyzed.has(g.id) && !g.me).length;
  const runBatch = async () => {
    if (!batchCancel.current.cancelled) return; // already running (double tap)
    const engine = getEngine();
    const token = { cancelled: false };
    batchCancel.current = token;
    setBatchNote(null);
    // games that already carry Lichess evals are quick: do them first
    const queue = [...pendingGames].sort((a, b) => Number(!!b.serverEvals) - Number(!!a.serverEvals));
    let done = 0;
    const broken: string[] = [];
    for (let i = 0; i < queue.length && !token.cancelled; i++) {
      const g = queue[i];
      setBatch({ game: i + 1, games: queue.length, done: 0, total: g.moves.length });
      try {
        await engineNewGame(engine);
        const res = await analyzeGame(g, engine, Math.min(settings.analysisDepth, 12), (d, total) => !token.cancelled && setBatch({ game: i + 1, games: queue.length, done: d, total }), token);
        if (!res) break;
        await storeAnalysis(g, res);
        done++;
        setAnalyzed((s) => new Set([...s, g.id]));
      } catch (e) {
        if (e instanceof Error && e.message === ENGINE_DOWN) {
          broken.length = 0;
          broken.push(ENGINE_DOWN);
          break;
        }
        // one unreadable game must not stop (or freeze) the whole batch
        broken.push(`${g.white} – ${g.black}`);
      }
    }
    if (batchCancel.current !== token) return;
    token.cancelled = true;
    setBatch(null);
    setBatchNote(
      broken[0] === ENGINE_DOWN
        ? ENGINE_DOWN
        : broken.length
        ? `Đã phân tích ${done} ván. Không phân tích được ${broken.length} ván (${broken.slice(0, 3).join('; ')}${broken.length > 3 ? '…' : ''}): ván có nước không hợp lệ.`
        : null,
    );
  };
  const stopBatch = () => {
    batchCancel.current.cancelled = true;
    getEngine().stop();
    // the finished games are saved already: free the screen right away, even if the engine is slow to answer
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
                {analyzedCount > 0
                  ? `Tổng hợp lỗi từ ${analyzedCount} ván đã phân tích: loại lỗi, giai đoạn, khai cuộc.`
                  : 'Phân tích vài ván để biết bạn hay sai ở đâu: loại lỗi, giai đoạn, khai cuộc.'}
                {analyzedNoSide > 0 &&
                  ` ${analyzedNoSide} ván đã phân tích chưa rõ bạn cầm bên nào nên chưa tính: mở ván và chọn “Tôi cầm Trắng/Đen”.`}
              </div>
            </div>
            {analyzedCount > 0 && (
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
                <button className="chip" onClick={stopBatch}>
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
                <div className="tiny muted">Cứ để máy chạy và ở lại trang này, có thể dừng bất cứ lúc nào. Ván đã xong được lưu ngay. Để nhanh, phân tích nhiều ván dùng độ sâu tối đa 12; muốn kỹ hơn thì mở từng ván.</div>
              </div>
            )
          )}
          {batchNote && !batch && <div className="feedback bad small mt">{batchNote}</div>}
        </Card>
      )}
      <Card>
        <label className="field">
          <span>Tên người dùng Lichess</span>
          <div className="row" style={{ flexWrap: 'nowrap' }}>
            <input
              value={settings.lichessUser}
              onChange={(e) => setSettings({ ...settings, lichessUser: e.target.value })}
              onBlur={() => saveSettings(settings)}
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
              onBlur={() => saveSettings(settings)}
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
  // a link may carry a ply the game does not have (or no number at all): clamped once the game is loaded
  const [ply, setPly] = useState<number>(initialPly !== undefined && Number.isFinite(initialPly) ? Math.max(-1, Math.floor(initialPly)) : -1); // -1 = start position
  const [running, setRunning] = useState<{ done: number; total: number } | null>(null);
  const [runError, setRunError] = useState<string | null>(null);
  const [promo, setPromo] = useState<{ from: Key; to: Key } | null>(null);
  const [engineDown, setEngineDown] = useState(false);
  const [live, setLive] = useState<EngineLine[]>([]);
  const [liveDepth, setLiveDepth] = useState(0);
  const [showBest, setShowBest] = useState(true);
  const [flip, setFlip] = useState(false);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [mistakeCount, setMistakeCount] = useState<{ found: number; added: number } | null>(null);
  const cancel = useRef<{ cancelled: boolean }>({ cancelled: true });
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

  // the game replayed from its start (a set-up position for a PGN with a FEN tag); a game that cannot be
  // replayed shows its start and a message instead of crashing the page
  const { positions, sans, replayError } = useMemo((): { positions: { fen: string; lastMove?: Key[] }[]; sans: string[]; replayError: string | null } => {
    if (!game) return { positions: [], sans: [], replayError: null };
    try {
      const steps = replayGame(game);
      return {
        positions: [{ fen: startFenOf(game) }, ...steps.map((m) => ({ fen: m.fenAfter, lastMove: [m.from, m.to] as Key[] }))],
        sans: steps.map((m) => m.san),
        replayError: null,
      };
    } catch (e) {
      return { positions: [{ fen: startFenOf(game) }], sans: [], replayError: e instanceof Error ? e.message : String(e) };
    }
  }, [game]);
  /** index of the last ply */
  const lastPly = positions.length - 2;
  useEffect(() => {
    if (positions.length && ply > lastPly) setPly(lastPly);
  }, [positions.length, ply, lastPly]);

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
    if (!game || !settings || replayError) return;
    // a second tap, or "Phân tích lại" while an older run is still unwinding: only the newest run owns the screen
    cancel.current.cancelled = true;
    const token = { cancelled: false };
    cancel.current = token;
    engine.stop();
    setRunError(null);
    setRunning({ done: 0, total: game.moves.length });
    try {
      await engineNewGame(engine);
      const res = await analyzeGame(game, engine, settings.analysisDepth, (done, total) => !token.cancelled && setRunning({ done, total }), token);
      if (cancel.current !== token || !res) return;
      setAnalysis(res);
      setMistakeCount(await storeAnalysis(game, res));
    } catch (e) {
      if (cancel.current === token) setRunError(e instanceof Error ? e.message : String(e));
    } finally {
      if (cancel.current === token) {
        token.cancelled = true;
        setRunning(null);
      }
    }
  };
  const stopRun = () => {
    cancel.current.cancelled = true;
    engine.stop();
    // free the screen at once, even when the engine is slow to answer
    setRunning(null);
  };

  // an engine that never loads would leave "đang tính..." spinning forever: say what is wrong instead
  useEffect(() => {
    let alive = true;
    const t = setTimeout(() => alive && setEngineDown(true), 20000);
    engine.waitReady().then(() => {
      clearTimeout(t);
      if (alive) setEngineDown(false);
    });
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [engine]);

  useEffect(() => () => {
    // leaving mid-analysis: stop the search too, so the next screen does not wait behind it
    if (!cancel.current.cancelled) engine.stop();
    cancel.current.cancelled = true;
  }, [engine]);

  // Lichess games that carry the server's analysis take a second: show it right away, as the import screen promises
  const autoRan = useRef(false);
  useEffect(() => {
    if (autoRan.current || !game || !settings || !analysisLoaded || analysis || running || replayError) return;
    if (!game.serverEvals || game.serverEvals.length < game.moves.length - 1) return;
    autoRan.current = true;
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game, settings, analysisLoaded, analysis, running]);

  if (game === undefined || !settings) return <Spinner label="Đang tải…" />;
  if (game === null)
    return (
      <div>
        <p>Không tìm thấy ván. Có thể ván đã bị xóa.</p>
        <Button onClick={() => navigate(back)}>Quay lại</Button>
      </div>
    );

  // while a line from an explanation is on the board, keep showing the move it explains
  const onLine = !!line && variation.length > 0 && variation.every((s, i) => line.sans[i] === s);
  const cardPly = onLine ? line!.from : ply;
  const cur = analysis?.plies[cardPly];
  const curExplain = cur && isError(cur.judgment) ? explainPly(cur, analysis?.plies[cardPly - 1], !!game.me && sideOf(cur.fenBefore) === game.me) : null;
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
    setPly(Math.max(-1, Math.min(lastPly, p)));
  };
  /** Jump to a move from a list further down the page: bring the board back into view. */
  const goAndShow = (p: number) => {
    go(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const forward = () => (lineHasMore ? setVariation(line!.sans.slice(0, variation.length + 1)) : go(ply + 1));
  const backward = () => (variation.length ? setVariation(variation.slice(0, -1)) : go(ply - 1));

  const tryMove = (from: Key, to: Key, promotion?: 'q' | 'r' | 'b' | 'n') => {
    const m = playUci(new Chess(fen), from + to + (promotion ?? ''));
    if (m) setVariation([...variation, m.san]);
  };
  // a pawn reaching the last rank asks which piece, as on the other boards (under-promotion is a real choice)
  const onBoardMove = (from: Key, to: Key) => (needsPromotion(chess, from, to) ? setPromo({ from, to }) : tryMove(from, to));

  const removeGame = async () => {
    const ok = await askConfirm({
      title: 'Xóa ván này khỏi danh sách?',
      body: 'Phân tích của ván và các nước sai lấy từ ván này trong “Lỗi của chính bạn” cũng bị xóa.',
      confirm: 'Xóa ván',
      cancel: 'Giữ lại',
      danger: true,
    });
    if (!ok) return;
    stopRun();
    await saveGames((await loadGames()).filter((g) => g.id !== game.id));
    await deleteAnalysis(game.id);
    const ms = await loadMistakes();
    const keep = ms.filter((m) => m.gameId !== game.id);
    if (keep.length !== ms.length) await saveMistakes(keep);
    navigate(back);
  };
  // a game set up with Black to move: an empty first cell keeps Black's moves in Black's column
  const lead = sideOf(positions[0].fen) === 'b' ? 1 : 0;

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
        <Button kind="ghost" label="Lật bàn cờ" onClick={() => setFlip(!flip)}>
          <Icon name="flip" />
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
            <Button kind="ghost" label="Về thế cờ ban đầu" onClick={() => go(-1)}>
              <Icon name="first" />
            </Button>
            <Button kind="ghost" label="Nước trước" onClick={backward} disabled={ply < 0 && variation.length === 0}>
              <Icon name="prev" />
            </Button>
            <Button kind="ghost" label="Nước sau" onClick={forward} disabled={!lineHasMore && ply >= lastPly}>
              <Icon name="next" />
            </Button>
            <Button kind="ghost" label="Tới nước cuối" onClick={() => go(lastPly)}>
              <Icon name="last" />
            </Button>
          </div>
          {variation.length > 0 && (
            <div className="feedback info small">
              {onLine ? (
                <>
                  {line!.sans.map((s, i) => (
                    <span key={i} style={{ opacity: i < variation.length ? 1 : 0.45, fontWeight: i === variation.length - 1 ? 600 : undefined }}>
                      {s}{' '}
                    </span>
                  ))}
                  <div className="tiny" style={{ marginTop: 2 }}>
                    {lineHasMore ? `${variation.length}/${line!.sans.length} · bấm › (nước sau) để xem tiếp.` : 'Hết biến.'} Có thể tự đi thử quân trên bàn cờ.
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
            {live.length === 0 && !over && !running && !engineDown && <Spinner label="đang tính…" />}
            {live.length === 0 && !over && !running && engineDown && <div className="small muted">{ENGINE_DOWN}</div>}
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
                  {moveNumberOf(cur.fenBefore)} {cur.san}
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
                        <Icon name="play" /> {curExplain.lineIsRefutation ? 'Xem vì sao sai' : 'Xem nước đúng'}: {curExplain.line.slice(0, 5).join(' ')}
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
            {replayError && <div className="feedback bad small">{replayError} Hãy xóa ván này rồi dán lại PGN đúng.</div>}
            {runError && !running && <div className="feedback bad small">{runError}</div>}
            {!analysis && !running && !replayError && (
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
                  <button className="chip" onClick={stopRun}>
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
            <MoveList
              moves={lead ? ['…', ...sans] : sans}
              current={ply < 0 ? -1 : ply + lead}
              onSelect={(p) => go(p - lead)}
              judgments={judgments && lead ? [undefined, ...judgments] : judgments}
            />
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
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <Button kind="ghost" className="small" onClick={removeGame}>
              Xóa ván này
            </Button>
          </div>
        </div>
      </div>
      {promo && (
        <PromotionPicker
          color={turnColor(chess)}
          onPick={(p) => {
            tryMove(promo.from, promo.to, p);
            setPromo(null);
          }}
          onCancel={() => setPromo(null)}
        />
      )}
    </div>
  );
}

function ReviewList({ analysis, me, onGo }: { analysis: GameAnalysis; me: 'w' | 'b'; onGo: (ply: number) => void }) {
  const [all, setAll] = useState(false);
  const mine = analysis.plies.filter((p) => sideOf(p.fenBefore) === me && isError(p.judgment));
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
                {moveNumberOf(p.fenBefore)} {p.san}
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
  if (rep === undefined) return <Spinner label="Đang tổng hợp…" />;
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
