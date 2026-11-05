# Renders the Temir app icons: a "T" whose top bar is a barbell.
import os
import sys
from PIL import Image, ImageDraw

# Usage: python scripts/generate-icons.py assets
OUT = sys.argv[1] if len(sys.argv) > 1 else "assets"
SS = 4  # supersampling factor
WHITE = (245, 245, 245, 255)
BG = (10, 10, 10, 255)


def draw_mark(draw, size, scale, ox=0.0, oy=0.0):
    """Draws the mark in a size×size canvas; geometry in 0..1 units, scaled around the center."""

    def p(x, y):
        return (size * (0.5 + (x - 0.5) * scale + ox), size * (0.5 + (y - 0.5) * scale + oy))

    def rect(x0, y0, x1, y1, r):
        a, b = p(x0, y0), p(x1, y1)
        draw.rounded_rectangle([a, b], radius=size * r * scale, fill=WHITE)

    bar_y, bar_h = 0.34, 0.046
    # Bar (sleeves stick out past the plates).
    rect(0.10, bar_y - bar_h / 2, 0.90, bar_y + bar_h / 2, 0.012)
    for side in (1, -1):
        def mx(x):
            return x if side == 1 else 1 - x

        def mrect(x0, y0, x1, y1, r):
            a, b = sorted((mx(x0), mx(x1)))
            rect(a, y0, b, y1, r)

        mrect(0.226, bar_y - 0.15, 0.286, bar_y + 0.15, 0.018)  # big plate (inner)
        mrect(0.165, bar_y - 0.11, 0.213, bar_y + 0.11, 0.016)  # small plate (outer)
        mrect(0.298, bar_y - 0.045, 0.316, bar_y + 0.045, 0.006)  # collar
    # Stem of the T.
    rect(0.44, bar_y - bar_h / 2, 0.56, 0.84, 0.03)


def render(size, scale, background, path, oy=0.0):
    big = size * SS
    img = Image.new('RGBA', (big, big), background)
    draw_mark(ImageDraw.Draw(img), big, scale, oy=oy)
    img = img.resize((size, size), Image.LANCZOS)
    if background[3] == 255:
        img = img.convert('RGB')
    img.save(path)


CLEAR = (0, 0, 0, 0)
# Optical centering: the mark is top-heavy, so shift it up slightly less than its geometric offset.
OY = -0.03
render(1024, 0.78, BG, f'{OUT}/icon.png', oy=OY)
# Android adaptive icon: content must fit the ~66% safe zone.
render(1024, 0.56, CLEAR, f'{OUT}/android-icon-foreground.png', oy=OY * 0.7)
render(1024, 0.56, CLEAR, f'{OUT}/android-icon-monochrome.png', oy=OY * 0.7)
Image.new('RGB', (1024, 1024), BG[:3]).save(f'{OUT}/android-icon-background.png')
render(1024, 0.9, CLEAR, f'{OUT}/splash-icon.png')
render(48, 0.86, BG, f'{OUT}/favicon.png', oy=OY)

# Web app (PWA): home-screen icons, served from public/ next to assets/.
WEB = os.path.join(os.path.dirname(os.path.abspath(OUT)), 'public')
os.makedirs(WEB, exist_ok=True)
render(180, 0.78, BG, f'{WEB}/apple-touch-icon.png', oy=OY)
render(192, 0.78, BG, f'{WEB}/icon-192.png', oy=OY)
render(512, 0.78, BG, f'{WEB}/icon-512.png', oy=OY)
# Maskable: Android may crop it to a circle, so keep the mark inside the safe zone.
render(512, 0.56, BG, f'{WEB}/icon-maskable-512.png', oy=OY * 0.7)
print('ok')
