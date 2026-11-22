import type { Engine } from './engine';

export interface Level {
  n: number;
  label: string;
  elo: string;
  skill?: number; // Stockfish Skill Level 0-20
  uciElo?: number; // UCI_LimitStrength
  depth: number;
  movetime: number; // ms cap
}

export const LEVELS: Level[] = [
  { n: 1, label: 'Mới chơi', elo: '~400', skill: 0, depth: 1, movetime: 300 },
  { n: 2, label: 'Tập sự', elo: '~600', skill: 1, depth: 2, movetime: 300 },
  { n: 3, label: 'Cơ bản', elo: '~800', skill: 3, depth: 3, movetime: 400 },
  { n: 4, label: 'Khá', elo: '~1000', skill: 6, depth: 5, movetime: 500 },
  { n: 5, label: 'Câu lạc bộ', elo: '1350', uciElo: 1350, depth: 8, movetime: 700 },
  { n: 6, label: 'Trung cấp', elo: '1600', uciElo: 1600, depth: 10, movetime: 900 },
  { n: 7, label: 'Mạnh', elo: '1900', uciElo: 1900, depth: 12, movetime: 1200 },
  { n: 8, label: 'Chuyên gia', elo: '2200', uciElo: 2200, depth: 14, movetime: 1500 },
  { n: 9, label: 'Kiện tướng', elo: '2600', uciElo: 2600, depth: 16, movetime: 2000 },
  { n: 10, label: 'Tối đa', elo: '3000+', depth: 18, movetime: 3000 },
];

export async function applyLevel(engine: Engine, level: Level) {
  if (level.uciElo) {
    await engine.setOption('Skill Level', 20);
    await engine.setOption('UCI_LimitStrength', true);
    await engine.setOption('UCI_Elo', level.uciElo);
  } else if (level.skill !== undefined) {
    await engine.setOption('UCI_LimitStrength', false);
    await engine.setOption('Skill Level', level.skill);
  } else {
    await engine.setOption('UCI_LimitStrength', false);
    await engine.setOption('Skill Level', 20);
  }
}

export interface TimeControl {
  id: string;
  label: string;
  initial: number; // seconds, 0 = no clock
  inc: number;
}

export const TIME_CONTROLS: TimeControl[] = [
  { id: 'none', label: 'Không giờ', initial: 0, inc: 0 },
  { id: '3+2', label: '3+2', initial: 180, inc: 2 },
  { id: '5+0', label: '5+0', initial: 300, inc: 0 },
  { id: '10+0', label: '10+0', initial: 600, inc: 0 },
  { id: '15+10', label: '15+10', initial: 900, inc: 10 },
  { id: '30+0', label: '30+0', initial: 1800, inc: 0 },
];
