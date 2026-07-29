import type { AlgorithmModuleDefinition, StorySection } from '../types/ml.ts'
import { simulateLossFunctions } from '../simulations/lossFunctions.ts'
import { algorithmCheckpointsBySlug } from './algorithmCheckpoints.ts'
import {
  lossFunctionsChapterBindings,
  type LossFunctionsChapterBinding,
} from './lossFunctionsAssets.ts'

export interface LossFunctionsChapter extends StorySection, LossFunctionsChapterBinding {}

export interface LossFunctionsModuleDefinition
  extends Omit<AlgorithmModuleDefinition, 'chapters'> {
  chapters: LossFunctionsChapter[]
}

export const lossFunctionsModule: LossFunctionsModuleDefinition = {
  slug: 'loss-functions',
  route: '/learn/loss-functions',
  titleKey: 'modules.lossFunctions.title',
  kickerKey: 'modules.lossFunctions.kicker',
  introKey: 'modules.lossFunctions.intro',
  summaryKey: 'modules.lossFunctions.summary',
  theme: '#eef4ff',
  accent: '#3f6dff',
  checkpoints: algorithmCheckpointsBySlug['loss-functions'],
  chapters: [
    {
      id: 'why-loss',
      ...lossFunctionsChapterBindings['why-loss'],
      eyebrowKey: 'common.chapter',
      titleKey: 'modules.lossFunctions.sections.whyLoss.title',
      markdown: {
        'zh-CN': `### 核心问题
同一条真实 LaDe-D 配送记录，怎样从真实值 $y_i$ 和预测值 $\\hat y_i$ 一路走到残差、单样本损失、输出梯度与整批均值目标？

### 概念解释
先把三个层次分开：

- **误差（残差）** $r_i$ 只描述第 $i$ 行预测偏了多少；
- **单样本损失** $\\ell_i$ 用选定规则把残差改写成非负贡献；
- **训练目标** $L$ 把 $n$ 个贡献聚合成一个均值。

页面从固定的本地结果表读取一条代表行。你可以沿着
$y_i \\rightarrow \\hat y_i \\rightarrow r_i \\rightarrow \\ell_i
\\rightarrow \\partial \\ell_i/\\partial \\hat y_i \\rightarrow L$
逐项核对，而不需要相信另一组手填数字。

### 公式
本站统一使用“预测减真实”的残差方向：

$$
r_i = \\hat y_i-y_i,
\\qquad
\\ell_i = \\ell(\\hat y_i,y_i),
\\qquad
L = \\frac{1}{n}\\sum_{i=1}^{n}\\ell_i.
$$

误差可以为正、为负或为零；MSE/MAE 的单样本贡献不会因正负抵消。对均值目标求导时，单样本梯度还会多出 $1/n$。

### 代码与结果连接
可下载 Notebook 的 \`delivery-loss-functions\` 代码单元把公式直接写成向量运算：

\`\`\`python
def left_fold_mean(values):
    total = 0.0
    for value in values:
        total += float(value) / values.size
    return total

def regression_losses(targets, predictions):
    residuals = predictions - targets
    squared = residuals ** 2
    absolute = np.abs(residuals)
    return {"residuals": residuals,
            "mse": left_fold_mean(squared),
            "mae": left_fold_mean(absolute)}
\`\`\`

页面绑定同一份逐行结果和总体摘要：表格负责显示当前行的 $y_i$、$\\hat y_i$、$r_i$、贡献与梯度，摘要负责显示 $n$ 行均值。公式、代码和页面因此共享同一套变量。

> **常见误解**
> “误差、损失、目标”不是三个同义词。残差是输入，损失规则决定每行贡献，均值目标才是整批训练要最小化的量。

### 下一步
下一章会在同一配送数据上分别选择平方和绝对值规则，比较 MSE 与 MAE 怎样改变长时配送行的贡献和梯度尺度。`,
        en: `### Core Question
For one real LaDe-D delivery row, how do target $y_i$ and prediction $\\hat y_i$ lead to a residual, per-example loss, output gradient, and the batch mean objective?

### Concept Explanation
Keep three layers separate:

- **error (residual)** $r_i$ only describes how far row $i$ is off;
- **per-example loss** $\\ell_i$ rewrites that residual into a nonnegative contribution under a chosen rule;
- the **training objective** $L$ aggregates $n$ contributions into one mean.

The page loads one representative row from the fixed local result table. You can trace
$y_i \\rightarrow \\hat y_i \\rightarrow r_i \\rightarrow \\ell_i
\\rightarrow \\partial \\ell_i/\\partial \\hat y_i \\rightarrow L$
without trusting a second set of hand-entered numbers.

### Formula
This course consistently defines the residual as prediction minus target:

$$
r_i = \\hat y_i-y_i,
\\qquad
\\ell_i = \\ell(\\hat y_i,y_i),
\\qquad
L = \\frac{1}{n}\\sum_{i=1}^{n}\\ell_i.
$$

An error may be positive, negative, or zero; MSE and MAE per-example contributions do not cancel by sign. Differentiating the mean objective also introduces the factor $1/n$.

### Code and Output Connection
The downloadable Notebook cell \`delivery-loss-functions\` writes the formulas as vector operations:

\`\`\`python
def left_fold_mean(values):
    total = 0.0
    for value in values:
        total += float(value) / values.size
    return total

def regression_losses(targets, predictions):
    residuals = predictions - targets
    squared = residuals ** 2
    absolute = np.abs(residuals)
    return {"residuals": residuals,
            "mse": left_fold_mean(squared),
            "mae": left_fold_mean(absolute)}
\`\`\`

The page binds the same per-row result and aggregate summary: the table supplies $y_i$, $\\hat y_i$, $r_i$, contribution, and gradient for the selected row, while the summary supplies the mean over all $n$ rows. Formula, code, and page therefore share one vocabulary.

> **Common Mistake**
> Error, loss, and objective are not synonyms. The residual is an input, the loss rule determines each per-example contribution, and the mean objective is what training minimizes over the batch.

### Next Step
The next chapter applies squared and absolute-value rules to the same delivery data and compares how MSE and MAE change a long-duration row's contribution and gradient scale.`,
      },
      callout: {
        'zh-CN': '沿一条真实行检查 y、ŷ、r、单样本贡献、梯度和 n 行均值，不要跳过中间层。',
        en: 'Trace y, ŷ, r, per-example contribution, gradient, and the n-row mean on one real row without skipping a layer.',
      },
      experimentPrompt: {
        'zh-CN': '先选一条代表行核对残差方向，再切换评分规则，观察单行贡献与总体均值如何分开。',
        en: 'Select a representative row to check residual direction, then switch the scoring rule and keep the row contribution separate from the aggregate mean.',
      },
      layoutMode: 'embedded-lab',
      embeddedLabId: 'loss-functions-overview',
      metricEmphasis: ['loss'],
    },
    {
      id: 'regression-losses',
      ...lossFunctionsChapterBindings['regression-losses'],
      eyebrowKey: 'common.chapter',
      titleKey: 'modules.lossFunctions.sections.regressionLosses.title',
      markdown: {
        'zh-CN': `### 核心问题
在同一批真实 LaDe-D 配送记录上，为什么一个典型行和一个长时配送行会让 MSE 与 MAE 给出完全不同的贡献与梯度尺度？

### 概念解释
页面保留同一个固定预测 $\\hat y$，只让真实配送时长 $y_i$ 随行变化。这样比较的不是两个模型，而是同一残差 $r_i=\\hat y_i-y_i$ 经过两种评分规则后的结果。

- **典型行**让你先检查残差、平方和绝对值的逐行关系；
- **长时配送行**显示大残差怎样主导平方损失；
- 完整分布说明这种差异是否只发生在一个样本，还是会改变总体目标。

所有行值、代表行角色、贡献排行与分布箱都从本地锁定摘要读取。正文只解释字段之间的关系，不另造第二套统计数字。

### 公式
逐行贡献与总体目标必须分开写：

$$
\\ell_i^{\\operatorname{MSE}}=r_i^2,
\\qquad
\\operatorname{MSE}=\\frac{1}{n}\\sum_i r_i^2,
$$

$$
\\ell_i^{\\operatorname{MAE}}=|r_i|,
\\qquad
\\operatorname{MAE}=\\frac{1}{n}\\sum_i |r_i|.
$$

对预测输出求导时，MSE 的尺度随残差增长，而光滑 MAE 行的符号梯度幅度保持固定：

$$
\\frac{\\partial \\ell_i^{\\operatorname{MSE}}}{\\partial \\hat y_i}=2r_i,
\\qquad
\\frac{\\partial \\ell_i^{\\operatorname{MAE}}}{\\partial \\hat y_i}
=\\operatorname{sign}(r_i).
$$

均值目标再把这两项分别除以 $n$。因此长时配送行不仅有更大的 MSE 贡献，也会产生更大的 MSE 输出梯度；MAE 则线性增长。

### 代码与结果连接
Notebook 的向量化实现与公式使用同一组 \`targets\`、\`predictions\`、\`residuals\` 名称：

\`\`\`python
residuals = predictions - targets
squared = residuals ** 2
absolute = np.abs(residuals)

mse = left_fold_mean(squared)
mae = left_fold_mean(absolute)
mse_mean_gradients = 2.0 * residuals / targets.size
mae_mean_subgradients = np.sign(residuals) / targets.size
\`\`\`

页面把典型行、长时配送行和逐行贡献表放在公式旁边，并用实线菱形与虚线方形区分 MSE/MAE 图线。颜色不是唯一线索。

> **常见误解**
> “MAE 对离群点更稳健”不等于“MAE 总是更好”。损失选择表达任务偏好；还必须考虑优化、噪声假设和错误成本。

### 下一步
回归里输出是任意实数；下一章转向二分类概率 $p$ 与 logit $z$，观察一个自信错误为什么会让 BCE 急剧增大。`,
        en: `### Core Question
On the same real LaDe-D delivery records, why do a typical row and a long-duration row produce very different MSE versus MAE contribution and gradient scales?

### Concept Explanation
The page keeps one fixed prediction $\\hat y$ and lets the real delivery target $y_i$ vary by row. We are therefore not comparing two models; we are comparing how two scoring rules transform the same residual $r_i=\\hat y_i-y_i$.

- A **typical row** first checks the per-row relationship among residual, square, and absolute value.
- A **long-duration row** shows how a large residual can dominate squared loss.
- The complete distribution shows whether that contrast is isolated or changes the aggregate objective.

All row values, representative roles, contribution rankings, and distribution bins come from the locked local summary. The prose explains relationships among fields instead of creating a second numerical authority.

### Formula
Keep per-row contributions separate from aggregate objectives:

$$
\\ell_i^{\\operatorname{MSE}}=r_i^2,
\\qquad
\\operatorname{MSE}=\\frac{1}{n}\\sum_i r_i^2,
$$

$$
\\ell_i^{\\operatorname{MAE}}=|r_i|,
\\qquad
\\operatorname{MAE}=\\frac{1}{n}\\sum_i |r_i|.
$$

For output gradients, MSE scale grows with the residual, while a smooth MAE row keeps a fixed signed magnitude:

$$
\\frac{\\partial \\ell_i^{\\operatorname{MSE}}}{\\partial \\hat y_i}=2r_i,
\\qquad
\\frac{\\partial \\ell_i^{\\operatorname{MAE}}}{\\partial \\hat y_i}
=\\operatorname{sign}(r_i).
$$

The mean objective divides both quantities by $n$. A long-duration row therefore has both a larger MSE contribution and a larger MSE output gradient, while MAE grows linearly.

### Code and Output Connection
The Notebook vectorization uses the same \`targets\`, \`predictions\`, and \`residuals\` names as the formulas:

\`\`\`python
residuals = predictions - targets
squared = residuals ** 2
absolute = np.abs(residuals)

mse = left_fold_mean(squared)
mae = left_fold_mean(absolute)
mse_mean_gradients = 2.0 * residuals / targets.size
mae_mean_subgradients = np.sign(residuals) / targets.size
\`\`\`

The page places the typical row, long-duration row, and per-row contribution table beside the formulas. The plot distinguishes MSE and MAE with solid diamonds versus dashed squares, so color is not the only cue.

> **Common Mistake**
> “MAE is more robust to outliers” does not mean “MAE is always better.” A loss expresses task preference and must also fit the optimization, noise assumption, and cost of mistakes.

### Next Step
Regression outputs can be any real number. The next chapter moves to binary probability $p$ and logit $z$ to explain why a confidently wrong prediction makes BCE grow sharply.`,
      },
      callout: {
        'zh-CN': '先比典型行，再比长时配送行：平方让贡献和梯度尺度随 |r| 放大，绝对值保持线性。',
        en: 'Compare the typical row, then the long-duration row: squaring amplifies contribution and gradient scale with |r|, while absolute value stays linear.',
      },
      experimentPrompt: {
        'zh-CN': '在代表行和完整分布之间切换，分别核对逐行贡献、总体均值与非颜色图形标记。',
        en: 'Switch between representative rows and the full distribution, checking per-row contributions, aggregate means, and non-color plot markers separately.',
      },
      layoutMode: 'embedded-lab',
      embeddedLabId: 'regression-loss-lab',
      metricEmphasis: ['loss'],
    },
    {
      id: 'classification-losses',
      ...lossFunctionsChapterBindings['classification-losses'],
      eyebrowKey: 'common.chapter',
      titleKey: 'modules.lossFunctions.sections.classificationLosses.title',
      markdown: {
        'zh-CN': `### 核心问题
在真实 SECOM 二分类结果里，一个模型为什么会因为**自信地判错**而得到很大的 BCE，而且我们怎样在极端 logit 下仍计算同一个目标？

### 概念解释
标签 $y$ 只能是 0 或 1。模型先输出任意实数 logit $z$，再通过
$p = \\sigma(z)$ 得到正类概率。概率域 BCE 检查真实标签拿到了多少概率：

$$
\\ell_{\\operatorname{BCE}}(y,p)
=-[y\\log p+(1-y)\\log(1-p)].
$$

当预测正确且有把握时，真类概率接近 1，损失很小；当模型自信地判错时，真类概率接近 0，负对数会迅速增大。页面从固定的 SECOM 逐行结果中读取置信错误行、逐行 BCE、logit 梯度与整批均值，不把辅助 OOF 分数误称为本章训练出的模型。

### 公式
概率直觉清楚以后，计算改到 logit 域。本站的唯一规范实现是
\`softplus(z) - y z\`：

$$
\\ell_{\\operatorname{BCE}}(y,z)
=\\operatorname{softplus}(z)-yz
=\\log(1+e^z)-yz.
$$

它与普通有限输入上的概率公式等价，但不会先把 $p$ 舍入到 0 或 1。对 logit 的逐行梯度尤其简单：

$$
\\frac{\\partial \\ell_i}{\\partial z_i}=p_i-y_i,
\\qquad
\\frac{\\partial L}{\\partial z_i}=\\frac{p_i-y_i}{n}.
$$

逐元素形式就是 \`p - y\`；对均值目标再除以 $n$。

页面还读取固定的极端 logit 探针，明确区分“朴素概率公式变成非有限”“裁剪后有限但目标被改变”和“稳定 logit BCE 仍有限”。

### 代码与结果连接
Notebook 的 \`manufacturing-stable-bce\` 单元与 TypeScript 数学工具使用同一 $y$、$z$、$p$、$n$ 记号：

\`\`\`python
def stable_bce_from_logits(logits, targets):
    losses = np.logaddexp(0.0, logits) - targets * logits
    probabilities = np.empty_like(logits)
    nonnegative = logits >= 0.0
    probabilities[nonnegative] = 1.0 / (1.0 + np.exp(-logits[nonnegative]))
    negative_exponential = np.exp(logits[~nonnegative])
    probabilities[~nonnegative] = (
        negative_exponential / (1.0 + negative_exponential)
    )
    gradients = probabilities - targets
    return losses, gradients, gradients / logits.size
\`\`\`

\`np.logaddexp(0.0, logits)\` 是向量化 softplus；返回值把逐行损失、逐 logit 梯度和均值目标梯度分开。页面表格、置信错误卡片与稳定性对照全部绑定同一份锁定摘要。

### Softmax 桥梁
互斥多分类把一个 $p$ 扩展为总和为 1 的概率向量；Softmax 负责归一化多个 logit。这里仅保留这条从 BCE 到多分类交叉熵的桥，不展开多分类梯度或决策分析。

> **常见误解**
> 概率裁剪不是稳定 BCE 的同义词。裁剪会改变极端输入的目标；规范路径直接在 logit 域计算原目标。

### 下一步
我们已经会使用 MSE、MAE 和 BCE。下一章才回到概率来源，先问“一个模型给已观察数据多高的概率”，再进入似然、负对数与 MLE。`,
        en: `### Core Question
In the real SECOM binary results, why does a model receive a large BCE when it is **confidently wrong**, and how can we compute the same objective at extreme logits?

### Concept Explanation
The label $y$ is either 0 or 1. The model first emits an unrestricted logit $z$, then
$p = \\sigma(z)$ gives the positive-class probability. Probability-domain BCE asks how much probability the true label received:

$$
\\ell_{\\operatorname{BCE}}(y,p)
=-[y\\log p+(1-y)\\log(1-p)].
$$

A correct confident prediction gives the true class probability near 1 and a small loss. A confidently wrong prediction gives the true class probability near 0, so the negative log grows sharply. The page loads the confident-error row, per-row BCE, logit gradient, and batch mean from the fixed SECOM output; it never describes the auxiliary OOF scores as a model trained in this chapter.

### Formula
After the probability intuition is clear, computation moves to the logit domain. The only canonical implementation in this course is
\`softplus(z) - y z\`:

$$
\\ell_{\\operatorname{BCE}}(y,z)
=\\operatorname{softplus}(z)-yz
=\\log(1+e^z)-yz.
$$

It agrees with the probability expression on ordinary finite inputs without first rounding $p$ to 0 or 1. The per-logit gradient is especially simple:

$$
\\frac{\\partial \\ell_i}{\\partial z_i}=p_i-y_i,
\\qquad
\\frac{\\partial L}{\\partial z_i}=\\frac{p_i-y_i}{n}.
$$

The elementwise form is simply \`p - y\`; the mean objective then divides it by $n$.

The page also loads the locked extreme-logit probes and clearly separates “naive probability formula becomes non-finite,” “clipping is finite but changes the objective,” and “stable logit BCE stays finite.”

### Code and Output Connection
The Notebook cell \`manufacturing-stable-bce\` and the TypeScript math utility use the same $y$, $z$, $p$, and $n$ notation:

\`\`\`python
def stable_bce_from_logits(logits, targets):
    losses = np.logaddexp(0.0, logits) - targets * logits
    probabilities = np.empty_like(logits)
    nonnegative = logits >= 0.0
    probabilities[nonnegative] = 1.0 / (1.0 + np.exp(-logits[nonnegative]))
    negative_exponential = np.exp(logits[~nonnegative])
    probabilities[~nonnegative] = (
        negative_exponential / (1.0 + negative_exponential)
    )
    gradients = probabilities - targets
    return losses, gradients, gradients / logits.size
\`\`\`

\`np.logaddexp(0.0, logits)\` is vectorized softplus. The return values keep per-row loss, per-logit gradient, and mean-objective gradient distinct. The row table, confident-error card, and stability comparison all bind the same locked summary.

### Softmax Bridge
Mutually exclusive multiclass classification expands one $p$ into a probability vector that sums to 1; Softmax normalizes multiple logits. This is only a short bridge from BCE to multiclass cross-entropy, not a multiclass gradient or decision lesson.

> **Common Mistake**
> Probability clipping is not another name for stable BCE. Clipping changes the objective at extreme inputs; the canonical path computes the original objective directly in logit space.

### Next Step
We now know how to use MSE, MAE, and BCE. Only in the next chapter do we return to their probabilistic origin, starting with the probability a model assigns to observed data and then moving through likelihood, negative log, and MLE.`,
      },
      callout: {
        'zh-CN': '先读真实置信错误行，再比较朴素、裁剪和稳定三条计算路径；规范目标始终是 logit 域 BCE。',
        en: 'Read the real confident-error row, then compare naive, clipped, and stable paths; logit-domain BCE remains the canonical objective.',
      },
      experimentPrompt: {
        'zh-CN': '固定 y 后移动 z，观察 p、逐行 BCE 与 p-y；随后查看极端探针，确认裁剪与稳定计算不是同一目标。',
        en: 'Hold y fixed and move z to compare p, per-row BCE, and p-y; then inspect the extreme probes and confirm that clipping and stable evaluation are not the same objective.',
      },
      layoutMode: 'embedded-lab',
      embeddedLabId: 'classification-loss-lab',
      metricEmphasis: ['loss'],
    },
    {
      id: 'likelihood-intuition',
      ...lossFunctionsChapterBindings['likelihood-intuition'],
      eyebrowKey: 'common.chapter',
      titleKey: 'modules.lossFunctions.sections.likelihoodIntuition.title',
      markdown: {
        'zh-CN': `### 核心问题
已经会用 BCE 之后，我们怎样把一组已观察数据看成“模型给这些结果分配了多高概率”，而不把似然误解成参数本身的概率？

### 概念解释
似然从**已观察数据**出发，固定住眼前的标签，再比较候选模型。对第 $i$ 行二分类结果，模型给出的概率是：

$$
q_i =
\\begin{cases}
p_i, & y_i=1,\\\\
1-p_i, & y_i=0.
\\end{cases}
$$

$q_i$ 回答“模型给实际发生的标签多高概率”。页面读取上一章同一批 SECOM 行的 $y_i$、$z_i$、$p_i$ 和 BCE 贡献，所以概率直觉与真实分类结果连续，不会突然换成另一套数值案例。

### 公式
如果先采用样本条件独立这个教学假设，整批已观察标签的似然是这些概率的乘积：

$$
\\mathcal{L}
=\\prod_{i=1}^{n}q_i
=\\prod_{i=1}^{n}p_i^{y_i}(1-p_i)^{1-y_i}.
$$

似然越大，只表示这个候选模型给当前已观察数据分配了更高联合概率；它不表示“参数有这么大概率”，也不证明模型就是真实的数据生成机制。

### 代码与结果连接
Notebook 的锁定分类行已经提供 \`label\` 与 \`probability\`。下面的向量表达式只把已观察标签对应的概率选出来：

\`\`\`python
observed_probabilities = np.where(
    labels == 1.0,
    probabilities,
    1.0 - probabilities,
)
likelihood = np.prod(observed_probabilities)
\`\`\`

页面按行展示 $q_i$ 与对应 BCE，再让现有似然实验比较候选概率。这里的代码连接概率和乘积；不会重新拟合 SECOM 参数。

> **常见误解**
> 似然不是“参数的概率”。数据被视为已观察，模型候选在变化；我们比较的是每个候选给这些观察分配的概率。

### 下一步
联合似然是许多 $q_i$ 的连乘，样本一多就会非常小。下一章用对数把乘积变成求和，再加负号得到可最小化的 NLL。`,
        en: `### Core Question
After learning to use BCE, how can we view observed data through the probability assigned by a model without confusing likelihood with the probability of a parameter?

### Concept Explanation
Likelihood starts from **observed data**: hold the labels in front of us fixed and compare candidate models. For binary row $i$, the probability assigned by a model to what was actually observed is:

$$
q_i =
\\begin{cases}
p_i, & y_i=1,\\\\
1-p_i, & y_i=0.
\\end{cases}
$$

$q_i$ answers “how much probability did the model assign to the label that occurred?” The page loads $y_i$, $z_i$, $p_i$, and BCE contribution from the same locked SECOM rows used in the previous chapter, so the probability intuition remains connected to the real classification result.

### Formula
Under the teaching assumption that samples are conditionally independent, the likelihood of all observed labels is the product of those probabilities:

$$
\\mathcal{L}
=\\prod_{i=1}^{n}q_i
=\\prod_{i=1}^{n}p_i^{y_i}(1-p_i)^{1-y_i}.
$$

A larger likelihood only means that this candidate assigned more joint probability to the observed data. It is not the probability of the parameter and does not prove that the candidate is the true data-generating mechanism.

### Code and Output Connection
The locked Notebook rows already provide \`label\` and \`probability\`. This vector expression selects the probability of each observed label:

\`\`\`python
observed_probabilities = np.where(
    labels == 1.0,
    probabilities,
    1.0 - probabilities,
)
likelihood = np.prod(observed_probabilities)
\`\`\`

The page places each $q_i$ beside its BCE contribution, then lets the existing likelihood lab compare candidates. This code connects probabilities to their product without refitting SECOM parameters.

> **Common Mistake**
> Likelihood is not the probability of a parameter. The data is treated as observed while the candidate model changes; we compare the probability each candidate assigns to those observations.

### Next Step
Joint likelihood multiplies many $q_i$ values and quickly becomes tiny. The next chapter uses a log to turn the product into a sum, then adds a minus sign to obtain a minimizable NLL.`,
      },
      callout: {
        'zh-CN': '固定已观察标签，比较不同候选给这些标签分配的联合概率；不要反过来问参数本身的概率。',
        en: 'Hold the observed labels fixed and compare the joint probability assigned by candidates; do not reverse the question into a parameter probability.',
      },
      experimentPrompt: {
        'zh-CN': '保持观测结果固定，切换候选概率并逐行查看 q_i，再观察乘积怎样给候选排序。',
        en: 'Keep observations fixed, switch candidate probabilities, inspect each q_i, and see how their product ranks candidates.',
      },
      layoutMode: 'embedded-lab',
      embeddedLabId: 'likelihood-intuition-lab',
      metricEmphasis: ['loss'],
    },
    {
      id: 'negative-log',
      ...lossFunctionsChapterBindings['negative-log'],
      eyebrowKey: 'common.chapter',
      titleKey: 'modules.lossFunctions.sections.negativeLog.title',
      markdown: {
        'zh-CN': `许多观测概率都很小时，为什么不能一直直接相乘？负对数又怎样把概率故事变成稳定的逐行损失？

### 核心问题
似然把每行“模型给真实结果的概率”连乘起来。样本一多，乘积会很快靠近 0；如果模型把已经发生的结果判得几乎不可能观察到，这个问题会更明显。我们需要保持排序不变，又避免直接计算极小连乘。

### 概念解释
对数单调递增，所以比较 $L$ 与比较 $\\log L$ 会选出相同的候选。它还让概率连乘变成求和：

$$
\\log\\prod_{i=1}^{n}q_i=\\sum_{i=1}^{n}\\log q_i.
$$

再加负号，就得到负对数似然（negative log-likelihood, NLL）：每个不可信的已观察结果都会贡献更大的正损失，而且各行贡献可以安全相加。

### 公式
Bernoulli 标签 $y_i\\in\\{0,1\\}$ 的单行 NLL 正是 BCE：

$$
\\ell_i=-\\left[y_i\\log p_i+(1-y_i)\\log(1-p_i)\\right].
$$

若模型输出 logit $z_i$，同一个量可以写成数值更稳定的形式：

$$
\\ell_i=\\operatorname{softplus}(z_i)-y_i z_i.
$$

这不是换了目标，而是避免先把极端 logit 压成舍入后的 0 或 1。

### 代码与结果连接
固定的 SECOM 探针同时保留朴素概率公式、裁剪概率公式和稳定 logit 公式。页面从 \`bce-stability-probes\` 读取状态；下面的核心表达式与 Notebook 完全相同：

\`\`\`python
def stable_bce_from_logits(logits, targets):
    return np.logaddexp(0.0, logits) - targets * logits
\`\`\`

普通 logit 时三种写法接近；极端 logit 时，朴素写法可能得到非有限值，裁剪写法虽有限却改变数值，而 \`np.logaddexp\` 仍直接计算原目标。

> **常见误解**
> 概率裁剪能阻止 \`log(0)\`，但它不是稳定公式的同义写法。裁剪改变了输入概率；稳定 logit BCE 只是更可靠地计算同一个 Bernoulli negative log-likelihood。

### 下一步
现在我们知道 NLL 为什么可加、为什么稳定。下一章把“最大化似然”和“最小化负对数似然”并排连接到 MSE、MAE 与 BCE，但仍不进入参数训练。
`,
        en: `When many observed probabilities are small, why not keep multiplying them directly? How does a negative log turn the probability story into a stable row-wise loss?

### Core Question
Likelihood multiplies the probability assigned by a model to each realized outcome. With more rows, that product rapidly approaches zero; the effect is sharper when the model calls an observed outcome an unlikely observation. We need the same ranking without directly computing a tiny product.

### Concept Explanation
The logarithm is monotonic, so comparing $L$ and comparing $\\log L$ select the same candidate. It also makes probability products become sums:

$$
\\log\\prod_{i=1}^{n}q_i=\\sum_{i=1}^{n}\\log q_i.
$$

Adding a minus sign gives the negative log-likelihood (NLL): every implausible observed result contributes a larger positive loss, and row contributions can be added safely.

### Formula
For a Bernoulli label $y_i\\in\\{0,1\\}$, the per-row NLL is exactly BCE:

$$
\\ell_i=-\\left[y_i\\log p_i+(1-y_i)\\log(1-p_i)\\right].
$$

When the model emits a logit $z_i$, the same quantity has a numerically stable form:

$$
\\ell_i=\\operatorname{softplus}(z_i)-y_i z_i.
$$

This does not change the objective. It avoids first rounding an extreme logit to probability 0 or 1.

### Code and Output Connection
The locked SECOM probes retain naive-probability, clipped-probability, and stable-logit calculations. The page reads their statuses from \`bce-stability-probes\`; this core expression is identical to the Notebook:

\`\`\`python
def stable_bce_from_logits(logits, targets):
    return np.logaddexp(0.0, logits) - targets * logits
\`\`\`

At ordinary logits the three calculations are close. At extreme logits, the naive form can become non-finite, clipping remains finite but changes the value, and \`np.logaddexp\` still evaluates the original objective directly.

> **Common Mistake**
> Probability clipping prevents \`log(0)\`, but it is not a synonym for a stable formula. Clipping changes the input probability; stable logit BCE computes the same Bernoulli negative log-likelihood more reliably.

### Next Step
We now know why NLL is additive and why its stable form matters. The next chapter places “maximize likelihood” beside “minimize negative log-likelihood” and connects them to MSE, MAE, and BCE without starting parameter training.
`,
      },
      callout: {
        'zh-CN': '这一章的重点不是新公式，而是看懂“为什么要把概率语言翻译成优化语言”。',
        en: 'The goal here is not a new formula, but a clear reason for translating probability language into optimization language.',
      },
      experimentPrompt: {
        'zh-CN': '增大样本数，观察联合似然怎样迅速变小，而负对数似然仍然保持可读和可比较。',
        en: 'Increase the sample count and watch joint likelihood shrink quickly while negative log-likelihood stays readable.',
      },
      layoutMode: 'embedded-lab',
      embeddedLabId: 'negative-log-lab',
      metricEmphasis: ['loss'],
    },
    {
      id: 'mle-bridge',
      ...lossFunctionsChapterBindings['mle-bridge'],
      eyebrowKey: 'common.chapter',
      titleKey: 'modules.lossFunctions.sections.mleBridge.title',
      markdown: {
        'zh-CN': `MSE、MAE 与 BCE 为什么会有这些形状？它们能否从同一个“让数据更可信”的原则得到？

### 核心问题
最大似然估计（MLE）先选择一个数据生成假设，再寻找使已观察数据概率最大的候选。损失函数不是孤立的惩罚公式：很多 loss 是相应概率模型的负对数似然。

### 概念解释
三条常用桥梁只改变误差假设，不改变比较逻辑：

- Gaussian 误差的负对数似然，在固定方差时与 MSE 只差常数和正比例因子；
- Laplace 误差的负对数似然，在固定尺度时与 MAE 对齐；
- Bernoulli 结果的负对数似然就是 BCE。

配送数据中的代表行让我们比较平方残差与绝对残差，SECOM 代表行让我们查看 0/1 结果的 BCE 贡献。它们来自两个固定数据集，却共享“逐行解释，再聚合”的结构。

### 公式
最大化似然写作

$$
\\hat{\\theta}_{\\mathrm{MLE}}
=\\arg\\max_{\\theta}p(\\mathcal D\\mid\\theta).
$$

由于对数单调递增，再加一个负号，同一选择也可以写作

$$
\\hat{\\theta}_{\\mathrm{MLE}}
=\\arg\\min_{\\theta}\\left[-\\log p(\\mathcal D\\mid\\theta)\\right].
$$

所以最大化似然与最小化负对数似然选择同一候选；变换改变计算方式和优化方向，不改变候选排序。

### 代码与结果连接
这一章把两个已锁定输出并排展示，而不在浏览器中重新拟合模型：

\`\`\`python
regression_rows = delivery_output["representative_rows"]
classification_rows = manufacturing_output["contributions"]
mean_loss = np.mean([row["loss"] for row in classification_rows])
\`\`\`

\`delivery-representative-rows\` 提供同一残差下的 MSE/MAE 贡献，\`manufacturing-bce-contributions\` 提供 Bernoulli BCE 贡献。页面只复核分布假设如何对应损失；这里不更新 $\\theta$。

> **常见误解**
> “高斯对应 MSE”不表示任何回归数据都自动服从高斯分布。它说明：接受该噪声假设与固定尺度后，MLE 的候选排序与最小 MSE 一致。假设是否合适仍需结合任务判断。

### 下一步
我们已经把概率模型、似然和损失连成一条链。下一章只验证损失对模型输出的解析梯度；Phase 27 的线性回归与 Phase 29 的逻辑回归再用链式法则连接参数梯度和完整训练。
`,
        en: `Why do MSE, MAE, and BCE have these shapes? Can they follow from one principle of making observed data more plausible?

### Core Question
Maximum likelihood estimation (MLE) chooses a data-generation assumption, then looks for the candidate that gives the observed data the largest probability. A loss is not an isolated penalty formula: many losses are negative log-likelihoods of their probability models.

### Concept Explanation
Three common bridges change the error assumption, not the comparison logic:

- Gaussian-error negative log-likelihood differs from MSE only by a constant and positive scale when variance is fixed;
- Laplace-error negative log-likelihood aligns with MAE when scale is fixed;
- Bernoulli negative log-likelihood is BCE.

Representative delivery rows let us compare squared and absolute residual contributions, while representative SECOM rows expose BCE contributions for 0/1 outcomes. They come from two locked datasets but share the structure “explain each row, then aggregate.”

### Formula
To maximize likelihood, write

$$
\\hat{\\theta}_{\\mathrm{MLE}}
=\\arg\\max_{\\theta}p(\\mathcal D\\mid\\theta).
$$

Because the log is monotonic, adding a minus sign expresses the same selection as

$$
\\hat{\\theta}_{\\mathrm{MLE}}
=\\arg\\min_{\\theta}\\left[-\\log p(\\mathcal D\\mid\\theta)\\right].
$$

Thus maximize likelihood and minimize negative log-likelihood select the same candidate. The transformation changes the computation and optimization direction, not the candidate ranking.

### Code and Output Connection
This chapter places two locked outputs side by side instead of fitting another model in the browser:

\`\`\`python
regression_rows = delivery_output["representative_rows"]
classification_rows = manufacturing_output["contributions"]
mean_loss = np.mean([row["loss"] for row in classification_rows])
\`\`\`

\`delivery-representative-rows\` supplies MSE/MAE contributions for the same residuals, and \`manufacturing-bce-contributions\` supplies Bernoulli BCE contributions. The page only checks how assumptions map to losses; it does not update $\\theta$ here.

> **Common Mistake**
> “Gaussian leads to MSE” does not mean every regression dataset is automatically Gaussian. It means that after accepting that noise model and a fixed scale, the MLE ranking agrees with minimum MSE. Whether the assumption fits the task remains a modeling judgment.

### Next Step
We have linked probability models, likelihood, and loss. The next chapter checks only analytic output gradients; Phase 27 on linear regression and Phase 29 on logistic regression will apply the chain rule to parameter gradients and full training.
`,
      },
      callout: {
        'zh-CN': '把“分布假设 -> 似然 -> 负对数 -> 对应 loss”这条链真正连起来，MLE 就不再神秘。',
        en: 'Once the chain “distribution assumption -> likelihood -> negative log -> loss” is clear, MLE stops feeling mysterious.',
      },
      experimentPrompt: {
        'zh-CN': '切换 Gaussian、Laplace 和 Bernoulli，观察不同假设如何把 loss 的形状和含义一起带出来。',
        en: 'Switch between Gaussian, Laplace, and Bernoulli and watch each assumption produce a different loss story.',
      },
      layoutMode: 'embedded-lab',
      embeddedLabId: 'mle-bridge-lab',
      metricEmphasis: ['loss'],
    },
    {
      id: 'gradient-verification',
      ...lossFunctionsChapterBindings['gradient-verification'],
      eyebrowKey: 'common.chapter',
      titleKey: 'modules.lossFunctions.sections.gradientVerification.title',
      markdown: {
        'zh-CN': `解析梯度写出来以后，我们怎样确认公式和向量化代码真的描述了同一个量？

### 核心问题
这一章只检查损失对模型**输出**的梯度：回归里的 $\\partial L/\\partial \\hat y$，以及二分类里的 $\\partial L/\\partial z$。它不会提前推导 $\\partial L/\\partial w$，也不会训练模型参数。

### 概念解释
中心差分会把某一个输出向上、向下各移动一个很小的步长 $h$，再用两次目标函数的变化估计斜率：

$$
g_{\\text{num}} = \\frac{L(u+h)-L(u-h)}{2h}
$$

### 公式
解析梯度来自公式。对均值目标，单个样本的贡献还要除以批量大小 $n$：

$$
\\frac{\\partial \\operatorname{MSE}}{\\partial \\hat y_i}
=\\frac{2(\\hat y_i-y_i)}{n},
\\qquad
\\frac{\\partial \\operatorname{BCE}}{\\partial z_i}
=\\frac{\\sigma(z_i)-y_i}{n}.
$$

把解析值和中心差分放在同一行比较，可以检查漏掉的负号、错误的变量和忘记的 $1/n$。

### 代码与结果连接
下面的函数与可下载 Notebook 中的 \`manufacturing-central-difference\` 代码单元使用同一变量名。页面读取固定的步长扫描结果，而不是重新抄写一套数值。

\`\`\`python
def coordinate_central_difference(objective, values, index, step):
    plus = values.copy()
    minus = values.copy()
    plus[index] += step
    minus[index] -= step
    return (objective(plus) - objective(minus)) / (2.0 * step)
\`\`\`

固定扫描使用 $h=10^{-1}$ 到 $10^{-9}$，并同时报告绝对误差
$|g_{\\text{analytic}}-g_{\\text{num}}|$ 与带尺度的相对误差。平滑点按固定容差 $5\\times10^{-7}$ 标记通过或失败；$h$ 太大时有截断误差，太小时舍入误差会重新变明显。

### MAE 尖点
当 $\\hat y_i=y_i$ 时，MAE 在 0 处不可导。本站采用子梯度 0 作为实现约定，但对称中心差分得到 0 并不能证明存在唯一导数。固定结果因此标记为“尖点”，不会伪装成普通通过。

> **常见误解**
> 数值梯度很接近解析梯度，只能说明当前输入、步长和实现彼此一致；它不是对所有输入的数学证明。MAE 尖点更不能按光滑点的规则认证。

### 下一步
现在我们已经确认了 $\\partial L/\\partial \\hat y$ 和 $\\partial L/\\partial z$。在线性回归与逻辑回归课程里，链式法则会把这些输出梯度继续传到 $w$ 和 $b$；参数更新与完整训练循环留到那两门课。`,
        en: `Once an analytic gradient is written down, how can we check that the formula and vectorized code describe the same quantity?

### Core Question
This chapter checks gradients of the loss with respect to model **outputs** only: $\\partial L/\\partial \\hat y$ for regression and $\\partial L/\\partial z$ for binary classification. It does not derive $\\partial L/\\partial w$ or train model parameters.

### Concept Explanation
A central difference moves one output upward and downward by a small step $h$, then estimates the slope from two objective evaluations:

$$
g_{\\text{num}} = \\frac{L(u+h)-L(u-h)}{2h}.
$$

### Formula
The analytic gradient comes from the formula. For a mean objective, one sample's contribution also contains the batch factor $1/n$:

$$
\\frac{\\partial \\operatorname{MSE}}{\\partial \\hat y_i}
=\\frac{2(\\hat y_i-y_i)}{n},
\\qquad
\\frac{\\partial \\operatorname{BCE}}{\\partial z_i}
=\\frac{\\sigma(z_i)-y_i}{n}.
$$

Comparing the analytic and central-difference values on the same row catches a missing sign, the wrong variable, or a forgotten $1/n$.

### Code and Output Connection
This function uses the same names as the downloadable Notebook cell \`manufacturing-central-difference\`. The page loads the locked step sweep instead of copying a second set of numerical values into prose.

\`\`\`python
def coordinate_central_difference(objective, values, index, step):
    plus = values.copy()
    minus = values.copy()
    plus[index] += step
    minus[index] -= step
    return (objective(plus) - objective(minus)) / (2.0 * step)
\`\`\`

The locked sweep runs from $h=10^{-1}$ through $10^{-9}$ and reports both absolute error,
$|g_{\\text{analytic}}-g_{\\text{num}}|$, and scaled relative error. Smooth points are marked pass or fail against the fixed $5\\times10^{-7}$ tolerance. A large $h$ produces truncation error; a very small $h$ eventually exposes rounding error again.

### The MAE Kink
When $\\hat y_i=y_i$, MAE is not differentiable at zero. This project uses subgradient 0 as an implementation convention, but a symmetric central difference of 0 does not prove that a unique derivative exists. The locked result is therefore marked as a kink, never disguised as an ordinary pass.

> **Common Mistake**
> A close numerical match shows that one input, step size, and implementation agree. It is not a proof for every input, and the MAE kink cannot be certified using the smooth-point rule.

### Next Step
We have now checked $\\partial L/\\partial \\hat y$ and $\\partial L/\\partial z$. The later linear- and logistic-regression lessons will use the chain rule to carry those output gradients to $w$ and $b$; parameter updates and full training loops belong there.`,
      },
      callout: {
        'zh-CN': '同时查看解析梯度、中心差分、两种误差和步长，先确认检查的是同一个均值目标。',
        en: 'Read the analytic gradient, central difference, both errors, and step size together, first confirming they refer to the same mean objective.',
      },
      experimentPrompt: {
        'zh-CN': '比较 MSE、光滑 MAE、MAE 尖点和稳定 BCE 的步长扫描，再到线性/逻辑回归课程继续链式法则。',
        en: 'Compare the MSE, smooth-MAE, MAE-kink, and stable-BCE sweeps, then continue the chain rule in the linear and logistic regression lessons.',
      },
      layoutMode: 'embedded-lab',
      embeddedLabId: 'loss-gradient-verification-lab',
      metricEmphasis: ['loss'],
    },
  ],
  controls: [],
  presets: [
    {
      id: 'residual-contrast',
      label: { 'zh-CN': '单样本误差', en: 'Single-sample residual' },
      description: {
        'zh-CN': '从一个真实值和一个预测值开始，先建立“误差如何变成损失”的最基本直觉。',
        en: 'Start with one target and one prediction to build the most basic error-to-loss intuition.',
      },
      config: {
        lossFamily: 'regression',
        regressionLossKind: 'mse',
        targetValue: 1.2,
        predictionValue: -0.35,
      },
    },
    {
      id: 'outlier-shock',
      label: { 'zh-CN': '离群点冲击', en: 'Outlier shock' },
      description: {
        'zh-CN': '打开离群点后切换 MSE 和 MAE，直观看到二者对大误差的态度不同。',
        en: 'Turn on the outlier and switch between MSE and MAE to see how differently they treat large errors.',
      },
      config: {
        lossFamily: 'regression',
        regressionLossKind: 'mae',
        includeOutlier: true,
        outlierStrength: 2.4,
      },
    },
    {
      id: 'confident-mistake',
      label: { 'zh-CN': '自信犯错', en: 'Confident mistake' },
      description: {
        'zh-CN': '把真实标签设为 1，再把预测概率拖到很低的位置，体会交叉熵为什么会急剧升高。',
        en: 'Set the true label to 1 and drag the predicted probability low to feel why cross-entropy rises so sharply.',
      },
      config: {
        lossFamily: 'classification',
        classificationLossKind: 'bce',
        classificationLabel: 1,
        probability: 0.08,
      },
    },
    {
      id: 'coin-likelihood',
      label: { 'zh-CN': '硬币解释力', en: 'Coin likelihood' },
      description: {
        'zh-CN': '固定“10 次里 8 次正面”，比较不同候选概率谁更像这批数据的来源。',
        en: 'Fix “8 heads in 10 tosses” and compare which probability looks most like the source of that data.',
      },
      config: {
        lossFamily: 'mle',
        trialCount: 10,
        observedSuccesses: 8,
        candidateProbability: 0.5,
      },
    },
    {
      id: 'negative-log-shift',
      label: { 'zh-CN': '负对数翻译', en: 'Negative-log translation' },
      description: {
        'zh-CN': '增加样本数后比较 likelihood 与 negative log-likelihood，感受“概率语言”如何被改写成优化语言。',
        en: 'Increase the sample count and compare likelihood with negative log-likelihood to see probability language become optimization language.',
      },
      config: {
        lossFamily: 'mle',
        trialCount: 16,
        observedSuccesses: 13,
        candidateProbability: 0.62,
      },
    },
    {
      id: 'mle-connection',
      label: { 'zh-CN': '似然桥梁', en: 'Likelihood bridge' },
      description: {
        'zh-CN': '在 Gaussian、Laplace 与 Bernoulli 间切换，看到熟悉 loss 的概率来源。',
        en: 'Switch across Gaussian, Laplace, and Bernoulli to see the probabilistic origin of familiar losses.',
      },
      config: {
        lossFamily: 'mle',
        distributionKind: 'gaussian',
        mean: 0.7,
        sigma: 0.8,
      },
    },
  ],
  createDefaultConfig: () => ({
    lossFamily: 'regression',
    regressionLossKind: 'mse',
    classificationLossKind: 'bce',
    distributionKind: 'gaussian',
    targetValue: 1.2,
    predictionValue: -0.35,
    probability: 0.76,
    classificationLabel: 1,
    includeOutlier: true,
    outlierStrength: 2.2,
    datasetNoise: 0.12,
    mean: 0.8,
    sigma: 0.85,
    decisionBias: 0.05,
    trialCount: 10,
    observedSuccesses: 8,
    candidateProbability: 0.8,
  }),
  simulate: simulateLossFunctions,
}
