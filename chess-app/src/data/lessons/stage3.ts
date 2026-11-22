import type { Lesson } from './types';

export const STAGE3: Lesson[] = [
  {
    id: 'road-to-master',
    stage: 3,
    title: 'Từ 2000 lên kiện tướng: lộ trình thực tế',
    summary: 'Những gì app không làm được, và bạn phải làm.',
    minutes: 15,
    blocks: [
      {
        kind: 'text',
        md: `### Sự thật
Từ 2000 trở lên, tiến bộ đến từ **thi đấu thực tế có Elo FIDE**, **phân tích ván của chính mình ở mức sâu**, và thường là **huấn luyện viên**. Ứng dụng này là công cụ luyện tập, không thay được ba thứ đó.

### Lịch tuần mẫu (10-15 giờ)
- 2 buổi tính toán (bài tập khó 2000+, không giới hạn thời gian, viết ra biến trước khi kiểm tra).
- 1 buổi cờ tàn (Dvoretsky's Endgame Manual, học từng chương).
- 1 buổi khai cuộc (mở rộng kho, xem ván mới của kiện tướng trong hệ thống của bạn).
- 2-3 ván chậm (giải, hoặc online 30+0 trở lên) + phân tích sâu từng ván trước khi bật engine.
- 1 buổi xem ván kinh điển có bình luận.
- Thể lực: giải 9 vòng cần sức bền. Chạy bộ hoặc bơi 3 lần/tuần.

### Sách ở cấp này
- Dvoretsky: Endgame Manual; Analytical Manual.
- Aagaard: Grandmaster Preparation (Calculation, Positional Play, Strategic Play).
- Nunn: Understanding Chess Move by Move.
- Kasparov: My Great Predecessors (lịch sử và tư duy).

### Giải đấu
Tìm giải FIDE-rated ở Việt Nam qua Liên đoàn Cờ Việt Nam và các CLB tại Hà Nội, TP.HCM. Giải 7-9 vòng cổ điển là nơi rating thật được hình thành.`,
      },
      { kind: 'puzzles', themes: ['master', 'masterVsMaster', 'superGM'], rating: [2000, 2400], count: 8, intro: 'Bài tập từ ván kiện tướng: 8 bài.' },
    ],
    resources: [
      { label: 'Lichess: Broadcasts (xem giải trực tiếp có engine)', url: 'https://lichess.org/broadcast' },
      { label: 'Sách: Dvoretsky Endgame Manual', url: 'https://www.google.com/search?q=Dvoretsky+Endgame+Manual' },
    ],
  },

  {
    id: 'prophylaxis',
    stage: 3,
    title: 'Phòng ngừa (prophylaxis) và tư duy "đối phương muốn gì"',
    summary: 'Kỹ năng phân biệt 2000 và 2200.',
    minutes: 25,
    blocks: [
      {
        kind: 'text',
        md: `### Phòng ngừa
Trước mỗi nước, hỏi "**đối phương muốn gì?**" rồi ngăn chặn nó trước khi thực hiện kế hoạch của mình. Karpov và Petrosian xây cả sự nghiệp trên điều này. Nước phòng ngừa thường trông "chậm" (Kh1, a3, Rb1) nhưng tước đi mọi hy vọng của đối phương.

### Cải thiện quân tệ nhất
Khi không có gì cụ thể, tìm quân **kém nhất** của bạn và đưa nó đến ô tốt hơn. Đây là nguồn kế hoạch vô tận ở thế cờ cân bằng.

### Hạn chế (restriction)
Lấy đi ô của quân đối phương từng chút một. Mã không có ô là mã chết.

### Đổi quân có tính toán
Ở trình độ này, trao đổi là quyết định chiến lược: mỗi lần đổi, hỏi quân nào của hai bên sẽ **mạnh lên** sau khi đổi.

### Thế cờ bất định
Khi engine nói 0.00 nhưng thế cờ phức tạp, kiện tướng tạo **vấn đề thực tế**: nước đi khó trả lời đúng với thời gian giới hạn. Đó là cách thắng người, không phải thắng máy.`,
      },
      { kind: 'puzzles', themes: ['quietMove', 'defensiveMove'], rating: [2000, 2500], count: 8, intro: 'Nước lặng và phòng thủ ở trình cao: 8 bài.' },
      { kind: 'puzzles', themes: ['zugzwang', 'endgame'], rating: [2000, 2500], count: 6, intro: 'Cờ tàn kỹ thuật: 6 bài.' },
    ],
    resources: [
      { label: 'Sách: Grandmaster Preparation – Positional Play (Aagaard)', url: 'https://www.google.com/search?q=Aagaard+Positional+Play', note: 'Ba câu hỏi: điểm yếu ở đâu, quân tệ nhất, đối phương muốn gì.' },
    ],
  },
];
