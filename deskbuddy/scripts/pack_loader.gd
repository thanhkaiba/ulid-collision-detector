class_name PackLoader
extends RefCounted
## Quét, nạp, ghi, xuất và nhập pack.
##   res://packs/<id>/pack.json   : pack đi kèm app
##   user://packs/<id>/pack.json  : pack người dùng tự tạo hoặc nhập
## Pack trong user:// trùng id sẽ ghi đè pack đi kèm.

const BUILTIN_DIR := "res://packs"
const USER_DIR := "user://packs"

const VI_MAP := {
	"à": "a", "á": "a", "ả": "a", "ã": "a", "ạ": "a", "ă": "a", "ằ": "a", "ắ": "a", "ẳ": "a", "ẵ": "a", "ặ": "a",
	"â": "a", "ầ": "a", "ấ": "a", "ẩ": "a", "ẫ": "a", "ậ": "a", "đ": "d",
	"è": "e", "é": "e", "ẻ": "e", "ẽ": "e", "ẹ": "e", "ê": "e", "ề": "e", "ế": "e", "ể": "e", "ễ": "e", "ệ": "e",
	"ì": "i", "í": "i", "ỉ": "i", "ĩ": "i", "ị": "i",
	"ò": "o", "ó": "o", "ỏ": "o", "õ": "o", "ọ": "o", "ô": "o", "ồ": "o", "ố": "o", "ổ": "o", "ỗ": "o", "ộ": "o",
	"ơ": "o", "ờ": "o", "ớ": "o", "ở": "o", "ỡ": "o", "ợ": "o",
	"ù": "u", "ú": "u", "ủ": "u", "ũ": "u", "ụ": "u", "ư": "u", "ừ": "u", "ứ": "u", "ử": "u", "ữ": "u", "ự": "u",
	"ỳ": "y", "ý": "y", "ỷ": "y", "ỹ": "y", "ỵ": "y",
}


static func user_packs_dir() -> String:
	return ProjectSettings.globalize_path(USER_DIR)


static func ensure_user_dir() -> void:
	DirAccess.make_dir_recursive_absolute(user_packs_dir())


## Trả về Array[BuddyPack] đã sắp xếp theo tên. Pack lỗi vẫn trả về
## (is_valid() == false) để UI hiển thị lý do cho người làm pack.
static func scan() -> Array[BuddyPack]:
	var found := {}
	for p in _scan_dir(BUILTIN_DIR):
		found[p.id if p.id != "" else p.root_dir] = p
	for p in _scan_dir(USER_DIR):
		found[p.id if p.id != "" else p.root_dir] = p
	var result: Array[BuddyPack] = []
	for key in found.keys():
		result.append(found[key])
	result.sort_custom(func(a: BuddyPack, b: BuddyPack) -> bool: return a.name.naturalnocasecmp_to(b.name) < 0)
	return result


static func find(packs: Array[BuddyPack], id: String) -> BuddyPack:
	for p in packs:
		if p.id == id and p.is_valid():
			return p
	return null


static func _scan_dir(base: String) -> Array[BuddyPack]:
	var out: Array[BuddyPack] = []
	var dir := DirAccess.open(base)
	if dir == null:
		return out
	dir.list_dir_begin()
	var entry := dir.get_next()
	while entry != "":
		if dir.current_is_dir() and not entry.begins_with("."):
			var root := base.path_join(entry)
			var json_path := root.path_join("pack.json")
			if FileAccess.file_exists(json_path):
				var text := FileAccess.get_file_as_string(json_path)
				var pack := BuddyPack.from_json(text, root)
				if pack.id == "":
					pack.id = entry
				out.append(pack)
		entry = dir.get_next()
	dir.list_dir_end()
	return out


## Nạp texture từ res:// (đã import) hoặc từ file thô ở user://.
static func load_texture(path: String) -> Texture2D:
	if path.begins_with("res://") and ResourceLoader.exists(path):
		var tex := ResourceLoader.load(path)
		if tex is Texture2D:
			return tex
	if FileAccess.file_exists(path):
		var img := Image.load_from_file(path)
		if img != null and not img.is_empty():
			return ImageTexture.create_from_image(img)
	return null


## Dựng SpriteFrames từ sheet của pack. Trả null nếu không có ảnh,
## Buddy sẽ dùng PlaceholderArt thay thế.
static func build_sprite_frames(pack: BuddyPack) -> SpriteFrames:
	var tex := load_texture(pack.sheet_full_path())
	if tex == null:
		return null
	var cols := int(tex.get_width() / pack.frame_size.x)
	var rows := int(tex.get_height() / pack.frame_size.y)
	if cols <= 0 or rows <= 0:
		return null
	var total := cols * rows
	var frames := SpriteFrames.new()
	frames.remove_animation("default")
	for anim_name in pack.animations.keys():
		var a: Dictionary = pack.animations[anim_name]
		frames.add_animation(anim_name)
		frames.set_animation_speed(anim_name, a["fps"])
		frames.set_animation_loop(anim_name, a["loop"])
		for idx in a["frames"]:
			var i := int(idx)
			if i >= total:
				push_warning("Pack %s: frame %d vượt sheet (%d frame)" % [pack.id, i, total])
				continue
			var atlas := AtlasTexture.new()
			atlas.atlas = tex
			atlas.region = Rect2(
				(i % cols) * pack.frame_size.x,
				floori(float(i) / float(cols)) * pack.frame_size.y,
				pack.frame_size.x, pack.frame_size.y)
			frames.add_frame(anim_name, atlas)
	return frames


# ---------- Ghi / xuất / nhập (Workshop) ----------

## Tên → slug: bỏ dấu tiếng Việt, chỉ giữ a-z 0-9 và '-'.
static func slugify(text: String) -> String:
	var out := ""
	var last_dash := true
	for ch in text.to_lower():
		var c: String = VI_MAP.get(ch, ch)
		var ok := (c >= "a" and c <= "z") or (c >= "0" and c <= "9")
		if ok:
			out += c
			last_dash = false
		elif not last_dash:
			out += "-"
			last_dash = true
	out = out.trim_suffix("-")
	return out if out != "" else "buddy"


## Id chưa dùng trong user://packs: slug, slug-2, slug-3...
static func unique_id(base: String) -> String:
	var slug := slugify(base)
	var id := slug
	var n := 2
	while DirAccess.dir_exists_absolute(ProjectSettings.globalize_path(USER_DIR.path_join(id))):
		id = "%s-%d" % [slug, n]
		n += 1
	return id


## Ghi pack vào user://packs/<id>/: pack.json + các ảnh (tên file → Image).
static func write_pack(id: String, data: Dictionary, images: Dictionary = {}) -> String:
	var dir := USER_DIR.path_join(id)
	DirAccess.make_dir_recursive_absolute(ProjectSettings.globalize_path(dir))
	for fname in images.keys():
		var img: Image = images[fname]
		img.save_png(dir.path_join(fname))
	var f := FileAccess.open(dir.path_join("pack.json"), FileAccess.WRITE)
	if f == null:
		push_error("Không ghi được pack.json: %s" % error_string(FileAccess.get_open_error()))
		return ""
	f.store_string(JSON.stringify(data, "\t"))
	f.close()
	return dir


static func list_files(dir_path: String) -> PackedStringArray:
	var out := PackedStringArray()
	var dir := DirAccess.open(dir_path)
	if dir == null:
		return out
	dir.list_dir_begin()
	var entry := dir.get_next()
	while entry != "":
		if not dir.current_is_dir() and not entry.begins_with(".") and not entry.ends_with(".import"):
			out.append(entry)
		entry = dir.get_next()
	dir.list_dir_end()
	return out


## Đóng gói thư mục pack thành zip: <id>/pack.json, <id>/ảnh...
static func export_zip(pack: BuddyPack, zip_path: String) -> Error:
	var packer := ZIPPacker.new()
	var err := packer.open(zip_path)
	if err != OK:
		return err
	for fname in list_files(pack.root_dir):
		var bytes := FileAccess.get_file_as_bytes(pack.root_dir.path_join(fname))
		if bytes.is_empty() and FileAccess.get_open_error() != OK:
			continue
		packer.start_file(pack.id + "/" + fname)
		packer.write_file(bytes)
		packer.close_file()
	packer.close()
	return OK


## Giải nén zip vào user://packs/<id>/. Trả {ok: bool, id: String, error: String}.
static func import_zip(zip_path: String) -> Dictionary:
	var reader := ZIPReader.new()
	var err := reader.open(zip_path)
	if err != OK:
		return {"ok": false, "id": "", "error": "Không mở được zip: %s" % error_string(err)}
	var files := reader.get_files()
	var prefix := ""
	var found := false
	for f in files:
		if f == "pack.json" or f.ends_with("/pack.json"):
			var p := f.trim_suffix("pack.json")
			if not found or p.length() < prefix.length():
				prefix = p
				found = true
	if not found:
		reader.close()
		return {"ok": false, "id": "", "error": "Zip không có pack.json"}
	var text := reader.read_file(prefix + "pack.json").get_string_from_utf8()
	var pack := BuddyPack.from_json(text, "")
	if not pack.is_valid():
		reader.close()
		return {"ok": false, "id": "", "error": "pack.json lỗi: %s" % pack.errors[0]}
	var dest := USER_DIR.path_join(pack.id)
	DirAccess.make_dir_recursive_absolute(ProjectSettings.globalize_path(dest))
	for f in files:
		if not f.begins_with(prefix) or f.ends_with("/"):
			continue
		var rel := f.trim_prefix(prefix)
		if rel == "" or rel.contains("..") or rel.begins_with("/"):
			continue
		var out_path := dest.path_join(rel)
		DirAccess.make_dir_recursive_absolute(ProjectSettings.globalize_path(out_path.get_base_dir()))
		var fa := FileAccess.open(out_path, FileAccess.WRITE)
		if fa != null:
			fa.store_buffer(reader.read_file(f))
			fa.close()
	reader.close()
	return {"ok": true, "id": pack.id, "error": ""}


static func remove_user_pack(id: String) -> void:
	var dir := USER_DIR.path_join(id)
	for f in list_files(dir):
		DirAccess.remove_absolute(ProjectSettings.globalize_path(dir.path_join(f)))
	DirAccess.remove_absolute(ProjectSettings.globalize_path(dir))
