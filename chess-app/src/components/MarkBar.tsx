import { Button, Tag } from './ui';

/** "Đã học / Bỏ qua" controls shown at the end of a lesson or book section. */
export default function MarkBar({
  status,
  onMark,
}: {
  status: 'done' | 'skipped' | undefined;
  onMark: (value: 'done' | 'skipped' | undefined) => void;
}) {
  if (status) {
    return (
      <div className="markbar">
        <Tag tone={status === 'done' ? 'good' : 'warn'}>{status === 'done' ? '✓ Đã học' : '↷ Đã bỏ qua'}</Tag>
        <button className="chip" onClick={() => onMark(undefined)}>
          Bỏ đánh dấu
        </button>
        {status === 'skipped' && (
          <button className="chip" onClick={() => onMark('done')}>
            Chuyển thành đã học
          </button>
        )}
      </div>
    );
  }
  return (
    <div className="markbar">
      <Button kind="primary" onClick={() => onMark('done')}>
        ✓ Đã học
      </Button>
      <Button kind="ghost" onClick={() => onMark('skipped')}>
        ↷ Bỏ qua
      </Button>
    </div>
  );
}
