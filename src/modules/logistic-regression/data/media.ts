import type { LocalizedCopy } from '../../../types/ml.ts'
import type { LogisticMediaAsset } from '../types.ts'

export type LogisticMediaId =
  | 'linear-score-to-sigmoid'
  | 'likelihood-to-bce-gradient'
  | 'log-loss-confident-mistake'
  | 'regularization-confidence-field'

export interface LogisticMediaConfig extends LogisticMediaAsset {
  title: LocalizedCopy
  /** The canonical interaction cells consumed by the Manim source validator. */
  sourceCells: readonly string[]
  /** Immutable release metadata mirrored from public/manim/logistic-regression/metadata.json. */
  package: {
    sha256: string
    posterSha256: string
    sourceManifestSha256: string
    sourceSha256: string
    promptSha256: string
    knowledgeTreeSha256: string
    transcriptZhCNSha256: string
    transcriptEnSha256: string
    durationSeconds: number
    width: number
    height: number
    frameRate: number
    codec: string
    manimVersion: string
  }
}

/** SHA-256 of the complete published media inventory. Keep in sync with the renderer. */
export const logisticMediaMetadataSha256 = '8a448aa406526cbfeb28b13ee84657d13011e7b23115652f5bea77613b6275dc'

const loc = (zhCN: string, en: string): LocalizedCopy => ({
  'zh-CN': zhCN.replaceAll('\\`', '`'),
  en: en.replaceAll('\\`', '`'),
})
const marker = (id: string, startSeconds: number, zhCN: string, en: string) => ({ id, startSeconds, title: loc(zhCN, en) })
const packages: Record<LogisticMediaId, LogisticMediaConfig['package']> = {
  'linear-score-to-sigmoid': { sha256: '2e8bb6d0176ce53370306cd5a35769c09e29f61b22347aae8d6ecf71ea440bf4', posterSha256: '39958b14ef8f9d0b1192fa0d4beb4ceaebcc8dfab1f433b6f4224957b87ddaf4', sourceManifestSha256: 'bd9ebb5315c18640c532f75eb4c1f12e4a990955dff18c121335d473ee4cc619', sourceSha256: '97a64720bb349f1d324c2885bf75c47fa3fba28541bdcbe6e817b46fba5fe75e', promptSha256: '38f3ec7964b5584c92df51b8868586d8cdbc83d49ab518cd202ccd897e18efcc', knowledgeTreeSha256: 'e313b21653edc500a94a68088c70066454963fea5b461273b899070b50629192', transcriptZhCNSha256: '47026cce6ee5c0d1c2be80fc813a79e4788866f0cb3c437de97c49a6c016fc0d', transcriptEnSha256: '2621ac251c69c01f274f5d7693c62863a78f1bd6dde4afaa4b6c63b45a0f785e', durationSeconds: 42.067, width: 1920, height: 1080, frameRate: 30, codec: 'h264', manimVersion: 'Manim Community v0.20.1' },
  'likelihood-to-bce-gradient': { sha256: '26a33f671820ab7a9bf4e8596edab8ddc43ebf89ee7e3eee3d92c69f7e57d8c3', posterSha256: '6b72f5b36a8864db9611b08e0dffe88fa58a51786adf4eb5a89cd1d7f14f9eae', sourceManifestSha256: 'bd9ebb5315c18640c532f75eb4c1f12e4a990955dff18c121335d473ee4cc619', sourceSha256: '97a64720bb349f1d324c2885bf75c47fa3fba28541bdcbe6e817b46fba5fe75e', promptSha256: 'ea63428f78b59c5072166f3b3a40cb8320f7923f45ea423570a10e2f40612d85', knowledgeTreeSha256: 'ef8f24e5ce96a4846cd2f67981690329bbacf7768823f08e58a90dd6b9d720d2', transcriptZhCNSha256: '680db0eb628bf6e7bbd37b685790f66765e86014edccbc210349d32e201bf086', transcriptEnSha256: '33fb3c85d4f231f6e09246cb4dc8b44f3b0d5e04d2374fbb0f97dc85c0d8eaed', durationSeconds: 48, width: 1920, height: 1080, frameRate: 30, codec: 'h264', manimVersion: 'Manim Community v0.20.1' },
  'log-loss-confident-mistake': { sha256: '0005f5522fadca3fedb22fcdfa314460913308831a2afc32f9d59f9bf911b9e8', posterSha256: '997459d06b9606928cfaffa78623dbc4d2d1708b42053ed3b535138142fc6c70', sourceManifestSha256: 'bd9ebb5315c18640c532f75eb4c1f12e4a990955dff18c121335d473ee4cc619', sourceSha256: '97a64720bb349f1d324c2885bf75c47fa3fba28541bdcbe6e817b46fba5fe75e', promptSha256: '430bb60ff6e3093373eec81940f0e87854a310be2dffc30fc3d964e970eafd41', knowledgeTreeSha256: 'e44007dd891f8032b2f599478c760d52de3a39246b02caaeb3513fbb155d5729', transcriptZhCNSha256: '2ff3f3bc588456b3a4129f9f0f6dbdef64745a02ee3d0ca7bcdb031dc4127277', transcriptEnSha256: 'a722222142ed935559745c928e2931886abde62e082ba9863d382b4c0d5f5815', durationSeconds: 37.3, width: 1920, height: 1080, frameRate: 30, codec: 'h264', manimVersion: 'Manim Community v0.20.1' },
  'regularization-confidence-field': { sha256: '84557fbb15486d8568aa7e028afbdef68c13977073678d4d3f8c76653bb27946', posterSha256: '08f0e34f25fd5cc3f64dd776c0e7759bc4192e25b18ae91c28dce5961dc5d0a9', sourceManifestSha256: 'bd9ebb5315c18640c532f75eb4c1f12e4a990955dff18c121335d473ee4cc619', sourceSha256: '97a64720bb349f1d324c2885bf75c47fa3fba28541bdcbe6e817b46fba5fe75e', promptSha256: '444647032232ae7fd3fcb2ffdc2db7811699faea3e21be0c32ed7c0238484d73', knowledgeTreeSha256: '797e6422c53f4f4e02028cb2cd7d90fb092433d3be0ef381f4e44475ac347f52', transcriptZhCNSha256: '777953afb0cb9419b9effdd2ce3621173886abed5b41b1ee748a6332092af20e', transcriptEnSha256: 'b3bf545b6b67a384583150b22d47b3861539e7328f7a523b83520f05eec06baa', durationSeconds: 39.3, width: 1920, height: 1080, frameRate: 30, codec: 'h264', manimVersion: 'Manim Community v0.20.1' },
}
const media = (
  id: LogisticMediaId,
  title: LocalizedCopy,
  alt: LocalizedCopy,
  transcript: LocalizedCopy,
  chapterMarkers: LogisticMediaAsset['chapterMarkers'],
  sourceCells: readonly string[],
): LogisticMediaConfig => ({
  title,
  alt,
  transcript,
  chapterMarkers,
  sourceCells,
  assetPath: `/manim/logistic-regression/${id}.mp4`,
  posterPath: `/manim/logistic-regression/${id}.svg`,
  package: packages[id],
})

/**
 * Typed runtime mirror of the four Phase 29 source packages.  The renderer's
 * published metadata and hash checks are intentionally deferred until all
 * four media packages exist in Plan 29-04; the player receives this stable
 * contract rather than a logistic-specific video implementation.
 */
export const logisticMediaRegistry: Readonly<Record<LogisticMediaId, LogisticMediaConfig>> = {
  'linear-score-to-sigmoid': media(
    'linear-score-to-sigmoid',
    loc('从线性分数到概率', 'From linear score to probability'),
    loc('展示加权线性分数、log-odds、sigmoid 曲线与零分数对应 0.5 概率的动画。', 'An animation of a weighted score, log-odds, the sigmoid curve, and the zero-score probability of 0.5.'),
    loc(
      String.raw`# 从线性分数到概率

## 0:00–0:10

同一条 Banknote 记录先计算 $z=\mathbf{w}^{\top}\mathbf{x}+b$。每个 $w_jx_j$ 和截距都是可检查的贡献。

## 0:10–0:21

$z$ 是 class 1 的 log-odds：$z=\log\frac{p}{1-p}$。它可以是任意实数，因此还不是概率。

## 0:21–0:32

sigmoid 把分数压缩到 $(0,1)$。$z=0$ 恰好对应 $p=0.5$；这是一条默认决策桥梁，不是训练目标。

## 0:32–0:42

极端负分数会给出非常接近 0 的 class 1 概率。视频中的数值由已发布的真实行资产读取；实线点、虚线和数值卡也能在静态海报中表达同一关系。`,
      String.raw`# From linear score to probability

## 0:00–0:10

One Banknote row first computes $z=\mathbf{w}^{\top}\mathbf{x}+b$. Each $w_jx_j$ and the intercept are inspectable contributions.

## 0:10–0:21

$z$ is the class 1 log-odds: $z=\log\frac{p}{1-p}$. It can be any real number, so it is not yet a probability.

## 0:21–0:32

The sigmoid compresses the score to $(0,1)$. $z=0$ maps exactly to $p=0.5$; this is a default decision bridge, not the training objective.

## 0:32–0:42

An extreme negative score produces a class 1 probability very near 0. The displayed values come from the published real-row asset; a solid dot, dashed guide, and numeric card carry the same message in the static poster.`,
    ),
    [
      marker('linear-score-to-sigmoid-1', 0, '加权分数', 'Weighted score'),
      marker('linear-score-to-sigmoid-2', 10, 'log-odds', 'Log-odds'),
      marker('linear-score-to-sigmoid-3', 21, 'sigmoid 与 0.5', 'Sigmoid and 0.5'),
      marker('linear-score-to-sigmoid-4', 32, '极端分数', 'Extreme score'),
    ],
    ['phase29-linear-score', 'phase29-sigmoid-probability'],
  ),
  'likelihood-to-bce-gradient': media(
    'likelihood-to-bce-gradient',
    loc('从似然到 BCE 与梯度', 'From likelihood to BCE and gradient'),
    loc('展示 Bernoulli 概率、概率乘积、对数和、稳定 BCE 与沿负梯度更新的动画。', 'An animation of Bernoulli probabilities, product likelihood, log sums, stable BCE, and an update opposite the gradient.'),
    loc(
      String.raw`# 从似然到 BCE 与梯度

## 0:00–0:12

一行的 Bernoulli 概率是 $p^y(1-p)^{1-y}$。这里每个 $q_i$ 表示模型分给该行已观察类别的概率。

## 0:12–0:24

多行相乘得到 $prod_iq_i=0.008289470886818511$。取对数把它变成 $sum_i\log q_i=-4.79276913734611$；乘积会下溢，而和仍可逐项累加。

## 0:24–0:36

最大化 log-likelihood 等价于最小化负 log-likelihood。稳定的单行形式是 $\ell(z,y)=\operatorname{softplus}(z)-yz$；固定梯度检查中的平均目标为 $L(\theta)=0.7455450279170539$。

## 0:36–0:48

一行系数梯度贡献是 $(p_i-y_i)x_i$，批量后为 $X^\top(p-y)/n$。固定检查里第一个分量为 $g_1=0.40722679415570556$，使用 $h=10^{-6}$ 的中心差分核对；参数沿 $-\nabla L$ 更新。`,
      String.raw`# From likelihood to BCE and gradient

## 0:00–0:12

One Bernoulli outcome has probability $p^y(1-p)^{1-y}$. Each $q_i$ is the probability assigned by the model to that row’s observed class.

## 0:12–0:24

Multiplying rows gives $prod_iq_i=0.008289470886818511$. Taking logs gives $sum_i\log q_i=-4.79276913734611$; products can underflow while sums remain incrementally additive.

## 0:24–0:36

Maximizing log-likelihood equals minimizing negative log-likelihood. The stable row form is $\ell(z,y)=\operatorname{softplus}(z)-yz$; the fixed gradient-check mean objective is $L(\theta)=0.7455450279170539$.

## 0:36–0:48

One row contributes $(p_i-y_i)x_i$ to the coefficient gradient, and batching gives $X^\top(p-y)/n$. In the fixed check, $g_1=0.40722679415570556$ and a central difference uses $h=10^{-6}$; parameters update along $-\nabla L$.`,
    ),
    [
      marker('likelihood-to-bce-gradient-1', 0, '一行 Bernoulli 概率', 'One Bernoulli probability'),
      marker('likelihood-to-bce-gradient-2', 12, '乘积与对数和', 'Product and log sum'),
      marker('likelihood-to-bce-gradient-3', 24, '稳定 BCE', 'Stable BCE'),
      marker('likelihood-to-bce-gradient-4', 36, '批量梯度与更新', 'Batch gradient and update'),
    ],
    ['phase29-threshold-decisions', 'phase29-log-loss'],
  ),
  'log-loss-confident-mistake': media(
    'log-loss-confident-mistake',
    loc('稳定损失与梯度检查', 'Stable loss and gradient check'),
    loc('展示 logit 域的二元交叉熵、错误置信度的损失曲线和中心差分梯度检查的动画。', 'An animation of logit-domain binary cross-entropy, the loss curve for a wrong confident score, and a central-difference gradient check.'),
    loc(
      String.raw`# 自信错误、稳定 BCE 与梯度信号

## 0:00–0:10

对一个标签 $y\in\{0,1\}$ 和 logit $z$，稳定的单行负对数似然写作 $\ell(z,y)=\operatorname{softplus}(z)-yz$。它直接在 logit 域计算；只要 $z$ 有限，结果就保持有限，不需要先把概率裁剪到 0 或 1。

## 0:10–0:20

冻结的 validation 第 919 行有 $y=1$，但模型给出 $z=-4.1665$ 和 $p=0.01527$。它把很小的 class 1 概率交给了已观察到的 class 1，所以 $\ell=4.1819$。实线点、虚线引导线和数值卡共同表示这种高损失，不依赖颜色。

## 0:20–0:29

对 logit 的导数是 $\partial\ell/\partial z=p-y$。把该残差信号乘以标准化特征向量，得到一行的系数贡献 $\nabla_w\ell=(p-y)x$。批量梯度累积后，参数沿 $-\nabla_wL$ 更新；这不是对单个样本单独“修复”的承诺。

## 0:29–0:38

训练前可用中心差分核对解析梯度：$[L(\theta+h e_j)-L(\theta-h e_j)]/(2h)\approx\partial L/\partial\theta_j$。发布的检查使用 $h=10^{-6}$，最大分量误差为 $7.45\times10^{-11}$。静态海报保留损失公式、高损失点、梯度箭头和这张核对卡，因此减少动态效果或视频加载失败时仍能阅读机制。`,
      String.raw`# Confident mistake, stable BCE, and gradient signal

## 0:00–0:10

For a label $y\in\{0,1\}$ and logit $z$, the stable row negative log-likelihood is $\ell(z,y)=\operatorname{softplus}(z)-yz$. It is evaluated in the logit domain; when $z$ is finite, the result stays finite without first clipping a probability to 0 or 1.

## 0:10–0:20

Frozen validation row 919 has $y=1$, while the model gives $z=-4.1665$ and $p=0.01527$. It assigns a very small class 1 probability to the observed class 1, so $\ell=4.1819$. A solid point, dashed guide, and numeric card express the high loss without relying on color.

## 0:20–0:29

The logit derivative is $\partial\ell/\partial z=p-y$. Multiplying that residual signal by the standardized feature vector gives one row’s coefficient contribution, $\nabla_w\ell=(p-y)x$. After batch accumulation, parameters update along $-\nabla_wL$; this does not promise to repair any one row in isolation.

## 0:29–0:38

Before training, central difference can check the analytic gradient: $[L(\theta+h e_j)-L(\theta-h e_j)]/(2h)\approx\partial L/\partial\theta_j$. The published check uses $h=10^{-6}$ and has maximum component error $7.45\times10^{-11}$. The static poster retains the loss formula, high-loss point, gradient arrow, and agreement card, so the mechanism remains readable with reduced motion or a video failure.`,
    ),
    [
      marker('log-loss-confident-mistake-1', 0, '稳定 logit 损失', 'Stable logit loss'),
      marker('log-loss-confident-mistake-2', 10, '自信错误', 'Confident mistake'),
      marker('log-loss-confident-mistake-3', 20, '中心差分', 'Central difference'),
      marker('log-loss-confident-mistake-4', 29, '对照梯度', 'Compare gradients'),
    ],
    ['phase29-log-loss'],
  ),
  'regularization-confidence-field': media(
    'regularization-confidence-field',
    loc('L2 改变目标函数', 'L2 changes the objective'),
    loc('展示未正则化 BCE 与加入 L2 项后的不同目标函数和参数状态的动画。', 'An animation contrasting unregularized BCE with a different objective that includes an L2 term and a distinct parameter state.'),
    loc(
      String.raw`# 对齐的未正则化对照与 L2 的新目标函数

## 0:00–0:10

先固定 train-only 标准化、特征顺序和未正则化的稳定 BCE：$L_{BCE}=\operatorname{mean}(\operatorname{softplus}(z)-yz)$。scratch 训练在第 $90542$ 步以 gradient-norm 停止，末端 BCE 为 $0.011867429046995634$。这是比较的基线，而不是库的隐含默认值。

## 0:10–0:20

将 scratch 和 scikit-learn 对齐：相同预处理、截距处理、特征顺序、无正则化目标、停止规则与容差；这里的 library 配置为 \`lbfgs\`、$C=\infty$、$\mathrm{tol}=10^{-12}$。得到 $|\Delta_\theta|_{max}=0.00015996734427758952$ 与 $|\Delta_p|_{max}=8.860994619164231\times10^{-7}$。这些小差异只说明这两个已声明配置的数值对齐。

## 0:20–0:29

之后才改变问题：$L_{L2}=L_{BCE}+\lambda\lVert w\rVert_2^2/2$，其中 $\lambda=0.05$。发布的 L2 目标值为 $0.3463182734496942$，并且截距不受惩罚。系数条形变短和虚线置信场表达的是新目标的结果，不是“L2 总会更好”的结论。

## 0:29–0:38

公平比较先明确数据、预处理、目标函数、参数和停止规则。同一数据不意味着同一目标函数；这里也不把系数或置信场解释成因果效应。静态海报保留两条目标函数、对齐读数、实线/虚线边界和截距标签，因此减少动态效果或视频失败时仍可复查。`,
      String.raw`# Aligned unregularized parity, then an L2 objective change

## 0:00–0:10

First fix train-only standardization, feature order, and the unregularized stable BCE: $L_{BCE}=\operatorname{mean}(\operatorname{softplus}(z)-yz)$. Scratch training stops on the gradient norm at iteration $90542$, with terminal BCE $0.011867429046995634$. This is the comparison baseline, not an implicit library default.

## 0:10–0:20

Align scratch and scikit-learn: the same preprocessing, intercept treatment, feature order, unregularized objective, stopping rule, and tolerance. The declared library configuration is \`lbfgs\`, $C=\infty$, and $\mathrm{tol}=10^{-12}$. It yields $|\Delta_\theta|_{max}=0.00015996734427758952$ and $|\Delta_p|_{max}=8.860994619164231\times10^{-7}$. Those small differences establish numerical agreement only for the declared configurations.

## 0:20–0:29

Only then does the problem change: $L_{L2}=L_{BCE}+\lambda\lVert w\rVert_2^2/2$, with $\lambda=0.05$. The published L2 objective is $0.3463182734496942$, and the intercept is not penalized. Shorter coefficient bars and a dashed confidence field show the result of the new objective, not that L2 is always better.

## 0:29–0:38

A fair comparison states data, preprocessing, objective, parameters, and stopping rule first. The same data do not imply the same objective, and neither coefficients nor confidence fields are causal effects here. The static poster retains both objectives, parity readings, solid/dashed fields, and the intercept label for reduced motion and media failure.`,
    ),
    [
      marker('regularization-confidence-field-1', 0, '固定基线目标', 'Fixed baseline objective'),
      marker('regularization-confidence-field-2', 10, '加入 L2 项', 'Add the L2 term'),
      marker('regularization-confidence-field-3', 20, '系数与截距', 'Coefficients and intercept'),
      marker('regularization-confidence-field-4', 29, '公平对照', 'Fair comparison'),
    ],
    ['phase29-regularization'],
  ),
}
