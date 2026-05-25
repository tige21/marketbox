import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import { VitePWA } from 'vite-plugin-pwa'
import { resolve } from 'path'
import pkg from './package.json' with { type: 'json' }

// Deployed at https://marketandbox.ru/app/ — subfolder of the Laravel
// backend, so every asset URL needs the `/app/` prefix.
export default defineConfig({
  base: '/app/',

  define: {
    APP_VERSION: JSON.stringify(pkg.version),
  },

  plugins: [
    react(),
    svgr({ svgrOptions: { exportType: 'named' } }),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'autoUpdate',
      injectRegister: false,
      // No manifest — this is a Telegram Mini App, never installed as PWA.
      manifest: false,
      injectManifest: {
        swSrc: './src/sw.ts',
        swDest: './dist/sw.js',
        globDirectory: './dist',
        globPatterns: [
          '**/*.{js,css,html,ico,png,svg,webp,jpg,jpeg,woff2,woff,ttf,json}',
        ],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
      devOptions: {
        // Keep SW off in dev so MSW + HMR don't fight it for fetch control.
        enabled: false,
      },
    }),
  ],

  resolve: {
    alias: { '@': resolve(__dirname, 'src') },
  },

  // Dev-only proxy: /api/* → https://marketandbox.ru/api/* to avoid CORS
  // during local development. In production the app is served from the same
  // origin as the API so no proxy is needed.
  server: {
    proxy: {
      '/api': {
        target: 'https://marketandbox.ru',
        changeOrigin: true,
        secure: true,
      },
    },
  },

  css: {
    preprocessorOptions: {
      scss: {
        loadPaths: [resolve(__dirname, 'src/styles')],
        additionalData: `@use "variables" as *;\n@use "mixins" as *;\n`,
      },
    },
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks: (id: string) => {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) return 'vendor-react'
          if (id.includes('node_modules/react-router-dom')) return 'vendor-router'
          if (id.includes('node_modules/@tanstack/react-query')) return 'vendor-query'
          if (id.includes('node_modules/framer-motion')) return 'vendor-motion'
          if (id.includes('node_modules/i18next') || id.includes('node_modules/react-i18next') || id.includes('node_modules/i18next-http-backend')) return 'vendor-i18n'
          return undefined
        },
      },
    },
  },
})
