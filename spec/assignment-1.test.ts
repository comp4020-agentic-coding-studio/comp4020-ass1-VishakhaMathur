import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

// Assignment 1's core interaction, per the brief: dragging and aiming the
// light source changes the incident and reflected rays the visitor sees, and
// the law of reflection (angle of incidence == angle of reflection) has to
// hold as they do it.
//
// These two checks split that in two:
//   - the built page exposes hooks for the interaction (structural, against
//     dist/ — same style as spec/invariants.test.ts)
//   - the reflection geometry itself is correct (behavioural, against your
//     own pure function — jsdom has no real layout, so driving an actual
//     pointer drag through a built static page isn't a check worth writing)
//
// The exact selectors and the reflection function's location below are a
// starting contract, not a fixed one — once you've built the simulation,
// update the strings/import path to match what you actually built. Keep the
// two assertions (hooks exist; angle in == angle out) — those are the part of
// the spec this file answers.

const NEXT_STEP =
  "Update the selector/import in spec/assignment-1.test.ts to match what you built — see the comment at the top of this file.";

describe("core interaction: draggable light source", () => {
  const distPath = resolve("dist/index.html");

  it("built", () => {
    expect(existsSync(distPath), `${distPath} not found — run pnpm build first.`).toBe(true);
  });

  const doc = existsSync(distPath)
    ? new JSDOM(readFileSync(distPath, "utf8")).window.document
    : null;

  it("exposes the light source as a distinct, labelled element", () => {
    const lightSource = doc?.querySelector('[data-testid="light-source"]');
    expect(lightSource, NEXT_STEP).toBeTruthy();
  });

  it("exposes the incident and reflected rays as distinct elements", () => {
    const incident = doc?.querySelector('[data-testid="incident-ray"]');
    const reflected = doc?.querySelector('[data-testid="reflected-ray"]');
    expect(incident, NEXT_STEP).toBeTruthy();
    expect(reflected, NEXT_STEP).toBeTruthy();
  });
});

describe("law of reflection: angle of incidence equals angle of reflection", () => {
  it("holds for a range of incident angles", async () => {
    // Assumed contract: a pure function, decoupled from dragging and DOM,
    // that takes the incident ray's angle (degrees, measured from the
    // mirror surface or its normal — pick one and be consistent) and
    // returns the reflected ray's angle on the same reference.
    //
    // import.meta.glob (rather than a plain import) so this file — and
    // typecheck — stays green before the module exists: an empty match
    // isn't a module-resolution error, just an empty object.
    const candidates = import.meta.glob<{ reflect?: (angleDeg: number) => number }>(
      "../src/lib/reflection.ts",
    );
    const modulePath = Object.keys(candidates)[0];
    const reflect = modulePath ? (await candidates[modulePath]()).reflect : undefined;

    expect(reflect, `No reflection function found. ${NEXT_STEP}`).toBeTypeOf("function");
    if (!reflect) return;

    for (const angle of [5, 15, 30, 45, 60, 75, 85]) {
      expect(reflect(angle), `reflect(${angle}) should return the same angle`).toBeCloseTo(
        angle,
        5,
      );
    }
  });
});
