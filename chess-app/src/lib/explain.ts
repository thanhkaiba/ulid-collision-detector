import { Chess, type Square, type PieceSymbol, type Color } from 'chess.js';
import { formatScore, winPercent } from './engine';
import { playUci, uciLineToSan } from './chess-utils';
import type { Judgment, PlyAnalysis } from './storage';

/**
 * Rule-based explanation, in words, of why a move was a mistake.
 * Everything is derived from the stored analysis (evals, best line, refutation line): no engine call.
 */

export type ErrorCategory = 'mate' | 'hang' | 'tactic' | 'missed' | 'positional';
export type Phase = 'opening' | 'middlegame' | 'endgame';

export const CATEGORY_VI: Record<ErrorCategory, string> = {
  mate: 'Để bị chiếu hết',
  hang: 'Bỏ quên quân',
  tactic: 'Dính đòn chiến thuật',
  missed: 'Bỏ lỡ cơ hội',
  positional: 'Sai về thế trận',
};
export const PHASE_VI: Record<Phase, string> = { opening: 'Khai cuộc', middlegame: 'Trung cuộc', endgame: 'Tàn cuộc' };

export interface Explanation {
  category: ErrorCategory;
  /** one or two Vietnamese sentences */
  text: string;
  /** line that proves the point, SAN, starting from the position BEFORE the move */
  line?: string[];
  /** true when `line` starts with the played move (refutation), false when it is the better line */
  lineIsRefutation?: boolean;
}

const VAL: Record<PieceSymbol, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
const NAME: Record<PieceSymbol, string> = { p: 'Tốt', n: 'Mã', b: 'Tượng', r: 'Xe', q: 'Hậu', k: 'Vua' };

function balance(c: Chess, side: Color): number {
  let s = 0;
  for (const row of c.board()) for (const p of row) if (p) s += p.color === side ? VAL[p.type] : -VAL[p.type];
  return s;
}

export function phaseOf(fen: string, ply: number): Phase {
  const c = new Chess(fen);
  let heavy = 0;
  for (const row of c.board()) for (const p of row) if (p && p.type !== 'p' && p.type !== 'k') heavy += VAL[p.type];
  if (heavy <= 26) return 'endgame';
  if (ply < 20) return 'opening';
  return 'middlegame';
}

interface Walk {
  /** material gained by `side` at the end of the (quiet-trimmed) line */
  delta: number;
  sans: string[];
  /** captures made by the opponent of `side`: piece taken and where */
  lost: { type: PieceSymbol; square: string; index: number }[];
  gained: { type: PieceSymbol; square: string; index: number }[];
}

/** Play a UCI line and measure the material swing for `side`. The line is cut where it turns quiet. */
function walk(fen: string, uci: string[], side: Color, maxLen = 9): Walk {
  const c = new Chess(fen);
  const start = balance(c, side);
  const steps: { san: string; bal: number; capture?: PieceSymbol; to: string; by: Color }[] = [];
  for (const u of uci.slice(0, maxLen + 1)) {
    const by = c.turn();
    const m = playUci(c, u);
    if (!m) break;
    steps.push({ san: m.san, bal: balance(c, side), capture: m.captured as PieceSymbol | undefined, to: m.to, by });
  }
  // cut the line before a capture that we would otherwise see only half of an exchange for
  let end = Math.min(steps.length, maxLen);
  while (end > 1 && end < steps.length && steps[end].capture) end--;
  if (end === steps.length && end > 1 && steps[end - 1].capture && end % 2 === 1 && steps.length >= maxLen) end--;
  const used = steps.slice(0, end);
  const lost: Walk['lost'] = [];
  const gained: Walk['gained'] = [];
  used.forEach((s, i) => {
    if (!s.capture) return;
    (s.by === side ? gained : lost).push({ type: s.capture, square: s.to, index: i });
  });
  return { delta: used.length ? used[used.length - 1].bal - start : 0, sans: used.map((s) => s.san), lost, gained };
}

const pts = (n: number) => {
  const r = Math.round(n);
  return r <= 1 ? 'một Tốt' : `khoảng ${r} điểm quân`;
};

const moveNo = (ply: number) => `${Math.floor(ply / 2) + 1}${ply % 2 === 0 ? '.' : '...'}`;

/** Squares of `victim` pieces attacked by the piece standing on `from`. */
function targetsOf(c: Chess, from: Square, attacker: Color): { type: PieceSymbol; square: Square; defended: boolean }[] {
  const victim: Color = attacker === 'w' ? 'b' : 'w';
  const out: { type: PieceSymbol; square: Square; defended: boolean }[] = [];
  for (const row of c.board())
    for (const p of row) {
      if (!p || p.color !== victim) continue;
      if (c.attackers(p.square, attacker).includes(from)) out.push({ type: p.type, square: p.square, defended: c.attackers(p.square, victim).length > 0 });
    }
  return out;
}

function mateIn(score: { cp?: number; mate?: number }, forSide: Color): number | null {
  if (score.mate === undefined) return null;
  const forWhite = score.mate > 0 || Object.is(score.mate, 0);
  if ((forSide === 'w') !== forWhite) return null;
  return Math.abs(score.mate);
}

const flip = (s: { cp?: number; mate?: number }) => ({ cp: s.cp === undefined ? undefined : -s.cp, mate: s.mate === undefined ? undefined : -s.mate });

function listPieces(items: { type: PieceSymbol; square: string }[]): string {
  const names = items.slice(0, 3).map((g) => `${NAME[g.type]} ${g.square}`);
  if (names.length <= 1) return names.join('');
  return `${names.slice(0, -1).join(', ')} và ${names[names.length - 1]}`;
}

export function isError(j: Judgment): boolean {
  return j === 'inaccuracy' || j === 'mistake' || j === 'blunder';
}

/**
 * @param mine true when the move was played by the user: the text then addresses "bạn" and adds a habit to train.
 */
export function explainPly(p: PlyAnalysis, prev?: PlyAnalysis, mine = true): Explanation {
  const side: Color = p.ply % 2 === 0 ? 'w' : 'b';
  const opp: Color = side === 'w' ? 'b' : 'w';
  const S = mine ? 'Bạn' : side === 'w' ? 'Trắng' : 'Đen';
  const s = mine ? 'bạn' : S;
  const O = mine ? 'đối phương' : side === 'w' ? 'Đen' : 'Trắng';
  const tip = (t: string) => (mine ? ` ${t}` : '');
  const best = p.bestSan;
  const bestLine = uciLineToSan(p.fenBefore, p.bestPv.slice(0, 7));
  const refUci = [p.uci, ...(p.refPv ?? [])];
  const afterOppBlunder = !!prev && (prev.judgment === 'mistake' || prev.judgment === 'blunder');
  const punish = afterOppBlunder ? ` ${O[0].toUpperCase()}${O.slice(1)} vừa đi sai ở nước trước, đây chính là lúc trừng phạt.` : '';

  // 1. mate
  const matedAfter = mateIn(p.evalAfter, opp);
  const matedBefore = mateIn(p.evalBefore, opp);
  if (matedAfter !== null && matedBefore === null) {
    const line = uciLineToSan(p.fenBefore, refUci.slice(0, 2 * matedAfter + 1));
    return {
      category: 'mate',
      text:
        matedAfter <= 1
          ? `Nước này cho ${O} chiếu hết ngay${line[1] ? ` bằng ${line[1]}` : ''}.${tip('Trước khi đi, hãy luôn hỏi: Vua mình có bị chiếu hết ở nước tới không?')} Nên đi ${best}.`
          : `Nước này cho ${O} chiếu hết cưỡng bức trong ${matedAfter} nước: Vua thiếu quân bảo vệ hoặc thiếu ô thoát. Nên đi ${best}.`,
      line,
      lineIsRefutation: true,
    };
  }
  const myMateBefore = mateIn(p.evalBefore, side);
  const myMateAfter = mateIn(p.evalAfter, side);
  if (myMateBefore !== null && myMateAfter === null) {
    return {
      category: 'missed',
      text: `${S} đang có đòn chiếu hết trong ${myMateBefore} nước, bắt đầu bằng ${best}, nhưng đã bỏ lỡ.${tip('Khi Vua đối phương bị hở, hãy xét mọi nước chiếu trước tiên.')}${punish}`,
      line: uciLineToSan(p.fenBefore, p.bestPv.slice(0, 2 * myMateBefore - 1)),
      lineIsRefutation: false,
    };
  }

  // 2. material
  const played = walk(p.fenBefore, refUci, side);
  const better = walk(p.fenBefore, p.bestPv, side);
  const hasRef = !!p.refPv?.length;
  const lossVsBest = better.delta - played.delta;

  if (hasRef && played.delta <= -1 && lossVsBest >= 1) {
    const c = new Chess(p.fenBefore);
    const mv = playUci(c, p.uci)!;
    const reply = playUci(c, p.refPv![0]);
    const replySan = reply?.san ?? '';
    const net = -played.delta;
    const first = played.lost[0];
    // the loss that matters: the most valuable piece taken (earliest on ties), not counting pieces that
    // were simply traded (a Queen lost after winning the opponent's Queen is an exchange, not the point)
    const unmatched = [...played.lost];
    for (const g of played.gained) {
      const k = unmatched.findIndex((l) => l.type === g.type);
      if (k >= 0) unmatched.splice(k, 1);
    }
    const key = [...(unmatched.length ? unmatched : played.lost)].sort((a, b) => VAL[b.type] - VAL[a.type] || a.index - b.index)[0];
    const total = ` Tính cả biến, ${s} thiệt ${pts(net)}.`;
    if (reply?.captured && first && key === first) {
      const what = NAME[first.type];
      const takenBack = played.gained.some((g) => g.index === first.index + 1 && g.square === first.square);
      const tail = takenBack ? ` Dù bắt lại được, ${s} vẫn thiệt ${pts(net)}.` : played.lost.length > 1 ? total : first.type === 'p' ? '' : ` ${S} mất trắng quân này.`;
      if (first.square === mv.to && mv.captured)
        return {
          category: 'hang',
          text: `${what} vừa ăn ${NAME[mv.captured as PieceSymbol]} ở ${mv.to} nhưng bị bắt lại ngay bằng ${replySan}.${total}${tip('Trước khi ăn quân, hãy đếm số quân tấn công và số quân bảo vệ ô đó.')} Nên đi ${best}.`,
          line: played.sans,
          lineIsRefutation: true,
        };
      if (first.square === mv.to)
        return {
          category: 'hang',
          text: `${what} vừa tới ${mv.to} bị bắt ngay bằng ${replySan}.${tail}${tip('Trước khi thả tay, hãy đếm số quân tấn công và số quân bảo vệ ô mình sắp đến.')} Nên đi ${best}.`,
          line: played.sans,
          lineIsRefutation: true,
        };
      return {
        category: 'hang',
        text: `Nước này bỏ mặc ${what} ở ${first.square}: ${O} bắt bằng ${replySan}.${tail}${tip('Trước mỗi nước hãy rà xem quân nào của mình đang bị tấn công.')} Nên đi ${best}.`,
        line: played.sans,
        lineIsRefutation: true,
      };
    }
    if (reply) {
      const targets = targetsOf(c, reply.to as Square, opp).filter((t) => t.type === 'k' || !t.defended || VAL[t.type] > VAL[reply.piece as PieceSymbol]);
      if (targets.length >= 2) {
        return {
          category: 'tactic',
          text: `Nước này cho phép đòn đôi: sau ${replySan}, ${NAME[reply.piece as PieceSymbol]} ở ${reply.to} cùng lúc tấn công ${listPieces(targets)}. Chỉ cứu được một bên.${total} Nên đi ${best}.`,
          line: played.sans,
          lineIsRefutation: true,
        };
      }
    }
    return {
      category: 'tactic',
      text: `Nước này cho ${O} một đòn chiến thuật bắt đầu bằng ${replySan}${key && net >= VAL[key.type] - 1 ? `: cuối cùng ${s} mất ${NAME[key.type]} ở ${key.square}` : ''}.${total} Nên đi ${best}.`,
      line: played.sans,
      lineIsRefutation: true,
    };
  }

  if (lossVsBest >= 1 && better.delta >= 1) {
    const how = better.lost.length === 0 && better.gained.length ? `ăn được ${listPieces(better.gained)}` : `lời ${pts(better.delta)} sau loạt đổi quân`;
    return {
      category: 'missed',
      text: `${S} bỏ lỡ ${best}: ${s} ${how}.${punish || tip('Trước mỗi nước hãy xét các nước chiếu, bắt quân và đe dọa của mình.')}`,
      line: better.sans.length ? better.sans : bestLine,
      lineIsRefutation: false,
    };
  }

  // 3. positional
  const c = new Chess(p.fenBefore);
  const bestMove = playUci(new Chess(p.fenBefore), p.best);
  const mv = playUci(c, p.uci);
  const wpB = winPercent(p.evalBefore);
  const myBefore = side === 'w' ? wpB : 100 - wpB;
  const wpA = winPercent(p.evalAfter);
  const myAfter = side === 'w' ? wpA : 100 - wpA;
  const phase = phaseOf(p.fenBefore, p.ply);
  let why = '';
  if (bestMove && (bestMove.isKingsideCastle() || bestMove.isQueensideCastle())) why = 'Vua còn ở giữa bàn: nhập thành ngay mới là ưu tiên.';
  else if (bestMove?.captured && !mv?.captured) why = `${S} bỏ qua nước bắt quân ${best}.`;
  else if (mv?.piece === 'k' && phase !== 'endgame' && !mv.isKingsideCastle() && !mv.isQueensideCastle() && new RegExp(side === 'w' ? '[KQ]' : '[kq]').test(p.fenBefore.split(' ')[2] ?? '-'))
    why = 'Đi Vua lúc này làm mất quyền nhập thành, Vua sẽ khó tìm chỗ an toàn.';
  else if (phase === 'opening' && bestMove && (bestMove.piece === 'n' || bestMove.piece === 'b') && mv && mv.piece !== 'n' && mv.piece !== 'b')
    why = `Trong khai cuộc nên ưu tiên đưa quân nhẹ ra trận, ở đây là ${best}.`;
  else if (phase === 'opening' && mv?.piece === 'q') why = 'Đưa Hậu ra sớm dễ bị quân nhẹ đuổi, mất nhịp phát triển.';
  else if (phase === 'endgame' && bestMove?.piece === 'k' && mv?.piece !== 'k') why = 'Trong tàn cuộc Vua là quân tấn công: cần đưa Vua tham chiến.';
  else if (phase === 'endgame' && bestMove?.piece === 'p' && mv?.piece !== 'p') why = `Trong tàn cuộc, đẩy Tốt đúng lúc là then chốt: ở đây là ${best}.`;
  else if (hasRef && p.refPv![0]) {
    const r = uciLineToSan(p.fenBefore, refUci.slice(0, 2))[1];
    if (r) why = `${O[0].toUpperCase()}${O.slice(1)} đáp ${r} và giành thế chủ động.`;
  }
  const scale =
    myBefore >= 75 && myAfter < 60
      ? 'Thế đang thắng rõ trở thành gần cân bằng.'
      : myBefore >= 40 && myAfter < 25
        ? 'Thế đang cân bằng trở thành kém rõ rệt.'
        : myAfter < 10
          ? 'Sau nước này thế cờ rất khó cứu.'
          : 'Không mất quân ngay nhưng thế cờ kém đi.';
  const pov = (x: { cp?: number; mate?: number }) => formatScore(side === 'w' ? x : flip(x));
  return {
    category: myBefore >= 75 && myAfter < 60 ? 'missed' : 'positional',
    text: `${scale} Đánh giá cho phía ${mine ? 'bạn' : S} từ ${pov(p.evalBefore)} xuống ${pov(p.evalAfter)}. ${why} Chính xác hơn là ${best}.`.replace(/\s+/g, ' '),
    line: bestLine,
    lineIsRefutation: false,
  };
}

/* ------------------------------------------------------------------ */
/* aggregated weaknesses                                                */
/* ------------------------------------------------------------------ */

export interface WeaknessInput {
  gameId: string;
  me: Color;
  result: string;
  opening?: string;
  date: number;
  plies: PlyAnalysis[];
  accuracy: { w: number; b: number };
}

export interface WeaknessExample {
  gameId: string;
  ply: number;
  label: string;
  category: ErrorCategory;
  phase: Phase;
  judgment: Judgment;
  winLoss: number;
  text: string;
}

export interface WeaknessReport {
  games: number;
  myMoves: number;
  accuracy: { w: number | null; b: number | null; all: number | null };
  gamesByColor: { w: number; b: number };
  score: { win: number; draw: number; loss: number };
  /** serious errors (mistake + blunder) by category */
  byCategory: Record<ErrorCategory, number>;
  /** per phase: my moves played there, serious errors, inaccuracies */
  byPhase: Record<Phase, { moves: number; errors: number; inaccuracies: number }>;
  byColor: { w: { moves: number; errors: number }; b: { moves: number; errors: number } };
  openings: { name: string; games: number; points: number; accuracy: number }[];
  examples: WeaknessExample[];
  /** games thrown away from a winning position (>= 80% then lost or drawn) */
  thrownWins: number;
}

const zeroCat = (): Record<ErrorCategory, number> => ({ mate: 0, hang: 0, tactic: 0, missed: 0, positional: 0 });

/**
 * Opening family used to group games: "Sicilian Defense: Najdorf Variation" (Lichess) and
 * "Sicilian Defense Open Najdorf Variation 6.Be3" (Chess.com, no colon) both become "Sicilian Defense".
 */
export function openingFamily(opening: string): string {
  const base = opening.split(':')[0].split(',')[0].trim();
  if (opening.includes(':')) return base;
  const m = base.match(/^(.*?\b(?:Opening|Defense|Defence|Game|Gambit|Attack|System))(?=\b|\.)/);
  return (m ? m[1] : base).trim();
}

export function buildWeaknessReport(inputs: WeaknessInput[]): WeaknessReport {
  const rep: WeaknessReport = {
    games: inputs.length,
    myMoves: 0,
    accuracy: { w: null, b: null, all: null },
    gamesByColor: { w: 0, b: 0 },
    score: { win: 0, draw: 0, loss: 0 },
    byCategory: zeroCat(),
    byPhase: {
      opening: { moves: 0, errors: 0, inaccuracies: 0 },
      middlegame: { moves: 0, errors: 0, inaccuracies: 0 },
      endgame: { moves: 0, errors: 0, inaccuracies: 0 },
    },
    byColor: { w: { moves: 0, errors: 0 }, b: { moves: 0, errors: 0 } },
    openings: [],
    examples: [],
    thrownWins: 0,
  };
  const acc = { w: [] as number[], b: [] as number[] };
  const op = new Map<string, { games: number; points: number; acc: number[] }>();
  for (const g of inputs) {
    rep.gamesByColor[g.me]++;
    acc[g.me].push(g.accuracy[g.me]);
    const pts = g.result === '1/2-1/2' ? 0.5 : (g.result === '1-0') === (g.me === 'w') ? 1 : g.result === '*' ? 0.5 : 0;
    if (g.result !== '*') rep.score[pts === 1 ? 'win' : pts === 0.5 ? 'draw' : 'loss']++;
    if (g.opening) {
      const name = openingFamily(g.opening);
      const o = op.get(name) ?? { games: 0, points: 0, acc: [] };
      o.games++;
      o.points += pts;
      o.acc.push(g.accuracy[g.me]);
      op.set(name, o);
    }
    let wasWinning = false;
    g.plies.forEach((p, i) => {
      const side: Color = p.ply % 2 === 0 ? 'w' : 'b';
      if (side !== g.me) return;
      const wp = winPercent(p.evalBefore);
      if ((side === 'w' ? wp : 100 - wp) >= 80) wasWinning = true;
      const phase = phaseOf(p.fenBefore, p.ply);
      rep.myMoves++;
      rep.byPhase[phase].moves++;
      rep.byColor[side].moves++;
      if (p.judgment === 'inaccuracy') rep.byPhase[phase].inaccuracies++;
      if (p.judgment !== 'mistake' && p.judgment !== 'blunder') return;
      const ex = explainPly(p, g.plies[i - 1]);
      rep.byCategory[ex.category]++;
      rep.byPhase[phase].errors++;
      rep.byColor[side].errors++;
      rep.examples.push({
        gameId: g.gameId,
        ply: p.ply,
        label: `${moveNo(p.ply)} ${p.san}`,
        category: ex.category,
        phase,
        judgment: p.judgment,
        winLoss: p.winLoss,
        text: ex.text,
      });
    });
    if (wasWinning && pts < 1 && g.result !== '*') rep.thrownWins++;
  }
  const mean = (a: number[]) => (a.length ? Math.round(a.reduce((x, y) => x + y, 0) / a.length) : null);
  rep.accuracy = { w: mean(acc.w), b: mean(acc.b), all: mean([...acc.w, ...acc.b]) };
  rep.openings = [...op.entries()]
    .map(([name, o]) => ({ name, games: o.games, points: o.points, accuracy: mean(o.acc) ?? 0 }))
    .sort((a, b) => b.games - a.games)
    .slice(0, 6);
  rep.examples.sort((a, b) => b.winLoss - a.winLoss);
  return rep;
}

/** What to train for each weakness: a route inside the app. */
export const CATEGORY_ADVICE: Record<ErrorCategory, { text: string; to: string; cta: string }> = {
  mate: {
    text: 'Bạn hay để hở Vua. Trước mỗi nước, xét mọi nước chiếu của đối phương. Luyện chiếu hết 1 đến 2 nước để quen các mẫu hình.',
    to: 'puzzles/theme/mateIn2',
    cta: 'Luyện chiếu hết 2 nước',
  },
  hang: {
    text: 'Lỗi nhiều nhất là bỏ quên quân. Tập thói quen trước khi thả tay: quân vừa đi có bị bắt không, nước này bỏ lại quân nào không được bảo vệ.',
    to: 'puzzles/theme/hangingPiece',
    cta: 'Luyện bắt quân treo',
  },
  tactic: {
    text: 'Bạn hay dính đòn đôi, ghim, xiên. Giải thế cờ chiến thuật đều mỗi ngày là cách sửa nhanh nhất.',
    to: 'puzzles/theme/fork',
    cta: 'Luyện đòn đôi',
  },
  missed: {
    text: 'Bạn thường bỏ lỡ cơ hội khi đối phương đi sai. Mỗi nước hãy xét theo thứ tự: chiếu, bắt quân, đe dọa.',
    to: 'learn/lesson/thinking-process',
    cta: 'Ôn bài Quy trình suy nghĩ',
  },
  positional: {
    text: 'Phần lớn lỗi là về thế trận, không mất quân ngay. Xem các ván mẫu có bình luận để học cách lập kế hoạch.',
    to: 'learn/games',
    cta: 'Xem loạt Từng nước một',
  },
};

export const PHASE_ADVICE: Record<Phase, { text: string; to: string; cta: string }> = {
  opening: { text: 'Bạn mất điểm nhiều nhất ngay trong khai cuộc.', to: 'learn/lesson/opening-principles', cta: 'Ôn nguyên tắc khai cuộc' },
  middlegame: { text: 'Bạn mất điểm nhiều nhất ở trung cuộc.', to: 'puzzles', cta: 'Giải thế cờ chiến thuật' },
  endgame: { text: 'Bạn mất điểm nhiều nhất ở tàn cuộc.', to: 'learn/lesson/pawn-endings-1', cta: 'Học cờ tàn Tốt' },
};
