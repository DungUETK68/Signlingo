"""
Tạo toàn bộ App Icon (Adaptive + Legacy) và Splash Screen chuyên nghiệp cho Signlingo Android.
Chạy bằng: python frontend/scripts/generate-android-assets.py
"""

import math
import os
from PIL import Image, ImageDraw, ImageFont

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
RES_DIR = os.path.abspath(
    os.path.join(SCRIPT_DIR, "..", "android", "app", "src", "main", "res")
)


def create_gradient(width: int, height: int, c1, c2, c3=None) -> Image.Image:
    """Tạo nền gradient chéo siêu mượt theo bảng màu Signlingo (#0284c7 -> #06b6d4)"""
    base = Image.new("RGBA", (width, height))
    px = base.load()
    inv_w = 1.0 / max(1, width - 1)
    inv_h = 1.0 / max(1, height - 1)

    for y in range(height):
        ny = y * inv_h
        for x in range(width):
            nx = x * inv_w
            t = max(0.0, min(1.0, 0.55 * nx + 0.45 * ny))
            if c3 is None:
                r = int(c1[0] + (c2[0] - c1[0]) * t)
                g = int(c1[1] + (c2[1] - c1[1]) * t)
                b = int(c1[2] + (c2[2] - c1[2]) * t)
            else:
                if t < 0.5:
                    u = t * 2.0
                    r = int(c1[0] + (c2[0] - c1[0]) * u)
                    g = int(c1[1] + (c2[1] - c1[1]) * u)
                    b = int(c1[2] + (c2[2] - c1[2]) * u)
                else:
                    u = (t - 0.5) * 2.0
                    r = int(c2[0] + (c3[0] - c2[0]) * u)
                    g = int(c2[1] + (c3[1] - c2[1]) * u)
                    b = int(c2[2] + (c3[2] - c2[2]) * u)
            px[x, y] = (r, g, b, 255)
    return base


def draw_pill_capsule(draw: ImageDraw.ImageDraw, x1, y1, x2, y2, radius, fill):
    """Vẽ hình viên thuốc tròn mượt theo đoạn thẳng từ (x1,y1) tới (x2,y2)"""
    dx = x2 - x1
    dy = y2 - y1
    length = math.hypot(dx, dy)
    if length < 1e-6:
        draw.ellipse([x1 - radius, y1 - radius, x1 + radius, y1 + radius], fill=fill)
        return
    ux, uy = -dy / length, dx / length
    pts = [
        (x1 + ux * radius, y1 + uy * radius),
        (x2 + ux * radius, y2 + uy * radius),
        (x2 - ux * radius, y2 - uy * radius),
        (x1 - ux * radius, y1 - uy * radius),
    ]
    draw.polygon(pts, fill=fill)
    draw.ellipse([x1 - radius, y1 - radius, x1 + radius, y1 + radius], fill=fill)
    draw.ellipse([x2 - radius, y2 - radius, x2 + radius, y2 + radius], fill=fill)


def draw_sparkle(draw: ImageDraw.ImageDraw, cx, cy, size, fill):
    """Vẽ ngôi sao lấp lánh 4 cánh tượng trưng cho AI"""
    inner = size * 0.28
    pts = [
        (cx, cy - size),
        (cx + inner, cy - inner),
        (cx + size, cy),
        (cx + inner, cy + inner),
        (cx, cy + size),
        (cx - inner, cy + inner),
        (cx - size, cy),
        (cx - inner, cy - inner),
    ]
    draw.polygon(pts, fill=fill)


def draw_signlingo_hand(size: int, scale: float = 0.56) -> Image.Image:
    """
    Vẽ biểu tượng bàn tay mở thân thiện chuẩn Signlingo trên nền trong suốt.
    Dùng supersampling 4x để sắc nét hoàn hảo.
    """
    hi = size * 2
    img = Image.new("RGBA", (hi, hi), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    cx = hi * 0.5
    cy = hi * 0.52
    s = hi * scale

    white = (255, 255, 255, 255)
    soft_shadow = (3, 105, 161, 65)
    sparkle_color = (254, 240, 138, 255)  # Vàng sáng dịu nhẹ biểu tượng AI

    def render_hand(ox, oy, color):
        # Bóng hoặc bàn tay chính
        palm_rx = s * 0.27
        palm_ry = s * 0.25
        px = cx + ox + s * 0.02
        py = cy + oy + s * 0.14

        # Lòng bàn tay bo tròn
        draw.rounded_rectangle(
            [px - palm_rx, py - palm_ry * 0.85, px + palm_rx, py + palm_ry * 1.05],
            radius=int(s * 0.20),
            fill=color,
        )

        # Cổ tay mềm mại phía dưới
        wrist_w = s * 0.15
        draw.rounded_rectangle(
            [px - wrist_w, py + palm_ry * 0.45, px + wrist_w, py + palm_ry * 1.38],
            radius=int(s * 0.10),
            fill=color,
        )

        # 4 ngón tay vươn cao theo tỷ lệ tự nhiên (Trỏ, Giữa, Áp út, Út)
        finger_r = s * 0.058
        fingers = [
            # (base_x, base_y, tip_x, tip_y)
            (-0.18, -0.02, -0.21, -0.34),  # Ngón trỏ
            (-0.055, -0.05, -0.055, -0.42),  # Ngón giữa (cao nhất)
            (0.075, -0.04, 0.095, -0.37),  # Ngón áp út
            (0.195, 0.02, 0.245, -0.24),  # Ngón út
        ]
        for bx, by, tx, ty in fingers:
            draw_pill_capsule(
                draw,
                px + s * bx,
                py + s * by,
                px + s * tx,
                py + s * ty,
                finger_r,
                color,
            )

        # Ngón cái dang nhẹ sang trái thể hiện sự thân thiện / lời chào VSL
        draw_pill_capsule(
            draw,
            px - s * 0.19,
            py + s * 0.15,
            px - s * 0.37,
            py - s * 0.05,
            s * 0.064,
            color,
        )

    # Đổ bóng nhẹ phía sau bàn tay
    render_hand(s * 0.018, s * 0.028, soft_shadow)
    # Vẽ bàn tay trắng nổi bật
    render_hand(0, 0, white)

    # Điểm nhấn ngôi sao AI phía trên bên phải
    draw_sparkle(draw, cx + s * 0.34, cy - s * 0.31, s * 0.10, sparkle_color)
    draw_sparkle(draw, cx - s * 0.33, cy - s * 0.27, s * 0.055, (224, 242, 254, 230))

    return img.resize((size, size), Image.LANCZOS)


def make_square_icon(size: int, round_mask: bool = False) -> Image.Image:
    """Tạo icon vuông hoặc tròn đầy đủ với gradient Signlingo"""
    bg = create_gradient(size, size, (2, 132, 199), (14, 165, 233), (6, 182, 212))
    fg = draw_signlingo_hand(size, scale=0.66)
    combined = Image.alpha_composite(bg, fg)

    if round_mask:
        mask = Image.new("L", (size, size), 0)
        mdraw = ImageDraw.Draw(mask)
        mdraw.ellipse([0, 0, size - 1, size - 1], fill=255)
        out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        out.paste(combined, (0, 0), mask)
        return out
    return combined


def load_vietnamese_font(size: int, bold: bool = True):
    """Tìm font hệ thống Windows hỗ trợ 100% tiếng Việt có dấu"""
    candidates = [
        "C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf",
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/tahomabd.ttf" if bold else "C:/Windows/Fonts/tahoma.ttf",
    ]
    for path in candidates:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                pass
    return ImageFont.load_default()


def make_splash(width: int, height: int) -> Image.Image:
    """Tạo Splash Screen chuẩn thương hiệu Signlingo cho cả dọc và ngang"""
    img = create_gradient(width, height, (3, 105, 161), (2, 132, 199), (8, 145, 178))
    overlay = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    odraw = ImageDraw.Draw(overlay)

    cx, cy = width // 2, height // 2
    min_dim = min(width, height)

    # Các vòng sáng đồng tâm tạo chiều sâu hiện đại
    for mult, alpha in [(0.42, 18), (0.31, 26), (0.21, 36)]:
        r = int(min_dim * mult)
        odraw.ellipse(
            [cx - r, cy - int(min_dim * 0.06) - r, cx + r, cy - int(min_dim * 0.06) + r],
            fill=(255, 255, 255, alpha),
        )

    # Khung biểu tượng bo góc kính mờ trung tâm
    badge_size = int(min_dim * 0.28)
    bx = cx - badge_size // 2
    by = cy - int(min_dim * 0.06) - badge_size // 2
    odraw.rounded_rectangle(
        [bx, by, bx + badge_size, by + badge_size],
        radius=int(badge_size * 0.26),
        fill=(255, 255, 255, 38),
        outline=(255, 255, 255, 110),
        width=max(2, int(min_dim * 0.004)),
    )

    img = Image.alpha_composite(img, overlay)

    # Dán biểu tượng bàn tay Signlingo vào giữa badge
    hand = draw_signlingo_hand(badge_size, scale=0.72)
    img.paste(hand, (bx, by), hand)

    # Chữ thương hiệu Signlingo & Slogan tiếng Việt
    tdraw = ImageDraw.Draw(img)
    title_size = max(24, int(min_dim * 0.09))
    sub_size = max(13, int(min_dim * 0.036))
    title_font = load_vietnamese_font(title_size, bold=True)
    sub_font = load_vietnamese_font(sub_size, bold=False)

    title_text = "Signlingo"
    sub_text = "Học Ngôn ngữ Ký hiệu Việt Nam AI"

    tb = tdraw.textbbox((0, 0), title_text, font=title_font)
    tw = tb[2] - tb[0]
    th = tb[3] - tb[1]
    title_y = by + badge_size + int(min_dim * 0.045)
    tdraw.text((cx - tw // 2, title_y), title_text, font=title_font, fill=(255, 255, 255, 255))

    sb = tdraw.textbbox((0, 0), sub_text, font=sub_font)
    sw = sb[2] - sb[0]
    sub_y = title_y + th + int(min_dim * 0.025)
    tdraw.text((cx - sw // 2, sub_y), sub_text, font=sub_font, fill=(224, 242, 254, 235))

    return img.convert("RGB")


def main():
    print("🎨 Đang tạo App Icons & Splash Screens thương hiệu Signlingo cho Android...")

    # 1. Tạo Mipmap App Icons (Adaptive Foreground + Legacy Square + Round)
    mipmap_specs = {
        "mipmap-mdpi": (48, 108),
        "mipmap-hdpi": (72, 162),
        "mipmap-xhdpi": (96, 216),
        "mipmap-xxhdpi": (144, 324),
        "mipmap-xxxhdpi": (192, 432),
    }

    for folder, (icon_px, fg_px) in mipmap_specs.items():
        out_dir = os.path.join(RES_DIR, folder)
        os.makedirs(out_dir, exist_ok=True)

        sq = make_square_icon(icon_px, round_mask=False)
        sq.save(os.path.join(out_dir, "ic_launcher.png"), "PNG")

        rd = make_square_icon(icon_px, round_mask=True)
        rd.save(os.path.join(out_dir, "ic_launcher_round.png"), "PNG")

        # Adaptive icon foreground (nằm gọn trong safe zone 66% chuẩn Android 8-15)
        fg = draw_signlingo_hand(fg_px, scale=0.46)
        fg.save(os.path.join(out_dir, "ic_launcher_foreground.png"), "PNG")

    # 2. Tạo Splash Screens (Default + Portrait + Landscape các mật độ màn hình)
    splash_specs = {
        "drawable": (720, 1280),
        "drawable-port-mdpi": (320, 480),
        "drawable-port-hdpi": (480, 800),
        "drawable-port-xhdpi": (720, 1280),
        "drawable-port-xxhdpi": (960, 1600),
        "drawable-port-xxxhdpi": (1280, 1920),
        "drawable-land-mdpi": (480, 320),
        "drawable-land-hdpi": (800, 480),
        "drawable-land-xhdpi": (1280, 720),
        "drawable-land-xxhdpi": (1600, 960),
        "drawable-land-xxxhdpi": (1920, 1280),
    }

    for folder, (w, h) in splash_specs.items():
        out_dir = os.path.join(RES_DIR, folder)
        os.makedirs(out_dir, exist_ok=True)
        splash = make_splash(w, h)
        splash.save(os.path.join(out_dir, "splash.png"), "PNG", optimize=True)

    print("✅ Đã tạo hoàn tất toàn bộ App Icon (Adaptive + Round) & Splash Screen cho Android!")


if __name__ == "__main__":
    main()
