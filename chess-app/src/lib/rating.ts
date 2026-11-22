/** Elo-style rating update with a K factor that shrinks as the deviation shrinks. */
export function updateRating(
  user: { rating: number; rd: number },
  puzzleRating: number,
  win: boolean,
): { rating: number; rd: number; delta: number } {
  const expected = 1 / (1 + Math.pow(10, (puzzleRating - user.rating) / 400));
  const k = user.rd > 200 ? 48 : user.rd > 100 ? 32 : 20;
  const delta = Math.round(k * ((win ? 1 : 0) - expected));
  return {
    rating: Math.max(400, Math.min(3200, user.rating + delta)),
    rd: Math.max(60, Math.round(user.rd * 0.93)),
    delta,
  };
}
