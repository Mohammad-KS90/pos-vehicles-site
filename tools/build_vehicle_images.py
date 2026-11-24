#!/usr/bin/env python3
"""Build the Supported Vehicle Types images from the Figma 3D renders.

Source: _design/vehicle-3d/<Name> (<slug>)@3x.png  (960x720, black vehicle on white)
Output: assets/vehicles/<type>-<width>.webp      (4:3, widths below)

"all" has no render of its own, so it is a 2x2 grid of the other four. The
renders sit on an opaque white background, so they are tiled, never overlapped.

Usage: python3 -I tools/build_vehicle_images.py   (needs Pillow)
"""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
# Leading "_": GitHub Pages (Jekyll) leaves the folder out of the published site.
SRC = ROOT / "_design" / "vehicle-3d"
OUT = ROOT / "assets" / "vehicles"
WIDTHS = (320, 640, 960)
QUALITY = 82

# Site vehicle type -> Figma render name
SOURCES = {
    "car": "Sedan (sedan)",
    "truck": "Box truck (box-truck)",
    "bus": "Bus (bus)",
    "motorcycle": "Motorcycle (motorcycle)",
}

ALL_ORDER = ("car", "truck", "bus", "motorcycle")  # grid, reading order


def load(name: str) -> Image.Image:
    return Image.open(SRC / f"{name}@3x.png").convert("RGB")


def compose_all(images: dict) -> Image.Image:
    canvas = Image.new("RGB", (960, 720), (255, 255, 255))
    cell_w, cell_h = 480, 360
    for i, vtype in enumerate(ALL_ORDER):
        tile = images[vtype].resize((cell_w, cell_h), Image.LANCZOS)
        canvas.paste(tile, ((i % 2) * cell_w, (i // 2) * cell_h))
    return canvas


def main() -> None:
    OUT.mkdir(exist_ok=True)
    images = {t: load(n) for t, n in SOURCES.items()}
    images["all"] = compose_all(images)
    for vtype, im in images.items():
        for w in WIDTHS:
            out = OUT / f"{vtype}-{w}.webp"
            im.resize((w, w * 3 // 4), Image.LANCZOS).save(out, "WEBP", quality=QUALITY, method=6)
            print(f"{out.relative_to(ROOT)}  {out.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
