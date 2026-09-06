# Smoke companion experiment

Generated with the built-in image generation tool from `public/hero-watercolor-territory-v1.png`.
Output: `public/hero-territory-smoke-v2.png`; browser asset: `public/hero-territory-smoke-v2.webp`.

## Final prompt

Edit target: this exact watercolor landscape. Produce its matching SMOKE MATERIAL STATE for use as a registered companion texture in an animation. Preserve framing, 3:2 aspect, silhouette, position of every mountain and coastline, muted slate blue green ochre coral palette and white margin. Transform the painted material itself into delicate colored translucent smoke filaments, porous curling wisps and fine feathered ribbons with white gaps. No solid rocky surfaces, no brush texture. Terrain should still be recognizable and precisely located, but now constructed of vapor. No smoke layered over a solid painting; the terrain IS the smoke. High-detail thin wisps, not blurred clouds. Pure white background fading on every side, no shadows, no text, no frame. Restrained editorial negative-space zen.

## Implementation and limits

The original painting remains the restoration target. The companion modulates the transported wisp texture, while local pigment supplies its color and coverage. No full-frame crossfade is used. Generated correspondence is approximate, not pixel-perfect. `FluidHero.tsx` embeds the study in decorative mode, forwarding normalized pointer positions through origin-checked messages while leaving native page scrolling and links available. The independent cursor smoke is disabled; coarse pointers select the water treatment. Reduced motion uses a static painting. Desktop interaction verification is not physical mobile validation. See [current release behavior and the preserved original](hero-release.md).

The parent CSP allows same-origin frames. Only `/fluid-watercolor-study.html` overrides the global anti-framing headers with `frame-ancestors 'self'` and `X-Frame-Options: SAMEORIGIN`; other pages retain `DENY`. Without this exception the hero stays on its static fallback. Verify the loaded hero reaches `data-mode="pigment"` and the iframe opacity reaches 1, then test pointer interaction; a screenshot of the fallback is not animation verification.
