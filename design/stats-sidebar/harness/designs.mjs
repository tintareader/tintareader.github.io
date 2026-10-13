// Five sidebar Stats panels, one per designer, all drawing the same brief from the same real data.
// Each design is { id, designer, name, css, html(D) }. CSS is scoped to .mk-<id> and uses only the
// app's own tokens (--ink, --dim, --c-unknown …), so light and dark come from the app's palettes.
import { BANDS, bandOf } from './derive.mjs';

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const num = x => x.toLocaleString('en-US');
const day = (iso, o = { day: 'numeric', month: 'short' }) => new Date(iso + 'T00:00:00Z').toLocaleDateString('en-GB', { ...o, timeZone: 'UTC' });
const W = 368; // content width of the 400px sidebar, less the app's 16px gutters
const COL = { k: 'var(--c-known)', l: 'var(--c-learning)', u: 'var(--c-unknown)', i: 'var(--c-ignored)' };
const SPELL = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
const spell = n => SPELL[n] ?? num(n);
const Spell = n => { const s = spell(n); return s[0].toUpperCase() + s.slice(1); };

function sparkPath(hist, w, h, padY = 2) {
  const t = d => Date.parse(d + 'T00:00:00Z');
  const t0 = t(hist[0].d), t1 = t(hist[hist.length - 1].d);
  const k0 = hist[0].k, k1 = Math.max(...hist.map(e => e.k));
  const X = d => (t(d) - t0) / (t1 - t0) * w, Y = k => h - padY - (k - k0) / (k1 - k0) * (h - padY * 2);
  const pts = hist.map(e => [X(e.d), Y(e.k)]);
  return { d: 'M' + pts.map(p => p.map(v => v.toFixed(1)).join(' ')).join(' L'), end: pts[pts.length - 1], start: pts[0] };
}

/* ───────────────────────────── 1 · Stephen Few ───────────────────────────── */
const few = {
  id: 'few', designer: 'Stephen Few', name: 'The bullet graph',
  css: `
.mk-few{--r1:#46505d;--r2:#353d48;--r3:#2a3139;--r4:#222830;padding:4px 16px 18px;font-family:var(--font-ui);color:var(--ink)}
:root[data-theme=light] .mk-few{--r1:#bcc2b8;--r2:#ccd1c8;--r3:#d9ddd5;--r4:#e4e7e0}
.mk-few .zh{display:flex;justify-content:space-between;align-items:baseline;padding:12px 0 8px;color:var(--dim);font-size:var(--fs-label);letter-spacing:.09em;text-transform:uppercase}
.mk-few .zh span:last-child{letter-spacing:0;text-transform:none;font-size:var(--fs-note);color:var(--faint)}
.mk-few .zkpi{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px}
.mk-few .zkpi .zlab{font-size:13px;color:var(--ui)}
.mk-few .zkpi .zlab small{display:block;color:var(--faint);font-size:var(--fs-note);margin-top:1px}
.mk-few .zkpi .zval{font-size:26px;font-weight:600;line-height:1}
.mk-few svg{display:block;overflow:visible}
.mk-few svg text{font-family:var(--font-ui);font-size:10px;fill:var(--faint)}
.mk-few svg text.zrn{fill:var(--dim);font-size:10px}
.mk-few svg text.zon{fill:var(--ink);font-weight:600}
.mk-few .zkey{display:flex;gap:14px;margin:12px 0 2px;font-size:var(--fs-note);color:var(--dim)}
.mk-few .zkey span{display:inline-flex;align-items:center;gap:5px}
.mk-few .zkey svg{display:inline-block}
.mk-few table{width:100%;border-collapse:collapse;margin-top:14px;font-size:12.5px}
.mk-few td{padding:6px 0;border-top:1px solid var(--hairline);vertical-align:baseline}
.mk-few td.zl{color:var(--dim);width:92px;white-space:nowrap}
.mk-few td.zn{text-align:right;width:22px;padding-right:12px;font-variant-numeric:tabular-nums;color:var(--ink);font-weight:600}
.mk-few td.zw{color:var(--ui);line-height:1.5}
.mk-few td.zw b{font-weight:400;color:var(--ink)}
.mk-few td.zw em{font-style:normal;color:var(--faint);font-size:11px}
.mk-few .zdot{display:inline-block;width:7px;height:7px;border-radius:50%;margin-right:6px;vertical-align:1px}
.mk-few .znote{font-size:var(--fs-note);color:var(--faint);margin-top:8px;line-height:1.5}
.mk-few .zvrow{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:0 12px;font-size:12.5px}
.mk-few .zvrow svg{justify-self:center}
.mk-few .zvrow .zl{white-space:nowrap}
.mk-few .zvrow .zl{color:var(--dim)}
.mk-few .zvrow .zv{text-align:right;font-weight:600;font-size:15px;font-variant-numeric:tabular-nums}
.mk-few .zvrow .zv small{display:block;font-weight:400;font-size:var(--fs-note);color:var(--faint)}
.mk-few .zmore{display:block;text-align:right;margin-top:10px;font-size:var(--fs-small);color:var(--dim);text-decoration:underline;text-underline-offset:2px}
`,
  html(D) {
    const lo = 85, hi = 100, gw = W, gh = 20, X = p => (p - lo) / (hi - lo) * gw;
    const ranges = [[lo, 90, 'r1', 'Hard'], [90, 95, 'r2', 'Stretch'], [95, 98, 'r3', 'Comfortable'], [98, 100, 'r4', 'Easy']];
    const band = bandOf(D.pctExact);
    const svg = `<svg width="${gw}" height="52" viewBox="0 0 ${gw} 52" role="img" aria-label="${D.pct}% of running words known; ${band.name}; target 95%; ${D.opened}% when opened">
      ${ranges.map(([a, b, r]) => `<rect x="${X(a).toFixed(1)}" y="0" width="${(X(b) - X(a)).toFixed(1)}" height="${gh}" fill="var(--${r})"/>`).join('')}
      <line x1="${X(95)}" x2="${X(95)}" y1="2" y2="${gh - 2}" stroke="var(--ink)" stroke-width="2"/>
      <circle cx="${X(D.openedExact).toFixed(1)}" cy="${gh / 2}" r="4" fill="none" stroke="var(--ink)" stroke-width="1.5"/>
      <rect x="${(X(D.pctExact) - 3).toFixed(1)}" y="4" width="6" height="${gh - 8}" fill="var(--ink)"/>
      ${[85, 90, 95, 98, 100].map(p => `<line x1="${X(p)}" x2="${X(p)}" y1="${gh}" y2="${gh + 4}" stroke="var(--faint)" stroke-width="1"/><text x="${X(p)}" y="${gh + 15}" text-anchor="${p === 100 ? 'end' : p === 85 ? 'start' : 'middle'}">${p}${p === 100 ? '%' : ''}</text>`).join('')}
      ${ranges.map(([a, b, , name]) => `<text class="zrn${name === band.name ? ' zon' : ''}" x="${((X(a) + X(b)) / 2).toFixed(1)}" y="${gh + 30}" text-anchor="middle">${name}</text>`).join('')}
    </svg>`;
    const list = arr => arr.map(w => `<b>${esc(w.root)}</b>${w.n > 1 ? ` <em>×${w.n}</em>` : ''}`).join(', ');
    const sp = sparkPath(D.history, 150, 22);
    return `
      <div class="zh"><span>This text</span><span>${esc(D.title)} · ${num(D.run.total)} words</span></div>
      <div class="zkpi"><div class="zlab">Words you know<small>Running words, every repeat counted</small></div><div class="zval">${D.pct}%</div></div>
      ${svg}
      <div class="zkey">
        <span><svg width="6" height="12"><rect width="6" height="12" fill="var(--ink)"/></svg>Now ${D.pct}%</span>
        <span><svg width="10" height="10"><circle cx="5" cy="5" r="4" fill="none" stroke="var(--ink)" stroke-width="1.5"/></svg>Opened ${D.opened}%</span>
        <span><svg width="2" height="12"><rect width="2" height="12" fill="var(--ink)"/></svg>Target 95%</span>
      </div>
      <table>
        <tr><td class="zl"><span class="zdot" style="background:${COL.u}"></span>New</td><td class="zn">${D.uniq.u}</td><td class="zw">${list(D.newWords)}</td></tr>
        <tr><td class="zl"><span class="zdot" style="background:${COL.l}"></span>Learning</td><td class="zn">${D.uniq.l}</td><td class="zw">${list(D.learning)}</td></tr>
      </table>
      <div class="znote">To reach the 95% target: know the ${spell(D.uniq.u)} new words (${D.run.u} of the ${num(D.run.total)}).</div>
      <div class="zh" style="margin-top:14px;border-top:1px solid var(--hairline)"><span>Your vocabulary</span><span>since ${day(D.since.d)}</span></div>
      <div class="zvrow"><span class="zl">Words you know</span>
        <svg width="150" height="22" viewBox="0 0 150 22"><path d="${sp.d}" fill="none" stroke="var(--dim)" stroke-width="1.5" stroke-linejoin="round"/><circle cx="${sp.end[0]}" cy="${sp.end[1]}" r="2.5" fill="var(--ink)"/></svg>
        <span class="zv">${num(D.vocab.k)}<small>+${num(D.since.gain)}</small></span></div>
      <a class="zmore">All statistics</a>`;
  },
};

/* ───────────────────────────── 2 · Edward Tufte ───────────────────────────── */
const tufte = {
  id: 'tufte', designer: 'Edward Tufte', name: 'Word-sized graphics',
  css: `
.mk-tufte{padding:14px 16px 18px;font-family:var(--font-read);color:var(--ink);font-variant-numeric:oldstyle-nums proportional-nums}
.mk-tufte .zsc{font-variant-caps:all-small-caps;letter-spacing:.06em;color:var(--dim);font-size:14px}
.mk-tufte .ztop{display:flex;justify-content:space-between;align-items:baseline}
.mk-tufte .ztop i{font-size:12.5px;color:var(--faint)}
.mk-tufte .zhero{display:flex;align-items:flex-end;gap:10px;margin:10px 0 2px}
.mk-tufte .zhero .zfig{font-size:52px;line-height:.86;font-variant-numeric:lining-nums proportional-nums;letter-spacing:-.01em}
.mk-tufte .zhero .zcap{font-size:15px;line-height:1.2;color:var(--ui);padding-bottom:2px}
.mk-tufte .zhero .zcap i{display:block;color:var(--dim);font-size:13px}
.mk-tufte svg{display:block;overflow:visible}
.mk-tufte svg text{font-family:var(--font-read);font-size:11px;fill:var(--faint);font-variant-numeric:oldstyle-nums}
.mk-tufte svg text.zit{font-style:italic;fill:var(--dim)}
.mk-tufte .zlede{font-size:14px;line-height:1.5;color:var(--ui);margin:12px 0 0}
.mk-tufte .zlede b{font-weight:400;color:var(--ink)}
.mk-tufte .zsub{display:flex;justify-content:space-between;align-items:baseline;margin:20px 0 6px}
.mk-tufte table{border-collapse:collapse;width:100%;font-size:14px;line-height:1.5;margin-top:14px}
.mk-tufte th{text-align:left;vertical-align:baseline;font-weight:400;width:78px;padding:0 0 4px;white-space:nowrap}
.mk-tufte th s{display:inline-block;width:2px;height:11px;margin-right:6px;vertical-align:-1px;text-decoration:none}
.mk-tufte td{padding:0 0 4px;color:var(--ink)}
.mk-tufte td i{font-style:italic}
.mk-tufte td sub{vertical-align:baseline;color:var(--faint);font-size:12px;margin-left:2px}
.mk-tufte td .zs{color:var(--faint);margin:0 4px}
.mk-tufte .zrule{border-top:1px solid var(--hairline);margin:18px 0 12px}
.mk-tufte .zvocab{display:flex;align-items:center;gap:8px;font-size:14px;color:var(--ui)}
.mk-tufte .zvocab b{font-weight:400;color:var(--ink)}
.mk-tufte .zvocab i{color:var(--dim);font-size:13px}
.mk-tufte .zmore{display:block;text-align:right;margin-top:8px;color:var(--dim);font-size:14px;text-decoration:underline;text-underline-offset:2px;text-decoration-thickness:1px}
`,
  html(D) {
    const band = bandOf(D.pctExact);
    // Range frame: the axis spans only what matters, from the hardest threshold to 100.
    const lo = 85, hi = 100, pad = 4, w = W - pad * 2, X = p => pad + (p - lo) / (hi - lo) * w;
    const rf = `<svg width="${W}" height="50" viewBox="0 0 ${W} 50" role="img" aria-label="${D.pct}% known, up from ${D.opened}%">
      <rect x="${X(95)}" y="14" width="${X(100) - X(95)}" height="12" fill="var(--band-track)"/>
      <text class="zit" x="${X(100)}" y="9" text-anchor="end">comfortable from 95</text>
      <line x1="${X(D.openedExact)}" x2="${X(D.pctExact) - 5}" y1="20" y2="20" stroke="var(--dim)" stroke-width="1"/>
      <circle cx="${X(D.openedExact)}" cy="20" r="3.5" fill="var(--panel)" stroke="var(--dim)" stroke-width="1"/>
      <circle cx="${X(D.pctExact)}" cy="20" r="4" fill="var(--ink)"/>
      <text class="zit" x="${X(D.openedExact)}" y="9" text-anchor="middle">opened</text>
      <text class="zit" x="${X(D.pctExact) + 4}" y="9" text-anchor="start">now</text>
      <line x1="${X(lo)}" x2="${X(hi)}" y1="34" y2="34" stroke="var(--faint)" stroke-width=".75"/>
      ${[85, 90, 95, 98, 100].map(p => `<line x1="${X(p)}" x2="${X(p)}" y1="34" y2="37" stroke="var(--faint)" stroke-width=".75"/><text x="${X(p)}" y="48" text-anchor="middle">${p}</text>`).join('')}
    </svg>`;
    // The text as a sparkline: one tick per running word, paragraph breaks as gaps.
    const breaks = D.seq.reduce((m, x, i) => m + (i && x.p !== D.seq[i - 1].p ? 1 : 0), 0);
    const gap = 3, step = (W - breaks * gap) / D.seq.length;
    let x = 0; const ticks = [];
    const H = { k: 5, i: 5, l: 12, u: 17 };
    D.seq.forEach((t, i) => {
      if (i && t.p !== D.seq[i - 1].p) x += gap;
      const h = H[t.st];
      ticks.push(`<rect x="${x.toFixed(2)}" y="${20 - h}" width="1" height="${h}" fill="${COL[t.st]}"${t.st === 'k' ? ' opacity=".55"' : t.st === 'i' ? ' opacity=".5"' : ''}/>`);
      if (i === D.pos) ticks.push(`<path d="M${(x + .5).toFixed(2)} 24 l3.5 6 h-7z" fill="var(--ink)"/><text class="zit" x="${(x + 7).toFixed(1)}" y="31">you are here</text>`);
      x += step;
    });
    const strip = `<svg width="${W}" height="34" viewBox="0 0 ${W} 34" role="img" aria-label="Each running word as a tick, in reading order">${ticks.join('')}</svg>`;
    const words = arr => arr.map(w => `<i>${esc(w.root)}</i>${w.n > 1 ? `<sub>${w.n}</sub>` : ''}`).join('<span class="zs">·</span>');
    const sp = sparkPath(D.history, 104, 16);
    return `
      <div class="ztop"><span class="zsc">${esc(D.title)}</span><i>${num(D.run.total)} words, ${num(D.uniq.total)} different</i></div>
      <div class="zhero"><span class="zfig">${D.pct}%</span><span class="zcap">known<i>${band.name.toLowerCase() === 'stretch' ? 'a stretch' : esc(band.name.toLowerCase())}, ${band.from}–${band.to > 100 ? 100 : band.to}</i></span></div>
      ${rf}
      <p class="zlede">Up from ${D.opened}% when you opened it. Learn the ${spell(D.uniq.u)} new words and it is <b>${D.ifNew}%</b> known; with the ${spell(D.uniq.l)} you are learning, <b>${D.ifAll}%</b>.</p>
      <div class="zsub"><span class="zsc">The text, word by word</span><i style="font-size:12.5px;color:var(--faint)">tall marks are new</i></div>
      ${strip}
      <table>
        <tr><th class="zsc"><s style="background:${COL.u}"></s>new</th><td>${words(D.newWords)}</td></tr>
        <tr><th class="zsc"><s style="background:${COL.l}"></s>learning</th><td>${words(D.learning)}</td></tr>
      </table>
      <div class="zrule"></div>
      <div class="zvocab"><span class="zsc" style="font-size:14px">vocabulary</span><b>${num(D.vocab.k)}</b>
        <svg width="104" height="16" viewBox="0 0 104 16"><path d="${sp.d}" fill="none" stroke="var(--dim)" stroke-width="1" stroke-linejoin="round"/><circle cx="${sp.end[0]}" cy="${sp.end[1]}" r="2.25" fill="var(--c-unknown)"/></svg>
        <i>+${num(D.since.gain)} since ${day(D.since.d)}</i></div>
      <a class="zmore">All statistics</a>`;
  },
};

/* ───────────────────────────── 3 · Nicholas Felton ───────────────────────────── */
const felton = {
  id: 'felton', designer: 'Nicholas Felton', name: 'The reading report',
  css: `
.mk-felton{padding:14px 16px 18px;font-family:var(--font-ui);color:var(--ink)}
.mk-felton .zcap{font-size:9.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--dim);line-height:1.35}
.mk-felton .ztop{display:flex;justify-content:space-between;padding-bottom:7px;border-bottom:1.5px solid var(--ink)}
.mk-felton .zhero{display:grid;grid-template-columns:auto 1fr;align-items:end;gap:0 16px;padding:14px 0 10px}
.mk-felton .zhero .zfig{font-size:92px;font-weight:200;line-height:.78;letter-spacing:-.04em}
.mk-felton .zhero .zfig sup{font-size:34px;font-weight:300;vertical-align:top;position:relative;top:2px;letter-spacing:0;margin-left:2px}
.mk-felton .zhero .zv{font-size:15px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;margin-bottom:6px}
.mk-felton svg{display:block;overflow:visible}
.mk-felton svg text{font-family:var(--font-ui);font-size:9px;letter-spacing:.08em;fill:var(--dim)}
.mk-felton .ztiles{display:grid;grid-template-columns:repeat(3,1fr);margin-top:16px;border-top:1.5px solid var(--ink)}
.mk-felton .ztile{padding:10px 0 0}
.mk-felton .ztile + .ztile{padding-left:12px;border-left:1px solid var(--hairline)}
.mk-felton .ztile b{display:block;font-size:38px;font-weight:200;line-height:1;letter-spacing:-.02em;margin-bottom:6px}
.mk-felton .ztile i{display:block;width:22px;height:3px;margin-bottom:8px}
.mk-felton .zlist{display:grid;grid-template-columns:1fr 1fr;gap:0 24px;margin-top:14px;padding-top:9px;border-top:1px solid var(--hairline)}
.mk-felton .zlist .zcap{grid-column:1/-1;display:flex;justify-content:space-between;margin-bottom:4px}
.mk-felton .zrow{display:flex;justify-content:space-between;align-items:baseline;font-size:13.5px;padding:3px 0;border-bottom:1px solid var(--hairline)}
.mk-felton .zrow span:last-child{font-size:12px;color:var(--dim);font-variant-numeric:tabular-nums}
.mk-felton .zfoot{display:grid;grid-template-columns:auto 1fr;gap:0 18px;align-items:end;margin-top:18px;padding-top:10px;border-top:1.5px solid var(--ink)}
.mk-felton .zfoot b{display:block;font-size:38px;font-weight:200;line-height:1;letter-spacing:-.02em;margin-bottom:6px}
.mk-felton .zmore{display:block;text-align:right;margin-top:12px;font-size:9.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--ui);text-decoration:underline;text-underline-offset:3px}
`,
  html(D) {
    const band = bandOf(D.pctExact);
    const today = day(D.history[D.history.length - 1].d, { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase();
    // One thin proportion bar of the whole text: Known | Learning | New | Ignored, ticks at 95 and 98.
    const X = p => p / 100 * W;
    const segs = []; let acc = 0;
    for (const k of ['k', 'l', 'u', 'i']) {
      const w = D.run[k] / D.run.total * W;
      if (w > 0) segs.push(`<rect x="${(acc + (acc ? 1 : 0)).toFixed(1)}" y="14" width="${Math.max(1, w - (acc ? 1 : 0)).toFixed(1)}" height="4" fill="${k === 'k' ? 'var(--ink)' : COL[k]}"/>`);
      acc += w;
    }
    const bar = `<svg width="${W}" height="22" viewBox="0 0 ${W} 22" role="img" aria-label="Known ${D.run.k}, learning ${D.run.l}, new ${D.run.u}, ignored ${D.run.i} of ${D.run.total}">
      <line x1="${X(95)}" x2="${X(95)}" y1="9" y2="20" stroke="var(--dim)" stroke-width="1"/><text x="${X(95) - 3}" y="7" text-anchor="end">95% · COMFORTABLE</text>
      ${segs.join('')}</svg>`;
    const maxW = Math.max(...D.weeks);
    const cols = D.weeks.map((g, i) => {
      const h = Math.max(2, g / maxW * 30), x = i * 16;
      return `<rect x="${x}" y="${34 - h}" width="9" height="${h}" fill="${i === D.weeks.length - 1 ? 'var(--ink)' : 'var(--dim)'}"${i === D.weeks.length - 1 ? '' : ' opacity=".45"'}/>`;
    }).join('');
    const rows = D.newWords.map(w => `<div class="zrow"><span>${esc(w.root)}</span><span>${w.n}</span></div>`);
    const half = Math.ceil(rows.length / 2);
    return `
      <div class="ztop zcap"><span>${esc(D.title)}</span><span>${today}</span></div>
      <div class="zhero"><span class="zfig">${D.pct}<sup>%</sup></span><div><div class="zv">${band.name}</div><div class="zcap">Of the ${num(D.run.total)} words<br>are known to you</div></div></div>
      ${bar}
      <div class="ztiles">
        <div class="ztile"><b>+${D.pct - D.opened}</b><i style="background:var(--ink)"></i><div class="zcap">Points since<br>you opened it</div></div>
        <div class="ztile"><b>${D.uniq.u}</b><i style="background:${COL.u}"></i><div class="zcap">New words<br>left</div></div>
        <div class="ztile"><b>${D.uniq.l}</b><i style="background:${COL.l}"></i><div class="zcap">Words you're<br>learning</div></div>
      </div>
      <div class="zlist"><div class="zcap"><span>The new words</span><span>Uses</span></div>
        <div>${rows.slice(0, half).join('')}</div><div>${rows.slice(half).join('')}</div></div>
      <div class="zfoot"><div><b>${num(D.vocab.k)}</b><div class="zcap">Words known</div></div>
        <div style="justify-self:end;text-align:right"><svg width="105" height="36" viewBox="0 0 105 36" style="margin-left:auto">${cols}</svg><div class="zcap" style="margin-top:6px">+${D.week} this week</div></div></div>
      <a class="zmore">Full report</a>`;
  },
};

/* ───────────────────────────── 4 · Isotype ───────────────────────────── */
const isotype = {
  id: 'isotype', designer: 'Otto & Marie Neurath, Gerd Arntz (Isotype)', name: 'Count, don’t scale',
  css: `
@font-face{font-family:"Tinta DM Sans";src:url(/assets/pro-dm-sans-aa530716b0.woff2) format("woff2");font-weight:100 1000;font-display:block}
.mk-iso{padding:14px 16px 18px;font-family:"Tinta DM Sans",var(--font-ui);color:var(--ink)}
.mk-iso h3{margin:0;font-size:17px;font-weight:700;letter-spacing:-.005em;line-height:1.2}
.mk-iso .zsub{font-size:12.5px;color:var(--dim);margin:3px 0 12px}
.mk-iso .zgrp{margin-top:12px}
.mk-iso .zgrp .zlab{display:flex;justify-content:space-between;align-items:baseline;font-size:12.5px;color:var(--ui);margin-bottom:5px}
.mk-iso .zgrp .zlab b{font-weight:700;color:var(--ink)}
.mk-iso .zgrp .zlab span:last-child{color:var(--dim);font-size:12px}
.mk-iso svg{display:block;overflow:visible}
.mk-iso .zsay{font-size:14px;line-height:1.45;margin:16px 0 0}
.mk-iso .zsay b{font-weight:700}
.mk-iso .zchips{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
.mk-iso .zchips span{display:inline-flex;align-items:center;gap:6px;padding:3px 9px 3px 7px;border-radius:999px;background:var(--panel2);box-shadow:0 0 0 1px var(--card-line);font-size:13px}
.mk-iso .zchips span i{width:10px;height:6px;border-radius:1.5px;background:var(--c-unknown)}
.mk-iso .zkey{display:flex;flex-wrap:wrap;gap:4px 14px;margin-top:12px;font-size:11.5px;color:var(--dim)}
.mk-iso .zkey span{display:inline-flex;align-items:center;gap:5px}
.mk-iso .zfoot{margin-top:18px;padding-top:12px;border-top:1px solid var(--hairline)}
.mk-iso .zfoot .zlab{display:flex;justify-content:space-between;align-items:baseline;font-size:12.5px;color:var(--ui);margin-bottom:6px}
.mk-iso .zfoot .zlab b{font-size:15px;color:var(--ink)}
.mk-iso .zmore{display:block;text-align:right;margin-top:10px;font-size:12.5px;color:var(--dim);text-decoration:underline;text-underline-offset:2px}
`,
  html(D) {
    // One sign = one word in fifty. Rows are sorted so the counted colours sit together at the end.
    const per50 = (k, l, i, u) => {
      const raw = { k, l, i, u }, tot = k + l + i + u, out = {};
      const exact = Object.fromEntries(Object.entries(raw).map(([c, v]) => [c, v / tot * 50]));
      let left = 50;
      for (const c of ['l', 'i', 'u']) { out[c] = Math.round(exact[c]); left -= out[c]; }
      out.k = left;
      return out;
    };
    const SW = 11, SH = 7, GX = 3.2, G5 = 4.5;
    const sign = (x, y, c) => c === 'i'
      ? `<rect x="${x + .6}" y="${y + .6}" width="${SW - 1.2}" height="${SH - 1.2}" rx="1.5" fill="none" stroke="var(--c-ignored)" stroke-width="1.2"/>`
      : `<rect x="${x}" y="${y}" width="${SW}" height="${SH}" rx="1.5" fill="${c === 'k' ? 'var(--dim)' : COL[c]}"${c === 'k' ? ' opacity=".7"' : ''}/>`;
    const row = counts => {
      const order = [...Array(counts.k).fill('k'), ...Array(counts.l).fill('l'), ...Array(counts.i).fill('i'), ...Array(counts.u).fill('u')];
      const pitch = (W - 4 * G5 - 24 * GX - 25 * SW) / 1; // leftover, distributed below
      const gx = GX + pitch / 24;
      return `<svg width="${W}" height="${SH * 2 + 6}" viewBox="0 0 ${W} ${SH * 2 + 6}">${order.map((c, i) => {
        const r = Math.floor(i / 25), j = i % 25;
        return sign(j * (SW + gx) + Math.floor(j / 5) * G5, r * (SH + 6), c);
      }).join('')}</svg>`;
    };
    const opened = per50(D.run.k - 5, D.run.l - 5, 0, D.run.u + 14); // as opened: the session's 5 known, 5 learning and 4 names were still new
    const now = per50(D.run.k, D.run.l, D.run.i, D.run.u);
    const easy = { k: 49, l: 0, i: 0, u: 1 };
    const desc = c => [c.u && `${c.u} new`, c.l && `${c.l} learning`, c.i && `${c.i} name`].filter(Boolean).join(' · ');
    const tokens100 = D.vocab.k / 100, full = Math.floor(tokens100), frac = tokens100 - full;
    const vt = [];
    for (let i = 0; i < Math.ceil(tokens100); i++) {
      const x = i * (SW + 6.5) + Math.floor(i / 5) * G5;
      vt.push(i < full ? sign(x, 0, 'k') : `<rect x="${x}" y="0" width="${(SW * frac).toFixed(1)}" height="${SH}" rx="1.5" fill="var(--dim)" opacity=".7"/><rect x="${x + .6}" y=".6" width="${SW - 1.2}" height="${SH - 1.2}" rx="1.5" fill="none" stroke="var(--dim)" stroke-opacity=".6" stroke-width="1.2"/>`);
    }
    return `
      <h3>Every 50 words of ${esc(D.title)}</h3>
      <div class="zsub">One sign is one word in fifty.</div>
      <div class="zgrp"><div class="zlab"><span>When you opened it</span><span>${desc(opened)}</span></div>${row(opened)}</div>
      <div class="zgrp"><div class="zlab"><span><b>Now</b></span><span>${desc(now)}</span></div>${row(now)}</div>
      <div class="zgrp"><div class="zlab"><span>Easy reading, 98%</span><span>${desc(easy)}</span></div>${row(easy)}</div>
      <div class="zkey">
        <span><svg width="${SW}" height="${SH}">${sign(0, 0, 'k')}</svg>known</span>
        <span><svg width="${SW}" height="${SH}">${sign(0, 0, 'l')}</svg>learning</span>
        <span><svg width="${SW}" height="${SH}">${sign(0, 0, 'u')}</svg>new</span>
        <span><svg width="${SW}" height="${SH}">${sign(0, 0, 'i')}</svg>name, set aside</span>
      </div>
      <p class="zsay">Today’s ${spell(Math.round(D.run.u / D.run.total * 50))} pink signs are <b>${spell(D.uniq.u)} words</b>. Know them and the ${spell(D.uniq.l)} you are learning, and this text reads like the last row.</p>
      <div class="zchips">${D.newWords.map(w => `<span><i></i>${esc(w.root)}</span>`).join('')}</div>
      <div class="zfoot"><div class="zlab"><span>Words you know · one sign is 100</span><b>${num(D.vocab.k)}</b></div>
        <svg width="${W}" height="${SH}" viewBox="0 0 ${W} ${SH}">${vt.join('')}</svg></div>
      <a class="zmore">All statistics</a>`;
  },
};

/* ───────────────────────────── 5 · Stefanie Posavec ───────────────────────────── */
const posavec = {
  id: 'posavec', designer: 'Stefanie Posavec', name: 'The text’s fingerprint',
  css: `
.mk-posa{padding:14px 16px 18px;font-family:var(--font-ui);color:var(--ink)}
.mk-posa .zt{font-family:var(--font-read);font-style:italic;font-size:15px;color:var(--ui)}
.mk-posa .zt b{font-style:normal;font-weight:400;color:var(--ink)}
.mk-posa .zhead{display:flex;align-items:baseline;gap:10px;margin:8px 0 2px}
.mk-posa .zhead .zfig{font-size:34px;font-weight:300;line-height:1;letter-spacing:-.02em}
.mk-posa .zhead .zcap{font-size:13px;color:var(--ui);line-height:1.35}
.mk-posa .zhead .zcap span{color:var(--dim)}
.mk-posa svg{display:block;overflow:visible}
.mk-posa svg text{font-family:var(--font-read);font-style:italic;font-size:11.5px;fill:var(--ui)}
.mk-posa svg text.zd{fill:var(--faint);font-size:10.5px}
.mk-posa .zlegend{display:grid;grid-template-columns:1fr 1fr;gap:3px 14px;margin-top:12px;font-size:11.5px;color:var(--dim)}
.mk-posa .zlegend span{display:inline-flex;align-items:center;gap:7px}
.mk-posa .zhow{font-family:var(--font-read);font-style:italic;font-size:12.5px;color:var(--faint);line-height:1.45;margin-top:9px}
.mk-posa .zfoot{margin-top:16px;padding-top:12px;border-top:1px solid var(--hairline)}
.mk-posa .zfoot .zlab{display:flex;justify-content:space-between;align-items:baseline;font-size:12.5px;color:var(--dim);margin-top:7px}
.mk-posa .zfoot .zlab b{font-weight:600;color:var(--ink)}
.mk-posa .zmore{display:block;text-align:right;margin-top:8px;font-size:12.5px;color:var(--dim);text-decoration:underline;text-underline-offset:2px}
`,
  html(D) {
    const band = bandOf(D.pctExact);
    // Writing Without Words, turned on the reader: one line per sentence, length = its words.
    const U = 10.6, GAPW = 1.6, PITCH = 6.2, PGAP = 4.6, LX = 12;
    const rowsY = []; let y = 4;
    D.sentences.forEach((s, i) => { if (i && s.p !== D.sentences[i - 1].p) y += PGAP; rowsY.push(y); y += PITCH; });
    const height = y + 2;
    const marks = []; const labels = [];
    D.sentences.forEach((s, si) => {
      const yy = rowsY[si];
      s.words.forEach((w, j) => {
        const x = LX + j * U, st = w.st;
        const sw = st === 'u' || st === 'l' ? 3.2 : 1.4;
        const col = st === 'k' ? 'var(--dim)' : COL[st];
        marks.push(`<line x1="${(x + .8).toFixed(1)}" x2="${(x + U - GAPW).toFixed(1)}" y1="${yy}" y2="${yy}" stroke="${col}" stroke-width="${sw}" stroke-linecap="round"${st === 'k' ? ' opacity=".5"' : st === 'i' ? ' stroke-dasharray="1.2 2.4" opacity=".9"' : ''}/>`);
      });
      const nw = s.words.filter(w => w.st === 'u').map(w => w.w.toLowerCase());
      if (nw.length) labels.push({ y: yy, end: LX + s.words.length * U, text: nw.join(' · ') });
      if (s.words.some(w => w.i === D.pos)) marks.push(`<path d="M2 ${yy - 3.6} l5.5 3.6 l-5.5 3.6z" fill="var(--ink)"/>`);
    });
    // Labels sit in a right-hand column; when two would touch, the later one steps down on a leader.
    const LCOL = LX + 19 * U + 14; let lastY = -99;
    const lab = labels.map(l => {
      const ty = Math.max(l.y + 3.8, lastY + 13); lastY = ty;
      return `<path d="M${l.end + 3} ${l.y} H${LCOL - 10} L${LCOL - 4} ${ty - 3.8}" fill="none" stroke="var(--hairline)" stroke-width="1"/><text x="${LCOL}" y="${ty}">${esc(l.text)}</text>`;
    }).join('');
    const svgH = Math.max(height, lastY + 4);
    const fp = `<svg width="${W}" height="${svgH}" viewBox="0 0 ${W} ${svgH}" role="img" aria-label="${D.sentences.length} sentences as lines; new words marked">${marks.join('')}${lab}</svg>`;
    // The doorway: every day since the first, a mark sized by the words it added.
    const DW = W / D.days.length, maxG = Math.max(...D.days.map(d => d.gain || 0));
    const rhythm = D.days.map((d, i) => {
      const x = i * DW + DW / 2;
      if (d.gain === null) return `<circle cx="${x.toFixed(1)}" cy="20" r=".9" fill="var(--faint)"/>`;
      const h = Math.max(2, d.gain / maxG * 18);
      return `<line x1="${x.toFixed(1)}" x2="${x.toFixed(1)}" y1="20" y2="${(20 - h).toFixed(1)}" stroke="${i === D.days.length - 1 ? 'var(--c-unknown)' : 'var(--dim)'}" stroke-width="2.2" stroke-linecap="round"/>`;
    }).join('');
    const legLine = (st, w = 3.2, extra = '') => `<svg width="22" height="6"><line x1="1" x2="21" y1="3" y2="3" stroke="${st === 'k' ? 'var(--dim)' : COL[st]}" stroke-width="${w}" stroke-linecap="round" ${extra}/></svg>`;
    return `
      <div class="zt"><b>${esc(D.title)}</b>, sentence by sentence</div>
      <div class="zhead"><span class="zfig">${D.pct}%</span><span class="zcap">known · ${band.name.toLowerCase()}<br><span>up from ${D.opened}% · ${spell(D.uniq.u)} new words left</span></span></div>
      <div style="height:8px"></div>
      ${fp}
      <div class="zlegend">
        <span>${legLine('k', 1.4, 'opacity=".5"')}known</span>
        <span>${legLine('u')}new</span>
        <span>${legLine('l')}learning</span>
        <span>${legLine('i', 1.4, 'stroke-dasharray="1.2 2.4"')}name, set aside</span>
      </div>
      <div class="zhow">Each line is a sentence, in reading order; each dash, a word. Paragraphs leave a gap. ▸ marks where you are.</div>
      <div class="zfoot"><svg width="${W}" height="22" viewBox="0 0 ${W} 22" role="img" aria-label="Words added each day since ${day(D.since.d)}">${rhythm}</svg>
        <div class="zlab"><span>${day(D.since.d)} · each mark a day you read</span><span><b>${num(D.vocab.k)}</b> words known</span></div></div>
      <a class="zmore">All statistics</a>`;
  },
};


/* ───────────────────────────── 6 · Julie Zhuo's cut ───────────────────────────── */
// Not a sixth designer: her published principles applied strictly to the same brief.
// Verdict, then reason, then the next step; one pushed insight; nothing that does not
// change what the reader does next; overall progress is a quiet door, not a number.
const zhuo = {
  id: 'zhuo', designer: 'Julie Zhuo’s cut', name: 'Verdict, reason, next step',
  css: `
.mk-zhuo{padding:4px 16px 18px;font-family:var(--font-ui);color:var(--ink)}
.mk-zhuo .zh{padding:12px 0 8px;color:var(--dim);font-size:var(--fs-label);letter-spacing:.09em;text-transform:uppercase}
.mk-zhuo .zv{display:flex;justify-content:space-between;align-items:baseline}
.mk-zhuo .zv b{font-size:22px;font-weight:600;letter-spacing:-.01em}
.mk-zhuo .zv span{font-size:13px;color:var(--ui);font-variant-numeric:tabular-nums}
.mk-zhuo .zv span strong{font-weight:600;color:var(--ink)}
.mk-zhuo .zlad{display:grid;grid-template-columns:repeat(4,1fr);gap:2px;margin:10px 0 0}
.mk-zhuo .zlad i{height:6px;background:var(--well);box-shadow:inset 0 0 0 1px var(--hairline)}
.mk-zhuo .zlad i:first-child{border-radius:3px 0 0 3px}.mk-zhuo .zlad i:last-child{border-radius:0 3px 3px 0}
.mk-zhuo .zlad i.zon{background:var(--ink);box-shadow:none}
.mk-zhuo .zlab{display:grid;grid-template-columns:repeat(4,1fr);gap:2px;margin-top:5px;font-size:var(--fs-note);color:var(--faint)}
.mk-zhuo .zlab span.zon{color:var(--ink);font-weight:600}
.mk-zhuo .zwhy{font-size:12.5px;color:var(--dim);margin:12px 0 0}
.mk-zhuo .zcard{margin-top:14px;padding:12px 12px 10px;background:var(--panel2);border:1px solid var(--card-line);border-radius:10px}
.mk-zhuo .zcard h4{margin:0 0 9px;font-size:14px;font-weight:600;line-height:1.35}
.mk-zhuo .zchips{display:flex;flex-wrap:wrap;gap:6px}
.mk-zhuo .zchips span{display:inline-flex;align-items:center;gap:6px;padding:4px 10px 4px 8px;border-radius:999px;background:var(--well);box-shadow:0 0 0 1px var(--control-line);font-size:13px}
.mk-zhuo .zchips span i{width:7px;height:7px;border-radius:50%;background:var(--c-unknown)}
.mk-zhuo .zchips span em{font-style:normal;color:var(--faint);font-size:11.5px}
.mk-zhuo .znext{display:flex;justify-content:space-between;align-items:center;margin-top:11px;padding-top:9px;border-top:1px solid var(--hairline);font-size:12.5px;color:var(--dim)}
.mk-zhuo .znext b{font-weight:600;color:var(--ink)}
.mk-zhuo .znext a{color:var(--ink);font-weight:600;padding:4px 10px;border-radius:6px;background:var(--primary);box-shadow:0 0 0 1px var(--primary-line);white-space:nowrap}
.mk-zhuo .zalso{font-size:12.5px;color:var(--dim);margin-top:12px;line-height:1.5}
.mk-zhuo .zalso i{display:inline-block;width:7px;height:7px;border-radius:50%;background:var(--c-learning);margin-right:6px;vertical-align:0}
.mk-zhuo .zalso b{font-weight:400;color:var(--ui)}
.mk-zhuo .zdoor{display:flex;justify-content:space-between;align-items:center;margin-top:18px;padding:11px 0 0;border-top:1px solid var(--hairline);font-size:var(--fs-small);color:var(--dim)}
.mk-zhuo .zdoor span:last-child{color:var(--faint)}
`,
  html(D) {
    const band = bandOf(D.pctExact);
    const next = BANDS[BANDS.indexOf(band) + 1];
    const ahead = D.seq.findIndex((x, i) => i > D.pos && x.st === 'u');
    const nextWord = D.seq[ahead], steps = nextWord.sn - D.posSentence;
    return `
      <div class="zh">This text</div>
      <div class="zv"><b>${band.name}</b><span><strong>${D.pct}%</strong> of the words known</span></div>
      <div class="zlad" aria-hidden="true">${BANDS.map(b => `<i${b === band ? ' class="zon"' : ''}></i>`).join('')}</div>
      <div class="zlab">${BANDS.map(b => `<span${b === band ? ' class="zon"' : ''}>${b.name}</span>`).join('')}</div>
      <p class="zwhy">Up from ${D.opened}% when you opened it: the words you marked are working.</p>
      <div class="zcard">
        <h4>Learn ${spell(D.uniq.u)} words to make it ${next.name} (${D.ifNew}%)</h4>
        <div class="zchips">${D.newWords.map(w => `<span><i></i>${esc(w.root)}${w.n > 1 ? ` <em>×${w.n}</em>` : ''}</span>`).join('')}</div>
        <div class="znext"><span>Next: <b>${esc(nextWord.w)}</b>, ${spell(steps)} sentences on</span><a>Go to it</a></div>
      </div>
      <p class="zalso"><i></i>Learning here: <b>${D.learning.map(w => esc(w.root)).join(', ')}</b></p>
      <div class="zdoor"><span>Your vocabulary and progress</span><span>→</span></div>`;
  },
};

export const designs = [few, tufte, felton, isotype, posavec, zhuo];
