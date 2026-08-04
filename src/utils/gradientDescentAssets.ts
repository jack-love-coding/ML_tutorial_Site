import type {
  GradientDescentInteractionPayload,
  GradientDescentSceneId,
} from '../types/gradientDescentLesson'
import { withPublicBase } from './publicPath'

const sceneIds = new Set<GradientDescentSceneId>([
  'loss-function',
  'landscape',
  'gradient-rule',
  'learning-rate',
  'saddle-local-minima',
  'noise-and-batch',
])

export async function loadGradientInteraction(
  sceneId: GradientDescentSceneId,
  signal?: AbortSignal,
): Promise<GradientDescentInteractionPayload> {
  if (!sceneIds.has(sceneId)) throw new Error(`Unknown gradient-descent scene: ${sceneId}`)
  const response = await fetch(
    withPublicBase(`/gradient-descent/v1/interactions/${sceneId}.json`),
    { signal },
  )
  if (!response.ok) throw new Error(`Gradient-descent asset failed: ${response.status}`)
  const payload = await response.json() as GradientDescentInteractionPayload
  if (payload.scene !== sceneId) throw new Error(`Gradient-descent asset mismatch: ${payload.scene}`)
  return payload
}
