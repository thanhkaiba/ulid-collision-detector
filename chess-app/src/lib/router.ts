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
  const tab = (['learn', 'puzzles', 'play', 'analyze', 'settings'].includes(parts[0]) ? parts[0] : 'learn') as Tab;
  return { tab, parts: parts.slice(1), query: new URLSearchParams(qs ?? '') };
}

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
