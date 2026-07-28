# Sicack

A Reddit-like social media app with forums, post search, authentication, and Firebase Realtime Database.

**Live site:** https://charlie-lipscomb.github.io/Sicack/

## Features

- Home feed with real-time posts from Firebase
- Forums (r/technology, r/funny, r/AskReddit, etc.)
- Search posts by title, body, forum, or author
- Sign in and create posts
- Firebase Realtime Database sync

## Local development

```bash
git clone https://github.com/Charlie-lipscomb/Sicack.git
cd Sicack
npm install
npm run dev
```

Open http://localhost:5173/Sicack/ (or the URL Vite prints).

> **Note:** Because this is set up for GitHub Pages, the Vite base path is `/Sicack/`. Locally you may need to open that path, or temporarily set `base: '/'` in `vite.config.js` for local-only work.

## Firebase Realtime Database rules

In the [Firebase Console](https://console.firebase.google.com) → Realtime Database → Rules, use something like this for development:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

**Important:** Restrict these rules before going to production.

## Tech stack

- React 18 + Vite
- React Router
- Firebase Realtime Database
