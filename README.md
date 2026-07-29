# Sicack

Reddit-like social app powered by **Firebase Realtime Database**.

**Live site:** https://charlie-lipscomb.github.io/Sicack/

## Firebase setup (required for the live backend)

1. Open [Firebase Console](https://console.firebase.google.com/) → project **sicack-c8858**
2. **Build → Realtime Database** → create the database if it does not exist (pick a region, start in **test mode**)
3. Open the **Rules** tab and publish:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

4. Reload the live site. You should see a green banner: **● Live — Firebase Realtime Database**

If you see a red **Offline** banner, the rules are still blocking access — fix step 3.

> Test-mode rules are fine for a demo. Lock them down before a real production app.

## How data works

| Action | Backend |
|--------|---------|
| Load home / forum / search | `onValue` listener on `/posts` |
| Create post (when logged in) | `push` to `/posts` |
| First empty DB | Seeds sample posts once (`/meta/seeded`) |

Everyone on the live site shares the same posts in real time.

## Local development

```bash
npm install
npm run dev
```

Uses the same Firebase project — not separate localhost-only data.
