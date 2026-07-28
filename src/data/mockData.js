// Mock data used when Firebase is not configured
// This will be replaced by Firebase Realtime Database reads/writes once configured

export const forums = [
  { id: 'technology', name: 'technology', description: 'News and discussion about technology', members: 12500 },
  { id: 'funny', name: 'funny', description: 'Funny posts and memes', members: 8900 },
  { id: 'askreddit', name: 'AskReddit', description: 'Ask and answer interesting questions', members: 15200 },
  { id: 'gaming', name: 'gaming', description: 'Everything about video games', members: 9800 },
  { id: 'science', name: 'science', description: 'Scientific discoveries and discussions', members: 6700 },
]

export const initialPosts = [
  {
    id: '1',
    title: 'What is the most underrated programming language?',
    body: 'I have been exploring languages beyond the usual suspects. What do you think is underrated and why?',
    forum: 'technology',
    author: 'dev_curious',
    createdAt: Date.now() - 1000 * 60 * 45,
    upvotes: 128,
    comments: 34,
  },
  {
    id: '2',
    title: 'When the code works on the first try',
    body: 'That rare feeling when everything compiles and runs perfectly. Celebrate the small wins!',
    forum: 'funny',
    author: 'code_joker',
    createdAt: Date.now() - 1000 * 60 * 120,
    upvotes: 542,
    comments: 89,
  },
  {
    id: '3',
    title: 'What is a small thing that makes your day better?',
    body: '',
    forum: 'askreddit',
    author: 'daily_curious',
    createdAt: Date.now() - 1000 * 60 * 30,
    upvotes: 2100,
    comments: 456,
  },
  {
    id: '4',
    title: 'Best indie games of 2025?',
    body: 'Looking for recommendations. What have you been playing that is not a AAA title?',
    forum: 'gaming',
    author: 'indie_fan',
    createdAt: Date.now() - 1000 * 60 * 180,
    upvotes: 89,
    comments: 67,
  },
  {
    id: '5',
    title: 'New study on climate feedback loops',
    body: 'Researchers found additional amplifying effects that were previously underestimated. Link to paper in comments.',
    forum: 'science',
    author: 'climate_scientist',
    createdAt: Date.now() - 1000 * 60 * 90,
    upvotes: 312,
    comments: 45,
  },
  {
    id: '6',
    title: 'How do you stay motivated while learning to code?',
    body: 'I keep hitting plateaus. What strategies work for you?',
    forum: 'technology',
    author: 'learning_dev',
    createdAt: Date.now() - 1000 * 60 * 15,
    upvotes: 56,
    comments: 23,
  },
]
