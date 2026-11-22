import { loadSettings, saveSettings, loadPuzzleProgress, savePuzzleProgress, type Settings } from './storage';

export type LevelId = 'new' | 'casual' | 'student' | 'club' | 'advanced';

export interface LevelInfo {
  id: LevelId;
  label: string;
  desc: string;
  puzzleRating: number;
  engineLevel: number;
  timeControl: string;
  /** roadmap starts at this lesson */
  startLesson: string;
  dailyPuzzles: number;
}

export const LEVELS_INFO: LevelInfo[] = [
  { id: 'new', label: 'Chưa biết chơi', desc: 'Chưa biết quân đi thế nào, hoặc mới biết sơ sơ.', puzzleRating: 500, engineLevel: 1, timeControl: 'none', startLesson: 'intro-board', dailyPuzzles: 5 },
  { id: 'casual', label: 'Biết luật, hay mất quân', desc: 'Chơi cho vui, chưa học bài bản. Khoảng 600 đến 900.', puzzleRating: 800, engineLevel: 2, timeControl: '15+10', startLesson: 'piece-values', dailyPuzzles: 10 },
  { id: 'student', label: 'Đã học cơ bản', desc: 'Biết ghim, đòn đôi, nguyên tắc khai cuộc. Khoảng 1000 đến 1300.', puzzleRating: 1100, engineLevel: 4, timeControl: '15+10', startLesson: 'opening-white-italian', dailyPuzzles: 15 },
  { id: 'club', label: 'Chơi thường xuyên', desc: 'Kỳ thủ câu lạc bộ, chơi online hằng ngày. Khoảng 1400 đến 1700.', puzzleRating: 1500, engineLevel: 6, timeControl: '15+10', startLesson: 'pawn-structures', dailyPuzzles: 20 },
  { id: 'advanced', label: 'Nâng cao', desc: 'Từ 1800 trở lên.', puzzleRating: 1800, engineLevel: 7, timeControl: '15+10', startLesson: 'pawn-structures', dailyPuzzles: 25 },
];

export const levelInfo = (id?: string): LevelInfo | undefined => LEVELS_INFO.find((l) => l.id === id);

/** Store the chosen level and align puzzle rating and play-vs-computer defaults with it. */
export async function chooseLevel(id: LevelId): Promise<Settings> {
  const info = levelInfo(id)!;
  const s = { ...(await loadSettings()), level: id };
  await saveSettings(s);
  const pp = await loadPuzzleProgress();
  // only move the puzzle rating while it is still unproven
  if (pp.history.length < 10) await savePuzzleProgress({ ...pp, rating: info.puzzleRating, rd: 250 });
  try {
    const cur = JSON.parse(localStorage.getItem('play-setup') ?? '{}');
    localStorage.setItem('play-setup', JSON.stringify({ color: 'w', ...cur, level: info.engineLevel, tc: info.timeControl }));
  } catch {
    /* ignore */
  }
  return s;
}
