# Pipeline dịch "Chess Fundamentals" (Capablanca, 1921)

1. Tải nguồn (archive.org, bản Gutenberg #33870): `pg33870.txt`, `33870-h.zip` (HTML + 150 ảnh hình cờ).
2. `parse_book.py` → `book.json`: chương, mục, đoạn văn, bảng nước đi, vị trí hình.
3. `figures.jsonl`: 150 hình được chép thành danh sách quân (kiểm tra bằng luật: 1 vua mỗi bên, tốt không ở hàng 1/8...). `merge_fens.py` → `fens.json`.
4. `convert.cjs` → `book_alg.json`: chuyển ký hiệu mô tả (P-K4, Kt-KB3, QRxP...) sang đại số bằng cách theo dõi thế cờ với chess.js, xử lý biến phụ, nước giả định, khử nhập nhằng bằng Stockfish; `overrides.json` sửa tay vài chỗ; `report.json` liệt kê nước không giải được (giữ nguyên dạng `[?...]`).
5. `resync.py`: khi sửa bộ chuyển đổi hay hình, id nước đi thay đổi; script này mang bản dịch cũ sang kết quả mới (`translations/synced.json`) và liệt kê các đoạn cần hiệu đính (`in_R*.json`). `pos.cjs <id>` in hình, thế cờ và nguyên văn quanh một đoạn để người hiệu đính đối chiếu.
6. Dịch theo lô `tr/in_*.json` → `tr/out_*.json` theo `TRANSLATION_GUIDE.md` (token ⟦id|nước⟧ phải giữ nguyên).
7. `assemble.py` → `src/data/book.json`.
