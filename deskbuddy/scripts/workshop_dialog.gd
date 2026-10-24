class_name WorkshopDialog
extends Window
## Cửa sổ Workshop: tạo nhân vật từ ảnh bất kỳ hoặc ghép từ bộ phận.
## Kết quả ghi vào user://packs/<id>/ và phát tín hiệu pack_created.

signal pack_created(id: String)

const TAB_IMAGE := 0
const TAB_SHAPE := 1
const TAB_STEAM := 2

var _tabs: TabContainer
# tab ảnh
var _img_path := ""
var _img_source: Image
var _img_result: Image
var _img_preview: TextureRect
var _img_path_label: Label
var _img_remove_bg: CheckBox
var _img_tolerance: HSlider
var _img_meta := {}
var _img_create: Button
var _img_file_dialog: FileDialog
# tab ghép hình
var _shape_opts := {}
var _shape_preview: Control
var _shape_body: TextureRect
var _shape_face: TextureRect
var _shape_hand_l: TextureRect
var _shape_hand_r: TextureRect
var _shape_meta := {}
# tab Steam
var _steam_service: WorkshopService
var _get_pack: Callable
var _capture_preview: Callable
var _steam_status: Label
var _steam_sync_result: Label
var _steam_title: LineEdit
var _steam_desc: TextEdit
var _steam_note: LineEdit
var _steam_upload_btn: Button
var _steam_sync_btn: Button
var _steam_progress: Label


func _ready() -> void:
	title = "Workshop · Tạo nhân vật"
	size = Vector2i(440, 640)
	min_size = Vector2i(380, 520)
	theme = UiTheme.make_theme()
	close_requested.connect(hide)

	var bg := PanelContainer.new()
	bg.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	bg.add_theme_stylebox_override("panel", UiTheme.card(Color(0.13, 0.14, 0.18), 0, 12, Color.TRANSPARENT, 0))
	add_child(bg)

	_tabs = TabContainer.new()
	bg.add_child(_tabs)
	_tabs.add_child(_build_image_tab())
	_tabs.add_child(_build_shape_tab())
	_tabs.add_child(_build_steam_tab())
	_tabs.set_tab_title(0, "Từ ảnh")
	_tabs.set_tab_title(1, "Ghép hình")
	_tabs.set_tab_title(2, "Steam Workshop")


## Nối với dịch vụ Workshop; get_pack trả BuddyPack hiện tại,
## capture_preview(path) chụp nhân vật ra PNG.
func setup_steam(service: WorkshopService, get_pack: Callable, capture_preview: Callable) -> void:
	_steam_service = service
	_get_pack = get_pack
	_capture_preview = capture_preview
	if service != null:
		service.upload_finished.connect(_on_upload_finished)
		service.upload_progress.connect(_on_upload_progress)
		service.sync_finished.connect(_on_sync_finished)
	_refresh_steam_tab()


func open(tab: int) -> void:
	_tabs.current_tab = tab
	if tab == TAB_STEAM:
		_refresh_steam_tab()
	if not visible:
		popup_centered()
	else:
		grab_focus()


# ---------- chung ----------

func _label(text: String, dim := false) -> Label:
	var l := Label.new()
	l.text = text
	if dim:
		l.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		l.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	UiTheme.apply_font(l, UiTheme.body(600 if not dim else 500), 13 if not dim else 11, UiTheme.TEXT if not dim else UiTheme.TEXT_DIM)
	return l


func _heading(text: String) -> Label:
	var l := Label.new()
	l.text = text
	UiTheme.apply_font(l, UiTheme.title(700), 18, UiTheme.TEXT)
	return l


## Form chung: tên, tính cách, tên món ăn, nhãn 3 thanh. Trả dict các control.
func _build_meta_form(parent: Control, default_name: String) -> Dictionary:
	var m := {}
	var grid := GridContainer.new()
	grid.columns = 2
	grid.add_theme_constant_override("h_separation", 10)
	grid.add_theme_constant_override("v_separation", 6)
	parent.add_child(grid)

	grid.add_child(_label("Tên"))
	var name_edit := LineEdit.new()
	name_edit.text = default_name
	name_edit.placeholder_text = "Ví dụ: Củ Khoai"
	name_edit.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	grid.add_child(name_edit)
	m["name"] = name_edit

	grid.add_child(_label("Tính cách"))
	var pers := OptionButton.new()
	for id in Personality.ARCHETYPES.keys():
		pers.add_item(Personality.ARCHETYPES[id]["name"])
		pers.set_item_metadata(pers.item_count - 1, id)
	pers.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	grid.add_child(pers)
	m["personality"] = pers

	var fields := [
		["food", "Món ăn", "Ví dụ: Trà sữa"],
		["energy", "Thanh 1 (đói)", "Ví dụ: Nước"],
		["mood", "Thanh 2 (vui)", "Ví dụ: Nắng"],
		["bond", "Thanh 3 (gắn kết)", "Ví dụ: Độ giòn"],
	]
	for f in fields:
		grid.add_child(_label(f[1]))
		var e := LineEdit.new()
		e.placeholder_text = f[2]
		e.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		grid.add_child(e)
		m[f[0]] = e
	return m


func _meta_to_dict(m: Dictionary, kind: String) -> Dictionary:
	var name: String = m["name"].text.strip_edges()
	if name == "":
		name = "Bạn mới"
	var pers: OptionButton = m["personality"]
	var pid := str(pers.get_item_metadata(pers.selected)) if pers.selected >= 0 else Personality.DEFAULT_ARCHETYPE
	var needs := {}
	var energy := {}
	if m["energy"].text.strip_edges() != "":
		energy["label"] = m["energy"].text.strip_edges()
	if m["food"].text.strip_edges() != "":
		energy["food"] = m["food"].text.strip_edges()
	if not energy.is_empty():
		needs["energy"] = energy
	for key in ["mood", "bond"]:
		if m[key].text.strip_edges() != "":
			needs[key] = {"label": m[key].text.strip_edges()}
	return {
		"format": BuddyPack.FORMAT_VERSION,
		"id": PackLoader.unique_id(name),
		"name": name,
		"author": "Workshop",
		"version": "1.0.0",
		"kind": kind,
		"personality": pid,
		"needs": needs,
	}


## ScrollContainer > MarginContainer > VBoxContainer, nội dung giãn hết chiều ngang.
func _make_scroll() -> ScrollContainer:
	var scroll := ScrollContainer.new()
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	var margin := MarginContainer.new()
	margin.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	margin.add_theme_constant_override("margin_right", 8)
	margin.add_theme_constant_override("margin_bottom", 16)
	margin.add_theme_constant_override("margin_top", 4)
	scroll.add_child(margin)
	var v := VBoxContainer.new()
	v.add_theme_constant_override("separation", 8)
	v.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	margin.add_child(v)
	return scroll


# ---------- Tab 1: từ ảnh ----------

func _build_image_tab() -> Control:
	var scroll := _make_scroll()
	var v: VBoxContainer = scroll.get_child(0).get_child(0)

	v.add_child(_heading("Biến ảnh bất kỳ thành bạn đồng hành"))
	v.add_child(_label("Meme, ảnh mèo nhà bạn, củ khoai thật... PNG hoặc JPG. Engine tự tạo chuyển động và cảm xúc.", true))

	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 8)
	var pick := Button.new()
	pick.text = "Chọn ảnh…"
	pick.pressed.connect(_on_pick_image)
	row.add_child(pick)
	_img_path_label = _label("Chưa chọn ảnh", true)
	_img_path_label.autowrap_mode = TextServer.AUTOWRAP_OFF
	_img_path_label.clip_text = true
	_img_path_label.custom_minimum_size = Vector2(140, 0)
	_img_path_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	row.add_child(_img_path_label)
	v.add_child(row)

	var preview_box := PanelContainer.new()
	preview_box.add_theme_stylebox_override("panel", UiTheme.card(Color(1, 1, 1, 0.06), 10, 6, UiTheme.PANEL_LINE, 0))
	_img_preview = TextureRect.new()
	_img_preview.custom_minimum_size = Vector2(0, 150)
	_img_preview.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	_img_preview.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	preview_box.add_child(_img_preview)
	v.add_child(preview_box)

	_img_remove_bg = CheckBox.new()
	_img_remove_bg.text = "Xoá nền (lấy màu ở 4 góc ảnh)"
	_img_remove_bg.button_pressed = true
	_img_remove_bg.toggled.connect(func(_on: bool) -> void: _refresh_image_preview())
	v.add_child(_img_remove_bg)
	var tol_row := HBoxContainer.new()
	tol_row.add_child(_label("Độ nhạy", true))
	_img_tolerance = HSlider.new()
	_img_tolerance.min_value = 0.02
	_img_tolerance.max_value = 0.45
	_img_tolerance.step = 0.01
	_img_tolerance.value = 0.12
	_img_tolerance.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_img_tolerance.drag_ended.connect(func(_c: bool) -> void: _refresh_image_preview())
	tol_row.add_child(_img_tolerance)
	v.add_child(tol_row)

	_img_meta = _build_meta_form(v, "")

	_img_create = Button.new()
	_img_create.text = "Tạo nhân vật"
	_img_create.disabled = true
	_img_create.pressed.connect(_on_create_image)
	v.add_child(_img_create)

	_img_file_dialog = FileDialog.new()
	_img_file_dialog.file_mode = FileDialog.FILE_MODE_OPEN_FILE
	_img_file_dialog.access = FileDialog.ACCESS_FILESYSTEM
	_img_file_dialog.filters = PackedStringArray(["*.png, *.jpg, *.jpeg, *.webp, *.bmp ; Ảnh"])
	_img_file_dialog.use_native_dialog = true
	_img_file_dialog.title = "Chọn ảnh"
	_img_file_dialog.file_selected.connect(_on_image_selected)
	add_child(_img_file_dialog)
	return scroll


func _on_pick_image() -> void:
	_img_file_dialog.popup_centered(Vector2i(700, 500))


func _on_image_selected(path: String) -> void:
	var img := ImageTools.load_any(path)
	if img == null:
		_img_path_label.text = "Không đọc được ảnh"
		_img_create.disabled = true
		return
	_img_path = path
	_img_source = ImageTools.fit(img, ImageTools.MAX_SIDE)
	_img_path_label.text = path.get_file()
	if _img_meta["name"].text.strip_edges() == "":
		_img_meta["name"].text = path.get_file().get_basename().capitalize()
	_refresh_image_preview()


func _refresh_image_preview() -> void:
	if _img_source == null:
		return
	var img := _img_source
	if _img_remove_bg.button_pressed:
		img = ImageTools.remove_background(_img_source, _img_tolerance.value)
	img = ImageTools.trim(img)
	_img_result = img
	_img_preview.texture = ImageTexture.create_from_image(img)
	_img_create.disabled = false


func _on_create_image() -> void:
	if _img_result == null:
		return
	var data := _meta_to_dict(_img_meta, "image")
	data["image"] = "image.png"
	data["display_height"] = 150
	var dir := PackLoader.write_pack(data["id"], data, {"image.png": _img_result})
	if dir != "":
		pack_created.emit(data["id"])
		hide()


# ---------- Tab 2: ghép hình ----------

func _build_shape_tab() -> Control:
	var scroll := _make_scroll()
	var v: VBoxContainer = scroll.get_child(0).get_child(0)

	v.add_child(_heading("Ghép nhân vật từ bộ phận"))
	v.add_child(_label("Thân, màu, mặt và tay. Mặt tự đổi theo tâm trạng, tay đổi theo hành động.", true))

	_shape_preview = Control.new()
	_shape_preview.custom_minimum_size = Vector2(0, 200)
	_shape_body = _preview_part(_shape_preview)
	_shape_hand_l = _preview_part(_shape_preview)
	_shape_hand_r = _preview_part(_shape_preview)
	_shape_hand_r.flip_h = true
	_shape_face = _preview_part(_shape_preview)
	v.add_child(_shape_preview)
	_shape_preview.resized.connect(_layout_shape_preview)

	var grid := GridContainer.new()
	grid.columns = 2
	grid.add_theme_constant_override("h_separation", 10)
	grid.add_theme_constant_override("v_separation", 6)
	v.add_child(grid)
	var choices := [
		["body", "Thân", ShapeParts.SHAPES, ShapeParts.SHAPE_NAMES],
		["color", "Màu", ShapeParts.COLORS, ShapeParts.COLOR_NAMES],
		["face", "Mặt thường ngày", ShapeParts.FACES, ShapeParts.FACE_NAMES],
		["hands", "Tay", ShapeParts.HANDS, ShapeParts.HAND_NAMES],
	]
	for c in choices:
		grid.add_child(_label(c[1]))
		var opt := OptionButton.new()
		for key in c[2]:
			opt.add_item(c[3][key])
			opt.set_item_metadata(opt.item_count - 1, key)
		opt.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		opt.item_selected.connect(func(_i: int) -> void: _refresh_shape_preview())
		grid.add_child(opt)
		_shape_opts[c[0]] = opt
	_shape_opts["body"].select(ShapeParts.SHAPES.find("squircle"))
	_shape_opts["color"].select(ShapeParts.COLORS.find("purple"))

	_shape_meta = _build_meta_form(v, "")

	var create := Button.new()
	create.text = "Tạo nhân vật"
	create.pressed.connect(_on_create_shape)
	v.add_child(create)
	_refresh_shape_preview()
	return scroll


func _preview_part(parent: Control) -> TextureRect:
	var t := TextureRect.new()
	t.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	t.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	t.mouse_filter = Control.MOUSE_FILTER_IGNORE
	parent.add_child(t)
	return t


func _shape_choice() -> Dictionary:
	var d := {}
	for key in _shape_opts.keys():
		var opt: OptionButton = _shape_opts[key]
		d[key] = str(opt.get_item_metadata(opt.selected))
	return d


func _refresh_shape_preview() -> void:
	var sh := _shape_choice()
	_shape_body.texture = PackLoader.load_texture(ShapeParts.body_path(sh["body"], sh["color"]))
	_shape_face.texture = PackLoader.load_texture(ShapeParts.face_path(sh["face"]))
	var hand := PackLoader.load_texture(ShapeParts.hand_path(sh["color"], sh["hands"]))
	_shape_hand_l.texture = hand
	_shape_hand_r.texture = hand
	_layout_shape_preview()


func _layout_shape_preview() -> void:
	var w := _shape_preview.size.x
	var cx := w / 2.0
	var body := 150.0
	var top := 20.0
	_shape_body.position = Vector2(cx - body / 2.0, top)
	_shape_body.size = Vector2(body, body)
	_shape_face.size = Vector2(64, 40)
	_shape_face.position = Vector2(cx - 32, top + body * 0.36)
	var hand := Vector2(36, 40)
	_shape_hand_l.size = hand
	_shape_hand_r.size = hand
	_shape_hand_l.position = Vector2(cx - body / 2.0 - 10, top + body * 0.62)
	_shape_hand_r.position = Vector2(cx + body / 2.0 - 26, top + body * 0.62)


func _on_create_shape() -> void:
	var data := _meta_to_dict(_shape_meta, "shape")
	data["shape"] = _shape_choice()
	var dir := PackLoader.write_pack(data["id"], data)
	if dir != "":
		pack_created.emit(data["id"])
		hide()


# ---------- Tab 3: Steam Workshop ----------

func _build_steam_tab() -> Control:
	var scroll := _make_scroll()
	var v: VBoxContainer = scroll.get_child(0).get_child(0)
	v.add_child(_heading("Steam Workshop"))
	_steam_status = _label("", true)
	v.add_child(_steam_status)

	v.add_child(_heading("Tải về"))
	v.add_child(_label("Subscribe nhân vật trên Steam, app tự tải về và thêm vào menu Đổi nhân vật. Bỏ subscribe thì tự gỡ.", true))
	_steam_sync_btn = Button.new()
	_steam_sync_btn.text = "Đồng bộ ngay"
	_steam_sync_btn.pressed.connect(func() -> void:
		if _steam_service != null:
			_steam_service.sync())
	v.add_child(_steam_sync_btn)
	_steam_sync_result = _label("", true)
	v.add_child(_steam_sync_result)

	v.add_child(_heading("Tải lên nhân vật hiện tại"))
	var grid := GridContainer.new()
	grid.columns = 2
	grid.add_theme_constant_override("h_separation", 10)
	grid.add_theme_constant_override("v_separation", 6)
	v.add_child(grid)
	grid.add_child(_label("Tiêu đề"))
	_steam_title = LineEdit.new()
	_steam_title.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	grid.add_child(_steam_title)
	grid.add_child(_label("Mô tả"))
	_steam_desc = TextEdit.new()
	_steam_desc.custom_minimum_size = Vector2(0, 70)
	_steam_desc.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	grid.add_child(_steam_desc)
	grid.add_child(_label("Ghi chú bản này"))
	_steam_note = LineEdit.new()
	_steam_note.placeholder_text = "Ví dụ: thêm animation ngủ"
	_steam_note.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	grid.add_child(_steam_note)
	_steam_upload_btn = Button.new()
	_steam_upload_btn.text = "Tải lên Workshop"
	_steam_upload_btn.pressed.connect(_on_steam_upload)
	v.add_child(_steam_upload_btn)
	_steam_progress = _label("", true)
	v.add_child(_steam_progress)
	v.add_child(_label("Ảnh xem trước được chụp tự động từ nhân vật đang hiển thị. Lần đầu tải lên, Steam có thể yêu cầu chấp nhận Điều khoản Workshop.", true))
	return scroll


func _refresh_steam_tab() -> void:
	if _steam_status == null:
		return
	var available := _steam_service != null and _steam_service.is_available()
	_steam_status.text = _steam_service.status_text() if _steam_service != null else "Chưa cài GodotSteam (addons/godotsteam). Xem addons/README.md."
	_steam_sync_btn.disabled = not available
	_steam_upload_btn.disabled = not available
	if _get_pack.is_valid():
		var pack: BuddyPack = _get_pack.call()
		if pack != null:
			if _steam_title.text.strip_edges() == "":
				_steam_title.text = pack.name
			if _steam_desc.text.strip_edges() == "":
				_steam_desc.text = pack.description
			var fid := _steam_service.known_file_id(pack.id) if _steam_service != null else 0
			_steam_upload_btn.text = "Cập nhật item #%d" % fid if fid > 0 else "Tải lên Workshop"


func _on_steam_upload() -> void:
	if _steam_service == null or not _get_pack.is_valid():
		return
	var pack: BuddyPack = _get_pack.call()
	if pack == null:
		return
	var preview := ""
	if _capture_preview.is_valid():
		preview = str(_capture_preview.call(ProjectSettings.globalize_path("user://workshop_preview_%s.png" % pack.id)))
	_steam_upload_btn.disabled = true
	_steam_progress.text = "Đang gửi lên Steam…"
	_steam_service.upload(pack, _steam_title.text.strip_edges(), _steam_desc.text.strip_edges(), _steam_note.text.strip_edges(), preview)


func _on_upload_progress(status: int, processed: int, total: int) -> void:
	if total > 0:
		_steam_progress.text = "Đang tải lên… %d%% (trạng thái %d)" % [int(100.0 * processed / total), status]


func _on_upload_finished(ok: bool, file_id: int, message: String) -> void:
	_steam_upload_btn.disabled = not (_steam_service != null and _steam_service.is_available())
	_steam_progress.text = ("%s (item #%d)" % [message, file_id]) if ok else message
	_refresh_steam_tab()


func _on_sync_finished(installed: int, pending: int, removed: int) -> void:
	_steam_sync_result.text = "Đã cài %d, đang tải %d, đã gỡ %d." % [installed, pending, removed]
