import type { AlgorithmModuleDefinition, LocalizedCopy, ModuleSimulation } from '../types/ml'
import type { AiOverviewChapterId } from '../modules/ai-overview/types.ts'
import { aiOverviewChapters } from '../modules/ai-overview/data/course.ts'
import { algorithmCheckpointsBySlug } from './algorithmCheckpoints.ts'

export const chapterCompanionKinds = {
  'three-problems': ['imagegen-task-cards'],
  'ai-world-map': ['ai-world-map', 'traditional-ai-stepper'],
  'ml-common-language': ['ml-process-tracer'],
  'supervised-linear-regression': ['linear-regression-video', 'regression-lab', 'house-price-card'],
  'learning-paradigms': ['paradigm-comparison', 'application-cards'],
  'unsupervised-kmeans': ['kmeans-video', 'kmeans-lab', 'user-segmentation-card'],
  'reinforcement-q-learning': ['q-learning-video', 'q-learning-lab'],
  'choose-learning-approach': ['decision-tree', 'assistant-map', 'llm-route', 'knowledge-map'],
} as const satisfies Record<AiOverviewChapterId, readonly string[]>

function loc(zhCN: string, en: string): LocalizedCopy {
  return { 'zh-CN': zhCN, en }
}

function simulateAiOverview(): ModuleSimulation {
  return {
    snapshots: [
      {
        step: 0,
        loss: 0,
        accuracy: 0,
        derivedMetrics: {
          moduleType: 'orientation',
          referenceIds: [
            'REF-GOOGLE-MLCC',
            'REF-INRIA-SKLEARN-MOOC',
            'REF-D2L',
            'REF-SKLEARN-USER-GUIDE',
            'REF-HF-LLM-COURSE',
            'REF-HF-RAG-MILVUS',
          ],
        },
      },
    ],
  }
}

export const aiOverviewModule: AlgorithmModuleDefinition = {
  slug: 'ai-overview',
  route: '/learn/ai-overview',
  titleKey: 'modules.aiOverview.title',
  kickerKey: 'modules.aiOverview.kicker',
  introKey: 'modules.aiOverview.intro',
  summaryKey: 'modules.aiOverview.summary',
  theme: '#ecf7f2',
  accent: '#0f9f8f',
  checkpoints: algorithmCheckpointsBySlug['ai-overview'],
  chapters: aiOverviewChapters,
  controls: [],
  presets: [],
  sourceNote: loc(
    '统一资料入口：REF-GOOGLE-MLCC、REF-INRIA-SKLEARN-MOOC、REF-D2L、REF-SKLEARN-USER-GUIDE、REF-HF-LLM-COURSE、REF-HF-RAG-MILVUS。',
    'Centralized references: REF-GOOGLE-MLCC, REF-INRIA-SKLEARN-MOOC, REF-D2L, REF-SKLEARN-USER-GUIDE, REF-HF-LLM-COURSE, REF-HF-RAG-MILVUS.',
  ),
  createDefaultConfig: () => ({ playbackMs: 900 }),
  simulate: simulateAiOverview,
}
