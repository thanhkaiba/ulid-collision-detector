# Định dạng Pack (format 1)

Một pack là một thư mục:

```
my_pack/
  pack.json
  sprites.png
```

Đặt vào `user://packs/` (menu chuột phải → "Mở thư mục packs") rồi chọn
"Nạp lại packs". Pack trong `user://` trùng `id` sẽ ghi đè pack đi kèm app.

## pack.json

```json
{
  "format": 1,
  "id": "potato",
  "name": "Củ Khoai",
  "author": "Tên bạn",
  "version": "1.0.0",
  "description": "Một dòng mô tả.",
  "kind": "sprite2d",
  "personality": "lazy",
  "fallback_color": "#c98b4a",
  "needs": {
    "energy": { "label": "Nước",   "icon": "", "food": "Ngụm nước" },
    "mood":   { "label": "Nắng",   "icon": "" },
    "bond":   { "label": "Độ giòn", "icon": "" }
  },
  "art": {
    "sheet": "sprites.png",
    "frame_size": [128, 128],
    "scale": 1.5,
    "filter": "linear",
    "animations": {
      "idle":    { "frames": [0, 1],   "fps": 1.5, "loop": true },
      "happy":   { "frames": [2, 3],   "fps": 3 },
      "sad":     { "frames": [4, 5],   "fps": 1 },
      "hungry":  { "frames": [6, 7],   "fps": 2 },
      "sleep":   { "frames": [8, 9],   "fps": 0.8 },
      "eat":     { "frames": [10, 11], "fps": 4 },
      "excited": { "frames": [12, 13], "fps": 6 }
    }
  },
  "lines": {
    "hungry": ["Khô quá...", "Một ngụm nước thôi."],
    "fed": ["Mát."]
  }
}
```

### Trường

| Trường | Bắt buộc | Ghi chú |
|---|---|---|
| `format` | có | Luôn là `1` |
| `id` | có | Chỉ `a-z`, `0-9`, `_`, `-`. Dùng làm khoá lưu trữ |
| `name` | không | Tên hiển thị, mặc định bằng `id` |
| `author`, `version`, `description` | không | Hiển thị và để Workshop sau này |
| `kind` | không | Hiện chỉ `sprite2d` |
| `personality` | không | Một trong: `clingy`, `lazy`, `tsundere`, `supportive`, `chaos`, `strict`. Mặc định `supportive` |
| `fallback_color` | không | Màu hex, dùng vẽ hình dự phòng khi thiếu sheet |
| `needs.<key>.label` | không | Tên hiển thị thanh. Key: `energy`, `mood`, `bond` |
| `needs.<key>.icon` | không | Để trống nếu không chắc font có ký tự đó |
| `needs.energy.food` | không | Tên món ăn hiện trong menu, ví dụ "Trà sữa" |
| `art.sheet` | có | Đường dẫn ảnh, tương đối với thư mục pack |
| `art.frame_size` | không | `[w, h]` mỗi frame, mặc định `[64, 64]` |
| `art.scale` | không | Phóng to khi hiển thị, mặc định `3` |
| `art.filter` | không | `linear` (mặc định, art mượt) hoặc `nearest` (pixel art) |
| `art.animations` | có | Phải có ít nhất `idle` |
| `lines` | không | Override câu nói theo sự kiện |

### Sprite sheet

Ảnh PNG có nền trong suốt, chia lưới theo `frame_size`. Frame đánh số từ 0,
trái sang phải, trên xuống dưới. Sheet có thể nhiều hàng.

Animation được engine dùng:

| Tên | Khi nào |
|---|---|
| `idle` | Mặc định. **Bắt buộc** |
| `happy` | Cả energy và mood ≥ 70, hoặc vừa được vuốt ve |
| `sad` | mood < 25 |
| `hungry` | energy < 25 |
| `sleep` | Người dùng idle hơn 5 phút |
| `eat` | Vừa được cho ăn (2.5 giây) |
| `excited` | Gõ phím dồn dập hoặc xong phiên tập trung |

Animation thiếu sẽ lùi về `idle`, nên một pack tối thiểu chỉ cần 1 frame.

### Câu nói

Sự kiện hợp lệ: `greet`, `hungry`, `sad`, `happy`, `fed`, `petted`,
`focus_start`, `focus_done`, `user_idle`, `user_back`, `typing_burst`, `bored`.

Mỗi sự kiện là mảng chuỗi, engine chọn ngẫu nhiên. Sự kiện không override
sẽ dùng câu của archetype. Mảng rỗng cũng coi như không override.

## Kiểm tra pack

Pack lỗi vẫn xuất hiện trong menu "Đổi nhân vật" nhưng bị mờ, kèm lỗi đầu
tiên. Các lỗi thường gặp:

- `Thiếu animation bắt buộc 'idle'`
- `personality 'xxx' không tồn tại`
- `id bắt buộc, chỉ gồm a-z, 0-9, '_' hoặc '-'`
- `lines.xxx không phải sự kiện hợp lệ`

## Nội dung và bản quyền

Pack chính thức đi kèm app chỉ dùng nhân vật gốc hoặc có hợp đồng. Pack bạn
tự làm là trách nhiệm của bạn. Định dạng này không có cơ chế nào ngăn nội dung
người lớn; app không host, không bán và không quảng bá nội dung đó.
