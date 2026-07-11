# Mathematics-to-Code Pilot Unit Design

**Date:** 2026-07-11  
**Status:** Awaiting written-spec review  
**Scope:** A high-detail, frontend-only pilot unit for Curriculum V3. No formal assessment backend.

## 1. Purpose

The next curriculum milestone will validate the V3 teaching standard with one small but complete learning unit before the project scales content production across the full curriculum.

The pilot takes a learner from familiar high-school algebra and basic Python to an inspectable mathematical prediction pipeline. It must show how functions, vectors, matrices, derivatives, and NumPy describe the same computation at different levels. The unit ends with a guided Mathematics-to-Code project that integrates those ideas without introducing a grading or submission system.

The pilot optimizes for teaching detail and mathematical-code consistency. It does not optimize for course-resumption UX, formal completion tracking, teacher administration, or backend assessment.

## 2. Target Learner and Outcome

The default learner:

- understands high-school algebra and basic functions;
- can read and modify simple Python;
- has not completed university calculus or linear algebra;
- has not previously built a machine-learning model.

After the unit, the learner should be able to:

- explain a prediction as a function from inputs and parameters to an output;
- represent one sample as a vector and a batch as a matrix;
- trace dimensions through a matrix-based prediction;
- interpret a derivative as local sensitivity of error to a parameter;
- approximate a scalar derivative numerically;
- translate the same calculation between formulas, worked numbers, and NumPy;
- inspect how a controlled parameter change affects prediction and error;
- complete the guided Mathematics-to-Code project and explain observed behavior.

The unit introduces probability simulation only as a preview inside the project. It does not claim to teach the probability foundation required by later V3 arcs.

## 3. Unit Structure

The working unit title is **Mathematics Becomes Machine-Learning Code** / **数学如何变成机器学习代码**.

### Lesson 1: Functions and Mappings

Start from the question: how do inputs and adjustable parameters produce a prediction? Establish variables, function notation, graphs, parameters, outputs, and composition using the shared prediction task.

### Lesson 2: Vectors and Sample Representation

Represent one example as a feature vector. Develop dimension, direction, magnitude, and dot-product intuition, then connect the dot product to a weighted prediction.

### Lesson 3: Matrices and Batch Computation

Extend one sample to a batch. Teach matrix shape, matrix multiplication, linear transformations, and vectorized prediction while making every dimension traceable.

### Lesson 4: Derivatives and Error Change

Use prediction error to introduce change rate, local slope, partial-derivative intuition, and a numerical derivative. The lesson prepares the learner for gradient descent without attempting to teach the full optimization arc.

### Lesson 5: Implementing the Mathematics with NumPy

Translate the previous four lessons into arrays, shapes, broadcasting, vectorized functions, and inspectable tests. The lesson must connect each important code expression to its mathematical counterpart.

### Project 1: Mathematics to Code

Guide the learner through a small prediction computation from scratch. The project integrates vector operations, matrix transformations, prediction and error calculations, numerical gradients, and a simple probability simulation preview. It emphasizes reproducibility, controlled changes, plots or tables, failure observations, and explanation.

The project is a teaching artifact. A teacher or future backend may later define formal submission and evaluation, but those systems are outside this milestone.

## 4. Teaching Narrative

One small prediction task provides the unit's shared spine:

- a function maps features and parameters to a prediction;
- a vector represents one sample;
- a matrix represents multiple samples;
- error measures the gap between a prediction and a target;
- a derivative describes how error responds to a parameter change;
- NumPy implements the complete calculation.

The specific dataset and target must remain small enough for hand calculation. Values should be chosen so intermediate results are readable without a calculator wherever possible.

The shared task does not replace concept-specific intuition. Each lesson also includes an auxiliary example chosen for that concept, such as a coordinate transformation, geometric projection, motion graph, image-grid transformation, or simple simulation. Auxiliary examples may introduce new surface details, but must not rename the core variables used by the prediction task.

## 5. Gold-Standard Lesson Contract

Each lesson is designed for approximately 60–90 minutes of focused study. The following teaching loop is required, although headings and presentation may vary when a concept benefits from a different rhythm.

1. **Opening question:** present a concrete problem the learner cannot yet solve and explain why this concept appears here.
2. **Prerequisite recap:** recall only the knowledge needed for the lesson; do not assume university mathematics.
3. **Shared task connection:** place the concept inside the unit's prediction task.
4. **Intuitive model:** establish a visual, geometric, motion-based, or data-based mental model before relying on formal notation.
5. **Formal expression:** define notation, assumptions, variables, dimensions, and shapes, explaining each term.
6. **Two worked numerical examples:** include one shared-task example and one auxiliary example, showing intermediate calculations rather than only the final answer.
7. **Python/NumPy translation:** map symbols to named variables, arrays, and functions; show shape changes and likely errors.
8. **Controlled experiment:** change one named factor and connect changes in the visualization, values, and behavior.
9. **Misconceptions and failures:** explain why plausible mistakes occur, how to detect them, and how to repair the reasoning.
10. **Layered practice:** provide conceptual, hand-calculation or code-reading, and open observation exercises.
11. **Summary and handoff:** state the capability produced by the lesson and exactly how the next lesson consumes it.

Exercises and checkpoints provide hints, feedback, reference reasoning, and links back to relevant explanations. They are formative teaching devices, not formal evidence of course completion.

## 6. Project Presentation Contract

The project page must provide enough structure for a learner to work independently without turning into an answer dump. It includes:

- the problem and its connection to the five lessons;
- a small, local or generated dataset and reproducible starting values;
- a sequence of implementation stages;
- formula, variable, and shape references;
- example inputs and inspectable intermediate results;
- expected observations rather than a hidden pass/fail score;
- common implementation and reasoning failures;
- prompts for comparing baseline and controlled changes;
- reflection questions about formula-code-behavior alignment;
- optional extensions that do not block the core project;
- a clearly marked probability simulation preview.

The frontend does not upload files, grade code, store formal scores, issue certificates, or determine whether a learner has passed. Stable lesson, exercise, and project block IDs should nevertheless be retained so teachers or a later backend can reference them without rewriting the content model.

## 7. Language Workflow

Authoring is Chinese-first:

1. Complete the Chinese master for Lesson 1 and review it as the gold standard.
2. Complete the remaining Chinese lessons and project using the approved standard.
3. Validate the whole Chinese unit for continuity and mathematical-code consistency.
4. Create an English version with equivalent teaching depth.
5. Promote the unit into the formal route only after both locales are complete.

The English version is not required to mirror Chinese sentence structure. It must preserve the same formulas, variable names, shapes, numerical examples, experiment controls, exercise goals, misconceptions, and project observations.

Chinese-only intermediate content must remain explicitly staged and must not break the repository requirement that runtime course content provide both `'zh-CN'` and `en`.

## 8. Content and Frontend Architecture

The pilot uses the project's existing typed course schemas and safe rendering path. It should extend a schema only when the gold-standard lesson exposes a teaching requirement that cannot be represented cleanly by an existing typed field.

Responsibilities remain separated:

- course data defines localized teaching content and stable block identity;
- math utilities compute numerical results, scoring-like formative feedback, and experiment transformations;
- Vue components compose state and presentation without embedding core calculations in templates;
- existing Markdown/KaTeX sanitization renders mathematical text;
- existing visualization, code, checkpoint, and lab patterns are reused where they satisfy the lesson contract.

Every shared-task formula, worked example, code block, visualization, and experiment must use compatible variable names and shapes. Derived experiment data should be independent of DOM rendering and testable as deterministic functions.

Interactive explanations must retain complete text, table, or static-figure fallbacks. Color, animation, and pointer interaction cannot be the only carriers of a teaching conclusion. Public assets use project-relative public paths and preserve GitHub Pages base-path behavior.

## 9. Delivery Sequence

### Stage A: Lesson 1 Gold Standard

Produce the complete Chinese master for Functions and Mappings. Review its conceptual progression, numerical examples, language, formulas, code, experiment, misconceptions, practice, and handoff before scaling the pattern.

### Stage B: Complete Chinese Unit

Author Vectors, Matrices, Derivatives, NumPy, and the Mathematics-to-Code project. Verify that each lesson consumes the previous lesson's output and that no required-core step depends on later or depth-only knowledge.

### Stage C: Frontend Teaching Validation

Validate formula rendering, variable and shape consistency, code outputs, experiment behavior, resource paths, mobile reading, reduced-motion fallback, and route continuity. This stage validates teaching presentation, not formal student achievement.

### Stage D: English Parity and Promotion

Create and review the equivalent English content. Promote the unit into the formal curriculum route only when typed localization, content parity, tests, and build checks pass.

Each stage should remain independently reviewable and should avoid migrating unrelated V3 modules.

## 10. Testing and Review

The implementation plan must identify exact tests after inspecting the selected existing schemas and components. At minimum, verification covers:

- both locale keys for runtime-promoted content;
- stable and unique lesson/block IDs;
- valid prerequisite and next-lesson references;
- safe Markdown and formula rendering;
- formula/variable/shape vocabulary consistency;
- deterministic numerical examples and utility outputs;
- invalid numeric input, `NaN`, `Infinity`, and control-bound handling where learners can change values;
- checkpoint feedback and review references;
- local asset existence and public-base compatibility;
- route/module registration where promotion changes navigation;
- mobile-readable and reduced-motion fallbacks for essential explanations;
- focused unit tests, the full `npm test` suite, and the appropriate production build.

Content review additionally checks that a learner with the stated prerequisites can derive exercise answers from the lesson, that numerical examples are correct, and that code output agrees with the formulas.

## 11. Explicit Non-Goals

This milestone does not include:

- homework submission or file upload;
- teacher dashboards, grading workflows, or grade books;
- backend accounts, formal completion records, or certificates;
- automatic code judging or project pass/fail decisions;
- a rewrite of the entire Math Lab;
- bulk migration of the remaining V3 curriculum;
- unrelated homepage, continuation, or progressive-disclosure UX work;
- a complete probability, optimization, or machine-learning-model course inside the pilot.

## 12. Acceptance Criteria

The pilot design is successfully implemented when:

- all five lessons and the project follow the approved instructional sequence;
- Lesson 1 establishes a reusable, reviewed high-detail standard;
- the Chinese unit is internally complete before English parity work begins;
- every core formula is traceable to a worked number and code representation;
- the shared prediction task remains consistent across the unit;
- each lesson contains a concept-specific auxiliary example;
- experiments expose controlled, interpretable changes with non-interactive fallbacks;
- exercises and checkpoints teach without acting as formal assessment infrastructure;
- the project is detailed enough for guided independent work while leaving grading to teachers or a future backend;
- both locales satisfy the runtime promotion gate before the unit enters the required route;
- tests and builds required by the repository's Definition of Done pass;
- no unrelated runtime curriculum or UX scope is pulled into the milestone.
