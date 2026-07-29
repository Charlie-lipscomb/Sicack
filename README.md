# Sicack

Premium community feed with **Firebase Authentication** + **Realtime Database**.

**Live:** https://charlie-lipscomb.github.io/Sicack/

## Firebase setup

### 1. Realtime Database rules

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

### 2. Authentication (required for accounts)

1. Firebase Console → **Build → Authentication** → **Get started**
2. **Sign-in method** → enable **Email/Password**
3. **Settings → Authorized domains** → add:
   - `localhost`
   - `charlie-lipscomb.github.io`

Without step 2–3, create account / sign in will fail on the live site.

## Features

- Email + password accounts (Firebase Auth)
- Profiles stored under `/users/{uid}` in Realtime DB
- Live posts under `/posts`
- Dark premium UI with motion
