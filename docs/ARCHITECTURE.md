# Architecture

**This project prioritizes educational intuition and interactive visualization over physically complete electromagnetic simulation.**

Version 1 uses simplified scalar-wave optics approximations (grating equation, multi-slit interference intuition, angular intensity sketches). It is not a Maxwell solver.

---

## 1. Directory structure

```
public/
  index.html          # Shell page, import map / script entry (serve repo root)

src/
  main.js             # Browser entry: boot only
  app.js              # Wires UI ↔ simulation ↔ renderers (no physics in draw)

  config/
    defaults.js       # Default parameters + hard bounds / resolution caps

  simulation/
    diffractionModel.js   # Primary “what happens” computation (pure in → out)
    waveMath.js           # Small reusable math (angles, phases, clamps)
    wavelengthToColor.js  # λ → display color (approximate, educational)

  render/
    diffractionRenderer.js  # Geometry / orders / labels (consumes computed state)
    intensityRenderer.js    # Angular intensity / screen pattern plots
    waveletRenderer.js        # Optional Huygens-style overlays (consumes state)

  ui/
    controls.js       # DOM controls; emits param updates only
```

Supporting files at repo root: `README.md`, `docs/ARCHITECTURE.md`.

---

## 2. Architectural restrictions / rules

| Rule | Rationale |
|------|-----------|
| **Data flow:** `UI → parameters → simulation.compute → renderers` | Prevents hidden coupling and “draw() did physics” bugs. |
| **Simulation is pure** where practical: `(params) → snapshot` | Testable, predictable, easy to diff in PRs. |
| **No DOM in `simulation/`** | Keeps math portable and headless-friendly. |
| **No `p5` imports in `simulation/` or `ui/`** | Rendering stays in `render/`; UI stays DOM-only. |
| **Renderers read snapshots**; they do not own canonical parameter state | Single source of truth for “what the user asked for.” |
| **No giant managers** | Prefer small modules + explicit wiring in `app.js`. |
| **No ECS, no framework** | Stay lightweight; expand with new folders/files, not layers of abstraction. |
| **Dependencies stay minimal** | p5 from CDN/import map; avoid bundlers until pain is real. |

Forbidden shortcuts:

- Renderer mutating simulation input parameters.
- Simulation reading the DOM or global UI widgets.
- UI computing diffraction angles / intensities (delegate to `simulation/`).
- Sprawling shared mutable singletons (one app-owned param object in `app.js` is enough).

---

## 3. Module responsibilities

| Module | Owns | Does not own |
|--------|------|--------------|
| `main.js` | Entry, `DOMContentLoaded` (or immediate boot) | Parameters, physics, canvas |
| `app.js` | Current params, p5 lifecycle, calling `compute*`, dispatching to renderers | Low-level wave math |
| `config/defaults.js` | Defaults, bounds, resolution caps | Runtime animation state |
| `simulation/diffractionModel.js` | Grating equation, orders, angles, intensities for teaching | Colors, canvas layout |
| `simulation/waveMath.js` | Reusable scalar helpers | Domain-specific grating policy |
| `simulation/wavelengthToColor.js` | λ → RGB (approximate) | Physics |
| `render/*.js` | Drawing from **computed snapshots** + layout | Changing user-selected λ |
| `ui/controls.js` | Inputs, validation against bounds, callbacks `onChange(partial)` | p5, optics formulas |

---

## 4. Naming conventions

- **Files:** `camelCase.js` for modules (matches your sketch).
- **Functions:** verbs for actions (`computeDiffractionSnapshot`, `drawAngularIntensity`), nouns for constructors/factories (`createControlMount`).
- **Pure outputs:** suffix `Snapshot` or `Result` when returning computed view-models (`DiffractionSnapshot`).
- **Constants:** `UPPER_SNAKE` in `config/` (`DEFAULT_SIM_PARAMS`, `PARAM_BOUNDS`).
- **p5 instance:** local variable `p` inside sketches; do not attach simulation state to `p`.

---

## 5. Rules for future AI-generated PRs

1. **One concern per PR:** e.g. “add order labels” vs “refactor entire render tree.”
2. **If it touches physics**, include a short note in the PR: assumptions, bounds, and what was intentionally *not* modeled.
3. **No new global singletons**; wire through `app.js` or a single narrow factory.
4. **New visualization mode:** add a renderer file or a clearly named mode branch in one renderer—avoid “god renderer.”
5. **Performance-sensitive loops** (high-res intensity): isolate in `simulation/` or a dedicated `render` helper; document sample count in `config/defaults.js`.
6. **Do not add** TypeScript, React, bundlers, or GPU pipelines unless the human maintainer explicitly opts in.

---

## 6. Initialization flow (recommended)

1. **Serve the repository root** over HTTP (ES modules and import maps fail on many `file://` setups).
2. `main.js` runs after `DOMContentLoaded`.
3. `app.js`:
   - Clones `DEFAULT_SIM_PARAMS` into a mutable **params** object (single source of truth).
   - `ui/controls.js` mounts controls; `onChange` merges partial updates and clamps using `PARAM_BOUNDS`.
   - Creates p5 in **instance mode** (`new p5((p) => { ... }, hostElement)`).
   - `p.setup`: create canvases / graphics buffers as needed.
   - `p.draw`:
     - `snapshot = computeDiffractionSnapshot(params)` (or equivalent).
     - Call renderers as `someRenderer.draw(p, params, snapshot)` (renderers may read `params` only for **non-physics** hints like “show labels”).
4. Optional: **dirty flag**—only recompute snapshot when params change; still call `redraw()` when animations (wavelets) need frames.

---

## 7. Performance constraints & parameter bounds

Suggested **educational** bounds (tune in `config/defaults.js`):

| Parameter | Suggested range | Notes |
|-----------|-----------------|--------|
| Wavelength λ | 380–750 nm | Visible band; clamp for display. |
| Slit spacing *d* | 0.5–50 µm | Covers classroom-style numbers; avoid extremes that explode angles. |
| Slit count *N* | 2–120 | Large *N* sharpens peaks; cap for weak laptops. |
| Screen distance *L* | 0.2–5 m | For geometric “screen” sketches; not a FEM mesh. |
| Diffraction orders shown | −*m* to +*m*, *m* ≤ 6 (clamp to physically possible) | Auto-clamp *m* when λ/*d* makes orders impossible. |
| Intensity angular resolution | 256–1024 samples default | Lower on mobile; max cap (e.g. 4096) in config. |
| Canvas size | ≤ 1280×720 default | Allow user resize later; cap in config if needed. |

**Stability tips:** debounce slider `input` events; compute heavy snapshots on `change` or at ≤ 30 Hz while dragging; use `p.redraw()` instead of continuous loop when static; preallocate `p.createGraphics()` for static layers; cap wavelet particle count.

---

## 8. Extensibility (without overengineering)

- **New topic (e.g. thin films):** add `simulation/filmModel.js` + `render/filmRenderer.js` + optional `ui/filmControls.js`; extend `app.js` wiring.
- **“Numerical mode” later:** keep educational models in `simulation/`; if a heavier numeric path appears, mirror the same `(params) → snapshot` contract and swap implementations behind one function name.
- **Modes:** `params.visualizationMode = 'orders' | 'intensity' | 'wavelets'`—simple string union, not a plugin framework.

---

## 9. Educational vs future “simulation” modes

- **Educational mode (v1):** analytic / coarse sampling, bold colors, large labels, optional wavelets for intuition.
- **Future narrow numeric mode:** same UI pipeline, but `compute*` might use a slower integrator or 1D FDTD *only if* scoped; gate behind a mode flag and stricter caps.

---

## 10. Review checklist (small PRs)

- [ ] Physics only in `simulation/`
- [ ] No DOM in `simulation/`
- [ ] No p5 in `ui/` or `simulation/`
- [ ] Renderers do not mutate params (except intentional UI-owned layout cache if ever needed—prefer locals)
- [ ] Bounds respected / documented if changed
