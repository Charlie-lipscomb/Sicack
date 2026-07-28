import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use /Sicack/ only when building for GitHub Pages; keep / for local dev
  base: process.env.GITHUB_ACTIONS ? '/Sicack/' : '/',
})
