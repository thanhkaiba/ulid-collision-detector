import { useState } from 'react';
import { Button, Tag } from './ui';

/** "Đã học / Bỏ qua" controls shown at the end of a lesson or book section. */
export default function MarkBar({
  status,
  onMark,
  missing = [],
}: {
  status: 'done' | 'skipped' | undefined;
  onMark: (value: 'done' | 'skipped' | undefined) => void;
  /** exercises not passed yet: "learned" still works, but asks once more first */
  missing?: string[];
}) {
  const [confirming, setConfirming] = useState(false);
  const left = missing.length;
  const markDone = () => {
    if (left > 0 && !confirming) setConfirming(true);
    else {
      setConfirming(false);
      onMark('done');
    }
  };
  const warning = confirming && (
    <div className="feedback warn small">
      {/* a long list here only repeats the exercise list right above it */}
      Còn {left} bài tập chưa qua{left <= 2 ? `: ${missing.join(', ')}` : ''}. Bỏ qua bài tập thì dễ hổng kiến thức ở các bài sau.
      <div className="row mt">
        <Button kind="primary" onClick={markDone}>
          Vẫn đánh dấu đã học
        </Button>
        <Button kind="ghost" onClick={() => setConfirming(false)}>
          Quay lại làm bài
        </Button>
      </div>
    </div>
  );
  if (status) {
    return (
      <div>
        <div className="markbar">
          <Tag tone={status === 'done' ? 'good' : 'warn'}>{status === 'done' ? '✓ Đã học' : '↷ Đã bỏ qua'}</Tag>
          <button className="chip" onClick={() => onMark(undefined)}>
            Bỏ đánh dấu
          </button>
          {status === 'skipped' && !confirming && (
            <button className="chip" onClick={markDone}>
              Chuyển thành đã học
            </button>
          )}
        </div>
        {warning}
      </div>
    );
  }
  return (
    <div>
      {left > 0 && !confirming && (
        <p className="tiny muted" style={{ margin: '0 0 6px' }}>
          Còn {left} bài tập chưa qua. Vẫn đánh dấu đã học được, nhưng nên làm cho xong.
        </p>
      )}
      {warning || (
        <div className="markbar">
          <Button kind="primary" onClick={markDone}>
            ✓ Đã học
          </Button>
          <Button kind="ghost" onClick={() => onMark('skipped')}>
            ↷ Bỏ qua
          </Button>
        </div>
      )}
    </div>
  );
}
