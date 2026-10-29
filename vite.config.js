import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import svgr from 'vite-plugin-svgr'

// https://vitejs.dev/config/
export default defineConfig({
  // Chỉ định nghĩa biến BUILD_MODE thay vì toàn bộ process.env để tránh lộ biến môi trường máy build
  define: {
    'process.env.BUILD_MODE': JSON.stringify(process.env.BUILD_MODE)
  },
  plugins: [
    react(),
    svgr()
  ],
  optimizeDeps: {
    exclude: ['js-big-decimal']
  },
  build: {
    rollupOptions: {
      output: {
        // Long-term cacheable vendor chunks: app deploys don't invalidate framework code
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom', 'react-redux', '@reduxjs/toolkit'],
          'vendor-mui': ['@mui/material', '@emotion/react', '@emotion/styled'],
          'vendor-dnd': ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities']
        }
      }
    }
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.js']
  },
  resolve: {
    alias: [
      { find: '~', replacement: '/src' }
    ]
  }
})
