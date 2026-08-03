import type {
  HousingProjectChapterId,
  HousingProjectInteractionAsset,
  HousingProjectSceneId,
} from '../types/housingProjectLesson'
import { withPublicBase } from '../utils/publicPath'

const chapterByScene: Record<HousingProjectSceneId, HousingProjectChapterId> = {
  'data-contract': 'csv-to-frame',
  'training-eda': 'eda-first-pass',
  'leakage-boundary': 'cleaning-splits',
  'baseline-contributions': 'linear-baseline',
  'ridge-selection': 'evaluation',
  'final-review': 'review-next-iteration',
}

export async function loadHousingProjectInteractionAsset(
  sceneId: HousingProjectSceneId,
  signal?: AbortSignal,
): Promise<HousingProjectInteractionAsset> {
  const chapterId = chapterByScene[sceneId]
  const response = await fetch(
    withPublicBase(`/tabular-regression/interactions/${chapterId}.json`),
    { signal },
  )
  if (!response.ok) throw new Error(`Unable to load housing interaction: ${response.status}`)
  const asset = await response.json() as HousingProjectInteractionAsset
  if (asset.chapterId !== chapterId || asset.kind !== sceneId) {
    throw new Error('Housing interaction contract mismatch')
  }
  return asset
}
