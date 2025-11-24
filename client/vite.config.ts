import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import mkcert from 'vite-plugin-mkcert';

export default defineConfig({
  build: {
    outDir: '../API/wwwroot',
    chunkSizeWarningLimit: 1500,
    emptyOutDir: true,
    rollupOptions: {
      treeshake: {
        annotations: false   // <-- Fix SignalR rollup warning
      }
    }
  },
  plugins: [react(), mkcert()],
  server: {
    https: {}, // mkcert handles HTTPS config
    port: 3000,
  },
});
