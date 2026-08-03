import type { AlgorithmModuleDefinition, LocalizedCopy, ModuleSimulation, StorySection } from '../types/ml'
import { algorithmCheckpointsBySlug } from './algorithmCheckpoints'

const loc = (zhCN: string, en: string): LocalizedCopy => ({ 'zh-CN': zhCN, en })

function chapter(id: string, titleKey: string, summary: LocalizedCopy, minutes: number): StorySection {
  return {
    id,
    eyebrowKey: 'common.chapter',
    titleKey,
    markdown: summary,
    pageSummary: summary,
    callout: summary,
    experimentPrompt: loc('完成正文后使用本章观察台。', 'Use the chapter lab after completing the lesson.'),
    estimatedMinutes: minutes,
  }
}

function simulateHousingProject(): ModuleSimulation {
  return {
    snapshots: [{
      step: 0,
      loss: 0,
      accuracy: 0,
      derivedMetrics: { moduleType: 'tabular-regression-project', assetVersion: 'phase-28-v1' },
    }],
  }
}

export const housingPriceProjectModule: AlgorithmModuleDefinition = {
  slug: 'housing-price-project',
  route: '/learn/housing-price-project',
  titleKey: 'modules.housingPriceProject.title',
  kickerKey: 'modules.housingPriceProject.kicker',
  introKey: 'modules.housingPriceProject.intro',
  summaryKey: 'modules.housingPriceProject.summary',
  theme: '#fff7ed',
  accent: '#d97706',
  checkpoints: algorithmCheckpointsBySlug['housing-price-project'],
  chapters: [
    chapter('csv-to-frame', 'modules.housingPriceProject.sections.csvToFrame.title', loc(
      '先把样本粒度、字段角色、目标单位和固定分区写成可审计的数据契约。',
      'Turn sample granularity, field roles, target units, and frozen partitions into an auditable data contract.',
    ), 18),
    chapter('eda-first-pass', 'modules.housingPriceProject.sections.edaFirstPass.title', loc(
      '只使用训练集检查目标分布、单特征关系和非线性地理结构。',
      'Use training rows only to inspect the target distribution, feature relations, and nonlinear geography.',
    ), 22),
    chapter('cleaning-splits', 'modules.housingPriceProject.sections.cleaningSplits.title', loc(
      '固定 train/validation/test 职责，并确保 scaler 只在训练集上拟合。',
      'Freeze train/validation/test responsibilities and fit the scaler on training rows only.',
    ), 20),
    chapter('linear-baseline', 'modules.housingPriceProject.sections.linearBaseline.title', loc(
      '建立可逐项拆解的 StandardScaler + LinearRegression 诚实基线。',
      'Build an honest StandardScaler + LinearRegression baseline with row-level decomposition.',
    ), 24),
    chapter('evaluation', 'modules.housingPriceProject.sections.evaluation.title', loc(
      '只用验证集比较预先声明的 Ridge 路径，并执行 1% 简单模型规则。',
      'Compare a declared Ridge path on validation only and apply the 1% simplicity rule.',
    ), 20),
    chapter('review-next-iteration', 'modules.housingPriceProject.sections.reviewNextIteration.title', loc(
      '冻结模型后只评价测试集一次，用残差和具名失败案例确定下一轮方向。',
      'After freezing the model, evaluate test once and use residuals and named failures to choose the next iteration.',
    ), 24),
  ],
  controls: [],
  presets: [],
  sourceNote: loc(
    '公开资料与数据归属集中列在最后一章；正文与运行结果来自本地可复现资产。',
    'Public references and data attribution are centralized in the final chapter; lesson results come from local reproducible assets.',
  ),
  createDefaultConfig: () => ({ playbackMs: 900 }),
  simulate: simulateHousingProject,
}
