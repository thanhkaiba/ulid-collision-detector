import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Chess, type Square } from 'chess.js';
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
import { PRACTICE, practiceById, loadPracticeDone, markPracticeDone, swapPractice, type PracticePosition } from '../data/practice';
import { METHODS } from '../data/practiceMethods';
import MethodDemo from '../components/MethodDemo';

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

/** The game in progress against the engine, kept so leaving the tab or reloading does not lose it. */
type CurrentGame = {
  me: 'w' | 'b';
  level: number;
  tc: string;
  moves: string[];
  clock: { w: number; b: number };
  startedAt: number;
  /** the daily-plan "played" credit was already given for this game */
  played?: boolean;
};
const CURRENT_KEY = 'play-current';

function loadCurrent(): CurrentGame | null {
  try {
    const g = JSON.parse(localStorage.getItem(CURRENT_KEY) ?? 'null');
    if (!g || (g.me !== 'w' && g.me !== 'b') || !Array.isArray(g.moves) || g.moves.length === 0) return null;
    if (typeof g.level !== 'number' || typeof g.tc !== 'string' || !g.clock || typeof g.clock.w !== 'number' || typeof g.clock.b !== 'number') return null;
    // an old or damaged save whose moves do not replay is dropped rather than resumed half-way
    const c = new Chess();
    for (const m of g.moves) c.move(m);
    return g;
  } catch {
    return null;
  }
}
function saveCurrent(g: CurrentGame | null) {
  try {
    if (g) localStorage.setItem(CURRENT_KEY, JSON.stringify(g));
    else localStorage.removeItem(CURRENT_KEY);
  } catch {
    /* ignore */
  }
}

/** The endgame practice in progress (one at a time), so leaving the page or reloading does not lose the moves. */
type CurrentPractice = { id: string; swapped: boolean; moves: string[] };
const PRACTICE_CURRENT_KEY = 'practice-current';
function loadPracticeCurrent(id: string): CurrentPractice | null {
  try {
    const g = JSON.parse(localStorage.getItem(PRACTICE_CURRENT_KEY) ?? 'null');
    return g && g.id === id && Array.isArray(g.moves) && g.moves.length > 0 ? g : null;
  } catch {
    return null;
  }
}
function savePracticeCurrent(id: string, g: CurrentPractice | null) {
  try {
    if (g) localStorage.setItem(PRACTICE_CURRENT_KEY, JSON.stringify(g));
    // only forget the stored attempt if it belongs to this position
    else if (loadPracticeCurrent(id)) localStorage.removeItem(PRACTICE_CURRENT_KEY);
  } catch {
    /* ignore */
  }
}

/** Only a bare king, or a king with a single minor piece: cannot checkmate (so the opponent's flag fall is a draw). */
function cannotMate(chess: Chess, side: 'w' | 'b'): boolean {
  const pcs = chess.board().flat().filter((p) => p && p.color === side && p.type !== 'k');
  return pcs.length === 0 || (pcs.length === 1 && (pcs[0]!.type === 'n' || pcs[0]!.type === 'b'));
}

/**
 * Legal destinations, plus the rook's square for each legal castling, so the king can also be dropped onto its rook
 * (chessground then castles on the board; onMove maps the move back to the king's real target square).
 */
function destsWithRookCastle(chess: Chess): Map<Key, Key[]> {
  const dests = toDests(chess);
  for (const m of chess.moves({ verbose: true })) {
    if (!m.flags.includes('k') && !m.flags.includes('q')) continue;
    const rook = ((m.flags.includes('k') ? 'h' : 'a') + m.from[1]) as Key;
    const arr = dests.get(m.from as Key) ?? [];
    if (!arr.includes(rook)) dests.set(m.from as Key, [...arr, rook]);
  }
  return dests;
}

export default function Play({ route }: { route: Route }) {
  if (route.parts[0] === 'practice') {
    const pos = route.parts[1] ? practiceById(route.parts[1]) : undefined;
    if (pos) return <PracticeRun key={pos.id} pos={pos} back={route.query.get('back') ?? 'play/practice'} />;
    return <PracticeList />;
  }
  return <PlaySetup />;
}

/** Choose which side of a practice position to play: apply the technique, or face it. */
function SideSwitch({ pos, swap, onChange }: { pos: PracticePosition; swap: boolean; onChange: (v: boolean) => void }) {
  const labels = pos.goal === 'draw' ? ['Thủ hòa (đúng bài)', 'Đổi bên: thử thắng máy'] : ['Áp dụng kỹ thuật', 'Đổi bên: thử chạy trốn'];
  return (
    <div className="side-switch">
      <Seg
        value={swap ? 'b' : 'a'}
        onChange={(v) => onChange(v === 'b')}
        options={[
          { value: 'a', label: labels[0] },
          { value: 'b', label: labels[1] },
        ]}
      />
    </div>
  );
}

function PracticeRun({ pos, back }: { pos: PracticePosition; back: string }) {
  const [attempt, setAttempt] = useState(0);
  // an attempt left unfinished (page left or reloaded) carries on where it was
  const [saved, setSaved] = useState(() => loadPracticeCurrent(pos.id));
  const [swap, setSwap] = useState(() => !!saved?.swapped);
  const shown = swap ? swapPractice(pos) : pos;
  return (
    <>
      <GameView
        key={`${attempt}-${swap}`}
        resumeMoves={saved?.moves}
        me={shown.me}
        level={PRACTICE_LEVEL}
        tc={NO_CLOCK}
        practice={shown}
        onExit={() => navigate(back)}
        onRematch={() => {
          setSaved(null);
          setAttempt((a) => a + 1);
        }}
        switcher={
          <SideSwitch
            pos={pos}
            swap={swap}
            onChange={(v) => {
              setSaved(null);
              setSwap(v);
            }}
          />
        }
        otherLink={back !== 'play/practice'}
      />
    </>
  );
}

/** Steps of the method plus the animated model solution, in a sheet over the game. */
function MethodSheet({ pos: shownPos, onClose }: { pos: PracticePosition; onClose: () => void }) {
  const pos = practiceById(shownPos.id) ?? shownPos;
  const method = METHODS[pos.id];
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet method-sheet" onClick={(e) => e.stopPropagation()}>
        {/* stays on top while the long sheet is scrolled, so "Đóng" is always at hand */}
        <div className="row-between mb" style={{ position: 'sticky', top: -14, zIndex: 5, background: 'var(--bg-2)', padding: '14px 0 6px', marginTop: -14 }}>
          <b>{pos.title}</b>
          <button className="chip" onClick={onClose}>
            Đóng
          </button>
        </div>
        {method ? (
          <>
            <div className="tiny muted">CÁCH LÀM</div>
            <ol className="method-steps">
              {method.steps.map((s, k) => (
                <li key={k}>{s}</li>
              ))}
            </ol>
            <div className="tiny muted mt">LỜI GIẢI MẪU (HÌNH ĐỘNG)</div>
            <MethodDemo pos={pos} method={method} />
            <p className="tiny muted" style={{ margin: '8px 0 0' }}>
              Máy đánh với bạn có thể đi khác lời giải mẫu. Hãy làm theo cách làm ở trên, không cần nhớ từng nước.
            </p>
          </>
        ) : (
          <p className="small">{pos.hint}</p>
        )}
      </div>
    </div>
  );
}

/** A practice position played right inside a lesson slide: the game starts as soon as the slide is shown. */
export function PracticeInline({ pos, onGoal }: { pos: PracticePosition; onGoal?: () => void }) {
  const [attempt, setAttempt] = useState(0);
  const [saved, setSaved] = useState(() => loadPracticeCurrent(pos.id));
  const [swap, setSwap] = useState(() => !!saved?.swapped);
  const shown = swap ? swapPractice(pos) : pos;
  return (
    <GameView
      key={`${attempt}-${swap}`}
      resumeMoves={saved?.moves}
      me={shown.me}
      level={PRACTICE_LEVEL}
      tc={NO_CLOCK}
      practice={shown}
      switcher={
        <SideSwitch
          pos={pos}
          swap={swap}
          onChange={(v) => {
            setSaved(null);
            setSwap(v);
          }}
        />
      }
      embedded
      onGoal={onGoal}
      onExit={() => setAttempt((a) => a + 1)}
      onRematch={() => {
        setSaved(null);
        setAttempt((a) => a + 1);
      }}
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
  type Game = { me: 'w' | 'b'; level: Level; tc: TimeControl; resume?: CurrentGame; n: number };
  const fromCurrent = (c: CurrentGame, n: number): Game => ({
    me: c.me,
    level: LEVELS.find((l) => l.n === c.level) ?? LEVELS[1],
    tc: TIME_CONTROLS.find((t) => t.id === c.tc) ?? TIME_CONTROLS[0],
    resume: c,
    n,
  });
  // coming back to the tab (or reloading) brings back the game in progress
  const [game, setGame] = useState<Game | null>(() => {
    const c = loadCurrent();
    return c ? fromCurrent(c, 0) : null;
  });

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
        key={game.n}
        me={game.me}
        level={game.level}
        tc={game.tc}
        resume={game.resume}
        onExit={() => setGame(null)}
        onRematch={() =>
          setGame({ me: setup.color === 'random' ? (Math.random() < 0.5 ? 'w' : 'b') : game.me, level: game.level, tc: game.tc, n: game.n + 1 })
        }
      />
    );
  }

  const level = LEVELS.find((l) => l.n === setup.level) ?? LEVELS[3];
  const current = loadCurrent();
  return (
    <div>
      <h1>Chơi với máy</h1>
      {current && (
        <Card>
          <b>Ván đang chơi dở</b>
          <div className="small muted">
            Bạn cầm {current.me === 'w' ? 'Trắng' : 'Đen'} · cấp {current.level} ·{' '}
            {TIME_CONTROLS.find((t) => t.id === current.tc)?.label ?? 'Không giờ'} · đã đi {Math.ceil(current.moves.length / 2)} nước
          </div>
          <div className="row mt">
            <Button kind="primary" onClick={() => setGame(fromCurrent(current, Date.now()))}>
              Tiếp tục ván này
            </Button>
          </div>
        </Card>
      )}
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
        kind={current ? 'default' : 'primary'}
        className="grow"
        onClick={() => {
          saveCurrent(null);
          setGame({
            me: setup.color === 'random' ? (Math.random() < 0.5 ? 'w' : 'b') : setup.color,
            level,
            tc: TIME_CONTROLS.find((t) => t.id === setup.tc) ?? TIME_CONTROLS[0],
            n: Date.now(),
          });
        }}
      >
        {current ? 'Bắt đầu ván mới (bỏ ván dở)' : 'Bắt đầu ván mới'}
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
  onGoal,
  switcher,
  resume,
  resumeMoves,
  otherLink,
}: {
  /** practice: moves of an unfinished attempt to carry on */
  resumeMoves?: string[];
  /** a game in progress to carry on (normal games only) */
  resume?: CurrentGame;
  /** practice: also offer a link to the practice list (when "back" leads elsewhere) */
  otherLink?: boolean;
  me: 'w' | 'b';
  level: Level;
  tc: TimeControl;
  onExit: () => void;
  onRematch: () => void;
  /** endgame practice: start from this position with a goal instead of a normal game */
  practice?: PracticePosition;
  /** shown inside a lesson: no page header, no link to the practice list */
  embedded?: boolean;
  /** practice: called when the goal is reached */
  onGoal?: () => void;
  /** practice: control shown above the board to change sides */
  switcher?: ReactNode;
}) {
  const startFen = practice?.fen;
  /** a practice position where Black moves first: shift the move list by one cell */
  const listOffset = startFen?.split(' ')[1] === 'b' ? 1 : 0;
  const chessRef = useRef<Chess | null>(null);
  if (!chessRef.current) {
    const c = new Chess(startFen);
    const replay = practice ? resumeMoves : resume?.moves;
    if (replay)
      for (const san of replay) {
        try {
          c.move(san);
        } catch {
          break;
        }
      }
    chessRef.current = c;
  }
  const chess = chessRef.current;
  /** practice only: the goal was reached / the engine thinks the goal has slipped away */
  const [goalMet, setGoalMet] = useState(false);
  const [slipped, setSlipped] = useState(false);
  /** practice: the engine's verdict per position (by number of moves played), so a takeback shows the right warning */
  const slippedAt = useRef(new Map<number, boolean>());
  const [showHint, setShowHint] = useState(false);
  /** practice: mate distance the engine sees for itself (shown when the student faces the technique) */
  const [engineMate, setEngineMate] = useState<number | null>(null);
  const [version, setVersion] = useState(0);
  const [pending, setPending] = useState<{ from: Key; to: Key } | null>(null);
  const [clock, setClock] = useState(() => (resume && !practice ? resume.clock : { w: tc.initial * 1000, b: tc.initial * 1000 }));
  const [over, setOver] = useState<{ result: string; reason: string } | null>(null);
  const [thinking, setThinking] = useState(false);
  const [viewPly, setViewPly] = useState<number | null>(null); // null = live
  const [confirmResign, setConfirmResign] = useState(false);
  const savedId = useRef<string | null>(null);
  const lastTick = useRef<number>(0);
  const startedAt = useRef(resume && !practice ? resume.startedAt : Date.now());
  /** the daily-plan credit for playing a game was given (once per game) */
  const played = useRef(!!(resume && !practice && resume.played));
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
          // the swapped side is an experiment: it does not count as passing the exercise
          if (!practice.swapped) {
            markPracticeDone(practice.id);
            onGoal?.();
          }
        }
      }
      // a game resigned before any move was played is not a game played today (no streak credit)
      if (!logged.current && (chess.history().length >= 2 || chess.isGameOver())) {
        logged.current = true;
        logActivity('games');
        // the daily "play one game" goal needs a real game from the start: not endgame practice, and not a game
        // resigned, abandoned or lost on time in the first few moves. A game ended on the board (mate, draw) counts;
        // otherwise 10 moves each are needed (see countPlayed).
        if (!practice && !played.current && chess.isGameOver()) {
          played.current = true;
          logActivity('played');
        }
      }
    },
    [practice, me, onGoal, chess],
  );

  /** The daily plan counts a game once 10 moves each are played, even if it is left unfinished. */
  const countPlayed = () => {
    if (practice || played.current || chess.history().length < 20) return;
    played.current = true;
    logActivity('played');
  };

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
          const who = side === me ? 'Bạn hết giờ' : 'Máy hết giờ';
          // out of time against a side that cannot mate is a draw (FIDE rule)
          if (cannotMate(chess, side === 'w' ? 'b' : 'w')) finish('1/2-1/2', `${who}, nhưng bên kia không đủ quân để chiếu hết nên hòa`);
          else finish(side === 'w' ? '0-1' : '1-0', who);
        }
        return next;
      });
    }, 100);
    return () => clearInterval(id);
  }, [chess, moveCount, over, tc.initial, me, finish]);

  const afterMove = useCallback(
    (mover: 'w' | 'b') => {
      // the increment is earned once the mover's clock has been running: from each side's second move on (the clocks
      // start after both first moves), so White and Black get the same bonus
      if (tc.initial > 0 && moveCount >= 2) setClock((c) => ({ ...c, [mover]: c[mover] + tc.inc * 1000 }));
      setVersion((v) => v + 1);
      setViewPly(null);
      countPlayed();
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
      // left, restarted or the game ended meanwhile: do not start a search nobody waits for (it would delay the next one)
      if (cancelled) return;
      const res = await engine.evaluate(chess.fen(), { depth: level.depth, movetime: level.movetime });
      if (cancelled) return;
      if (practice) {
        // engine's own verdict (its point of view) tells whether the goal is still within reach
        const l = res.lines[0];
        const engineCp = l ? (l.mate !== undefined ? (l.mate > 0 ? 10000 : -10000) : (l.cp ?? 0)) : 0;
        setEngineMate(l?.mate !== undefined && l.mate > 0 ? l.mate : null);
        // in the swapped role the engine is expected to stay ahead: no "you slipped" warning there
        const sl = practice.swapped ? false : practice.goal === 'draw' ? engineCp >= 250 : engineCp > -150;
        slippedAt.current.set(chess.history().length, sl);
        setSlipped(sl);
        const myMoves = Math.ceil(chess.history().length / 2);
        if (practice.goal === 'win' && practice.hold && myMoves >= practice.hold && engineCp > -150) {
          finish('1/2-1/2', `Sau ${practice.hold} nước bạn vẫn chưa thắng được: máy giữ vững thế hòa.`, false);
          setThinking(false);
          return;
        }
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
            // (or a whole rook up, e.g. after promoting to a Rook in the Lucena: two Rooks against one)
            if ((queen && mine - theirs >= 4) || (theirs === 0 && mine >= 5) || mine - theirs >= 5)
              finish(me === 'w' ? '1-0' : '0-1', 'Bạn đã có ưu thế quyết định. Phần còn lại là chiếu hết cơ bản.', true);
          }
          if (practice?.swapped && practice.goal === 'draw' && !chess.isGameOver()) {
            // facing a winning technique: stop once the engine has queened with a decisive lead
            let mine = 0;
            let theirs = 0;
            let queen = false;
            for (const row of chess.board())
              for (const sq of row) {
                if (!sq) continue;
                if (sq.color === me) mine += PIECE_VAL[sq.type];
                else {
                  theirs += PIECE_VAL[sq.type];
                  if (sq.type === 'q') queen = true;
                }
              }
            // only for positions where the engine has to promote (pawn and rook endings): in the basic mates
            // (queen, queen against a pawn) the engine has its queen from the start
            if (queen && theirs - mine >= 4 && practiceById(practice.id)?.goal === 'win') finish(me === 'w' ? '0-1' : '1-0', 'Máy đã phong Hậu, phần còn lại chỉ là chiếu hết.', false);
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

  // the game ended while the engine was thinking (resigned, flag fell): stop its search
  useEffect(() => {
    if (!over) return;
    engine.stop();
    setThinking(false);
  }, [over, engine]);

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
    // the king dropped onto its own rook: castle (the king's real target is the g- or c-file)
    const piece = chess.get(from as Square);
    const target = chess.get(to as Square);
    if (piece?.type === 'k' && target?.type === 'r' && target.color === piece.color)
      to = ((to[0] === 'h' ? 'g' : 'c') + to[1]) as Key;
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
    if (savedId.current) return savedId.current;
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
    savedId.current = id;
    await upsertGames([g]);
    return id;
  };

  // normal games: keep the game in progress (moves, clocks) so leaving the tab or reloading does not lose it;
  // a finished game goes to the list in the Analyze tab
  const clockRef = useRef(clock);
  clockRef.current = clock;
  const snapshot = (): CurrentGame => ({
    me,
    level: level.n,
    tc: tc.id,
    moves: chess.history(),
    clock: clockRef.current,
    startedAt: startedAt.current,
    played: played.current,
  });
  const keep = useRef<() => CurrentGame | null>(snapshot);
  keep.current = () => (over || chess.history().length === 0 ? null : snapshot());
  useEffect(() => {
    if (!practice) return;
    const moves = chess.history();
    savePracticeCurrent(practice.id, over || moves.length === 0 ? null : { id: practice.id, swapped: !!practice.swapped, moves });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version, over]);
  useEffect(() => {
    if (practice) return;
    if (over) {
      saveCurrent(null);
      if (chess.history().length >= 2) saveGame();
      return;
    }
    // no move left (e.g. everything taken back): forget the stored game, or a reload would bring back the old moves
    saveCurrent(keep.current());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version, over]);
  useEffect(() => {
    if (practice) return;
    // leaving the page: store the clocks as they are now
    const save = () => {
      const s = keep.current();
      if (s) saveCurrent(s);
    };
    window.addEventListener('pagehide', save);
    return () => {
      window.removeEventListener('pagehide', save);
      save();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resign = () => finish(me === 'w' ? '0-1' : '1-0', 'Bạn xin thua');

  /**
   * Take back your last move (and the computer's reply, if it made one). No limit.
   * In endgame practice it also works after a failed attempt (e.g. the pawn was lost), so the student can try another move.
   */
  const undoPlies = chess.turn() === me ? 2 : 1;
  const canTakeback =
    !thinking &&
    chess.history().length >= undoPlies &&
    (over ? !!practice && !goalMet : chess.turn() === me);
  const takeback = () => {
    if (!canTakeback) return;
    for (let i = 0; i < undoPlies; i++) chess.undo();
    setOver(null);
    // back on your move: the warning is the engine's verdict on the position after your previous move (if it was wrong
    // already then, taking back one move is not enough)
    setSlipped(slippedAt.current.get(chess.history().length - 1) ?? false);
    setViewPly(null);
    setConfirmResign(false);
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
    ? practice.swapped
      ? practice.goal === 'draw'
        ? goalMet
          ? 'Bạn đã thoát được!'
          : 'Không thoát được'
        : goalMet
          ? 'Bạn đã thắng máy!'
          : 'Máy giữ được hòa'
      : goalMet
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
      {practice && switcher}
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
            dests={live ? destsWithRookCastle(chess) : new Map()}
            onMove={onMove}
          />
          {bar(bottom)}
        </div>
        <div>
          {practice && !over && (
            <Card>
              <div className="tiny muted">
                {practice.swapped
                  ? practice.goal === 'draw'
                    ? 'THỬ THÁCH: THOÁT KHỎI THẾ THUA'
                    : 'THỬ THÁCH: THẮNG MÁY'
                  : practice.goal === 'draw'
                    ? 'MỤC TIÊU: THỦ HÒA'
                    : practice.goal === 'mate'
                      ? 'MỤC TIÊU: CHIẾU HẾT'
                      : 'MỤC TIÊU: PHONG HẬU HOẶC THẮNG QUÂN'}
              </div>
              {(!embedded || practice.swapped) && <p className="small" style={{ margin: '4px 0' }}>{practice.brief}</p>}
              {practice.swapped && engineMate !== null && (
                <div className="feedback info small">Máy thấy chiếu hết bạn sau {engineMate} nước. Đi khéo thì con số này giảm chậm hơn, nhưng không thoát được.</div>
              )}
              <Button kind="default" className="mt" onClick={() => setShowHint(true)}>
                ▶ Cách làm và lời giải mẫu
              </Button>
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
              <p className="muted small">
                {!goalMet && over.reason === 'Không đủ quân chiếu hết'
                  ? 'Hòa: bên tấn công không còn đủ quân để chiếu hết (Tốt hoặc quân chính đã bị bắt).'
                  : !goalMet && over.reason === 'Hết nước đi (pat)'
                    ? 'Hòa pat: Vua bị dồn không còn nước đi nhưng không bị chiếu.'
                    : over.reason}
              </p>
              {practice.swapped && !goalMet && (
                <p className="small">
                  {practice.goal === 'draw'
                    ? 'Đúng như lý thuyết: khi bên tấn công đi đúng kỹ thuật thì bên phòng thủ không thoát được, đi kiểu gì cũng vậy. Hòa chỉ xảy ra khi bên tấn công đi sai: để mất quân, hoặc dồn Vua hết nước đi mà không chiếu (pat).'
                    : 'Đúng như lý thuyết: bên phòng thủ đi đúng thì thế này hòa, dù bên tấn công thử cách nào.'}
                </p>
              )}
              {!goalMet && (
                <Button kind="default" onClick={() => setShowHint(true)}>
                  ▶ Xem cách làm và lời giải mẫu
                </Button>
              )}
              <div className="row mt">
                {canTakeback && (
                  <Button kind="primary" onClick={takeback}>
                    ↶ Đi lại nước vừa rồi
                  </Button>
                )}
                <Button kind={canTakeback ? 'default' : 'primary'} onClick={onRematch}>
                  {goalMet ? 'Đánh lại lần nữa' : 'Làm lại từ đầu'}
                </Button>
                {!embedded && <Button onClick={onExit}>{otherLink ? 'Quay lại' : 'Chọn thế khác'}</Button>}
                {!embedded && otherLink && (
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
              <p className="muted small">
                {over.reason}
                {moveCount >= 2 && '. Ván đã được lưu ở tab Phân tích.'}
              </p>
              <div className="row">
                {moveCount >= 2 && (
                  <Button
                    kind="primary"
                    onClick={async () => {
                      const id = await saveGame();
                      navigate(`analyze/game/${id}`);
                    }}
                  >
                    Phân tích ván này
                  </Button>
                )}
                <Button kind={moveCount >= 2 ? 'default' : 'primary'} onClick={onRematch}>
                  Ván mới
                </Button>
              </div>
            </Card>
          )}
          <Card>
            <MoveList
              moves={listOffset ? ['…', ...history] : history}
              current={(viewPly ?? moveCount - 1) + listOffset}
              onSelect={(p) => setViewPly(p - listOffset === moveCount - 1 ? null : Math.max(-1, p - listOffset))}
            />
            {!live && (
              <div className="row-between small mt">
                <span className="muted">Đang xem lại nước cũ{!over ? ', ván vẫn chờ bạn' : ''}.</span>
                <Button kind="ghost" onClick={() => setViewPly(null)}>
                  Về nước mới nhất
                </Button>
              </div>
            )}
            {confirmResign && !over ? (
              <div className="row mt">
                <span className="small grow">Bạn chắc chắn muốn xin thua?</span>
                <Button kind="danger" onClick={resign}>
                  Xin thua
                </Button>
                <Button onClick={() => setConfirmResign(false)}>Đánh tiếp</Button>
              </div>
            ) : (
              <div className="row mt">
                <Button kind="ghost" onClick={() => setViewPly(Math.max(-1, (viewPly ?? moveCount - 1) - 1))} disabled={moveCount === 0 || viewPly === -1}>
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
                      <Button kind="danger" onClick={() => setConfirmResign(true)}>
                        Xin thua
                      </Button>
                    )}
                  </>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
      {practice && showHint && <MethodSheet pos={practice} onClose={() => setShowHint(false)} />}
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

