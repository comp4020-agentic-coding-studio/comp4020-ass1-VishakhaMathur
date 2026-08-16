# Process overview

A reading-guide to how the work came together --- a map to your process, not an
essay about it.

## What I built

"Resistors in Parallel" is a static teaching prototype that walks a visitor
from intuition to proof to practice: a drag-to-connect comprehension check, a
predict-then-reveal quiz on what parallel resistors do to total resistance, a
highway/car analogy for why, a formal Ohm's-law-and-Kirchhoff's-law derivation
with an animated current-flow diagram, and a free-play "adjust the resistors"
experiment with a reach-a-target-resistance challenge.

## The moments that mattered

**The "reach 7Ω" challenge silently broke when I widened it from two
resistors to three, and the real fix wasn't the two numbers I first
suspected.** A visitor reported that dragging the third slider did nothing to
the total, and the checkmark never appeared even at a true 7Ω. The cause was
structural: this page's frontmatter (which renders real, testable initial
markup) and its client `<script>` (which rebuilds that markup after an
interaction, since it can't see frontmatter variables at runtime) keep
separate, manually duplicated copies of the same constants, and only one copy
of `EXPERIMENT_TARGET_OHMS` had been updated. Patching those two literals
would have fixed this one instance and left the pattern free to bite again ---
which it nearly did when the currents challenge introduced its own duplicate
pair. So instead of just patching, I wrote a harness-level guard:
`spec/duplicated-constants.test.ts` reads the raw source, extracts every known
duplicated pair by name, and fails if they ever disagree. I verified it
catches the actual failure mode by deliberately desyncing a value and
confirming the test failed, before reverting and confirming it passed.
([`6eedc44`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-VishakhaMathur/commit/6eedc444aac61bdbbc000b186b40028a71ac4986))

**Even after fixing the stale values, the success checkmark still wouldn't
fire, because the equality check was too strict for the maths.** It compared
the computed total against 7 with a `1e-9` epsilon --- essentially bit-exact
float equality --- but with three integer-only sliders a visitor can easily
land on a combination whose *displayed*, one-decimal total reads "7.0Ω"
without the underlying float being exactly 7. Rather than loosening the
epsilon to something that just "felt" generous, I picked `0.05` specifically
because it's half the 0.1 granularity of the display, so "the check passes"
and "the readout shows 7.0Ω" become the same guarantee instead of two that can
disagree. I confirmed this by hand-working near-miss totals (6.98–7.02) to
check they pass the epsilon while still rendering as "7.0Ω".
([`3b73d33`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-VishakhaMathur/commit/3b73d33a29bd4c8e5af2e8fa2e83e4e17e507193))

**The final "solve it yourself" challenge was well-built, and I cut it
anyway.** It asked a visitor to type three numbers into inputs and check them
against a worked solution — correct maths, clean answer values, its own
tests — but no more interactive than a worksheet, and a second computed
circuit repeating ground the derivation and experiment sections above it
already covered. The brief asks for one idea carried all the way, not several
adjacent ones, so instead of trying to make it feel less like a quiz I removed
it outright: the frontmatter constants, the markup, the script logic, the CSS,
and the six tests that pinned its structure. I confirmed the removal was
clean by grepping the built `dist/index.html` and the full test suite for
every `challenge-*` selector both before and after, and rerunning `pnpm check`
to see exactly those six tests disappear with nothing else breaking.
([`fd4b492`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-VishakhaMathur/commit/fd4b4924e150dc55ed2fa28192e8cd11a238a74a))

**A restyle that passed `pnpm check` locally still broke CI, because the
thing that failed only exists once the site is built for real.** Adding two
self-hosted font packages made the compiled stylesheet balloon past Astro's
own threshold for inlining it into a `<style>` tag, so it got emitted as an
external `<link>` instead — pointing at a base-prefixed URL that resolves on
the live site but 404s under `linkinator`'s flat scan of the local `dist/`
folder, a check that only runs in CI, not in `pnpm check`. The actual cause
took a moment to see: `assetsInlineLimit` had already been raised once before
(to keep one small page script inlined for exactly this reason), and that
same limit was now also base64-embedding a dozen font-file variants directly
into the CSS. The fix wasn't to raise the limit further or turn off font
loading — it was to make the limit stop applying to font files specifically,
so the stylesheet shrank back under Astro's own inlining threshold on its
own. I confirmed it by rebuilding locally (the stylesheet went back to an
inlined `<style>` tag, `linkinator ./dist` passed, and the fonts still loaded
with zero failed network requests), then watched the next CI run go green
end to end, including the deploy's own "site is online" check.
([`36ab389`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-VishakhaMathur/commit/36ab389b94a882ee3199424a8c21ad3313c23945),
[`86ef72d`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-VishakhaMathur/commit/86ef72d44635b730c242dd5dd7872d721b295930))

**Merging the standalone Review page into the single scrolling page broke an
accessibility invariant, and the fix wasn't to just delete the nav.** Once
Review's markup moved into `index.astro`, the old two-page `<nav>` (Home /
Review) no longer made sense for a page with nowhere left to navigate to, so I
removed it — which immediately failed
`spec/invariants.test.ts`'s "has a navigation landmark" check, since every
built page still needs one. Rather than deciding unilaterally between the
ways to satisfy that (an in-page section nav, a skip-link, or reinstating a
trivial nav), I presented the options and let the actual choice — an in-page
jump-nav to each section's heading — be made deliberately instead of
guessed at. That nav is what still sits in `Header.astro` today, restyled
since.
([`499c7f4`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-VishakhaMathur/commit/499c7f4))

**The section nav linked to all seven sections, but six of them started
hidden, and clicking ahead just looked broken.** Quiz's feedback aside, the
sections themselves — Highway, Voltage, Derivation, Experiment, Review — were
each `hidden` until an earlier step was completed (answering the quiz,
clicking Highway's Drive button), even though the nav bar advertised all
seven as jump targets from the moment the page loaded. A fragment link can't
scroll to a `display: none` target, so clicking "Review" before reaching it
did nothing visible — no scroll, no error, just a changed URL hash. Once this
was pointed out, the fix was to remove the initial `hidden` attribute from
those five sections so the whole page renders from the start, rather than
inventing a "disable locked links" affordance to paper over a sequencing the
brief never actually required. That also left behind dead code — the
quiz-answer and Drive-button handlers that used to un-hide later sections, and
the section variables that existed only for that — which I removed rather
than leaving unreachable. I confirmed the fix with `pnpm typecheck` and the
full `vitest` suite (unchanged, 62 passing), then drove a headless Chromium
at both a 390×844 phone viewport and a 1440×900 desktop one: no horizontal
overflow at either size, and clicking the Review link actually scrolls
`review-title` into view on both.
([`340ac7a`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-VishakhaMathur/commit/340ac7aded31eb8fa6a7ea79403a316be9edfc27))
