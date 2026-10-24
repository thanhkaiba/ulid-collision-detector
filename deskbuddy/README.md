# DeskBuddy

Bất cứ thứ gì cũng có thể là bạn đồng hành trên màn hình: củ khoai, cô gái anime,
khủng long, siêu nhân, cục gì đó. Nhân vật ngồi ở góc màn hình, phản ứng khi bạn
làm việc, và được "cho ăn" bằng chính thời gian tập trung của bạn.

Đây là MVP viết bằng **Godot 4.3**, chạy trên Windows, macOS và Linux.

## Chạy thử

1. Cài [Godot 4.3](https://godotengine.org/download) (bản thường, không cần .NET).
2. Mở Godot → Import → chọn `deskbuddy/project.godot`.
3. Nhấn F5. Nhân vật xuất hiện ở góc phải dưới màn hình.

Chạy test headless (không cần mở editor):

```bash
cd deskbuddy
godot --headless --path . -s tests/run_tests.gd
```

## Điều khiển

| Thao tác | Kết quả |
|---|---|
| Click trái vào nhân vật | Vuốt ve (+tâm trạng, +gắn kết, có cooldown) |
| Kéo nhân vật | Di chuyển cửa sổ, vị trí được lưu |
| Rê chuột lên nhân vật | Hiện 3 thanh nhu cầu |
| Click phải | Menu: cho ăn, vuốt ve, phiên tập trung, đổi nhân vật, mở thư mục packs, thoát |

Phần trong suốt của cửa sổ cho click xuyên xuống desktop, chỉ vùng nhân vật
nhận chuột.

## Cách nó hoạt động

- **Ba thanh nhu cầu chung** (`scripts/buddy_needs.gd`): energy, mood, bond.
  Pack chỉ đổi tên hiển thị. Không bao giờ chết, chỉ xuống sàn 10 và buồn.
  Mở app lại sau nhiều ngày chỉ bị trừ tối đa 12 giờ decay.
- **Tính cách tách khỏi hình hài** (`scripts/personality.gd`): 6 archetype
  (bám người, lười, tsundere, hỗ trợ, hỗn loạn, nghiêm khắc). Mỗi archetype có
  hệ số decay, nhịp bắt chuyện và câu nói cho 12 sự kiện. Pack chọn một và có
  thể override từng nhóm câu.
- **Đồ ăn chỉ kiếm bằng phiên tập trung** (`scripts/focus_session.gd`): 25 phút
  = 1 phần ăn. Không có đường mua bằng tiền.
- **Theo dõi hoạt động** (`scripts/activity_monitor.gd`): idle sau 5 phút chuột
  không động → nhân vật ngủ; gõ phím dồn dập → nhân vật hưng phấn. Mọi dữ liệu
  chỉ ở RAM, không ghi, không gửi.
- **Pack** (`docs/PACK_FORMAT.md`): một thư mục có `pack.json` + sprite sheet.
  Pack đi kèm ở `packs/`, pack người dùng ở thư mục `user://packs` (menu
  "Mở thư mục packs" dẫn tới đó). Pack lỗi vẫn hiện trong menu kèm lý do.
- **Lưu trữ**: `user://save.json`, toàn bộ local.

Ba pack mẫu: **Củ Khoai** (lười), **Aki** (tsundere), **Rex** (hỗn loạn).
Sprite hiện tại là placeholder sinh bằng `tools/gen_placeholder_art.py`,
thay bằng art thật chỉ cần đè file `sprites.png`.

## Giới hạn đã biết của MVP

- Godot chỉ nhận bàn phím khi cửa sổ có focus, nên "gõ dồn dập" mới chỉ bắt
  được khi app đang focus. Chuột thì bắt toàn hệ thống. Để bắt bàn phím toàn hệ
  thống cần một GDExtension nhỏ (Windows `GetLastInputInfo`, macOS `CGEventTap`
  với quyền Accessibility). Signal của `ActivityMonitor` giữ nguyên khi thay.
- Chưa đọc tên app đang mở (cần cho tính năng "nhìn chằm chằm khi mở YouTube").
- Chưa có khay hệ thống, chưa tự chạy khi đăng nhập.
- Chỉ hỗ trợ `kind: sprite2d`. VRM/3D để sau.
- Font mặc định của Godot không có emoji, nên icon trong pack để trống.

## Khi export

Thêm `*.json` vào Export → Resources → "Filters to export non-resource files"
để `pack.json` của các pack đi kèm được đóng vào PCK.

## Hướng tiếp theo

1. Khay hệ thống + tự khởi động.
2. GDExtension bắt bàn phím và app đang focus.
3. Steam Workshop: upload/download pack về `user://packs`.
4. Hai nhân vật cùng lúc và tương tác theo archetype.
5. Phiếu báo cáo cuối tuần.
