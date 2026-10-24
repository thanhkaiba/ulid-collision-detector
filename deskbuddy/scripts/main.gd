extends Node2D
## Điểm vào của DeskBuddy. Nối cửa sổ trong suốt, nhân vật, nhu cầu,
## tính cách, theo dõi hoạt động, phiên tập trung, menu và lưu trữ.

const AUTOSAVE_SECONDS := 30.0
const PET_COOLDOWN_SECONDS := 20.0
const FOCUS_MINUTES := 25.0
const GREET_DELAY := 1.0
## Pack dùng lần đầu mở app, nếu có.
const DEFAULT_PACK_ID := "potato"

enum MenuId { FEED, PET, FOCUS_START, FOCUS_CANCEL, OPEN_PACKS_DIR, RELOAD_PACKS, QUIT }
const PACK_MENU_BASE := 1000

var packs: Array[BuddyPack] = []
var pack: BuddyPack
var needs := BuddyNeeds.new()
var save := {}
var snacks := 3

var buddy: Buddy
var hud: Hud
var menu: PopupMenu
var pack_menu: PopupMenu
var activity: ActivityMonitor
var focus: FocusSession

var _autosave_accum := 0.0
var _chatter_accum := 0.0
var _last_pet_unix := 0.0
var _last_state := ""
var _user_idle := false
var _last_passthrough := Rect2()
## Chỉ cho công cụ chụp màn hình: ép hiện HUD.
var debug_force_hud := false


func _ready() -> void:
	_setup_window()
	PackLoader.ensure_user_dir()
	packs = PackLoader.scan()
	save = SaveManager.load_data()
	snacks = int(save.get("snacks", 3))
	if save.get("needs") is Dictionary:
		needs.from_dict(save["needs"])

	_build_nodes()
	_build_menu()

	pack = PackLoader.find(packs, str(save.get("pack_id", "")))
	if pack == null:
		pack = PackLoader.find(packs, DEFAULT_PACK_ID)
	if pack == null:
		for p in packs:
			if p.is_valid():
				pack = p
				break
	if pack == null:
		push_error("Không có pack hợp lệ nào trong res://packs hoặc %s" % PackLoader.user_packs_dir())
		get_tree().quit(1)
		return

	var hours_away := 0.0
	var last_seen := float(save.get("last_seen_unix", 0))
	if last_seen > 0.0:
		hours_away = needs.apply_offline(Time.get_unix_time_from_system() - last_seen)

	_apply_pack(pack, false)
	_restore_window_position()

	await get_tree().create_timer(GREET_DELAY).timeout
	if hours_away >= 8.0 and needs.is_neglected():
		_say(needs.state())
	else:
		_say("greet")


func _setup_window() -> void:
	var w := get_window()
	w.title = "DeskBuddy"
	w.transparent_bg = true
	w.borderless = true
	w.always_on_top = true
	w.unresizable = true
	DisplayServer.window_set_flag(DisplayServer.WINDOW_FLAG_TRANSPARENT, true)


func _build_nodes() -> void:
	activity = ActivityMonitor.new()
	add_child(activity)
	activity.user_idle.connect(_on_user_idle)
	activity.user_back.connect(_on_user_back)
	activity.typing_burst.connect(_on_typing_burst)

	focus = FocusSession.new()
	add_child(focus)
	focus.started.connect(_on_focus_started)
	focus.finished.connect(_on_focus_finished)
	focus.cancelled.connect(_on_focus_cancelled)

	var wsize := get_window().size
	buddy = Buddy.new()
	buddy.position = Vector2(wsize.x / 2.0, wsize.y - 8.0)
	add_child(buddy)
	buddy.clicked.connect(_on_buddy_clicked)
	buddy.menu_requested.connect(_on_menu_requested)
	buddy.drag_finished.connect(_on_drag_finished)

	var layer := CanvasLayer.new()
	add_child(layer)
	hud = Hud.new()
	hud.position = Vector2(8, 8)
	hud.visible = false
	layer.add_child(hud)


func _build_menu() -> void:
	menu = PopupMenu.new()
	add_child(menu)
	pack_menu = PopupMenu.new()
	pack_menu.name = "packs"
	menu.add_child(pack_menu)
	menu.id_pressed.connect(_on_menu_pressed)
	pack_menu.id_pressed.connect(_on_pack_menu_pressed)
	_refresh_menu()


func _refresh_menu() -> void:
	menu.clear()
	var food := pack.food_name() if pack != null else "Đồ ăn"
	menu.add_item("%s (còn %d)" % [food, snacks], MenuId.FEED)
	menu.set_item_disabled(menu.get_item_index(MenuId.FEED), snacks <= 0)
	menu.add_item("Vuốt ve", MenuId.PET)
	menu.add_separator()
	if focus.running:
		menu.add_item("Huỷ phiên tập trung (%s)" % focus.remaining_text(), MenuId.FOCUS_CANCEL)
	else:
		menu.add_item("Bắt đầu tập trung %d phút" % int(FOCUS_MINUTES), MenuId.FOCUS_START)
	menu.add_separator()
	menu.add_submenu_item("Đổi nhân vật", "packs")
	menu.add_item("Mở thư mục packs", MenuId.OPEN_PACKS_DIR)
	menu.add_item("Nạp lại packs", MenuId.RELOAD_PACKS)
	menu.add_separator()
	menu.add_item("Thoát", MenuId.QUIT)

	pack_menu.clear()
	for i in packs.size():
		var p := packs[i]
		var label := p.name
		if not p.is_valid():
			label += "  (lỗi: %s)" % p.errors[0]
		pack_menu.add_check_item(label, PACK_MENU_BASE + i)
		var idx := pack_menu.get_item_index(PACK_MENU_BASE + i)
		pack_menu.set_item_checked(idx, pack != null and p.id == pack.id)
		pack_menu.set_item_disabled(idx, not p.is_valid())


func _apply_pack(p: BuddyPack, greet := true) -> void:
	pack = p
	save["pack_id"] = pack.id
	needs.decay_multipliers = Personality.decay_multipliers(pack.personality)
	buddy.setup(pack)
	hud.set_pack(pack)
	_last_state = ""
	_chatter_accum = 0.0
	_refresh_menu()
	if greet:
		_say("greet")


func _process(delta: float) -> void:
	if pack == null:
		return
	needs.apply_decay(delta / 3600.0)

	var state := needs.state()
	if state != _last_state:
		var was := _last_state
		_last_state = state
		if was != "" and (state == "hungry" or state == "sad"):
			_say(state)
	buddy.set_base_state("sleep" if _user_idle else state)

	if not _user_idle:
		_chatter_accum += delta
		if _chatter_accum >= Personality.chatter_interval(pack.personality):
			_chatter_accum = 0.0
			_say("happy" if state == "happy" else ("bored" if state == "idle" else state))

	hud.visible = debug_force_hud or buddy.is_hovered() or focus.running or menu.visible
	if hud.visible:
		hud.update_needs(needs, snacks, pack.food_name())
		hud.update_focus(focus)
	_update_passthrough()

	_autosave_accum += delta
	if _autosave_accum >= AUTOSAVE_SECONDS:
		_autosave_accum = 0.0
		_save()


## Chỉ vùng có nhân vật (và HUD khi hiện) nhận click; phần trong suốt
## còn lại cho click xuyên xuống desktop.
func _update_passthrough() -> void:
	var r := buddy.get_global_rect().grow(6.0)
	if hud.visible:
		r = r.merge(Rect2(hud.position, hud.size))
	if r.is_equal_approx(_last_passthrough):
		return
	_last_passthrough = r
	DisplayServer.window_set_mouse_passthrough(PackedVector2Array([
		r.position, Vector2(r.end.x, r.position.y), r.end, Vector2(r.position.x, r.end.y),
	]))


func _say(event: String) -> void:
	buddy.say(Personality.pick_line(pack.personality, event, pack.lines))


# ---------- Hành động của người dùng ----------

func _on_buddy_clicked() -> void:
	var now := Time.get_unix_time_from_system()
	if now - _last_pet_unix < PET_COOLDOWN_SECONDS:
		return
	_last_pet_unix = now
	needs.pet()
	save["stats"]["pet_count"] = int(save["stats"].get("pet_count", 0)) + 1
	buddy.play_temp("happy", 2.0)
	_say("petted")


func _on_menu_requested() -> void:
	_refresh_menu()
	menu.position = DisplayServer.mouse_get_position()
	menu.popup()


func _on_drag_finished() -> void:
	_save()


func _on_menu_pressed(id: int) -> void:
	match id:
		MenuId.FEED:
			_feed()
		MenuId.PET:
			_on_buddy_clicked()
		MenuId.FOCUS_START:
			focus.start(FOCUS_MINUTES)
		MenuId.FOCUS_CANCEL:
			focus.cancel()
		MenuId.OPEN_PACKS_DIR:
			PackLoader.ensure_user_dir()
			OS.shell_open(PackLoader.user_packs_dir())
		MenuId.RELOAD_PACKS:
			packs = PackLoader.scan()
			var same := PackLoader.find(packs, pack.id)
			if same != null:
				_apply_pack(same, false)
			_refresh_menu()
		MenuId.QUIT:
			_save_and_quit()


func _on_pack_menu_pressed(id: int) -> void:
	var i := id - PACK_MENU_BASE
	if i < 0 or i >= packs.size():
		return
	var p := packs[i]
	if p.is_valid() and p.id != pack.id:
		_apply_pack(p)
		_save()


func _feed() -> void:
	if snacks <= 0:
		buddy.say("Hết %s rồi. Hoàn thành một phiên tập trung để kiếm thêm." % pack.food_name().to_lower())
		return
	snacks -= 1
	needs.feed()
	save["stats"]["fed_count"] = int(save["stats"].get("fed_count", 0)) + 1
	buddy.play_temp("eat", 2.5)
	_say("fed")


# ---------- Phiên tập trung ----------

func _on_focus_started(_minutes: float) -> void:
	_say("focus_start")


func _on_focus_finished(minutes: float, snacks_earned: int) -> void:
	snacks += snacks_earned
	needs.reward_focus(minutes)
	save["stats"]["focus_minutes_total"] = int(save["stats"].get("focus_minutes_total", 0)) + int(minutes)
	save["stats"]["focus_sessions"] = int(save["stats"].get("focus_sessions", 0)) + 1
	buddy.play_temp("excited", 4.0)
	buddy.say("%s  (+%d %s)" % [
		Personality.pick_line(pack.personality, "focus_done", pack.lines), snacks_earned, pack.food_name().to_lower()], 6.0)
	_save()


func _on_focus_cancelled(_elapsed: float) -> void:
	buddy.say("Phiên đã huỷ. Lần sau nhé.")


# ---------- Hoạt động người dùng ----------

func _on_user_idle() -> void:
	_user_idle = true
	_say("user_idle")


func _on_user_back(_seconds_away: float) -> void:
	_user_idle = false
	_say("user_back")


func _on_typing_burst() -> void:
	buddy.play_temp("excited", 3.0)
	_say("typing_burst")


# ---------- Cửa sổ và lưu trữ ----------

func _restore_window_position() -> void:
	var w := get_window()
	var pos: Vector2i
	var saved = save.get("window_pos")
	if saved is Array and saved.size() == 2:
		pos = Vector2i(int(saved[0]), int(saved[1]))
	else:
		var usable := DisplayServer.screen_get_usable_rect(DisplayServer.SCREEN_PRIMARY)
		pos = usable.end - w.size - Vector2i(48, 0)
	# Kẹp vào màn hình hiện có, tránh mất nhân vật khi đổi monitor.
	var bounds := DisplayServer.screen_get_usable_rect(DisplayServer.SCREEN_PRIMARY)
	var half := Vector2i(floori(w.size.x / 2.0), floori(w.size.y / 2.0))
	pos.x = clampi(pos.x, bounds.position.x - half.x, bounds.end.x - half.x)
	pos.y = clampi(pos.y, bounds.position.y, bounds.end.y - half.y)
	w.position = pos


func _save() -> void:
	save["needs"] = needs.to_dict()
	save["snacks"] = snacks
	save["pack_id"] = pack.id if pack != null else ""
	save["last_seen_unix"] = int(Time.get_unix_time_from_system())
	var p := get_window().position
	save["window_pos"] = [p.x, p.y]
	SaveManager.save_data(save)


func _save_and_quit() -> void:
	_save()
	get_tree().quit()


func _exit_tree() -> void:
	# Chạy ở mọi kiểu thoát (menu, đóng cửa sổ, --quit-after), nên luôn lưu.
	if pack != null:
		_save()


func _notification(what: int) -> void:
	if what == NOTIFICATION_WM_CLOSE_REQUEST:
		_save_and_quit()
