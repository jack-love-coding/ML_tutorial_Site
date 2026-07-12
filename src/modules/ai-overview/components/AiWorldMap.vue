<script setup lang="ts">
import type { AppLocale } from '../../../types/ml'
import { aiOverviewVisualCopy, aiWorldNodes } from '../data/course'

defineProps<{ locale: AppLocale }>()
const aiNode = aiWorldNodes.find((node) => node.id === 'ai')!
const machineLearningNode = aiWorldNodes.find((node) => node.id === 'machine-learning')!
const deepLearningNode = aiWorldNodes.find((node) => node.id === 'deep-learning')!
const generativeAiNode = aiWorldNodes.find((node) => node.id === 'generative-ai')!
const llmNode = aiWorldNodes.find((node) => node.id === 'llm')!
// Canonical map endpoint: LLM.
</script>

<template>
  <figure class="ai-world-map">
    <svg viewBox="0 0 720 420" role="img" :aria-label="aiOverviewVisualCopy.nestedMap[locale]">
      <g class="concept concept--ai">
        <rect x="12" y="12" width="696" height="396" rx="36" />
        <text x="36" y="48">{{ aiNode.label[locale] }}</text>
      </g>
      <g class="concept concept--ml">
        <rect x="90" y="72" width="540" height="300" rx="32" />
        <text x="114" y="108">{{ machineLearningNode.label[locale] }}</text>
      </g>
      <g class="concept concept--deep-learning">
        <rect x="170" y="132" width="380" height="204" rx="28" />
        <text x="194" y="168">{{ deepLearningNode.label[locale] }}</text>
      </g>
      <g id="generative-ai" class="concept concept--generative-ai">
        <path d="M245 195h230v105H245z" />
        <text x="267" y="230">{{ generativeAiNode.label[locale] }}</text>
      </g>
      <g id="llm" class="concept concept--llm">
        <circle cx="360" cy="270" r="42" />
        <text x="338" y="277">{{ llmNode.label[locale] }}</text>
      </g>
    </svg>
    <figcaption>{{ aiOverviewVisualCopy.nestedMap[locale] }}</figcaption>
    <ol>
      <li v-for="node in aiWorldNodes" :key="node.id" :data-node-id="node.id"><strong>{{ node.label[locale] }}</strong> — {{ node.relationship[locale] }}</li>
    </ol>
  </figure>
</template>

<style scoped>
.ai-world-map { margin: 0; }
svg { width: 100%; height: auto; }
.concept > :first-child { fill: color-mix(in srgb, var(--color-primary, #3157c8) 8%, transparent); stroke: currentColor; stroke-width: 2; }
.concept--ml > :first-child { stroke-dasharray: 10 5; }
.concept--deep-learning > :first-child { stroke-width: 3; }
.concept--generative-ai > :first-child { stroke-dasharray: 3 4; }
.concept--llm > :first-child { fill: color-mix(in srgb, var(--color-primary, #3157c8) 20%, transparent); }
text { fill: currentColor; font: 600 20px system-ui, sans-serif; }
figcaption { margin-top: .5rem; font-weight: 600; }
ol { margin-block-end: 0; padding-inline-start: 1.5rem; }
</style>
