import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import svgr from 'vite-plugin-svgr'

// https://vitejs.dev/config/
export default defineConfig({
  // Cho phép sử dụng process.env, mặc định là không, phải thông qua import.meta.env
  define: {
    'process.env': process.env
  },
  plugins: [
    react(),
    svgr()
  ],
  // base: './'
  optimizeDeps: {
    exclude: ['js-big-decimal']
  },
  resolve: {
    alias: [
      { find: '~', replacement: '/src' }
    ]
  }
})
