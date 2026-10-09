// Motion/orientation layer ON TOP of the original static classifier (classify() in gestures.js is untouched).
// Per frame: pose features + a short trail (~1.3 s) of hand positions -> gesture id.
// Prototype heuristics for demonstration only; not real sign-language grammar.
import { classify } from './gestures';

const d = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const mean = (a) => a.reduce((s, v) => s + v, 0) / a.length;
const MAXT = 18;
export const MOTION_IDS = new Set(['GOOD', 'SORRY', 'WELCOME', 'COME', 'GO', 'WAIT', 'TODAY', 'TOMORROW', 'YESTERDAY', 'MORNING', 'NIGHT', 'HAPPY', 'SAD']);

function pose(l) {
  const palm = d(l[0], l[9]) || 1e-6;
  const ext = [d(l[4], l[5]) / palm > 0.62, ...[[8, 6], [12, 10], [16, 14], [20, 18]].map(([t, p]) => d(l[t], l[0]) > d(l[p], l[0]) * 1.12)];
  const ang = (Math.atan2(-(l[9].y - l[0].y), l[9].x - l[0].x) * 180) / Math.PI; // 90 = fingers up
  const dir = ang > 50 && ang < 130 ? 'up' : ang < -50 && ang > -130 ? 'down' : 'side';
  const bunch = Math.max(d(l[4], l[8]), d(l[4], l[12]), d(l[4], l[16])) / palm < 0.5 && d(l[8], l[0]) / palm > 1.15;
  return { palm, ext, dir, bunch, r: d(l[8], l[0]) / (d(l[6], l[0]) || 1e-6), f4: ext.slice(1).filter(Boolean).length, key: ext.map(Number).join('') };
}

function reversals(a, thr) {
  let n = 0, dir = 0, ex = a[0];
  for (const v of a) {
    if (dir === 0) { if (v - ex > thr) { dir = 1; ex = v; } else if (ex - v > thr) { dir = -1; ex = v; } }
    else if (dir === 1) { if (v > ex) ex = v; else if (ex - v > thr) { dir = -1; ex = v; n++; } }
    else if (v < ex) ex = v; else if (v - ex > thr) { dir = 1; ex = v; n++; }
  }
  return n;
}

function motion(t) {
  if (t.length < 8) return { kind: null, fast: false };
  const pm = mean(t.map((s) => s.palm)) || 1e-6;
  const xs = t.map((s) => s.x / pm), ys = t.map((s) => s.y / pm);
  const step = (i) => Math.hypot(xs[i] - xs[i - 1], ys[i] - ys[i - 1]);
  const fast = mean([1, 2, 3, 4].map((k) => step(t.length - k))) > 0.3;
  const rx = Math.max(...xs) - Math.min(...xs), ry = Math.max(...ys) - Math.min(...ys);
  if (t.length >= 14) {
    // beckon: index curls/extends repeatedly while the hand stays put and other fingers are folded
    let st = null, tog = 0;
    for (const s of t) { const n = s.r > 1.15 ? 1 : s.r < 0.92 ? 0 : st; if (st !== null && n !== st) tog++; st = n; }
    if (tog >= 3 && t.every((s) => s.others) && rx < 1 && ry < 1) return { kind: 'beckon', fast };
    const cx = mean(xs), cy = mean(ys); let tot = 0, prev = null, rad = 0;
    for (let i = 0; i < xs.length; i++) {
      const a = Math.atan2(ys[i] - cy, xs[i] - cx);
      if (prev !== null) { let da = a - prev; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI; tot += da; }
      prev = a; rad += Math.hypot(xs[i] - cx, ys[i] - cy) / xs.length;
    }
    if (Math.abs(tot) > 4.7 && rad > 0.3 && rad < 2.5) return { kind: 'circle', fast };
    if (reversals(ys, 0.5) >= 2 && ry >= 0.8 && ry > rx) return { kind: 'bounceV', fast };
    if (reversals(xs, 0.5) >= 2 && rx >= 0.8) return { kind: 'waveH', fast };
  }
  const dx = xs[xs.length - 1] - xs[xs.length - 8], dy = ys[ys.length - 1] - ys[ys.length - 8];
  if (Math.abs(dx) >= 1.2 && Math.abs(dx) > 2 * Math.abs(dy)) return { kind: 'swipeH', dx, fast };
  if (Math.abs(dy) >= 1.2 && Math.abs(dy) > 2 * Math.abs(dx)) return { kind: dy < 0 ? 'swipeUp' : 'swipeDown', fast };
  return { kind: null, fast };
}

function fromMotion(p, m) {
  const open = p.f4 >= 3, fist = p.f4 === 0, idx = p.ext[1] && p.f4 === 1, two = p.ext[1] && p.ext[2] && p.f4 === 2, thumbOnly = p.ext[0] && p.f4 === 0;
  switch (m.kind) {
    case 'beckon': return 'COME';
    case 'bounceV': return thumbOnly ? 'GOOD' : open ? 'WAIT' : null;
    case 'waveH': return open ? 'HELLO' : null;
    case 'circle': return open ? 'HAPPY' : fist ? 'SORRY' : null;
    case 'swipeH': return open ? 'WELCOME' : idx ? 'GO' : thumbOnly ? (m.dx < 0 ? 'TOMORROW' : 'YESTERDAY') : null; // raw dx<0 = user's right
    case 'swipeUp': return open ? 'MORNING' : null;
    case 'swipeDown': return open ? 'NIGHT' : fist ? 'TODAY' : two ? 'SAD' : null;
    default: return null;
  }
}

// Static poses that need hand orientation to be told apart from the original 12.
function fromStatic(p) {
  if (p.bunch && p.dir !== 'down') return 'EAT';
  const k = p.key, up = p.dir === 'up', side = p.dir === 'side';
  if (k === '10001' && up) return 'DRINK';
  if (k === '11111' && side) return 'SLEEP';
  if (k === '11111' && p.dir === 'down') return 'WHAT';
  if (k === '11100' && up) return 'HOME';
  if (k === '01001' && up) return 'FRIEND';
  if (k === '01001' && side) return 'WHY';
  if (k === '01100' && side) return 'NAME';
  if (k === '01000' && side) return 'WHERE';
  if (k === '11000' && side) return 'WHO';
  if (k === '11110' && up) return 'WHEN';
  if (k === '01111' && side) return 'HOW';
  return null;
}

/** Returns a gesture id or null. `trail` is a caller-owned array (cleared when the hand leaves). */
export function classifyFrame(l, trail) {
  const p = pose(l);
  trail.push({ x: (l[0].x + l[9].x) / 2, y: (l[0].y + l[9].y) / 2, palm: p.palm, r: p.r, others: !p.ext[2] && !p.ext[3] && !p.ext[4] });
  if (trail.length > MAXT) trail.shift();
  const m = motion(trail);
  if (m.kind) return fromMotion(p, m);
  if (m.fast) return null; // hand is moving: suppress static signs (fewer false positives)
  return fromStatic(p) || classify(l); // original 12 gestures still handled by the original classifier
}
