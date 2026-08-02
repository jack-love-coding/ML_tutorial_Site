<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { CnnClassScore, CnnLayerSnapshot, CnnOperationDetail } from '../../utils/cnnExplainer'
import type { CnnInspectorView } from '../../lessons/neuralGuided'
import MarkdownMathContent from '../MarkdownMathContent.vue'

const props = defineProps<{
  layer?: CnnLayerSnapshot
  detail?: CnnOperationDetail
  scores: CnnClassScore[]
  defaultView: CnnInspectorView
  sectionId: string
}>()

const { locale } = useI18n()
const activeView = ref<CnnInspectorView>(props.defaultView)

watch(
  () => [props.defaultView, props.layer?.id] as const,
  ([nextView]) => {
    activeView.value = nextView
  },
)

const copy = computed(() =>
  locale.value === 'zh-CN'
    ? {
        eyebrow: '单一层检查器',
        role: '这层做什么',
        operation: '怎么算',
        shape: 'Shape 与参数',
        input: '输入 shape',
        output: '输出 shape',
        params: '可学习参数',
        noLayer: '选择上方阶段查看解释',
        current: '当前层',
        backbone: '这部分属于特征提取 backbone；迁移时通常先冻结它。',
        head: '这部分属于 classifier head；迁移到新任务时通常替换它。',
      }
    : {
        eyebrow: 'Single layer inspector',
        role: 'What it does',
        operation: 'How it computes',
        shape: 'Shape & parameters',
        input: 'Input shape',
        output: 'Output shape',
        params: 'Trainable parameters',
        noLayer: 'Choose a stage above to inspect it',
        current: 'Current layer',
        backbone: 'This belongs to the feature backbone and is commonly frozen first during transfer.',
        head: 'This belongs to the classifier head and is commonly replaced for a new task.',
      },
)

const layerRole = computed(() => {
  const kind = props.layer?.kind
  const zh = locale.value === 'zh-CN'
  if (kind === 'input') return zh ? '把图片变成三个归一化颜色通道，后续计算只读取数值。' : 'Turns the image into three normalized color channels consumed by later operations.'
  if (kind === 'conv') return zh ? '用共享 kernel 扫描局部窗口，为每个 filter 生成一张 feature map。' : 'Slides shared kernels over local windows and produces one feature map per filter.'
  if (kind === 'relu') return zh ? '把负激活截为 0，保留正响应并引入非线性。' : 'Clips negative activations to zero, keeps positive responses, and adds nonlinearity.'
  if (kind === 'pool') return zh ? '从局部窗口保留最大响应，缩小空间尺寸并扩大后续感受野。' : 'Keeps the strongest local response, shrinks spatial size, and grows later receptive fields.'
  if (kind === 'flatten') return zh ? '按固定顺序把多张二维 feature maps 排成一条向量。' : 'Reorders all spatial feature maps into one vector without learning new values.'
  if (kind === 'dense') return zh ? '对特征向量做加权求和，再由 Softmax 归一化为类别概率。' : 'Combines the feature vector into logits and normalizes them into class probabilities with Softmax.'
  return copy.value.noLayer
})

const formula = computed(() => {
  const kind = props.layer?.kind
  if (kind === 'input') return '$$x_{r,g,b} = p_{r,g,b} / 255$$'
  if (kind === 'conv') return '$$z_{k,i,j}=\\sum_c\\sum_u\\sum_v x_{c,i+u,j+v}K_{k,c,u,v}+b_k$$'
  if (kind === 'relu') return '$$a=\\max(0,z)$$'
  if (kind === 'pool') return '$$y_{i,j}=\\max_{(u,v)\\in W_{i,j}}x_{u,v}$$'
  if (kind === 'flatten') return '$$v_t=x_{c,i,j}$$'
  if (kind === 'dense') return '$$p_k=\\frac{e^{z_k}}{\\sum_j e^{z_j}},\\quad z=Wv+b$$'
  return ''
})

const operationEvidence = computed(() => {
  const detail = props.detail
  if (!detail) return ''
  if (detail.kind === 'conv') return `cell (${detail.row}, ${detail.col}) · ${detail.channelContributions?.length ?? 0} channels · bias ${(detail.bias ?? 0).toFixed(3)}`
  if (detail.kind === 'relu') return `z = ${(detail.weightedSum ?? 0).toFixed(3)} → ReLU = ${(detail.reluValue ?? 0).toFixed(3)}`
  if (detail.kind === 'pool') return `window (${detail.row}, ${detail.col}) → max ${(detail.poolMax ?? 0).toFixed(3)}`
  if (detail.kind === 'flatten') return `feature map → v[${detail.flattenIndex ?? 0}]`
  if (detail.kind === 'dense') {
    const top = [...props.scores].sort((left, right) => right.probability - left.probability)[0]
    return top ? `top-1 ${top.label} · ${(top.probability * 100).toFixed(1)}%` : ''
  }
  return props.layer?.outputShape.join(' × ') ?? ''
})

const transferNote = computed(() => {
  if (props.sectionId !== 'transfer-learning-review' || !props.layer) return ''
  return ['flatten', 'dense'].includes(props.layer.kind) ? copy.value.head : copy.value.backbone
})
</script>

<template>
  <section class="cnn-guided-inspector" aria-live="polite">
    <header>
      <div>
        <span>{{ copy.eyebrow }}</span>
        <strong v-if="layer">{{ copy.current }} · {{ layer.name }}</strong>
        <strong v-else>{{ copy.noLayer }}</strong>
      </div>
      <div role="tablist" :aria-label="copy.eyebrow">
        <button type="button" role="tab" :aria-selected="activeView === 'role'" :class="{ 'is-active': activeView === 'role' }" @click="activeView = 'role'">
          {{ copy.role }}
        </button>
        <button type="button" role="tab" :aria-selected="activeView === 'operation'" :class="{ 'is-active': activeView === 'operation' }" @click="activeView = 'operation'">
          {{ copy.operation }}
        </button>
        <button type="button" role="tab" :aria-selected="activeView === 'shape'" :class="{ 'is-active': activeView === 'shape' }" @click="activeView = 'shape'">
          {{ copy.shape }}
        </button>
      </div>
    </header>

    <div v-if="layer" class="cnn-guided-inspector__body">
      <div v-if="activeView === 'role'" role="tabpanel" class="cnn-guided-inspector__role">
        <i :class="`is-${layer.kind}`" aria-hidden="true" />
        <p>{{ layerRole }}</p>
        <strong v-if="transferNote">{{ transferNote }}</strong>
      </div>

      <div v-else-if="activeView === 'operation'" role="tabpanel" class="cnn-guided-inspector__operation">
        <MarkdownMathContent :source="formula" />
        <p>{{ operationEvidence }}</p>
      </div>

      <dl v-else role="tabpanel" class="cnn-guided-inspector__shape">
        <div>
          <dt>{{ copy.input }}</dt>
          <dd>{{ layer.inputShape.join(' × ') || '—' }}</dd>
        </div>
        <span aria-hidden="true">→</span>
        <div>
          <dt>{{ copy.output }}</dt>
          <dd>{{ layer.outputShape.join(' × ') }}</dd>
        </div>
        <div>
          <dt>{{ copy.params }}</dt>
          <dd>{{ layer.parameterCount.toLocaleString() }}</dd>
        </div>
      </dl>
    </div>
  </section>
</template>
