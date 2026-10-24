extends SceneTree
## Kiểm tra ActivityProbe (GDExtension) không cần UI.
## Chạy:  godot --path . -s tools/probe_check.gd -- [giây]
## In backend, số phím đếm được và idle. Thoát mã 0 nếu lớp tồn tại.

var _probe: Object
var _seconds := 3.0
var _t := 0.0
var _keys := 0
var _min_idle := 1e9


func _initialize() -> void:
	var args := OS.get_cmdline_user_args()
	if args.size() >= 1:
		_seconds = float(args[0])
	if not ClassDB.class_exists("ActivityProbe"):
		print("PROBE class missing")
		quit(1)
		return
	_probe = ClassDB.instantiate("ActivityProbe")
	print("PROBE backend=", _probe.backend_name(), " supported=", _probe.is_supported())


func _process(delta: float) -> bool:
	if _probe == null:
		return true
	_t += delta
	_probe.poll()
	_keys += int(_probe.take_key_presses())
	_min_idle = minf(_min_idle, float(_probe.get_idle_seconds()))
	if _t >= _seconds:
		print("PROBE keys=", _keys, " min_idle=%.3f since_key=%.3f" % [_min_idle, float(_probe.get_seconds_since_key())])
		quit(0)
		return true
	return false
