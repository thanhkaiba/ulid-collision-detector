# Chess Trainer

Ứng dụng web cài được lên điện thoại (PWA) để học cờ vua từ người mới đến nâng cao. Mọi dữ liệu nằm trong máy bạn, không có máy chủ.

## Tính năng

- **Học**: lộ trình 4 giai đoạn (0–1000, 1000–1500, 1500–2000, 2000+), 30 bài học tiếng Việt. Mỗi bài có phần đọc, vị trí tương tác phải đi đúng nước, bài tập từ ván thật và link tới sách/trang gốc.
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

## Nguồn và giấy phép

- Bài tập: [Lichess puzzle database](https://database.lichess.org/#puzzles) (CC0).
- Engine: [Stockfish.js](https://github.com/nmrugg/stockfish.js) 17.1 WASM (GPLv3).
- Bàn cờ: [chessground](https://github.com/lichess-org/chessground) (GPLv3), luật: [chess.js](https://github.com/jhlywa/chess.js).
- Bài học: tự biên soạn, dẫn nguồn tới Wikibooks (CC BY-SA), Lichess Learn/Practice, sách public domain (Capablanca) và sách thương mại chỉ dẫn link mua.
