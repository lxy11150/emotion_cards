from __future__ import annotations

import argparse
from collections import deque
from colorsys import rgb_to_hsv
from pathlib import Path

from PIL import Image


def color_distance(a: tuple[int, int, int], b: tuple[int, int, int]) -> float:
    return sum((x - y) ** 2 for x, y in zip(a, b)) ** 0.5


def border_average(image: Image.Image) -> tuple[int, int, int]:
    width, height = image.size
    pixels = image.load()
    samples: list[tuple[int, int, int]] = []

    step = max(1, min(width, height) // 120)
    for x in range(0, width, step):
        samples.append(pixels[x, 0][:3])
        samples.append(pixels[x, height - 1][:3])
    for y in range(0, height, step):
        samples.append(pixels[0, y][:3])
        samples.append(pixels[width - 1, y][:3])

    red = sum(item[0] for item in samples) / len(samples)
    green = sum(item[1] for item in samples) / len(samples)
    blue = sum(item[2] for item in samples) / len(samples)
    return round(red), round(green), round(blue)


def is_background(pixel: tuple[int, int, int, int], bg: tuple[int, int, int]) -> bool:
    r, g, b, _ = pixel
    hue, saturation, value = rgb_to_hsv(r / 255, g / 255, b / 255)
    dist = color_distance((r, g, b), bg)

    near_paper = dist < 82 and saturation < 0.34
    very_light = value > 0.82 and saturation < 0.28
    warm_glow = hue > 0.08 and hue < 0.17 and value > 0.86 and saturation < 0.42 and dist < 98
    return near_paper or very_light or warm_glow


def remove_background(source: Path, target: Path) -> None:
    image = Image.open(source).convert("RGBA")
    width, height = image.size
    pixels = image.load()
    bg = border_average(image)

    visited = [[False for _ in range(width)] for _ in range(height)]
    queue: deque[tuple[int, int]] = deque()

    def push(x: int, y: int) -> None:
        if 0 <= x < width and 0 <= y < height and not visited[y][x]:
            visited[y][x] = True
            queue.append((x, y))

    for x in range(width):
        push(x, 0)
        push(x, height - 1)
    for y in range(height):
        push(0, y)
        push(width - 1, y)

    while queue:
        x, y = queue.popleft()
        if not is_background(pixels[x, y], bg):
            continue

        pixels[x, y] = (pixels[x, y][0], pixels[x, y][1], pixels[x, y][2], 0)
        push(x + 1, y)
        push(x - 1, y)
        push(x, y + 1)
        push(x, y - 1)

    image.save(target)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True)
    parser.add_argument("--output", required=True)
    args = parser.parse_args()

    remove_background(Path(args.input), Path(args.output))


if __name__ == "__main__":
    main()
