import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { getEngineStatus, subscribeEngineStatus } from '../lib/engine';
import { Button, Card, Seg, Spinner } from '../components/ui';
import { clearAll, loadSettings, saveSettings, type Settings as S } from '../lib/storage';
import type { Route } from '../lib/router';
import { LEVELS_INFO, chooseLevel, levelInfo } from '../lib/level';
import { BOARD_THEMES, applyBoardTheme, currentBoardTheme, type BoardThemeId } from '../lib/boardTheme';

export default function Settings(_: { route: Route }) {
  const [s, setS] = useState<S | null>(null);
  const engine = useSyncExternalStore(subscribeEngineStatus, getEngineStatus);
  const [saved, setSaved] = useState(false);
  const [board, setBoard] = useState<BoardThemeId>(currentBoardTheme);
  const savedTimer = useRef(0);
  useEffect(() => {
    loadSettings().then(setS);
    return () => window.clearTimeout(savedTimer.current);
  }, []);
  if (!s) return <Spinner />;
  const flashSaved = () => {
    setSaved(true);
    window.clearTimeout(savedTimer.current);
    savedTimer.current = window.setTimeout(() => setSaved(false), 1400);
  };
  const update = async (next: S) => {
    setS(next);
    await saveSettings(next);
    flashSaved();
  };
  const level = levelInfo(s.level);
  return (
    <div>
      <h1>Cài đặt</h1>
      <Card>
        <label className="field">
          <span>Tên người dùng Lichess</span>
          <input
            value={s.lichessUser}
            onChange={(e) => update({ ...s, lichessUser: e.target.value })}
            onBlur={() => s.lichessUser !== s.lichessUser.trim() && update({ ...s, lichessUser: s.lichessUser.trim() })}
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
          />
        </label>
        <label className="field">
          <span>Tên người dùng Chess.com</span>
          <input
            value={s.chesscomUser}
            onChange={(e) => update({ ...s, chesscomUser: e.target.value })}
            onBlur={() => s.chesscomUser !== s.chesscomUser.trim() && update({ ...s, chesscomUser: s.chesscomUser.trim() })}
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
          />
        </label>
        <p className="small muted" style={{ margin: 0 }}>
          Dùng để tải ván của bạn ở tab Phân tích. Không cần mật khẩu.
        </p>
      </Card>
      <Card>
        <h3>Trình độ của bạn</h3>
        <select
          value={s.level ?? ''}
          onChange={async (e) => {
            if (e.target.value) {
              setS(await chooseLevel(e.target.value as (typeof LEVELS_INFO)[number]['id']));
              flashSaved();
            }
          }}
        >
          {!level && <option value="">Chưa chọn</option>}
          {LEVELS_INFO.map((l) => (
            <option key={l.id} value={l.id}>
              {l.label}
            </option>
          ))}
        </select>
        {level && <p className="small mt" style={{ marginBottom: 0 }}>{level.desc}</p>}
        <p className="small muted mt">Quyết định bài bắt đầu, mục tiêu mỗi ngày và cấp độ máy mặc định. Rating bài tập chỉ được đặt lại khi bạn giải chưa tới 10 bài.</p>
      </Card>
      <Card>
        <h3>Màu bàn cờ</h3>
        <div className="theme-grid">
          {BOARD_THEMES.map((t) => (
            <button
              key={t.id}
              className={`theme-swatch ${board === t.id ? 'active' : ''}`}
              onClick={() => {
                applyBoardTheme(t.id);
                setBoard(t.id);
                flashSaved();
              }}
            >
              <span className="swatch" style={{ ['--l' as string]: t.light, ['--d' as string]: t.dark }} />
              <span>{t.label}</span>
            </button>
          ))}
        </div>
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
          Bài tập: cơ sở dữ liệu Lichess (CC0). Bàn cờ: chessground (Lichess, GPL). Mọi dữ liệu được lưu trong máy bạn, không có máy chủ.
        </p>
        <p className="small muted">
          Engine:{' '}
          {engine.kind === 'native'
            ? `Stockfish 17.1 bản đầy đủ, chạy trực tiếp trên máy (${engine.threads} luồng).`
            : engine.kind === 'wasm'
              ? 'Stockfish 17.1 bản nhẹ (WebAssembly, 1 luồng).'
              : 'Stockfish 17.1.'}{' '}
          Stockfish là phần mềm tự do theo giấy phép GNU GPL v3 (<a href="stockfish/COPYING-stockfish.txt" target="_blank" rel="noreferrer">giấy phép</a>, <a href="https://github.com/official-stockfish/Stockfish" target="_blank" rel="noreferrer">mã nguồn</a>).
        </p>
        <Button
          kind="danger"
          onClick={async () => {
            if (confirm('Xóa toàn bộ tiến độ, ván đã nhập, phân tích và cài đặt (tên người dùng, trình độ, màu bàn cờ)? Không thể hoàn tác.')) {
              await clearAll();
              // progress also lives in localStorage (game positions, lesson slides, practice marks, play setup...)
              try {
                localStorage.clear();
                sessionStorage.clear();
              } catch {
                /* ignore */
              }
              location.hash = '#/learn';
              location.reload();
            }
          }}
        >
          Xóa toàn bộ dữ liệu
        </Button>
      </Card>
      {saved && (
        <div
          className="feedback ok"
          role="status"
          style={{ position: 'fixed', left: 16, right: 16, bottom: 'calc(var(--tabbar-h) + 12px + env(safe-area-inset-bottom))', maxWidth: 400, margin: '0 auto', zIndex: 30, textAlign: 'center', boxShadow: 'var(--shadow)', background: 'color-mix(in srgb, var(--good) 15%, var(--bg-2))' }}
        >
          ✓ Đã lưu
        </div>
      )}
    </div>
  );
}
