/**
 * Optional Huygens-style overlays (stub for v1 wiring).
 * Keep wavelet animation state local to this module later — not in simulation.
 */

/**
 * @param {import('p5')} p
 * @param {import('../config/defaults.js').SimParams} params
 * @param {import('../simulation/diffractionModel.js').DiffractionSnapshot} _snapshot
 */
export function drawWaveletOverlay(p, params, _snapshot) {
  if (!params.showWavelets) return;
  p.push();
  p.noStroke();
  p.fill(100, 100, 200, 80);
  p.textSize(12);
  p.text("Wavelet animation: not implemented in scaffold.", 12, 40);
  p.pop();
}
