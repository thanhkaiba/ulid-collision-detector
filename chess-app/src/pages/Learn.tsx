import { useEffect, useMemo, useState } from 'react';
import Board from '../components/Board';
import PuzzleBoard from '../components/PuzzleBoard';
import { Button, Card, Spinner, Tag } from '../components/ui';
import { LESSONS, STAGES, lessonById, type Block, type Lesson, type PuzzleSetBlock, type TaskBlock } from '../data/lessons';
import { renderMd } from '../lib/markdown';
import { loadPuzzles, type Puzzle } from '../lib/puzzles';
import { loadLessonProgress, saveLessonProgress, setLessonStatus, loadSettings, type LessonProgress, type Settings } from '../lib/storage';
import { LEVELS_INFO, levelInfo, chooseLevel, type LevelId, type LevelInfo } from '../lib/level';
import { loadActivity, logActivity, dayKey, streak, type ActivityLog } from '../lib/activity';
import MarkBar from '../components/MarkBar';
import { navigate, type Route } from '../lib/router';
import Videos from './Videos';
import Book from './Book';
import Games from './Games';
import PreviewSheet from '../components/PreviewSheet';
import SquareQuiz from '../components/SquareQuiz';
import { renderRich, type Preview } from '../lib/richtext';
import { START_FEN } from '../lib/chess-utils';
import { practiceById, loadPracticeDone } from '../data/practice';
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
  return <Overview progress={progress} setProgress={setProgress} />;
}

function taskCount(l: Lesson) {
  return l.blocks.filter((b) => b.kind === 'task' || b.kind === 'puzzles' || b.kind === 'squares').length;
}
function lessonDone(l: Lesson, p: LessonProgress) {
  if (p.status[l.id] === 'done') return true;
  if (p.status[l.id] === 'skipped') return false;
  const n = taskCount(l);
  const done = p.done[l.id]?.length ?? 0;
  return n > 0 && done >= n;
}
const lessonSkipped = (l: Lesson, p: LessonProgress) => p.status[l.id] === 'skipped';

function LevelPicker({ current, onPick }: { current?: string; onPick: (id: LevelId) => void }) {
  return (
    <Card>
      <h3>Bạn đang ở trình độ nào?</h3>
      <p className="small muted">Ứng dụng sẽ chọn bài bắt đầu, độ khó bài tập và cấp độ máy cho phù hợp. Đổi lại lúc nào cũng được.</p>
      {LEVELS_INFO.map((l) => (
        <div key={l.id} className="list-item" onClick={() => onPick(l.id)}>
          <div>
            <b>{l.label}</b>
            <div className="small muted">{l.desc}</div>
          </div>
          {current === l.id ? <Tag tone="good">đang chọn</Tag> : <span className="muted">›</span>}
        </div>
      ))}
    </Card>
  );
}

function TodayCard({ level, log, nextLesson }: { level: LevelInfo; log: ActivityLog; nextLesson?: Lesson }) {
  const today = log[dayKey()] ?? { puzzles: 0, games: 0, lessons: 0 };
  const days = streak(log);
  // one plan for the day, in the order to do it: learn something new, drill it, then use it in a game
  const items: { done: boolean; label: string; why: string; go: string }[] = [
    today.lessons >= 1
      ? {
          // show what was actually learned today, not the next lesson in the path
          done: true,
          label: today.learned?.length ? `Đã học: ${today.learned.join(', ')}` : `Đã học ${today.lessons} bài hôm nay`,
          why: nextLesson ? `Còn sức thì học thêm: ${nextLesson.title}` : 'Kiến thức mới',
          go: nextLesson ? `learn/lesson/${nextLesson.id}` : 'learn/games',
        }
      : {
          done: false,
          label: nextLesson ? `Học bài: ${nextLesson.title}` : 'Học 1 bài hoặc 1 ván "Từng nước một"',
          why: 'Kiến thức mới. Học xong bấm “Đã học” ở cuối bài để tích việc này.',
          go: nextLesson ? `learn/lesson/${nextLesson.id}` : 'learn/games',
        },
    {
      done: today.puzzles >= level.dailyPuzzles,
      label: `Giải ${level.dailyPuzzles} bài tập chiến thuật (${Math.min(today.puzzles, level.dailyPuzzles)}/${level.dailyPuzzles})`,
      why: 'Luyện mắt nhìn đòn',
      go: 'puzzles/rated',
    },
    { done: today.games >= 1, label: `Chơi 1 ván với máy (cấp ${level.engineLevel})`, why: 'Áp dụng vào ván thật', go: 'play' },
  ];
  const nextIdx = items.findIndex((it) => !it.done);
  return (
    <Card>
      <div className="row-between">
        <h3 style={{ margin: 0 }}>Hôm nay làm gì</h3>
        <span className="small muted">{days > 0 ? `🔥 ${days} ngày liên tiếp` : 'Bắt đầu chuỗi ngày học'}</span>
      </div>
      <p className="small muted" style={{ margin: '4px 0 0' }}>
        {nextIdx === -1 ? 'Xong cả ba việc hôm nay. Hẹn bạn ngày mai!' : 'Ba việc, làm theo thứ tự từ trên xuống, tổng cộng khoảng 30 đến 45 phút.'}
      </p>
      {items.map((it, i) => (
        <div key={i} className="list-item" onClick={() => navigate(it.go)}>
          <span>
            {it.done ? '✅' : `${i + 1}.`} {i === nextIdx ? <b>{it.label}</b> : it.label}
            <div className="tiny muted">{it.why}</div>
          </span>
          {i === nextIdx ? <span className="btn btn-primary small" style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>Làm ngay</span> : <span className="muted">›</span>}
        </div>
      ))}
    </Card>
  );
}

function Overview({ progress, setProgress }: { progress: LessonProgress; setProgress: (p: LessonProgress) => void }) {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [log, setLog] = useState<ActivityLog>({});
  const [picking, setPicking] = useState(false);
  useEffect(() => {
    loadSettings().then(setSettings);
    loadActivity().then(setLog);
  }, []);
  if (!settings) return <Spinner />;
  const level = levelInfo(settings.level);
  const pick = async (id: LevelId) => {
    setSettings(await chooseLevel(id));
    setPicking(false);
    window.scrollTo({ top: 0 });
  };
  if (!level || picking) {
    return (
      <div>
        <h1>Học cờ vua</h1>
        <LevelPicker current={settings.level} onPick={pick} />
      </div>
    );
  }

  const total = LESSONS.length;
  const doneCount = LESSONS.filter((l) => lessonDone(l, progress)).length;
  const skippedCount = LESSONS.filter((l) => lessonSkipped(l, progress)).length;
  const open = (l: Lesson) => !lessonDone(l, progress) && !lessonSkipped(l, progress);
  const startIdx = Math.max(0, LESSONS.findIndex((l) => l.id === level.startLesson));
  const next = LESSONS.slice(startIdx).find(open) ?? LESSONS.find(open);
  const isNew = level.id === 'new';

  const setStage = async (stage: number, value: 'skipped' | undefined) => {
    const status = { ...progress.status };
    for (const l of LESSONS.filter((x) => x.stage === stage)) {
      if (value === 'skipped' && !status[l.id] && !lessonDone(l, progress)) status[l.id] = 'skipped';
      if (value === undefined && status[l.id] === 'skipped') delete status[l.id];
    }
    const p = { ...progress, status };
    setProgress(p);
    await saveLessonProgress(p);
  };

  const extras = (
    <>
      <Card onClick={() => navigate('learn/games')}>
        <div className="row-between">
          <div>
            <h3 style={{ margin: 0 }}>♟ Từng nước một</h3>
            <p className="small muted" style={{ margin: '4px 0 0' }}>
              12 ván kinh điển, giải thích mọi nước đi bằng tiếng Việt.{isNew ? ' Nên học sau khi xong Giai đoạn 1.' : ' Cách học hiệu quả nhất để hiểu vì sao.'}
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
    </>
  );

  return (
    <div>
      <h1>Lộ trình học cờ</h1>
      <Card>
        <div className="row-between">
          <span>
            Hoàn thành <b>{doneCount}</b>/{total} bài{skippedCount > 0 && <span className="muted small"> · bỏ qua {skippedCount}</span>}
          </span>
          <button className="chip" onClick={() => setPicking(true)}>
            {level.label} · đổi
          </button>
        </div>
        <div className="progress mt">
          <div style={{ width: `${(100 * doneCount) / total}%` }} />
        </div>

      </Card>
      <TodayCard level={level} log={log} nextLesson={next} />
      {!isNew && extras}
      {!isNew && (
        <Card>
          <h3>Cách dùng lộ trình</h3>
          <p className="small muted" style={{ margin: 0 }}>
            Mỗi bài có phần đọc ngắn, vị trí tương tác (phải đi đúng nước) và bài tập từ ván thật. Đọc chỉ nên chiếm 20% thời gian, còn lại là giải bài tập (tab Tập) và chơi rồi phân tích (tab Chơi, Phân tích).
            Phần đã biết thì bấm "Bỏ qua cả giai đoạn".
          </p>
        </Card>
      )}
      {STAGES.map((s) => {
        const ls = LESSONS.filter((l) => l.stage === s.n);
        const anyOpen = ls.some(open);
        const anySkipped = ls.some((l) => lessonSkipped(l, progress));
        return (
          <div key={s.n}>
            <h2 className="mt">
              Giai đoạn {s.n + 1}: {s.title} {!isNew && <span className="muted small">Elo {s.elo}</span>}
            </h2>
            <p className="small muted">
              <b>Mục tiêu:</b> {s.goal}
              {!isNew && (
                <>
                  <br />
                  <b>Lịch:</b> {s.routine}
                </>
              )}
            </p>
            {!isNew && (anyOpen || anySkipped) && (
              <div className="row mb">
                {anyOpen && (
                  <button className="chip" onClick={() => setStage(s.n, 'skipped')}>
                    Tôi đã biết: bỏ qua cả giai đoạn
                  </button>
                )}
                {anySkipped && (
                  <button className="chip" onClick={() => setStage(s.n, undefined)}>
                    Học lại các bài đã bỏ qua
                  </button>
                )}
              </div>
            )}
            {ls.map((l, i) => {
              const done = lessonDone(l, progress);
              const started = (progress.done[l.id]?.length ?? 0) > 0 || progress.read[l.id];
              return (
                <div key={l.id} className="list-item" onClick={() => navigate(`learn/lesson/${l.id}`)}>
                  <div>
                    <div>
                      <span className="muted small">{i + 1}. </span>
                      <b>{l.title}</b>
                      {next?.id === l.id && <span className="tag tag-info" style={{ marginLeft: 6 }}>học tiếp</span>}
                    </div>
                    <div className="small muted">
                      {l.summary} · {l.minutes} phút
                    </div>
                  </div>
                  {done ? <Tag tone="good">✓</Tag> : lessonSkipped(l, progress) ? <Tag>bỏ qua</Tag> : started ? <Tag tone="warn">đang học</Tag> : <span className="muted">›</span>}
                </div>
              );
            })}
            {isNew && s.n === 0 && <div className="mt">{extras}</div>}
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
        if (b.kind === 'squares') {
          taskNo++;
          return (
            <Card key={i}>
              <h3 style={{ margin: 0 }}>
                Bài {taskNo}: tìm ô {doneSet.has(i) && <Tag tone="good">✓</Tag>}
              </h3>
              <p className="small muted">{b.intro}</p>
              <SquareQuiz targets={b.targets} onDone={() => markDone(i)} />
            </Card>
          );
        }
        if (b.kind === 'puzzles') {
          taskNo++;
          return <PuzzleSet key={i} block={b} n={taskNo} done={doneSet.has(i)} onDone={() => markDone(i)} />;
        }
        if (b.kind === 'practice') {
          const done = loadPracticeDone();
          return (
            <Card key={i}>
              <h3 style={{ margin: 0 }}>Tự tay đánh với máy</h3>
              <p className="small muted">{b.intro ?? 'Đọc hiểu chưa đủ: hãy đánh tiếp thế cờ này với máy cho tới khi đạt mục tiêu. Máy chơi hết sức, bạn được đi lại.'}</p>
              {b.ids.map((id) => {
                const p = practiceById(id);
                if (!p) return null;
                return (
                  <div key={id} className="list-item" onClick={() => navigate(`play/practice/${id}?back=learn/lesson/${lesson.id}`)}>
                    <span>
                      <b>{p.title}</b>
                      <div className="small muted">{p.goal === 'draw' ? 'Thủ hòa' : p.goal === 'mate' ? 'Chiếu hết' : 'Phong Hậu hoặc thắng quân'} · bạn cầm {p.me === 'w' ? 'Trắng' : 'Đen'}</div>
                    </span>
                    {done[id] ? <Tag tone="good">✓ đã đạt</Tag> : <span className="muted">›</span>}
                  </div>
                );
              })}
            </Card>
          );
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
          if (v === 'done') logActivity('lessons', 1, lesson.title);
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
  const [misses, setMisses] = useState(0);
  const showExplain = finished !== null || misses >= 2;
  return (
    <Card>
      <div className="row-between">
        <h3 style={{ margin: 0 }}>
          Bài {n} {done && <Tag tone="good">✓</Tag>}
        </h3>
        {block.verify === 'line' && <Tag tone="info">đi theo hướng dẫn</Tag>}
      </div>
      <PuzzleBoard
        fen={block.fen}
        moves={block.moves}
        alternatives={block.alternatives}
        playerFirst
        prompt={block.prompt}
        onWrong={setMisses}
        onFinish={(ok) => {
          setFinished(ok);
          onDone();
        }}
      />
      {showExplain && (
        <div className="task-box small">
          <b>{finished !== null ? 'Giải thích:' : 'Gợi ý lời giải:'}</b> {renderRich(block.explain, { onShow, seqStart: block.fen, squareFen: block.fen })}
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
