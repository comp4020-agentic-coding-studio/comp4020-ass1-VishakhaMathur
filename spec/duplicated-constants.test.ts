import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

// index.astro deliberately duplicates several numeric constants between its
// frontmatter (which renders the real initial markup, so it's testable as
// static HTML) and its client <script> (which owns rebuilding that markup
// after an interaction, and can't see frontmatter variables at runtime). That
// split is an intentional pattern, documented inline where it's used — but it
// bit once already: the experiment section's target/epsilon/default values
// were updated on one side and not the other, so the browser kept running a
// stale circuit no matter what the page displayed on load (see PROCESS.md).
//
// This test is the harness-level fix for that specific failure mode: instead
// of trusting a re-read of the file to catch drift, every known duplicated
// pair is asserted equal directly against the source text. A future edit to
// only one side fails this test immediately, rather than silently shipping a
// page whose script disagrees with its own markup.

const source = readFileSync(resolve("src/pages/index.astro"), "utf-8");

const frontmatterMatch = source.match(/^---\n([\s\S]*?)\n---/);
if (!frontmatterMatch) throw new Error("Could not find frontmatter block in index.astro");
const frontmatter = frontmatterMatch[1];

const scriptMatch = source.match(/<script>\n([\s\S]*?)<\/script>/);
if (!scriptMatch) throw new Error("Could not find the client <script> block in index.astro");
const script = scriptMatch[1];

function literalIn(text: string, name: string): unknown {
  const match = text.match(new RegExp(`(?:const|let)\\s+${name}\\s*=\\s*([^;]+);`));
  if (!match) throw new Error(`Could not find "const/let ${name} = ...;" in the searched block`);
  return JSON.parse(match[1].replace(/\s+/g, " ").trim());
}

describe("index.astro: frontmatter/script constant duplication stays in sync", () => {
  const pairs: Array<[string, string, string]> = [
    ["voltage", "VOLTAGE", "VOLTAGE_CHECK_VOLTAGE"],
    ["voltage", "VOLTAGE", "EXP_VOLTAGE"],
    ["voltage", "VOLTAGE", "CHALLENGE_VOLTAGE"],
    ["experiment viewbox width", "EXPERIMENT_VIEWBOX_WIDTH", "EXP_VIEWBOX_WIDTH"],
    ["experiment left x", "EXPERIMENT_LEFT_X", "EXP_LEFT_X"],
    ["experiment right x", "EXPERIMENT_RIGHT_X", "EXP_RIGHT_X"],
    ["experiment bus top y", "EXPERIMENT_BUS_TOP_Y", "EXP_BUS_TOP_Y"],
    ["experiment branch spacing", "EXPERIMENT_BRANCH_SPACING", "EXP_BRANCH_SPACING"],
    ["experiment min resistors", "EXPERIMENT_MIN_RESISTORS", "EXP_MIN_RESISTORS"],
    ["experiment max resistors", "EXPERIMENT_MAX_RESISTORS", "EXP_MAX_RESISTORS"],
    ["experiment target ohms", "EXPERIMENT_TARGET_OHMS", "EXP_TARGET_OHMS"],
    ["experiment success epsilon", "EXPERIMENT_SUCCESS_EPSILON", "EXP_SUCCESS_EPSILON"],
  ];

  for (const [label, frontmatterName, scriptName] of pairs) {
    it(`${label}: frontmatter's ${frontmatterName} matches script's ${scriptName}`, () => {
      expect(literalIn(script, scriptName)).toEqual(literalIn(frontmatter, frontmatterName));
    });
  }

  it("experiment default values: frontmatter's EXPERIMENT_DEFAULT_VALUES matches script's initial `values`", () => {
    expect(literalIn(script, "values")).toEqual(literalIn(frontmatter, "EXPERIMENT_DEFAULT_VALUES"));
  });

  it("challenge resistances: frontmatter's CHALLENGE_RESISTANCES matches script's CHALLENGE_RESISTANCES", () => {
    expect(literalIn(script, "CHALLENGE_RESISTANCES")).toEqual(literalIn(frontmatter, "CHALLENGE_RESISTANCES"));
  });
});
