class_name SpeechBubble
extends PanelContainer
## Bong bóng lời nói nổi trên đầu nhân vật, tự ẩn sau vài giây.

var _label: Label
var _timer: Timer


func _ready() -> void:
	visible = false
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	custom_minimum_size = Vector2(120, 0)
	var style := StyleBoxFlat.new()
	style.bg_color = Color(1, 1, 1, 0.95)
	style.border_color = Color(0.15, 0.15, 0.15, 1)
	style.set_border_width_all(2)
	style.set_corner_radius_all(10)
	style.set_content_margin_all(8)
	add_theme_stylebox_override("panel", style)

	_label = Label.new()
	_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_label.custom_minimum_size = Vector2(180, 0)
	_label.add_theme_color_override("font_color", Color(0.1, 0.1, 0.1))
	_label.add_theme_font_size_override("font_size", 14)
	add_child(_label)

	_timer = Timer.new()
	_timer.one_shot = true
	_timer.timeout.connect(func() -> void: visible = false)
	add_child(_timer)


func say(text: String, seconds := 4.0) -> void:
	if text.strip_edges() == "":
		return
	_label.text = text
	visible = true
	_timer.start(seconds)
	# Đợi layout rồi canh giữa theo chiều ngang quanh điểm neo.
	await get_tree().process_frame
	position.x = -size.x / 2.0
	position.y = -size.y
