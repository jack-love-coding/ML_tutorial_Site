import type { AlgorithmModuleDefinition, LocalizedCopy, ModuleSimulation, StorySection } from '../types/ml'
import { algorithmCheckpointsBySlug } from './algorithmCheckpoints'
import { optimizerCourseChapters } from '../modules/optimizer-comparison/data/course'

const loc = (zhCN: string, en: string): LocalizedCopy => ({ 'zh-CN': zhCN, en })

function chapter(id: string, title: LocalizedCopy): StorySection {
  return {
    id,
    eyebrowKey: 'common.chapter',
    titleKey: `modules.optimizerComparison.sections.${id}.title`,
    title,
    // AlgorithmView's dedicated optimizer shell renders the complete structured lesson.
    // This compact copy remains a safe compatibility fallback for legacy consumers.
    markdown: loc('本章节通过专用优化器课程页面呈现。', 'This chapter is presented by the dedicated optimizer course page.'),
    callout: title,
    experimentPrompt: loc('使用章节内的互动台观察状态。', 'Use the chapter interaction to observe state.'),
  }
}

function simulateOptimizerComparison(): ModuleSimulation {
  return {
    snapshots: [{
      step: 0,
      loss: 0,
      accuracy: 0,
      derivedMetrics: { moduleType: 'optimizer-comparison' },
    }],
  }
}

export const optimizerComparisonModule: AlgorithmModuleDefinition = {
  slug: 'optimizer-comparison',
  route: '/learn/optimizer-comparison',
  titleKey: 'modules.optimizerComparison.title',
  kickerKey: 'modules.optimizerComparison.kicker',
  introKey: 'modules.optimizerComparison.intro',
  summaryKey: 'modules.optimizerComparison.summary',
  theme: '#fff7ed',
  accent: '#ea580c',
  checkpoints: algorithmCheckpointsBySlug['optimizer-comparison'],
  chapters: optimizerCourseChapters.map((item) => chapter(item.id, item.title)),
  controls: [],
  presets: [],
  sourceNote: loc(
    '公开资料与可复现实验下载集中放在最后一章。',
    'Public references and reproducible downloads are collected in the final chapter.',
  ),
  createDefaultConfig: () => ({ playbackMs: 900 }),
  simulate: simulateOptimizerComparison,
}
