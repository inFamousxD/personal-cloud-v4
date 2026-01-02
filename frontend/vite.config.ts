import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['image.png', 'stalker_icon.ico'],
            manifest: {
                name: 'Personal Cloud V4',
                short_name: 'Cloud V4',
                description: 'Personal Cloud Application',
                theme_color: '#1a1a1a',
                background_color: '#1a1a1a',
                display: 'standalone',
                icons: [
                    {
                        src: '/android-launchericon-48-48.png',
                        sizes: '48x48',
                        type: 'image/png'
                    },
                    {
                        src: '/android-launchericon-72-72.png',
                        sizes: '72x72',
                        type: 'image/png'
                    },
                    {
                        src: '/android-launchericon-96-96.png',
                        sizes: '96x96',
                        type: 'image/png'
                    },
                    {
                        src: '/android-launchericon-144-144.png',
                        sizes: '144x144',
                        type: 'image/png'
                    },
                    {
                        src: '/android-launchericon-192-192.png',
                        sizes: '192x192',
                        type: 'image/png',
                        purpose: 'any maskable'
                    },
                    {
                        src: '/android-launchericon-512-512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any maskable'
                    }
                ]
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'google-fonts-cache',
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60 * 24 * 365
                            },
                            cacheableResponse: {
                                statuses: [0, 200]
                            }
                        }
                    }
                ]
            }
        })
    ],
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    // Separate vendor libraries
                    'vendor': ['react', 'react-dom', 'react-router-dom'],
                    // Separate UI libraries
                    'ui': ['styled-components', 'react-redux', '@reduxjs/toolkit']
                }
            }
        }
    }
})