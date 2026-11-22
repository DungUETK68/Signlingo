import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const isMobileBuild = process.env.VITE_MOBILE_BUILD === 'true'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Khi build cho Android Mobile (Capacitor), dùng thư mục dist-mobile và không copy 392MB video VSL400 vào APK
  publicDir: isMobileBuild ? false : 'public',
  build: {
    outDir: isMobileBuild ? 'dist-mobile' : 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/ai': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ai/, '/api')
      }
    }
  }
})
