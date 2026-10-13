// The calibration explainer for the review page: past texts by length and new words per 100,
// with the reader's two limits, density (densest finished) and stamina (most taps finished).
import { load } from './derive2.mjs';

export function calChart() {
  const { A, M, S } = load();
  const L = 70, R = 968, T = 38, B = 372, xMax = 1500, yMax = 25;
  const X = w => L + w / xMax * (R - L), Y = v => B - Math.min(v, yMax) / yMax * (B - T);
  const f = n => n.toFixed(1);
  const lim = S.limit, taps = S.mostTaps, xStar = taps * 100 / lim;
  const curve = []; for (let w = taps * 100 / yMax; w <= xMax; w += 10) curve.push([X(w), Y(taps * 100 / w)]);
  const safe = [[X(0), Y(lim)], [X(xStar), Y(lim)], ...curve.filter(([x]) => x >= X(xStar)), [X(xMax), Y(taps * 100 / xMax)], [X(xMax), Y(0)], [X(0), Y(0)]];
  const grid = [0, 5, 10, 15, 20, 25].map(v => `<line x1="${L}" x2="${R}" y1="${f(Y(v))}" y2="${f(Y(v))}" stroke="var(--line)" stroke-width="1"/><text x="${L - 10}" y="${f(Y(v) + 4)}" text-anchor="end">${v}</text>`).join('');
  const xt = [0, 250, 500, 750, 1000, 1250, 1500].map(w => `<text x="${f(X(w))}" y="${B + 22}" text-anchor="${w === 0 ? 'start' : w === xMax ? 'end' : 'middle'}">${w.toLocaleString('en-US')}${w === xMax ? ' words' : ''}</text>`).join('');
  const pts = S.log.map(t => {
    const x = X(t.words), y = Y(t.per100), tip = `<title>${t.d}: ${t.words} words, ${t.taps} new words (${f(t.per100)} per 100), ${t.done ? 'finished' : 'stopped'}</title>`;
    return t.done ? `<g>${tip}<circle cx="${f(x)}" cy="${f(y)}" r="6" fill="var(--ink2)" stroke="var(--card)" stroke-width="2"/></g>`
      : `<g>${tip}<path d="M${f(x - 6)} ${f(y - 6)} l12 12 m0 -12 l-12 12" stroke="var(--ink)" stroke-width="2.4" stroke-linecap="round"/></g>`;
  }).join('');
  const stopLab = S.stop.map(t => {
    const x = X(t.words), y = Y(t.per100), long = t.taps > taps && t.per100 <= lim;
    const left = x > 800;
    return `<text x="${f(left ? x - 12 : x + 11)}" y="${f(y + 4)}" text-anchor="${left ? 'end' : 'start'}" class="cl">stopped: too ${long ? 'long' : 'dense'}</text>`;
  }).join('');
  const dia = (x, y, fill) => `<path d="M${f(x)} ${f(y - 8)} l8 8 l-8 8 l-8 -8z" fill="${fill}" stroke="var(--card)" stroke-width="2"/>`;
  const cur = `
    <g><title>La ofrenda now: ${A.taps} new words in ${A.run.total} (${f(A.per100)} per 100); ${A.openedTaps} when opened</title>${dia(X(A.run.total), Y(A.per100), 'var(--new)')}</g>
    <text x="${f(X(A.run.total) - 14)}" y="${f(Y(A.per100) + 4)}" text-anchor="end" class="cl">La ofrenda, now</text>
    <g><title>Un mate en la oficina: ${M.taps} new words in ${M.run.total} (${f(M.per100)} per 100)</title>${dia(X(M.run.total), Y(M.per100), 'var(--new)')}</g>
    <text x="${f(X(M.run.total) + 40)}" y="${f(Y(M.per100) - 15)}" text-anchor="end" class="cl">Un mate en la oficina</text>`;
  return `<svg viewBox="0 0 1000 410" role="img" aria-label="Sixteen past texts by length and new words per 100: thirteen finished, all under 13 per 100 and 58 taps; three stopped, two too dense and one too long. La ofrenda sits well inside; Un mate en la oficina sits above the density limit until two names and one word are dealt with.">
    <path d="M${safe.map(p => p.map(f).join(' ')).join(' L')}Z" fill="var(--plum-wash)"/>
    ${grid}${xt}
    <text x="${L - 10}" y="${T - 18}" text-anchor="start" class="ax">New words per 100</text>
    <line x1="${L}" x2="${R}" y1="${f(Y(lim))}" y2="${f(Y(lim))}" stroke="var(--ink2)" stroke-width="1.6"/>
    <text x="${f(X(1500) - 4)}" y="${f(Y(lim) - 8)}" text-anchor="end" class="cl">densest text you finished: ${Math.round(lim)} per 100</text>
    <path d="M${curve.map(p => p.map(f).join(' ')).join(' L')}" fill="none" stroke="var(--plum)" stroke-width="2.4"/>
    <text x="${f(X(1060))}" y="${f(Y(taps * 100 / 1060) - 12)}" class="cl" style="fill:var(--plum)">most taps you finished in one text: ${taps}</text>
    <text x="800" y="336" class="cl" style="fill:var(--plum)">Texts in here, you finish</text>
    ${pts}${stopLab}${cur}
  </svg>`;
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop())) console.log(calChart().length);
