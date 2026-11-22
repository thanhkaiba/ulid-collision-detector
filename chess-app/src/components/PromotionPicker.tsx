import type { Color } from 'chessground/types';

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
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="promo" onClick={(e) => e.stopPropagation()}>
        <div className="promo-title">Phong cấp thành</div>
        <div className="promo-row">
          {PIECES.map((p) => (
            <button key={p.role} className="promo-btn" onClick={() => onPick(p.role)} aria-label={p.label}>
              <span className="promo-piece">{color === 'white' ? p.w : p.b}</span>
              <span>{p.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
