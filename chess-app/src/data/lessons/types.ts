export type VerifyKind = 'best' | 'mate' | 'line';

export interface TaskBlock {
  kind: 'task';
  /** position, side to move = the student */
  fen: string;
  /** solution line in UCI, student moves first; opponent replies are scripted */
  moves: string[];
  /** other accepted first moves (UCI) */
  alternatives?: string[];
  prompt: string;
  explain: string;
  /** how the build-time verifier checks this task */
  verify: VerifyKind;
}

export interface PuzzleSetBlock {
  kind: 'puzzles';
  /** puzzles matching ANY of these Lichess themes */
  themes: string[];
  rating: [number, number];
  count: number;
  intro?: string;
}

export interface DiagramBlock {
  kind: 'diagram';
  fen: string;
  caption: string;
  /** arrows / circles as UCI squares: "e2e4" arrow, "e4" circle */
  marks?: string[];
  /** the verifier checks this is a checkmate position */
  mate?: boolean;
  orientation?: 'white' | 'black';
}

export interface TextBlock {
  kind: 'text';
  /** light markdown: paragraphs, "- " bullets, **bold**, ### heading */
  md: string;
}

export interface SquaresBlock {
  kind: 'squares';
  /** squares the student must tap, in order */
  targets: string[];
  intro: string;
}

export type Block = TaskBlock | PuzzleSetBlock | DiagramBlock | TextBlock | SquaresBlock;

export interface Resource {
  label: string;
  url: string;
  note?: string;
}

export interface Lesson {
  id: string;
  stage: number;
  title: string;
  summary: string;
  minutes: number;
  blocks: Block[];
  resources?: Resource[];
}

export interface Stage {
  n: number;
  title: string;
  elo: string;
  goal: string;
  routine: string;
}
