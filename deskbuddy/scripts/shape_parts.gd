class_name ShapeParts
extends RefCounted
## Danh mục bộ phận Kenney Shape Characters (CC0) dùng cho pack kind "shape".
## Nhân vật = thân (hình × màu) + mặt + hai tay, ghép và chuyển động lúc chạy.

const DIR := "res://art_src/kenney/shape"
const SHAPES := ["circle", "square", "squircle", "rhombus"]
const COLORS := ["blue", "green", "pink", "purple", "red", "yellow"]
const FACES := ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l"]
const HANDS := ["open", "closed", "peace", "point", "rock", "thumb"]

const SHAPE_NAMES := {"circle": "Tròn", "square": "Vuông", "squircle": "Vuông bo", "rhombus": "Thoi"}
const COLOR_NAMES := {"blue": "Xanh dương", "green": "Xanh lá", "pink": "Hồng", "purple": "Tím", "red": "Đỏ", "yellow": "Vàng"}
const HAND_NAMES := {"open": "Xoè", "closed": "Nắm", "peace": "Chữ V", "point": "Chỉ", "rock": "Rock", "thumb": "Like"}
const FACE_NAMES := {
	"a": "Tươi", "b": "Chán", "c": "Thư giãn", "d": "Láu cá", "e": "Ngạc nhiên", "f": "Cau có",
	"g": "Nhe răng", "h": "Gian", "i": "Lo lắng", "j": "Xỉu", "k": "Khóc", "l": "Cười tít",
}

## Mặt theo trạng thái. "" nghĩa là dùng mặt mặc định của pack.
const STATE_FACE := {"idle": "", "happy": "l", "sad": "k", "hungry": "i", "excited": "e", "eat": "a", "sleep": ""}
## Kiểu tay theo trạng thái: [trái, phải]
const STATE_HANDS := {
	"idle": ["open", "open"], "happy": ["thumb", "thumb"], "sad": ["closed", "closed"],
	"hungry": ["open", "closed"], "sleep": ["open", "open"], "eat": ["closed", "closed"],
	"excited": ["peace", "peace"],
}


static func body_path(shape: String, color: String) -> String:
	return DIR.path_join("%s_body_%s.png" % [color, shape])


static func face_path(face: String) -> String:
	return DIR.path_join("face_%s.png" % face)


static func hand_path(color: String, style: String) -> String:
	# Kenney đặt tên tay màu vàng khác các màu còn lại.
	if color == "yellow":
		return DIR.path_join("hand_yellow_%s.png" % style)
	return DIR.path_join("%s_hand_%s.png" % [color, style])


static func part_path(name: String) -> String:
	return DIR.path_join(name + ".png")


static func is_valid(shape: String, color: String, face: String, hands: String) -> bool:
	return SHAPES.has(shape) and COLORS.has(color) and FACES.has(face) and HANDS.has(hands)
