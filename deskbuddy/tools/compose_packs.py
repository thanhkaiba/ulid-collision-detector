#!/usr/bin/env python3
"""Ghép sprite sheet cho 3 pack mẫu từ bộ phận Kenney (CC0).

Nguồn: Shape Characters, Platformer Characters, Monster Builder Pack
(www.kenney.nl, CC0 1.0). Các bộ phận đã dùng được chép vào art_src/kenney/.

Chạy:  python3 tools/compose_packs.py            # dựng packs/*/sprites.png
       python3 tools/compose_packs.py --vendor DIR # chép bộ phận từ thư mục đã giải nén
       python3 tools/compose_packs.py --preview out.png

Layout sheet: 14 frame F×F trên một hàng:
  0-1 idle, 2-3 happy, 4-5 sad, 6-7 hungry, 8-9 sleep, 10-11 eat, 12-13 excited
"""
import os
import shutil
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pnglib import Img, sheet  # noqa: E402

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
SRC = os.path.join(ROOT, "art_src", "kenney")
PACKS = os.path.join(ROOT, "packs")
F = 128
GROUND = 118
ANIMS = ["idle", "happy", "sad", "hungry", "sleep", "eat", "excited"]

# Bộ phận cần chép: (thư mục trong zip Kenney, thư mục đích)
VENDOR = {
    "shape": ("shape/PNG/Double", [
        "yellow_body_squircle", "shadow",
        "hand_yellow_open", "hand_yellow_closed", "hand_yellow_peace", "hand_yellow_thumb",
        "face_a", "face_b", "face_c", "face_e", "face_i", "face_k", "face_l",
        "facial_part_eye_open", "facial_part_eye_closed_down", "facial_part_mouth_smirk",
        "facial_part_mouth_happy",
    ]),
    "platformer": ("plat/PNG/Female/Poses", [
        "female_idle", "female_stand", "female_talk", "female_cheer1", "female_cheer2",
        "female_hurt", "female_duck", "female_hold1", "female_hold2", "female_jump",
    ]),
    "monster": ("monster/PNG/Default", [
        "body_greenD", "leg_greenC", "arm_greenB", "detail_green_horn_small", "snot_small",
        "eye_yellow", "eye_cute_light", "eye_closed_happy", "eye_closed_feminine",
        "mouth_closed_fangs", "mouth_closed_sad", "mouth_closed_happy", "mouth_closed_teeth",
        "mouthA", "mouthC", "mouthG", "mouthH",
    ]),
}

_cache = {}


def part(group, name):
    key = (group, name)
    if key not in _cache:
        _cache[key] = Img.load(os.path.join(SRC, group, name + ".png"))
    return _cache[key]


def vendor(download_dir):
    for group, (sub, names) in VENDOR.items():
        dst = os.path.join(SRC, group)
        os.makedirs(dst, exist_ok=True)
        for n in names:
            shutil.copy(os.path.join(download_dir, sub, n + ".png"), os.path.join(dst, n + ".png"))
        print("vendored", group, len(names), "files")


# ---------- vẽ tay ----------
DARK = (50, 45, 48, 255)
TEAR = (120, 190, 255, 255)
SWEAT = (140, 200, 255, 255)


def draw_z(img, x, y, s, c=DARK):
    """Chữ Z cao s px, góc trên trái (x, y)."""
    t = max(1, s // 5)
    img.rect(x, y, s, t, c)
    img.rect(x, y + s - t, s, t, c)
    for i in range(s - t):
        img.rect(x + s - t - i, y + t + i * (s - 2 * t) // max(1, s - t), t, 1, c)


def draw_zzz(img, x, y, frame):
    draw_z(img, x, y - frame * 2, 7)
    draw_z(img, x + 9, y - 10 - frame * 2, 9)
    if frame:
        draw_z(img, x + 20, y - 22, 11)


def draw_tear(img, x, y, frame):
    img.ellipse(x, y + frame * 4, 2.2, 3.2, TEAR)
    img.rect(x - 1, y - 2 + frame * 4, 2, 2, TEAR)


def draw_sweat(img, x, y, frame):
    img.ellipse(x, y + frame * 2, 3, 4, SWEAT)
    img.rect(x - 1, y - 4 + frame * 2, 2, 3, SWEAT)


def draw_open_mouth(img, cx, cy, rx, ry):
    img.ellipse(cx, cy, rx, ry, DARK)
    img.ellipse(cx, cy + ry * 0.35, rx * 0.6, ry * 0.45, (230, 110, 130, 255))


def draw_cup(img, x, y):
    """Ly trà sữa nhỏ, góc trên trái (x, y), 12×16."""
    img.rect(x, y, 12, 16, (245, 222, 190, 255))
    img.rect(x + 1, y + 10, 10, 5, (200, 160, 110, 255))
    for px, py in ((2, 12), (5, 13), (8, 12), (4, 10), (7, 10)):
        img.rect(x + px, y + py, 2, 2, (70, 50, 40, 255))
    img.rect(x + 6, y - 7, 2, 9, (240, 120, 150, 255))
    img.rect(x - 1, y - 1, 14, 2, (255, 240, 220, 255))


def shadow(frame, cx, cy, scale=0.9):
    sh = part("shape", "shadow").scaled(scale)
    frame.paste_center(sh, cx, cy, alpha=0.55)


# ---------- Khoai ----------
POTATO = (232, 176, 98)


def khoai_frames():
    body0 = part("shape", "yellow_body_squircle").scaled(0.58).tinted(POTATO, 0.8)
    frames = []

    def face(name, s=0.56):
        return part("shape", name).scaled(s)

    def hand(name, s=0.38):
        return part("shape", name).scaled(s)

    def base(squash=1.0, dy=0):
        fr = Img(F, F)
        shadow(fr, 64, 117, 0.95 * (1.0 + (1 - squash)))
        body = body0 if squash == 1.0 else body0.scaled(1 + (1 - squash) * 0.6, squash)
        bx, by = 64 - body.w / 2.0, 116 - body.h + dy
        fr.paste(body, bx, by)
        # mầm khoai
        top = by
        fr.rect(63, top - 6, 3, 8, (90, 160, 80, 255))
        fr.ellipse(58, top - 5, 5, 3, (120, 200, 100, 255))
        fr.ellipse(70, top - 5, 5, 3, (120, 200, 100, 255))
        return fr, by

    def add_hands(fr, left, right, ly=94, ry=94, lx=32, rx=96):
        fr.paste_center(hand(left), lx, ly)
        fr.paste_center(hand(right).flip_h(), rx, ry)

    # idle
    for i in range(2):
        fr, by = base(1.0 if i == 0 else 0.965)
        fr.paste_center(face("face_b" if i == 0 else "face_c"), 64, by + 44)
        add_hands(fr, "hand_yellow_open", "hand_yellow_open")
        frames.append(fr)
    # happy
    for i in range(2):
        fr, by = base(1.0, -3 * i)
        fr.paste_center(face("face_l"), 64, by + 44)
        add_hands(fr, "hand_yellow_thumb", "hand_yellow_thumb", ly=86 - 3 * i, ry=86 - 3 * i)
        frames.append(fr)
    # sad
    for i in range(2):
        fr, by = base(0.98)
        fr.paste_center(face("face_k"), 64, by + 46)
        draw_tear(fr, 76, by + 52, i)
        add_hands(fr, "hand_yellow_closed", "hand_yellow_closed", ly=98, ry=98)
        frames.append(fr)
    # hungry
    for i in range(2):
        fr, by = base(1.0 if i == 0 else 0.97)
        fr.paste_center(face("face_i"), 64, by + 44)
        draw_sweat(fr, 90, by + 26, i)
        add_hands(fr, "hand_yellow_open", "hand_yellow_closed", ly=96, ry=72, rx=92)
        frames.append(fr)
    # sleep
    for i in range(2):
        fr, by = base(0.955 if i == 0 else 0.94)
        eye = part("shape", "facial_part_eye_closed_down").scaled(0.55)
        fr.paste_center(eye, 52, by + 42)
        fr.paste_center(eye, 76, by + 42)
        fr.paste_center(part("shape", "facial_part_mouth_smirk").scaled(0.45), 64, by + 56)
        draw_zzz(fr, 94, by + 16, i)
        add_hands(fr, "hand_yellow_open", "hand_yellow_open", ly=100, ry=100)
        frames.append(fr)
    # eat
    for i in range(2):
        fr, by = base(1.0 if i == 0 else 0.975)
        eye = part("shape", "facial_part_eye_open").scaled(0.45)
        fr.paste_center(eye, 52, by + 40)
        fr.paste_center(eye, 76, by + 40)
        if i == 0:
            draw_open_mouth(fr, 64, by + 58, 7, 6)
            fr.paste_center(hand("hand_yellow_closed"), 32, 94)
            fr.paste_center(hand("hand_yellow_closed").flip_h(), 86, by + 60)
        else:
            fr.paste_center(part("shape", "facial_part_mouth_happy").scaled(0.55), 64, by + 58)
            fr.ellipse(46, by + 54, 5, 3, (240, 150, 150, 200))
            fr.ellipse(82, by + 54, 5, 3, (240, 150, 150, 200))
            add_hands(fr, "hand_yellow_closed", "hand_yellow_closed")
        frames.append(fr)
    # excited
    for i in range(2):
        fr, by = base(1.0, -5 * i)
        fr.paste_center(face("face_e" if i == 0 else "face_a"), 64, by + 44)
        fr.paste_center(hand("hand_yellow_peace"), 26, by + 16 - 4 * i)
        fr.paste_center(hand("hand_yellow_peace").flip_h(), 102, by + 16 - 4 * i)
        frames.append(fr)
    return frames


# ---------- Aki ----------
def _rgb_to_hsl(r, g, b):
    r, g, b = r / 255.0, g / 255.0, b / 255.0
    mx, mn = max(r, g, b), min(r, g, b)
    l = (mx + mn) / 2
    if mx == mn:
        return 0.0, 0.0, l
    d = mx - mn
    s = d / (2 - mx - mn) if l > 0.5 else d / (mx + mn)
    if mx == r:
        h = (g - b) / d + (6 if g < b else 0)
    elif mx == g:
        h = (b - r) / d + 2
    else:
        h = (r - g) / d + 4
    return h * 60, s, l


def _hsl_to_rgb(h, s, l):
    def f(n):
        k = (n + h / 30) % 12
        a = s * min(l, 1 - l)
        return l - a * max(-1, min(k - 3, 9 - k, 1))
    return int(f(0) * 255 + 0.5), int(f(8) * 255 + 0.5), int(f(4) * 255 + 0.5)


def recolor_hair(img, new_hue=335.0, max_y_ratio=0.55):
    """Đổi màu tóc nâu sang hồng, chỉ vùng phía trên và màu nâu không quá sáng."""
    out = img.copy()
    limit = int(img.h * max_y_ratio)
    for y in range(limit):
        for x in range(img.w):
            r, g, b, a = img.get(x, y)
            if a == 0:
                continue
            h, s, l = _rgb_to_hsl(r, g, b)
            if 15 <= h <= 45 and s > 0.25 and 0.18 < l < 0.62:
                nr, ng, nb = _hsl_to_rgb(new_hue, min(1.0, s * 1.15 + 0.1), min(0.8, l + 0.12))
                out.set(x, y, (nr, ng, nb, a))
    return out


def aki_frames():
    frames = []
    poses = {}

    def pose(name):
        if name not in poses:
            poses[name] = recolor_hair(part("platformer", "female_" + name)).scaled(1.06)
        return poses[name]

    def put(fr, name, dy=0, dx=0):
        p = pose(name)
        fr.paste(p, 64 - p.w / 2.0 + dx, 120 - p.h + dy)

    def base():
        fr = Img(F, F)
        shadow(fr, 64, 117, 0.8)
        return fr

    for name, dy in (("idle", 0), ("stand", 0)):
        fr = base(); put(fr, name, dy); frames.append(fr)
    for name, dy in (("cheer1", 0), ("cheer2", -3)):
        fr = base(); put(fr, name, dy); frames.append(fr)
    for i in range(2):
        fr = base(); put(fr, "hurt", i * 2); draw_tear(fr, 73, 40 + i * 2, i); frames.append(fr)
    for i, name in enumerate(("hold1", "hold2")):
        fr = base(); put(fr, name); draw_sweat(fr, 88, 18, i); frames.append(fr)
    for i in range(2):
        fr = base(); put(fr, "duck", i); draw_zzz(fr, 90, 40, i); frames.append(fr)
    for i, name in enumerate(("hold2", "talk")):
        fr = base(); put(fr, name); draw_cup(fr, 78 if i == 0 else 84, 62 if i == 0 else 58); frames.append(fr)
    for name, dy in (("jump", -8), ("cheer2", -2)):
        fr = base(); put(fr, name, dy); frames.append(fr)
    return frames


# ---------- Rex ----------
def rex_frames():
    body0 = part("monster", "body_greenD").scaled(0.46)
    leg = part("monster", "leg_greenC").scaled(0.32)
    arm = part("monster", "arm_greenB").scaled(0.32)
    horn = part("monster", "detail_green_horn_small").scaled(0.5)
    tail = part("monster", "arm_greenB").scaled(0.36).rotated(-125)
    frames = []

    def eye(name, s=0.3):
        return part("monster", name).scaled(s)

    def mouth(name, s=0.4):
        return part("monster", name).scaled(s)

    def base(squash=1.0, dy=0, arms_up=False, legs_dy=0):
        fr = Img(F, F)
        shadow(fr, 64, 117, 0.85)
        fr.paste_center(tail, 104, 94 + dy)
        fr.paste(leg, 38, GROUND - leg.h + legs_dy)
        fr.paste(leg.flip_h(), 90 - leg.w, GROUND - leg.h + legs_dy)
        body = body0 if squash == 1.0 else body0.scaled(1 + (1 - squash) * 0.6, squash)
        bx, by = 64 - body.w / 2.0, 100 - body.h + dy
        if arms_up:
            a = arm.flip_v()
            fr.paste_center(a, 28, by + 16)
            fr.paste_center(a.flip_h(), 100, by + 16)
        else:
            fr.paste_center(arm, 28, by + 52)
            fr.paste_center(arm.flip_h(), 100, by + 52)
        fr.paste(body, bx, by)
        for hx, hy, flip in ((46, by + 3, True), (64, by - 3, False), (82, by + 3, False)):
            fr.paste_center(horn.flip_h() if flip else horn, hx, hy)
        return fr, by

    def eyes(fr, name, by, dy=0):
        e = eye(name)
        fr.paste_center(e, 52, by + 27 + dy)
        fr.paste_center(e.flip_h(), 76, by + 27 + dy)

    # idle
    for i in range(2):
        fr, by = base(1.0 if i == 0 else 0.965)
        eyes(fr, "eye_yellow", by)
        fr.paste_center(mouth("mouth_closed_fangs"), 64, by + 50)
        frames.append(fr)
    # happy
    for i in range(2):
        fr, by = base(1.0, -3 * i, legs_dy=-2 * i)
        eyes(fr, "eye_closed_happy", by, 2)
        fr.paste_center(mouth("mouthA"), 64, by + 50)
        frames.append(fr)
    # sad
    for i in range(2):
        fr, by = base(0.97)
        eyes(fr, "eye_cute_light", by)
        fr.paste_center(mouth("mouth_closed_sad"), 64, by + 52)
        draw_tear(fr, 84, by + 38, i)
        frames.append(fr)
    # hungry
    for i in range(2):
        fr, by = base(1.0 if i == 0 else 0.97)
        eyes(fr, "eye_yellow", by)
        fr.paste_center(mouth("mouthH", 0.42), 64, by + 52)
        drool = part("monster", "snot_small").scaled(0.5 if i == 0 else 0.6).tinted((170, 220, 255), 0.9)
        fr.paste_center(drool, 74, by + 66)
        frames.append(fr)
    # sleep
    for i in range(2):
        fr, by = base(0.95 if i == 0 else 0.935)
        eyes(fr, "eye_closed_feminine", by, 3)
        fr.paste_center(mouth("mouth_closed_happy"), 64, by + 52)
        draw_zzz(fr, 98, by + 4, i)
        frames.append(fr)
    # eat
    for i in range(2):
        fr, by = base(1.0 if i == 0 else 0.975)
        eyes(fr, "eye_yellow", by)
        fr.paste_center(mouth("mouthG" if i == 0 else "mouth_closed_teeth"), 64, by + 52)
        frames.append(fr)
    # excited
    for i in range(2):
        fr, by = base(1.0, -6 * i, arms_up=True, legs_dy=-6 * i)
        eyes(fr, "eye_yellow", by)
        fr.paste_center(mouth("mouthC"), 64, by + 52)
        frames.append(fr)
    return frames


CHARACTERS = {"potato": khoai_frames, "aki": aki_frames, "rex": rex_frames}


def main(argv):
    if len(argv) >= 3 and argv[1] == "--vendor":
        vendor(argv[2])
        return 0
    preview = None
    if len(argv) >= 3 and argv[1] == "--preview":
        preview = argv[2]
    rows = []
    for pid, fn in CHARACTERS.items():
        frames = fn()
        assert len(frames) == 14, pid
        out = os.path.join(PACKS, pid, "sprites.png")
        sheet(frames).save(out)
        print("wrote", os.path.relpath(out, ROOT), f"{F * 14}x{F}")
        rows.append(frames)
    if preview:
        bg = Img(F * 14, F * len(rows))
        bg.rect(0, 0, bg.w, bg.h, (235, 238, 245, 255))
        for r, frames in enumerate(rows):
            bg.paste(sheet(frames), 0, r * F)
        bg.save(preview)
        print("preview", preview)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
