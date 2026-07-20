# Manim Animation: UCI SMS sparse matrix, CSR, and matvec

## Production identity

This document is the NarrativeComposer handoff consumed by the CodeGenerator after the full six-role Math-To-Manim pipeline: ConceptAnalyzer → PrerequisiteExplorer → MathematicalEnricher → VisualDesigner → NarrativeComposer → CodeGenerator. The dependency graph is stored in `sms_csr_matvec_tree.json`. The final artifact is a silent, Simplified-Chinese teaching animation, not a promotional video and not a generic visualization of “big data.” Every number shown on screen comes from the executed Batch 2 Notebook and the reviewed UCI SMS Spam Collection snapshot.

The single learning objective is precise: after 75 seconds, a learner should be able to explain why the `5574 × 1881` TF–IDF matrix is sparse, how `data`, `indices`, and `indptr` recover one CSR row, and why a sparse matrix-vector product gives the same scalar as a dense dot product while visiting far fewer stored values. The video does not teach spam classification, train a model, remove duplicates, recommend a cleaning policy, or claim that sparsity automatically improves model quality.

**Exact duration:** 75 seconds.

**Delivery:** 1920×1080, 30 fps, H.264 MP4, one silent video stream, no audio stream.

**Locale inside the video:** `zh-CN`. English appears only in the external summary and bilingual label inventory. Necessary programming identifiers such as `data`, `indices`, `indptr`, `TF–IDF`, and `library CSR` may remain in Latin characters because they are the identifiers used in the Notebook and code.

## ConceptAnalyzer output

The central misconception to address is that a sparse matrix is a smaller mathematical matrix. It is not: `X` still has 5,574 rows and 1,881 columns, and every implicit zero remains part of the linear map. CSR changes representation and iteration strategy, not the matrix’s meaning. A second misconception is that `nnz` means the number of positive values; here it means the number of explicitly stored nonzero entries. A third misconception is that `indptr` stores a column number. It stores row boundaries into the one-dimensional `data` and `indices` arrays. The pair `[283, 299]` therefore defines a half-open slice for the seventeenth displayed row, not two vocabulary columns.

The lesson should connect four representations without conflating them: a raw message, its token sequence, a fixed-width TF–IDF row, and the CSR arrays for the complete matrix. The transition from text to numbers must make the fixed vocabulary visible. The transition from a row to CSR must make the row pointer visible. The transition from CSR to matvec must make the indexing indirection visible: each stored value multiplies `w[indices[k]]`. Finally, the storage comparison should make clear that the reported memory numbers use a dense `float64` baseline and the actual SciPy CSR arrays produced by the Notebook.

The animation uses the full local snapshot in original order. There are 5,574 records, of which 4,827 are ham and 747 are spam. There are 403 duplicate messages, and this lesson intentionally retains them because data policy is outside the representation lesson. These counts may be stated in supporting documents, but the main screen should only show the duplicate count at the end to prevent the opening from becoming a data-audit dashboard.

## PrerequisiteExplorer output

The minimal foundations are matrix shape, zero entries, array indexing, half-open slices, and the dot product. The learner does not need prior knowledge of compressed formats. The tree therefore introduces the fixed TF–IDF row before CSR, then uses array indexing to explain `indptr`, and only then derives the sparse dot product. Do not introduce linked lists, hash maps, vocabulary hashing, classifier weights, train/test splits, or computational complexity proofs. Those topics create branches that do not serve the 75-second objective.

The notation contract must remain stable. `n = 5574` is the number of messages, `d = 1881` is the retained vocabulary width, and `nnz = 69798` is the number of stored nonzeros. `X` is the matrix. `w` is a fixed illustrative weight vector used only to verify the matrix-vector operation. The displayed row is “第 17 行（从 1 开始）,” corresponding to zero-based row index 16 in code. Its CSR slice is `[283, 299)`, containing 16 values. The fixed output is `−0.497805956` when rounded to nine decimal places, and the difference between the manual row calculation and the library result is exactly zero in the executed Notebook.

## MathematicalEnricher output

The vectorization contract uses lowercase text and the token pattern `[a-z0-9']+`. Terms with document frequency below five are omitted. The inverse document frequency is `log((1+n)/(1+df)) + 1`, and every resulting row is L2-normalized. The animation does not need to derive TF–IDF fully, but it must label the weighting and normalization so the values are not mistaken for raw word counts.

Density is `nnz / (n × d) = 69798 / (5574 × 1881) = 0.006657132768967793`, shown as `0.66571%`. Average nonzeros per row are `69798 / 5574 = 12.5220667`, shown as `12.522`. These are descriptive facts about this exact snapshot and token contract. They are not universal properties of text data.

For CSR, `data[k]` stores a nonzero value, `indices[k]` stores its vocabulary-column index, and `indptr[i]` stores the starting offset of row `i`. Row `i` occupies `k ∈ [indptr[i], indptr[i+1])`. For one-based displayed row 17, code row 16, that interval is `[283, 299)`. Its matrix-vector result is

`(Xw)_17 = Σ_j X_17,j w_j = Σ_{k=283}^{298} data[k] · w[indices[k]]`.

The animation must preserve the half-open endpoint visually. Never write `[283, 299]` as the data slice. The only closed-looking pair is the two pointer values `indptr[16:18] = [283, 299]`; the actual visited range is `[283, 299)`.

Dense memory is `5574 × 1881 × 8 = 83,877,552` bytes, reported as `79.992 MiB`. The actual CSR arrays occupy `859,876` bytes, reported as `0.820 MiB`. The dense-to-CSR ratio is `97.5461019961`, reported as “约小 97.55 倍.” Do not claim that every CSR operation is 97.55 times faster. This ratio is storage for this exact matrix, not a runtime benchmark.

## VisualDesigner output

Use the ML Atlas scientific palette: warm off-white background `#F7F3EA`, paper panels `#FFFEF8`, navy `#102A43`, data blue `#2F6FED`, teal `#1F8A85`, orange `#F2994A`, and restrained gray `#8FA3B8`. Chinese text uses PingFang SC with Noto Sans CJK SC as the intended fallback. Maintain generous margins and avoid a dense terminal aesthetic. This is a textbook diagram in motion.

Color is never the sole carrier. Active matrix cells use both fill and spatial position. The three CSR arrays have explicit names. The row slice uses both orange color and the literal interval. The two matvec results have separate labels. The storage comparison uses titled cards and explicit units. No result should appear only as a colored bar.

The sparse matrix drawings are schematics, not a literal rendering of all 5,574 by 1,881 cells. Their surrounding titles and exact shape cards carry the authoritative dimensions. Do not place row or column axes that could be mistaken for an exhaustive sample. The raw-message example is pedagogical text and must not be presented as a quoted record from the public dataset.

The main visual rhythm is transformation within one case: sparse grid → token row → CSR arrays → indexed sum → storage comparison. Use arrows only where a representation is transformed into another representation. Do not animate a classifier, decision boundary, probability, or spam/ham prediction.

## NarrativeComposer storyboard

### 0:00–0:07 — Exact local snapshot

Open with a compact sparse-grid schematic on the left and the title `短信如何变成可计算的矩阵？` on the right. Show `UCI SMS Spam Collection · 完整 5,574 行快照`. Then reveal a shape card with `X ∈ R⁵⁵⁷⁴ˣ¹⁸⁸¹`, `nnz = 69,798`, and `没有训练分类器`. The opening should establish both the real data anchor and the lesson boundary. It should not display a confusion matrix or spam accuracy.

### 0:07–0:18 — Why the matrix is sparse

Show a small wide matrix with very few filled cells under `如果逐格存储`. Beside it, show `只记录非零项` and derive `密度 = nnz / (n × d) = 0.66571%`. Add `平均每行 12.522 个非零项` and `稀疏是数据结构属性`. The learner should see that a wide vocabulary and short messages produce many zeros, while still understanding that the exact density belongs to this tokenization contract.

### 0:18–0:31 — From message to fixed-width row

Show the illustrative message `WINNER! claim your prize now`, then lowercase token chips `winner`, `claim`, `your`, `prize`, `now`, then a fixed-width row containing zeros, ellipses, and a few nonzero weights. State `本例词项权重：TF–IDF`, `每一行再做 L2 归一化`, and `词表只保留 df ≥ 5 的词`. The chips explain token positions; they must not suggest that five tokens are the complete vocabulary.

### 0:31–0:46 — CSR’s three arrays

Show horizontal strips named `data`, `indices`, and `indptr`. Values are illustrative except for the pointer anchors. Reveal a separate card titled `第 17 行（从 1 开始）`. Show `indptr[16:18] = [283, 299]`, then emphasize `非零切片 [283, 299)` and `共有 16 个非零项`. Keep the row number and zero-based code indices together so that the off-by-one convention is auditable.

### 0:46–0:59 — Sparse matrix-vector product

Write `(Xw)₁₇ = Σⱼ X₁₇,ⱼ wⱼ`, transform it into `Σₖ data[k] · w[indices[k]]`, and retain `k ∈ [283, 299)`. On a second card, show `手算 CSR = −0.497805956`, `library CSR = −0.497805956`, and `差 = 0`. End the segment with `跳过所有隐含的 0，结果不变`. “手算” means a direct loop over the stored row performed in the Notebook, not arithmetic typed by a human without code.

### 0:59–1:09 — Storage comparison

Present two equal-sized cards. The dense card says `稠密 float64`, `5,574 × 1,881 × 8 bytes`, `79.992 MiB`, and `每个 0 也占空间`. The CSR card says `CSR 三数组`, `data + indices + indptr`, `0.820 MiB`, and `约小 97.55 倍`. Highlight the CSR card, but do not attach a speed icon or make a runtime claim. This segment supplies the poster at second 63, so all labels and both units must be readable together.

### 1:09–1:15 — Boundary and handoff

End on `稀疏存储改变计算成本，不改变数学结果`. Add `5,574 行原始顺序与 403 条重复消息均保留`. The final card says `本节只解释表示、存储和 matvec` and `分类训练、去重策略与业务决策留给后续课程`. Hold long enough to read, with no animated call-to-action.

## CodeGenerator and verification contract

Implement one deterministic Manim `Scene` with fixed cut timestamps `[0, 7, 18, 31, 46, 59, 69, 75]`. Each scene method may finish early and wait to its cut, but no animation may overrun the next cut. Use vector objects and `Text`; do not load remote images, runtime data, or a LaTeX environment. The renderer must disable cache, set 1920×1080 at 30 fps, validate H.264 and absence of audio, extract the poster at second 63, and publish only after all sources, documents, output anchors, video streams, and hashes pass. The source is authoritative only when it agrees with the executed Notebook output JSON.

The final quality check must reject any drift in `rows`, `columns`, `nnz`, density, row slice, row result, byte counts, and storage ratio. It must also reject missing six-role pipeline names, non-bilingual label objects, missing transcript or summary, and a duration difference over 0.20 seconds. Keep the complete video silent; the transcript is the accessibility fallback and carries the narrative that would otherwise be spoken.
