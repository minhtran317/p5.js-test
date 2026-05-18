# p5.js diffraction & interference (educational)

**This project prioritizes educational intuition and interactive visualization over physically complete electromagnetic simulation.**

Plain ES modules + [p5.js](https://p5js.org/) — no React, TypeScript, or bundler required for development.

## Run locally

Serve the **repository root** over HTTP (ES modules + import map):

```bash
npx --yes serve .
```

Open `http://localhost:3000/public/` (or the URL printed by `serve`).

## Layout

- `public/index.html` — page shell and module entry
- `src/` — application code (`simulation/`, `render/`, `ui/`, `config/`)
- `docs/ARCHITECTURE.md` — structure, rules, PR guidance, performance notes

## Data flow

`UI (controls)` → `SimParams` in `app.js` → `simulation/*` computes snapshots → `render/*` draws.

See `docs/ARCHITECTURE.md` for full conventions and extension points.
