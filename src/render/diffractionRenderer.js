/**
 * Top-down schematic: grating (y–z plane at x=0) and screen (y–z plane at x=L).
 * Consumes `DiffractionSnapshot` from simulation — does not recompute physics.
 *
 * Educational projection: we assume an effective groove orientation so diffracted
 * orders spread along the canvas y axis on the screen line. θ from the snapshot
 * is treated as the angle from +x (grating normal) in the diffraction plane that
 * maps to vertical displacement on screen — a teaching view, not a full 3D ray trace.
 */

/** Max slit gaps drawn on the grating segment (even spacing; N may be larger). */
const MAX_SLIT_GAPS_DRAWN = 24;

/** Parallel incident rays (direction hint only; not one ray per slit). */
const INCIDENT_RAY_COUNT = 5;

/**
 * @typedef {object} DiagramLayout
 * @property {number} gratingX
 * @property {number} screenX
 * @property {number} Lpx
 * @property {number} yCenter
 * @property {number} gratingTop
 * @property {number} gratingBottom
 * @property {number} screenTop
 * @property {number} screenBottom
 */

/**
 * @param {import('p5')} p
 * @returns {DiagramLayout}
 */
function layoutDiagram(p) {
  const gratingX = p.width * 0.15;
  const screenX = p.width * 0.85;
  const yCenter = p.height * 0.55;
  const halfSpan = Math.min(p.height * 0.28, p.width * 0.12);

  return {
    gratingX,
    screenX,
    Lpx: screenX - gratingX,
    yCenter,
    gratingTop: yCenter - halfSpan,
    gratingBottom: yCenter + halfSpan,
    screenTop: yCenter - halfSpan,
    screenBottom: yCenter + halfSpan,
  };
}

/**
 * Screen hit for order m along y (m=0 at yCenter).
 * @param {number} yCenter
 * @param {number} Lpx
 * @param {number} angleRad
 */
function screenHitY(yCenter, Lpx, angleRad) {
  return yCenter + Lpx * Math.tan(angleRad);
}

/**
 * @param {import('p5')} p
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @param {number} [size=6]
 */
function drawArrowhead(p, x1, y1, x2, y2, size = 6, fillRgb = 100) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  if (len < 1e-6) return;
  const ux = dx / len;
  const uy = dy / len;
  const px = -uy;
  const py = ux;
  const tipX = x2;
  const tipY = y2;
  const baseX = tipX - ux * size;
  const baseY = tipY - uy * size;

  p.noStroke();
  p.fill(fillRgb);
  p.triangle(
    tipX,
    tipY,
    baseX + px * size * 0.45,
    baseY + py * size * 0.45,
    baseX - px * size * 0.45,
    baseY - py * size * 0.45,
  );
}

/**
 * @param {import('p5')} p
 * @param {import('../config/defaults.js').SimParams} params
 * @param {import('../simulation/diffractionModel.js').DiffractionSnapshot} snapshot
 */
function drawParameterLine(p, params, snapshot) {
  const shown = Math.min(params.maxOrderDisplay, snapshot.maxOrderPossible);
  p.noStroke();
  p.fill(60);
  p.textSize(12);
  p.text(
    `λ = ${params.wavelengthNm} nm   d = ${params.slitSpacingUm} µm   N = ${params.slitCount}   showing ±${shown}, physical max ±${snapshot.maxOrderPossible}`,
    12,
    18,
  );
}

/**
 * @param {import('p5')} p
 * @param {DiagramLayout} layout
 */
function drawGratingAndScreen(p, layout) {
  p.stroke(120);
  p.strokeWeight(1.5);
  p.line(
    layout.gratingX,
    layout.gratingTop,
    layout.gratingX,
    layout.gratingBottom,
  );
  p.stroke(90);
  p.line(layout.screenX, layout.screenTop, layout.screenX, layout.screenBottom);

  p.noStroke();
  p.fill(120);
  p.textSize(12);
  p.text("grating", layout.gratingX - 36, layout.gratingBottom + 16);
  p.fill(90);
  p.text("screen", layout.screenX - 22, layout.screenBottom + 16);
}

/**
 * @param {import('p5')} p
 * @param {DiagramLayout} layout
 * @param {number} slitCount
 */
function drawSlitGaps(p, layout, slitCount) {
  const nDraw = Math.min(slitCount, MAX_SLIT_GAPS_DRAWN);
  if (nDraw < 1) return;

  const span = layout.gratingBottom - layout.gratingTop;
  const gapLen = Math.max(4, span / (nDraw * 3));
  p.stroke(40);
  p.strokeWeight(2);

  for (let i = 0; i < nDraw; i += 1) {
    const t = nDraw === 1 ? 0.5 : i / (nDraw - 1);
    const y = layout.gratingTop + t * span;
    p.line(layout.gratingX, y - gapLen * 0.5, layout.gratingX, y + gapLen * 0.5);
  }
}

/**
 * @param {import('p5')} p
 * @param {DiagramLayout} layout
 */
function incidentRayGapPx(layout) {
  return Math.max(16, layout.Lpx * 0.03);
}

/**
 * @param {import('p5')} p
 * @param {DiagramLayout} layout
 */
function drawIncidentRays(p, layout) {
  const gap = incidentRayGapPx(layout);
  const tipX = layout.gratingX - gap;
  const arrowSize = 7;
  const lineEndX = tipX - arrowSize;
  const rayStartX = Math.max(12, layout.gratingX * 0.05);
  const span = layout.gratingBottom - layout.gratingTop;
  const rayColor = 95;

  p.push();
  p.stroke(rayColor);
  p.strokeWeight(1.25);
  p.noFill();

  for (let i = 0; i < INCIDENT_RAY_COUNT; i += 1) {
    const t = INCIDENT_RAY_COUNT === 1 ? 0.5 : i / (INCIDENT_RAY_COUNT - 1);
    const y = layout.gratingTop + t * span;
    if (lineEndX > rayStartX) {
      p.line(rayStartX, y, lineEndX, y);
    }
    drawArrowhead(p, lineEndX, y, tipX, y, arrowSize, rayColor);
    p.stroke(rayColor);
    p.strokeWeight(1.25);
    p.noFill();
  }

  p.pop();
}

/**
 * @param {import('p5')} p
 * @param {DiagramLayout} layout
 * @param {import('../simulation/diffractionModel.js').DiffractionSnapshot} snapshot
 */
function drawDiffractedRaysAndSpots(p, layout, snapshot, maxOrderDisplay) {
  const originX = layout.gratingX;
  const originY = layout.yCenter;

  for (const o of snapshot.orders) {
    if (Math.abs(o.m) > maxOrderDisplay) continue;
    const hitY = screenHitY(layout.yCenter, layout.Lpx, o.angleRad);
    const { r, g, b } = o.colorRgb;

    p.stroke(r, g, b, 180);
    p.strokeWeight(o.m === 0 ? 1.5 : 1);
    p.line(originX, originY, layout.screenX, hitY);

    p.noStroke();
    p.fill(r, g, b);
    const d = o.m === 0 ? 10 : 7;
    p.circle(layout.screenX, hitY, d);

    p.fill(30);
    p.textSize(11);
    p.text(`m=${o.m}`, layout.screenX + 10, hitY - 6);
    p.text(`${o.angleDeg.toFixed(1)}°`, layout.screenX + 10, hitY + 8);
  }
}

/**
 * @param {import('p5')} p
 * @param {import('../config/defaults.js').SimParams} params
 */
function drawScreenDistanceNote(p, params) {
  p.fill(80);
  p.noStroke();
  p.textSize(12);
  p.text(
    `Screen distance L = ${params.screenDistanceM} m (sketch scale)`,
    12,
    p.height - 12,
  );
}

/**
 * @param {import('p5')} p
 * @param {import('../config/defaults.js').SimParams} params
 * @param {import('../simulation/diffractionModel.js').DiffractionSnapshot} snapshot
 */
export function drawDiffractionScene(p, params, snapshot) {
  p.background(252);

  const layout = layoutDiagram(p);

  drawParameterLine(p, params, snapshot);
  drawGratingAndScreen(p, layout);
  drawSlitGaps(p, layout, params.slitCount);
  drawDiffractedRaysAndSpots(p, layout, snapshot, params.maxOrderDisplay);
  drawIncidentRays(p, layout);
  drawScreenDistanceNote(p, params);
}
