class_name SteamAdapter
extends Node
## Lớp mỏng bọc GodotSteam (GDExtension, godotsteam.com) cho Steam Workshop.
## Mọi tên hàm/tín hiệu khớp GodotSteam 4.x: createItem, startItemUpdate,
## setItemTitle/Description/Preview/Content/Tags/Visibility, submitItemUpdate,
## getSubscribedItems, getItemState, getItemInstallInfo, downloadItem,
## tín hiệu item_created, item_updated, item_installed,
## user_subscribed_items_list_changed.
##
## Không có GodotSteam hoặc Steam không chạy → is_available() = false và app
## vẫn hoạt động bình thường (chia sẻ zip). FakeSteamAdapter dùng cho test.

signal item_created(ok: bool, file_id: int, accept_tos: bool)
signal item_updated(ok: bool, file_id: int, accept_tos: bool)
signal item_installed(file_id: int)
signal subscriptions_changed()

## App ID Steam của bạn. 480 là app test "Spacewar" của Valve, dùng lúc phát triển.
const APP_ID := 480

## Giá trị chuẩn Steamworks (EItemState, EResult), GodotSteam dùng cùng số.
const ITEM_STATE_SUBSCRIBED := 1
const ITEM_STATE_INSTALLED := 4
const ITEM_STATE_NEEDS_UPDATE := 8
const ITEM_STATE_DOWNLOADING := 16
const ITEM_STATE_DOWNLOAD_PENDING := 32
const RESULT_OK := 1
const WORKSHOP_FILE_TYPE_COMMUNITY := 0
const VISIBILITY_PUBLIC := 0

var steam: Object
var app_id := APP_ID
var _initialized := false
var _status := "Chưa khởi tạo"
var _update_handle := 0
var _pending_file_id := 0


func _ready() -> void:
	steam = _resolve_steam()
	if steam == null:
		_status = "Chưa cài GodotSteam (addons/godotsteam). Xem addons/README.md."
		return
	if steam.has_method("isSteamRunning") and not steam.isSteamRunning():
		_status = "Steam client chưa chạy."
		return
	var r = steam.steamInitEx(app_id, false)
	var ok := false
	if r is Dictionary:
		ok = int(r.get("status", 1)) == 0
		if not ok:
			_status = "steamInitEx thất bại: %s" % str(r.get("verbal", r))
	else:
		ok = bool(r)
	if not ok:
		return
	_initialized = true
	_status = "Đã kết nối Steam (app %d)" % app_id
	_connect("item_created", _on_item_created)
	_connect("item_updated", _on_item_updated)
	_connect("item_installed", _on_item_installed)
	_connect("user_subscribed_items_list_changed", _on_subs_changed)


func _process(_delta: float) -> void:
	if _initialized and steam.has_method("run_callbacks"):
		steam.run_callbacks()


## GodotSteam có thể là Engine singleton, autoload "/root/Steam" hoặc lớp.
static func _resolve_steam() -> Object:
	if Engine.has_singleton("Steam"):
		return Engine.get_singleton("Steam")
	var tree := Engine.get_main_loop() as SceneTree
	if tree != null and tree.root != null:
		var auto := tree.root.get_node_or_null("Steam")
		if auto != null:
			return auto
	if ClassDB.class_exists("Steam") and ClassDB.can_instantiate("Steam"):
		return ClassDB.instantiate("Steam")
	return null


func _connect(sig: String, cb: Callable) -> void:
	if steam.has_signal(sig) and not steam.is_connected(sig, cb):
		steam.connect(sig, cb)


func is_available() -> bool:
	return _initialized


func status_text() -> String:
	return _status


# ---------- upload ----------

func create_item() -> void:
	steam.createItem(app_id, WORKSHOP_FILE_TYPE_COMMUNITY)


## Bắt đầu cập nhật item. preview_abs, content_abs là đường dẫn tuyệt đối thật.
func update_item(file_id: int, title: String, description: String, preview_abs: String, content_abs: String, tags: Array, change_note: String) -> bool:
	_update_handle = int(steam.startItemUpdate(app_id, file_id))
	if _update_handle == 0:
		return false
	_pending_file_id = file_id
	var ok := true
	ok = steam.setItemTitle(_update_handle, title) and ok
	ok = steam.setItemDescription(_update_handle, description) and ok
	ok = steam.setItemContent(_update_handle, content_abs) and ok
	if preview_abs != "" and FileAccess.file_exists(preview_abs):
		ok = steam.setItemPreview(_update_handle, preview_abs) and ok
	if not tags.is_empty():
		ok = steam.setItemTags(_update_handle, tags, false) and ok
	ok = steam.setItemVisibility(_update_handle, VISIBILITY_PUBLIC) and ok
	if not ok:
		return false
	steam.submitItemUpdate(_update_handle, change_note)
	return true


## {status, processed, total}; status 0 = không có update đang chạy.
func update_progress() -> Dictionary:
	if _update_handle == 0:
		return {"status": 0, "processed": 0, "total": 0}
	var d = steam.getItemUpdateProgress(_update_handle)
	return d if d is Dictionary else {"status": 0, "processed": 0, "total": 0}


# ---------- download ----------

func subscribed_items() -> Array:
	var a = steam.getSubscribedItems(false)
	return a if a is Array else []


func item_state(file_id: int) -> int:
	return int(steam.getItemState(file_id))


## {ok, folder, timestamp}
func install_info(file_id: int) -> Dictionary:
	var d = steam.getItemInstallInfo(file_id)
	if d is Dictionary and bool(d.get("ret", false)):
		return {"ok": true, "folder": str(d.get("folder", "")), "timestamp": int(d.get("timestamp", 0))}
	return {"ok": false, "folder": "", "timestamp": 0}


func download(file_id: int) -> bool:
	return bool(steam.downloadItem(file_id, true))


func open_item_page(file_id: int) -> void:
	if steam != null and steam.has_method("activateGameOverlayToWebPage"):
		steam.activateGameOverlayToWebPage("steam://url/CommunityFilePage/%d" % file_id)
	else:
		OS.shell_open("https://steamcommunity.com/sharedfiles/filedetails/?id=%d" % file_id)


# ---------- callbacks ----------

func _on_item_created(result: int, file_id: int, accept_tos: bool) -> void:
	item_created.emit(result == RESULT_OK, file_id, accept_tos)


func _on_item_updated(result: int, accept_tos: bool, file_id: int) -> void:
	_update_handle = 0
	if file_id == 0:
		file_id = _pending_file_id
	item_updated.emit(result == RESULT_OK, file_id, accept_tos)


func _on_item_installed(_app: int, file_id: int) -> void:
	item_installed.emit(file_id)


func _on_subs_changed(_app: int) -> void:
	subscriptions_changed.emit()
