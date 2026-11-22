import { useEffect, useMemo, useState } from 'react';
import PuzzleBoard from '../components/PuzzleBoard';
import { Button, Card, Spinner, Tag } from '../components/ui';
import { loadPuzzles, pickPuzzle, fetchDailyPuzzle, type Puzzle } from '../lib/puzzles';
import { DRILL_THEMES, THEMES, themeLabel } from '../lib/themes';
import { updateRating } from '../lib/rating';
import { loadPuzzleProgress, savePuzzleProgress, loadMistakes, saveMistakes, type PuzzleProgress, type Mistake } from '../lib/storage';
import { navigate, type Route } from '../lib/router';
import { Chess } from 'chess.js';
import { getEngine, toWhitePov, winPercent } from '../lib/engine';
import { playUci, uciLineToSan } from '../lib/chess-utils';
import { logActivity } from '../lib/activity';

type Mode = 'rated' | 'theme' | 'daily' | 'mistakes';
/** what a player below ~1000 should drill first */
const BASIC_THEMES = ['mateIn1', 'hangingPiece', 'fork', 'pin', 'backRankMate', 'mateIn2'];

export default function Puzzles({ route }: { route: Route }) {
  const mode = (route.parts[0] as Mode | undefined) ?? undefined;
  const theme = route.parts[1];
  const [progress, setProgress] = useState<PuzzleProgress | null>(null);
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [allThemes, setAllThemes] = useState(false);

  useEffect(() => {
    loadPuzzleProgress().then(setProgress);
    loadMistakes().then(setMistakes);
  }, [mode]);

  if (!progress) return <Spinner label="Đang tải..." />;

  if (mode === 'rated' || mode === 'theme') {
    return <Trainer theme={mode === 'theme' ? theme : undefined} progress={progress} setProgress={setProgress} />;
  }
  if (mode === 'daily') return <Daily />;
  if (mode === 'mistakes') return <MistakeTrainer mistakes={mistakes} setMistakes={setMistakes} />;

  const due = mistakes.filter((m) => m.due <= Date.now()).length;
  const recent = progress.history.slice(-50);
  const acc = recent.length ? Math.round((100 * recent.filter((h) => h.ok).length) / recent.length) : 0;
  const today = progress.history.filter((h) => h.at > Date.now() - 86400000).length;

  return (
    <div>
      <h1>Luyện chiến thuật</h1>
      <Card>
        <div className="grid-2">
          <div className="stat">
            <b>{progress.rating}</b>
            <span>Rating bài tập</span>
          </div>
          <div className="stat">
            <b>{progress.history.length}</b>
            <span>Đã giải</span>
          </div>
          <div className="stat">
            <b>{acc}%</b>
            <span>Đúng (50 bài gần nhất)</span>
          </div>
          <div className="stat">
            <b>{today}</b>
            <span>Hôm nay</span>
          </div>
        </div>
        <p className="small muted mt">
          Làm chậm, tính hết biến trước khi đi, đừng đoán. Mục tiêu mỗi ngày nằm ở thẻ "Hôm nay" trong tab Học.
        </p>
      </Card>

      <details className="card small">
        <summary>
          <b>Giải bài tập như thế nào?</b>
        </summary>
        <p style={{ marginBottom: 0 }}>
          Mỗi bài là một tình huống lấy từ ván thật, có đúng một lời giải rõ ràng nhất, dài từ 1 đến vài nước. Bạn <b>không cần đánh hết ván</b>: đi đúng nước, máy tự đi thay đối phương,
          rồi bạn đi tiếp cho tới hết chuỗi là xong. Dòng chữ xanh dưới bàn cờ cho biết mục tiêu (chiếu hết, hoặc thắng quân) và số nước cần tìm. “Nước tốt nhất” nghĩa là nước mạnh hơn hẳn
          các nước còn lại; nước chỉ “tạm được” sẽ bị tính là sai.
        </p>
      </details>
      <Card onClick={() => navigate('puzzles/rated')}>
        <div className="row-between">
          <div>
            <h3>Luyện theo trình độ</h3>
            <p className="muted small" style={{ margin: 0 }}>
              Bài tập tự chọn theo sức của bạn, đủ mọi chủ đề. Giải đúng thì bài sau khó dần lên.
            </p>
          </div>
          <span>›</span>
        </div>
      </Card>

      <Card onClick={() => navigate('puzzles/daily')}>
        <div className="row-between">
          <div>
            <h3>Bài tập hàng ngày</h3>
            <p className="muted small" style={{ margin: 0 }}>
              Puzzle of the day từ Lichess (cần mạng).
            </p>
          </div>
          <span>›</span>
        </div>
      </Card>

      <Card onClick={() => navigate('puzzles/mistakes')}>
        <div className="row-between">
          <div>
            <h3>Lỗi của chính bạn {due > 0 && <Tag tone="warn">{due} cần ôn</Tag>}</h3>
            <p className="muted small" style={{ margin: 0 }}>
              Những nước sai trong ván đã phân tích, ôn theo lịch lặp lại giãn cách. {mistakes.length === 0 && 'Phân tích vài ván ở tab Phân tích để có dữ liệu.'}
            </p>
          </div>
          <span>›</span>
        </div>
      </Card>

      <h2 className="mt">Theo chủ đề</h2>
      <p className="muted small">Học một mẫu cho đến khi nhận ra trong 3 giây, rồi chuyển chủ đề.</p>
      <div className="chip-row mb">
        {(progress.rating < 1000 && !allThemes ? BASIC_THEMES : DRILL_THEMES).map((t) => (
          <button key={t} className="chip" onClick={() => navigate(`puzzles/theme/${t}`)}>
            {themeLabel(t)}
          </button>
        ))}
        {progress.rating < 1000 && !allThemes && (
          <button className="chip active" onClick={() => setAllThemes(true)}>
            Xem thêm chủ đề…
          </button>
        )}
      </div>
    </div>
  );
}

function Trainer({
  theme,
  progress,
  setProgress,
}: {
  theme?: string;
  progress: PuzzleProgress;
  setProgress: (p: PuzzleProgress) => void;
}) {
  const [all, setAll] = useState<Puzzle[] | null>(null);
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [result, setResult] = useState<{ ok: boolean; delta: number } | null>(null);
  const [streak, setStreak] = useState(0);
  const [n, setN] = useState(0);
  // theme drills: unrated, start a little below your level and adapt within the session
  const [drillLevel, setDrillLevel] = useState(() => Math.max(500, progress.rating - 250));

  useEffect(() => {
    loadPuzzles().then(setAll);
  }, []);

  useEffect(() => {
    if (!all) return;
    setPuzzle(pickPuzzle(all, theme ? drillLevel : progress.rating, progress.solved, theme));
    setResult(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [all, n, theme]);

  const onFinish = async (ok: boolean) => {
    if (!puzzle) return;
    const r = theme ? { rating: progress.rating, rd: progress.rd, delta: 0 } : updateRating(progress, puzzle.rating, ok);
    if (theme) setDrillLevel((l) => Math.max(450, Math.min(2600, l + (ok ? 50 : -70))));
    logActivity('puzzles');
    const next: PuzzleProgress = {
      ...progress,
      rating: r.rating,
      rd: r.rd,
      solved: { ...progress.solved, [puzzle.id]: ok ? 1 : 0 },
      history: [...progress.history, { id: puzzle.id, ok, rating: puzzle.rating, at: Date.now() }].slice(-2000),
      streakBest: Math.max(progress.streakBest, ok ? streak + 1 : 0),
    };
    setStreak(ok ? streak + 1 : 0);
    setProgress(next);
    setResult({ ok, delta: r.delta });
    await savePuzzleProgress(next);
  };

  if (!all || !puzzle) return <Spinner label="Đang tải bài tập..." />;
  const info = theme ? THEMES[theme] : undefined;

  return (
    <div>
      <div className="topbar">
        <button className="back" onClick={() => navigate('puzzles')} aria-label="Quay lại">
          ‹
        </button>
        <h2 style={{ margin: 0 }}>{theme ? themeLabel(theme) : 'Luyện theo trình độ'}</h2>
      </div>
      {info?.desc && <p className="muted small">{info.desc}</p>}
      <div className="row-between mb small">
        {theme ? (
          <span className="muted">Luyện tự do, không tính điểm</span>
        ) : (
          <span>
            Rating của bạn: <b>{progress.rating}</b>
            {result && (
              <span className={result.delta >= 0 ? 'tag tag-good' : 'tag tag-bad'} style={{ marginLeft: 6 }}>
                {result.delta >= 0 ? '+' : ''}
                {result.delta}
              </span>
            )}
          </span>
        )}
        <span className="muted">
          Bài: {puzzle.rating} · chuỗi {streak}
        </span>
      </div>
      <PuzzleBoard key={puzzle.id} fen={puzzle.fen} moves={puzzle.moves} playerFirst={puzzle.playerFirst} onFinish={onFinish} prompt={puzzlePrompt(puzzle)} />
      <div className="row mt">
        {result && (
          <Button kind="primary" onClick={() => setN(n + 1)}>
            Bài tiếp theo →
          </Button>
        )}
        {!result && (
          <Button kind="ghost" onClick={() => setN(n + 1)}>
            Bỏ qua
          </Button>
        )}
      </div>
      {result && (
        <div className="chip-row mt">
          {puzzle.themes.filter((t) => THEMES[t]).map((t) => (
            <Tag key={t}>{themeLabel(t)}</Tag>
          ))}
          {puzzle.url && (
            <a className="small" href={puzzle.url} target="_blank" rel="noreferrer">
              Xem trên Lichess
            </a>
          )}
        </div>
      )}
    </div>
  );
}

/** Tell the solver which side they play, what counts as solved, and how many moves they must find. */
function puzzlePrompt(p: Puzzle): string {
  const c = new Chess(p.fen);
  if (!p.playerFirst && p.moves[0]) playUci(c, p.moves[0]);
  const side = c.turn() === 'w' ? 'Trắng' : 'Đen';
  const mine = Math.ceil((p.moves.length - (p.playerFirst ? 0 : 1)) / 2);
  const who = `Bạn cầm ${side} (phía dưới bàn cờ).`;
  const count = mine <= 1 ? 'Chỉ cần đúng một nước.' : `Cần tìm ${mine} nước liên tiếp, máy tự đi thay đối phương.`;
  const mate = p.themes.find((t) => /^mateIn\d$/.test(t));
  if (mate) return `${who} Mục tiêu: chiếu hết trong ${mate.slice(-1)} nước.`;
  if (p.themes.includes('mate')) return `${who} Mục tiêu: chiếu hết. ${count}`;
  if (p.themes.includes('hangingPiece')) return `${who} Mục tiêu: bắt quân không được bảo vệ. ${count}`;
  if (p.themes.includes('equality')) return `${who} Bạn đang kém thế. Mục tiêu: tìm cách cứu hòa. ${count}`;
  return `${who} Mục tiêu: thắng quân hoặc giành ưu thế rõ rệt, không cần chiếu hết. ${count}`;
}

function Daily() {
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState<boolean | null>(null);
  useEffect(() => {
    fetchDailyPuzzle().then(setPuzzle).catch((e) => setErr(String(e)));
  }, []);
  return (
    <div>
      <div className="topbar">
        <button className="back" onClick={() => navigate('puzzles')} aria-label="Quay lại">
          ‹
        </button>
        <h2 style={{ margin: 0 }}>Bài tập hàng ngày</h2>
      </div>
      {err && <div className="feedback bad">Không tải được: {err}</div>}
      {!puzzle && !err && <Spinner label="Đang lấy puzzle từ Lichess..." />}
      {puzzle && (
        <>
          <p className="muted small">
            Rating {puzzle.rating} · {puzzle.themes.filter((t) => THEMES[t]).map(themeLabel).join(', ')}
          </p>
          <PuzzleBoard fen={puzzle.fen} moves={puzzle.moves} playerFirst onFinish={setDone} />
          {done !== null && puzzle.url && (
            <p className="mt">
              <a href={puzzle.url} target="_blank" rel="noreferrer">
                Xem trên Lichess
              </a>
            </p>
          )}
        </>
      )}
    </div>
  );
}

function MistakeTrainer({ mistakes, setMistakes }: { mistakes: Mistake[]; setMistakes: (m: Mistake[]) => void }) {
  const [i, setI] = useState(0);
  const [done, setDone] = useState<boolean | null>(null);
  // freeze the order for this session: grading a card changes its due date and must not reshuffle the queue
  const [order, setOrder] = useState<string[] | null>(null);
  useEffect(() => {
    if (order || !mistakes.length) return;
    const now = Date.now();
    const due = mistakes.filter((m) => m.due <= now).sort((a, b) => a.due - b.due);
    const rest = mistakes.filter((m) => m.due > now).sort((a, b) => a.due - b.due);
    setOrder([...due, ...rest].map((m) => m.id));
  }, [mistakes, order]);
  const queue = useMemo(() => (order ?? []).map((id) => mistakes.find((m) => m.id === id)).filter((m): m is Mistake => !!m), [order, mistakes]);
  const m = queue[i];

  const onFinish = async (ok: boolean) => {
    if (!m) return;
    setDone(ok);
    const interval = ok ? Math.max(1, Math.round((m.interval || 0.5) * 2.5)) : 1;
    const updated = mistakes.map((x) => (x.id === m.id ? { ...x, interval, reps: x.reps + 1, due: Date.now() + interval * 86400000 } : x));
    setMistakes(updated);
    await saveMistakes(updated);
    logActivity('puzzles');
  };

  /** Accept any move that is practically as good as the engine's first choice. */
  const judge = async (uci: string, fenBefore: string): Promise<boolean> => {
    const engine = getEngine();
    await engine.fullStrength();
    const side = fenBefore.split(' ')[1] as 'w' | 'b';
    const best = await engine.evaluate(fenBefore, { depth: 12 });
    const c = new Chess(fenBefore);
    if (!playUci(c, uci)) return false;
    if (c.isCheckmate()) return true;
    const mine = await engine.evaluate(c.fen(), { depth: 12 });
    if (!best.lines[0] || !mine.lines[0]) return false;
    const wpBest = winPercent(toWhitePov(best.lines[0], side));
    const wpMine = winPercent(toWhitePov(mine.lines[0], side === 'w' ? 'b' : 'w'));
    const loss = side === 'w' ? wpBest - wpMine : wpMine - wpBest;
    return loss <= 6;
  };

  return (
    <div>
      <div className="topbar">
        <button className="back" onClick={() => navigate('puzzles')} aria-label="Quay lại">
          ‹
        </button>
        <h2 style={{ margin: 0 }}>Lỗi của chính bạn</h2>
      </div>
      {!m && (
        <Card>
          <p>Chưa có lỗi nào để ôn. Vào tab Phân tích, nhập ván từ Lichess và chạy phân tích. Mọi nước sai lầm (?) và sai nghiêm trọng (??) của bạn sẽ xuất hiện ở đây.</p>
          <Button kind="primary" onClick={() => navigate('analyze')}>
            Đi tới Phân tích
          </Button>
        </Card>
      )}
      {m && (
        <>
          <p className="muted small">
            {i + 1}/{queue.length} · trong ván bạn đã đi <b>{m.playedSan}</b> ({m.judgment === 'blunder' ? 'sai nghiêm trọng' : 'sai lầm'}). Tìm nước tốt hơn.
            {m.due <= Date.now() || done !== null ? '' : ' · (chưa tới hạn, ôn trước)'}
          </p>
          <PuzzleBoard
            key={m.id}
            fen={m.fen}
            moves={[m.best]}
            playerFirst
            judge={judge}
            onFinish={onFinish}
            prompt={`Bạn cầm ${m.color === 'w' ? 'Trắng' : 'Đen'}. Một nước thôi: nước tốt nhất là gì?`}
          />
          {done !== null && (
            <div className="mt">
              <p className="small">
                Nước tốt nhất theo engine: <b>{m.bestSan}</b>
                {m.bestPv.length > 1 && <span className="muted"> (tiếp theo: {uciLineToSan(m.fen, m.bestPv.slice(0, 5)).slice(1).join(' ')})</span>}. Ôn lại sau {m.interval || 1} ngày.
              </p>
              <div className="row">
                <Button
                  kind="primary"
                  onClick={() => {
                    setDone(null);
                    setI((i + 1) % Math.max(1, queue.length));
                  }}
                >
                  Tiếp →
                </Button>
                <Button kind="ghost" onClick={() => navigate(`analyze/game/${m.gameId}?ply=${m.ply}`)}>
                  Xem trong ván
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
