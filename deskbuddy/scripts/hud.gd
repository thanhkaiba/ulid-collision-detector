class_name Hud
extends PanelContainer
## Thẻ trạng thái: tên + tính cách, 3 thanh nhu cầu, đồ ăn, đồng hồ tập trung.
## Hiện khi rê chuột lên nhân vật hoặc khi đang có phiên tập trung.

var _bars := {}
var _labels := {}
var _values := {}
var _name_label: Label
var _chip: Label
var _snacks_label: Label
var _hint_label: Label
var _focus_panel: PanelContainer
var _focus_label: Label


func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_theme_stylebox_override("panel", UiTheme.card(UiTheme.PANEL, 14, 12, UiTheme.PANEL_LINE, 10))
	custom_minimum_size = Vector2(236, 0)

	var vbox := VBoxContainer.new()
	vbox.add_theme_constant_override("separation", 6)
	add_child(vbox)

	var header := HBoxContainer.new()
	header.add_theme_constant_override("separation", 8)
	vbox.add_child(header)
	_name_label = Label.new()
	UiTheme.apply_font(_name_label, UiTheme.title(700), 19, UiTheme.TEXT)
	_name_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	header.add_child(_name_label)
	_chip = Label.new()
	UiTheme.apply_font(_chip, UiTheme.body(700), 11, UiTheme.INK)
	_chip.add_theme_stylebox_override("normal", _chip_style())
	_chip.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	header.add_child(_chip)

	var spacer := Control.new()
	spacer.custom_minimum_size = Vector2(0, 2)
	vbox.add_child(spacer)

	for key in BuddyPack.NEED_KEYS:
		var row := HBoxContainer.new()
		row.add_theme_constant_override("separation", 8)
		var lbl := Label.new()
		lbl.custom_minimum_size = Vector2(76, 0)
		UiTheme.apply_font(lbl, UiTheme.body(600), 12, UiTheme.TEXT_DIM)
		var bar := ProgressBar.new()
		bar.min_value = 0
		bar.max_value = 100
		bar.show_percentage = false
		bar.custom_minimum_size = Vector2(0, 10)
		bar.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		bar.size_flags_vertical = Control.SIZE_SHRINK_CENTER
		bar.add_theme_stylebox_override("fill", UiTheme.pill(UiTheme.BAR_COLORS[key], 5))
		bar.add_theme_stylebox_override("background", UiTheme.pill(Color(1, 1, 1, 0.10), 5))
		var val := Label.new()
		val.custom_minimum_size = Vector2(26, 0)
		val.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
		UiTheme.apply_font(val, UiTheme.body(700), 11, UiTheme.TEXT_DIM)
		row.add_child(lbl)
		row.add_child(bar)
		row.add_child(val)
		vbox.add_child(row)
		_bars[key] = bar
		_labels[key] = lbl
		_values[key] = val

	var sep := HSeparator.new()
	var sep_style := StyleBoxLine.new()
	sep_style.color = UiTheme.PANEL_LINE
	sep.add_theme_stylebox_override("separator", sep_style)
	vbox.add_child(sep)

	_snacks_label = Label.new()
	UiTheme.apply_font(_snacks_label, UiTheme.body(700), 13, UiTheme.TEXT)
	vbox.add_child(_snacks_label)
	_hint_label = Label.new()
	UiTheme.apply_font(_hint_label, UiTheme.body(500), 11, UiTheme.TEXT_DIM)
	vbox.add_child(_hint_label)

	_focus_panel = PanelContainer.new()
	_focus_panel.add_theme_stylebox_override("panel", UiTheme.card(Color(UiTheme.ACCENT, 0.16), 8, 6, Color(UiTheme.ACCENT, 0.35), 0))
	_focus_label = Label.new()
	_focus_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	UiTheme.apply_font(_focus_label, UiTheme.body(700), 13, UiTheme.ACCENT)
	_focus_panel.add_child(_focus_label)
	_focus_panel.visible = false
	vbox.add_child(_focus_panel)


func set_pack(pack: BuddyPack) -> void:
	_name_label.text = pack.name
	_chip.text = " %s " % Personality.get_archetype(pack.personality)["name"]
	for key in BuddyPack.NEED_KEYS:
		_labels[key].text = pack.need_label(key)
	_hint_label.text = "Mỗi phiên tập trung 25' = +1 %s" % pack.food_name().to_lower()


func update_needs(needs: BuddyNeeds, snacks: int, food_name: String) -> void:
	var vals := {"energy": needs.energy, "mood": needs.mood, "bond": needs.bond}
	for key in BuddyPack.NEED_KEYS:
		_bars[key].value = vals[key]
		_values[key].text = str(int(round(vals[key])))
	_snacks_label.text = "%s  ×%d" % [food_name, snacks]


func update_focus(session: FocusSession) -> void:
	_focus_panel.visible = session.running
	if session.running:
		_focus_label.text = "Đang tập trung  %s" % session.remaining_text()


static func _chip_style() -> StyleBoxFlat:
	var sb := UiTheme.pill(UiTheme.ACCENT, 8)
	sb.content_margin_left = 6
	sb.content_margin_right = 6
	sb.content_margin_top = 2
	sb.content_margin_bottom = 2
	return sb
