class_name BuddyPack
extends RefCounted
## Dữ liệu một "pack" nhân vật, đọc từ pack.json. Xem docs/PACK_FORMAT.md.

const FORMAT_VERSION := 1
const REQUIRED_ANIMATIONS := ["idle"]
const KNOWN_ANIMATIONS := ["idle", "happy", "sad", "hungry", "sleep", "eat", "excited"]
const NEED_KEYS := ["energy", "mood", "bond"]
const DEFAULT_NEED_LABELS := {
	"energy": {"label": "Năng lượng", "icon": "⚡", "food": "Đồ ăn"},
	"mood": {"label": "Tâm trạng", "icon": "☀", "food": ""},
	"bond": {"label": "Gắn kết", "icon": "♥", "food": ""},
}

var id := ""
var name := ""
var author := ""
var version := "0.0.0"
var description := ""
var kind := "sprite2d"
var personality := Personality.DEFAULT_ARCHETYPE
## Nhãn hiển thị cho 3 thanh: {energy: {label, icon, food}, ...}
var needs := {}
## Mỹ thuật
var sheet_path := ""
var frame_size := Vector2i(64, 64)
var scale := 3.0
## "linear" cho art vector/mượt, "nearest" cho pixel art.
var filter := "linear"
## {anim_name: {frames: [int], fps: float, loop: bool}}
var animations := {}
## Câu nói override: {event: [String]}
var lines := {}
## Màu dự phòng khi thiếu sprite
var fallback_color := Color(0.78, 0.55, 0.29)

var root_dir := ""
var errors: PackedStringArray = []


func is_valid() -> bool:
	return errors.is_empty()


func need_label(key: String) -> String:
	return str(needs.get(key, {}).get("label", DEFAULT_NEED_LABELS[key]["label"]))


func need_icon(key: String) -> String:
	return str(needs.get(key, {}).get("icon", DEFAULT_NEED_LABELS[key]["icon"]))


func food_name() -> String:
	var f := str(needs.get("energy", {}).get("food", ""))
	return f if f != "" else DEFAULT_NEED_LABELS["energy"]["food"]


func has_animation(anim: String) -> bool:
	return animations.has(anim)


## Tên animation thực sự sẽ dùng, lùi về idle nếu pack không có.
func resolve_animation(anim: String) -> String:
	return anim if animations.has(anim) else "idle"


static func from_json(text: String, root: String) -> BuddyPack:
	var pack := BuddyPack.new()
	pack.root_dir = root
	var json := JSON.new()
	var err := json.parse(text)
	if err != OK:
		pack.errors.append("JSON lỗi dòng %d: %s" % [json.get_error_line(), json.get_error_message()])
		return pack
	if not (json.data is Dictionary):
		pack.errors.append("pack.json phải là một object")
		return pack
	pack._read(json.data)
	return pack


func _read(d: Dictionary) -> void:
	var fmt := int(d.get("format", 0))
	if fmt != FORMAT_VERSION:
		errors.append("format phải là %d (nhận %d)" % [FORMAT_VERSION, fmt])

	id = str(d.get("id", "")).strip_edges()
	if id == "" or not _is_slug(id):
		errors.append("id bắt buộc, chỉ gồm a-z, 0-9, '_' hoặc '-'")
	name = str(d.get("name", id))
	author = str(d.get("author", ""))
	version = str(d.get("version", "0.0.0"))
	description = str(d.get("description", ""))
	kind = str(d.get("kind", "sprite2d"))
	if kind != "sprite2d":
		errors.append("kind '%s' chưa hỗ trợ (hiện chỉ có sprite2d)" % kind)

	personality = str(d.get("personality", Personality.DEFAULT_ARCHETYPE))
	if not Personality.has(personality):
		errors.append("personality '%s' không tồn tại. Hợp lệ: %s" % [personality, ", ".join(Personality.ARCHETYPES.keys())])

	var n = d.get("needs", {})
	if n is Dictionary:
		for key in NEED_KEYS:
			if n.has(key) and n[key] is Dictionary:
				needs[key] = n[key]
	else:
		errors.append("needs phải là object")

	var art = d.get("art", {})
	if art is Dictionary:
		_read_art(art)
	else:
		errors.append("art phải là object")

	var l = d.get("lines", {})
	if l is Dictionary:
		for event in l.keys():
			if not Personality.EVENTS.has(event):
				errors.append("lines.%s không phải sự kiện hợp lệ" % event)
			elif l[event] is Array:
				lines[event] = l[event]
	else:
		errors.append("lines phải là object")

	var fc = d.get("fallback_color", "")
	if fc is String and fc != "":
		fallback_color = Color.html(fc) if Color.html_is_valid(fc) else fallback_color


func _read_art(art: Dictionary) -> void:
	sheet_path = str(art.get("sheet", "")).strip_edges()
	if sheet_path == "":
		errors.append("art.sheet bắt buộc")
	var fs = art.get("frame_size", [64, 64])
	if fs is Array and fs.size() == 2:
		frame_size = Vector2i(int(fs[0]), int(fs[1]))
	else:
		errors.append("art.frame_size phải là [w, h]")
	if frame_size.x <= 0 or frame_size.y <= 0:
		errors.append("art.frame_size phải dương")
	scale = float(art.get("scale", 3.0))
	if scale <= 0.0:
		errors.append("art.scale phải dương")
	filter = str(art.get("filter", "linear"))
	if filter != "linear" and filter != "nearest":
		errors.append("art.filter phải là 'linear' hoặc 'nearest'")

	var anims = art.get("animations", {})
	if not (anims is Dictionary):
		errors.append("art.animations phải là object")
		return
	for anim_name in anims.keys():
		var a = anims[anim_name]
		if not (a is Dictionary):
			errors.append("art.animations.%s phải là object" % anim_name)
			continue
		var frames = a.get("frames", [])
		if not (frames is Array) or frames.is_empty():
			errors.append("art.animations.%s.frames phải là mảng không rỗng" % anim_name)
			continue
		var clean_frames: Array[int] = []
		for f in frames:
			if int(f) < 0:
				errors.append("art.animations.%s có frame âm" % anim_name)
			clean_frames.append(int(f))
		animations[anim_name] = {
			"frames": clean_frames,
			"fps": maxf(0.1, float(a.get("fps", 4.0))),
			"loop": bool(a.get("loop", true)),
		}
	for req in REQUIRED_ANIMATIONS:
		if not animations.has(req):
			errors.append("Thiếu animation bắt buộc '%s'" % req)


func sheet_full_path() -> String:
	return root_dir.path_join(sheet_path)


static func _is_slug(s: String) -> bool:
	for c in s:
		var ok := (c >= "a" and c <= "z") or (c >= "0" and c <= "9") or c == "_" or c == "-"
		if not ok:
			return false
	return true
