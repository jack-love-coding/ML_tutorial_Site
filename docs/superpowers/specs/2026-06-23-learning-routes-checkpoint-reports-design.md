# Learning Routes and Checkpoint Reports Design

Date: 2026-06-23
Branch: `codex/linear-algebra-route-chapterization`
Status: Draft for user review

## Goal

Build the next learning-experience layer on top of the newly split linear algebra route:

- Show clear learning routes on both the home page and the Math Lab home page.
- Start with the seven linear algebra route chapters.
- Add task-style checkpoint reports that ask students to use experiment evidence, not just recall definitions.
- Save report answers locally and export them as Markdown.

The main teaching goal is to help learners answer three questions at all times:

1. Where am I in the route?
2. What did I just prove or observe with an experiment?
3. What should I do next?

## Confirmed Product Decisions

- The first version should combine **route navigation** and **task-style checkpoint reports**.
- Route visibility should appear on the site home page and the Math Lab home page.
- Progress display should use completed chapter count plus next recommended chapter, such as `3/7 completed, next: Rank and Null Space`.
- The first checkpoint-report rollout should cover the seven linear algebra route chapters:
  - Vectors and Feature Space
  - Distance and Similarity
  - Matrix Transformations
  - Rank and Null Space
  - Eigenvalues and Eigenvectors
  - SVD
  - PCA
- Each chapter should end with one full report card.
- A few chapters should also include light in-chapter observation prompts before the final report:
  - Distance and Similarity
  - Rank and Null Space
  - SVD
  - PCA
- Report answers should be saved locally, with no backend dependency.
- Students should be able to export the route report as Markdown.

## User Experience

### Home Page Route Summary

The home page should show a compact route summary rather than a dense course catalog. It should help a first-time learner choose a path without reading every module title.

Recommended route cards:

- AI Math Main Path
- Linear Algebra Route
- Numerical Deepening Path

For the linear algebra route, the card should show:

- total chapters, completed chapters, and next recommended chapter
- a short purpose line, such as "from vectors and similarity to SVD and PCA"
- a primary action that opens the next chapter or the route map

The home page should not become a marketing hero. It should remain a usable learning entry point.

### Math Lab Route Dashboard

The Math Lab home page should show a fuller route dashboard:

- ordered chapter list
- completion status for each chapter
- whether a checkpoint report has been drafted or completed
- next recommended chapter
- optional secondary paths for AI main path and numerical deepening

This dashboard should reuse existing module IDs and navigation patterns. It should not duplicate course content; it should organize existing modules and route metadata.

### Module Page Checkpoint Report

Each linear algebra route chapter should end with a report card. The card has four fixed fields:

- **Setup:** What did you change or choose in the experiment?
- **Observation:** What happened in the diagram, numbers, or ranking?
- **Explanation:** Which chapter concept explains the result?
- **Next Step:** If this were a real AI or data problem, what would you verify or improve next?

The report card should include an evidence panel above the writing fields. The evidence panel turns current lab state into readable prompts, for example:

```text
You kept k = 2 singular directions.
Retained energy: 93.4%.
Next error scale: sigma_3 = 1.8.
Explain why the main structure remains while small details fade.
```

The student should feel that the report is based on an experiment they just ran.

## Linear Algebra Report Map

| Chapter | Experiment evidence | In-chapter prompt | Final report theme |
| --- | --- | --- | --- |
| Vectors and Feature Space | selected object, feature weights, vector coordinates, difference vector | no required prompt | How does a real object become a vector? |
| Distance and Similarity | norm, Euclidean distance, dot product, cosine, ranking changes | yes | Why can "near" and "semantically similar" disagree? |
| Matrix Transformations | matrix columns, input coordinates, output vector, determinant or transform state | optional | How does a matrix mix input features? |
| Rank and Null Space | rank, column-space state, dependent columns, null direction | yes | What can the model see, and what input changes disappear? |
| Eigenvalues and Eigenvectors | dominant direction, iteration count, convergence behavior, residual | optional | Why do some directions survive repeated transformation? |
| SVD | kept rank k, retained energy, sigma_{k+1}, reconstruction or residual description | yes | What does low-rank approximation keep and discard? |
| PCA | centering shift, scaling state, kept dimension, explained variance, reconstruction error | yes | Why must PCA center first, and why is it not a classifier? |

## Architecture

### Route Metadata

Add route-level metadata separate from module content. A route should reference existing module IDs rather than copying module definitions.

Suggested structure:

```ts
interface LearningRoute {
  id: string
  title: LocalizedCopy
  description: LocalizedCopy
  chapterModuleIds: string[]
  audience: LocalizedCopy
  nextStepRule: 'first-incomplete'
}
```

The first implementation should define at least:

- `linear-algebra-route`
- `ai-math-main-path`
- `numerical-deepening-path`

Only the linear algebra route needs full checkpoint reports in this iteration. The other routes can appear as route summaries if their module order is already reliable.

### Checkpoint Report Schema

Add typed data for task-style report prompts. The schema should be independent of Vue components so it can be tested.

Suggested structure:

```ts
interface CheckpointReportPrompt {
  id: string
  moduleId: string
  title: LocalizedCopy
  task: LocalizedCopy
  evidenceSource: EvidenceSourceConfig
  fields: CheckpointReportField[]
  exportTitle: LocalizedCopy
}

interface CheckpointReportField {
  key: 'setup' | 'observation' | 'explanation' | 'nextStep'
  label: LocalizedCopy
  guidingPrompt: LocalizedCopy
  minLength?: number
}
```

The schema should allow chapter-specific guiding prompts while keeping the same four field keys.

### Experiment Evidence Bridge

Labs should expose concise evidence snapshots without coupling the report component to each lab's internal state.

Suggested structure:

```ts
interface ExperimentEvidence {
  moduleId: string
  sourceId: string
  summary: LocalizedCopy
  metrics: Array<{
    label: LocalizedCopy
    value: string | number
    unit?: LocalizedCopy
  }>
  prompt: LocalizedCopy
}
```

The first implementation can support evidence in two ways:

1. Static fallback evidence defined in checkpoint prompt data.
2. Dynamic evidence emitted by selected labs when the user changes controls.

This keeps the report card usable even when a chapter does not yet expose dynamic lab state.

### Local Persistence

Report drafts should be saved in local storage alongside existing progress storage patterns.

Suggested key shape:

```text
ml-atlas:checkpoint-report:<moduleId>
```

Stored data should include:

- module ID
- route ID
- field answers
- latest evidence snapshot
- updated timestamp
- completion flag

Storage parsing must handle malformed JSON safely, following existing progress helpers.

### Markdown Export

The export should produce one Markdown document for the linear algebra route. It should include:

- route title
- generated timestamp
- each chapter title
- evidence summary for that chapter
- the four report fields
- missing-answer markers such as `Not answered yet`

No server upload is needed. A browser download is enough.

## Components

### LearningRouteSummary

Used on the home page. Shows a compact route card with completed count and next chapter.

Responsibilities:

- read route metadata
- read progress/report status
- compute next recommended chapter
- render primary action

### LearningRouteDashboard

Used on the Math Lab home page. Shows the full route map.

Responsibilities:

- list chapters in route order
- show completed chapter and report status
- show next recommended chapter
- link to each module page

### CheckpointReportCard

Used at the end of each route chapter.

Responsibilities:

- render evidence panel
- render four guided fields
- save draft locally
- mark report complete when required fields are filled
- expose export action or route-level export link

### ObservationPrompt

Used sparingly inside selected chapters.

Responsibilities:

- ask a short experiment question near the relevant lab
- point learners toward a control to change
- avoid saving long-form answers

## Data Flow

1. Route metadata defines ordered chapter module IDs.
2. Existing progress storage determines which modules are completed.
3. Checkpoint report storage determines which chapter reports are drafted or completed.
4. Home and Math Lab route views combine route metadata, progress, and report status.
5. Module page renders the chapter content, labs, optional observation prompts, and final report card.
6. Labs can provide dynamic evidence snapshots through a shared callback or store.
7. Report card saves student answers and the latest evidence snapshot locally.
8. Markdown export reads all route reports and generates one downloadable file.

## Error Handling and Fallbacks

- If local storage is unavailable, report cards should still work during the page session and show a clear "not saved" message.
- If stored JSON is malformed, ignore the broken record and start a new draft.
- If a lab has no dynamic evidence snapshot, use static fallback evidence from the prompt config.
- If a module is missing from route metadata, tests should catch it; runtime UI can skip unknown IDs rather than crashing.
- Export should include chapters with missing answers instead of failing.

## Testing

### Unit and Structure Tests

Add tests for:

- every route chapter module ID exists in `mathLabModules`
- the linear algebra route contains exactly the seven intended modules in order
- every linear algebra route module has a checkpoint report prompt
- every checkpoint report has the four required fields
- every dynamic evidence source has a static fallback
- route next-step calculation returns the first incomplete chapter
- malformed report storage does not crash parsing
- Markdown export includes route title, chapter titles, evidence, and answers

### Browser or Component Checks

For implementation, verify:

- home page route card text does not overflow on mobile
- Math Lab route dashboard remains readable on mobile
- report card fields are keyboard accessible
- export button works after filling at least one report
- empty reports still export with explicit missing-answer markers

## Out of Scope for First Version

- Backend accounts or cloud sync.
- Teacher dashboard.
- Grading or AI feedback on student answers.
- Full portfolio system across every Math Lab module.
- Report cards for non-linear-algebra routes.
- Rewriting existing quiz logic.

## Success Criteria

The first version is successful when:

- A learner can see the linear algebra route on both home and Math Lab home.
- The route shows completed chapter count and next recommended chapter.
- Each of the seven linear algebra chapters has a final checkpoint report card.
- Distance/similarity, rank/null space, SVD, and PCA include short observation prompts near their labs.
- Report answers persist locally after refresh.
- A learner can export the route report as Markdown.
- Tests cover route order, report prompt completeness, storage parsing, and export output.

