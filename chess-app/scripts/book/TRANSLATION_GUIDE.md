# Hướng dẫn dịch "Chess Fundamentals" (Capablanca, 1921, public domain) sang tiếng Việt

Bạn nhận một file JSON: mảng các đoạn {"id": "...", "text": "..."}. Hãy dịch từng đoạn sang tiếng Việt tự nhiên,
rõ ràng cho người học cờ vua, giữ đúng ý và giọng của tác giả (ngôi "I" = "tôi"). Ghi kết quả ra file JSON cùng
thứ tự: [{"id": "...", "vi": "..."}]. Mọi id phải có mặt, kể cả tiêu đề ngắn.

## Quy tắc BẮT BUỘC về ký hiệu
1. Các token dạng ⟦12|1.Ra7⟧ hoặc ⟦-|Bb7⟧ là nước đi đã được máy chuyển sang ký hiệu đại số. GIỮ NGUYÊN TUYỆT ĐỐI
   từng ký tự bên trong ⟦ ⟧, kể cả số id và dấu. Số lượng token trong bản dịch phải bằng bản gốc. Đặt token vào
   đúng vị trí tương ứng trong câu tiếng Việt.
2. Các đoạn [?K - B 1] là nước máy không chuyển được: giữ nguyên.
3. Giữ các dấu **đậm** và *nghiêng* bao quanh cùng đoạn văn tương ứng.
4. Tên ô cờ còn sót trong văn xuôi dạng cũ (ví dụ "K R 1", "Q B 4", "K 5", "Kt 3") hãy chuyển sang ký hiệu đại số:
   cột: QR=a, QKt=b, QB=c, Q=d, K=e, KB=f, KKt=g, KR=h; hàng giữ nguyên nếu là ô của Trắng, lấy 9 trừ đi nếu là ô
   của Đen (ví dụ "Black's K 5" = e4, "my B at Q B 4" khi "tôi" cầm Đen = c5). Nếu không chắc bên nào, viết
   "ô c4 (theo Trắng)". Chữ "R" đứng một mình chỉ tốt/ô cột xe, "Kt" là mã.
5. Ký hiệu quân khi viết tắt trong văn (K, Q, R, B, Kt, P) dịch thành tên đầy đủ: Vua, Hậu, Xe, Tượng, Mã, Tốt.
6. "Example 12." → "Ví dụ 12.", "GAME 3." → "VÁN 3.", "CHAPTER I" → "CHƯƠNG I", "PART I" → "PHẦN I".
7. Không dịch tên người (Capablanca, Marshall, Lasker...), tên khai cuộc dịch theo thông lệ Việt Nam:
   Queen's Gambit Declined = Gambit Hậu từ chối, Ruy Lopez = Ruy Lopez (Ván cờ Tây Ban Nha), French Defence = Phòng thủ Pháp,
   Petroff Defence = Phòng thủ Petroff, Centre Game = Ván cờ Trung tâm, Irregular Defence = Phòng thủ không chính quy,
   Four Knights = Bốn Mã, Giuoco Piano = Giuoco Piano (Ván cờ Ý), Sicilian = Sicilian.

## Thuật ngữ thống nhất
King=Vua; Queen=Hậu; Rook=Xe; Bishop=Tượng; Knight=Mã; Pawn=Tốt; file=cột; rank=hàng; diagonal=đường chéo;
square=ô; centre=trung tâm; King's side=cánh Vua; Queen's side=cánh Hậu; check=chiếu; checkmate/mate=chiếu hết;
stalemate=pat (hết nước đi, hòa); castle/castling=nhập thành; opposition=thế đối vua; to have the opposition=giành được đối vua;
passed pawn=Tốt thông; isolated pawn=Tốt cô lập; doubled pawns=Tốt chồng; backward pawn=Tốt lạc hậu;
the exchange (R for minor piece)=chất; to win the exchange=thắng chất; a piece=một quân; minor piece=quân nhẹ;
to exchange=đổi quân; sacrifice=thí (quân); gambit=gambit; opening=khai cuộc; middle-game=trung cuộc;
end-game/ending=cờ tàn; tempo=nhịp (tempo); development=phát triển quân; initiative=thế chủ động;
attack=tấn công; defence=phòng thủ; pin=ghim; fork=đòn đôi; discovered check=chiếu mở; double check=chiếu đôi;
draw=hòa; resigns=xin thua; to queen a pawn=phong Hậu; promotion=phong cấp; combination=đòn phối hợp;
position=thế cờ; move=nước đi; line/variation=biến; the text move=nước đi trong ván (nước ở cột chính);
White/Black=Trắng/Đen; the student=người học; the beginner=người mới.

Văn phong: câu ngắn, tiếng Việt chuẩn, tránh dịch word-by-word; đây là sách giáo khoa cờ vua kinh điển.
