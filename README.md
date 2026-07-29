# Sicack

A Reddit-like social media app with forums, post search, sign-in, and Firebase Realtime Database.

**Repo:** https://github.com/Charlie-lipscomb/Sicack  
**Live (GitHub Pages):** https://charlie-lipscomb.github.io/Sicack/

## Run locally (this is the reliable way to test)

```bash
git clone https://github.com/Charlie-lipscomb/Sicack.git
cd Sicack
git pull origin main
npm install
npm run dev
```

Then open the URL Vite prints — usually **http://localhost:5173**

You should see a header, search bar, post feed, and sidebar. If the page is still blank:

1. Open browser DevTools (F12) → **Console**
2. Copy any red error messages and share them

## Firebase rules (required for cloud posts)

Firebase Console → Realtime Database → Rules:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

If rules block access, the app falls back to local mock data automatically.

## GitHub Pages setup

1. Repo → **Settings** → **Pages**
2. Under **Source**, choose **GitHub Actions**
3. After a push to `main`, wait for the deploy workflow to finish (Actions tab)

## Features

- Home feed + forums (r/technology, r/funny, etc.)
- Search posts
- Log in and create posts
- Firebase Realtime Database (with local fallback)
