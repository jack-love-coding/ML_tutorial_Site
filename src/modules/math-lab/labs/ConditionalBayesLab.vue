<script setup lang="ts">
import { computed, ref } from 'vue'
import type { MathLabLocale } from '../types/mathLab'
import { evaluateConditionalBayes } from '../utils/beginnerFoundations'
import { CONDITIONAL_BAYES_EXAMPLE as example } from '../data/conditionalBayesExample.ts'

const props = withDefaults(defineProps<{ locale?: MathLabLocale }>(), { locale: 'zh-CN' })
const priorSpam = ref(example.priorSpam)
const signalGivenSpam = ref(example.signalGivenSpam)
const signalGivenNotSpam = ref(example.signalGivenNotSpam)
const evaluation = computed(() => evaluateConditionalBayes({
  populationSize: example.populationSize,
  priorSpam: priorSpam.value,
  signalGivenSpam: signalGivenSpam.value,
  signalGivenNotSpam: signalGivenNotSpam.value,
}))
const copy = computed(() => props.locale === 'zh-CN' ? {
  title: '条件概率与贝叶斯更新',
  model: '假设模型：10,000 封邮件的期望计数，不是实际采集的数据。A 表示垃圾邮件，B 表示有可疑链接。',
  prior: 'P(A)：垃圾邮件基准比例', hit: 'P(B | A)：垃圾邮件中的信号率', falseAlarm: 'P(B | ¬A)：普通邮件中的信号率',
  group: '邮件类型', all: '全部', signal: '有信号 B', noSignal: '无信号 ¬B', spam: 'A · 垃圾', normal: '¬A · 普通', total: '合计',
  table: '先看全部，再只保留 B 列作为新的分母。每一行：有信号 + 无信号 = 全部。',
  posterior: 'P(A | B)：带信号邮件中垃圾邮件的比例', evidence: 'P(B)：总体信号率', ignored: '假设先验是 50% 时的后验',
  explanation: '82% 回答“垃圾邮件中有多少带信号”；后验回答“带信号邮件中有多少是垃圾”。两者的分母不同。',
  comparison: '保留两种信号率，只把基准比例从 8% 调到 1%：垃圾邮件信号数从 656 变为 82，普通邮件误报从 1104 变为 1188，后验降到约 6.5%。',
  reset: '重置为 8%、82%、12%',
} : {
  title: 'Conditional Probability and Bayes Update',
  model: 'Hypothetical model: expected counts among 10,000 emails, not an observed dataset. A means spam; B means a suspicious link.',
  prior: 'P(A): spam base rate', hit: 'P(B | A): signal rate among spam', falseAlarm: 'P(B | ¬A): signal rate among normal mail',
  group: 'Email type', all: 'All', signal: 'Signal B', noSignal: 'No signal ¬B', spam: 'A · spam', normal: '¬A · normal', total: 'Total',
  table: 'Start with all emails, then keep only column B as the new denominator. In each row: signal + no signal = all.',
  posterior: 'P(A | B): share of spam among emails with the signal', evidence: 'P(B): overall signal rate', ignored: 'Posterior if the prior were 50%',
  explanation: '82% asks how much spam has the signal; the posterior asks how much signal-bearing mail is spam. Their denominators differ.',
  comparison: 'Keep both signal rates and change only the base rate from 8% to 1%: spam signals fall from 656 to 82, normal-mail false alarms rise from 1104 to 1188, and the posterior falls to about 6.5%.',
  reset: 'Reset to 8%, 82%, 12%',
})
const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`
function reset() {
  priorSpam.value = example.priorSpam
  signalGivenSpam.value = example.signalGivenSpam
  signalGivenNotSpam.value = example.signalGivenNotSpam
}
</script>

<template>
  <section class="math-lab-card conditional-bayes-lab">
    <div class="conditional-bayes-lab__evidence">
      <h3>{{ copy.title }}</h3>
      <p>{{ copy.model }}</p>
      <table>
        <caption>{{ copy.table }}</caption>
        <thead><tr><th scope="col">{{ copy.group }}</th><th scope="col">{{ copy.all }}</th><th scope="col">{{ copy.signal }}</th><th scope="col">{{ copy.noSignal }}</th></tr></thead>
        <tbody>
          <tr><th scope="row">{{ copy.spam }}</th><td>{{ evaluation.spamCount }}</td><td>{{ evaluation.signalSpamCount }}</td><td>{{ evaluation.spamCount - evaluation.signalSpamCount }}</td></tr>
          <tr><th scope="row">{{ copy.normal }}</th><td>{{ evaluation.notSpamCount }}</td><td>{{ evaluation.signalNotSpamCount }}</td><td>{{ evaluation.notSpamCount - evaluation.signalNotSpamCount }}</td></tr>
          <tr><th scope="row">{{ copy.total }}</th><td>{{ evaluation.populationSize }}</td><td>{{ evaluation.signalCount }}</td><td>{{ evaluation.populationSize - evaluation.signalCount }}</td></tr>
        </tbody>
      </table>
      <p class="conditional-bayes-lab__ratio" aria-live="polite">{{ copy.posterior }}<br><strong>{{ evaluation.signalSpamCount }} / {{ evaluation.signalCount }} ≈ {{ formatPercent(evaluation.posteriorSpam) }}</strong></p>
      <div class="conditional-bayes-lab__bar" aria-hidden="true"><span :style="{ width: `${evaluation.posteriorSpam * 100}%` }"></span></div>
      <p class="conditional-bayes-lab__legend"><span>■ {{ copy.spam }} {{ formatPercent(evaluation.posteriorSpam) }}</span><span>▧ {{ copy.normal }} {{ formatPercent(evaluation.posteriorNotSpam) }}</span></p>
      <p>{{ copy.explanation }}</p>
    </div>
    <div class="math-lab-card__controls">
      <div class="math-mini-controls conditional-bayes-lab__controls">
        <label>{{ copy.prior }}: {{ formatPercent(priorSpam) }}<input v-model.number="priorSpam" type="range" min="0.01" max="0.5" step="0.01" /></label>
        <label>{{ copy.hit }}: {{ formatPercent(signalGivenSpam) }}<input v-model.number="signalGivenSpam" type="range" min="0.1" max="0.98" step="0.01" /></label>
        <label>{{ copy.falseAlarm }}: {{ formatPercent(signalGivenNotSpam) }}<input v-model.number="signalGivenNotSpam" type="range" min="0.01" max="0.5" step="0.01" /></label>
      </div>
      <button type="button" class="conditional-bayes-lab__reset" @click="reset">{{ copy.reset }}</button>
      <div class="math-readout-grid">
        <article><span>{{ copy.evidence }}</span><strong>{{ formatPercent(evaluation.evidence) }}</strong></article>
        <article><span>{{ copy.ignored }}</span><strong>{{ formatPercent(evaluation.ignoredBaseRatePosterior) }}</strong></article>
      </div>
      <p class="math-lab-note">{{ copy.comparison }}</p>
    </div>
  </section>
</template>

<style scoped src="../../../styles/modules/conditional-bayes.css"></style>
