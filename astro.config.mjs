import { defineConfig } from "astro/config";

// GitHub Pages serves this repo under /comp4020-ass1-VishakhaMathur/, not at
// the domain root, so `base` has to be set explicitly (unlike Vite's relative
// asset URLs, Astro's default base is "/" and every internal link needs this
// to resolve on the deployed site rather than only in local dev).
export default defineConfig({
  site: "https://comp4020-agentic-coding-studio.github.io",
  base: "/comp4020-ass1-VishakhaMathur",
  // Astro inlines the page script into the HTML below this size (Vite's
  // assetsInlineLimit, default 4KiB) and otherwise emits it as a separate
  // chunk referenced by a base-prefixed src. That src is correct once
  // deployed, but `linkinator ./dist` (the local and CI links check) scans
  // dist/ as a plain directory with no notion of the base path, so it 404s
  // on exactly the link that works live — same root cause as the nav-link
  // note above, for a script tag Astro generates rather than one we write.
  // Raised well past this page's script so it stays inlined.
  vite: { build: { assetsInlineLimit: 16384 } },
});
