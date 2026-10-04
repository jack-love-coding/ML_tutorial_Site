import { teachingUnits, expandReadingStep, type TeachingUnit } from './reading.ts'

export function releasedUnits(units: readonly TeachingUnit[] = teachingUnits) {
  return units.filter(unit => unit.publicationStatus === 'pilot' || unit.publicationStatus === 'published')
}

export function releasedModuleIds(units: readonly TeachingUnit[] = teachingUnits) {
  return [...new Set(releasedUnits(units).flatMap(unit => [...unit.readings, ...(unit.optional ?? [])].map(step => step.moduleId)))]
}

/** QA reads the same chapter sequence as the site, including opt-in preview candidates. */
export function textbookReadingManifest(units: readonly TeachingUnit[] = teachingUnits) {
  return { units: units.map(unit => ({
    id: unit.id, publicationStatus: unit.publicationStatus,
    readings: unit.readings.flatMap(step => expandReadingStep(step, unit.id)),
  })) }
}
