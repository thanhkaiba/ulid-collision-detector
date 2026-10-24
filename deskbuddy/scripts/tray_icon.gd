class_name TrayIcon
extends Node
## Biểu tượng khay hệ thống (Windows, macOS, Linux X11) với menu riêng.
## Dùng DisplayServer.create_status_indicator của Godot 4.3.

signal action(id: int)

enum Id { TOGGLE_VISIBLE, FEED, FOCUS, AUTOSTART, QUIT }

var supported := false
var _indicator := -1
var _menu: PopupMenu
var _window_visible := true
var _autostart_on := false
var _autostart_supported := false


func _ready() -> void:
	supported = DisplayServer.has_feature(DisplayServer.FEATURE_STATUS_INDICATOR)
	_menu = PopupMenu.new()
	_menu.id_pressed.connect(func(id: int) -> void: action.emit(id))
	add_child(_menu)
	if not supported:
		return
	var icon := PackLoader.load_texture("res://assets/tray.png")
	if icon == null:
		icon = load("res://icon.svg")
	_indicator = DisplayServer.create_status_indicator(icon, "DeskBuddy", _on_clicked)
	if _indicator < 0:
		supported = false


func _exit_tree() -> void:
	if _indicator >= 0:
		DisplayServer.delete_status_indicator(_indicator)
		_indicator = -1


func set_state(window_visible: bool, autostart_supported: bool, autostart_on: bool) -> void:
	_window_visible = window_visible
	_autostart_supported = autostart_supported
	_autostart_on = autostart_on


func set_tooltip(text: String) -> void:
	if _indicator >= 0:
		DisplayServer.status_indicator_set_tooltip(_indicator, text)


func _rebuild_menu() -> void:
	_menu.clear()
	_menu.add_item("Ẩn nhân vật" if _window_visible else "Hiện nhân vật", Id.TOGGLE_VISIBLE)
	_menu.add_separator()
	_menu.add_item("Cho ăn", Id.FEED)
	_menu.add_item("Bắt đầu tập trung 25 phút", Id.FOCUS)
	_menu.add_separator()
	_menu.add_check_item("Tự khởi động cùng máy", Id.AUTOSTART)
	var idx := _menu.get_item_index(Id.AUTOSTART)
	_menu.set_item_checked(idx, _autostart_on)
	_menu.set_item_disabled(idx, not _autostart_supported)
	_menu.add_separator()
	_menu.add_item("Thoát DeskBuddy", Id.QUIT)


func _on_clicked(_button: int, position: Vector2i) -> void:
	_rebuild_menu()
	_menu.position = position
	_menu.popup()
