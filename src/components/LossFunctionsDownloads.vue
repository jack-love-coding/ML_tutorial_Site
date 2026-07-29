<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  lossFunctionsAssets,
  type DownloadableCourseAsset,
  type LossFunctionsAssetKind,
} from '../data/lossFunctionsAssets'
import type { AppLocale } from '../types/ml'
import { withPublicBase } from '../utils/publicPath'

const { locale } = useI18n()

interface DownloadGroup {
  id: string
  title: string
  description: string
  kinds: readonly LossFunctionsAssetKind[]
  assets: readonly DownloadableCourseAsset[]
}

const copy = computed(() => {
  const zh = locale.value === 'zh-CN'
  return {
    eyebrow: zh ? '本地可复现实验包' : 'Local reproducibility package',
    title: zh ? '下载数据、Notebook 与固定运行结果' : 'Download data, Notebooks, and locked run results',
    intro: zh
      ? '全部文件随课程发布，不依赖远程运行时。数据说明记录来源、许可、哈希和隐私边界；四个 Notebook 在独立干净内核中执行。'
      : 'Every file ships with the course and has no remote runtime dependency. Dataset manifests record source, license, hashes, and privacy boundaries; all four Notebooks were executed in independent clean kernels.',
    sourceTitle: zh ? '数据、来源与许可' : 'Data, sources, and licenses',
    sourceDescription: zh
      ? '两个本地数据集、各自说明文件，以及统一来源与许可记录。'
      : 'Two local datasets, their manifests, and the shared source and license record.',
    notebookTitle: zh ? '四个已执行 Notebook' : 'Four executed Notebooks',
    notebookDescription: zh
      ? '配送损失与制造 BCE 各有中英文版本，代码与数值输出保持一致。'
      : 'Delivery losses and manufacturing BCE each have Chinese and English variants with identical code and numerical outputs.',
    resultTitle: zh ? '固定结果与图表' : 'Locked results and plots',
    resultDescription: zh
      ? '页面读取的小型 JSON 汇总和带文字/形状编码的可复现图表。'
      : 'The small JSON summaries loaded by the page and reproducible plots with text-and-shape encoding.',
    environmentTitle: zh ? '环境与完整清单' : 'Environment and complete manifest',
    environmentDescription: zh
      ? '固定依赖、执行环境和 16 个发布文件的完整哈希清单。'
      : 'Pinned dependencies, execution environment, and the complete hash inventory for all 16 published files.',
    download: zh ? '下载文件' : 'Download file',
    localOnly: zh ? '本地课程文件' : 'Local course file',
  }
})

const groups = computed<DownloadGroup[]>(() => {
  const definitions = [
    {
      id: 'sources',
      title: copy.value.sourceTitle,
      description: copy.value.sourceDescription,
      kinds: ['dataset', 'dataset-manifest', 'attribution'],
    },
    {
      id: 'notebooks',
      title: copy.value.notebookTitle,
      description: copy.value.notebookDescription,
      kinds: ['executed-notebook'],
    },
    {
      id: 'results',
      title: copy.value.resultTitle,
      description: copy.value.resultDescription,
      kinds: ['locked-summary', 'plot'],
    },
    {
      id: 'environment',
      title: copy.value.environmentTitle,
      description: copy.value.environmentDescription,
      kinds: ['requirements', 'environment', 'output-manifest'],
    },
  ] as const

  return definitions.map((definition) => ({
    ...definition,
    assets: lossFunctionsAssets.filter((asset) =>
      definition.kinds.includes(asset.kind as never),
    ),
  }))
})

function localized(copyValue: { 'zh-CN': string; en: string }) {
  return copyValue[locale.value as AppLocale]
}
</script>

<template>
  <section class="panel loss-downloads" data-loss-downloads>
    <header class="loss-downloads__header">
      <span>{{ copy.eyebrow }}</span>
      <strong>{{ copy.title }}</strong>
      <p>{{ copy.intro }}</p>
    </header>

    <div class="loss-downloads__groups">
      <section v-for="group in groups" :key="group.id" class="loss-downloads__group">
        <header>
          <strong>{{ group.title }}</strong>
          <p>{{ group.description }}</p>
        </header>

        <ul class="loss-downloads__list">
          <li v-for="asset in group.assets" :key="asset.id">
            <div>
              <span>{{ copy.localOnly }} · {{ asset.filename }}</span>
              <strong>{{ localized(asset.label) }}</strong>
              <p>{{ localized(asset.description) }}</p>
            </div>
            <a
              :href="withPublicBase(asset.publicPath)"
              :download="asset.filename"
              class="button-quiet"
            >
              {{ copy.download }}
            </a>
          </li>
        </ul>
      </section>
    </div>
  </section>
</template>
