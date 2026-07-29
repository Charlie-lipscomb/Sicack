import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Subpath for GitHub Pages project site
  base: process.env.GITHUB_ACTIONS ? '/Sicack/' : '/',
})
