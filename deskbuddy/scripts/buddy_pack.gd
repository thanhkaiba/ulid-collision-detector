class_name BuddyPack
extends RefCounted
## Dữ liệu một "pack" nhân vật, đọc từ pack.json. Xem docs/PACK_FORMAT.md.
##
## kind:
##   sprite2d : sprite sheet vẽ sẵn (art.sheet + art.animations)
##   image    : một ảnh tĩnh bất kỳ, engine tự tạo chuyển động và cảm xúc
##   shape    : ghép từ bộ phận Kenney Shape Characters ngay trong app

const FORMAT_VERSION := 1
const KINDS := ["sprite2d", "image", "shape"]
const REQUIRED_ANIMATIONS := ["idle"]
const KNOWN_ANIMATIONS := ["idle", "happy", "sad", "hungry", "sleep", "eat", "excited"]
const NEED_KEYS := ["energy", "mood", "bond"]
const DEFAULT_NEED_LABELS := {
	"energy": {"label": "Năng lượng", "icon": "", "food": "Đồ ăn"},
	"mood": {"label": "Tâm trạng", "icon": "", "food": ""},
	"bond": {"label": "Gắn kết", "icon": "", "food": ""},
}
const DEFAULT_SHAPE := {"body": "squircle", "color": "yellow", "face": "a", "hands": "open"}

var id := ""
var name := ""
var author := ""
var version := "0.0.0"
var description := ""
var kind := "sprite2d"
var personality := Personality.DEFAULT_ARCHETYPE
## Nhãn hiển thị cho 3 thanh: {energy: {label, icon, food}, ...}
var needs := {}
## kind sprite2d
var sheet_path := ""
var frame_size := Vector2i(64, 64)
var scale := 3.0
## "linear" cho art vector/mượt, "nearest" cho pixel art.
var filter := "linear"
## {anim_name: {frames: [int], fps: float, loop: bool}}
var animations := {}
## kind image
var image_path := ""
var display_height := 150.0
## kind shape
var shape := DEFAULT_SHAPE.duplicate()
## Câu nói override: {event: [String]}
var lines := {}
## Màu dự phòng khi thiếu ảnh
var fallback_color := Color(0.78, 0.55, 0.29)

var root_dir := ""
var errors: PackedStringArray = []


func is_valid() -> bool:
	return errors.is_empty()


func is_procedural() -> bool:
	return kind != "sprite2d"


func need_label(key: String) -> String:
	return str(needs.get(key, {}).get("label", DEFAULT_NEED_LABELS[key]["label"]))


func need_icon(key: String) -> String:
	return str(needs.get(key, {}).get("icon", DEFAULT_NEED_LABELS[key]["icon"]))


func food_name() -> String:
	var f := str(needs.get("energy", {}).get("food", ""))
	return f if f != "" else DEFAULT_NEED_LABELS["energy"]["food"]


func has_animation(anim: String) -> bool:
	if is_procedural():
		return KNOWN_ANIMATIONS.has(anim)
	return animations.has(anim)


## Tên animation thực sự sẽ dùng, lùi về idle nếu pack không có.
func resolve_animation(anim: String) -> String:
	return anim if has_animation(anim) else "idle"


func sheet_full_path() -> String:
	return root_dir.path_join(sheet_path)


func image_full_path() -> String:
	return root_dir.path_join(image_path)


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


## Dictionary để ghi ra pack.json (Workshop dùng).
func to_dict() -> Dictionary:
	var d := {
		"format": FORMAT_VERSION,
		"id": id,
		"name": name,
		"author": author,
		"version": version,
		"description": description,
		"kind": kind,
		"personality": personality,
		"needs": needs.duplicate(true),
		"lines": lines.duplicate(true),
	}
	match kind:
		"sprite2d":
			d["art"] = {
				"sheet": sheet_path, "frame_size": [frame_size.x, frame_size.y],
				"scale": scale, "filter": filter, "animations": animations.duplicate(true),
			}
		"image":
			d["image"] = image_path
			d["display_height"] = display_height
		"shape":
			d["shape"] = shape.duplicate()
	return d


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
	if not KINDS.has(kind):
		errors.append("kind '%s' không hợp lệ. Hợp lệ: %s" % [kind, ", ".join(KINDS)])

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

	match kind:
		"sprite2d":
			var art = d.get("art", {})
			if art is Dictionary:
				_read_art(art)
			else:
				errors.append("art phải là object")
		"image":
			_read_image(d)
		"shape":
			_read_shape(d)

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


func _read_image(d: Dictionary) -> void:
	image_path = str(d.get("image", "")).strip_edges()
	if image_path == "":
		errors.append("image bắt buộc với kind image (tên file ảnh trong thư mục pack)")
	elif image_path.contains("..") or image_path.begins_with("/"):
		errors.append("image phải là đường dẫn tương đối trong thư mục pack")
	display_height = clampf(float(d.get("display_height", 150.0)), 40.0, 400.0)


func _read_shape(d: Dictionary) -> void:
	var s = d.get("shape", {})
	if not (s is Dictionary):
		errors.append("shape phải là object")
		return
	for key in DEFAULT_SHAPE.keys():
		shape[key] = str(s.get(key, DEFAULT_SHAPE[key]))
	if not ShapeParts.is_valid(shape["body"], shape["color"], shape["face"], shape["hands"]):
		errors.append("shape không hợp lệ. body: %s; color: %s; face: %s; hands: %s" % [
			", ".join(ShapeParts.SHAPES), ", ".join(ShapeParts.COLORS),
			", ".join(ShapeParts.FACES), ", ".join(ShapeParts.HANDS)])


static func _is_slug(s: String) -> bool:
	for c in s:
		var ok := (c >= "a" and c <= "z") or (c >= "0" and c <= "9") or c == "_" or c == "-"
		if not ok:
			return false
	return true
