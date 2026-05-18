/**
 * Approximate visible-spectrum color for educational display.
 * Not a perceptually accurate colorimetric transform.
 */

import { clamp } from "./waveMath.js";

/**
 * @param {number} wavelengthNm
 * @returns {{ r: number; g: number; b: number }} sRGB-ish 0..255
 */
export function wavelengthNmToRgb(wavelengthNm) {
  const w = clamp(wavelengthNm, 380, 750);
  let r = 0;
  let g = 0;
  let b = 0;

  if (w >= 380 && w < 440) {
    r = (-(w - 440)) / (440 - 380);
    g = 0;
    b = 1;
  } else if (w < 490) {
    r = 0;
    g = (w - 440) / (490 - 440);
    b = 1;
  } else if (w < 510) {
    r = 0;
    g = 1;
    b = -(w - 510) / (510 - 490);
  } else if (w < 580) {
    r = (w - 510) / (580 - 510);
    g = 1;
    b = 0;
  } else if (w < 645) {
    r = 1;
    g = -(w - 645) / (645 - 580);
    b = 0;
  } else {
    r = 1;
    g = 0;
    b = 0;
  }

  let factor = 1;
  if (w >= 380 && w < 420) factor = 0.3 + (0.7 * (w - 380)) / (420 - 380);
  else if (w >= 420 && w < 701) factor = 1;
  else if (w >= 701 && w <= 750) factor = 0.3 + (0.7 * (750 - w)) / (750 - 701);
  else factor = 1;

  return {
    r: Math.round(clamp(r * factor * 255, 0, 255)),
    g: Math.round(clamp(g * factor * 255, 0, 255)),
    b: Math.round(clamp(b * factor * 255, 0, 255)),
  };
}
