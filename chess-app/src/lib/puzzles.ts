export interface Puzzle {
  id: string;
  fen: string; // position BEFORE the opponent's setup move (Lichess convention) unless playerFirst
  moves: string[]; // UCI; moves[0] is the opponent's move unless playerFirst
  rating: number;
  themes: string[];
  playerFirst?: boolean;
  source?: 'lichess' | 'daily' | 'mistake' | 'lesson';
  url?: string;
}

type Row = [string, string, string, number, string];
let cache: Puzzle[] | null = null;

export async function loadPuzzles(): Promise<Puzzle[]> {
  if (cache) return cache;
  const mod = await import('../data/puzzles.json');
  const rows = (mod.default as unknown as Row[]) ?? [];
  cache = rows.map(([id, fen, moves, rating, themes]) => ({
    id,
    fen,
    moves: moves.split(' '),
    rating,
    themes: themes.split(' '),
    source: 'lichess' as const,
    url: `https://lichess.org/training/${id}`,
  }));
  return cache;
}

/** Pick the next puzzle near the user's rating, avoiding ones already seen. */
export function pickPuzzle(all: Puzzle[], rating: number, seen: Record<string, unknown>, theme?: string): Puzzle | null {
  const pool = theme ? all.filter((p) => p.themes.includes(theme)) : all;
  let window = 100;
  while (window <= 1200) {
    const cands = pool.filter((p) => !seen[p.id] && Math.abs(p.rating - rating) <= window);
    if (cands.length >= 5 || (cands.length > 0 && window >= 400)) return cands[Math.floor(Math.random() * cands.length)];
    window += 100;
  }
  // everything seen: recycle the closest ones
  const cands = pool.filter((p) => Math.abs(p.rating - rating) <= 300);
  return cands.length ? cands[Math.floor(Math.random() * cands.length)] : pool[Math.floor(Math.random() * pool.length)] ?? null;
}

export async function fetchDailyPuzzle(): Promise<Puzzle> {
  // never leave the learner on an endless spinner: give up after 15 s
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 15000);
  let data: {
    game: { pgn: string; id: string };
    puzzle: { id: string; rating: number; solution: string[]; themes: string[]; initialPly: number };
  };
  try {
    const res = await fetch('https://lichess.org/api/puzzle/daily', { headers: { Accept: 'application/json' }, signal: ctl.signal });
    if (!res.ok) throw new Error(`Lichess trả lỗi ${res.status}`);
    data = await res.json();
  } finally {
    clearTimeout(timer);
  }
  const { Chess } = await import('chess.js');
  const c = new Chess();
  const sans = data.game.pgn.trim().split(/\s+/);
  // stop before the opponent's last move: the board then shows that move being played (like the other puzzles)
  for (const san of sans.slice(0, -1)) c.move(san);
  const fen = c.fen();
  const last = sans.length ? c.move(sans[sans.length - 1]) : null;
  return {
    id: `daily-${data.puzzle.id}`,
    fen: last ? fen : c.fen(),
    moves: last ? [last.from + last.to + (last.promotion ?? ''), ...data.puzzle.solution] : data.puzzle.solution,
    rating: data.puzzle.rating,
    themes: data.puzzle.themes,
    playerFirst: !last,
    source: 'daily',
    url: `https://lichess.org/training/${data.puzzle.id}`,
  };
}
