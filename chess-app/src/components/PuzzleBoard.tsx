import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import type { Key, Color } from 'chessground/types';
import type { DrawShape } from 'chessground/draw';
import Board from './Board';
import PromotionPicker from './PromotionPicker';
import { Button } from './ui';
import { getEngine } from '../lib/engine';
import { playUci, toDests, turnColor, kingInCheckColor, needsPromotion, uciLineToSan } from '../lib/chess-utils';

export type PuzzleStatus = 'intro' | 'solving' | 'checking' | 'wrong' | 'solved' | 'revealed';

export interface PuzzleBoardProps {
  fen: string;
  /** solution line in UCI. If !playerFirst, moves[0] is the opponent's move played automatically. */
  moves: string[];
  playerFirst?: boolean;
  /** extra accepted first moves for the player (UCI) */
  alternatives?: string[];
  /** called exactly once when the puzzle is finished: ok=false if the user failed or revealed */
  onFinish?: (ok: boolean) => void;
  /** called on every wrong attempt with the running count */
  onWrong?: (count: number) => void;
  prompt?: string;
  showControls?: boolean;
  /** when the key changes, the puzzle resets */
  resetKey?: string;
  /**
   * Optional second opinion for a move that is not in the solution (e.g. another move that is just as good).
   * Resolve true to accept it.
   */
  judge?: (uci: string, fenBefore: string) => Promise<boolean>;
  /** show the opponent's best reply to a wrong move (needs the engine). Default true. */
  refute?: boolean;
}

export default function PuzzleBoard(props: PuzzleBoardProps) {
  const { fen, moves, playerFirst, alternatives } = props;
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
  const [wrongInfo, setWrongInfo] = useState<{ san: string; reply?: string; mate?: boolean } | null>(null);
  const finished = useRef(false);
  const timers = useRef<number[]>([]);
  const wrongCount = useRef(0);
  const attempt = useRef(0); // invalidates async engine answers after a retry / reset
  const undoPlies = useRef(0);

  const chess = chessRef.current;
  const playerColor: Color = useMemo(() => {
    const c = new Chess(fen);
    if (!playerFirst && moves[0]) playUci(c, moves[0]);
    return turnColor(c);
  }, [fen, moves, playerFirst]);

  const finish = useCallback(
    (ok: boolean) => {
      if (finished.current) return;
      finished.current = true;
      props.onFinish?.(ok);
    },
    [props],
  );

  const later = (fn: () => void, ms: number) => {
    const t = window.setTimeout(fn, ms);
    timers.current.push(t);
  };

  // reset on new puzzle
  useEffect(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    attempt.current++;
    chessRef.current = new Chess(fen);
    finished.current = false;
    wrongCount.current = 0;
    undoPlies.current = 0;
    setFailed(false);
    setPending(null);
    setShapes([]);
    setHintLevel(0);
    setWrongInfo(null);
    setLastMove(undefined);
    bump();
    if (playerFirst) {
      setIdx(0);
      setStatus('solving');
    } else {
      setIdx(0);
      setStatus('intro');
      later(() => {
        const m = playUci(chessRef.current, moves[0]);
        if (m) setLastMove([m.from as Key, m.to as Key]);
        setIdx(1);
        setStatus('solving');
        bump();
      }, 500);
    }
    return () => timers.current.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fen, moves.join(' '), playerFirst, props.resetKey]);

  const accept = (san: string, from: Key, to: Key, isMate: boolean, expectedIdx: number) => {
    chess.move(san);
    setLastMove([from, to]);
    setShapes([]);
    setHintLevel(0);
    setWrongInfo(null);
    const next = expectedIdx + 1;
    setIdx(next);
    bump();
    if (isMate || next >= moves.length) {
      setStatus('solved');
      finish(!failed);
      return;
    }
    setStatus('solving');
    // opponent reply
    later(() => {
      const reply = playUci(chess, moves[next]);
      if (reply) setLastMove([reply.from as Key, reply.to as Key]);
      setIdx(next + 1);
      bump();
      if (next + 1 >= moves.length) {
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
    setFailed(true);
    setShapes([]);
    setWrongInfo({ san });
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

  const applyUserMove = (from: Key, to: Key, promotion?: 'q' | 'r' | 'b' | 'n') => {
    if (status !== 'solving') return;
    const expected = moves[idx];
    const uci = from + to + (promotion ?? '');
    const fenBefore = chess.fen();
    const test = new Chess(fenBefore);
    const mv = playUci(test, uci);
    if (!mv) return;
    const isMate = test.isCheckmate();
    const accepted = uci === expected || (idx === (playerFirst ? 0 : 1) && alternatives?.includes(uci)) || isMate;
    if (accepted) return accept(mv.san, from, to, isMate, idx);
    if (props.judge) {
      const myAttempt = ++attempt.current;
      const at = idx;
      setStatus('checking');
      props
        .judge(uci, fenBefore)
        .catch(() => false)
        .then((ok) => {
          if (attempt.current !== myAttempt) return;
          if (ok) {
            // an equally good move: the scripted continuation no longer applies, so the puzzle ends here
            chess.move(mv.san);
            setLastMove([from, to]);
            setShapes([]);
            setIdx(moves.length);
            setStatus('solved');
            bump();
            finish(!failed);
          } else {
            setStatus('solving');
            reject(mv.san, from, to);
          }
        });
      void at;
      return;
    }
    reject(mv.san, from, to);
  };

  const onMove = (from: Key, to: Key) => {
    if (needsPromotion(chess, from, to)) setPending({ from, to });
    else applyUserMove(from, to);
  };

  const showHint = () => {
    const m = moves[idx];
    if (!m) return;
    const orig = m.slice(0, 2) as Key;
    const dest = m.slice(2, 4) as Key;
    if (hintLevel === 0) setShapes([{ orig, brush: 'green' }]);
    else setShapes([{ orig, dest, brush: 'green' }]);
    setHintLevel(hintLevel + 1);
    setFailed(true); // a hinted solve does not count as clean
  };

  const reveal = () => {
    attempt.current++;
    setFailed(true);
    setStatus('revealed');
    setShapes([]);
    setWrongInfo(null);
    finish(false);
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
    attempt.current++;
    chessRef.current = new Chess(fen);
    finished.current = false;
    undoPlies.current = 0;
    setFailed(false);
    setShapes([]);
    setHintLevel(0);
    setWrongInfo(null);
    if (playerFirst) {
      setIdx(0);
      setLastMove(undefined);
    } else {
      const m = playUci(chessRef.current, moves[0]);
      setLastMove(m ? [m.from as Key, m.to as Key] : undefined);
      setIdx(1);
    }
    setStatus('solving');
    bump();
  };

  const solutionSan = useMemo(() => uciLineToSan(fen, moves), [fen, moves]);
  const live = status === 'solving';
  const sideText = playerColor === 'white' ? 'Trắng' : 'Đen';

  return (
    <div>
      <div onClick={status === 'wrong' ? retry : undefined}>
        <Board
          fen={chess.fen()}
          orientation={playerColor}
          turnColor={turnColor(chess)}
          lastMove={lastMove}
          check={kingInCheckColor(chess)}
          movableColor={live && turnColor(chess) === playerColor ? playerColor : undefined}
          dests={live ? toDests(chess) : new Map()}
          onMove={onMove}
          shapes={shapes}
        />
      </div>
      <div className="mt">
        {status === 'intro' && <div className="feedback info">Đối phương vừa đi…</div>}
        {status === 'solving' && <div className="feedback info">{props.prompt ?? `Bạn cầm ${sideText}. Tìm nước tốt nhất.`}</div>}
        {status === 'checking' && <div className="feedback info">Đang kiểm tra nước của bạn…</div>}
        {status === 'wrong' && wrongInfo && (
          <div className="feedback bad">
            {wrongInfo.san} chưa đúng.
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
        {status === 'solved' && <div className="feedback ok">{failed ? 'Đã giải (có gợi ý hoặc sai một lần).' : 'Chính xác!'}</div>}
        {status === 'revealed' && <div className="feedback info">Lời giải: {solutionSan.slice(playerFirst ? 0 : 1).join(' ')}</div>}
        {(props.showControls ?? true) && (
          <div className="row mt">
            {live && (
              <>
                <Button kind="ghost" onClick={showHint}>
                  {hintLevel === 0 ? 'Gợi ý' : 'Gợi ý thêm'}
                </Button>
                <Button kind="ghost" onClick={reveal}>
                  Xem lời giải
                </Button>
              </>
            )}
            {(status === 'solved' || status === 'revealed') && (
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
