import { useEffect, useState, useSyncExternalStore } from 'react';
import { getEngineStatus, subscribeEngineStatus } from '../lib/engine';

const mb = (n: number) => (n / 1048576).toLocaleString('vi-VN', { maximumFractionDigits: 1, minimumFractionDigits: 1 });

/**
 * A small pill at the top of the screen: the Stockfish download in percent on first use, then how far the engine has
 * got whenever it thinks for more than a moment. `hideThinking` for pages that show their own analysis progress.
 */
export default function EngineBadge({ hideThinking = false }: { hideThinking?: boolean }) {
  const s = useSyncExternalStore(subscribeEngineStatus, getEngineStatus);
  // a search shorter than this is not worth a flash on screen
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!s.thinking) return;
    const t = window.setInterval(() => setNow(Date.now()), 150);
    return () => clearInterval(t);
  }, [s.thinking]);

  let text = '';
  let pct: number | null = null;
  let tone = '';
  if (s.phase === 'download') {
    pct = s.total ? s.loaded / s.total : 0;
    text = `Đang tải Stockfish ${Math.round(pct * 100)}% · ${mb(s.loaded)}/${mb(s.total)} MB`;
  } else if (s.phase === 'init') {
    text = 'Đang khởi động Stockfish…';
  } else if (s.phase === 'error') {
    text = 'Không tải được Stockfish. Kiểm tra mạng rồi tải lại trang.';
    tone = 'bad';
  } else if (s.thinking && !hideThinking && now - s.thinking.since > 350) {
    pct = s.thinking.pct;
    text = `Stockfish đang nghĩ ${Math.round(pct * 100)}%`;
  }
  if (!text) return null;
  return (
    <div className={`engine-badge ${tone}`} role="status" aria-live="polite">
      <span>{text}</span>
      {pct !== null && (
        <span className="engine-bar">
          <i style={{ width: `${Math.round(pct * 100)}%` }} />
        </span>
      )}
    </div>
  );
}
