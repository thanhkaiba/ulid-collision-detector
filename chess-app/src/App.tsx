import { lazy, Suspense } from 'react';
import { useRoute, navigate, type Tab } from './lib/router';
import { Spinner } from './components/ui';

const Learn = lazy(() => import('./pages/Learn'));
const Puzzles = lazy(() => import('./pages/Puzzles'));
const Play = lazy(() => import('./pages/Play'));
const Analyze = lazy(() => import('./pages/Analyze'));
const Settings = lazy(() => import('./pages/Settings'));

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'learn', label: 'Học', icon: '📘' },
  { id: 'puzzles', label: 'Tập', icon: '🧩' },
  { id: 'play', label: 'Chơi', icon: '♟' },
  { id: 'analyze', label: 'Phân tích', icon: '🔍' },
  { id: 'settings', label: 'Cài đặt', icon: '⚙️' },
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
            <span className="tab-icon">{t.icon}</span>
            <span className="tab-label">{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
