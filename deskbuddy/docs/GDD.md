# DeskBuddy: tài liệu thiết kế rút gọn

## Một câu

Nền tảng nhân vật đồng hành trên desktop: bất cứ thứ gì cũng có thể ngồi
cạnh bạn, phản ứng khi bạn làm việc, và được nuôi bằng thời gian tập trung
của bạn.

## Định vị

- Hình mẫu kinh doanh: Wallpaper Engine (giá thấp, Workshop khổng lồ).
- Hình mẫu sản phẩm: Bongo Cat (meme, phản ứng gõ phím) + Desktop Mate
  (anime, DLC nhân vật) + Finch (chăm pet bằng việc tự chăm mình).
- Khác biệt: một hệ thống nuôi dưỡng dùng chung cho mọi loại nhân vật, và
  cộng đồng tự làm nhân vật bằng một định dạng mở.

## Vòng chơi

1. Nhân vật ngồi góc màn hình, phản ứng theo hoạt động (gõ, idle).
2. Ba thanh nhu cầu giảm theo thời gian. Tính cách chỉnh tốc độ.
3. Cách duy nhất kiếm đồ ăn: hoàn thành phiên tập trung 25 phút.
4. Vuốt ve miễn phí nhưng có cooldown, tăng tâm trạng và gắn kết.
5. Gắn kết tăng rất chậm, chỉ giảm khi bị bỏ bê. Đây là thanh "tiến trình".
6. Không bao giờ chết. Bỏ một tuần chỉ bị trừ 12 giờ decay.

## Hai lớp tách biệt

- **Hình hài** (pack): sprite, nhãn thanh, tên món ăn, vài câu riêng.
- **Tính cách** (archetype trong engine): hệ số decay, nhịp bắt chuyện,
  câu nói mặc định. Người làm pack chỉ chọn, không phải viết logic.

Sau này: hai nhân vật cùng màn hình tương tác dựa trên cặp archetype.

## Phân tầng nội dung

1. Nhân vật gốc của studio (IP riêng, bán cosmetic và merch).
2. Hợp tác có phép (VTuber, họa sĩ độc lập, meme có chủ).
3. Workshop cộng đồng, miễn phí, tự chịu trách nhiệm bản quyền.
4. Local mod: không host, không bán, không quảng bá.

Nội dung chính thức dừng ở mức gợi cảm, không khiêu dâm, để giữ cổng thanh
toán và khả năng ra mobile sau này.

## Lộ trình

- **MVP (repo này)**: Windows/macOS/Linux, 3 pack mẫu, định dạng pack,
  nhu cầu, tính cách, phiên tập trung, lưu local.
- **v0.2**: khay hệ thống, tự khởi động, GDExtension bắt bàn phím và app
  đang focus, phiếu báo cáo tuần.
- **v0.3**: Steam Early Access, Workshop, Steam Inventory cho cosmetic.
- **v0.4**: hai nhân vật, tương tác, VRM.
- **Sau**: app mobile đồng hành (xem và cho ăn từ xa), hợp tác VTuber.
