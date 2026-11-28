import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Chess, type Square } from 'chess.js';
import type { Key, Color } from 'chessground/types';
import type { DrawShape } from 'chessground/draw';
import Board from './Board';
import PromotionPicker from './PromotionPicker';
import { Button } from './ui';
import { getEngine } from '../lib/engine';
import { withTimeout } from '../lib/judge';
import { playUci, toDests, turnColor, kingInCheckColor, needsPromotion, uciLineToSan } from '../lib/chess-utils';

/** how long to wait for the engine (judging a move, answering for the opponent) before giving up */
const ENGINE_MS = 25000;

/**
 * clean: solved first try without hints. solved: solved by the student after a mistake or a square hint.
 * shown: finished, but the move was handed over (arrow hint or "show solution").
 */
export type PuzzleOutcome = 'clean' | 'solved' | 'shown';
export type PuzzleStatus = 'intro' | 'solving' | 'checking' | 'wrong' | 'solved' | 'revealed' | 'unmet';

export interface PuzzleBoardProps {
  fen: string;
  /** solution line in UCI. If !playerFirst, moves[0] is the opponent's move played automatically. */
  moves: string[];
  playerFirst?: boolean;
  /**
   * extra accepted first moves for the player (UCI). An entry may be a whole line ("e6f6 e8f8 e5e6 ..."): the puzzle then
   * continues along it. A single move that leaves a longer scripted line behind ends the puzzle as solved, since the
   * scripted replies no longer fit the position.
   */
  alternatives?: string[];
  /** called exactly once when the puzzle is finished: ok=false if the user failed or revealed */
  /** `fen`: the board when the puzzle ended (before a revealed solution is played out) */
  onFinish?: (ok: boolean, how: PuzzleOutcome, fen: string) => void;
  /** called on every wrong attempt with the running count */
  onWrong?: (count: number) => void;
  /** a hint was shown (the solve no longer counts as clean) */
  onHint?: () => void;
  prompt?: string;
  showControls?: boolean;
  /** when the key changes, the puzzle resets */
  resetKey?: string;
  /**
   * Optional second opinion for a move that is not in the solution (e.g. another move that is just as good).
   * Resolve true to accept it.
   */
  judge?: (uci: string, fenBefore: string) => Promise<boolean>;
  /** with judge: the task is to mate, so a free continuation only ends at mate */
  mateGoal?: boolean;
  /** show the opponent's best reply to a wrong move (needs the engine). Default true. */
  refute?: boolean;
  /** the solver already went wrong on this puzzle earlier (e.g. before a reload): a solve is not "Chính xác!" */
  failedBefore?: boolean;
}

export default function PuzzleBoard(props: PuzzleBoardProps) {
  const { fen, playerFirst, alternatives } = props;
  /** the line being followed: the main solution, or an alternative line the solver chose */
  const alt = useRef<string[] | null>(null);
  /** set once Stockfish has taken over the opponent's side (see playFree) */
  const free = useRef<{ target: number; mate: boolean; pawnGoal: number } | null>(null);
  const lineNow = () => alt.current ?? props.moves;
  const moves = lineNow();
  const chessRef = useRef(new Chess(fen));
  const [, setVersion] = useState(0);
  const bump = () => setVersion((v) => v + 1);
  const [idx, setIdx] = useState(0); // index in moves of the next expected move
  const [status, setStatus] = useState<PuzzleStatus>('intro');
  const [failed, setFailed] = useState(false);
  const [pending, setPending] = useState<{ from: Key; to: Key } | null>(null);
  const [shapes, setShapes] = useState<DrawShape[]>([]);
  const [hintLevel, setHintLevel] = useState(0);
  const [lastMove, setLastMove] = useState<Key[] | undefined>();
  const [wrongInfo, setWrongInfo] = useState<{ san: string; reply?: string; mate?: boolean; draw?: string } | null>(null);
  /** the last thing the solver did was a correct move (drives the "Đúng rồi!" message) */
  const [justRight, setJustRight] = useState(false);
  /** while a move is being judged, the board keeps showing it instead of snapping the piece back */
  const [view, setView] = useState<{ fen: string; lastMove: Key[] } | null>(null);
  /** the engine could not judge a move (not loaded, too slow): the move is taken back, not counted as wrong */
  const [engineNote, setEngineNote] = useState(false);
  const finished = useRef(false);
  const timers = useRef<number[]>([]);
  const wrongCount = useRef(0);
  const attempt = useRef(0); // invalidates async engine answers after a retry / reset
  const undoPlies = useRef(0);
  /** "Làm lại" can appear right under the finger that tapped "Xem lời giải": ignore a double tap */
  const endedAt = useRef(0);

  const chess = chessRef.current;
  /** how many of the solver's own moves are still to be found */
  const movesLeft = free.current
    ? Math.max(1, free.current.target - Array.from({ length: idx }, (_, k) => k).filter((k) => k % 2 === (playerFirst ? 0 : 1)).length)
    : Math.ceil((moves.length - idx) / 2);
  const playerColor: Color = useMemo(() => {
    const c = new Chess(fen);
    if (!playerFirst && props.moves[0]) playUci(c, props.moves[0]);
    return turnColor(c);
  }, [fen, props.moves, playerFirst]);

  /** an arrow hint gives the move away: the puzzle no longer counts as passed */
  const shown = useRef(false);
  const finish = useCallback(
    (ok: boolean, revealed = false) => {
      if (finished.current) return;
      finished.current = true;
      props.onFinish?.(ok, revealed || shown.current ? 'shown' : ok ? 'clean' : 'solved', chessRef.current.fen());
    },
    [props],
  );

  const later = (fn: () => void, ms: number) => {
    const t = window.setTimeout(fn, ms);
    timers.current.push(t);
  };
  /** cancel pending opponent replies / solution playback, so they cannot land on a reset board */
  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  // reset on new puzzle
  useEffect(() => {
    clearTimers();
    attempt.current++;
    chessRef.current = new Chess(fen);
    alt.current = null;
    free.current = null;
    finished.current = false;
    shown.current = false;
    wrongCount.current = 0;
    undoPlies.current = 0;
    setJustRight(false);
    setFailed(!!props.failedBefore);
    setPending(null);
    setShapes([]);
    setHintLevel(0);
    setWrongInfo(null);
    setLastMove(undefined);
    setView(null);
    setEngineNote(false);
    bump();
    if (playerFirst) {
      setIdx(0);
      setStatus('solving');
    } else {
      setIdx(0);
      setStatus('intro');
      later(() => {
        // props.moves, not `moves`: this render's line may still be the previous puzzle's alternative line
        const m = playUci(chessRef.current, props.moves[0]);
        if (m) setLastMove([m.from as Key, m.to as Key]);
        setIdx(1);
        setStatus('solving');
        bump();
      }, 500);
    }
    return () => timers.current.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fen, props.moves.join(' '), playerFirst, props.resetKey]);

  const accept = (san: string, from: Key, to: Key, isMate: boolean, expectedIdx: number) => {
    chess.move(san);
    setLastMove([from, to]);
    setShapes([]);
    setHintLevel(0);
    setWrongInfo(null);
    setJustRight(true);
    const next = expectedIdx + 1;
    setIdx(next);
    bump();
    if (isMate || next >= lineNow().length) {
      setStatus('solved');
      finish(!failed);
      return;
    }
    setStatus('solving');
    // opponent reply
    later(() => {
      const reply = playUci(chess, lineNow()[next]);
      if (reply) setLastMove([reply.from as Key, reply.to as Key]);
      setIdx(next + 1);
      bump();
      // a scripted reply that does not fit the position would leave the board waiting forever: end it instead
      if (!reply || next + 1 >= lineNow().length) {
        setStatus('solved');
        finish(!failed);
      }
    }, 350);
  };

  const reject = (san: string, from: Key, to: Key) => {
    const myAttempt = ++attempt.current;
    chess.move(san);
    undoPlies.current = 1;
    setLastMove([from, to]);
    setStatus('wrong');
    setJustRight(false);
    setFailed(true);
    setShapes([]);
    // a move that ends the game in a draw gets no reply: say why it is wrong
    const draw = chess.isStalemate()
      ? 'Đối phương không bị chiếu nhưng hết nước đi hợp lệ: hòa pat.'
      : chess.isInsufficientMaterial()
        ? 'Không bên nào còn đủ quân để chiếu hết: hòa.'
        : undefined;
    setWrongInfo({ san, draw });
    wrongCount.current++;
    props.onWrong?.(wrongCount.current);
    bump();
    if (props.refute === false || chess.isGameOver()) return;
    // show how the opponent punishes it
    const fenAfter = chess.fen();
    const engine = getEngine();
    engine
      .fullStrength()
      .then(() => engine.evaluate(fenAfter, { depth: 10 }))
      .then((r) => {
        if (attempt.current !== myAttempt || !r.bestmove || r.bestmove === '(none)') return;
        const reply = playUci(chess, r.bestmove);
        if (!reply) return;
        undoPlies.current = 2;
        setLastMove([reply.from as Key, reply.to as Key]);
        setShapes([{ orig: reply.from as Key, dest: reply.to as Key, brush: 'red' }]);
        setWrongInfo({ san, reply: reply.san, mate: chess.isCheckmate() });
        bump();
      })
      .catch(() => undefined);
  };

  const retry = () => {
    if (status !== 'wrong') return;
    attempt.current++;
    for (let i = 0; i < undoPlies.current; i++) chess.undo();
    undoPlies.current = 0;
    const h = chess.history({ verbose: true });
    const last = h[h.length - 1];
    setLastMove(last ? [last.from as Key, last.to as Key] : undefined);
    setShapes([]);
    setWrongInfo(null);
    setStatus('solving');
    bump();
  };

  /** which plies of a line are the solver's */
  const mine = (k: number) => k % 2 === (playerFirst ? 0 : 1);
  const solverPlies = (n: number) => Array.from({ length: n }, (_, k) => k).filter(mine).length;

  /**
   * The solver left the scripted line with a move the engine judged as good: from here Stockfish answers for the
   * opponent and judges every move, until the solver has made as many moves as the scripted solution asks for
   * (and, in a mating task, has actually mated, a few extra moves at most).
   */
  const playFree = (uci: string, at: number) => {
    const myAttempt = attempt.current;
    if (!free.current) {
      // what the scripted solution achieves besides its length: a mate, or a pawn pushed to a given rank
      // (a pawn advanced by a capture, e.g. "exd4", is not a plan to push it: only quiet pushes count)
      const end = new Chess(fen);
      let pawnGoal = 0;
      props.moves.forEach((u, k) => {
        const m = playUci(end, u);
        if (!m || !mine(k) || m.piece !== 'p' || m.captured) return;
        const r = Number(m.to[1]);
        pawnGoal = Math.max(pawnGoal, m.promotion ? 8 : m.color === 'w' ? r : 9 - r);
      });
      const target = solverPlies(props.moves.length);
      free.current = { target, mate: (props.mateGoal ?? false) || end.isCheckmate(), pawnGoal: target > 1 ? pawnGoal : 0 };
    }
    const mv = playUci(chess, uci);
    if (!mv) return;
    alt.current = [...lineNow().slice(0, at), uci];
    setLastMove([mv.from as Key, mv.to as Key]);
    setShapes([]);
    setHintLevel(0);
    setWrongInfo(null);
    setJustRight(true);
    setIdx(at + 1);
    bump();
    const made = solverPlies(at + 1);
    const { target, mate, pawnGoal } = free.current;
    const goalMet = mate ? false : pawnRank(chess, playerColor) >= pawnGoal;
    if (chess.isCheckmate() || (made >= target && goalMet)) {
      setStatus('solved');
      finish(!failed);
      return;
    }
    if (chess.isGameOver() || made >= target + 4) return endFree();
    setStatus('solving');
    const engine = getEngine();
    // a stalled engine must not leave the board on "Chờ đối phương đáp…" forever
    withTimeout(
      engine.fullStrength().then(() => engine.evaluate(chess.fen(), { depth: 12 })),
      ENGINE_MS,
    )
      .then((r) => {
        if (attempt.current !== myAttempt) return;
        const reply = r.bestmove && r.bestmove !== '(none)' ? playUci(chess, r.bestmove) : null;
        if (!reply) {
          setStatus('solved');
          finish(!failed);
          return;
        }
        alt.current = [...lineNow(), reply.from + reply.to + (reply.promotion ?? '')];
        setLastMove([reply.from as Key, reply.to as Key]);
        if (chess.isGameOver()) {
          setIdx(at + 2);
          bump();
          endFree();
          return;
        }
        setIdx(at + 2);
        bump();
        // the solver's best move from here, for the hint and "Xem lời giải" (a move made meanwhile is judged instead).
        // Not knowing it only hides the hint: it must not end the puzzle.
        withTimeout(engine.evaluate(chess.fen(), { depth: 12 }), ENGINE_MS)
          .then((next) => {
            if (attempt.current !== myAttempt || lineNow().length !== at + 2) return;
            if (next.bestmove && next.bestmove !== '(none)') alt.current = [...lineNow(), next.bestmove];
            bump();
          })
          .catch(() => undefined);
      })
      .catch(() => {
        if (attempt.current !== myAttempt) return;
        setStatus('solved');
        finish(!failed);
      });
  };

  /**
   * The free continuation stopped (the game ended, or too many moves went by) without the solver mating: a task with a
   * goal (mate, a pawn to push) is then not reached; a task without one (hold a draw, keep the edge) is.
   */
  const endFree = () => {
    const f = free.current;
    const hasGoal = !!f && (f.mate || f.pawnGoal > 0);
    if (!hasGoal && !chess.isCheckmate()) {
      setStatus('solved');
      finish(!failed);
      return;
    }
    setFailed(true);
    setStatus('unmet');
    endedAt.current = Date.now();
    finish(false);
  };

  const applyUserMove = (from: Key, to: Key, promotion?: 'q' | 'r' | 'b' | 'n') => {
    if (status !== 'solving') return;
    const expected = moves[idx];
    const uci = from + to + (promotion ?? '');
    const fenBefore = chess.fen();
    const test = new Chess(fenBefore);
    const mv = playUci(test, uci);
    if (!mv) return;
    const isMate = test.isCheckmate();
    const at = idx;
    if (free.current) {
      if (uci === expected || isMate) return playFree(uci, at);
    } else {
      if (uci === expected || isMate) return accept(mv.san, from, to, isMate, idx);
      const altLine = idx === (playerFirst ? 0 : 1) ? alternatives?.map((a) => a.split(' ')).find((l) => l[0] === uci) : undefined;
      if (altLine && altLine.length > 1) {
        alt.current = [...lineNow().slice(0, idx), ...altLine];
        return accept(mv.san, from, to, false, idx);
      }
      if (altLine) {
        if (idx + 1 >= lineNow().length) return accept(mv.san, from, to, false, idx);
        // an equally good first move: the scripted replies no longer fit, Stockfish takes over
        if (props.judge) return playFree(uci, at);
        chess.move(mv.san);
        setLastMove([from, to]);
        setIdx(lineNow().length);
        setStatus('solved');
        bump();
        finish(!failed);
        return;
      }
    }
    if (props.judge) {
      const myAttempt = ++attempt.current;
      setStatus('checking');
      setView({ fen: test.fen(), lastMove: [from, to] });
      setEngineNote(false);
      withTimeout(props.judge(uci, fenBefore), ENGINE_MS)
        .then(
          (ok) => ok,
          () => null,
        )
        .then((ok) => {
          if (attempt.current !== myAttempt) return;
          setView(null);
          setStatus('solving');
          // no verdict (engine missing or too slow): take the move back without counting it as a mistake
          if (ok === null) {
            setEngineNote(true);
            bump();
          } else if (ok) playFree(uci, at);
          else reject(mv.san, from, to);
        });
      return;
    }
    reject(mv.san, from, to);
  };

  const onMove = (from: Key, to: Key) => {
    setEngineNote(false);
    // the king dropped on its own rook means castling (as on Lichess)
    const piece = chess.get(from as Square);
    const target = chess.get(to as Square);
    if (piece?.type === 'k' && target?.type === 'r' && target.color === piece.color) to = ((to[0] === 'h' ? 'g' : 'c') + to[1]) as Key;
    if (needsPromotion(chess, from, to)) setPending({ from, to });
    else applyUserMove(from, to);
  };

  const showHint = () => {
    const m = moves[idx];
    setEngineNote(false);
    // only while the solver is to move: during the opponent's reply moves[idx] is the opponent's move
    if (!m || status !== 'solving' || turnColor(chess) !== playerColor) return;
    const orig = m.slice(0, 2) as Key;
    const dest = m.slice(2, 4) as Key;
    props.onHint?.();
    if (hintLevel === 0) setShapes([{ orig, brush: 'green' }]);
    else {
      setShapes([{ orig, dest, brush: 'green' }]);
      shown.current = true;
    }
    setHintLevel(hintLevel + 1);
    setFailed(true); // a hinted solve does not count as clean
  };

  const reveal = () => {
    if (status !== 'solving') return;
    clearTimers();
    attempt.current++;
    setFailed(true);
    setStatus('revealed');
    setShapes([]);
    setWrongInfo(null);
    endedAt.current = Date.now();
    finish(false, true);
    if (free.current) {
      // off the script there is no stored line: let Stockfish play both sides on until the task's goal is shown
      const f = free.current;
      const myAttempt = attempt.current;
      const engine = getEngine();
      let plies = 0;
      const auto = () => {
        const done = chess.isGameOver() || plies >= 16 || (!f.mate && f.pawnGoal > 0 && pawnRank(chess, playerColor) >= f.pawnGoal);
        if (done) return;
        withTimeout(engine.evaluate(chess.fen(), { depth: 12 }), ENGINE_MS)
          .then((r) => {
            if (attempt.current !== myAttempt) return;
            const m = r.bestmove && r.bestmove !== '(none)' ? playUci(chess, r.bestmove) : null;
            if (!m) return;
            plies++;
            alt.current = [...chess.history({ verbose: true }).map((x) => x.from + x.to + (x.promotion ?? ''))];
            setLastMove([m.from as Key, m.to as Key]);
            setIdx(alt.current.length);
            bump();
            later(auto, 500);
          })
          .catch(() => undefined);
      };
      // drop the precomputed hint move: the loop replays from the current position
      alt.current = chess.history({ verbose: true }).map((x) => x.from + x.to + (x.promotion ?? ''));
      auto();
      return;
    }
    // a pending opponent reply was cancelled above, so moves[idx] is exactly the next move to show
    let i = idx;
    const step = () => {
      if (i >= moves.length) return;
      const m = playUci(chess, moves[i]);
      if (m) setLastMove([m.from as Key, m.to as Key]);
      i++;
      setIdx(i);
      bump();
      later(step, 700);
    };
    step();
  };

  const restart = () => {
    if (Date.now() - endedAt.current < 600) return;
    clearTimers();
    attempt.current++;
    chessRef.current = new Chess(fen);
    alt.current = null;
    free.current = null;
    finished.current = false;
    shown.current = false;
    undoPlies.current = 0;
    wrongCount.current = 0;
    setJustRight(false);
    setPending(null);
    setFailed(false);
    setShapes([]);
    setHintLevel(0);
    setWrongInfo(null);
    setView(null);
    setEngineNote(false);
    if (playerFirst) {
      setIdx(0);
      setLastMove(undefined);
    } else {
      const m = playUci(chessRef.current, props.moves[0]);
      setLastMove(m ? [m.from as Key, m.to as Key] : undefined);
      setIdx(1);
    }
    setStatus('solving');
    bump();
  };

  /**
   * legal moves for chessground, plus the king onto its own rook for castling. A fresh map every render on purpose:
   * Board then re-applies the position, which also puts back a pawn left on the last rank by a cancelled promotion.
   */
  const dests = (() => {
    const d = toDests(chess);
    for (const m of chess.moves({ verbose: true })) {
      if (!m.isKingsideCastle() && !m.isQueensideCastle()) continue;
      const rook = ((m.isKingsideCastle() ? 'h' : 'a') + m.from[1]) as Key;
      const list = d.get(m.from as Key) ?? [];
      if (!list.includes(rook)) d.set(m.from as Key, [...list, rook]);
    }
    return d;
  })();

  const solutionSan = useMemo(() => uciLineToSan(fen, moves), [fen, moves]);
  const live = status === 'solving';
  const myTurn = live && turnColor(chess) === playerColor;
  const madeFree = free.current ? Array.from({ length: idx }, (_, k) => k).filter((k) => k % 2 === (playerFirst ? 0 : 1)).length : 0;
  const left =
    free.current && madeFree >= free.current.target
      ? free.current.mate
        ? 'Đi tiếp cho tới khi chiếu hết.'
        : `Đi tiếp cho tới khi tốt lên hàng ${free.current.pawnGoal}.`
      : movesLeft > 1
        ? `Còn ${movesLeft} nước nữa: tìm nước tiếp theo.`
        : 'Còn một nước nữa để kết thúc bài.';
  const sideText = playerColor === 'white' ? 'Trắng' : 'Đen';

  return (
    <div>
      {/* the task stays above the board, so it can be read without scrolling past the board */}
      <div className="pz-prompt">{props.prompt ?? `Bạn cầm ${sideText}. Tìm nước tốt nhất.`}</div>
      <div onClick={status === 'wrong' ? retry : undefined}>
        <Board
          fen={view?.fen ?? chess.fen()}
          orientation={playerColor}
          turnColor={view ? (playerColor === 'white' ? 'black' : 'white') : turnColor(chess)}
          lastMove={view?.lastMove ?? lastMove}
          check={view ? kingInCheckColor(new Chess(view.fen)) : kingInCheckColor(chess)}
          movableColor={live && turnColor(chess) === playerColor ? playerColor : undefined}
          dests={live ? dests : new Map()}
          onMove={onMove}
          shapes={shapes}
          sides
        />
      </div>
      <div className="mt">
        {/* right / wrong / whose turn is read out by screen readers as it changes */}
        <div aria-live="polite">
        {status === 'intro' && <div className="feedback info">Đối phương vừa đi…</div>}
        {live && !myTurn && <div className="feedback ok">Đúng rồi! Chờ đối phương đáp…</div>}
        {myTurn &&
          !engineNote &&
          (idx > (playerFirst ? 0 : 1) ? (
            <div className="feedback info">{justRight ? `Đúng rồi! Đối phương đã đáp lại. ${left}` : `Tới lượt bạn. ${left}`}</div>
          ) : (
            <div className="feedback info">Tới lượt bạn: đi quân trên bàn cờ.</div>
          ))}
        {status === 'checking' && <div className="feedback info">Đang kiểm tra nước của bạn…</div>}
        {engineNote && myTurn && (
          <div className="feedback info">
            Chưa kiểm tra được nước này vì bộ máy cờ chưa sẵn sàng, nên nước đã được trả lại (không tính là sai). Đợi vài giây rồi đi lại, hoặc
            bấm “Gợi ý”.
          </div>
        )}
        {status === 'wrong' && wrongInfo && (
          <div className="feedback bad">
            {wrongInfo.san} chưa đúng.
            {wrongInfo.draw && ` ${wrongInfo.draw}`}
            {wrongInfo.reply && (
              <>
                {' '}
                Đối phương đáp <b>{wrongInfo.reply}</b>
                {wrongInfo.mate ? ' và chiếu hết.' : ' (mũi tên đỏ).'}
              </>
            )}
            <div className="row mt">
              <Button onClick={retry}>Thử lại</Button>
            </div>
          </div>
        )}
        {status === 'solved' &&
          (shown.current ? (
            <div className="feedback info">Đã đi hết lời giải.</div>
          ) : failed ? (
            <div className="feedback info">Đã giải xong{wrongCount.current > 0 ? ` sau ${wrongCount.current + 1} lần thử` : ''}.</div>
          ) : (
            <div className="feedback ok">Chính xác!</div>
          ))}
        {status === 'unmet' && (
          <div className="feedback bad">
            {free.current?.mate
              ? 'Chưa chiếu hết được. Bấm “Làm lại” để thử lại.'
              : `Chưa đạt mục tiêu: tốt chưa lên được hàng ${free.current?.pawnGoal ?? 8}. Bấm “Làm lại” để thử lại.`}
          </div>
        )}
        {status === 'revealed' && (
          <div className="feedback info">
            Lời giải{solutionSan.length - (playerFirst ? 0 : 1) > 1 ? ' (nước của bạn in đậm)' : ''}:{' '}
            {solutionSan.slice(playerFirst ? 0 : 1).map((san, k) => (
              <span key={k}>{k % 2 === 0 ? <b>{san}</b> : san} </span>
            ))}
          </div>
        )}
        </div>
        {(props.showControls ?? true) && (
          <div className="row mt">
            {myTurn && (
              <>
                {hintLevel < 2 && moves[idx] && (
                  <Button kind="ghost" onClick={showHint}>
                    {hintLevel === 0 ? 'Gợi ý' : 'Gợi ý thêm'}
                  </Button>
                )}
                <Button kind="ghost" onClick={reveal}>
                  Xem lời giải
                </Button>
              </>
            )}
            {(status === 'solved' || status === 'revealed' || status === 'unmet') && (
              <Button kind="ghost" onClick={restart}>
                Làm lại
              </Button>
            )}
          </div>
        )}
      </div>
      {pending && (
        <PromotionPicker
          color={playerColor}
          onPick={(p) => {
            applyUserMove(pending.from, pending.to, p);
            setPending(null);
          }}
          onCancel={() => setPending(null)}
        />
      )}
    </div>
  );
}

/** the furthest rank (from that side's point of view) a pawn of `color` has reached; a promotion made on this board counts as 8 */
function pawnRank(c: Chess, color: Color): number {
  const me = color === 'white' ? 'w' : 'b';
  if (c.history({ verbose: true }).some((m) => m.color === me && !!m.promotion)) return 8;
  let best = 0;
  for (const row of c.board())
    for (const sq of row) if (sq && sq.color === me && sq.type === 'p') best = Math.max(best, me === 'w' ? Number(sq.square[1]) : 9 - Number(sq.square[1]));
  return best;
}
