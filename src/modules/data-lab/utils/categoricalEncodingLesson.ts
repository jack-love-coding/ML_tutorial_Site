import { categoricalVocabularyTeachingRows } from './categoricalVocabularyTask.ts'
import { activeSparseIndices, buildCategoryVocabulary, encodeMultiHot, encodeOneHot, hashCategoryToBucket, resolveCategoryToken } from './tableTransforms.ts'

export type EncodingMode = 'one-hot' | 'multi-hot' | 'cross' | 'hash'
export interface EncodingConfig {
  mode: EncodingMode
  minFrequency: number
  maxCategories: number
  bucketCount: number
  district: string
  propertyType: string
  tags: string[]
}

const trainRows = categoricalVocabularyTeachingRows.filter(row => row.split === 'train')
export const districtTrainingValues = trainRows.map(row => row.district)
export const propertyTrainingValues = trainRows.map(row => row.propertyType)
export const tagTrainingValues = ['subway', 'school', 'park', 'school', 'parking', 'pet', 'subway', 'gym', 'park', 'school']
export const encodingDefaults: EncodingConfig = { mode: 'one-hot', minFrequency: 2, maxCategories: 4, bucketCount: 8, district: 'south', propertyType: 'condo', tags: ['subway', 'school'] }
const bounded = (value: number, fallback: number, min: number, max: number) => Number.isFinite(value) ? Math.max(min, Math.min(max, Math.round(value))) : fallback

/** One source for the page, generated figures and executable reference. */
export function categoricalEncodingExample(input: Partial<EncodingConfig> = {}) {
  const config = { ...encodingDefaults, ...input }
  config.minFrequency = bounded(config.minFrequency, 2, 1, 3)
  config.maxCategories = bounded(config.maxCategories, 4, 2, 6)
  config.bucketCount = bounded(config.bucketCount, 8, 4, 16)
  const district = buildCategoryVocabulary(districtTrainingValues, { minFrequency: config.minFrequency, maxCategories: config.maxCategories, includeOov: true })
  const property = buildCategoryVocabulary(propertyTrainingValues, { minFrequency: 1, maxCategories: 5, includeOov: true })
  const tags = buildCategoryVocabulary(tagTrainingValues, { minFrequency: 1, maxCategories: 7, includeOov: true })
  let tokens = district.tokens, vector = encodeOneHot(config.district, district)
  let mapped = [resolveCategoryToken(config.district, district)!]
  if (config.mode === 'multi-hot') {
    tokens = tags.tokens
    vector = encodeMultiHot(config.tags, tags)
    mapped = [...new Set(config.tags.map(value => resolveCategoryToken(value, tags)!))]
  } else if (config.mode === 'cross') {
    tokens = district.tokens.flatMap(left => property.tokens.map(right => `${left}×${right}`))
    mapped = [`${resolveCategoryToken(config.district, district)}×${resolveCategoryToken(config.propertyType, property)}`]
    vector = tokens.map(token => Number(token === mapped[0]))
  } else if (config.mode === 'hash') {
    tokens = Array.from({ length: config.bucketCount }, (_, i) => `bucket_${i}`)
    const bucket = hashCategoryToBucket(config.district, config.bucketCount).bucket
    mapped = [`bucket_${bucket}`]
    vector = tokens.map((_, i) => Number(i === bucket))
  }
  return { config, district, property, tags, tokens, vector, mapped, active: activeSparseIndices(vector) }
}

/** Standard-library Python for these ASCII teaching tokens; explicit OOV/RARE policy. */
export function categoricalEncodingPython(input: Partial<EncodingConfig> = {}) {
  const { config } = categoricalEncodingExample(input)
  const fit = `from collections import Counter
import json

def fit_vocab(values, min_frequency=1, max_categories=100):
    counts = Counter(value.strip().lower() for value in values)
    ordered = sorted(counts, key=lambda value: (-counts[value], value))
    kept = [value for value in ordered if counts[value] >= min_frequency][:max_categories]
    rare = set(counts) - set(kept)
    tokens = kept + (["<RARE>"] if rare else []) + ["<OOV>"]
    return tokens, rare

def map_token(value, vocabulary):
    tokens, rare = vocabulary
    value = value.strip().lower()
    if value in tokens:
        return value
    return "<RARE>" if value in rare else "<OOV>"
`
  const districtFit = `district_train = ${JSON.stringify(districtTrainingValues)}
district_vocab = fit_vocab(district_train, ${config.minFrequency}, ${config.maxCategories})
district_value = ${JSON.stringify(config.district)}
`
  let code: string
  if (config.mode === 'hash') {
    code = `import json

# FNV-1a, unsigned 32-bit; the lesson tokens are ASCII.
# This is not sklearn's FeatureHasher algorithm.
value = ${JSON.stringify(config.district)}.strip().lower()
bucket_count = ${config.bucketCount}
hash_value = 2166136261
for character in value:
    hash_value = ((hash_value ^ ord(character)) * 16777619) & 0xffffffff
bucket = hash_value % bucket_count
tokens = [f"bucket_{i}" for i in range(bucket_count)]
vector = [int(i == bucket) for i in range(bucket_count)]
`
  } else if (config.mode === 'multi-hot') {
    code = fit + `
tag_train = ${JSON.stringify(tagTrainingValues)}
tag_vocab = fit_vocab(tag_train, 1, 7)
selected_tags = ${JSON.stringify(config.tags)}
tokens = tag_vocab[0]
mapped = {map_token(value, tag_vocab) for value in selected_tags}
vector = [int(token in mapped) for token in tokens]
`
  } else if (config.mode === 'cross') {
    code = fit + '\n' + districtFit + `property_train = ${JSON.stringify(propertyTrainingValues)}
property_vocab = fit_vocab(property_train, 1, 5)
property_value = ${JSON.stringify(config.propertyType)}
tokens = [left + "×" + right for left in district_vocab[0] for right in property_vocab[0]]
mapped = map_token(district_value, district_vocab) + "×" + map_token(property_value, property_vocab)
vector = [int(token == mapped) for token in tokens]
`
  } else {
    code = fit + '\n' + districtFit + `tokens = district_vocab[0]
mapped = map_token(district_value, district_vocab)
vector = [int(token == mapped) for token in tokens]
`
  }
  return code + '\nprint(json.dumps({"tokens": tokens, "vector": vector}, ensure_ascii=False))'
}
