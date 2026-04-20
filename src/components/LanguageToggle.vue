<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AppLocale } from '../types/ml'
import { setAppLocale } from '../i18n'

const { locale } = useI18n()
const currentLocale = computed(() => locale.value as AppLocale)

function changeLocale(nextLocale: AppLocale) {
  setAppLocale(nextLocale)
}
</script>

<template>
  <div class="locale-switch" aria-label="language switch">
    <button
      v-for="option in ['zh-CN', 'en'] as AppLocale[]"
      :key="option"
      class="locale-switch__button"
      :class="{ 'is-active': option === currentLocale }"
      type="button"
      @click="changeLocale(option)"
    >
      {{ option === 'zh-CN' ? '中' : 'EN' }}
    </button>
  </div>
</template>
