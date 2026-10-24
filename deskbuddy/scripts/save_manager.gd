class_name SaveManager
extends RefCounted
## Lưu/đọc trạng thái vào user://save.json. Toàn bộ dữ liệu ở local,
## không có gì gửi đi đâu.

const SAVE_PATH := "user://save.json"
const SAVE_VERSION := 1


static func default_data() -> Dictionary:
	return {
		"version": SAVE_VERSION,
		"pack_id": "",
		"needs": {},
		"snacks": 3,
		"last_seen_unix": 0,
		"window_pos": null,
		"stats": {"focus_minutes_total": 0, "focus_sessions": 0, "fed_count": 0, "pet_count": 0},
	}


static func load_data() -> Dictionary:
	var data := default_data()
	if not FileAccess.file_exists(SAVE_PATH):
		return data
	var text := FileAccess.get_file_as_string(SAVE_PATH)
	var parsed = JSON.parse_string(text)
	if parsed is Dictionary:
		for key in parsed.keys():
			data[key] = parsed[key]
		if not (data.get("stats") is Dictionary):
			data["stats"] = default_data()["stats"]
	else:
		push_warning("save.json hỏng, dùng mặc định")
	return data


static func save_data(data: Dictionary) -> bool:
	data["version"] = SAVE_VERSION
	var f := FileAccess.open(SAVE_PATH, FileAccess.WRITE)
	if f == null:
		push_error("Không ghi được save: %s" % error_string(FileAccess.get_open_error()))
		return false
	f.store_string(JSON.stringify(data, "\t"))
	f.close()
	return true
