# Lantern — The Long Night

A cozy, local-first browser game designed for GitHub Pages and touch devices.

## Run

Open `index.html` locally or publish the folder as a static GitHub Pages site. No build step is required.

## Rules

- No backend, account, analytics, CDN, cloud save, runtime package, or external asset dependency.
- Game state and notebook remain in browser `localStorage`.
- Save export/import is local JSON.
- Procedural creatures are generated as inline SVG from deterministic seeds.
- Touch and pointer controls are the primary interaction model.
- GitHub Actions is intentionally NOT included yet. If a future build pipeline becomes useful, put its YAML in the repository root and move it on GitHub to `.github/workflows/<name>.yml`.

## Muse 2

`muse.js` contains the optional Web Bluetooth bridge. The game remains fully playable without it. Browser Web Bluetooth support and Muse firmware behavior should be tested on the target Android/Windows hardware. Muse data is processed in-browser and is not uploaded anywhere.

The game uses Muse for subtle feedback such as lantern glow/stability and meditation visualization. It does not interpret EEG as a diagnosis or an objective measure of emotion.

## Design

The visible game loop is:

**wander → discover → gather → play → befriend → tend home → craft → unlock → return**

The deeper layer quietly reinforces grounding, flexible attention, restoration, connection, meaning, care, and returning after attention wanders. It is not presented as a counseling session.

For a real therapeutic deployment, this prototype still needs clinical review, accessibility testing, privacy review, and testing with intended players.


## v10 repair
This build deliberately starts from the v5 renderer and preserves `index.html`, `ui.js`, and the original CSS renderer architecture. The lantern workshop and sky are additive screens/components inside the existing v5 UI. No replacement `#app` renderer is used.
