// Five sidebar Stats designs, rendered to static HTML/SVG strings in Node and
// injected into the running app by shoot.mjs. Colours come from the app's own
// CSS tokens (var(--ink), var(--c-unknown), ...), so the app's light and dark
// themes apply to the mockups exactly as they apply to the app.
import fs from 'node:fs';

const DATA = '/home/user/tinta-blind-work/data';

// ---------------------------------------------------------------- data
export function buildData(slug = 'tortuga') {
  const m = JSON.parse(fs.readFileSync(`${DATA}/mock-data.json`, 'utf8'));
  const series = JSON.parse(fs.readFileSync(`${DATA}/coverage-by-day.json`, 'utf8'));
  const t = m.texts[slug];
  const p = m.persona;
  const title = t.title;
  const textSeries = series.filter(s => s.stage !== 'before').map(s => ({ d: s.date, v: s.texts[title] }));
  const paras = [];
  for (const tok of t.tokens) {
    (paras[tok.p] ??= { n: 0, k: 0, l: 0, u: 0 });
    paras[tok.p].n++;
    paras[tok.p][tok.s === 'k' ? 'k' : tok.s === 'l' ? 'l' : 'u']++;
  }
  const hist = p.history;
  // Gains per active day (the first day is the Top 500 import).
  const gains = hist.map((h, i) => ({ d: h.d, g: i === 0 ? h.k : h.k - hist[i - 1].k, first: i === 0 }));
  const weeks = 8; // 18 Aug to 13 Oct
  const avgWeek = Math.round((hist.at(-1).k - hist[0].k) / ((Date.parse('2026-10-13') - Date.parse(hist[0].d)) / 864e5 / 7));
  const at = (iso) => { let v = null; for (const h of hist) if (h.d <= iso) v = h; return v; };
  return {
    slug, title, author: slug === 'tortuga' ? 'Horacio Quiroga' : slug === 'quijote' ? 'Miguel de Cervantes' : 'Tinta',
    total: t.total, c: t.counts, uni: t.unique, pct: t.headline,
    oneIn: t.one_in, repeated: t.repeated_new, repTokens: t.repeated_tokens, after: t.after_repeated_pct,
    newWords: t.new_words, learningWords: t.learning_words, tokens: t.tokens, paras,
    series: textSeries, firstPct: textSeries[0].v,
    level: 'A2',
    known: p.known, learning: p.learning, gain7: p.gain_7, gainPrev7: p.gain_prev_7, avgWeek,
    active7: p.active_7, activeAll: p.active_all, daysAll: p.days_all, todayGain: p.today_gain,
    hist, gains, weeks,
    fortnights: ['2026-08-18', '2026-09-01', '2026-09-15', '2026-09-29', '2026-10-13'].map(d => ({ d, k: at(d).k })),
    library: m.library,
  };
}

// ---------------------------------------------------------------- helpers
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fmt = (n) => Number(n).toLocaleString('en-US');
const f1 = (n) => (Math.round(n * 10) / 10).toFixed(1).replace(/\.0$/, '');
const dShort = (iso) => { const d = new Date(iso + 'T12:00:00Z'); return `${d.getUTCDate()} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getUTCMonth()]}`; };
export function verdict(pct, level = 'A2', total = 0) {
  if (pct >= 98) return { key: 'easy', label: 'Easy', line: 'Read it straight through.' };
  if (pct >= 95) return { key: 'comfortable', label: 'Comfortable', line: 'A lookup now and then.' };
  if (level === 'A1' && total <= 200) return { key: 'stretch', label: 'Short enough to work through', line: 'Any share is manageable in a short text.' };
  if (pct >= 60) return { key: 'stretch', label: 'Readable with lookups', line: `${level} readers manage from about 60% known when every word is one tap away.` };
  return { key: 'hard', label: 'Hard going', line: `Below the 60% that ${level} readers find workable.` };
}
// Sparkline path over a series of {x, y} already in pixel space.
const path = (pts) => pts.map((q, i) => `${i ? 'L' : 'M'}${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(' ');
function sparkPts(values, w, h, pad = 1.5, lo = Math.min(...values), hi = Math.max(...values)) {
  const n = values.length;
  return values.map((v, i) => [pad + (i / (n - 1)) * (w - 2 * pad), pad + (1 - (v - lo) / (hi - lo || 1)) * (h - 2 * pad)]);
}
// History as a time series in days since start (gaps stay gaps on the x axis).
function histPts(hist, w, h, pad = 1.5, key = 'k') {
  const t0 = Date.parse(hist[0].d), t1 = Date.parse(hist.at(-1).d);
  const vals = hist.map(x => x[key]);
  const lo = Math.min(...vals), hi = Math.max(...vals);
  return hist.map(x => [pad + ((Date.parse(x.d) - t0) / (t1 - t0)) * (w - 2 * pad), pad + (1 - (x[key] - lo) / (hi - lo)) * (h - 2 * pad)]);
}
const footLink = (label = 'All your statistics') => `<a class="mp-more" href="#stats">${label}<span aria-hidden="true"> →</span></a>`;

// ================================================================ 1. TUFTE
export function tufte(D) {
  const W = 368;
  const v = verdict(D.pct, D.level, D.total);
  // Composition bar with thresholds (range-frame ticks only where the reader needs them).
  const seg = [['k', D.c.k, 'var(--band-k)'], ['l', D.c.l, 'var(--band-l)'], ['u', D.c.u, 'var(--c-unknown)']];
  let x = 0; const bars = [];
  for (const [k, n, col] of seg) { if (!n) continue; const w = (n / D.total) * W; bars.push(`<rect x="${x.toFixed(1)}" y="3" width="${Math.max(1, w - 1).toFixed(1)}" height="5" fill="${col}"/>`); x += w; }
  const tick = (p, lab, anchor = 'middle', dy = 0) => `<line x1="${(p / 100 * W).toFixed(1)}" x2="${(p / 100 * W).toFixed(1)}" y1="10" y2="14" stroke="var(--dim)" stroke-width="1"/>` + (lab ? `<text x="${(p / 100 * W + dy).toFixed(1)}" y="24" text-anchor="${anchor}">${lab}</text>` : '');
  const comp = `<svg class="tf-comp" viewBox="0 0 ${W} 27" width="${W}" height="27" aria-hidden="true">${bars.join('')}${tick(60, '60 · workable at A2')}${tick(95, '')}${tick(98, '95 · 98', 'end', 7)}</svg>`;
  // Small multiples: each paragraph as a row of ticks, one per running word,
  // all on the same scale, so a row is as long as its paragraph.
  const maxN = Math.max(...D.paras.map(P => P.n));
  const rowW = W - 58, per = rowW / maxN, rowH = 17;
  const rowsSvg = D.paras.map((P, pi) => {
    const toks = D.tokens.filter(t => t.p === pi);
    const y0 = pi * rowH + 13;
    const ticks = toks.map((tk, i) => {
      const h = tk.s === 'u' ? 11 : tk.s === 'l' ? 7 : 3;
      const col = tk.s === 'u' ? 'var(--c-unknown)' : tk.s === 'l' ? 'var(--band-l)' : 'var(--dim)';
      return `<rect x="${(22 + i * per).toFixed(2)}" y="${y0 - h}" width="${Math.max(1, per - 1.1).toFixed(2)}" height="${h}" fill="${col}"${tk.s === 'k' ? ' opacity=".5"' : ''}/>`;
    }).join('');
    return `<text x="0" y="${y0}" class="tf-pl">¶${pi + 1}</text>${ticks}<text x="${W}" y="${y0}" text-anchor="end" class="tf-n">${Math.round(P.k / P.n * 100)}%</text>`;
  }).join('');
  const strip = `<svg class="tf-strip" viewBox="0 0 ${W} ${D.paras.length * rowH + 2}" width="${W}" height="${D.paras.length * rowH + 2}" aria-hidden="true">${rowsSvg}</svg>`;
  // This text over the weeks (sparkline), and words known (sparkline).
  const sv = D.series.map(s => s.v);
  const sp1 = sparkPts(sv, 92, 16, 2);
  const spark1 = `<svg class="tf-spark" viewBox="0 0 92 16" width="92" height="16" aria-hidden="true"><path d="${path(sp1)}" fill="none" stroke="var(--dim)" stroke-width="1"/><circle cx="${sp1[0][0]}" cy="${sp1[0][1]}" r="1.6" fill="var(--dim)"/><circle cx="${sp1.at(-1)[0]}" cy="${sp1.at(-1)[1]}" r="2.2" fill="var(--c-unknown)"/></svg>`;
  const hp = histPts(D.hist, 92, 16, 2);
  const spark2 = `<svg class="tf-spark" viewBox="0 0 92 16" width="92" height="16" aria-hidden="true"><path d="${path(hp)}" fill="none" stroke="var(--dim)" stroke-width="1"/><circle cx="${hp[0][0]}" cy="${hp[0][1]}" r="1.6" fill="var(--dim)"/><circle cx="${hp.at(-1)[0]}" cy="${hp.at(-1)[1]}" r="2.2" fill="var(--c-unknown)"/></svg>`;
  // Small multiple: where this text sits among the reader's texts.
  const lo = 70, hi = 100, sx = (p) => 6 + (p - lo) / (hi - lo) * (W - 12);
  const dots = D.library.map(b => { const me = b.title === D.title; return `<circle cx="${sx(b.pct).toFixed(1)}" cy="9" r="${me ? 3.6 : 2.6}" fill="${me ? 'var(--ink)' : 'none'}" stroke="${me ? 'var(--ink)' : 'var(--dim)'}" stroke-width="1"/>`; }).join('');
  const minT = D.library.at(-1), maxT = D.library[0];
  const libsvg = `<svg class="tf-lib" viewBox="0 0 ${W} 30" width="${W}" height="30" aria-hidden="true"><line x1="${sx(lo)}" x2="${sx(hi)}" y1="9" y2="9" stroke="var(--hairline)"/><line x1="${sx(95)}" x2="${sx(95)}" y1="3" y2="15" stroke="var(--dim)" stroke-dasharray="1.5 1.5"/><text x="${sx(95)}" y="0" text-anchor="middle">95</text>${dots}<text x="${sx(minT.pct)}" y="26" text-anchor="start">${minT.pct} Quijote</text><text x="${sx(D.pct)}" y="26" text-anchor="middle" class="tf-me">${D.pct} this text</text><text x="${sx(95) - 3}" y="26" text-anchor="end"></text><text x="${sx(maxT.pct)}" y="26" text-anchor="end">La cena ${maxT.pct}</text></svg>`;
  const words = D.repeated.map(r => `<span class="tf-w">${esc(r.word)}</span>&#8201;<span class="tf-c">${r.count}</span>`).join(', ');
  return `
<div class="mp mp-tufte">
  <div class="tf-h">Can I read this?</div>
  <p class="tf-lead"><b>${D.pct}%</b> of the running words are known, <span class="tf-v">${v.label.toLowerCase()}</span> for an ${D.level} reader.</p>
  ${comp}
  <p class="tf-body">About one word in ${D.oneIn} is new: ${D.c.u} lookups in ${D.total} words. Reading without help usually takes 95 to 98 per cent.</p>
  <div class="tf-sub">Where the new words fall, paragraph by paragraph (one tick per word; tall ticks are new):</div>
  ${strip}
  <div class="tf-h">What will help most?</div>
  <p class="tf-body">Seven new words come back: ${words}. Learning them would lift this text to <b>${D.after}%</b>.</p>
  <div class="tf-h">Am I getting better?</div>
  <p class="tf-body tf-row">This text: <b>${D.firstPct}%</b> known on ${dShort(D.series[0].d)} ${spark1} <b>${D.pct}%</b> today.</p>
  <p class="tf-body tf-row">Words known: <b>${fmt(D.hist[0].k)}</b> ${spark2} <b>${fmt(D.known)}</b>, +${D.gain7} this week (${D.avgWeek} a week on average).</p>
  <p class="tf-note">Your ${D.library.length} texts, by share known:</p>
  ${libsvg}
  ${footLink()}
</div>`;
}

// ================================================================ 2. FEW
export function few(D) {
  const W = 368, v = verdict(D.pct, D.level, D.total);
  const X = (p) => (p / 100) * W;
  const ranges = [[0, 60, 'var(--few-r1)'], [60, 95, 'var(--few-r2)'], [95, 98, 'var(--few-r3)'], [98, 100, 'var(--few-r4)']];
  const rr = ranges.map(([a, b, c]) => `<rect x="${X(a).toFixed(1)}" y="6" width="${(X(b) - X(a)).toFixed(1)}" height="26" fill="${c}"/>`).join('');
  const ticks = [0, 20, 40, 60, 80, 100].map(t => `<line x1="${X(t)}" x2="${X(t)}" y1="32" y2="36" stroke="var(--dim)"/><text x="${Math.min(W - 1, Math.max(1, X(t)))}" y="48" text-anchor="${t === 0 ? 'start' : t === 100 ? 'end' : 'middle'}">${t}${t === 100 ? '%' : ''}</text>`).join('');
  const bullet = `<svg class="fw-bullet" viewBox="0 0 ${W} 52" width="${W}" height="52" role="img" aria-label="${D.pct}% known; ranges for ${D.level}: under 60 hard, 60 to 95 readable with lookups, 95 to 98 comfortable, 98 and up easy; target 95">${rr}<rect x="0" y="15" width="${X(D.pct).toFixed(1)}" height="8" fill="var(--ink)"/><rect x="${(X(95) - 1).toFixed(1)}" y="10" width="2" height="18" fill="var(--ink)"/>${ticks}</svg>`;
  const maxC = Math.max(...D.repeated.map(r => r.count));
  const rows = D.repeated.map(r => `<div class="fw-brow"><span class="fw-w">${esc(r.word)}</span><span class="fw-bar"><i style="width:${(r.count / maxC * 100).toFixed(1)}%"></i></span><span class="fw-n">${r.count}</span><span class="fw-g">${esc(r.gloss.split(/[;,]/)[0])}</span></div>`).join('');
  // Week: words added vs average (mini bullet), days read, total with sparkline.
  const wb = (val, avg, max) => `<svg viewBox="0 0 150 14" width="150" height="14" aria-hidden="true"><rect x="0" y="1" width="150" height="12" fill="var(--few-r3)"/><rect x="0" y="4" width="${(val / max * 150).toFixed(1)}" height="6" fill="var(--ink)"/><rect x="${(avg / max * 150 - 1).toFixed(1)}" y="1" width="2" height="12" fill="var(--ink)"/></svg>`;
  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(Date.parse('2026-10-13') - (6 - i) * 864e5).toISOString().slice(0, 10); const on = D.hist.some(h => h.d === d); return `<i class="${on ? 'on' : ''}" title="${d}"></i>`; }).join('');
  const hp = histPts(D.hist, 150, 14, 1.5);
  const spark = `<svg viewBox="0 0 150 14" width="150" height="14" aria-hidden="true"><path d="${path(hp)}" fill="none" stroke="var(--dim)" stroke-width="1.2"/><circle cx="${hp.at(-1)[0]}" cy="${hp.at(-1)[1]}" r="2" fill="var(--ink)"/></svg>`;
  return `
<div class="mp mp-few">
  <div class="fw-h"><span>Can I read this?</span><span class="fw-t">${esc(D.title)}</span></div>
  <div class="fw-kpi"><span class="fw-big">${D.pct}%</span><span class="fw-kl">of running words known</span><span class="fw-chip fw-${v.key}">${v.label}</span></div>
  ${bullet}
  <div class="fw-legend"><span><i class="r1"></i>under 60 hard</span><span><i class="r2"></i>60–95 with lookups</span><span><i class="r3"></i>95–98 comfortable</span><span><i class="r4"></i>98+ easy</span><span><i class="tg"></i>target 95</span></div>
  <table class="fw-tab">
    <tr><td>New word uses</td><td>${D.c.u} <span>of ${D.total}</span></td><td>1 in ${D.oneIn}</td></tr>
    <tr><td>Different new words</td><td>${D.uni.u}</td><td>of ${D.uni.total}</td></tr>
    <tr><td>Learning words here</td><td>${D.uni.l}</td><td>${D.learningWords.map(w => esc(w.word)).join(', ')}</td></tr>
  </table>
  <div class="fw-h"><span>What will help most?</span><span class="fw-t">new words used twice or more</span></div>
  <div class="fw-bars">${rows}</div>
  <div class="fw-act"><span>Knowing these ${D.repeated.length} lifts this text to <b>${D.after}%</b></span><button class="btn" type="button">Add ${D.repeated.length} to Learning</button></div>
  <div class="fw-h"><span>Am I getting better?</span><span class="fw-t">last 7 days</span></div>
  <table class="fw-tab fw-week">
    <tr><td>Words known, added</td><td>${D.gain7}</td><td>${wb(D.gain7, D.avgWeek, 200)}</td></tr>
    <tr><td></td><td></td><td class="fw-cap">mark: your weekly average, ${D.avgWeek}</td></tr>
    <tr><td>Days you read</td><td>${D.active7} <span>of 7</span></td><td><span class="fw-days">${days}</span></td></tr>
    <tr><td>Words known</td><td>${fmt(D.known)}</td><td>${spark}</td></tr>
  </table>
  ${footLink()}
</div>`;
}

// ================================================================ 3. FELTON
export function felton(D) {
  const v = verdict(D.pct, D.level, D.total);
  const W = 368;
  // 262 words as a dot matrix, 27 columns, in reading order.
  const cols = 38, r = 2.6, step = 9.6;
  const rowsN = Math.ceil(D.total / cols);
  const dots = D.tokens.map((t, i) => { const cx = 4 + (i % cols) * step, cy = 4 + Math.floor(i / cols) * step; const col = t.s === 'u' ? 'var(--c-unknown)' : t.s === 'l' ? 'var(--band-l)' : 'var(--fe-k)'; return `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r}" fill="${col}"/>`; }).join('');
  const matrix = `<svg class="fe-matrix" viewBox="0 0 ${W} ${rowsN * step}" width="${W}" height="${rowsN * step}" aria-hidden="true">${dots}</svg>`;
  const list = D.repeated.map((rw, i) => `<div class="fe-li"><span class="fe-i">${String(i + 1).padStart(2, '0')}</span><span class="fe-w">${esc(rw.word)}</span><span class="fe-g">${esc(rw.gloss.split(/[;]/)[0])}</span><span class="fe-dots">${'<i></i>'.repeat(rw.count)}</span></div>`).join('');
  // Daily gains over the eight weeks; day 1 (the Top 500 import) is off scale.
  const t0 = Date.parse('2026-08-18'), nDays = 57, bw = W / nDays, base = 48, top = 18;
  const gmax = Math.max(...D.gains.filter(g => !g.first).map(g => g.g));
  const cols2 = D.gains.map(g => {
    const i = Math.round((Date.parse(g.d) - t0) / 864e5);
    if (g.first) return `<rect x="${(i * bw + 1.1).toFixed(1)}" y="${top - 6}" width="${(bw - 2.4).toFixed(1)}" height="${base - top + 6}" fill="none" stroke="var(--dim)" stroke-width="1" stroke-dasharray="2 1.5"/><text x="${(i * bw + bw + 3).toFixed(1)}" y="${top - 8}" class="fe-day1">DAY 1: ${fmt(g.g)} (TOP 500), OFF SCALE</text>`;
    const h = Math.max(1.5, g.g / gmax * (base - top));
    return `<rect x="${(i * bw + 0.6).toFixed(1)}" y="${(base - h).toFixed(1)}" width="${(bw - 1.4).toFixed(1)}" height="${h.toFixed(1)}" fill="${i >= nDays - 7 ? 'var(--ink)' : 'var(--fe-col)'}"/>`;
  }).join('');
  const weekBg = `<rect x="${((nDays - 7) * bw).toFixed(1)}" y="${top - 4}" width="${(7 * bw).toFixed(1)}" height="${base - top + 6}" fill="var(--fe-wk)"/><text x="${W}" y="${top - 8}" text-anchor="end">THIS WEEK</text>`;
  const chart = `<svg class="fe-cols" viewBox="0 0 ${W} ${base + 14}" width="${W}" height="${base + 14}" aria-hidden="true">${weekBg}${cols2}<line x1="0" x2="${W}" y1="${base + 0.5}" y2="${base + 0.5}" stroke="var(--hairline)"/><text x="0" y="${base + 12}">18 AUG</text><text x="${W}" y="${base + 12}" text-anchor="end">13 OCT</text></svg>`;
  return `
<div class="mp mp-felton">
  <div class="fe-meta"><span>Reading report</span><span>13.10.2026</span></div>
  <div class="fe-title">${esc(D.title)}<span>${esc(D.author)} · ${D.total} words</span></div>
  <div class="fe-q">Can I read this?</div>
  <div class="fe-hero"><span class="fe-num">${D.pct}<sup>%</sup></span><span class="fe-cap">of running words known<b>${v.label}</b><em>for ${D.level}; comfortable from 95%</em></span></div>
  ${matrix}
  <div class="fe-key"><span><i class="k"></i>Known ${D.c.k}</span><span><i class="l"></i>Learning ${D.c.l}</span><span><i class="u"></i>New ${D.c.u}</span><span>1 dot = 1 word, in reading order</span></div>
  <div class="fe-grid">
    <div><b>${D.c.u}</b><span>new-word uses</span></div>
    <div><b>${D.uni.u}</b><span>different new words</span></div>
    <div><b>1:${D.oneIn}</b><span>new-word rate</span></div>
  </div>
  <div class="fe-q">What will help most?</div>
  <div class="fe-sub">New words that come back</div>
  <div class="fe-list">${list}</div>
  <div class="fe-proj"><span class="fe-num2">${D.after}<sup>%</sup></span><span class="fe-cap2">known if you learn these ${D.repeated.length}<b>+${D.after - D.pct} points</b></span></div>
  <div class="fe-q">Am I getting better?</div>
  <div class="fe-grid">
    <div><b>+${D.gain7}</b><span>words this week</span></div>
    <div><b>${D.active7}/7</b><span>days read</span></div>
    <div><b>${fmt(D.known)}</b><span>words known</span></div>
  </div>
  ${chart}
  ${footLink('Full report')}
</div>`;
}

// ================================================================ 4. LUPI
export function lupi(D) {
  const W = 368, x0 = 16, lineH = 15, paraGap = 9;
  // Lay the text out as dashes, one per running word, width from word length.
  const pos = []; let x = x0, y = 10, lastP = 0;
  D.tokens.forEach((tk, i) => {
    if (tk.p !== lastP) { x = x0; y += lineH + paraGap; lastP = tk.p; }
    const w = Math.max(3, Math.min(22, tk.t.length * 2.05));
    if (x + w > W - 2) { x = x0; y += lineH; }
    pos.push({ x, y, w, tk });
    x += w + 2.6;
  });
  const H = y + 14;
  const marks = pos.map(({ x, y, w, tk }) => {
    if (tk.s === 'u') return `<rect x="${x.toFixed(1)}" y="${(y - 2.2).toFixed(1)}" width="${w.toFixed(1)}" height="4.4" rx="2.2" fill="var(--c-unknown)"/>`;
    if (tk.s === 'l') return `<rect x="${x.toFixed(1)}" y="${(y - 1).toFixed(1)}" width="${w.toFixed(1)}" height="2" rx="1" fill="var(--lu-k)"/><line x1="${x.toFixed(1)}" x2="${(x + w).toFixed(1)}" y1="${(y + 3.4).toFixed(1)}" y2="${(y + 3.4).toFixed(1)}" stroke="var(--band-l)" stroke-width="1.4"/>`;
    return `<rect x="${x.toFixed(1)}" y="${(y - 1).toFixed(1)}" width="${w.toFixed(1)}" height="2" rx="1" fill="var(--lu-k)"/>`;
  }).join('');
  // Threads: the same new word, again, tied with a fine arc.
  const lemmaOf = new Map();
  const forms = { monte: ['monte'], aire: ['Aires', 'aire'], enfermar: ['enfermó', 'enfermaba'], escopeta: ['escopeta'], cazar: ['cace', 'cazaba'], bicho: ['bichos'], cuero: ['cueros'] };
  for (const [lem, fs_] of Object.entries(forms)) for (const f of fs_) lemmaOf.set(f.toLowerCase(), lem);
  const occ = {};
  pos.forEach((p, i) => { if (p.tk.s !== 'u') return; const lem = lemmaOf.get(p.tk.t.toLowerCase()); if (lem) (occ[lem] ??= []).push(p); });
  const arcs = [];
  const top = D.repeated[0].word; // the most repeated new word gets the thread
  for (const [lem, ps] of Object.entries(occ)) {
    if (lem === top) {
      for (let i = 1; i < ps.length; i++) {
        const a = ps[i - 1], b = ps[i];
        const ax = a.x + a.w / 2, ay = a.y - 3, bx = b.x + b.w / 2, by = b.y - 3;
        const lift = 7 + Math.min(10, Math.abs(by - ay) * 0.25);
        arcs.push(`<path d="M${ax.toFixed(1)} ${ay.toFixed(1)} C ${ax.toFixed(1)} ${(Math.min(ay, by) - lift).toFixed(1)}, ${bx.toFixed(1)} ${(Math.min(ay, by) - lift).toFixed(1)}, ${bx.toFixed(1)} ${by.toFixed(1)}" fill="none" stroke="var(--c-unknown)" stroke-width="1" opacity=".85"/>`);
      }
      const f = ps[0];
      arcs.push(`<text x="${(f.x + f.w + 3).toFixed(1)}" y="${(f.y - 7).toFixed(1)}" text-anchor="start" class="lu-tag">${lem} ×${ps.length}</text>`);
    } else {
      for (const q of ps) arcs.push(`<circle cx="${(q.x + q.w / 2).toFixed(1)}" cy="${(q.y - 6.2).toFixed(1)}" r="1.7" fill="none" stroke="var(--c-unknown)" stroke-width=".9"/>`);
    }
  }
  // Paragraph numerals in the margin.
  const pn = []; let seen = -1;
  pos.forEach(p => { if (p.tk.p !== seen) { seen = p.tk.p; pn.push(`<text x="0" y="${(p.y + 3.5).toFixed(1)}" class="lu-pn">${p.tk.p + 1}</text>`); } });
  // A note on the densest paragraph.
  const dens = D.paras.map((P, i) => ({ i, r: P.u / P.n })).sort((a, b) => b.r - a.r)[0];
  const field = `<svg class="lu-field" viewBox="0 -6 ${W} ${H + 6}" width="${W}" height="${H + 6}" aria-hidden="true">${pn.join('')}${arcs.join('')}${marks}</svg>`;
  // Eight weeks as stems, one per day you marked words.
  const t0 = Date.parse('2026-08-18'), nDays = 57, sx = (iso) => 10 + (Date.parse(iso) - t0) / 864e5 / (nDays - 1) * (W - 20);
  const gmax = Math.max(...D.gains.filter(g => !g.first).map(g => g.g));
  const stems = D.gains.map(g => { const X = sx(g.d); if (g.first) return `<line x1="${X}" x2="${X}" y1="44" y2="14" stroke="var(--lu-k)" stroke-width="1" stroke-dasharray="1.5 2"/><circle cx="${X}" cy="14" r="2.4" fill="none" stroke="var(--lu-k)"/>`; const h = 3 + g.g / gmax * 20; return `<line x1="${X.toFixed(1)}" x2="${X.toFixed(1)}" y1="44" y2="${(44 - h).toFixed(1)}" stroke="var(--lu-k)" stroke-width="1"/><circle cx="${X.toFixed(1)}" cy="${(44 - h).toFixed(1)}" r="${(1.2 + Math.sqrt(g.g) / 5).toFixed(2)}" fill="var(--bg)" stroke="var(--lu-k)" stroke-width="1"/>`; }).join('');
  const away = `<path d="M${sx('2026-09-14')} 41 Q ${(sx('2026-09-14') + sx('2026-09-18')) / 2} 33 ${sx('2026-09-18')} 41" fill="none" stroke="var(--dim)" stroke-width=".8" stroke-dasharray="2 2"/><text x="${(sx('2026-09-14') + sx('2026-09-18')) / 2}" y="9" text-anchor="middle" class="lu-ann">a week away</text><line x1="${(sx('2026-09-14') + sx('2026-09-18')) / 2}" x2="${(sx('2026-09-14') + sx('2026-09-18')) / 2}" y1="12" y2="33" stroke="var(--dim)" stroke-width=".6" stroke-dasharray="1 2"/>`;
  const weeks = `<svg class="lu-weeks" viewBox="0 0 ${W} 60" width="${W}" height="60" aria-hidden="true"><line x1="10" x2="${W - 10}" y1="44.5" y2="44.5" stroke="var(--hairline)"/>${stems}${away}<text x="${sx('2026-08-18') + 6}" y="9" class="lu-ann">day one: the 500 commonest</text><text x="10" y="57" class="lu-ax">18 Aug</text><text x="${W - 10}" y="57" text-anchor="end" class="lu-ax">today, +${D.todayGain}</text></svg>`;
  return `
<div class="mp mp-lupi">
  <div class="lu-q">Can I read this?</div>
  <p class="lu-say">${D.pct} of every 100 words here are already yours. The rest are one tap away.</p>
  <div class="lu-sub">The story, word by word · ${D.total} words</div>
  ${field}
  <div class="lu-key"><span><i class="k"></i>a word you know</span><span><i class="l"></i>learning</span><span><i class="u"></i>new to you</span><span><i class="o"></i>a new word that comes back</span><span><i class="t"></i>${esc(D.repeated[0].word)}, each time</span></div>
  <p class="lu-note">Paragraph ${dens.i + 1} is the thickest with new words (${D.paras[dens.i].u} of ${D.paras[dens.i].n}): the friend's offer.</p>
  <div class="lu-q">What will help most?</div>
  <p class="lu-say">Follow the thread: <em>monte</em>, the bush where the story goes, comes back four times; <em>aire</em>, <em>enfermar</em>, <em>escopeta</em>, <em>cazar</em>, <em>bicho</em> and <em>cuero</em> twice. Learn these seven and the text is ${D.after}% yours.</p>
  <div class="lu-q">Am I getting better?</div>
  <p class="lu-say small">${D.activeAll} days with Spanish since 18 August. This story was ${D.firstPct}% yours then; it is ${D.pct}% now.</p>
  ${weeks}
  <div class="lu-key lu-key2"><span><i class="s"></i>one day: height and dot, words you marked known</span></div>
  ${footLink()}
</div>`;
}

// ================================================================ 5. ISOTYPE
export function isotype(D) {
  const sym = (cls, x, y, frac = 1, w = 10, h = 14) => frac >= 1 ? `<use href="#iso-word" x="${x}" y="${y}" width="${w}" height="${h}" class="${cls}"/>` : `<svg x="${x}" y="${y}" width="${(w * frac).toFixed(1)}" height="${h}" overflow="hidden"><use href="#iso-word" x="0" y="0" width="${w}" height="${h}" class="${cls}"/></svg>`;
  const book = (cls, x, y, frac = 1) => frac >= 1 ? `<use href="#iso-book" x="${x}" y="${y}" width="12" height="15" class="${cls}"/>` : `<svg x="${x}" y="${y}" width="${(12 * frac).toFixed(1)}" height="15" overflow="hidden"><use href="#iso-book" x="0" y="0" width="12" height="15" class="${cls}"/></svg>`;
  const defs = `<defs><symbol id="iso-word" viewBox="0 0 10 14"><path d="M1.6 0h6.8A1.6 1.6 0 0 1 10 1.6v10.8A1.6 1.6 0 0 1 8.4 14H1.6A1.6 1.6 0 0 1 0 12.4V1.6A1.6 1.6 0 0 1 1.6 0z"/></symbol><symbol id="iso-book" viewBox="0 0 12 15"><path d="M0 1.2C0 .5.5 0 1.2 0H12v12.6H1.6c-.5 0-.9.3-.9.8s.4.8.9.8H12V15H1.4C.6 15 0 14.4 0 13.6z"/></symbol></defs>`;
  // Row 0: one new word in eight.
  const r0 = Array.from({ length: D.oneIn }, (_, i) => sym(i === D.oneIn - 1 ? 'is-u' : 'is-k', i * 24, 1, 1, 18, 25)).join('');
  const svg0 = `<svg class="is-row" viewBox="0 0 368 28" width="368" height="28" aria-hidden="true">${defs}${r0}</svg>`;
  // Chart 1: this text, 1 symbol = 10 running words.
  const row = (cls, n, y, per = 10) => { let s = ''; const full = Math.floor(n / per), frac = (n % per) / per; for (let i = 0; i < full; i++) s += sym(cls, 72 + i * 11.4, y, 1, 9, 14); if (frac > 0.04) s += sym(cls, 72 + full * 11.4, y, frac, 9, 14); return s; };
  const c1 = `<svg class="is-chart" viewBox="0 0 368 66" width="368" height="66" aria-hidden="true"><text x="0" y="13">known</text>${row('is-k', D.c.k, 2)}<text x="0" y="35">learning</text>${row('is-l', D.c.l, 24)}<text x="0" y="57">new</text>${row('is-u', D.c.u, 46)}<text x="368" y="57" text-anchor="end" class="is-n">${D.c.u}</text><text x="368" y="35" text-anchor="end" class="is-n">${D.c.l}</text><text x="368" y="13" text-anchor="end" class="is-n">${D.c.k}</text></svg>`;
  // Chart 2: new words that come back, 1 symbol = 1 appearance.
  const c2rows = D.repeated.map((r, i) => { const y = i * 18; let s = `<text x="0" y="${y + 12}">${esc(r.word)}</text>`; for (let j = 0; j < r.count; j++) s += sym('is-u', 72 + j * 12.6, y + 1); s += `<text x="132" y="${y + 12}" class="is-g">${esc(r.gloss.split(/[;,]/)[0])}</text>`; return s; }).join('');
  const c2 = `<svg class="is-chart" viewBox="0 0 368 ${D.repeated.length * 18}" width="368" height="${D.repeated.length * 18}" aria-hidden="true">${c2rows}</svg>`;
  // Chart 3: your words every two weeks, 1 book = 100 known words.
  const c3rows = D.fortnights.map((f, i) => { const y = i * 20; let s = `<text x="0" y="${y + 12}">${dShort(f.d)}</text>`; const full = Math.floor(f.k / 100), frac = (f.k % 100) / 100; for (let j = 0; j < full; j++) s += book('is-k', 56 + j * 15, y); if (frac > 0.04) s += book('is-k', 56 + full * 15, y, frac); s += `<text x="368" y="${y + 12}" text-anchor="end" class="is-n">${fmt(f.k)}</text>`; return s; }).join('');
  const c3 = `<svg class="is-chart" viewBox="0 0 368 ${D.fortnights.length * 20}" width="368" height="${D.fortnights.length * 20}" aria-hidden="true">${c3rows}</svg>`;
  return `
<div class="mp mp-isotype">
  <div class="is-q">Can I read this?</div>
  <div class="is-head">About 1 word in ${D.oneIn} is new to you</div>
  ${svg0}
  <div class="is-v">${D.pct}% known · <b>readable with lookups</b> at ${D.level}</div>
  <div class="is-t">This text: ${D.total} words <span>each symbol = 10 words</span></div>
  ${c1}
  <div class="is-q">What will help most?</div>
  <div class="is-t">New words that come back <span>each symbol = 1 appearance</span></div>
  ${c2}
  <div class="is-v">Learn these ${D.repeated.length}: the text goes from ${D.pct}% to <b>${D.after}%</b> known</div>
  <div class="is-q">Am I getting better?</div>
  <div class="is-t">Your Spanish words <span>each book = 100 known words</span></div>
  ${c3}
  ${footLink()}
</div>`;
}

export const designs = { tufte, few, felton, lupi, isotype };

// ================================================================ RECOMMENDED
// One glance (Isotype's natural frequency + the composition bar with the
// reader's thresholds), one action (Few/Felton's list of words that come
// back, with a button), one outcome (Tufte's sparkline of this text getting
// easier). Built from the app's own type and tokens.
export function recommended(D, opts = {}) {
  const W = 368, v = verdict(D.pct, D.level, D.total);
  const only = !D.oneIn || D.oneIn > 20;
  const nSym = only ? 20 : D.oneIn;
  const defs = `<defs><symbol id="rc-word" viewBox="0 0 10 14"><path d="M1.6 0h6.8A1.6 1.6 0 0 1 10 1.6v10.8A1.6 1.6 0 0 1 8.4 14H1.6A1.6 1.6 0 0 1 0 12.4V1.6A1.6 1.6 0 0 1 1.6 0z"/></symbol></defs>`;
  const symW = only ? 13 : 16, symH = only ? 18 : 22, pitch = only ? 17.6 : 22;
  const row = Array.from({ length: nSym }, (_, i) => `<use href="#rc-word" x="${(i * pitch).toFixed(1)}" y="1" width="${symW}" height="${symH}" class="${!only && i === nSym - 1 ? 'rc-u' : 'rc-k'}"/>`).join('');
  const symRow = `<svg class="rc-sym" viewBox="0 0 ${W} ${symH + 2}" width="${W}" height="${symH + 2}" aria-hidden="true">${defs}${row}</svg>`;
  const head = only ? (D.c.u === 0 ? 'Every word here is known' : `Only ${D.c.u} new word${D.c.u === 1 ? '' : 's'} in ${D.total}`) : `About 1 word in ${D.oneIn} is new to you`;
  // Composition bar with the reader's thresholds.
  let x = 0; const segs = [];
  for (const [n, col] of [[D.c.k, 'var(--band-k)'], [D.c.l, 'var(--band-l)'], [D.c.u, 'var(--c-unknown)']]) { if (!n) continue; const w = n / D.total * W; segs.push(`<rect x="${x.toFixed(1)}" y="2" width="${Math.max(1.5, w - 2).toFixed(1)}" height="6" rx="1.5" fill="${col}"/>`); x += w; }
  const tk = (p, lab, anchor) => `<line x1="${(p / 100 * W).toFixed(1)}" x2="${(p / 100 * W).toFixed(1)}" y1="11" y2="15" stroke="var(--dim)"/>` + (lab ? `<text x="${(p / 100 * W + (anchor === 'end' ? 4 : 0)).toFixed(1)}" y="26" text-anchor="${anchor}">${lab}</text>` : '');
  const bar = `<svg class="rc-bar" viewBox="0 0 ${W} 28" width="${W}" height="28" role="img" aria-label="${D.pct}% known; workable from 60% at ${D.level}, comfortable from 95%">${segs.join('')}${tk(60, `60% workable at ${D.level}`, 'middle')}<line x1="${(0.95 * W).toFixed(1)}" x2="${(0.95 * W).toFixed(1)}" y1="11" y2="15" stroke="var(--dim)"/><text x="${W}" y="26" text-anchor="end">95% comfortable</text></svg>`;
  const once = D.newWords.filter(w => w.count === 1).length;
  const sv = D.series.map(q => q.v); const sp = sparkPts(sv, 84, 18, 2);
  const spark = `<svg class="rc-spark" viewBox="0 0 84 18" width="84" height="18" aria-hidden="true"><path d="${path(sp)}" fill="none" stroke="var(--dim)" stroke-width="1.2"/><circle cx="${sp.at(-1)[0]}" cy="${sp.at(-1)[1]}" r="2.3" fill="var(--ink)"/></svg>`;
  const hp = histPts(D.hist, 84, 18, 2);
  const spark2 = `<svg class="rc-spark" viewBox="0 0 84 18" width="84" height="18" aria-hidden="true"><path d="${path(hp)}" fill="none" stroke="var(--dim)" stroke-width="1.2"/><circle cx="${hp.at(-1)[0]}" cy="${hp.at(-1)[1]}" r="2.3" fill="var(--ink)"/></svg>`;
  const back = D.repeated.slice(0, 7).map(r => `<li><span class="rc-w">${esc(r.word)}</span><span class="rc-dots" aria-label="${r.count} times">${'<i></i>'.repeat(r.count)}</span><span class="rc-g">${esc(r.gloss.split(/[;]/)[0] || '—')}</span></li>`).join('');
  const helpBlock = D.repeated.length ? `
  <div class="sech rc-sech">What will help most?</div>
  <div class="rc-sub">New words that come back in this text</div>
  <ul class="rc-list">${back}</ul>
  <div class="rc-act"><button class="btn" type="button">Add ${D.repeated.length} to Learning</button><span>Knowing them: <b>${D.after}%</b> of this text</span></div>${once / Math.max(1, D.newWords.length) > 0.75 ? `<p class="rc-p rc-note">${once} of the ${D.newWords.length} new words appear only once: a hard read, with little repetition to learn from.</p>` : ''}`
  : `
  <div class="sech rc-sech">What will help most?</div>
  <p class="rc-p">${D.c.u ? `No new word comes back in this text${once ? `: the ${once} new word${once === 1 ? ' appears' : 's each appear'} once` : ''}. Read for the story; look words up as you go.` : 'Nothing new here. A good text for reading speed.'}</p>`;
  return `
<div class="mp mp-rec">
  <div class="sech rc-sech">Can I read this?</div>
  <div class="rc-head"><span>${head}</span></div>
  ${only ? '' : symRow}
  <div class="rc-verdict"><span class="rc-chip rc-${v.key}">${v.label}</span><span>${D.pct}% known · ${D.c.u} lookup${D.c.u === 1 ? '' : 's'} in ${D.total} words</span></div>
  ${bar}
  ${helpBlock}
  ${opts.compact ? '' : `
  <div class="sech rc-sech">Am I getting better?</div>
  <div class="rc-prog"><span class="rc-pl">This text</span><span class="rc-pv">${D.firstPct}% → <b>${D.pct}%</b></span>${spark}<span class="rc-pn">since ${dShort(D.series[0].d)}</span></div>
  <div class="rc-prog"><span class="rc-pl">Words known</span><span class="rc-pv"><b>${fmt(D.known)}</b></span>${spark2}<span class="rc-pn">+${D.gain7} this week</span></div>
  ${footLink()}`}
</div>`;
}
designs.recommended = recommended;
