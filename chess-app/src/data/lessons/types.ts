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
  /** arrows / circles as UCI squares: "e2e4" arrow, "e4" circle; ":red", ":blue", ":yellow" picks the colour */
  marks?: string[];
  /** highlight the move that led to the position (UCI) */
  lastMove?: string;
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

export interface PracticeBlock {
  kind: 'practice';
  /** ids from src/data/practice.ts: positions to play out against the engine */
  ids: string[];
  intro?: string;
}

/** One fixed puzzle from the Lichess database (a position from a real game, solution checked by Lichess). */
export interface LichessBlock {
  kind: 'lichess';
  /** Lichess puzzle id, must be in src/data/puzzles.json */
  id: string;
  /** what to look for, shown above the board after "Bạn cầm ..." */
  prompt: string;
  /** shown after the puzzle is finished */
  explain?: string;
}

/** A Lichess puzzle shown as a worked example: the board plays the solution by itself, one note per move. */
export interface ExampleBlock {
  kind: 'example';
  id: string;
  caption: string;
  /** one note per solution half-move (after the opponent's setup move) */
  notes: string[];
}

export type Block = TaskBlock | PuzzleSetBlock | DiagramBlock | TextBlock | SquaresBlock | PracticeBlock | LichessBlock | ExampleBlock;

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
