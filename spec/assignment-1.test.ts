import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";
import { current, parallelResistance, seriesResistance } from "../src/lib/circuit";

// Assignment 1's core interaction, per the brief: switching on a second
// parallel path lowers the total resistance rather than raising it, and the
// combined-resistance rule (1/R_total = sum of 1/R_i) has to hold as the
// visitor toggles paths and drags resistance sliders.
//
// These checks split that in two, same shape as this file used before the
// topic pivot:
//   - the built page exposes hooks for the interaction (structural, against
//     dist/ — same style as spec/invariants.test.ts)
//   - the circuit math itself is correct (behavioural, against the pure
//     functions in src/lib/circuit.ts)

const NEXT_STEP =
  "Update the selector/import in spec/assignment-1.test.ts to match what you built — see the comment at the top of this file.";

describe("core interaction: switchable parallel paths", () => {
  const distPath = resolve("dist/index.html");

  it("built", () => {
    expect(existsSync(distPath), `${distPath} not found — run pnpm build first.`).toBe(true);
  });

  const doc = existsSync(distPath)
    ? new JSDOM(readFileSync(distPath, "utf8")).window.document
    : null;

  it("exposes the bulb and at least two switchable branches as distinct elements", () => {
    expect(doc?.querySelector('[data-testid="bulb"]'), NEXT_STEP).toBeTruthy();
    expect(doc?.querySelector('[data-testid="branch-1"]'), NEXT_STEP).toBeTruthy();
    expect(doc?.querySelector('[data-testid="branch-2"]'), NEXT_STEP).toBeTruthy();
  });

  it("exposes a toggle and resistance control for each branch", () => {
    for (const n of [1, 2, 3]) {
      expect(doc?.querySelector(`[data-testid="toggle-branch-${n}"]`), NEXT_STEP).toBeTruthy();
      expect(doc?.querySelector(`[data-testid="resistance-slider-${n}"]`), NEXT_STEP).toBeTruthy();
    }
  });

  it("exposes live total resistance and current readouts", () => {
    expect(doc?.querySelector('[data-testid="total-resistance-readout"]'), NEXT_STEP).toBeTruthy();
    expect(doc?.querySelector('[data-testid="current-readout"]'), NEXT_STEP).toBeTruthy();
  });
});

// The brief asks for a guided progression — predict, experiment, discover,
// apply, then a harder series-plus-parallel challenge — rather than a single
// free-play circuit. These check the five stages' hooks exist in the built
// page; the stage-transition logic itself is exercised manually (see
// PROCESS.md / reflections), same reasoning as the toggle/slider interaction
// above.
describe("five-stage progression: hooks for each stage exist", () => {
  const distPath = resolve("dist/index.html");
  const doc = existsSync(distPath)
    ? new JSDOM(readFileSync(distPath, "utf8")).window.document
    : null;

  it("has stage navigation and progress hooks", () => {
    expect(doc?.querySelector('[data-testid="stage-progress"]'), NEXT_STEP).toBeTruthy();
    expect(doc?.querySelector('[data-testid="prev-stage"]'), NEXT_STEP).toBeTruthy();
    expect(doc?.querySelector('[data-testid="next-stage"]'), NEXT_STEP).toBeTruthy();
  });

  it("has predict-stage guess options", () => {
    expect(doc?.querySelector('[data-testid="predict-guess-up"]'), NEXT_STEP).toBeTruthy();
    expect(doc?.querySelector('[data-testid="predict-guess-down"]'), NEXT_STEP).toBeTruthy();
    expect(doc?.querySelector('[data-testid="predict-guess-same"]'), NEXT_STEP).toBeTruthy();
  });

  it("states the rule explicitly for the discover stage", () => {
    expect(doc?.querySelector('[data-testid="rule-statement"]'), NEXT_STEP).toBeTruthy();
  });

  it("has a target and status hook for the apply-stage puzzle", () => {
    expect(doc?.querySelector('[data-testid="puzzle-target"]'), NEXT_STEP).toBeTruthy();
    expect(doc?.querySelector('[data-testid="puzzle-status"]'), NEXT_STEP).toBeTruthy();
  });

  it("has the fixed series resistor and target for the challenge stage", () => {
    expect(doc?.querySelector('[data-testid="challenge-series-resistor"]'), NEXT_STEP).toBeTruthy();
    expect(doc?.querySelector('[data-testid="challenge-target"]'), NEXT_STEP).toBeTruthy();
  });
});

describe("parallel resistance: combined resistance is never more than the smallest branch", () => {
  it("halves for two equal resistors", () => {
    expect(parallelResistance([10, 10])).toBeCloseTo(5, 5);
  });

  it("drops further as a third equal path closes", () => {
    const two = parallelResistance([10, 10]);
    const three = parallelResistance([10, 10, 10]);
    expect(three).toBeLessThan(two);
    expect(three).toBeCloseTo(10 / 3, 5);
  });

  it("is an open circuit (infinite resistance) with no branches", () => {
    expect(parallelResistance([])).toBe(Infinity);
  });

  it("matches a single branch's own resistance", () => {
    expect(parallelResistance([12])).toBeCloseTo(12, 5);
  });
});

describe("series resistance: resistors in series simply add", () => {
  it("sums a fixed resistor with a parallel pair for the challenge stage", () => {
    const parallelPair = parallelResistance([10, 10]);
    const total = seriesResistance([8, parallelPair]);
    expect(total).toBeCloseTo(13, 5);
  });
});

describe("Ohm's law: current is voltage over resistance", () => {
  it("holds for a range of voltage/resistance pairs", () => {
    expect(current(12, 5)).toBeCloseTo(2.4, 5);
    expect(current(12, 10)).toBeCloseTo(1.2, 5);
    expect(current(9, 3)).toBeCloseTo(3, 5);
  });

  it("is zero for an open circuit", () => {
    expect(current(12, Infinity)).toBe(0);
  });
});
