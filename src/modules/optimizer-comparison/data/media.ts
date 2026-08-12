import type { LocalizedCopy } from '../../../types/ml'

/**
 * Generated runtime mirror of public/manim/optimizer-comparison/metadata.json.
 *
 * `tests/optimizer-course-media.test.mjs` validates the paths, hashes, markers,
 * and published transcript sources against the package. Keep this hash in sync
 * when `render_optimizer_comparison.py` republishes the metadata.
 */
export const optimizerMediaMetadataSha256 = 'a1aca140663499a1cf1ce5839b07b87d825a6a096cb458d1bba06d4b763a7b80'

export type OptimizerMediaKind = 'sgd' | 'momentum' | 'rmsprop' | 'adam'

export interface OptimizerMediaConfig {
  assetPath: string
  posterPath: string
  title: LocalizedCopy
  alt: LocalizedCopy
  chapterMarkers: readonly { id: string; startSeconds: number; title: LocalizedCopy }[]
  transcript: LocalizedCopy
  package: {
    assetId: string
    sha256: string
    posterSha256: string
    transcriptZhCN: { path: string; sha256: string }
    transcriptEn: { path: string; sha256: string }
  }
}

// String.raw retains TeX backslashes; remove only the source-level escapes that
// let the generated template literals include Markdown code delimiters.
const loc = (zhCN: string, en: string): LocalizedCopy => ({
  'zh-CN': zhCN.replaceAll('\\`', '`'),
  en: en.replaceAll('\\`', '`'),
})
const markers = (kind: OptimizerMediaKind, titles: readonly [LocalizedCopy, LocalizedCopy, LocalizedCopy, LocalizedCopy, LocalizedCopy]) =>
  [0, 9, 18, 27, 35].map((startSeconds, index) => ({ id: `${kind}-${index + 1}`, startSeconds, title: titles[index]! }))

const transcripts = {
  sgd: loc(
    String.raw`# SGD 状态动画：中文字幕稿

视频无配音；以下文本与分段按钮、海报共同构成完整教学信息。

## 0:00–0:09

等高线表示损失地形。圆形标记是当前参数位置；\`g_t\` 是当前位置的梯度，指向局部上升最快方向。

## 0:09–0:18

SGD 使用 \`\theta_{t+1}=\theta_t-\eta g_t\`，沿负梯度走一步。右侧数字来自共享引擎的固定实用设置轨迹，只说明这一可复现实验。

## 0:18–0:27

圆形标记沿路径下降。学习率 \`\eta\` 决定这次更新的长度；SGD 此刻只使用当前梯度，不保存额外的历史量。

## 0:27–0:36

星形是较低损失位置。不同优化器会因为保存的状态不同而提出不同的下一步；没有一个优化器对所有问题都必然最好。`,
    String.raw`# SGD state animation: English transcript

The video is language-neutral. This timed text, the markers, and the poster preserve the full teaching message.

## 0:00–0:09

Contours are a loss landscape. The circle is the current parameter position, and \`g_t\` points in the locally steepest uphill direction.

## 0:09–0:18

SGD uses \`\theta_{t+1}=\theta_t-\eta g_t\`: take one step opposite the gradient. The card is a reproducible shared-engine practical-trace anchor, not a universal recommendation.

## 0:18–0:27

The circle moves downhill. \`\eta\` controls the step length; at this moment SGD keeps no additional history beyond the current gradient.

## 0:27–0:36

The star marks a lower-loss position. Different stored state can propose a different next step, and no optimizer is best for every problem.`,
  ),
  momentum: loc(
    String.raw`# Momentum 状态动画：中文字幕稿

视频无配音；以下文本与分段按钮、海报共同构成完整教学信息。

## 0:00–0:09

方形标记是当前参数位置。Momentum 除了当前梯度，还维护速度 \`v_t\`。

## 0:09–0:18

\`v_t=0.9v_{t-1}+g_t\` 把先前方向和当前梯度结合，再用 \`\theta_{t+1}=\theta_t-\eta v_t\` 更新。数字卡来自共享引擎的固定轨迹。

## 0:18–0:27

方形沿谷底转弯时，速度会保留一部分先前方向。这有助于理解“累积”不是把梯度简单染成另一种颜色。

## 0:27–0:36

星形表示较低损失。动量状态会改变下一步，但是否合适仍取决于任务、学习率和比较规则。`,
    String.raw`# Momentum state animation: English transcript

The video is language-neutral. This timed text, markers, and poster are the complete fallback.

## 0:00–0:09

The square is the current parameter position. Momentum stores a velocity \`v_t\` as well as the current gradient.

## 0:09–0:18

\`v_t=0.9v_{t-1}+g_t\` combines earlier direction with the current gradient; \`\theta_{t+1}=\theta_t-\eta v_t\` then updates parameters. The card is a fixed shared-engine trace.

## 0:18–0:27

As the square turns through the valley, velocity retains part of the earlier direction. Accumulation is a state rule, not just a new color.

## 0:27–0:36

The star marks lower loss. Momentum state changes the next step, but suitability still depends on task, learning rate, and comparison policy.`,
  ),
  rmsprop: loc(
    String.raw`# RMSProp 状态动画：中文字幕稿

视频无配音；以下文本与分段按钮、海报共同构成完整教学信息。

## 0:00–0:09

三角形是当前参数位置。RMSProp 记录梯度平方的历史 \`s_t\`，用它估计不同方向的尺度。

## 0:09–0:18

\`s_t=0.95s_{t-1}+0.05g_t^2\`，更新再除以 \`\sqrt{s_t}+\epsilon\`。右侧数字是共享引擎的固定实用设置锚点。

## 0:18–0:27

三角形沿路径前进。较大的平方梯度历史会缩小对应的有效步长；这解释的是尺度调节，不是对所有地形的保证。

## 0:27–0:36

星形是较低损失位置。状态改变下一步，学习者仍应在预先说明的相同条件下比较结果。`,
    String.raw`# RMSProp state animation: English transcript

The video is language-neutral. This timed text, markers, and poster are the complete fallback.

## 0:00–0:09

The triangle is the current parameter position. RMSProp stores squared-gradient history \`s_t\` to estimate scale in different directions.

## 0:09–0:18

\`s_t=0.95s_{t-1}+0.05g_t^2\`; the update divides by \`\sqrt{s_t}+\epsilon\`. The numerical card is the shared-engine fixed practical-trace anchor.

## 0:18–0:27

The triangle moves along its path. Larger squared-gradient history reduces the effective step in that direction; it is a scale adjustment, not a guarantee for every landscape.

## 0:27–0:36

The star is lower loss. State changes the next step, while fair comparison still needs predeclared conditions.`,
  ),
  adam: loc(
    String.raw`# Adam 状态动画：中文字幕稿

视频无配音；以下文本与分段按钮、海报共同构成完整教学信息。

## 0:00–0:09

菱形是当前参数位置。Adam 同时维护一阶矩 \`m_t\`、二阶矩 \`v_t\` 和时间步 \`t\`。

## 0:09–0:18

经偏差校正得到 \`\hat m_t\` 和 \`\hat v_t\`，再用 \`\theta_{t+1}=\theta_t-\eta\hat m_t/(\sqrt{\hat v_t}+\epsilon)\` 更新。数字锚点来自共享引擎。

## 0:18–0:27

菱形沿路径下降。时间步使早期矩估计可被校正；这段动画只解释优化状态，不把 Adam、L2 和 AdamW 混为一谈。

## 0:27–0:36

星形表示较低损失。状态改变下一步；任何“更好”的结论都必须说明数据、预算和比较设置。`,
    String.raw`# Adam state animation: English transcript

The video is language-neutral. This timed text, markers, and poster are the complete fallback.

## 0:00–0:09

The diamond is the current parameter position. Adam maintains a first moment \`m_t\`, a second moment \`v_t\`, and time step \`t\`.

## 0:09–0:18

Bias correction yields \`\hat m_t\` and \`\hat v_t\`, then \`\theta_{t+1}=\theta_t-\eta\hat m_t/(\sqrt{\hat v_t}+\epsilon)\` updates parameters. The card comes from the shared engine.

## 0:18–0:27

The diamond moves downhill. The time step corrects early moment estimates. This animation explains optimizer state only; it does not conflate Adam, L2, and AdamW.

## 0:27–0:36

The star marks lower loss. State changes the next step; any stronger claim needs stated data, budget, and comparison settings.`,
  ),
} as const

export const optimizerMediaRegistry: Readonly<Record<OptimizerMediaKind, OptimizerMediaConfig>> = {
  sgd: {
    assetPath: '/manim/optimizer-comparison/sgd-state.mp4', posterPath: '/manim/optimizer-comparison/sgd-state.svg',
    title: loc('SGD 状态动画', 'SGD state animation'), alt: loc('SGD 在损失地形上的状态更新动画', 'SGD state update on a loss landscape'),
    chapterMarkers: markers('sgd', [loc('损失地形与当前梯度', 'Loss surface and current gradient'), loc('沿负梯度更新', 'Update opposite the gradient'), loc('学习率决定步长', 'Learning rate sets the step'), loc('无额外历史状态', 'No additional stored state'), loc('回顾：没有通用赢家', 'Review: no universal winner')]),
    transcript: transcripts.sgd,
    package: { assetId: 'sgd-state', sha256: '18fdb539cbd95b94f2c154d091dd763981555b5b3d6e711a341dbd55701a29ea', posterSha256: 'c1962db01ca6363e750c9f9e8abd91ebfb61464c1c41c8610bf69867b5a9b239', transcriptZhCN: { path: 'docs/curriculum-v3/optimizer-comparison/manim/sgd-state-transcript.zh-CN.md', sha256: '9ba97a8ddb604f80f6598f286c2356c77dc66d64af48952f32402e1f1002d7cc' }, transcriptEn: { path: 'docs/curriculum-v3/optimizer-comparison/manim/sgd-state-transcript.en.md', sha256: '95a80d5ab5519c5a10f0ea7c410b6496a0cf44f54b71a47914ab64467ed63d83' } },
  },
  momentum: {
    assetPath: '/manim/optimizer-comparison/momentum-state.mp4', posterPath: '/manim/optimizer-comparison/momentum-state.svg',
    title: loc('Momentum 状态动画', 'Momentum state animation'), alt: loc('Momentum 在峡谷损失地形上的速度状态动画', 'Momentum velocity state on a valley loss landscape'),
    chapterMarkers: markers('momentum', [loc('当前位置与速度', 'Current position and velocity'), loc('速度累积更新', 'Velocity accumulation update'), loc('保留先前方向', 'Retaining earlier direction'), loc('状态改变下一步', 'State changes the next step'), loc('回顾比较条件', 'Review comparison conditions')]),
    transcript: transcripts.momentum,
    package: { assetId: 'momentum-state', sha256: '3191058c40615263c36adf8c3800e5e20c8dbb91d5b7c97143d3161506e70003', posterSha256: 'a9acfa3e7dd2b7afa28cbf55c68ecc096bc8c915a0a455d832d14542e90a9f8f', transcriptZhCN: { path: 'docs/curriculum-v3/optimizer-comparison/manim/momentum-state-transcript.zh-CN.md', sha256: 'e0bbe11f1482b0b96d5872ddcc80b31bcb3106afdc64ff9c8d46253ed7eb78d1' }, transcriptEn: { path: 'docs/curriculum-v3/optimizer-comparison/manim/momentum-state-transcript.en.md', sha256: '30b4910ce8bde745e9849614ebe4a4563168f6d4a019961fae751cd724ad70b9' } },
  },
  rmsprop: {
    assetPath: '/manim/optimizer-comparison/rmsprop-state.mp4', posterPath: '/manim/optimizer-comparison/rmsprop-state.svg',
    title: loc('RMSProp 状态动画', 'RMSProp state animation'), alt: loc('RMSProp 在损失地形上的平方梯度状态动画', 'RMSProp squared-gradient state on a loss landscape'),
    chapterMarkers: markers('rmsprop', [loc('当前位置与平方梯度历史', 'Position and squared-gradient history'), loc('RMSProp 分母', 'RMSProp denominator'), loc('按方向调节步长', 'Direction-specific step scale'), loc('状态改变下一步', 'State changes the next step'), loc('回顾公平比较', 'Review fair comparison')]),
    transcript: transcripts.rmsprop,
    package: { assetId: 'rmsprop-state', sha256: 'e43bba76514e442ab015f17e6d31b08652887d3add85c1bc3d6ebdaac7f27b01', posterSha256: '73924e6eb0b75182d7340f762137d7f98a8a7bf5b27880c709d9d5c9b9fa0fd6', transcriptZhCN: { path: 'docs/curriculum-v3/optimizer-comparison/manim/rmsprop-state-transcript.zh-CN.md', sha256: 'bc91c66435a2c5c9332f61a3f910973bb386726cb8f553853b25a04596ba8e1a' }, transcriptEn: { path: 'docs/curriculum-v3/optimizer-comparison/manim/rmsprop-state-transcript.en.md', sha256: 'e269a60d3925bc0950d620fc7ace3891bc5f64d49819eedda30397ef2a5a10df' } },
  },
  adam: {
    assetPath: '/manim/optimizer-comparison/adam-state.mp4', posterPath: '/manim/optimizer-comparison/adam-state.svg',
    title: loc('Adam 状态动画', 'Adam state animation'), alt: loc('Adam 在损失地形上的一阶矩和二阶矩状态动画', 'Adam first- and second-moment state on a loss landscape'),
    chapterMarkers: markers('adam', [loc('当前位置与两个矩', 'Current position and both moments'), loc('偏差校正更新', 'Bias-corrected update'), loc('时间步校正早期估计', 'Time step corrects early estimates'), loc('状态与衰减分开', 'State and decay stay separate'), loc('回顾比较边界', 'Review comparison boundaries')]),
    transcript: transcripts.adam,
    package: { assetId: 'adam-state', sha256: '3d5c74cf91855a0ce77ca6638be4c2fb0cf8dc53f3c51d2e533c0e892ae95b32', posterSha256: '5f6bb1f942b7a34696cdb93ba0f8ff13117a4fa28d2d5b84d6754a816d2786df', transcriptZhCN: { path: 'docs/curriculum-v3/optimizer-comparison/manim/adam-state-transcript.zh-CN.md', sha256: 'eeda1f145332b9b16710fad4e3169b51c455864391398e2c97578f4038fb6222' }, transcriptEn: { path: 'docs/curriculum-v3/optimizer-comparison/manim/adam-state-transcript.en.md', sha256: '6747caedb5d1025ed43b0be234caa798856d9ffd471d01efe21c78202eb00e11' } },
  },
}
