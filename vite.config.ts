import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@bosch/frontend.kit-npm/styles/frontend-kit.complete.css": path.resolve(
        __dirname,
        "node_modules/@bosch/frontend.kit-npm/dist/styles/frontend-kit.complete.css"
      ),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        widget: path.resolve(__dirname, 'widget.html'),
      },
    },
  },
})
