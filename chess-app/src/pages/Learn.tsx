import { useEffect, useMemo, useState } from 'react';
import Board from '../components/Board';
import PuzzleBoard from '../components/PuzzleBoard';
import { Button, Card, Spinner, Tag } from '../components/ui';
import { LESSONS, STAGES, lessonById, type Block, type Lesson, type PuzzleSetBlock, type TaskBlock } from '../data/lessons';
import { renderMd } from '../lib/markdown';
import { loadPuzzles, type Puzzle } from '../lib/puzzles';
import { loadLessonProgress, saveLessonProgress, setLessonStatus, loadPuzzleProgress, type LessonProgress } from '../lib/storage';
import MarkBar from '../components/MarkBar';
import { navigate, type Route } from '../lib/router';
import Videos from './Videos';
import Book from './Book';
import Games from './Games';
import PreviewSheet from '../components/PreviewSheet';
import { renderRich, type Preview } from '../lib/richtext';
import { START_FEN } from '../lib/chess-utils';
import { Chess } from 'chess.js';
import type { Key } from 'chessground/types';
import type { DrawShape } from 'chessground/draw';

export default function Learn({ route }: { route: Route }) {
  const [progress, setProgress] = useState<LessonProgress | null>(null);
  useEffect(() => {
    loadLessonProgress().then(setProgress);
  }, [route.parts.join('/')]);
  if (!progress) return <Spinner />;

  if (route.parts[0] === 'videos') return <Videos />;
  if (route.parts[0] === 'book') return <Book route={route} />;
  if (route.parts[0] === 'games') return <Games route={route} />;
  const lessonId = route.parts[0] === 'lesson' ? route.parts[1] : undefined;
  if (lessonId) {
    const lesson = lessonById(lessonId);
    if (!lesson) return <p>Không tìm thấy bài học.</p>;
    return <LessonView lesson={lesson} progress={progress} setProgress={setProgress} />;
  }
  return <Overview progress={progress} />;
}

function taskCount(l: Lesson) {
  return l.blocks.filter((b) => b.kind === 'task' || b.kind === 'puzzles').length;
}
function lessonDone(l: Lesson, p: LessonProgress) {
  if (p.status[l.id] === 'done') return true;
  if (p.status[l.id] === 'skipped') return false;
  const n = taskCount(l);
  const done = p.done[l.id]?.length ?? 0;
  return n > 0 && done >= n;
}
const lessonSkipped = (l: Lesson, p: LessonProgress) => p.status[l.id] === 'skipped';

function Overview({ progress }: { progress: LessonProgress }) {
  const [puzzleRating, setPuzzleRating] = useState<number | null>(null);
  useEffect(() => {
    loadPuzzleProgress().then((p) => setPuzzleRating(p.rating));
  }, []);
  const total = LESSONS.length;
  const doneCount = LESSONS.filter((l) => lessonDone(l, progress)).length;
  const skippedCount = LESSONS.filter((l) => lessonSkipped(l, progress)).length;
  const next = LESSONS.find((l) => !lessonDone(l, progress) && !lessonSkipped(l, progress));
  return (
    <div>
      <h1>Lộ trình học cờ</h1>
      <Card>
        <div className="row-between">
          <span>
            Hoàn thành <b>{doneCount}</b>/{total} bài{skippedCount > 0 && <span className="muted small"> · bỏ qua {skippedCount}</span>}
          </span>
          {puzzleRating !== null && <span className="muted small">Rating bài tập: {puzzleRating}</span>}
        </div>
        <div className="progress mt">
          <div style={{ width: `${(100 * doneCount) / total}%` }} />
        </div>
        {next && (
          <Button kind="primary" className="mt" onClick={() => navigate(`learn/lesson/${next.id}`)}>
            Tiếp tục: {next.title}
          </Button>
        )}
      </Card>
      <Card onClick={() => navigate('learn/games')}>
        <div className="row-between">
          <div>
            <h3 style={{ margin: 0 }}>♟ Từng nước một</h3>
            <p className="small muted" style={{ margin: '4px 0 0' }}>
              12 ván kinh điển, giải thích mọi nước đi bằng tiếng Việt. Cách học hiệu quả nhất để hiểu vì sao.
            </p>
          </div>
          <span>›</span>
        </div>
      </Card>
      <div className="grid-2">
        <Card onClick={() => navigate('learn/book')}>
          <h3 style={{ margin: 0 }}>📖 Sách: Capablanca</h3>
          <p className="small muted" style={{ margin: '4px 0 0' }}>
            "Chess Fundamentals" dịch tiếng Việt, 150 hình tương tác.
          </p>
        </Card>
        <Card onClick={() => navigate('learn/videos')}>
          <h3 style={{ margin: 0 }}>🎬 Thư viện video</h3>
          <p className="small muted" style={{ margin: '4px 0 0' }}>
            Kênh tiếng Việt và series tiếng Anh có phụ đề.
          </p>
        </Card>
      </div>
      <Card>
        <h3>Cách dùng lộ trình</h3>
        <p className="small muted" style={{ margin: 0 }}>
          Học theo thứ tự. Mỗi bài có phần đọc ngắn, vị trí tương tác (phải đi đúng nước), và bài tập từ ván thật. Thời gian học chỉ nên chiếm 20%, còn lại là giải bài tập (tab Tập) và chơi + phân tích (tab Chơi, Phân tích).
          Nguồn: nội dung tự biên soạn và kiểm chứng bằng Stockfish; bài tập từ cơ sở dữ liệu Lichess (CC0); sách và trang được dẫn link ở cuối mỗi bài.
        </p>
      </Card>
      {STAGES.map((s) => {
        const ls = LESSONS.filter((l) => l.stage === s.n);
        return (
          <div key={s.n}>
            <h2 className="mt">
              Giai đoạn {s.n + 1}: {s.title} <span className="muted small">Elo {s.elo}</span>
            </h2>
            <p className="small muted">
              <b>Mục tiêu:</b> {s.goal}
              <br />
              <b>Lịch:</b> {s.routine}
            </p>
            {ls.map((l, i) => {
              const done = lessonDone(l, progress);
              const started = (progress.done[l.id]?.length ?? 0) > 0 || progress.read[l.id];
              return (
                <div key={l.id} className="list-item" onClick={() => navigate(`learn/lesson/${l.id}`)}>
                  <div>
                    <div>
                      <span className="muted small">{i + 1}. </span>
                      <b>{l.title}</b>
                    </div>
                    <div className="small muted">
                      {l.summary} · {l.minutes} phút
                    </div>
                  </div>
                  {done ? <Tag tone="good">✓</Tag> : lessonSkipped(l, progress) ? <Tag>bỏ qua</Tag> : started ? <Tag tone="warn">đang học</Tag> : <span className="muted">›</span>}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function LessonView({ lesson, progress, setProgress }: { lesson: Lesson; progress: LessonProgress; setProgress: (p: LessonProgress) => void }) {
  const idx = LESSONS.indexOf(lesson);
  const prev = LESSONS[idx - 1];
  const next = LESSONS[idx + 1];
  const doneSet = new Set(progress.done[lesson.id] ?? []);
  const [preview, setPreview] = useState<Preview | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    setPreview(null);
    if (!progress.read[lesson.id]) {
      const p = { ...progress, read: { ...progress.read, [lesson.id]: 1 as const } };
      setProgress(p);
      saveLessonProgress(p);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.id]);

  const markDone = async (blockIndex: number) => {
    if (doneSet.has(blockIndex)) return;
    const p: LessonProgress = { ...progress, done: { ...progress.done, [lesson.id]: [...doneSet, blockIndex] } };
    setProgress(p);
    await saveLessonProgress(p);
  };

  let taskNo = 0;
  return (
    <div className="lesson-body">
      <div className="topbar">
        <button className="back" onClick={() => navigate('learn')} aria-label="Quay lại">
          ‹
        </button>
        <div>
          <div className="tiny muted">Giai đoạn {lesson.stage + 1} · {lesson.minutes} phút</div>
          <h2 style={{ margin: 0 }}>{lesson.title}</h2>
        </div>
      </div>
      {lesson.blocks.map((b, i) => {
        if (b.kind === 'text') {
          const seq = { line: [START_FEN] };
          return <div key={i}>{renderMd(b.md, (t) => renderRich(t, { onShow: setPreview, seqStart: START_FEN, seq }))}</div>;
        }
        if (b.kind === 'diagram') return <Diagram key={i} block={b} onShow={setPreview} />;
        if (b.kind === 'task') {
          taskNo++;
          return <TaskView key={i} block={b} n={taskNo} done={doneSet.has(i)} onDone={() => markDone(i)} onShow={setPreview} />;
        }
        if (b.kind === 'puzzles') {
          taskNo++;
          return <PuzzleSet key={i} block={b} n={taskNo} done={doneSet.has(i)} onDone={() => markDone(i)} />;
        }
        return null;
      })}
      {lesson.resources && (
        <Card>
          <h3>Nguồn học thêm</h3>
          {lesson.resources.map((r) => (
            <div key={r.url} className="small" style={{ marginBottom: 6 }}>
              <a href={r.url} target="_blank" rel="noreferrer">
                {r.label}
              </a>
              {r.note && <div className="muted">{r.note}</div>}
            </div>
          ))}
        </Card>
      )}
      <PreviewSheet preview={preview} onClose={() => setPreview(null)} />
      <MarkBar
        status={progress.status[lesson.id]}
        onMark={async (v) => {
          setProgress(await setLessonStatus(lesson.id, v));
          if (v && next) navigate(`learn/lesson/${next.id}`);
          else if (v) navigate('learn');
        }}
      />
      <div className="row-between mt">
        {prev ? (
          <Button kind="ghost" onClick={() => navigate(`learn/lesson/${prev.id}`)}>
            ‹ {prev.title}
          </Button>
        ) : (
          <span />
        )}
        {next && (
          <Button kind="primary" onClick={() => navigate(`learn/lesson/${next.id}`)}>
            {next.title} ›
          </Button>
        )}
      </div>
    </div>
  );
}

function Diagram({ block, onShow }: { block: Extract<Block, { kind: 'diagram' }>; onShow: (p: Preview) => void }) {
  const chess = useMemo(() => new Chess(block.fen), [block.fen]);
  const shapes: DrawShape[] = (block.marks ?? []).map((m) =>
    m.length >= 4 ? { orig: m.slice(0, 2) as Key, dest: m.slice(2, 4) as Key, brush: 'green' } : { orig: m as Key, brush: 'green' },
  );
  return (
    <Card>
      <Board fen={block.fen} orientation={block.orientation ?? 'white'} turnColor={chess.turn() === 'w' ? 'white' : 'black'} viewOnly shapes={shapes} check={chess.inCheck() ? (chess.turn() === 'w' ? 'white' : 'black') : false} />
      <p className="small mt" style={{ margin: '8px 0 0' }}>
        {renderRich(block.caption, { onShow, seqStart: block.fen, squareFen: block.fen })}
      </p>
    </Card>
  );
}

function TaskView({ block, n, done, onDone, onShow }: { block: TaskBlock; n: number; done: boolean; onDone: () => void; onShow: (p: Preview) => void }) {
  const [finished, setFinished] = useState<boolean | null>(null);
  const [key, setKey] = useState(0);
  return (
    <Card>
      <div className="row-between">
        <h3 style={{ margin: 0 }}>
          Bài {n} {done && <Tag tone="good">✓</Tag>}
        </h3>
        {block.verify === 'line' && <Tag tone="info">đi lại biến</Tag>}
      </div>
      <PuzzleBoard
        key={key}
        fen={block.fen}
        moves={block.moves}
        alternatives={block.alternatives}
        playerFirst
        prompt={block.prompt}
        onFinish={(ok) => {
          setFinished(ok);
          onDone();
        }}
      />
      {finished !== null && (
        <div className="task-box small">
          <b>Giải thích:</b> {renderRich(block.explain, { onShow, seqStart: block.fen, squareFen: block.fen })}
          <div className="row mt">
            <Button kind="ghost" onClick={() => { setFinished(null); setKey(key + 1); }}>
              Làm lại
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

function PuzzleSet({ block, n, done, onDone }: { block: PuzzleSetBlock; n: number; done: boolean; onDone: () => void }) {
  const [all, setAll] = useState<Puzzle[] | null>(null);
  const [i, setI] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const [cur, setCur] = useState<boolean | null>(null);
  useEffect(() => {
    loadPuzzles().then(setAll);
  }, []);
  const set = useMemo(() => {
    if (!all) return [];
    const [lo, hi] = block.rating;
    const cands = all.filter((p) => p.rating >= lo && p.rating <= hi && block.themes.some((t) => p.themes.includes(t)));
    // deterministic order: short puzzles first, then by id
    cands.sort((a, b) => (a.moves.length - b.moves.length) || (a.id < b.id ? -1 : 1));
    // spread across themes so a set is not all one theme
    const out: Puzzle[] = [];
    const perTheme = Math.ceil(block.count / block.themes.length);
    for (const t of block.themes) out.push(...cands.filter((p) => p.themes.includes(t) && !out.includes(p)).slice(0, perTheme));
    return out.slice(0, block.count);
  }, [all, block]);

  if (!all) return <Spinner label="Đang tải bài tập..." />;
  if (!set.length) return null;
  const p = set[Math.min(i, set.length - 1)];
  const finishedAll = results.length >= set.length;
  return (
    <Card>
      <div className="row-between">
        <h3 style={{ margin: 0 }}>
          Bài {n}: luyện tập {done && <Tag tone="good">✓</Tag>}
        </h3>
        <span className="muted small">
          {Math.min(i + 1, set.length)}/{set.length}
        </span>
      </div>
      {block.intro && <p className="small muted">{block.intro}</p>}
      {!finishedAll && (
        <>
          <p className="tiny muted">Rating bài: {p.rating}</p>
          <PuzzleBoard
            key={p.id}
            fen={p.fen}
            moves={p.moves}
            playerFirst={p.playerFirst}
            onFinish={(ok) => setCur(ok)}
          />
          {cur !== null && (
            <div className="row mt">
              <Button
                kind="primary"
                onClick={() => {
                  const r = [...results, cur];
                  setResults(r);
                  setCur(null);
                  setI(i + 1);
                  if (r.length >= set.length) onDone();
                }}
              >
                {i + 1 >= set.length ? 'Hoàn thành' : 'Bài tiếp →'}
              </Button>
              {p.url && (
                <a className="small" href={p.url} target="_blank" rel="noreferrer">
                  Lichess
                </a>
              )}
            </div>
          )}
        </>
      )}
      {finishedAll && (
        <div className="feedback ok">
          Xong: {results.filter(Boolean).length}/{set.length} đúng ngay lần đầu.{' '}
          <button className="chip" onClick={() => { setResults([]); setI(0); setCur(null); }}>
            làm lại
          </button>
        </div>
      )}
    </Card>
  );
}
