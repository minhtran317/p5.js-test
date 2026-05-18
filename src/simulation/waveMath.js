/**
 * Small pure math helpers for simulation (no DOM, no p5).
 */

/**
 * @param {number} v
 * @param {number} lo
 * @param {number} hi
 */
export function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v));
}

/**
 * @param {number} rad
 */
export function radToDeg(rad) {
  return (rad * 180) / Math.PI;
}

/**
 * @param {number} deg
 */
export function degToRad(deg) {
  return (deg * Math.PI) / 180;
}

/**
 * @param {number} x
 */
export function safeAsin(x) {
  return Math.asin(clamp(x, -1, 1));
}
