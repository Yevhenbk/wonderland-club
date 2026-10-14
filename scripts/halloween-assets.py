"""Turns the public-domain sources into transparent WebP decorations.

Sources (Wikimedia Commons, public domain / CC0):
- Vesalius, De humani corporis fabrica (1543), p.163: the skeleton.
- Haeckel, Kunstformen der Natur (1904), plate 67 Chiroptera: bat no. 1.
- Haeckel, Arachnida plate: Araneus diadematus.
- "Carved pumpkin as face" (Unsplash, CC0): the left jack-o'-lantern.
"""
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

# Download the four source files from Wikimedia Commons into SRC first:
#   Vesalius_Fabrica_p163.jpg, Haeckel_Chiroptera.jpg,
#   Haeckel_Arachnida_Araneus_diadematus.png,
#   Carved_pumpkin_as_face_(Unsplash).jpg
# saved as vesalius163.jpg, haeckel_bats.jpg, haeckel_spider.png,
# pumpkin_cc0.jpg. Needs Pillow and numpy.
SRC = os.environ.get("HALLOWEEN_SRC", "halloween-src")
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "halloween")
PREV = os.environ.get("HALLOWEEN_PREVIEW", os.path.join(SRC, "preview"))
os.makedirs(OUT, exist_ok=True)
os.makedirs(PREV, exist_ok=True)


def save(img: Image.Image, name: str, height=None, width=None, q=82):
    if height:
        img = img.resize((round(img.width * height / img.height), height), Image.LANCZOS)
    if width:
        img = img.resize((width, round(img.height * width / img.width)), Image.LANCZOS)
    path = os.path.join(OUT, name)
    img.save(path, "WEBP", quality=q, method=6)
    # preview on the site's night
    bg = Image.new("RGBA", img.size, (5, 3, 9, 255))
    bg.alpha_composite(img)
    bg.convert("RGB").save(os.path.join(PREV, name.replace(".webp", ".png")))
    print(f"{name}: {img.size} {os.path.getsize(path) // 1024} KB")


def component(binary: Image.Image, seed):
    """The connected part of a 0/255 mask that holds the seed, holes filled."""
    work = binary.copy()
    ImageDraw.floodfill(work, seed, 128)
    comp = Image.eval(work, lambda v: 255 if v == 128 else 0)
    # fill holes: whatever is not reachable from the border outside it
    outside = Image.eval(comp, lambda v: 0 if v else 255)
    padded = Image.new("L", (outside.width + 2, outside.height + 2), 255)
    padded.paste(outside, (1, 1))
    ImageDraw.floodfill(padded, (0, 0), 128)
    reach = padded.crop((1, 1, outside.width + 1, outside.height + 1))
    return Image.eval(reach, lambda v: 0 if v == 128 else 255)


# ----------------------------------------------------------------- skeleton
im = Image.open(os.path.join(SRC, "vesalius163.jpg")).convert("L")
box = (88, 88, 1053, 1530)
L = np.asarray(im.crop(box), dtype=np.float32) / 255
paper = np.percentile(L, 92)
ink = np.clip((paper - 0.16 - L) / (paper - 0.16 - 0.1), 0, 1)
# drop the paper's speckle: lone faint dots are not lines
ink = np.where(ink < 0.18, 0, ink)
h, w = ink.shape
# the printed title beside the skull
ink[:140, :380] = 0
ink[:140, 610:] = 0
# fade from the waist down: it rises out of the dark
fade = np.ones(h, dtype=np.float32)
start, end = int(h * 0.56), int(h * 0.97)
fade[start:end] = np.linspace(1, 0, end - start)
fade[end:] = 0
alpha = (ink ** 0.9) * fade[:, None]
rgb = np.zeros((h, w, 3), dtype=np.float32)
rgb[...] = (236, 228, 212)
skel = Image.fromarray(np.dstack([rgb, alpha * 255]).astype(np.uint8), "RGBA")
save(skel, "skeleton.webp", height=620, q=70)

# ---------------------------------------------------------------------- bat
im = Image.open(os.path.join(SRC, "haeckel_bats.jpg")).convert("L")
box = (60, 380, 2290, 1260)  # from above the ear tips
crop = im.crop(box)
binary = crop.point(lambda v: 255 if v < 236 else 0)
sil = component(binary, (1157 - box[0], 855 - box[1]))
# keep only bat no. 1: nothing above its ears belongs to it
sil.paste(0, (0, 0, sil.width, 40))
sil = sil.filter(ImageFilter.GaussianBlur(1.2))
bb = sil.getbbox()
Lb = np.asarray(crop, dtype=np.float32) / 255
# a dark specimen: the engraving's tones pushed down into the night
tone = np.clip(Lb * 0.5 + 0.02, 0, 1)
rgb = np.dstack([tone * 255 * 0.95, tone * 255 * 0.86, tone * 255 * 1.0])
sa = np.asarray(sil).copy()
# a stray bit of the neighbouring bat at the far right wing tip
sa[:, int(sa.shape[1] * 0.985):] = 0
sa[int(sa.shape[0] * 0.28):, int(sa.shape[1] * 0.955):] = 0
bat = Image.fromarray(np.dstack([rgb, sa]).astype(np.uint8), "RGBA")
bat = bat.crop(bat.getbbox())
save(bat, "bat.webp", width=520)

# ------------------------------------------------------------------- spider
im = Image.open(os.path.join(SRC, "haeckel_spider.png")).convert("RGB")
arr = np.asarray(im, dtype=np.float32)
whiteish = (arr.min(axis=2) > 222).astype(np.uint8) * 255
bgmask = Image.fromarray(whiteish, "L")
padded = Image.new("L", (bgmask.width + 2, bgmask.height + 2), 255)
padded.paste(bgmask, (1, 1))
ImageDraw.floodfill(padded, (0, 0), 128)
bg = np.asarray(padded.crop((1, 1, bgmask.width + 1, bgmask.height + 1))) == 128
alpha = np.where(bg, 0, 255).astype(np.uint8)
alpha_img = Image.fromarray(alpha, "L").filter(ImageFilter.GaussianBlur(0.8))
# darker and colder: the pale legs go ash-grey, the body near black
gray = arr.mean(axis=2, keepdims=True)
dark = (arr * 0.45 + gray * 0.25) * 0.62
spider = Image.fromarray(np.dstack([np.clip(dark, 0, 255), np.asarray(alpha_img)]).astype(np.uint8), "RGBA")
spider = spider.crop(spider.getbbox()).rotate(180)  # hanging head down
save(spider, "spider.webp", width=240)

# ------------------------------------------------------------------ pumpkin
im = Image.open(os.path.join(SRC, "pumpkin_cc0.jpg")).convert("RGB")
box = (700, 740, 1860, 1790)
crop = im.crop(box)
arr = np.asarray(crop, dtype=np.float32) / 255
lum = arr.max(axis=2)
a = np.clip((lum - 0.035) / (0.16 - 0.035), 0, 1)
h, w = lum.shape
yy, xx = np.mgrid[0:h, 0:w]
cx, cy, rx, ry = w * 0.5, h * 0.5, w * 0.5, h * 0.52
d = ((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2
vign = np.clip((1.0 - d) / 0.12, 0, 1)
alpha = a * vign
pumpkin = Image.fromarray(np.dstack([arr * 255, alpha * 255]).astype(np.uint8), "RGBA")
pumpkin = pumpkin.crop(pumpkin.getbbox())
save(pumpkin, "pumpkin.webp", width=360)

# ---------------------------------------------------------------------- fog
# Soft fractal noise that tiles seamlessly left to right, so a strip of it
# can drift sideways forever with no seam: every octave is built from a grid
# repeated three times, smoothed as a whole, and the middle copy kept. Pale
# violet-grey, densest towards the bottom; the page fades its edges.
rng = np.random.default_rng(7)
W, H = 1024, 256
fog = np.zeros((H, W), dtype=np.float32)
amp = 1.0
for cells in (4, 8, 16, 32):
    rows = cells // 2 + 2
    grid = rng.random((rows, cells)).astype(np.float32)
    tiled = np.tile(grid, (1, 3))
    big = np.asarray(
        Image.fromarray((tiled * 255).astype(np.uint8)).resize((W * 3, H), Image.BICUBIC),
        dtype=np.float32,
    ) / 255
    fog += big[:, W : 2 * W] * amp
    amp *= 0.5
fog /= fog.max()
fog = np.clip((fog - 0.35) / 0.55, 0, 1) ** 1.4
vertical = np.linspace(0, 1, H, dtype=np.float32) ** 1.2
alpha = fog * vertical[:, None] * 0.85
# blur across the seam: three copies side by side, blurred, middle kept
alpha3 = Image.fromarray((np.tile(alpha, (1, 3)) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(6))
alpha = np.asarray(alpha3, dtype=np.float32)[:, W : 2 * W]
rgb = np.zeros((H, W, 3), dtype=np.float32)
rgb[...] = (196, 186, 214)
fogimg = Image.fromarray(np.dstack([rgb, alpha]).astype(np.uint8), "RGBA")
save(fogimg, "fog.webp", q=70)
