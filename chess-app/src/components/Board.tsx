import { useEffect, useRef } from 'react';
import { Chessground } from 'chessground';
import type { Api } from 'chessground/api';
import type { Config } from 'chessground/config';
import type { Key, Color } from 'chessground/types';
import type { DrawShape } from 'chessground/draw';
import 'chessground/assets/chessground.base.css';
import 'chessground/assets/chessground.brown.css';
import 'chessground/assets/chessground.cburnett.css';

export interface BoardProps {
  fen: string;
  orientation?: Color;
  turnColor?: Color;
  lastMove?: Key[];
  check?: Color | boolean;
  /**
   * Which color the user may move; undefined = nothing can be moved.
   * Note: chessground binds pointer events only at creation, so a board that may become interactive
   * later must be created with viewOnly=false and controlled through movableColor instead.
   */
  movableColor?: Color | 'both';
  dests?: Map<Key, Key[]>;
  onMove?: (from: Key, to: Key) => void;
  /**
   * fired when a square is tapped (the board must not be viewOnly). Boards that use it receive every touch,
   * so the page cannot be scrolled by swiping across them.
   */
  onSelect?: (key: Key) => void;
  shapes?: DrawShape[];
  viewOnly?: boolean;
  coordinates?: boolean;
  animate?: boolean;
  className?: string;
}

/** React wrapper around Lichess' chessground. Touch-friendly, tiny, fast. */
export default function Board(props: BoardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const api = useRef<Api | null>(null);
  const onMoveRef = useRef(props.onMove);
  onMoveRef.current = props.onMove;
  const onSelectRef = useRef(props.onSelect);
  onSelectRef.current = props.onSelect;

  const config = (): Config => ({
    fen: props.fen,
    orientation: props.orientation ?? 'white',
    turnColor: props.turnColor ?? 'white',
    lastMove: props.lastMove,
    check: props.check ?? false,
    coordinates: props.coordinates ?? true,
    viewOnly: props.viewOnly ?? false,
    disableContextMenu: true,
    blockTouchScroll: false,
    animation: { enabled: props.animate ?? true, duration: 200 },
    highlight: { lastMove: true, check: true },
    movable: {
      free: false,
      color: props.movableColor,
      dests: props.dests ?? new Map(),
      showDests: true,
      events: { after: (from, to) => onMoveRef.current?.(from, to) },
      rookCastle: true,
    },
    events: { select: (key) => onSelectRef.current?.(key) },
    premovable: { enabled: false },
    draggable: { enabled: true, showGhost: true },
    selectable: { enabled: true },
    drawable: { enabled: false, visible: true, shapes: props.shapes ?? [] },
  });

  useEffect(() => {
    if (!ref.current) return;
    api.current = Chessground(ref.current, config());
    /*
     * Let the page scroll when a finger lands on the board without meaning to move:
     * only a touch on a piece the user may move (or any touch while a piece is selected) reaches the board.
     * Everything else is stopped here, in the capture phase, before chessground can block scrolling.
     */
    const el = ref.current;
    const onTouch = (e: TouchEvent) => {
      const cg = api.current;
      if (!cg || onSelectRef.current || e.touches.length !== 1) return;
      const s = cg.state;
      if (s.viewOnly || s.selected) return;
      const t = e.touches[0];
      const key = cg.getKeyAtDomPos([t.clientX, t.clientY]);
      const piece = key ? s.pieces.get(key) : undefined;
      const mine = !!piece && (s.movable.color === 'both' || s.movable.color === piece.color);
      if (!mine) e.stopPropagation();
    };
    el.addEventListener('touchstart', onTouch, { capture: true, passive: true });
    return () => {
      el.removeEventListener('touchstart', onTouch, { capture: true });
      api.current?.destroy();
      api.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    api.current?.set(config());
    api.current?.setShapes(props.shapes ?? []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    props.fen,
    props.orientation,
    props.turnColor,
    props.lastMove?.join(),
    props.check,
    props.movableColor,
    props.dests,
    props.viewOnly,
    props.shapes,
  ]);

  return (
    <div className={`board-wrap ${props.className ?? ''}`}>
      <div ref={ref} className="cg-board-root" />
    </div>
  );
}
