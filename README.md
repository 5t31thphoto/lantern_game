# Lantern — The Long Night

A self-contained, local-first browser game. Designed for GitHub Pages and touch devices.

## Rules of the project

- Static HTML/CSS/JavaScript only.
- No backend, account, cloud database, analytics, CDN, external fonts, or runtime network dependency.
- Progress and notebook data stay in browser localStorage unless the player explicitly exports a save.
- The game remains fully playable without optional hardware.
- Therapeutic ideas are delivered through game mechanics rather than a counseling interface.
- No diagnosis, grief score, recovered-memory mechanic, or interpretation of EEG as emotional truth.

## Muse 2 — now implemented

Lantern includes a dependency-free Web Bluetooth Muse 2 adapter in `muse.js`.

It connects directly to the Muse BLE service, subscribes to the four primary EEG channels plus accelerometer/gyroscope and battery notifications, decodes the incoming packets locally, and derives conservative interaction signals:

- signal quality
- steadiness
- movement/artifact level
- alpha and beta band-power estimates
- battery level

These are **game inputs**, not medical or psychological measurements.

### Browser requirements

Direct browser BLE requires a Web Bluetooth-capable browser and a secure context (HTTPS or localhost). Chrome/Edge on Android and Windows are the primary targets. Safari/iOS does not provide the required Web Bluetooth API.

Therefore:

- `file:///.../index.html` → the game works, but direct Muse BLE cannot be expected to work.
- GitHub Pages `https://...` → the game and Muse connection are intended to work in a supported browser.
- No Muse → the entire game still works.

### Connecting

1. Turn on the Muse 2.
2. Open the Lantern GitHub Pages site in Chrome or Edge.
3. Open **More → Muse 2**.
4. Tap **Connect Muse 2**.
5. Choose the Muse device in the browser Bluetooth picker.
6. Keep the headband fitted so its electrodes contact the skin.

The browser owns the Bluetooth permission. Lantern does not scan or upload anything outside the page.

## Why the bridge is conservative

The game deliberately does not label EEG bands as calmness, sadness, trauma, healing, or other psychological states. Consumer EEG is noisy and affected by movement and electrode contact. Lantern uses quality and signal-derived trends only as optional interaction signals.

## Files

- `index.html` — entry point
- `style.css` — visual/UI layer
- `game.js` — local game state and mechanics
- `ui.js` — screens, mini-games, creatures, Muse controls
- `muse.js` — local Muse 2 Web Bluetooth adapter

No build step is required.
