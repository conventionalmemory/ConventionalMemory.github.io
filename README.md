# ConventionalMemory.io

A retro DOS-style museum catalog, timeline and trivia game. It is a plain static site: no build step, no server.

## Files

| File | What it is |
| --- | --- |
| `index.html` | The page shell, styles and security policy |
| `app.js` | The site code. Socials, wanted list and settings are at the top |
| `items.js` | The museum items. Rewritten by the Admin page |
| `timeline-data.js` | The timeline (about 1,070 dated entries, 1974 to 2010) |
| `timeline-extra.js` | Extra detail per timeline entry: maker, specs, description, connections. Used by the timeline, the game and the admin autofill |
| `catalog.js` | The interactive catalog (chips, score slider, Cards, Shelf, Time machine and DIR views) |
| `quotes.js` | Quotes |
| `game.js` | The Memory Maze game (`#/maze`) |
| `tl.js` | The timeline page (chart, year view, search) |
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

## Security notes

- Passphrase vault: AES-256-GCM, PBKDF2-SHA-256 with 600,000 rounds, 12+ character passphrase required, backoff and erase after 10 wrong tries. Only fine-grained tokens are accepted. A copied browser profile can be guessed at offline, so use the Generate button.
- Memory Maze has no test hooks. Each win gives a run code that the game replays move by move to verify the score.
