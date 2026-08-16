# Process overview

A reading-guide to how the work came together --- a map to your process, not an
essay about it.

## What I built

"Resistors in Parallel" is a static teaching prototype that walks a visitor
from intuition to proof to practice: a drag-to-connect comprehension check, a
predict-then-reveal quiz on parallel resistance, a highway/car analogy for
why, a formal Ohm's-law-and-Kirchhoff's-law derivation with an animated
current-flow diagram, and a free-play experiment with a reach-a-target
challenge.

## The moments that mattered

**The "reach 7Ω" challenge silently broke when I widened it from two
resistors to three.** The cause was structural: the page's frontmatter (real,
testable markup) and its client `<script>` (which rebuilds that markup at
runtime, blind to frontmatter variables) keep separate, manually duplicated
copies of the same constants, and only one copy of `EXPERIMENT_TARGET_OHMS`
had been updated. Patching the two literals would have left the pattern free
to bite again, so instead I wrote a harness-level guard,
`spec/duplicated-constants.test.ts`, that reads the source and fails if any
known duplicated pair disagrees — verified by deliberately desyncing a value,
confirming the test failed, then reverting.
([`6eedc44`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-VishakhaMathur/commit/6eedc444aac61bdbbc000b186b40028a71ac4986))

**The final "solve it yourself" challenge was well-built, and I cut it
anyway.** It asked a visitor to type three numbers into inputs and check
against a worked solution — correct maths, its own tests — but no more
interactive than a worksheet, repeating ground the derivation and experiment
sections already covered. The brief asks for one idea carried all the way,
not several adjacent ones, so I removed it outright: frontmatter, markup,
script logic, CSS, and the six tests that pinned its structure. I confirmed
the removal was clean by grepping built `dist/index.html` and the test suite
for every `challenge-*` selector, then rerunning `pnpm check` to see exactly
those six tests disappear with nothing else breaking.
([`fd4b492`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-VishakhaMathur/commit/fd4b4924e150dc55ed2fa28192e8cd11a238a74a))

**A restyle that passed `pnpm check` locally still broke CI, because the
failure only exists once the site is built for real.** Two self-hosted font
packages pushed the compiled stylesheet past Astro's inlining threshold, so
it emitted as an external `<link>` pointing at a base-prefixed URL that 404s
under `linkinator`'s flat scan of `dist/` — a check CI runs but `pnpm check`
doesn't. The cause: `assetsInlineLimit`, already raised once for a small page
script, was now also base64-embedding a dozen font variants. The fix wasn't
to raise the limit further — it was to exempt font files from it, so the
stylesheet shrank back under threshold on its own. Confirmed by rebuilding
locally (re-inlined, `linkinator` passed, fonts loaded clean), then watching
CI go green end to end.
([`36ab389`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-VishakhaMathur/commit/36ab389b94a882ee3199424a8c21ad3313c23945),
[`86ef72d`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-VishakhaMathur/commit/86ef72d44635b730c242dd5dd7872d721b295930))

**The section nav linked to all seven sections, but six started hidden, so
clicking ahead just looked broken.** Highway, Voltage, Derivation,
Experiment, and Review each stayed `hidden` until an earlier step was
completed, even though the nav advertised all seven as jump targets from page
load. A fragment link can't scroll to a `display: none` target, so clicking
"Review" early did nothing visible — no scroll, no error, just a changed URL
hash. The fix was to remove the initial `hidden` attribute so the whole page
renders from the start, rather than inventing a "disable locked links"
affordance to paper over a sequencing the brief never required — which also
meant deleting the now-dead reveal handlers and the section variables that
existed only for them. Confirmed with `pnpm typecheck` and the full `vitest`
suite (62 passing), then a headless Chromium pass at 390×844 and 1440×900:
no horizontal overflow either size, and Review actually scrolls into view.
([`340ac7a`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-VishakhaMathur/commit/340ac7aded31eb8fa6a7ea79403a316be9edfc27))
