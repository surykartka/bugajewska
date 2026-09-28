#!/usr/bin/env python3
"""Regenerate uz-lightbox-data.js from whatever files are in gallery/<slug>/.

Run this after adding/removing/replacing images inside a gallery/<slug>/
folder. Captions are kept for files whose path didn't change; new files
get an empty caption you can fill in afterwards by editing
uz-lightbox-data.js directly (each entry is {"src": ..., "caption": ...}).
"""
import json
import os
import re

ROOT = os.path.dirname(os.path.abspath(__file__))
GALLERY_DIR = os.path.join(ROOT, "gallery")
DATA_FILE = os.path.join(ROOT, "uz-lightbox-data.js")
IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}


def natural_key(name):
    return [int(t) if t.isdigit() else t.lower() for t in re.split(r"(\d+)", name)]


def load_old_captions():
    if not os.path.exists(DATA_FILE):
        return {}
    with open(DATA_FILE, encoding="utf-8") as f:
        text = f.read()
    text = text.split("=", 1)[1].strip().rstrip(";").strip()
    try:
        old = json.loads(text)
    except json.JSONDecodeError:
        return {}
    captions = {}
    for items in old.values():
        for item in items:
            captions[item["src"]] = item.get("caption", "")
    return captions


def main():
    old_captions = load_old_captions()
    data = {}

    if not os.path.isdir(GALLERY_DIR):
        print(f"No gallery/ directory found at {GALLERY_DIR}")
        return

    for slug in sorted(os.listdir(GALLERY_DIR)):
        slug_dir = os.path.join(GALLERY_DIR, slug)
        if not os.path.isdir(slug_dir):
            continue
        files = [
            f for f in os.listdir(slug_dir)
            if os.path.splitext(f)[1].lower() in IMAGE_EXTS
        ]
        files.sort(key=natural_key)
        if not files:
            print(f"  (skipping '{slug}': no images found)")
            continue

        items = []
        for fname in files:
            src = f"gallery/{slug}/{fname}"
            items.append({"src": src, "caption": old_captions.get(src, "")})
        data[slug] = items
        print(f"  {slug}: {len(items)} image(s)")

    with open(DATA_FILE, "w", encoding="utf-8") as f:
        f.write("window.UZ_GALLERIES = ")
        f.write(json.dumps(data, ensure_ascii=False, indent=2))
        f.write(";\n")

    print(f"\nWrote {DATA_FILE}")


if __name__ == "__main__":
    main()
