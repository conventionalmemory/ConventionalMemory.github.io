# ConventionalMemory.io

A retro DOS-style museum catalog, timeline and trivia game. It is a plain static site: no build step, no server.

## Files

| File | What it is |
| --- | --- |
| `index.html` | The page shell, styles and security policy |
| `app.js` | The site code. Socials, wanted list and settings are at the top |
| `items.js` | The museum items. Rewritten by the Admin page |
| `timeline-data.js` | The timeline (about 1,650 dated entries, 1974 to 2010) |
| `games-data.js` | Per-system release dates, genre and PC requirements for about 530 games |
| `games.js` | Games views: system chips, release-by-system table, requirements, the Games by system tab, the Rig checker |
| `timeline-extra.js` | Extra detail per timeline entry: maker, specs, description, connections. Used by the timeline, the game and the admin autofill |
| `catalog.js` | The interactive catalog (chips, score slider, Cards, Shelf, Time machine and DIR views) |
| `quotes.js` | Quotes |
| `game.js` | The Memory Maze game (`#/maze`) |
| `tl.js` | The timeline page (chart, year view, price map, My trail, filters, connection web, deep links) |
| `ads.js` | Tribute ads: product drawings and the per-item ad |
| `admin.js` | The Admin page (`#/admin`) |

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
