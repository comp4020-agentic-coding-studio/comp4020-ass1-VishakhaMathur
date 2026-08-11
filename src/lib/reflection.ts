// Pure geometry for the reflection simulation — no DOM, no dragging, so it
// can be unit tested directly (see spec/assignment-1.test.ts) and reused by
// the page script that drives the actual SVG.

export interface Point {
  x: number;
  y: number;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function toDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

function normalize(v: Point): Point {
  const len = Math.hypot(v.x, v.y) || 1;
  return { x: v.x / len, y: v.y / len };
}

function dot(a: Point, b: Point): number {
  return a.x * b.x + a.y * b.y;
}

function clampCos(value: number): number {
  return Math.min(1, Math.max(-1, value));
}

// The normal to a mirror drawn at `mirrorAngleDeg` (0 = horizontal, along
// +x), pointing to the side the light source is on. In SVG coordinates
// (+y is down), a horizontal mirror's "up" normal is (0, -1).
export function mirrorNormal(mirrorAngleDeg: number): Point {
  const rad = toRad(mirrorAngleDeg);
  return normalize({ x: Math.sin(rad), y: -Math.cos(rad) });
}

// Reflects a unit direction vector `incoming` off a surface with unit
// `normal` — the standard vector-reflection formula: r = d - 2(d·n)n.
export function reflectVector(incoming: Point, normal: Point): Point {
  const d = dot(incoming, normal);
  return { x: incoming.x - 2 * d * normal.x, y: incoming.y - 2 * d * normal.y };
}

// The spec's core physical law, isolated from any DOM/dragging concern: an
// incident ray arriving at `incidenceAngleDeg` from the normal reflects back
// out at the same angle from that normal. Computed via reflectVector rather
// than just returning the input, so a broken reflectVector implementation
// would show up here too.
export function reflect(incidenceAngleDeg: number): number {
  // `normal` already points away from the mirror (toward the light-source
  // side) — both the incoming ray's angle-of-arrival and the reflected
  // ray's angle-of-departure are measured from this same vector.
  const normal: Point = { x: 0, y: -1 };
  const rad = toRad(incidenceAngleDeg);
  const incoming = normalize({ x: Math.sin(rad), y: Math.cos(rad) });
  const reflected = reflectVector(incoming, normal);
  return toDeg(Math.acos(clampCos(dot(reflected, normal))));
}

export interface ReflectionResult {
  incidenceAngleDeg: number;
  reflectedPoint: Point;
}

// Full scene geometry: given the light source and a fixed point of
// incidence on the mirror, returns the incidence angle (for display) and a
// point far enough along the reflected ray to draw it.
export function computeReflectedRay(
  source: Point,
  incidencePoint: Point,
  mirrorAngleDeg: number,
  rayLength: number,
): ReflectionResult {
  const normal = mirrorNormal(mirrorAngleDeg);
  const incoming = normalize({
    x: incidencePoint.x - source.x,
    y: incidencePoint.y - source.y,
  });
  // -incoming points from the incidence point back toward the source, i.e.
  // away from the mirror on the same side as `normal`.
  const incidenceAngleDeg = toDeg(
    Math.acos(clampCos(dot({ x: -incoming.x, y: -incoming.y }, normal))),
  );
  const reflectedDir = reflectVector(incoming, normal);
  return {
    incidenceAngleDeg,
    reflectedPoint: {
      x: incidencePoint.x + reflectedDir.x * rayLength,
      y: incidencePoint.y + reflectedDir.y * rayLength,
    },
  };
}

// Perpendicular distance from `point` to the ray segment from `origin`
// toward `direction`, clamped to `maxLength` — used for "did the reflected
// ray hit the target" checks.
export function distancePointToRaySegment(
  point: Point,
  origin: Point,
  direction: Point,
  maxLength: number,
): number {
  const dir = normalize(direction);
  const toPoint = { x: point.x - origin.x, y: point.y - origin.y };
  const t = Math.max(0, Math.min(maxLength, dot(toPoint, dir)));
  const closest = { x: origin.x + dir.x * t, y: origin.y + dir.y * t };
  return Math.hypot(point.x - closest.x, point.y - closest.y);
}
