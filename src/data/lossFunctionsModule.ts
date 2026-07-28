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
        'zh-CN': `如果你抛硬币 10 次，结果出现了 8 次正面，你会觉得“这枚硬币正面概率是 0.2”靠谱吗？

### 概念直觉
**似然**不是在问“数据为什么发生”，而是在问：  
**如果参数真的是这样，眼前这批数据像不像它生成出来的？**

在这节里，参数就是“硬币出现正面的概率 $p$”。  
观测数据是“10 次里有 8 次正面”。  
于是我们就可以比较：

- 如果 $p=0.2$，这组数据看起来像不像它生成的？
- 如果 $p=0.5$，像不像？
- 如果 $p=0.8$，像不像？

### 手算例子
如果我们暂时不管排列顺序，只看“8 次正面、2 次反面”这个结果，那么：

$$L(p) = p^8(1-p)^2$$

把几个候选值代进去：

- $p=0.2$ 时，结果会很小，因为 0.2 很难解释“8 次正面”
- $p=0.5$ 时，会更合理一些
- $p=0.8$ 时，通常会明显更大，因为它更像这批数据的来源

### 公式
这条式子不是在发明新规则，而是在把“这组数据在当前参数下有多合理”写成一个可比较的数。

$$L(p \\mid \\text{8 heads in 10 tosses}) = p^8(1-p)^2$$

这里的 $L$ 表示似然，$p$ 是我们正在猜的参数。  
似然越大，不代表参数“绝对正确”，只代表**在候选参数里，它更能解释当前观测结果**。

> **常见误解**  
> 不要把“参数的概率”误解成“似然”。这里不是在问“$p=0.8$ 本身有多可能”，而是在问“如果 $p=0.8$，这批数据有多像它生成的”。

### 记住这一点
似然是在给参数打分：谁最能解释当前数据，谁的似然就更大。

### 补充知识点
似然曲线的最高点通常靠近观测频率。  
如果 10 次里有 8 次正面，$p=0.8$ 会比 $p=0.2$ 更合理；如果你把正面次数改成 2，曲线峰值也会跟着移动。

### 交互实验设计
固定抛硬币次数，拖动正面次数和候选概率。观察候选排名、似然曲线和当前标记点：数据不变时是在比较参数，数据一变时整条曲线都会重新定义“谁更合理”。

### 来源参考
改写自 D2L 对最大似然思想的训练动机，以及 mlcourse.ai 在概率模型中用观测数据比较参数的讲法；本站用硬币例子把参数评分先独立讲清楚。`,
        en: `If you toss a coin 10 times and get 8 heads, would you find it convincing to say “this coin has head probability 0.2”?

### Concept
**Likelihood** is not asking why the data happened. It asks:  
**if the parameter really had this value, how much does the observed data look like it came from it?**

In this chapter, the parameter is the coin-head probability $p$.  
The observed data is “8 heads out of 10 tosses.”  
So we can compare:

- if $p=0.2$, does this dataset look like it came from that coin?
- if $p=0.5$, does it?
- if $p=0.8$, does it?

### Worked Example
If we ignore ordering for a moment and only track “8 heads and 2 tails,” then:

$$L(p) = p^8(1-p)^2$$

Now plug in a few candidates:

- when $p=0.2$, the result is very small, because 0.2 struggles to explain 8 heads
- when $p=0.5$, it becomes more plausible
- when $p=0.8$, it is usually much larger, because that parameter matches the data better

### Formula
This formula is not inventing a new rule. It is simply turning “how compatible is the data with this parameter?” into a comparable score.

$$L(p \\mid \\text{8 heads in 10 tosses}) = p^8(1-p)^2$$

Here $L$ means likelihood and $p$ is the parameter candidate we are testing.  
A larger likelihood does not mean the parameter is “certainly correct.” It only means **this candidate explains the current observation better than the others**.

> **Common Mistake**  
> Do not confuse the “probability of the parameter” with likelihood. We are not asking how likely $p=0.8$ is by itself. We are asking how well $p=0.8$ explains the observed data.

### Remember This
Likelihood is a scoring rule for parameters: the candidate that explains the data better gets the higher score.

### Extra Concept
The peak of the likelihood curve usually sits near the observed frequency.  
If 8 out of 10 tosses are heads, $p=0.8$ is much more plausible than $p=0.2$; if you change the heads count to 2, the peak moves with the data.

### Interaction Design
Keep the number of tosses fixed, then drag the heads count and candidate probability. Watch the candidate ranking, likelihood curve, and current marker: with fixed data we compare parameters, while changing data redefines which parameter looks plausible.

### Source References
Adapted from D2L for the maximum-likelihood training motivation and mlcourse.ai for comparing parameters through observed data; this site isolates the coin example before connecting it to loss.`,
      },
      callout: {
        'zh-CN': '先比较几个候选参数谁更像这组数据的来源，再谈“最优参数”这件事。',
        en: 'First compare which candidate explains the data better, then talk about the best parameter.',
      },
      experimentPrompt: {
        'zh-CN': '保持观测结果固定，切换候选概率，比较哪一个参数让“8 次正面”看起来最合理。',
        en: 'Keep the observation fixed and compare which probability makes “8 heads” look most plausible.',
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
        'zh-CN': `既然似然已经能给参数打分了，为什么还要多此一举地取对数、再加一个负号？

### 概念直觉
原因有两个：

1. 多个样本的联合似然通常是很多小概率连乘，数字会迅速变得极小  
2. 机器学习更习惯做“最小化”，而不是“最大化”

对数可以把连乘变成连加，负号可以把“最大化似然”改写成“最小化损失”。

### 手算例子
继续看“10 次里 8 次正面”的例子。  
如果某个候选参数给每次观测的概率都小于 1，那么把 10 个概率相乘后，结果会很快变得非常小。

于是我们做两步变形：

$$\\log L(p) = \\log\\left(p^8(1-p)^2\\right) = 8\\log p + 2\\log(1-p)$$

再乘上负号：

$$-\\log L(p)$$

这样以后，比较参数就变成“谁的负对数似然更小”。

### 公式
对于这个抛硬币例子，负对数似然可以写成：

$$-\\log L(p) = -\\left[8\\log p + 2\\log(1-p)\\right]$$

取对数之后，原来很难读的连乘被变成了容易处理的求和。  
再加负号以后，我们就把“分数越大越好”的似然，翻译成了“分数越小越好”的损失。

> **常见误解**  
> 负对数似然不是在“改变问题”，而是在用更方便计算、更适合优化的语言，重写同一个比较任务。

### 记住这一点
取对数是为了把连乘变连加，加负号是为了把最大化问题改写成最小化问题。

### 补充知识点
对数函数是单调递增的，所以最大化 $L$ 和最大化 $\\log L$ 会选出同一个参数。  
负号只改变优化方向：最大化 $\\log L$ 等价于最小化 $-\\log L$。

### 交互实验设计
逐步增加样本数，比较上方联合似然曲线和下方 NLL 曲线。注意观察：联合似然会很快接近 0，但 NLL 仍然保持清晰的数值尺度，便于排序和优化。

### 来源参考
改写自 Google Machine Learning Crash Course 对 log loss 数值稳定性的解释，以及 D2L 中把 likelihood 转成 negative log-likelihood 目标函数的训练写法。`,
        en: `If likelihood already scores parameters, why do we bother taking a log and then adding a minus sign?

### Concept
There are two main reasons:

1. the joint likelihood of many samples is often a product of many small probabilities, so it becomes tiny very quickly  
2. machine learning usually prefers minimization rather than maximization

The log turns products into sums, and the minus sign turns “maximize likelihood” into “minimize loss.”

### Worked Example
Keep using the “8 heads out of 10 tosses” example.  
If each observation contributes a probability smaller than 1, multiplying 10 such terms makes the joint likelihood shrink very fast.

So we apply two transformations:

$$\\log L(p) = \\log\\left(p^8(1-p)^2\\right) = 8\\log p + 2\\log(1-p)$$

Then we multiply by -1:

$$-\\log L(p)$$

Now comparing parameters becomes “which one has the smaller negative log-likelihood?”

### Formula
For this coin-toss example, the negative log-likelihood becomes:

$$-\\log L(p) = -\\left[8\\log p + 2\\log(1-p)\\right]$$

After taking the log, a difficult product becomes an easy sum.  
After adding the minus sign, a “larger is better” score becomes a “smaller is better” loss.

> **Common Mistake**  
> Negative log-likelihood does not change the underlying question. It rewrites the same comparison in a form that is easier to compute and easier to optimize.

### Remember This
The log turns multiplication into addition; the minus sign turns maximization into minimization.

### Extra Concept
The logarithm is monotonic, so maximizing $L$ and maximizing $\\log L$ choose the same parameter.  
The minus sign only flips the optimization direction: maximizing $\\log L$ is equivalent to minimizing $-\\log L$.

### Interaction Design
Increase the sample count and compare the joint-likelihood curve above with the NLL curve below. The joint likelihood quickly approaches zero, while NLL keeps a readable scale for ranking and optimization.

### Source References
Adapted from Google Machine Learning Crash Course for the numerical-stability intuition behind log loss and D2L for rewriting likelihood into a negative-log-likelihood objective.`,
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
        'zh-CN': `学到这里，我们终于可以回答一个关键问题：为什么 MSE、MAE、BCE 这些损失会长成现在这样？

### 概念直觉
答案是：很多常见损失并不是拍脑袋发明出来的。  
它们来自一种更底层的想法：

**先假设数据是按某种概率分布生成的，再去寻找最能解释这些数据的参数。**

这就是最大似然估计（MLE）的直觉。

### 手算例子
如果你认为连续值误差大多小、偶尔大，而且正负对称，那么 Gaussian 假设通常很自然；  
如果你觉得少数大偏差并不罕见，那么 Laplace 假设会更合理；  
如果输出本来就是 0 或 1，那么 Bernoulli 假设最合适。

于是就会得到三条熟悉的桥梁：

- Gaussian 负对数似然会导向 MSE
- Laplace 负对数似然会导向 MAE
- Bernoulli 负对数似然会导向 BCE

### 公式
当我们把“找最能解释数据的参数”写成数学形式时，才会出现你熟悉的 MLE 记号：

$$\\hat{\\theta}_{\\text{MLE}} = \\arg\\max_{\\theta} p(\\mathcal{D}\\mid\\theta)$$

如果再把它改写成优化里更常见的最小化形式，就得到：

$$\\hat{\\theta}_{\\text{MLE}} = \\arg\\min_{\\theta} -\\log p(\\mathcal{D}\\mid\\theta)$$

这里 $\\theta$ 是参数，$\\mathcal{D}$ 是数据集。  
这条式子真正表达的意思并不神秘：**最小化损失，很多时候就是在寻找“最能解释数据”的参数。**

> **常见误解**  
> 不要把 MLE 当成“和损失函数无关的统计附录”。它恰恰解释了为什么很多 loss 会长成今天这个样子。

### 记住这一点
很多常见损失，其实是某种数据生成假设下的负对数似然。

### 补充知识点
选择 loss 时不要只问“哪个公式常用”，而要问“我愿意假设误差长什么样”。  
高斯假设强调小误差和对称噪声，拉普拉斯假设更能容忍少量大偏差，伯努利假设则对应 0/1 事件。

### 交互实验设计
切换 Gaussian、Laplace、Bernoulli 三种假设，并拖动参数。观察“分布假设 -> 似然 -> 负对数 -> loss”的链条：图形形状变化时，等价 loss 的含义也在变化。

### 来源参考
改写自 D2L 对 MLE 与常见损失的连接、mlcourse.ai 对逻辑回归最大似然的推导，以及 Google MLCC 对 MSE / log loss 应用场景的解释。`,
        en: `At this point we can finally answer a crucial question: why do losses such as MSE, MAE, and BCE have the shapes they do?

### Concept
The answer is that many common losses were not invented arbitrarily.  
They come from a deeper idea:

**first assume the data was generated by some probability model, then find the parameter that explains that data best.**

That is the intuition behind maximum likelihood estimation (MLE).

### Worked Example
If you believe continuous errors are usually small, occasionally larger, and symmetric around zero, a Gaussian assumption is natural.  
If you expect a model to tolerate occasional larger deviations more gracefully, a Laplace assumption makes sense.  
If the output is inherently 0 or 1, a Bernoulli assumption is the right fit.

That gives three familiar bridges:

- Gaussian negative log-likelihood leads to MSE
- Laplace negative log-likelihood leads to MAE
- Bernoulli negative log-likelihood leads to BCE

### Formula
Only after the intuition is clear do we need the standard MLE notation:

$$\\hat{\\theta}_{\\text{MLE}} = \\arg\\max_{\\theta} p(\\mathcal{D}\\mid\\theta)$$

If we rewrite that in the minimization form used in optimization, we get:

$$\\hat{\\theta}_{\\text{MLE}} = \\arg\\min_{\\theta} -\\log p(\\mathcal{D}\\mid\\theta)$$

Here $\\theta$ is the parameter and $\\mathcal{D}$ is the dataset.  
The real meaning is simple: **minimizing loss often means finding the parameter that makes the observed data most plausible.**

> **Common Mistake**  
> Do not treat MLE as a detached statistics appendix. It is exactly the idea that explains why many practical losses look the way they do.

### Remember This
Many familiar losses are just negative log-likelihoods under different data-generation assumptions.

### Extra Concept
When choosing a loss, do not only ask which formula is common. Ask what you are willing to assume about the errors.  
Gaussian assumptions emphasize small symmetric noise, Laplace assumptions tolerate occasional larger deviations, and Bernoulli assumptions match 0-or-1 events.

### Interaction Design
Switch across Gaussian, Laplace, and Bernoulli, then drag the parameters. Watch the chain “assumption -> likelihood -> negative log -> loss”: when the shape changes, the meaning of the equivalent loss changes too.

### Source References
Adapted from D2L for the MLE-to-loss connection, mlcourse.ai for the maximum-likelihood derivation of logistic regression, and Google MLCC for practical MSE / log-loss usage intuition.`,
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

### Concept
A central difference moves one output upward and downward by a small step $h$, then estimates the slope from two objective evaluations:

$$
g_{\\text{num}} = \\frac{L(u+h)-L(u-h)}{2h}.
$$

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
