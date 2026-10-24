class_name Buddy
extends Node2D
## Nhân vật trên màn hình: sprite, animation, bong bóng nói, kéo thả cửa sổ.
## Logic nhu cầu và tính cách nằm ở Main; node này chỉ hiển thị và nhận input.

signal clicked()
signal menu_requested()
signal drag_finished()

const DRAG_THRESHOLD := 4.0

var pack: BuddyPack
var sprite: AnimatedSprite2D
var bubble: SpeechBubble

var _base_state := "idle"
var _temp_anim := ""
var _temp_timer: Timer
var _dragging := false
var _drag_mouse_origin := Vector2i.ZERO
var _drag_window_origin := Vector2i.ZERO
var _drag_moved := false
var _hovered := false


func _ready() -> void:
	sprite = AnimatedSprite2D.new()
	sprite.centered = true
	add_child(sprite)

	bubble = SpeechBubble.new()
	add_child(bubble)

	_temp_timer = Timer.new()
	_temp_timer.one_shot = true
	_temp_timer.timeout.connect(_on_temp_timeout)
	add_child(_temp_timer)


func setup(new_pack: BuddyPack) -> void:
	pack = new_pack
	var frames := PackLoader.build_sprite_frames(pack)
	if frames == null:
		push_warning("Pack '%s' không có sprite, dùng ảnh dự phòng." % pack.id)
		frames = PlaceholderArt.build(pack.fallback_color, pack.frame_size.x)
	sprite.sprite_frames = frames
	sprite.scale = Vector2(pack.scale, pack.scale)
	# Neo chân nhân vật vào gốc node.
	sprite.position = Vector2(0, -pack.frame_size.y * pack.scale / 2.0)
	bubble.position = Vector2(0, -pack.frame_size.y * pack.scale - 10)
	_temp_anim = ""
	_play(_base_state)


## Trạng thái nền (idle/happy/sad/hungry/sleep), do Main quyết định.
func set_base_state(state: String) -> void:
	if state == _base_state:
		return
	_base_state = state
	if _temp_anim == "":
		_play(_base_state)


## Chạy tạm một animation (eat, excited...) rồi quay về trạng thái nền.
func play_temp(anim: String, seconds: float) -> void:
	_temp_anim = anim
	_play(anim)
	_temp_timer.start(seconds)


func say(text: String, seconds := 4.0) -> void:
	bubble.say(text, seconds)


func is_hovered() -> bool:
	return _hovered


## Hình chữ nhật nhân vật trong toạ độ cục bộ.
func get_rect() -> Rect2:
	var sz := Vector2(pack.frame_size) * pack.scale if pack != null else Vector2(64, 64)
	return Rect2(Vector2(-sz.x / 2.0, -sz.y), sz)


func get_global_rect() -> Rect2:
	var r := get_rect()
	return Rect2(to_global(r.position), r.size)


func _play(anim: String) -> void:
	if sprite.sprite_frames == null:
		return
	var target := anim
	if not sprite.sprite_frames.has_animation(target):
		target = "idle"
	if sprite.animation != target or not sprite.is_playing():
		sprite.play(target)


func _on_temp_timeout() -> void:
	_temp_anim = ""
	_play(_base_state)


func _input(event: InputEvent) -> void:
	if event is InputEventMouseMotion:
		var inside := get_rect().has_point(get_local_mouse_position())
		_hovered = inside or _dragging
		if _dragging:
			var now := DisplayServer.mouse_get_position()
			var delta := now - _drag_mouse_origin
			if delta.length() > DRAG_THRESHOLD:
				_drag_moved = true
			if _drag_moved:
				get_window().position = _drag_window_origin + delta
		return

	if event is InputEventMouseButton:
		var inside := get_rect().has_point(get_local_mouse_position())
		if event.button_index == MOUSE_BUTTON_LEFT:
			if event.pressed and inside:
				_dragging = true
				_drag_moved = false
				_drag_mouse_origin = DisplayServer.mouse_get_position()
				_drag_window_origin = get_window().position
				get_viewport().set_input_as_handled()
			elif not event.pressed and _dragging:
				_dragging = false
				if _drag_moved:
					drag_finished.emit()
				else:
					clicked.emit()
				get_viewport().set_input_as_handled()
		elif event.button_index == MOUSE_BUTTON_RIGHT and event.pressed and inside:
			menu_requested.emit()
			get_viewport().set_input_as_handled()
