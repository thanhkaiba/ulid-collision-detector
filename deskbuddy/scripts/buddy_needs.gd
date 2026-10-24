class_name BuddyNeeds
extends RefCounted
## Ba thanh nhu cầu trừu tượng dùng chung cho mọi nhân vật.
## Pack chỉ đổi tên và icon, logic ở đây không đổi.
##
## energy  : "đói" theo nghĩa rộng (nước cho khoai, trà sữa cho anime girl...)
## mood    : tâm trạng
## bond    : gắn kết với người dùng, tăng rất chậm, chỉ giảm khi bị bỏ bê

const MAX := 100.0
## Không bao giờ chết. Dưới sàn này nhân vật chỉ buồn và lười.
const FLOOR := 10.0
## Tối đa 12 giờ decay được áp khi mở app lại, để nghỉ 1 tuần không bị về đáy.
const OFFLINE_CAP_HOURS := 12.0
const BASE_DECAY_PER_HOUR := {"energy": 8.0, "mood": 5.0, "bond": 1.5}

const HUNGRY_THRESHOLD := 25.0
const SAD_THRESHOLD := 25.0
const HAPPY_THRESHOLD := 70.0

var energy := 80.0
var mood := 80.0
var bond := 20.0
## Tính cách chỉnh tốc độ decay qua đây (xem Personality).
var decay_multipliers := {"energy": 1.0, "mood": 1.0, "bond": 1.0}


func apply_decay(hours: float) -> void:
	if hours <= 0.0:
		return
	energy = _decay(energy, BASE_DECAY_PER_HOUR["energy"] * decay_multipliers["energy"] * hours)
	mood = _decay(mood, BASE_DECAY_PER_HOUR["mood"] * decay_multipliers["mood"] * hours)
	# Gắn kết chỉ giảm khi nhân vật đang bị bỏ bê.
	if is_neglected():
		bond = _decay(bond, BASE_DECAY_PER_HOUR["bond"] * decay_multipliers["bond"] * hours)


## Gọi khi mở app lại. Trả về số giờ decay thực sự được áp.
func apply_offline(seconds_away: float) -> float:
	var hours := minf(maxf(seconds_away, 0.0) / 3600.0, OFFLINE_CAP_HOURS)
	apply_decay(hours)
	return hours


func feed(amount := 25.0) -> void:
	energy = minf(MAX, energy + amount)
	mood = minf(MAX, mood + 5.0)


func pet() -> void:
	mood = minf(MAX, mood + 6.0)
	bond = minf(MAX, bond + 1.0)


## Phần thưởng khi hoàn thành một phiên tập trung.
func reward_focus(minutes: float) -> void:
	var blocks := minutes / 25.0
	bond = minf(MAX, bond + 3.0 * blocks)
	mood = minf(MAX, mood + 10.0 * blocks)


func is_neglected() -> bool:
	return energy < HUNGRY_THRESHOLD or mood < SAD_THRESHOLD


## Trạng thái dẫn xuất, dùng để chọn animation và câu nói.
func state() -> String:
	if energy < HUNGRY_THRESHOLD:
		return "hungry"
	if mood < SAD_THRESHOLD:
		return "sad"
	if energy >= HAPPY_THRESHOLD and mood >= HAPPY_THRESHOLD:
		return "happy"
	return "idle"


func to_dict() -> Dictionary:
	return {"energy": energy, "mood": mood, "bond": bond}


func from_dict(d: Dictionary) -> void:
	energy = clampf(float(d.get("energy", energy)), FLOOR, MAX)
	mood = clampf(float(d.get("mood", mood)), FLOOR, MAX)
	bond = clampf(float(d.get("bond", bond)), 0.0, MAX)


func _decay(value: float, amount: float) -> float:
	return maxf(FLOOR, value - amount)
