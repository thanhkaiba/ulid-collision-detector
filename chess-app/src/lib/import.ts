import { Chess } from 'chess.js';
import type { StoredGame } from './storage';

function pgnToMoves(pgn: string): { moves: string[]; headers: Record<string, string> } {
  const c = new Chess();
  c.loadPgn(pgn);
  return { moves: c.history(), headers: c.getHeaders() as Record<string, string> };
}

export async function fetchLichessGames(user: string, max = 30): Promise<StoredGame[]> {
  const url = `https://lichess.org/api/games/user/${encodeURIComponent(user)}?max=${max}&pgnInJson=true&evals=true&opening=true&moves=true`;
  const res = await fetch(url, { headers: { Accept: 'application/x-ndjson' } });
  if (res.status === 404) throw new Error(`Không tìm thấy người chơi "${user}" trên Lichess`);
  if (!res.ok) throw new Error(`Lichess trả về ${res.status}`);
  const text = await res.text();
  const games: StoredGame[] = [];
  for (const line of text.split('\n')) {
    if (!line.trim()) continue;
    const g = JSON.parse(line);
    if (g.variant && g.variant !== 'standard') continue;
    const wName = g.players?.white?.user?.name ?? (g.players?.white?.aiLevel ? `Stockfish ${g.players.white.aiLevel}` : 'Ẩn danh');
    const bName = g.players?.black?.user?.name ?? (g.players?.black?.aiLevel ? `Stockfish ${g.players.black.aiLevel}` : 'Ẩn danh');
    const me = wName.toLowerCase() === user.toLowerCase() ? 'w' : bName.toLowerCase() === user.toLowerCase() ? 'b' : undefined;
    const result = g.winner === 'white' ? '1-0' : g.winner === 'black' ? '0-1' : g.status === 'draw' || g.status === 'stalemate' ? '1/2-1/2' : '*';
    const moves: string[] = (g.moves ?? '').split(' ').filter(Boolean);
    const serverEvals = Array.isArray(g.analysis)
      ? (g.analysis as { eval?: number; mate?: number }[]).map((a) =>
          a.mate !== undefined ? { mate: a.mate } : a.eval !== undefined ? { cp: a.eval } : null,
        )
      : undefined;
    games.push({
      id: `li-${g.id}`,
      source: 'lichess',
      white: wName,
      black: bName,
      whiteElo: g.players?.white?.rating,
      blackElo: g.players?.black?.rating,
      result,
      date: g.createdAt ?? Date.now(),
      me,
      pgn: g.pgn ?? '',
      moves,
      speed: g.speed,
      opening: g.opening?.name,
      url: `https://lichess.org/${g.id}`,
      serverEvals,
    });
  }
  return games;
}

export async function fetchChesscomGames(user: string, max = 30): Promise<StoredGame[]> {
  const u = encodeURIComponent(user.toLowerCase());
  const arch = await fetch(`https://api.chess.com/pub/player/${u}/games/archives`);
  if (arch.status === 404) throw new Error(`Không tìm thấy người chơi "${user}" trên Chess.com`);
  if (!arch.ok) throw new Error(`Chess.com trả về ${arch.status}`);
  const { archives } = (await arch.json()) as { archives: string[] };
  const out: StoredGame[] = [];
  for (const url of [...archives].reverse().slice(0, 3)) {
    const res = await fetch(url);
    if (!res.ok) continue;
    const { games } = (await res.json()) as { games: Record<string, any>[] };
    for (const g of [...games].reverse()) {
      if (g.rules !== 'chess' || !g.pgn) continue;
      let parsed;
      try {
        parsed = pgnToMoves(g.pgn);
      } catch {
        continue;
      }
      const wName = g.white?.username ?? '?';
      const bName = g.black?.username ?? '?';
      const me = wName.toLowerCase() === user.toLowerCase() ? 'w' : bName.toLowerCase() === user.toLowerCase() ? 'b' : undefined;
      out.push({
        id: `cc-${String(g.url ?? g.end_time).split('/').pop()}`,
        source: 'chesscom',
        white: wName,
        black: bName,
        whiteElo: g.white?.rating,
        blackElo: g.black?.rating,
        result: parsed.headers.Result ?? '*',
        date: (g.end_time ?? 0) * 1000,
        me,
        pgn: g.pgn,
        moves: parsed.moves,
        speed: g.time_class,
        opening: parsed.headers.ECOUrl?.split('/').pop()?.replace(/-/g, ' '),
        url: g.url,
      });
      if (out.length >= max) return out;
    }
  }
  return out;
}

export function importPgn(pgnText: string, meName?: string): StoredGame[] {
  // split multiple games on blank line before [Event
  const chunks = pgnText
    .replace(/\r/g, '')
    .split(/\n\s*\n(?=\[Event)/)
    .map((s) => s.trim())
    .filter(Boolean);
  const out: StoredGame[] = [];
  for (const chunk of chunks) {
    try {
      const { moves, headers } = pgnToMoves(chunk);
      if (!moves.length) continue;
      const white = headers.White ?? 'Trắng';
      const black = headers.Black ?? 'Đen';
      const me = meName
        ? white.toLowerCase() === meName.toLowerCase()
          ? 'w'
          : black.toLowerCase() === meName.toLowerCase()
            ? 'b'
            : undefined
        : undefined;
      const dateStr = headers.Date ?? headers.UTCDate;
      const date = dateStr && /^\d{4}\.\d{2}\.\d{2}$/.test(dateStr) ? new Date(dateStr.replace(/\./g, '-')).getTime() : Date.now();
      out.push({
        id: `pgn-${hash(chunk)}`,
        source: 'pgn',
        white,
        black,
        whiteElo: headers.WhiteElo ? Number(headers.WhiteElo) : undefined,
        blackElo: headers.BlackElo ? Number(headers.BlackElo) : undefined,
        result: headers.Result ?? '*',
        date,
        me,
        pgn: chunk,
        moves,
        opening: headers.Opening,
        url: headers.Site?.startsWith('http') ? headers.Site : undefined,
      });
    } catch {
      /* skip invalid */
    }
  }
  return out;
}

function hash(s: string): string {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}
