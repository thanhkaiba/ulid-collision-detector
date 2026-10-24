class_name SpeechBubble
extends PanelContainer
## Bong bóng lời nói nổi trên đầu nhân vật, có đuôi, tự ẩn sau vài giây.

## Điểm neo (toạ độ cha): bong bóng canh giữa theo ngang và đuôi chỉ vào điểm này.
var anchor := Vector2.ZERO

const TAIL_H := 10.0
const TAIL_W := 18.0

var _label: Label
var _timer: Timer
var _tail: Polygon2D


func _ready() -> void:
	visible = false
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_theme_stylebox_override("panel", UiTheme.card(UiTheme.PAPER, 14, 10, Color.TRANSPARENT, 8))

	_tail = Polygon2D.new()
	_tail.color = UiTheme.PAPER
	_tail.show_behind_parent = false
	add_child(_tail)

	_label = Label.new()
	_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_label.custom_minimum_size = Vector2(170, 0)
	_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	UiTheme.apply_font(_label, UiTheme.body(600), 14, UiTheme.INK)
	add_child(_label)

	_timer = Timer.new()
	_timer.one_shot = true
	_timer.timeout.connect(func() -> void: visible = false)
	add_child(_timer)
	resized.connect(_update_tail)


func say(text: String, seconds := 4.0) -> void:
	if text.strip_edges() == "":
		return
	_label.text = text
	visible = true
	_timer.start(seconds)
	# Đợi layout rồi đặt bong bóng sao cho đuôi chỉ vào anchor.
	await get_tree().process_frame
	position = anchor + Vector2(-size.x / 2.0, -size.y - TAIL_H)
	_update_tail()


func _update_tail() -> void:
	if _tail == null:
		return
	var cx := size.x / 2.0
	_tail.polygon = PackedVector2Array([
		Vector2(cx - TAIL_W / 2.0, size.y - 1.0),
		Vector2(cx + TAIL_W / 2.0, size.y - 1.0),
		Vector2(cx, size.y + TAIL_H),
	])
