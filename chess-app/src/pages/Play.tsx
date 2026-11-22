import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import type { Key, Color } from 'chessground/types';
import Board from '../components/Board';
import PromotionPicker from '../components/PromotionPicker';
import MoveList from '../components/MoveList';
import { Button, Card, Seg } from '../components/ui';
import { getEngine } from '../lib/engine';
import { LEVELS, TIME_CONTROLS, applyLevel, type Level, type TimeControl } from '../lib/levels';
import { fmtClock, gameEnd, playUci, turnColor, kingInCheckColor, toDests, needsPromotion } from '../lib/chess-utils';
import { upsertGames, type StoredGame } from '../lib/storage';
import { navigate, type Route } from '../lib/router';
import { logActivity } from '../lib/activity';

type Setup = { color: 'w' | 'b' | 'random'; level: number; tc: string };
const SETUP_KEY = 'play-setup';

function loadSetup(): Setup {
  try {
    return { color: 'w', level: 2, tc: '15+10', ...JSON.parse(localStorage.getItem(SETUP_KEY) ?? '{}') };
  } catch {
    return { color: 'w', level: 2, tc: '15+10' };
  }
}

export default function Play(_: { route: Route }) {
  const [setup, setSetup] = useState<Setup>(loadSetup);
  const [game, setGame] = useState<{ me: 'w' | 'b'; level: Level; tc: TimeControl } | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(SETUP_KEY, JSON.stringify(setup));
    } catch {
      /* ignore */
    }
  }, [setup]);

  if (game) {
    return (
      <GameView
        me={game.me}
        level={game.level}
        tc={game.tc}
        onExit={() => setGame(null)}
        onRematch={() => setGame({ ...game, me: setup.color === 'random' ? (Math.random() < 0.5 ? 'w' : 'b') : game.me })}
      />
    );
  }

  const level = LEVELS.find((l) => l.n === setup.level) ?? LEVELS[3];
  return (
    <div>
      <h1>Chơi với máy</h1>
      <Card>
        <h3>Bạn cầm</h3>
        <Seg
          value={setup.color}
          onChange={(v) => setSetup({ ...setup, color: v })}
          options={[
            { value: 'w', label: '♔ Trắng' },
            { value: 'b', label: '♚ Đen' },
            { value: 'random', label: 'Ngẫu nhiên' },
          ]}
        />
      </Card>
      <Card>
        <div className="row-between">
          <h3>Cấp độ máy</h3>
          <span className="muted small">
            {level.label} · Elo {level.elo}
          </span>
        </div>
        <input
          type="range"
          min={1}
          max={10}
          value={setup.level}
          onChange={(e) => setSetup({ ...setup, level: Number(e.target.value) })}
        />
        <div className="row-between tiny muted">
          <span>1 · Mới chơi</span>
          <span>10 · Tối đa</span>
        </div>
        <p className="small muted mt">
          Mẹo: chọn cấp mà bạn thắng khoảng 50 đến 60%. Thắng quá dễ hay thua liên tục đều không giúp tiến bộ.
        </p>
      </Card>
      <Card>
        <h3>Thời gian</h3>
        <Seg value={setup.tc} onChange={(v) => setSetup({ ...setup, tc: v })} options={TIME_CONTROLS.map((t) => ({ value: t.id, label: t.label }))} />
        <p className="small muted mt">
          "15+10" nghĩa là mỗi bên có 15 phút, cộng thêm 10 giây sau mỗi nước đi. Để học, nên chơi 15+10 hoặc 30+0, hoặc "Không giờ" khi mới tập. Cờ chớp chỉ để giải trí.
        </p>
      </Card>
      <Button
        kind="primary"
        className="grow"
        onClick={() =>
          setGame({
            me: setup.color === 'random' ? (Math.random() < 0.5 ? 'w' : 'b') : setup.color,
            level,
            tc: TIME_CONTROLS.find((t) => t.id === setup.tc) ?? TIME_CONTROLS[0],
          })
        }
      >
        Bắt đầu ván mới
      </Button>
    </div>
  );
}

function GameView({
  me,
  level,
  tc,
  onExit,
  onRematch,
}: {
  me: 'w' | 'b';
  level: Level;
  tc: TimeControl;
  onExit: () => void;
  onRematch: () => void;
}) {
  const chessRef = useRef(new Chess());
  const chess = chessRef.current;
  const [version, setVersion] = useState(0);
  const [pending, setPending] = useState<{ from: Key; to: Key } | null>(null);
  const [clock, setClock] = useState({ w: tc.initial * 1000, b: tc.initial * 1000 });
  const [over, setOver] = useState<{ result: string; reason: string } | null>(null);
  const [thinking, setThinking] = useState(false);
  const [viewPly, setViewPly] = useState<number | null>(null); // null = live
  const [savedId, setSavedId] = useState<string | null>(null);
  const lastTick = useRef<number>(0);
  const startedAt = useRef(Date.now());
  const engine = useMemo(() => getEngine(), []);
  const orientation: Color = me === 'w' ? 'white' : 'black';
  const history = chess.history();
  const moveCount = history.length;

  const logged = useRef(false);
  const finish = useCallback((result: string, reason: string) => {
    setOver((o) => o ?? { result, reason });
    if (!logged.current) {
      logged.current = true;
      logActivity('games');
    }
  }, []);

  // clock
  useEffect(() => {
    if (tc.initial === 0 || over || moveCount < 2) return;
    lastTick.current = performance.now();
    const id = setInterval(() => {
      const now = performance.now();
      const dt = now - lastTick.current;
      lastTick.current = now;
      const side = chess.turn();
      setClock((c) => {
        const next = { ...c, [side]: c[side] - dt };
        if (next[side] <= 0) {
          next[side] = 0;
          finish(side === 'w' ? '0-1' : '1-0', side === me ? 'Bạn hết giờ' : 'Máy hết giờ');
        }
        return next;
      });
    }, 100);
    return () => clearInterval(id);
  }, [chess, moveCount, over, tc.initial, me, finish]);

  const afterMove = useCallback(
    (mover: 'w' | 'b') => {
      if (tc.initial > 0 && moveCount >= 1) setClock((c) => ({ ...c, [mover]: c[mover] + tc.inc * 1000 }));
      setVersion((v) => v + 1);
      setViewPly(null);
      const end = gameEnd(chess);
      if (end.over) finish(end.result!, end.reason!);
    },
    [chess, finish, tc, moveCount],
  );

  // engine move
  useEffect(() => {
    if (over || chess.turn() === me) return;
    let cancelled = false;
    (async () => {
      setThinking(true);
      await applyLevel(engine, level);
      const res = await engine.evaluate(chess.fen(), { depth: level.depth, movetime: level.movetime });
      if (cancelled) return;
      // a tiny human-like delay on the lowest levels so moves don't feel instant
      await new Promise((r) => setTimeout(r, 250));
      if (cancelled) return;
      if (res.bestmove && res.bestmove !== '(none)') {
        const mover = chess.turn();
        if (playUci(chess, res.bestmove)) afterMove(mover);
      }
      setThinking(false);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version, over, me]);

  useEffect(() => {
    engine.newGame();
    return () => engine.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const commit = (from: Key, to: Key, promotion?: 'q' | 'r' | 'b' | 'n') => {
    if (over || chess.turn() !== me) return;
    try {
      chess.move({ from, to, promotion });
    } catch {
      return;
    }
    afterMove(me);
  };

  const onMove = (from: Key, to: Key) => {
    if (viewPly !== null) setViewPly(null);
    if (needsPromotion(chess, from, to)) setPending({ from, to });
    else commit(from, to);
  };

  // position shown (live or browsing history)
  const shown = useMemo(() => {
    if (viewPly === null) return chess;
    const c = new Chess();
    const h = chess.history();
    for (let i = 0; i <= viewPly && i < h.length; i++) c.move(h[i]);
    return c;
  }, [chess, viewPly, version]);
  const shownHist = shown.history({ verbose: true });
  const last = shownHist[shownHist.length - 1];
  const live = viewPly === null;

  const saveGame = async (): Promise<string> => {
    if (savedId) return savedId;
    const id = `app-${startedAt.current.toString(36)}`;
    const result = over?.result ?? '*';
    const white = me === 'w' ? 'Bạn' : `Stockfish ${level.n}`;
    const black = me === 'b' ? 'Bạn' : `Stockfish ${level.n}`;
    chess.setHeader('Event', 'Chess Trainer');
    chess.setHeader('White', white);
    chess.setHeader('Black', black);
    chess.setHeader('Result', result);
    chess.setHeader('Date', new Date(startedAt.current).toISOString().slice(0, 10).replace(/-/g, '.'));
    chess.setHeader('TimeControl', tc.initial ? `${tc.initial}+${tc.inc}` : '-');
    const g: StoredGame = {
      id,
      source: 'app',
      white,
      black,
      result,
      date: startedAt.current,
      me,
      pgn: chess.pgn(),
      moves: chess.history(),
      speed: tc.label,
    };
    await upsertGames([g]);
    setSavedId(id);
    return id;
  };

  const resign = () => finish(me === 'w' ? '0-1' : '1-0', 'Bạn xin thua');

  /** Take back your last move (and the computer's reply). Practice games only, so no limit. */
  const canTakeback = !over && !thinking && chess.turn() === me && chess.history().length >= 2;
  const takeback = () => {
    if (!canTakeback) return;
    chess.undo();
    chess.undo();
    setViewPly(null);
    setVersion((v) => v + 1);
  };

  const myName = 'Bạn';
  const botName = `Stockfish · cấp ${level.n} (${level.elo})`;
  const top = me === 'w' ? 'b' : 'w';
  const bottom = me;
  const bar = (side: 'w' | 'b') => (
    <div className="player-bar">
      <span className="player-name">
        {side === me ? myName : botName}
        {side !== me && thinking && !over && <span className="muted small"> · đang nghĩ…</span>}
      </span>
      {tc.initial > 0 && (
        <span className={`clock ${!over && chess.turn() === side && moveCount >= 2 ? 'active' : ''} ${clock[side] < 20000 ? 'low' : ''}`}>
          {fmtClock(clock[side])}
        </span>
      )}
    </div>
  );

  const resultText = over
    ? over.result === '1/2-1/2'
      ? 'Hòa'
      : (over.result === '1-0') === (me === 'w')
        ? 'Bạn thắng!'
        : 'Bạn thua'
    : '';

  return (
    <div>
      <div className="topbar">
        <button className="back" onClick={onExit} aria-label="Quay lại">
          ‹
        </button>
        <h2 style={{ margin: 0 }}>Ván đấu</h2>
      </div>
      <div className="board-layout">
        <div>
          {bar(top)}
          <Board
            fen={shown.fen()}
            orientation={orientation}
            turnColor={turnColor(shown)}
            lastMove={last ? [last.from as Key, last.to as Key] : undefined}
            check={kingInCheckColor(shown)}
            movableColor={live && !over && chess.turn() === me ? orientation : undefined}
            dests={live ? toDests(chess) : new Map()}
            onMove={onMove}
          />
          {bar(bottom)}
        </div>
        <div>
          {over && (
            <Card>
              <h3>
                {resultText} <span className="muted small">({over.result})</span>
              </h3>
              <p className="muted small">{over.reason}</p>
              <div className="row">
                <Button
                  kind="primary"
                  onClick={async () => {
                    const id = await saveGame();
                    navigate(`analyze/game/${id}`);
                  }}
                >
                  Phân tích ván này
                </Button>
                <Button onClick={onRematch}>Ván mới</Button>
              </div>
            </Card>
          )}
          <Card>
            <MoveList moves={history} current={viewPly ?? moveCount - 1} onSelect={(p) => setViewPly(p === moveCount - 1 ? null : p)} />
            <div className="row mt">
              <Button kind="ghost" onClick={() => setViewPly(Math.max(-1, (viewPly ?? moveCount - 1) - 1))} disabled={moveCount === 0}>
                ◀
              </Button>
              <Button kind="ghost" onClick={() => setViewPly((viewPly ?? moveCount - 1) + 1 >= moveCount - 1 ? null : (viewPly ?? -1) + 1)} disabled={live}>
                ▶
              </Button>
              <span className="grow" />
              {!over && (
                <>
                  <Button kind="ghost" onClick={takeback} disabled={!canTakeback}>
                    ↶ Đi lại
                  </Button>
                  <Button kind="danger" onClick={resign}>
                    Xin thua
                  </Button>
                </>
              )}
            </div>
          </Card>
        </div>
      </div>
      {pending && (
        <PromotionPicker
          color={orientation}
          onPick={(p) => {
            commit(pending.from, pending.to, p);
            setPending(null);
          }}
          onCancel={() => setPending(null)}
        />
      )}
    </div>
  );
}

