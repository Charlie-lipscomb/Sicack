# Sicack

Reddit-like app (React + Vite + Firebase Realtime Database).

**Repo:** https://github.com/Charlie-lipscomb/Sicack  
**Pages:** https://charlie-lipscomb.github.io/Sicack/

---

## Why the page looked empty

`index.html` only has an empty `<div id="root">`. React fills it **after** JavaScript loads.

- Opening the file on disk (`file://…`) → **will not work**
- Opening the raw GitHub file → **will not work**
- GitHub Pages with source = “branch / root” → serves this HTML but **not** Vite’s JS → blank
- Correct local run: **`npm run dev`**
- Correct Pages: source = **GitHub Actions** + successful deploy

---

## Run locally (do this)

```bash
git clone https://github.com/Charlie-lipscomb/Sicack.git
cd Sicack
git pull origin main
npm install
npm run dev
```

Open **http://localhost:5173** (or whatever URL Vite prints).

You should see the orange header, posts, and forums. The “Loading app…” box disappears once React starts.

---

## GitHub Pages

1. Repo → **Settings** → **Pages**
2. **Source** = **GitHub Actions** (not “Deploy from a branch”)
3. **Actions** tab → wait for “Deploy to GitHub Pages” to be green
4. Open https://charlie-lipscomb.github.io/Sicack/

Routing uses hash URLs (`/#/`, `/#/login`, `/#/r/technology`) so Pages works without special redirects.

---

## Firebase rules

Realtime Database → Rules (dev):

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

If Firebase fails, the app still shows local mock posts.
