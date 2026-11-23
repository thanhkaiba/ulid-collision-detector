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
Từ 2000 trở lên, tiến bộ đến từ **thi đấu thực tế có Elo FIDE**, **phân tích ván của chính mình ở mức sâu**, và thường là **huấn luyện viên**. Ứng dụng này là công cụ luyện tập, không thay được ba thứ đó.`,
      },
      {
        kind: 'text',
        md: `### Lịch tuần mẫu (10-15 giờ)
- 2 buổi tính toán (bài tập khó 2000+, không giới hạn thời gian, viết ra biến trước khi kiểm tra).
- 1 buổi cờ tàn (Dvoretsky's Endgame Manual, học từng chương).
- 1 buổi khai cuộc (mở rộng kho, xem ván mới của kiện tướng trong hệ thống của bạn).
- 2-3 ván chậm (giải, hoặc online 30+0 trở lên) + phân tích sâu từng ván trước khi bật engine.
- 1 buổi xem ván kinh điển có bình luận.
- Thể lực: giải 9 vòng cần sức bền. Chạy bộ hoặc bơi 3 lần/tuần.`,
      },
      {
        kind: 'text',
        md: `### Sách ở cấp này
- Dvoretsky: Endgame Manual; Analytical Manual.
- Aagaard: Grandmaster Preparation (Calculation, Positional Play, Strategic Play).
- Nunn: Understanding Chess Move by Move.
- Kasparov: My Great Predecessors (lịch sử và tư duy).`,
      },
      {
        kind: 'text',
        md: `### Giải đấu
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
Trước mỗi nước, hỏi "**đối phương muốn gì?**" rồi ngăn chặn nó trước khi thực hiện kế hoạch của mình. Karpov và Petrosian xây cả sự nghiệp trên điều này. Nước phòng ngừa thường trông "chậm" (Kh1, a3, Rb1) nhưng tước đi mọi hy vọng của đối phương.`,
      },
      {
        kind: 'diagram',
        fen: 'r1bq1rk1/2p1bppp/p1np1n2/1p2p3/4P3/1BP2N2/PP1P1PPP/RNBQR1K1 w - - 1 9',
        marks: ['h2h3:blue', 'c8g4:red', 'g4:yellow'],
        caption: 'Tây Ban Nha đóng: 1.e4 e5 2.Nf3 Nc6 3.Bb5 a6 4.Ba4 Nf6 5.O-O Be7 6.Re1 b5 7.Bb3 d6 8.c3 O-O. Trắng muốn đẩy d4, còn Đen muốn gì? Nếu đi ngay {d4 Bg4}, tượng ghim mã f3, quân đang giữ d4 và e5 (mũi tên đỏ). Nước phòng ngừa {h3} (mũi tên xanh dương) lấy ô g4 (vòng vàng) trước, rồi mới d4; máy cũng xếp h3 đầu tiên.',
      },
      {
        kind: 'text',
        md: `### Cải thiện quân tệ nhất
Khi không có gì cụ thể, tìm quân **kém nhất** của bạn và đưa nó đến ô tốt hơn. Đây là nguồn kế hoạch vô tận ở thế cờ cân bằng.`,
      },
      {
        kind: 'diagram',
        fen: 'r1b2rk1/2q1bppp/p2p1n2/npp1p3/3PP3/2P2N1P/PPB2PP1/RNBQR1K1 w - - 1 12',
        marks: ['b1d2:blue', 'd2f1:blue', 'f1g3:blue', 'f5:yellow'],
        caption: 'Cùng khai cuộc, tiếp theo 9.h3 Na5 10.Bc2 c5 11.d4 Qc7 (biến Chigorin). Quân kém nhất của Trắng là mã b1: chưa ra trận và cùng tượng c1 chắn đường xe a1. Kế hoạch kinh điển là đưa nó qua d2, f1 tới g3 (mũi tên xanh dương), từ đó nhắm ô f5 (vòng vàng) và cánh vua; máy xếp {Nbd2} trong nhóm nước tốt nhất.',
      },
      {
        kind: 'text',
        md: `### Hạn chế (restriction)
Lấy đi ô của quân đối phương từng chút một. Mã không có ô là mã chết.`,
      },
      {
        kind: 'diagram',
        fen: '1n6/p5k1/4p1p1/1P1pN2p/P2P3P/6P1/5K2/8 b - - 0 1',
        marks: ['b8:red', 'a6:yellow', 'c6:yellow', 'd7:yellow'],
        caption: 'Đen đi. Mã b8 (vòng đỏ) không có ô an toàn: a6 và c6 bị tốt b5 khống chế, d7 bị mã e5 khống chế (vòng vàng). Mã e5 được tốt d4 bảo vệ và không tốt đen nào đuổi được. Vật chất bằng nhau nhưng Đen gần như chơi thiếu một quân: máy đánh giá Trắng thắng.',
      },
      {
        kind: 'text',
        md: `### Đổi quân có tính toán
Ở trình độ này, trao đổi là quyết định chiến lược: mỗi lần đổi, hỏi quân nào của hai bên sẽ **mạnh lên** sau khi đổi.`,
      },
      {
        kind: 'text',
        md: `### Thế cờ bất định
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
