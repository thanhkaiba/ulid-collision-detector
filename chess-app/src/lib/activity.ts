import { get, set } from 'idb-keyval';

export type ActivityKind = 'puzzles' | 'games' | 'lessons';
export type DayLog = Record<ActivityKind, number>;
export type ActivityLog = Record<string, DayLog>; // key: YYYY-MM-DD (local)

export function dayKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export async function loadActivity(): Promise<ActivityLog> {
  return (await get<ActivityLog>('activity')) ?? {};
}

/** Record one unit of work today (a solved puzzle, a finished game, a lesson marked done). */
export async function logActivity(kind: ActivityKind, n = 1): Promise<void> {
  const log = await loadActivity();
  const k = dayKey();
  const day = log[k] ?? { puzzles: 0, games: 0, lessons: 0 };
  day[kind] = (day[kind] ?? 0) + n;
  log[k] = day;
  await set('activity', log);
}

/** Consecutive days with any activity, counting back from today (or yesterday if today is still empty). */
export function streak(log: ActivityLog): number {
  const active = (d: Date) => {
    const x = log[dayKey(d)];
    return !!x && x.puzzles + x.games + x.lessons > 0;
  };
  const d = new Date();
  if (!active(d)) d.setDate(d.getDate() - 1);
  let n = 0;
  while (active(d)) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}
