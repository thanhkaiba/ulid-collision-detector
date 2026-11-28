import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode, type RefObject } from 'react';

export function Card({ children, className = '', onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  // a tappable card is also reachable and usable from a keyboard (Tab, then Enter or Space)
  const onKey = onClick
    ? (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }
    : undefined;
  return (
    <div
      className={`card ${className} ${onClick ? 'card-click' : ''}`}
      onClick={onClick}
      onKeyDown={onKey}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
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
  label,
}: {
  children: ReactNode;
  onClick?: () => void;
  kind?: 'default' | 'primary' | 'ghost' | 'danger';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
  /** accessible name for a button that shows only an icon */
  label?: string;
}) {
  return (
    <button type={type} className={`btn btn-${kind} ${className}`} onClick={onClick} disabled={disabled} aria-label={label} title={label}>
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
          aria-pressed={o.value === value}
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
    <div className="spinner-row" role="status">
      <span className="spinner" /> {label && <span>{label}</span>}
    </div>
  );
}

export function Tag({ children, tone = 'default' }: { children: ReactNode; tone?: 'default' | 'good' | 'bad' | 'warn' | 'info' }) {
  return <span className={`tag tag-${tone}`}>{children}</span>;
}

/* ---------- icons: one stroked set, drawn like the tab bar icons (24-unit grid, round caps) ---------- */

const ICONS = {
  check: <path d="M5 12.5 9.5 17 19 7.5" />,
  done: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12.3 2.8 2.8L16.2 9.6" />
    </>
  ),
  todo: <circle cx="12" cy="12" r="9" />,
  optional: <circle cx="12" cy="12" r="9" strokeDasharray="3.2 3.2" />,
  flame: <path d="M12 3c.6 3.4 5 5.3 5 10.2a5 5 0 0 1-10 0c0-2.3 1.2-3.8 2.4-4.9.2 1.6 1 2.6 2.1 2.9C11 8.6 11.4 5.6 12 3z" />,
  book: (
    <>
      <path d="M3 5.5c2.7-1 6-1 9 1 3-2 6.3-2 9-1V19c-2.7-1-6-1-9 1-3-2-6.3-2-9-1z" />
      <path d="M12 6.5V20" />
    </>
  ),
  video: (
    <>
      <rect x="3" y="6" width="13" height="12" rx="2" />
      <path d="m16 10.5 5-3v9l-5-3z" />
    </>
  ),
  steps: (
    <>
      <circle cx="12" cy="5.5" r="2.5" />
      <path d="M9.5 10h5l-1 6h-3zM7 21h10l-1.5-5h-7z" />
    </>
  ),
  board: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="1.5" />
      <path d="M4 12h16M12 4v16" />
      <path d="M4 4h8v8H4zM12 12h8v8h-8z" fill="currentColor" stroke="none" opacity="0.35" />
    </>
  ),
  first: <path d="M17 6l-6 6 6 6M7 6v12" />,
  prev: <path d="M15 6l-6 6 6 6" />,
  next: <path d="M9 6l6 6-6 6" />,
  last: <path d="M7 6l6 6-6 6M17 6v12" />,
  play: <path d="M8 5.5v13l10-6.5z" fill="currentColor" />,
  pause: <path d="M8.5 5.5v13M15.5 5.5v13" />,
  flip: <path d="M7 20V4M4 7l3-3 3 3M17 4v16M14 17l3 3 3-3" />,
  undo: <path d="M9 14 4 9l5-5M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />,
  skip: <path d="m15 14 5-5-5-5M20 9H9.5a5.5 5.5 0 0 0 0 11H13" />,
  external: <path d="M14 4h6v6M20 4l-9 9M18 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10" />,
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
  arrowLeft: <path d="M19 12H5M11 6l-6 6 6 6" />,
  back: <path d="M15 5l-7 7 7 7" />,
  chevron: <path d="M9 6l6 6-6 6" />,
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2.5v3M12 18.5v3M21.5 12h-3M5.5 12h-3M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1M18.7 18.7l-2.1-2.1M7.4 7.4 5.3 5.3" />
    </>
  ),
} as const;

export type IconName = keyof typeof ICONS;

/** A small stroked SVG icon that takes the text colour and scales with the text (1.25em by default). */
export function Icon({ name, className = '' }: { name: IconName; className?: string }) {
  return (
    <svg className={`icon ${className}`} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {ICONS[name]}
    </svg>
  );
}

/* ---------- dialogs ---------- */

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Keyboard behaviour shared by every sheet and modal: Escape closes it, Tab stays inside it, and focus goes back to the
 * control that opened it once it closes.
 */
export function useDialog(ref: RefObject<HTMLElement | null>, onClose?: () => void, active = true) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    if (!active) return;
    const opener = document.activeElement as HTMLElement | null;
    const box = ref.current;
    if (box) {
      const first = box.querySelector<HTMLElement>('[data-autofocus]') ?? box.querySelector<HTMLElement>(FOCUSABLE);
      (first ?? box).focus({ preventScroll: true });
    }
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape' && closeRef.current) {
        e.stopPropagation();
        closeRef.current();
        return;
      }
      if (e.key !== 'Tab' || !ref.current) return;
      const items = [...ref.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.offsetParent !== null);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === first || !ref.current.contains(document.activeElement))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      if (opener && document.contains(opener)) opener.focus({ preventScroll: true });
    };
  }, [active, ref]);
}

type ConfirmRequest = { title: string; body?: string; confirm: string; cancel?: string; danger?: boolean; resolve: (ok: boolean) => void };
let pushConfirm: ((r: ConfirmRequest) => void) | null = null;

/** In-app replacement for window.confirm(): resolves true when the person presses the confirm button. */
export function askConfirm(opts: { title: string; body?: string; confirm: string; cancel?: string; danger?: boolean }): Promise<boolean> {
  return new Promise((resolve) => {
    if (!pushConfirm) return resolve(window.confirm(opts.body ? `${opts.title}\n\n${opts.body}` : opts.title));
    pushConfirm({ ...opts, resolve });
  });
}

/** Mounted once (in App): shows the dialogs requested through askConfirm(). */
export function ConfirmHost() {
  const [req, setReq] = useState<ConfirmRequest | null>(null);
  useEffect(() => {
    pushConfirm = (r) =>
      setReq((cur) => {
        cur?.resolve(false);
        return r;
      });
    return () => {
      pushConfirm = null;
    };
  }, []);
  if (!req) return null;
  const answer = (ok: boolean) => {
    req.resolve(ok);
    setReq(null);
  };
  return <ConfirmDialog req={req} answer={answer} />;
}

function ConfirmDialog({ req, answer }: { req: ConfirmRequest; answer: (ok: boolean) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useDialog(ref, () => answer(false));
  return (
    <div className="modal-backdrop" onClick={() => answer(false)}>
      <div ref={ref} className="dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby={req.body ? 'confirm-body' : undefined} tabIndex={-1} onClick={(e) => e.stopPropagation()}>
        <h3 id="confirm-title" className="dialog-title">
          {req.title}
        </h3>
        {req.body && (
          <p id="confirm-body" className="small muted">
            {req.body}
          </p>
        )}
        <div className="dialog-actions">
          {/* the safe choice gets the focus, so a stray Enter does not delete anything */}
          <button type="button" className="btn btn-ghost" onClick={() => answer(false)} data-autofocus>
            {req.cancel ?? 'Hủy'}
          </button>
          <button type="button" className={`btn ${req.danger ? 'btn-danger-solid' : 'btn-primary'}`} onClick={() => answer(true)}>
            {req.confirm}
          </button>
        </div>
      </div>
    </div>
  );
}
