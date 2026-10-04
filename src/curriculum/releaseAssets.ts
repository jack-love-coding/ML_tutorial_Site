import type { ModuleSlug } from '../types/ml.ts'

/** Published artifact associations; course bodies and numerical files remain authoritative. */
export const algorithmReleaseManifests: Partial<Record<ModuleSlug, readonly string[]>> = {
  'python-notebook': ['/notebooks/python-data-tools/outputs/manifest.json'],
  'loss-functions': ['/notebooks/loss-functions/outputs/manifest.json'],
  'gradient-descent': ['/gradient-descent/v1/output-manifest.json', '/gradient-descent/v1/interaction-manifest.json'],
  'linear-regression': ['/notebooks/linear-regression/output-manifest.json', '/linear-regression/phase-27a/output-manifest.json', '/linear-regression/phase-27a/interaction-manifest.json'],
  'housing-price-project': ['/notebooks/tabular-regression/output-manifest.json', '/tabular-regression/manifest.json', '/tabular-regression/interaction-manifest.json'],
  'logistic-regression': ['/logistic-regression/phase-29/manifest.json'],
  classification: ['/classification/phase-30/manifest.json'],
}
