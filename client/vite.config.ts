import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Matching CRA's default or your preference
    open: true,
  },
  build: {
    outDir: 'build', // Keeping 'build' directory name for compatibility
  },
});