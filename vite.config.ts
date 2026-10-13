import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// For GitHub Pages project sites set VITE_BASE=/<repo-name>/ at build time
// (the deploy workflow does this automatically).
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [react()],
  build: { chunkSizeWarningLimit: 1500 },
})
