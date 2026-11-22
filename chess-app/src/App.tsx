import { lazy, Suspense, type JSX } from 'react';
import { useRoute, navigate, type Tab } from './lib/router';
import { Spinner } from './components/ui';

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
            onClick={() => navigate(t.id)}
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
