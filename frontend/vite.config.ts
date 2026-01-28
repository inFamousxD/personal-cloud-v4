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
                theme_color: '#1E2123',
                // theme_color: '#1E2123',
                background_color: '#1E2123',
                display: 'standalone',
                icons: [
                    {
                        src: 'icons/snowflake/android-launchericon-48-48.png',
                        sizes: '48x48',
                        type: 'image/png'
                    },
                    {
                        src: 'icons/snowflake/android-launchericon-72-72.png',
                        sizes: '72x72',
                        type: 'image/png'
                    },
                    {
                        src: 'icons/snowflake/android-launchericon-96-96.png',
                        sizes: '96x96',
                        type: 'image/png'
                    },
                    {
                        src: 'icons/snowflake/android-launchericon-144-144.png',
                        sizes: '144x144',
                        type: 'image/png'
                    },
                    {
                        src: 'icons/snowflake/android-launchericon-192-192.png',
                        sizes: '192x192',
                        type: 'image/png',
                        purpose: 'any maskable'
                    },
                    {
                        src: 'icons/snowflake/android-launchericon-512-512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any maskable'
                    }
                ]
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,wasm}'],
                // Allow larger files for transformers.js models
                maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10MB
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
                    },
                    {
                        // Cache transformers.js models from CDN
                        urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'transformers-models-cache',
                            expiration: {
                                maxEntries: 50,
                                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                            },
                            cacheableResponse: {
                                statuses: [0, 200]
                            }
                        }
                    },
                    {
                        // Cache HuggingFace models
                        urlPattern: /^https:\/\/huggingface\.co\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'huggingface-models-cache',
                            expiration: {
                                maxEntries: 50,
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
                    // Separate transformers into its own chunk
                    'transformers': ['@xenova/transformers'],
                    // Separate vendor libraries
                    'vendor': ['react', 'react-dom', 'react-router-dom'],
                    // Separate UI libraries
                    'ui': ['styled-components', 'react-redux', '@reduxjs/toolkit']
                }
            }
        },
        // Don't warn about large chunks (transformers is big)
        chunkSizeWarningLimit: 2000
    },
    // Important: Don't pre-bundle transformers - it needs dynamic imports
    optimizeDeps: {
        exclude: ['@xenova/transformers', 'onnxruntime-web']
    },
    // Support for web workers (transformers uses workers)
    worker: {
        format: 'es'
    }
})
