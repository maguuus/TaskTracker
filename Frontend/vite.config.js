import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [plugin()],
    base: '/',
    server: {
        port: 5173,
        fs: {
            strict: false
        } 
    },
    test: {
    globals: true,
    environment: 'jsdom',
  },
})