# Sidebar Stats: independent round

A second, independent design study for the reader's Stats tab, made by a
fresh agent that did not see the study in `../stats-sidebar/`. It was given
only:

- the product owner's original request;
- their later note that Tinta is not a graded reader, with their A1, A2 and
  B1 experience;
- a clean copy of the site at commit 8ea5493, with no git history.

Like the other study, it is not part of the generated site, so keep it off
`main`.

- `review/index.html` is the write-up, with every mockup in light and dark.
  It loads `img/`. The published copy is the private Artifact "Tinta Stats
  Panel".
- `mock/` holds the panel code, `scripts/` the Playwright drivers and the
  reader simulation, and `data/`, `persona/` and `texts/` the inputs.
- The scripts use absolute paths under `/home/user/tinta-blind-work/`, where
  the round was made. Browser profiles, raw PNG screenshots and exploration
  shots were left out.
