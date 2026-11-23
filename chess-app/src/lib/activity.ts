import { get, set } from 'idb-keyval';

/**
 * games: any finished game, endgame practice included (kept for old logs).
 * played: a real game against the engine from the starting position, the one the daily plan asks for.
 */
export type ActivityKind = 'puzzles' | 'games' | 'lessons' | 'played';
export type DayLog = Record<'puzzles' | 'games' | 'lessons', number> & {
  played?: number;
  /** titles of the lessons / book sections / annotated games finished that day */
  learned?: string[];
};
export type ActivityLog = Record<string, DayLog>; // key: YYYY-MM-DD (local)

export function dayKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export async function loadActivity(): Promise<ActivityLog> {
  return (await get<ActivityLog>('activity')) ?? {};
}

/** Record one unit of work today (a solved puzzle, a finished game, a lesson marked done). */
export async function logActivity(kind: ActivityKind, n = 1, title?: string): Promise<void> {
  const log = await loadActivity();
  const k = dayKey();
  const day: DayLog = log[k] ?? { puzzles: 0, games: 0, lessons: 0 };
  day[kind] = ((day[kind] as number | undefined) ?? 0) + n;
  if (title && !(day.learned ?? []).includes(title)) day.learned = [...(day.learned ?? []), title];
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

/** Undo a lesson logged today (the student removed its "learned" mark). */
export async function unlogLesson(title: string): Promise<void> {
  const log = await loadActivity();
  const k = dayKey();
  const day = log[k];
  if (!day || !(day.learned ?? []).includes(title)) return;
  day.learned = (day.learned ?? []).filter((t) => t !== title);
  day.lessons = Math.max(0, (day.lessons ?? 0) - 1);
  log[k] = day;
  await set('activity', log);
}
