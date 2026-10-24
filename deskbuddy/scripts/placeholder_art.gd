class_name PlaceholderArt
extends RefCounted
## Vẽ một "cục" có mặt bằng pixel khi pack thiếu sprite sheet,
## để pack vẫn chạy được trong lúc họa sĩ chưa xong.


static func build(color: Color, size := 64) -> SpriteFrames:
	var frames := SpriteFrames.new()
	frames.remove_animation("default")
	for anim in BuddyPack.KNOWN_ANIMATIONS:
		frames.add_animation(anim)
		frames.set_animation_speed(anim, 2.0)
		frames.set_animation_loop(anim, true)
		for i in 2:
			frames.add_frame(anim, ImageTexture.create_from_image(_frame(anim, i, color, size)))
	return frames


static func _frame(anim: String, i: int, color: Color, size: int) -> Image:
	var img := Image.create(size, size, false, Image.FORMAT_RGBA8)
	img.fill(Color(0, 0, 0, 0))
	var cx := size / 2.0
	var r := size * 0.34
	var bob := 0.0
	match anim:
		"idle", "happy", "hungry":
			bob = float(i)
		"excited":
			bob = float(i) * 3.0
	var cy := size * 0.6 - bob
	var dark := color.darkened(0.6)
	_ellipse(img, cx, cy, r, r * 1.08, color)
	_ellipse(img, cx - r * 0.35, cy + r * 0.5, r * 0.25, r * 0.15, color.darkened(0.15))

	var ey := cy - r * 0.2
	var ex := r * 0.38
	match anim:
		"sleep":
			_rect(img, cx - ex - 3, ey, 6, 2, dark)
			_rect(img, cx + ex - 3, ey, 6, 2, dark)
			_rect(img, cx + r * 0.9, cy - r * (1.2 + 0.15 * i), 3, 3, dark)
			_rect(img, cx + r * 1.1, cy - r * (1.5 + 0.15 * i), 2, 2, dark)
		"sad":
			_rect(img, cx - ex - 2, ey, 4, 3, dark)
			_rect(img, cx + ex - 2, ey, 4, 3, dark)
			_rect(img, cx + ex + 1, ey + 4 + i * 2, 2, 3, Color(0.4, 0.7, 1.0))
			_rect(img, cx - 4, cy + r * 0.45, 8, 2, dark)
		"excited":
			_ellipse(img, cx - ex, ey, 4, 4, dark)
			_ellipse(img, cx + ex, ey, 4, 4, dark)
			_rect(img, cx - ex - 1, ey - 2, 2, 2, Color.WHITE)
			_rect(img, cx + ex - 1, ey - 2, 2, 2, Color.WHITE)
			_ellipse(img, cx, cy + r * 0.45, 5, 4, dark)
		"eat":
			_ellipse(img, cx - ex, ey, 2.5, 2.5, dark)
			_ellipse(img, cx + ex, ey, 2.5, 2.5, dark)
			if i == 0:
				_ellipse(img, cx, cy + r * 0.45, 6, 5, dark)
			else:
				_rect(img, cx - 5, cy + r * 0.45, 10, 2, dark)
		"happy":
			_ellipse(img, cx - ex, ey, 3, 3, dark)
			_ellipse(img, cx + ex, ey, 3, 3, dark)
			_rect(img, cx - 6, cy + r * 0.4, 12, 2, dark)
			_rect(img, cx - 8, cy + r * 0.4 - 2, 2, 2, dark)
			_rect(img, cx + 6, cy + r * 0.4 - 2, 2, 2, dark)
			_rect(img, cx - ex - 5, ey + 6, 4, 2, Color(1, 0.6, 0.6))
			_rect(img, cx + ex + 1, ey + 6, 4, 2, Color(1, 0.6, 0.6))
		"hungry":
			_ellipse(img, cx - ex, ey, 2.5, 2.5, dark)
			_ellipse(img, cx + ex, ey, 2.5, 2.5, dark)
			_ellipse(img, cx, cy + r * 0.45, 3, 3, dark)
			_rect(img, cx - r * 1.05, cy - r * 0.6 - i, 2, 4, Color(0.4, 0.7, 1.0))
		_:
			_ellipse(img, cx - ex, ey, 2.5, 2.5, dark)
			_ellipse(img, cx + ex, ey, 2.5, 2.5, dark)
			_rect(img, cx - 4, cy + r * 0.45, 8, 2, dark)
	return img


static func _ellipse(img: Image, cx: float, cy: float, rx: float, ry: float, c: Color) -> void:
	var x0 := maxi(0, int(cx - rx) - 1)
	var x1 := mini(img.get_width() - 1, int(cx + rx) + 1)
	var y0 := maxi(0, int(cy - ry) - 1)
	var y1 := mini(img.get_height() - 1, int(cy + ry) + 1)
	for y in range(y0, y1 + 1):
		for x in range(x0, x1 + 1):
			var dx := (x + 0.5 - cx) / rx
			var dy := (y + 0.5 - cy) / ry
			if dx * dx + dy * dy <= 1.0:
				img.set_pixel(x, y, c)


static func _rect(img: Image, x: float, y: float, w: int, h: int, c: Color) -> void:
	for yy in range(int(y), int(y) + h):
		for xx in range(int(x), int(x) + w):
			if xx >= 0 and yy >= 0 and xx < img.get_width() and yy < img.get_height():
				img.set_pixel(xx, yy, c)
