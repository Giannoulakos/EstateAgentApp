import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
  define: {
    'process.env': 'import.meta.env',
  },
  envPrefix: 'REACT_APP_',
});
