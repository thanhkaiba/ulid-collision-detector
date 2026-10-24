extends SceneTree
## Chụp ảnh cửa sổ sau vài frame, dùng để kiểm tra hiển thị không cần người.
## Chạy:  godot --path . -s tools/screenshot.gd -- out.png [frames] [pack_id] [hud] [hungry|sad]
## (cần màn hình thật hoặc Xvfb; không chạy được với --headless)

var _frames := 0
var _target := 90
var _out := "screenshot.png"
var _pack_id := ""
var _force_hud := false
var _force_state := ""
var _workshop_tab := -1
var _main: Node


func _initialize() -> void:
	var args := OS.get_cmdline_user_args()
	if args.size() >= 1:
		_out = args[0]
	if args.size() >= 2:
		_target = int(args[1])
	if args.size() >= 3:
		_pack_id = args[2]
	for a in args:
		if a == "hud":
			_force_hud = true
		elif a == "hungry" or a == "sad":
			_force_state = a
		elif a == "workshop_image":
			_workshop_tab = 0
		elif a == "workshop_shape":
			_workshop_tab = 1
		elif a == "create_from_image":
			_workshop_tab = 2
		elif a == "tray":
			_workshop_tab = 3
		elif a == "workshop_steam":
			_workshop_tab = 4
	_main = load("res://scenes/main.tscn").instantiate()
	root.add_child(_main)


func _process(_delta: float) -> bool:
	_frames += 1
	if _frames == 2:
		if _pack_id != "":
			var p = PackLoader.find(_main.packs, _pack_id)
			if p != null:
				_main._apply_pack(p, false)
		_main.debug_force_hud = _force_hud
		if _force_state == "hungry":
			_main.needs.energy = 15.0
		elif _force_state == "sad":
			_main.needs.mood = 15.0
		if _workshop_tab == 2:
			# Luồng đầy đủ: mở Workshop, chọn ảnh, bấm Tạo, nhân vật mới được nạp.
			_main._on_workshop_pressed(2000)
			_main.workshop._img_meta["name"].text = "Thử Nghiệm Ảnh"
			_main.workshop._on_image_selected(ProjectSettings.globalize_path("res://art_src/kenney/platformer/female_jump.png"))
			_main.workshop._on_create_image()
			print("created pack: ", _main.pack.id, " kind=", _main.pack.kind, " name=", _main.pack.name)
		elif _workshop_tab == 3:
			# Mở menu khay (không cần tray thật) và thử bật/tắt tự khởi động.
			print("tray supported: ", _main.tray.supported, " autostart supported: ", Autostart.is_supported())
			_main.tray._on_clicked(1, Vector2i(100, 100))
			print("tray menu items: ", _main.tray._menu.item_count)
			_main._on_tray_action(TrayIcon.Id.AUTOSTART)
			_main._on_tray_action(TrayIcon.Id.TOGGLE_VISIBLE)
			_main._on_tray_action(TrayIcon.Id.TOGGLE_VISIBLE)
			print("hidden flag after toggle x2: ", _main._hidden, " mode: ", root.mode)
		elif _workshop_tab == 4:
			_main._on_workshop_pressed(2004)
			print("steam available: ", _main.workshop_service.is_available(), " status: ", _main.workshop_service.status_text())
			var prev: String = _main.capture_preview(ProjectSettings.globalize_path("user://preview_test.png"))
			print("preview captured: ", prev != "", " exists: ", FileAccess.file_exists(prev))
		elif _workshop_tab >= 0:
			_main._on_workshop_pressed(2000 + _workshop_tab)
	if _frames == _target:
		var vp: Viewport = root
		if (_workshop_tab < 2 or _workshop_tab == 4) and _workshop_tab >= 0 and _main.workshop != null:
			vp = _main.workshop
		if _workshop_tab == 2:
			PackLoader.remove_user_pack(_main.pack.id)
		var img := vp.get_texture().get_image()
		var err := img.save_png(_out)
		print("screenshot %s -> %s (%dx%d)" % [error_string(err), _out, img.get_width(), img.get_height()])
		quit(0 if err == OK else 1)
	return false
