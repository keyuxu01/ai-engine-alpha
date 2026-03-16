import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    viteSingleFile({
      useRecommendedBuildConfig: false,
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@ui': resolve(__dirname, './src/components/ui'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'src/index.ts'),
        'flight-list': resolve(__dirname, 'src/ui/flight-list.html'),
        'flight-detail': resolve(__dirname, 'src/ui/flight-detail.html'),
        'user-list': resolve(__dirname, 'src/ui/user-list.html'),
        'user-detail': resolve(__dirname, 'src/ui/user-detail.html'),
      },
    },
  },
});
