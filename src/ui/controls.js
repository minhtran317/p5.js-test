/**
 * DOM controls — updates parameters only. No optics formulas here.
 */

import { clamp } from "../simulation/waveMath.js";

/**
 * @param {HTMLElement} panel
 * @param {HTMLElement} handle
 */
export function enableDraggablePanel(panel, handle) {
  let offsetX = 0;
  let offsetY = 0;

  const clampPosition = (left, top) => {
    const margin = 8;
    const maxLeft = window.innerWidth - panel.offsetWidth - margin;
    const maxTop = window.innerHeight - panel.offsetHeight - margin;
    return {
      left: clamp(left, margin, Math.max(margin, maxLeft)),
      top: clamp(top, margin, Math.max(margin, maxTop)),
    };
  };

  const onPointerMove = (event) => {
    const next = clampPosition(event.clientX - offsetX, event.clientY - offsetY);
    panel.style.left = `${next.left}px`;
    panel.style.top = `${next.top}px`;
  };

  const stopDrag = (event) => {
    handle.releasePointerCapture(event.pointerId);
    handle.removeEventListener("pointermove", onPointerMove);
    handle.removeEventListener("pointerup", stopDrag);
    handle.removeEventListener("pointercancel", stopDrag);
    handle.classList.remove("is-dragging");
  };

  handle.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;

    const rect = panel.getBoundingClientRect();
    offsetX = event.clientX - rect.left;
    offsetY = event.clientY - rect.top;

    handle.setPointerCapture(event.pointerId);
    handle.classList.add("is-dragging");
    handle.addEventListener("pointermove", onPointerMove);
    handle.addEventListener("pointerup", stopDrag);
    handle.addEventListener("pointercancel", stopDrag);
    event.preventDefault();
  });
}

/**
 * @param {HTMLElement} root
 * @param {{ panelRoot?: HTMLElement | null; getParams: () => object; bounds: object; onParamsChange: (partial: object) => void }} api
 */
export function mountControls(root, { panelRoot, getParams, bounds, onParamsChange }) {
  root.innerHTML = "";

  const grid = document.createElement("div");
  grid.className = "controls-grid";
  root.appendChild(grid);

  const addSlider = (key, label, { min, max }, step = 1) => {
    const wrap = document.createElement("label");
    wrap.className = "control-row";

    const title = document.createElement("span");
    title.className = "control-label";
    title.textContent = label;

    const input = document.createElement("input");
    input.type = "range";
    input.className = "control-slider";
    input.min = String(min);
    input.max = String(max);
    input.step = String(step);

    const val = document.createElement("span");
    val.className = "control-value";

    const sync = () => {
      const v = Number(input.value);
      val.textContent = String(v);
      onParamsChange({ [key]: v });
    };

    input.addEventListener("input", sync);

    const b = bounds[key];
    const p = getParams();
    const initial = clamp(p[key], b.min, b.max);
    input.value = String(initial);
    val.textContent = String(initial);

    wrap.appendChild(title);
    wrap.appendChild(input);
    wrap.appendChild(val);
    grid.appendChild(wrap);
  };

  addSlider("wavelengthNm", "Wavelength (nm)", bounds.wavelengthNm, 1);
  addSlider("slitSpacingUm", "Slit spacing d (µm)", bounds.slitSpacingUm, 0.1);
  addSlider("slitCount", "Slit count N", bounds.slitCount, 1);
  addSlider("screenDistanceM", "Screen distance L (m)", bounds.screenDistanceM, 0.05);
  addSlider("maxOrderDisplay", "Orders shown ±m", bounds.maxOrderDisplay, 1);
  addSlider(
    "intensitySampleCount",
    "Intensity samples",
    bounds.intensitySampleCount,
    32,
  );

  const addCheckbox = (labelText, initial, onChange) => {
    const row = document.createElement("label");
    row.className = "control-row control-row--checkbox";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = initial;
    input.addEventListener("change", () => {
      onChange(input.checked);
    });
    row.appendChild(input);
    row.appendChild(document.createTextNode(labelText));
    grid.appendChild(row);
  };

  addCheckbox("Show wavelet overlay (stub)", getParams().showWavelets, (checked) => {
    onParamsChange({ showWavelets: checked });
  });

  const panel = panelRoot ?? document.getElementById("ui-root");
  addCheckbox("Transparent panel", panel?.classList.contains("ui-root--transparent") ?? false, (checked) => {
    panel?.classList.toggle("ui-root--transparent", checked);
  });
}
