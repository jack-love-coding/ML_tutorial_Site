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
}

const loc = (zhCN: string, en: string): LocalizedCopy => ({ 'zh-CN': zhCN, en })
const marker = (id: string, startSeconds: number, zhCN: string, en: string) => ({ id, startSeconds, title: loc(zhCN, en) })
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

同一条 Banknote 记录先计算 $z=\mathbf{w}^{\top}\mathbf{x}+b$。每个 $w_jx_j$ 是可检查的贡献，截距也参与总分。

## 0:10–0:21

$z$ 是 class 1 的 log-odds：$z=\log\frac{p}{1-p}$。它可以为任意实数，因此还不是概率。

## 0:21–0:32

sigmoid 把分数压缩到 $(0,1)$。$z=0$ 正好对应 $p=0.5$；这是一条默认决策桥梁，不是训练目标。

## 0:32–0:42

极端负分数会给出非常接近 0 的 class 1 概率。视频中的数值由已发布的真实行资产读取。`,
      String.raw`# From linear score to probability

## 0:00–0:10

One Banknote row first computes $z=\mathbf{w}^{\top}\mathbf{x}+b$. Each $w_jx_j$ and the intercept are inspectable contributions.

## 0:10–0:21

$z$ is the class 1 log-odds: $z=\log\frac{p}{1-p}$. It can be any real number, so it is not yet a probability.

## 0:21–0:32

The sigmoid compresses the score to $(0,1)$. $z=0$ maps exactly to $p=0.5$; this is a default decision bridge, not the training objective.

## 0:32–0:42

An extreme negative score produces a class 1 probability very near 0. The displayed values come from the published real-row asset.`,
    ),
    [
      marker('score-1', 0, '加权分数', 'Weighted score'),
      marker('score-2', 10, 'log-odds', 'Log-odds'),
      marker('score-3', 21, 'sigmoid 与 0.5', 'Sigmoid and 0.5'),
      marker('score-4', 32, '极端分数', 'Extreme score'),
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

一行的 Bernoulli 概率是 $p^y(1-p)^{1-y}$。把多行相乘得到数据集似然。

## 0:12–0:24

很多小概率连乘会遇到浮点下溢。取对数把乘积转成可累加的 $sum_i\log q_i$，而最大化 log-likelihood 等价于最小化其负值。

## 0:24–0:36

稳定的单行损失写成 $\operatorname{softplus}(z)-yz$，直接从 logit 计算，避免先把极端值变成 0 或 1。

## 0:36–0:48

一行梯度贡献是 $(p-y)x$；批量后得到 $X^\top(p-y)/n$。更新沿 $-\nabla L$ 方向移动。`,
      String.raw`# From likelihood to BCE and gradient

## 0:00–0:12

One Bernoulli outcome has probability $p^y(1-p)^{1-y}$. Multiplying rows gives a dataset likelihood.

## 0:12–0:24

Multiplying many small probabilities can underflow. Logs turn the product into the additive $sum_i\log q_i$, and maximizing log-likelihood equals minimizing its negative.

## 0:24–0:36

The stable row loss is $\operatorname{softplus}(z)-yz$. It computes from the logit and avoids first turning extreme values into 0 or 1.

## 0:36–0:48

One row contributes $(p-y)x$; batching gives $X^\top(p-y)/n$. Parameters move in the $-\nabla L$ direction.`,
    ),
    [
      marker('likelihood-1', 0, '一行 Bernoulli 概率', 'One Bernoulli probability'),
      marker('likelihood-2', 12, '乘积与对数和', 'Product and log sum'),
      marker('likelihood-3', 24, '稳定 BCE', 'Stable BCE'),
      marker('likelihood-4', 36, '批量梯度与更新', 'Batch gradient and update'),
    ],
    ['phase29-threshold-decisions', 'phase29-log-loss'],
  ),
  'log-loss-confident-mistake': media(
    'log-loss-confident-mistake',
    loc('稳定损失与梯度检查', 'Stable loss and gradient check'),
    loc('展示 logit 域的二元交叉熵、错误置信度的损失曲线和中心差分梯度检查的动画。', 'An animation of logit-domain binary cross-entropy, the loss curve for a wrong confident score, and a central-difference gradient check.'),
    loc(
      String.raw`# 稳定损失与梯度检查

## 0:00–0:10

$\ell(z,y)=\operatorname{softplus}(z)-yz$ 直接使用 logit。它与负 log-likelihood 相同，但在极端分数下仍保持有限。

## 0:10–0:20

当模型朝错误方向给出更自信的分数时，损失增加。曲线、虚线和点共同标出这个关系，不依赖颜色判断。

## 0:20–0:29

中心差分以 $[L(\theta+h e_j)-L(\theta-h e_j)]/(2h)$ 近似一个导数。

## 0:29–0:38

把数值近似与解析梯度比较，是在训练前检查 $(p-y)x$ 推导是否实现正确的一种方法。`,
      String.raw`# Stable loss and gradient check

## 0:00–0:10

$\ell(z,y)=\operatorname{softplus}(z)-yz$ uses the logit directly. It equals negative log-likelihood while staying finite for extreme scores.

## 0:10–0:20

Loss rises when the score grows more confident in the wrong direction. A curve, dashed guide, and point show the relationship without relying on color.

## 0:20–0:29

Central difference approximates one derivative with $[L(\theta+h e_j)-L(\theta-h e_j)]/(2h)$.

## 0:29–0:38

Comparing the numeric approximation with the analytic gradient checks that the $(p-y)x$ derivation was implemented correctly before training.`,
    ),
    [
      marker('loss-1', 0, '稳定 logit 损失', 'Stable logit loss'),
      marker('loss-2', 10, '自信错误', 'Confident mistake'),
      marker('loss-3', 20, '中心差分', 'Central difference'),
      marker('loss-4', 29, '对照梯度', 'Compare gradients'),
    ],
    ['phase29-log-loss'],
  ),
  'regularization-confidence-field': media(
    'regularization-confidence-field',
    loc('L2 改变目标函数', 'L2 changes the objective'),
    loc('展示未正则化 BCE 与加入 L2 项后的不同目标函数和参数状态的动画。', 'An animation contrasting unregularized BCE with a different objective that includes an L2 term and a distinct parameter state.'),
    loc(
      String.raw`# L2 改变目标函数

## 0:00–0:10

先固定相同数据和特征。未正则化训练最小化 BCE；这给出一个明确的基线目标。

## 0:10–0:20

L2 训练最小化 $\mathrm{BCE}+\lambda\lVert\mathbf{w}\rVert_2^2/2$。虚线边界和实线边界表示它是不同的优化问题。

## 0:20–0:29

$\lambda$ 只作用在系数上，不惩罚截距。它不是“让任何模型变好”的开关。

## 0:29–0:38

公平对照要先说明目标、预处理、参数和停止规则，再比较输出。`,
      String.raw`# L2 changes the objective

## 0:00–0:10

Keep data and features fixed. Unregularized training minimizes BCE, giving a clearly defined baseline objective.

## 0:10–0:20

L2 training minimizes $\mathrm{BCE}+\lambda\lVert\mathbf{w}\rVert_2^2/2$. A solid and a dashed boundary indicate that this is a different optimization problem.

## 0:20–0:29

$\lambda$ acts on coefficients, not the intercept. It is not a switch that makes every model better.

## 0:29–0:38

A fair comparison states its objective, preprocessing, parameters, and stopping rule before comparing outputs.`,
    ),
    [
      marker('regularization-1', 0, '固定基线目标', 'Fixed baseline objective'),
      marker('regularization-2', 10, '加入 L2 项', 'Add the L2 term'),
      marker('regularization-3', 20, '系数与截距', 'Coefficients and intercept'),
      marker('regularization-4', 29, '公平对照', 'Fair comparison'),
    ],
    ['phase29-regularization'],
  ),
}
