# Watercolor hero release

## Preserved alternative

The original centered **Listen. Learn. Build.** hero and independent mouse smoke are preserved on `archive/original-text-smoke`, at `deaa2f4`. The branch is pushed to origin. Compare it with the watercolor after a day of normal use; do not switch production automatically.

## Current treatment

- `FluidHero.tsx` embeds the same-origin WebGL renderer. The independent cursor smoke is disabled.
- Only interaction over painted content resets recovery. Blank paper emits no pigment and does not postpone recovery.
- Desktop now defaults to the approved spatial recovery treatment (`&hybrid` in the iframe). The `?legacy-smoke` page flag retains the earlier global timing for comparison.
- Broad breakup and detached, locally colored wisps remain. A spatial activity field follows the painted-content pointer path, allowing older regions to rebuild while newer regions disperse. Recovery staggers locally and rebuilds broad shapes before detail; the current byte-field decay is frame-rate dependent.
- During recovery, thinning and new wisp release taper out so reconstruction is not fighting continuing erosion.
- Wisps are attracted toward nearby painted shapes, not tracked back to exact particle origins. This remains an artistic approximation.
- Coarse pointers use the water treatment. Parent pointer listeners are passive; native page scrolling remains available. Reduced motion retains the static artwork. Physical-device touch validation is still needed.

## Source and checks

`scripts/build-fluid-study.cjs` regenerates `public/fluid-watercolor-study.js` from the MIT upstream source. Keep the upstream license. The generated/vendor browser scripts are excluded from ESLint; validate syntax with `node --check public/fluid-watercolor-study.js` and check shader execution in-browser.

The same-origin frame requires the route-specific CSP and SAMEORIGIN header exception documented in `hero-smoke-companion.md`. Production release remains Coolify; Vercel is backup only.
