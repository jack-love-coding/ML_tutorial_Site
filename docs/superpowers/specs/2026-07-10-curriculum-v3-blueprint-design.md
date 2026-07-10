# Curriculum V3 Blueprint Design

**Date:** 2026-07-10
**Status:** Awaiting written-spec approval
**Scope:** Curriculum architecture and content governance only. No runtime course, route, progress, or UI implementation.

## 1. Purpose

Curriculum V3 turns ML Atlas from a collection of uneven modules into a coherent textbook-scale learning program. The route starts with the minimum mathematics needed for machine learning, deepens that mathematics when a model needs it, and continues through classical ML, neural networks, Transformer language models, parameter-efficient fine-tuning, and RAG.

The primary objective is content quality and instructional continuity. Homepage focus, continuation UX, progressive-disclosure Spine UI, and other Phase 24B/24C experience work are paused while V3.0 defines the course itself.

## 2. Target Learner and Exit Capability

The default learner:

- knows high-school algebra and functions;
- can read and modify basic Python;
- does not need prior calculus, linear algebra, probability, or machine-learning coursework.

After completing the program, the learner should be able to:

- explain the mathematics behind core ML, neural-network, Attention, and Transformer mechanisms;
- trace dimensions and variables from formulas into numerical examples, code, visualizations, and experiments;
- implement essential algorithms with Python/NumPy before using scikit-learn or PyTorch abstractions;
- diagnose data, optimization, generalization, and evaluation failures;
- train and sample from a small Transformer language model;
- complete a small parameter-efficient fine-tuning or RAG application with an explicit evaluation set;
- explain limitations such as context boundaries, retrieval failures, hallucinations, data leakage, and unreliable metrics.

The required route does not include large-scale distributed pretraining, a complete RLHF stack, production Agent infrastructure, or production serving platforms. These may become later advanced libraries.

## 3. Curriculum Scale and Roles

The V3 target is approximately 60 modules:

- about 42 required-core modules;
- about 12 depth or extension modules;
- 6 staged projects, including the graduation project.

The exact count may move slightly during the V3.0 dependency audit, but the blueprint must remain above 50 substantive modules. Inflating the count by splitting short pages is not acceptable.

Every module has one primary curriculum role:

- `required-core`: necessary for the default mathematics-to-LLM route;
- `depth-topic`: deeper theory, alternative derivation, or specialized model knowledge;
- `project`: cumulative applied evidence;
- `reference`: reusable notation, API, or troubleshooting material that does not advance the route.

Modules may support several later topics, but they must have exactly one primary responsibility.

## 4. Ten-Arc Knowledge Architecture

### Arc 1: Mathematical Language and Computational Starting Point

Functions, graphs, variables, vectors, matrices, derivatives, probability intuition, Python numerical work, NumPy arrays, and tensor-shape reading. This is a minimum viable foundation, not a front-loaded mathematics degree.

### Arc 2: Linear Algebra and Feature Space

Vector geometry, dot products, norms, distance, matrix multiplication, linear maps, systems, least squares, projections, eigen directions, SVD, and PCA. Required items support features and linear models; deeper decompositions may remain depth topics.

### Arc 3: Calculus, Probability, Information, and Optimization

Local change, partial derivatives, gradients, chain rule, numerical gradients, probability distributions, conditional probability, expectation, variance, likelihood, entropy, cross-entropy, and optimization behavior. Concepts are revisited later in the model that consumes them.

### Arc 4: Data Becomes Model Input

Tables, numeric and categorical features, missing values, duplicates, label quality, EDA, train/validation/test separation, leakage, preprocessing fit/transform boundaries, and reproducible pipelines.

### Arc 5: Classical Supervised Learning

Loss functions, linear regression, logistic regression, decision boundaries, classification metrics, thresholds, decision trees, ensembles, and honest baselines.

### Arc 6: Generalization and Reliable Evaluation

Bias and variance, underfitting and overfitting, regularization, cross-validation, model selection, error analysis, class imbalance, calibration, robustness, and experiment reporting.

### Arc 7: Neural-Network Foundations

Perceptrons, MLPs, activations, computation graphs, backpropagation, automatic differentiation, initialization, normalization, batch behavior, SGD variants, momentum, Adam, capacity, regularization, and training diagnostics.

### Arc 8: Deep-Learning Structures and Representation

Image tensors, convolutions, pooling, receptive fields, representation learning, sequence representation, embeddings, recurrent-model intuition as a historical and conceptual bridge, and sequence tensor shapes.

### Arc 9: Attention, Transformers, and Language Models

Tokenization, embeddings, position, masks, Q/K/V, scaled dot-product Attention, multi-head Attention, Transformer blocks, residual paths, normalization, causal language-model objectives, batching, a small Transformer training loop, decoding, and sampling.

### Arc 10: LLM Adaptation, Retrieval, and Graduation Work

Inference constraints, prompt/context composition, embedding retrieval, chunking, RAG assembly, evaluation datasets, retrieval and generation failure diagnosis, parameter-efficient fine-tuning, hallucination analysis, and a final LLM or RAG application.

## 5. Hybrid Mathematics Strategy

Mathematics follows a two-pass model:

1. The opening arcs establish the minimum language needed to follow features, loss, gradients, and probability.
2. Later arcs deepen the relevant mathematics immediately before or inside the model that uses it.

Examples:

- matrix multiplication first appears as a concrete transformation, then returns in multivariate regression, MLP layers, and Q/K/V projections;
- the chain rule begins with scalar compositions, then returns in backpropagation and automatic differentiation;
- probability begins with distributions and conditional reasoning, then returns in likelihood, classification, entropy, language modeling, and sampling;
- similarity begins with vector geometry, then returns in embeddings, Attention scores, and retrieval.

The blueprint must record both the first introduction and every required revisit. A learner must never depend on a depth-topic module to understand a required-core module.

## 6. Complete Module Contract

A required-core module is not complete unless it contains the following teaching loop:

1. a motivating question and reason for its location in the route;
2. an explicit prerequisite recap;
3. an intuitive geometric, visual, data, or task model;
4. formal definitions, assumptions, notation, and dimensions;
5. at least one small worked numerical example;
6. a from-scratch Python or NumPy implementation when computation is central;
7. a library or framework implementation when the topic has a standard abstraction;
8. a reproducible experiment in which one controlled change produces interpretable evidence;
9. common misconceptions and at least one failure case;
10. conceptual, computational/coding, and open experimental exercises;
11. a checkpoint requiring explanation, calculation, code evidence, or experiment evidence;
12. an explicit output contract for the next module or project.

Depth topics may omit a framework implementation or project connection when they are not relevant. Project modules replace the ordinary lesson flow with problem definition, data/protocol setup, baseline, controlled improvement, evaluation, failure analysis, and reflection.

All formulas, diagrams, controls, code, numerical examples, and checkpoint feedback use the same variable names and compatible shapes.

## 7. Six Required Projects

### Project 1: Mathematics to Code

Implement and test vector operations, matrix transformations, numerical gradients, and probability simulations with NumPy.

### Project 2: Raw Data to Regression

Build a reproducible tabular pipeline, train an honest linear-regression baseline, and explain residuals and failure cases.

### Project 3: Classification and Reliable Evaluation

Combine categorical processing, logistic regression or trees, threshold decisions, cross-validation, leakage checks, and error-cost analysis.

### Project 4: Neural Representation Learning

Implement a small MLP, reproduce it in PyTorch, compare optimization and regularization choices, and inspect learned representations. CNN work extends the same project or becomes a tightly linked subproject.

### Project 5: Small Transformer Language Model

Connect tokenization, embeddings, causal masks, Attention, Transformer blocks, the language-model objective, training, and sampling in one inspectable small model.

### Project 6: LLM Application Graduation Project

Complete either parameter-efficient adaptation or a RAG system using a small/open model. Define an evaluation set and analyze retrieval misses, hallucinations, context limits, and evidence quality.

Each project submission includes reproducible configuration, baseline, controlled improvement, metrics and plots, failure examples, formula/code/behavior explanations, and a concise limitations reflection.

Additional projects enter a Project Library with prerequisite and capability tags. They do not reorder the required route.

## 8. Existing-Content Migration Classification

V3.0 audits every existing module and assigns exactly one migration action:

- `keep`: already meets most of the V3 contract;
- `rebuild`: correct responsibility but insufficient depth or teaching closure;
- `merge`: duplicates another module or represents a fragment of one learning task;
- `split`: carries multiple responsibilities that need separate prerequisites or assessments;
- `add`: required knowledge is absent;
- `demote-to-depth`: useful but should not block the core route;
- `retire-with-redirect`: duplicated or misleading responsibility, while preserving old URL access.

The audit must explain the evidence for each classification. Page length alone is not evidence of quality.

## 9. Blueprint Source of Truth

V3.0 produces one machine-auditable blueprint record per proposed module. The record contains at least:

- stable module ID and working bilingual title;
- curriculum role and arc;
- learner question and measurable outcomes;
- prerequisite module IDs;
- introduced concepts and revisited concepts;
- required mathematical and Python capabilities;
- formulas and variable/shape vocabulary;
- worked-example requirement;
- from-scratch and framework-code requirements;
- experiment and evidence requirement;
- misconception and failure-case requirements;
- exercise and checkpoint requirements;
- project inputs/outputs;
- current source mapping and migration action;
- Chinese draft, review, English parity, and runtime-promotion status.

The blueprint is separate from runtime course bodies. Curriculum Catalog will continue to adapt existing content until a V3 module passes its promotion gate.

## 10. Chinese-First Authoring and Bilingual Promotion

Content authoring proceeds in two language stages:

1. Complete and review the Chinese teaching version, including formulas, numerical examples, code, exercises, and feedback.
2. Produce an English version with equivalent teaching depth and the same variables, formulas, examples, and experiments.

Chinese-first is permitted only in staging artifacts. A module cannot enter the runtime required route until both `'zh-CN'` and `en` satisfy the existing typed-schema and localization requirements.

## 11. Delivery Sequence

### V3.0: Blueprint and Content Audit

Produce the full module inventory, dependency graph, role assignments, existing-content migration matrix, project map, module contract, and phased implementation backlog. Do not modify runtime course content.

### V3.1: Minimum Mathematical Foundation

Functions, vectors, matrices, derivatives, probability intuition, and the Python/NumPy bridge.

### V3.2: Deeper Mathematics and Data

Linear algebra, calculus, probability/statistics, information concepts, and the complete data-to-feature pipeline.

### V3.3: Classical Machine Learning

Regression, classification, loss, trees, generalization, regularization, model selection, and staged projects.

### V3.4: Neural-Network Foundations

MLP, backpropagation, autodiff, initialization, optimization, regularization, and diagnosis.

### V3.5: Deep-Learning Structures

CNN, representation learning, sequence bridges, embeddings, and tensor-shape fluency.

### V3.6: Transformers and Small LLMs

Attention through a trainable small language model and generation.

### V3.7: Adaptation, RAG, and Graduation

Inference, parameter-efficient fine-tuning, retrieval, RAG evaluation, and the final project.

Implementation waves after V3.0 should normally contain four to six adjacent modules. Each wave has independent content review, verification, commit, and PR boundaries.

## 12. Validation and Promotion Gates

A V3 implementation wave cannot complete until:

- module IDs and routes are unique;
- the prerequisite graph is acyclic and all referenced prerequisites exist;
- every required concept is introduced before it is consumed;
- required-core coverage reaches all target exit capabilities;
- formulas, numerical examples, code outputs, and experiments agree;
- exercise answers are derivable from the module;
- checkpoints test explanation, calculation, code, or evidence rather than recognition alone;
- Chinese content passes subject and teaching review;
- English parity is complete before runtime promotion;
- experiments are deterministic or record their seeds and tolerate invalid inputs;
- old routes and V1/V2 progress data remain accessible;
- relevant tests, builds, and browser checks pass.

V3.0 itself is complete only when every current and proposed module is present in the audit matrix, every required module has a dependency path from the learner entry point, all six projects have prerequisite mappings, and the implementation backlog is divided into independently executable waves.

## 13. Non-Goals for V3.0

V3.0 does not:

- rewrite lesson bodies;
- change the homepage or Spine presentation;
- implement Phase 24B or Phase 24C;
- change Progress V1/V2 storage;
- remove legacy routes;
- publish Chinese-only runtime modules;
- add production-scale distributed training, RLHF, Agent infrastructure, or model serving.

## 14. First Deliverables

The V3.0 implementation plan will create:

1. a typed or otherwise machine-auditable proposed module inventory;
2. an exact 50-plus-module knowledge tree and prerequisite graph;
3. an existing 53-module audit matrix with keep/rebuild/merge/split/add/demote/retire decisions;
4. a six-project prerequisite and capability map;
5. a coverage matrix from learner entry assumptions to exit capabilities;
6. a wave-based V3.1–V3.7 backlog;
7. validation tests for identifiers, roles, dependency order, coverage, project mapping, and bilingual working metadata.

These artifacts define what content work should happen next. They do not claim that the corresponding lesson content is already complete.
