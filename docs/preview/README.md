# Teacher MVP browser evidence

Chromium 156 on Linux. `npm run test:editor` against `npm run dev` verified
creation, selection, mouse/keyboard/touch movement, property validation, gravity,
play/pause/reset/step, stable IDs, contact stop and student/iframe lockout.

- [Desktop screenshot](teacher-editor-desktop.png): 1440×1050 viewport, full page.
- [Tablet screenshot](teacher-editor-tablet.png): 1024×768 touch emulation, full page.

A separate run against `npm run preview` with `EDITOR_TEST_URL` and
`--public-build` verified that the default production build disables execution.
This is browser verification, not Safari/iPad hardware or physics qualification.
