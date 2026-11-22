/**
 * Thin promise-based wrapper around the Stockfish WASM worker (lite single-threaded build,
 * works without cross-origin isolation, so it runs on any static host / PWA).
 */

export interface EngineLine {
  multipv: number;
  depth: number;
  /** centipawns from the side-to-move's point of view (undefined when mate) */
  cp?: number;
  /** mate in N (negative = getting mated) from side-to-move's point of view */
  mate?: number;
  pv: string[]; // UCI moves
}

export interface EvalResult {
  bestmove: string;
  ponder?: string;
  lines: EngineLine[];
  depth: number;
}

export interface GoOptions {
  depth?: number;
  movetime?: number;
  multipv?: number;
  /** called on every `info` line with the current best lines */
  onInfo?: (lines: EngineLine[]) => void;
}

const WORKER_URL = `${import.meta.env.BASE_URL}stockfish/stockfish-17.1-lite-single-03e3232.js`;

export class Engine {
  private worker: Worker;
  private ready: Promise<void>;
  private listeners = new Set<(line: string) => void>();
  private queue: Promise<unknown> = Promise.resolve();
  private options: Record<string, string | number | boolean> = {};
  private searching = false;

  constructor() {
    this.worker = new Worker(WORKER_URL);
    this.worker.onmessage = (e: MessageEvent<string>) => {
      const line = typeof e.data === 'string' ? e.data : String(e.data);
      for (const l of this.listeners) l(line);
    };
    this.ready = new Promise<void>((resolve) => {
      const off = this.on((line) => {
        if (line === 'uciok') {
          off();
          resolve();
        }
      });
      this.send('uci');
    });
  }

  private on(fn: (line: string) => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  send(cmd: string) {
    this.worker.postMessage(cmd);
  }

  async waitReady(): Promise<void> {
    await this.ready;
    await new Promise<void>((resolve) => {
      const off = this.on((line) => {
        if (line === 'readyok') {
          off();
          resolve();
        }
      });
      this.send('isready');
    });
  }

  /** Set a UCI option; applied before the next search. */
  async setOption(name: string, value: string | number | boolean) {
    if (this.options[name] === value) return;
    this.options[name] = value;
    await this.ready;
    this.send(`setoption name ${name} value ${value}`);
  }

  async newGame() {
    await this.ready;
    this.send('ucinewgame');
    await this.waitReady();
  }

  stop() {
    if (this.searching) this.send('stop');
  }

  /**
   * Evaluate a position. Searches are serialized: a new call waits for (or you call stop() on)
   * the previous one.
   */
  evaluate(fen: string, opts: GoOptions = {}): Promise<EvalResult> {
    const run = async (): Promise<EvalResult> => {
      await this.ready;
      await this.setOption('MultiPV', opts.multipv ?? 1);
      await this.waitReady();
      return new Promise<EvalResult>((resolve) => {
        const lines = new Map<number, EngineLine>();
        let depth = 0;
        const off = this.on((line) => {
          if (line.startsWith('info ') && line.includes(' pv ')) {
            const parsed = parseInfo(line);
            if (!parsed) return;
            lines.set(parsed.multipv, parsed);
            depth = Math.max(depth, parsed.depth);
            opts.onInfo?.(sortedLines(lines));
          } else if (line.startsWith('bestmove')) {
            off();
            this.searching = false;
            const parts = line.split(/\s+/);
            resolve({
              bestmove: parts[1],
              ponder: parts[3],
              lines: sortedLines(lines),
              depth,
            });
          }
        });
        this.searching = true;
        this.send(`position fen ${fen}`);
        if (opts.movetime) this.send(`go movetime ${opts.movetime}`);
        else this.send(`go depth ${opts.depth ?? 12}`);
      });
    };
    const p = this.queue.then(run, run);
    this.queue = p.catch(() => undefined);
    return p;
  }

  terminate() {
    this.send('quit');
    this.worker.terminate();
  }
}

function sortedLines(m: Map<number, EngineLine>): EngineLine[] {
  return [...m.values()].sort((a, b) => a.multipv - b.multipv);
}

function parseInfo(line: string): EngineLine | null {
  const tokens = line.split(/\s+/);
  let depth = 0;
  let multipv = 1;
  let cp: number | undefined;
  let mate: number | undefined;
  let pv: string[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t === 'depth') depth = Number(tokens[++i]);
    else if (t === 'multipv') multipv = Number(tokens[++i]);
    else if (t === 'score') {
      const kind = tokens[++i];
      const v = Number(tokens[++i]);
      if (kind === 'cp') cp = v;
      else if (kind === 'mate') mate = v;
    } else if (t === 'pv') {
      pv = tokens.slice(i + 1);
      break;
    }
  }
  if (!pv.length) return null;
  return { multipv, depth, cp, mate, pv };
}

/** Shared engine instance (lazy). The lite build only uses one thread anyway. */
let shared: Engine | null = null;
export function getEngine(): Engine {
  if (!shared) shared = new Engine();
  return shared;
}

/* ---------- evaluation helpers ---------- */

/** Convert a score (side-to-move POV) to White's POV. */
export function toWhitePov(line: { cp?: number; mate?: number }, sideToMove: 'w' | 'b') {
  const sign = sideToMove === 'w' ? 1 : -1;
  return {
    cp: line.cp === undefined ? undefined : line.cp * sign,
    mate: line.mate === undefined ? undefined : line.mate * sign,
  };
}

/** Lichess-style win probability (0..100) for White from a White-POV score. */
export function winPercent(score: { cp?: number; mate?: number }): number {
  if (score.mate !== undefined) return score.mate > 0 ? 100 : 0;
  const cp = Math.max(-1000, Math.min(1000, score.cp ?? 0));
  return 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * cp)) - 1);
}

export function formatScore(score: { cp?: number; mate?: number }): string {
  if (score.mate !== undefined) return score.mate > 0 ? `#${score.mate}` : `#-${-score.mate}`;
  const cp = score.cp ?? 0;
  const v = (cp / 100).toFixed(1);
  return cp > 0 ? `+${v}` : v;
}
