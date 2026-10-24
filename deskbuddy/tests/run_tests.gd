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
	var hours := m.apply_offline(7 * 24 * 3600.0)
	_check(is_equal_approx(hours, BuddyNeeds.OFFLINE_CAP_HOURS), "đi 1 tuần chỉ áp %.0f giờ" % BuddyNeeds.OFFLINE_CAP_HOURS)
	_check(is_equal_approx(m.energy, 100.0 - 8.0 * BuddyNeeds.OFFLINE_CAP_HOURS), "energy sau 1 tuần = %.1f" % m.energy)


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
	_check(packs.size() >= 3, "tìm thấy >= 3 pack (được %d)" % packs.size())
	var ids: Array[String] = []
	for p in packs:
		_check(p.is_valid(), "pack '%s' hợp lệ: %s" % [p.id, "ok" if p.is_valid() else str(p.errors)])
		ids.append(p.id)
		for anim in BuddyPack.KNOWN_ANIMATIONS:
			if not p.has_animation(anim):
				_check(false, "pack '%s' thiếu animation %s" % [p.id, anim])
		var frames := PackLoader.build_sprite_frames(p)
		_check(frames != null and frames.has_animation("idle") and frames.get_frame_count("idle") == 2, "pack '%s' dựng được SpriteFrames từ sheet" % p.id)
	_check(ids.has("potato") and ids.has("aki") and ids.has("rex"), "có đủ potato, aki, rex")
	_check(PackLoader.find(packs, "aki") != null and PackLoader.find(packs, "khong_co") == null, "PackLoader.find")
	var fallback := PlaceholderArt.build(Color.RED, 32)
	_check(fallback.has_animation("sleep") and fallback.get_frame_count("idle") == 2, "PlaceholderArt dựng đủ animation")


func _test_focus_snacks() -> void:
	print("FocusSession.snacks_for")
	_check(FocusSession.snacks_for(25.0) == 1, "25 phút = 1 snack")
	_check(FocusSession.snacks_for(50.0) == 2, "50 phút = 2 snack")
	_check(FocusSession.snacks_for(5.0) == 1, "phiên ngắn vẫn được tối thiểu 1")
