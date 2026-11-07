from PIL import Image, ImageDraw
import math, os

S = 2048
forest = (36, 72, 63, 255)
img = Image.new("RGBA", (S, S), forest)
d = ImageDraw.Draw(img)
scale = S / 1024
cx, cy = S / 2, S / 2
gold = (231, 190, 104, 255)
cream = (247, 243, 235, 255)

# Outer gold orbit
r = 416 * scale
w = 9 * scale
d.ellipse((cx - r, cy - r, cx + r, cy + r), outline=gold, width=int(w))

# Single star at the top of the orbit
a = math.radians(270)
radius = 416
dot = 7
px, py = cx + math.cos(a) * radius * scale, cy + math.sin(a) * radius * scale
d.ellipse((px - dot*scale, py - dot*scale, px + dot*scale, py + dot*scale), fill=gold)

# Eye shape from two cubic curves
def bezier(p0, p1, p2, p3, n=120):
    pts = []
    for i in range(n + 1):
        t = i / n
        u = 1 - t
        x = u**3*p0[0] + 3*u*u*t*p1[0] + 3*u*t*t*p2[0] + t**3*p3[0]
        y = u**3*p0[1] + 3*u*u*t*p1[1] + 3*u*t*t*p2[1] + t**3*p3[1]
        pts.append((x*scale, y*scale))
    return pts

left = (228, 512)
right = (796, 512)
top = bezier(left, (375, 340), (649, 340), right)
bottom = bezier(right, (649, 684), (375, 684), left)
eye = top + bottom
d.polygon(eye, fill=cream)

# Iris / pupil
ir = 112 * scale
icx, icy = 556 * scale, 512 * scale
d.ellipse((icx - ir, icy - ir, icx + ir, icy + ir), fill=forest)
hr = 31 * scale
d.ellipse((icx + 24*scale, icy - 55*scale, icx + 24*scale + hr*2, icy - 55*scale + hr*2), fill=cream)

# Save source logo (transparent, used by capacitor-assets)
os.makedirs("assets", exist_ok=True)
img.resize((1024, 1024), Image.LANCZOS).save("assets/logo.png")

# Preview on brand green
img.resize((1024, 1024), Image.LANCZOS).convert("RGB").save("assets/icon-preview.png", quality=95)
print("generated assets/logo.png and assets/icon-preview.png")
