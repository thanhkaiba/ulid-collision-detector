class_name UiTheme
extends RefCounted
## Màu, font và stylebox dùng chung cho HUD, bong bóng và menu.
## Font: Nunito (chữ thường) và Baloo 2 (tiêu đề), đều OFL, hỗ trợ tiếng Việt.

const FONT_BODY_PATH := "res://assets/fonts/Nunito-Variable.ttf"
const FONT_TITLE_PATH := "res://assets/fonts/Baloo2-Variable.ttf"
## OpenType tag 'wght' (trục độ đậm của font biến thiên) = 0x77676874.
const WGHT_TAG := 2003265652

const INK := Color(0.13, 0.14, 0.18)
const INK_SOFT := Color(0.13, 0.14, 0.18, 0.65)
const PAPER := Color(1.0, 1.0, 1.0, 0.98)
const PANEL := Color(0.10, 0.11, 0.15, 0.94)
const PANEL_LINE := Color(1, 1, 1, 0.08)
const TEXT := Color(0.96, 0.96, 0.98)
const TEXT_DIM := Color(0.96, 0.96, 0.98, 0.62)
const ACCENT := Color(0.56, 0.78, 1.0)
const SHADOW := Color(0, 0, 0, 0.32)

const BAR_COLORS := {
	"energy": Color(1.0, 0.74, 0.30),
	"mood": Color(0.42, 0.86, 0.60),
	"bond": Color(0.98, 0.50, 0.66),
}

static var _fonts := {}


## weight: 400 thường, 600 đậm vừa, 700 đậm.
static func body(weight := 500) -> Font:
	return _font(FONT_BODY_PATH, weight)


static func title(weight := 700) -> Font:
	return _font(FONT_TITLE_PATH, weight)


static func _font(path: String, weight: int) -> Font:
	var key := "%s@%d" % [path, weight]
	if _fonts.has(key):
		return _fonts[key]
	var base: Font = null
	if ResourceLoader.exists(path):
		base = load(path)
	if base == null:
		# Font chưa import (chạy headless lần đầu) → dùng font mặc định.
		_fonts[key] = null
		return null
	var fv := FontVariation.new()
	fv.base_font = base
	fv.variation_opentype = {WGHT_TAG: weight}
	_fonts[key] = fv
	return fv


static func apply_font(ctrl: Control, font: Font, size: int, color := Color.TRANSPARENT) -> void:
	if font != null:
		ctrl.add_theme_font_override("font", font)
	ctrl.add_theme_font_size_override("font_size", size)
	if color != Color.TRANSPARENT:
		ctrl.add_theme_color_override("font_color", color)


static func card(bg: Color, radius := 14, margin := 12, line := Color.TRANSPARENT, shadow := 8) -> StyleBoxFlat:
	var sb := StyleBoxFlat.new()
	sb.bg_color = bg
	sb.set_corner_radius_all(radius)
	sb.set_content_margin_all(margin)
	if line != Color.TRANSPARENT:
		sb.border_color = line
		sb.set_border_width_all(1)
	if shadow > 0:
		sb.shadow_color = SHADOW
		sb.shadow_size = shadow
		sb.shadow_offset = Vector2(0, 3)
	sb.anti_aliasing = true
	return sb


static func pill(color: Color, radius := 6) -> StyleBoxFlat:
	var sb := StyleBoxFlat.new()
	sb.bg_color = color
	sb.set_corner_radius_all(radius)
	sb.set_content_margin_all(0)
	return sb


## Theme gốc cho cả cây: menu chuột phải cũng ăn font này.
static func make_theme() -> Theme:
	var t := Theme.new()
	var f := body(600)
	if f != null:
		t.default_font = f
	t.default_font_size = 14
	var menu_bg := card(PANEL, 10, 6, PANEL_LINE, 6)
	t.set_stylebox("panel", "PopupMenu", menu_bg)
	t.set_stylebox("hover", "PopupMenu", pill(Color(1, 1, 1, 0.10), 6))
	t.set_color("font_color", "PopupMenu", TEXT)
	t.set_color("font_hover_color", "PopupMenu", Color.WHITE)
	t.set_color("font_disabled_color", "PopupMenu", TEXT_DIM)
	t.set_color("font_separator_color", "PopupMenu", TEXT_DIM)
	t.set_constant("v_separation", "PopupMenu", 6)
	t.set_constant("item_start_padding", "PopupMenu", 10)
	t.set_constant("item_end_padding", "PopupMenu", 14)
	var sep := StyleBoxLine.new()
	sep.color = PANEL_LINE
	sep.thickness = 1
	t.set_stylebox("separator", "PopupMenu", sep)
	return t
