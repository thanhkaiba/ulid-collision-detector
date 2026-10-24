# addons/

## GodotSteam (cho Steam Workshop)

DeskBuddy dùng [GodotSteam](https://godotsteam.com) bản **GDExtension** cho
Godot 4.3. Thư mục `addons/godotsteam/` không nằm trong git (nặng và có
Steam API nhị phân), bạn tự thêm:

1. Tải bản GDExtension mới nhất cho Godot 4.3 tại
   https://codeberg.org/godotsteam/godotsteam/releases (tên dạng
   `godotsteam-gdextension-*.zip`).
2. Giải nén, chép thư mục `addons/godotsteam/` vào `deskbuddy/addons/`.
   Bên trong có `godotsteam.gdextension` và các file `.so`, `.dll`,
   `.dylib`, kèm `steam_api` của Valve.
3. Tạo file `steam_appid.txt` cạnh file chạy (hoặc cạnh `project.godot` khi
   chạy từ editor) chứa App ID. Lúc phát triển dùng `480` (Spacewar).
   Khi có app riêng, đổi `APP_ID` trong `scripts/workshop/steam_adapter.gd`.
4. Mở Steam client, đăng nhập, rồi chạy app. Menu chuột phải → Workshop →
   Steam Workshop sẽ báo "Đã kết nối Steam".

Không cài gì thì app vẫn chạy bình thường, chỉ ẩn phần Steam và vẫn chia sẻ
pack qua zip được.
