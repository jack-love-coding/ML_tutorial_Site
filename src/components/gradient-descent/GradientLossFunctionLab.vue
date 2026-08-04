<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { evaluateLinearRegression } from '../../simulations/gradientDescentLesson'
import type { GradientDescentInteractionPayload } from '../../types/gradientDescentLesson'
import GradientLabFrame from './GradientLabFrame.vue'

type Payload = Extract<GradientDescentInteractionPayload, { scene: 'loss-function' }>
const props = defineProps<{ payload: Payload }>()
const { locale } = useI18n()
const weight = ref(props.payload.anchor.weight)
const bias = ref(props.payload.anchor.bias)
const evaluation = computed(() => evaluateLinearRegression(props.payload.samples, { weight: weight.value, bias: bias.value }))
const liveLossCurve = computed(() => props.payload.lossCurve.map((point) => ({
  weight: point.weight,
  mse: evaluateLinearRegression(props.payload.samples, { weight: point.weight, bias: bias.value }).mse,
})))
const x = (value: number) => 42 + ((value - 0.5) / 5) * 430
const y = (value: number) => 250 - ((value - 45) / 38) * 210
const lossX = (value: number) => 42 + ((value - 4) / 5) * 430
const maxLoss = computed(() => Math.max(...liveLossCurve.value.map((point) => point.mse), evaluation.value.mse, 1))
const lossY = (value: number) => 250 - (value / maxLoss.value) * 205
const lossPath = computed(() => liveLossCurve.value.map((point, index) => `${index ? 'L' : 'M'} ${lossX(point.weight)} ${lossY(point.mse)}`).join(' '))
const zh = computed(() => locale.value === 'zh-CN')
const reset = () => { weight.value = props.payload.anchor.weight; bias.value = props.payload.anchor.bias }
</script>

<template>
  <GradientLabFrame
    :title="zh ? '直线、残差与损失同步观察' : 'Line, residuals, and loss in sync'"
    :description="zh ? '所有点都来自同一份五行回归数据。移动参数不会修改数据，只会改变模型。' : 'All points come from the same five-row dataset. Moving parameters changes the model, not the data.'"
    :status="`Notebook · ${payload.notebookCellId}`"
  >
    <template #controls>
      <div class="gradient-lab-controls">
        <label>{{ zh ? '斜率 w' : 'Slope w' }} <output>{{ weight.toFixed(2) }}</output><input v-model.number="weight" type="range" min="4" max="9" step="0.05" /></label>
        <label>{{ zh ? '截距 b' : 'Intercept b' }} <output>{{ bias.toFixed(2) }}</output><input v-model.number="bias" type="range" min="38" max="54" step="0.1" /></label>
        <button type="button" @click="reset">{{ zh ? '恢复示例参数' : 'Reset parameters' }}</button>
      </div>
    </template>

    <div class="gradient-lab-grid">
      <figure><figcaption>{{ zh ? '数据空间：真实点、预测直线与残差' : 'Data space: targets, fitted line, and residuals' }}</figcaption><svg viewBox="0 0 520 285" role="img" :aria-label="zh ? '五个真实样本及当前拟合直线' : 'Five samples and the current fitted line'">
        <line x1="42" y1="250" x2="485" y2="250" class="gd-axis"/><line x1="42" y1="25" x2="42" y2="250" class="gd-axis"/>
        <line :x1="x(1)" :y1="y(weight * 1 + bias)" :x2="x(5)" :y2="y(weight * 5 + bias)" class="gd-fit"/>
        <g v-for="(sample, index) in payload.samples" :key="sample.id"><line :x1="x(sample.x)" :x2="x(sample.x)" :y1="y(sample.y)" :y2="y(evaluation.predictions[index])" class="gd-residual"/><circle :cx="x(sample.x)" :cy="y(sample.y)" r="6" class="gd-target"/><circle :cx="x(sample.x)" :cy="y(evaluation.predictions[index])" r="4" class="gd-prediction"/></g>
        <text x="445" y="274">x</text><text x="12" y="32">y</text>
      </svg></figure>
      <figure><figcaption>{{ zh ? '参数切片：固定当前截距时的 MSE' : 'Parameter slice: MSE at the current intercept' }}</figcaption><svg viewBox="0 0 520 285" role="img" :aria-label="zh ? '斜率与均方误差曲线' : 'Slope versus mean squared error'">
        <line x1="42" y1="250" x2="485" y2="250" class="gd-axis"/><line x1="42" y1="25" x2="42" y2="250" class="gd-axis"/><path :d="lossPath" class="gd-loss-path"/><circle :cx="lossX(weight)" :cy="lossY(evaluation.mse)" r="7" class="gd-current"/><text x="425" y="274">w</text><text x="8" y="32">MSE</text>
      </svg></figure>
    </div>

    <template #readout><article><span>MSE</span><strong>{{ evaluation.mse.toFixed(6) }}</strong></article><article><span>dw</span><strong>{{ evaluation.gradient.weight.toFixed(4) }}</strong></article><article><span>db</span><strong>{{ evaluation.gradient.bias.toFixed(4) }}</strong></article></template>
    <template #fallback-label>{{ zh ? '查看数值表' : 'View numeric table' }}</template>
    <template #fallback><div class="gradient-table-scroll" tabindex="0"><table><thead><tr><th>ID</th><th>x</th><th>y</th><th>ŷ</th><th>r = y-ŷ</th></tr></thead><tbody><tr v-for="(sample,index) in payload.samples" :key="sample.id"><td>{{ sample.id }}</td><td>{{ sample.x }}</td><td>{{ sample.y }}</td><td>{{ evaluation.predictions[index].toFixed(3) }}</td><td>{{ evaluation.residuals[index].toFixed(3) }}</td></tr></tbody></table></div></template>
  </GradientLabFrame>
</template>
