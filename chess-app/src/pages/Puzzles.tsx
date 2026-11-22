import { useEffect, useMemo, useState } from 'react';
import PuzzleBoard from '../components/PuzzleBoard';
import { Button, Card, Spinner, Tag } from '../components/ui';
import { loadPuzzles, pickPuzzle, fetchDailyPuzzle, type Puzzle } from '../lib/puzzles';
import { DRILL_THEMES, THEMES, themeLabel } from '../lib/themes';
import { updateRating } from '../lib/rating';
import { loadPuzzleProgress, savePuzzleProgress, loadMistakes, saveMistakes, type PuzzleProgress, type Mistake } from '../lib/storage';
import { navigate, type Route } from '../lib/router';

type Mode = 'rated' | 'theme' | 'daily' | 'mistakes';

export default function Puzzles({ route }: { route: Route }) {
  const mode = (route.parts[0] as Mode | undefined) ?? undefined;
  const theme = route.parts[1];
  const [progress, setProgress] = useState<PuzzleProgress | null>(null);
  const [mistakes, setMistakes] = useState<Mistake[]>([]);

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
          Mục tiêu mỗi ngày: 20 đến 30 bài, làm chậm. Tính hết biến trước khi đi, đừng đoán.
        </p>
      </Card>

      <Card onClick={() => navigate('puzzles/rated')}>
        <div className="row-between">
          <div>
            <h3>Luyện theo trình độ</h3>
            <p className="muted small" style={{ margin: 0 }}>
              Bài tập tự chọn quanh rating của bạn, đủ mọi chủ đề. Giống Lichess Puzzle.
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
        {DRILL_THEMES.map((t) => (
          <button key={t} className="chip" onClick={() => navigate(`puzzles/theme/${t}`)}>
            {themeLabel(t)}
          </button>
        ))}
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

  useEffect(() => {
    loadPuzzles().then(setAll);
  }, []);

  useEffect(() => {
    if (!all) return;
    setPuzzle(pickPuzzle(all, progress.rating, progress.solved, theme));
    setResult(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [all, n, theme]);

  const onFinish = async (ok: boolean) => {
    if (!puzzle) return;
    const r = updateRating(progress, puzzle.rating, ok);
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
        <span>
          Rating của bạn: <b>{progress.rating}</b>
          {result && (
            <span className={result.delta >= 0 ? 'tag tag-good' : 'tag tag-bad'} style={{ marginLeft: 6 }}>
              {result.delta >= 0 ? '+' : ''}
              {result.delta}
            </span>
          )}
        </span>
        <span className="muted">
          Bài: {puzzle.rating} · chuỗi {streak}
        </span>
      </div>
      <PuzzleBoard key={puzzle.id} fen={puzzle.fen} moves={puzzle.moves} playerFirst={puzzle.playerFirst} onFinish={onFinish} />
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
  const queue = useMemo(() => {
    const now = Date.now();
    const due = mistakes.filter((m) => m.due <= now).sort((a, b) => a.due - b.due);
    const rest = mistakes.filter((m) => m.due > now).sort((a, b) => a.due - b.due);
    return [...due, ...rest];
  }, [mistakes]);
  const m = queue[i];

  const onFinish = async (ok: boolean) => {
    if (!m) return;
    setDone(ok);
    const interval = ok ? Math.max(1, Math.round((m.interval || 0.5) * 2.5)) : 1;
    const updated = mistakes.map((x) =>
      x.id === m.id ? { ...x, interval, reps: x.reps + 1, due: Date.now() + interval * 86400000 } : x,
    );
    setMistakes(updated);
    await saveMistakes(updated);
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
            {i + 1}/{queue.length} · bạn đã đi <b>{m.playedSan}</b> ({m.judgment === 'blunder' ? 'sai nghiêm trọng' : 'sai lầm'}). Tìm nước tốt hơn.
            {m.due <= Date.now() ? '' : ' · (chưa tới hạn, ôn trước)'}
          </p>
          <PuzzleBoard
            key={m.id}
            fen={m.fen}
            moves={[m.best, ...m.bestPv.slice(1, 3)]}
            playerFirst
            onFinish={onFinish}
            prompt={`${m.color === 'w' ? 'Trắng' : 'Đen'} đi. Nước tốt nhất là gì?`}
          />
          {done !== null && (
            <div className="mt">
              <p className="small muted">
                Nước tốt nhất: <b>{m.bestSan}</b>. Ôn lại sau {queue.find((x) => x.id === m.id)?.interval ?? 1} ngày.
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
