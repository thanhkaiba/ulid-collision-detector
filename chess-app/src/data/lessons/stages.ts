import type { Stage } from './types';

export const STAGES: Stage[] = [
  {
    n: 0,
    title: 'Nền tảng',
    elo: '0 – 1000',
    goal: 'Biết luật, không bỏ quân miễn phí, thấy đòn 1 nước, chiếu hết được bằng hậu và xe.',
    routine: 'Mỗi ngày 30 phút: 15 phút bài tập chiếu hết 1 nước và quân treo, 1 ván chậm 15+10 với máy cấp 2 đến 4.',
  },
  {
    n: 1,
    title: 'Câu lạc bộ',
    elo: '1000 – 1500',
    goal: 'Có hệ thống khai cuộc đơn giản, thành thạo các mẫu chiến thuật, biết cờ tàn xe và tốt cơ bản.',
    routine: 'Mỗi ngày 45 phút: 20 bài tập theo chủ đề, 1 ván 15+10 và phân tích kỹ ván đó, đọc 10 phút sách.',
  },
  {
    n: 2,
    title: 'Nâng cao',
    elo: '1500 – 2000',
    goal: 'Hiểu cấu trúc tốt, lập kế hoạch, tính toán biến dài, phòng thủ chủ động.',
    routine: 'Mỗi ngày 60 phút: bài tập dài và khó, ván chậm 30+0, phân tích sâu không dùng máy trước, đọc sách chiến lược.',
  },
  {
    n: 3,
    title: 'Hướng tới chuyên nghiệp',
    elo: '2000+',
    goal: 'Thi đấu giải FIDE, có huấn luyện viên, xây kho khai cuộc riêng, phân tích ván của chính mình ở mức kiện tướng.',
    routine: 'Lịch tập có hệ thống theo tuần: tính toán, cờ tàn, khai cuộc, phân tích ván đấu, thể lực.',
  },
];
