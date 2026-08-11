import { defineConfig } from "astro/config";

// GitHub Pages serves this repo under /comp4020-ass1-VishakhaMathur/, not at
// the domain root, so `base` has to be set explicitly (unlike Vite's relative
// asset URLs, Astro's default base is "/" and every internal link needs this
// to resolve on the deployed site rather than only in local dev).
export default defineConfig({
  site: "https://comp4020-agentic-coding-studio.github.io",
  base: "/comp4020-ass1-VishakhaMathur",
});
