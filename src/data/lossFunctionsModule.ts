import type { AlgorithmModuleDefinition } from '../types/ml'
import { simulateLossFunctions } from '../simulations/lossFunctions'

export const lossFunctionsModule: AlgorithmModuleDefinition = {
  slug: 'loss-functions',
  route: '/learn/loss-functions',
  titleKey: 'modules.lossFunctions.title',
  kickerKey: 'modules.lossFunctions.kicker',
  introKey: 'modules.lossFunctions.intro',
  summaryKey: 'modules.lossFunctions.summary',
  theme: '#eef4ff',
  accent: '#3f6dff',
  chapters: [
    {
      id: 'why-loss',
      eyebrowKey: 'common.chapter',
      titleKey: 'modules.lossFunctions.sections.whyLoss.title',
      markdown: {
        'zh-CN': `如果你要预测 3 套房子的价格，模型到底要怎样才算“做得好”？

### 概念直觉
在真正训练模型之前，我们必须先把“做得好”翻译成一个数字规则。  
**误差**只是预测值和真实值之间的差距；**损失**是我们用什么规则去评价这个差距；**总体目标**则是把所有样本的损失合并起来，得到训练时真正要优化的分数。

换句话说：

- 单个样本先产生单个误差
- 误差经过规则变成单个损失
- 所有样本的损失再聚合成总体目标

### 手算例子
假设 3 套房子的真实价格分别是 180、220、260（单位先不管），模型预测成了 160、235、250。

- 第 1 套误差是 -20
- 第 2 套误差是 +15
- 第 3 套误差是 -10

如果我们只看误差，还不知道模型到底该更在意哪一种偏差。  
损失函数的作用，就是把这些偏差重新写成“训练时要认真对待的分数”。

### 公式
最抽象的写法其实很简单：它只是在说“把预测和真实值喂给一个评分规则”。

$$\\mathcal{L}(\\hat{y}, y)$$

这里 $\\hat{y}$ 是预测值，$y$ 是真实值，$\\mathcal{L}$ 只是“你决定采用哪种评分规则”的记号。  
真正困难的地方不是符号，而是**你想让模型更怕什么样的错误**。

> **常见误解**  
> 不要把“误差”直接当成“损失”。误差只是差多少，损失还包含“你如何看待这个差距”的价值判断。

### 记住这一点
损失函数不是公式装饰，而是机器学习问题的评分标准。`,
        en: `Suppose you are predicting the prices of three houses. What does it actually mean for the model to be “good”?

### Concept
Before we train anything, we must translate “good” into a scoring rule.  
**Error** is just the gap between prediction and truth. **Loss** is the rule we use to judge that gap. The **objective** is what we get after combining the losses from all samples into one number.

In other words:

- each sample creates an error
- the error becomes a loss under a chosen rule
- all sample losses are combined into the objective we optimize

### Worked Example
Imagine three house prices with true values 180, 220, and 260, while the model predicts 160, 235, and 250.

- the first error is -20
- the second error is +15
- the third error is -10

Errors alone do not yet tell the model which kind of mistake matters more.  
The loss function rewrites those gaps into the score that training will actually care about.

### Formula
The most abstract version of a loss is still simple: it just says “apply a scoring rule to prediction and truth.”

$$\\mathcal{L}(\\hat{y}, y)$$

Here $\\hat{y}$ is the prediction, $y$ is the target, and $\\mathcal{L}$ is the chosen scoring rule.  
The hard part is not the symbol. The hard part is deciding **what kind of mistake the model should fear more**.

> **Common Mistake**  
> Do not treat error and loss as the same thing. Error is only the gap; loss also includes how you choose to value that gap.

### Remember This
The loss function is the grading rule of the learning problem, not decorative algebra.`,
      },
      callout: {
        'zh-CN': '先盯住一个样本的误差，再看三个样本怎样被合成一个总体目标。',
        en: 'Start with one sample error, then watch three sample losses combine into one objective.',
      },
      experimentPrompt: {
        'zh-CN': '拖动真实值和预测值，先观察误差，再观察同一个误差在不同规则下会得到怎样的损失。',
        en: 'Drag the target and prediction, first inspect the error, then compare how different rules score that same gap.',
      },
      layoutMode: 'embedded-lab',
      embeddedLabId: 'loss-functions-overview',
      metricEmphasis: ['loss'],
    },
    {
      id: 'regression-losses',
      eyebrowKey: 'common.chapter',
      titleKey: 'modules.lossFunctions.sections.regressionLosses.title',
      markdown: {
        'zh-CN': `如果模型把房价多猜了 5 万和多猜了 50 万，我们真的应该把这两种错误看得一样重吗？

### 概念直觉
回归问题里最常见的两种损失是 **MSE** 和 **MAE**。  
它们都从**残差**出发。残差就是“预测值减去真实值”之后得到的差。

- MSE 会把残差平方，所以大误差会被明显放大
- MAE 取绝对值，所以大误差虽然更严重，但不会被平方放大

这意味着二者不是“写法不同”，而是在表达两种不同的教学态度：  
**你到底想让模型更怕离群点，还是更稳健地面对离群点？**

### 手算例子
假设真实值是 10，模型预测成 13，那么残差是 3。

- MSE：$3^2 = 9$
- MAE：$|3| = 3$

如果另一个样本残差变成 6：

- MSE：$6^2 = 36$
- MAE：$|6| = 6$

你会发现：误差翻倍时，MAE 也只是翻倍，但 MSE 会放大得更快。

### 公式
这两条公式看上去都在“平均误差”，但一个在平均平方误差，另一个在平均绝对误差。

$$\\text{MSE} = \\frac{1}{N}\\sum_i (\\hat{y}_i - y_i)^2$$

$$\\text{MAE} = \\frac{1}{N}\\sum_i |\\hat{y}_i - y_i|$$

其中 $N$ 是样本数，$\\hat{y}_i - y_i$ 是第 $i$ 个样本的残差。  
平方会让“大错”被惩罚得更重，绝对值则让惩罚增长得更均匀。

> **常见误解**  
> 不要把 “MSE 更常见” 误解成 “MSE 一定更好”。如果数据里有明显离群点，MAE 往往会更稳健。

### 记住这一点
MSE 和 MAE 的区别，本质上是在问：你希望模型多害怕大误差？`,
        en: `If a model misses a house price by 5 and by 50, should those two mistakes really be treated as equally serious?

### Concept
The two most common regression losses are **MSE** and **MAE**.  
Both start from the **residual**, which is simply prediction minus target.

- MSE squares the residual, so large errors get amplified
- MAE uses the absolute value, so large errors matter more, but they are not amplified by squaring

So these are not just two notations. They encode two different attitudes:  
**should the model fear outliers more, or stay more robust to them?**

### Worked Example
Suppose the true value is 10 and the model predicts 13. The residual is 3.

- MSE: $3^2 = 9$
- MAE: $|3| = 3$

Now imagine another sample with residual 6:

- MSE: $6^2 = 36$
- MAE: $|6| = 6$

When the error doubles, MAE doubles, but MSE grows much faster.

### Formula
Both formulas average errors, but one averages squared residuals and the other averages absolute residuals.

$$\\text{MSE} = \\frac{1}{N}\\sum_i (\\hat{y}_i - y_i)^2$$

$$\\text{MAE} = \\frac{1}{N}\\sum_i |\\hat{y}_i - y_i|$$

Here $N$ is the number of samples, and $\\hat{y}_i - y_i$ is the residual for sample $i$.  
Squaring punishes large mistakes more strongly. Absolute value grows more evenly.

> **Common Mistake**  
> Do not confuse “more common” with “always better.” If the dataset contains strong outliers, MAE is often more robust.

### Remember This
The real difference between MSE and MAE is how much you want the model to fear large errors.`,
      },
      callout: {
        'zh-CN': '重点看同一个残差在 MSE 和 MAE 下会被“重新放大”成多大的惩罚。',
        en: 'Focus on how the same residual gets re-weighted into very different penalties under MSE and MAE.',
      },
      experimentPrompt: {
        'zh-CN': '先用单样本手算，再打开离群点，看拟合线为什么会被 MSE 拉得更厉害。',
        en: 'Start with the single-sample calculation, then enable the outlier and see why MSE pulls the fit harder.',
      },
      layoutMode: 'embedded-lab',
      embeddedLabId: 'regression-loss-lab',
      metricEmphasis: ['loss'],
    },
    {
      id: 'classification-losses',
      eyebrowKey: 'common.chapter',
      titleKey: 'modules.lossFunctions.sections.classificationLosses.title',
      markdown: {
        'zh-CN': `如果一个模型把垃圾邮件判错了，而且它还 99% 自信，这种错误是不是应该比“只错一点点”更严重？

### 概念直觉
分类问题和回归不同。  
这里我们不仅关心“对还是错”，还关心**模型有多自信**。

先从最简单的二分类说起。  
如果类别只有“垃圾邮件 / 非垃圾邮件”两种，那么模型只需要给出一个概率 $p$：

- $p$ 表示“属于正类”的概率
- 另一个类别的概率就自动是 $1-p$

这就是为什么二分类里只需要一个数字。  
也正因为如此，二分类交叉熵 BCE 只需要盯住“真实类别最终拿到了多少概率”。

但一旦类别从 2 个变成 3 个、4 个甚至更多，情况就变了。  
这时我们不能只给出一个概率，因为：

- 我们需要同时给出每个类别的概率
- 这些概率必须加起来等于 1
- 同一个样本不应该同时“高概率属于多个互斥类别”

所以从 BCE 走向 Softmax，本质上不是“换一个新 loss”，而是**从一个概率扩展成一整组归一化概率**。

### 手算例子
先看二分类。假设真实标签是 1：

- 如果模型给出 $p=0.99$，说明它不仅猜对了，而且非常自信
- 如果模型给出 $p=0.55$，说明它虽然偏向正确答案，但还很犹豫
- 如果模型给出 $p=0.01$，说明它几乎在“自信地说反话”

这三种情况都不是同一种表现，所以不能只用“对 / 错”两个字来概括。

接着看三分类。  
假设一个样本真实属于类别 A，模型先给出三个原始分数：

$$z = [2.0, 1.0, 0.2]$$

这些分数本身还不是概率，因为它们既不一定大于 0，也不一定加起来等于 1。  
Softmax 会把它们变成一组真正的概率分布。  
最后如果 A 拿到的概率最高，而且足够高，那么损失就低；如果 A 的概率不高，损失就会上升。

### 公式
二分类交叉熵先回答的是：模型有没有把足够高的概率给到真实标签？

$$\\text{BCE}(y, p) = -\\left[y\\log p + (1-y)\\log(1-p)\\right]$$

这里 $y$ 是真实标签，取值只能是 0 或 1；$p$ 是模型给正类的概率。  
当 $y=1$ 时，公式主要看 $\\log p$；当 $y=0$ 时，公式主要看 $\\log(1-p)$。

如果类别不止两个，我们就要先把每个类别分数 $z_i$ 变成概率：

$$\\text{softmax}(z_i)=\\frac{e^{z_i}}{\\sum_j e^{z_j}}$$

这样得到的 $p_i$ 会自动满足：

$$p_1 + p_2 + \\cdots + p_K = 1$$

多分类交叉熵再去检查：真实类别到底拿到了多少概率？

$$\\text{CE}(\\mathbf{y}, \\mathbf{p}) = -\\sum_i y_i\\log p_i$$

如果真实标签是 one-hot，也就是只有真类那一项等于 1，那么它会进一步简化成：

$$\\text{CE} = -\\log p_{\\text{true}}$$

最关键的一步桥梁在这里：如果 Softmax 只剩两个类别，它会退化成 Sigmoid。

$$\\frac{e^{z_1}}{e^{z_0}+e^{z_1}} = \\frac{1}{1+e^{-(z_1-z_0)}} = \\sigma(z_1-z_0)$$

这说明：

- 两类 Softmax 本质上就是 Sigmoid 的另一种写法
- 二分类交叉熵 BCE，可以看成 Softmax cross-entropy 在两类情形下的特例

> **常见误解**  
> 不要把 Softmax 当成“和 BCE 没关系的另一套系统”，也不要把多分类简单理解成“给每个类各自套一个 sigmoid”。真正变化的不是“惩罚真类概率不足”这个思想，而是输出从一个概率变成了一整组必须共同归一化的概率。

### 记住这一点
BCE 解决的是“二分类里真类概率够不够高”，Softmax 解决的是“多分类里整组概率如何合法分配”；而二类 Softmax 恰好会退化回 BCE 背后的 Sigmoid 形式。`,
        en: `If a model labels an email incorrectly and is 99% confident about it, should that mistake be treated the same as being only slightly wrong?

### Concept
Classification is different from regression.  
Here we care not only about being right or wrong, but also about **confidence**.

Start with the simplest case: binary classification.  
If there are only two classes, such as “spam / not spam,” then the model only needs to output one probability $p$:

- $p$ is the probability of the positive class
- the other class is automatically $1-p$

That is why binary classification only needs one number.  
And that is why BCE only has to ask how much probability the true class finally received.

But once we move from 2 classes to 3, 4, or more, the situation changes.  
Now one probability is no longer enough because:

- we must output a probability for every class
- all probabilities must add up to 1
- one sample should not strongly belong to multiple mutually exclusive classes at the same time

So moving from BCE to softmax is not really “switching to a brand-new loss.”  
It is **expanding from one probability into a full normalized probability vector**.

### Worked Example
First look at the binary case. Assume the true label is 1:

- if the model predicts $p=0.99$, it is correct and very confident
- if the model predicts $p=0.55$, it leans correct but is still hesitant
- if the model predicts $p=0.01$, it is almost confidently saying the opposite

These are not the same kind of performance, so “right / wrong” alone is not enough.

Now move to three classes.  
Suppose the true class is A and the model first produces three raw scores:

$$z = [2.0, 1.0, 0.2]$$

Those values are not probabilities yet, because they do not have to be positive or sum to 1.  
Softmax converts them into a real probability distribution.  
If class A ends up with the largest and sufficiently high probability, the loss is low. If A receives too little probability, the loss rises.

### Formula
Binary cross-entropy first asks: did the model assign enough probability to the true label?

$$\\text{BCE}(y, p) = -\\left[y\\log p + (1-y)\\log(1-p)\\right]$$

Here $y$ is the true label, which can only be 0 or 1, and $p$ is the predicted probability of the positive class.  
When $y=1$, the formula mainly looks at $\\log p$; when $y=0$, it mainly looks at $\\log(1-p)$.

If we have more than two classes, we first turn each class score $z_i$ into a probability:

$$\\text{softmax}(z_i)=\\frac{e^{z_i}}{\\sum_j e^{z_j}}$$

This automatically gives probabilities that satisfy:

$$p_1 + p_2 + \\cdots + p_K = 1$$

Multiclass cross-entropy then checks how much probability the true class received:

$$\\text{CE}(\\mathbf{y}, \\mathbf{p}) = -\\sum_i y_i\\log p_i$$

If the target is one-hot, meaning only the true class has value 1, then the expression simplifies to:

$$\\text{CE} = -\\log p_{\\text{true}}$$

The most important bridge appears here: if softmax only has two classes, it collapses into sigmoid.

$$\\frac{e^{z_1}}{e^{z_0}+e^{z_1}} = \\frac{1}{1+e^{-(z_1-z_0)}} = \\sigma(z_1-z_0)$$

That means:

- two-class softmax is really another way to write sigmoid
- BCE is the special two-class case of softmax cross-entropy

> **Common Mistake**  
> Do not treat softmax as a completely unrelated system, and do not reduce multiclass classification to “one sigmoid per class.” The core idea never changed: the true class should receive high probability. What changed is that the output must grow from one probability into a full normalized distribution.

### Remember This
BCE answers “is the true-class probability high enough in binary classification?” Softmax answers “how do we distribute probability legally across many classes?” and two-class softmax collapses right back into the sigmoid form behind BCE.`,
      },
      callout: {
        'zh-CN': '先在 BCE 面板里理解“真类概率不够高就会被罚”，再到 Softmax 面板里看这个思想如何推广成一整组归一化概率。',
        en: 'Use the BCE panel to understand why low true-class probability is punished, then move to the softmax panel to see that same idea expanded into a normalized probability vector.',
      },
      experimentPrompt: {
        'zh-CN': '先固定真实标签并拖动 BCE 概率，再观察下方 Softmax 面板里的 logit、分母和三类概率条如何一起变化。',
        en: 'First fix the true label and drag the BCE probability, then inspect how the logits, denominator, and three probability bars change together in the softmax panel below.',
      },
      layoutMode: 'embedded-lab',
      embeddedLabId: 'classification-loss-lab',
      metricEmphasis: ['loss'],
    },
    {
      id: 'likelihood-intuition',
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
似然是在给参数打分：谁最能解释当前数据，谁的似然就更大。`,
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
Likelihood is a scoring rule for parameters: the candidate that explains the data better gets the higher score.`,
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
取对数是为了把连乘变连加，加负号是为了把最大化问题改写成最小化问题。`,
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
The log turns multiplication into addition; the minus sign turns maximization into minimization.`,
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
很多常见损失，其实是某种数据生成假设下的负对数似然。`,
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
Many familiar losses are just negative log-likelihoods under different data-generation assumptions.`,
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
