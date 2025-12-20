import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    css: true,
  },
  build: {
    // Code splitting configuration
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'redux-vendor': ['@reduxjs/toolkit', 'react-redux'],
          'ui-libs': ['framer-motion', 'react-hot-toast', 'react-icons'],
          'map-libs': ['leaflet', 'react-leaflet'],
          'payment-libs': ['@stripe/stripe-js', '@stripe/react-stripe-js'],
          'chart-libs': ['recharts'],
        }
      }
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'], // Extra safety
      }
    },
    // Source maps for debugging (disable in production for smaller size)
    sourcemap: false,
    // CSS code splitting
    cssCodeSplit: true,
  },
  // Development optimizations
  server: {
    hmr: {
      overlay: false // Reduce development overhead
    }
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom',
      '@reduxjs/toolkit',
      'react-redux'
    ]
  }
})
