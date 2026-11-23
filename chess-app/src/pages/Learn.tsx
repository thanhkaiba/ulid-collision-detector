import { useEffect, useMemo, useState } from 'react';
import Board from '../components/Board';
import PuzzleBoard, { type PuzzleOutcome } from '../components/PuzzleBoard';
import { Button, Card, Spinner, Tag } from '../components/ui';
import { LESSONS, STAGES, lessonById, type Block, type Lesson, type PuzzleSetBlock, type TaskBlock, type LichessBlock, type ExampleBlock } from '../data/lessons';
import MethodDemo from '../components/MethodDemo';
import { renderMd } from '../lib/markdown';
import { loadPuzzles, type Puzzle } from '../lib/puzzles';
import { loadLessonProgress, saveLessonProgress, setLessonStatus, loadSettings, type LessonProgress, type Settings } from '../lib/storage';
import { LEVELS_INFO, levelInfo, chooseLevel, type LevelId, type LevelInfo } from '../lib/level';
import { loadActivity, logActivity, unlogLesson, dayKey, streak, type ActivityLog } from '../lib/activity';
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
import { LEGACY_KEYS } from '../data/lessons/legacyKeys';
import { judgeMove } from '../lib/judge';
import { PracticeInline } from './Play';
import { puzzlePrompt } from './Puzzles';
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
    if (!lesson)
      return (
        <div>
          <p>Không tìm thấy bài học.</p>
          <Button onClick={() => navigate('learn')}>‹ Về lộ trình</Button>
        </div>
      );
    return <LessonGate key={lesson.id} lesson={lesson} progress={progress} setProgress={setProgress} />;
  }
  return <Overview progress={progress} setProgress={setProgress} />;
}

/**
 * A stable name for an exercise, so progress survives when blocks are added, removed or reordered
 * (it used to be the block's position, and every edit of a lesson shifted the ticks).
 */
function exerciseKey(b: Block, i: number): string {
  if (b.kind === 'lichess' || b.kind === 'example') return `l:${b.id}`;
  if (b.kind === 'task') return `t:${b.fen}:${b.moves[0]}`;
  if (b.kind === 'squares') return `s:${b.targets.join(',')}`;
  if (b.kind === 'puzzles') return `p:${b.themes.join(',')}:${b.rating.join('-')}`;
  return `b:${i}`;
}
/** lessons rebuilt after the index-based progress was written: old indices no longer point at the same exercise */
const RELAID = new Set(['tactics-1', 'tactics-2', 'tactics-3', 'piece-values']);
/** keys of the exercises of lesson `l` that are passed */
function doneKeys(l: Lesson, p: LessonProgress): Set<string> {
  const out = new Set<string>();
  for (const v of p.done[l.id] ?? []) {
    if (typeof v === 'string') out.add(v);
    else if (!RELAID.has(l.id) && LEGACY_KEYS[l.id]?.[v]) out.add(LEGACY_KEYS[l.id][v]);
  }
  return out;
}
/**
 * A lesson is done only once "Đã học" was pressed on its summary. It used to also count as done as soon as every exercise
 * was passed, so the roadmap showed ✓ while the summary still offered "Đã học" and today's plan did not tick.
 */
function lessonDone(l: Lesson, p: LessonProgress) {
  return p.status[l.id] === 'done';
}

/** puzzles a puzzle-set block draws from (deterministic order: short puzzles first, then by id) */
function setCandidates(all: Puzzle[], block: PuzzleSetBlock): Puzzle[] {
  const [lo, hi] = block.rating;
  const cands = all.filter((p) => p.rating >= lo && p.rating <= hi && block.themes.some((t) => p.themes.includes(t)));
  return cands.sort((a, b) => a.moves.length - b.moves.length || (a.id < b.id ? -1 : 1));
}

/**
 * Loads the puzzle base first when the lesson has puzzle sets: a set with no puzzle to deal (theme missing from the
 * bundled base) is left out, otherwise it showed an empty slide and locked "Đã học" forever.
 */
function LessonGate({ lesson, progress, setProgress }: { lesson: Lesson; progress: LessonProgress; setProgress: (p: LessonProgress) => void }) {
  const needs = lesson.blocks.some((b) => b.kind === 'puzzles');
  const [all, setAll] = useState<Puzzle[] | null>(null);
  useEffect(() => {
    if (needs) loadPuzzles().then(setAll);
  }, [needs]);
  const empty = useMemo(() => {
    const out = new Set<number>();
    if (all) lesson.blocks.forEach((b, i) => b.kind === 'puzzles' && setCandidates(all, b).length === 0 && out.add(i));
    return out;
  }, [all, lesson]);
  if (needs && !all) return <Spinner label="Đang tải bài học..." />;
  return <LessonView lesson={lesson} progress={progress} setProgress={setProgress} hidden={empty} />;
}
const lessonSkipped = (l: Lesson, p: LessonProgress) => p.status[l.id] === 'skipped';

function LevelPicker({ current, onPick, onCancel }: { current?: string; onPick: (id: LevelId) => void; onCancel?: () => void }) {
  return (
    <Card>
      <h3>Bạn đang ở trình độ nào?</h3>
      <p className="small muted">Ứng dụng sẽ chọn bài bắt đầu, độ khó bài tập và cấp độ máy cho phù hợp. Đổi lại lúc nào cũng được.</p>
      {LEVELS_INFO.map((l) => (
        // the current level just closes the picker: picking it again would reset the puzzle rating and engine level
        <div key={l.id} className="list-item" onClick={() => (current === l.id && onCancel ? onCancel() : onPick(l.id))}>
          <div>
            <b>{l.label}</b>
            <div className="small muted">{l.desc}</div>
          </div>
          {current === l.id ? (
            <span style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
              <Tag tone="good">đang chọn</Tag>
            </span>
          ) : (
            <span className="muted">›</span>
          )}
        </div>
      ))}
      {onCancel && (
        <div className="row mt">
          <Button kind="ghost" onClick={onCancel}>
            ‹ Giữ nguyên trình độ
          </Button>
        </div>
      )}
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
      why: 'Áp dụng vào ván thật. Tính khi ván kết thúc bằng chiếu hết hoặc hòa, hoặc khi mỗi bên đã đi ít nhất 10 nước. Xin thua sớm và luyện cờ tàn không tính.',
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
        <LevelPicker current={settings.level} onPick={pick} onCancel={level ? () => setPicking(false) : undefined} />
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
              const started = doneKeys(l, progress).size > 0 || progress.read[l.id];
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
                  <span style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {done ? <Tag tone="good">✓</Tag> : lessonSkipped(l, progress) ? <Tag>bỏ qua</Tag> : started ? <Tag tone="warn">đang học</Tag> : <span className="muted">›</span>}
                  </span>
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
  // a short lead-in before the first heading opens the first section instead of being a slide of its own
  if (out.length > 1 && !out[0].title) {
    const [lead, first] = out.splice(0, 2);
    out.unshift({ title: first.title, md: `${lead.md.trim()}\n\n${first.md}` });
  }
  return out;
}

function buildSlides(lesson: Lesson, hidden: Set<number>): Slide[] {
  const slides: Slide[] = [];
  lesson.blocks.forEach((b, i) => {
    if (hidden.has(i)) return;
    if (b.kind === 'text') {
      chunksOf(b.md).forEach((c, k) => slides.push({ kind: 'text', title: c.title, block: i, chunk: k, diagrams: [] }));
    } else if (b.kind === 'example') {
      // the example takes over the slide of the text section right before it
      const last = slides[slides.length - 1];
      if (last?.kind === 'text' && last.block === i - 1) slides.pop();
      slides.push({ kind: 'diagram', block: i });
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

function LessonView({ lesson, progress, setProgress, hidden }: { lesson: Lesson; progress: LessonProgress; setProgress: (p: LessonProgress) => void; hidden: Set<number> }) {
  const idx = LESSONS.indexOf(lesson);
  const prev = LESSONS[idx - 1];
  const next = LESSONS[idx + 1];
  const keys = doneKeys(lesson, progress);
  /** passed? by block position, looked up through the stable key */
  const doneSet = { has: (i: number) => !!lesson.blocks[i] && keys.has(exerciseKey(lesson.blocks[i], i)) };
  const [preview, setPreview] = useState<Preview | null>(null);
  const [practiceDone, setPracticeDone] = useState<Record<string, 1>>(loadPracticeDone);
  const slides = useMemo(() => buildSlides(lesson, hidden), [lesson, hidden]);
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
      if (!hidden.has(i) && (b.kind === 'task' || b.kind === 'squares' || b.kind === 'puzzles' || b.kind === 'lichess')) taskNo.set(i, ++n);
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
    const p: LessonProgress = { ...progress, done: { ...progress.done, [lesson.id]: [...keys, exerciseKey(lesson.blocks[blockIndex], blockIndex)] } };
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
      if (b.kind === 'example') {
        // the text it illustrates goes on the same slide
        const prev = lesson.blocks[sl.block - 1];
        const chunks = prev?.kind === 'text' ? chunksOf(prev.md) : [];
        const last = chunks[chunks.length - 1];
        return (
          <div className="slide-text">
            {last?.title && <h2 className="slide-title">{last.title}</h2>}
            {last && renderMd(last.md, (t) => renderRich(t, { onShow: setPreview, seqStart: START_FEN }))}
            <ExampleView block={b} />
          </div>
        );
      }
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
            <SquareQuiz targets={b.targets} onDone={() => markDone(i)} storeKey={`squares:${lesson.id}:${exerciseKey(b, i)}`} />
          </Card>
        );
      if (b.kind === 'puzzles') return <PuzzleSet key={i} block={b} n={taskNo.get(i)!} done={doneSet.has(i)} onDone={() => markDone(i)} storeKey={`pset:${lesson.id}:${exerciseKey(b, i)}`} />;
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
                <span className="muted" style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {passed(x) ? 'xem lại' : 'làm'} ›
                </span>
              </div>
            ))}
          </Card>
        )}
        <MarkBar
          status={progress.status[lesson.id]}
          missing={missing}
          onMark={async (v) => {
            setProgress(await setLessonStatus(lesson.id, v));
            // written before leaving, so the overview's plan already shows it ticked
            if (v === 'done') await logActivity('lessons', 1, lesson.title);
            // un-marking a lesson finished today takes it back out of today's plan
            else if (v === undefined && progress.status[lesson.id] === 'done') await unlogLesson(lesson.title);
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
  const exAll = slides.filter((x) => x.kind === 'exercise');
  const exTotal = exAll.length;
  const exPassed = exAll.filter((x) => passed(x)).length;
  // not "Bỏ qua": that word is the lesson-level skip on the summary, this only leaves the exercise for later
  const nextLabel = state === false ? 'Để sau' : at === slides.length - 2 ? 'Tổng kết' : 'Tiếp';
  return (
    <div className="lesson-body slides">
      <div className="slide-head">
        <div className="topbar" style={{ marginBottom: 6 }}>
          <button className="back" onClick={() => navigate('learn')} aria-label="Quay lại">
            ‹
          </button>
          <div className="grow" style={{ minWidth: 0 }}>
            <div className="tiny muted">
              Trang {at + 1}/{slides.length}
              {exTotal > 0 && (
                <>
                  {' · '}bài tập đã qua {exPassed}/{exTotal}
                </>
              )}
            </div>
            <div className="slide-lesson-title">{lesson.title}</div>
          </div>
        </div>
        <div className="slide-dots">
          {slides.map((x, k) => (
            <button
              key={k}
              aria-label={`Trang ${k + 1}`}
              aria-current={k === at ? 'step' : undefined}
              className={`dot ${k === at ? 'cur' : ''} ${k < at ? 'seen' : ''} ${passed(x) ? 'ok' : ''}`}
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
          <Button kind={state === false ? 'ghost' : 'primary'} className="grow" onClick={() => go(at + 1)}>
            {nextLabel} ›
          </Button>
        </div>
      )}
    </div>
  );
}

function Diagram({ block, onShow }: { block: Extract<Block, { kind: 'diagram' }>; onShow: (p: Preview) => void }) {
  const chess = useMemo(() => new Chess(block.fen), [block.fen]);
  const shapes: DrawShape[] = (block.marks ?? []).map((raw) => {
    const [m, brush = 'green'] = raw.split(':');
    return m.length >= 4 ? { orig: m.slice(0, 2) as Key, dest: m.slice(2, 4) as Key, brush } : { orig: m as Key, brush };
  });
  return (
    <Card>
      <Board
        fen={block.fen}
        orientation={block.orientation ?? 'white'}
        turnColor={chess.turn() === 'w' ? 'white' : 'black'}
        lastMove={block.lastMove ? [block.lastMove.slice(0, 2) as Key, block.lastMove.slice(2, 4) as Key] : undefined}
        viewOnly
        sides
        shapes={shapes}
        check={chess.inCheck() ? (chess.turn() === 'w' ? 'white' : 'black') : false}
      />
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
        judge={(uci, fen) => judgeMove(uci, fen, { mate: block.verify === 'mate' })}
        mateGoal={block.verify === 'mate'}
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
/** A Lichess puzzle played out as a worked example with one note per move. */
function ExampleView({ block }: { block: ExampleBlock }) {
  const [p, setP] = useState<Puzzle | null | undefined>(undefined);
  useEffect(() => {
    loadPuzzles().then((all) => setP(all.find((x) => x.id === block.id) ?? null));
  }, [block.id]);
  const data = useMemo(() => {
    if (!p) return null;
    const c = new Chess(p.fen);
    c.move({ from: p.moves[0].slice(0, 2), to: p.moves[0].slice(2, 4), promotion: p.moves[0][4] as 'q' | undefined });
    const fen = c.fen();
    const me = c.turn();
    const demo: [string, string?][] = [];
    p.moves.slice(1).forEach((u, k) => demo.push([c.move({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] as 'q' | undefined }).san, block.notes[k]]));
    return { pos: { id: block.id, group: 'Chiếu hết cơ bản' as const, title: '', fen, me, goal: 'win' as const, brief: '', hint: '', level: 1 as const }, method: { steps: [], demo } };
  }, [p, block]);
  if (p === undefined) return <Spinner label="Đang tải ví dụ..." />;
  if (!data) return null;
  return (
    <Card>
      <div className="tiny muted">VÍ DỤ · {data.pos.me === 'w' ? 'TRẮNG' : 'ĐEN'} ĐI</div>
      <p className="small" style={{ margin: '4px 0 0' }}>{block.caption}</p>
      <MethodDemo pos={data.pos} method={data.method} />
    </Card>
  );
}

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
          <div className="tiny mt">
            <a href={p.url} target="_blank" rel="noreferrer">
              Xem trên Lichess
            </a>
          </div>
        </div>
      )}
    </Card>
  );
}

function PuzzleSet({ block, n, done, onDone, storeKey }: { block: PuzzleSetBlock; n: number; done: boolean; onDone: () => void; storeKey: string }) {
  const [all, setAll] = useState<Puzzle[] | null>(null);
  // progress survives leaving the slide (e.g. tapping the slide button by mistake)
  const saved = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem(storeKey) ?? 'null') as { round: number; i: number; results: boolean[]; missed?: number } | null;
    } catch {
      return null;
    }
  }, [storeKey]);
  const [round, setRound] = useState(saved?.round ?? 0);
  // results are recorded the moment a puzzle ends; a puzzle answered before leaving counts as done
  const [i, setI] = useState(Math.max(saved?.i ?? 0, saved?.results?.length ?? 0));
  const [results, setResults] = useState<boolean[]>(saved?.results ?? []);
  /**
   * index of the puzzle in play that already had a wrong move. Kept with the rest, so leaving the slide (or reloading)
   * after a wrong move no longer hands out a fresh "first try".
   */
  const [missed, setMissed] = useState<number | null>(saved?.missed ?? null);
  const [cur, setCur] = useState<boolean | null>(null);
  useEffect(() => {
    loadPuzzles().then(setAll);
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(storeKey, JSON.stringify({ round, i, results, missed }));
    } catch {
      /* ignore */
    }
  }, [storeKey, round, i, results, missed]);
  const set = useMemo(() => {
    if (!all) return [];
    const cands = setCandidates(all, block);
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
  const finishedAll = i >= set.length;
  const need = Math.ceil(set.length * 0.6);
  const right = results.filter(Boolean).length;
  const left = set.length - results.length;
  const retry = () => {
    setResults([]);
    setI(0);
    setCur(null);
    setMissed(null);
    setRound(round + 1);
  };
  const missedHere = missed === i && results.length === i;
  // say why only when coming back to it: right after the wrong move the board already says so
  const resumedMiss = !!saved && saved.missed === i && (saved.results?.length ?? 0) === i && saved.round === round;
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
      {!finishedAll && (
        <p className="tiny muted">
          Để qua: đúng ngay lần đầu ít nhất {need}/{set.length} bài.
          {results.length > 0 && ` Đang đúng ${right}/${results.length}.`}
          {right >= need ? ' Đã đủ để qua!' : right + left < need ? ' Bộ này không còn đủ câu để qua, làm hết rồi làm bộ khác.' : ''}
        </p>
      )}
      {!finishedAll && resumedMiss && <p className="tiny muted">Câu này bạn đã đi sai một lần trước khi rời trang, nên không tính là đúng ngay lần đầu. Vẫn giải nốt để sang câu tiếp.</p>}
      {!finishedAll && (
        <>
          <PuzzleBoard
            key={`${round}-${p.id}`}
            fen={p.fen}
            moves={p.moves}
            playerFirst={p.playerFirst}
            prompt={puzzlePrompt(p)}
            onWrong={() => setMissed(i)}
            onHint={() => setMissed(i)}
            onFinish={(solved) => {
              const ok = solved && !missedHere;
              setCur(ok);
              const r = [...results, ok];
              setResults(r);
              // pass as soon as enough puzzles are right, no need to finish the set first
              if (r.filter(Boolean).length >= need) onDone();
            }}
          />
          {cur !== null && (
            <div className="row mt">
              <Button
                kind="primary"
                onClick={() => {
                  setCur(null);
                  setI(i + 1);
                }}
              >
                {i + 1 >= set.length ? 'Xem kết quả' : `Câu tiếp (${i + 2}/${set.length}) →`}
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
