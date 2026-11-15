import os
import random
from PIL import Image, ImageDraw
from model import CLASSES, IMG_SIZE

DATASET_DIR = os.path.join(os.path.dirname(__file__), "dataset")
SAMPLES_PER_CLASS = 40


def draw_gradient(img: Image.Image, c1: tuple, c2: tuple):
    draw = ImageDraw.Draw(img)
    for y in range(IMG_SIZE):
        t = y / max(1, IMG_SIZE - 1)
        r = int(c1[0] * (1 - t) + c2[0] * t)
        g = int(c1[1] * (1 - t) + c2[1] * t)
        b = int(c1[2] * (1 - t) + c2[2] * t)
        draw.line([(0, y), (IMG_SIZE, y)], fill=(r, g, b))
    return draw


def make_sample(cls_name: str, rng: random.Random) -> Image.Image:
    img = Image.new("RGB", (IMG_SIZE, IMG_SIZE))

    palettes = {
        "cake": ((253, 242, 248), (244, 114, 182)),
        "balloons": ((239, 246, 255), (147, 197, 253)),
        "gifts": ((254, 243, 199), (245, 158, 11)),
        "flowers": ((255, 241, 242), (251, 113, 133)),
        "fireworks": ((15, 23, 42), (88, 28, 135)),
        "galaxy": ((10, 10, 35), (49, 46, 129)),
        "forest": ((6, 78, 59), (16, 185, 129)),
        "castle": ((49, 16, 66), (190, 24, 93)),
    }
    c1, c2 = palettes[cls_name]
    draw = draw_gradient(img, c1, c2)

    if cls_name == "cake":
        cx = rng.randint(56, 72)
        draw.rectangle([cx - 28, 70, cx + 28, 98], fill=(255, 228, 230), outline=(219, 39, 119), width=2)
        draw.rectangle([cx - 20, 48, cx + 20, 70], fill=(254, 240, 138), outline=(217, 119, 6), width=2)
        for dx in (-10, 0, 10):
            draw.line([cx + dx, 36, cx + dx, 48], fill=(239, 68, 68), width=2)
            draw.ellipse([cx + dx - 3, 29, cx + dx + 3, 36], fill=(251, 191, 36))
    elif cls_name == "balloons":
        for _ in range(7):
            bx = rng.randint(20, 108)
            by = rng.randint(18, 72)
            col = rng.choice([(236, 72, 153), (245, 158, 11), (59, 130, 246), (16, 185, 129)])
            draw.ellipse([bx - 11, by - 14, bx + 11, by + 14], fill=col, outline=(255, 255, 255))
            draw.line([bx, by + 14, bx + rng.randint(-6, 6), 115], fill=(100, 116, 139), width=1)
    elif cls_name == "gifts":
        bx = rng.randint(44, 60)
        draw.rectangle([bx, 50, bx + 42, 92], fill=(219, 39, 119), outline=(255, 255, 255), width=2)
        draw.rectangle([bx + 18, 50, bx + 24, 92], fill=(251, 191, 36))
        draw.rectangle([bx, 68, bx + 42, 74], fill=(251, 191, 36))
    elif cls_name == "flowers":
        for _ in range(6):
            fx = rng.randint(24, 104)
            fy = rng.randint(24, 96)
            col = rng.choice([(244, 63, 94), (236, 72, 153), (168, 85, 247)])
            for ox, oy in [(-8, 0), (8, 0), (0, -8), (0, 8)]:
                draw.ellipse([fx + ox - 7, fy + oy - 7, fx + ox + 7, fy + oy + 7], fill=col)
            draw.ellipse([fx - 5, fy - 5, fx + 5, fy + 5], fill=(250, 204, 21))
    elif cls_name in ("fireworks", "galaxy"):
        for _ in range(35):
            sx, sy = rng.randint(6, 122), rng.randint(6, 100)
            r = rng.randint(1, 3)
            col = rng.choice([(253, 224, 71), (56, 189, 248), (244, 114, 182), (255, 255, 255)])
            draw.ellipse([sx - r, sy - r, sx + r, sy + r], fill=col)
    elif cls_name == "forest":
        for _ in range(4):
            tx = rng.randint(20, 108)
            draw.polygon([(tx, 26), (tx - 18, 82), (tx + 18, 82)], fill=(22, 163, 74))
            draw.rectangle([tx - 3, 82, tx + 3, 100], fill=(120, 53, 15))
    elif cls_name == "castle":
        draw.rectangle([38, 52, 90, 98], fill=(226, 232, 240))
        draw.rectangle([30, 38, 44, 98], fill=(203, 213, 225))
        draw.rectangle([84, 38, 98, 98], fill=(203, 213, 225))
        draw.polygon([(37, 22), (28, 38), (46, 38)], fill=(219, 39, 119))
        draw.polygon([(91, 22), (82, 38), (100, 38)], fill=(219, 39, 119))
        draw.polygon([(64, 26), (52, 52), (76, 52)], fill=(245, 158, 11))

    # Sparkles across all classes
    for _ in range(10):
        sx, sy = rng.randint(8, 120), rng.randint(8, 104)
        draw.ellipse([sx - 1, sy - 1, sx + 1, sy + 1], fill=(255, 255, 255))

    return img


def main():
    os.makedirs(DATASET_DIR, exist_ok=True)
    rng = random.Random(42)
    total = 0
    for cls_name in CLASSES:
        cls_dir = os.path.join(DATASET_DIR, cls_name)
        os.makedirs(cls_dir, exist_ok=True)
        for i in range(SAMPLES_PER_CLASS):
            img = make_sample(cls_name, rng)
            img.save(os.path.join(cls_dir, f"{cls_name}_{i:03d}.png"))
            total += 1
    print(f"Prepared {total} labeled images across {len(CLASSES)} classes in {DATASET_DIR}")


if __name__ == "__main__":
    main()
