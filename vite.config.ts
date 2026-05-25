import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  base: process.env.VITE_BASE_PATH ?? (mode === 'github-pages' ? '/ML_tutorial_Site/' : '/'),
  plugins: [vue()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          minSize: 20 * 1024,
          maxSize: 450 * 1024,
          groups: [
            {
              name: 'vendor-vue',
              test: /node_modules[\\/](@vue|vue|pinia|vue-router|vue-i18n)[\\/]/,
              priority: 40,
            },
            {
              name: 'vendor-three',
              test: /node_modules[\\/]three[\\/]/,
              priority: 35,
            },
            {
              name: 'vendor-math-render',
              test: /node_modules[\\/](katex|markdown-it|sanitize-html|entities|linkify-it|mdurl|uc\.micro|punycode\.js|argparse)[\\/]/,
              priority: 30,
            },
            {
              name: 'vendor-d3',
              test: /node_modules[\\/](d3|d3-[^\\/]+)[\\/]/,
              priority: 25,
            },
            {
              name: 'math-lab-imported-notes',
              test: /src[\\/]modules[\\/]math-lab[\\/]data[\\/]importedMathNotes\.generated\.ts$/,
              priority: 20,
            },
            {
              name: 'math-lab-topic-modules',
              test: /src[\\/]modules[\\/]math-lab[\\/]data[\\/].*Module\.ts$/,
              priority: 18,
            },
            {
              name: 'math-lab-foundations',
              test: /src[\\/]modules[\\/]math-lab[\\/]data[\\/](mathFoundationsModules|aiBridgeModules)\.ts$/,
              priority: 15,
            },
          ],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
}))
