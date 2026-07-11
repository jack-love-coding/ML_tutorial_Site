# Curriculum V3 Blueprint Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a typed, machine-auditable Curriculum V3 blueprint covering 56 instructional modules, 6 staged projects, the current 53-module migration audit, exit-capability coverage, and independently executable V3.1–V3.7 content waves.

**Architecture:** Add an isolated `src/curriculum/v3/` planning model that is not imported by runtime routes or course bodies. Split module records by knowledge responsibility, aggregate them through one inventory, audit every current Catalog module against that inventory, validate dependencies and coverage with pure functions, and generate human-readable documentation from the same source.

**Tech Stack:** TypeScript, Node test runner, existing `LocalizedCopy`, existing Curriculum Catalog adapters, Markdown documentation

## Global Constraints

- V3.0 is curriculum architecture and content governance only; do not modify runtime lesson bodies, routes, Progress V1/V2, homepage, Spine UI, Phase 24B, Phase 24C, or Phase 23 files.
- The default learner knows high-school algebra/functions and basic Python, with no assumed calculus, linear algebra, probability, or ML coursework.
- The required route ends with mathematical understanding plus a runnable small Transformer and a parameter-efficient fine-tuning or RAG project.
- Use the hybrid mathematics strategy: minimum foundations first, then explicit just-in-time revisits before later models consume them.
- The exact V3.0 inventory contains 56 instructional modules and 6 project modules; short pages must not be used to inflate the count.
- Each blueprint module has exactly one primary role: `required-core`, `depth-topic`, `project`, or `reference`.
- Chinese-first authoring is staging-only. Every blueprint record has complete working `'zh-CN'` and `en` metadata, and no module may be promoted to the runtime route without English parity.
- Every current Catalog module is audited exactly once with one of: `keep`, `rebuild`, `merge`, `split`, `add`, `demote-to-depth`, or `retire-with-redirect`.
- Existing Curriculum Catalog remains the runtime source through an adapter boundary; V3 planning files must not be imported by router or views.
- Each later implementation wave contains four to six adjacent modules and has its own review, verification, commit, and PR boundary.
- Preserve the untracked `docs/gpt_advice.md` file without reading, modifying, staging, or committing it.

---

## File Structure

- `src/curriculum/v3/types.ts`: V3 IDs, module/project/audit/coverage/wave contracts.
- `src/curriculum/v3/arcs.ts`: ten ordered arcs and their bilingual purpose.
- `src/curriculum/v3/modules/foundations.ts`: Arcs 1–3 module records.
- `src/curriculum/v3/modules/machineLearning.ts`: Arcs 4–6 module records.
- `src/curriculum/v3/modules/deepLearning.ts`: Arcs 7–10 module records.
- `src/curriculum/v3/projects.ts`: six project module records and project-specific evidence contracts.
- `src/curriculum/v3/inventory.ts`: aggregate inventory, maps, and ordered selectors.
- `src/curriculum/v3/audit.ts`: the complete 53-module current-content migration matrix.
- `src/curriculum/v3/coverage.ts`: entry assumptions, exit capabilities, project capability map.
- `src/curriculum/v3/waves.ts`: V3.1–V3.7 content implementation waves.
- `src/curriculum/v3/validation.ts`: pure validation functions and consolidated issue reporter.
- `scripts/generateCurriculumV3Docs.ts`: deterministic Markdown renderer for blueprint artifacts.
- `docs/curriculum-v3/*.md`: generated blueprint, audit, project, coverage, and backlog documents.
- `tests/curriculumV3Schema.test.ts`: contracts, roles, bilingual metadata, and counts.
- `tests/curriculumV3Dependencies.test.ts`: ordering, DAG, concept introduction/revisit, and project prerequisites.
- `tests/curriculumV3Audit.test.ts`: exact current Catalog coverage and valid migration targets.
- `tests/curriculumV3Docs.test.ts`: deterministic generated-doc coverage and non-runtime boundary.

### Task 1: Define V3 contracts and ten arcs

**Files:**
- Create: `src/curriculum/v3/types.ts`
- Create: `src/curriculum/v3/arcs.ts`
- Create: `tests/curriculumV3Schema.test.ts`

**Interfaces:**
- Consumes: `LocalizedCopy` from `src/types/ml.ts`.
- Produces: `CurriculumV3ArcId`, `CurriculumV3Role`, `CurriculumV3MigrationAction`, `CurriculumV3ModuleBlueprint`, `CurriculumV3ProjectBlueprint`, `CurriculumV3AuditEntry`, `CurriculumV3ExitCapability`, `CurriculumV3Wave`, and `curriculumV3Arcs`.

- [ ] **Step 1: Write the failing schema and arc tests**

```ts
import test from 'node:test'
import assert from 'node:assert/strict'
import { curriculumV3Arcs } from '../src/curriculum/v3/arcs.ts'

test('Curriculum V3 defines ten ordered bilingual arcs', () => {
  assert.deepEqual(curriculumV3Arcs.map((arc) => arc.id), [
    'math-language',
    'linear-algebra',
    'calculus-probability-optimization',
    'data-to-features',
    'classical-supervised-learning',
    'generalization-evaluation',
    'neural-network-foundations',
    'deep-learning-structures',
    'transformers-language-models',
    'llm-adaptation-retrieval',
  ])
  assert.deepEqual(curriculumV3Arcs.map((arc) => arc.order), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  for (const arc of curriculumV3Arcs) {
    assert.ok(arc.title['zh-CN'].trim())
    assert.ok(arc.title.en.trim())
    assert.ok(arc.purpose['zh-CN'].trim())
    assert.ok(arc.purpose.en.trim())
  }
})
```

- [ ] **Step 2: Run the test and confirm RED**

Run: `node --test tests/curriculumV3Schema.test.ts`

Expected: FAIL because `src/curriculum/v3/arcs.ts` does not exist.

- [ ] **Step 3: Implement the exact V3 contracts**

```ts
// src/curriculum/v3/types.ts
import type { LocalizedCopy } from '../../types/ml.ts'

export type CurriculumV3ArcId =
  | 'math-language'
  | 'linear-algebra'
  | 'calculus-probability-optimization'
  | 'data-to-features'
  | 'classical-supervised-learning'
  | 'generalization-evaluation'
  | 'neural-network-foundations'
  | 'deep-learning-structures'
  | 'transformers-language-models'
  | 'llm-adaptation-retrieval'

export type CurriculumV3Role = 'required-core' | 'depth-topic' | 'project' | 'reference'
export type CurriculumV3MigrationAction =
  | 'keep'
  | 'rebuild'
  | 'merge'
  | 'split'
  | 'add'
  | 'demote-to-depth'
  | 'retire-with-redirect'
export type CurriculumV3AuthoringStatus = 'planned' | 'drafted' | 'reviewed' | 'parity-complete' | 'promoted'
export type CurriculumV3ExerciseKind = 'concept' | 'calculation-code' | 'open-experiment'

export interface CurriculumV3Arc {
  id: CurriculumV3ArcId
  order: number
  title: LocalizedCopy
  purpose: LocalizedCopy
}

export interface CurriculumV3ContentEvidence {
  intuitionId: string
  formulaVocabulary: string[]
  workedExampleId: string
  scratchCodeId?: string
  frameworkCodeId?: string
  experimentId: string
  failureCaseId: string
  exerciseKinds: CurriculumV3ExerciseKind[]
  checkpointEvidence: 'explanation' | 'calculation' | 'code' | 'experiment'
}

export interface CurriculumV3ModuleBlueprint {
  id: string
  arcId: CurriculumV3ArcId
  order: number
  role: Exclude<CurriculumV3Role, 'project'>
  title: LocalizedCopy
  learnerQuestion: LocalizedCopy
  outcomes: LocalizedCopy[]
  prerequisiteIds: string[]
  introduces: string[]
  revisits: string[]
  mathCapabilities: string[]
  pythonCapabilities: string[]
  contentEvidence: CurriculumV3ContentEvidence
  projectIds: string[]
  sourceModuleIds: string[]
  migrationAction: CurriculumV3MigrationAction
  authoring: {
    zhCN: CurriculumV3AuthoringStatus
    review: CurriculumV3AuthoringStatus
    en: CurriculumV3AuthoringStatus
    runtime: CurriculumV3AuthoringStatus
  }
}

export interface CurriculumV3ProjectBlueprint
  extends Omit<CurriculumV3ModuleBlueprint, 'role' | 'contentEvidence'> {
  role: 'project'
  capabilityIds: string[]
  deliverables: string[]
  evidenceRequirements: string[]
}

export interface CurriculumV3AuditEntry {
  currentModuleId: string
  action: Exclude<CurriculumV3MigrationAction, 'add'>
  targetModuleIds: string[]
  strengths: string[]
  contractGaps: string[]
  rationale: LocalizedCopy
}

export interface CurriculumV3ExitCapability {
  id: string
  description: LocalizedCopy
  moduleIds: string[]
  projectIds: string[]
}

export interface CurriculumV3Wave {
  id: `v3.${1 | 2 | 3 | 4 | 5 | 6 | 7}-${string}`
  title: LocalizedCopy
  moduleIds: string[]
  exitCriteria: LocalizedCopy[]
}
```

Implement `curriculumV3Arcs` with the ten IDs in the test and the approved purposes from Sections 4–5 of `docs/superpowers/specs/2026-07-10-curriculum-v3-blueprint-design.md`. Use a local `copy(zhCN, en)` helper and concrete bilingual text; do not import runtime i18n.

- [ ] **Step 4: Run and confirm GREEN**

Run: `node --test tests/curriculumV3Schema.test.ts`

Expected: PASS, 1 test.

- [ ] **Step 5: Commit**

```bash
git add src/curriculum/v3/types.ts src/curriculum/v3/arcs.ts tests/curriculumV3Schema.test.ts
git commit -m "feat: define curriculum v3 blueprint contracts"
```

### Task 2: Author the mathematics foundation inventory

**Files:**
- Create: `src/curriculum/v3/modules/foundations.ts`
- Modify: `tests/curriculumV3Schema.test.ts`
- Create: `tests/curriculumV3Dependencies.test.ts`

**Interfaces:**
- Consumes: `CurriculumV3ModuleBlueprint` and the first three arc IDs.
- Produces: `curriculumV3FoundationModules` with exactly 22 ordered records.

The exact module order is:

| Order | ID | Role | Prerequisites | Current source/action |
| ---: | --- | --- | --- | --- |
| 1 | `ai-overview` | required-core | — | `ai-overview` / rebuild |
| 2 | `python-notebook` | required-core | `ai-overview` | `python-notebook` / rebuild |
| 3 | `calculus-functions-rate-change` | required-core | `python-notebook` | same / rebuild |
| 4 | `beginner-linear-algebra` | required-core | `calculus-functions-rate-change` | same / rebuild |
| 5 | `calculus-derivatives-local-change` | required-core | `calculus-functions-rate-change` | same / rebuild |
| 6 | `beginner-probability-distributions` | required-core | `calculus-functions-rate-change` | same / rebuild |
| 7 | `linear-algebra-feature-space` | required-core | `beginner-linear-algebra` | same / rebuild |
| 8 | `linear-algebra-distance-similarity` | required-core | `linear-algebra-feature-space` | same / rebuild |
| 9 | `linear-algebra-matrix-transformations` | required-core | `beginner-linear-algebra` | same / rebuild |
| 10 | `linear-algebra-rank-null-space` | depth-topic | `linear-algebra-matrix-transformations` | same / keep |
| 11 | `least-squares-fitting` | required-core | `linear-algebra-feature-space`, `linear-algebra-matrix-transformations` | same / rebuild |
| 12 | `eigenvalues-eigenvectors` | depth-topic | `linear-algebra-matrix-transformations` | same / keep |
| 13 | `svd-pca-representation` | depth-topic | `least-squares-fitting`, `eigenvalues-eigenvectors` | `svd`,`pca` / merge |
| 14 | `numerical-linear-algebra` | depth-topic | `linear-algebra-rank-null-space` | `lu-decomposition`,`sparse-matrices`,`condition-numbers` / merge |
| 15 | `calculus-partial-derivatives-gradients` | required-core | `calculus-derivatives-local-change`, `beginner-linear-algebra` | same / rebuild |
| 16 | `chain-rule-local-approximation` | required-core | `calculus-derivatives-local-change` | `taylor-series` / merge |
| 17 | `numerical-differentiation-root-finding` | depth-topic | `calculus-derivatives-local-change`, `python-notebook` | `finite-difference-methods`,`nonlinear-equations` / merge |
| 18 | `probability-expectation-variance` | required-core | `beginner-probability-distributions` | new / add |
| 19 | `conditional-probability-markov` | depth-topic | `probability-expectation-variance` | `markov-chains` / merge |
| 20 | `probability-likelihood-entropy` | required-core | `probability-expectation-variance` | same / rebuild |
| 21 | `monte-carlo` | depth-topic | `probability-expectation-variance`, `python-notebook` | same / keep |
| 22 | `gradient-descent` | required-core | `calculus-partial-derivatives-gradients`, `chain-rule-local-approximation` | `gradient-descent`,`calculus-gradient-descent`,`optimization` / merge |

- [ ] **Step 1: Add failing count, metadata, and ordering tests**

```ts
import { curriculumV3FoundationModules } from '../src/curriculum/v3/modules/foundations.ts'

test('V3 foundations contain 22 substantive bilingual modules', () => {
  assert.equal(curriculumV3FoundationModules.length, 22)
  assert.equal(curriculumV3FoundationModules[0]?.id, 'ai-overview')
  assert.equal(curriculumV3FoundationModules.at(-1)?.id, 'gradient-descent')
  for (const module of curriculumV3FoundationModules) {
    assert.ok(module.title['zh-CN'].trim())
    assert.ok(module.title.en.trim())
    assert.ok(module.learnerQuestion['zh-CN'].trim())
    assert.ok(module.learnerQuestion.en.trim())
    assert.ok(module.outcomes[0]?.['zh-CN'].trim())
    assert.ok(module.outcomes[0]?.en.trim())
    assert.ok(module.contentEvidence.workedExampleId)
    assert.deepEqual(module.authoring, {
      zhCN: 'planned', review: 'planned', en: 'planned', runtime: 'planned',
    })
  }
})

test('mathematics uses introduction then explicit revisit', () => {
  const byId = new Map(curriculumV3FoundationModules.map((module) => [module.id, module]))
  assert.ok(byId.get('linear-algebra-matrix-transformations')?.introduces.includes('matrix-multiplication'))
  assert.ok(byId.get('gradient-descent')?.revisits.includes('gradient'))
  assert.ok(byId.get('probability-likelihood-entropy')?.revisits.includes('probability-distribution'))
})
```

- [ ] **Step 2: Run and confirm RED**

Run: `node --test tests/curriculumV3Schema.test.ts tests/curriculumV3Dependencies.test.ts`

Expected: FAIL because `foundations.ts` does not exist.

- [ ] **Step 3: Implement all 22 records**

Use one local `defineModule()` helper that preserves literal IDs and fills only the approved initial authoring state. Every record must explicitly supply bilingual title, learner question, outcome, prerequisite IDs, introduced/revisited concept IDs, math/Python capabilities, formula vocabulary, and stable evidence IDs. Evidence IDs use these exact prefixes:

```ts
contentEvidence: {
  intuitionId: `${id}-intuition`,
  formulaVocabulary,
  workedExampleId: `${id}-worked-example`,
  scratchCodeId: scratchCode ? `${id}-scratch-code` : undefined,
  frameworkCodeId: frameworkCode ? `${id}-framework-code` : undefined,
  experimentId: `${id}-experiment`,
  failureCaseId: `${id}-failure-case`,
  exerciseKinds: ['concept', 'calculation-code', 'open-experiment'],
  checkpointEvidence,
}
```

Required concept handoffs must include:

```ts
const requiredHandoffs = {
  'calculus-functions-rate-change': { introduces: ['function', 'variable', 'rate-of-change'] },
  'beginner-linear-algebra': { introduces: ['vector', 'matrix', 'shape'] },
  'calculus-derivatives-local-change': { introduces: ['derivative', 'local-change'] },
  'beginner-probability-distributions': { introduces: ['random-variable', 'probability-distribution'] },
  'linear-algebra-matrix-transformations': { introduces: ['matrix-multiplication', 'linear-map'] },
  'calculus-partial-derivatives-gradients': { introduces: ['partial-derivative', 'gradient'] },
  'probability-likelihood-entropy': { introduces: ['likelihood', 'entropy', 'cross-entropy'] },
  'gradient-descent': { revisits: ['derivative', 'gradient', 'matrix-multiplication'] },
} as const
```

Use the module titles and teaching responsibilities in Sections 4–6 of the approved spec; working English must describe the same question/outcome rather than repeat a slug.

- [ ] **Step 4: Run and confirm GREEN**

Run: `node --test tests/curriculumV3Schema.test.ts tests/curriculumV3Dependencies.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/curriculum/v3/modules/foundations.ts tests/curriculumV3Schema.test.ts tests/curriculumV3Dependencies.test.ts
git commit -m "feat: map v3 mathematics foundations"
```

### Task 3: Author data, classical ML, and evaluation modules

**Files:**
- Create: `src/curriculum/v3/modules/machineLearning.ts`
- Modify: `tests/curriculumV3Schema.test.ts`
- Modify: `tests/curriculumV3Dependencies.test.ts`

**Interfaces:**
- Consumes: foundation module IDs and `CurriculumV3ModuleBlueprint`.
- Produces: `curriculumV3MachineLearningModules` with exactly 14 ordered records.

Exact order and prerequisites:

```ts
export const v3MachineLearningOrder = [
  ['numerical-data', ['python-notebook', 'linear-algebra-feature-space']],
  ['categorical-data', ['numerical-data']],
  ['dataset-quality', ['numerical-data']],
  ['splits-generalization', ['dataset-quality']],
  ['data-exploration-pipelines', ['categorical-data', 'splits-generalization']],
  ['loss-functions', ['gradient-descent', 'probability-likelihood-entropy']],
  ['linear-regression', ['least-squares-fitting', 'loss-functions', 'data-exploration-pipelines']],
  ['logistic-regression', ['linear-regression', 'probability-likelihood-entropy']],
  ['classification', ['logistic-regression', 'categorical-data']],
  ['tree-forest', ['classification', 'dataset-quality']],
  ['ensemble-learning', ['tree-forest']],
  ['complexity-regularization', ['linear-regression', 'classification']],
  ['model-selection', ['splits-generalization', 'complexity-regularization']],
  ['training-diagnostics', ['model-selection', 'tree-forest']],
] as const
```

Roles: all are `required-core` except `ensemble-learning`, which is `depth-topic`. `data-exploration-pipelines` and `ensemble-learning` use `migrationAction: 'add'`; all other records map to the same current module ID with `rebuild` except `numerical-data`, `categorical-data`, `dataset-quality`, and `splits-generalization`, which use `keep`.

- [ ] **Step 1: Add failing inventory and dependency assertions**

```ts
test('V3 machine learning inventory walks from data to reliable evaluation', () => {
  assert.equal(curriculumV3MachineLearningModules.length, 14)
  assert.equal(curriculumV3MachineLearningModules[0]?.id, 'numerical-data')
  assert.equal(curriculumV3MachineLearningModules.at(-1)?.id, 'training-diagnostics')
  const byId = new Map(curriculumV3MachineLearningModules.map((module) => [module.id, module]))
  assert.ok(byId.get('linear-regression')?.prerequisiteIds.includes('loss-functions'))
  assert.ok(byId.get('classification')?.prerequisiteIds.includes('logistic-regression'))
  assert.ok(byId.get('model-selection')?.prerequisiteIds.includes('splits-generalization'))
})
```

- [ ] **Step 2: Run and confirm RED**

Run: `node --test tests/curriculumV3Schema.test.ts tests/curriculumV3Dependencies.test.ts`

Expected: FAIL because `machineLearning.ts` does not exist.

- [ ] **Step 3: Implement the 14 records**

Use the same explicit record contract and stable evidence-ID convention as Task 2. Required handoffs:

```ts
const requiredHandoffs = {
  'numerical-data': { introduces: ['numeric-feature', 'feature-matrix'] },
  'categorical-data': { introduces: ['categorical-vocabulary', 'one-hot-encoding', 'oov-value'] },
  'splits-generalization': { introduces: ['train-validation-test', 'data-leakage'] },
  'loss-functions': { introduces: ['objective-function', 'mse', 'binary-cross-entropy'] },
  'linear-regression': { revisits: ['matrix-multiplication', 'least-squares', 'objective-function'] },
  'logistic-regression': { revisits: ['likelihood', 'binary-cross-entropy'] },
  'classification': { introduces: ['threshold', 'confusion-matrix', 'precision', 'recall'] },
  'model-selection': { revisits: ['train-validation-test', 'data-leakage'] },
} as const
```

Each framework-facing model record uses a concrete framework code ID (`scikit-learn-linear-regression`, `scikit-learn-logistic-regression`, `scikit-learn-tree-forest`) while still requiring a from-scratch NumPy implementation for linear and logistic regression.

- [ ] **Step 4: Run and confirm GREEN**

Run: `node --test tests/curriculumV3Schema.test.ts tests/curriculumV3Dependencies.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/curriculum/v3/modules/machineLearning.ts tests/curriculumV3Schema.test.ts tests/curriculumV3Dependencies.test.ts
git commit -m "feat: map v3 classical machine learning"
```

### Task 4: Author neural-network, Transformer, and LLM modules

**Files:**
- Create: `src/curriculum/v3/modules/deepLearning.ts`
- Create: `src/curriculum/v3/inventory.ts`
- Modify: `tests/curriculumV3Schema.test.ts`
- Modify: `tests/curriculumV3Dependencies.test.ts`

**Interfaces:**
- Consumes: the first 36 instructional module IDs.
- Produces: `curriculumV3DeepLearningModules` with 20 records, `curriculumV3InstructionalModules` with 56 records, and `curriculumV3InstructionalModuleById`.

Exact order and prerequisites:

```ts
export const v3DeepLearningOrder = [
  ['neuron-activation-foundations', ['linear-regression', 'calculus-partial-derivatives-gradients']],
  ['mlp', ['neuron-activation-foundations', 'classification']],
  ['backpropagation-mechanism', ['mlp', 'chain-rule-local-approximation']],
  ['matrix-calculus-autodiff', ['backpropagation-mechanism', 'linear-algebra-matrix-transformations']],
  ['initialization-normalization', ['matrix-calculus-autodiff', 'probability-expectation-variance']],
  ['optimizer-comparison', ['gradient-descent', 'backpropagation-mechanism']],
  ['deep-architecture-math', ['initialization-normalization', 'optimizer-comparison']],
  ['tensor-shapes-vectorization', ['linear-algebra-matrix-transformations', 'python-notebook']],
  ['cnn-visualization', ['tensor-shapes-vectorization', 'mlp']],
  ['sequence-models-rnn', ['tensor-shapes-vectorization', 'mlp']],
  ['sequence-embedding-bridge', ['sequence-models-rnn', 'linear-algebra-distance-similarity']],
  ['tokenization-language-modeling', ['sequence-embedding-bridge', 'probability-likelihood-entropy']],
  ['attention-qkv-multihead', ['tokenization-language-modeling', 'linear-algebra-matrix-transformations']],
  ['transformer-blocks', ['attention-qkv-multihead', 'matrix-calculus-autodiff', 'initialization-normalization']],
  ['small-transformer-training', ['transformer-blocks', 'optimizer-comparison']],
  ['decoding-sampling', ['small-transformer-training', 'probability-expectation-variance']],
  ['llm-inference-context', ['decoding-sampling']],
  ['peft-lora', ['llm-inference-context', 'linear-algebra-matrix-transformations']],
  ['retrieval-rag-systems', ['llm-inference-context', 'linear-algebra-distance-similarity']],
  ['llm-evaluation-reliability', ['retrieval-rag-systems', 'model-selection']],
] as const
```

`deep-architecture-math` is a depth topic; `sequence-models-rnn` remains required because the approved route uses it as the conceptual bridge into sequence embeddings. Catalog has no current `sequence-models-rnn` source, so it uses `sourceModuleIds: []` and `add`. Other genuinely new modules also use `add`; `attention-transformer` splits into `attention-qkv-multihead`, `transformer-blocks`, `small-transformer-training`, and `decoding-sampling`; `llm-rag` splits into the four Arc 10 records. Existing aligned modules use `rebuild`, except `sequence-embedding-bridge`, which uses `keep`.

- [ ] **Step 1: Add failing total-count and endpoint tests**

```ts
test('V3 instructional inventory has 56 ordered modules ending in reliable LLM systems', () => {
  assert.equal(curriculumV3DeepLearningModules.length, 20)
  assert.equal(curriculumV3InstructionalModules.length, 56)
  assert.equal(curriculumV3InstructionalModuleById.size, 56)
  assert.equal(curriculumV3InstructionalModules[0]?.id, 'ai-overview')
  assert.equal(curriculumV3InstructionalModules.at(-1)?.id, 'llm-evaluation-reliability')
})

test('Transformer and LLM modules expose required mathematical revisits', () => {
  assert.ok(curriculumV3InstructionalModuleById.get('attention-qkv-multihead')?.revisits.includes('matrix-multiplication'))
  assert.ok(curriculumV3InstructionalModuleById.get('decoding-sampling')?.revisits.includes('probability-distribution'))
  assert.ok(curriculumV3InstructionalModuleById.get('retrieval-rag-systems')?.revisits.includes('vector-similarity'))
})
```

- [ ] **Step 2: Run and confirm RED**

Run: `node --test tests/curriculumV3Schema.test.ts tests/curriculumV3Dependencies.test.ts`

Expected: FAIL because deep-learning inventory and aggregate selectors do not exist.

- [ ] **Step 3: Implement the 20 records and aggregate inventory**

Apply the complete module contract from Task 2. The following formula vocabulary is mandatory:

```ts
const requiredFormulaVocabulary = {
  'mlp': ['x', 'W', 'b', 'z', 'a', 'yHat', 'loss'],
  'backpropagation-mechanism': ['dLossDyHat', 'dLossDz', 'dLossDW', 'dLossDb'],
  'attention-qkv-multihead': ['B', 'T', 'H', 'Q', 'K', 'V', 'dK', 'attentionWeights'],
  'transformer-blocks': ['hiddenStates', 'residual', 'layerNorm', 'mlpOutput'],
  'small-transformer-training': ['tokenIds', 'logits', 'targets', 'crossEntropy'],
  'decoding-sampling': ['logits', 'temperature', 'probabilities', 'nextToken'],
  'peft-lora': ['W', 'A', 'B', 'rank', 'alpha'],
  'retrieval-rag-systems': ['queryEmbedding', 'documentEmbedding', 'similarity', 'topK'],
} as const
```

`inventory.ts` concatenates only the three instructional arrays and throws no runtime errors at import time:

```ts
export const curriculumV3InstructionalModules = [
  ...curriculumV3FoundationModules,
  ...curriculumV3MachineLearningModules,
  ...curriculumV3DeepLearningModules,
]

export const curriculumV3InstructionalModuleById = new Map(
  curriculumV3InstructionalModules.map((module) => [module.id, module]),
)
```

- [ ] **Step 4: Run and confirm GREEN**

Run: `node --test tests/curriculumV3Schema.test.ts tests/curriculumV3Dependencies.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/curriculum/v3/modules/deepLearning.ts src/curriculum/v3/inventory.ts tests/curriculumV3Schema.test.ts tests/curriculumV3Dependencies.test.ts
git commit -m "feat: map v3 deep learning and llm route"
```

### Task 5: Map six projects and audit all current modules

**Files:**
- Create: `src/curriculum/v3/projects.ts`
- Create: `src/curriculum/v3/audit.ts`
- Modify: `src/curriculum/v3/inventory.ts`
- Create: `tests/curriculumV3Audit.test.ts`
- Modify: `tests/curriculumV3Schema.test.ts`

**Interfaces:**
- Produces: `curriculumV3Projects`, `curriculumV3Modules`, `curriculumV3ModuleById`, `curriculumV3AuditEntries`, and `curriculumV3AuditByCurrentModuleId`.

The six project IDs and prerequisites are exact:

```ts
export const curriculumV3ProjectPrerequisites = {
  'project-math-to-code': ['gradient-descent', 'monte-carlo'],
  'project-tabular-regression': ['linear-regression', 'data-exploration-pipelines'],
  'project-classification-evaluation': ['classification', 'model-selection'],
  'project-neural-representation': ['optimizer-comparison', 'cnn-visualization'],
  'project-small-transformer': ['decoding-sampling'],
  'project-llm-application': ['peft-lora', 'llm-evaluation-reliability'],
} as const
```

Every project requires these exact deliverable categories: `reproducible-config`, `baseline`, `controlled-improvement`, `metrics-and-plots`, `failure-examples`, `formula-code-behavior-explanation`, and `limitations-reflection`.

- [ ] **Step 1: Add failing project and audit coverage tests**

```ts
test('V3 has 56 instructional modules plus six staged projects', () => {
  assert.equal(curriculumV3Projects.length, 6)
  assert.equal(curriculumV3Modules.length, 62)
  assert.equal(curriculumV3ModuleById.size, 62)
  assert.deepEqual(curriculumV3Projects.map((project) => project.id), Object.keys(curriculumV3ProjectPrerequisites))
})

test('V3 audit classifies every current Catalog module exactly once', () => {
  assert.equal(curriculumV3AuditEntries.length, curriculumCatalog.length)
  assert.equal(curriculumV3AuditByCurrentModuleId.size, curriculumCatalog.length)
  assert.deepEqual(
    [...curriculumV3AuditByCurrentModuleId.keys()].sort(),
    curriculumCatalog.map((module) => module.id).sort(),
  )
  for (const entry of curriculumV3AuditEntries) {
    assert.ok(entry.strengths.length > 0)
    assert.ok(entry.contractGaps.length > 0)
    for (const targetId of entry.targetModuleIds) assert.ok(curriculumV3ModuleById.has(targetId))
  }
})
```

- [ ] **Step 2: Run and confirm RED**

Run: `node --test tests/curriculumV3Schema.test.ts tests/curriculumV3Audit.test.ts`

Expected: FAIL because project and audit records do not exist.

- [ ] **Step 3: Implement projects and the complete audit matrix**

Project capability progression is exact:

```ts
const projectCapabilities = {
  'project-math-to-code': ['formula-to-code', 'numerical-verification'],
  'project-tabular-regression': ['data-pipeline', 'honest-baseline', 'residual-analysis'],
  'project-classification-evaluation': ['threshold-decision', 'cross-validation', 'leakage-diagnosis'],
  'project-neural-representation': ['backprop-implementation', 'optimizer-comparison', 'representation-inspection'],
  'project-small-transformer': ['causal-language-model', 'training-loop', 'sampling'],
  'project-llm-application': ['parameter-efficient-adaptation', 'rag-evaluation', 'hallucination-analysis'],
} as const
```

Audit all 53 IDs returned by `curriculumCatalog`. Use these non-obvious mappings exactly:

```ts
const auditTargets = {
  'housing-price-project': ['project-tabular-regression'],
  'classification-project': ['project-classification-evaluation'],
  'attention-transformer': ['attention-qkv-multihead', 'transformer-blocks', 'small-transformer-training', 'decoding-sampling'],
  'llm-rag': ['llm-inference-context', 'peft-lora', 'retrieval-rag-systems', 'llm-evaluation-reliability'],
  'svd': ['svd-pca-representation'],
  'pca': ['svd-pca-representation'],
  'lu-decomposition': ['numerical-linear-algebra'],
  'sparse-matrices': ['numerical-linear-algebra'],
  'condition-numbers': ['numerical-linear-algebra'],
  'finite-difference-methods': ['numerical-differentiation-root-finding'],
  'nonlinear-equations': ['numerical-differentiation-root-finding'],
  'taylor-series': ['chain-rule-local-approximation'],
  'markov-chains': ['conditional-probability-markov'],
  'calculus-gradient-descent': ['gradient-descent'],
  'calculus-sgd-batch-noise': ['gradient-descent', 'optimizer-comparison'],
  'calculus-optimizer-comparison': ['optimizer-comparison'],
  'calculus-training-code-diagnostics': ['training-diagnostics'],
  'optimization': ['gradient-descent'],
} as const
```

Use `merge` when several current modules converge on one target, `split` for `attention-transformer` and `llm-rag`, `demote-to-depth` for retained mathematical depth topics, `keep` only for strong data-first task modules and `sequence-embedding-bridge`, and `rebuild` for remaining one-to-one mappings. Each entry must name at least one real strength and one missing V3 contract element; generic “needs improvement” text is forbidden.

- [ ] **Step 4: Run and confirm GREEN**

Run: `node --test tests/curriculumV3Schema.test.ts tests/curriculumV3Audit.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/curriculum/v3/projects.ts src/curriculum/v3/audit.ts src/curriculum/v3/inventory.ts tests/curriculumV3Schema.test.ts tests/curriculumV3Audit.test.ts
git commit -m "feat: map v3 projects and content migration"
```

### Task 6: Validate dependencies, exit coverage, and implementation waves

**Files:**
- Create: `src/curriculum/v3/coverage.ts`
- Create: `src/curriculum/v3/waves.ts`
- Create: `src/curriculum/v3/validation.ts`
- Modify: `tests/curriculumV3Dependencies.test.ts`
- Modify: `tests/curriculumV3Audit.test.ts`

**Interfaces:**
- Produces: `curriculumV3EntryAssumptions`, `curriculumV3ExitCapabilities`, `curriculumV3Waves`, `validateCurriculumV3Blueprint()`.

- [ ] **Step 1: Write failing validation tests**

```ts
test('V3 blueprint is acyclic, ordered, covered, and project-linked', () => {
  assert.deepEqual(validateCurriculumV3Blueprint(), [])
  assert.equal(curriculumV3ExitCapabilities.length, 7)
  assert.ok(curriculumV3Waves.length >= 12)
  assert.ok(curriculumV3Waves.every((wave) => wave.moduleIds.length >= 4 && wave.moduleIds.length <= 6))
})

test('entry assumptions reach every required module', () => {
  const required = curriculumV3Modules.filter((module) => module.role === 'required-core')
  assert.ok(required.length >= 40)
  for (const module of required) assert.ok(reachableFromEntry(module.id), `${module.id} is unreachable`)
})
```

- [ ] **Step 2: Run and confirm RED**

Run: `node --test tests/curriculumV3Dependencies.test.ts tests/curriculumV3Audit.test.ts`

Expected: FAIL because coverage, waves, and validation do not exist.

- [ ] **Step 3: Implement seven exit capabilities**

Use these exact IDs and required evidence endpoints:

```ts
const capabilityEndpoints = {
  'mathematics-to-computation': ['gradient-descent', 'project-math-to-code'],
  'data-to-honest-model': ['linear-regression', 'project-tabular-regression'],
  'classification-and-evaluation': ['model-selection', 'project-classification-evaluation'],
  'neural-training-diagnosis': ['optimizer-comparison', 'project-neural-representation'],
  'deep-representation-shapes': ['cnn-visualization', 'sequence-embedding-bridge'],
  'small-transformer-language-model': ['decoding-sampling', 'project-small-transformer'],
  'llm-adaptation-and-rag': ['llm-evaluation-reliability', 'project-llm-application'],
} as const
```

Entry assumptions are exactly `high-school-algebra-functions` and `basic-python-reading-editing`; they are capabilities, not fake module IDs.

- [ ] **Step 4: Implement wave and validation rules**

Create at least 12 waves spanning V3.1–V3.7. Every non-project required module appears in exactly one wave; depth topics may be assigned to an adjacent wave but cannot be prerequisites for a required module. Project waves may contain a project plus three to five adjacent instructional modules so every wave remains within the four-to-six-item rule. Stage responsibility is exact: V3.2 contains the complete data-to-feature pipeline, V3.3 classical ML, V3.4 neural foundations, and V3.5 deep-learning structures.

`validateCurriculumV3Blueprint()` returns stable strings for:

```ts
type V3ValidationPrefix =
  | 'duplicate-module'
  | 'unknown-prerequisite'
  | 'prerequisite-after-consumer'
  | 'dependency-cycle'
  | 'required-depends-on-depth'
  | 'unknown-project-reference'
  | 'concept-revisit-before-introduction'
  | 'project-revisit-module-id'
  | 'missing-bilingual-metadata'
  | 'missing-content-evidence'
  | 'audit-current-coverage'
  | 'unknown-audit-target'
  | 'project-count'
  | 'project-prerequisite'
  | 'exit-capability-coverage'
  | 'wave-size'
  | 'wave-required-coverage'
  | 'wave-stage-responsibility'
  | 'wave-instructional-contiguity'
  | 'wave-inventory-order'
```

Export pure helpers `curriculumV3DependencyIssues()`, `curriculumV3AuditIssues()`, `curriculumV3CoverageIssues()`, and `curriculumV3WaveIssues()` so failures remain diagnosable. Dependency validation checks project references and requires every revisit to name a previously introduced or explicitly declared entry concept; project revisits cannot substitute prerequisite module IDs for concept IDs. Wave validation also requires each wave's instructional members to occupy consecutive inventory positions and the flattened wave sequence never to regress; projects may sit beside adjacent instructional members without participating in the position check.

- [ ] **Step 5: Run and confirm GREEN**

Run: `node --test tests/curriculumV3Schema.test.ts tests/curriculumV3Dependencies.test.ts tests/curriculumV3Audit.test.ts`

Expected: PASS and `validateCurriculumV3Blueprint()` returns `[]`.

- [ ] **Step 6: Commit**

```bash
git add src/curriculum/v3/coverage.ts src/curriculum/v3/waves.ts src/curriculum/v3/validation.ts tests/curriculumV3Dependencies.test.ts tests/curriculumV3Audit.test.ts
git commit -m "feat: validate curriculum v3 blueprint coverage"
```

### Task 7: Generate the human-readable V3.0 blueprint documents

**Files:**
- Create: `scripts/generateCurriculumV3Docs.ts`
- Create: `docs/curriculum-v3/README.md`
- Create: `docs/curriculum-v3/module-inventory.md`
- Create: `docs/curriculum-v3/content-audit.md`
- Create: `docs/curriculum-v3/project-map.md`
- Create: `docs/curriculum-v3/coverage.md`
- Create: `docs/curriculum-v3/implementation-backlog.md`
- Create: `tests/curriculumV3Docs.test.ts`

**Interfaces:**
- Consumes: all V3 inventory, audit, coverage, validation, and wave exports.
- Produces: deterministic Markdown and `renderCurriculumV3Docs(): Map<string, string>`.

- [ ] **Step 1: Write failing documentation tests**

```ts
test('V3 docs are generated from the typed blueprint', () => {
  const rendered = renderCurriculumV3Docs()
  assert.deepEqual([...rendered.keys()].sort(), [
    'README.md',
    'content-audit.md',
    'coverage.md',
    'implementation-backlog.md',
    'module-inventory.md',
    'project-map.md',
  ])
  assert.match(rendered.get('module-inventory.md') ?? '', /56 instructional modules/)
  assert.match(rendered.get('content-audit.md') ?? '', /53 current modules/)
  assert.match(rendered.get('project-map.md') ?? '', /project-small-transformer/)
  assert.match(rendered.get('coverage.md') ?? '', /llm-adaptation-and-rag/)
})

test('checked-in V3 docs match deterministic rendering', () => {
  for (const [filename, markdown] of renderCurriculumV3Docs()) {
    assert.equal(readFileSync(new URL(`../docs/curriculum-v3/${filename}`, import.meta.url), 'utf8'), markdown)
  }
})
```

- [ ] **Step 2: Run and confirm RED**

Run: `node --test tests/curriculumV3Docs.test.ts`

Expected: FAIL because the generator does not exist.

- [ ] **Step 3: Implement deterministic renderers**

The generator exports `renderCurriculumV3Docs()` and only writes files when executed as the entry script. Sort module rows by `order`, audit rows by current Catalog order, project rows by project order, capabilities by declared order, and waves by V3 version then declaration order. Each file begins with:

```md
<!-- Generated from src/curriculum/v3. Do not edit by hand. -->
```

Required document content:

- `README.md`: learner assumptions, exit capability summary, ten arcs, Chinese-first/bilingual promotion gate, non-goals.
- `module-inventory.md`: all 62 modules with order, role, prerequisites, source mapping, migration action, and authoring state.
- `content-audit.md`: all 53 current modules with action, targets, strengths, gaps, and rationale.
- `project-map.md`: all six projects with prerequisites, capabilities, deliverables, and evidence.
- `coverage.md`: all seven exit capabilities and their instructional/project evidence.
- `implementation-backlog.md`: V3.1–V3.7 waves and exact exit criteria.

Run the generator with `node scripts/generateCurriculumV3Docs.ts` and stage only the six documented outputs.

- [ ] **Step 4: Run and confirm GREEN**

Run: `node scripts/generateCurriculumV3Docs.ts && node --test tests/curriculumV3Docs.test.ts`

Expected: six files written; tests PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/generateCurriculumV3Docs.ts docs/curriculum-v3 tests/curriculumV3Docs.test.ts
git commit -m "docs: generate curriculum v3 blueprint artifacts"
```

### Task 8: Record V3.0 traceability and perform final verification

**Files:**
- Create: `docs/refactor/summaries/curriculum-v3-0.md`
- Modify: `.planning/ROADMAP.md`
- Modify: `.planning/STATE.md`
- Modify: `tests/curriculumMilestoneAudit.test.ts`

**Interfaces:**
- Produces: V3.0 completion record and next-phase decision boundary for V3.1.

- [ ] **Step 1: Add failing milestone assertions**

```ts
assert.ok(existsSync(new URL('docs/refactor/summaries/curriculum-v3-0.md', root)))
assert.match(stateSource, /Curriculum V3\.0 blueprint and 53-module content audit completed/)
assert.match(roadmapSource, /V3\.1 Minimum Mathematical Foundation/)
```

- [ ] **Step 2: Run and confirm RED**

Run: `node --test tests/curriculumMilestoneAudit.test.ts`

Expected: FAIL because the V3.0 summary and planning entries do not exist.

- [ ] **Step 3: Write the summary and planning records**

Record exact counts (56 instructional modules, 6 projects, 53 audited current modules, 10 arcs, 7 exit capabilities), the generated artifact paths, validation commands, the runtime non-goals, and any remaining content risks. Mark V3.1 as next, not started. Explicitly record that Phase 24B/24C remain paused and that no runtime lesson, route, or Progress data changed.

- [ ] **Step 4: Run complete verification**

Run: `npm test`

Expected: all tests pass, including V3 schema, dependency, audit, docs, and milestone tests.

Run: `npm run build && npm run build:pages && node scripts/generateCurriculumV3Docs.ts && git diff --exit-code -- docs/curriculum-v3 && git diff --check`

Expected: both builds pass with only the documented pre-existing chunk warning; generated docs remain unchanged; no whitespace errors.

Run: `rg -n "curriculum/v3" src/router src/views src/components src/main.ts`

Expected: no matches, proving V3.0 remains outside runtime UI imports.

- [ ] **Step 5: Commit**

```bash
git add docs/refactor/summaries/curriculum-v3-0.md .planning/ROADMAP.md .planning/STATE.md tests/curriculumMilestoneAudit.test.ts
git commit -m "docs: complete curriculum v3 blueprint phase"
```
