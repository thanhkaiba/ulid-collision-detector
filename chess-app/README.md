# Chess Trainer

Ứng dụng web cài được lên điện thoại (PWA) để học cờ vua từ người mới đến nâng cao. Mọi dữ liệu nằm trong máy bạn, không có máy chủ.

## Tính năng

- **Học**: lần đầu mở app chọn trình độ (5 mức), app đặt bài bắt đầu, độ khó bài tập và cấp độ máy. Lộ trình 4 giai đoạn (0–1000, 1000–1500, 1500–2000, 2000+), 33 bài học tiếng Việt, bắt đầu từ bàn cờ và tên ô cho người chưa biết gì. Thẻ "Hôm nay" với ba việc mỗi ngày và chuỗi ngày học. Mỗi bài có phần đọc, vị trí tương tác phải đi đúng nước, bài tập từ ván thật và link tới sách/trang gốc.
- **Từng nước một**: 12 ván kinh điển (Morphy 1858 đến Karpov–Kasparov 1985), mọi nước đi của cả hai bên đều có lời bình tiếng Việt do ứng dụng tự biên soạn (khoảng 35.000 từ, 550 biến phụ), đối chiếu với Stockfish. Bấm vào nước đi, biến phụ hoặc tên ô để xem trên bàn cờ; có chế độ "Tự đoán nước".
- **Sách**: bản dịch tiếng Việt trọn vẹn "Chess Fundamentals" của Capablanca (1921, public domain): 6 chương lý thuyết + 14 ván đấu có bình luận, 150 hình chép lại từ bản in, hơn 3.300 nước đi chuyển từ ký hiệu mô tả cũ sang ký hiệu đại số và kiểm chứng bằng chess.js; bấm vào nước đi trong văn bản để xem thế cờ.
- **Thư viện video**: kênh YouTube tiếng Việt và các series tiếng Anh kinh điển (Bartholomew, ChessNetwork, Naroditsky), mọi link đã kiểm tra, kèm hướng dẫn bật phụ đề dịch tự động.
- **Tập**: 6.500 bài tập chiến thuật lấy từ cơ sở dữ liệu Lichess (CC0), chia theo rating 400–2800 và 50+ chủ đề. Rating cá nhân tự điều chỉnh. Puzzle hàng ngày từ Lichess. Mục "Lỗi của chính bạn" ôn lại các nước sai trong ván của bạn theo lịch lặp lại giãn cách.
- **Chơi**: đấu với Stockfish 17 (chạy trong trình duyệt) ở 10 cấp độ từ ~400 đến 3000+ Elo, có đồng hồ (3+2 đến 30+0). Ván chơi xong được lưu để phân tích.
- **Phân tích**: nhập 30 ván gần nhất từ Lichess hoặc Chess.com theo tên người dùng (hoặc dán PGN). Stockfish chạy qua từng nước, phân loại sai lầm như Lichess (độ chính xác, ??, ?, ?!), đồ thị đánh giá, thử biến trên bàn, và tự động gom lỗi của bạn vào mục ôn tập.

## Chạy thử

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # ra thư mục dist/
npm run preview
```

## Cài lên điện thoại

1. Đưa thư mục `dist/` lên bất kỳ hosting tĩnh nào (GitHub Pages, Netlify, Vercel, Cloudflare Pages). Vì `base` là `./`, app chạy được ở mọi đường dẫn.
2. Mở bằng Safari (iOS) hoặc Chrome (Android), chọn **Thêm vào màn hình chính**. App chạy offline sau lần mở đầu (engine, bài tập, bài học đều được cache).

## Kiểm chứng nội dung bài học

Mọi vị trí trong bài học được kiểm tra bằng chess.js (tính hợp lệ) và Stockfish (nước giải phải là nước tốt nhất hoặc chiếu hết đúng số nước):

```bash
node scripts/verify_lessons.cjs --depth 20
```

## Tạo lại bộ bài tập

```bash
curl -O https://database.lichess.org/lichess_db_puzzle.csv.zst
pip install zstandard
python3 -I scripts/build_puzzles.py lichess_db_puzzle.csv.zst src/data/puzzles.json
```

## Loạt "Từng nước một"

- `scripts/games/pgn/`: biên bản 12 ván (đã kiểm tra hợp lệ bằng chess.js). `scripts/games/evals/`: bảng đánh giá Stockfish từng nước.
- `scripts/games/annotations/<id>.json`: lời bình gốc. Quy ước viết ở `scripts/games/GUIDE.md` (biến phụ đặt trong `{...}`, nước thay thế trong `{^...}`).
- `node scripts/games/tool.cjs check <file>` kiểm tra mọi biến hợp lệ; `node scripts/games/tool.cjs line <id> <ply> <san...>` chấm một biến; `node scripts/games/assemble.cjs` đưa vào app.

## Dựng lại bản dịch sách

Pipeline nằm trong thư mục `scripts/book/` (xem README ở đó): tải bản Gutenberg từ archive.org, parse HTML, chép hình bằng mô hình thị giác, chuyển ký hiệu bằng `convert.cjs` (chess.js + Stockfish để khử nhập nhằng), dịch theo lô với bảng thuật ngữ, `resync.py` mang bản dịch sang kết quả chuyển đổi mới, lượt hiệu đính có công cụ `pos.cjs` để đối chiếu thế cờ, rồi `assemble.py` tạo `src/data/book.json`.

## Nguồn và giấy phép

- Bài tập: [Lichess puzzle database](https://database.lichess.org/#puzzles) (CC0).
- Engine: [Stockfish.js](https://github.com/nmrugg/stockfish.js) 17.1 WASM (GPLv3).
- Bàn cờ: [chessground](https://github.com/lichess-org/chessground) (GPLv3), luật: [chess.js](https://github.com/jhlywa/chess.js).
- Biên bản ván đấu trong "Từng nước một": dữ kiện công khai, lấy từ các bộ sưu tập PGN công cộng. Lời bình: tự biên soạn cho ứng dụng này, CC BY-SA 4.0.
- Sách: J. R. Capablanca, *Chess Fundamentals* (1921), Project Gutenberg #33870, public domain. Bản dịch tiếng Việt trong app phát hành theo CC BY-SA 4.0.
- Bài học: tự biên soạn, dẫn nguồn tới Wikibooks (CC BY-SA), Lichess Learn/Practice, sách public domain (Capablanca) và sách thương mại chỉ dẫn link mua.
