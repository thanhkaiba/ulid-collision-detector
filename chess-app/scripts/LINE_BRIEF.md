# Thêm trình phát nước đi (▶ Chạy) cho hình minh họa (src/data/lessons/stage*.ts)

Người dùng: "một loạt nước đi rất khó tưởng tượng, nên để hình bên dưới có nút play, ghi rõ lần lượt nước đi".
Khối `diagram` giờ có thêm (xem src/data/lessons/types.ts và src/components/LinePlayer.tsx):
- `intro?: string[]`: các nước (SAN) DẪN TỚI thế cờ trên hình, từ thế xuất phát (hoặc từ `introFen`). Đi hết phải ra đúng
  `fen` của hình (bộ kiểm tra so vị trí quân và bên đi).
- `line?: string[]`: các nước ĐI TIẾP từ thế cờ trên hình (kế hoạch, biến minh họa). Nước cố ý sai thì thêm "?" vào SAN
  (ví dụ 'Nxe5?'); các nước còn lại bộ kiểm tra bắt phải không tệ hơn nước tốt nhất của máy quá 1,5 tốt.
- `lineNotes?: string[]`: một câu ngắn cho từng nước của `line` ('' nếu không cần), hiện khi nước đó trên bàn.
Ví dụ mẫu đã làm: bài opening-white-italian, hình "Thế cờ sau 6...O-O" (có cả intro, line và lineNotes).

## Việc cần làm

Với mỗi hình trong bài được giao:
1. Chú thích hoặc đoạn chữ ngay trước hình có nêu một thứ tự nước đi dẫn tới thế cờ (ví dụ "Sau 1.e4 e5 2.Nf3 Nc6 3.Bc4"),
   thì thêm `intro` đúng các nước đó.
2. Chú thích hoặc đoạn chữ mô tả một kế hoạch hay chuỗi nước TỪ thế cờ đó (ví dụ "Trắng chơi Re1, Nbd2, Bb3...", cây cầu
   Lucena, cách giữ hòa Philidor, Vancura, tấn công thiểu số b4-b5, đối vua, biến tính toán "{Bxf7+ Kh8 Bxe8}"), thì thêm
   `line` là một chuỗi nước hợp lệ cho CẢ HAI bên thể hiện đúng ý đó, kèm `lineNotes` giải thích các nước chính.
   Nước của bên kia phải hợp lý (lấy từ máy: `node scripts/eval_fen.cjs "<fen>" 18 3 -- <các nước>`), không đi nước
   ngớ ngẩn chỉ để kế hoạch chạy được. Nếu đoạn chữ nhắc nhiều nhánh, chọn nhánh chính; nhánh phụ để nguyên trong chữ.
3. Không thêm khi hình chỉ minh họa một khoảnh khắc (cách đi một quân, một nước chiếu) mà không có chuỗi nước nào.
4. Có thể thêm vào cuối chú thích một câu "Bấm “▶ Chạy” để xem ..." nếu giúp người học.
5. Không đổi `fen`, `marks` hay nội dung các khối khác, trừ khi phát hiện lỗi (ghi vào báo cáo).

## Kiểm tra

- Sau mỗi bài: `node scripts/verify_lessons.cjs --only <lessonId> --depth 14` phải 0 lỗi (kiểm intro ra đúng hình, line hợp
  lệ và không có nước tệ).
- `lineNotes` phải đúng sự thật trên bàn cờ (đúng ô, đúng quân, đúng ý đồ); tự viết, tiếng Việt ngắn gọn.
- Chỉ sửa bằng Edit, đọc lại file trước mỗi Edit (người khác có thể sửa file khác). Không chạy git.
- Cuối cùng `npx tsc --noEmit -p tsconfig.app.json` sạch.

## Báo cáo (tiếng Việt, ngắn)

Mỗi bài: hình nào thêm intro/line (bao nhiêu nước), hình nào cố ý bỏ qua và vì sao, kết quả verify. Lỗi nội dung phát hiện thêm.
