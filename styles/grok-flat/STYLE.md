# grok-flat

A flat 2D vector night room: aplats of colour, no outlines on characters, no volume shading, no textures. Matched on a 3D clay-look explainer (reference stills kept local in `references/grok/`, never committed); the look re-creates the *kind* of image (same medium proportions, palette, layout), not the characters' rendering.

## Measured (reference, 540x960 stills)
| what | value |
|---|---|
| ground (wall) | `#1a1834` 30%, `#1a152e` 12% (floor/shadow) |
| cream (board, caption cards) | `#fceedd` |
| Grok Bot | `#8c4733` in clay; flat version `#c4573a` body, `#a64a31` legs |
| Claude sweater | mustard `#e3b93c`; trousers `#2d2750` |
| mint (cloud, support card) | `#a0e0c5`; coral badge `#f08a80`; caption key word red `#d9534f` |
| type | heavy geometric sans, caption cards ~66px on the 1080 frame, 1-2 rows, key word red |
| layout | Claude centred or clipped at the left edge, Grok Bot centre-right, board = 83% of frame width, caption card centred at the bottom |
| motion | idle bob, blink, pop-in icons, pointer follows the explained item; hard cuts between shots |

## Palette meaning
night = ground; cream = information (board, captions); brick red = Grok Bot only; red `#d9534f` = the key word of a caption; coral = diagram accents; mint = cloud/support; mustard = Claude and the "accounts" card.

## Kit API (`kit.js`, prefix `gf`)
`gfRoom()` the set; `gfClaude(cx, baseY, {s, pose, talk})`; `gfGrok(x, baseY, {talk, walk, arm})` returns the pointer anchor; `gfPointer(from, to)`; `gfBoard()` board on legs (sheet at `GFB`); `gfBoardIcon(cx, cy, size, 'mail'|'cal'|'support'|'toggles'|'add', k)`; `gfMonitor`, `gfCloud`; `gfCaption()` follows `VOICE` words (key words in `GF_KEYS`); `gfTitle(a, b)`.

## Frame checklist (on top of grammar/FRAME.md)
- Flat aplats only: no gradients, no outlines on characters, no drop shadows except the floor ellipse.
- One cream surface per frame carries the information (board or title card), plus the caption card.
- Captions >= 50px, <= 2 rows, inside x 70-1010; the key word of the phrase is red.
- Three or more bits of background life: blinking string lights, twinkling stars, swaying plant, idle bob, blink.
- Grok Bot stays brick red and blocky; never recoloured, never rounded.

## Not matched
- The reference board sits lower (top at 28% of the frame) and shows four tool icons (mail, calendar, sheet, chat); ours is higher with two plus the AGENT window.
- Reference characters are 3D clay with soft shading; ours are flat by design.
- Captions in the reference are tighter 2-3 word groups cut on the speech rhythm; ours chunk on punctuation with estimated word times.

## Proven on
`pieces/grok-bot` (look check: shots 1, 4, 7 only).
