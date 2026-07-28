# Reddit Clone

A simple Reddit-like social media application built with React. Features include:

- Browse and search posts
- Navigate forums (subreddits)
- Create posts when signed in
- Firebase Realtime Database integration (placeholder)

## Features

- **Home Feed**: View recent posts across all forums
- **Forums**: Browse specific communities (e.g., r/technology, r/funny)
- **Search**: Search posts by title or content
- **Authentication**: Sign in / Sign out (mock auth for demo; ready for Firebase Auth)
- **Create Post**: Submit new posts when authenticated
- **Firebase Realtime Database**: Placeholder configuration ready for real-time data sync

## Tech Stack

- React 18 + Vite
- React Router for navigation
- Firebase (Realtime Database placeholder)
- CSS for styling

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/Charlie-lipscomb/reddit-clone.git
   cd reddit-clone
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Firebase (optional for full functionality):
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Realtime Database
   - Copy your config into `src/firebase.js`

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open http://localhost:5173 in your browser

## Firebase Setup Placeholder

See `src/firebase.js` for the configuration placeholder. Replace the placeholder values with your actual Firebase project credentials to enable real-time database features.

## Project Structure

```
reddit-clone/
├── public/
├── src/
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── PostCard.jsx
│   │   ├── CreatePost.jsx
│   │   ├── ForumList.jsx
│   │   └── SearchBar.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Forum.jsx
│   │   ├── Search.jsx
│   │   └── Login.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── data/
│   │   └── mockData.js
│   ├── firebase.js          # Firebase Realtime DB placeholder
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
└── vite.config.js
```

## License

MIT
