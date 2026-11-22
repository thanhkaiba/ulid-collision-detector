import { useState } from 'react';
import type { Key } from 'chessground/types';
import type { DrawShape } from 'chessground/draw';
import Board from './Board';
import { Button } from './ui';

/** "Tap square e4": teaches square names before any notation is used. */
export default function SquareQuiz({ targets, onDone }: { targets: string[]; onDone: () => void }) {
  const [i, setI] = useState(0);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [shapes, setShapes] = useState<DrawShape[]>([]);
  const [misses, setMisses] = useState(0);
  const finished = i >= targets.length;
  const target = targets[i];

  const onSelect = (key: Key) => {
    if (finished) return;
    if (key === target) {
      setShapes([{ orig: key, brush: 'green' }]);
      setMsg({ ok: true, text: `Đúng, đó là ô ${key}.` });
      const next = i + 1;
      setI(next);
      if (next >= targets.length) onDone();
    } else {
      setMisses(misses + 1);
      setShapes([{ orig: key, brush: 'red' }]);
      setMsg({ ok: false, text: `Đó là ô ${key}. Hãy tìm ô ${target}: cột ${target[0]}, hàng ${target[1]}.` });
    }
  };

  return (
    <div>
      <Board fen="8/8/8/8/8/8/8/8 w - - 0 1" onSelect={onSelect} shapes={shapes} animate={false} />
      <div className="mt">
        {finished ? (
          <div className="feedback ok">
            Xong {targets.length} ô{misses ? `, sai ${misses} lần` : ', không sai lần nào'}.{' '}
            <Button
              kind="ghost"
              onClick={() => {
                setI(0);
                setMsg(null);
                setShapes([]);
                setMisses(0);
              }}
            >
              Làm lại
            </Button>
          </div>
        ) : (
          <div className="feedback info">
            Chạm vào ô <b style={{ fontSize: '1.2em' }}>{target}</b> ({i + 1}/{targets.length})
          </div>
        )}
        {msg && !finished && <div className={`feedback ${msg.ok ? 'ok' : 'bad'}`}>{msg.text}</div>}
      </div>
    </div>
  );
}
