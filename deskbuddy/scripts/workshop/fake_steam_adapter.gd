class_name FakeSteamAdapter
extends Node
## Giả lập Steam Workshop trong bộ nhớ, cùng giao diện với SteamAdapter.
## Dùng cho test và để chạy thử luồng Workshop khi chưa có Steam.
## "Kho Steam" = thư mục user://fake_steam/<file_id>/.

signal item_created(ok: bool, file_id: int, accept_tos: bool)
signal item_updated(ok: bool, file_id: int, accept_tos: bool)
signal item_installed(file_id: int)
signal subscriptions_changed()

const STORE := "user://fake_steam"

var items := {}          # file_id -> {title, description, content, preview, tags, timestamp}
var subscribed: Array = []
var installed := {}      # file_id -> timestamp
var next_id := 1000
var fail_next_create := false
var auto_install := true
var _pending_update := {}


func is_available() -> bool:
	return true


func status_text() -> String:
	return "Steam giả lập (FakeSteamAdapter)"


func create_item() -> void:
	if fail_next_create:
		fail_next_create = false
		item_created.emit(false, 0, false)
		return
	var id := next_id
	next_id += 1
	items[id] = {"title": "", "description": "", "content": "", "preview": "", "tags": [], "timestamp": 0}
	item_created.emit(true, id, false)


func update_item(file_id: int, title: String, description: String, preview_abs: String, content_abs: String, tags: Array, change_note: String) -> bool:
	if not items.has(file_id):
		return false
	var it: Dictionary = items[file_id]
	it["title"] = title
	it["description"] = description
	it["preview"] = preview_abs
	it["tags"] = tags
	it["change_note"] = change_note
	it["timestamp"] = int(it["timestamp"]) + 1
	# "Tải lên": chép thư mục content vào kho.
	var dest := STORE.path_join(str(file_id))
	_copy_dir(content_abs, dest)
	it["content"] = ProjectSettings.globalize_path(dest)
	_pending_update = {"file_id": file_id}
	item_updated.emit(true, file_id, false)
	return true


func update_progress() -> Dictionary:
	return {"status": 0, "processed": 0, "total": 0}


func subscribed_items() -> Array:
	return subscribed.duplicate()


func item_state(file_id: int) -> int:
	var s := 0
	if subscribed.has(file_id):
		s |= SteamAdapter.ITEM_STATE_SUBSCRIBED
	if installed.has(file_id):
		s |= SteamAdapter.ITEM_STATE_INSTALLED
		if items.has(file_id) and int(items[file_id]["timestamp"]) > int(installed[file_id]):
			s |= SteamAdapter.ITEM_STATE_NEEDS_UPDATE
	return s


func install_info(file_id: int) -> Dictionary:
	if not installed.has(file_id) or not items.has(file_id):
		return {"ok": false, "folder": "", "timestamp": 0}
	return {"ok": true, "folder": str(items[file_id]["content"]), "timestamp": int(installed[file_id])}


func download(file_id: int) -> bool:
	if not items.has(file_id):
		return false
	if auto_install:
		installed[file_id] = int(items[file_id]["timestamp"])
		item_installed.emit(file_id)
	return true


func open_item_page(_file_id: int) -> void:
	pass


# ---------- tiện ích cho test ----------

## Tạo sẵn một item trên "Steam" từ thư mục pack (giả lập người khác đã đăng).
func seed_item(content_dir: String, timestamp := 1) -> int:
	var id := next_id
	next_id += 1
	var dest := STORE.path_join(str(id))
	_copy_dir(content_dir, dest)
	items[id] = {"title": "seed", "description": "", "content": ProjectSettings.globalize_path(dest), "preview": "", "tags": [], "timestamp": timestamp}
	return id


func subscribe(file_id: int) -> void:
	if not subscribed.has(file_id):
		subscribed.append(file_id)
		subscriptions_changed.emit()


func unsubscribe(file_id: int) -> void:
	subscribed.erase(file_id)
	installed.erase(file_id)
	subscriptions_changed.emit()


## Giả lập tác giả đăng bản mới: ghi đè file trong kho và tăng timestamp.
func publish_new_version(file_id: int, content_dir: String) -> void:
	var dest := STORE.path_join(str(file_id))
	_copy_dir(content_dir, dest)
	items[file_id]["timestamp"] = int(items[file_id]["timestamp"]) + 1


static func _copy_dir(src: String, dst: String) -> void:
	DirAccess.make_dir_recursive_absolute(ProjectSettings.globalize_path(dst) if dst.begins_with("user://") else dst)
	for f in PackLoader.list_files(src):
		var bytes := FileAccess.get_file_as_bytes(src.path_join(f))
		var out := FileAccess.open(dst.path_join(f), FileAccess.WRITE)
		if out != null:
			out.store_buffer(bytes)
			out.close()


func wipe() -> void:
	for id in items.keys():
		var dir := STORE.path_join(str(id))
		for f in PackLoader.list_files(dir):
			DirAccess.remove_absolute(ProjectSettings.globalize_path(dir.path_join(f)))
		DirAccess.remove_absolute(ProjectSettings.globalize_path(dir))
	DirAccess.remove_absolute(ProjectSettings.globalize_path(STORE))
	items.clear()
	subscribed.clear()
	installed.clear()
