<script setup lang="ts">
import { computed, ref } from 'vue'
import type { MathLabLocale } from '../types/mathLab'
import { evaluateConditionalBayes } from '../utils/beginnerFoundations'

const props = withDefaults(defineProps<{
  locale?: MathLabLocale
}>(), {
  locale: 'zh-CN',
})

const priorSpam = ref(0.08)
const signalGivenSpam = ref(0.82)
const signalGivenNotSpam = ref(0.12)

const evaluation = computed(() =>
  evaluateConditionalBayes({
    priorSpam: priorSpam.value,
    signalGivenSpam: signalGivenSpam.value,
    signalGivenNotSpam: signalGivenNotSpam.value,
  }),
)

const copy = computed(() =>
  props.locale === 'zh-CN'
    ? {
        eyebrow: '互动实验',
        title: '条件概率与贝叶斯更新',
        subtitle: '同一个信号要放回基准比例里读，后验概率才不容易被夸大。',
        prior: '垃圾邮件基准比例',
        hit: '信号命中垃圾邮件',
        falseAlarm: '信号误报普通邮件',
        evidence: '看到信号的概率',
        posterior: '信号后是垃圾邮件',
        ignored: '忽略基准比例时',
        gap: 'base-rate 偏差',
        population: '1000 封邮件',
        spam: '垃圾邮件',
        normal: '普通邮件',
        signal: '带信号',
        reset: '重置',
        note: '信号很强也不等于后验一定很高；如果垃圾邮件本来很少，误报会占掉许多带信号的样本。',
      }
    : {
        eyebrow: 'Interactive lab',
        title: 'Conditional Probability and Bayes Update',
        subtitle: 'Read a signal together with the base rate so posterior probability is not exaggerated.',
        prior: 'spam base rate',
        hit: 'signal on spam',
        falseAlarm: 'signal on normal mail',
        evidence: 'probability of signal',
        posterior: 'spam after signal',
        ignored: 'ignoring base rate',
        gap: 'base-rate gap',
        population: '1000 emails',
        spam: 'spam',
        normal: 'normal',
        signal: 'with signal',
        reset: 'reset',
        note: 'A strong signal does not automatically make the posterior huge; when spam is rare, false alarms can take up much of the evidence.',
      },
)

const populationBars = computed(() => {
  const totalWidth = 388
  return {
    spamWidth: totalWidth * evaluation.value.priorSpam,
    normalWidth: totalWidth * evaluation.value.priorNotSpam,
    signalSpamWidth: totalWidth * evaluation.value.priorSpam * evaluation.value.signalGivenSpam,
    signalNormalWidth: totalWidth * evaluation.value.priorNotSpam * evaluation.value.signalGivenNotSpam,
  }
})

function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`
}

function reset() {
  priorSpam.value = 0.08
  signalGivenSpam.value = 0.82
  signalGivenNotSpam.value = 0.12
}
</script>

<template>
  <section class="math-lab-card conditional-bayes-lab">
    <div class="math-lab-card__visual conditional-bayes-lab__visual">
      <svg viewBox="0 0 540 360" role="img" :aria-label="copy.title">
        <text x="42" y="42">{{ copy.population }}</text>
        <rect x="42" y="68" :width="populationBars.spamWidth" height="48" class="conditional-bayes-lab__spam" />
        <rect
          :x="42 + populationBars.spamWidth"
          y="68"
          :width="populationBars.normalWidth"
          height="48"
          class="conditional-bayes-lab__normal"
        />
        <text x="58" y="150">{{ copy.spam }} {{ evaluation.spamCount }}</text>
        <text x="292" y="150">{{ copy.normal }} {{ evaluation.notSpamCount }}</text>

        <line x1="270" y1="170" x2="270" y2="220" class="conditional-bayes-lab__arrow" />
        <text x="270" y="202">{{ copy.signal }}</text>

        <rect x="42" y="238" :width="populationBars.signalSpamWidth" height="54" class="conditional-bayes-lab__spam" />
        <rect
          :x="42 + populationBars.signalSpamWidth"
          y="238"
          :width="populationBars.signalNormalWidth"
          height="54"
          class="conditional-bayes-lab__normal"
        />
        <text x="58" y="322">{{ evaluation.signalSpamCount }}</text>
        <text :x="58 + populationBars.signalSpamWidth + populationBars.signalNormalWidth" y="322">
          {{ evaluation.signalCount }}
        </text>

        <circle cx="444" cy="116" r="46" class="conditional-bayes-lab__posterior" />
        <text x="444" y="112">{{ copy.posterior }}</text>
        <text x="444" y="140">{{ formatPercent(evaluation.posteriorSpam) }}</text>
      </svg>
    </div>

    <div class="math-lab-card__controls">
      <header>
        <span>{{ copy.eyebrow }}</span>
        <strong>{{ copy.title }}</strong>
        <p>{{ copy.subtitle }}</p>
      </header>

      <div class="math-mini-controls conditional-bayes-lab__controls">
        <label>
          {{ copy.prior }}: {{ formatPercent(priorSpam) }}
          <input v-model.number="priorSpam" type="range" min="0.01" max="0.5" step="0.01" />
        </label>
        <label>
          {{ copy.hit }}: {{ formatPercent(signalGivenSpam) }}
          <input v-model.number="signalGivenSpam" type="range" min="0.1" max="0.98" step="0.01" />
        </label>
        <label>
          {{ copy.falseAlarm }}: {{ formatPercent(signalGivenNotSpam) }}
          <input v-model.number="signalGivenNotSpam" type="range" min="0.01" max="0.5" step="0.01" />
        </label>
      </div>

      <button type="button" class="conditional-bayes-lab__reset" @click="reset">{{ copy.reset }}</button>

      <div class="math-readout-grid">
        <article><span>{{ copy.evidence }}</span><strong>{{ formatPercent(evaluation.evidence) }}</strong></article>
        <article><span>{{ copy.posterior }}</span><strong>{{ formatPercent(evaluation.posteriorSpam) }}</strong></article>
        <article><span>{{ copy.ignored }}</span><strong>{{ formatPercent(evaluation.ignoredBaseRatePosterior) }}</strong></article>
        <article><span>{{ copy.gap }}</span><strong>{{ formatPercent(evaluation.baseRateGap) }}</strong></article>
      </div>

      <p class="math-lab-note">{{ copy.note }}</p>
    </div>
  </section>
</template>

<style scoped>
.conditional-bayes-lab__visual svg {
  display: block;
  width: 100%;
  min-height: 340px;
  border: 2px solid var(--pixel-line, #10162f);
  border-radius: 8px;
  background: #fffef7;
}

.conditional-bayes-lab rect {
  stroke: #10162f;
  stroke-width: 2;
}

.conditional-bayes-lab__spam {
  fill: #ef6f6c;
}

.conditional-bayes-lab__normal {
  fill: #9ee6ff;
}

.conditional-bayes-lab__arrow {
  stroke: #10162f;
  stroke-width: 3;
  stroke-dasharray: 6 5;
}

.conditional-bayes-lab__posterior {
  fill: #ffd84d;
  stroke: #10162f;
  stroke-width: 3;
}

.conditional-bayes-lab text {
  fill: #10162f;
  font-size: 12px;
  font-weight: 900;
  text-anchor: middle;
}

.conditional-bayes-lab__controls {
  grid-template-columns: 1fr;
}

.conditional-bayes-lab__reset {
  align-self: flex-start;
  border: 2px solid var(--pixel-line, #10162f);
  border-radius: 6px;
  background: #fffef7;
  color: #10162f;
  cursor: pointer;
  font: inherit;
  font-weight: 900;
  padding: 0.45rem 0.75rem;
}

.conditional-bayes-lab__reset:hover {
  background: #ffd84d;
}
</style>
