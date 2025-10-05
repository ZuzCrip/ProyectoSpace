import type { UserConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  let build: UserConfig['build'], esbuild: UserConfig['esbuild'], define: UserConfig['define']

  if (mode === 'development') {
    build = {
      minify: false,
      rollupOptions: { output: { manualChunks: undefined } },
    }
    esbuild = { jsxDev: true, keepNames: true, minifyIdentifiers: false }
    define = { 'process.env.NODE_ENV': '"development"', 'DEV': 'true' }
  }

  return {
    plugins: [react()],
    build,
    esbuild,
    define,
    resolve: { alias: { '@': '/src' } },
    optimizeDeps: { exclude: ['lucide-react'] },

    // 👇👇👇  AÑADE ESTO
    server: {
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:8000/',
          changeOrigin: true,
        },
      },
    },
    // ☝️☝️☝️
  }
})