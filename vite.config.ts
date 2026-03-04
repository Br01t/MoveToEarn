import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: '/',
      publicDir: 'public',
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        VitePWA({
          registerType: 'autoUpdate',
          injectRegister: 'auto',
          workbox: {
            globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,xml,txt}'],
            cleanupOutdatedCaches: true,
            navigateFallbackDenylist: [/^\/sitemap\.xml$/, /^\/robots\.txt$/],
          },
          manifest: {
            name: 'ZoneRun',
            short_name: 'ZoneRun',
            description: 'Move-to-Earn Strategy Game',
            theme_color: '#111827',
            background_color: '#111827',
            display: 'standalone',
            orientation: 'portrait',
            icons: [
              {
                src: 'https://fjvmeffshcivnoctaikj.supabase.co/storage/v1/object/public/images/logo.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'any maskable'
              },
              {
                src: 'https://fjvmeffshcivnoctaikj.supabase.co/storage/v1/object/public/images/logo.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any maskable'
              }
            ]
          }
        })
      ],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});