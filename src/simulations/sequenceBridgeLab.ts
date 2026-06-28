export type SequenceMaskMode = 'none' | 'padding' | 'causal'

export interface SequenceBridgeLabConfig {
  batchSize: number
  tokenLength: number
  hiddenSize: number
  paddingTokens: number
  maskMode: SequenceMaskMode
  queryIndex: number
}

export interface SequenceBridgeMaskCell {
  index: number
  label: string
  state: 'visible' | 'query' | 'blocked'
}

export interface SequenceBridgeSnapshot {
  config: SequenceBridgeLabConfig
  tokenIdsShape: string
  embeddingTableShape: string
  hiddenStatesShape: string
  qkvShape: string
  attentionScoreShape: string
  visibleTokenCount: number
  blockedTokenCount: number
  effectiveTokenCount: number
  maskCells: SequenceBridgeMaskCell[]
}

function clampInteger(value: number, min: number, max: number) {
  const numericValue = Number.isFinite(value) ? Math.round(value) : min
  return Math.min(max, Math.max(min, numericValue))
}

function shape(values: Array<number | 'V'>) {
  return `[${values.join(',')}]`
}

function normalizeConfig(config: SequenceBridgeLabConfig): SequenceBridgeLabConfig {
  const batchSize = clampInteger(config.batchSize, 1, 4)
  const tokenLength = clampInteger(config.tokenLength, 2, 8)
  const hiddenSize = clampInteger(config.hiddenSize, 4, 32)
  const paddingTokens = clampInteger(config.paddingTokens, 0, tokenLength - 1)
  const queryIndex = clampInteger(config.queryIndex, 0, tokenLength - 1)
  const maskMode: SequenceMaskMode =
    config.maskMode === 'padding' || config.maskMode === 'causal' ? config.maskMode : 'none'

  return {
    batchSize,
    tokenLength,
    hiddenSize,
    paddingTokens,
    maskMode,
    queryIndex,
  }
}

function isBlockedToken(index: number, config: SequenceBridgeLabConfig) {
  const firstPaddingIndex = config.tokenLength - config.paddingTokens
  if (config.maskMode === 'padding') {
    return index >= firstPaddingIndex
  }

  if (config.maskMode === 'causal') {
    return index > config.queryIndex || index >= firstPaddingIndex
  }

  return false
}

function buildMaskCells(config: SequenceBridgeLabConfig): SequenceBridgeMaskCell[] {
  return Array.from({ length: config.tokenLength }, (_, index) => {
    const blocked = isBlockedToken(index, config)
    return {
      index,
      label: `t${index}`,
      state: blocked ? 'blocked' : index === config.queryIndex ? 'query' : 'visible',
    }
  })
}

export function buildSequenceBridgeSnapshot(config: SequenceBridgeLabConfig): SequenceBridgeSnapshot {
  const normalizedConfig = normalizeConfig(config)
  const maskCells = buildMaskCells(normalizedConfig)
  const visibleTokenCount = maskCells.filter((cell) => cell.state !== 'blocked').length
  const blockedTokenCount = normalizedConfig.tokenLength - visibleTokenCount
  const effectiveTokenCount = normalizedConfig.tokenLength - normalizedConfig.paddingTokens

  return {
    config: normalizedConfig,
    tokenIdsShape: shape([normalizedConfig.batchSize, normalizedConfig.tokenLength]),
    embeddingTableShape: shape(['V', normalizedConfig.hiddenSize]),
    hiddenStatesShape: shape([
      normalizedConfig.batchSize,
      normalizedConfig.tokenLength,
      normalizedConfig.hiddenSize,
    ]),
    qkvShape: shape([
      normalizedConfig.batchSize,
      normalizedConfig.tokenLength,
      normalizedConfig.hiddenSize,
    ]),
    attentionScoreShape: shape([
      normalizedConfig.batchSize,
      normalizedConfig.tokenLength,
      normalizedConfig.tokenLength,
    ]),
    visibleTokenCount,
    blockedTokenCount,
    effectiveTokenCount,
    maskCells,
  }
}
