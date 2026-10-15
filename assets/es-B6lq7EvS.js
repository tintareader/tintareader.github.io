const e=`# Spanish starter: the first story a newcomer reads, with the coach beside it,
# and its part two, the first thing "What next" offers. Written for this app
# (unencumbered), from the onboarding mockups of 2026-10-09 (take four).
#
# The header names what the coach points at, each as written in the text:
#   @anchor     the international word the reader is asked to guess, met at
#               least three times, the last time in another form (@form)
#   @known      a very common word in the second sentence, the first the
#               reader is asked to mark Known: one that is the same word in
#               the reader's own language (es no, de/fr/id/pt hotel), since
#               pressing 1 says "I know this already"
#   @learn      in place of @known, for a script no beginner can read (zh,
#               ar): a common word in the second sentence and met again soon
#               after, marked Learning there and Known at its next meeting
#   @phrase     the set phrase the story turns on, as written (the parrot's
#               line): one the pack glosses whole, which the coach points at
#               so the reader learns what the shading round a phrase means
#   @translate  a sentence whose meaning the word cards do not give, even
#               one by one (word order, a false friend); the coach asks for a
#               whole-sentence translation there
#   @form       the anchor in another form, near the end: the coach says one
#               mark covers every form. Leave it out where the language has none
#
# Then \`## title\` and the starter's text, then \`## title\` and part two's. A
# blank line is a paragraph; the coach's note sits under the paragraph the
# reader is in. Translations of each sentence are in es.<meta>.txt.

#
# The narrator is a man here, unlike the other starters: "Ahora soy el
# camarero" sets up "Por fin vuelve el camarero", and Spanish has no way to
# say it without a gender (chosen 2026-10-15).
@anchor café
@known no
@phrase ¿Qué te pongo?
@translate Así que hago yo el café
@form cafés

## El loro
Quiero un café. Pero en el bar no hay nadie, solo un loro.

—¿Qué te pongo? —pregunta el loro.

—Un café, por favor.

—¿Qué te pongo? —dice otra vez.

Es todo lo que sabe decir. Así que hago yo el café.

Entra un hombre.

—¿Qué te pongo? —le pregunto.

—Un café.

Le pongo el café. Luego entra más gente. Hago cafés para todos. Ahora soy el camarero.

Por fin vuelve el camarero. Me mira. Mira al loro.

—¿Qué te pongo? —le pregunta el loro.

## Mi primer día
Al día siguiente, el camarero se va de vacaciones. Ahora el bar es mío. Bueno, mío y del loro.

Entra una mujer.

—¿Tienes té?

—¿Qué te pongo? —le pregunto.

—Té. ¿Tienes té?

—¿Qué te pongo?

Al final pide un café.

Entra un hombre con prisa.

—¿Cuánto es?

—¿Qué te pongo?

Deja dos euros en la mesa y sale.

Entra un turista con un mapa.

—Perdón, ¿hablas español?

Abro la boca. No sé qué decir.

—Un poco —dice el loro.
`;export{e as default};
