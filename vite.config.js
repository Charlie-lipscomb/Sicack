import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// production build (npm run build / GitHub Actions) → /Sicack/
// local dev (npm run dev) → /
export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/Sicack/' : '/',
})
