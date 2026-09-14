# Lantern — The Long Night

A local-first, game-first therapeutic game prototype designed for GitHub Pages.

## Runtime rules

- Static HTML/CSS/JavaScript at runtime.
- No runtime API, account, database, CDN, analytics, cloud save, or remote service.
- Progress and notebook entries remain in browser storage unless the player explicitly exports a save.
- Procedural creature sprites are generated in the browser from deterministic seeds.
- Muse 2 connects directly from supported browsers through Web Bluetooth. EEG, movement and battery data are processed locally in the page.
- The game remains completely playable without Muse.

## Muse 2

The Muse layer is deliberately an interaction layer, not a diagnostic system. Signal quality, movement and a conservative steadiness trend can influence visual feedback and the guided Lantern Meditation. The game never presents EEG as a measurement of grief, mental health, or a diagnosis.

The browser path is intended for HTTPS GitHub Pages with Chrome/Edge on Android or Windows. Web Bluetooth is not available in Safari/iOS.

## Lantern Meditation

The dedicated meditation page provides 3/5/10/20 minute sessions. It can run timer-only or with Muse feedback. The lantern responds subtly to the live signal; optional spoken guidance uses the browser's local Speech Synthesis API, and the background tone is generated locally with Web Audio.

## GitHub Actions

The repository includes `.github/workflows/deploy.yml`. CI validates the JavaScript and assembles the static site before deploying it through GitHub Pages. Build-time tooling may be installed by GitHub's runner; the published runtime remains self-contained.

GitHub Pages supports public repositories on GitHub Free and supports custom GitHub Actions workflows for building/deploying static sites.

## Important boundary

This is a game prototype, not clinically validated treatment. It deliberately avoids diagnosis, recovered-memory mechanics, autonomous trauma exposure, or interpreting EEG as an emotional truth. Before real therapeutic deployment, clinician review, accessibility testing, privacy review, safety/escalation design, and testing with intended users are required.
