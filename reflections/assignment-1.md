# Assignment 1 reflection

**The breakthrough that moved the work forward** was realising that a green
`pnpm check` and a correct-looking frontmatter didn't mean the deployed page
actually behaved correctly. When the "reach 7Ω" challenge stopped working
after I widened it from two resistors to three, I first assumed I'd find one
stale number. Instead I found that this page's server-rendered frontmatter
constants and its client-side `<script>` block keep separate, manually
duplicated copies of the same values with no shared import between them —
and only one copy had been updated. The fix that actually held wasn't
patching those two numbers; it was going back through the file and checking
every other frontmatter constant for a matching script-side mirror, on the
assumption that if the pattern bit me once, it had probably bitten me
elsewhere too, silently. That's what turned a single bug fix into an actual
audit, and it's also what pushed me to verify against the *compiled*
`dist/index.html` rather than the source or the test suite, since the bug
was specifically a source/build mismatch.

**What this changed about who I want to be as a developer** is how much I
trust a passing check versus what I've actually looked at running. Tests and
types told me the code was internally consistent; they couldn't tell me the
two halves of the page agreed with each other. I want to get in the habit of
asking "where else does this exact pattern repeat" the first time I find a
footgun, instead of treating each fix as its own isolated incident — and of
treating "it built" and "it works" as genuinely different claims, worth
checking separately, not just different words for the same thing.
