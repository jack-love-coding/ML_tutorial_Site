<script setup lang="ts">
import { computed, ref } from 'vue'
import type { MathLabLocale } from '../types/mathLab'
import { convolutionOutputSize, evaluateAttention, normalizeVector } from '../utils/aiBridgeMath'

const props = withDefaults(defineProps<{
  locale?: MathLabLocale
}>(), {
  locale: 'zh-CN',
})

type TabId = 'cnn' | 'attention' | 'normalization'

const tabs: TabId[] = ['attention', 'cnn', 'normalization']
const activeTab = ref<TabId>('attention')
const inputSize = ref(32)
const kernelSize = ref(3)
const stride = ref(1)
const padding = ref(1)
const queryX = ref(1)
const queryY = ref(0.4)
const residualScale = ref(0.8)

const attention = computed(() =>
  evaluateAttention(
    [queryX.value, queryY.value],
    [
      [1, 0.2],
      [0.2, 1],
      [-0.8, 0.3],
    ],
  ),
)

const normalized = computed(() => normalizeVector([2.2, -0.4, 1.1, 3.2].map((value) => value * residualScale.value)))
const convOut = computed(() => convolutionOutputSize(inputSize.value, kernelSize.value, stride.value, padding.value))

const copy = computed(() =>
  props.locale === 'zh-CN'
    ? {
        eyebrow: '互动实验',
        title: '结构里的数学',
        subtitle: '在 CNN、attention 和 residual/normalization 之间切换。',
        tabs: {
          cnn: 'CNN 尺寸',
          attention: 'Attention 权重',
          normalization: '残差与归一化',
        } as Record<TabId, string>,
        input: '输入尺寸',
        kernel: 'kernel',
        stride: 'stride',
        padding: 'padding',
        output: '输出尺寸',
        queryX: 'query x',
        queryY: 'query y',
        scale: '残差分支尺度',
        attentionNote: 'attention 先用点积打分，再用 softmax 变成对 token 的加权汇聚。',
        cnnNote: '卷积输出尺寸由输入、padding、kernel 和 stride 共同决定；局部窗口共享同一组权重。',
        normNote: '残差保留原信号，normalization 把尺度拉回稳定范围，减少深层堆叠中的数值漂移。',
        mean: '均值',
        std: '标准差',
        maxWeight: '最大 attention 权重',
      }
    : {
        eyebrow: 'Interactive lab',
        title: 'Math Inside Architectures',
        subtitle: 'Switch between CNN, attention, and residual/normalization views.',
        tabs: {
          cnn: 'CNN size',
          attention: 'attention weights',
          normalization: 'residual + norm',
        } as Record<TabId, string>,
        input: 'input size',
        kernel: 'kernel',
        stride: 'stride',
        padding: 'padding',
        output: 'output size',
        queryX: 'query x',
        queryY: 'query y',
        scale: 'residual branch scale',
        attentionNote: 'Attention scores tokens with dot products, then uses softmax to form a weighted aggregation.',
        cnnNote: 'Convolution output size depends on input, padding, kernel, and stride; local windows share one weight set.',
        normNote: 'Residual paths preserve signal, while normalization brings scale back into a stable range for deep stacks.',
        mean: 'mean',
        std: 'std',
        maxWeight: 'max attention weight',
      },
)

function format(value: number, digits = 3) {
  return value.toFixed(digits)
}
</script>

<template>
  <section class="math-lab-card architecture-math-lab">
    <div class="math-lab-card__visual architecture-math-lab__visual">
      <svg v-if="activeTab === 'attention'" viewBox="0 0 420 300" role="img" :aria-label="copy.tabs.attention">
        <line x1="86" y1="78" x2="224" y2="92" class="architecture-math-lab__attention-link" />
        <line x1="86" y1="150" x2="224" y2="150" class="architecture-math-lab__attention-link" />
        <line x1="86" y1="222" x2="224" y2="208" class="architecture-math-lab__attention-link" />
        <circle cx="74" cy="78" r="28" class="architecture-math-lab__token" />
        <circle cx="74" cy="150" r="28" class="architecture-math-lab__token" />
        <circle cx="74" cy="222" r="28" class="architecture-math-lab__token" />
        <circle cx="236" cy="150" r="34" class="architecture-math-lab__query" />
        <text x="74" y="83">k0</text>
        <text x="74" y="155">k1</text>
        <text x="74" y="227">k2</text>
        <text x="236" y="155">q</text>
        <g v-for="(weight, index) in attention.weights" :key="index">
          <rect :x="306" :y="68 + index * 62" :width="weight * 84" height="32" />
          <text x="286" :y="90 + index * 62">a{{ index }}</text>
          <text :x="356" :y="90 + index * 62">{{ format(weight, 2) }}</text>
        </g>
      </svg>

      <svg v-else-if="activeTab === 'cnn'" viewBox="0 0 420 300" role="img" :aria-label="copy.tabs.cnn">
        <rect x="54" y="70" :width="Math.min(170, inputSize * 4)" height="170" class="architecture-math-lab__image" />
        <rect x="92" y="108" :width="kernelSize * 18" :height="kernelSize * 18" class="architecture-math-lab__kernel" />
        <line x1="248" y1="150" x2="302" y2="150" class="architecture-math-lab__attention-link" />
        <rect x="318" y="94" :width="Math.min(80, convOut * 3)" :height="Math.min(124, convOut * 3)" class="architecture-math-lab__output" />
        <text x="138" y="260">{{ inputSize }} x {{ inputSize }}</text>
        <text x="358" y="242">{{ convOut }} x {{ convOut }}</text>
      </svg>

      <svg v-else viewBox="0 0 420 300" role="img" :aria-label="copy.tabs.normalization">
        <line x1="76" y1="80" x2="230" y2="80" class="architecture-math-lab__attention-link" />
        <line x1="76" y1="214" x2="230" y2="214" class="architecture-math-lab__attention-link" />
        <line x1="230" y1="80" x2="230" y2="214" class="architecture-math-lab__attention-link" />
        <rect x="42" y="54" width="68" height="52" class="architecture-math-lab__token" />
        <rect x="170" y="54" width="94" height="52" class="architecture-math-lab__query" />
        <rect x="170" y="188" width="94" height="52" class="architecture-math-lab__output" />
        <rect x="298" y="118" width="80" height="62" class="architecture-math-lab__kernel" />
        <text x="76" y="87">x</text>
        <text x="217" y="87">F(x)</text>
        <text x="217" y="221">x</text>
        <text x="338" y="153">norm</text>
      </svg>
    </div>

    <div class="math-lab-card__controls">
      <header>
        <span>{{ copy.eyebrow }}</span>
        <strong>{{ copy.title }}</strong>
        <p>{{ copy.subtitle }}</p>
      </header>

      <div class="architecture-math-lab__tabs" role="tablist">
        <button
          v-for="tab in tabs"
          :key="tab"
          type="button"
          :class="{ 'is-active': activeTab === tab }"
          @click="activeTab = tab"
        >
          {{ copy.tabs[tab] }}
        </button>
      </div>

      <div v-if="activeTab === 'attention'" class="math-mini-controls architecture-math-lab__controls">
        <label>{{ copy.queryX }}: {{ queryX.toFixed(1) }}<input v-model.number="queryX" type="range" min="-2" max="2" step="0.1" /></label>
        <label>{{ copy.queryY }}: {{ queryY.toFixed(1) }}<input v-model.number="queryY" type="range" min="-2" max="2" step="0.1" /></label>
      </div>

      <div v-else-if="activeTab === 'cnn'" class="math-mini-controls architecture-math-lab__controls">
        <label>{{ copy.input }}: {{ inputSize }}<input v-model.number="inputSize" type="range" min="16" max="64" step="1" /></label>
        <label>{{ copy.kernel }}: {{ kernelSize }}<input v-model.number="kernelSize" type="range" min="1" max="7" step="2" /></label>
        <label>{{ copy.stride }}: {{ stride }}<input v-model.number="stride" type="range" min="1" max="4" step="1" /></label>
        <label>{{ copy.padding }}: {{ padding }}<input v-model.number="padding" type="range" min="0" max="4" step="1" /></label>
      </div>

      <div v-else class="math-mini-controls architecture-math-lab__controls">
        <label>{{ copy.scale }}: {{ residualScale.toFixed(1) }}<input v-model.number="residualScale" type="range" min="0.2" max="2" step="0.1" /></label>
      </div>

      <div class="math-readout-grid">
        <template v-if="activeTab === 'attention'">
          <article><span>{{ copy.maxWeight }}</span><strong>{{ format(Math.max(...attention.weights)) }}</strong></article>
          <article><span>scores</span><strong>{{ attention.scores.map((score) => format(score, 2)).join(', ') }}</strong></article>
        </template>
        <template v-else-if="activeTab === 'cnn'">
          <article><span>{{ copy.output }}</span><strong>{{ convOut }} x {{ convOut }}</strong></article>
          <article><span>formula</span><strong>floor((n+2p-k)/s)+1</strong></article>
        </template>
        <template v-else>
          <article><span>{{ copy.mean }}</span><strong>{{ format(normalized.mean) }}</strong></article>
          <article><span>{{ copy.std }}</span><strong>{{ format(normalized.std) }}</strong></article>
        </template>
      </div>

      <p class="math-lab-note">
        {{ activeTab === 'attention' ? copy.attentionNote : activeTab === 'cnn' ? copy.cnnNote : copy.normNote }}
      </p>
    </div>
  </section>
</template>

<style scoped>
.architecture-math-lab__visual svg {
  display: block;
  width: 100%;
  min-height: 300px;
  border: 2px solid var(--pixel-line, #10162f);
  border-radius: 8px;
  background: #fffef7;
}

.architecture-math-lab__attention-link {
  stroke: #10162f;
  stroke-width: 2.5;
}

.architecture-math-lab__token,
.architecture-math-lab__image {
  fill: #d8f6ff;
  stroke: #10162f;
  stroke-width: 2;
}

.architecture-math-lab__query {
  fill: #e7ddff;
  stroke: #10162f;
  stroke-width: 2;
}

.architecture-math-lab__kernel {
  fill: #ffd84d;
  stroke: #10162f;
  stroke-width: 2;
}

.architecture-math-lab__output {
  fill: #dffbe9;
  stroke: #10162f;
  stroke-width: 2;
}

.architecture-math-lab text {
  fill: #10162f;
  font-family: var(--font-display, system-ui);
  font-weight: 900;
  text-anchor: middle;
}

.architecture-math-lab__tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.architecture-math-lab__tabs button {
  padding: 9px 12px;
  border: 2px solid var(--pixel-line, #10162f);
  border-radius: 5px;
  background: #ffffff;
  color: var(--pixel-ink, #10162f);
  box-shadow: 2px 2px 0 rgba(16, 22, 47, 0.65);
  font-weight: 900;
}

.architecture-math-lab__tabs button.is-active {
  background: #ffd84d;
}

.architecture-math-lab__controls {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

@media (max-width: 720px) {
  .architecture-math-lab__controls {
    grid-template-columns: 1fr;
  }
}
</style>
