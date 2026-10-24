class_name Autostart
extends RefCounted
## Bật/tắt chạy cùng hệ điều hành khi đăng nhập.
##   Windows : HKCU\Software\Microsoft\Windows\CurrentVersion\Run (qua reg.exe)
##   macOS   : ~/Library/LaunchAgents/<LABEL>.plist
##   Linux   : ~/.config/autostart/deskbuddy.desktop (chuẩn XDG)
## Trạng thái luôn đọc từ hệ điều hành, không lưu riêng.

const APP_NAME := "DeskBuddy"
const LABEL := "nl.deskbuddy.app"
const WIN_KEY := "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run"

## Test có thể trỏ thư mục khác để không đụng máy thật.
static var dir_override := ""


## Chỉ bản build mới có ý nghĩa: trong editor, executable là Godot.
static func is_supported() -> bool:
	if OS.has_feature("editor"):
		return false
	return OS.get_name() in ["Windows", "macOS", "Linux"]


static func unsupported_reason() -> String:
	if OS.has_feature("editor"):
		return "Chỉ dùng được với bản build (đang chạy trong editor)."
	return "Hệ điều hành %s chưa hỗ trợ." % OS.get_name()


static func is_enabled() -> bool:
	match OS.get_name():
		"Windows":
			var out := []
			var code := OS.execute("reg", ["query", WIN_KEY, "/v", APP_NAME], out, true)
			return code == 0
		"macOS", "Linux":
			return FileAccess.file_exists(_entry_path())
	return false


static func set_enabled(on: bool) -> Error:
	match OS.get_name():
		"Windows":
			var args: PackedStringArray
			if on:
				args = PackedStringArray(["add", WIN_KEY, "/v", APP_NAME, "/t", "REG_SZ", "/d", "\"%s\"" % _exe(), "/f"])
			else:
				args = PackedStringArray(["delete", WIN_KEY, "/v", APP_NAME, "/f"])
			var out := []
			var code := OS.execute("reg", args, out, true)
			return OK if code == 0 else ERR_CANT_CREATE
		"macOS", "Linux":
			var path := _entry_path()
			if on:
				DirAccess.make_dir_recursive_absolute(path.get_base_dir())
				var f := FileAccess.open(path, FileAccess.WRITE)
				if f == null:
					return FileAccess.get_open_error()
				f.store_string(plist(_exe()) if OS.get_name() == "macOS" else desktop_entry(_exe()))
				f.close()
				return OK
			if FileAccess.file_exists(path):
				return DirAccess.remove_absolute(path)
			return OK
	return ERR_UNAVAILABLE


## Nội dung LaunchAgent cho macOS.
static func plist(exe: String) -> String:
	return """<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>Label</key>
	<string>%s</string>
	<key>ProgramArguments</key>
	<array>
		<string>%s</string>
	</array>
	<key>RunAtLoad</key>
	<true/>
	<key>KeepAlive</key>
	<false/>
</dict>
</plist>
""" % [LABEL, exe.xml_escape()]


## Nội dung file .desktop cho Linux (XDG autostart).
static func desktop_entry(exe: String) -> String:
	return """[Desktop Entry]
Type=Application
Name=%s
Comment=Bạn đồng hành trên màn hình
Exec="%s"
Terminal=false
X-GNOME-Autostart-enabled=true
""" % [APP_NAME, exe]


static func _exe() -> String:
	return OS.get_executable_path()


static func _entry_path() -> String:
	var base := dir_override
	if base == "":
		var home := OS.get_environment("HOME")
		base = home.path_join("Library/LaunchAgents") if OS.get_name() == "macOS" else home.path_join(".config/autostart")
	var fname := LABEL + ".plist" if OS.get_name() == "macOS" else "deskbuddy.desktop"
	return base.path_join(fname)
