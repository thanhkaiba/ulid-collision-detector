class_name Personality
extends RefCounted
## Lớp tính cách tách khỏi hình hài. Pack chọn một archetype,
## engine sinh hành vi và câu nói. Pack có thể override từng nhóm câu.
##
## Sự kiện (event) hợp lệ cho câu nói:
## greet, hungry, sad, happy, fed, petted, focus_start, focus_done,
## user_idle, user_back, typing_burst, bored

const EVENTS := [
	"greet", "hungry", "sad", "happy", "fed", "petted",
	"focus_start", "focus_done", "user_idle", "user_back", "typing_burst", "bored",
]

const ARCHETYPES := {
	"clingy": {
		"name": "Bám người",
		"decay": {"energy": 1.0, "mood": 1.4, "bond": 0.8},
		"chatter_interval": 90.0,
		"lines": {
			"greet": ["Bạn về rồi!! Mình đợi nãy giờ đó.", "Cuối cùng cũng mở mình lên!"],
			"hungry": ["Mình đói... bạn có quên mình không?", "Cho mình ăn đi mà..."],
			"sad": ["Bạn không để ý mình nữa à?", "Hôm nay bạn chẳng nói gì với mình..."],
			"happy": ["Hihi, ở cạnh bạn là vui nhất.", "Hôm nay là ngày đẹp!"],
			"fed": ["Ngon quá! Cảm ơn bạn nha!", "Bạn nhớ cho mình ăn, vui ghê."],
			"petted": ["Nữa đi, nữa đi!", "Hihi, nhột quá!"],
			"focus_start": ["Mình ngồi đây cổ vũ bạn nhé!", "Cố lên! Mình nhìn bạn làm đây."],
			"focus_done": ["Bạn làm được rồi! Mình tự hào quá!", "Xong rồi! Nghỉ chút đi nào."],
			"user_idle": ["Bạn đi đâu rồi...", "Hello? Có ai không?"],
			"user_back": ["A, bạn quay lại rồi!", "Mình nhớ bạn lắm đó (mới 5 phút thôi)."],
			"typing_burst": ["Gõ nhanh quá! Đang làm gì vậy?", "Woa, bàn phím cháy luôn!"],
			"bored": ["Chơi với mình đi...", "Bạn ơi, mình chán."],
		},
	},
	"lazy": {
		"name": "Lười",
		"decay": {"energy": 1.2, "mood": 0.7, "bond": 1.0},
		"chatter_interval": 240.0,
		"lines": {
			"greet": ["Ờ... chào.", "Zzz... hả? À, chào."],
			"hungry": ["Đói. Nhưng lười than.", "Có gì ăn không... không có thì thôi."],
			"sad": ["Haizz.", "Hôm nay không có mood."],
			"happy": ["Hôm nay ổn. Khá ổn.", "Nằm thế này là đủ rồi."],
			"fed": ["Ờ, cũng được.", "Ngon. Giờ ngủ tiếp."],
			"petted": ["Mmm.", "Tiếp đi, đừng dừng."],
			"focus_start": ["Bạn làm, mình ngủ. Deal.", "Ok, gọi mình khi xong."],
			"focus_done": ["Xong rồi hả? Nhanh vậy.", "Giỏi. Giờ nghỉ với mình."],
			"user_idle": ["Zzz...", "..."],
			"user_back": ["Hả? À. Chào lại.", "Bạn đi lâu vậy, mình ngủ hai giấc rồi."],
			"typing_burst": ["Làm gì mà dữ vậy.", "Bình tĩnh, bàn phím có tội gì."],
			"bored": ["Chán. Nhưng chán cũng ổn.", "Mình nằm đây thôi."],
		},
	},
	"tsundere": {
		"name": "Tsundere",
		"decay": {"energy": 1.0, "mood": 1.1, "bond": 1.2},
		"chatter_interval": 150.0,
		"lines": {
			"greet": ["Hừm, cũng chịu mở mình lên rồi à.", "Đừng tưởng mình chờ bạn nhé."],
			"hungry": ["Không phải mình đói đâu... nhưng có gì ăn không?", "Bạn định bỏ đói mình thật à?!"],
			"sad": ["Mình không buồn. Chỉ là... thôi bỏ đi.", "Hừ. Không có gì."],
			"happy": ["Hôm nay... cũng không tệ lắm. Vì bạn. Không, không phải!", "Đừng cười, mình chỉ hơi vui thôi."],
			"fed": ["...Cảm ơn. Đừng để ý.", "Ờ thì cũng ngon. Đừng tự mãn."],
			"petted": ["Ê! Ai cho phép?!... Thôi được, một chút thôi.", "Đ-đừng làm vậy nữa! ...Hay là làm tiếp."],
			"focus_start": ["Làm cho đàng hoàng đấy. Mình nhìn đây.", "Lần này đừng bỏ giữa chừng nhé."],
			"focus_done": ["Ồ... giỏi hơn mình nghĩ.", "Cũng được. Chỉ là cũng được thôi."],
			"user_idle": ["Lại đi đâu rồi.", "Không phải mình để ý đâu nhé."],
			"user_back": ["Về rồi à. Mình chẳng để ý.", "Lâu vậy? ...Không sao."],
			"typing_burst": ["Gõ gì mà như đánh nhau vậy.", "Hừ, cũng chăm chỉ ghê."],
			"bored": ["Chán. Không phải lỗi của bạn. Có lẽ.", "Ít ra nói gì đi."],
		},
	},
	"supportive": {
		"name": "Hỗ trợ",
		"decay": {"energy": 0.9, "mood": 0.8, "bond": 0.7},
		"chatter_interval": 180.0,
		"lines": {
			"greet": ["Chào bạn! Hôm nay mình làm gì nào?", "Rất vui được gặp lại bạn."],
			"hungry": ["Mình hơi đói, nhưng bạn cứ làm việc trước nhé.", "Khi nào tiện thì cho mình ăn nha."],
			"sad": ["Hôm nay hơi trầm, nhưng sẽ qua thôi.", "Mình ổn. Bạn thì sao?"],
			"happy": ["Mình thấy hôm nay bạn làm tốt lắm.", "Năng lượng tốt quá!"],
			"fed": ["Cảm ơn bạn. Bạn cũng nhớ ăn uống nhé.", "Ngon lắm! Bạn uống nước chưa?"],
			"petted": ["Cảm ơn, mình cần điều đó.", "Bạn tốt quá."],
			"focus_start": ["Tuyệt. Tắt thông báo và bắt đầu nào.", "Một việc một lúc thôi. Bạn làm được."],
			"focus_done": ["Hoàn thành! Đứng lên vươn vai một chút nhé.", "Xong một phiên. Bạn giỏi lắm."],
			"user_idle": ["Nghỉ ngơi cũng là một phần của làm việc.", "Mình chờ bạn ở đây."],
			"user_back": ["Chào mừng trở lại. Tiếp tục nhé?", "Bạn về rồi. Bắt đầu lại nhẹ nhàng thôi."],
			"typing_burst": ["Đang vào guồng rồi đó!", "Giữ nhịp này nhé."],
			"bored": ["Hay thử một phiên tập trung ngắn?", "Mình có ý này: làm việc nhỏ nhất trước."],
		},
	},
	"chaos": {
		"name": "Hỗn loạn",
		"decay": {"energy": 1.1, "mood": 1.0, "bond": 1.0},
		"chatter_interval": 60.0,
		"lines": {
			"greet": ["BÙM! Mình đây!", "Hôm nay phá gì nào?"],
			"hungry": ["ĐÓI. CHO ĂN. NGAY.", "Mình sắp ăn con trỏ chuột của bạn đó."],
			"sad": ["Buồn. Muốn đập cái gì đó.", "Không vui. Không vui tí nào."],
			"happy": ["HAHAHA hôm nay đỉnh!", "Mình muốn nhảy khắp màn hình!"],
			"fed": ["NHAM NHAM NHAM.", "Nữa! NỮA!"],
			"petted": ["Hehehe. Nữa. Hay là không. Hay là có.", "Bạn chạm vào mình, giờ mình là bạn thân."],
			"focus_start": ["Tập trung? Mình thử... không hứa.", "Ok ok mình ngồi im. 3... 2..."],
			"focus_done": ["XONG! Mình ngồi im được cả phiên! Kỳ tích!", "Thưởng đi! Thưởng cho cả hai!"],
			"user_idle": ["Bạn đi rồi hả? Mình đổi wallpaper nhé? Đùa thôi.", "Một mình với cả màn hình... hehe."],
			"user_back": ["Bạn về rồi! Mình không làm gì cả. Thật.", "Tại sao có nhiều tab vậy?!"],
			"typing_burst": ["GÕ GÕ GÕ GÕ!", "Bàn phím kêu cứu kìa!"],
			"bored": ["CHÁN. Làm gì đi.", "Mình đếm pixel được 4000 rồi."],
		},
	},
	"strict": {
		"name": "Nghiêm khắc",
		"decay": {"energy": 1.0, "mood": 1.0, "bond": 1.3},
		"chatter_interval": 200.0,
		"lines": {
			"greet": ["Đúng giờ. Tốt.", "Bắt đầu đi. Thời gian không chờ."],
			"hungry": ["Người ta cho tôi ăn đúng giờ. Bạn thì không.", "Năng lượng thấp. Khắc phục."],
			"sad": ["Hiệu suất tuần này đáng thất vọng.", "Tôi không hài lòng. Bạn biết lý do."],
			"happy": ["Chấp nhận được. Hơn cả chấp nhận được.", "Tiếp tục như vậy."],
			"fed": ["Ghi nhận.", "Tốt. Giờ quay lại làm việc."],
			"petted": ["Không cần thiết. ...Nhưng không phản đối.", "Tập trung vào việc đi."],
			"focus_start": ["25 phút. Không điện thoại.", "Tôi đang đếm."],
			"focus_done": ["Hoàn thành. Ghi nhận một phiên.", "Tốt. Phiên tiếp theo?"],
			"user_idle": ["Rời vị trí.", "Tôi ghi lại thời gian này."],
			"user_back": ["Bạn đã vắng mặt. Giải thích sau. Làm việc trước.", "Quay lại rồi. Tiếp tục."],
			"typing_burst": ["Nhịp độ tốt.", "Đó. Như vậy đó."],
			"bored": ["Chán là dấu hiệu bạn chưa có việc đủ khó.", "Chọn một việc. Làm nó."],
		},
	},
}

const DEFAULT_ARCHETYPE := "supportive"


static func has(id: String) -> bool:
	return ARCHETYPES.has(id)


static func get_archetype(id: String) -> Dictionary:
	if ARCHETYPES.has(id):
		return ARCHETYPES[id]
	return ARCHETYPES[DEFAULT_ARCHETYPE]


static func decay_multipliers(id: String) -> Dictionary:
	return get_archetype(id)["decay"].duplicate()


static func chatter_interval(id: String) -> float:
	return float(get_archetype(id)["chatter_interval"])


## Chọn một câu cho sự kiện. overrides là dict lines từ pack (có thể rỗng).
static func pick_line(id: String, event: String, overrides: Dictionary = {}, rng: RandomNumberGenerator = null) -> String:
	var pool: Array = []
	if overrides.has(event) and overrides[event] is Array and not overrides[event].is_empty():
		pool = overrides[event]
	else:
		var lines: Dictionary = get_archetype(id)["lines"]
		if lines.has(event):
			pool = lines[event]
	if pool.is_empty():
		return ""
	if rng == null:
		return str(pool[randi() % pool.size()])
	return str(pool[rng.randi() % pool.size()])
