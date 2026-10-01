# ConventionalMemory.io

A retro DOS-style museum catalog, timeline and trivia game. It is a plain static site: no build step, no server.

## Files

| File | What it is |
| --- | --- |
| `index.html` | The page shell, styles and security policy |
| `app.js` | The site code. Socials, wanted list and settings are at the top |
| `items.js` | The museum items. Rewritten by the Admin page |
| `timeline-data.js` | The timeline (about 1,900 dated entries, 1972 to 2026), including roughly 215 video game consoles and handhelds (kind `hw`, TLX type "Console or handheld") |
| `games-data.js` | Per-system release dates, genre and PC requirements for about 610 games. Every release names its real system (no "Other"); unidentified ports were dropped rather than mislabeled |
| `games.js` | Games views: system chips, release-by-system table, requirements, the Games by system tab, the Rig checker |
| `timeline-extra.js` | Extra detail per timeline entry: maker, specs, description, connections. Used by the timeline, the game and the admin autofill |
| `catalog.js` | The interactive catalog (chips, score slider, Cards, Shelf, Time machine and DIR views) |
| `quotes.js` | Quotes |
| `game.js` | The Memory Maze game (`#/maze`) |
| `tl.js` | The timeline page (chart, year view, price map, My trail, filters, connection web, deep links) |
| `icons.js` | About 70 small pixel icons (12 x 12, EGA colors) and the tables that pick one by kind, category, genre or system |
| `art.js` | Generated artwork: 40+ product drawings, 30+ game scenes, seeded abstract covers, packaging (PC box, cartridge, disc case, arcade cabinet, floppy), movie posters, front pages and badges |
| `ads.js` | Tribute ads: product drawings and the per-item ad |
| `play.js` | The Play pages, loaded on demand: Daily Dig (`#/daily`), Build Your Rig (`#/build`), Ad Lab (`#/adlab`) and the hub (`#/play`) |
| `admin.js` | The Admin page (`#/admin`), including the Fill-in Quest |
| `images-data.js` | `CIMG`: about 190 real photos hotlinked from Wikimedia Commons (https only), with a credit link to each Commons file page. If one fails to load it is hidden and the drawn art shows instead |

Keep all of them in the same folder. GitHub Pages serves `index.html` at the root.

## Adding, editing and removing items (the Admin page)

Open `https://conventionalmemory.github.io/#/admin`. There is no server, so GitHub is the login:

1. GitHub > Settings > Developer settings > Personal access tokens > Fine-grained tokens > Generate new token.
2. Repository access: **Only select repositories**, and pick this repository.
3. Permissions > Repository permissions: **Contents = Read and write**. Nothing else.
4. Set an expiry, generate, copy the token, paste it into the Admin page.

Edits are saved as commits to `items.js` (and photos to `photos/`). GitHub Pages republishes in a minute or two.
Only someone holding a token for this repository can save changes. The token stays in the page only (never in the URL, never sent anywhere but api.github.com), and the page locks itself after 20 idle minutes.

To avoid pasting the token every visit, type a passphrase (8+ characters) in the optional box when you unlock. The token is then stored encrypted (AES-256-GCM, key from your passphrase) in this browser only, and next time you just type the passphrase. "Forget saved token" removes it.

## Completeness and the Fill-in Quest (Admin page)

Every item gets a completeness meter: the share of useful fields (maker, date, MSRP, model, photo, description, your take, score, condition, working status, tags, links, Wikipedia and every spec for its type) that are filled. The list can be filtered (Incomplete, Complete, No photo) and sorted (least complete first). **Copy** duplicates an item as a starting point, **Undo delete** brings back a removed item until you leave the page, and **Auto-fill from timeline** fills every blank field that has an exact timeline match.

**Quick add**: type a name on the list page. An exact timeline match becomes a pre-filled item at once; otherwise pick the closest match or create a blank one, and you land straight in that item's quest.

**Start the Fill-in Quest** opens a level-select map. Every item is a cartridge whose picture regains color as it is completed, with 1 to 3 stars. Pick one, or play Quick wins (fields the timeline can answer in one tap come first), **Photo Safari** (only photos), or Surprise me. Each card names the quest ("The Price Hunt", "Spec Sheet Dungeon"), says where the answer will show on the site, and has a checklist of every field on that item; click a blank tile to jump to it. Help is built in: **Use this** applies the timeline's answer, **Ask Wikipedia** reads the article's infobox for maker, date, price and specs, and the photo step searches for a free-licensed Commons image to keep or reject (K and N keys). Only free images are offered, and the credit is saved with the photo.

Rewards: XP and 10 titled levels, a combo for answers in a row, a daily goal (5 fields), a day streak, 14 badges with pixel icons, loot drops every fifth answer, a confetti and ITEM RESTORED banner when an item hits 100%, and optional retro beeps (Sound toggle). Progress is kept in this browser only. Skip, or press Does not apply to hide a field for that item (stored as `na`). Photos can be added by https address or from a file. Nothing is published until you press Save to GitHub.

## Admin tools for photos and data quality

- **Review and save**: the Save button first shows a review: items added, removed and changed, with each changed field as old and new, and per-item Revert or Restore. Nothing is published until you confirm.
- **Photo audit**: loads every photo link in your browser (where Wikimedia is reachable) and lists the ones that fail. One button removes the broken timeline photos from `images-data.js`.
- **Timeline Photo Safari**: walks every timeline hardware entry that has no real photo, asks Wikipedia for its lead image, and offers it only if it is hosted on Wikimedia Commons (free license). Press K to keep or N to skip. Kept photos are saved to `images-data.js` in one commit.
- **Health check**: items under half complete, unconfirmed dates, estimated prices, possible duplicates, items the timeline cannot match, items with no photo, and timeline hardware that is not in the museum yet (with an Add button).

## Play pages

- **Daily Dig** (`#/daily`): three questions a day from one timeline entry (year, price or maker, which came first). Same questions for everyone each day, a streak, and a copy-and-paste result line. `#/daily/practice` is unlimited and does not count.
- **Build Your Rig** (`#/build/<year>`, 1991 to 2002): spend 10 points on a CPU, RAM, video and sound card, then each real game of the era with requirements on file is checked against your rig. Points are a game mechanic, not prices.
- **Ad Lab** (`#/adlab`): pick any item or timeline entry, style (flyer, magazine, catalog), size and headline, and download the tribute ad as a PNG. The store and phone number are made up.

Progress for these is kept in this browser only.

## Quick fill and private fields (Admin page)

- **Quick fill**: on the Add an item form, type a name and press Look it up. It searches the timeline first (name, maker, date, MSRP, specs and description fill in), then Wikipedia. The Wikipedia import reads the whole article: infobox fields become specs, maker, release date, MSRP and discontinued year; the main article sections, the infobox facts, a See also list and the lead image are kept and shown on the item page with CC BY-SA credit. Only empty fields are filled. Nothing is saved until you press Add, so you can change every field. Wikipedia is the only outside source; other databases need an API key, and a key cannot be kept secret on a static site.
- **Private fields** (paid, bought from, value, location, serial, private notes): encrypted in the browser with your passphrase (AES-256-GCM, PBKDF2 600,000 rounds) before they are saved. The public site only ever holds scrambled text. Because that text is public, use a long passphrase; anyone can try to guess it offline.

## Timeline data

Each row is `[date, kind, title, price, note, source]`. An empty source shows an asterisk on the date, meaning unconfirmed. A price ending in `*` is an estimate. `timeline-extra.js` (`TLX`) is keyed by title and holds `maker`, `dev`, `type`, `specs`, `detail`, `links` (`[other title, relation]`) and `conf` (high, med, low).

Timeline links: open an entry and press **Copy link** to get an address like `#/timeline/1989/Sound%20Blaster%20(original)` that opens that entry. **My trail** is a visitor's own starred list, kept in that browser only. Item pages show their timeline connections and which connected pieces are in the museum; the catalog's **Next up** view lists connected pieces that are not in the collection yet.

## Security notes

- Passphrase vault: AES-256-GCM, PBKDF2-SHA-256 with 600,000 rounds, 12+ character passphrase required, backoff and erase after 10 wrong tries. Only fine-grained tokens are accepted. A copied browser profile can be guessed at offline, so use the Generate button.
- Memory Maze has no test hooks. Each win gives a run code that the game replays move by move to verify the score.

## Games by system

Open any game on the timeline to see which systems it came out on, the release date for each system and region, how long each port took, and the minimum and recommended PC requirements where they are on file. The **Games by system** tab has a year-by-system heat map, filters (system, kind of system, genre, decade, has requirements, 3+ systems), sort options, and lists such as most ported and longest wait for a port. The **Rig checker** picks an era PC or a museum machine and lists the games it can run. Item pages for computers and consoles list games from their era on that platform.

`games-data.js` format: `GX[title] = {r:[[system, date, region]], g:genre, n:minimum, m:recommended, s:source, c:confidence}`. Requirements marked as general knowledge are not checked against a source; the display says so. About 20% of games have requirements on file.

## Peripherals

The timeline has a Peripherals kind (about 340 entries): mice, keyboards, controllers, sound and graphics cards, drives, modems, printers, console accessories. Each has a category, how it connects (`Connection`), and the systems it worked with (`plat` in `timeline-extra.js`). The **Peripherals** tab filters by category, system and decade. Item pages list games and peripherals from the item's launch window (six months before to two years after) for the system it runs, and for computers with CPU speed and RAM in their specs they show which of those games the machine can run. Game cards list peripherals linked to them. Dates and prices without a source show an asterisk.

## Readability and themes

Colors come from tokens (`--bg --panel --ink --mute --blue --line`, plus link tokens `--lk --lk-v --lk-h` and paper tokens `--paper-lk --ink-on-paper`) that are redefined in every theme, so links and badges stay readable on any background. Tribute ads use their own newsprint palette so they look the same in every theme.

## Visual system

- **Item page**: a header with the title, badges (release, maker, MSRP, score, working, status, type) and an "Also in <year>" strip of other launches that year. Photos sit in a double-border frame with a REAL PHOTO tag and a credit placard; the drawn picture stays underneath as the placeholder if a photo is missing or fails.
- **Motion**: a Motion toggle in the header (default follows the system's reduced-motion setting). When on: a short CRT flicker between pages, card lift on hover, photo fade-in, and reward animations on Daily Dig and Build Your Rig. When off, all animation and transitions are disabled site-wide.
- **Style guide**: `#/styleguide` shows every shared component (buttons, tags, bars, stars, badges, score chips, icons, messages, cards, ad logo plate) in all six themes at once. Fix colors through the tokens, not per page.
- **Contrast sweep**: a script checked about 20 pages in every theme for text under 3.5:1 contrast. The only real finding was the Build Your Rig star color, now fixed. (The timeline window title bar is reported by the checker but uses a gradient behind white text, so it is fine.)

## Icons and generated art

Every timeline entry, ad and catalog item without a photo gets a picture drawn in code (no image files). `art.js` chooses by kind, title words, genre and the system the game debuted on (a PC game is a box, an NES game a cartridge, a PlayStation game a disc case, and so on) and is seeded by the title, so each one is stable. Small pixel icons from `icons.js` appear on kind pills, category chips, system chips, catalog cards and spines, tables and home tiles. To add an icon, add a 12-row string array to `PXG` in `icons.js` and a rule in `PXKIND`, `PXSUB`, `PXGENRE` or `PXCAT`. To add a product drawing, add a regex to `ICON_KINDS` and a branch to `prodObj2` in `art.js`.

## Games, round 3

**Admin quest (`#/admin`)**: Photo Safari (quest and Timeline) has *Skip for now (S)*, which defers an item without rejecting it, and the Timeline version has *Undo last keep (U)*. New modes: **Boss Battle** (an item with 1 to 8 blanks; HP is the blank count, defeat gives +40 XP and a rare relic), **Speed Round** (60 seconds, Y/N on answers the timeline already knows, combo scoring, personal best), **Daily Quests** (3 goals per day, +25 XP each, bonus relic for all three), **Relics** (14 collectibles in common/rare/epic), and new badges (Boss Slayer, Dragon Hunter, Speed Demon, Collector, Quest Giver). The timeline lookup now also matches peripherals and cards.

**Play (`#/play`)**: one shared profile (`cm-play` in localStorage) with XP, levels, 12 badges and a Trophy room (`#/trophies`). New games: Higher or Lower (`#/higher`, `#/higher/adj`), Timeline Sort (`#/sort`), Mystery Photo (`#/mystery`). Daily Dig gains a 50/50 hint (half credit, shown as ◩), streak shields, stats and a 14 day calendar. Build Your Rig gains Wanted games with a bounty, a best-next-upgrade hint and a best-build reveal. Ad Lab gains stickers, a saved-ads gallery and more headlines.

## Round 4: tools and extras

- **Tests:** `npm install && npx playwright install chromium && npm test` runs `tests/smoke.js`, which loads every route, fails on any script error, tries every theme and checks for sideways scrolling at phone width. `.github/workflows/smoke.yml` runs it on every push.
- **Admin:** a "Photo of the week" card on the admin home jumps straight to that timeline entry in Timeline Photo Safari.
- **Share pictures:** every game result has *Download picture* (a 1200x630 DOS-window card). `#/today` makes a ready-to-post "Today's find" in Story, square and wide sizes.
- **Search:** `#/search` (press `/` anywhere, or type `find voodoo` at the prompt) searches items, hardware and games. Item pages show a "Featured in video" row from the item's videos. The home page has a Random year button.
- **Games:** Retro Bingo (`#/bingo`), Disk Error Hangman (`#/hangman`), and *Save to floppy* on the Trophy room to move progress between devices.
- **Fun:** a bouncing-window screensaver after 2 idle minutes (or type `screensaver`), a dial-up modem (type `dial`), and the Konami code.
