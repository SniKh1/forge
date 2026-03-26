import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    include: ['src/**/*.test.ts'],
    exclude: ['src-tauri/**', 'dist/**', 'node_modules/**'],
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    watch: {
      ignored: [
        '**/src-tauri/target/**',
        '**/dist/**',
      ],
    },
  },
});
