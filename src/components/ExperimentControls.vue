<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { AlgorithmModuleDefinition, ExperimentConfig, ExperimentConfigValue } from '../types/ml'

const props = defineProps<{
  moduleDefinition: AlgorithmModuleDefinition
  config: ExperimentConfig
  isPlaying: boolean
}>()

const emit = defineEmits<{
  'update-config': [key: string, value: ExperimentConfigValue]
  'toggle-play': []
  step: []
  replay: []
  reset: []
}>()

const { t } = useI18n()

function displayValue(key: string, value: ExperimentConfigValue, format?: string) {
  if (typeof value === 'string') {
    const option = props.moduleDefinition.controls
      .find((control) => control.key === key)
      ?.options?.find((entry) => entry.value === value)

    return option ? t(option.labelKey) : value
  }
  if (format === 'integer') return Math.round(Number(value)).toString()
  if (format === 'speed') return `${Math.round(Number(value))} ms`
  return Number(value).toFixed(Number(value) < 1 ? 2 : 1)
}

function onRangeInput(key: string, event: Event) {
  const target = event.target as HTMLInputElement
  emit('update-config', key, Number(target.value))
}

function onSelectInput(key: string, event: Event) {
  const target = event.target as HTMLSelectElement
  emit('update-config', key, target.value)
}
</script>

<template>
  <section class="panel controls-panel">
    <div class="panel__heading">
      <span>{{ t('common.playground') }}</span>
      <strong>{{ t(moduleDefinition.titleKey) }}</strong>
    </div>

    <div class="controls-panel__list">
      <label
        v-for="control in props.moduleDefinition.controls"
        :key="control.key"
        class="control"
      >
        <span class="control__row">
          <span>{{ t(control.labelKey) }}</span>
          <strong>{{ displayValue(control.key, props.config[control.key], control.format) }}</strong>
        </span>

        <input
          v-if="control.type === 'range'"
          class="control__range"
          type="range"
          :min="control.min"
          :max="control.max"
          :step="control.step"
          :value="Number(props.config[control.key])"
          @input="onRangeInput(control.key, $event)"
        />

        <select
          v-else
          class="control__select"
          :value="String(props.config[control.key])"
          @change="onSelectInput(control.key, $event)"
        >
          <option
            v-for="option in control.options"
            :key="option.value"
            :value="option.value"
          >
            {{ t(option.labelKey) }}
          </option>
        </select>
      </label>
    </div>

    <div class="controls-panel__actions">
      <button type="button" class="action-button action-button--primary" @click="emit('toggle-play')">
        {{ props.isPlaying ? t('actions.pause') : t('actions.play') }}
      </button>
      <button type="button" class="action-button" @click="emit('step')">
        {{ t('actions.step') }}
      </button>
      <button type="button" class="action-button" @click="emit('replay')">
        {{ t('actions.replay') }}
      </button>
      <button type="button" class="action-button" @click="emit('reset')">
        {{ t('actions.reset') }}
      </button>
    </div>
  </section>
</template>
