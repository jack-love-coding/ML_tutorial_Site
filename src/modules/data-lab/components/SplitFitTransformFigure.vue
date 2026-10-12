<script setup lang="ts">
import type { DataLabLocale } from '../types/dataLab'
import type { DataPipelineTaskSnapshot } from '../utils/pipelineTask'

defineProps<{ snapshot: DataPipelineTaskSnapshot; locale: DataLabLocale }>()
const number = (value: number) => value.toFixed(3).replace(/\.?0+$/, '')
</script>

<template>
  <figure class="data-fit-figure" data-testid="split-fit-figure">
    <figcaption>
      <strong>{{ locale === 'zh-CN' ? '参数从哪里来，又用到哪里？' : 'Where do parameters come from, and where are they used?' }}</strong>
      <p>{{ locale === 'zh-CN' ? '箭头展示安全协议。选择反例时，虚线框标出违反协议的参数来源；下方代码展示反例的实际顺序。' : 'Arrows show the safe protocol. For counterexamples, the dashed box identifies a fit-source violation; the code below shows the actual order.' }}</p>
    </figcaption>
    <ol class="data-fit-figure__steps">
      <li>
        <strong>1 · split</strong>
        <p>{{ locale === 'zh-CN' ? '固定数据的职责' : 'Fix the roles of the data' }}</p>
        <ul>
          <li>train · {{ snapshot.splitCounts.train }} {{ locale === 'zh-CN' ? '行：学习参数' : 'rows: learn parameters' }}</li>
          <li>validation · {{ snapshot.splitCounts.validation }} {{ locale === 'zh-CN' ? '行：比较方案' : 'row: compare choices' }}</li>
          <li>test · {{ snapshot.splitCounts.test }} {{ locale === 'zh-CN' ? '行：最后评估' : 'row: evaluate at the end' }}</li>
        </ul>
      </li>
      <li :class="{ 'is-warning': !snapshot.safe }">
        <strong>2 · fit</strong>
        <p>{{ locale === 'zh-CN' ? '只允许训练集提供参数' : 'Only train should supply parameters' }}</p>
        <p v-if="!snapshot.safe">{{ locale === 'zh-CN' ? '当前反例越过了这条边界：' : 'The selected counterexample crosses this boundary:' }}</p>
        <ul>
          <li>{{ locale === 'zh-CN' ? '缩放来源' : 'Scaler source' }}: {{ snapshot.fitSources.scaler }}</li>
          <li>{{ locale === 'zh-CN' ? '词表来源' : 'Vocabulary source' }}: {{ snapshot.fitSources.vocabulary }}</li>
        </ul>
        <p v-for="stat in snapshot.scalerStats" :key="stat.feature" class="data-fit-figure__stat">
          {{ stat.feature }} · μ = {{ number(stat.mean) }} · σ = {{ number(stat.standardDeviation) }}
        </p>
        <p v-if="snapshot.vocabulary.length">{{ locale === 'zh-CN' ? '固定词表' : 'Fixed vocabulary' }}: {{ snapshot.vocabulary.join(', ') }}</p>
      </li>
      <li>
        <strong>3 · transform</strong>
        <p>{{ locale === 'zh-CN' ? '三份数据复用同一组参数，不再 fit' : 'Reuse the same parameters on all three splits; do not fit again' }}</p>
        <p>z = (x − μ) / σ</p>
        <p v-for="stat in snapshot.scalerStats" :key="stat.feature" class="data-fit-figure__stat">
          validation · {{ stat.feature }}: ({{ stat.validationValue }} − {{ number(stat.mean) }}) / {{ number(stat.standardDeviation) }} ≈ {{ number(stat.transformedValidation) }}
        </p>
        <p v-if="snapshot.vocabulary.length">{{ locale === 'zh-CN' ? '本例把未知类别编码为全 0；不会新增列。' : 'This example encodes an unknown category as all zeros; it adds no column.' }}</p>
      </li>
    </ol>
    <p class="data-lab-note">{{ locale === 'zh-CN' ? '默认时 rooms 的训练均值为 2.5；改为全表 fit 后变成 3。验证行没有改变，它的标准化值却从约 0.447 变为 0：验证数据已经影响了预处理。这里仅演示输入变换，不预测房价；price 是演示输入，不能同时作为预测目标。' : 'By default, the training mean of rooms is 2.5; fitting all rows makes it 3. The validation row is unchanged, but its standardized value moves from about 0.447 to 0: held-out data has influenced preprocessing. This is an input-transform demo, not a house-price predictor; price is a demo input and must not also be the prediction target.' }}</p>
  </figure>
</template>
