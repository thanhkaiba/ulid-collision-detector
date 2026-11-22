import { useEffect, useState } from 'react';
import { Button, Card, Seg, Spinner } from '../components/ui';
import { loadSettings, saveSettings, type Settings as S } from '../lib/storage';
import type { Route } from '../lib/router';
import { clear } from 'idb-keyval';

export default function Settings(_: { route: Route }) {
  const [s, setS] = useState<S | null>(null);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    loadSettings().then(setS);
  }, []);
  if (!s) return <Spinner />;
  const update = async (next: S) => {
    setS(next);
    await saveSettings(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
  };
  return (
    <div>
      <h1>Cài đặt</h1>
      <Card>
        <label className="field">
          <span>Tên người dùng Lichess</span>
          <input value={s.lichessUser} onChange={(e) => update({ ...s, lichessUser: e.target.value })} autoCapitalize="off" />
        </label>
        <label className="field">
          <span>Tên người dùng Chess.com</span>
          <input value={s.chesscomUser} onChange={(e) => update({ ...s, chesscomUser: e.target.value })} autoCapitalize="off" />
        </label>
      </Card>
      <Card>
        <h3>Độ sâu phân tích ván</h3>
        <Seg
          value={s.analysisDepth}
          onChange={(v) => update({ ...s, analysisDepth: v })}
          options={[
            { value: 10, label: '10 · nhanh' },
            { value: 14, label: '14 · cân bằng' },
            { value: 18, label: '18 · kỹ' },
          ]}
        />
        <p className="small muted mt">Độ sâu 14 đủ để bắt mọi sai lầm lớn, khoảng 1 giây mỗi nước trên điện thoại.</p>
      </Card>
      <Card>
        <h3>Về ứng dụng</h3>
        <p className="small muted">
          Bài tập: cơ sở dữ liệu Lichess (CC0). Engine: Stockfish 17.1 WASM (GPL). Bàn cờ: chessground (Lichess, GPL). Mọi dữ liệu được lưu trong máy bạn, không có máy chủ.
        </p>
        <Button
          kind="danger"
          onClick={async () => {
            if (confirm('Xóa toàn bộ tiến độ, ván đã nhập và phân tích?')) {
              await clear();
              location.reload();
            }
          }}
        >
          Xóa toàn bộ dữ liệu
        </Button>
      </Card>
      {saved && <div className="feedback ok">Đã lưu</div>}
    </div>
  );
}
