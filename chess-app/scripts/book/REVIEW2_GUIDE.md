# Lượt soát 2: kiểm tra các nước đi được máy đặt theo phỏng đoán

Sách: Capablanca, "Chess Fundamentals" (1921, public domain). Bản 1921 dùng ký hiệu mô tả (P-K4, Kt-KB3): cùng một cách
viết chỉ hai ô khác nhau tùy bên đi ("Kt - Q 5" của Trắng là Nd5, của Đen là Nd4). Máy đã chuyển sang ký hiệu đại số.
Nước nằm trong chuỗi có số thứ tự thì chắc chắn đúng. Nhưng nước được nhắc LẺ trong câu ("...would prevent B - Kt 2")
được máy đặt theo phỏng đoán và khoảng 1/6 bị gán NHẦM BÊN (ví dụ in ra Nd4 trong khi câu nói về Mã Trắng tới d5).

Đầu vào: mảng {"id", "text", "prev_vi", "check"}.
- `text`: bản tiếng Anh đã chuyển. `prev_vi`: bản dịch tiếng Việt hiện tại. `check`: các token trong đoạn cần kiểm tra.

Với MỖI đoạn:
1. Chạy `node pos.cjs <id>` (từ thư mục capa). Nó in: hình gần nhất, thế cờ ván chính trước đoạn, NGUYÊN VĂN 1921 (ký hiệu
   mô tả), bản đã chuyển, và từng token kèm ghi chú (HEURISTIC, moved by White/Black) cùng thế cờ sau nước đó.
2. Với từng token trong `check`: đọc câu để biết BÊN NÀO đi nước đó và nước đó nhằm vào thế cờ nào, đối chiếu ký hiệu mô tả
   trong nguyên văn (cột QR=a QKt=b QB=c Q=d K=e KB=f KKt=g KR=h; hàng giữ nguyên với Trắng, 9 trừ đi với Đen).
   - Đúng: giữ nguyên token.
   - Sai (nhầm bên, nhầm ô, nhầm quân bị ăn): trong `vi`, thay token đó bằng token rời ⟦-|SAN đúng⟧ (ví dụ ⟦-|Nd5⟧),
     có thể kèm số thứ tự như ⟦-|13.Bxf6⟧. Dùng
     `node /home/user/ulid-collision-detector/chess-app/scripts/eval_fen.cjs "<FEN>" 8 1 -- <san> ...` để thử khi cần.
   - Không xác định được: giữ nguyên token và ghi vào `unsure`.
3. Nếu `prev_vi` còn ký hiệu mô tả tiếng Anh, tên ô kiểu cũ ("K R 1"), tiếng Anh sót, hoặc câu dịch sai nghĩa cờ do nước
   bị nhầm, sửa luôn. Ngoài ra KHÔNG viết lại câu chữ: giữ `prev_vi` nguyên vẹn.
4. Mọi token có số khác (không nằm trong `check`) phải giữ nguyên từng ký tự.

Kết quả: file JSON, CHỈ gồm các đoạn bạn có sửa:
`[{"id": "...", "vi": "<toàn bộ đoạn tiếng Việt sau khi sửa>", "replaced": ["⟦288|Nd4⟧ -> ⟦-|Nd5⟧"], "unsure": []}]`
Tự kiểm bằng python3 -I trước khi xong: JSON hợp lệ; với mỗi đoạn, mọi token có số trong `text` hoặc còn nguyên trong `vi`
hoặc có trong `replaced`; không có `[?`.
