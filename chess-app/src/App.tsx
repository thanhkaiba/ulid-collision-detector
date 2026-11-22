import { lazy, Suspense, useLayoutEffect, type JSX } from 'react';
import { useRoute, navigate, type Tab } from './lib/router';
import { Spinner } from './components/ui';

/**
 * Scroll per history entry: a new page opens at the top, while browser back/forward (and a reload) return to where the
 * reader was. Entries are tagged with an id in history.state; positions live in sessionStorage so they survive a reload.
 * Pages load their content asynchronously, so the restore keeps retrying until the page is tall enough (or the user
 * touches the screen).
 */
const SCROLL_KEY = 'scroll-pos';
const scrollMem: Record<string, number> = (() => {
  try {
    return JSON.parse(sessionStorage.getItem(SCROLL_KEY) ?? '{}') as Record<string, number>;
  } catch {
    return {};
  }
})();
let flushTimer = 0;
function rememberScroll(entry: string, y: number) {
  scrollMem[entry] = y;
  window.clearTimeout(flushTimer);
  flushTimer = window.setTimeout(() => {
    try {
      sessionStorage.setItem(SCROLL_KEY, JSON.stringify(scrollMem));
    } catch {
      /* ignore */
    }
  }, 150);
}
function useScrollMemory(routeKey: string) {
  useLayoutEffect(() => {
    try {
      history.scrollRestoration = 'manual';
    } catch {
      /* ignore */
    }
    let id = (history.state as { k?: string } | null)?.k;
    const fresh = !id;
    if (!id) {
      id = Math.random().toString(36).slice(2);
      try {
        history.replaceState({ ...((history.state as object | null) ?? {}), k: id }, '');
      } catch {
        /* ignore */
      }
    }
    const entry = id;
    const target = fresh ? 0 : (scrollMem[entry] ?? 0);
    let restoring = true;
    let raf = 0;
    const t0 = performance.now();
    const step = () => {
      if (!restoring) return;
      window.scrollTo(0, target);
      if (Math.abs(window.scrollY - target) > 2 && performance.now() - t0 < 2500) raf = requestAnimationFrame(step);
      else restoring = false;
    };
    step();
    const stop = () => {
      restoring = false;
    };
    const onScroll = () => {
      if (!restoring) rememberScroll(entry, Math.round(window.scrollY));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('touchstart', stop, { passive: true });
    window.addEventListener('wheel', stop, { passive: true });
    window.addEventListener('keydown', stop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('touchstart', stop);
      window.removeEventListener('wheel', stop);
      window.removeEventListener('keydown', stop);
    };
  }, [routeKey]);
}

const Learn = lazy(() => import('./pages/Learn'));
const Puzzles = lazy(() => import('./pages/Puzzles'));
const Play = lazy(() => import('./pages/Play'));
const Analyze = lazy(() => import('./pages/Analyze'));
const Settings = lazy(() => import('./pages/Settings'));

const ICON: Record<Tab, JSX.Element> = {
  learn: (
    <svg viewBox="0 0 24 24"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" /><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5" /><path d="M9 8h7M9 11.5h5" /></svg>
  ),
  puzzles: (
    <svg viewBox="0 0 24 24"><path d="M13 2 4.5 13.5H12L11 22l8.5-11.5H12z" /></svg>
  ),
  play: (
    <svg viewBox="0 0 24 24"><circle cx="12" cy="5.5" r="2.5" /><path d="M9.5 10h5l-1 6h-3zM7 21h10l-1.5-5h-7z" /></svg>
  ),
  analyze: (
    <svg viewBox="0 0 24 24"><path d="M3 20h18" /><path d="M5 16l4.5-5 3.5 3 6-7" /><circle cx="19" cy="7" r="1.6" /></svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" /><path d="M12 2.5v3M12 18.5v3M21.5 12h-3M5.5 12h-3M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1M18.7 18.7l-2.1-2.1M7.4 7.4 5.3 5.3" /></svg>
  ),
};

const TABS: { id: Tab; label: string }[] = [
  { id: 'learn', label: 'Học' },
  { id: 'puzzles', label: 'Tập' },
  { id: 'play', label: 'Chơi' },
  { id: 'analyze', label: 'Phân tích' },
  { id: 'settings', label: 'Cài đặt' },
];

export default function App() {
  const route = useRoute();
  useScrollMemory(`${route.tab}/${route.parts.join('/')}?${route.query.toString()}`);
  const Page = { learn: Learn, puzzles: Puzzles, play: Play, analyze: Analyze, settings: Settings }[route.tab];
  return (
    <div className="app">
      <main className="page">
        <Suspense fallback={<Spinner label="Đang tải..." />}>
          <Page route={route} />
        </Suspense>
      </main>
      <nav className="tabbar">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`tab ${route.tab === t.id ? 'active' : ''}`}
            onClick={() => {
              // tapping the tab you are already on (at its start page) scrolls back to the top, as in native apps
              if (route.tab === t.id && route.parts.length === 0) window.scrollTo({ top: 0, behavior: 'smooth' });
              else navigate(t.id);
            }}
            aria-current={route.tab === t.id ? 'page' : undefined}
            aria-label={t.label}
          >
            <span className="tab-icon">{ICON[t.id]}</span>
            <span className="tab-label">{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
