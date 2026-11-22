import { Chess } from 'chess.js';
import type { StoredGame } from './storage';

function pgnToMoves(pgn: string): { moves: string[]; headers: Record<string, string>; result?: string } {
  const c = new Chess();
  c.loadPgn(pgn);
  // chess.js fills missing tags with "?" placeholders: treat those as absent
  const headers: Record<string, string> = {};
  for (const [k, v] of Object.entries(c.getHeaders() as Record<string, string>)) {
    if (v && !/^[?.\s]+$/.test(v)) headers[k] = v;
  }
  // a game without a Result tag that ends in mate/stalemate still has a known result
  const result = c.isCheckmate() ? (c.turn() === 'w' ? '0-1' : '1-0') : c.isDraw() || c.isStalemate() ? '1/2-1/2' : undefined;
  return { moves: c.history(), headers, result };
}

/** fetch() that turns a network failure into a clear Vietnamese message. */
async function get(url: string, site: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch {
    throw new Error(`Không kết nối được tới ${site}. Kiểm tra mạng rồi thử lại, hoặc dán PGN của ván vào ô bên dưới.`);
  }
}

function httpError(site: string, status: number): Error {
  if (status === 429) return new Error(`${site} đang giới hạn số lần tải. Đợi khoảng một phút rồi thử lại.`);
  if (status >= 500) return new Error(`Máy chủ ${site} đang gặp sự cố (mã ${status}). Thử lại sau.`);
  return new Error(`${site} từ chối yêu cầu (mã ${status}). Kiểm tra lại tên người dùng.`);
}

export async function fetchLichessGames(user: string, max = 30): Promise<StoredGame[]> {
  const url = `https://lichess.org/api/games/user/${encodeURIComponent(user)}?max=${max}&pgnInJson=true&evals=true&opening=true&moves=true`;
  const res = await get(url, 'Lichess', { headers: { Accept: 'application/x-ndjson' } });
  if (res.status === 404) throw new Error(`Không tìm thấy người chơi "${user}" trên Lichess`);
  if (!res.ok) throw httpError('Lichess', res.status);
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
  const arch = await get(`https://api.chess.com/pub/player/${u}/games/archives`, 'Chess.com');
  if (arch.status === 404) throw new Error(`Không tìm thấy người chơi "${user}" trên Chess.com`);
  if (!arch.ok) throw httpError('Chess.com', arch.status);
  const { archives } = (await arch.json()) as { archives: string[] };
  const out: StoredGame[] = [];
  for (const url of [...archives].reverse().slice(0, 3)) {
    const res = await get(url, 'Chess.com');
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
        result: parsed.headers.Result ?? parsed.result ?? '*',
        date: (g.end_time ?? 0) * 1000,
        me,
        pgn: g.pgn,
        moves: parsed.moves,
        speed: g.time_class,
        // the URL slug spells castling "O-O": keep it, only turn the word separators into spaces
        opening: parsed.headers.ECOUrl?.split('/').pop()
          ?.replace(/O-O-O/g, '\u0001')
          .replace(/O-O/g, '\u0002')
          .replace(/-/g, ' ')
          .replace(/\u0001/g, 'O-O-O')
          .replace(/\u0002/g, 'O-O'),
        url: g.url,
      });
      if (out.length >= max) return out;
    }
  }
  return out;
}

/**
 * Split pasted text into one chunk per game. A game is an optional block of [Tag "..."] lines followed by
 * movetext; games without tags (just "1. e4 e5 ...") are recognised too.
 */
function splitPgn(text: string): string[] {
  const blocks = text
    .replace(/\r/g, '')
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  const games: string[] = [];
  let tags = '';
  let moves = '';
  const flush = () => {
    if (tags || moves) games.push(tags && moves ? `${tags}\n\n${moves}` : tags || moves);
    tags = '';
    moves = '';
  };
  for (const b of blocks) {
    const lines = b.split('\n');
    const tagLines = lines.filter((l) => /^\s*\[\w+\s+".*"\]\s*$/.test(l)).length;
    if (tagLines === lines.length) {
      // a new tag section starts a new game
      if (moves || tags) flush();
      tags = b;
    } else if (tagLines > 0 && /^\s*\[/.test(lines[0])) {
      // tags and movetext without a blank line between them: a whole game
      flush();
      games.push(b);
    } else {
      if (moves) flush();
      moves = b;
    }
  }
  flush();
  return games;
}

/** Parse pasted PGN text. `meNames`: the user's account names, to know which side they played. */
export function parsePgnText(pgnText: string, meNames: string[] = []): { games: StoredGame[]; failed: number } {
  const names = meNames.map((n) => n.trim().toLowerCase()).filter(Boolean);
  const chunks = splitPgn(pgnText);
  const out: StoredGame[] = [];
  let failed = 0;
  for (const chunk of chunks) {
    try {
      const { moves, headers, result } = pgnToMoves(chunk);
      if (!moves.length) {
        failed++;
        continue;
      }
      const white = headers.White ?? 'Trắng';
      const black = headers.Black ?? 'Đen';
      const me = names.includes(white.toLowerCase()) ? 'w' : names.includes(black.toLowerCase()) ? 'b' : undefined;
      const dateStr = headers.Date ?? headers.UTCDate;
      const date = dateStr && /^\d{4}\.\d{2}\.\d{2}$/.test(dateStr) ? new Date(dateStr.replace(/\./g, '-')).getTime() : Date.now();
      out.push({
        id: `pgn-${hash(chunk)}`,
        source: 'pgn',
        white,
        black,
        whiteElo: headers.WhiteElo ? Number(headers.WhiteElo) : undefined,
        blackElo: headers.BlackElo ? Number(headers.BlackElo) : undefined,
        result: headers.Result && headers.Result !== '*' ? headers.Result : (result ?? '*'),
        date,
        // leave `me` out when unknown, so pasting the game again keeps the side the user picked earlier
        ...(me ? { me } : {}),
        pgn: chunk,
        moves,
        opening: headers.Opening,
        url: headers.Site?.startsWith('http') ? headers.Site : undefined,
      });
    } catch {
      failed++;
    }
  }
  return { games: out, failed };
}

export function importPgn(pgnText: string, meName?: string | string[]): StoredGame[] {
  return parsePgnText(pgnText, meName === undefined ? [] : Array.isArray(meName) ? meName : [meName]).games;
}

function hash(s: string): string {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}
