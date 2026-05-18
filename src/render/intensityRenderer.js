/**
 * Angular intensity strip (educational, not calibrated radiometry).
 */

/** Fixed degree ticks for the angular x-axis (−90° … +90° plot range). */
const AXIS_TICK_DEG = [-90, -60, -30, 0, 30, 60, 90];

/**
 * @param {number} angleDeg
 * @param {number} x0
 * @param {number} w
 */
function angleDegToPlotX(angleDeg, x0, w) {
  const t = (angleDeg + 90) / 180;
  return x0 + t * w;
}

/**
 * @param {import('p5')} p
 * @param {number} x0
 * @param {number} y0
 * @param {number} w
 * @param {number} h
 */
function drawAngleAxis(p, x0, y0, w, h) {
  const axisY = y0 + h - 10;
  const tickTop = axisY - 5;
  const labelY = y0 + h - 2;

  p.stroke(120);
  p.strokeWeight(1);
  p.line(x0, axisY, x0 + w, axisY);

  p.stroke(90);
  p.fill(70);
  p.textSize(10);
  p.textAlign(p.CENTER, p.BOTTOM);

  for (const deg of AXIS_TICK_DEG) {
    const px = angleDegToPlotX(deg, x0, w);
    p.line(px, tickTop, px, axisY);
    p.noStroke();
    p.text(`${deg}°`, px, labelY);
    p.stroke(90);
  }

  p.textAlign(p.LEFT, p.BASELINE);
}

/**
 * @param {import('p5')} p
 * @param {import('../config/defaults.js').SimParams} _params
 * @param {import('../simulation/diffractionModel.js').DiffractionSnapshot} snapshot
 */
export function drawIntensityPanel(p, _params, snapshot) {
  const pad = 10;
  const h = 90;
  const y0 = p.height - h - pad;
  const x0 = pad;
  const w = p.width - pad * 2;
  const titleH = 16;
  const axisH = 18;
  const plotTop = y0 + titleH;
  const plotBottom = y0 + h - axisH;
  const plotH = plotBottom - plotTop;

  p.noStroke();
  p.fill(235);
  p.rect(x0, y0, w, h, 6);

  const { anglesRad, intensity } = snapshot.farField;
  if (!anglesRad.length) return;

  p.stroke(60);
  p.noFill();
  p.beginShape();
  for (let i = 0; i < anglesRad.length; i += 1) {
    const t = (anglesRad[i] + Math.PI / 2) / Math.PI;
    const px = x0 + t * w;
    const py = plotBottom - intensity[i] * plotH;
    p.vertex(px, py);
  }
  p.endShape();

  drawAngleAxis(p, x0, y0, w, h);

  p.noStroke();
  p.fill(50);
  p.textSize(11);
  p.text("Relative intensity vs angle (scalar model)", x0 + 6, y0 + 12);
}
