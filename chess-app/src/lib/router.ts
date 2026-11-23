import { useEffect, useState } from 'react';

export type Tab = 'learn' | 'puzzles' | 'play' | 'analyze' | 'settings';

export interface Route {
  tab: Tab;
  /** sub path parts after the tab, e.g. #/learn/lesson-id */
  parts: string[];
  query: URLSearchParams;
}

function parse(): Route {
  const h = window.location.hash.replace(/^#\/?/, '');
  const [path, qs] = h.split('?');
  const parts = path.split('/').filter(Boolean);
  if (!(TABS as string[]).includes(parts[0])) {
    // an unknown or mistyped link opens the start page, and the address says so (the "Học" tab then behaves as at home)
    if (parts.length) {
      try {
        history.replaceState(history.state, '', '#/learn');
      } catch {
        /* ignore */
      }
    }
    return { tab: 'learn', parts: [], query: new URLSearchParams() };
  }
  return { tab: parts[0] as Tab, parts: parts.slice(1), query: new URLSearchParams(qs ?? '') };
}

const TABS: Tab[] = ['learn', 'puzzles', 'play', 'analyze', 'settings'];

export function useRoute(): Route {
  const [r, setR] = useState<Route>(parse);
  useEffect(() => {
    const on = () => setR(parse());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return r;
}

export function navigate(path: string) {
  window.location.hash = path.startsWith('#') ? path : `#/${path.replace(/^\//, '')}`;
}
