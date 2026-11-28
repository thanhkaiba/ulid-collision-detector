import { useState } from 'react';
import { Card, Icon, Seg, Tag } from '../components/ui';
import { VIDEOS } from '../data/videos';
import { STAGES } from '../data/lessons';
import { navigate } from '../lib/router';

export default function Videos() {
  const [lang, setLang] = useState<'all' | 'vi' | 'en'>('all');
  const list = VIDEOS.filter((v) => lang === 'all' || v.lang === lang);
  return (
    <div>
      <div className="topbar">
        <button className="back" onClick={() => navigate('learn')} aria-label="Quay lại">
          ‹
        </button>
        <h2 style={{ margin: 0 }}>Thư viện video</h2>
      </div>
      <Card>
        <p className="small" style={{ margin: 0 }}>
          <b>Video tiếng Anh có thể xem bằng phụ đề tiếng Việt:</b> trong YouTube bấm ⚙ Cài đặt → Phụ đề → Dịch tự động → Tiếng Việt. Thuật ngữ cờ dịch máy đôi khi lạ
          (ví dụ "rook" thành "quạ"), nhưng vì có bàn cờ minh họa nên vẫn theo được. Mọi link đã được kiểm tra còn hoạt động.
        </p>
      </Card>
      <Seg
        value={lang}
        onChange={setLang}
        options={[
          { value: 'all', label: 'Tất cả' },
          { value: 'vi', label: 'Tiếng Việt' },
          { value: 'en', label: 'Tiếng Anh (phụ đề)' },
        ]}
      />
      {STAGES.map((s) => {
        const vs = list.filter((v) => v.stage === s.n);
        if (!vs.length) return null;
        return (
          <div key={s.n}>
            <h2 className="mt">
              Giai đoạn {s.n + 1}: {s.title} <span className="muted small">Elo {s.elo}</span>
            </h2>
            {vs.map((v) => (
              // the whole card opens the video: a small title link is hard to hit on a phone
              <a key={v.url} className="card card-click" href={v.url} target="_blank" rel="noreferrer" style={{ display: 'block', color: 'inherit', textDecoration: 'none' }}>
                <div className="row-between">
                  <b style={{ color: 'var(--accent)' }}>
                    {v.title} <Icon name="external" className="ext" />
                    <span className="sr-only"> (mở trang mới)</span>
                  </b>
                  <Tag tone={v.lang === 'vi' ? 'good' : 'info'}>{v.lang === 'vi' ? 'VI' : 'EN'}</Tag>
                </div>
                <div className="small muted">
                  {v.by} · {v.kind === 'playlist' ? 'playlist' : v.kind === 'channel' ? 'kênh' : 'video'}
                </div>
                <p className="small" style={{ margin: '8px 0 0' }}>
                  {v.note}
                </p>
              </a>
            ))}
          </div>
        );
      })}
    </div>
  );
}
