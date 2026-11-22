# Soát độ chính xác lời bình "Từng nước một"

Bạn là kiện tướng kiêm huấn luyện viên, soát MỘT ván đã có lời bình tiếng Việt (file `scripts/games/annotations/<id>.json`,
quy ước viết ở `scripts/games/GUIDE.md`). Lời bình do mô hình viết dựa trên engine độ sâu 17; lượt soát trước ở một ván khác
đã tìm ra đúng các kiểu lỗi sau, hãy săn chúng:

1. **Khẳng định hình học sai**: "Hậu ngắm đường chéo a2–g8" trong khi đường chéo bị Tốt nhà chắn; "cột mở duy nhất" trong khi
   còn cột mở khác; "nối hai Xe" khi còn quân đứng giữa; "quân X bảo vệ/tấn công ô Y" mà thực tế bị che.
   Kiểm bằng `node scripts/games/tool.cjs board <id> <ply> <ô> <ô>...` (in bàn cờ, quân nào tấn công từng ô, cột mở/nửa mở).
   `<ply>` = cột đầu của bảng `scripts/games/evals/<id>.txt` (số nửa nước đã đi).
2. **Biến viết sai hậu quả**: nói "mất Mã" nhưng biến đó mất Hậu; nói "thắng quân" nhưng engine không đồng ý.
   Kiểm bằng `node scripts/games/tool.cjs line <id> <ply> <san...>` (in cân bằng vật chất và đánh giá cuối biến).
3. **Kết luận quá mạnh từ engine nông**: "cơ hội cuối cùng", "sai lầm quyết định", "thua cưỡng bức" dựa trên chênh lệch nhỏ.
   Kiểm thời điểm then chốt bằng `node scripts/games/tool.cjs deep <id> <ply> 24` (3 nước tốt nhất ở độ sâu cao hơn).
   Nếu chênh lệch dưới khoảng nửa Tốt thì hạ giọng ("đáng thử", "chính xác hơn").
4. **Dữ kiện lịch sử** không chắc chắn: bỏ hoặc viết trung tính.
5. **Sư phạm**: lời giải thích nêu sai LÝ DO của nước đi (dù nước đúng); thuật ngữ dùng sai (chất, nhịp, tiền đồn, ghim...).

Cách làm: đọc bảng evals, rồi đi từng nước với lời bình; với MỖI khẳng định cụ thể kiểm được thì kiểm. Ưu tiên trung cuộc và
các đòn phối hợp. Sửa trực tiếp trong file JSON: chỉ sửa câu sai, giữ nguyên giọng văn và độ dài; mọi biến trong `{...}` phải
hợp lệ. Không viết lại những gì đã đúng. Nội dung sửa do bạn tự viết từ thế cờ và engine, không chép từ sách hay trang nào.
Sau đó chạy `node scripts/games/tool.cjs check scripts/games/annotations/<id>.json` cho tới khi 0 errors.
Không sửa file nào khác, không chạy git.

Báo cáo (tiếng Việt, ngắn): số khẳng định đã kiểm, danh sách từng chỗ đã sửa (nước, sai gì, sửa thành gì), và những chỗ
còn nghi ngờ nhưng chưa đủ căn cứ để sửa.
