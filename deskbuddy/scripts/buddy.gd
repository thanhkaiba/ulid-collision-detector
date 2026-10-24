class_name Buddy
extends Node2D
## Nhân vật trên màn hình: hiển thị, animation, bong bóng nói, kéo thả cửa sổ.
## Logic nhu cầu và tính cách nằm ở Main; node này chỉ hiển thị và nhận input.
##
## Hai cách hiển thị:
##   - kind sprite2d: AnimatedSprite2D từ sheet của pack.
##   - kind image/shape: cây Sprite2D (bóng, thân, mặt, tay) + EmoteOverlay,
##     chuyển động tính bằng sin theo trạng thái, không cần frame vẽ sẵn.

signal clicked()
signal menu_requested()
signal drag_finished()

const DRAG_THRESHOLD := 4.0
const SHAPE_BODY_SCALE := 0.9
const SHAPE_BODY_PX := 160.0

var pack: BuddyPack
var sprite: AnimatedSprite2D
var bubble: SpeechBubble
var view: Node2D
var emote: EmoteOverlay

var _shadow: Sprite2D
var _body: Sprite2D
var _face: Sprite2D
var _eye_l: Sprite2D
var _eye_r: Sprite2D
var _mouth: Sprite2D
var _hand_l: Sprite2D
var _hand_r: Sprite2D
var _view_size := Vector2(128, 128)
var _shadow_scale := 1.0

var _procedural := false
var _anim := "idle"
var _t := 0.0
var _base_state := "idle"
var _temp_anim := ""
var _temp_timer: Timer
var _dragging := false
var _drag_mouse_origin := Vector2i.ZERO
var _drag_window_origin := Vector2i.ZERO
var _drag_moved := false
var _hovered := false


func _ready() -> void:
	_shadow = Sprite2D.new()
	_shadow.texture = PackLoader.load_texture(ShapeParts.part_path("shadow"))
	_shadow.modulate = Color(1, 1, 1, 0.55)
	_shadow.position = Vector2(0, -2)
	add_child(_shadow)

	sprite = AnimatedSprite2D.new()
	sprite.centered = true
	add_child(sprite)

	view = Node2D.new()
	add_child(view)
	_body = _make_sprite(view)
	_face = _make_sprite(view)
	_eye_l = _make_sprite(view)
	_eye_r = _make_sprite(view)
	_mouth = _make_sprite(view)
	_hand_l = _make_sprite(view)
	_hand_r = _make_sprite(view)
	_hand_r.flip_h = true
	emote = EmoteOverlay.new()
	view.add_child(emote)

	bubble = SpeechBubble.new()
	add_child(bubble)

	_temp_timer = Timer.new()
	_temp_timer.one_shot = true
	_temp_timer.timeout.connect(_on_temp_timeout)
	add_child(_temp_timer)


func _make_sprite(parent: Node) -> Sprite2D:
	var s := Sprite2D.new()
	s.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
	parent.add_child(s)
	return s


func setup(new_pack: BuddyPack) -> void:
	pack = new_pack
	_procedural = pack.is_procedural()
	sprite.visible = not _procedural
	view.visible = _procedural
	_t = 0.0
	match pack.kind:
		"image":
			_setup_image()
		"shape":
			_setup_shape()
		_:
			_setup_sheet()
	_shadow.scale = Vector2(_shadow_scale, _shadow_scale)
	bubble.anchor = Vector2(0, -_view_size.y - 10)
	_temp_anim = ""
	_play(_base_state)


func _setup_sheet() -> void:
	var frames := PackLoader.build_sprite_frames(pack)
	if frames == null:
		push_warning("Pack '%s' không có sprite, dùng ảnh dự phòng." % pack.id)
		frames = PlaceholderArt.build(pack.fallback_color, pack.frame_size.x)
	sprite.sprite_frames = frames
	sprite.scale = Vector2(pack.scale, pack.scale)
	sprite.texture_filter = (CanvasItem.TEXTURE_FILTER_NEAREST if pack.filter == "nearest"
		else CanvasItem.TEXTURE_FILTER_LINEAR)
	_view_size = Vector2(pack.frame_size) * pack.scale
	# Neo chân nhân vật vào gốc node.
	sprite.position = Vector2(0, -_view_size.y / 2.0)
	_shadow_scale = 0.0


func _setup_image() -> void:
	var tex := PackLoader.load_texture(pack.image_full_path())
	if tex == null:
		push_warning("Pack '%s': không đọc được ảnh %s" % [pack.id, pack.image_full_path()])
		tex = PlaceholderArt.build(pack.fallback_color, 64).get_frame_texture("idle", 0)
	var s := pack.display_height / float(tex.get_height())
	s = minf(s, 230.0 / float(tex.get_width()))
	_body.texture = tex
	_body.scale = Vector2(s, s)
	_body.offset = Vector2(0, -tex.get_height() / 2.0)
	_body.position = Vector2.ZERO
	_view_size = Vector2(tex.get_size()) * s
	for n in [_face, _eye_l, _eye_r, _mouth, _hand_l, _hand_r]:
		n.visible = false
	_shadow_scale = clampf(_view_size.x * 0.95 / 96.0, 0.5, 2.5)
	emote.head = Vector2(_view_size.x * 0.25, -_view_size.y)
	emote.eye = Vector2(_view_size.x * 0.18, -_view_size.y * 0.72)
	emote.mouth = Vector2(0, -_view_size.y * 0.42)


func _setup_shape() -> void:
	var sh: Dictionary = pack.shape
	_body.texture = PackLoader.load_texture(ShapeParts.body_path(sh["body"], sh["color"]))
	_body.scale = Vector2(SHAPE_BODY_SCALE, SHAPE_BODY_SCALE)
	_body.offset = Vector2(0, -SHAPE_BODY_PX / 2.0)
	_body.position = Vector2.ZERO
	var body_px := SHAPE_BODY_PX * SHAPE_BODY_SCALE
	_face.visible = true
	_face.scale = Vector2(0.6, 0.6)
	_face.position = Vector2(0, -body_px * 0.53)
	var eye_tex := PackLoader.load_texture(ShapeParts.part_path("facial_part_eye_closed_down"))
	for e in [_eye_l, _eye_r]:
		e.texture = eye_tex
		e.scale = Vector2(0.55, 0.55)
	_eye_l.position = Vector2(-14, -body_px * 0.56)
	_eye_r.position = Vector2(14, -body_px * 0.56)
	_mouth.texture = PackLoader.load_texture(ShapeParts.part_path("facial_part_mouth_smirk"))
	_mouth.scale = Vector2(0.5, 0.5)
	_mouth.position = Vector2(0, -body_px * 0.42)
	for h in [_hand_l, _hand_r]:
		h.visible = true
		h.scale = Vector2(0.5, 0.5)
	_view_size = Vector2(body_px + 44, body_px + 8)
	_shadow_scale = 1.45
	emote.head = Vector2(0, -body_px - 4)
	emote.eye = Vector2(18, -body_px * 0.58)
	emote.mouth = Vector2(0, -body_px * 0.42)


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


## Hình chữ nhật nhân vật trong toạ độ cục bộ (gốc ở chân).
func get_rect() -> Rect2:
	return Rect2(Vector2(-_view_size.x / 2.0, -_view_size.y), _view_size)


func get_global_rect() -> Rect2:
	var r := get_rect()
	return Rect2(to_global(r.position), r.size)


func _play(anim: String) -> void:
	if pack == null:
		return
	_anim = pack.resolve_animation(anim)
	if _procedural:
		_apply_procedural(_anim)
		return
	if sprite.sprite_frames == null:
		return
	if sprite.animation != _anim or not sprite.is_playing():
		sprite.play(_anim)


func _apply_procedural(anim: String) -> void:
	var e := ""
	match anim:
		"sleep": e = "zzz"
		"sad": e = "tear"
		"hungry": e = "sweat"
		"eat": e = "mouth"
		"happy": e = "blush"
		"excited": e = "hearts"
	emote.set_emote(e)
	if pack.kind != "shape":
		return
	var sh: Dictionary = pack.shape
	var sleeping := anim == "sleep"
	_face.visible = not sleeping
	_eye_l.visible = sleeping
	_eye_r.visible = sleeping
	_mouth.visible = sleeping
	if not sleeping:
		var f := str(ShapeParts.STATE_FACE.get(anim, ""))
		if f == "":
			f = sh["face"]
		_face.texture = PackLoader.load_texture(ShapeParts.face_path(f))
	var hands: Array = ShapeParts.STATE_HANDS.get(anim, ShapeParts.STATE_HANDS["idle"])
	_hand_l.texture = PackLoader.load_texture(ShapeParts.hand_path(sh["color"], hands[0]))
	_hand_r.texture = PackLoader.load_texture(ShapeParts.hand_path(sh["color"], hands[1]))
	var body_px := SHAPE_BODY_PX * SHAPE_BODY_SCALE
	if anim == "excited":
		_hand_l.position = Vector2(-body_px * 0.42, -body_px * 0.95)
		_hand_r.position = Vector2(body_px * 0.42, -body_px * 0.95)
	elif anim == "eat":
		_hand_l.position = Vector2(-body_px * 0.36, -body_px * 0.22)
		_hand_r.position = Vector2(body_px * 0.18, -body_px * 0.42)
	else:
		_hand_l.position = Vector2(-body_px * 0.36, -body_px * 0.22)
		_hand_r.position = Vector2(body_px * 0.36, -body_px * 0.22)


func _process(delta: float) -> void:
	if not _procedural or pack == null:
		return
	_t += delta
	var bob := 0.0
	var sx := 1.0
	var sy := 1.0
	var rot := 0.0
	var dx := 0.0
	match _anim:
		"idle":
			bob = sin(_t * 2.0) * 2.0
			sy = 1.0 + sin(_t * 2.0) * 0.015
			sx = 1.0 - sin(_t * 2.0) * 0.01
		"happy":
			bob = absf(sin(_t * 5.0)) * 5.0
			sy = 1.0 + sin(_t * 5.0) * 0.02
		"sad":
			rot = -0.06
			sy = 0.97
			bob = sin(_t * 1.5) * 1.0
		"hungry":
			dx = sin(_t * 14.0) * 1.5
			sy = 0.98
		"sleep":
			sy = 0.95 + sin(_t * 1.2) * 0.012
			sx = 1.03
			if pack.kind == "image":
				rot = 0.12
		"eat":
			sy = 1.0 + sin(_t * 8.0) * 0.03
			sx = 1.0 - sin(_t * 8.0) * 0.02
		"excited":
			bob = absf(sin(_t * 7.0)) * 10.0
			rot = sin(_t * 7.0) * 0.07
	view.position = Vector2(dx, -bob)
	view.scale = Vector2(sx, sy)
	view.rotation = rot
	var ss := _shadow_scale * (1.0 - bob * 0.012)
	_shadow.scale = Vector2(ss, ss)


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
