import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Use VITE_BASE_URL for GitHub Pages deployment (e.g., /repo-name/)
  base: process.env.VITE_BASE_URL || '/',
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
