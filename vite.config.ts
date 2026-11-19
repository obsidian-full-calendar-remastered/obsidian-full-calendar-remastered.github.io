import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        ai: resolve(__dirname, 'ai/index.html'),
        pricing: resolve(__dirname, 'pricing/index.html'),
        success: resolve(__dirname, 'success/index.html'),
        privacy: resolve(__dirname, 'privacy/index.html'),
        terms: resolve(__dirname, 'terms/index.html'),
        refunds: resolve(__dirname, 'refunds/index.html')
      }
    }
  }
});
