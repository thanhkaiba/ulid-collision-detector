# Hiệu đính bản dịch "Chess Fundamentals" (Capablanca, 1921, public domain)

Bạn nhận file JSON: mảng {"id", "text", "prev_vi", "why"}.
- `text`: bản tiếng Anh đã chuyển ký hiệu (bản mới nhất). Token ⟦123|Nf3⟧ là nước đi đã được máy xác minh; ⟦-|Kd3⟧ là nước
  máy ĐOÁN (có thể sai bên Trắng/Đen); `[?K - B 1]` là nước máy không chuyển được; ngoài ra có thể còn ký hiệu mô tả cũ
  trong văn xuôi (K R 1, Q B 4, "K moves"...).
- `prev_vi`: bản dịch hiện có (id của token đã được cập nhật theo `text`).
- `why`: "conversion changed" = phần nước đi trong `text` khác trước, cần dịch lại câu chữ cho khớp;
  "leftover notation" = bản dịch/bản gốc còn sót ký hiệu cũ, placeholder hoặc nước đoán.

Việc cần làm cho MỖI đoạn: viết lại `vi` hoàn chỉnh, tiếng Việt tự nhiên, theo đúng `text`, và:
1. Giữ nguyên từng token ⟦số|...⟧ có trong `text` (đúng từng ký tự, đủ số lượng, đặt đúng chỗ trong câu).
2. `[?...]` : xác định nước đi đúng bằng công cụ bên dưới rồi viết thành token rời ⟦-|SAN⟧ (SAN đại số chuẩn, ví dụ
   ⟦-|Kxf3⟧, ⟦-|fxg4⟧, ⟦-|13.Bxf6⟧ nếu cần số thứ tự). Không xác định được thì diễn đạt bằng lời tiếng Việt
   ("Vua ăn Tốt"), KHÔNG để lại `[?` hay ký hiệu mô tả tiếng Anh.
3. Token đoán ⟦-|X⟧: kiểm tra với thế cờ. Lỗi hay gặp: nước của ĐEN bị đổi theo phía Trắng (K-Q3 của Đen là Kd6, không
   phải Kd3; K-R1 của Đen là Kh8). Sai thì sửa nhãn (vẫn dạng ⟦-|...⟧).
4. Tên ô kiểu cũ trong văn xuôi ("K R 1", "Q B 4", "K 5"): đổi sang đại số theo đúng bên đang nói tới
   (cột QR=a QKt=b QB=c Q=d K=e KB=f KKt=g KR=h; hàng giữ nguyên với Trắng, 9 trừ đi với Đen). Kiểm tra bằng thế cờ.
5. Không còn tiếng Anh sót ("K moves" = "Vua đi", "and wins" = "và thắng", "Resigns" = "xin thua"...).
6. Thuật ngữ: Vua, Hậu, Xe, Tượng, Mã, Tốt; cột/hàng/đường chéo; chiếu, chiếu hết, pat; nhập thành; đối vua; Tốt thông;
   chất; đổi quân; thí quân; khai cuộc, trung cuộc, cờ tàn; Trắng/Đen. Giữ **đậm** và *nghiêng* như `text`.

Công cụ (chạy từ thư mục capa này):
- `node pos.cjs <id>` : in hình gần nhất, thế cờ ván chính ngay trước đoạn, nguyên văn 1921 (ký hiệu mô tả), bản đã chuyển,
  và thế cờ sau mỗi token của đoạn. Dùng cho mọi đoạn có `[?`, ⟦-|, hoặc tên ô cũ.
- `node /home/user/ulid-collision-detector/chess-app/scripts/eval_fen.cjs "<FEN>" 8 1 -- <san> <san> ...` : thử một chuỗi
  nước từ một thế cờ (báo ILLEGAL nếu sai) và in bàn cờ.

Kết quả: ghi file JSON `[{"id": ..., "vi": ...}]` đủ mọi id, đúng thứ tự. Trước khi xong, tự kiểm bằng python3 -I:
JSON hợp lệ; đủ id; với mỗi đoạn, tập token ⟦số|...⟧ (chỉ loại có số) trong `vi` trùng với trong `text`; không còn
chuỗi `[?`.
