<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  linearRegressionAssets,
  type LinearRegressionAssetDescriptor,
  type LinearRegressionAssetKind,
} from '../data/linearRegressionAssets'
import type { AppLocale, LocalizedCopy } from '../types/ml'
import { withPublicBase } from '../utils/publicPath'

interface DownloadGroup {
  readonly id: string
  readonly title: string
  readonly description: string
  readonly kinds: readonly LinearRegressionAssetKind[]
  readonly assets: readonly LinearRegressionAssetDescriptor[]
}

const { locale } = useI18n()

const copy = computed(() => {
  const zh = locale.value === 'zh-CN'
  return {
    eyebrow: zh ? '本地可复现实验包' : 'Local reproducibility package',
    title: zh
      ? '下载 Notebook、完整结果与环境清单'
      : 'Download Notebooks, complete results, and environment records',
    intro: zh
      ? '九个文件全部随课程本地发布：双语 Notebook 由独立干净内核执行，结果由固定 Bike Sharing 数据、时间切分与三种 OLS 方法共同锁定。'
      : 'All nine files ship locally with the course. The bilingual Notebooks were executed in independent clean kernels, with outputs locked to the same Bike Sharing data, chronological split, and three OLS methods.',
    notebooksTitle: zh ? '双语已执行 Notebook' : 'Bilingual executed Notebooks',
    notebooksDescription: zh
      ? '中英文代码与数值输出一致，可离线复现完整教学流程。'
      : 'Chinese and English code and numerical outputs match and reproduce the full lesson offline.',
    resultsTitle: zh ? '锁定结果与完整表格' : 'Locked results and complete tables',
    resultsDescription: zh
      ? '页面摘要、772 次更新轨迹、系数表与全部 3,476 行留出残差。'
      : 'The page summary, 772-update trace, coefficient table, and all 3,476 held-out residual rows.',
    environmentTitle: zh ? '依赖、环境与输出清单' : 'Dependencies, environment, and output manifest',
    environmentDescription: zh
      ? '固定依赖、执行环境与九个发布成员的完整身份记录。'
      : 'Pinned dependencies, execution environment, and identity records for all nine published members.',
    download: zh ? '下载文件' : 'Download file',
    localOnly: zh ? '本地课程文件' : 'Local course file',
  }
})

const downloadGroups = computed<DownloadGroup[]>(() => {
  const definitions = [
    {
      id: 'notebooks',
      title: copy.value.notebooksTitle,
      description: copy.value.notebooksDescription,
      kinds: ['executed-notebook'],
    },
    {
      id: 'results',
      title: copy.value.resultsTitle,
      description: copy.value.resultsDescription,
      kinds: [
        'locked-summary',
        'complete-gradient-trace',
        'complete-coefficient-table',
        'complete-heldout-residuals',
      ],
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
    assets: linearRegressionAssets.filter((asset) =>
      definition.kinds.includes(asset.kind as never),
    ),
  }))
})

function localizedAssetLabel(value: LocalizedCopy) {
  return value[locale.value as AppLocale]
}
</script>

<template>
  <section class="panel linear-downloads" data-linear-regression-downloads>
    <header class="linear-downloads__header">
      <span>{{ copy.eyebrow }}</span>
      <strong>{{ copy.title }}</strong>
      <p>{{ copy.intro }}</p>
    </header>

    <div class="linear-downloads__groups">
      <section
        v-for="group in downloadGroups"
        :key="group.id"
        class="linear-downloads__group"
      >
        <header>
          <strong>{{ group.title }}</strong>
          <p>{{ group.description }}</p>
        </header>

        <ul class="linear-downloads__list">
          <li v-for="asset in group.assets" :key="asset.id">
            <div>
              <span>{{ copy.localOnly }} · {{ asset.filename }}</span>
              <strong>{{ localizedAssetLabel(asset.label) }}</strong>
              <p>{{ localizedAssetLabel(asset.description) }}</p>
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
