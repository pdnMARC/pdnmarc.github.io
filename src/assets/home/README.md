# Landing-page photos

Put **1–5 real photos** of the MARC lab, interior or team in this folder (`.jpg`, `.jpeg`, `.png` or `.webp`). The home page shows them beside the headline as a collage:

| Photos | Layout |
|---|---|
| 1 | one large photo |
| 2 | side by side |
| 3 | one large + two stacked |
| 4 | one large + one wide + two small |
| 5 | one large + 2 × 2 grid (phones show the first three) |

- Photos are ordered by file name: name them `01-lab.jpg`, `02-team.jpg`, … The first one is the large tile.
- Landscape, at least 1600 px wide. Tiles are cropped to fit, so keep the subject near the centre.
- Commit the originals: Astro resizes them and serves AVIF/WebP automatically.
- Describe each photo in `homePhotos.alt` in `src/data/site.ts` (what a screen-reader user should hear). Optionally add a `caption`.
- Only use photos MARC has the right to publish, with consent from anyone recognisable in them.

With no photos here, the home page shows the text-only hero.
