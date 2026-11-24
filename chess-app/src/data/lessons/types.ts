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
  /**
   * moves (SAN) played on from this position by a "▶ Chạy" player under the board, for plans and sequences that are hard
   * to picture. Mark a deliberately bad move with "?" (e.g. "Nxe5?"); the verifier checks the others are sound.
   */
  line?: string[];
  /** a short note per move of `line` ('' for none), shown while that move is on the board */
  lineNotes?: string[];
  /**
   * the moves (SAN) that lead to this diagram from the starting position (or from `introFen`), so the player can show
   * how the position arose; playing them must give exactly `fen` (the verifier checks)
   */
  intro?: string[];
  introFen?: string;
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
