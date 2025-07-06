import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
  build: {
    rollupOptions: {
      external: [
        'keytar',
        'axios',
        'jwt-decode',
        'electron',
        'os',
        'url',
        'dotenv',
      ],
    },
  },
});
