import { Capacitor, registerPlugin } from '@capacitor/core';
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
const WASM_URL = `${import.meta.env.BASE_URL}stockfish/stockfish-17.1-lite-single-03e3232.wasm`;
/** decoded size of the wasm file, for the progress bar when the server does not say (compressed transfer) */
const WASM_BYTES = 7280741;

/* ---------- the Android app: the full Stockfish binary run natively (see android/.../StockfishPlugin.java) ---------- */

interface NativeStockfish {
  start(): Promise<{ ok: boolean; cores: number; reason?: string }>;
  send(o: { cmd: string }): Promise<void>;
  addListener(ev: 'line', fn: (e: { line: string }) => void): Promise<unknown>;
  addListener(ev: 'exit', fn: (e: { code: number }) => void): Promise<unknown>;
}
const nativeStockfish: NativeStockfish | null = Capacitor.isNativePlatform() ? registerPlugin<NativeStockfish>('Stockfish') : null;

/* ---------- status shown to the user: download progress, then how far a search has got ---------- */

export interface EngineStatus {
  phase: 'idle' | 'download' | 'init' | 'ready' | 'error';
  /** which engine runs: the full native binary (Android app) or the light WebAssembly build */
  kind?: 'native' | 'wasm';
  threads?: number;
  loaded: number;
  total: number;
  /** a search in progress: 0..1, and when it started (short searches are not worth showing) */
  thinking: { pct: number; since: number } | null;
}
let status: EngineStatus = { phase: 'idle', loaded: 0, total: WASM_BYTES, thinking: null };
const statusSubs = new Set<() => void>();
function setStatus(p: Partial<EngineStatus>) {
  status = { ...status, ...p };
  for (const f of statusSubs) f();
}
export const getEngineStatus = () => status;
export function subscribeEngineStatus(fn: () => void) {
  statusSubs.add(fn);
  return () => {
    statusSubs.delete(fn);
  };
}

/**
 * Download the wasm here (not inside the worker) so the download can be shown as a percentage, then hand it to the
 * worker as a blob URL: the Stockfish loader reads the wasm location from the worker URL's hash.
 */
async function fetchWasm(): Promise<string | null> {
  setStatus({ phase: 'download', loaded: 0 });
  try {
    const res = await fetch(WASM_URL);
    if (!res.ok) throw new Error(String(res.status));
    const len = Number(res.headers.get('content-length'));
    const total = len && !res.headers.get('content-encoding') ? len : WASM_BYTES;
    setStatus({ total });
    let blob: Blob;
    if (res.body) {
      const reader = res.body.getReader();
      const parts: BlobPart[] = [];
      let loaded = 0;
      let shown = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        parts.push(value);
        loaded += value.byteLength;
        if (loaded - shown > total / 100) {
          shown = loaded;
          setStatus({ loaded: Math.min(loaded, total) });
        }
      }
      blob = new Blob(parts, { type: 'application/wasm' });
    } else blob = await res.blob();
    setStatus({ loaded: total });
    return URL.createObjectURL(blob);
  } catch {
    // let the worker fetch it by itself (no percentage then)
    return null;
  }
}

export class Engine {
  private worker: Worker | null = null;
  private ready: Promise<void>;
  private listeners = new Set<(line: string) => void>();
  private queue: Promise<unknown> = Promise.resolve();
  private options: Record<string, string | number | boolean> = {};
  private searching = false;
  /** commands sent before the worker exists */
  private pending: string[] = [];

  constructor() {
    this.ready = (async () => {
      if (nativeStockfish && (await this.bootNative(nativeStockfish))) return;
      const wasm = await fetchWasm();
      setStatus({ phase: 'init' });
      try {
        await this.boot(wasm ? `${WORKER_URL}#${encodeURIComponent(wasm)}` : WORKER_URL);
      } catch (e) {
        // a host that will not let the worker read a blob URL: start again the plain way (it downloads by itself)
        if (!wasm) throw e;
        this.broken = false;
        this.worker?.terminate();
        await this.boot(WORKER_URL);
      }
      setStatus({ phase: 'ready', kind: 'wasm', threads: 1 });
    })();
    this.ready.catch(() => setStatus({ phase: 'error', thinking: null }));
  }

  /** native commands go straight to the process */
  private nativeSend: ((cmd: string) => void) | null = null;

  /** the Android app: start the full Stockfish binary; false when this phone cannot run it (then WebAssembly is used) */
  private async bootNative(n: NativeStockfish): Promise<boolean> {
    setStatus({ phase: 'init' });
    try {
      const r = await n.start();
      if (!r.ok) return false;
      await n.addListener('line', (e) => {
        for (const l of [...this.listeners]) l(e.line);
      });
      await n.addListener('exit', () => {
        this.broken = true;
        setStatus({ phase: 'error', thinking: null });
        for (const l of [...this.listeners]) l('bestmove (none)');
      });
      this.nativeSend = (cmd) => void n.send({ cmd }).catch(() => undefined);
      await new Promise<void>((resolve, reject) => {
        const t = window.setTimeout(() => reject(new Error('no uciok')), 15000);
        const off = this.on((line) => {
          if (line === 'uciok') {
            off();
            clearTimeout(t);
            resolve();
          }
        });
        for (const c of this.pending.splice(0)) this.nativeSend!(c);
        this.nativeSend!('uci');
      });
      // a phone has several cores: leave one for the interface; the hash table is cheap at this size
      const threads = Math.max(1, Math.min(8, r.cores - 1));
      this.nativeSend(`setoption name Threads value ${threads}`);
      this.nativeSend('setoption name Hash value 128');
      setStatus({ phase: 'ready', kind: 'native', threads });
      return true;
    } catch {
      this.nativeSend = null;
      return false;
    }
  }

  /** start the worker and wait for "uciok"; rejects if the worker fails to load */
  private boot(url: string): Promise<void> {
    const worker = new Worker(url);
    this.worker = worker;
    worker.onmessage = (e: MessageEvent<string>) => {
      const line = typeof e.data === 'string' ? e.data : String(e.data);
      for (const l of this.listeners) l(line);
    };
    return new Promise<void>((resolve, reject) => {
      let up = false;
      const off = this.on((line) => {
        if (line === 'uciok') {
          off();
          up = true;
          resolve();
        }
      });
      // the worker could not load (offline before it was cached, blocked file) or crashed: fail fast instead of
      // leaving every caller waiting forever, and end any search in progress as "no move"
      worker.onerror = (e) => {
        e.preventDefault?.();
        this.broken = true;
        if (up) setStatus({ phase: 'error', thinking: null });
        off();
        reject(new Error('engine unavailable'));
        for (const l of [...this.listeners]) l('bestmove (none)');
      };
      for (const c of this.pending.splice(0)) worker.postMessage(c);
      worker.postMessage('uci');
    });
  }

  /** set when the worker failed; getEngine() then starts a fresh one */
  broken = false;

  private on(fn: (line: string) => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  send(cmd: string) {
    if (this.nativeSend) this.nativeSend(cmd);
    else if (this.worker) this.worker.postMessage(cmd);
    else this.pending.push(cmd);
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

  /** Undo any strength limit set for play-vs-computer, so analysis and puzzle checks use full strength. */
  async fullStrength() {
    await this.setOption('UCI_LimitStrength', false);
    await this.setOption('Skill Level', 20);
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
        const target = opts.depth ?? 12;
        const since = Date.now();
        setStatus({ thinking: { pct: 0, since } });
        const tick = opts.movetime
          ? window.setInterval(() => setStatus({ thinking: { pct: Math.min(0.99, (Date.now() - since) / opts.movetime!), since } }), 200)
          : 0;
        const off = this.on((line) => {
          if (line.startsWith('info ') && line.includes(' pv ')) {
            const parsed = parseInfo(line);
            if (!parsed) return;
            lines.set(parsed.multipv, parsed);
            if (!opts.movetime && parsed.depth > depth) setStatus({ thinking: { pct: Math.min(0.99, parsed.depth / target), since } });
            depth = Math.max(depth, parsed.depth);
            opts.onInfo?.(sortedLines(lines));
          } else if (line.startsWith('bestmove')) {
            off();
            if (tick) clearInterval(tick);
            setStatus({ thinking: null });
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
    this.worker?.terminate();
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
  if (!shared || shared.broken) shared = new Engine();
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
