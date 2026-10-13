import fs from 'node:fs';
import { calChart } from './calchart.mjs';
const tpl = fs.readFileSync(new URL('page2.tpl.html', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('r1-style.css', import.meta.url), 'utf8');
const out = tpl.replace('/*R1CSS*/', css).replace('<!--CALCHART-->', calChart());
fs.writeFileSync(new URL('../review/index.html', import.meta.url), out);
const refs = [...new Set([...out.matchAll(/img\/[a-z0-9-]+\.webp/g)].map(m => m[0]))];
const missing = refs.filter(r => !fs.existsSync(new URL('../review/' + r, import.meta.url)));
console.log('bytes', out.length, 'static img refs', refs.length, 'missing', missing);
