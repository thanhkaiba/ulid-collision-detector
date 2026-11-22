import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import type { Key, Color } from 'chessground/types';
import type { DrawShape } from 'chessground/draw';
import Board from './Board';
import PromotionPicker from './PromotionPicker';
import { Button } from './ui';
import { playUci, toDests, turnColor, kingInCheckColor, needsPromotion, uciLineToSan } from '../lib/chess-utils';

export type PuzzleStatus = 'intro' | 'solving' | 'wrong' | 'solved' | 'revealed';

export interface PuzzleBoardProps {
  fen: string;
  /** solution line in UCI. If !playerFirst, moves[0] is the opponent's move played automatically. */
  moves: string[];
  playerFirst?: boolean;
  /** extra accepted first moves for the player (UCI) */
  alternatives?: string[];
  /** called exactly once when the puzzle is finished: ok=false if the user failed or revealed */
  onFinish?: (ok: boolean) => void;
  /** called on first wrong attempt */
  onWrong?: () => void;
  prompt?: string;
  showControls?: boolean;
  /** when the key changes, the puzzle resets */
  resetKey?: string;
}

export default function PuzzleBoard(props: PuzzleBoardProps) {
  const { fen, moves, playerFirst, alternatives } = props;
  const chessRef = useRef(new Chess(fen));
  const [version, setVersion] = useState(0);
  const [idx, setIdx] = useState(0); // index in moves of the next expected move
  const [status, setStatus] = useState<PuzzleStatus>('intro');
  const [failed, setFailed] = useState(false);
  const [pending, setPending] = useState<{ from: Key; to: Key } | null>(null);
  const [hint, setHint] = useState<DrawShape[]>([]);
  const [lastMove, setLastMove] = useState<Key[] | undefined>();
  const finished = useRef(false);
  const timers = useRef<number[]>([]);

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
    chessRef.current = new Chess(fen);
    finished.current = false;
    setFailed(false);
    setPending(null);
    setHint([]);
    setLastMove(undefined);
    setVersion((v) => v + 1);
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
        setVersion((v) => v + 1);
      }, 500);
    }
    return () => timers.current.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fen, moves.join(' '), playerFirst, props.resetKey]);

  const applyUserMove = (from: Key, to: Key, promotion?: 'q' | 'r' | 'b' | 'n') => {
    if (status !== 'solving' && status !== 'wrong') return;
    const expected = moves[idx];
    const uci = from + to + (promotion ?? '');
    const test = new Chess(chess.fen());
    const mv = playUci(test, uci);
    if (!mv) return;
    const isMate = test.isCheckmate();
    const accepted = uci === expected || (idx === (playerFirst ? 0 : 1) && alternatives?.includes(uci)) || isMate;
    if (!accepted) {
      // show the wrong move briefly, then take it back
      chess.move(mv.san);
      setLastMove([from, to]);
      setStatus('wrong');
      setFailed(true);
      props.onWrong?.();
      setVersion((v) => v + 1);
      later(() => {
        chess.undo();
        setLastMove(undefined);
        setStatus('solving');
        setVersion((v) => v + 1);
      }, 700);
      return;
    }
    chess.move(mv.san);
    setLastMove([from, to]);
    setHint([]);
    const next = idx + 1;
    setIdx(next);
    setVersion((v) => v + 1);
    if (isMate || next >= moves.length) {
      setStatus('solved');
      finish(!failed);
      return;
    }
    // opponent reply
    later(() => {
      const reply = playUci(chess, moves[next]);
      if (reply) setLastMove([reply.from as Key, reply.to as Key]);
      setIdx(next + 1);
      setVersion((v) => v + 1);
      if (next + 1 >= moves.length) {
        setStatus('solved');
        finish(!failed);
      }
    }, 350);
  };

  const onMove = (from: Key, to: Key) => {
    if (needsPromotion(chess, from, to)) setPending({ from, to });
    else applyUserMove(from, to);
  };

  const showHint = () => {
    const m = moves[idx];
    if (!m) return;
    setHint([{ orig: m.slice(0, 2) as Key, brush: 'green' }]);
  };

  const reveal = () => {
    setFailed(true);
    setStatus('revealed');
    finish(false);
    let i = idx;
    const step = () => {
      if (i >= moves.length) return;
      const m = playUci(chess, moves[i]);
      if (m) setLastMove([m.from as Key, m.to as Key]);
      i++;
      setIdx(i);
      setVersion((v) => v + 1);
      later(step, 600);
    };
    step();
  };

  const retry = () => {
    chessRef.current = new Chess(fen);
    finished.current = false;
    setFailed(false);
    setHint([]);
    if (playerFirst) {
      setIdx(0);
      setLastMove(undefined);
    } else {
      const m = playUci(chessRef.current, moves[0]);
      setLastMove(m ? [m.from as Key, m.to as Key] : undefined);
      setIdx(1);
    }
    setStatus('solving');
    setVersion((v) => v + 1);
  };

  const solutionSan = useMemo(() => uciLineToSan(fen, moves), [fen, moves]);
  const live = status === 'solving' || status === 'wrong';
  const sideText = playerColor === 'white' ? 'Trắng' : 'Đen';

  return (
    <div>
      <Board
        fen={chess.fen()}
        orientation={playerColor}
        turnColor={turnColor(chess)}
        lastMove={lastMove}
        check={kingInCheckColor(chess)}
        movableColor={live && turnColor(chess) === playerColor ? playerColor : undefined}
        dests={live ? toDests(chess) : new Map()}
        onMove={onMove}
        shapes={hint}
        key={version === -1 ? 'x' : 'board'}
      />
      <div className="mt">
        {status === 'intro' && <div className="feedback info">Đối phương vừa đi…</div>}
        {status === 'solving' && (
          <div className="feedback info">
            {props.prompt ?? `${sideText} đi. Tìm nước tốt nhất.`}
          </div>
        )}
        {status === 'wrong' && <div className="feedback bad">Chưa đúng, thử lại.</div>}
        {status === 'solved' && <div className="feedback ok">{failed ? 'Đã giải (có sai một lần).' : 'Chính xác!'}</div>}
        {status === 'revealed' && (
          <div className="feedback info">
            Lời giải: {solutionSan.slice(playerFirst ? 0 : 1).join(' ')}
          </div>
        )}
        {(props.showControls ?? true) && (
          <div className="row mt">
            {live && (
              <>
                <Button kind="ghost" onClick={showHint}>
                  Gợi ý
                </Button>
                <Button kind="ghost" onClick={reveal}>
                  Xem lời giải
                </Button>
              </>
            )}
            {(status === 'solved' || status === 'revealed') && (
              <Button kind="ghost" onClick={retry}>
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
