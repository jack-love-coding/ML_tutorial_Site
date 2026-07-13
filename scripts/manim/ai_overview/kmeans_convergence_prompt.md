# Manim Animation: K-means convergence

## Overview

Build K-means from coordinate points, squared distance, nearest choice, and coordinate-wise arithmetic means. The beginner must see one deterministic run from unlabeled points to repeated assignment and recomputation, not merely a final colored scatterplot.

**Total concepts:** 7
**Progression:** coordinate point → squared distance → nearest choice → arithmetic mean → cluster assignment → center recomputation → K-means convergence
**Exact duration:** 88 seconds
**Data contract:** 12 learner points, `K=3`, seed `3103`, initialized centers `(43,37),(88,33),(56,82)`, final centers `(47.33,36.67),(91.67,32.67),(68.5,77.67)`, metric `2441→1293.5→1293.5`, convergence at iteration 2.

## Animation Requirements

- Use Manim Community Edition and an explicit `KMeansConvergence(Scene)`.
- Render silently at 1920×1080, 30 fps. Use `PingFang SC` for embedded Chinese and raw strings in `MathTex()`.
- Reuse ML Atlas tokens. Unassigned points are BLUE; clusters are CYAN, PINK, and ORANGE in center-index order; convergence is GREEN; cautions remain INK/ORANGE.
- Preserve the lab convention: squared Euclidean distance, first-center tie behavior, coordinate-wise means, within-group squared-distance total, and a convergence record after repeated assignments.
- Keep K and initialization visible as choices, not hidden truths. Never call the cluster colors ground-truth labels.

## Scene Sequence

### Scene 1: Unlabeled learner points
**Timestamp:** 0:00–0:08

Create axes for accuracy and mean response time, then fade in all 12 BLUE learner points without labels. Ask `没有分组答案，这些学习者有相似模式吗？`. There is deliberately no category key. The learner should first see only measured structure. Preserve the exact points: `(92,28),(88,33),(95,37),(76,64),(72,71),(81,68),(48,31),(43,37),(51,42),(61,88),(56,82),(65,93)`. Keep the graph clean and do not attach invented learner identities. The axes and points persist into initialization.

### Scene 2: Deterministic initialization
**Timestamp:** 0:08–0:16

Replace the question with `设 K=3；固定 seed=3103，从已有点选 3 个中心`. Emphasize that K is selected before the update loop and the seed makes this teaching run replayable. Place larger outlined center markers on the three existing points chosen by the exact seeded shuffle: center 1 CYAN at `(43,37)`, center 2 PINK at `(88,33)`, and center 3 ORANGE at `(56,82)`. Use `中心 1`, `中心 2`, and `中心 3`; do not name semantic learner groups before the algorithm finishes.

### Scene 3: Assign one point to the nearest center
**Timestamp:** 0:16–0:28

Focus learner point `l7=(48,31)`. Draw three color-matched connector segments from this point to all centers. Write raw `r"d^2=(x-c_x)^2+(y-c_y)^2"`. The squared distance is sufficient because square root preserves the ordering. Visually choose the shortest connector and recolor l7 CYAN. Display `到中心 1 最近 → 分到第 1 组`. This action demonstrates the exact nearest-center rule. It does not use a label, and it does not move any center yet. Remove the temporary connectors while retaining the assigned color.

### Scene 4: Assign every point
**Timestamp:** 0:28–0:38

Show `对 12 个点重复“比较距离 → 分组”` and a three-color index legend. Recolor points sequentially according to zero-based assignments `[1,1,1,2,2,2,0,0,0,2,2,2]`: the high-accuracy/short-time trio becomes PINK; l7–l9 become CYAN; the remaining six middle/high-time points become ORANGE. Preserve center positions during assignment. Color is accompanied by a numbered text legend, so it is not the only information channel.

### Scene 5: Recompute centers by two means
**Timestamp:** 0:38–0:52

Write `更新中心：分别计算横坐标与纵坐标的平均`. For the CYAN cluster, show raw `r"c_x=\frac{48+43+51}{3}=47.33"` and `r"c_y=\frac{31+37+42}{3}=36.67"`. Move center 1 to `(47.33,36.67)`. Then move centers 2 and 3 more quickly to `(91.67,32.67)` and `(68.5,77.67)`. Display `组内距离总和：2441 → 1293.5` in GREEN. The movement must follow the means; do not interpolate to different rounded destinations.

### Scene 6: Repeat and draw the objective history
**Timestamp:** 0:52–1:12

Display `继续交替：重新分配，再更新中心`. Add a compact metric chart labeled `组内距离总和`. Draw the first segment from 2441 to 1293.5, briefly pulse every point to represent another full assignment pass, then draw a flat second segment at 1293.5. Display `迭代 2：分组不再改变，中心不再移动`. The chart is a record of this exact run and must not imply that every K-means trace has only two iterations. Keep the colored points and final centers visible while the metric curve appears.

### Scene 7: Convergence condition
**Timestamp:** 1:12–1:20

Bring forward a GREEN `本次运行已收敛` statement. Under it show `中心移动≈0，分配保持不变，组内距离总和=1293.5`. Convergence belongs to this run with K=3 and seed 3103. The criterion is negligible movement together with unchanged assignment, not a human judgment that the colors look plausible. Hold the text long enough to read and then clear the frame.

### Scene 8: Interpretation is still required
**Timestamp:** 1:20–1:28

Finish with `聚类结果不是唯一答案` and reveal three cautions one at a time: `K 的选择会改变分组粒度`; `初始中心会影响搜索路径`; `群组含义仍需要人来解释`. Keep different semantic colors and full text labels. This ending prevents two misconceptions: that unlabeled means aimless, and that convergence proves the only correct grouping. The poster may use this caution frame, while keyframes capture initialization, mean update, and convergence.

## Final Notes

The exact seed and point order are part of the learning contract. The Chinese transcript mirrors all eight cuts. The English summary explains the mechanism but does not localize the silent Chinese frames. Keyframes must be extracted from the approved MP4, never independently redrawn.

## Foundation-to-target directing notes

The opening coordinate plane is a feature space. It is not a map and its axes have different meanings, so do not draw equal-distance circles or imply physical units. Each point is one ordered pair of accuracy and mean response time. Preserve all 12 positions and the ordering used by the deterministic initializer. The absence of labels is pedagogical: no point begins with a cluster color, name, or correct answer. BLUE means “not yet assigned” only in this scene.

Initialization is an algorithm state, not a conclusion. The three larger markers must be visibly different from learner dots through size and outline as well as color. They sit exactly on existing points because the committed seeded shuffle chooses existing observations. Keep the center indices stable: center 0/CYAN begins at `(43,37)`, center 1/PINK at `(88,33)`, and center 2/ORANGE at `(56,82)`. The displayed human labels use one-based names while metadata assignments remain zero-based. Do not silently exchange these conventions.

For squared distance, show all three candidate connections from the same focus point. Squared Euclidean distance adds one horizontal squared difference and one vertical squared difference. The square root can be omitted because it preserves nearest ordering, but the animation must not call the resulting value ordinary Euclidean distance. After the closest center is identified, remove the other connectors before moving on. This establishes one reusable rule that can then be applied to all points without narrating 12 separate calculations.

During full assignment, center markers remain fixed. This separation is essential: assignment chooses a group given centers; recomputation chooses centers given groups. Recolor points sequentially and retain numbered group text so color is not the sole carrier. Do not give the groups semantic names such as “strong” or “slow.” Those interpretations would require human context and are intentionally deferred to the final caution.

During recomputation, average x and y separately. The explicit CYAN calculation uses l7 `(48,31)`, l8 `(43,37)`, and l9 `(51,42)`. The exact sums are 142 and 110, producing `47.33` and `36.67` after rounding only for display. The underlying center in metadata retains full precision. Move the marker after both coordinate means are readable; otherwise the learner sees motion without its source. Update the other centers only after the worked center has established the rule.

The within-group-distance-total curve is evidence about this run. Its first assignment at initialized centers has value 2441. After recomputation it is 1293.5. A repeated assignment and recomputation leaves the value 1293.5. Draw a falling segment and then a flat segment, not a smoothly invented learning curve. A flat final segment pairs with unchanged assignments and zero center movement. Together those observations justify the `converged` state recorded by the utility.

Convergence does not validate K or attach meaning to clusters. Give its criterion a clean frame, then explicitly separate it from interpretation. The closing three cautions correspond to three distinct human decisions: K selects granularity, initialization influences the path and possible local result, and domain interpretation assigns meaning. Keep the language measured; do not claim that K-means discovers true types of learners.

For accessibility, use both center outlines and group text in addition to color. Keep mathematical glyphs large enough at 1080p and use the declared Chinese font for every label. The poster may feature the interpretation cautions because they prevent misuse, while the initialization, mean-update, and convergence keyframes support learners who cannot or prefer not to follow motion. Each keyframe must come from the exact approved render so its state agrees with the transcript timing.
