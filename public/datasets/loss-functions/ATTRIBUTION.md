# Phase 26 Loss Functions Dataset Attribution

## LaDe-D Jilin delivery data

- Source: Cainiao-AI LaDe, pinned revision `be2cec02775cafc8d52230303f32134382bcc50b`
- Source page: https://huggingface.co/datasets/Cainiao-AI/LaDe
- License: Apache-2.0
- Attribution: Cainiao-AI LaDe dataset card and the LaDe paper, arXiv:2306.10675
- Course derivative: all 31,415 Jilin delivery rows with exactly eight coarse fields.
  Order, region, courier, AOI identifier, GPS, coordinate, and precise stop fields
  are excluded under the approved privacy boundary.

## UCI SECOM manufacturing data

- Source: UCI Machine Learning Repository SECOM dataset
- DOI: 10.24432/C54305
- Source page: https://archive.ics.uci.edu/dataset/179/secom
- License: CC BY 4.0
- Course derivative: all 1,567 rows, raw missing values preserved, `-1` mapped
  to pass label `0`, and `1` mapped to fail label `1`.
- Schema note: upstream metadata declares 591 features while the pinned raw file
  contains exactly 590 measurement values per row. The course copy records both
  facts and does not pad, truncate, or impute the canonical CSV.
