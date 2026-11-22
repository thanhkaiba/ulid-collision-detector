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
import { fetchChesscomGames, fetchLichessGames, importPgn } from '../lib/import';
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
    return <GameAnalysisView gameId={route.parts[1]} initialPly={route.query.get('ply') ? Number(route.query.get('ply')) : undefined} />;
  }
  return <GamesList />;
}

/* ------------------------------------------------------------------ */

function GamesList() {
  const [games, setGames] = useState<StoredGame[] | null>(null);
  const [analyzed, setAnalyzed] = useState<Set<string>>(new Set());
  const [settings, setSettings] = useState<Settings | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pgn, setPgn] = useState('');
  const [showPgn, setShowPgn] = useState(false);

  useEffect(() => {
    loadGames().then(setGames);
    listAnalyzedIds().then((ids) => setAnalyzed(new Set(ids)));
    loadSettings().then(setSettings);
  }, []);

  const doImport = async (source: 'lichess' | 'chesscom') => {
    if (!settings) return;
    const user = source === 'lichess' ? settings.lichessUser : settings.chesscomUser;
    if (!user.trim()) {
      setErr(`Nhập tên người dùng ${source === 'lichess' ? 'Lichess' : 'Chess.com'} trước.`);
      return;
    }
    setErr(null);
    setBusy(source);
    try {
      await saveSettings(settings);
      const fetched = source === 'lichess' ? await fetchLichessGames(user.trim(), 30) : await fetchChesscomGames(user.trim(), 30);
      setGames(await upsertGames(fetched));
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  };

  const doPgn = async () => {
    const parsed = importPgn(pgn, settings?.lichessUser || settings?.chesscomUser || undefined);
    if (!parsed.length) {
      setErr('Không đọc được PGN nào.');
      return;
    }
    setGames(await upsertGames(parsed));
    setPgn('');
    setShowPgn(false);
    setErr(null);
  };

  if (!games || !settings) return <Spinner label="Đang tải..." />;

  return (
    <div>
      <h1>Phân tích ván đấu</h1>
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
              {busy === 'lichess' ? '…' : 'Lấy ván'}
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
              {busy === 'chesscom' ? '…' : 'Lấy ván'}
            </Button>
          </div>
        </label>
        <Button kind="ghost" onClick={() => setShowPgn(!showPgn)}>
          {showPgn ? 'Ẩn' : 'Hoặc dán PGN'}
        </Button>
        {showPgn && (
          <div className="mt">
            <textarea value={pgn} onChange={(e) => setPgn(e.target.value)} placeholder="[Event ...]&#10;1. e4 e5 2. Nf3 ..." />
            <Button className="mt" onClick={doPgn}>
              Nhập PGN
            </Button>
          </div>
        )}
        {err && <div className="feedback bad mt">{err}</div>}
        <p className="small muted mt" style={{ marginBottom: 0 }}>
          Lấy 30 ván gần nhất. Ván Lichess đã có phân tích máy chủ sẽ hiển thị ngay, các ván khác được phân tích bằng Stockfish trong máy bạn.
        </p>
      </Card>

      {games.length === 0 && (
        <Card>
          <p className="muted">Chưa có ván nào. Nhập tên người dùng ở trên hoặc chơi một ván ở tab Chơi.</p>
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
      : g.result;
  const tone = myResult === 'Thắng' ? 'good' : myResult === 'Thua' ? 'bad' : 'default';
  return (
    <div className="list-item" onClick={() => navigate(`analyze/game/${g.id}`)}>
      <div>
        <div>
          <b>{g.white}</b> {g.whiteElo && <span className="muted small">({g.whiteElo})</span>} – <b>{g.black}</b>{' '}
          {g.blackElo && <span className="muted small">({g.blackElo})</span>}
        </div>
        <div className="small muted">
          {d.toLocaleDateString('vi-VN')} · {g.speed ?? g.source} · {g.moves.length} nước
          {g.opening ? ` · ${g.opening}` : ''}
        </div>
      </div>
      <div className="row" style={{ flexWrap: 'nowrap' }}>
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

function GameAnalysisView({ gameId, initialPly }: { gameId: string; initialPly?: number }) {
  const [game, setGame] = useState<StoredGame | null | undefined>(undefined);
  const [analysis, setAnalysis] = useState<GameAnalysis | null>(null);
  const [ply, setPly] = useState<number>(initialPly ?? -1); // -1 = start position
  const [running, setRunning] = useState<{ done: number; total: number } | null>(null);
  const [live, setLive] = useState<EngineLine[]>([]);
  const [liveDepth, setLiveDepth] = useState(0);
  const [showBest, setShowBest] = useState(true);
  const [flip, setFlip] = useState(false);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [mistakeCount, setMistakeCount] = useState<number | null>(null);
  const cancel = useRef<{ cancelled: boolean }>({ cancelled: false });
  const engine = useMemo(() => getEngine(), []);
  // "try a move" sandbox: user can play moves from the current position
  const [variation, setVariation] = useState<string[]>([]); // SAN from the main-line position

  useEffect(() => {
    loadGames().then((gs) => setGame(gs.find((g) => g.id === gameId) ?? null));
    loadAnalysis(gameId).then((a) => a && setAnalysis(a));
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
      .evaluate(fen, {
        depth: 18,
        multipv: 2,
        onInfo: (lines) => {
          if (!active) return;
          setLive(lines);
          setLiveDepth(lines[0]?.depth ?? 0);
        },
      })
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
    await saveAnalysis(res);
    // harvest mistakes
    const mine = extractMistakes(game, res);
    const existing = await loadMistakes();
    const ids = new Set(existing.map((m) => m.id));
    const merged = [...existing, ...mine.filter((m) => !ids.has(m.id))].slice(-500);
    await saveMistakes(merged);
    setMistakeCount(mine.length);
  };

  useEffect(() => () => {
    cancel.current.cancelled = true;
  }, []);

  if (game === undefined || !settings) return <Spinner label="Đang tải..." />;
  if (game === null)
    return (
      <div>
        <p>Không tìm thấy ván.</p>
        <Button onClick={() => navigate('analyze')}>Quay lại</Button>
      </div>
    );

  const cur = analysis?.plies[ply];
  const judgments = analysis?.plies.map((p) => p.judgment);
  const sideToMove = chess.turn();
  const liveScore = live[0] ? toWhitePov(live[0], sideToMove) : cur ? cur.evalAfter : undefined;
  const orientation = flip ? (game.me === 'b' ? 'white' : 'black') : game.me === 'b' ? 'black' : 'white';

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
    setPly(Math.max(-1, Math.min(game.moves.length - 1, p)));
  };

  const onBoardMove = (from: Key, to: Key) => {
    const c = new Chess(fen);
    const m = playUci(c, from + to) ?? playUci(c, from + to + 'q');
    if (!m) return;
    setVariation([...variation, m.san]);
  };

  const myCounts = game.me && analysis ? analysis.counts[game.me] : null;
  const myAcc = game.me && analysis ? analysis.accuracy[game.me] : null;

  return (
    <div>
      <div className="topbar">
        <button className="back" onClick={() => navigate('analyze')} aria-label="Quay lại">
          ‹
        </button>
        <div className="grow">
          <div>
            <b>{game.white}</b> – <b>{game.black}</b> <span className="muted small">{game.result}</span>
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
            <EvalBar score={liveScore} orientation={orientation} />
            <Board
              fen={fen}
              orientation={orientation}
              turnColor={turnColor(chess)}
              lastMove={variation.length ? undefined : positions[ply + 1]?.lastMove}
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
            <Button kind="ghost" onClick={() => (variation.length ? setVariation(variation.slice(0, -1)) : go(ply - 1))}>
              ◀
            </Button>
            <Button kind="ghost" onClick={() => go(ply + 1)} disabled={ply >= game.moves.length - 1}>
              ▶
            </Button>
            <Button kind="ghost" onClick={() => go(game.moves.length - 1)}>
              ⏭
            </Button>
          </div>
          {variation.length > 0 && (
            <div className="feedback info small">
              Biến thử: {variation.join(' ')}{' '}
              <button className="chip" onClick={() => setVariation([])}>
                về ván chính
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
            {live.length === 0 && !chess.isGameOver() && <Spinner label="đang tính..." />}
            {live.map((l) => (
              <div key={l.multipv} className="small" style={{ marginTop: 4 }}>
                <b>{formatScore(toWhitePov(l, sideToMove))}</b> {uciLineToSan(fen, l.pv.slice(0, 8)).join(' ')}
              </div>
            ))}
            {chess.isGameOver() && <div className="small muted">Ván kết thúc.</div>}
          </Card>

          {/* current move judgement */}
          {cur && variation.length === 0 && (
            <Card>
              <div className="row-between">
                <b>
                  {Math.floor(ply / 2) + 1}
                  {ply % 2 === 0 ? '.' : '...'} {cur.san}
                </b>
                <Tag tone={cur.judgment === 'blunder' ? 'bad' : cur.judgment === 'mistake' ? 'warn' : cur.judgment === 'inaccuracy' ? 'warn' : cur.judgment === 'best' ? 'good' : 'default'}>
                  {JUDGE_VI[cur.judgment]}
                </Tag>
              </div>
              <div className="small muted">
                {formatScore(cur.evalBefore)} → {formatScore(cur.evalAfter)}
                {cur.judgment !== 'best' && cur.judgment !== 'good' && (
                  <>
                    {' '}
                    · Nên đi <b>{cur.bestSan}</b> ({uciLineToSan(cur.fenBefore, cur.bestPv.slice(0, 5)).join(' ')})
                  </>
                )}
              </div>
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
                  <span>Đang phân tích… {running.done}/{running.total}</span>
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
                <EvalGraph plies={analysis.plies} current={ply} onSelect={go} />
                <div className="grid-2 mt">
                  <Summary label={game.white} acc={analysis.accuracy.w} counts={analysis.counts.w} />
                  <Summary label={game.black} acc={analysis.accuracy.b} counts={analysis.counts.b} />
                </div>
                {myCounts && (
                  <p className="small muted mt" style={{ margin: '8px 0 0' }}>
                    Bạn: độ chính xác {myAcc}% · {myCounts.blunder} sai nghiêm trọng, {myCounts.mistake} sai lầm, {myCounts.inaccuracy} không chính xác.
                    {mistakeCount !== null && mistakeCount > 0 && (
                      <>
                        {' '}
                        Đã thêm {mistakeCount} vị trí vào <a onClick={() => navigate('puzzles/mistakes')}>Lỗi của chính bạn</a>.
                      </>
                    )}
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

          {analysis && game.me && (
            <Card>
              <h3>Nước cần xem lại của bạn</h3>
              {analysis.plies.filter((p) => (p.ply % 2 === 0 ? 'w' : 'b') === game.me && (p.judgment === 'blunder' || p.judgment === 'mistake')).length === 0 && (
                <p className="small muted">Không có sai lầm lớn. Tốt!</p>
              )}
              {analysis.plies
                .filter((p) => (p.ply % 2 === 0 ? 'w' : 'b') === game.me && (p.judgment === 'blunder' || p.judgment === 'mistake'))
                .map((p) => (
                  <div key={p.ply} className="list-item" onClick={() => go(p.ply - 1)}>
                    <span>
                      <b>
                        {Math.floor(p.ply / 2) + 1}
                        {p.ply % 2 === 0 ? '.' : '...'} {p.san}
                      </b>{' '}
                      <span className="muted small">nên {p.bestSan}</span>
                    </span>
                    <Tag tone={p.judgment === 'blunder' ? 'bad' : 'warn'}>{JUDGE_VI[p.judgment]}</Tag>
                  </div>
                ))}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function Summary({ label, acc, counts }: { label: string; acc: number; counts: Record<Judgment, number> }) {
  return (
    <div className="stat" style={{ textAlign: 'left' }}>
      <div className="small">
        <b style={{ display: 'inline', fontSize: '1rem' }}>{label}</b>
      </div>
      <div className="small">
        Chính xác <b style={{ display: 'inline', fontSize: '1rem' }}>{acc}%</b>
      </div>
      <div className="tiny muted">
        ?? {counts.blunder} · ? {counts.mistake} · ?! {counts.inaccuracy} · ! {counts.best}
      </div>
    </div>
  );
}
