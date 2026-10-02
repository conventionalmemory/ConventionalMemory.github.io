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

**Screen effects:** the *Screen* button in the header cycles off, CRT and max CRT (saved on this device). CRT adds a vignette, film grain, a slow rolling bar, phosphor glow on headings, a power-on warp at page load and a typed-in page title. Max adds screen curvature, stronger scanlines, RGB fringing on titles, rare flicker and a glitch on link hover. Everything animated also stops when Motion is off, and the effects never intercept clicks.

## Round 5: the "More" hub (`#/more`)

`more.js` is lazy-loaded and holds these pages:

- **Tours** (`#/tours`): seven guided museum tours with a progress bar; finishing one gives XP.
- **Explorer** (`#/explore`): filter, sort and compare up to 4 items, with bars for numeric specs.
- **Timeline**: zoom timeline (`#/zoom`, six lanes, drag, minimap), what-was-happening day view (`#/day/1995-08-24`).
- **Era Mode** (`#/era/1995`): the whole site dresses as a year (theme, banner); leave from the banner.
- **My stuff** (`#/mine`): own / want / trade lists, saved in this browser, with missing-from-a-family reports.
- **Jukebox** (`#/jukebox`): three tracks and four sound-card imitations, all synthesized (approximations, not recordings). Click sounds toggle with `cm-sfx`.
- **Community** (`#/community`): no server. Visitors send memories and corrections as prefilled GitHub issues. Approved ones go in `memories-data.js` (`MEMORIES`, `FIXES`).
- **Theater** (`#/theater`): a retro TV. It plays your own item videos first (the `videos` field on an item, `{t,u}` YouTube links), then `theater-data.js` (`THEATER`), then the visitor's queue. It ships with no embeds; links go in that file. Embeds use youtube-nocookie.
- **Shorts** (`#/shorts/<id>`): vertical cards as PNG for Shorts / Reels.
- **Install** (`#/install`): PWA install, offline cache (`sw.js`, https only) and a calendar `.ics`.
- Item pages also have *Print spec sheet*, *Add to my collection* and *Suggest a correction*.

**Admin additions:** *Bulk tools* (full JSON backup, CSV export and import with preview, bulk edit, duplicate finder, activity log), *Studio* (video plan sheet per item and a 28-day posting calendar with `.ics` export), photo drop zone and optional crop (4:3, square, 16:9).

## Round 6: the catalog, two ways

`#/catalog` has a **Style** switch (remembered in `cm-catmode`):

- **Mail-order catalog** (`catbook.js`): the collection as a 1990s software-store catalog. Cover, contents with page numbers, a divider per category, four items per page (three on phones), a full index, and an order form. Pages turn with a 3D flip; use the arrow keys, swipe, tap the page edges or the *Jump to* menu. The flip is skipped when Motion is off or the device asks for reduced motion. Items get catalog numbers like `CM-0007` (their position in `items.js`, so append new items rather than reordering).
- **Pro** (`catalog.js`): the previous look, tidied: a sticky search bar, a collapsible *Filters* drawer, removable chips for every active filter, *Group by* category / decade / letter with a jump strip, three densities (Big cards, List, Table) and "Show more" paging at 24 items.

## Round 7: catalog book v2, drafts, purchase source tags

- **Catalog book rebuilt.** Real bending page turns (the leaf is cut into strips, each with its own angle, curl shading and a cast shadow), drag a page to turn it, hover a lower corner to peek, riffle when jumping, thumb-through slider, colored section tabs, bookmark ribbon, closed cover that centers and opens, stacked page edges, desk mat, foil-shine cover, staggered pop-in and stamped score bursts, staff-pick and NEW! stickers, collector's-corner pages, optional paper-swish sound. Honors the Motion switch and prefers-reduced-motion. Pro style is unchanged.
- **Drafts.** Set `"draft": true` on an item (Admin: Draft checkbox, Drafts filter, Publish button). `draftfilter.js` hides drafts from the whole public site while keeping them in `items.js`, so they are still visible in the repository (hidden, not private). Catalog numbers (CM-0001...) come from the full list, so they do not shift when a draft is published.
- **Source tags.** `"src": "ebay"` or `"shopgoodwill"` shows a neutral "Bought on ..." tag (item page, cards, Pro rows, book entries). The sites' real logos are trademarks, so a plain text tag with an original pixel gavel is used.
- **Privacy.** Prices, sellers, order numbers and addresses are never put in `items.js`. They live in the private CSV logs, or in the encrypted private fields in Admin.

## Timeline links (Round 7b)

- An item can carry `"tl": "<exact timeline entry title>"`. Where the item leaves maker, release date, price, description or specs blank, the entry's values are shown (marked "shares ..." in the Collection record). The item's changelog, notes, photos and private fields are never sent to the timeline.
- The timeline shows a linked item once, using the entry's date and note, and no longer lists the entry separately.
- In Admin, the item form has a **Timeline link** box (suggest matches, fill my blanks, copy my details into the entry, and edit the entry's date, price, note, maker, developer, detail and specs). Edits are saved to `timeline-edits.js` (keyed by title) alongside `items.js`; the big timeline data files are untouched.
- Once you have unlocked Admin on a device, timeline entries show an **Edit entry (admin)** button that opens the same editor (`#/admin/tle/<title>`). Visitors never see it.

### Round 7c: Pro default, separate timeline editor
- Catalog opens in **Pro** by default; the mail-order book is one click away (Style switch) and remembered.
- Pro cleanup: compact stats, tags collapsed under "Browse by tag", a scrolling category strip, grouped by category by default, clamped card titles, shorter search box.
- Editing a catalog item never writes to the timeline. A linked item only inherits blank fields from its entry.
- Timeline entries are edited in a separate admin tool (Timeline editor), saved to `timeline-edits.js`.

### Round 7d: Photo Safari candidates
Photo Safari (items and timeline) now searches Wikipedia article images and Commons files (several query variants incl. maker), scores them against the name/model tokens, drops logos/diagrams/screenshots/tiny images, and offers up to 8 ranked thumbnails to choose from. Needs `commons.wikimedia.org` in the CSP connect-src.

### Round 8: looser Photo Safari, more photo areas, drafts, research pass
- Photo Safari tries progressively looser searches (full name, simplified, core words, maker plus line, family) and marks "looser match" thumbnails. Every card has a "search for something else" box.
- Timeline Safari can target hardware, software, games, or events/web/other; a button jumps to catalog items.
- 69 of 74 items are drafts (hidden publicly) until verified; 5 test items stay live. Draft items still show in admin.
- Research pass: eBay/ShopGoodwill and older items got confirmed maker/model/year/price/specs/text where sources agreed. Each has `refs` (shown as Sources), `verify` (what is unconfirmed, admin-side) and `conf` (high/med/low).

### Round 9: image libraries, mine vs stock, accessories
- Every item (and every accessory) can hold many images. Each is tagged Mine or Stock (`photoMeta`, keyed by image address; stock keeps its credit and file page). `photos[0]` is the card image: use "Use on card", or "Use my photo" / "Use stock photo".
- The item editor's Images box has uploads, address, and "Find stock images" (same ranked, looser search as Photo Safari, with its own search box).
- Accessory lines get an images box and an optional link to a catalog item. "Make it its own catalog item" creates a draft item tied back with `for`.
- `for` on an item lists the items it works with (an item can belong to several). Their pages list it under Accessories and companions; its own page shows Works with.
- Item pages credit stock photos and label gallery images Mine or Stock.

### Round 10: clean titles, copies, folder item pages
- Item names are just the item: no year, store, condition or lot contents (those live in specs, condition and the record). 47 renamed.
- Owning more than one: one catalog item with Quantity set, plus a `units` list (one entry per copy: source, working, condition). Five pairs were merged this way (Libretto 110CT, Mavica FD200, Game Boy Pocket, Wii, Game Boy Color). The editor has a Copies box.
- Item pages are now a folder with DOS function-key tabs: 1 About, 2 Specs, 3 My copy, 4 History, 5 Links (press the number keys). Specs sit in titled cards, long text folds under Read more, photos are a contact sheet under the main picture, and the era and ad blocks are collapsed "[+]" drawers.

### Round 11: catalog front and navigation
- Pro catalog front (`catfront.js`, shown when nothing is searched or filtered): a MEM /C panel (one clickable bar segment per department), hanging-sign department tiles, Exhibit of the day, a Mystery crate, scrollable aisles (Just in, Hall of fame, Time capsule by decade, Found in the wild; hidden when under 3 items) and Other ways to browse (shelf, time machine, next up, DIR). Any search, filter, department or view leaves the front; "Back to the aisles" returns. The tag browser now lives in Filters.
- `#/catalog/cat/<Category>` opens a department directly.
- Navigation: Catalog, Timeline, Explore, Play, Theater, My stuff, Community, Search. Each of the middle five is a hub (`#/hub/explore|play|watch|stuff|community`) defined once in `SITE` (more.js). `#/more` is now the Site map. The old Wanted, Follow and More links moved into Community and the Site map; old URLs still work. The current section is highlighted and a DOS-style breadcrumb sits above each page. The footer and `C:\>` prompt commands were updated (`explore` = hub, `spec` = Spec Explorer, `map` = site map).

### Round 12: item page rebuild
- The folder is now full width with seven tabs: About, Specs, My copy, Era, The ad, History, Links (keys 1 to 7, pixel icon on each). The photo and gallery moved into About beside the text. The top banner ad, the bottom flyer shelf and the two collapsed sections at the bottom are gone.
- Era (`eraPane` in app.js) replaces "Around this date": a year header, then a switch between Games (the Press START widget, with counts), News and tech (two dated columns linking into the timeline), The PC of the day, and Accessories (the old "accessory loot", now its own panel). `gxEra(it,"games"|"loot")` returns one half.
- The ad tab shows the full store flyer at readable width, a New headline button that cycles the copy, and More from the flyer rack.
- A slim bar above the page links Previous, All <category> (opens that department) and Next; actions (Add to my collection, Shorts, Suggest a correction, Print) are buttons under the hero. On phones the badges are compact, the "Also in" strip scrolls sideways and the tab bar sticks to the top.

### Round 13: header and every screen size
- Header is two rows that never wrap: brand and display settings (Theme, Motion, Screen) on top, a menu bar of the eight sections below. On phones the settings become icon plus value, and the menu bar scrolls sideways with a fade on the cut-off edge and keeps the current section in view.
- `tests/widths.js` visits 16 pages at 320, 360, 390, 600, 768, 1024, 1280 and 1920 px and fails on any sideways scroll or element poking past the edge. It found the home title (320 to 360 px) and the item page's long previous/next names, both fixed. It is part of `npm test`.

### Round 14: the ten recommendations
1. **Publish queue** (Admin list, Publish queue button): steps through drafts, most trusted and most complete first. It shows a checklist (photo, year, maker, description, specs, sources, where I got it, condition), the research note ("What to verify"), the sources to check against, and Publish, Edit first, Skip. The public catalog front shows a **Coming soon** box that lists draft names only.
2. The two IBM 5150 drafts are merged into one (`ibm-5150`, a draft): your unit's data plus the Wikipedia specs, text and MSRP.
3. **Photos**: the admin home shows photo coverage for published items and drafts, and Photo Safari now takes published items first, then high-confidence drafts. Stock photos for the live items still need doing from the admin (this workspace cannot reach Wikimedia).
4. **Story** field (`story`): "The story: why it is in the museum". It has its own box in the item editor, a Fill-in Quest card (25 XP) and a "The story" panel at the top of About.
5. Home now has **Latest from the museum**: newest exhibit next to the latest video (the newest item that has one), then more new arrivals.
6. **Collection report** (`#/report`, under Explore): totals, department table, working status, needs attention, still wanted, full inventory. Print or save as PDF, CSV download, and a switch to include drafts.
7. **Share card** button on item pages: draws a 1200 x 630 PNG (photo or illustration, title, score bar) to download, share (where the browser supports it) or copy the link.
8. **Museum health** on the catalog front: percent of published items with photos, specs, description, score, sources and a story.
9. **RSS**: `feed.xml` (linked from the page head, the home page and the changelog) is built by `tools/build-feed.js`. `.github/workflows/feed.yml` rebuilds it whenever `items.js` changes.
10. **Print**: the spec sheet now prints the header, About, Specs, My copy, History and Links (each with a heading), and leaves out the Era and Ad tabs, tab bar, buttons and related cards. `tests/print.js` checks this.

### Round 15: the ten lab features
1. **Does it run?** (`#/runs`, `lab.js`): pick a machine to see every game it can run (well, at minimum, not yet), pick a game to see which machines in the museum run it, or open the matrix. Custom rig form for a machine you do not own.
2. **Dream rig** (`#/rigs`, `lab2.js`): choose board, CPU, RAM, OS and cards; the resource map flags IRQ, I/O port, DMA and slot conflicts like real hardware did. Auto-resolve moves IRQs with jumper hints (I/O and DMA clashes cannot be moved, just as two Sound Blasters cannot share). Parts you own in the museum are marked. Save builds (browser only), copy as text, or download a card PNG.
3. **Repair journal**: changelog lines take extras: `2026-05-01 | Repair | Recapped board | before=photo#1 | after=photo#2 | parts=capacitors | hrs=2`. The History tab shows a drag slider between before and after, plus job, hour and parts totals. `photo#N` refers to the item's Nth photo.
4. **Video tab**: `Title | URL | 0:00 Intro; 1:20 Boot` in the admin Videos box. The item gets a Video tab (and a Watch button in the header). Nothing loads from YouTube until you press play (youtube-nocookie.com); chapter buttons restart at that time.
5. **Benchmark wall** (`#/bench`): admin Benchmarks box, `Test | number | unit | lower | note`. Each item's Specs tab shows its rank among the museum's machines for that test.
6. **Collection value** (Admin, Collection value): opens every item's encrypted private fields in memory with your passphrase, totals paid and estimated value, imports prices from pasted CSV (`name or id, paid, value, bought from, location`), and exports an insurance schedule (CSV or copied text). Everything is stored only as `privEnc`; `tests/admin.js` checks that the saved items.js never contains the plain numbers.
7. **Trade matching** (Wanted page, "I have one"): type what you have; it checks the wanted list and the accessory gaps, notes if the museum already has one, and builds a message to copy or send on any social. No server, nothing is sent from the page.
8. **Guided walk** (`#/walk/YEAR`, also linked from every `#/era/YEAR`): seven stops (welcome, news, shelf, games, the PC you wanted, the ad, step inside), arrow keys work, and years up to 2000 get a browser frame.
9. **What next?** (`#/advisor`): ranks 23 collecting milestones against what the museum already holds and what the wanted list is missing, with search links.
10. **Swap-meet mode** (`#/hunt`): fast lookup (type, scan a barcode where the browser supports it) of "do I already have this?", a price ceiling checker and a hunt list kept on the phone. `sw.js` (now `cm-v13`) precaches the pages and data on install so it works with no signal; visit once on Wi-Fi first.
- `tests/lab.js` covers rig conflicts, the walk, trade form, journal slider, video chapters and benchmarks; `npm test` now runs it.

### Round 16: stuck states, merges, and the toy aisle
**Stuck states fixed**
- Catalog filters now live in the address (`#/catalog?c=Laptops&d=1990&v=shelf`). The Catalog menu link (plain `#/catalog`) always returns to the front, Back from an item restores the filters, and a filtered address can be bookmarked or shared. `#/catalog/cat/<Dept>` still works.
- Unknown addresses show a real not-found page (with Connie, a "did you mean", and a search box). A year outside the timeline says so instead of silently showing another year.
- Era mode no longer restyles Admin. The Zoom timeline renders only the entries near the screen (about 500 buttons instead of 2,000+). Community forms have a **Copy it instead** button for people without a GitHub account.

**Merged and tidied**
- Related pages share a tab bar (`TABSETS` in app.js): Museum stats (numbers, report, memory map, 640K scale), Daily (Dig, Today's find, Bingo), What's new (changes, follow), A year (era, walk, day, zoom), Machines (does it run, dream rig, benchmarks, rig challenge), My lists (collection, wish list, swap-meet, what next, back up). Hubs are grouped under sub-headings.
- Item pages have 6 tabs: About, Specs, Video (only when there is one), Era and ad, My copy and history, Links.
- Catalog: Sort, Group and Show as (Big/List/Table) moved into **Filters and display**. "Time machine" is now **By year**, "Next up" is **Not here yet**.
- **Back up my stuff** (`#/backup`): one file with everything saved in the browser (collection, wish list, hunt list, rigs, progress, prizes, settings). Admin tokens and passphrases are never included; restore only accepts known keys.
- Saved Dream rigs appear in Does it run? ("My dream rigs"), and `#/rigs/<code>` shares a build by link.
- All styles moved out of `index.html` into `style.css` (same cascade order). Admin buttons are grouped into Edit, Review and Tools.

**The toy aisle**
- **Connie Ventional**, the mascot: a pixel memory module with gold contacts, a pink bow and a very good attitude (`mascot()` in icons.js), in four colors. She bobs, blinks, waves and taps her feet; click or tap her for a quip and a hop. Animations stop with reduced motion or Motion: off.
- **Wish list** (`#/wish`, `toys.js`): one live list over circled items, "Want" marks in My collection and the swap-meet list. Max price per item, eBay and ShopGoodwill search links, a printable Dear Santa letter, and a share link (`#/wish/<code>`, up to 40 items, no server). In the mail-order catalog every entry has a red **Circle it** button; item pages have **Add to wish list**.
- **Demo kiosk** (`#/kiosk`): attract mode with slides, "PRESS START", a big-button menu on any key or touch, back to the slides after 45 idle seconds, Escape to leave, optional full screen.
- **Prize counter** (`#/prizes`): every 3 XP is a ticket plus one free ticket a day. Spend them on stickers, new Connie colors, and the Golden Floppy.
- **Store intercom** on the home page ("Attention shoppers..." lines built from the day's exhibit, counts, and the timeline) and **aisle numbers** on the catalog department signs.
- Tests: `tests/nav.js` (stuck states, not-found, zoom) and `tests/toys.js` (wish, backup, prizes, kiosk, tab bars). `tests/widths.js` accepts `WROUTES=a,b,c` to check a few pages.

- **Makers** (`#/maker`, `#/maker/IBM`): every company with exhibits and timeline hardware; item pages link to their maker. **Manuals and references** (`#/manuals`) collects every link by exhibit. **Print labels** (`#/labels`): a sheet of item-number labels with the web address as text (no QR codes yet). **Start here** (`#/start`): six "how do you feel" paths with Connie.

**Not done**: one shared streak across the three daily games (they share a tab bar but keep their own streaks), unified search results, visitor photo submissions, walk audio, a full accessibility pass.

### Round 17: real labels (QR, Code 128, Phomemo printing)
- **Permanent label numbers.** Every item has a `cm` number in items.js (shown as `CM-0007`). Admin assigns the next free number when an item is saved and never reuses one, so a sticker stays valid. Duplicates are renumbered on save. Numbers 1 to 68 match the old position-based labels.
- **Scan addresses.** `#/t/7` opens exhibit CM-0007 (a draft shows "being prepared"; an unknown number shows a not-found page). Typing `CM-0007` in the search box, the C:\> prompt, or the Scan page also jumps to it.
- **`#/labels`** (labelprint.js, labelui.js, qr.js): size presets (40x30 default, 30x20, 40x20, 50x30, 30x30, 50x50, 50x80, custom), QR code, Code 128 bars, or both, live preview at 203 dpi, pick items, copies. Output: **print straight to a Phomemo over Bluetooth**, download PNG, or print with the browser at exact label size. `#/labels/<id>` pre-selects one exhibit (item pages have a Print label button). The web address baked into QR codes is editable (default: this site) and remembered with the other settings.
- **Printing over Bluetooth is experimental.** It uses Web Bluetooth (Chrome on a computer or Android, not Safari or Firefox) and the M110-family protocol reverse-engineered by others (BLE service 0xFF00, characteristic 0xFF02, ESC/POS raster). It is verified against a simulated printer: tests rebuild the picture from the exact bytes and decode the QR and bars with a real decoder. It has **not** been tried on a real M221. Test print, shift, darkness, label type and slow mode are in the page for tuning.
- **`#/scan`**: type or scan (handheld scanners type the code and press Enter) a label, the full address, or a UPC; phone camera scanning where the browser has BarcodeDetector; optional **inventory mode** that checks off each scanned exhibit and lists what is missing (stored on this device, included in Back up my stuff).
- QR and Code 128 are generated by qr.js with no outside libraries. Tests: `tests/labels.js`; admin tests check label numbers on save.

### Round 18: catalog overhaul, About, link crawler, cleanup
- **Catalog rebuilt (catalog.js).** One search box with live suggestions (exhibits, makers, departments, label numbers, "search the timeline") and "did you mean"; one row of department chips; one toolbar with **Show** (In the museum / Not here yet), **Sort**, **View** (Cards, List, Table, Shelf, Book, By year) and **More filters** (group by, minimum score, decade, condition, a plain-language legend). Active filters appear as removable chips with Clear all and "Showing X of Y". Everything is in the address (`#/catalog?c=Laptops&v=list&s=name`), the chosen view is remembered, and "Not here yet" is a Show option instead of a view.
- **Small museum, no splash.** The aisle signs (catfront.js) only appear when there are 24 or more exhibits (`CATFRONT_MIN`). Until then the catalog opens straight on the cards.
- **Keep your place.** Back from an exhibit restores scroll position and filters. Item pages step through the list you came from ("Back to the list (3 of 12)") and forget it when you leave the catalog. Cards have a **Quick look** button (dialog with Previous/Next, focus trapped, Escape closes).
- **Cards**: equal height, maker and year on one line, tags on another, "Bought on" badge hidden in the catalog. Phone: one column, a sticky bottom toolbar, tap targets of 36px or more.
- **About (`#/about`)**: the museum story with a "character select" screen. Portraits are in `portraits/` (Matt in a Colonel's Bequest style, Tony in a Torin's Passage style). The bios and stats live in the `CREW` array in toys.js. Linked from the footer, home page and Community hub.
- **Central address.** `SITE_URL` and `SITE_HOST` in app.js drive the QR codes, share links and feeds. `tools/set-domain.js` changes them together.
- **Link crawler (`tests/crawl.js`)**: follows every in-site link, clicks the buttons on the busy pages, and checks for not-found pages, script errors and keyboard traps. It found that Rigs linked to unpublished exhibits (fixed: a draft now shows "museum" without a link).
- **Staff-only tools.** Print labels, Scan/inventory, Swap-meet mode, What next?, Today's find, Data check, the Style guide, the item-page "Print label" button and the report's "include drafts" box are out of the public menus. They open only on a device where Admin has been unlocked once (the `cm-admin` flag, see `isStaff()` in app.js); everyone else sees a "Staff only" note. Admin's list page has a Staff row of links, `#/staff` lists them all, and the footer shows a Staff tools link on staff devices. This is tidiness, not security: nothing private is in those pages and saving always needs the GitHub token. Test: `tests/staff.js`.
- **Cleanup**: dead functions and CSS removed, label numbers in the Book now use the permanent `cm` number, long URLs wrap on phones. New tests: `tests/catalog.js`, `tests/crawl.js`, `tests/security.js`.

### Round 19: timeline fill-out
- **Timeline grew from 2,083 to 3,070 entries** (about 1,000 added), with detail records for most hardware, peripherals, software and games. New rows cover 1971 to 2012: processors, consoles, home computers worldwide, peripherals, operating systems, games, company and industry events, US law and court cases, key web and internet launches, and a few movies and TV shows.
- **About 630 rows show an asterisk.** Web checking was cut short when the research tool was rate-limited partway through, so roughly 360 of the new rows are from general knowledge and have no source. Those, and about 270 older ones, stay marked as unconfirmed until someone checks them (the `source` field is empty). Confirmed rows say "Wikipedia" or give the page.
- **Fixes to existing rows**: 47 launch prices added, 18 dates made more precise or corrected (US launch dates for the 3DS, Vita, DSi, Balance Board and others), 136 older dates confirmed, 11 duplicate rows merged (links redirected), five rows moved to the right kind (HX-20, MX-80, ST-506, Virtual Boy, MDA), MS-DOS 3.0 and 3.30 dates and the Amiga 3000 date and price corrected.
- **Still to do**: rerun the research for the asterisked rows when web access allows; a few dates the agents flagged as conflicting between sources were left alone (Populous, Civilization, Atari Lynx, Atari 5200, Pitfall!, Starcade, Crystal Caves, Heroes of Might and Magic II).

### Round 20: Connie Ventional
- The mascot is now **Connie Ventional**, a female memory module (hair, bow, gold edge contacts, little pin legs and shoes). Same four colors from the prize counter, plus three moods: happy, wow (the not-found page) and oops (the missing-label page).
- **Animated everywhere she shows up**: Start here, About, not-found, missing label, the prize counter and shelf, the demo kiosk, and the PA announcement bar. She bobs, blinks, waves three times on arrival (and again on hover), taps her feet, and hops with a quip when clicked or tapped. Animation turns off with the system reduced-motion setting or the Motion: off button.
- **About page, round two**: the save file chapters now run in release order with years (adventure games 1989 to 1995, Final Fantasy 1990, Warcraft and StarCraft 1994 to 1998, Diablo II 2000), and gained a Star Wars MUDs chapter (engineering empires and game economies), the Zack in every adventure party, and who did what (Tony drove, Matt mapped). Workstation gets four new hotspots for the real objects: PC Gamer, pager, Tamagotchi and Blockbuster card.
- The About page also gained a "Finnish Cottage Simulator" chapter (the latest game), plus new stat lines on the crew cards: Matt hoards everything, Tony accidentally axes the quest-giving NPC.
- **MegaZeux, researched**: first sold as DOS shareware on Dec 4, 1994 by Alexis Janson, with Zeux II: Caverns of Zeux; inspired by ZZT; scripted in Robotic (first called Robo-P); the games and source were freed in 1998 and it is now GPL, latest 2.93d (June 2025). About gets a MegaZeux chapter (Tony drew all the custom art, Matt programmed very well, every game lost to old hard drives) and a "MegaZeux, a love letter" section with a fact list and timeline links. Sources: gametechwiki, GiantBomb, WiiBrew, Open Shop Channel and an archived Wikipedia copy; the community wiki (digitalmzx.com) blocks automated fetching so its details were not used.
- **Star Wars: Rise in Power, researched**: TopMudSites says it was created in 1999 by two friends who wanted their own Star Wars Reality variant, set about two years after Endor, roleplay required, player killing restricted. Star Wars Reality was begun in early 1997 from early SMAUG code (1.0 stable July 21, 1997). Nothing found about its clan or economy systems, so the About page only repeats what Matt and Tony told us. The chapter is dated 1999 onward.
- **Timeline now 3,092 entries** (+22 since Round 19): MegaZeux, Zeux II, the 1998 free release, MegaZeux 2.83 and 2.93d, Star Wars Reality 1.0, Star Wars: Rise in Power, Super ZZT, QBasic, Pinball and Adventure Construction Sets, Shoot-'Em-Up Construction Kit, Klik & Play, The Games Factory, RPG Maker, Adventure Game Studio, Game Maker, MUD1, TinyMUD, LPMud and DikuMUD. ZZT's detail record was rewritten. The MegaZeux and Star Wars rows are sourced; about half of the other new rows have no source and show the unconfirmed asterisk.
- **About and Start here intros rewritten** around Matt's mission: chronicling his love of vintage technology, repairing and restoring broken computers, preserving their history and building the collection, with Tony roped in again. Matt's bio gained his EMT and emergency-room work, his lifelong tinkering, and his Doom, Duke Nukem 3D and Visual Basic days. The MUD timeline grew to 3,105 entries (AberMUD, LPMud, TinyMUD, DikuMUD, MOO and LambdaMOO, Merc, CircleMUD, ROM, Realms of Despair, SMAUG and more, with dates from MUD history pages; Scepter of Goth is dated 1983 or 1985 depending on source).
- About page smoothed: shorter intro, fuller bios (Matt's three boys and the cable inheritance joke, Tony as the artist), achievements in story order, one closing paragraph, README.TXT ends with "Three heirs, interest pending."

### Round 21: Memory Maze gets the crew
- **Sprites redrawn** to match the portraits: Matt in a backwards white cap, stubble and a red and blue shirt; Tony in the three-point jester hat with a gray beard.
- **New residents**: Connie Ventional (a pixel memory chip with a bow who bounces in place) restores up to 16K of memory when you talk to her; Zack turns up in every game and nobody knows why; Auntie Autoexec still points the way. Two Connies, two Aunties, one Zack and two copies of the other brother fill the house. A "Also in the house" row on the start screen shows who to look for.
- **Jokes everywhere**: new lines for Matt (EMT, cables, hoarding, the lost graph paper, the boys inheriting everything) and Tony (the accidental axe, the jester hat, who holds the controller), room names like The Totally Real Cow Level, Dupe Vault and Wrong Button Gallery, new flavor text, and win and game-over lines from Connie.
- **Eight new questions**: MegaZeux's Robotic language, ZZT, MUDs, Star Wars Reality's SMAUG base, Doom WADs, Duke Nukem 3D's Build engine, QBasic and Diablo II's cow level.
- Old run codes become unreplayable because the questions and cast changed; the best-run display marks them "unchecked". `tests/maze.js` plays both characters to a win and checks the run code replays.

### Round 22: Connie is clearly Connie
- **Reads as a RAM module**: two small black chips on her board, a notch in her gold contacts like a real memory stick, plus a name badge under her in the main places ("Connie Ventional, RAM module, 640K"): About, Start here, the prize counter, the demo kiosk and the not-found page.
- **Clippy-style speech bubbles**: click, tap or press Enter on her and a yellow bubble with a tail types out a tip while her mouth moves. Tips depend on the page you are on ("It looks like you are browsing the catalog. Would you like help?"). Buttons: Another tip, Thanks Connie. Esc, a click elsewhere or leaving the page closes it. She says hello by herself once per visit on About and Start here. With reduced motion or Motion: off the text appears at once.
- She can be reached by keyboard (focusable, Enter or Space) and her label says to press for a tip.
- About intro rearranged: a lead sentence, what Matt does (with Tony roped in), then the 'simpler time' idea as a pull quote, then the 640K name.

### Round 23: more Connie, and a separate admin page
- **Connie in more places**: empty catalog and site searches, an empty wish list, an empty timeline filter, tag pages with nothing on them, "My stuff" with nothing in it, and she guards the staff-only door. Blockbuster card hotspot on About moved to the card at the right of the monitor base.
- **Separate admin page**: the admin now lives at `admin.html` (same app, own Content-Security-Policy that also allows GitHub, Wikipedia and Wikimedia Commons). The public `index.html` policy now allows connections to the museum's own origin only, so a bug or injected script on a public page cannot send anything to those hosts. `#/admin` on the public page moves you to `admin.html`. After editing `index.html`, run `node tools/build-admin.js` to rebuild `admin.html`; a test fails if they drift apart.
- **GitHub Actions pinned** to exact commits (checkout v4.2.2, setup-node v4.4.0) instead of moving version tags. To update them, look up the new tag's commit and change the hash.

### Round 24: site-wide fact check
- **Timeline**: all 3,102 rows went to research agents in 24 slices. About 480 rows gained a source link (unconfirmed rows dropped from about 630 to 148), about 1,000 patch operations were applied in all: prices added or corrected (Altair 8800 launch $397 kit, ZX80 kit £79.95, Amiga 2000 $1,495 and many more), dates fixed (MS-DOS 2.0, Amstrad CPC 464, Starcade, Descent II, Chrono Cross, Xbox 360 Elite and others), wrong notes and kinds corrected, and three duplicate rows removed (TIPC Network, World Wide Web goes public, Radeon HD 5870 Eyefinity). 240 more Commons photos were added (188 to 428).
- **Price conventions**: free, open-source, shareware, bundled and never-sold items no longer show an MSRP. `Free`, `Shareware`, `Included with ...` and `n/a` are shown as "Price:", everything else as "MSRP:". MegaZeux, the MUD codebases, Linux, Python, Firefox and about 60 more now read Free or Shareware. Those labels come from well-known licensing history and were not individually source-checked.
- **Games, items, quotes**: 210 game entries got corrected release lists or source links, 5 museum item prices were reworded, 4 quotes were re-attributed (the Miyamoto delayed-game line, Dijkstra, Douglas Adams, Cargill).
- **Limits, honestly**: the web-search quota ran out partway, and most research agents could only read cached Wikipedia pages and DBpedia, so most changes rest on one source. Conflicting dates were left alone and are listed in the fact-check notes (for example Pitfall!, Populous, Atari 5200 price, Tekken 2, Counter-Strike beta). 148 timeline rows are still unconfirmed and about 1,500 game and hardware rows have no launch price (the page labels any estimate "Typical price then"). Photo file names came from DBpedia and Commons lists, not from looking at each photo, so use the photo safari to swap any that are wrong.

### Round 25: manuals and ads links, photo review, repair case files, Connie helps
- **Manuals and ads**: item and timeline pages list links to manuals, datasheets, brochures, ads and reviews that live on other sites (nothing is copied here, because scans are still under copyright). `docs-data.js` now holds 400 titles; the new links were only taken from pages the research agents actually read. Each page also has ready-made searches on the Internet Archive, Bitsavers and the web.
- **Second research pass** over all hardware and peripheral rows: about 226 more price, source and date fixes. Foreign launch prices are shown in their own currency (for example JPY 59,800).
- **Photo review**: the admin audit page lists the 240 photos added by the fact check so you can tick the wrong ones and remove them in one commit.
- **Repair journal** (`#/journal`) with before/after sliders, plus new **symptom** and **fix** fields on changelog lines (`| symptom=no power | fix=new battery`), shown as a small case file.
- **Connie helps**: "What is this?" explains the page you are on, "Surprise tour" takes you to a random item or timeline entry.

### Round 26: affiliate links
- `affiliate.js` holds two settings, `AFF.amazon` (Associates tracking ID, like `yourname-20`) and `AFF.ebay` (eBay Partner Network campaign ID, a 10 digit number). While a setting is empty (or malformed) that network's links and the disclosure line are switched off.
- With IDs set, item pages (Links tab), timeline hardware, software and game entries, and the Wanted page's accessories list get "Search eBay" and "Search Amazon" links for that product. They are plain search links (no prices copied), marked `rel="sponsored noopener noreferrer"`, with the required disclosure under each box and in the footer.
- Amazon links look like `amazon.com/s?k=<name>&tag=<tag>`; eBay links look like `ebay.com/sch/i.html?_nkw=<name>&campid=<id>&customid=cm&toolid=10001&mkevt=1&mkcid=1&mkrid=711-53200-19255-0`.

### Round 27: repair parts links and the Workbench
- **Parts and supplies** on item and timeline pages (Links tab): by category and era, suggests Amazon searches for the usual repair parts (CMOS or PRAM battery, IDE to CompactFlash adapter, Gotek floppy emulator, floppies, MIDI cables, tri-wing screwdrivers, contact cleaner, isopropyl). They are suggestions, not fit guarantees, and the box says to check the exact model. Rules live in `affPartsFor` in `affiliate.js`; books, cables, adapters, lots and games get none.
- **The Workbench** (`#/workbench`, footer link appears once a tool is published): grouped tools with a "why I use it" line and Amazon (and eBay once its ID is set) links. Data lives in `workbench-data.js`: `WB_PHOTO` is the bench picture (kept in `portraits/`), a tool may carry an `asin` to link straight to one Amazon product, and tools marked `draft:true` stay hidden from visitors (staff can see them).

### Round 28: a classier affiliate shelf, Matt's bio
- **One "shelf" box per item or timeline entry** (`gear.js`), replacing the search box: *Keep it running* (parts and accessories chosen by category and era: CMOS or PRAM batteries, replacement packs, IDE to CompactFlash or SCSI2SD or XT-IDE, Gotek, controllers and power supplies for home consoles, cleaning supplies), *Further reading* (about 20 real books matched on keywords, such as Masters of Doom, Console Wars, Racing the Beam, Hackers), and a one-line *Find one of your own* (eBay and Amazon for hardware, Blu-ray or DVD for movies, "find a copy" for games). Only suggestions that make sense for that machine appear; early PCs get no CMOS battery, Macs get SCSI2SD not IDE, handhelds get no controller.
- **Disclosure kept short**: one small line inside each box and on the Wanted and Workbench pages, plus a footer link to a Disclosure page (`#/disclosure`) with the full text. The long footer line is gone.
- Matt's bio now says he likes to help people and make a difference in the ER, and that he wrote games in Visual Basic, XNA, Unity, Godot and more.
- Test hardening: two flaky checks (Connie's memory restore, zoom entry click) now retry or tolerate timing.

## Round 29: readability and layout cleanup, Memory Maze art and questions

- **Affiliate box**: its class name collided with the catalog bookshelf's `.shelf` (dark gradient, brown border), which made the links unreadable. It is now `.affb.affs`. Timeline cards are light "paper" in every theme, so muted text and small labels on them use `--mute-on-paper` instead of the theme's light muted color.
- **Class collisions fixed**: the home-page mailbox (`.mb`) was shrunk by the memory-bar `.mb`; it is now `.mbox`. The kiosk's `.k-p` color no longer leaks onto the timeline filter pills. Selected tabs and chips use `--blue-ink` for contrast in all themes.
- **About page**: "Swedish Cottage Simulator" is now "Finnish Cottage Simulator".
- **Memory Maze sprites**: redrawn as 12x27 pixel sprites (head, body and a four-frame walk cycle, mirrored for left and right). Matt now faces the way he walks and stands still when idle; NPCs turn to face you; the gremlin hops.
- **Memory Maze questions** come from site data, so new items, timeline rows and quotes become questions with no code changes: item descriptions, categories, quotes (person attributions only), "which came out in YEAR", "which cost the most", plus the earlier kinds. Only the small `STATIC` DOS-lore list is hand-written (10% of questions). `CMGame.probe(deps,n)` generates questions for tests; `tests/maze.js` checks 900 questions are valid and that a made-up item appears. Run codes now include a generator version (`g2`), so codes from before this change show as "changed since" instead of failing to replay.

## Round 30: Memory Maze people, key safety, easy-question guard, self-updating theater

- **Matt and Tony sprites** are redrawn from the photos and About portraits (Matt: backwards white mesh trucker cap, auburn beard, red and navy polo; Tony: red, green and blue jester hat, gray beard, ruffled red shirt, jester collar, striped pants, white sneakers). Sprites are pixel grids at the top of `game.js` (`MATT_UP`, `TONY_UP`); the walk cycle and legs are drawn by code.
- **Connie** appears more: three of her are hidden in the house, she shows in the question panel, and she comments after right and wrong answers.
- **Key bug**: A and D are both answer keys and WASD walk keys, so a held key could answer a question the instant it opened. Answer keys are now ignored for 0.5 s after a question opens, while repeating, or if the key was already held; arrow keys never answer.
- **"Too easy" guard**: `leaks()` in `game.js` spots a question that gives itself away (the answer spelled out in the question, or the only option sharing a distinctive word with it, like "IBM" for the IBM Model M). `fix()` scrubs it on the fly instead of skipping it: the giveaway words become blanks (Who made the "____ Model M"?), and when that leaves a title too bare a data-driven clue is added from the timeline or catalog (year, kind, maker: Which of these followed "____ G5" (the 2003 machine from Apple)?). Company names always count as giveaways; everyday title words (star, sound, pro) and bare numbers do not. In a 1,500-question sample none were dropped.
- **Retro Theater** now plays the channel's videos newest first with no manual updates. `.github/workflows/youtube.yml` runs `tools/build-youtube.js` every six hours: it finds the channel from its @handle, reads the public RSS feed, and merges the newest uploads into `youtube-data.js`. Run it once by hand from the Actions tab (Refresh YouTube videos, Run workflow) to fill the list right away. The page reads that file only; nothing contacts YouTube until a video is played.

- Matt's sprite was redrawn from scratch as a side-profile head with a backwards white baseball cap (domed crown with a seam, a bill pointing behind him), hair at the back, ear and auburn beard.


## Round 31: Connie, her family and the Funnies

- **cast.js** (loaded before icons.js): the drawing of Connie and the whole Ventional family as rectangles on a 24 by 24 grid. `CMCast.folk(cfg)` is the one routine that draws every chip person; looks (`LOOKS`), accessories (`ACCS`) and colors (`COLORS`) are plain data tables, so adding one is one entry. `mascot()` in icons.js now just asks cast.js for her and keeps the CSS animation group names (`mc-legl`, `mc-armr`, `mc-bow`, `mc-eyes`, `mc-mouth`). She now has gold-contact shoes (a comb of gold fingers), a bow with ribbon-cable streamers and six moods (happy, wow, oops, wink, love, sleep).
- **Wardrobe and unlocks**: what she wears is saved under `cm-connie` (look, accessory) and `cm-prizes` (color). Free: Classic, Punk, Skater, headphones, floppy clip. Tickets at the prize counter: Plaid punk, Racer, Cyber, Prom night, joystick hat, 80s shades, propeller beanie, little crown, and the colors. Earned only by playing: Aerobics 1985 (read all 22 Funnies), BBS Sysop (10 stars in Memory Manager), Hacker (100 XP), Basement explorer (escape the Memory Maze), Grunge (all 24 stars), Sysop headset (6 stars), Power LED halo (clear all 8 levels). Rules live in `CMCast.unlocked()`.
- **connie.js** (loaded on demand): `#/connie` (file, family album, history scrapbook), `#/funnies` (11 strips and 11 one-panel gags, drawn live from the cast; a panel counts as read after it has been on screen for a second), `#/closet`, `#/memman` (Memory Manager: fit a game into 640K with HIMEM, EMM386, DOS=HIGH and LOADHIGH; eight levels, three stars each, a CONFIG.SYS preview) and `#/stickers` (printable sheet).
- **Family names are period puns**: Connie Ventional (b. 1981, the PC’s birthday), Emma 386 (b. 1985, the 386 and expanded memory), Hiram “Himmy” (b. 1988, Himem.sys and the high memory area), Raymond “Ram” and Rhoda (née Reed-Only) as the parents, Grandpa Floyd Dysk and Grandma Winnie Chester, Auntie Autoexec is Augusta Batch, Uncle Conrad Figsys, Tessie R. Resident (a TSR), Nibble, and friends Dot Matrix, Vivian G. Adapter, Sandy Blaster, Maureen “Mo” Dem and Zachary “Zack” Zip.
- The maze Connie (game.js `chip()`) wears her saved look in the 16 EGA colors.
- Tests: `tests/connie.js`. Service worker cache is now cm-v38.

### Round 32: Tony, Timeline Sort and affiliate coverage
- Tony's bio and the About page were rewritten in the site's voice (his jokes kept; MegaZeux is no longer the opening line; co-op partner for life, brother, and the axe-and-the-quest-NPC line all called out; extra jokes in the stats and Connie's quips).
- Timeline Sort (play.js `sortSet`) now retries until it has a full set of five, narrowing the year gap only as a last resort. It used to hand out four cards about half the time in round 1.
- Every catalog item and every timeline entry (hardware, peripherals, software, games, consoles, movies, events, legal, world events) now shows both an eBay and an Amazon search link, several where they apply (`gear.js` `gearFinds`, `tl.js`). The links are searches, never single listings, so they don't die when a listing ends. `tests/affiliate.js` checks all of them. The eBay campaign ID (5339217307) is set in `affiliate.js`.
- `node tools/build-affiliate-csv.js` writes `affiliate/ebay-bulk-upload-NNN.csv` (one link per line, no header, 1500 per file, for the EPN bulk link tool) and `affiliate/ebay-search-map.csv` (each search with its entry and the plain and tracked links). Uploading is optional: the site already builds tracked links itself.

### Round 33: Connie everywhere, the guys' wardrobe, sticker sheets, contact email
- Connie has her own tab in the main nav, a corner on the home page, footer links, command-line shortcuts (`connie`, `funnies`, `closet`, `memman`, `stickers`) and a Start here tile.
- Uncle Conrad and Raymond have a wardrobe (`OUTFITS` in `cast.js`): 15 outfits, board colors and accessories, picked in the closet (saved in `cm-connie.fam`) and shown on the family page and sticker page.
- `node tools/build-sticker-sheets.js` writes the print-ready 8.5x11 in, 300 dpi PNG sheets to `stickers/` (Connie's looks, the family, two museum-joke sheets, Big Connie, Conrad, Raymond, Big Uncle and Dad). They are linked from the Stickers page.
- House rule for jokes: Matt and Tony are brothers. Use "Player 2" or "brother", never anything that reads as a couple.
- Contact email (ConventionalMemory@gmail.com) is `EMAIL` in `app.js`; it shows in the footer, mailbox, About, Wanted and the affiliate disclosure.

### Round 34: cameos, animation, pets, trading cards, the Mall, kiosk stage
- Family cameos (`CAMEO` in `cast.js`, `addCameo()` in `app.js`): a family member turns up on pages that suit them, always introduced by Connie. Everyone idles and reacts, and Memory Manager has a How to play panel and Hint/Solution.
- Conrad and Raymond are visibly different (Conrad: fringe, brow glasses, goatee, bow tie, mug; Raymond: short gray hair, round glasses, mustache, manual). The guys' wardrobe now has 15 outfits, including **Keynote** (black turtleneck, round glasses, jeans), used by Conrad in the iPod shop.
- Two new family pets, **Mat the Mouse** (born 1984) and **Toner** (born 1986), are nods to Matt and Tony without being them: a wired mouse and a toner-cartridge puppy. Rule: no look-alike characters, and nobody in Connie's world is called Matt or Tony. They appear in gags, cameos (Search and Report pages), cards, stickers and the shop.
- Trading cards: `CMCast.card()` draws any card. `#/cards` has all 18 family cards (Connie is number one and the only holofoil). About has Matt and Tony cards (`CREW_CARDS` in `toys.js`; ham license is a stat). The family card data is `CARDS` in `connie.js`.
- Matt's bio on About is short (ham radio is only a stat) and Minecraft lives only in the shared BROTHERS.SAV story. Tony is the younger brother.
- Animation library: `CMCast.ANIMS`, `CMCast.play(svg,"cheer")` (two at once: `"stroll carry"`), `CMCast.stopAnim()`; CSS under "animation library" in `style.css` (20 moves). `#/animations` shows every move and every scene. Add a new move by adding an entry to `ANIMS` and a rule `html[data-motion=on] svg.cc.an-<name> ...`; `tests/connie.js` checks every move really changes something.
- `stage.js` (`CMStage.mount(el)`, `.run("carry",{name})`): little scenes with Connie as the star and the family working around her (carrying exhibits, dusting, cooking, soldering, printing, arcade, closet fashion show, mall construction). The demo kiosk (`toys.js`) runs one under every slide; slide types: item, hw, game, quote, fact, family, closet, mall.
- The Conventional Memory Mall (`shop.js`, `#/shop`, `#/shop/<store>`, `#/ipods`): a mock-up, under construction, no payment of any kind. Six storefronts (Connie's Corner, Stick Around, Mint Condition, Pin Cushion, Stuff-A-Chip, Tony's iPod Works), a directory, a cart (`cm-cart` in this browser) and an order request that is just an email (`mailto:`), copy or print. All prices, stock and what-fits-what are placeholder data: products are `PROD`, iPod models `MODELS`, mods `MODS` (with `fits` by family and `needs`) in `shop.js`. The iPod builder is a pretend early-90s desktop (rainbow pear, no real logo or names); three or more mods trigger the Connie Combo (10% off the mods). `tests/shop.js` covers it.
- Print sheets (`node tools/build-sticker-sheets.js`) now include a pets sheet and three trading-card sheets (2.5 x 3.5 in cards, nine per page, plus Matt and Tony and card backs). Service worker cache is `cm-v47`.

### Round 35: polish pass on Connie's world
- **Three pets, not two**: Nibble the hamster (b. 1982), Mat the Mouse (1984) and Toner (1986). Story has its own "Three pets, zero memory" chapter (9 chapters now), cards/shop/stickers say "three pets", and the pets sticker sheet is now `8-the-three-pets`.
- **Fact-check fixes**: Conrad's CONFIG.SYS dates from 1983 (DOS 2.0), Mo is "she", Zack born 1989 (PKZIP), Tessie *sits on* 16K rather than eating it daily, Doom's extender needs a 386 or better, and Hiram (b. 1988) no longer appears in a 1987 strip; "Hiram Lives Upstairs" moved to March 1991 and now points at DOS 5 "this summer".
- **Jokes and bios** trimmed and sharpened (FAMILY bios, CAMEO lines, STORY, a few strips and gags). Matt and Tony's quips rewritten (`toys.js` CREW).
- **Stage (`stage.js`)**: props now actually show (the empty-prop CSS rule was hiding broom, spoon and duster), speech bubbles clamp inside the stage or move to the side, actors face the way they walk and mirror their props, wall decorations (`deco`), pixel effects (`A.fx`), a playfield that squeezes toward the middle on wide screens, long family cameo lines are cut to the first sentence. Three new scenes (shelve, garage, music) for 14 in all. Test checks bubbles stay inside the stage.
- Service worker cache is `cm-v48`.

### Round 36: search engines
- The app lives behind `#/` addresses, which Google does not index. `node tools/build-seo.js` now writes real pages: `history/<slug>/` (one for each timeline entry with real text, 2,372 of 3,102), `year/<yyyy>/`, `decade/<yyyy>s/`, `history/` (front door), `museum/<id>/` for published exhibits, plus `sitemap.xml`, `robots.txt` and `404.html`. Each page has its own title, description, canonical, Open Graph and Twitter tags, JSON-LD (Article or CollectionPage plus breadcrumbs), related entries and "also in this year" links, previous/next links, and a "Find one of your own" box with eBay and Amazon links built by `affiliate.js` and `gear.js` (every link is `rel="sponsored"`). Pages use no script and link on to the interactive museum.
- `node tools/build-seo.js --check` verifies the files are current (`tests/seo.js` runs it; in CI a stale result only warns). `.github/workflows/seo.yml` rebuilds and commits the pages whenever timeline or item data changes.
- `index.html` gained a description, canonical, social tags, WebSite and Organization JSON-LD, font preconnects, a no-script fallback inside `<main id="app">` and footer links to the new pages. `og.png` (1200 x 630) comes from `node tools/build-og.js`.
- The canonical host comes from the `CNAME` file in the repo root (`conventionalmemory.io`); `node tools/set-domain.js <domain>` rewrites every address that depends on it and `--github` reverts to the github.io address.
- **IndexNow** (Bing, Yandex, DuckDuckGo's partners): `tools/indexnow.js` posts new or changed URLs; the key file `<key>.txt` in the repo root is public on purpose. The search-pages workflow runs it after every rebuild, and "Run workflow" with the button submits every URL once. Google ignores IndexNow.

### Round 37: guides, books and Connie on every page
- **Books are timeline entries.** A new kind `bk` (Book) in `timeline-data.js`, with details in `timeline-extra.js` (specs: Author, Publisher, Pages, ISBN, Subject; links to the games and machines they cover). Rows with a source link to Wikipedia or name the catalog used; unverified ones have no source and show an asterisk. `gear.js` gives books "Find a copy" and "Find the audiobook" links, `art.js` draws a generated cover, and `TLINV` in tl.js phrases the reverse links ("covered in").
- **The Bookshelf** (`#/books`, `books.js`): a spine shelf (taller means more pages), eight shelves with a family reader on each, and a card for every book with Amazon and eBay links. `BOOKSHELF` at the top of `books.js` lists which titles sit on which shelf. The static version is `/books/`, built by `tools/build-seo.js` from the same data.
- **Guides** (`/guides/`, data in `tools/guides.js`): three buyer guides and an index. Expensive gear comes in three levels (`TIERS`: top shelf, the sweet spot, value pick). Picks are brand-name gear only; every link is a search link marked `rel="sponsored"`.
- **Connie and the family on static pages.** `tools/build-seo.js` loads `cast.js`, writes the sprites it needs as shared SVG files in `cast/`, and adds a cameo to every generated page (entries by kind, year and decade hubs, exhibits, guides, books, 404). Interactive pages use the `CAMEO` table in cast.js, which now covers every route, plus a pool for item pages.
- **Menus.** Tab and chip rows wrap on wide screens and swipe without scrollbars on phones.
- Service worker cache is `cm-v53`.
