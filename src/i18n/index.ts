import { createI18n } from 'vue-i18n'
import type { AppLocale } from '../types/ml'
import { messages } from './messages'

const STORAGE_KEY = 'ml-atlas-locale'

function detectLocale(): AppLocale {
  if (typeof window === 'undefined') return 'zh-CN'
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored === 'zh-CN' || stored === 'en') return stored
  return navigator.language.toLowerCase().includes('zh') ? 'zh-CN' : 'en'
}

export const i18n = createI18n({
  legacy: false,
  locale: detectLocale(),
  fallbackLocale: 'en',
  messages,
})

export function setAppLocale(locale: AppLocale) {
  i18n.global.locale.value = locale
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, locale)
  }
  syncDocumentLanguage()
}

export function syncDocumentLanguage() {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = i18n.global.locale.value
  }
}
