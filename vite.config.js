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
  resolve: {
    alias: [
      { find: '~', replacement: '/src' }
    ]
  }
})
