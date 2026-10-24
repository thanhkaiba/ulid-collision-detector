class_name ActivityMonitor
extends Node
## Theo dõi hoạt động của người dùng để nhân vật phản ứng.
##
## Hai backend, tự chọn lúc chạy:
##   - ActivityProbe (GDExtension, gdextension/activity_probe): idle và số lần
##     bấm phím toàn hệ thống. Chỉ đếm, không bao giờ đọc mã phím.
##   - Fallback khi không có extension: chuột toàn hệ thống qua
##     DisplayServer.mouse_get_position(), bàn phím chỉ khi app có focus.
##
## Mọi dữ liệu chỉ nằm trong RAM, không lưu, không gửi đi.

signal user_idle()
signal user_back(seconds_away: float)
signal typing_burst()

@export var idle_after_seconds := 300.0
@export var poll_interval := 0.5
@export var burst_keys := 30
@export var burst_window := 10.0
@export var burst_cooldown := 120.0

var is_idle := false
var last_activity_unix := 0.0
## Tên backend đang dùng, để hiển thị/chẩn đoán.
var backend := "fallback-mouse"
var _probe: Object
var _last_mouse := Vector2i(-99999, -99999)
var _poll_accum := 0.0
var _key_times: Array[float] = []
var _last_burst_unix := 0.0
var _idle_since_unix := 0.0


func _ready() -> void:
	last_activity_unix = Time.get_unix_time_from_system()
	_last_mouse = DisplayServer.mouse_get_position()
	if ClassDB.class_exists("ActivityProbe"):
		var p: Object = ClassDB.instantiate("ActivityProbe")
		if p != null and p.is_supported():
			_probe = p
			backend = "probe:" + str(p.backend_name())
		elif p != null:
			backend = "fallback-mouse (probe: %s)" % str(p.backend_name())
	print("ActivityMonitor backend: ", backend)


func _process(delta: float) -> void:
	_poll_accum += delta
	if _poll_accum < poll_interval:
		return
	_poll_accum = 0.0
	var now := Time.get_unix_time_from_system()
	var pos := DisplayServer.mouse_get_position()
	if pos != _last_mouse:
		_last_mouse = pos
		_mark_activity(now)
	if _probe != null:
		_probe.poll()
		var keys := int(_probe.take_key_presses())
		if keys > 0:
			_mark_activity(now)
			for i in mini(keys, 50):
				_key_times.append(now)
			_check_burst(now)
		var idle := float(_probe.get_idle_seconds())
		if now - idle > last_activity_unix:
			_mark_activity(now - idle)
	if not is_idle and now - last_activity_unix >= idle_after_seconds:
		is_idle = true
		_idle_since_unix = last_activity_unix
		user_idle.emit()


func _input(event: InputEvent) -> void:
	if event is InputEventKey and event.pressed and not event.echo:
		var now := Time.get_unix_time_from_system()
		_mark_activity(now)
		if _probe == null:
			_key_times.append(now)
			_check_burst(now)
	elif event is InputEventMouseButton and event.pressed:
		_mark_activity(Time.get_unix_time_from_system())


func _check_burst(now: float) -> void:
	while not _key_times.is_empty() and now - _key_times[0] > burst_window:
		_key_times.pop_front()
	if _key_times.size() >= burst_keys and now - _last_burst_unix > burst_cooldown:
		_last_burst_unix = now
		_key_times.clear()
		typing_burst.emit()


func seconds_since_activity() -> float:
	return Time.get_unix_time_from_system() - last_activity_unix


func _mark_activity(now: float) -> void:
	last_activity_unix = now
	if is_idle:
		is_idle = false
		user_back.emit(now - _idle_since_unix)
