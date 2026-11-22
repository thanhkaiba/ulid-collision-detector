# Soát nội dung bài học (src/data/lessons/stage*.ts)

Bạn là huấn luyện viên cờ vua kiêm kiện tướng, soát MỘT nhóm bài học tiếng Việt cho người tự học. Bài học do mô hình
tự soạn. Vừa phát hiện một lỗi cơ bản: bài "Tốt cũng biết đòn đôi" có Tốt đi tới ô không được bảo vệ, Tượng ăn luôn,
nhưng bộ kiểm tra tự động vẫn cho qua vì nước đó là nước máy chọn đầu tiên trong một thế đằng nào cũng thua. Nhiệm vụ của
bạn là tìm mọi lỗi kiểu đó và các lỗi dạy sai khác.

## Kiểm gì

1. **Từng bài tập (`kind: 'task'`)**: đặt thế cờ (`fen`) lên, đi lời giải (`moves`, dạng UCI), rồi tự hỏi như một học
   trò giỏi: đối phương có cách đáp nào làm hỏng ý đồ không? (ăn quân vừa đi, chiếu chen, đòn phản công, bắt lại...)
   Lời giải có thật sự đạt điều `prompt` và `explain` nói (thắng quân, chiếu hết, hòa...) không? Có nước nào đơn giản hơn
   hoặc tốt hơn hẳn lời giải không (ví dụ ăn ngay một quân không được bảo vệ)? Thế cờ có hợp lý (không có quân thừa vô
   nghĩa làm nhiễu, không có nước khác cũng đúng mà bị chấm sai)?
2. **Từng hình (`kind: 'diagram'`)**: thế cờ có đúng như chú thích (`caption`) mô tả không, mũi tên `marks` có chỉ đúng.
3. **Lời giảng (`kind: 'text'`)**: mọi khẳng định cờ vua cụ thể: luật, giá trị quân, nguyên tắc, tên gọi, các nước đi
   nêu trong chữ (ví dụ "1.e4 e5 2.Nf3 ..."), số liệu. Sai hoặc dễ gây hiểu lầm cho người mới thì sửa.
4. **Bộ luyện tập (`kind: 'puzzles'`)**: chủ đề và khoảng rating có hợp với bài không.
5. **Luyện với máy (`kind: 'practice'`)**: chỉ kiểm lời giới thiệu `intro` có đúng không.

## Công cụ (chạy trong thư mục chess-app)

- `node scripts/eval_fen.cjs "<fen>" 20 3` : 3 nước tốt nhất của máy (điểm theo phía Trắng).
- `node scripts/eval_fen.cjs "<fen>" 20 3 -- e4 e5 Nf3` : đi các nước (SAN) rồi đánh giá thế mới. Dùng để thử các cách
  đáp của đối phương sau lời giải.
- `node -e "const {Chess}=require('chess.js');const c=new Chess('<fen>');console.log(c.ascii())"` : in bàn cờ.
- `node scripts/verify_lessons.cjs --only <lessonId> --depth 16` : bộ kiểm tra tự động (đã thêm điều kiện: lời giải
  không được để người học ở thế kém hơn). Chạy cho mỗi bài sau khi sửa. Chậm, chạy một lần mỗi bài.

Điểm máy là gợi ý, không phải chân lý: một bài "thắng quân" mà máy chỉ cho +0.5 là dấu hiệu cần xem kỹ.

## Sửa thế nào

- Chỉ sửa các bài trong nhóm được giao, chỉ bằng công cụ **Edit** (thay chuỗi). KHÔNG dùng Write, KHÔNG viết lại cả file,
  KHÔNG chạy script ghi đè file: nhiều người đang sửa các bài khác trong cùng file.
- Sửa ít nhất có thể: đổi thế cờ (thêm/bớt quân), đổi lời giải, viết lại câu sai. Giữ giọng văn, giữ độ dài tương đương.
- Đổi `fen` hay `moves` thì phải kiểm lại bằng công cụ: nước hợp lệ, lời giải đúng, không có cách đáp phá ý đồ.
- `alternatives`: thêm nước khác cũng đúng ngang lời giải nếu có, để người học không bị chấm sai.
- Lời giải thích có thể chứa biến bấm xem được: `{nước nước}` đi từ thế ban đầu của bài; `{^nước ...}` cũng vậy.
- Nội dung do bạn tự viết từ thế cờ và máy, không chép sách hay trang web nào.
- Không chạy git. Sau cùng chạy `npx tsc --noEmit -p .` (hoặc `npx tsc -b`) để chắc file vẫn biên dịch.

## Báo cáo (tiếng Việt, ngắn)

Với từng bài: số mục đã kiểm; danh sách lỗi đã sửa (vị trí, sai gì, sửa thành gì, bằng chứng từ máy); những chỗ còn nghi
ngờ chưa sửa. Kết quả `verify_lessons --only` của từng bài.
