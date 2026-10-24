class_name Hud
extends PanelContainer
## Bảng nhỏ hiện 3 thanh nhu cầu, số đồ ăn và đồng hồ tập trung.
## Hiện khi rê chuột lên nhân vật hoặc khi đang có phiên tập trung.

var _bars := {}
var _labels := {}
var _snacks_label: Label
var _focus_label: Label
var _title: Label


func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	var style := StyleBoxFlat.new()
	style.bg_color = Color(0.1, 0.1, 0.12, 0.88)
	style.set_corner_radius_all(8)
	style.set_content_margin_all(8)
	add_theme_stylebox_override("panel", style)
	custom_minimum_size = Vector2(200, 0)

	var vbox := VBoxContainer.new()
	vbox.add_theme_constant_override("separation", 4)
	add_child(vbox)

	_title = Label.new()
	_title.add_theme_font_size_override("font_size", 14)
	vbox.add_child(_title)

	for key in BuddyPack.NEED_KEYS:
		var row := HBoxContainer.new()
		var lbl := Label.new()
		lbl.custom_minimum_size = Vector2(90, 0)
		lbl.add_theme_font_size_override("font_size", 12)
		var bar := ProgressBar.new()
		bar.min_value = 0
		bar.max_value = 100
		bar.show_percentage = false
		bar.custom_minimum_size = Vector2(90, 12)
		bar.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		var fill := StyleBoxFlat.new()
		fill.bg_color = _bar_color(key)
		fill.set_corner_radius_all(4)
		bar.add_theme_stylebox_override("fill", fill)
		var bg := StyleBoxFlat.new()
		bg.bg_color = Color(1, 1, 1, 0.12)
		bg.set_corner_radius_all(4)
		bar.add_theme_stylebox_override("background", bg)
		row.add_child(lbl)
		row.add_child(bar)
		vbox.add_child(row)
		_bars[key] = bar
		_labels[key] = lbl

	_snacks_label = Label.new()
	_snacks_label.add_theme_font_size_override("font_size", 12)
	vbox.add_child(_snacks_label)

	_focus_label = Label.new()
	_focus_label.add_theme_font_size_override("font_size", 12)
	_focus_label.add_theme_color_override("font_color", Color(0.6, 0.9, 1.0))
	vbox.add_child(_focus_label)


func set_pack(pack: BuddyPack) -> void:
	_title.text = "%s · %s" % [pack.name, Personality.get_archetype(pack.personality)["name"]]
	for key in BuddyPack.NEED_KEYS:
		_labels[key].text = "%s %s" % [pack.need_icon(key), pack.need_label(key)]


func update_needs(needs: BuddyNeeds, snacks: int, food_name: String) -> void:
	_bars["energy"].value = needs.energy
	_bars["mood"].value = needs.mood
	_bars["bond"].value = needs.bond
	_snacks_label.text = "%s: %d (kiếm bằng phiên tập trung)" % [food_name, snacks]


func update_focus(session: FocusSession) -> void:
	if session.running:
		_focus_label.text = "⏱ Tập trung: %s" % session.remaining_text()
		_focus_label.visible = true
	else:
		_focus_label.visible = false


static func _bar_color(key: String) -> Color:
	match key:
		"energy":
			return Color(0.98, 0.72, 0.25)
		"mood":
			return Color(0.45, 0.85, 0.55)
		_:
			return Color(0.95, 0.45, 0.6)
