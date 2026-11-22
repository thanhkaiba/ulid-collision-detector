import { useEffect, useMemo, useState } from 'react';
import Board from '../components/Board';
import PuzzleBoard, { type PuzzleOutcome } from '../components/PuzzleBoard';
import { Button, Card, Spinner, Tag } from '../components/ui';
import { LESSONS, STAGES, lessonById, type Block, type Lesson, type PuzzleSetBlock, type TaskBlock, type LichessBlock } from '../data/lessons';
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
import { PracticeInline } from './Play';
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
    return <LessonView key={lesson.id} lesson={lesson} progress={progress} setProgress={setProgress} />;
  }
  return <Overview progress={progress} setProgress={setProgress} />;
}

function taskCount(l: Lesson) {
  return l.blocks.filter((b) => b.kind === 'task' || b.kind === 'puzzles' || b.kind === 'squares' || b.kind === 'lichess').length;
}
function lessonDone(l: Lesson, p: LessonProgress) {
  if (p.status[l.id] === 'done') return true;
  if (p.status[l.id] === 'skipped') return false;
  if (l.blocks.some((b) => b.kind === 'practice')) return false;
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
    {
      done: (today.played ?? 0) >= 1,
      label: `Chơi 1 ván với máy (cấp ${level.engineLevel})`,
      why: 'Áp dụng vào ván thật. Tính khi ván kết thúc, hoặc khi đã đi ít nhất 10 nước. Luyện cờ tàn trong bài học không tính.',
      go: 'play',
    },
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
          <span style={{ whiteSpace: 'nowrap' }}>
            Hoàn thành <b>{doneCount}</b>/{total} bài{skippedCount > 0 && <span className="muted small"> · bỏ qua {skippedCount}</span>}
          </span>
          <button className="chip chip-trim" onClick={() => setPicking(true)} title={level.label}>
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

/** One screen of a lesson. A lesson is cut into short slides: each text section, each exercise, a summary. */
type Slide =
  | { kind: 'text'; title: string; block: number; chunk: number; diagrams: number[] }
  | { kind: 'diagram'; block: number }
  | { kind: 'exercise'; block: number; id?: string }
  | { kind: 'end' };

/** Split a text block at its ### headings. */
function chunksOf(md: string): { title: string; md: string }[] {
  const out: { title: string; md: string }[] = [];
  let cur: { title: string; lines: string[] } = { title: '', lines: [] };
  for (const line of md.split('\n')) {
    const h = /^#{1,4}\s+(.*)$/.exec(line.trim());
    if (h) {
      if (cur.lines.join('').trim() || cur.title) out.push({ title: cur.title, md: cur.lines.join('\n') });
      cur = { title: h[1], lines: [] };
    } else cur.lines.push(line);
  }
  if (cur.lines.join('').trim() || cur.title) out.push({ title: cur.title, md: cur.lines.join('\n') });
  return out;
}

function buildSlides(lesson: Lesson): Slide[] {
  const slides: Slide[] = [];
  lesson.blocks.forEach((b, i) => {
    if (b.kind === 'text') {
      chunksOf(b.md).forEach((c, k) => slides.push({ kind: 'text', title: c.title, block: i, chunk: k, diagrams: [] }));
    } else if (b.kind === 'diagram') {
      // a diagram belongs with the text right before it
      const last = slides[slides.length - 1];
      if (last?.kind === 'text' && last.diagrams.length < 2) last.diagrams.push(i);
      else slides.push({ kind: 'diagram', block: i });
    } else if (b.kind === 'practice') {
      for (const id of b.ids) slides.push({ kind: 'exercise', block: i, id });
    } else slides.push({ kind: 'exercise', block: i });
  });
  slides.push({ kind: 'end' });
  return slides;
}

const slideKey = (id: string) => `lesson-slide:${id}`;

function LessonView({ lesson, progress, setProgress }: { lesson: Lesson; progress: LessonProgress; setProgress: (p: LessonProgress) => void }) {
  const idx = LESSONS.indexOf(lesson);
  const prev = LESSONS[idx - 1];
  const next = LESSONS[idx + 1];
  const doneSet = new Set(progress.done[lesson.id] ?? []);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [practiceDone, setPracticeDone] = useState<Record<string, 1>>(loadPracticeDone);
  const slides = useMemo(() => buildSlides(lesson), [lesson]);
  const [at, setAt] = useState(() => {
    try {
      return Math.min(Number(localStorage.getItem(slideKey(lesson.id)) ?? 0) || 0, slides.length - 1);
    } catch {
      return 0;
    }
  });

  // exercise numbering and pass state, per block / practice id
  const taskNo = new Map<number, number>();
  {
    let n = 0;
    lesson.blocks.forEach((b, i) => {
      if (b.kind === 'task' || b.kind === 'squares' || b.kind === 'puzzles' || b.kind === 'lichess') taskNo.set(i, ++n);
    });
  }
  const passed = (sl: Slide): boolean | null => {
    if (sl.kind !== 'exercise') return null;
    if (sl.id) return !!practiceDone[sl.id];
    return doneSet.has(sl.block);
  };
  const required = (sl: Slide) => sl.kind === 'exercise' && (!sl.id || (practiceById(sl.id)?.level ?? 1) < 3);
  const exerciseLabel = (sl: Slide) => {
    if (sl.kind !== 'exercise') return '';
    if (sl.id) return `Đánh với máy: ${practiceById(sl.id)?.title ?? sl.id}`;
    const b = lesson.blocks[sl.block];
    return b.kind === 'puzzles' ? `Bài ${taskNo.get(sl.block)} (luyện tập)` : `Bài ${taskNo.get(sl.block)}`;
  };
  const missing = slides.filter((sl) => required(sl) && !passed(sl)).map(exerciseLabel);

  useEffect(() => {
    setPreview(null);
    if (!progress.read[lesson.id]) {
      const p = { ...progress, read: { ...progress.read, [lesson.id]: 1 as const } };
      setProgress(p);
      saveLessonProgress(p);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.id]);

  const go = (i: number) => {
    const n = Math.max(0, Math.min(slides.length - 1, i));
    setAt(n);
    setPreview(null);
    try {
      localStorage.setItem(slideKey(lesson.id), String(n));
    } catch {
      /* ignore */
    }
    window.scrollTo({ top: 0 });
  };

  const markDone = async (blockIndex: number) => {
    if (doneSet.has(blockIndex)) return;
    const p: LessonProgress = { ...progress, done: { ...progress.done, [lesson.id]: [...doneSet, blockIndex] } };
    setProgress(p);
    await saveLessonProgress(p);
  };

  const sl = slides[at];
  const renderText = (block: number, chunk: number) => {
    const b = lesson.blocks[block];
    if (b.kind !== 'text') return null;
    const chunks = chunksOf(b.md);
    // move chips continue a line of play across the section: replay the earlier sections first
    const seq = { line: [START_FEN] };
    const fn = (t: string) => renderRich(t, { onShow: setPreview, seqStart: START_FEN, seq });
    // headings carry moves too (e.g. "Ván cờ Ý (1.e4 e5 2.Nf3 Nc6 3.Bc4)"), read in order with the text
    for (let k = 0; k < chunk; k++) {
      if (chunks[k].title) fn(chunks[k].title);
      renderMd(chunks[k].md, fn);
    }
    const title = chunks[chunk].title ? fn(chunks[chunk].title) : null;
    return { title, body: renderMd(chunks[chunk].md, fn) };
  };

  const body = (() => {
    if (sl.kind === 'text')
      return (
        <div className="slide-text">
          {(() => {
            const r = renderText(sl.block, sl.chunk);
            return r ? (
              <>
                {r.title && <h2 className="slide-title">{r.title}</h2>}
                {r.body}
              </>
            ) : null;
          })()}
          {sl.diagrams.map((d) => {
            const b = lesson.blocks[d];
            return b.kind === 'diagram' ? <Diagram key={d} block={b} onShow={setPreview} /> : null;
          })}
        </div>
      );
    if (sl.kind === 'diagram') {
      const b = lesson.blocks[sl.block];
      return b.kind === 'diagram' ? <Diagram block={b} onShow={setPreview} /> : null;
    }
    if (sl.kind === 'exercise') {
      const i = sl.block;
      const b = lesson.blocks[i];
      if (b.kind === 'task') return <TaskView key={i} block={b} n={taskNo.get(i)!} done={doneSet.has(i)} onDone={() => markDone(i)} onShow={setPreview} />;
      if (b.kind === 'squares')
        return (
          <Card key={i}>
            <h3 style={{ margin: 0 }}>
              Bài {taskNo.get(i)}: tìm ô {doneSet.has(i) && <Tag tone="good">✓ đã qua</Tag>}
            </h3>
            <p className="small muted">{b.intro}</p>
            <SquareQuiz targets={b.targets} onDone={() => markDone(i)} />
          </Card>
        );
      if (b.kind === 'puzzles') return <PuzzleSet key={i} block={b} n={taskNo.get(i)!} done={doneSet.has(i)} onDone={() => markDone(i)} />;
      if (b.kind === 'lichess') return <LichessTask key={i} block={b} n={taskNo.get(i)!} done={doneSet.has(i)} onDone={() => markDone(i)} />;
      if (b.kind === 'practice' && sl.id) {
        const p = practiceById(sl.id);
        if (!p) return null;
        return (
          <div key={sl.id}>
            <div className="tiny muted">TỰ TAY ĐÁNH VỚI MÁY · {p.goal === 'draw' ? 'THỦ HÒA' : p.goal === 'mate' ? 'CHIẾU HẾT' : 'PHONG HẬU HOẶC THẮNG QUÂN'}</div>
            <h2 className="slide-title" style={{ marginTop: 2 }}>
              {p.title} {practiceDone[p.id] && <Tag tone="good">✓ đã đạt</Tag>}
            </h2>
            <p className="small" style={{ marginTop: 0 }}>
              {b.ids.length === 1 && b.intro ? b.intro : p.brief} Cứ đi quân là bắt đầu, máy chơi hết sức.
            </p>
            {p.level >= 3 && <p className="tiny muted">Bài khó, không bắt buộc để qua bài học.</p>}
            <PracticeInline pos={p} onGoal={() => setPracticeDone(loadPracticeDone())} />
          </div>
        );
      }
      return null;
    }
    // summary
    const exercises = slides.map((x, k) => ({ x, k })).filter(({ x }) => x.kind === 'exercise');
    return (
      <div>
        <h2 className="slide-title">Tổng kết bài</h2>
        {exercises.length > 0 && (
          <Card>
            <h3>Bài tập trong bài</h3>
            {exercises.map(({ x, k }) => (
              <div key={k} className="list-item" onClick={() => go(k)}>
                <span>
                  {passed(x) ? '✅' : required(x) ? '⬜' : '◻️'} {exerciseLabel(x)}
                  {!required(x) && <span className="tiny muted"> · không bắt buộc</span>}
                </span>
                <span className="muted">{passed(x) ? 'xem lại' : 'làm'} ›</span>
              </div>
            ))}
          </Card>
        )}
        <MarkBar
          status={progress.status[lesson.id]}
          missing={missing}
          onMark={async (v) => {
            setProgress(await setLessonStatus(lesson.id, v));
            if (v === 'done') logActivity('lessons', 1, lesson.title);
            if (v && next) navigate(`learn/lesson/${next.id}`);
            else if (v) navigate('learn');
          }}
        />
        {lesson.resources && (
          <Card className="mt">
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
        <div className="row-between mt">
          {prev ? (
            <Button kind="ghost" onClick={() => navigate(`learn/lesson/${prev.id}`)}>
              ‹ Bài trước
            </Button>
          ) : (
            <span />
          )}
          {next && (
            <Button kind="ghost" onClick={() => navigate(`learn/lesson/${next.id}`)}>
              Bài sau ›
            </Button>
          )}
        </div>
      </div>
    );
  })();

  const state = passed(sl);
  const nextLabel = at === slides.length - 2 ? 'Tổng kết' : state === false ? 'Làm sau' : 'Tiếp';
  return (
    <div className="lesson-body slides">
      <div className="slide-head">
        <div className="topbar" style={{ marginBottom: 6 }}>
          <button className="back" onClick={() => navigate('learn')} aria-label="Quay lại">
            ‹
          </button>
          <div className="grow" style={{ minWidth: 0 }}>
            <div className="tiny muted">
              Giai đoạn {lesson.stage + 1} · {lesson.minutes} phút · {at + 1}/{slides.length}
            </div>
            <div className="slide-lesson-title">{lesson.title}</div>
          </div>
        </div>
        <div className="slide-dots">
          {slides.map((x, k) => (
            <button
              key={k}
              aria-label={`Trang ${k + 1}`}
              className={`dot ${k === at ? 'cur' : ''} ${k < at ? 'seen' : ''} ${x.kind === 'exercise' ? 'ex' : ''} ${passed(x) ? 'ok' : ''}`}
              onClick={() => go(k)}
            />
          ))}
        </div>
      </div>
      <div className="slide-body" key={at}>
        {body}
      </div>
      <PreviewSheet preview={preview} onClose={() => setPreview(null)} />
      {sl.kind !== 'end' && (
        <div className="slide-nav">
          <Button kind="ghost" onClick={() => go(at - 1)} disabled={at === 0}>
            ‹ Trước
          </Button>
          <Button kind={state === false ? 'default' : 'primary'} className="grow" onClick={() => go(at + 1)}>
            {nextLabel} ›
          </Button>
        </div>
      )}
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
        {renderRich(block.caption, { onShow, seqStart: block.fen, squareFen: block.fen, braces: { before: block.fen, after: block.fen } })}
      </p>
    </Card>
  );
}

function TaskView({ block, n, done, onDone, onShow }: { block: TaskBlock; n: number; done: boolean; onDone: () => void; onShow: (p: Preview) => void }) {
  const [finished, setFinished] = useState<PuzzleOutcome | null>(null);
  const [misses, setMisses] = useState(0);
  const showExplain = finished !== null || misses >= 2;
  return (
    <Card>
      <div className="row-between">
        <h3 style={{ margin: 0 }}>
          Bài {n} {done && <Tag tone="good">✓ đã qua</Tag>}
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
        onFinish={(_, how) => {
          setFinished(how);
          if (how !== 'shown') onDone();
        }}
      />
      {finished === 'shown' && !done && (
        <div className="feedback bad small">Chưa tính là qua vì bạn đã xem nước đi. Đọc giải thích, rồi bấm “Làm lại” và tự đi.</div>
      )}
      {showExplain && (
        <div className="task-box small">
          <b>{finished !== null ? 'Giải thích:' : 'Gợi ý lời giải:'}</b> {renderRich(block.explain, { onShow, seqStart: block.fen, squareFen: block.fen, braces: { before: block.fen, after: block.fen } })}
        </div>
      )}
    </Card>
  );
}

/** A fixed puzzle from the Lichess database (a real game): passes when the student finds the moves. */
function LichessTask({ block, n, done, onDone }: { block: LichessBlock; n: number; done: boolean; onDone: () => void }) {
  const [p, setP] = useState<Puzzle | null | undefined>(undefined);
  const [finished, setFinished] = useState<PuzzleOutcome | null>(null);
  useEffect(() => {
    loadPuzzles().then((all) => setP(all.find((x) => x.id === block.id) ?? null));
  }, [block.id]);
  const info = useMemo(() => {
    if (!p) return null;
    const c = new Chess(p.fen);
    const first = c.move({ from: p.moves[0].slice(0, 2), to: p.moves[0].slice(2, 4), promotion: p.moves[0][4] as 'q' | undefined });
    const side = c.turn() === 'w' ? 'Trắng' : 'Đen';
    const startNo = Number(c.fen().split(' ')[5]);
    const sans: string[] = [];
    for (const u of p.moves.slice(1)) sans.push(c.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] as 'q' | undefined }).san);
    const line = sans.map((s, k) => {
      const ply = k + (side === 'Đen' ? 1 : 0);
      const no = startNo + Math.floor(ply / 2);
      return (ply % 2 === 0 ? `${no}.` : k === 0 ? `${no}...` : '') + s;
    });
    return { side, opp: first.san, line: line.join(' ') };
  }, [p]);
  if (p === undefined) return <Spinner label="Đang tải bài tập..." />;
  if (!p || !info) return null;
  return (
    <Card>
      <div className="row-between">
        <h3 style={{ margin: 0 }}>
          Bài {n} {done && <Tag tone="good">✓ đã qua</Tag>}
        </h3>
        <Tag tone="info">ván thật · Lichess</Tag>
      </div>
      <PuzzleBoard
        key={p.id}
        fen={p.fen}
        moves={p.moves}
        playerFirst={false}
        prompt={`Bạn cầm ${info.side} (phía dưới bàn cờ). Đối phương vừa đi ${info.opp}. ${block.prompt}`}
        onFinish={(_, how) => {
          setFinished(how);
          if (how !== 'shown') onDone();
        }}
      />
      {finished === 'shown' && !done && (
        <div className="feedback bad small">Chưa tính là qua vì bạn đã xem nước đi. Bấm “Làm lại” và tự đi.</div>
      )}
      {finished !== null && (
        <div className="task-box small">
          <b>Lời giải:</b> {info.line}
          {block.explain && <div className="mt">{block.explain}</div>}
          <div className="tiny muted mt">
            Bài lấy từ một ván đấu thật trong cơ sở dữ liệu bài tập của Lichess (rating bài {p.rating}).{' '}
            <a href={p.url} target="_blank" rel="noreferrer">
              Xem trên Lichess
            </a>
          </div>
        </div>
      )}
    </Card>
  );
}

function PuzzleSet({ block, n, done, onDone }: { block: PuzzleSetBlock; n: number; done: boolean; onDone: () => void }) {
  const [all, setAll] = useState<Puzzle[] | null>(null);
  const [round, setRound] = useState(0);
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
    // spread across themes so a set is not all one theme; each retry round deals the next puzzles
    const perTheme = Math.ceil(block.count / block.themes.length);
    const pick = (r: number) => {
      const out: Puzzle[] = [];
      for (const t of block.themes) {
        const ofTheme = cands.filter((p) => p.themes.includes(t));
        const from = (r * perTheme) % Math.max(1, ofTheme.length);
        out.push(...[...ofTheme.slice(from), ...ofTheme.slice(0, from)].filter((p) => !out.includes(p)).slice(0, perTheme));
      }
      return out.slice(0, block.count);
    };
    return pick(round);
  }, [all, block, round]);

  if (!all) return <Spinner label="Đang tải bài tập..." />;
  if (!set.length) return null;
  const p = set[Math.min(i, set.length - 1)];
  const finishedAll = results.length >= set.length;
  const need = Math.ceil(set.length * 0.6);
  const right = results.filter(Boolean).length;
  const retry = () => {
    setResults([]);
    setI(0);
    setCur(null);
    setRound(round + 1);
  };
  return (
    <Card>
      <div className="row-between">
        <h3 style={{ margin: 0 }}>
          Bài {n}: luyện tập {done && <Tag tone="good">✓ đã qua</Tag>}
        </h3>
        <span className="muted small">
          {Math.min(i + 1, set.length)}/{set.length}
        </span>
      </div>
      {block.intro && <p className="small muted">{block.intro}</p>}
      {!done && !finishedAll && <p className="tiny muted">Để qua: đúng ngay lần đầu ít nhất {need}/{set.length} bài.</p>}
      {!finishedAll && (
        <>
          <p className="tiny muted">Rating bài: {p.rating}</p>
          <PuzzleBoard key={`${round}-${p.id}`} fen={p.fen} moves={p.moves} playerFirst={p.playerFirst} onFinish={(ok) => setCur(ok)} />
          {cur !== null && (
            <div className="row mt">
              <Button
                kind="primary"
                onClick={() => {
                  const r = [...results, cur];
                  setResults(r);
                  setCur(null);
                  setI(i + 1);
                  if (r.length >= set.length && r.filter(Boolean).length >= need) onDone();
                }}
              >
                {i + 1 >= set.length ? 'Hoàn thành' : 'Bài tiếp →'}
              </Button>
            </div>
          )}
        </>
      )}
      {finishedAll &&
        (right >= need ? (
          <div className="feedback ok">
            Qua! {right}/{set.length} đúng ngay lần đầu.{' '}
            <button className="chip" onClick={retry}>
              làm thêm bộ khác
            </button>
          </div>
        ) : (
          <div className="feedback bad">
            {right}/{set.length} đúng ngay lần đầu, cần ít nhất {need}. Làm bộ khác cùng chủ đề để qua.{' '}
            <button className="chip" onClick={retry}>
              làm bộ khác
            </button>
          </div>
        ))}
    </Card>
  );
}
