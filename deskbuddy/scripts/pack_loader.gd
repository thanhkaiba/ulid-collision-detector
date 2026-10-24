class_name PackLoader
extends RefCounted
## Quét và nạp pack từ hai nơi:
##   res://packs/<id>/pack.json   : pack đi kèm app
##   user://packs/<id>/pack.json  : pack người dùng tự thêm (Workshop/local mod sau này)
## Pack trong user:// trùng id sẽ ghi đè pack đi kèm.

const BUILTIN_DIR := "res://packs"
const USER_DIR := "user://packs"


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
