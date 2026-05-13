import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  base: process.env.VITE_BASE_PATH ?? (mode === 'github-pages' ? '/ML_tutorial_Site/' : '/'),
  plugins: [vue()],
}))
