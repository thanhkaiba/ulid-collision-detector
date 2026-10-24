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
	if _frames == _target:
		var img := root.get_texture().get_image()
		var err := img.save_png(_out)
		print("screenshot %s -> %s (%dx%d)" % [error_string(err), _out, img.get_width(), img.get_height()])
		quit(0 if err == OK else 1)
	return false
