import { castColumn, clipColumn, dropDuplicates, fillMissing, housingTeachingTable } from './tableTransforms.ts'

// This six-row table is a training-only teaching fragment, not the frozen housing project.
export const cleaningStepIds = ['fill-rooms', 'clip-price', 'dedupe', 'parse-date'] as const
export const observedTrainingRooms = housingTeachingTable.rows.map(row => row.rooms)
  .filter((value): value is number => typeof value === 'number' && Number.isFinite(value))
  .sort((a, b) => a - b)
if (!observedTrainingRooms.length) throw new Error('The cleaning example needs observed training room counts')
const middle = Math.floor(observedTrainingRooms.length / 2)
export const trainingRoomsMedian = observedTrainingRooms.length % 2
  ? observedTrainingRooms[middle]!
  : (observedTrainingRooms[middle - 1]! + observedTrainingRooms[middle]!) / 2
// Audited hypothetical bounds for this example, not a rule for all house prices.
export const cleaningPriceBounds = { lower: 100, upper: 1200 } as const

export function applyCleaningTeachingSteps(activeIds: readonly string[]) {
  let result = housingTeachingTable
  for (const id of cleaningStepIds) {
    if (!activeIds.includes(id)) continue
    if (id === 'fill-rooms') result = fillMissing(result, 'rooms', trainingRoomsMedian)
    if (id === 'clip-price') result = clipColumn(result, 'price', cleaningPriceBounds.lower, cleaningPriceBounds.upper)
    if (id === 'dedupe') result = dropDuplicates(result, ['id'])
    if (id === 'parse-date') result = castColumn(result, 'listed_at', 'datetime')
  }
  return result
}

export const cleaningExampleOutput = applyCleaningTeachingSteps(cleaningStepIds)
