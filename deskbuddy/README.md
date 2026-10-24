# DeskBuddy

Bất cứ thứ gì cũng có thể là bạn đồng hành trên màn hình: củ khoai, cô gái anime,
khủng long, siêu nhân, cục gì đó. Nhân vật ngồi ở góc màn hình, phản ứng khi bạn
làm việc, và được "cho ăn" bằng chính thời gian tập trung của bạn.

Đây là MVP viết bằng **Godot 4.3**, chạy trên Windows, macOS và Linux.

| Củ Khoai (lười) | Aki (tsundere, đang đói) | Rex (hỗn loạn, đang buồn) |
|---|---|---|
| ![](docs/screenshots/potato.png) | ![](docs/screenshots/aki_hungry.png) | ![](docs/screenshots/rex_sad.png) |

## Chạy thử

1. Cài [Godot 4.3](https://godotengine.org/download) (bản thường, không cần .NET).
2. Mở Godot → Import → chọn `deskbuddy/project.godot`.
3. Nhấn F5. Nhân vật xuất hiện ở góc phải dưới màn hình.

Chạy test headless (không cần mở editor):

```bash
cd deskbuddy
godot --headless --path . -s tests/run_tests.gd
```

Chụp màn hình tự động để kiểm tra hiển thị (cần màn hình hoặc Xvfb):

```bash
godot --path . -s tools/screenshot.gd -- out.png 120 potato hud hungry
# trên máy không có màn hình:
xvfb-run -a godot --path . --rendering-driver opengl3 --audio-driver Dummy \
  -s tools/screenshot.gd -- out.png 120 rex hud sad
```

Cả hai đã được chạy với Godot 4.3 trên Linux: 56 test qua, ba pack dựng
hình đúng.

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

Năm pack mẫu: **Củ Khoai** (lười), **Aki** (tsundere), **Rex** (hỗn loạn),
**Kẹo** (bám người, kind `shape`) và **Zom** (hỗ trợ, kind `image`).
Sprite được ghép từ bộ phận của Kenney (CC0) bằng `tools/compose_packs.py`;
các bộ phận đã dùng nằm trong `art_src/kenney/`. Thay art riêng chỉ cần đè
file `sprites.png` của pack.

![](docs/screenshots/sheets_preview.png)

```bash
# Dựng lại 3 sheet (chỉ cần Python 3, không cần thư viện ngoài)
python3 tools/compose_packs.py --preview /tmp/preview.png
```

## Workshop: người chơi tự tạo nhân vật

Menu chuột phải → **Workshop**:

| Mục | Làm gì |
|---|---|
| Tạo từ ảnh bất kỳ… | Chọn PNG/JPG (meme, ảnh thú cưng, củ khoai thật). Tuỳ chọn xoá nền đơn sắc lấy từ 4 góc ảnh. Đặt tên, tính cách, tên món ăn và nhãn 3 thanh. Engine tự tạo chuyển động và cảm xúc |
| Ghép nhân vật từ bộ phận… | Chọn thân, màu, mặt, tay từ bộ Kenney, xem trước ngay. Không cần vẽ gì |
| Nhập pack (.zip)… | Nhận pack bạn bè gửi |
| Xuất nhân vật hiện tại (.zip)… | Đóng gói để chia sẻ |

Pack tạo ra nằm ở `user://packs/<id>/`, cùng định dạng mở trong
`docs/PACK_FORMAT.md`, nên họa sĩ có thể mở ra sửa tay.

### Steam Workshop

Cùng tab Workshop có mục **Steam Workshop** (cần GodotSteam, xem
`addons/README.md`):

- **Tải về**: subscribe nhân vật trên Steam, app tự tải về và chép vào
  `user://packs`, cập nhật khi tác giả đăng bản mới, gỡ khi bỏ subscribe.
  Đồng bộ lúc mở app, khi Steam báo có item mới, và mỗi 10 phút.
- **Tải lên**: đăng nhân vật đang hiển thị với tiêu đề, mô tả, ghi chú.
  Ảnh xem trước chụp tự động. Lần đầu tạo item mới, các lần sau cập nhật
  đúng item đó (file id nhớ trong `user://workshop.json`).

Phần gọi Steam gói trong `scripts/workshop/steam_adapter.gd`; toàn bộ logic
đồng bộ nằm ở `workshop_service.gd` và được test bằng
`fake_steam_adapter.gd`, không cần Steam.

### Vì sao chưa có model 3D

Hỗ trợ VRM/glTF là việc đáng làm nhưng là một pha riêng: cần addon VRM cho
Godot, cửa sổ 3D trong suốt, retarget animation cho từng model và máy yếu sẽ
tốn pin hơn nhiều. Định dạng pack đã chừa sẵn: `kind: "vrm"` sẽ là loại thứ
tư, mọi thứ khác (nhu cầu, tính cách, câu nói, Workshop, zip) dùng lại nguyên.

## Bắt bàn phím toàn hệ thống (GDExtension)

`gdextension/activity_probe/` là một extension C nhỏ (một file, viết thẳng
trên C API của Godot, không cần godot-cpp hay scons) cung cấp lớp
`ActivityProbe` với ba câu hỏi: idle bao lâu, phím cuối bấm bao lâu rồi, bao
nhiêu lần bấm phím từ lần hỏi trước. **Chỉ đếm, không bao giờ đọc mã phím
hay ký tự**, không ghi file, không gửi đi đâu.

| Hệ | Cách làm | Quyền cần |
|---|---|---|
| Linux X11 | XInput2 raw events (dlopen libX11/libXi) | Không |
| Linux Wayland | Chưa có, tự lùi về theo dõi chuột | |
| Windows | `GetLastInputInfo` + hook `WH_KEYBOARD_LL` chỉ đếm | Không |
| macOS | `CGEventSourceSecondsSinceLastEventType` | Không (không cần Accessibility) |

Build tại chỗ:

```bash
sh deskbuddy/gdextension/activity_probe/build.sh      # Linux, macOS
deskbuddy\gdextension\activity_probe\build.bat       # Windows, x64 Native Tools prompt
```

GitHub Actions (`.github/workflows/build-activity-probe.yml`) build cả ba
hệ và đưa ra artifact. Bản Linux đã build sẵn nằm trong `bin/`. Không có
file nhị phân thì app vẫn chạy với backend chuột.

Kiểm tra trên Linux không cần gõ tay:

```bash
gcc -O2 -o /tmp/xtest_keys deskbuddy/tools/xtest_keys.c -ldl
cd deskbuddy
godot --headless --path . -s tools/probe_check.gd -- 4 &   # in backend và số phím đếm được
sleep 1.5; /tmp/xtest_keys 25; wait
```

Trên máy không màn hình bọc cả hai lệnh trong `xvfb-run`.

## Khay hệ thống và tự khởi động

- Biểu tượng khay (Windows, macOS, Linux X11) với menu: ẩn/hiện nhân vật,
  cho ăn, bắt đầu tập trung, bật tự khởi động, thoát. Ẩn nhân vật khi chia sẻ
  màn hình mà không thoát app; nhu cầu vẫn chạy.
- Tự khởi động cùng máy, bật từ menu chuột phải hoặc menu khay:
  Windows ghi khoá `HKCU\...\Run` qua `reg.exe`, macOS tạo LaunchAgent
  `~/Library/LaunchAgents/nl.deskbuddy.app.plist`, Linux tạo
  `~/.config/autostart/deskbuddy.desktop`. Trạng thái đọc trực tiếp từ hệ
  điều hành. Chỉ hoạt động với bản build (trong editor mục này bị mờ vì
  executable khi đó là Godot).

## Giới hạn đã biết của MVP

- Trên Wayland thuần chưa bắt được bàn phím toàn hệ thống (XWayland chỉ thấy
  app X11). Khi đó app lùi về theo dõi chuột và bàn phím lúc có focus.
- Chưa đọc tên app đang mở (cần cho tính năng "nhìn chằm chằm khi mở YouTube").
- Khay hệ thống trên Linux cần môi trường desktop có vùng tray (GNOME cần
  extension AppIndicator).
- Chưa có 3D (VRM). Xem mục Workshop ở trên.
- Font Nunito và Baloo 2 không có emoji, nên icon trong pack để trống.

## Ghi công

- Art nhân vật: [Kenney](https://www.kenney.nl) · Shape Characters,
  Platformer Characters, Monster Builder Pack · CC0 1.0
  (`art_src/kenney/LICENSE-Kenney-CC0.txt`).
- Font: Nunito (Vernon Adams và cộng sự) và Baloo 2 (Ek Type) · SIL Open
  Font License 1.1 (`assets/fonts/OFL-*.txt`).

## Khi export

Thêm `*.json` vào Export → Resources → "Filters to export non-resource files"
để `pack.json` của các pack đi kèm được đóng vào PCK.

## Hướng tiếp theo

1. Đọc tên app đang focus (mở rộng ActivityProbe).
2. Steam Workshop: upload/download zip pack về `user://packs`.
3. Hai nhân vật cùng lúc và tương tác theo archetype.
4. Phiếu báo cáo cuối tuần.
5. `kind: "vrm"`: model 3D.
