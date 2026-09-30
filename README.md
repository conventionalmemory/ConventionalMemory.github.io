# ConventionalMemory.io

A retro DOS-style museum catalog, timeline and trivia game. It is a plain static site: no build step, no server.

## Files

| File | What it is |
| --- | --- |
| `index.html` | The page shell, styles and security policy |
| `app.js` | The site code. Socials, wanted list and settings are at the top |
| `items.js` | The museum items. Rewritten by the Admin page |
| `timeline-data.js` | The timeline (about 800 dated entries, 1974 to 2010) |
| `quotes.js` | Quotes |
| `game.js` | The Memory Maze game (`#/maze`) |
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

## Timeline data

Each row is `[date, kind, title, price, note, source]`. An empty source shows an asterisk on the date, meaning unconfirmed.
