import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages はリポジトリ名のサブパスで配信されるため、相対パスにしておくと
  // リポジトリ名を気にせずどこにデプロイしても動く
  base: './',
  plugins: [react(), tailwindcss()],
})
