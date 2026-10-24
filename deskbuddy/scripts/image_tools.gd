class_name ImageTools
extends RefCounted
## Xử lý ảnh người dùng nhập: xoá nền đơn sắc, cắt viền, thu nhỏ.

const MAX_SIDE := 512


static func load_any(path: String) -> Image:
	if not FileAccess.file_exists(path):
		return null
	var img := Image.load_from_file(path)
	if img == null or img.is_empty():
		return null
	img.convert(Image.FORMAT_RGBA8)
	return img


## Flood-fill từ 4 góc: pixel gần màu góc (theo tolerance 0..1) thành trong suốt.
## Chỉ xoá vùng nối liền với góc, nên mắt trắng ở giữa mặt vẫn giữ nguyên.
static func remove_background(src: Image, tolerance := 0.12) -> Image:
	var img := src.duplicate() as Image
	img.convert(Image.FORMAT_RGBA8)
	var w := img.get_width()
	var h := img.get_height()
	if w == 0 or h == 0:
		return img
	var visited := PackedByteArray()
	visited.resize(w * h)
	var stack := PackedInt32Array()
	for seed in [Vector2i(0, 0), Vector2i(w - 1, 0), Vector2i(0, h - 1), Vector2i(w - 1, h - 1)]:
		var ref := img.get_pixelv(seed)
		if ref.a < 0.05:
			continue
		stack.clear()
		stack.append(seed.y * w + seed.x)
		while not stack.is_empty():
			var idx := stack[stack.size() - 1]
			stack.resize(stack.size() - 1)
			if visited[idx] != 0:
				continue
			visited[idx] = 1
			@warning_ignore("integer_division")
			var y := idx / w
			var x := idx % w
			var c := img.get_pixel(x, y)
			if c.a < 0.05 or color_distance(c, ref) > tolerance:
				continue
			img.set_pixel(x, y, Color(c.r, c.g, c.b, 0.0))
			if x > 0:
				stack.append(idx - 1)
			if x < w - 1:
				stack.append(idx + 1)
			if y > 0:
				stack.append(idx - w)
			if y < h - 1:
				stack.append(idx + w)
	return img


static func color_distance(a: Color, b: Color) -> float:
	var dr := a.r - b.r
	var dg := a.g - b.g
	var db := a.b - b.b
	return sqrt(dr * dr + dg * dg + db * db) / sqrt(3.0)


## Cắt bỏ viền trong suốt.
static func trim(img: Image) -> Image:
	var r := img.get_used_rect()
	if r.size.x <= 0 or r.size.y <= 0:
		return img
	return img.get_region(r)


## Thu nhỏ nếu cạnh lớn hơn max_side, giữ tỉ lệ.
static func fit(img: Image, max_side := MAX_SIDE) -> Image:
	var w := img.get_width()
	var h := img.get_height()
	var longest := maxi(w, h)
	if longest <= max_side:
		return img
	var s := float(max_side) / float(longest)
	var out := img.duplicate() as Image
	out.resize(maxi(1, int(w * s)), maxi(1, int(h * s)), Image.INTERPOLATE_LANCZOS)
	return out
