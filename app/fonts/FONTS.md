# How the cover fonts are shipped

The cover artwork is set in three typefaces, and this folder carries them
without any binary font file: the font bytes live as base64 text inside
`fonts-embedded.css`, one `@font-face` rule per face, each payload on a
single line. A browser loads them straight from those data URIs, so no
`.ttf` file needs to sit in the repository at all. The embedding is done
by `tools/embed-fonts.mjs`, which re-creates the stylesheet from the
original font files; decoding the base64 back gives byte-for-byte the
same files, checked by SHA-256.

All three faces come from the Google Fonts repository and are released
under the SIL Open Font License, version 1.1. The full license text is
in the OFL.txt files next to this note.

## Anton

- Source: https://github.com/google/fonts/raw/main/ofl/anton/Anton-Regular.ttf
- SHA-256 of the original file: a4ba3a92350ebb031da0cb47630ac49eb265082ca1bc0450442f4a83ab947cab

## Bebas Neue

- Source: https://github.com/google/fonts/raw/main/ofl/bebasneue/BebasNeue-Regular.ttf
- SHA-256 of the original file: 08e4623805102d819f58601e46e345648846075e363b2ceb23313c2d1c83ec73

## Pacifico

- Source: https://github.com/google/fonts/raw/main/ofl/pacifico/Pacifico-Regular.ttf
- SHA-256 of the original file: 5b6c0d5334a7bf77dea52b975c5a0c408878c0f7115ed5b6fb151f634b7bf701
