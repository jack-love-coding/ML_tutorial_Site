# Numerical Methods Batch 4 — ImageGen Prompt Record

## Shared Banknote optimization / diagnostics illustration

- Tool mode: OpenAI Codex built-in `image_gen` (default built-in mode; no CLI, API runner, SVG, HTML, or vector placeholder)
- Use case: `scientific-educational`
- Generated: 2026-07-22
- Source output name: `exec-99ca7df7-8eef-4ddc-a2a6-dbb69dbeab28.png`
- Source output path: `/Users/jackky/.codex/generated_images/019f89be-463a-7e82-8346-689fcefbbae5/exec-99ca7df7-8eef-4ddc-a2a6-dbb69dbeab28.png`
- Source dimensions: 1672×941 RGB PNG
- Published path: `public/math-lab/numerical-methods/banknote-optimization-diagnostics.png`
- Published dimensions: 1664×936 RGB PNG (exact 16:9; resized once from the generated source with macOS `sips`)
- Published SHA-256: `e3dba524c2c796dc6eca6c43362064df799b1e826926a52cc86a36fa0e466b40`

### Final prompt

> Use case: scientific-educational
>
> Asset type: shared course-page infographic for a bilingual machine-learning numerical methods lesson
>
> Primary request: Create one polished scientific educational infographic in Simplified Chinese that teaches the exact Banknote logistic-regression chain: train-only feature standardization, fixed-step versus Armijo backtracking, and training diagnostics.
>
> Scene/backdrop: deep dark navy-to-slate background, visually compatible with a rigorous university ML course.
>
> Style/medium: crisp vector-like scientific infographic rendered as a raster PNG; clean axes, exact plotted annotations, thin dividers, no decorative illustration.
>
> Composition/framing: exact landscape 16:9 canvas, 1536×864. One concise title band at top and three equal panels arranged left-to-right. Generous margins and whitespace. All text large and legible at course-page scale.
>
> Color palette: dark navy base, white primary text, cyan for standardized/Armijo, amber for raw/fixed comparisons, coral for warnings or rejected trial. Color is never the only carrier: use the required line styles and marker shapes.
>
> Text (verbatim, render only this text and no extra words):
>
> Title: “尺度 · 步长 · 诊断”
>
> Left panel heading: “① 尺度”
>
> Left labels:
>
> “原始特征”
>
> “训练集标准化”
>
> “仅拟合训练集 n=960”
>
> “μ=[0.469,1.978,1.320,−1.142]”
>
> “σ=[2.805,5.814,4.235,2.073]”
>
> “固定步长 α=4”
>
> “□ iter 112 · 验证耐心”
>
> “○ iter 484 · 梯度收敛”
>
> Middle panel heading: “② 步长”
>
> Middle labels:
>
> “固定 32”
>
> “虚线 □”
>
> “Armijo 32→16”
>
> “回溯 1 次”
>
> “实线 ○”
>
> “最佳 iter 13 · val 0.058853”
>
> “终点 iter 73 · 验证耐心”
>
> “最佳=终点 iter 48”
>
> “val 0.068247 · ||g|| 7.017e−6”
>
> Right panel heading: “③ 诊断”
>
> Right labels:
>
> “训练 BCE”
>
> “验证 BCE”
>
> “梯度范数”
>
> “◇ 最佳验证”
>
> “□ 模型选择终点”
>
> “○ 数学收敛终点”
>
> “固定 32：train 0.054023 · val 0.082850 · ||g|| 0.034620”
>
> “Armijo：train 0.044635 · val 0.068247 · ||g|| 7.017e−6”
>
> “迭代”
>
> Panel details:
>
> 1. Left panel: show the same four Banknote feature channels before and after train-only standardization. Raw channels have visibly unequal spread; standardized channels align around a shared zero baseline. Put the exact μ and σ arrays beside a compact transformation arrow. Show that both comparisons use fixed α=4. End the raw route with an amber square at iter 112 labeled 验证耐心, and the standardized route with a cyan circle at iter 484 labeled 梯度收敛.
> 2. Middle panel: compare two paths from the same start. The fixed-32 path is amber, dashed, and uses square markers; it overshoots, marks a diamond best point at iter 13, and ends with a square at iter 73. The Armijo path is cyan, solid, and uses circle markers. Clearly show a coral rejected trial labeled 32 and an accepted cyan step labeled 16 with “回溯 1 次”. Mark the circle/diamond combined endpoint at iter 48.
> 3. Right panel: one compact diagnostic chart with iteration on the horizontal axis. Show train BCE, validation BCE, and gradient norm as three clearly distinguishable curves/lanes, with a diamond for best validation, a square for model-selection terminal, and a circle for mathematical-convergence terminal. Place the two exact terminal readout lines below or beside the plot. Do not add axis tick values or data values beyond the verbatim list.
>
> Scientific constraints: every displayed number must come from the verbatim list above; do not invent or interpolate printed values. Keep fixed-32 and Armijo curve shapes plausible but schematic between exact annotated anchors. Make the hierarchy calm, precise, and immediately scannable.
>
> Constraints: Simplified Chinese labels only except the required mathematical tokens “iter”, “val”, “train”, “Armijo”, “BCE”, “n”, “μ”, “σ”, “α”, and “||g||”. Exact marker semantics: square = model-selection/fixed terminal, circle = mathematical-convergence/Armijo terminal, diamond = best validation. Fixed path dashed; Armijo path solid.
>
> Avoid: any extra text or numbers; invented values; people; robots; banknotes or currency imagery; logos; watermark; signatures; remote-brand marks; photorealism; 3D perspective; decorative icons; tiny dense paragraphs; gradients behind text; excessive glow; color-only distinctions; UI chrome; legends that contradict marker semantics.

## Review note

The selected output passed visual inspection after publication at 1664×936: the three-panel hierarchy is legible; the short Chinese labels, locked numerical anchors, fixed `32` versus Armijo `32→16` event, train/validation BCE, gradient norm, diamond/square/circle markers, and dashed/solid route semantics are visible; and no person, robot, banknote imagery, logo, signature, or watermark appears. The plotted paths between printed anchors are intentionally schematic, but no unlisted number is printed.

The generated pixels are not the sole carrier of meaning. Both `optimization` and `training-diagnostics` bind the same local asset and provide complete bilingual `alt`, `transcript`, `caption`, and section copy. Those fallbacks spell out the train-only scale contract, exact step/backtrack event, exact best/terminal anchors, typed terminal meanings, and non-color marker/line semantics.
