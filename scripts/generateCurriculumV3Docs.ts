import { mkdirSync, writeFileSync } from 'node:fs'

import { curriculumV3Arcs } from '../src/curriculum/v3/arcs.ts'
import { curriculumV3AuditEntries } from '../src/curriculum/v3/audit.ts'
import {
  curriculumV3EntryAssumptions,
  curriculumV3ExitCapabilities,
} from '../src/curriculum/v3/coverage.ts'
import {
  curriculumV3InstructionalModules,
  curriculumV3Modules,
} from '../src/curriculum/v3/inventory.ts'
import { curriculumV3Projects } from '../src/curriculum/v3/projects.ts'
import { validateCurriculumV3Blueprint } from '../src/curriculum/v3/validation.ts'
import { curriculumV3Waves } from '../src/curriculum/v3/waves.ts'

const GENERATED_NOTICE = '<!-- Generated from src/curriculum/v3. Do not edit by hand. -->'

const bilingual = (copy: { 'zh-CN': string; en: string }) => `${copy['zh-CN']} / ${copy.en}`

const list = (values: readonly string[]) => values.length === 0 ? '—' : values.join(', ')

const tableCell = (value: string) => value.replaceAll('|', '\\|').replaceAll('\n', '<br>')

const document = (body: string) => `${GENERATED_NOTICE}\n\n${body.trim()}\n`

function renderReadme(): string {
  const validationIssues = validateCurriculumV3Blueprint()
  const arcs = [...curriculumV3Arcs].sort((left, right) => left.order - right.order)

  return document(`
# Curriculum V3.0 Blueprint

This directory is a human-readable projection of the typed Curriculum V3 blueprint. Regenerate it with \`node scripts/generateCurriculumV3Docs.ts\`.

## Learner assumptions

The required path starts from these declared entry capabilities:

${curriculumV3EntryAssumptions.map((assumption) => `- \`${assumption}\``).join('\n')}

## Exit capability summary

| Capability | Description | Instructional evidence | Project evidence |
| --- | --- | --- | --- |
${curriculumV3ExitCapabilities.map((capability) => `| \`${capability.id}\` | ${tableCell(bilingual(capability.description))} | ${list(capability.moduleIds.map((id) => `\`${id}\``))} | ${list(capability.projectIds.map((id) => `\`${id}\``))} |`).join('\n')}

## Ten learning arcs

| Order | Arc | Purpose |
| ---: | --- | --- |
${arcs.map((arc) => `| ${arc.order} | \`${arc.id}\` — ${tableCell(bilingual(arc.title))} | ${tableCell(bilingual(arc.purpose))} |`).join('\n')}

## Chinese-first bilingual promotion gate

Authoring proceeds Chinese-first and is tracked by the typed \`authoring.zhCN\`, \`authoring.review\`, \`authoring.en\`, and \`authoring.runtime\` states. A module is not eligible for promotion until the Chinese source is reviewed, the English version reaches parity, and the runtime evidence has been verified; \`promoted\` is the final state for every gate.

## Non-goals

- Front-loading a complete mathematics degree before learners can run an ML experiment.
- Treating page count, animation polish, or formula volume as a substitute for formula–code–behavior evidence.
- Making optional depth topics prerequisites of the required learner path.
- Hand-maintaining a second blueprint in Markdown; the typed exports remain the source of truth.

## Blueprint validation

${validationIssues.length === 0 ? 'All typed blueprint validators report no issues.' : validationIssues.map((issue) => `- \`${issue}\``).join('\n')}
`)
}

function renderModuleInventory(): string {
  const declarationOrder = new Map(curriculumV3Modules.map((module, index) => [module.id, index]))
  const modules = [...curriculumV3Modules].sort(
    (left, right) => left.order - right.order || declarationOrder.get(left.id)! - declarationOrder.get(right.id)!,
  )

  return document(`
# Curriculum V3.0 module inventory

The blueprint contains ${curriculumV3InstructionalModules.length} instructional modules and ${curriculumV3Projects.length} projects: ${curriculumV3Modules.length} modules total.

| Order | Module | Role | Prerequisites | Source mapping | Migration action | Authoring state (zh-CN / review / en / runtime) |
| ---: | --- | --- | --- | --- | --- | --- |
${modules.map((module) => `| ${module.order} | \`${module.id}\` — ${tableCell(bilingual(module.title))} | \`${module.role}\` | ${list(module.prerequisiteIds.map((id) => `\`${id}\``))} | ${list(module.sourceModuleIds.map((id) => `\`${id}\``))} | \`${module.migrationAction}\` | ${module.authoring.zhCN} / ${module.authoring.review} / ${module.authoring.en} / ${module.authoring.runtime} |`).join('\n')}
`)
}

function renderContentAudit(): string {
  return document(`
# Curriculum V3.0 content audit

This audit classifies all ${curriculumV3AuditEntries.length} current modules in current Catalog order.

| Current module | Action | V3 targets | Strengths | Contract gaps | Rationale |
| --- | --- | --- | --- | --- | --- |
${curriculumV3AuditEntries.map((entry) => `| \`${entry.currentModuleId}\` | \`${entry.action}\` | ${list(entry.targetModuleIds.map((id) => `\`${id}\``))} | ${tableCell(entry.strengths.join('<br>'))} | ${tableCell(entry.contractGaps.join('<br>'))} | ${tableCell(bilingual(entry.rationale))} |`).join('\n')}
`)
}

function renderProjectMap(): string {
  const projects = [...curriculumV3Projects].sort((left, right) => left.order - right.order)

  return document(`
# Curriculum V3.0 project map

The six projects turn instructional prerequisites into reproducible capability evidence.

${projects.map((project) => `## ${project.order}. \`${project.id}\` — ${bilingual(project.title)}

- Prerequisites: ${list(project.prerequisiteIds.map((id) => `\`${id}\``))}
- Capabilities: ${list(project.capabilityIds.map((id) => `\`${id}\``))}
- Deliverables: ${list(project.deliverables.map((id) => `\`${id}\``))}
- Evidence: ${list(project.evidenceRequirements.map((id) => `\`${id}\``))}`).join('\n\n')}
`)
}

function renderCoverage(): string {
  return document(`
# Curriculum V3.0 exit capability coverage

All ${curriculumV3ExitCapabilities.length} declared exit capabilities are backed by instructional and, where declared, project evidence.

${curriculumV3ExitCapabilities.map((capability, index) => `## ${index + 1}. \`${capability.id}\`

${bilingual(capability.description)}

- Instructional evidence: ${list(capability.moduleIds.map((id) => `\`${id}\``))}
- Project evidence: ${list(capability.projectIds.map((id) => `\`${id}\``))}`).join('\n\n')}
`)
}

function renderImplementationBacklog(): string {
  const declarationOrder = new Map(curriculumV3Waves.map((wave, index) => [wave.id, index]))
  const waves = [...curriculumV3Waves].sort((left, right) => {
    const leftVersion = Number(left.id.match(/^v3\.(\d+)/)?.[1])
    const rightVersion = Number(right.id.match(/^v3\.(\d+)/)?.[1])
    return leftVersion - rightVersion || declarationOrder.get(left.id)! - declarationOrder.get(right.id)!
  })

  return document(`
# Curriculum V3.0 implementation backlog

The backlog spans V3.1–V3.7. Module assignments and exit criteria below are rendered verbatim from the typed wave declarations.

${waves.map((wave) => `## \`${wave.id}\` — ${bilingual(wave.title)}

- Modules: ${list(wave.moduleIds.map((id) => `\`${id}\``))}
- Exact exit criteria:
${wave.exitCriteria.map((criterion) => `  - ${bilingual(criterion)}`).join('\n')}`).join('\n\n')}
`)
}

export function renderCurriculumV3Docs(): Map<string, string> {
  return new Map([
    ['README.md', renderReadme()],
    ['module-inventory.md', renderModuleInventory()],
    ['content-audit.md', renderContentAudit()],
    ['project-map.md', renderProjectMap()],
    ['coverage.md', renderCoverage()],
    ['implementation-backlog.md', renderImplementationBacklog()],
  ])
}

if (import.meta.main) {
  const outputDirectory = new URL('../docs/curriculum-v3/', import.meta.url)
  mkdirSync(outputDirectory, { recursive: true })
  for (const [filename, markdown] of renderCurriculumV3Docs()) {
    writeFileSync(new URL(filename, outputDirectory), markdown)
  }
}
