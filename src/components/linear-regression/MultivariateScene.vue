<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { MultivariateInteractionAsset } from '../../types/linearRegressionInteraction'
import { scaleLinear } from '../../utils/linearRegressionSvg'

const props = defineProps<{ asset: MultivariateInteractionAsset }>()
const { locale } = useI18n()
type PartitionId = 'train' | 'validation' | 'test'
const partitionId = ref<PartitionId>('train')
const stageId = ref(props.asset.stages[0]?.id ?? '')
const width = 760
const height = 420

const copy = computed(() => locale.value === 'zh-CN'
  ? { title:'时间切分与设计矩阵', partition:'数据分区', stage:'特征阶段', train:'训练集', validation:'验证集', test:'测试集', timeline:'时间顺序切分', matrix:'设计矩阵样例', metrics:'阶段指标', trainRmse:'训练 RMSE', validationRmse:'验证 RMSE', rows:'行数', mean:'cnt 均值', locked:'测试集保持锁定，不参与特征选择', forbidden:'泄漏列永不进入矩阵', empty:'当前资产没有可展示的样例行', fallback:'数据表与文字说明' }
  : { title:'Time split and design matrix', partition:'Data partition', stage:'Feature stage', train:'Train', validation:'Validation', test:'Test', timeline:'Chronological split', matrix:'Design-matrix sample', metrics:'Stage metrics', trainRmse:'Train RMSE', validationRmse:'Validation RMSE', rows:'Rows', mean:'Mean cnt', locked:'The test set stays locked and never guides feature selection', forbidden:'Leakage columns never enter the matrix', empty:'No sample rows are available in this asset', fallback:'Data table and text fallback' })

const selectedPartition = computed(() => props.asset.partitions.find(item => item.id === partitionId.value) ?? props.asset.partitions[0])
const selectedStage = computed(() => props.asset.stages.find(item => item.id === stageId.value) ?? props.asset.stages[0])
const features = computed(() => (selectedStage.value?.features ?? []).filter(feature => !props.asset.forbiddenFeatures.includes(feature)).slice(0, 9))
const rows = computed(() => (props.asset.sampleRows[partitionId.value] ?? []).slice(0, 5))
const allStart = computed(() => Math.min(...props.asset.partitions.map(item => item.start)))
const allEnd = computed(() => Math.max(...props.asset.partitions.map(item => item.end)))
const timeX = (value:number) => scaleLinear(value,{minimum:allStart.value,maximum:allEnd.value},{minimum:42,maximum:width-24})
const matrixLeft = 150
const matrixTop = 154
const cellWidth = computed(() => Math.min(62,(width-matrixLeft-24)/Math.max(features.value.length,1)))
const cellHeight = 38
const metricMax = computed(() => Math.max(...props.asset.stages.flatMap(stage => [stage.trainRmse,stage.validationRmse]),1))
const stageX = (index:number) => 65 + index * ((width-110)/Math.max(props.asset.stages.length-1,1))
const metricY = (value:number) => scaleLinear(value,{minimum:0,maximum:metricMax.value*1.08},{minimum:height-30,maximum:300})

function format(value:unknown,digits=2){const number=Number(value);return Number.isFinite(number)?number.toFixed(digits):'—'}
function heatValue(feature:string,row:Record<string,number>){
  const value=Number(row[feature]); const values=rows.value.map(item=>Number(item[feature])).filter(Number.isFinite)
  const bound=Math.max(...values.map(Math.abs),1); return Number.isFinite(value)?Math.max(-1,Math.min(1,value/bound)):0
}
function heatFill(value:number){const lightness=96-Math.abs(value)*33;return value>=0?`hsl(202 48% ${lightness}%)`:`hsl(18 55% ${lightness}%)`}
function label(id:PartitionId){return copy.value[id]}
</script>

<template>
  <section class="linear-interaction-scene" data-scene-id="multivariate">
    <div class="linear-interaction-scene__controls" :aria-label="copy.title">
      <label><span>{{ copy.partition }}</span><select v-model="partitionId" :aria-label="copy.partition"><option v-for="item in asset.partitions" :key="item.id" :value="item.id">{{ label(item.id) }}</option></select></label>
      <label><span>{{ copy.stage }}</span><select v-model="stageId" :aria-label="copy.stage"><option v-for="(stage,index) in asset.stages" :key="stage.id" :value="stage.id">{{ index+1 }} · {{ stage.id }}</option></select></label>
    </div>
    <figure class="linear-interaction-scene__figure">
      <figcaption><strong>{{ copy.title }}</strong><span>{{ partitionId==='test' ? copy.locked : copy.forbidden }}: {{ asset.forbiddenFeatures.join(' · ') }}</span></figcaption>
      <svg :viewBox="`0 0 ${width} ${height}`" role="img" :aria-label="`${copy.timeline}; ${copy.matrix}; ${copy.metrics}`">
        <text x="42" y="24" class="heading">{{ copy.timeline }}</text>
        <g v-for="part in asset.partitions" :key="part.id">
          <rect :x="timeX(part.start)" y="38" :width="Math.max(2,timeX(part.end)-timeX(part.start))" height="38" :class="['partition',part.id,{selected:part.id===partitionId}]" />
          <text :x="(timeX(part.start)+timeX(part.end))/2" y="62" class="partition-label">{{ label(part.id) }} · {{ part.rows }}</text>
        </g>
        <path :d="`M42 92 H${width-24}`" class="time-axis" /><path :d="`M${width-34} 86 L${width-24} 92 L${width-34} 98`" class="time-axis" />

        <text x="42" y="132" class="heading">{{ copy.matrix }} · {{ selectedStage?.id }}</text>
        <template v-if="rows.length && features.length">
          <text v-for="(feature,column) in features" :key="`h-${feature}`" :x="matrixLeft+column*cellWidth+cellWidth/2" :y="matrixTop-10" class="feature-label">{{ feature }}</text>
          <g v-for="(row,rowIndex) in rows" :key="`row-${rowIndex}`">
            <text :x="matrixLeft-12" :y="matrixTop+rowIndex*cellHeight+24" class="row-label">{{ label(partitionId) }} {{ rowIndex+1 }}</text>
            <g v-for="(feature,column) in features" :key="feature">
              <rect :x="matrixLeft+column*cellWidth" :y="matrixTop+rowIndex*cellHeight" :width="cellWidth-3" :height="cellHeight-3" :fill="heatFill(heatValue(feature,row))" class="matrix-cell" />
              <text :x="matrixLeft+column*cellWidth+(cellWidth-3)/2" :y="matrixTop+rowIndex*cellHeight+23" class="cell-label">{{ format(row[feature],1) }}</text>
            </g>
          </g>
        </template>
        <text v-else x="42" y="190" class="empty">{{ copy.empty }}</text>

        <g class="metric-chart">
          <text x="42" y="294" class="heading">{{ copy.metrics }}</text>
          <polyline :points="asset.stages.map((stage,index)=>`${stageX(index)},${metricY(stage.trainRmse)}`).join(' ')" class="train-line" />
          <polyline :points="asset.stages.map((stage,index)=>`${stageX(index)},${metricY(stage.validationRmse)}`).join(' ')" class="validation-line" />
          <g v-for="(stage,index) in asset.stages" :key="`metric-${stage.id}`">
            <circle :cx="stageX(index)" :cy="metricY(stage.trainRmse)" r="5" class="train-dot" />
            <rect :x="stageX(index)-5" :y="metricY(stage.validationRmse)-5" width="10" height="10" class="validation-dot" />
            <text :x="stageX(index)" :y="height-11" class="stage-label">{{ index+1 }}</text>
          </g>
        </g>
      </svg>
    </figure>
    <div class="linear-interaction-scene__readout" aria-live="polite">
      <p><span>{{ copy.partition }}</span><strong>{{ label(selectedPartition!.id) }} · {{ selectedPartition!.rows.toLocaleString() }} {{ copy.rows }} · {{ copy.mean }} {{ format(selectedPartition!.targetMean,1) }}</strong></p>
      <p><span>{{ copy.metrics }}</span><strong>{{ copy.trainRmse }} {{ format(selectedStage?.trainRmse,1) }} · {{ copy.validationRmse }} {{ format(selectedStage?.validationRmse,1) }}</strong></p>
    </div>
    <details><summary>{{ copy.fallback }}</summary><table><thead><tr><th>{{ copy.stage }}</th><th>{{ copy.trainRmse }}</th><th>{{ copy.validationRmse }}</th></tr></thead><tbody><tr v-for="stage in asset.stages" :key="stage.id"><td>{{ stage.id }}</td><td>{{ format(stage.trainRmse,2) }}</td><td>{{ format(stage.validationRmse,2) }}</td></tr></tbody></table><p>{{ copy.locked }}</p></details>
  </section>
</template>

<style scoped>
.linear-interaction-scene{display:grid;gap:16px;min-width:0}.linear-interaction-scene__controls{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.linear-interaction-scene__controls label{display:grid;gap:7px;padding:12px;border:1px solid rgba(15,23,40,.1);border-radius:8px;background:#f7f9fc}.linear-interaction-scene__controls span{color:var(--muted);font-size:.78rem;font-weight:800}.linear-interaction-scene__controls select{min-height:42px;padding:7px;border:1px solid rgba(15,23,40,.16);border-radius:6px;background:#fff}.linear-interaction-scene__figure{display:grid;gap:10px;margin:0;padding:12px;border:1px solid rgba(15,23,40,.09);border-radius:8px;background:#fbfcfe}.linear-interaction-scene__figure figcaption{display:flex;justify-content:space-between;gap:12px;align-items:baseline}.linear-interaction-scene__figure figcaption span{color:var(--muted);font-size:.82rem}.linear-interaction-scene__figure svg{width:100%;height:auto;max-height:470px}.heading{fill:#182130;font-size:14px;font-weight:800}.partition{stroke:#fff;stroke-width:3;fill:#b9c3d0}.partition.validation{fill:#f1b56c}.partition.test{fill:#c9b6dc}.partition.selected{stroke:#101827;stroke-width:4}.partition-label,.feature-label,.row-label,.cell-label,.stage-label{fill:#263143;font-size:11px;text-anchor:middle}.time-axis{fill:none;stroke:#4e596a;stroke-width:2}.feature-label{font-weight:800}.row-label{text-anchor:end}.matrix-cell{stroke:#fff;stroke-width:2}.cell-label{font-size:10px}.empty{fill:#697487;font-size:13px}.train-line{fill:none;stroke:#23765f;stroke-width:3}.validation-line{fill:none;stroke:#b55235;stroke-width:3;stroke-dasharray:8 6}.train-dot{fill:#fff;stroke:#23765f;stroke-width:3}.validation-dot{fill:#fff;stroke:#b55235;stroke-width:3}.linear-interaction-scene__readout{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.linear-interaction-scene__readout p{display:grid;gap:4px;margin:0;padding:12px 14px;border-left:4px solid var(--linear-accent,#db6c3a);background:#f7f9fc}.linear-interaction-scene__readout span{color:var(--muted);font-size:.78rem;font-weight:800}details{padding:10px 12px;border:1px solid rgba(15,23,40,.09);border-radius:7px}summary{cursor:pointer;font-weight:800}table{width:100%;margin-top:10px;border-collapse:collapse}th,td{padding:7px;border-top:1px solid rgba(15,23,40,.08);text-align:left}td:not(:first-child),th:not(:first-child){text-align:right;font-family:monospace}@media(max-width:720px){.linear-interaction-scene__controls,.linear-interaction-scene__readout{grid-template-columns:1fr}.linear-interaction-scene__figure{overflow-x:auto}.linear-interaction-scene__figure figcaption{display:grid}.linear-interaction-scene__figure svg{min-width:620px}}
</style>
