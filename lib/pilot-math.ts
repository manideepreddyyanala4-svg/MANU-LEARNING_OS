/** Synthetic teaching data only. No research datasets or threshold selection. */
export const genuineScores = [0.9, 0.7, 0.5, 0.4];
export const impostorScores = [0.1, 0.3, 0.5, 0.6, 0.2];
export function verificationCounts(genuine: number[], impostor: number[], threshold: number, strict = false) {
  if (![...genuine, ...impostor, threshold].every(Number.isFinite)) throw new Error('Scores must be finite.');
  const accepts = (s: number) => strict ? s > threshold : s >= threshold;
  const ta = genuine.filter(accepts).length, fa = impostor.filter(accepts).length;
  const fr = genuine.length - ta, tr = impostor.length - fa;
  return { ta, fa, fr, tr, far: impostor.length ? fa / impostor.length : null,
    frr: genuine.length ? fr / genuine.length : null, tar: genuine.length ? ta / genuine.length : null };
}
export type Border = 'zero' | 'reflect101' | 'replicate';
export const filterImage = Array.from({length: 5}, (_, y) => Array.from({length: 5}, (_, x) => y * 5 + x + 1));
export function filterAt(x: number, y: number, border: Border, asymmetric = false, convolution = false) {
  if (![x, y].every(v => Number.isInteger(v) && v >= 0 && v < 5)) throw new Error('Choose a pixel inside the 5×5 grid.');
  const weights = asymmetric ? [0,0,0,0,0,1,0,0,0] : Array(9).fill(1 / 9) as number[];
  if (convolution) weights.reverse();
  const terms = Array.from({length: 9}, (_, i) => {
    const rawX = x + i % 3 - 1, rawY = y + Math.floor(i / 3) - 1;
    const outside = rawX < 0 || rawX > 4 || rawY < 0 || rawY > 4;
    const map = (v: number) => border === 'reflect101' ? (v < 0 ? -v : v > 4 ? 8-v : v) : Math.max(0, Math.min(4,v));
    const value = outside && border === 'zero' ? 0 : filterImage[map(rawY)][map(rawX)];
    return { value, weight: weights[i], product: value * weights[i], outside, rawX, rawY };
  });
  return { terms, value: terms.reduce((s,t) => s+t.product,0) };
}
