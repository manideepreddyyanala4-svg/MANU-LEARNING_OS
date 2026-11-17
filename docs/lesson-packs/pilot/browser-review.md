# Browser review status — incomplete

The acceptance gate is **not passed**. Do not describe this pilot as visually verified or live.

- Managed preview initially passed generic Vite-style flags to Next. Added a small development CLI adapter without changing production configuration.
- Browser reached the actual Next route but initially displayed a Turbopack internal Google-font module resolution error.
- Changed the development launcher to webpack; the managed preview restarted. The application source compiled and the independent production build and typecheck passed.
- On the next browser review action, the cloud browser rejected access under its URL security policy. No alternate browser surface or policy bypass was attempted.
- Consequently no finished-lesson screenshots were collected, and no claim is made that mobile/dark/light layouts, focus, keyboard actions, Python runtime loading, or end-to-end slider/button behavior passed browser testing.

## Remaining review checklist

Use the documented preview flag and route on an authorized preview host. Keep production and database unchanged.

1. At 375 px and 1440 px, open each of the three lessons in light and charcoal themes. Check text, SVG labels, code overflow containment and all controls.
2. Pixels: select (0,0) and (5,3), change brightness, confirm only that array entry changes, then reset.
3. Filtering: choose centre (2,2), gather/multiply/add to get 13. Corner (0,0): zero → 1.778, reflect-101 → 5, replicate → 3. Asymmetric kernel: centre cross-correlation → 14; flipped convolution → 12.
4. Metrics: at .50 with ≥ expect FAR .40, FRR .25, TAR .75. At .60 expect .20/.50/.50. Toggle > at .50 and confirm the tied genuine and impostor scores are rejected.
5. Enter wrong and correct practice answers; confirm specific feedback. Concept solution stays disabled until an attempt is entered. Explanations never update mastery.
6. Use keyboard only for grids, steps, range arrows, forms, section links, theme switch and previous/next. Check focus visibility and order. Focus mode exits with Escape.
7. Run each browser Python example and coding challenge. Verify timeout/error behavior leaves static text usable.
8. Open Study Now, select each exact canonical topic, confirm pilot link while flag is on, and original notes/progress still visible. Disable flag and confirm route is not available.
9. Save representative screenshots and observed results to this folder. Review learning clarity with Manu before creating another batch.

No browser result above is marked passed merely because a calculation test or build succeeded.
