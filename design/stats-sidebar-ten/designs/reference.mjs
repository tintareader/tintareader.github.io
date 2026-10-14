// The three-question panel recommended in ../stats-sidebar-blind, ported to
// this harness unchanged. It is the content brief for the ten designs and the
// "before" on the review page.
import { esc, fmt, dShort } from '../harness/data.mjs';

export const meta = { id: 'reference', designer: 'The recommended panel', note: 'From the independent round, as recommended.' };
export const fonts = [];

const path = (pts) => pts.map((q, i) => `${i ? 'L' : 'M'}${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(' ');
function sparkPts(values, w, h, pad = 1.5) {
  const lo = Math.min(...values), hi = Math.max(...values), n = values.length;
  return values.map((v, i) => [pad + (i / (n - 1)) * (w - 2 * pad), pad + (1 - (v - lo) / (hi - lo || 1)) * (h - 2 * pad)]);
}
function histPts(hist, w, h, pad = 1.5) {
  const t0 = Date.parse(hist[0].d), t1 = Date.parse(hist.at(-1).d);
  const vals = hist.map(x => x.k), lo = Math.min(...vals), hi = Math.max(...vals);
  return hist.map(x => [pad + ((Date.parse(x.d) - t0) / (t1 - t0)) * (w - 2 * pad), pad + (1 - (x.k - lo) / (hi - lo)) * (h - 2 * pad)]);
}

export function html(D) {
  const W = 368, v = D.verdict;
  const defs = `<defs><symbol id="rc-word" viewBox="0 0 10 14"><path d="M1.6 0h6.8A1.6 1.6 0 0 1 10 1.6v10.8A1.6 1.6 0 0 1 8.4 14H1.6A1.6 1.6 0 0 1 0 12.4V1.6A1.6 1.6 0 0 1 1.6 0z"/></symbol></defs>`;
  const row = Array.from({ length: D.oneIn }, (_, i) => `<use href="#rc-word" x="${i * 22}" y="1" width="16" height="22" class="${i === D.oneIn - 1 ? 'rc-u' : 'rc-k'}"/>`).join('');
  const symRow = `<svg class="rc-sym" viewBox="0 0 ${W} 24" width="${W}" height="24" aria-hidden="true">${defs}${row}</svg>`;
  let x = 0; const segs = [];
  for (const [n, col] of [[D.counts.k, 'var(--band-k)'], [D.counts.l, 'var(--band-l)'], [D.counts.u, 'var(--c-unknown)']]) { if (!n) continue; const w = n / D.total * W; segs.push(`<rect x="${x.toFixed(1)}" y="2" width="${Math.max(1.5, w - 2).toFixed(1)}" height="6" rx="1.5" fill="${col}"/>`); x += w; }
  const bar = `<svg class="rc-bar" viewBox="0 0 ${W} 28" width="${W}" height="28" role="img" aria-label="${D.pct}% known; workable from 60% at ${D.level}, comfortable from 95%">${segs.join('')}<line x1="${0.6 * W}" x2="${0.6 * W}" y1="11" y2="15" stroke="var(--dim)"/><text x="${0.6 * W}" y="26" text-anchor="middle">60% workable at ${D.level}</text><line x1="${(0.95 * W).toFixed(1)}" x2="${(0.95 * W).toFixed(1)}" y1="11" y2="15" stroke="var(--dim)"/><text x="${W}" y="26" text-anchor="end">95% comfortable</text></svg>`;
  const sp = sparkPts(D.series.map(q => q.v), 84, 18, 2);
  const spark = `<svg class="rc-spark" viewBox="0 0 84 18" width="84" height="18" aria-hidden="true"><path d="${path(sp)}" fill="none" stroke="var(--dim)" stroke-width="1.2"/><circle cx="${sp.at(-1)[0]}" cy="${sp.at(-1)[1]}" r="2.3" fill="var(--ink)"/></svg>`;
  const hp = histPts(D.history, 84, 18, 2);
  const spark2 = `<svg class="rc-spark" viewBox="0 0 84 18" width="84" height="18" aria-hidden="true"><path d="${path(hp)}" fill="none" stroke="var(--dim)" stroke-width="1.2"/><circle cx="${hp.at(-1)[0]}" cy="${hp.at(-1)[1]}" r="2.3" fill="var(--ink)"/></svg>`;
  const back = D.repeated.map(r => `<li><span class="rc-w">${esc(r.word)}</span><span class="rc-dots" aria-label="${r.count} times">${'<i></i>'.repeat(r.count)}</span><span class="rc-g">${esc(r.gloss)}</span></li>`).join('');
  return `
<div class="mp mp-rec">
  <div class="sech rc-sech">Can I read this?</div>
  <div class="rc-head"><span>About 1 word in ${D.oneIn} is new to you</span></div>
  ${symRow}
  <div class="rc-verdict"><span class="rc-chip rc-${v.key}">${v.label}</span><span>${D.pct}% known · ${D.lookups} lookups in ${D.total} words</span></div>
  ${bar}
  <div class="sech rc-sech">What will help most?</div>
  <div class="rc-sub">New words that come back in this text</div>
  <ul class="rc-list">${back}</ul>
  <div class="rc-act"><button class="btn" type="button">${D.action}</button><span>Knowing them: <b>${D.after}%</b> of this text</span></div>
  <div class="sech rc-sech">Am I getting better?</div>
  <div class="rc-prog"><span class="rc-pl">This text</span><span class="rc-pv">${D.firstPct}% → <b>${D.pct}%</b></span>${spark}<span class="rc-pn">since ${dShort(D.since)}</span></div>
  <div class="rc-prog"><span class="rc-pl">Words known</span><span class="rc-pv"><b>${fmt(D.known)}</b></span>${spark2}<span class="rc-pn">+${D.gain7} this week</span></div>
  <a class="mp-more" href="#stats">${D.more}<span aria-hidden="true"> →</span></a>
</div>`;
}

export const css = `
.mp-rec { font-family: var(--font-ui); padding: 4px 0 18px; }
.mp-rec > *:not(.sech) { margin-inline: 16px; }
.mp-rec .rc-sech { padding-top: 16px; }
.mp-rec .rc-sech:first-child { padding-top: 8px; }
.mp-rec .rc-head { font-size: 17px; font-weight: 600; color: var(--ink); letter-spacing: -.005em; margin-bottom: 8px; line-height: 1.25; }
.mp-rec .rc-k { fill: var(--band-k); }
.mp-rec .rc-u { fill: var(--c-unknown); }
.mp-rec .rc-verdict { display: flex; align-items: center; flex-wrap: wrap; gap: 6px 10px; margin: 10px 16px 8px; font-size: 12.5px; color: var(--dim); font-variant-numeric: tabular-nums; }
.mp-rec .rc-chip { font-size: 12px; font-weight: 600; padding: 2px 9px; border-radius: 11px; color: var(--ink); background: var(--panel2); box-shadow: inset 0 0 0 1px var(--card-line); }
.mp-rec .rc-bar text { font: 10.5px var(--font-ui); fill: var(--dim); }
.mp-rec .rc-sub { font-size: 12px; color: var(--dim); margin-bottom: 4px; }
.mp-rec .rc-list { list-style: none; padding: 0; margin: 0 16px; display: grid; }
.mp-rec .rc-list li { display: grid; grid-template-columns: 76px 44px 1fr; align-items: center; gap: 8px; padding: 4px 0; border-bottom: 1px solid var(--hairline); font-size: 13px; }
.mp-rec .rc-list li:last-child { border-bottom: none; }
.mp-rec .rc-w { color: var(--c-unknown); font-family: var(--font-read); font-size: 14.5px; }
.mp-rec .rc-dots { display: flex; gap: 3px; }
.mp-rec .rc-dots i { width: 6px; height: 6px; border-radius: 50%; background: var(--c-unknown); }
.mp-rec .rc-g { color: var(--dim); font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mp-rec .rc-act { display: flex; align-items: center; gap: 10px; margin-top: 10px; font-size: 12.5px; color: var(--dim); }
.mp-rec .rc-act b { color: var(--ink); }
.mp-rec .rc-prog { display: grid; grid-template-columns: 84px 92px 84px 1fr; align-items: center; gap: 8px; font-size: 12.5px; padding: 4px 0; font-variant-numeric: tabular-nums; }
.mp-rec .rc-pl { color: var(--ui); }
.mp-rec .rc-pv { color: var(--dim); white-space: nowrap; }
.mp-rec .rc-pv b { color: var(--ink); font-weight: 600; }
.mp-rec .rc-pn { color: var(--dim); text-align: end; white-space: nowrap; }
.mp-rec .mp-more { display: inline-block; margin-top: 14px; color: var(--accent); font: 500 var(--fs-small)/1.3 var(--font-ui); text-decoration: none; }
`;
