// Download a Google Fonts family's latin subset into ../fonts as woff2.
// Usage: node getfont.mjs "Jost:wght@400..700" ["Fraunces:ital,wght@1,300..600"]
// Ask for a weight range (400..700) when the family is variable, so one file
// covers every weight; listing weights (400;700) downloads the same file twice.
// The app's CSP only allows fonts from its own origin or data: URIs, so
// shoot.mjs inlines these files as data: URIs; designs list them in `fonts`.
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const OUT = fileURLToPath(new URL('../fonts/', import.meta.url));
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
for (const fam of process.argv.slice(2)) {
  const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${encodeURIComponent(fam).replace(/%20/g, '+')}&display=swap`, { headers: { 'user-agent': UA } })).text();
  const blocks = css.split('/* ').slice(1).map(b => ({ subset: b.slice(0, b.indexOf(' */')), body: b }));
  for (const b of blocks.filter(b => b.subset === 'latin')) {
    const family = b.body.match(/font-family: '([^']+)'/)[1];
    const style = b.body.match(/font-style: (\w+)/)[1];
    const weight = b.body.match(/font-weight: ([\d ]+)/)[1].trim();
    const url = b.body.match(/url\((https:[^)]+)\)/)[1];
    const file = `${family.replace(/\s+/g, '')}-${style}-${weight.replace(' ', '_')}.woff2`;
    fs.writeFileSync(OUT + file, Buffer.from(await (await fetch(url)).arrayBuffer()));
    console.log(`{ family: '${family}', style: '${style}', weight: '${weight}', file: '${file}' },`);
  }
}
