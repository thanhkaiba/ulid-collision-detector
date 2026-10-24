class_name FocusSession
extends Node
## Phiên tập trung kiểu Pomodoro. Hoàn thành phiên là cách duy nhất kiếm
## "đồ ăn" cho nhân vật, không mua bằng tiền thật.

signal started(minutes: float)
signal finished(minutes: float, snacks_earned: int)
signal cancelled(elapsed_minutes: float)
signal tick(remaining_seconds: float)

const SNACKS_PER_BLOCK := 1
const BLOCK_MINUTES := 25.0

var running := false
var total_seconds := 0.0
var remaining_seconds := 0.0


func start(minutes: float = BLOCK_MINUTES) -> void:
	if running:
		return
	total_seconds = maxf(60.0, minutes * 60.0)
	remaining_seconds = total_seconds
	running = true
	started.emit(minutes)


func cancel() -> void:
	if not running:
		return
	running = false
	cancelled.emit((total_seconds - remaining_seconds) / 60.0)


func _process(delta: float) -> void:
	if not running:
		return
	remaining_seconds -= delta
	tick.emit(maxf(0.0, remaining_seconds))
	if remaining_seconds <= 0.0:
		running = false
		var minutes := total_seconds / 60.0
		finished.emit(minutes, snacks_for(minutes))


static func snacks_for(minutes: float) -> int:
	return maxi(1, int(floor(minutes / BLOCK_MINUTES))) * SNACKS_PER_BLOCK


func remaining_text() -> String:
	var s := int(ceil(remaining_seconds))
	@warning_ignore("integer_division")
	return "%02d:%02d" % [s / 60, s % 60]
