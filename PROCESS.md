# Process overview

A reading-guide to how the work came together --- a map to your process, not an
essay about it.

## What I built

"Resistors in Parallel" is a static teaching prototype that walks a visitor
from intuition to proof to practice: a drag-to-connect comprehension check, a
predict-then-reveal quiz on what parallel resistors do to total resistance, a
highway/car analogy for why, a formal Ohm's-law-and-Kirchhoff's-law derivation
with an animated current-flow diagram, a free-play "adjust the resistors"
experiment with a reach-a-target-resistance challenge, and a final fixed
three-branch circuit where the visitor has to work out total resistance,
total current, and every branch current themselves and check their answers
against a worked solution.

## The moments that mattered

**The "reach 7Ω" challenge silently broke when I widened it from two
resistors to three, and it took two separate bugs to find why.** A visitor
reported that dragging the third resistor's slider did nothing to the total,
and that the success checkmark never appeared even at a true 7Ω. The obvious
fix — bump the two numbers that looked responsible — wasn't enough, because
this page's frontmatter constants (used for the server-rendered initial
state) are manually mirrored as separate literals inside the client-side
`<script>` block, with no shared import between them. `EXPERIMENT_DEFAULT_VALUES`
and `EXPERIMENT_TARGET_OHMS` had been updated in the frontmatter, but the
script's own `values = [10, 10]` and `EXP_TARGET_OHMS = 4` were never touched,
so the browser was still running the old two-resistor, 4Ω circuit no matter
what the page displayed on load. Instead of just patching those two literals
and moving on, I grepped every frontmatter constant this session touched for
a matching script-side mirror, on the assumption that if one had gone stale
silently, others could too. I confirmed the fix by re-running `pnpm check`
(jsdom can't fire slider `input` events reliably, so behavioural sliders
aren't exercised there) and by grepping the *compiled* `dist/index.html` for
the literal values, since the bug was specifically a source/build mismatch a
passing test suite wouldn't have caught on its own.
([`3b73d33`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-VishakhaMathur/commit/3b73d33a29bd4c8e5af2e8fa2e83e4e17e507193))

**Even after fixing the stale values, the success checkmark still wouldn't
fire — because the equality check was too strict for the maths.** The success
condition compared the computed total against 7 with a `1e-9` epsilon,
essentially requiring bit-exact float equality. With three integer-only
sliders (step 1, range 1-100), a visitor can easily land on a combination
whose *displayed*, one-decimal-rounded total reads "7.0Ω" without the
underlying float being exactly `7`. The obvious fix would have been to just
loosen the epsilon to something that "felt" generous; instead I picked `0.05`
specifically because it's half the 0.1 granularity of the one-decimal
display, so "the epsilon check passes" and "the readout shows 7.0Ω" become
the same guarantee rather than two guarantees that can disagree. I checked
this by working through near-miss integer combinations (e.g. totals around
6.98–7.02) by hand to confirm they now pass the check while still rendering
as "7.0Ω", rather than trusting the new constant on inspection alone.
([`3b73d33`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-VishakhaMathur/commit/3b73d33a29bd4c8e5af2e8fa2e83e4e17e507193))

**Per-branch current readouts overflowed the layout once a third resistor
existed to display.** I'd added `I{n}: {amps}A` inline inside each resistor's
control row, which was fine at two resistors but visibly ran off the page at
three. Rather than shrinking the text or letting the row scroll, I moved the
readouts out of the rows entirely and into a dedicated block below the
total-resistance card — deliberately reusing the `voltage-check-currents`
layout already established (and already visually approved) elsewhere on the
same page, rather than inventing a new pattern for the same problem. This
kept the page's several "read the current for each branch" moments visually
and structurally consistent with each other.
([`3b73d33`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-VishakhaMathur/commit/3b73d33a29bd4c8e5af2e8fa2e83e4e17e507193))

**Designing the final "solve it yourself" challenge meant picking numbers on
purpose, not just wiring up inputs.** For the closing section — a fixed
circuit where the visitor calculates and checks total resistance, total
current, and each branch current — I deliberately chose R1=6Ω, R2=12Ω,
R3=4Ω at 12V instead of reusing the experiment's default values, specifically
because they resolve to clean, non-repeating numbers (Rtotal=2Ω, Itotal=6A,
I1=2A, I2=1A, I3=3A). That was a direct response to the epsilon bug above: a
challenge whose correct answers are themselves ambiguous floats would just
reintroduce the same "6.98 vs 7.0" problem on the input side. I confirmed the
choice by grepping the built `dist/index.html` for the worked-solution numbers
to check they actually rendered as the clean values I'd picked, not just that
the section existed.
([`3b73d33`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-VishakhaMathur/commit/3b73d33a29bd4c8e5af2e8fa2e83e4e17e507193))
