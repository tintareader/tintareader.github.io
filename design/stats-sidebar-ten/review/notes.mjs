// The curator's notes on each design, written after looking at all ten in the
// app in both themes. `works` and `watch` appear under each design; `across`
// is the closing section.
export const notes = {
  minard: {
    works: 'Every band is to scale, so the panel is honest down to the pixel. The lookups band losing one thread per returning word, down to 17, shows why learning them lifts the text to 92% better than any other design here.',
    watch: 'The densest and tallest of the ten (811 of 817 px), with three band scales to keep apart. The paper sheet and engraved serif sit apart from the app around it. With the word card open, only question I stays in view.',
  },
  dubois: {
    works: 'The spiral is the most memorable picture in the set: the whole text in one coil, with the new words as pink flecks you could count. Flat colour and condensed capitals read quickly in both themes.',
    watch: 'Glosses in capitals read more slowly than lower case. The spiral and the bar under it say the same thing at two resolutions. Its gold for learning words is not the app’s amber.',
  },
  beck: {
    works: 'One ring per appearance shows monte’s four without a number, and the line runs on into the button, so the action reads as the end of the line. The key at the foot is a real tube-map key.',
    watch: 'Words known climbs in 100-word steps, so small days disappear. The map idea is strongest in question 2 and weakest in question 1, where the status line is an ordinary bar.',
  },
  rams: {
    works: 'The closest to something Tinta could ship as it stands: three modules, a graduated scale with a pointer, one coloured key. The grille shows all 262 words in reading order, with new words larger, so status reads by size as well as colour.',
    watch: 'Bordered modules add frames inside a sidebar that already has one. The green key is the only colour outside the status colours, and green has no other job in Tinta yet.',
  },
  vignelli: {
    works: 'The strongest hierarchy of the ten: the black bands make the three questions impossible to miss, and the big numerals answer them before you read a word. The word table, with its total line, is the clearest list of the returning words.',
    watch: 'The bands are heavy beside a text you are reading, more so in dark, where they turn light grey. Three large numerals (86, 92, 86) compete for the eye. It uses 798 of 817 px.',
  },
  kare: {
    works: 'The friendliest, and one of the most legible: bitmap type at whole-pixel sizes stays crisp, and a tiny icon gives each question a face (glasses, a bulb, a sprout, and a magnifier finding a pink word). The Mac default button could only be a button.',
    watch: 'Three windows with striped title bars are a lot of frame for a sidebar, and the 1984 look is a period costume next to the app’s own type. Pixel type stays sharp only at whole-number scales, so it softens on some screens and zoom levels.',
  },
  scher: {
    works: 'The most energetic, and its size rule is true: monte is set twice as large because it comes back twice as often. It makes the returning words feel like the point of the panel.',
    watch: '“1 word in 8” and “86%” sit side by side at the same size, so at first glance they can run together. Wide capitals in every heading are loud next to a quiet reading column.',
  },
  cox: {
    works: 'The clearest of the ten. Each question gets a sentence that answers it (“Seven new words keep coming back.”), and the notes on each chart explain it where you look. The 86% → 92% arrow on the same scale shows what the button buys.',
    watch: 'Headlines that answer (“Yes, on both counts.”) need wording rules for every case, kept true as the numbers change. There is a lot to read for a panel that is meant to be glanced at.',
  },
  fragapane: {
    works: 'The most beautiful drawing in the set. The flower makes the seven returning words one object with petal length as count, and its “how to read” key teaches that in one look. The arc carries 86% and both marks in one form.',
    watch: 'A scale on a curve is harder to judge than a straight one. The “This text” sprouts start at zero, so 77% → 86% is almost flat. Labels around a flower take longer to scan than a list.',
  },
  chalabi: {
    works: 'The warmest: it reads like a reader’s own notes, and the circled eighth word is an instant picture of 1 in 8. Tally strokes are a natural way to say “comes back four times”.',
    watch: 'Handwriting faces are harder to read at small sizes, and Patrick Hand’s crossed 7 makes “Add 7 to Learning” look odd. The pencil texture is filter work that would need tuning on every screen.',
  },
};

export const across = {
  intro: [
    'All ten carry every fact, fit the column without scrolling and work in both themes. They differ in what they make you see first, and in how much of the panel is picture and how much is reading.',
  ],
  rows: [
    { id: 'minard', device: 'Flow bands as wide as their counts', glance: 'Slower: the bands take a moment', build: 'Hard: band shapes recomputed for any counts' },
    { id: 'dubois', device: 'The text coiled into a spiral; flat-colour bars', glance: 'Fast: the lettered statement leads', build: 'Medium: a generated spiral, then bars' },
    { id: 'beck', device: 'Lines, stops and interchanges', glance: 'Fast', build: 'Medium: lines laid out per text' },
    { id: 'rams', device: 'An instrument face: grille, scale, pointer, one key', glance: 'Fast', build: 'Easy to medium' },
    { id: 'vignelli', device: 'A strict grid, black bands, big numerals', glance: 'Fastest', build: 'Easy: type and rules' },
    { id: 'kare', device: 'Mac windows, bitmap type, pixel icons', glance: 'Fast', build: 'Medium: icons drawn pixel by pixel' },
    { id: 'scher', device: 'Type size as quantity', glance: 'Fast, but loud', build: 'Easy: type only' },
    { id: 'cox', device: 'An answer as the headline, notes on small charts', glance: 'Fast: the headline is the answer', build: 'Medium: wording rules for every case' },
    { id: 'fragapane', device: 'Seeds, petals and sprouts', glance: 'Slower', build: 'Hard: a radial layout with placed labels' },
    { id: 'chalabi', device: 'Hand-drawn notes in a margin', glance: 'Fast', build: 'Medium: seeded drawing and texture filters' },
  ],
  outro: [
    '<b>Nearest to shipping:</b> Rams, Vignelli and Cox would need the least change to sit in Tinta. Rams brings the instrument scale and a grille of words, Vignelli the clearest hierarchy, Cox the sentences that answer each question.',
    '<b>Ideas worth borrowing whichever is chosen:</b> Minard’s lookups band losing a thread per word (why 92%); Beck’s ring per appearance; Scher’s size per count; Chalabi’s circled eighth word for 1 in 8; Cox’s headline that answers the question.',
  ],
};
