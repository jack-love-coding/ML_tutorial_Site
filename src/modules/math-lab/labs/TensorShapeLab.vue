<script setup lang="ts">
import * as d3 from 'd3'
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
        subtitle: '把 batch、特征维度、隐藏维度和 broadcasting 连到矩阵乘法。',
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
        matmul: 'matmul 消掉 D',
        broadcast: 'bias 复制到每行',
        output: '输出保留 B,H',
        noteValid: '矩阵乘法先要求 D 对齐，bias 再广播到输出的最后一维。',
        noteInvalid: 'bias 的长度既不是 1 也不是 H，因此不能安全加到每个样本的输出向量上。',
      }
    : {
        eyebrow: 'Interactive lab',
        title: 'Shape Debugger',
        subtitle: 'Connect batch size, feature dimension, hidden width, and broadcasting to matrix multiplication.',
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
        matmul: 'matmul reduces D',
        broadcast: 'bias copies across rows',
        output: 'output keeps B,H',
        noteValid: 'Matrix multiplication first aligns D; bias is then broadcast over the output last dimension.',
        noteInvalid: 'The bias length is neither 1 nor H, so it cannot be safely added to every output vector.',
      },
)

const shapeScale = computed(() =>
  d3.scaleLinear()
    .domain([1, 32])
    .range([44, 132]),
)

const flowNodes = computed(() => {
  const scale = shapeScale.value
  const batchHeight = scale(batchSize.value)
  const inputWidth = d3.scaleLinear().domain([2, 16]).range([70, 118])(inputDim.value)
  const hiddenWidth = d3.scaleLinear().domain([2, 16]).range([62, 118])(hiddenDim.value)
  return [
    {
      id: 'X',
      label: 'X',
      shape: shapeText(evaluation.value.inputShape),
      x: 22,
      y: 148 - batchHeight / 2,
      width: inputWidth,
      height: batchHeight,
      kind: 'input',
    },
    {
      id: 'W',
      label: 'W',
      shape: shapeText(evaluation.value.weightShape),
      x: 192,
      y: 58,
      width: hiddenWidth,
      height: 184,
      kind: 'weight',
    },
    {
      id: 'b',
      label: 'b',
      shape: shapeText(evaluation.value.biasShape),
      x: 344,
      y: biasMode.value === 'scalar' ? 128 : 104,
      width: biasMode.value === 'scalar' ? 52 : 76,
      height: biasMode.value === 'scalar' ? 52 : 100,
      kind: evaluation.value.biasCompatible ? 'bias' : 'invalid',
    },
    {
      id: 'Y',
      label: 'Y',
      shape: shapeText(evaluation.value.outputShape),
      x: 444,
      y: 148 - batchHeight / 2,
      width: hiddenWidth,
      height: batchHeight,
      kind: evaluation.value.biasCompatible ? 'output' : 'invalid',
    },
  ]
})

const flowLinks = computed(() => {
  const nodes = Object.fromEntries(flowNodes.value.map((node) => [node.id, node]))
  const line = d3.line<[number, number]>().curve(d3.curveBumpX)
  return [
    {
      id: 'xw',
      path: line([
        [nodes.X.x + nodes.X.width + 16, 148],
        [nodes.W.x - 16, 148],
      ]) ?? '',
      label: copy.value.matmul,
      x: 154,
      y: 126,
    },
    {
      id: 'bias',
      path: line([
        [nodes.W.x + nodes.W.width + 18, 148],
        [nodes.b.x - 16, 148],
      ]) ?? '',
      label: '+',
      x: 318,
      y: 126,
    },
    {
      id: 'out',
      path: line([
        [nodes.b.x + nodes.b.width + 16, 148],
        [nodes.Y.x - 18, 148],
      ]) ?? '',
      label: copy.value.output,
      x: 410,
      y: 126,
    },
  ]
})

const costBars = computed(() => {
  const values = [
    { id: 'params', label: copy.value.params, value: evaluation.value.parameterCount, max: 16 * 16 + 16 },
    { id: 'ops', label: copy.value.ops, value: evaluation.value.multiplyAdds, max: 32 * 16 * 16 },
    { id: 'memory', label: copy.value.memory, value: evaluation.value.activationBytes, max: 32 * 16 * 4 },
  ]
  return values.map((item, index) => ({
    ...item,
    y: 248 + index * 18,
    width: d3.scaleLinear().domain([0, item.max]).range([0, 150])(item.value),
  }))
})

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
      <svg viewBox="0 0 590 320" role="img" :aria-label="copy.title">
        <defs>
          <marker id="tensor-shape-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
            <path d="M0,0 L0,6 L9,3 z" fill="#10162f" />
          </marker>
        </defs>

        <path
          v-for="link in flowLinks"
          :key="link.id"
          :d="link.path"
          class="tensor-shape-lab__link"
          marker-end="url(#tensor-shape-arrow)"
        />
        <text v-for="link in flowLinks" :key="`${link.id}-label`" class="tensor-shape-lab__operator" :x="link.x" :y="link.y">
          {{ link.label }}
        </text>

        <g
          v-for="node in flowNodes"
          :key="node.id"
          class="tensor-shape-lab__block"
          :class="`is-${node.kind}`"
        >
          <rect :x="node.x" :y="node.y" :width="node.width" :height="node.height" rx="8" />
          <text :x="node.x + node.width / 2" :y="node.y + node.height / 2 - 8">{{ node.label }}</text>
          <text :x="node.x + node.width / 2" :y="node.y + node.height / 2 + 18">{{ node.shape }}</text>
        </g>

        <g class="tensor-shape-lab__cost-bars">
          <g v-for="bar in costBars" :key="bar.id">
            <text x="22" :y="bar.y + 10">{{ bar.label }}</text>
            <rect x="132" :y="bar.y" width="150" height="10" rx="4" class="is-track" />
            <rect x="132" :y="bar.y" :width="bar.width" height="10" rx="4" />
          </g>
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
  min-height: 320px;
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

.tensor-shape-lab__block.is-input rect {
  fill: #d8f6ff;
}

.tensor-shape-lab__block.is-weight rect {
  fill: #e7ddff;
}

.tensor-shape-lab__block.is-bias rect {
  fill: #fff2ad;
}

.tensor-shape-lab__block.is-output rect {
  fill: #dffbe9;
}

.tensor-shape-lab__block.is-invalid rect {
  fill: #ffe0e0;
}

.tensor-shape-lab__block text,
.tensor-shape-lab__operator,
.tensor-shape-lab__cost-bars text {
  fill: #10162f;
  font-family: var(--font-display, system-ui);
  font-weight: 900;
  text-anchor: middle;
}

.tensor-shape-lab__operator {
  font-size: 13px;
}

.tensor-shape-lab__cost-bars text {
  font-size: 10px;
  text-anchor: start;
}

.tensor-shape-lab__cost-bars rect {
  fill: #3868ff;
}

.tensor-shape-lab__cost-bars rect.is-track {
  fill: rgba(16, 22, 47, 0.12);
}

.tensor-shape-lab__link {
  fill: none;
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
