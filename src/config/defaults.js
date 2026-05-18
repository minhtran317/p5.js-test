/**
 * Centralized defaults and clamp bounds for weak hardware / stable UX.
 * Tune here before spreading magic numbers across the codebase.
 */

/**
 * @typedef {object} SimParams
 * @property {number} wavelengthNm
 * @property {number} slitSpacingUm
 * @property {number} slitCount
 * @property {number} screenDistanceM
 * @property {number} maxOrderDisplay
 * @property {number} intensitySampleCount
 * @property {boolean} showWavelets
 */

/** @type {SimParams} */
export const DEFAULT_SIM_PARAMS = {
  wavelengthNm: 550,
  slitSpacingUm: 2,
  slitCount: 24,
  screenDistanceM: 1,
  maxOrderDisplay: 4,
  intensitySampleCount: 512,
  showWavelets: false,
};

/**
 * Hard caps — UI and simulation must clamp to these ranges.
 * @type {Partial<Record<keyof SimParams, { min: number; max: number }>>}
 */
export const PARAM_BOUNDS = {
  wavelengthNm: { min: 380, max: 750 },
  slitSpacingUm: { min: 0.5, max: 50 },
  slitCount: { min: 2, max: 120 },
  screenDistanceM: { min: 0.2, max: 5 },
  maxOrderDisplay: { min: 1, max: 6 },
  intensitySampleCount: { min: 256, max: 2048 },
};

/** Viewport canvas caps — app fills the window clamped to these maxima. */
export const CANVAS = { maxWidth: 1920, maxHeight: 1080 };
