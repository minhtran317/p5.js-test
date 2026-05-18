/**
 * Educational multi-slit / grating snapshot (scalar approximation).
 *
 * This project prioritizes educational intuition and interactive visualization
 * over physically complete electromagnetic simulation.
 */

import { clamp, radToDeg, safeAsin } from "./waveMath.js";
import { wavelengthNmToRgb } from "./wavelengthToColor.js";

/**
 * @typedef {import('../config/defaults.js').SimParams} SimParams
 */

/**
 * @typedef {object} DiffractionOrder
 * @property {number} m
 * @property {number} angleRad
 * @property {number} angleDeg
 * @property {{ r: number; g: number; b: number }} colorRgb
 */

/**
 * @typedef {object} DiffractionSnapshot
 * @property {DiffractionOrder[]} orders
 * @property {{ anglesRad: number[]; intensity: number[] }} farField
 * @property {number} maxOrderPossible
 */

/**
 * @param {SimParams} params
 * @returns {DiffractionSnapshot}
 */
export function computeDiffractionSnapshot(params) {
  const lambdaM = params.wavelengthNm * 1e-9;
  const dM = params.slitSpacingUm * 1e-6;
  const ratio = lambdaM / dM;
  const maxPhysical = Math.floor(1 / ratio - 1e-9);
  const maxOrderPossible = Math.max(0, maxPhysical);

  /** @type {DiffractionOrder[]} */
  const orders = [];
  const rgb = wavelengthNmToRgb(params.wavelengthNm);

  for (let m = -maxOrderPossible; m <= maxOrderPossible; m += 1) {
    const sinTheta = clamp(m * ratio, -1, 1);
    const angleRad = safeAsin(sinTheta);
    orders.push({
      m,
      angleRad,
      angleDeg: radToDeg(angleRad),
      colorRgb: rgb,
    });
  }

  const n = Math.floor(params.intensitySampleCount);
  const anglesRad = new Array(n);
  const intensity = new Array(n);
  const halfPi = Math.PI / 2;
  const eps = 1e-6;

  for (let i = 0; i < n; i += 1) {
    const t = i / (n - 1);
    const theta = -halfPi + eps + (1 - 2 * t) * (halfPi - eps);
    anglesRad[i] = theta;
    intensity[i] = multiSlitIntensity(
      params.slitCount,
      dM,
      lambdaM,
      theta,
    );
  }

  return { orders, farField: { anglesRad, intensity }, maxOrderPossible };
}

/**
 * Normalized multi-slit interference (equal slits, negligible finite width).
 * @param {number} n
 * @param {number} dM
 * @param {number} lambdaM
 * @param {number} thetaRad
 */
function multiSlitIntensity(n, dM, lambdaM, thetaRad) {
  const delta = (Math.PI * dM * Math.sin(thetaRad)) / lambdaM;
  if (Math.abs(delta) < 1e-8) return 1;
  const num = Math.sin(n * delta);
  const den = Math.sin(delta);
  if (Math.abs(den) < 1e-10) return 1;
  const v = num / (n * den);
  return clamp(v * v, 0, 1);
}
