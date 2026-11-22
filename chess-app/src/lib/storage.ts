import { get, set, del, keys } from 'idb-keyval';

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
  return { ...DEFAULT_SETTINGS, ...((await get<Partial<Settings>>('settings')) ?? {}) };
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
  return { ...DEFAULT_PUZZLE_PROGRESS, ...((await get<Partial<PuzzleProgress>>('puzzles')) ?? {}) };
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
  return { done: {}, read: {}, status: {}, ...((await get<Partial<LessonProgress>>('lessons')) ?? {}) };
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
  return (await get<StoredGame[]>('games')) ?? [];
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
  return get<GameAnalysis>(`analysis:${gameId}`);
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
  return (await get<Mistake[]>('mistakes')) ?? [];
}
export async function saveMistakes(m: Mistake[]) {
  await set('mistakes', m);
}
