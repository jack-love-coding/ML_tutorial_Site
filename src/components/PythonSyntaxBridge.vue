<script setup lang="ts">
import type { AppLocale } from '../types/ml.ts'
import MarkdownMathContent from './MarkdownMathContent.vue'
import { pythonSyntaxBridge } from '../data/pythonSyntaxBridge.ts'
defineProps<{ locale: AppLocale }>()
</script>
<template><section class="reference-example python-syntax-bridge"><MarkdownMathContent :source="pythonSyntaxBridge[locale]" /></section></template>
