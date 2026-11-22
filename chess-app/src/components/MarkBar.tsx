import { Button, Tag } from './ui';

/** "Đã học / Bỏ qua" controls shown at the end of a lesson or book section. */
export default function MarkBar({
  status,
  onMark,
  missing = [],
}: {
  status: 'done' | 'skipped' | undefined;
  onMark: (value: 'done' | 'skipped' | undefined) => void;
  /** exercises still to pass: while any are left, "learned" is locked (skipping stays possible) */
  missing?: string[];
}) {
  if (status) {
    return (
      <div className="markbar">
        <Tag tone={status === 'done' ? 'good' : 'warn'}>{status === 'done' ? '✓ Đã học' : '↷ Đã bỏ qua'}</Tag>
        <button className="chip" onClick={() => onMark(undefined)}>
          Bỏ đánh dấu
        </button>
        {status === 'skipped' && missing.length === 0 && (
          <button className="chip" onClick={() => onMark('done')}>
            Chuyển thành đã học
          </button>
        )}
      </div>
    );
  }
  const locked = missing.length > 0;
  return (
    <div>
      {locked && (
        <div className="feedback info small">
          {/* a long list here only repeats the exercise list right above it */}
          Qua hết bài tập mới được đánh dấu đã học. Còn {missing.length} bài chưa qua{missing.length <= 2 ? `: ${missing.join(', ')}` : ''}.
          <div className="tiny" style={{ fontWeight: 400, marginTop: 4 }}>
            Đã biết bài này rồi thì bấm “Bỏ qua” để sang bài sau.
          </div>
        </div>
      )}
      <div className="markbar">
        <Button kind="primary" onClick={() => onMark('done')} disabled={locked}>
          {locked ? '🔒 Đã học' : '✓ Đã học'}
        </Button>
        <Button kind="ghost" onClick={() => onMark('skipped')}>
          ↷ Bỏ qua
        </Button>
      </div>
    </div>
  );
}
