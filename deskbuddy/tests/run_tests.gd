extends SceneTree
## Test headless, không cần cửa sổ.
## Chạy:  godot --headless --path . -s tests/run_tests.gd
## Thoát mã 0 khi mọi test qua, 1 khi có lỗi.

var _failures := 0
var _count := 0


func _init() -> void:
	_test_needs_decay()
	_test_needs_floor_and_offline_cap()
	_test_needs_state_and_bond_neglect()
	_test_needs_roundtrip()
	_test_personality_archetypes_complete()
	_test_personality_pick_line_override()
	_test_pack_parse_valid()
	_test_pack_parse_errors()
	_test_builtin_packs_load()
	_test_focus_snacks()
	_test_pack_kinds()
	_test_image_tools()
	_test_slugify()
	_test_shape_parts_exist()
	_test_zip_roundtrip()
	print("")
	print("%d test, %d lỗi" % [_count, _failures])
	quit(1 if _failures > 0 else 0)


func _check(cond: bool, msg: String) -> void:
	_count += 1
	if cond:
		print("  ok   ", msg)
	else:
		_failures += 1
		printerr("  FAIL ", msg)


func _test_needs_decay() -> void:
	print("BuddyNeeds.apply_decay")
	var n := BuddyNeeds.new()
	n.energy = 80.0
	n.mood = 80.0
	n.apply_decay(1.0)
	_check(is_equal_approx(n.energy, 72.0), "energy giảm 8/giờ (được %.1f)" % n.energy)
	_check(is_equal_approx(n.mood, 75.0), "mood giảm 5/giờ (được %.1f)" % n.mood)
	n.decay_multipliers = {"energy": 2.0, "mood": 1.0, "bond": 1.0}
	n.apply_decay(1.0)
	_check(is_equal_approx(n.energy, 56.0), "multiplier tính cách nhân đôi decay (được %.1f)" % n.energy)
	var before := n.energy
	n.apply_decay(0.0)
	n.apply_decay(-5.0)
	_check(is_equal_approx(n.energy, before), "giờ <= 0 không đổi gì")


func _test_needs_floor_and_offline_cap() -> void:
	print("BuddyNeeds sàn và offline cap")
	var n := BuddyNeeds.new()
	n.apply_decay(1000.0)
	_check(is_equal_approx(n.energy, BuddyNeeds.FLOOR), "không bao giờ dưới sàn %.0f" % BuddyNeeds.FLOOR)
	var m := BuddyNeeds.new()
	m.energy = 100.0
	m.decay_multipliers = {"energy": 0.5, "mood": 1.0, "bond": 1.0}
	var hours := m.apply_offline(7 * 24 * 3600.0)
	_check(is_equal_approx(hours, BuddyNeeds.OFFLINE_CAP_HOURS), "đi 1 tuần chỉ áp %.0f giờ" % BuddyNeeds.OFFLINE_CAP_HOURS)
	var expected := 100.0 - 8.0 * 0.5 * BuddyNeeds.OFFLINE_CAP_HOURS
	_check(is_equal_approx(m.energy, expected), "energy sau 1 tuần = %.1f (kỳ vọng %.1f)" % [m.energy, expected])


func _test_needs_state_and_bond_neglect() -> void:
	print("BuddyNeeds.state và bond")
	var n := BuddyNeeds.new()
	n.energy = 80.0
	n.mood = 80.0
	_check(n.state() == "happy", "cao cả hai → happy")
	n.energy = 50.0
	_check(n.state() == "idle", "trung bình → idle")
	n.mood = 20.0
	_check(n.state() == "sad", "mood thấp → sad")
	n.energy = 10.0
	_check(n.state() == "hungry", "energy thấp ưu tiên hơn sad")
	var b := BuddyNeeds.new()
	b.bond = 50.0
	b.energy = 80.0
	b.mood = 80.0
	b.apply_decay(1.0)
	_check(is_equal_approx(b.bond, 50.0), "bond không giảm khi được chăm")
	b.energy = 10.0
	b.apply_decay(1.0)
	_check(b.bond < 50.0, "bond giảm khi bị bỏ bê")
	b.feed()
	_check(b.energy > 10.0 and b.energy <= 100.0, "feed tăng energy")
	b.pet()
	b.reward_focus(50.0)
	_check(b.bond > 48.0, "pet + focus tăng bond")


func _test_needs_roundtrip() -> void:
	print("BuddyNeeds to_dict/from_dict")
	var n := BuddyNeeds.new()
	n.energy = 33.3
	n.mood = 44.4
	n.bond = 55.5
	var m := BuddyNeeds.new()
	m.from_dict(n.to_dict())
	_check(is_equal_approx(m.energy, 33.3) and is_equal_approx(m.bond, 55.5), "roundtrip giữ giá trị")
	m.from_dict({"energy": -50, "mood": 500})
	_check(is_equal_approx(m.energy, BuddyNeeds.FLOOR) and is_equal_approx(m.mood, BuddyNeeds.MAX), "from_dict kẹp giá trị")


func _test_personality_archetypes_complete() -> void:
	print("Personality đủ câu cho mọi sự kiện")
	for id in Personality.ARCHETYPES.keys():
		var missing: Array[String] = []
		for ev in Personality.EVENTS:
			if Personality.pick_line(id, ev) == "":
				missing.append(ev)
		_check(missing.is_empty(), "%s đủ 12 sự kiện %s" % [id, "" if missing.is_empty() else str(missing)])
	_check(Personality.get_archetype("khong_ton_tai")["name"] == Personality.get_archetype(Personality.DEFAULT_ARCHETYPE)["name"], "archetype lạ lùi về mặc định")


func _test_personality_pick_line_override() -> void:
	print("Personality.pick_line với override từ pack")
	var rng := RandomNumberGenerator.new()
	rng.seed = 42
	var line := Personality.pick_line("lazy", "fed", {"fed": ["CHỈ CÂU NÀY"]}, rng)
	_check(line == "CHỈ CÂU NÀY", "override thay thế pool mặc định")
	var line2 := Personality.pick_line("lazy", "fed", {"fed": []}, rng)
	_check(line2 != "" and line2 != "CHỈ CÂU NÀY", "override rỗng lùi về mặc định")
	_check(Personality.pick_line("lazy", "su_kien_la") == "", "sự kiện lạ trả chuỗi rỗng")


const VALID_PACK := """
{
  "format": 1, "id": "test_pack", "name": "Test", "personality": "chaos",
  "needs": {"energy": {"label": "Pin", "food": "Sạc"}},
  "art": {"sheet": "s.png", "frame_size": [32, 32], "scale": 2,
          "animations": {"idle": {"frames": [0, 1], "fps": 2}, "eat": {"frames": [2], "loop": false}}},
  "lines": {"fed": ["Sạc đầy."]}
}
"""


func _test_pack_parse_valid() -> void:
	print("BuddyPack.from_json hợp lệ")
	var p := BuddyPack.from_json(VALID_PACK, "user://packs/test_pack")
	_check(p.is_valid(), "không lỗi: %s" % str(p.errors))
	_check(p.id == "test_pack" and p.personality == "chaos", "đọc id và personality")
	_check(p.need_label("energy") == "Pin" and p.food_name() == "Sạc", "nhãn nhu cầu từ pack")
	_check(p.need_label("mood") == "Tâm trạng", "nhãn thiếu lùi về mặc định")
	_check(p.frame_size == Vector2i(32, 32) and is_equal_approx(p.scale, 2.0), "đọc frame_size và scale")
	_check(p.animations["eat"]["loop"] == false and p.animations["idle"]["fps"] == 2.0, "đọc tham số animation")
	_check(p.resolve_animation("sleep") == "idle" and p.resolve_animation("eat") == "eat", "animation thiếu lùi về idle")
	_check(p.sheet_full_path() == "user://packs/test_pack/s.png", "đường dẫn sheet nối với root")
	_check(p.lines["fed"][0] == "Sạc đầy.", "đọc lines override")
	_check(p.filter == "linear", "filter mặc định linear")
	var px := BuddyPack.from_json('{"format": 1, "id": "x", "art": {"sheet": "a.png", "filter": "nearest", "animations": {"idle": {"frames": [0]}}}}', "")
	_check(px.is_valid() and px.filter == "nearest", "filter nearest hợp lệ")
	var bad_filter := BuddyPack.from_json('{"format": 1, "id": "x", "art": {"sheet": "a.png", "filter": "blurry", "animations": {"idle": {"frames": [0]}}}}', "")
	_check(not bad_filter.is_valid() and bad_filter.errors[0].contains("filter"), "filter lạ → lỗi")


func _test_pack_parse_errors() -> void:
	print("BuddyPack.from_json báo lỗi")
	var bad := BuddyPack.from_json("{ không phải json", "")
	_check(not bad.is_valid() and bad.errors[0].begins_with("JSON lỗi"), "JSON hỏng báo dòng lỗi")
	var missing := BuddyPack.from_json('{"format": 1, "id": "x", "art": {"sheet": "a.png", "animations": {}}}', "")
	_check(not missing.is_valid(), "thiếu idle → lỗi")
	var has_idle_err := false
	for e in missing.errors:
		if e.contains("idle"):
			has_idle_err = true
	_check(has_idle_err, "lỗi nêu đích danh 'idle'")
	var bad_pers := BuddyPack.from_json('{"format": 1, "id": "x", "personality": "nope", "art": {"sheet": "a.png", "animations": {"idle": {"frames": [0]}}}}', "")
	_check(not bad_pers.is_valid() and bad_pers.errors[0].contains("personality"), "personality lạ → lỗi")
	var bad_id := BuddyPack.from_json('{"format": 1, "id": "Có Dấu", "art": {"sheet": "a.png", "animations": {"idle": {"frames": [0]}}}}', "")
	_check(not bad_id.is_valid(), "id không phải slug → lỗi")
	var bad_fmt := BuddyPack.from_json('{"format": 99, "id": "x", "art": {"sheet": "a.png", "animations": {"idle": {"frames": [0]}}}}', "")
	_check(not bad_fmt.is_valid() and bad_fmt.errors[0].contains("format"), "format sai → lỗi")
	var bad_event := BuddyPack.from_json('{"format": 1, "id": "x", "art": {"sheet": "a.png", "animations": {"idle": {"frames": [0]}}}, "lines": {"xyz": ["a"]}}', "")
	_check(not bad_event.is_valid() and bad_event.errors[0].contains("lines.xyz"), "sự kiện lines lạ → lỗi")


func _test_builtin_packs_load() -> void:
	print("Pack đi kèm trong res://packs")
	var packs := PackLoader.scan()
	_check(packs.size() >= 5, "tìm thấy >= 5 pack (được %d)" % packs.size())
	var ids: Array[String] = []
	for p in packs:
		_check(p.is_valid(), "pack '%s' hợp lệ: %s" % [p.id, "ok" if p.is_valid() else str(p.errors)])
		ids.append(p.id)
		for anim in BuddyPack.KNOWN_ANIMATIONS:
			if not p.has_animation(anim):
				_check(false, "pack '%s' thiếu animation %s" % [p.id, anim])
		if p.kind == "sprite2d":
			var frames := PackLoader.build_sprite_frames(p)
			_check(frames != null and frames.has_animation("idle") and frames.get_frame_count("idle") == 2, "pack '%s' dựng được SpriteFrames từ sheet" % p.id)
		elif p.kind == "image":
			_check(PackLoader.load_texture(p.image_full_path()) != null, "pack '%s' đọc được ảnh" % p.id)
	_check(ids.has("potato") and ids.has("aki") and ids.has("rex") and ids.has("blob") and ids.has("zombie"), "có đủ potato, aki, rex, blob, zombie")
	_check(PackLoader.find(packs, "aki") != null and PackLoader.find(packs, "khong_co") == null, "PackLoader.find")
	var fallback := PlaceholderArt.build(Color.RED, 32)
	_check(fallback.has_animation("sleep") and fallback.get_frame_count("idle") == 2, "PlaceholderArt dựng đủ animation")


func _test_focus_snacks() -> void:
	print("FocusSession.snacks_for")
	_check(FocusSession.snacks_for(25.0) == 1, "25 phút = 1 snack")
	_check(FocusSession.snacks_for(50.0) == 2, "50 phút = 2 snack")
	_check(FocusSession.snacks_for(5.0) == 1, "phiên ngắn vẫn được tối thiểu 1")


func _test_pack_kinds() -> void:
	print("BuddyPack kind image / shape")
	var img := BuddyPack.from_json('{"format": 1, "id": "pic", "kind": "image", "image": "me.png", "display_height": 900}', "user://packs/pic")
	_check(img.is_valid() and img.is_procedural(), "image hợp lệ và là procedural: %s" % str(img.errors))
	_check(is_equal_approx(img.display_height, 400.0), "display_height bị kẹp về 400")
	_check(img.image_full_path() == "user://packs/pic/me.png", "image_full_path")
	_check(img.has_animation("sleep") and img.resolve_animation("eat") == "eat", "kind image có mọi animation")
	var no_img := BuddyPack.from_json('{"format": 1, "id": "pic", "kind": "image"}', "")
	_check(not no_img.is_valid() and no_img.errors[0].contains("image"), "image thiếu file → lỗi")
	var esc := BuddyPack.from_json('{"format": 1, "id": "pic", "kind": "image", "image": "../x.png"}', "")
	_check(not esc.is_valid(), "image có '..' → lỗi")
	var sh := BuddyPack.from_json('{"format": 1, "id": "s", "kind": "shape", "shape": {"body": "circle", "color": "red", "face": "d", "hands": "rock"}}', "")
	_check(sh.is_valid() and sh.shape["color"] == "red" and sh.shape["hands"] == "rock", "shape hợp lệ: %s" % str(sh.errors))
	var sh_default := BuddyPack.from_json('{"format": 1, "id": "s", "kind": "shape"}', "")
	_check(sh_default.is_valid() and sh_default.shape["body"] == "squircle", "shape thiếu → mặc định")
	var sh_bad := BuddyPack.from_json('{"format": 1, "id": "s", "kind": "shape", "shape": {"body": "tam-giac"}}', "")
	_check(not sh_bad.is_valid() and sh_bad.errors[0].contains("shape"), "shape lạ → lỗi")
	var bad_kind := BuddyPack.from_json('{"format": 1, "id": "s", "kind": "vrm"}', "")
	_check(not bad_kind.is_valid() and bad_kind.errors[0].contains("kind"), "kind lạ → lỗi")
	var d := sh.to_dict()
	var again := BuddyPack.from_json(JSON.stringify(d), "")
	_check(again.is_valid() and again.kind == "shape" and again.shape["face"] == "d", "to_dict → from_json giữ nguyên")


func _test_image_tools() -> void:
	print("ImageTools.remove_background")
	var img := Image.create(24, 24, false, Image.FORMAT_RGBA8)
	img.fill(Color.WHITE)
	img.fill_rect(Rect2i(8, 8, 8, 8), Color.RED)
	img.fill_rect(Rect2i(10, 10, 2, 2), Color.WHITE)  # "mắt" trắng bên trong, không nối với góc
	var out := ImageTools.remove_background(img, 0.1)
	_check(out.get_pixel(0, 0).a == 0.0 and out.get_pixel(23, 23).a == 0.0, "góc thành trong suốt")
	_check(out.get_pixel(12, 12).a == 1.0, "vùng đỏ giữ nguyên")
	_check(out.get_pixel(10, 10).a == 1.0, "vùng trắng kín bên trong không bị xoá")
	var trimmed := ImageTools.trim(out)
	_check(trimmed.get_width() == 8 and trimmed.get_height() == 8, "trim cắt về 8x8 (được %dx%d)" % [trimmed.get_width(), trimmed.get_height()])
	var big := Image.create(1000, 500, false, Image.FORMAT_RGBA8)
	var small := ImageTools.fit(big, 200)
	_check(small.get_width() == 200 and small.get_height() == 100, "fit thu về 200x100")


func _test_slugify() -> void:
	print("PackLoader.slugify")
	_check(PackLoader.slugify("Củ Khoai Tây") == "cu-khoai-tay", "bỏ dấu tiếng Việt: %s" % PackLoader.slugify("Củ Khoai Tây"))
	_check(PackLoader.slugify("  Đậu   Đỏ!!") == "dau-do", "đ → d, gộp dấu cách: %s" % PackLoader.slugify("  Đậu   Đỏ!!"))
	_check(PackLoader.slugify("日本") == "buddy", "không có chữ latin → buddy")
	_check(PackLoader.slugify("Rex 2") == "rex-2", "số giữ nguyên")


func _test_shape_parts_exist() -> void:
	print("ShapeParts: mọi tổ hợp có file")
	var missing: Array[String] = []
	for shape in ShapeParts.SHAPES:
		for color in ShapeParts.COLORS:
			if not FileAccess.file_exists(ShapeParts.body_path(shape, color)):
				missing.append(ShapeParts.body_path(shape, color))
	for color in ShapeParts.COLORS:
		for hand in ShapeParts.HANDS:
			if not FileAccess.file_exists(ShapeParts.hand_path(color, hand)):
				missing.append(ShapeParts.hand_path(color, hand))
	for face in ShapeParts.FACES:
		if not FileAccess.file_exists(ShapeParts.face_path(face)):
			missing.append(ShapeParts.face_path(face))
	_check(missing.is_empty(), "thiếu: %s" % str(missing) if not missing.is_empty() else "24 thân, 36 tay, 12 mặt đều có")
	for anim in BuddyPack.KNOWN_ANIMATIONS:
		_check(ShapeParts.STATE_HANDS.has(anim), "STATE_HANDS có %s" % anim)


func _test_zip_roundtrip() -> void:
	print("PackLoader export_zip / import_zip")
	var packs := PackLoader.scan()
	var src := PackLoader.find(packs, "blob")
	_check(src != null, "có pack blob để xuất")
	if src == null:
		return
	PackLoader.ensure_user_dir()
	var zip_path := ProjectSettings.globalize_path("user://test_blob.zip")
	var err := PackLoader.export_zip(src, zip_path)
	_check(err == OK and FileAccess.file_exists(zip_path), "xuất zip OK")
	var r := PackLoader.import_zip(zip_path)
	_check(r["ok"] and r["id"] == "blob", "nhập zip OK: %s" % str(r))
	var imported := FileAccess.file_exists("user://packs/blob/pack.json")
	_check(imported, "pack.json được giải nén vào user://packs/blob")
	var rescanned := PackLoader.find(PackLoader.scan(), "blob")
	_check(rescanned != null and rescanned.root_dir.begins_with("user://"), "pack user:// ghi đè pack đi kèm")
	# Nhập zip không có pack.json → lỗi rõ ràng
	var bad_zip := ProjectSettings.globalize_path("user://test_bad.zip")
	var packer := ZIPPacker.new()
	packer.open(bad_zip)
	packer.start_file("readme.txt")
	packer.write_file("hi".to_utf8_buffer())
	packer.close_file()
	packer.close()
	var rb := PackLoader.import_zip(bad_zip)
	_check(not rb["ok"] and rb["error"].contains("pack.json"), "zip thiếu pack.json → báo lỗi")
	# dọn dẹp
	PackLoader.remove_user_pack("blob")
	DirAccess.remove_absolute(zip_path)
	DirAccess.remove_absolute(bad_zip)
	_check(not FileAccess.file_exists("user://packs/blob/pack.json"), "dọn dẹp pack test")
