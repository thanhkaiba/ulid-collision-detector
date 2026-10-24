#!/usr/bin/env python3
"""Sinh sprite sheet placeholder cho 3 pack mẫu, không cần thư viện ngoài.

Layout: 14 frame 64x64 trên một hàng (896x64), thứ tự:
  0-1 idle, 2-3 happy, 4-5 sad, 6-7 hungry, 8-9 sleep, 10-11 eat, 12-13 excited
Chạy: python3 tools/gen_placeholder_art.py
"""
import os
import struct
import sys
import zlib

W = H = 64
ANIMS = ["idle", "happy", "sad", "hungry", "sleep", "eat", "excited"]
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "packs")


class Canvas:
    def __init__(self, w, h):
        self.w, self.h = w, h
        self.px = bytearray(w * h * 4)

    def set(self, x, y, c):
        x, y = int(x), int(y)
        if 0 <= x < self.w and 0 <= y < self.h:
            i = (y * self.w + x) * 4
            self.px[i:i + 4] = bytes(c)

    def rect(self, x, y, w, h, c):
        for yy in range(int(y), int(y) + int(h)):
            for xx in range(int(x), int(x) + int(w)):
                self.set(xx, yy, c)

    def ellipse(self, cx, cy, rx, ry, c):
        for yy in range(int(cy - ry) - 1, int(cy + ry) + 2):
            for xx in range(int(cx - rx) - 1, int(cx + rx) + 2):
                dx = (xx + 0.5 - cx) / rx
                dy = (yy + 0.5 - cy) / ry
                if dx * dx + dy * dy <= 1.0:
                    self.set(xx, yy, c)

    def tri(self, p1, p2, p3, c):
        xs = [p[0] for p in (p1, p2, p3)]
        ys = [p[1] for p in (p1, p2, p3)]
        for yy in range(int(min(ys)), int(max(ys)) + 1):
            for xx in range(int(min(xs)), int(max(xs)) + 1):
                if _inside(xx + 0.5, yy + 0.5, p1, p2, p3):
                    self.set(xx, yy, c)


def _sign(p, a, b):
    return (p[0] - b[0]) * (a[1] - b[1]) - (a[0] - b[0]) * (p[1] - b[1])


def _inside(x, y, a, b, c):
    d1, d2, d3 = _sign((x, y), a, b), _sign((x, y), b, c), _sign((x, y), c, a)
    neg = d1 < 0 or d2 < 0 or d3 < 0
    pos = d1 > 0 or d2 > 0 or d3 > 0
    return not (neg and pos)


def write_png(path, canvases):
    w = W * len(canvases)
    raw = bytearray()
    for y in range(H):
        raw.append(0)
        for cv in canvases:
            raw += cv.px[y * W * 4:(y + 1) * W * 4]

    def chunk(tag, data):
        c = struct.pack(">I", len(data)) + tag + data
        return c + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)

    png = b"\x89PNG\r\n\x1a\n"
    png += chunk(b"IHDR", struct.pack(">IIBBBBB", w, H, 8, 6, 0, 0, 0))
    png += chunk(b"IDAT", zlib.compress(bytes(raw), 9))
    png += chunk(b"IEND", b"")
    with open(path, "wb") as f:
        f.write(png)


DARK = (34, 30, 30, 255)
WHITE = (255, 255, 255, 255)
TEAR = (110, 180, 255, 255)
BLUSH = (255, 150, 150, 255)


def draw_face(cv, cx, ey, ex, my, anim, i, mouth_w=10):
    """Mắt + miệng dùng chung cho mọi nhân vật."""
    if anim == "sleep":
        cv.rect(cx - ex - 3, ey, 6, 2, DARK)
        cv.rect(cx + ex - 3, ey, 6, 2, DARK)
        zy = ey - 14 - i * 2
        cv.rect(cx + 18, zy, 4, 1, DARK); cv.rect(cx + 20, zy + 1, 1, 1, DARK)
        cv.rect(cx + 19, zy + 2, 1, 1, DARK); cv.rect(cx + 18, zy + 3, 4, 1, DARK)
        cv.rect(cx + 24, zy - 5, 3, 1, DARK); cv.rect(cx + 25, zy - 4, 1, 1, DARK); cv.rect(cx + 24, zy - 3, 3, 1, DARK)
        cv.rect(cx - 3, my, 6, 1, DARK)
    elif anim == "sad":
        cv.rect(cx - ex - 2, ey, 4, 3, DARK)
        cv.rect(cx + ex - 2, ey, 4, 3, DARK)
        cv.rect(cx - ex - 3, ey - 2, 6, 1, DARK)
        cv.rect(cx + ex - 3, ey - 2, 6, 1, DARK)
        cv.rect(cx + ex + 2, ey + 4 + i * 3, 2, 3, TEAR)
        cv.rect(cx - 4, my + 2, 8, 1, DARK)
        cv.rect(cx - 5, my + 1, 1, 1, DARK); cv.rect(cx + 4, my + 1, 1, 1, DARK)
    elif anim == "excited":
        cv.ellipse(cx - ex, ey, 4, 4, DARK)
        cv.ellipse(cx + ex, ey, 4, 4, DARK)
        cv.rect(cx - ex - 1, ey - 2, 2, 2, WHITE)
        cv.rect(cx + ex - 1, ey - 2, 2, 2, WHITE)
        cv.ellipse(cx, my + 1, 5, 4, DARK)
        cv.rect(cx - 3, my + 1, 6, 2, (230, 90, 110, 255))
    elif anim == "eat":
        cv.ellipse(cx - ex, ey, 2.5, 2.5, DARK)
        cv.ellipse(cx + ex, ey, 2.5, 2.5, DARK)
        if i == 0:
            cv.ellipse(cx, my + 1, 6, 5, DARK)
        else:
            cv.rect(cx - 5, my, 10, 2, DARK)
            cv.ellipse(cx + 10, my + 2, 4, 3, BLUSH)
    elif anim == "happy":
        cv.ellipse(cx - ex, ey, 3, 3, DARK)
        cv.ellipse(cx + ex, ey, 3, 3, DARK)
        cv.rect(cx - mouth_w // 2, my, mouth_w, 2, DARK)
        cv.rect(cx - mouth_w // 2 - 2, my - 2, 2, 2, DARK)
        cv.rect(cx + mouth_w // 2, my - 2, 2, 2, DARK)
        cv.rect(cx - ex - 6, ey + 6, 5, 2, BLUSH)
        cv.rect(cx + ex + 1, ey + 6, 5, 2, BLUSH)
    elif anim == "hungry":
        cv.ellipse(cx - ex, ey, 2.5, 2.5, DARK)
        cv.ellipse(cx + ex, ey, 2.5, 2.5, DARK)
        cv.ellipse(cx, my + 1, 3, 3, DARK)
        cv.rect(cx + ex + 10, ey - 8 - i, 2, 5, TEAR)
        cv.rect(cx + ex + 9, ey - 4 - i, 4, 2, TEAR)
    else:
        cv.ellipse(cx - ex, ey, 2.5, 2.5, DARK)
        cv.ellipse(cx + ex, ey, 2.5, 2.5, DARK)
        cv.rect(cx - 4, my, 8, 2, DARK)


def bob_for(anim, i):
    if anim in ("idle", "happy", "hungry"):
        return i
    if anim == "excited":
        return i * 3
    if anim == "sleep":
        return -2
    return 0


def potato(anim, i):
    cv = Canvas(W, H)
    body = (201, 139, 74, 255)
    spot = (160, 105, 50, 255)
    bob = bob_for(anim, i)
    cx, cy = 32, 38 - bob
    cv.ellipse(cx, cy, 20, 24, body)
    cv.ellipse(cx - 9, cy + 12, 4, 3, spot)
    cv.ellipse(cx + 12, cy - 10, 3, 4, spot)
    cv.ellipse(cx + 8, cy + 16, 3, 2, spot)
    if anim == "happy":
        cv.rect(cx - 2, cy - 27, 2, 4, (90, 170, 80, 255))
        cv.ellipse(cx, cy - 28, 4, 2, (110, 200, 90, 255))
    draw_face(cv, cx, cy - 4, 7, cy + 8, anim, i)
    return cv


def aki(anim, i):
    cv = Canvas(W, H)
    skin = (255, 224, 196, 255)
    hair = (240, 143, 184, 255)
    hair_dark = (205, 105, 150, 255)
    dress = (120, 90, 200, 255)
    bob = bob_for(anim, i)
    cx = 32
    head_y = 24 - bob
    cv.tri((cx - 12, 60), (cx + 12, 60), (cx, 36 - bob), dress)
    cv.rect(cx - 12, 54 - bob, 24, 8, dress)
    cv.ellipse(cx, head_y, 15, 14, skin)
    cv.ellipse(cx, head_y - 3, 16, 12, hair)
    cv.rect(cx - 16, head_y - 3, 32, 6, hair)
    cv.rect(cx - 16, head_y - 3, 5, 18, hair)
    cv.rect(cx + 11, head_y - 3, 5, 18, hair)
    cv.rect(cx - 16, head_y + 15, 5, 14 + (1 if i else 0), hair_dark)
    cv.rect(cx + 11, head_y + 15, 5, 14 + (1 if i else 0), hair_dark)
    cv.tri((cx - 6, head_y - 6), (cx + 2, head_y - 6), (cx - 2, head_y + 4), hair)
    cv.rect(cx + 9, head_y - 12, 6, 4, (255, 80, 120, 255))
    cv.rect(cx + 11, head_y - 13, 2, 6, (255, 80, 120, 255))
    draw_face(cv, cx, head_y + 2, 6, head_y + 9, anim, i, mouth_w=6)
    return cv


def rex(anim, i):
    cv = Canvas(W, H)
    green = (92, 184, 92, 255)
    dark_green = (60, 130, 60, 255)
    belly = (200, 240, 170, 255)
    bob = bob_for(anim, i)
    cx = 30
    by = 40 - bob
    cv.tri((cx + 14, by + 6), (cx + 30, by - 8 + (i * 2 if anim != "sleep" else 0)), (cx + 14, by + 16), green)
    cv.ellipse(cx, by + 4, 16, 14, green)
    cv.ellipse(cx - 2, by + 8, 9, 8, belly)
    cv.ellipse(cx - 4, by - 14, 14, 11, green)
    cv.rect(cx - 18, by - 12, 6, 6, green)
    for k in range(3):
        cv.tri((cx - 10 + k * 7, by - 24), (cx - 6 + k * 7, by - 24), (cx - 8 + k * 7, by - 30), dark_green)
    for k in range(3):
        cv.rect(cx - 14 + k * 4, by - 7, 2, 2, (255, 255, 255, 255))
    cv.rect(cx - 10, by + 16, 5, 6, dark_green)
    cv.rect(cx + 2, by + 16, 5, 6, dark_green)
    cv.rect(cx + 6, by - 2, 4, 3, dark_green)
    draw_face(cv, cx - 4, by - 16, 5, by - 8, anim, i, mouth_w=8)
    return cv


CHARACTERS = {"potato": potato, "aki": aki, "rex": rex}


def main():
    for pid, fn in CHARACTERS.items():
        frames = [fn(anim, i) for anim in ANIMS for i in range(2)]
        out = os.path.join(ROOT, pid, "sprites.png")
        write_png(out, frames)
        print("wrote", os.path.relpath(out), f"{W * len(frames)}x{H}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
