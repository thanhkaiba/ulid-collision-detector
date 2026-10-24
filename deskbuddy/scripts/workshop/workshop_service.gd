class_name WorkshopService
extends Node
## Đồng bộ Steam Workshop với thư mục packs, độc lập với Steam thật:
##   - sync(): item đã subscribe → tải về → chép vào user://packs/<id>/;
##     bản mới hơn thì chép lại; bỏ subscribe thì gỡ pack.
##   - upload(): dựng thư mục content sạch (pack.json + ảnh) → createItem lần
##     đầu, các lần sau startItemUpdate với file_id đã nhớ → submit.
## Sổ theo dõi: user://workshop.json {uploads: {pack_id: file_id},
## installed: {file_id: {pack_id, timestamp}}}.

signal sync_finished(installed: int, pending: int, removed: int)
signal upload_finished(ok: bool, file_id: int, message: String)
signal upload_progress(status: int, processed: int, total: int)

const MANIFEST := "user://workshop.json"
const STAGE_DIR := "user://workshop_upload"
const AUTO_SYNC_SECONDS := 600.0
const TAGS := ["DeskBuddy Pack"]

var adapter: Node
var manifest := {"uploads": {}, "installed": {}}
var _upload_ctx := {}
var _sync_accum := 0.0
var _progress_accum := 0.0
var _resync_requested := false


func _init(p_adapter: Node = null) -> void:
	adapter = p_adapter
	load_manifest()
	# Nối tín hiệu ngay trong _init để dịch vụ dùng được cả khi chưa vào cây
	# (test headless) lẫn khi vào cây (app thật).
	if adapter != null:
		adapter.item_created.connect(_on_item_created)
		adapter.item_updated.connect(_on_item_updated)
		adapter.item_installed.connect(func(_id: int) -> void: _resync_requested = true)
		adapter.subscriptions_changed.connect(func() -> void: _resync_requested = true)


func _ready() -> void:
	# SteamAdapter cần _ready/_process (khởi tạo Steam, run_callbacks).
	if adapter != null and adapter.get_parent() == null:
		add_child(adapter)


func _process(delta: float) -> void:
	if not is_available():
		return
	_sync_accum += delta
	if _resync_requested or _sync_accum >= AUTO_SYNC_SECONDS:
		_resync_requested = false
		_sync_accum = 0.0
		sync()
	if not _upload_ctx.is_empty() and _upload_ctx.get("submitted", false):
		_progress_accum += delta
		if _progress_accum >= 0.5:
			_progress_accum = 0.0
			var p: Dictionary = adapter.update_progress()
			upload_progress.emit(int(p.get("status", 0)), int(p.get("processed", 0)), int(p.get("total", 0)))


func is_available() -> bool:
	return adapter != null and adapter.is_available()


func status_text() -> String:
	return adapter.status_text() if adapter != null else "Chưa cài GodotSteam."


# ---------- manifest ----------

func load_manifest() -> void:
	manifest = {"uploads": {}, "installed": {}}
	if FileAccess.file_exists(MANIFEST):
		var d = JSON.parse_string(FileAccess.get_file_as_string(MANIFEST))
		if d is Dictionary:
			if d.get("uploads") is Dictionary:
				manifest["uploads"] = d["uploads"]
			if d.get("installed") is Dictionary:
				manifest["installed"] = d["installed"]


func save_manifest() -> void:
	var f := FileAccess.open(MANIFEST, FileAccess.WRITE)
	if f != null:
		f.store_string(JSON.stringify(manifest, "\t"))
		f.close()


func known_file_id(pack_id: String) -> int:
	return int(manifest["uploads"].get(pack_id, 0))


# ---------- sync (download) ----------

func sync() -> Dictionary:
	var result := {"installed": 0, "pending": 0, "removed": 0, "errors": []}
	if not is_available():
		sync_finished.emit(0, 0, 0)
		return result
	var subs: Array = adapter.subscribed_items()
	var seen := {}
	for raw in subs:
		var fid := int(raw)
		seen[str(fid)] = true
		var state: int = adapter.item_state(fid)
		var installed := (state & SteamAdapter.ITEM_STATE_INSTALLED) != 0
		var needs_update := (state & SteamAdapter.ITEM_STATE_NEEDS_UPDATE) != 0
		if installed and not needs_update:
			var info: Dictionary = adapter.install_info(fid)
			if info["ok"]:
				var r := _install_from_folder(fid, str(info["folder"]), int(info["timestamp"]))
				if r == "installed":
					result["installed"] += 1
				elif r != "up-to-date":
					result["errors"].append("%d: %s" % [fid, r])
			else:
				result["errors"].append("%d: không có thông tin cài đặt" % fid)
		else:
			adapter.download(fid)
			result["pending"] += 1
	# Gỡ pack của item không còn subscribe.
	for key in manifest["installed"].keys():
		if not seen.has(str(key)):
			var entry: Dictionary = manifest["installed"][key]
			PackLoader.remove_user_pack(str(entry.get("pack_id", "")))
			manifest["installed"].erase(key)
			result["removed"] += 1
	save_manifest()
	sync_finished.emit(result["installed"], result["pending"], result["removed"])
	return result


## Chép thư mục item vào user://packs. Trả "installed", "up-to-date" hoặc lỗi.
func _install_from_folder(file_id: int, folder: String, timestamp: int) -> String:
	var key := str(file_id)
	var prev: Dictionary = manifest["installed"].get(key, {})
	if not prev.is_empty() and int(prev.get("timestamp", -1)) >= timestamp \
			and FileAccess.file_exists(PackLoader.USER_DIR.path_join(str(prev["pack_id"])).path_join("pack.json")):
		return "up-to-date"
	var json_path := folder.path_join("pack.json")
	if not FileAccess.file_exists(json_path):
		return "thiếu pack.json"
	var pack := BuddyPack.from_json(FileAccess.get_file_as_string(json_path), folder)
	if not pack.is_valid():
		return "pack.json lỗi: %s" % pack.errors[0]
	var pack_id := pack.id
	if not prev.is_empty():
		pack_id = str(prev["pack_id"])
	else:
		# Tránh đè pack người dùng tự tạo trùng id.
		var dest_json := PackLoader.USER_DIR.path_join(pack_id).path_join("pack.json")
		if FileAccess.file_exists(dest_json) and not _is_workshop_pack(pack_id):
			pack_id = "%s-ws%d" % [pack.id, file_id % 100000]
	var dest := PackLoader.USER_DIR.path_join(pack_id)
	DirAccess.make_dir_recursive_absolute(ProjectSettings.globalize_path(dest))
	for f in PackLoader.list_files(folder):
		if f.contains("..") or f.begins_with("/"):
			continue
		var bytes := FileAccess.get_file_as_bytes(folder.path_join(f))
		if f == "pack.json":
			var data = JSON.parse_string(bytes.get_string_from_utf8())
			if data is Dictionary:
				data["id"] = pack_id
				data["workshop_file_id"] = file_id
				bytes = JSON.stringify(data, "\t").to_utf8_buffer()
		var out := FileAccess.open(dest.path_join(f), FileAccess.WRITE)
		if out != null:
			out.store_buffer(bytes)
			out.close()
	manifest["installed"][key] = {"pack_id": pack_id, "timestamp": timestamp}
	return "installed"


func _is_workshop_pack(pack_id: String) -> bool:
	for key in manifest["installed"].keys():
		if str(manifest["installed"][key].get("pack_id", "")) == pack_id:
			return true
	return false


# ---------- upload ----------

## Đăng pack lên Workshop. preview_abs: ảnh PNG/JPG đường dẫn thật, có thể rỗng.
func upload(pack: BuddyPack, title: String, description: String, change_note: String, preview_abs: String) -> void:
	if not is_available():
		upload_finished.emit(false, 0, status_text())
		return
	if not _upload_ctx.is_empty():
		upload_finished.emit(false, 0, "Đang có một lượt tải lên khác.")
		return
	var stage := stage_content(pack)
	if stage == "":
		upload_finished.emit(false, 0, "Không dựng được thư mục nội dung.")
		return
	_upload_ctx = {
		"pack": pack, "title": title, "description": description, "change_note": change_note,
		"preview": preview_abs, "stage": ProjectSettings.globalize_path(stage), "submitted": false,
	}
	var fid := known_file_id(pack.id)
	if fid > 0:
		_begin_update(fid)
	else:
		adapter.create_item()


## Dựng thư mục content sạch: chỉ pack.json + file ảnh của pack.
func stage_content(pack: BuddyPack) -> String:
	var dir := STAGE_DIR.path_join(pack.id)
	var abs := ProjectSettings.globalize_path(dir)
	for f in PackLoader.list_files(dir):
		DirAccess.remove_absolute(abs.path_join(f))
	DirAccess.make_dir_recursive_absolute(abs)
	var copied := 0
	for f in PackLoader.list_files(pack.root_dir):
		var ext := f.get_extension().to_lower()
		if f != "pack.json" and not ext in ["png", "jpg", "jpeg", "webp"]:
			continue
		var bytes := FileAccess.get_file_as_bytes(pack.root_dir.path_join(f))
		var out := FileAccess.open(dir.path_join(f), FileAccess.WRITE)
		if out == null:
			return ""
		out.store_buffer(bytes)
		out.close()
		copied += 1
	return dir if copied > 0 else ""


func _begin_update(file_id: int) -> void:
	var c := _upload_ctx
	# Đặt cờ trước khi gọi adapter: adapter có thể trả lời ngay trong lúc gọi
	# (FakeSteamAdapter) và khi đó ngữ cảnh đã được dọn.
	c["submitted"] = true
	c["file_id"] = file_id
	var ok: bool = adapter.update_item(file_id, c["title"], c["description"], c["preview"], c["stage"], TAGS, c["change_note"])
	if not ok and not _upload_ctx.is_empty():
		_upload_ctx = {}
		upload_finished.emit(false, file_id, "Steam từ chối dữ liệu cập nhật.")


func _on_item_created(ok: bool, file_id: int, accept_tos: bool) -> void:
	if _upload_ctx.is_empty():
		return
	if not ok:
		_upload_ctx = {}
		upload_finished.emit(false, 0, "Steam không tạo được item.")
		return
	var pack: BuddyPack = _upload_ctx["pack"]
	manifest["uploads"][pack.id] = file_id
	save_manifest()
	if accept_tos:
		adapter.open_item_page(file_id)
	_begin_update(file_id)


func _on_item_updated(ok: bool, file_id: int, accept_tos: bool) -> void:
	if _upload_ctx.is_empty():
		return
	_upload_ctx = {}
	if accept_tos:
		adapter.open_item_page(file_id)
		upload_finished.emit(false, file_id, "Bạn cần chấp nhận Điều khoản Workshop của Steam rồi tải lên lại.")
		return
	upload_finished.emit(ok, file_id, "Đã tải lên." if ok else "Steam báo lỗi khi cập nhật item.")
