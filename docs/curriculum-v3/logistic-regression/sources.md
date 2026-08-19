# Logistic Regression Course Sources

**Accessed:** 2026-08-20  
**Course scope:** Phase 29 uses these materials to verify definitions, data provenance, and implementation contracts. Learner-facing chapters are original bilingual explanations; citations are consolidated only in the final chapter.

| Source | License / status | Course use |
| --- | --- | --- |
| [UCI Banknote Authentication](https://archive.ics.uci.edu/dataset/267/banknote+authentication) | CC BY 4.0 | Local immutable Banknote snapshot, four wavelet-derived inputs, class labels without invented class semantics, source attribution. |
| [UCI dataset paper: Wavelet Domain for Authentication](https://archive.ics.uci.edu/dataset/267/banknote+authentication) | Dataset publication | Background only; no learner copy is reproduced. |
| [scikit-learn LogisticRegression](https://scikit-learn.org/stable/modules/linear_model.html#logistic-regression) | BSD-3-Clause documentation | Declared `lbfgs` parity configuration and solver terminology. |
| [scikit-learn common pitfalls](https://scikit-learn.org/stable/common_pitfalls.html) | BSD-3-Clause documentation | Train-only preprocessing and leakage wording. |
| [Dive into Deep Learning: Linear Classification](https://d2l.ai/chapter_linear-classification/softmax-regression.html) | CC BY-SA 4.0 | Teaching-structure reference for likelihood, cross-entropy, and gradients; no translation or long-form reuse. |
| [NIST numerical analysis handbook](https://www.itl.nist.gov/div898/handbook/) | U.S. government publication | Numerical-stability and finite-difference cross-check terminology. |

## Local reproducibility authority

- `public/logistic-regression/phase-29/manifest.json` binds notebooks, figures, interaction payloads, hashes, and source-cell IDs.
- `public/logistic-regression/phase-29/banknote-logistic-regression.zh-CN.ipynb` and `.en.ipynb` contain executed bilingual calculations.
- `public/logistic-regression/phase-29/frozen-predictions.{csv,json}` are intentionally reserved for Phase 30. They are validated by the release contract but are not linked or loaded by the Phase 29 learner page.
