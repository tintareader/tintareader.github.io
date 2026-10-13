// Round 2. Same five designers and Julie Zhuo's cut, new brief:
// the cost of a text is the taps it will take (New words, counted every time they appear),
// and the verdict compares that with the reader's own finished and stopped texts.
// Each panel reuses its round-1 stylesheet and adds what the new content needs.
import { designs as R1 } from './designs.mjs';
import { verdict } from './derive2.mjs';

const css1 = Object.fromEntries(R1.map(d => [d.id, d.css]));
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const num = x => x.toLocaleString('en-US');
const r0 = x => Math.round(x);
const day = (iso, o = { day: 'numeric', month: 'short' }) => new Date(iso + 'T00:00:00Z').toLocaleDateString('en-GB', { ...o, timeZone: 'UTC' });
const W = 368;
const COL = { k: 'var(--c-known)', l: 'var(--c-learning)', u: 'var(--c-unknown)', i: 'var(--c-ignored)' };
const SPELL = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen'];
const spell = n => SPELL[n] ?? num(n);
const Spell = n => { const s = spell(n); return s[0].toUpperCase() + s.slice(1); };
const times = n => n > 1 ? ` <em>×${n}</em>` : '';

function sparkPath(hist, w, h, padY = 2) {
  const t = d => Date.parse(d + 'T00:00:00Z');
  const t0 = t(hist[0].d), t1 = t(hist[hist.length - 1].d);
  const k0 = hist[0].k, k1 = Math.max(...hist.map(e => e.k));
  const X = d => (t(d) - t0) / (t1 - t0) * w, Y = k => h - padY - (k - k0) / (k1 - k0) * (h - padY * 2);
  const pts = hist.map(e => [X(e.d), Y(e.k)]);
  return { d: 'M' + pts.map(p => p.map(v => v.toFixed(1)).join(' ')).join(' L'), end: pts[pts.length - 1] };
}

// The reader's past texts on one axis of new words per 100: finished as dots, stopped as crosses,
// stacked where they would touch; this text as the marked value, when-opened as a ring.
function rug(S, T, { w = W, max = 25, font = 'var(--font-ui)', showOpened = true, labels = true, tone = 'var(--dim)' } = {}) {
  const pad = 5, X = v => pad + Math.min(v, max) / max * (w - pad * 2), R = 3.4, base = 30;
  const items = S.log.map(t => ({ x: X(t.per100), done: t.done })).sort((a, b) => a.x - b.x);
  const levels = [];
  for (const it of items) {
    let lv = 0;
    while ((levels[lv] || []).some(x => Math.abs(x - it.x) < R * 2 + 1.5)) lv++;
    (levels[lv] ||= []).push(it.x); it.y = base - lv * (R * 2 + 1.5);
  }
  const marks = items.map(it => it.done
    ? `<circle cx="${it.x.toFixed(1)}" cy="${it.y.toFixed(1)}" r="${R}" fill="${tone}"/>`
    : `<path d="M${(it.x - R).toFixed(1)} ${(it.y - R).toFixed(1)} l${R * 2} ${R * 2} m0 ${-R * 2} l${-R * 2} ${R * 2}" stroke="${tone}" stroke-width="1.6" stroke-linecap="round"/>`).join('');
  const lim = X(S.limit), now = X(T.per100), op = X(T.openedPer100);
  const top = base - (levels.length - 1) * (R * 2 + 1.5) - R - 6;
  const minY = Math.min(0, top - 14), vbH = base + 34 - minY;
  return `<svg width="${w}" height="${vbH}" viewBox="0 ${minY} ${w} ${vbH}" role="img" aria-label="${T.title}: ${r0(T.per100)} new words per 100; you finish texts up to about ${r0(S.limit)}">
    <line x1="${pad}" x2="${w - pad}" y1="${base + R + 5}" y2="${base + R + 5}" stroke="var(--hairline)" stroke-width="1"/>
    <line x1="${lim}" x2="${lim}" y1="${top - 4}" y2="${base + R + 5}" stroke="var(--ink)" stroke-width="1.2"/>
    ${labels ? `<text x="${lim + 4}" y="${top + 2}" style="font-family:${font}" class="zlim">your limit, ${r0(S.limit)}</text>` : ''}
    ${marks}
    ${showOpened && Math.abs(op - now) > 4 ? `<circle cx="${op.toFixed(1)}" cy="${base + R + 5}" r="4.2" fill="var(--panel)" stroke="var(--ink)" stroke-width="1.4"/>` : ''}
    <path d="M${now.toFixed(1)} ${base + R + 5 - 7} l5 7 l-5 7 l-5 -7z" fill="var(--c-unknown)" stroke="var(--panel)" stroke-width="1.5"/>
    ${[0, 5, 10, 15, 20, 25].map(v => `<text x="${X(v)}" y="${base + R + 22}" text-anchor="${v === 0 ? 'start' : v === max ? 'end' : 'middle'}" style="font-family:${font}">${v}${v === max ? ' per 100' : ''}</text>`).join('')}
  </svg>`;
}

// One tick per running word, tall where it is New: where the taps will fall.
function wordStrip(T, { w = W, h = 20, label = 'you are here', italic = true } = {}) {
  const breaks = T.seq.reduce((m, x, i) => m + (i && x.p !== T.seq[i - 1].p ? 1 : 0), 0);
  const gap = 3, step = (w - breaks * gap) / T.seq.length, H = { k: 5, i: 5, l: 12, u: 17 };
  let x = 0; const out = [];
  T.seq.forEach((t, i) => {
    if (i && t.p !== T.seq[i - 1].p) x += gap;
    out.push(`<rect x="${x.toFixed(2)}" y="${h - H[t.st]}" width="1" height="${H[t.st]}" fill="${COL[t.st]}"${t.st === 'k' ? ' opacity=".5"' : t.st === 'i' ? ' opacity=".5"' : ''}/>`);
    if (i === T.pos) out.push(`<path d="M${(x + .5).toFixed(2)} ${h + 4} l3.5 6 h-7z" fill="var(--ink)"/><text x="${(x + 7).toFixed(1)}" y="${h + 11}" class="${italic ? 'zit' : 'zst'}">${label}</text>`);
    x += step;
  });
  return `<svg width="${w}" height="${h + 14}" viewBox="0 0 ${w} ${h + 14}" role="img" aria-label="Each running word as a tick; tall ticks are new words">${out.join('')}</svg>`;
}

const chips = (arr, { counts = true } = {}) => `<div class="zchips">${arr.map(w => `<span><i></i>${esc(w.root)}${counts ? times(w.freq) : ''}</span>`).join('')}</div>`;
const aheadWords = T => { const m = new Map(); T.seq.forEach((x, i) => { if (i > T.pos && x.st === 'u') { const f = x.w.toLowerCase(); m.set(f, { root: f, freq: (m.get(f)?.freq ?? 0) + 1 }); } }); return [...m.values()]; };
const passedForms = T => T.seq.filter((x, i) => i < T.pos && x.st === 'u').map(x => x.w.toLowerCase());

/* ───────────────────────────── Stephen Few ───────────────────────────── */
const few = {
  id: 'few', cls: 'mk-few', data: 'A', designer: 'Stephen Few', name: 'The bullet graph, against your own texts',
  css: css1.few + `
.mk-few .zbul + .zbul{margin-top:16px}
.mk-few .znote2{font-size:var(--fs-note);color:var(--faint);margin-top:10px;line-height:1.5}
`,
  html(T, S) {
    const bullet = ({ label, sub, value, shown, max, ranges, marker, markerLabel, ghost, ticks, unit = '' }) => {
      const X = v => Math.min(v, max) / max * W, gh = 20;
      return `<div class="zbul"><div class="zkpi"><div class="zlab">${label}<small>${sub}</small></div><div class="zval">${shown}</div></div>
      <svg width="${W}" height="52" viewBox="0 0 ${W} 52">
        ${ranges.map(([a, b, r]) => `<rect x="${X(a).toFixed(1)}" y="0" width="${(X(b) - X(a)).toFixed(1)}" height="${gh}" fill="var(--${r})"/>`).join('')}
        <rect x="0" y="6" width="${X(value).toFixed(1)}" height="8" fill="var(--ink)"/>
        ${ghost != null ? `<circle cx="${X(ghost).toFixed(1)}" cy="10" r="4" fill="none" stroke="var(--ink)" stroke-width="1.5"/>` : ''}
        <line x1="${X(marker)}" x2="${X(marker)}" y1="2" y2="${gh - 2}" stroke="var(--ink)" stroke-width="2"/>
        ${ticks.map(v => `<line x1="${X(v)}" x2="${X(v)}" y1="${gh}" y2="${gh + 4}" stroke="var(--faint)"/><text x="${X(v)}" y="${gh + 15}" text-anchor="${v === 0 ? 'start' : v === max ? 'end' : 'middle'}">${num(v)}${v === max ? unit : ''}</text>`).join('')}
        ${ranges.map(([a, b, , name], i) => `<text class="zrn${i === ranges.findIndex(([a2, b2]) => value >= a2 && value < b2) ? ' zon' : ''}" x="${((X(a) + X(b)) / 2).toFixed(1)}" y="${gh + 30}" text-anchor="middle">${name}</text>`).join('')}
      </svg></div>`;
    };
    const list = arr => arr.map(w => `<b>${esc(w.root)}</b>${w.freq > 1 ? ` <em>×${w.freq}</em>` : ''}`).join(', ');
    const sp = sparkPath(T.history, 150, 22);
    return `
      <div class="zh"><span>This text</span><span>${esc(T.title)} · ${num(T.run.total)} words</span></div>
      ${bullet({ label: 'New words per 100', sub: 'Every repeat counts as a tap', value: T.per100, shown: r0(T.per100), max: 25, ghost: T.openedPer100, marker: S.limit,
        ranges: [[0, S.usual, 'r4', 'Easy for you'], [S.usual, S.limit, 'r3', 'Usual'], [S.limit, 25, 'r1', 'Where you stopped']], ticks: [0, 5, 10, 15, 20, 25] })}
      ${bullet({ label: 'Taps in this text', sub: `${Spell(T.ahead)} still ahead of you`, value: T.taps, shown: T.taps, max: 130, marker: S.mostTaps,
        ranges: [[0, S.usualTaps, 'r4', 'Easy'], [S.usualTaps, S.mostTaps, 'r3', 'Usual'], [S.mostTaps, 130, 'r1', 'Where you stopped']], ticks: [0, 25, 50, 75, 100, 130] })}
      <div class="zkey">
        <span><svg width="10" height="8"><rect width="10" height="8" fill="var(--ink)"/></svg>Now</span>
        <span><svg width="10" height="10"><circle cx="5" cy="5" r="4" fill="none" stroke="var(--ink)" stroke-width="1.5"/></svg>Opened, ${r0(T.openedPer100)}</span>
        <span><svg width="2" height="12"><rect width="2" height="12" fill="var(--ink)"/></svg>Most you’ve finished</span>
      </div>
      <table>
        <tr><td class="zl"><span class="zdot" style="background:${COL.u}"></span>New</td><td class="zn">${T.uniq.u}</td><td class="zw">${list(T.newWords)}</td></tr>
        <tr><td class="zl"><span class="zdot" style="background:${COL.l}"></span>Learning</td><td class="zn">${T.uniq.l}</td><td class="zw">${list(T.learning)}</td></tr>
      </table>
      <div class="znote2">Ranges come from your last ${S.log.length} texts: ${S.fin.length} finished, ${S.stop.length} stopped.</div>
      <div class="zh" style="margin-top:12px;border-top:1px solid var(--hairline)"><span>Your vocabulary</span><span>since ${day(T.history[0].d)}</span></div>
      <div class="zvrow"><span class="zl">Words you know</span>
        <svg width="150" height="22" viewBox="0 0 150 22"><path d="${sp.d}" fill="none" stroke="var(--dim)" stroke-width="1.5" stroke-linejoin="round"/><circle cx="${sp.end[0]}" cy="${sp.end[1]}" r="2.5" fill="var(--ink)"/></svg>
        <span class="zv">${num(T.vocab)}</span></div>
      <a class="zmore">All statistics</a>`;
  },
};

/* ───────────────────────────── Edward Tufte ───────────────────────────── */
const tufte = {
  id: 'tufte', cls: 'mk-tufte', data: 'A', designer: 'Edward Tufte', name: 'Word-sized graphics, compared to what you finish',
  css: css1.tufte + `
.mk-tufte svg text.zlim{font-style:italic;fill:var(--dim)}
.mk-tufte .zhero .zfig{font-size:56px}
`,
  html(T, S) {
    const v = verdict(T.per100, S);
    const words = arr => arr.map(w => `<i>${esc(w.root)}</i>${w.freq > 1 ? `<sub>${w.freq}</sub>` : ''}`).join('<span class="zs">·</span>');
    const sp = sparkPath(T.history, 104, 16);
    return `
      <div class="ztop"><span class="zsc">${esc(T.title)}</span><i>${num(T.run.total)} words, ${num(T.uniq.total)} different</i></div>
      <div class="zhero"><span class="zfig">${T.taps}</span><span class="zcap">new words to tap<i>one in every ${r0(T.every)} words</i></span></div>
      <p class="zlede">Down from ${T.openedTaps} when you opened it; ${spell(T.ahead)} are still ahead of you. At ${r0(T.per100)} in every hundred words it is lighter than ${v.lighter} of the ${S.fin.length} texts you have finished.</p>
      <div class="zsub"><span class="zsc">Your last ${S.log.length} texts</span><i style="font-size:12.5px;color:var(--faint)">• finished &nbsp;× stopped &nbsp;◆ this one</i></div>
      ${rug(S, T, { font: 'var(--font-read)', tone: 'var(--dim)' })}
      <div class="zsub" style="margin-top:14px"><span class="zsc">The text, word by word</span><i style="font-size:12.5px;color:var(--faint)">tall marks are taps</i></div>
      ${wordStrip(T)}
      <table>
        <tr><th class="zsc"><s style="background:${COL.u}"></s>new</th><td>${words(T.newWords)}</td></tr>
        <tr><th class="zsc"><s style="background:${COL.l}"></s>learning</th><td>${words(T.learning)}</td></tr>
      </table>
      <div class="zrule"></div>
      <div class="zvocab"><span class="zsc" style="font-size:14px">vocabulary</span><b>${num(T.vocab)}</b>
        <svg width="104" height="16" viewBox="0 0 104 16"><path d="${sp.d}" fill="none" stroke="var(--dim)" stroke-width="1" stroke-linejoin="round"/><circle cx="${sp.end[0]}" cy="${sp.end[1]}" r="2.25" fill="var(--c-unknown)"/></svg>
        <i>+${num(T.history[T.history.length - 1].k - T.history[0].k)} since ${day(T.history[0].d)}</i></div>
      <a class="zmore">All statistics</a>`;
  },
};

/* ───────────────────────────── Nicholas Felton ───────────────────────────── */
const felton = {
  id: 'felton', cls: 'mk-felton', data: 'A', designer: 'Nicholas Felton', name: 'The reading report, in taps',
  css: css1.felton + `
.mk-felton .zchart{margin-top:16px;padding-top:9px;border-top:1px solid var(--hairline)}
.mk-felton .zchart .zcap{display:flex;justify-content:space-between;margin-bottom:8px}
.mk-felton .zfoot3{display:grid;grid-template-columns:repeat(3,1fr);margin-top:18px;padding-top:10px;border-top:1.5px solid var(--ink)}
.mk-felton .zfoot3 > div + div{padding-left:12px;border-left:1px solid var(--hairline)}
.mk-felton .zfoot3 b{display:block;font-size:30px;font-weight:200;line-height:1;letter-spacing:-.02em;margin-bottom:6px}
`,
  html(T, S) {
    const today = day(T.history[T.history.length - 1].d, { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase();
    const all = [...S.log.map(t => ({ v: t.per100, done: t.done })), { v: T.per100, cur: true }];
    const max = 25, H = 46, bw = 13, gap = (W - all.length * bw) / (all.length - 1);
    const Y = v => H - Math.min(v, max) / max * H;
    const bars = all.map((t, i) => {
      const x = i * (bw + gap), y = Y(t.v), h = H - y;
      if (t.cur) return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${bw}" height="${h.toFixed(1)}" fill="var(--c-unknown)"/><text x="${(x + bw / 2).toFixed(1)}" y="${(y - 4).toFixed(1)}" text-anchor="middle">NOW</text>`;
      return t.done ? `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${bw}" height="${h.toFixed(1)}" fill="var(--dim)" opacity=".5"/>`
        : `<rect x="${(x + .75).toFixed(1)}" y="${(y + .75).toFixed(1)}" width="${bw - 1.5}" height="${(h - 1.5).toFixed(1)}" fill="none" stroke="var(--dim)" stroke-width="1.5"/>`;
    }).join('');
    const chart = `<svg width="${W}" height="${H + 16}" viewBox="0 -12 ${W} ${H + 16}" role="img" aria-label="New words per 100 in your last ${S.log.length} texts and this one">
      <line x1="0" x2="${W}" y1="${Y(S.limit).toFixed(1)}" y2="${Y(S.limit).toFixed(1)}" stroke="var(--ink)" stroke-width="1"/>
      ${bars}<line x1="0" x2="${W}" y1="${H}" y2="${H}" stroke="var(--dim)" stroke-width="1"/></svg>`;
    const rows = T.newWords.map(w => `<div class="zrow"><span>${esc(w.root)}</span><span>${w.freq}</span></div>`);
    const half = Math.ceil(rows.length / 2);
    return `
      <div class="ztop zcap"><span>${esc(T.title)}</span><span>${today}</span></div>
      <div class="zhero"><span class="zfig">${T.ahead}</span><div><div class="zv">Taps ahead</div><div class="zcap">Of ${T.taps} in the text<br>one every ${r0(T.every)} words</div></div></div>
      <div class="ztiles">
        <div class="ztile"><b>${r0(T.per100)}</b><i style="background:var(--ink)"></i><div class="zcap">New words<br>per 100</div></div>
        <div class="ztile"><b>−${T.openedTaps - T.taps}</b><i style="background:var(--ink)"></i><div class="zcap">Taps since<br>you opened it</div></div>
        <div class="ztile"><b>${T.uniq.u}</b><i style="background:${COL.u}"></i><div class="zcap">Words to<br>learn</div></div>
      </div>
      <div class="zchart"><div class="zcap"><span>Your last ${S.log.length} texts, new words per 100</span><span>Limit ${r0(S.limit)}</span></div>${chart}
        <div class="zcap" style="margin-top:6px">Solid: finished · Outline: stopped</div></div>
      <div class="zlist"><div class="zcap"><span>The new words</span><span>Uses</span></div>
        <div>${rows.slice(0, half).join('')}</div><div>${rows.slice(half).join('')}</div></div>
      <div class="zfoot3">
        <div><b>${S.fin.length}</b><div class="zcap">Texts<br>finished</div></div>
        <div><b>${S.stop.length}</b><div class="zcap">Texts<br>stopped</div></div>
        <div><b>${num(T.vocab)}</b><div class="zcap">Words<br>known</div></div>
      </div>
      <a class="zmore">Full report</a>`;
  },
};

/* ───────────────────────────── Isotype ───────────────────────────── */
const isotype = {
  id: 'isotype', cls: 'mk-iso', data: 'A', designer: 'Otto & Marie Neurath, Gerd Arntz (Isotype)', name: 'Count the taps',
  css: css1.isotype + `
.mk-iso .zgrids{display:grid;grid-template-columns:repeat(3,1fr);gap:0 14px;margin-top:6px}
.mk-iso .zgrids figure{margin:0}
.mk-iso .zgrids figcaption{margin-top:7px;font-size:12px;line-height:1.3;color:var(--dim)}
.mk-iso .zgrids figcaption b{display:block;font-size:22px;line-height:1.05;color:var(--ink);font-weight:700}
.mk-iso .zshelf{display:flex;justify-content:space-between;align-items:baseline;font-size:12.5px;color:var(--ui);margin:18px 0 6px;padding-top:12px;border-top:1px solid var(--hairline)}
`,
  html(T, S) {
    const SZ = 8, G = 2.35;
    const grid = (counts) => {
      const order = [...Array(counts.k).fill('k'), ...Array(counts.l).fill('l'), ...Array(counts.i).fill('i'), ...Array(counts.u).fill('u')];
      const w = 10 * SZ + 9 * G;
      return `<svg width="${w.toFixed(1)}" height="${w.toFixed(1)}" viewBox="0 0 ${w.toFixed(1)} ${w.toFixed(1)}">${order.map((c, n) => {
        const x = (n % 10) * (SZ + G), y = Math.floor(n / 10) * (SZ + G);
        return c === 'i' ? `<rect x="${(x + .6).toFixed(1)}" y="${(y + .6).toFixed(1)}" width="${SZ - 1.2}" height="${SZ - 1.2}" rx="1.5" fill="none" stroke="var(--c-ignored)" stroke-width="1.2"/>`
          : `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${SZ}" height="${SZ}" rx="1.5" fill="${c === 'k' ? 'var(--dim)' : COL[c]}"${c === 'k' ? ' opacity=".55"' : ''}/>`;
      }).join('')}</svg>`;
    };
    const per100 = (u, l, i) => { const U = r0(u), L = r0(l), I = r0(i); return { u: U, l: L, i: I, k: 100 - U - L - I }; };
    const tot = T.run.total;
    const opened = per100(T.openedTaps / tot * 100, (T.run.l - 5) / tot * 100, 0);
    const now = per100(T.run.u / tot * 100, T.run.l / tot * 100, T.run.i / tot * 100);
    const limit = per100(S.limit, 0, 0);
    const doc = (x, done) => done
      ? `<rect x="${x}" y="0" width="10" height="13" rx="1.5" fill="var(--dim)" opacity=".7"/>`
      : `<rect x="${x + .6}" y=".6" width="8.8" height="11.8" rx="1.5" fill="none" stroke="var(--dim)" stroke-width="1.2"/>`;
    const docs = S.log.map((t, n) => doc(n * 15 + Math.floor(n / 5) * 5, t.done)).join('');
    return `
      <h3>Every 100 words of ${esc(T.title)}</h3>
      <div class="zsub">One sign is one word. Pink signs are taps.</div>
      <div class="zgrids">
        <figure>${grid(opened)}<figcaption><b>${opened.u}</b>when you opened it</figcaption></figure>
        <figure>${grid(now)}<figcaption><b>${now.u}</b>now</figcaption></figure>
        <figure>${grid(limit)}<figcaption><b>${limit.u}</b>the most you’ve finished</figcaption></figure>
      </div>
      <div class="zkey">
        <span><svg width="10" height="8"><rect width="8" height="8" rx="1.5" fill="var(--dim)" opacity=".55"/></svg>known</span>
        <span><svg width="10" height="8"><rect width="8" height="8" rx="1.5" fill="var(--c-learning)"/></svg>learning</span>
        <span><svg width="10" height="8"><rect width="8" height="8" rx="1.5" fill="var(--c-unknown)"/></svg>new: a tap</span>
        <span><svg width="10" height="8"><rect x=".6" y=".6" width="6.8" height="6.8" rx="1.5" fill="none" stroke="var(--c-ignored)" stroke-width="1.2"/></svg>name</span>
      </div>
      <p class="zsay">The pink signs are <b>${spell(T.uniq.u)} words</b>, ${spell(T.ahead)} of them still ahead of you:</p>
      ${chips(T.newWords)}
      <div class="zshelf"><span>Your last ${S.log.length} texts · one sign is one text</span><b>${S.fin.length} finished</b></div>
      <svg width="${W}" height="13" viewBox="0 0 ${W} 13">${docs}</svg>
      <a class="zmore">All statistics</a>`;
  },
};

/* ───────────────────────────── Stefanie Posavec ───────────────────────────── */
const posavec = {
  id: 'posavec', cls: 'mk-posa', data: 'A', designer: 'Stefanie Posavec', name: 'Where the taps fall, and your shelf',
  css: css1.posavec + `
.mk-posa svg text.zsh{font-family:var(--font-ui);font-style:normal;font-size:10px;fill:var(--faint)}
`,
  html(T, S) {
    const U = 10.6, GAPW = 1.6, PITCH = 6.2, PGAP = 4.6, LX = 12;
    const rowsY = []; let y = 4;
    T.sentences.forEach((s, i) => { if (i && s.p !== T.sentences[i - 1].p) y += PGAP; rowsY.push(y); y += PITCH; });
    const marks = [], labels = [];
    T.sentences.forEach((s, si) => {
      const yy = rowsY[si];
      s.words.forEach((w, j) => {
        const x = LX + j * U, st = w.st;
        marks.push(`<line x1="${(x + .8).toFixed(1)}" x2="${(x + U - GAPW).toFixed(1)}" y1="${yy}" y2="${yy}" stroke="${st === 'k' ? 'var(--dim)' : COL[st]}" stroke-width="${st === 'u' || st === 'l' ? 3.2 : 1.4}" stroke-linecap="round"${st === 'k' ? ' opacity=".5"' : st === 'i' ? ' stroke-dasharray="1.2 2.4"' : ''}/>`);
      });
      const nw = s.words.filter(w => w.st === 'u').map(w => w.w.toLowerCase());
      if (nw.length) labels.push({ y: yy, end: LX + s.words.length * U, text: nw.join(' · '), behind: s.words.every(w => w.st !== 'u' || w.i < T.pos) });
      if (s.words.some(w => w.i === T.pos)) marks.push(`<path d="M2 ${yy - 3.6} l5.5 3.6 l-5.5 3.6z" fill="var(--ink)"/>`);
    });
    const LCOL = LX + 19 * U + 14; let lastY = -99;
    const lab = labels.map(l => {
      const ty = Math.max(l.y + 3.8, lastY + 13); lastY = ty;
      return `<path d="M${l.end + 3} ${l.y} H${LCOL - 10} L${LCOL - 4} ${ty - 3.8}" fill="none" stroke="var(--hairline)" stroke-width="1"/><text x="${LCOL}" y="${ty}"${l.behind ? ' style="fill:var(--faint)"' : ''}>${esc(l.text)}</text>`;
    }).join('');
    const svgH = Math.max(y + 2, lastY + 4);
    const fp = `<svg width="${W}" height="${svgH}" viewBox="0 0 ${W} ${svgH}" role="img" aria-label="Sentences as lines; taps marked">${marks.join('')}${lab}</svg>`;
    // The shelf: each past text a line as tall as the text is long; dotted if you stopped.
    const all = [...S.log.map(t => ({ ...t })), { words: T.run.total, cur: true, done: true }];
    const SH = 46, maxW = Math.max(...all.map(t => t.words)), step = W / all.length;
    const shelf = all.map((t, i) => {
      const x = i * step + step / 2, h = Math.max(4, t.words / maxW * SH);
      if (t.cur) { const py = SH - h * (T.pos / T.run.total); return `<line x1="${x.toFixed(1)}" x2="${x.toFixed(1)}" y1="${SH}" y2="${(SH - h).toFixed(1)}" stroke="var(--c-unknown)" stroke-width="3" stroke-linecap="round"/><path d="M${(x - 9).toFixed(1)} ${(py - 3.5).toFixed(1)} l5.5 3.5 l-5.5 3.5z" fill="var(--ink)"/>`; }
      return `<line x1="${x.toFixed(1)}" x2="${x.toFixed(1)}" y1="${SH}" y2="${(SH - h).toFixed(1)}" stroke="var(--dim)" stroke-width="3" stroke-linecap="round"${t.done ? ' opacity=".55"' : ' stroke-dasharray="0.1 5" opacity=".9"'}/>`;
    }).join('');
    const legLine = (st, w = 3.2, extra = '') => `<svg width="22" height="6"><line x1="1" x2="21" y1="3" y2="3" stroke="${st === 'k' ? 'var(--dim)' : COL[st]}" stroke-width="${w}" stroke-linecap="round" ${extra}/></svg>`;
    return `
      <div class="zt"><b>${esc(T.title)}</b>, sentence by sentence</div>
      <div class="zhead"><span class="zfig">${T.taps}</span><span class="zcap">new words to tap · ${spell(T.ahead)} ahead of you<br><span>one in every ${r0(T.every)} words · ${T.openedTaps} when you opened it</span></span></div>
      <div style="height:8px"></div>
      ${fp}
      <div class="zlegend">
        <span>${legLine('k', 1.4, 'opacity=".5"')}known</span>
        <span>${legLine('u')}a tap: new</span>
        <span>${legLine('l')}learning</span>
        <span>${legLine('i', 1.4, 'stroke-dasharray="1.2 2.4"')}name, set aside</span>
      </div>
      <div class="zhow">Each line is a sentence; each dash, a word. Greyed labels are behind you. ▸ marks where you are.</div>
      <div class="zfoot"><svg width="${W}" height="${SH + 2}" viewBox="0 0 ${W} ${SH + 2}" role="img" aria-label="Your last texts, each as tall as it is long">${shelf}</svg>
        <div class="zlab"><span>Your last ${S.log.length} texts, each as tall as it is long; dotted where you stopped</span></div>
        <div class="zlab"><span>${S.fin.length} finished · ${S.stop.length} stopped</span><span><b>${num(T.vocab)}</b> words known</span></div></div>
      <a class="zmore">All statistics</a>`;
  },
};

/* ───────────────────────────── Julie Zhuo's cut ───────────────────────────── */
const zcss = css1.zhuo + `
.mk-zhuo .zv b{font-size:20px;line-height:1.25}
.mk-zhuo svg{display:block;overflow:visible;margin-top:10px}
.mk-zhuo svg text{font-family:var(--font-ui);font-size:10px;fill:var(--faint)}
.mk-zhuo svg text.zlim{fill:var(--dim)}
.mk-zhuo svg text.zit, .mk-zhuo svg text.zst{fill:var(--dim);font-size:10.5px}
.mk-zhuo .zcost{font-size:13px;color:var(--ui);margin-top:2px}
.mk-zhuo .zcost b{font-weight:600;color:var(--ink)}
.mk-zhuo .zcard h4 small{display:block;font-weight:400;font-size:12.5px;color:var(--dim);margin-top:3px}
.mk-zhuo .zacts{display:flex;gap:8px;margin-top:10px}
.mk-zhuo .zacts a{font-size:12.5px;font-weight:600;color:var(--ink);padding:5px 10px;border-radius:6px;background:var(--well);box-shadow:0 0 0 1px var(--control-line)}
.mk-zhuo .zacts a.zp{background:var(--primary);box-shadow:0 0 0 1px var(--primary-line)}
.mk-zhuo .zchips span.zname i{background:var(--c-ignored)}
.mk-zhuo .zchips span.zname em{font-style:normal}
.mk-zhuo .zpass{display:flex;justify-content:space-between;align-items:baseline;gap:10px;font-size:12.5px;color:var(--dim);margin-top:12px;line-height:1.45}
.mk-zhuo .zpass a{color:var(--ink);text-decoration:underline;text-underline-offset:2px;white-space:nowrap}
.mk-zhuo .zcal{margin-top:14px;font-size:12.5px;color:var(--dim);line-height:1.45}
.mk-zhuo .zmeter{display:grid;grid-template-columns:repeat(10,1fr);gap:3px;margin:7px 0 0}
.mk-zhuo .zmeter i{height:5px;border-radius:2px;background:var(--well);box-shadow:inset 0 0 0 1px var(--hairline)}
.mk-zhuo .zmeter i.zon{background:var(--ink);box-shadow:none}
`;
const nextCard = (T, ahead) => `
        <div class="znext" style="margin-top:${ahead ? 11 : 0}px;${ahead ? '' : 'border-top:0;padding-top:0'}"><span>Next new word: <b>${esc(T.next.w)}</b>, ${T.next.sentencesOn === 0 ? 'in the first sentence' : `${spell(T.next.sentencesOn)} sentences on`}</span><a>Go to it</a></div>`;

const zhuo = {
  id: 'zhuo', cls: 'mk-zhuo', data: 'A', designer: 'Julie Zhuo’s cut', name: 'Calibrated: compared with your own texts',
  css: zcss,
  html(T, S) {
    const v = verdict(T.per100, S), ahead = aheadWords(T), passed = passedForms(T);
    const uniqPassed = [...new Set(passed)];
    return `
      <div class="zh">This text</div>
      <div class="zv"><b>${v.text}</b></div>
      ${rug(S, T, { labels: true })}
      <p class="zcost"><b>${r0(T.per100)} new words per 100</b> · ${spell(T.ahead)} taps left · you finish texts up to about ${r0(S.limit)}</p>
      <div class="zcard">
        <h4>${Spell(T.ahead)} new words ahead<small>Each one is a tap; mark the ones you know as you go.</small></h4>
        ${chips(ahead)}
        ${nextCard(T, true)}
      </div>
      <p class="zpass"><span>You read past ${uniqPassed.map(w => `<b style="font-weight:600;color:var(--ink)">${esc(w)}</b>${passed.filter(x => x === w).length > 1 ? ' (twice)' : ''}`).join(' and ')} without tapping. Know ${uniqPassed.length > 1 ? 'them' : 'it'}?</span><a>Mark known</a></p>
      <p class="zalso"><i></i>Learning here: <b>${T.learning.map(w => esc(w.root)).join(', ')}</b></p>
      <div class="zdoor"><span>Your reading and progress</span><span>→</span></div>`;
  },
};

const zhuoFirst = {
  id: 'zhuo-first', cls: 'mk-zhuo', data: 'A', designer: 'Julie Zhuo’s cut', name: 'Before there is a reading log',
  css: zcss,
  html(T, S) {
    const ahead = aheadWords(T);
    return `
      <div class="zh">This text</div>
      <div class="zv"><b>${T.taps} new words, one every ${r0(T.every)}</b></div>
      <p class="zcost">${Spell(T.ahead)} are still ahead of you. ${T.openedTaps} when you opened it.</p>
      ${wordStrip(T, { label: 'you are here', italic: false })}
      <div class="zcard">
        <h4>${Spell(T.ahead)} taps ahead<small>Each tall mark above is one. Mark the ones you know as you go.</small></h4>
        ${chips(ahead)}
        ${nextCard(T, true)}
      </div>
      <div class="zcal">Tinta learns how much tapping suits you from the texts you finish. After ten, it can tell you how a text compares.
        <div class="zmeter">${Array.from({ length: 10 }, () => '<i></i>').join('')}</div></div>
      <p class="zalso"><i></i>Learning here: <b>${T.learning.map(w => esc(w.root)).join(', ')}</b></p>
      <div class="zdoor"><span>Your reading and progress</span><span>→</span></div>`;
  },
};

const zhuoDense = {
  id: 'zhuo-dense', cls: 'mk-zhuo', data: 'M', designer: 'Julie Zhuo’s cut', name: 'A dense text, with the fix pushed',
  css: zcss,
  html(T, S) {
    const v = verdict(T.per100, S);
    const names = T.newWords.filter(r => r.name);
    const repeat = T.newWords.filter(r => !r.name).sort((a, b) => b.freq - a.freq)[0];
    const saved = names.reduce((s, r) => s + r.freq, 0) + repeat.freq;
    const after = (T.taps - saved) / T.run.total * 100;
    const va = verdict(after, S);
    return `
      <div class="zh">This text</div>
      <div class="zv"><b>${v.text}</b></div>
      ${rug(S, T, { labels: true, showOpened: false })}
      <p class="zcost"><b>${r0(T.per100)} new words per 100</b> · ${T.taps} taps · you finish texts up to about ${r0(S.limit)}</p>
      <div class="zcard">
        <h4>Set aside ${spell(names.length)} names and learn <i>${esc(repeat.root)}</i> first: ${saved} fewer taps<small>That brings it to ${r0(after)} per 100, ${va.key === 'over' ? 'still denser than you usually read' : 'like the texts you usually finish'}.</small></h4>
        <div class="zchips">${names.map(r => `<span class="zname"><i></i>${esc(r.form)} <em>×${r.freq} · name</em></span>`).join('')}<span><i></i>${esc(repeat.root)} <em>×${repeat.freq}</em></span></div>
        <div class="zacts"><a class="zp">Set names aside</a><a>Learn ${esc(repeat.root)}</a></div>
        ${nextCard(T, true)}
      </div>
      <p class="zalso"><i></i>Learning here: <b>${T.learning.map(w => esc(w.root)).join(', ')}</b></p>
      <div class="zdoor"><span>Your reading and progress</span><span>→</span></div>`;
  },
};

export const designs2 = [few, tufte, felton, isotype, posavec, zhuo, zhuoFirst, zhuoDense];
