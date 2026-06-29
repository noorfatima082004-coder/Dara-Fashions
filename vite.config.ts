import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { qrcode } from 'vite-plugin-qrcode'

export default defineConfig(({ command }) => ({
  plugins: [react(), ...(command === 'serve' ? [qrcode()] : [])],
  server: {
    host: true,
  },
}))
