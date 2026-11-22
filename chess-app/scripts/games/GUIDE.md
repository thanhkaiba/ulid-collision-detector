# Hướng dẫn viết loạt "Từng nước một"

Mục tiêu: người chơi 800–1500 Elo đọc xong hiểu được **vì sao** mỗi nước được đi. Bạn là giáo viên cờ vua viết
bình luận GỐC bằng tiếng Việt cho một ván cờ kinh điển: giải thích MỌI nước đi của cả hai bên.

## Nguyên tắc nội dung
1. **Tự viết hoàn toàn.** Không chép, không dịch, không diễn đạt lại bình luận của bất kỳ sách, tạp chí hay trang web
   nào. Chỉ dựa vào: thế cờ, bảng đánh giá engine (`scripts/games/evals/<id>.txt`) và công cụ kiểm tra biến.
   Dữ kiện lịch sử ngắn (ai, ở đâu, năm nào, kết quả) thì dùng được; đừng kể giai thoại bạn không chắc.
2. **Giải thích ý tưởng bằng lời**, cụ thể: nước này tấn công/bảo vệ quân nào, mở đường nào, chuẩn bị nước gì,
   đối phương đang dọa gì. Tránh câu rỗng kiểu "một nước rất hay". Không ghi điểm số engine (+1.3) trong bài.
3. **Trung thực với engine.** Đọc bảng evals trước khi viết. Nước bị gắn cờ MISTAKE/BLUNDER thì phải nói rõ là sai
   và chỉ ra nước tốt hơn (cột "best"), trừ khi cờ chỉ là "thắng kiểu khác" trong thế đã thắng rõ (khi đó nói ngắn
   gọn là còn đường thắng nhanh hơn, hoặc bỏ qua). Nước nổi tiếng nhưng engine không đồng ý: nói thật, nhẹ nhàng.
   Không khẳng định "thắng quân", "chiếu hết", "hòa" cho một biến nếu chưa chạy công cụ `line` để kiểm.
4. **Mỗi nước một bình luận** (kể cả nước bắt lại hiển nhiên: 1 câu là đủ). Thông thường 15–60 từ; thời điểm then
   chốt (đòn phối hợp, sai lầm quyết định, chuyển kế hoạch) 60–130 từ. Khoảng 6–8 nước một lần, chèn một câu tổng
   kết thế cờ ("Điểm lại: ...").
5. Nối bài học với nguyên tắc chung: phát triển quân, trung tâm, an toàn vua, cột mở, quân hoạt động, cấu trúc tốt,
   Chiếu–Bắt–Dọa khi tính toán. Chỉ ra **khoảnh khắc người học nên dừng lại tự nghĩ** bằng câu hỏi ngắn.

## Định dạng file `scripts/games/annotations/<id>.json`
```json
{
  "id": "<id>",
  "title": "<tên bài, tiếng Việt>",
  "theme": "<1 câu: bài học chính>",
  "intro": "<80–150 từ: bối cảnh và điều cần quan sát>",
  "moves": [ { "san": "e4", "c": "<bình luận>" }, ... ],   // đúng số nước và đúng SAN như bảng evals
  "outro": "<60–120 từ: tổng kết ván cờ>",
  "lessons": ["<bài học 1>", "<bài học 2>", "<bài học 3>"]   // 3–5 ý, mỗi ý 1 câu
}
```

## Ký hiệu trong bình luận (app sẽ biến thành nút bấm xem trên bàn cờ)
- **Biến sau nước vừa đi**: đặt chuỗi SAN trong ngoặc nhọn, bắt đầu từ thế cờ SAU nước đang bình luận:
  `Nếu Trắng tham ăn tốt {Qxb7 Qb4+ Qxb4 Bxb4+} thì ...`
- **Nước thay thế cho nước vừa đi**: thêm `^` ở đầu, chuỗi bắt đầu từ thế cờ TRƯỚC nước đang bình luận:
  `Tốt hơn là {^Qc7}, chuẩn bị nhập thành dài.`  hoặc  `Không được {^Nxe4 Bxd8} vì mất Hậu.`
- Trong ngoặc nhọn chỉ có SAN chuẩn tiếng Anh (K Q R B N, O-O, x, +, #, =Q), cách nhau bằng dấu cách, KHÔNG có số
  thứ tự nước, KHÔNG có dấu chấm hay chữ. Mọi nước nhắc tới mà không phải nước vừa đi đều phải nằm trong ngoặc nhọn
  hợp lệ. App tự thêm số thứ tự khi hiển thị.
- Nhắc lại một nước ĐÃ/SẼ đi trong ván chính: viết kèm số, ví dụ `9...b5` hay `12.O-O-O` (app tự liên kết).
- Tên ô viết thường: `f7`, `d5` (app cho bấm để tô sáng ô). Tên quân viết tiếng Việt, viết hoa: Vua, Hậu, Xe,
  Tượng, Mã, Tốt. Bên: Trắng, Đen. Dùng `**đậm**` cho ý chính (tiết kiệm).
- Không dùng ký tự `{` `}` cho mục đích khác. Không xuống dòng trong một bình luận.

## Thuật ngữ
cột/hàng/đường chéo; trung tâm; cánh Vua/cánh Hậu; chiếu, chiếu hết, pat; nhập thành; ghim; đòn đôi; xiên;
tấn công mở/chiếu mở; chiếu đôi; thí quân; đổi quân; chất (Xe đổi quân nhẹ: "thắng chất/thí chất"); quân nhẹ;
Tốt thông/cô lập/chồng/lạc hậu/treo; tiền đồn; cột mở/nửa mở; nhịp (tempo); thế chủ động; phát triển quân;
đối vua; phong cấp; zugzwang (hết nước đi tốt); phong tỏa; phòng ngừa; cấu trúc Tốt; không gian.

## Công cụ (chạy từ thư mục chess-app)
- Bảng engine đã tính sẵn: `scripts/games/evals/<id>.txt` (điểm tính bằng Tốt theo góc nhìn Trắng; cột best là nước
  engine thích hơn và biến của nó; cờ MISTAKE/BLUNDER tính thô theo chênh lệch điểm).
- Kiểm tra một biến: `node scripts/games/tool.cjs line <id> <ply> <san...>`; `<ply>` là số nửa nước đã đi trước khi
  biến bắt đầu (cột đầu của bảng evals: biến SAU nước ở dòng ply N thì dùng N; nước THAY THẾ cho nước ở dòng N thì
  dùng N-1). Công cụ báo nước bất hợp lệ, điểm cuối biến, cân bằng vật chất và nước engine đi tiếp.
- Kiểm tra file: `node scripts/games/tool.cjs check scripts/games/annotations/<id>.json` phải báo 0 errors.
