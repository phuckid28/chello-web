import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
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
