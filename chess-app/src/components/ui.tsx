import type { ReactNode } from 'react';

export function Card({ children, className = '', onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div className={`card ${className} ${onClick ? 'card-click' : ''}`} onClick={onClick}>
      {children}
    </div>
  );
}

export function Button({
  children,
  onClick,
  kind = 'default',
  disabled,
  className = '',
  type = 'button',
}: {
  children: ReactNode;
  onClick?: () => void;
  kind?: 'default' | 'primary' | 'ghost' | 'danger';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
}) {
  return (
    <button type={type} className={`btn btn-${kind} ${className}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

export function Seg<T extends string | number>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="seg">
      {options.map((o) => (
        <button
          key={String(o.value)}
          className={`seg-btn ${o.value === value ? 'active' : ''}`}
          onClick={() => onChange(o.value)}
          type="button"
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="spinner-row">
      <span className="spinner" /> {label && <span>{label}</span>}
    </div>
  );
}

export function Tag({ children, tone = 'default' }: { children: ReactNode; tone?: 'default' | 'good' | 'bad' | 'warn' | 'info' }) {
  return <span className={`tag tag-${tone}`}>{children}</span>;
}
