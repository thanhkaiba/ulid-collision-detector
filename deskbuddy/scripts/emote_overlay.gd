class_name EmoteOverlay
extends Node2D
## Vẽ hiệu ứng cảm xúc lên nhân vật dựng động (kind image/shape):
## zzz, nước mắt, mồ hôi, má hồng, miệng nhai, tim bay.

var emote := ""
## Điểm neo trong toạ độ cục bộ của nhân vật (gốc ở chân).
var head := Vector2(0, -150)
var eye := Vector2(18, -84)
var mouth := Vector2(0, -62)

const TEAR := Color(0.47, 0.75, 1.0)
const BLUSH := Color(1.0, 0.55, 0.6, 0.55)
const INK := Color(0.2, 0.2, 0.25)
const HEART := Color(0.98, 0.45, 0.6)

var _t := 0.0


func set_emote(e: String) -> void:
	if e == emote:
		return
	emote = e
	_t = 0.0
	queue_redraw()


func _process(delta: float) -> void:
	if emote == "":
		return
	_t += delta
	queue_redraw()


func _draw() -> void:
	match emote:
		"zzz":
			var font := UiTheme.title(700)
			if font == null:
				font = ThemeDB.fallback_font
			for i in 3:
				var phase := fmod(_t * 0.6 + i * 0.33, 1.0)
				var pos := head + Vector2(14 + i * 11 + phase * 10, -2 - i * 12 - phase * 22)
				var col := Color(INK, 1.0 - phase * 0.8)
				draw_string(font, pos, "z" if i < 2 else "Z", HORIZONTAL_ALIGNMENT_LEFT, -1, 13 + i * 4, col)
		"tear":
			var dy := fmod(_t * 16.0, 16.0)
			draw_circle(eye + Vector2(3, 7 + dy), 3.0, TEAR)
			draw_circle(eye + Vector2(3, 4 + dy), 1.8, TEAR)
		"sweat":
			var dy := fmod(_t * 10.0, 8.0)
			var p := head + Vector2(26, 14 + dy)
			draw_circle(p, 4.0, TEAR)
			draw_colored_polygon(PackedVector2Array([p + Vector2(-3.5, -1), p + Vector2(3.5, -1), p + Vector2(0, -8)]), TEAR)
		"mouth":
			if fmod(_t, 0.5) < 0.25:
				draw_circle(mouth, 7.0, INK)
				draw_circle(mouth + Vector2(0, 2.5), 4.0, Color(0.9, 0.45, 0.5))
			else:
				draw_line(mouth + Vector2(-5, 0), mouth + Vector2(5, 0), INK, 2.5)
		"blush":
			var a := 0.4 + 0.2 * sin(_t * 4.0)
			draw_circle(eye + Vector2(-2 * eye.x - 6, 10), 5.0, Color(BLUSH, a))
			draw_circle(eye + Vector2(6, 10), 5.0, Color(BLUSH, a))
		"hearts":
			for i in 3:
				var phase := fmod(_t * 0.5 + i * 0.33, 1.0)
				var p := head + Vector2(-24 + i * 24 + sin((phase + i) * 6.0) * 6, -6 - phase * 40)
				_heart(p, 5.0 + i, Color(HEART, 1.0 - phase))


func _heart(p: Vector2, r: float, c: Color) -> void:
	draw_circle(p + Vector2(-r * 0.5, -r * 0.3), r * 0.55, c)
	draw_circle(p + Vector2(r * 0.5, -r * 0.3), r * 0.55, c)
	draw_colored_polygon(PackedVector2Array([
		p + Vector2(-r, -r * 0.15), p + Vector2(r, -r * 0.15), p + Vector2(0, r),
	]), c)
