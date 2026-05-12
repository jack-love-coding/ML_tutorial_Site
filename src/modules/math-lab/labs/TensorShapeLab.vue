<script setup lang="ts">
import { computed, ref } from 'vue'
import type { MathLabLocale } from '../types/mathLab'
import { evaluateTensorShape } from '../utils/aiBridgeMath'

const props = withDefaults(defineProps<{
  locale?: MathLabLocale
}>(), {
  locale: 'zh-CN',
})

const batchSize = ref(8)
const inputDim = ref(6)
const hiddenDim = ref(4)
const biasMode = ref<'scalar' | 'vector' | 'bad'>('vector')

const biasDim = computed(() => {
  if (biasMode.value === 'scalar') return 1
  if (biasMode.value === 'bad') return hiddenDim.value + 2
  return hiddenDim.value
})

const evaluation = computed(() =>
  evaluateTensorShape({
    batchSize: batchSize.value,
    inputDim: inputDim.value,
    hiddenDim: hiddenDim.value,
    biasDim: biasDim.value,
  }),
)

const copy = computed(() =>
  props.locale === 'zh-CN'
    ? {
        eyebrow: '互动实验',
        title: 'Shape 调试器',
        subtitle: '把 batch、特征维度和隐藏维度连到矩阵乘法。',
        batch: 'batch size',
        input: '输入维度 D',
        hidden: '隐藏维度 H',
        bias: 'bias 形状',
        scalar: '标量广播',
        vector: '长度 H',
        bad: '错误长度',
        valid: '可广播',
        invalid: '不可广播',
        params: '参数量',
        ops: '乘加次数',
        memory: '输出内存',
        noteValid: '矩阵乘法先要求 D 对齐，bias 再广播到输出的最后一维。',
        noteInvalid: 'bias 的长度既不是 1 也不是 H，因此不能安全加到每个样本的输出向量上。',
      }
    : {
        eyebrow: 'Interactive lab',
        title: 'Shape Debugger',
        subtitle: 'Connect batch size, feature dimension, and hidden width to matrix multiplication.',
        batch: 'batch size',
        input: 'input dim D',
        hidden: 'hidden dim H',
        bias: 'bias shape',
        scalar: 'scalar broadcast',
        vector: 'length H',
        bad: 'wrong length',
        valid: 'broadcastable',
        invalid: 'not broadcastable',
        params: 'parameters',
        ops: 'multiply-adds',
        memory: 'output memory',
        noteValid: 'Matrix multiplication first aligns D; bias is then broadcast over the output last dimension.',
        noteInvalid: 'The bias length is neither 1 nor H, so it cannot be safely added to every output vector.',
      },
)

function shapeText(shape: readonly number[] | undefined) {
  return shape ? `[${shape.join(', ')}]` : 'error'
}

function formatBytes(bytes: number) {
  return bytes >= 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${bytes} B`
}
</script>

<template>
  <section class="math-lab-card tensor-shape-lab">
    <div class="math-lab-card__visual tensor-shape-lab__visual">
      <svg viewBox="0 0 520 300" role="img" :aria-label="copy.title">
        <defs>
          <marker id="tensor-shape-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
            <path d="M0,0 L0,6 L9,3 z" fill="#10162f" />
          </marker>
        </defs>
        <g class="tensor-shape-lab__block tensor-shape-lab__block--input">
          <rect x="22" y="84" width="104" height="132" rx="8" />
          <text x="74" y="132">X</text>
          <text x="74" y="166">{{ shapeText(evaluation.inputShape) }}</text>
        </g>
        <line x1="142" y1="150" x2="188" y2="150" marker-end="url(#tensor-shape-arrow)" />
        <g class="tensor-shape-lab__block tensor-shape-lab__block--weight">
          <rect x="204" y="58" width="116" height="184" rx="8" />
          <text x="262" y="132">W</text>
          <text x="262" y="166">{{ shapeText(evaluation.weightShape) }}</text>
        </g>
        <text class="tensor-shape-lab__operator" x="165" y="137">@</text>
        <text class="tensor-shape-lab__operator" x="340" y="137">+</text>
        <g class="tensor-shape-lab__block" :class="{ 'is-invalid': !evaluation.biasCompatible }">
          <rect x="366" y="112" width="76" height="76" rx="8" />
          <text x="404" y="142">b</text>
          <text x="404" y="170">{{ shapeText(evaluation.biasShape) }}</text>
        </g>
        <line x1="452" y1="150" x2="486" y2="150" marker-end="url(#tensor-shape-arrow)" />
        <g class="tensor-shape-lab__block tensor-shape-lab__block--output" :class="{ 'is-invalid': !evaluation.biasCompatible }">
          <rect x="376" y="216" width="122" height="58" rx="8" />
          <text x="437" y="240">Y</text>
          <text x="437" y="262">{{ shapeText(evaluation.outputShape) }}</text>
        </g>
      </svg>
    </div>

    <div class="math-lab-card__controls">
      <header>
        <span>{{ copy.eyebrow }}</span>
        <strong>{{ copy.title }}</strong>
        <p>{{ copy.subtitle }}</p>
      </header>

      <div class="math-mini-controls tensor-shape-lab__controls">
        <label>
          {{ copy.batch }}: {{ batchSize }}
          <input v-model.number="batchSize" type="range" min="1" max="32" step="1" />
        </label>
        <label>
          {{ copy.input }}: {{ inputDim }}
          <input v-model.number="inputDim" type="range" min="2" max="16" step="1" />
        </label>
        <label>
          {{ copy.hidden }}: {{ hiddenDim }}
          <input v-model.number="hiddenDim" type="range" min="2" max="16" step="1" />
        </label>
        <label>
          {{ copy.bias }}
          <select v-model="biasMode">
            <option value="vector">{{ copy.vector }}</option>
            <option value="scalar">{{ copy.scalar }}</option>
            <option value="bad">{{ copy.bad }}</option>
          </select>
        </label>
      </div>

      <div class="math-readout-grid">
        <article>
          <span>{{ copy.bias }}</span>
          <strong>{{ evaluation.biasCompatible ? copy.valid : copy.invalid }}</strong>
        </article>
        <article>
          <span>{{ copy.params }}</span>
          <strong>{{ evaluation.parameterCount }}</strong>
        </article>
        <article>
          <span>{{ copy.ops }}</span>
          <strong>{{ evaluation.multiplyAdds }}</strong>
        </article>
        <article>
          <span>{{ copy.memory }}</span>
          <strong>{{ formatBytes(evaluation.activationBytes) }}</strong>
        </article>
      </div>

      <p class="math-lab-note">
        {{ evaluation.biasCompatible ? copy.noteValid : copy.noteInvalid }}
      </p>
    </div>
  </section>
</template>

<style scoped>
.tensor-shape-lab__visual svg {
  display: block;
  width: 100%;
  min-height: 300px;
  border: 2px solid var(--pixel-line, rgba(15, 23, 40, 0.16));
  border-radius: 8px;
  background:
    linear-gradient(rgba(16, 22, 47, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(16, 22, 47, 0.08) 1px, transparent 1px),
    #fffef7;
  background-size: 24px 24px, 24px 24px, auto;
}

.tensor-shape-lab__block rect {
  fill: #ffffff;
  stroke: #10162f;
  stroke-width: 2;
}

.tensor-shape-lab__block--input rect {
  fill: #d8f6ff;
}

.tensor-shape-lab__block--weight rect {
  fill: #e7ddff;
}

.tensor-shape-lab__block--output rect {
  fill: #dffbe9;
}

.tensor-shape-lab__block.is-invalid rect {
  fill: #ffe0e0;
}

.tensor-shape-lab__block text,
.tensor-shape-lab__operator {
  fill: #10162f;
  font-family: var(--font-display, system-ui);
  font-weight: 900;
  text-anchor: middle;
}

.tensor-shape-lab__operator {
  font-size: 24px;
}

.tensor-shape-lab line {
  stroke: #10162f;
  stroke-width: 2.5;
}

.tensor-shape-lab__controls {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

@media (max-width: 720px) {
  .tensor-shape-lab__controls {
    grid-template-columns: 1fr;
  }
}
</style>
