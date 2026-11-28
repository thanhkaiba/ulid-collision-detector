import { useRef } from 'react';
import type { Color } from 'chessground/types';
import { useDialog } from './ui';

const PIECES: { role: 'q' | 'r' | 'b' | 'n'; label: string; w: string; b: string }[] = [
  { role: 'q', label: 'Hậu', w: '♕', b: '♛' },
  { role: 'r', label: 'Xe', w: '♖', b: '♜' },
  { role: 'b', label: 'Tượng', w: '♗', b: '♝' },
  { role: 'n', label: 'Mã', w: '♘', b: '♞' },
];

export default function PromotionPicker({
  color,
  onPick,
  onCancel,
}: {
  color: Color;
  onPick: (p: 'q' | 'r' | 'b' | 'n') => void;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useDialog(ref, onCancel);
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div ref={ref} className="promo" role="dialog" aria-modal="true" aria-labelledby="promo-title" onClick={(e) => e.stopPropagation()}>
        <div className="promo-title" id="promo-title">
          Phong cấp thành
        </div>
        <div className="promo-row">
          {PIECES.map((p) => (
            <button key={p.role} className="promo-btn" onClick={() => onPick(p.role)} aria-label={p.label}>
              <span className={`promo-piece ${color}`}>{color === 'white' ? p.w : p.b}</span>
              <span>{p.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
