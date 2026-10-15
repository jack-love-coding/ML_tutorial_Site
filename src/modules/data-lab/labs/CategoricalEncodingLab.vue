<script setup lang="ts">
import { computed, reactive } from 'vue'
import type { DataLabLocale } from '../types/dataLab'
import { categoricalEncodingExample, categoricalEncodingPython, encodingDefaults, type EncodingMode } from '../utils/categoricalEncodingLesson.ts'

const props = withDefaults(defineProps<{ locale?: DataLabLocale }>(), { locale: 'zh-CN' })
const config = reactive({ ...encodingDefaults, tags: [...encodingDefaults.tags] })
const snapshot = computed(() => categoricalEncodingExample(config))
const code = computed(() => categoricalEncodingPython(config))
const zh = computed(() => props.locale === 'zh-CN')
const modes: EncodingMode[] = ['one-hot', 'multi-hot', 'cross', 'hash']
const districts = ['north', 'south', 'west', 'harbor', 'airport', 'island']
const properties = ['apartment', 'condo', 'house', 'loft', 'townhouse']
const tags = ['subway', 'school', 'park', 'parking', 'pet', 'gym', 'roof']
const labels = computed(() => ({ 'one-hot': 'one-hot', 'multi-hot': 'multi-hot', cross: zh.value ? '特征交叉' : 'feature cross', hash: zh.value ? '哈希桶' : 'hash buckets' }))
function reset() { Object.assign(config, encodingDefaults, { tags: [...encodingDefaults.tags] }) }
</script>

<template>
  <section class="data-lab-card categorical-encoding-lab">
    <div class="data-lab-card__visual categorical-encoding-lab__visual">
      <h4>{{ zh ? '当前向量：槽位从 0 开始' : 'Current vector: slots start at 0' }}</h4>
      <div class="categorical-encoding-lab__vector" role="list" :aria-label="zh ? '编码向量' : 'Encoded vector'">
        <div v-for="(value, index) in snapshot.vector" :key="index" role="listitem" :class="{ 'is-active': value === 1 }">
          <span>#{{ index }}</span><strong>{{ value }}</strong>
        </div>
      </div>
      <div class="data-readout-grid" aria-live="polite">
        <article><span>{{ zh ? '向量宽度' : 'Vector width' }}</span><strong data-testid="encoding-width">{{ snapshot.vector.length }}</strong></article>
        <article><span>{{ zh ? '激活槽位' : 'Active slots' }}</span><strong data-testid="encoding-active">{{ snapshot.active.join(', ') || '∅' }}</strong></article>
        <article><span>{{ zh ? '映射后类别' : 'Mapped tokens' }}</span><strong data-testid="encoding-mapped">{{ snapshot.mapped.join(', ') || '∅' }}</strong></article>
      </div>
      <details>
        <summary>{{ zh ? '查看每个槽位的含义和值' : 'Inspect every slot, token and value' }}</summary>
        <table class="categorical-encoding-lab__table">
          <thead><tr><th>{{ zh ? '槽位' : 'Slot' }}</th><th>{{ zh ? '类别' : 'Token' }}</th><th>{{ zh ? '值' : 'Value' }}</th></tr></thead>
          <tbody><tr v-for="(token, index) in snapshot.tokens" :key="token"><td>{{ index }}</td><td>{{ token }}</td><td>{{ snapshot.vector[index] }}</td></tr></tbody>
        </table>
      </details>
      <p v-if="config.mode === 'cross'">{{ zh ? `街区 ${snapshot.district.tokens.length} 槽 × 房型 ${snapshot.property.tokens.length} 槽 = ${snapshot.vector.length} 槽。本例每个字段只有一个值，因此组合向量也只有一个 1。` : `${snapshot.district.tokens.length} district slots × ${snapshot.property.tokens.length} property slots = ${snapshot.vector.length} slots. Each field has one value, so the crossed vector has one active slot.` }}</p>
      <p v-else-if="config.mode === 'hash'">{{ zh ? '哈希直接按固定规则分桶，不使用 OOV 槽。设为 4 桶，再切换 north 和 airport：两者都落在 0 桶，这就是碰撞。' : 'Hashing assigns buckets by a fixed rule and uses no OOV slot. Set 4 buckets and switch between north and airport: both enter bucket 0, a collision.' }}</p>
      <p v-else-if="config.mode === 'multi-hot'">{{ zh ? '同一样本可有多个标签；每个标签只激活一次。roof 未出现在标签训练列表中，进入 OOV；不选标签得到全零向量。' : 'One sample may carry several tags, each activating a slot once. The unseen tag roof maps to OOV; selecting no tags gives an all-zero vector.' }}</p>
      <p v-else>{{ zh ? '与上一节共用五条训练记录：north 2 次、south 2 次、west 1 次。默认 west 进入 RARE，airport 未见过，进入 OOV。向量宽度不会随预测样本改变。' : 'The same five training rows as the previous section contain north twice, south twice and west once. By default west maps to RARE; unseen airport maps to OOV. Selecting a prediction sample never changes vector width.' }}</p>
    </div>

    <div class="data-lab-card__controls">
      <header><span>{{ zh ? '交互实验' : 'Interactive lab' }}</span><strong>{{ zh ? '类别编码实验室' : 'Categorical Encoding Lab' }}</strong><p>{{ zh ? '选择场景，读取固定槽位中的结果，再对照参考代码。' : 'Choose a scenario, read the fixed slots, then compare the reference code.' }}</p></header>
      <div class="data-segmented-control">
        <button v-for="mode in modes" :key="mode" type="button" :aria-pressed="config.mode === mode" :class="{ 'is-active': config.mode === mode }" @click="config.mode = mode">{{ labels[mode] }}</button>
      </div>
      <label v-if="config.mode !== 'multi-hot'">{{ zh ? '预测街区' : 'Prediction district' }}
        <select v-model="config.district" data-testid="encoding-district"><option v-for="value in districts" :key="value">{{ value }}</option></select>
      </label>
      <label v-if="config.mode === 'cross'">{{ zh ? '预测房型' : 'Prediction property type' }}
        <select v-model="config.propertyType" data-testid="encoding-property"><option v-for="value in properties" :key="value">{{ value }}</option></select>
      </label>
      <fieldset v-if="config.mode === 'multi-hot'" class="categorical-encoding-lab__tags">
        <legend>{{ zh ? '样本标签' : 'Sample tags' }}</legend>
        <label v-for="tag in tags" :key="tag"><input v-model="config.tags" type="checkbox" :value="tag" />{{ tag }}</label>
      </fieldset>
      <template v-if="config.mode === 'one-hot' || config.mode === 'cross'">
        <label class="data-range-control">{{ zh ? '街区最低频次' : 'District minimum frequency' }}: {{ config.minFrequency }}<input v-model.number="config.minFrequency" type="range" min="1" max="3" step="1" /></label>
        <label class="data-range-control">{{ zh ? '最多保留街区类别' : 'Maximum retained districts' }}: {{ config.maxCategories }}<input v-model.number="config.maxCategories" type="range" min="2" max="6" step="1" /></label>
        <p class="data-lab-note">{{ zh ? '这两个控件模拟重新训练词表。预测街区和房型选择只做 transform；真实验证、测试和线上预测必须冻结训练规则。' : 'These two controls simulate fitting a new vocabulary. Prediction selectors only transform; real validation, test and serving must keep the trained rules frozen.' }}</p>
      </template>
      <label v-if="config.mode === 'hash'" class="data-range-control">{{ zh ? '哈希桶数' : 'Hash buckets' }}: {{ config.bucketCount }}<input v-model.number="config.bucketCount" type="range" min="4" max="16" step="1" /></label>
      <button type="button" class="action-button" @click="reset">{{ zh ? '重置' : 'Reset' }}</button>
      <details><summary>{{ zh ? '展开与当前结果一致的 Python 代码' : 'Show Python matching the current result' }}</summary><pre class="data-code-block"><code>{{ code }}</code></pre></details>
    </div>
  </section>
</template>

<style scoped src="../../../styles/modules/categorical-encoding.css"></style>
