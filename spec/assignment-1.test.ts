import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";
import { current, parallelResistance, seriesResistance } from "../src/lib/circuit";

// Assignment 1's core interaction, per the brief: the combined-resistance
// rule (1/R_total = sum of 1/R_i) has to hold as parallel paths are added.
//
// These checks split that in two, same shape as this file used before the
// topic pivot:
//   - the built page exposes hooks for the interaction (structural, against
//     dist/ — same style as spec/invariants.test.ts)
//   - the circuit math itself is correct (behavioural, against the pure
//     functions in src/lib/circuit.ts)

const NEXT_STEP =
  "Update the selector/import in spec/assignment-1.test.ts to match what you built — see the comment at the top of this file.";

// A standalone comprehension check on the "same two points" definition.
// Drag/snap logic isn't reliably testable under jsdom (no real layout, so
// getBoundingClientRect distances are meaningless), so this only checks the
// hooks exist and the structural placement; the drag interaction itself is
// exercised manually.
describe("parallel connection check: drag-to-connect hooks exist", () => {
  const distPath = resolve("dist/index.html");

  it("built", () => {
    expect(existsSync(distPath), `${distPath} not found — run pnpm build first.`).toBe(true);
  });

  const doc = existsSync(distPath)
    ? new JSDOM(readFileSync(distPath, "utf8")).window.document
    : null;

  it("exposes the parallel-check section", () => {
    expect(doc?.querySelector('[data-testid="parallel-check"]'), NEXT_STEP).toBeTruthy();
  });

  it("exposes both rails, both slots, and both resistor tiles", () => {
    expect(doc?.querySelector('[data-testid="parallel-check-rail-left"]'), NEXT_STEP).toBeTruthy();
    expect(doc?.querySelector('[data-testid="parallel-check-rail-right"]'), NEXT_STEP).toBeTruthy();
    expect(doc?.querySelector('[data-testid="parallel-check-slot-1"]'), NEXT_STEP).toBeTruthy();
    expect(doc?.querySelector('[data-testid="parallel-check-slot-2"]'), NEXT_STEP).toBeTruthy();
    expect(doc?.querySelector('[data-testid="parallel-check-resistor-1"]'), NEXT_STEP).toBeTruthy();
    expect(doc?.querySelector('[data-testid="parallel-check-resistor-2"]'), NEXT_STEP).toBeTruthy();
  });

  it("renders each resistor tile with an image", () => {
    for (const n of [1, 2]) {
      expect(
        doc?.querySelector(`[data-testid="parallel-check-resistor-${n}"] img`),
        NEXT_STEP,
      ).toBeTruthy();
    }
  });

  it("exposes a feedback hook", () => {
    expect(doc?.querySelector('[data-testid="parallel-check-feedback"]'), NEXT_STEP).toBeTruthy();
  });
});

// A review page (dist/review/index.html — Astro's directory build format)
// where visitors can leave a star rating and comment. Static site, no
// backend: submitting just shows a thank-you, nothing is persisted, so same
// reasoning as above — only the hooks are checked here, the rating/submit/
// reset interaction is exercised manually.
describe("review page: rating and comment hooks exist", () => {
  const distPath = resolve("dist/review/index.html");
  const doc = existsSync(distPath)
    ? new JSDOM(readFileSync(distPath, "utf8")).window.document
    : null;

  it("built", () => {
    expect(existsSync(distPath), `${distPath} not found — run pnpm build first.`).toBe(true);
  });

  it("exposes five star-rating buttons and the comment box", () => {
    for (const n of [1, 2, 3, 4, 5]) {
      expect(doc?.querySelector(`[data-testid="rating-star-${n}"]`), NEXT_STEP).toBeTruthy();
    }
    expect(doc?.querySelector('[data-testid="review-comment"]'), NEXT_STEP).toBeTruthy();
  });

  it("exposes a submit button and a feedback hook", () => {
    expect(doc?.querySelector('[data-testid="review-submit"]'), NEXT_STEP).toBeTruthy();
    expect(doc?.querySelector('[data-testid="review-feedback"]'), NEXT_STEP).toBeTruthy();
  });
});

// A follow-up analogy, revealed once the visitor answers the resistance
// quiz above: a speed bump stands in for a resistor and a car for current,
// with a series road (one lane, two bumps) raced against a parallel road
// (two lanes, one bump each). Same reasoning as the drag-to-connect check
// above — driving/animation/sound is exercised manually, only the
// structural hooks are asserted here.
describe("highway analogy: hooks exist", () => {
  const distPath = resolve("dist/index.html");
  const doc = existsSync(distPath)
    ? new JSDOM(readFileSync(distPath, "utf8")).window.document
    : null;

  it("exposes the section, drive button, and sound toggle", () => {
    expect(doc?.querySelector('[data-testid="highway-analogy"]'), NEXT_STEP).toBeTruthy();
    expect(doc?.querySelector('[data-testid="highway-drive"]'), NEXT_STEP).toBeTruthy();
    expect(doc?.querySelector('[data-testid="highway-sound-toggle"]'), NEXT_STEP).toBeTruthy();
  });

  it("exposes the series board with its car and two bumps", () => {
    expect(doc?.querySelector('[data-testid="highway-series-board"]'), NEXT_STEP).toBeTruthy();
    expect(doc?.querySelector('[data-testid="highway-series-car"]'), NEXT_STEP).toBeTruthy();
    expect(doc?.querySelector('[data-testid="highway-series-bump-1"]'), NEXT_STEP).toBeTruthy();
    expect(doc?.querySelector('[data-testid="highway-series-bump-2"]'), NEXT_STEP).toBeTruthy();
  });

  it("exposes the parallel board with both cars and both bumps", () => {
    expect(doc?.querySelector('[data-testid="highway-parallel-board"]'), NEXT_STEP).toBeTruthy();
    expect(doc?.querySelector('[data-testid="highway-parallel-car-1"]'), NEXT_STEP).toBeTruthy();
    expect(doc?.querySelector('[data-testid="highway-parallel-car-2"]'), NEXT_STEP).toBeTruthy();
    expect(doc?.querySelector('[data-testid="highway-parallel-bump-1"]'), NEXT_STEP).toBeTruthy();
    expect(doc?.querySelector('[data-testid="highway-parallel-bump-2"]'), NEXT_STEP).toBeTruthy();
  });

  it("exposes a comparison readout", () => {
    expect(doc?.querySelector('[data-testid="highway-comparison"]'), NEXT_STEP).toBeTruthy();
  });
});

// Voltage-across-branches, revealed alongside the derivation by the same
// Drive click: the same closed 2-resistor board, but with a voltmeter on each
// branch, a slider per resistor, and a current readout per branch below the
// controls, so a visitor can change R1/R2 and see the voltmeters stay locked
// together while only the currents move. Structural hooks only, same
// reasoning as above.
describe("voltage across parallel branches: hooks exist", () => {
  const distPath = resolve("dist/index.html");
  const doc = existsSync(distPath)
    ? new JSDOM(readFileSync(distPath, "utf8")).window.document
    : null;

  it("exposes the section, board, and controls panel", () => {
    expect(doc?.querySelector('[data-testid="voltage-check"]'), NEXT_STEP).toBeTruthy();
    expect(doc?.querySelector('[data-testid="voltage-check-board"]'), NEXT_STEP).toBeTruthy();
    expect(doc?.querySelector('[data-testid="voltage-check-controls"]'), NEXT_STEP).toBeTruthy();
  });

  it("exposes both branches with a slider, value readout, and voltmeter each", () => {
    for (const n of [1, 2]) {
      expect(doc?.querySelector(`[data-testid="voltage-check-resistor-${n}"]`), NEXT_STEP).toBeTruthy();
      expect(doc?.querySelector(`[data-testid="voltage-check-resistor-${n}-slider"]`), NEXT_STEP).toBeTruthy();
      expect(doc?.querySelector(`[data-testid="voltage-check-resistor-${n}-value"]`), NEXT_STEP).toBeTruthy();
      expect(doc?.querySelector(`[data-testid="voltage-check-voltmeter-${n}"]`), NEXT_STEP).toBeTruthy();
    }
  });

  it("shows both voltmeters reading the same voltage at the default state", () => {
    const v1 = doc?.querySelector('[data-testid="voltage-check-voltmeter-1"]')?.textContent;
    const v2 = doc?.querySelector('[data-testid="voltage-check-voltmeter-2"]')?.textContent;
    expect(v1, NEXT_STEP).toBeTruthy();
    expect(v1?.split(":")[1]?.trim()).toBe(v2?.split(":")[1]?.trim());
  });

  it("exposes the summary callout", () => {
    expect(doc?.querySelector('[data-testid="voltage-check-summary"]'), NEXT_STEP).toBeTruthy();
  });

  it("exposes a separate, clearly-labelled current readout for each branch below the summary", () => {
    for (const n of [1, 2]) {
      const readout = doc?.querySelector(`[data-testid="voltage-check-current-readout-${n}"]`);
      expect(readout, NEXT_STEP).toBeTruthy();
      expect(readout?.textContent).toContain(`I${n}:`);
    }
  });
});

// The formal derivation, revealed once the visitor presses Drive on the
// highway section: the same closed parallel circuit as "Check your
// understanding," with total current I shown splitting into I1/I2 and
// recombining, alongside the algebraic steps from Ohm's law to
// 1/R_total = 1/R1 + 1/R2. Structural hooks only, same reasoning as above.
describe("resistance derivation: hooks exist", () => {
  const distPath = resolve("dist/index.html");
  const doc = existsSync(distPath)
    ? new JSDOM(readFileSync(distPath, "utf8")).window.document
    : null;

  it("exposes the section and circuit board", () => {
    expect(doc?.querySelector('[data-testid="derivation"]'), NEXT_STEP).toBeTruthy();
    expect(doc?.querySelector('[data-testid="derivation-board"]'), NEXT_STEP).toBeTruthy();
  });

  it("labels total current splitting into I1/I2 and recombining", () => {
    expect(doc?.querySelector('[data-testid="derivation-current-i-in"]'), NEXT_STEP).toBeTruthy();
    expect(doc?.querySelector('[data-testid="derivation-current-i1"]'), NEXT_STEP).toBeTruthy();
    expect(doc?.querySelector('[data-testid="derivation-current-i2"]'), NEXT_STEP).toBeTruthy();
    expect(doc?.querySelector('[data-testid="derivation-current-i-out"]'), NEXT_STEP).toBeTruthy();
  });

  it("exposes the step-by-step derivation", () => {
    expect(doc?.querySelector('[data-testid="derivation-steps"]'), NEXT_STEP).toBeTruthy();
  });

  it("highlights the step where total current equals I1 + I2", () => {
    const step = doc?.querySelector('[data-testid="derivation-step-kirchhoff"]');
    expect(step, NEXT_STEP).toBeTruthy();
    expect(step?.className).toContain("derivation-step-highlight");
    expect(step?.textContent).toContain("1");
    expect(step?.textContent).toContain("2");
  });

  it("exposes its own sound toggle for the current-flow hum", () => {
    expect(doc?.querySelector('[data-testid="derivation-sound-toggle"]'), NEXT_STEP).toBeTruthy();
  });
});

// A single master volume slider (Header slot, so it's above every section)
// that scales the Check-your-understanding, highway, and derivation hums
// together — structural hook only, same reasoning as above.
describe("master volume slider: hook exists", () => {
  const distPath = resolve("dist/index.html");
  const doc = existsSync(distPath)
    ? new JSDOM(readFileSync(distPath, "utf8")).window.document
    : null;

  it("exposes the volume slider", () => {
    expect(doc?.querySelector('[data-testid="sound-volume-slider"]'), NEXT_STEP).toBeTruthy();
  });
});

// The final section, revealed alongside the derivation: the same parallel
// circuit, but with an adjustable resistor count and sliders, so a visitor
// can change values or add/remove resistors and watch the total resistance
// respond live. Unlike the other boards, resistor count varies at runtime —
// these hooks only check the built page's initial three-resistor state;
// adding/removing/dragging is exercised manually.
describe("resistor experiment: hooks exist", () => {
  const distPath = resolve("dist/index.html");
  const doc = existsSync(distPath)
    ? new JSDOM(readFileSync(distPath, "utf8")).window.document
    : null;

  it("exposes the section, board, and controls panel", () => {
    expect(doc?.querySelector('[data-testid="experiment"]'), NEXT_STEP).toBeTruthy();
    expect(doc?.querySelector('[data-testid="experiment-board"]'), NEXT_STEP).toBeTruthy();
    expect(doc?.querySelector('[data-testid="experiment-controls"]'), NEXT_STEP).toBeTruthy();
  });

  it("exposes an add-resistor button and a total-resistance readout", () => {
    expect(doc?.querySelector('[data-testid="experiment-add-resistor"]'), NEXT_STEP).toBeTruthy();
    expect(doc?.querySelector('[data-testid="experiment-total"]'), NEXT_STEP).toBeTruthy();
  });

  it("poses the reach-7-ohms challenge, with its success message hidden at the default (~3.3Ω) state", () => {
    expect(doc?.querySelector('[data-testid="experiment-challenge"]'), NEXT_STEP).toBeTruthy();
    const success = doc?.querySelector('[data-testid="experiment-success"]');
    expect(success, NEXT_STEP).toBeTruthy();
    expect((success as HTMLElement | undefined)?.hidden).toBe(true);
  });

  it("exposes all three initial resistors with a slider, value readout, and remove button each", () => {
    for (const n of [1, 2, 3]) {
      expect(doc?.querySelector(`[data-testid="experiment-resistor-${n}"]`), NEXT_STEP).toBeTruthy();
      expect(doc?.querySelector(`[data-testid="experiment-resistor-${n}-slider"]`), NEXT_STEP).toBeTruthy();
      expect(doc?.querySelector(`[data-testid="experiment-resistor-${n}-value"]`), NEXT_STEP).toBeTruthy();
      expect(doc?.querySelector(`[data-testid="experiment-resistor-${n}-remove"]`), NEXT_STEP).toBeTruthy();
    }
  });

  it("exposes a separate current readout for each branch below the total-resistance card", () => {
    expect(doc?.querySelector('[data-testid="experiment-currents"]'), NEXT_STEP).toBeTruthy();
    for (const n of [1, 2, 3]) {
      const readout = doc?.querySelector(`[data-testid="experiment-current-readout-${n}"]`);
      expect(readout, NEXT_STEP).toBeTruthy();
      expect(readout?.textContent).toContain(`I${n}:`);
    }
  });
});

// These hooks only check the built page's fixed challenge circuit and its
// answer-checking UI structure; typing into the inputs and clicking "Check
// my answers" is exercised manually, same reasoning as every other slider
// section above (jsdom cannot reliably drive synthetic input/click events).
describe("resistor challenge: hooks exist", () => {
  const distPath = resolve("dist/index.html");
  const doc = existsSync(distPath)
    ? new JSDOM(readFileSync(distPath, "utf8")).window.document
    : null;

  it("exposes the section, board, and controls panel", () => {
    expect(doc?.querySelector('[data-testid="challenge"]'), NEXT_STEP).toBeTruthy();
    expect(doc?.querySelector('[data-testid="challenge-board"]'), NEXT_STEP).toBeTruthy();
    expect(doc?.querySelector('[data-testid="challenge-controls"]'), NEXT_STEP).toBeTruthy();
  });

  it("draws all three fixed branch resistors on the circuit diagram", () => {
    for (const n of [1, 2, 3]) {
      expect(doc?.querySelector(`[data-testid="challenge-resistor-${n}"]`), NEXT_STEP).toBeTruthy();
    }
  });

  it("exposes an answer input and a hidden result mark for total resistance, total current, and each branch current", () => {
    for (const testid of ["total-resistance", "total-current", "i1", "i2", "i3"]) {
      expect(doc?.querySelector(`[data-testid="challenge-input-${testid}"]`), NEXT_STEP).toBeTruthy();
      expect(doc?.querySelector(`[data-testid="challenge-mark-${testid}"]`), NEXT_STEP).toBeTruthy();
    }
  });

  it("exposes a check-answers button and a feedback callout that starts hidden", () => {
    expect(doc?.querySelector('[data-testid="challenge-check"]'), NEXT_STEP).toBeTruthy();
    const feedback = doc?.querySelector('[data-testid="challenge-feedback"]');
    expect(feedback, NEXT_STEP).toBeTruthy();
    expect((feedback as HTMLElement | undefined)?.hidden).toBe(true);
    expect(doc?.querySelector('[data-testid="challenge-feedback-verdict"]'), NEXT_STEP).toBeTruthy();
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
  it("sums a fixed resistor with a parallel pair", () => {
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
