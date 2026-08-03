<script setup lang="ts">
import type { MlpPlaygroundState } from '../../types/ml'

defineProps<{
  mode: 'guided' | 'explore'
  state: MlpPlaygroundState
  isPlaying: boolean
  epoch: string
  trainLoss: string | number
  testLoss: string | number
  labels: {
    reset: string
    play: string
    pause: string
    step: string
    iteration: string
    primaryResult: string
    trainLoss: string
    testLoss: string
    runControls: string
    scenarios: string
    circle: string
    regression: string
  }
}>()

defineEmits<{
  reset: []
  'toggle-play': []
  step: []
  preset: [kind: 'xor' | 'circle' | 'regression']
}>()
</script>

<template>
  <header class="mlp-guided-toolbar">
    <div class="mlp-run-controls" :aria-label="labels.runControls">
      <button type="button" class="mlp-icon-button" :title="labels.reset" :aria-label="labels.reset" @click="$emit('reset')">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4.5 8.5A8 8 0 1 1 4 15" />
          <path d="M4.5 4v4.5H9" />
        </svg>
      </button>
      <button
        type="button"
        class="mlp-icon-button mlp-icon-button--play"
        :title="isPlaying ? labels.pause : labels.play"
        :aria-label="isPlaying ? labels.pause : labels.play"
        @click="$emit('toggle-play')"
      >
        <svg v-if="isPlaying" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8 5v14M16 5v14" />
        </svg>
        <svg v-else viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8 5v14l11-7z" />
        </svg>
      </button>
      <button type="button" class="mlp-icon-button" :title="labels.step" :aria-label="labels.step" @click="$emit('step')">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 5v14l9-7z" />
          <path d="M18 5v14" />
        </svg>
      </button>
    </div>

    <div class="mlp-epoch-readout">
      <span>{{ labels.iteration }}</span>
      <strong>{{ epoch }}</strong>
    </div>

    <div class="mlp-guided-toolbar__result" aria-live="polite">
      <span>{{ labels.primaryResult }}</span>
      <strong>{{ labels.trainLoss }} {{ trainLoss }}</strong>
      <em>{{ labels.testLoss }} {{ testLoss }}</em>
    </div>

    <div v-if="mode === 'explore'" class="mlp-scenario-switch" :aria-label="labels.scenarios">
      <button type="button" :class="{ 'is-active': state.problemType === 'classification' && state.classificationDataset === 'xor' }" @click="$emit('preset', 'xor')">XOR</button>
      <button type="button" :class="{ 'is-active': state.problemType === 'classification' && state.classificationDataset === 'circle' }" @click="$emit('preset', 'circle')">
        {{ labels.circle }}
      </button>
      <button type="button" :class="{ 'is-active': state.problemType === 'regression' }" @click="$emit('preset', 'regression')">
        {{ labels.regression }}
      </button>
    </div>
  </header>
</template>
