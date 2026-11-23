import { get as idbGet, set as idbSet, del as idbDel, keys as idbKeys, clear as idbClear } from 'idb-keyval';

/*
 * IndexedDB can be missing or blocked (some private modes, disabled site data, a full disk). The app must still work for
 * the session then: every write also lands in this in-memory copy, and a failed read falls back to it.
 */
const memory = new Map<string, unknown>();
/** keys whose last write reached only the in-memory copy */
const unsaved = new Set<string>();
const copy = <T>(v: T): T => {
  try {
    return structuredClone(v);
  } catch {
    return v;
  }
};
export async function get<T>(key: string): Promise<T | undefined> {
  if (unsaved.has(key)) return copy(memory.get(key) as T | undefined);
  try {
    return await idbGet<T>(key);
  } catch {
    return copy(memory.get(key) as T | undefined);
  }
}
export async function set(key: string, value: unknown): Promise<void> {
  memory.set(key, copy(value));
  try {
    await idbSet(key, value);
    unsaved.delete(key);
  } catch {
    unsaved.add(key); // kept in memory for this session
  }
}
export async function del(key: string): Promise<void> {
  memory.delete(key);
  unsaved.delete(key);
  try {
    await idbDel(key);
  } catch {
    unsaved.add(key); // reads must not bring the deleted value back
  }
}
async function keys(): Promise<IDBValidKey[]> {
  try {
    return await idbKeys();
  } catch {
    return [...memory.keys()];
  }
}
/** Wipe everything stored in IndexedDB (and its in-memory stand-in). */
export async function clearAll(): Promise<void> {
  memory.clear();
  unsaved.clear();
  try {
    await idbClear();
  } catch {
    /* ignore */
  }
}

/** stored values come from older versions or a damaged database: keep only what has the expected shape */
const obj = <T extends object>(v: unknown): Partial<T> => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Partial<T>) : {});
const rec = (v: unknown) => (v && typeof v === 'object' && !Array.isArray(v) ? v : {});
const arr = <T>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
const num = (v: unknown, d: number) => (typeof v === 'number' && Number.isFinite(v) ? v : d);

export interface Settings {
  lichessUser: string;
  chesscomUser: string;
  analysisDepth: number;
  boardTheme: 'brown' | 'blue' | 'green';
  sound: boolean;
  /** self-declared level chosen on first run (see lib/level.ts) */
  level?: string;
}

export const DEFAULT_SETTINGS: Settings = {
  lichessUser: '',
  chesscomUser: '',
  analysisDepth: 14,
  boardTheme: 'brown',
  sound: true,
};

export async function loadSettings(): Promise<Settings> {
  return { ...DEFAULT_SETTINGS, ...obj<Settings>(await get('settings')) };
}
export async function saveSettings(s: Settings) {
  await set('settings', s);
}

export interface PuzzleProgress {
  rating: number;
  rd: number; // our confidence: shrinks as you solve
  solved: Record<string, 1 | 0>; // puzzleId -> 1 win / 0 fail
  history: { id: string; ok: boolean; rating: number; at: number }[];
  streakBest: number;
}

export const DEFAULT_PUZZLE_PROGRESS: PuzzleProgress = {
  rating: 1200,
  rd: 350,
  solved: {},
  history: [],
  streakBest: 0,
};

export async function loadPuzzleProgress(): Promise<PuzzleProgress> {
  const p = obj<PuzzleProgress>(await get('puzzles'));
  return {
    ...DEFAULT_PUZZLE_PROGRESS,
    ...p,
    rating: num(p.rating, DEFAULT_PUZZLE_PROGRESS.rating),
    rd: num(p.rd, DEFAULT_PUZZLE_PROGRESS.rd),
    solved: rec(p.solved) as PuzzleProgress['solved'],
    history: arr(p.history),
    streakBest: num(p.streakBest, 0),
  };
}
export async function savePuzzleProgress(p: PuzzleProgress) {
  await set('puzzles', p);
}

export interface LessonProgress {
  /** lessonId -> set of completed task indices */
  /**
   * lessonId -> exercises passed, as stable keys (see exerciseKey in Learn.tsx).
   * Older versions stored block indices (numbers); those are still read for lessons whose layout did not change.
   */
  done: Record<string, (number | string)[]>;
  read: Record<string, 1>;
  /** manual marks: lesson id or `book:p.c.s` -> done / skipped */
  status: Record<string, 'done' | 'skipped'>;
}
export async function loadLessonProgress(): Promise<LessonProgress> {
  const p = obj<LessonProgress>(await get('lessons'));
  return { ...p, done: rec(p.done) as LessonProgress['done'], read: rec(p.read) as LessonProgress['read'], status: rec(p.status) as LessonProgress['status'] };
}
/** Set or clear (undefined) a manual mark. Returns the updated progress. */
export async function setLessonStatus(key: string, value: 'done' | 'skipped' | undefined): Promise<LessonProgress> {
  const p = await loadLessonProgress();
  const status = { ...p.status };
  if (value) status[key] = value;
  else delete status[key];
  const next = { ...p, status };
  await saveLessonProgress(next);
  return next;
}
export async function saveLessonProgress(p: LessonProgress) {
  await set('lessons', p);
}

/** A game stored locally: played in the app or imported. */
export interface StoredGame {
  id: string;
  source: 'app' | 'lichess' | 'chesscom' | 'pgn';
  white: string;
  black: string;
  whiteElo?: number;
  blackElo?: number;
  result: string;
  date: number;
  /** which side the user played, if known */
  me?: 'w' | 'b';
  pgn: string;
  /** SAN moves, for quick access */
  moves: string[];
  speed?: string;
  opening?: string;
  url?: string;
  /** Lichess server analysis if available (White POV cp / mate per ply, index 0 = after move 1) */
  serverEvals?: ({ cp?: number; mate?: number } | null)[];
}

export async function loadGames(): Promise<StoredGame[]> {
  return arr<StoredGame>(await get('games'));
}
export async function saveGames(games: StoredGame[]) {
  await set('games', games);
}
export async function upsertGames(newGames: StoredGame[]): Promise<StoredGame[]> {
  const games = await loadGames();
  const byId = new Map(games.map((g) => [g.id, g]));
  for (const g of newGames) byId.set(g.id, { ...byId.get(g.id), ...g });
  const all = [...byId.values()].sort((a, b) => b.date - a.date).slice(0, 400);
  await saveGames(all);
  return all;
}

export type Judgment = 'best' | 'good' | 'inaccuracy' | 'mistake' | 'blunder' | 'book';

export interface PlyAnalysis {
  /** ply index (0 = after first move) */
  ply: number;
  san: string;
  uci: string;
  fenBefore: string;
  /** eval of the position BEFORE this move, White POV */
  evalBefore: { cp?: number; mate?: number };
  /** eval AFTER this move, White POV */
  evalAfter: { cp?: number; mate?: number };
  best: string; // UCI best move in fenBefore
  bestSan: string;
  bestPv: string[];
  /** opponent's best line AFTER the played move (UCI); stored for moves that lost ground */
  refPv?: string[];
  judgment: Judgment;
  winLoss: number; // win% lost by the mover (0..100)
}

export interface GameAnalysis {
  gameId: string;
  depth: number;
  at: number;
  plies: PlyAnalysis[];
  accuracy: { w: number; b: number };
  counts: { w: Record<Judgment, number>; b: Record<Judgment, number> };
}

export async function loadAnalysis(gameId: string): Promise<GameAnalysis | undefined> {
  const a = await get<GameAnalysis>(`analysis:${gameId}`);
  return a && typeof a === 'object' && Array.isArray(a.plies) ? a : undefined;
}
export async function saveAnalysis(a: GameAnalysis) {
  await set(`analysis:${a.gameId}`, a);
}
export async function deleteAnalysis(gameId: string) {
  await del(`analysis:${gameId}`);
}
export async function listAnalyzedIds(): Promise<string[]> {
  const ks = await keys();
  return ks.filter((k) => typeof k === 'string' && k.startsWith('analysis:')).map((k) => (k as string).slice(9));
}

/** Mistakes harvested from your own games, replayed as puzzles. */
export interface Mistake {
  id: string; // gameId:ply
  gameId: string;
  ply: number;
  fen: string; // position before your mistake
  played: string; // UCI
  playedSan: string;
  best: string; // UCI
  bestSan: string;
  bestPv: string[];
  judgment: Judgment;
  winLoss: number;
  color: 'w' | 'b';
  at: number;
  /** spaced repetition */
  due: number;
  interval: number; // days
  reps: number;
}

export async function loadMistakes(): Promise<Mistake[]> {
  return arr<Mistake>(await get('mistakes'));
}
export async function saveMistakes(m: Mistake[]) {
  await set('mistakes', m);
}
