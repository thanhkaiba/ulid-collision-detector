# Thêm bàn cờ minh họa cho các trang giới thiệu (src/data/lessons/stage*.ts)

Ứng dụng học cờ tiếng Việt. Bài học là dữ liệu (xem src/data/lessons/types.ts). Mỗi bài chia thành slide: mỗi mục `### Tiêu đề`
trong một khối `text` thành một slide; một khối `diagram` đặt NGAY SAU khối `text` sẽ hiện trên slide CUỐI của khối đó
(tối đa 2 hình). Người dùng phàn nàn: các slide giới thiệu khái niệm (ví dụ "Quy tắc hình vuông") chỉ có chữ, không có bàn cờ.

## Việc cần làm

Với mỗi bài được giao:
1. **Tách** mỗi khối `text` có nhiều mục `###` thành nhiều khối `text`, mỗi khối một mục (giữ nguyên chữ, có thể sửa cho khớp
   hình). Đoạn mở đầu không có tiêu đề có thể gộp vào mục đầu.
2. Sau mỗi mục nói về một **khái niệm trên bàn cờ** (luật, cách đi, chiến thuật, cấu trúc tốt, cờ tàn, kế hoạch...), thêm
   1 (đôi khi 2) khối `diagram` minh họa đúng điều mục đó nói:
   - `fen`: thế cờ hợp lệ, gọn, chỉ những quân cần thiết (thế cờ thật từ khai cuộc thì dùng thế thật sau các nước đã nêu).
   - `marks`: mũi tên "e2e4" và vòng tròn "e4", màu ":red" (đe dọa, nguy hiểm), ":blue" (đường đi, kế hoạch), ":yellow"
     (ô quan trọng), mặc định xanh lá. Ví dụ hình vuông của tốt: tô vàng 4 góc hoặc các ô cạnh; đối vua: vòng tròn ô giữa
     hai vua; nhập thành: mũi tên vua và xe.
   - `lastMove` (UCI) nếu muốn tô nước vừa đi. `orientation: 'black'` nếu nói từ phía Đen.
   - `caption`: 1-2 câu tiếng Việt, tự viết, nói người xem cần nhìn gì ("Mũi tên đỏ: ...").
3. **Không thêm hình** cho mục thuần lời khuyên không có thế cờ (lịch tập, sách, giải đấu, tâm lý, quản lý thời gian, quy
   trình phân tích, công cụ học). Đừng ép hình vô nghĩa.
4. Không đụng tới khối task/puzzles/lichess/example/practice/squares (giữ nguyên nội dung và thứ tự tương đối).
   Không đổi `id` bài.

## Độ chính xác là ưu tiên số một

Người dùng đã nhiều lần bắt được lỗi cờ cơ bản do mô hình tự soạn. Mỗi hình phải đúng tuyệt đối:
- Kiểm thế cờ bằng chess.js và in ra xem: `node -e "const {Chess}=require('chess.js');const c=new Chess('<fen>');console.log(c.ascii())"`.
  Thế cờ phải hợp lệ (không tốt ở hàng 1/8, bên không đi không bị chiếu, số quân hợp lý, quyền nhập thành khớp vị trí).
- Mọi khẳng định trong caption ("Trắng thắng", "hòa", "mã bị bẫy", "tốt phong cấp") kiểm bằng máy:
  `node scripts/eval_fen.cjs "<fen>" 20 3` (điểm theo phía Trắng) và `node scripts/eval_fen.cjs "<fen>" 20 3 -- <san...>`.
  Nếu máy không đồng ý thì sửa thế cờ hoặc câu chữ.
- Mũi tên phải là nước/đường đi đúng của quân đó trong thế cờ (đi được thật, không xuyên quân).
- Sau khi sửa mỗi bài: `node scripts/verify_lessons.cjs --only <lessonId> --depth 14` phải 0 lỗi.
- Chú ý chiều nhìn: chữ nói "Trắng" thì để orientation mặc định.

## Quy tắc sửa file

- Chỉ dùng công cụ **Edit** (thay chuỗi), đọc lại file ngay trước mỗi Edit vì người khác có thể đang sửa bài khác cùng file.
  KHÔNG Write cả file, KHÔNG script ghi đè. Chỉ sửa các bài được giao.
- Nội dung tự viết, không chép sách/trang web.
- Không chạy git. Cuối cùng chạy `npx tsc --noEmit -p tsconfig.app.json` (hoặc `npx tsc -b`) để chắc vẫn biên dịch.

## Báo cáo (tiếng Việt, ngắn)

Mỗi bài: số hình đã thêm, mục nào cố ý không thêm và vì sao, kết quả verify_lessons. Lỗi nội dung cũ phát hiện thêm (nếu có) và đã sửa gì.
