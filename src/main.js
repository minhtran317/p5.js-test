/**
 * Browser entry — boot only. No physics or rendering here.
 */
import { startApp } from "./app.js";
import { enableDraggablePanel } from "./ui/controls.js";

function boot() {
  const uiHost = document.getElementById("controls-mount");
  const p5Host = document.getElementById("p5-root");
  const uiPanel = document.getElementById("ui-root");
  const dragHandle = uiPanel?.querySelector(".panel-drag-handle");
  if (!uiHost || !p5Host) {
    console.error("Missing #controls-mount or #p5-root");
    return;
  }
  if (uiPanel && dragHandle) {
    enableDraggablePanel(uiPanel, dragHandle);
  }
  startApp({ uiHost, p5Host, panelRoot: uiPanel });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}
