"""Deterministic force-directed layout for the learning graph.

Positions are computed server-side so every client draws the same map, and the same inputs
always produce the same picture (no randomness, stable node order).
"""

import hashlib
import math
from collections.abc import Mapping, Sequence

WIDTH = 1000.0
HEIGHT = 620.0
MARGIN = 70.0
ITERATIONS = 300


def _seed_angle(key: str) -> float:
    digest = hashlib.sha256(key.encode()).digest()
    return int.from_bytes(digest[:4]) / 2**32 * 2 * math.pi


def layout(
    keys: Sequence[str],
    edges: Sequence[tuple[str, str, float]],
    groups: Mapping[str, str | None] | None = None,
) -> dict[str, tuple[float, float]]:
    """Returns (x, y) per key inside the canvas. `edges` are (a, b, weight 0..1]."""
    if not keys:
        return {}
    order = sorted(set(keys))
    if len(order) == 1:
        return {order[0]: (WIDTH / 2, HEIGHT / 2)}

    # Start each topic in its own sector so related concepts settle near each other.
    group_names = sorted({g or "" for g in (groups or {}).values()})
    sector = {g: i / max(len(group_names), 1) * 2 * math.pi for i, g in enumerate(group_names)}
    pos: dict[str, list[float]] = {}
    for i, key in enumerate(order):
        group = (groups or {}).get(key) or ""
        base = sector.get(group, 0.0)
        angle = base + _seed_angle(key) * 0.6 / max(len(group_names), 1)
        radius = 0.35 + 0.6 * ((i * 0.618034) % 1)
        pos[key] = [math.cos(angle) * radius, math.sin(angle) * radius]

    index = set(order)
    springs = [(a, b, w) for a, b, w in edges if a in index and b in index and a != b]
    k = math.sqrt(4.0 / len(order))
    temperature = 0.1
    for _ in range(ITERATIONS):
        disp = {key: [0.0, 0.0] for key in order}
        for i, a in enumerate(order):
            for b in order[i + 1 :]:
                dx, dy = pos[a][0] - pos[b][0], pos[a][1] - pos[b][1]
                dist = max(math.hypot(dx, dy), 1e-3)
                force = k * k / dist
                fx, fy = dx / dist * force, dy / dist * force
                disp[a][0] += fx
                disp[a][1] += fy
                disp[b][0] -= fx
                disp[b][1] -= fy
        for a, b, weight in springs:
            dx, dy = pos[a][0] - pos[b][0], pos[a][1] - pos[b][1]
            dist = max(math.hypot(dx, dy), 1e-3)
            force = dist * dist / k * (0.5 + weight)
            fx, fy = dx / dist * force, dy / dist * force
            disp[a][0] -= fx
            disp[a][1] -= fy
            disp[b][0] += fx
            disp[b][1] += fy
        for key in order:
            # Gentle gravity keeps disconnected islands from drifting off-canvas.
            disp[key][0] -= pos[key][0] * 0.05
            disp[key][1] -= pos[key][1] * 0.05
            dx, dy = disp[key]
            length = max(math.hypot(dx, dy), 1e-9)
            step = min(length, temperature)
            pos[key][0] += dx / length * step
            pos[key][1] += dy / length * step
        temperature = max(temperature * 0.985, 0.002)

    xs = [p[0] for p in pos.values()]
    ys = [p[1] for p in pos.values()]
    span_x = max(max(xs) - min(xs), 1e-6)
    span_y = max(max(ys) - min(ys), 1e-6)
    # Fill the canvas on both axes; the map is wider than tall, so a uniform scale wastes room.
    sx = (WIDTH - 2 * MARGIN) / span_x
    sy = (HEIGHT - 2 * MARGIN) / span_y
    return {
        key: (round(MARGIN + (p[0] - min(xs)) * sx, 1), round(MARGIN + (p[1] - min(ys)) * sy, 1))
        for key, p in pos.items()
    }
