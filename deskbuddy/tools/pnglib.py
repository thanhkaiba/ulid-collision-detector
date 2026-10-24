"""PNG đọc/ghi và ghép ảnh thuần Python (không cần Pillow).

Hỗ trợ đọc PNG 8-bit, không interlace, màu RGBA / RGB / palette (+tRNS) /
grey / grey+alpha. Đủ cho các pack của Kenney.
"""
import struct
import zlib


class Img:
    __slots__ = ("w", "h", "px")

    def __init__(self, w, h, px=None):
        self.w, self.h = w, h
        self.px = px if px is not None else bytearray(w * h * 4)

    # ---------- IO ----------
    @staticmethod
    def load(path):
        with open(path, "rb") as f:
            data = f.read()
        assert data[:8] == b"\x89PNG\r\n\x1a\n", path
        pos = 8
        idat = bytearray()
        plte = None
        trns = None
        w = h = depth = ctype = interlace = None
        while pos < len(data):
            ln, tag = struct.unpack(">I4s", data[pos:pos + 8])
            body = data[pos + 8:pos + 8 + ln]
            pos += 12 + ln
            if tag == b"IHDR":
                w, h, depth, ctype, _, _, interlace = struct.unpack(">IIBBBBB", body)
            elif tag == b"PLTE":
                plte = body
            elif tag == b"tRNS":
                trns = body
            elif tag == b"IDAT":
                idat += body
            elif tag == b"IEND":
                break
        assert interlace == 0, f"{path}: không hỗ trợ interlace"
        assert depth in (1, 2, 4, 8), f"{path}: bit depth {depth} không hỗ trợ"
        assert depth == 8 or ctype in (0, 3), f"{path}: depth {depth} với ctype {ctype}"
        channels = {0: 1, 2: 3, 3: 1, 4: 2, 6: 4}[ctype]
        bpp = max(1, channels * depth // 8)
        raw = zlib.decompress(bytes(idat))
        stride = (w * channels * depth + 7) // 8
        out = bytearray(w * h * channels)
        prev = bytearray(stride)
        p = 0
        for y in range(h):
            ft = raw[p]
            p += 1
            line = bytearray(raw[p:p + stride])
            p += stride
            if ft == 1:
                for i in range(bpp, stride):
                    line[i] = (line[i] + line[i - bpp]) & 255
            elif ft == 2:
                for i in range(stride):
                    line[i] = (line[i] + prev[i]) & 255
            elif ft == 3:
                for i in range(stride):
                    a = line[i - bpp] if i >= bpp else 0
                    line[i] = (line[i] + ((a + prev[i]) >> 1)) & 255
            elif ft == 4:
                for i in range(stride):
                    a = line[i - bpp] if i >= bpp else 0
                    b = prev[i]
                    c = prev[i - bpp] if i >= bpp else 0
                    pa, pb, pc = abs(b - c), abs(a - c), abs(a + b - 2 * c)
                    pr = a if (pa <= pb and pa <= pc) else (b if pb <= pc else c)
                    line[i] = (line[i] + pr) & 255
            if depth == 8:
                out[y * stride:(y + 1) * stride] = line
            else:
                # Giải nén bit cho palette / grey < 8 bit.
                per_byte = 8 // depth
                mask = (1 << depth) - 1
                scale = 255 // mask if ctype == 0 else 1
                for x in range(w):
                    b = line[x // per_byte]
                    shift = 8 - depth * (x % per_byte + 1)
                    out[y * w + x] = ((b >> shift) & mask) * scale
            prev = line
        img = Img(w, h)
        px = img.px
        n = w * h
        if ctype == 6:
            px[:] = out
        elif ctype == 2:
            for i in range(n):
                px[i * 4:i * 4 + 3] = out[i * 3:i * 3 + 3]
                px[i * 4 + 3] = 255
        elif ctype == 3:
            pal = [tuple(plte[k * 3:k * 3 + 3]) for k in range(len(plte) // 3)]
            alpha = list(trns) if trns else []
            for i in range(n):
                idx = out[i]
                r, g, b = pal[idx]
                a = alpha[idx] if idx < len(alpha) else 255
                px[i * 4:i * 4 + 4] = bytes((r, g, b, a))
        elif ctype == 0:
            for i in range(n):
                v = out[i]
                px[i * 4:i * 4 + 4] = bytes((v, v, v, 255))
        elif ctype == 4:
            for i in range(n):
                v, a = out[i * 2], out[i * 2 + 1]
                px[i * 4:i * 4 + 4] = bytes((v, v, v, a))
        return img

    def save(self, path):
        raw = bytearray()
        stride = self.w * 4
        for y in range(self.h):
            raw.append(0)
            raw += self.px[y * stride:(y + 1) * stride]

        def chunk(tag, body):
            c = struct.pack(">I", len(body)) + tag + body
            return c + struct.pack(">I", zlib.crc32(tag + body) & 0xFFFFFFFF)

        png = b"\x89PNG\r\n\x1a\n"
        png += chunk(b"IHDR", struct.pack(">IIBBBBB", self.w, self.h, 8, 6, 0, 0, 0))
        png += chunk(b"IDAT", zlib.compress(bytes(raw), 9))
        png += chunk(b"IEND", b"")
        with open(path, "wb") as f:
            f.write(png)

    # ---------- Pixel ----------
    def get(self, x, y):
        i = (y * self.w + x) * 4
        return self.px[i], self.px[i + 1], self.px[i + 2], self.px[i + 3]

    def set(self, x, y, c):
        if 0 <= x < self.w and 0 <= y < self.h:
            i = (y * self.w + x) * 4
            self.px[i:i + 4] = bytes(c)

    def copy(self):
        return Img(self.w, self.h, bytearray(self.px))

    # ---------- Ops ----------
    def paste(self, src, x, y, alpha=1.0):
        """Alpha-over src lên self tại (x, y), góc trên trái."""
        x, y = int(round(x)), int(round(y))
        for sy in range(src.h):
            dy = y + sy
            if dy < 0 or dy >= self.h:
                continue
            for sx in range(src.w):
                dx = x + sx
                if dx < 0 or dx >= self.w:
                    continue
                si = (sy * src.w + sx) * 4
                sa = src.px[si + 3] * alpha / 255.0
                if sa <= 0:
                    continue
                di = (dy * self.w + dx) * 4
                da = self.px[di + 3] / 255.0
                oa = sa + da * (1 - sa)
                if oa <= 0:
                    continue
                for k in range(3):
                    sc = src.px[si + k]
                    dc = self.px[di + k]
                    self.px[di + k] = int((sc * sa + dc * da * (1 - sa)) / oa + 0.5)
                self.px[di + 3] = int(oa * 255 + 0.5)

    def paste_center(self, src, cx, cy, alpha=1.0):
        self.paste(src, cx - src.w / 2.0, cy - src.h / 2.0, alpha)

    def scaled(self, sx, sy=None):
        """Bilinear scale. sx, sy là hệ số."""
        if sy is None:
            sy = sx
        nw, nh = max(1, int(round(self.w * sx))), max(1, int(round(self.h * sy)))
        out = Img(nw, nh)
        for y in range(nh):
            fy = (y + 0.5) / sy - 0.5
            y0 = max(0, min(self.h - 1, int(fy)))
            y1 = min(self.h - 1, y0 + 1)
            wy = fy - y0
            if wy < 0:
                wy = 0.0
            for x in range(nw):
                fx = (x + 0.5) / sx - 0.5
                x0 = max(0, min(self.w - 1, int(fx)))
                x1 = min(self.w - 1, x0 + 1)
                wx = fx - x0
                if wx < 0:
                    wx = 0.0
                # premultiplied interpolation để không viền đen
                acc = [0.0, 0.0, 0.0, 0.0]
                for (xx, yy, wgt) in ((x0, y0, (1 - wx) * (1 - wy)), (x1, y0, wx * (1 - wy)),
                                      (x0, y1, (1 - wx) * wy), (x1, y1, wx * wy)):
                    if wgt == 0:
                        continue
                    i = (yy * self.w + xx) * 4
                    a = self.px[i + 3] / 255.0
                    acc[0] += self.px[i] * a * wgt
                    acc[1] += self.px[i + 1] * a * wgt
                    acc[2] += self.px[i + 2] * a * wgt
                    acc[3] += a * wgt
                oi = (y * nw + x) * 4
                if acc[3] > 0:
                    out.px[oi] = int(acc[0] / acc[3] + 0.5)
                    out.px[oi + 1] = int(acc[1] / acc[3] + 0.5)
                    out.px[oi + 2] = int(acc[2] / acc[3] + 0.5)
                    out.px[oi + 3] = int(acc[3] * 255 + 0.5)
        return out

    def flip_h(self):
        out = Img(self.w, self.h)
        for y in range(self.h):
            for x in range(self.w):
                out.set(self.w - 1 - x, y, self.get(x, y))
        return out

    def flip_v(self):
        out = Img(self.w, self.h)
        for y in range(self.h):
            row = self.px[y * self.w * 4:(y + 1) * self.w * 4]
            out.px[(self.h - 1 - y) * self.w * 4:(self.h - y) * self.w * 4] = row
        return out

    def rotated(self, deg):
        """Xoay quanh tâm, canvas mở rộng vừa đủ, bilinear."""
        import math
        rad = math.radians(deg)
        c, s = math.cos(rad), math.sin(rad)
        nw = int(abs(self.w * c) + abs(self.h * s) + 0.5)
        nh = int(abs(self.w * s) + abs(self.h * c) + 0.5)
        out = Img(nw, nh)
        cx, cy = self.w / 2.0, self.h / 2.0
        ncx, ncy = nw / 2.0, nh / 2.0
        for y in range(nh):
            for x in range(nw):
                dx, dy = x + 0.5 - ncx, y + 0.5 - ncy
                sx = c * dx + s * dy + cx - 0.5
                sy = -s * dx + c * dy + cy - 0.5
                if sx < -1 or sy < -1 or sx > self.w or sy > self.h:
                    continue
                x0, y0 = int(math.floor(sx)), int(math.floor(sy))
                wx, wy = sx - x0, sy - y0
                acc = [0.0, 0.0, 0.0, 0.0]
                for (xx, yy, wgt) in ((x0, y0, (1 - wx) * (1 - wy)), (x0 + 1, y0, wx * (1 - wy)),
                                      (x0, y0 + 1, (1 - wx) * wy), (x0 + 1, y0 + 1, wx * wy)):
                    if wgt == 0 or xx < 0 or yy < 0 or xx >= self.w or yy >= self.h:
                        continue
                    i = (yy * self.w + xx) * 4
                    a = self.px[i + 3] / 255.0
                    acc[0] += self.px[i] * a * wgt
                    acc[1] += self.px[i + 1] * a * wgt
                    acc[2] += self.px[i + 2] * a * wgt
                    acc[3] += a * wgt
                if acc[3] > 0:
                    out.set(x, y, (int(acc[0] / acc[3] + 0.5), int(acc[1] / acc[3] + 0.5),
                                   int(acc[2] / acc[3] + 0.5), int(acc[3] * 255 + 0.5)))
        return out

    def tinted(self, rgb, strength=1.0):
        """Phủ màu giữ alpha và độ sáng tương đối."""
        out = self.copy()
        for i in range(0, len(out.px), 4):
            if out.px[i + 3] == 0:
                continue
            lum = (out.px[i] * 0.3 + out.px[i + 1] * 0.59 + out.px[i + 2] * 0.11) / 255.0
            for k in range(3):
                target = rgb[k] * lum
                out.px[i + k] = int(out.px[i + k] * (1 - strength) + target * strength + 0.5)
        return out

    def ellipse(self, cx, cy, rx, ry, c):
        for yy in range(int(cy - ry) - 1, int(cy + ry) + 2):
            for xx in range(int(cx - rx) - 1, int(cx + rx) + 2):
                dx = (xx + 0.5 - cx) / rx
                dy = (yy + 0.5 - cy) / ry
                if dx * dx + dy * dy <= 1.0:
                    self.set(xx, yy, c)

    def rect(self, x, y, w, h, c):
        for yy in range(int(y), int(y + h)):
            for xx in range(int(x), int(x + w)):
                self.set(xx, yy, c)

    def bbox(self):
        """(x0, y0, x1, y1) của vùng không trong suốt, x1/y1 exclusive."""
        x0, y0, x1, y1 = self.w, self.h, 0, 0
        for y in range(self.h):
            for x in range(self.w):
                if self.px[(y * self.w + x) * 4 + 3] > 8:
                    x0, y0 = min(x0, x), min(y0, y)
                    x1, y1 = max(x1, x + 1), max(y1, y + 1)
        return (x0, y0, x1, y1) if x1 > x0 else (0, 0, 0, 0)


def sheet(frames, cols=None):
    """Ghép danh sách frame cùng kích thước thành sprite sheet."""
    if not frames:
        raise ValueError("no frames")
    w, h = frames[0].w, frames[0].h
    cols = cols or len(frames)
    rows = (len(frames) + cols - 1) // cols
    out = Img(w * cols, h * rows)
    for i, fr in enumerate(frames):
        out.paste(fr, (i % cols) * w, (i // cols) * h)
    return out
