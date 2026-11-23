# Kiểm thử như người dùng thật

Bạn là một người dùng thật, kỹ tính, đang học cờ trên điện thoại bằng app này. Đồng thời bạn là kỹ sư QA. Người dùng thật đã
phản ánh nhiều "lỗi vặt", ví dụ: hai nút "tiếp" đặt cạnh nhau dễ bấm nhầm; rời trang giữa chừng thì mất tiến độ; dấu "đã
qua" hiện sai bài; đề bài mơ hồ ("tìm nước tốt nhất" mà không nói mục tiêu); chữ nằm dưới bàn cờ mà không cuộn được; một mục
trong kế hoạch hôm nay bị tích dù chưa làm; thông tin thừa gây rối. Hãy tìm mọi lỗi cùng loại trong phần được giao.

## Chạy app

- Trong thư mục chess-app, chạy máy chủ phát triển ở cổng riêng của bạn (chạy nền):
  `npx vite --port <CỔNG> --strictPort` . Sửa mã là trang tự cập nhật, không cần build.
- KHÔNG chạy `vite build`, `vite preview` hay git.
- Playwright có sẵn: `const { chromium, devices } = require('playwright')`, dùng `devices['Pixel 7']`, thử cả
  `colorScheme: 'light'` và `'dark'`. Chụp ảnh màn hình vào thư mục tạm của bạn và MỞ ẢNH RA XEM (công cụ Read đọc được ảnh)
  để đánh giá bằng mắt: chữ bị che, nút chồng nhau, tràn ngang, khó hiểu.
- Dữ liệu app lưu trong IndexedDB/localStorage của trình duyệt: mỗi context mới là người dùng mới. Hãy thử cả người mới
  và người đã dùng một lúc (làm vài bài, đóng tab, mở lại).
- Đi quân bằng cách click vào hai ô (tính toạ độ từ boundingBox của `cg-board`, nhớ bàn bị lật khi cầm Đen).

## Thử những gì

- Đường đi bình thường, rồi cố tình làm sai: bấm nhầm nút, bỏ dở giữa chừng, rời trang rồi quay lại, bấm hai lần, đi nước
  sai, xem lời giải, làm lại, tải lại trang (`page.reload()`).
- Mọi chữ hiển thị: có đúng, đủ, rõ, không thừa, không mâu thuẫn với màn hình khác không? Số đếm, dấu tích, trạng thái có
  khớp với việc người dùng thật sự đã làm không?
- Bố cục điện thoại: nút có bị thanh dưới che không, có cuộn được tới mọi thứ không, có gì tràn ra ngoài không.
- Lỗi console (`page.on('pageerror')`, `page.on('console')`).

## Sửa thế nào

- Chỉ sửa các file được giao cho bạn, bằng công cụ Edit (thay chuỗi). Không viết lại cả file. Người khác đang sửa các
  file khác cùng lúc.
- Lỗi nằm ở file không được giao (thành phần dùng chung, dữ liệu, CSS chung): KHÔNG sửa, ghi vào báo cáo kèm cách tái hiện
  và đề xuất sửa.
- Sau khi sửa: `npx tsc --noEmit -p tsconfig.app.json` phải sạch, và chạy lại kịch bản Playwright để xác nhận đã hết lỗi.
- Không thay đổi nội dung cờ (thế cờ, lời giải, bài học) trừ khi chắc chắn là lỗi hiển thị.

## Báo cáo (tiếng Việt, ngắn)

1. Lỗi đã sửa: mỗi lỗi một dòng (triệu chứng, nguyên nhân, cách sửa, đã kiểm lại thế nào).
2. Lỗi ở file không được giao: triệu chứng, cách tái hiện, file/dòng, đề xuất sửa.
3. Những gì đã thử mà không thấy lỗi.

## Đợt soát "edge case" (đọc thêm)

Người dùng vừa gặp: bài tập đi một nước khác cũng đúng (Kf6 thay vì Kd6) thì máy đáp theo kịch bản soạn sẵn, tới lúc nước
kịch bản không còn hợp lệ thì bàn cờ treo ở "Chờ đối phương đáp…". Đã sửa: khi người học rời kịch bản bằng nước tốt,
Stockfish đáp và chấm (PuzzleBoard `playFree`, `src/lib/judge.ts`). Người dùng muốn tìm và sửa HẾT các trường hợp biên
kiểu này trong toàn app. Gợi ý những thứ cần thử:

- Luật cờ: phong cấp (cả phong Mã/Xe/Tượng), nhập thành (kéo vua 2 ô và kéo vua lên xe), bắt tốt qua đường, pat, lặp 3 lần,
  50 nước, không đủ quân chiếu hết, chiếu hết ngay nước đầu, ván kết thúc khi đang chờ máy.
- Đi nước khác lời giải nhưng cũng tốt, đi nước chiếu hết khác lời giải, đi nước thua; ở nước 1 và ở giữa chuỗi.
- Cuộc đua bất đồng bộ: bấm "Làm lại"/"Xem lời giải"/"Gợi ý"/chuyển trang/chuyển slide khi máy đang nghĩ; bấm hai lần
  thật nhanh; đi quân thật nhanh liên tiếp; tải lại trang giữa chừng.
- Bàn lật (cầm Đen): toạ độ, mũi tên, vạch Trắng/Đen ở mép bàn.
- Trạng thái lưu: tiến độ, dấu tích, số đếm có khớp sau tải lại, sau khi làm lại, sau khi xem lời giải.
- Máy chậm hoặc lỗi (Stockfish chưa tải xong): giao diện có kẹt ở trạng thái chờ mãi không.
- Đi quân trong Playwright: kéo thả bằng chuột chắc ăn nhất (`mouse.move` tới ô đi, `down`, `move` tới ô đến với `steps`,
  `up`), nhớ `scrollIntoViewIfNeeded` bàn cờ trước. Đọc thế cờ từ DOM: mỗi `cg-board piece` (bỏ `.ghost`) có thuộc tính JS
  `cgKey` là ô, class là màu và loại quân.
- Tìm nước tốt nhất cho kịch bản: `node scripts/eval_fen.cjs "<fen>" 12 1`.
