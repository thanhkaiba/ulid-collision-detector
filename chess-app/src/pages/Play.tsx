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
import { PRACTICE, practiceById, loadPracticeDone, markPracticeDone, type PracticePosition } from '../data/practice';

/** Engine settings for endgame practice: full strength, it must defend (or attack) correctly. */
const PRACTICE_LEVEL: Level = { n: 10, label: 'Tối đa', elo: '3000+', depth: 18, movetime: 900 };
const NO_CLOCK: TimeControl = { id: 'none', label: 'Luyện cờ tàn', initial: 0, inc: 0 };
const PIECE_VAL: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

type Setup = { color: 'w' | 'b' | 'random'; level: number; tc: string };
const SETUP_KEY = 'play-setup';

function loadSetup(): Setup {
  try {
    return { color: 'w', level: 2, tc: '15+10', ...JSON.parse(localStorage.getItem(SETUP_KEY) ?? '{}') };
  } catch {
    return { color: 'w', level: 2, tc: '15+10' };
  }
}

export default function Play({ route }: { route: Route }) {
  if (route.parts[0] === 'practice') {
    const pos = route.parts[1] ? practiceById(route.parts[1]) : undefined;
    if (pos) return <PracticeRun key={pos.id} pos={pos} back={route.query.get('back') ?? 'play/practice'} />;
    return <PracticeList />;
  }
  return <PlaySetup />;
}

function PracticeRun({ pos, back }: { pos: PracticePosition; back: string }) {
  const [attempt, setAttempt] = useState(0);
  return (
    <GameView
      key={attempt}
      me={pos.me}
      level={PRACTICE_LEVEL}
      tc={NO_CLOCK}
      practice={pos}
      onExit={() => navigate(back)}
      onRematch={() => setAttempt((a) => a + 1)}
    />
  );
}

/**
 * A practice position played right inside a lesson. The board is static until the student presses start,
 * so several of these can sit on one page without the engine moving on all of them.
 */
export function PracticeInline({ pos }: { pos: PracticePosition }) {
  const [attempt, setAttempt] = useState(0);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(() => !!loadPracticeDone()[pos.id]);
  if (!started) {
    const c = new Chess(pos.fen);
    return (
      <div>
        <Board
          fen={pos.fen}
          orientation={pos.me === 'w' ? 'white' : 'black'}
          turnColor={c.turn() === 'w' ? 'white' : 'black'}
          check={kingInCheckColor(c)}
          viewOnly
        />
        <div className="row mt">
          <Button kind="primary" onClick={() => setStarted(true)}>
            {done ? 'Đánh lại với máy' : 'Bắt đầu đánh với máy'}
          </Button>
          {done && <span className="tag tag-good">✓ đã đạt</span>}
        </div>
      </div>
    );
  }
  return (
    <GameView
      key={attempt}
      me={pos.me}
      level={PRACTICE_LEVEL}
      tc={NO_CLOCK}
      practice={pos}
      embedded
      onExit={() => {
        setDone(!!loadPracticeDone()[pos.id]);
        setStarted(false);
      }}
      onRematch={() => setAttempt((a) => a + 1)}
    />
  );
}

function PracticeList() {
  const done = loadPracticeDone();
  const groups = [...new Set(PRACTICE.map((p) => p.group))];
  return (
    <div>
      <div className="topbar">
        <button className="back" onClick={() => navigate('play')} aria-label="Quay lại">
          ‹
        </button>
        <h2 style={{ margin: 0 }}>Luyện cờ tàn với máy</h2>
      </div>
      <p className="small muted">
        Biết lý thuyết chưa đủ: phải tự tay đánh thắng (hoặc thủ hòa) trước một đối thủ không đi sai. Máy chơi hết sức. Bạn được đi lại bao nhiêu lần tùy ý.
      </p>
      {groups.map((g) => (
        <Card key={g}>
          <h3>{g}</h3>
          {PRACTICE.filter((p) => p.group === g).map((p) => (
            <div key={p.id} className="list-item" onClick={() => navigate(`play/practice/${p.id}`)}>
              <span>
                <b>{p.title}</b>
                <div className="small muted">
                  {p.goal === 'draw' ? 'Mục tiêu: thủ hòa' : p.goal === 'mate' ? 'Mục tiêu: chiếu hết' : 'Mục tiêu: phong Hậu hoặc thắng quân'} · {'★'.repeat(p.level)}
                </div>
              </span>
              <span className={`tag ${done[p.id] ? 'tag-good' : 'tag-default'}`}>{done[p.id] ? '✓ đã đạt' : p.me === 'w' ? 'cầm Trắng' : 'cầm Đen'}</span>
            </div>
          ))}
        </Card>
      ))}
    </div>
  );
}

function PlaySetup() {
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
      <Card onClick={() => navigate('play/practice')}>
        <div className="row-between">
          <div>
            <b>Luyện cờ tàn với máy</b>
            <div className="small muted">Chiếu hết cơ bản, cờ tàn Tốt, Lucena, Philidor: đánh tiếp từ thế cờ mẫu.</div>
          </div>
          <span className="muted">›</span>
        </div>
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
  practice,
  embedded,
}: {
  me: 'w' | 'b';
  level: Level;
  tc: TimeControl;
  onExit: () => void;
  onRematch: () => void;
  /** endgame practice: start from this position with a goal instead of a normal game */
  practice?: PracticePosition;
  /** shown inside a lesson: no page header, no link to the practice list */
  embedded?: boolean;
}) {
  const startFen = practice?.fen;
  /** a practice position where Black moves first: shift the move list by one cell */
  const listOffset = startFen?.split(' ')[1] === 'b' ? 1 : 0;
  const chessRef = useRef(new Chess(startFen));
  const chess = chessRef.current;
  /** practice only: the goal was reached / the engine thinks the goal has slipped away */
  const [goalMet, setGoalMet] = useState(false);
  const [slipped, setSlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
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
  const finish = useCallback(
    (result: string, reason: string, reached?: boolean) => {
      setOver((o) => o ?? { result, reason });
      if (practice) {
        const drawn = result === '1/2-1/2';
        const won = (result === '1-0') === (me === 'w') && !drawn;
        const ok = reached ?? (practice.goal === 'draw' ? drawn || won : won);
        if (ok) {
          setGoalMet(true);
          markPracticeDone(practice.id);
        }
      }
      if (!logged.current) {
        logged.current = true;
        logActivity('games');
      }
    },
    [practice, me],
  );

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
      if (practice) await engine.fullStrength();
      else await applyLevel(engine, level);
      const res = await engine.evaluate(chess.fen(), { depth: level.depth, movetime: level.movetime });
      if (cancelled) return;
      if (practice) {
        // engine's own verdict (its point of view) tells whether the goal is still within reach
        const l = res.lines[0];
        const engineCp = l ? (l.mate !== undefined ? (l.mate > 0 ? 10000 : -10000) : (l.cp ?? 0)) : 0;
        setSlipped(practice.goal === 'draw' ? engineCp >= 250 : engineCp > -150);
        const myMoves = Math.ceil(chess.history().length / 2);
        if (practice.goal === 'draw' && practice.hold && myMoves >= practice.hold && engineCp < 150) {
          finish('1/2-1/2', `Bạn đã giữ vững ${practice.hold} nước, máy không tìm ra đường thắng.`, true);
          setThinking(false);
          return;
        }
      }
      // a tiny human-like delay on the lowest levels so moves don't feel instant
      await new Promise((r) => setTimeout(r, 250));
      if (cancelled) return;
      if (res.bestmove && res.bestmove !== '(none)') {
        const mover = chess.turn();
        if (playUci(chess, res.bestmove)) {
          afterMove(mover);
          if (practice?.goal === 'win' && !chess.isGameOver()) {
            // decisive material after the engine's reply: a safe new queen, or a bare king against a rook or more
            let mine = 0;
            let theirs = 0;
            let queen = false;
            for (const row of chess.board())
              for (const sq of row) {
                if (!sq) continue;
                if (sq.color === me) {
                  mine += PIECE_VAL[sq.type];
                  if (sq.type === 'q') queen = true;
                } else theirs += PIECE_VAL[sq.type];
              }
            if ((queen && mine - theirs >= 4) || (theirs === 0 && mine >= 5))
              finish(me === 'w' ? '1-0' : '0-1', 'Bạn đã có ưu thế quyết định. Phần còn lại là chiếu hết cơ bản.', true);
          }
        }
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
    const c = new Chess(startFen);
    const h = chess.history();
    for (let i = 0; i <= viewPly && i < h.length; i++) c.move(h[i]);
    return c;
  }, [chess, viewPly, version, startFen]);
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
    setSlipped(false);
    setViewPly(null);
    setVersion((v) => v + 1);
  };

  const myName = 'Bạn';
  const botName = practice ? 'Stockfish · hết sức' : `Stockfish · cấp ${level.n} (${level.elo})`;
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

  const resultText = practice && over
    ? goalMet
      ? 'Đạt mục tiêu!'
      : 'Chưa đạt mục tiêu'
    : over
    ? over.result === '1/2-1/2'
      ? 'Hòa'
      : (over.result === '1-0') === (me === 'w')
        ? 'Bạn thắng!'
        : 'Bạn thua'
    : '';

  return (
    <div>
      {!embedded && (
        <div className="topbar">
          <button className="back" onClick={onExit} aria-label="Quay lại">
            ‹
          </button>
          <h2 style={{ margin: 0 }}>{practice ? practice.title : 'Ván đấu'}</h2>
        </div>
      )}
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
          {practice && !over && (
            <Card>
              <div className="tiny muted">{practice.goal === 'draw' ? 'MỤC TIÊU: THỦ HÒA' : practice.goal === 'mate' ? 'MỤC TIÊU: CHIẾU HẾT' : 'MỤC TIÊU: PHONG HẬU HOẶC THẮNG QUÂN'}</div>
              {!embedded && <p className="small" style={{ margin: '4px 0' }}>{practice.brief}</p>}
              {showHint ? (
                <div className="explain">{practice.hint}</div>
              ) : (
                <button className="chip" onClick={() => setShowHint(true)}>
                  Xem phương pháp
                </button>
              )}
              {slipped && (
                <div className="feedback bad small">
                  {practice.goal === 'draw' ? 'Máy đánh giá thế này đối phương đã thắng được.' : 'Máy đánh giá thế này không còn thắng được nữa.'} Bấm “Đi lại” để thử nước khác.
                </div>
              )}
            </Card>
          )}
          {over && practice && (
            <Card>
              <h3>{resultText}</h3>
              <p className="muted small">{over.reason}</p>
              {!goalMet && <div className="explain">{practice.hint}</div>}
              <div className="row mt">
                <Button kind="primary" onClick={onRematch}>
                  {goalMet ? 'Đánh lại lần nữa' : 'Thử lại'}
                </Button>
                <Button onClick={onExit}>{embedded ? 'Đóng' : 'Quay lại'}</Button>
                {!embedded && (
                  <Button kind="ghost" onClick={() => navigate('play/practice')}>
                    Thế khác
                  </Button>
                )}
              </div>
            </Card>
          )}
          {over && !practice && (
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
            <MoveList
              moves={listOffset ? ['…', ...history] : history}
              current={(viewPly ?? moveCount - 1) + listOffset}
              onSelect={(p) => setViewPly(p - listOffset === moveCount - 1 ? null : Math.max(-1, p - listOffset))}
            />
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
                  {practice ? (
                    <Button kind="ghost" onClick={onRematch}>
                      Làm lại từ đầu
                    </Button>
                  ) : (
                    <Button kind="danger" onClick={resign}>
                      Xin thua
                    </Button>
                  )}
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

