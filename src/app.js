/**
 * Orchestrates UI → params → simulation → renderers.
 * Owns the single mutable parameter object for the sketch.
 */
import p5 from "p5";
import { CANVAS, DEFAULT_SIM_PARAMS, PARAM_BOUNDS } from "./config/defaults.js";
import { mountControls } from "./ui/controls.js";
import { computeDiffractionSnapshot } from "./simulation/diffractionModel.js";
import {
  drawDiffractionScene,
  handleDiagramPanDrag,
  handleDiagramPanPress,
  handleDiagramPanRelease,
  handleDiagramTouchEnded,
  handleDiagramTouchMoved,
  handleDiagramTouchStarted,
  handleDiagramWheel,
  setDiagramPanSuppressed,
} from "./render/diffractionRenderer.js";
import { drawIntensityPanel } from "./render/intensityRenderer.js";
import { drawWaveletOverlay } from "./render/waveletRenderer.js";

function viewportCanvasSize() {
  return {
    width: Math.min(window.innerWidth, CANVAS.maxWidth),
    height: Math.min(window.innerHeight, CANVAS.maxHeight),
  };
}

/**
 * @param {{ uiHost: HTMLElement; p5Host: HTMLElement; panelRoot?: HTMLElement | null }} hosts
 */
export function startApp({ uiHost, p5Host, panelRoot }) {
  /** @type {import('./config/defaults.js').SimParams} */
  const params = { ...DEFAULT_SIM_PARAMS };
  let needsRecompute = true;

  mountControls(uiHost, {
    panelRoot,
    getParams: () => params,
    bounds: PARAM_BOUNDS,
    onParamsChange: (partial) => {
      Object.assign(params, partial);
      needsRecompute = true;
    },
  });

  if (panelRoot) {
    const endParamsPointer = () => setDiagramPanSuppressed(false);
    panelRoot.addEventListener("pointerdown", () => setDiagramPanSuppressed(true));
    window.addEventListener("pointerup", endParamsPointer);
    window.addEventListener("pointercancel", endParamsPointer);
  }

  const sketch = (p) => {
    /** @type {import('./simulation/diffractionModel.js').DiffractionSnapshot | null} */
    let snapshot = null;

    p.setup = () => {
      const { width, height } = viewportCanvasSize();
      p.createCanvas(width, height).parent(p5Host);
      p.pixelDensity(1);
      p.frameRate(30);
    };

    p.windowResized = () => {
      const { width, height } = viewportCanvasSize();
      p.resizeCanvas(width, height);
    };

    p.mousePressed = () => {
      handleDiagramPanPress(p);
    };

    p.mouseDragged = () => {
      handleDiagramPanDrag(p);
    };

    p.mouseReleased = () => {
      handleDiagramPanRelease();
    };

    p.mouseWheel = (event) => {
      handleDiagramWheel(p, event);
      return false;
    };

    p.touchStarted = () => {
      handleDiagramTouchStarted(p);
    };

    p.touchMoved = () => {
      handleDiagramTouchMoved(p);
      return false;
    };

    p.touchEnded = () => {
      handleDiagramTouchEnded(p);
    };

    p.draw = () => {
      if (needsRecompute) {
        snapshot = computeDiffractionSnapshot(params);
        needsRecompute = false;
      }
      if (!snapshot) return;
      drawWaveletOverlay(p, params, snapshot);
      drawDiffractionScene(p, params, snapshot);
      drawIntensityPanel(p, params, snapshot);
    };
  };

  void new p5(sketch);
}
