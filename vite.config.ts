import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/pack-list/',
  plugins: [react()],
  // Firestore SDK alone is ~600 kB minified; that's expected for this app.
  build: { chunkSizeWarningLimit: 1000 },
});
