# Giảng lại phần khai cuộc cho kỹ (src/data/lessons)

Người dùng: "một số đoạn dạy về khai cuộc chưa giải thích kỹ". Đối tượng: người mới đến trung bình (600-1500), học trên điện thoại.
Hiện nay các mục khai cuộc chủ yếu liệt kê nước ("Sau 3...Bc5 4.c3 Nf6 5.d3 d6 6.O-O O-O: Trắng chơi Re1, Nbd2...") mà không nói VÌ SAO.

## Việc cần làm cho mỗi mục khai cuộc được giao
1. Mỗi nước chính phải có lý do bằng lời đơn giản: nó chiếm/kiểm soát ô nào, phát triển quân nào, dọa gì, chuẩn bị gì, ngăn gì.
   Ví dụ cách nói: "3.Bc4: tượng ra đường chéo nhắm vào f7, ô yếu nhất của Đen vì chỉ có vua bảo vệ."
2. Nêu ý đồ (kế hoạch) của CẢ HAI bên sau khai cuộc, cấu trúc tốt thường gặp, và 1-2 sai lầm điển hình của người mới kèm cách trừng phạt.
3. Dùng trình phát nước đi dưới hình (xem scripts/LINE_BRIEF.md, src/components/LinePlayer.tsx): mỗi hình khai cuộc có `intro` từ 1.e4/1.d4
   và `lineNotes`/`line` giải thích TỪNG nước quan trọng. Ghi chú từng nước ngắn (1-2 câu), không lặp lại tên nước.
   Có thể tách một mục dài thành 2-3 mục (`### ...`) mỗi mục một hình, để mỗi trang chỉ một ý.
4. Từ ngữ: lần đầu dùng thuật ngữ thì giải thích (ví dụ "nhập thành", "trung tâm", "phát triển", "ghim", "gambit", "nhịp").
   Tên khai cuộc tiếng Việt kèm tên quốc tế trong ngoặc lần đầu.
5. Giữ nguyên các bài tập (task/lichess/puzzles/practice) và thứ tự tương đối của chúng; chỉ sửa khối text và diagram.
   Không đổi `id` bài. Nội dung tự viết, không chép sách/trang web.

## Độ chính xác (bắt buộc)
- Mọi khẳng định ("nước này đe dọa…", "nếu Đen tham… thì mất quân", "thế cân bằng") kiểm bằng máy:
  `node scripts/eval_fen.cjs "<fen>" 18 3 -- <các nước SAN>` (điểm theo phía Trắng). Thuyết khai cuộc chuẩn nhưng vẫn phải khớp máy.
- Không gọi một nước là sai ("?") hay rất hay ("!") nếu máy không đồng ý rõ ràng; ghi đúng mức độ (ví dụ "kém khoảng nửa tốt").
- Sau mỗi bài: `node scripts/verify_lessons.cjs --only <lessonId> --depth 14` phải 0 lỗi. `npx tsc --noEmit -p tsconfig.app.json` sạch.
- Chỉ sửa bằng Edit, đọc lại file ngay trước mỗi Edit (người khác có thể sửa bài khác cùng file). Không chạy git.

## Báo cáo (tiếng Việt, ngắn)
Mỗi bài: mục nào viết lại/thêm, bao nhiêu hình và trình phát, các khẳng định đã kiểm bằng máy, lỗi cũ phát hiện và đã sửa.
