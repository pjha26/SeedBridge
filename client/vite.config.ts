import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // All /api requests in dev are forwarded to the Express server.
      // This means the client can use relative URLs ("/api/auth/login")
      // instead of hardcoding http://localhost:5000, and avoids CORS
      // preflight during development.
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
