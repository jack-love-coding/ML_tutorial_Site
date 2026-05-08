import type { LocalizedCopy, MathLabModule, MathLabSection } from '../types/mathLab'

const md = String.raw

function copy(zh: string, en: string): LocalizedCopy {
  return { 'zh-CN': zh, en }
}

function section(
  id: string,
  title: LocalizedCopy,
  content: LocalizedCopy,
  placements: Pick<MathLabSection, 'visualIds' | 'labIds'> = {},
): MathLabSection {
  return {
    id,
    level: 2,
    title,
    content,
    ...placements,
  }
}

const sections: MathLabSection[] = [
  section(
    'monte-carlo-reproducible-randomness',
    copy('可复现的随机数从哪里来', 'Where Reproducible Randomness Comes From'),
    copy(
      md`随机数生成器（random number generator, RNG）回答的是一个计算问题：程序怎样产生一串看起来无法预测、但又能被实验复现的数？

真实随机数来自物理过程，例如掷骰子、热噪声或大气噪声。数值计算里更常用的是伪随机数：它由确定性算法生成，给定相同初始状态就会产生同一串结果。这个初始状态称为种子（seed）。这不是缺点；在调试模型、复现实验和比较算法时，种子反而很重要。

好的伪随机数生成器通常需要这些性质：

| 性质 | 含义 | 为什么重要 |
| --- | --- | --- |
| 随机模式 | 通过常见统计随机性检验 | 避免采样点出现明显偏向 |
| 效率 | 生成速度快，占用存储少 | Monte Carlo 常常需要大量样本 |
| 长周期 | 序列重复前尽量长 | 避免抽样还没完成就进入循环 |
| 可重复 | 同一算法和种子给出同一序列 | 便于复现实验和定位问题 |
| 可移植 | 不同平台表现一致 | 便于跨机器比较结果 |

一个经典例子是线性同余生成器（linear congruential generator, LCG）：

$$
x_0=\text{seed},\qquad x_{k+1}=(a x_k+c)\bmod M.
$$

其中 \(a\) 是乘数，\(c\) 是增量，\(M\) 是模数。LCG 的周期不会超过 \(M\)，并且实际周期取决于 \(a,c,M\) 的选择。

**小例子。** 取 \(x_0=1\)、\(a=2\)、\(c=1\)、\(M=10\)，得到

$$
1,3,7,5,1,3,7,5,\ldots
$$

这个生成器会很快重复，因此不适合认真采样。但它清楚展示了伪随机数的核心：序列由公式决定，种子控制从哪里开始，周期决定多久以后重复。`,
      md`A random number generator (RNG) answers a computational question: how can a program produce a sequence that looks unpredictable while still allowing experiments to be reproduced?

Truly random numbers come from physical processes, such as dice, thermal noise, or atmospheric noise. Numerical computing more often uses pseudorandom numbers: a deterministic algorithm produces a sequence, and the same initial state produces the same sequence again. That initial state is the seed. This is not a weakness; seeds are essential for debugging models, reproducing experiments, and comparing algorithms.

A good pseudorandom generator usually needs these properties:

| Property | Meaning | Why it matters |
| --- | --- | --- |
| Random-looking pattern | Passes common statistical tests | Prevents obvious sampling bias |
| Efficiency | Fast generation and little storage | Monte Carlo often needs many samples |
| Long period | Repeats only after a long sequence | Avoids cycling before the experiment is done |
| Repeatability | Same algorithm and seed give the same sequence | Makes experiments reproducible |
| Portability | Behaves consistently across platforms | Enables fair comparison across machines |

A classic example is a linear congruential generator (LCG):

$$
x_0=\text{seed},\qquad x_{k+1}=(a x_k+c)\bmod M.
$$

Here \(a\) is the multiplier, \(c\) is the increment, and \(M\) is the modulus. The period of an LCG cannot exceed \(M\), and the actual period depends on the choices of \(a,c,M\).

**Small example.** With \(x_0=1\), \(a=2\), \(c=1\), and \(M=10\), the sequence is

$$
1,3,7,5,1,3,7,5,\ldots
$$

This generator repeats quickly, so it is not suitable for serious sampling. It does show the core idea: the sequence is determined by a formula, the seed controls where it starts, and the period controls when it repeats.`,
    ),
  ),
  section(
    'monte-carlo-random-variables',
    copy('随机变量与期望', 'Random Variables and Expectation'),
    copy(
      md`Monte Carlo 的数学语言来自随机变量。随机变量 \(X\) 把一个随机过程的结果映射成数值：一次投硬币可以映射为 \(0\) 或 \(1\)，明天降雨量可以映射为毫米数，模型 dropout 的掩码可以映射为一组 \(0/1\) 开关。

如果离散随机变量 \(X\) 以概率 \(p_i\) 取值 \(x_i\)，并且 \(\sum_{i=1}^{m}p_i=1\)，它的期望为

$$
\mathbb{E}[X]=\sum_{i=1}^{m}p_i x_i.
$$

期望不是某一次实验必然出现的数，而是长期平均结果。公平硬币的例子很直接：

$$
X=
\begin{cases}
1,&\text{正面}\\
0,&\text{反面}
\end{cases}
\qquad
\mathbb{P}(X=1)=\mathbb{P}(X=0)=0.5.
$$

因此

$$
\mathbb{E}[X]=1\cdot 0.5+0\cdot 0.5=0.5.
$$

一次投掷只会得到 \(0\) 或 \(1\)，不会得到 \(0.5\)。但如果做很多次投掷并取平均，平均值会趋近 \(0.5\)。这就是大数定律提供的直觉：样本均值可以作为期望的可计算替身。`,
      md`Monte Carlo uses the language of random variables. A random variable \(X\) maps the outcome of a random process to a number: a coin toss can map to \(0\) or \(1\), tomorrow's rainfall can map to millimeters, and a dropout mask in a model can map to a collection of \(0/1\) switches.

If a discrete random variable \(X\) takes value \(x_i\) with probability \(p_i\), and \(\sum_{i=1}^{m}p_i=1\), its expectation is

$$
\mathbb{E}[X]=\sum_{i=1}^{m}p_i x_i.
$$

Expectation is not necessarily the value from one trial. It is the long-run average. A fair coin gives a direct example:

$$
X=
\begin{cases}
1,&\text{heads}\\
0,&\text{tails}
\end{cases}
\qquad
\mathbb{P}(X=1)=\mathbb{P}(X=0)=0.5.
$$

Therefore

$$
\mathbb{E}[X]=1\cdot 0.5+0\cdot 0.5=0.5.
$$

One toss gives either \(0\) or \(1\), not \(0.5\). But after many tosses, the average approaches \(0.5\). This is the intuition behind the law of large numbers: a sample average can act as a computable substitute for an expectation.`,
    ),
  ),
  section(
    'monte-carlo-estimators',
    copy('把面积和积分写成样本平均', 'Writing Areas and Integrals as Sample Averages'),
    copy(
      md`Monte Carlo 方法依赖重复随机抽样来近似目标量。它特别适合两类问题：

- 过程本身带有随机性，例如随机模拟、抽样推断和不确定性估计。
- 目标是确定的，但直接计算太贵，尤其是高维积分、复杂区域面积或体积。

估计圆面积是最经典的直觉图像。把四分之一单位圆放进单位正方形，在正方形中均匀抽点。如果落在圆内的比例是 \(\hat p\)，那么

$$
\frac{\pi}{4}\approx \hat p,\qquad \hat\pi=4\hat p.
$$

积分也可以写成同一个结构。若 \(X\sim \operatorname{Uniform}(a,b)\)，则

$$
I=\int_a^b f(x)\,dx=(b-a)\mathbb{E}[f(X)].
$$

抽取 \(N\) 个独立样本 \(X_1,\ldots,X_N\) 后，先估计期望

$$
S_N=\frac{1}{N}\sum_{i=1}^{N}f(X_i),
$$

再得到积分估计

$$
\hat I_N=(b-a)S_N=(b-a)\frac{1}{N}\sum_{i=1}^{N}f(X_i).
$$

下面这张无坐标插图只用来建立直觉：随机点铺满整个正方形，落在四分之一圆区域里的点数比例就代表面积比例。

![随机采样落入四分之一圆区域的抽象示意图](/math-lab/generated/monte-carlo-sampling-illustration.png)

下面的实验台把这两个想法放在一起：用可复现的 LCG 采样估计 \(\pi\)，并展示样本数、种子和生成器周期如何影响读数。`,
      md`Monte Carlo methods approximate a target quantity by repeated random sampling. They are especially useful for two kinds of problems:

- The process itself is random, such as stochastic simulation, sampling-based inference, and uncertainty estimation.
- The target is deterministic but expensive to compute directly, especially high-dimensional integrals or areas and volumes of complicated regions.

Estimating the area of a circle gives the classic picture. Put a quarter unit circle inside the unit square and sample uniformly in the square. If the fraction of points inside the circle is \(\hat p\), then

$$
\frac{\pi}{4}\approx \hat p,\qquad \hat\pi=4\hat p.
$$

Integration has the same structure. If \(X\sim \operatorname{Uniform}(a,b)\), then

$$
I=\int_a^b f(x)\,dx=(b-a)\mathbb{E}[f(X)].
$$

After drawing \(N\) independent samples \(X_1,\ldots,X_N\), estimate the expectation by

$$
S_N=\frac{1}{N}\sum_{i=1}^{N}f(X_i),
$$

and then estimate the integral by

$$
\hat I_N=(b-a)S_N=(b-a)\frac{1}{N}\sum_{i=1}^{N}f(X_i).
$$

The coordinate-free illustration below is only for intuition: random points fill the whole square, and the fraction landing in the quarter-circle region represents the area fraction.

![Abstract illustration of random samples landing in a quarter-circle region](/math-lab/generated/monte-carlo-sampling-illustration.png)

The lab below connects these ideas: a reproducible LCG samples points to estimate \(\pi\), and the readouts show how sample count, seed, and generator period affect the estimate.`,
    ),
    { visualIds: ['monte-carlo-sampling-video'], labIds: ['monte-carlo-sampling-lab'] },
  ),
  section(
    'monte-carlo-error-convergence',
    copy('误差收敛：慢，但不太怕维度', 'Error Convergence: Slow, but Dimension-Friendly'),
    copy(
      md`Monte Carlo 的收敛来自统计平均，而不是每个样本都很聪明。设 \(\mu=\mathbb{E}[f(X)]\)，\(\sigma^2=\operatorname{Var}(f(X))\)，并令

$$
S_N=\frac{1}{N}\sum_{i=1}^{N}f(X_i).
$$

在独立同分布且方差有限的条件下，中心极限定理给出

$$
\sqrt{N}(S_N-\mu)\Rightarrow N(0,\sigma^2).
$$

这意味着样本平均的典型误差规模约为

$$
|S_N-\mu|=O\left(\frac{1}{\sqrt{N}}\right).
$$

因此，样本数翻倍不会让误差减半；要把误差大约减半，通常需要约 \(4\) 倍样本。这听起来慢，但它的优势是对维度相对稳健：在很多高维积分问题中，传统网格方法会随维度爆炸，而 Monte Carlo 仍然只是在继续抽样。

它也有明确失败场景。样本如果不是目标分布下的均匀或正确抽样，估计会有偏；函数方差很大时，误差常数会很大；伪随机数周期太短或相关性太强时，点看似很多，但有效信息不足。`,
      md`Monte Carlo convergence comes from statistical averaging, not from each sample being clever. Let \(\mu=\mathbb{E}[f(X)]\), \(\sigma^2=\operatorname{Var}(f(X))\), and

$$
S_N=\frac{1}{N}\sum_{i=1}^{N}f(X_i).
$$

Under independent, identically distributed sampling with finite variance, the central limit theorem gives

$$
\sqrt{N}(S_N-\mu)\Rightarrow N(0,\sigma^2).
$$

So the typical error scale of the sample average is roughly

$$
|S_N-\mu|=O\left(\frac{1}{\sqrt{N}}\right).
$$

Doubling the sample count therefore does not cut the error in half. To roughly halve the error, you usually need about \(4\) times as many samples. That sounds slow, but the advantage is dimension behavior: in many high-dimensional integration problems, grid-based methods explode with dimension, while Monte Carlo keeps sampling.

It also has clear failure modes. If samples are not drawn from the intended distribution, the estimate is biased; if the function has high variance, the error constant is large; if a pseudorandom generator has a short period or strong correlation, many points may carry too little effective information.`,
    ),
  ),
  section(
    'monte-carlo-worked-example',
    copy('手算例题：四个样本估计一个积分', 'Worked Example: Four Samples Estimate an Integral'),
    copy(
      md`估计

$$
\int_0^1 x^2\,dx.
$$

真实值是 \(1/3\)，但先假设我们不知道。因为 \(X\sim \operatorname{Uniform}(0,1)\) 时

$$
\int_0^1 x^2\,dx=\mathbb{E}[X^2],
$$

所以可以抽样并平均 \(x^2\)。如果四个样本是

$$
0.2,\quad 0.4,\quad 0.6,\quad 0.8,
$$

那么 Monte Carlo 估计为

$$
\hat I_4=\frac{0.2^2+0.4^2+0.6^2+0.8^2}{4}
=\frac{0.04+0.16+0.36+0.64}{4}=0.30.
$$

真实误差为

$$
\left|0.30-\frac{1}{3}\right|\approx 0.0333.
$$

这个例子小到可以手算，也暴露了 Monte Carlo 的本质：每个样本都只是一个粗糙观察，平均值才是估计器。样本更多时，结果通常更稳定，但仍会围绕真实值波动。`,
      md`Estimate

$$
\int_0^1 x^2\,dx.
$$

The exact value is \(1/3\), but suppose we do not know that yet. Since \(X\sim \operatorname{Uniform}(0,1)\) gives

$$
\int_0^1 x^2\,dx=\mathbb{E}[X^2],
$$

we can sample and average \(x^2\). If four samples are

$$
0.2,\quad 0.4,\quad 0.6,\quad 0.8,
$$

then the Monte Carlo estimate is

$$
\hat I_4=\frac{0.2^2+0.4^2+0.6^2+0.8^2}{4}
=\frac{0.04+0.16+0.36+0.64}{4}=0.30.
$$

The actual error is

$$
\left|0.30-\frac{1}{3}\right|\approx 0.0333.
$$

This example is small enough to compute by hand, and it exposes the core of Monte Carlo: each sample is a rough observation, while the average is the estimator. With more samples the result usually becomes more stable, but it still fluctuates around the truth.`,
    ),
  ),
  section(
    'monte-carlo-ml-connection',
    copy('机器学习中的采样估计', 'Sampling Estimates in Machine Learning'),
    copy(
      md`Monte Carlo 思想在机器学习中不是只用来估计 \(\pi\)。更常见的是把一个太大的平均、积分或期望换成可计算的随机估计。

**小批量梯度下降。** 全数据梯度是所有样本梯度的平均。小批量训练每次只抽一部分样本，得到一个有噪声但便宜的梯度估计：

$$
\nabla L(\theta)\approx \frac{1}{B}\sum_{i\in \mathcal{B}}\nabla \ell_i(\theta).
$$

**Dropout。** 训练时随机关闭部分神经元，相当于对许多子网络的效果做随机近似。测试时常用缩放后的确定性网络近似这个平均行为。

**Bayesian 推断和不确定性。** 预测有时需要对参数或潜变量的后验分布积分。直接积分通常不可行，于是使用采样估计预测均值、置信区间或风险。

**扩散和生成模型。** 采样过程本身就是模型的一部分。理解种子、随机性、方差和重复实验，有助于判断生成结果是否稳定，而不是把一次样本误读成模型全部行为。`,
      md`Monte Carlo in machine learning is not mainly about estimating \(\pi\). More often, it replaces a large average, integral, or expectation with a computable random estimate.

**Mini-batch gradient descent.** The full-data gradient is an average over all training examples. Mini-batch training samples a subset each step and gets a noisy but cheap gradient estimate:

$$
\nabla L(\theta)\approx \frac{1}{B}\sum_{i\in \mathcal{B}}\nabla \ell_i(\theta).
$$

**Dropout.** During training, dropout randomly turns off parts of a network. This approximates the behavior of many subnetworks. At test time, a scaled deterministic network often approximates the average behavior.

**Bayesian inference and uncertainty.** Prediction may require integrating over a posterior distribution of parameters or latent variables. Direct integration is often infeasible, so sampling estimates predictive means, intervals, or risks.

**Diffusion and generative models.** Sampling is part of the model behavior itself. Understanding seeds, randomness, variance, and repeated trials helps avoid mistaking one generated sample for the model's full behavior.`,
    ),
  ),
  section(
    'monte-carlo-review',
    copy('复习问题', 'Review Questions'),
    copy(
      md`1. 伪随机数生成器为什么可以同时“随机”和“可复现”？
2. LCG 公式里的 \(a,c,M,x_0\) 分别控制什么？
3. 什么是生成器周期？周期太短会怎样影响 Monte Carlo？
4. 为什么公平硬币的期望是 \(0.5\)，但一次投掷不会得到 \(0.5\)？
5. 如何把 \(\int_a^b f(x)\,dx\) 写成均匀随机变量的期望？
6. 用单位正方形估计 \(\pi\) 时，为什么要计算圆内点的比例？
7. Monte Carlo 误差为什么通常按 \(1/\sqrt{N}\) 而不是 \(1/N\) 下降？
8. 如果想把误差大约减半，样本数通常要增加多少倍？
9. 在小批量梯度下降、dropout 或 Bayesian 推断中，Monte Carlo 思想分别对应什么？`,
      md`1. Why can a pseudorandom generator be both random-looking and reproducible?
2. In an LCG, what do \(a,c,M,x_0\) control?
3. What is a generator period, and how can a short period affect Monte Carlo?
4. Why is the expectation of a fair coin \(0.5\), even though one toss never returns \(0.5\)?
5. How can \(\int_a^b f(x)\,dx\) be written as an expectation over a uniform random variable?
6. When estimating \(\pi\) in the unit square, why do we count the fraction of points inside the circle?
7. Why does Monte Carlo error usually shrink like \(1/\sqrt{N}\) rather than \(1/N\)?
8. If you want to roughly halve the error, how many more samples do you usually need?
9. In mini-batch gradient descent, dropout, or Bayesian inference, what does the Monte Carlo idea correspond to?`,
    ),
  ),
]

export function buildMonteCarloModule(importedModule: MathLabModule): MathLabModule {
  return {
    ...importedModule,
    title: copy('随机数生成器与蒙特卡洛方法', 'Random Number Generators and Monte Carlo Methods'),
    subtitle: copy(
      '用可复现的随机采样，把面积、积分和模型期望变成可计算的平均值。',
      'Use reproducible random sampling to turn areas, integrals, and model expectations into computable averages.',
    ),
    estimatedMinutes: 35,
    prerequisites: ['taylor-series'],
    aiModelConnections: [
      copy(
        '小批量梯度、dropout、Bayesian 推断和生成模型采样都依赖“随机样本近似期望”的思想。',
        'Mini-batch gradients, dropout, Bayesian inference, and generative sampling all rely on random samples approximating expectations.',
      ),
      copy(
        '种子、周期和方差决定实验能否复现，以及采样估计是否值得信任。',
        'Seeds, periods, and variance determine whether experiments are reproducible and whether sampling estimates are trustworthy.',
      ),
    ],
    learningObjectives: [
      copy('解释伪随机数、种子、周期和可复现性的关系。', 'Explain how pseudorandom numbers, seeds, periods, and reproducibility are connected.'),
      copy('把随机变量的期望读成长期平均，并用样本均值估计它。', 'Read expectation as a long-run average and estimate it with a sample mean.'),
      copy('把面积和积分改写成 Monte Carlo 估计公式。', 'Rewrite areas and integrals as Monte Carlo estimators.'),
      copy(
        md`说明误差通常按 \(1/\sqrt{N}\) 下降，并识别采样偏差或短周期带来的失败场景。`,
        md`Explain why error often shrinks like \(1/\sqrt{N}\), and identify failures from biased sampling or short periods.`,
      ),
    ],
    concepts: [
      {
        id: 'monte-carlo-estimator-core',
        name: copy('Monte Carlo 积分估计器', 'Monte Carlo Integral Estimator'),
        formulaLatex: '\\hat I_N=(b-a)\\frac{1}{N}\\sum_{i=1}^{N}f(X_i)',
        variables: [
          {
            symbol: 'X_i',
            description: copy(
              md`从区间 \([a,b]\) 均匀抽到的第 \(i\) 个样本。`,
              md`The \(i\)-th sample drawn uniformly from \([a,b]\).`,
            ),
          },
          {
            symbol: 'N',
            description: copy('样本数量，主要控制估计方差。', 'The sample count, mainly controlling estimator variance.'),
          },
          {
            symbol: 'b-a',
            description: copy('把平均函数值转换回积分尺度的区间长度。', 'The interval length that converts the average function value back to integral scale.'),
          },
        ],
        plainExplanation: copy(
          'Monte Carlo 先把目标写成期望，再用随机样本上的平均值替代这个期望。',
          'Monte Carlo first writes the target as an expectation, then replaces that expectation with an average over random samples.',
        ),
        geometricIntuition: copy(
          '每个样本像一次局部探测；样本云覆盖目标区域后，平均读数就接近整体面积或积分。',
          'Each sample is a local probe; once the sample cloud covers the region, the average readout approximates the area or integral.',
        ),
        numericalExample: copy(
          md`四个样本 \(0.2,0.4,0.6,0.8\) 估计 \(\int_0^1 x^2dx\) 得到 \(0.30\)，真实值为 \(1/3\)。`,
          md`Four samples \(0.2,0.4,0.6,0.8\) estimate \(\int_0^1x^2dx\) as \(0.30\); the exact value is \(1/3\).`,
        ),
        codeExample:
          'import random\n\nrandom.seed(17)\nN = 10000\ninside = 0\nfor _ in range(N):\n    x = random.random()\n    y = random.random()\n    inside += x*x + y*y <= 1\nprint(4 * inside / N)',
        modelConnection: copy(
          '小批量训练、dropout 和 Bayesian 预测都把难以直接计算的期望换成随机样本平均。',
          'Mini-batch training, dropout, and Bayesian prediction replace hard expectations with averages over random samples.',
        ),
      },
    ],
    sections,
    toc: sections.map((item) => ({
      id: item.id,
      level: item.level,
      title: item.title,
    })),
    visuals: [
      {
        id: 'monte-carlo-sampling-video',
        type: 'manim-video',
        title: copy('从点数比例到面积估计', 'From sample fraction to area estimate'),
        assetPath: '/manim/math-lab/monte-carlo-sampling.mp4',
        posterPath: '/manim/math-lab/monte-carlo-sampling.svg',
        transcript: copy(
          md`动画从单位正方形和四分之一圆开始，逐批加入采样点，并用圆内点比例解释面积估计。`,
          md`The animation starts with a unit square and quarter circle, adds sample points in batches, and connects the inside fraction to an area estimate.`,
        ),
        learningPurpose: copy(
          '先用动画固定“圆心在左下角、圆内比例代表面积”的几何直觉，再进入可调实验台。',
          'Use motion to fix the geometry that the circle center is at the lower-left corner and the inside fraction represents area before using the lab.',
        ),
      },
    ],
    labs: [
      {
        id: 'monte-carlo-sampling-lab',
        title: copy('采样误差与伪随机周期实验', 'Sampling Error and Pseudorandom Period Lab'),
        type: 'interactive-visual',
        componentName: 'MonteCarloLab',
        successCriteria: [
          copy(
            md`能说明 \(\hat\pi=4\hat p\) 中 \(\hat p\) 来自圆内样本比例。`,
            md`Explain that \(\hat p\) in \(\hat\pi=4\hat p\) is the fraction of samples inside the circle.`,
          ),
          copy(
            md`能观察到样本数增加时误差整体变小，但不会按 \(1/N\) 线性下降。`,
            md`Observe that increasing samples generally reduces error, but not linearly like \(1/N\).`,
          ),
          copy('能解释短周期生成器为什么会制造重复图案。', 'Explain why a short-period generator creates repeated patterns.'),
        ],
      },
    ],
    quizzes: [
      {
        id: 'monte-carlo-seed-repeatability',
        type: 'single-choice',
        prompt: copy(
          '同一个伪随机数生成器使用相同 seed 时，通常会发生什么？',
          'What usually happens when the same pseudorandom generator uses the same seed?',
        ),
        choices: [
          {
            id: 'same-sequence',
            label: copy('得到同一条序列，便于复现实验', 'It produces the same sequence, making experiments reproducible'),
          },
          {
            id: 'true-random',
            label: copy('每次都得到完全不可复现的物理随机数', 'It produces completely unreproducible physical randomness every time'),
          },
        ],
        answer: 'same-sequence',
        explanation: copy(
          md`伪随机序列由确定性递推产生，例如 LCG 的 \(x_{k+1}=(a x_k+c)\bmod M\)。相同算法和 seed 会重复同一序列。`,
          md`A pseudorandom sequence is produced by a deterministic recurrence, such as the LCG rule \(x_{k+1}=(a x_k+c)\bmod M\). The same algorithm and seed repeat the same sequence.`,
        ),
        misconceptionTags: ['monte-carlo-random-means-unrepeatable'],
      },
      {
        id: 'monte-carlo-error-scaling',
        type: 'single-choice',
        prompt: copy(
          md`如果 Monte Carlo 样本数从 \(N\) 增加到 \(4N\)，典型误差通常怎样变化？`,
          md`If the Monte Carlo sample count increases from \(N\) to \(4N\), how does typical error usually change?`,
        ),
        choices: [
          {
            id: 'half',
            label: copy('大约减半', 'It is roughly halved'),
          },
          {
            id: 'quarter',
            label: copy('大约变成四分之一', 'It is roughly quartered'),
          },
        ],
        answer: 'half',
        explanation: copy(
          md`Monte Carlo 误差通常是 \(O(1/\sqrt{N})\)。把 \(N\) 变成 \(4N\)，分母变成 \(\sqrt{4N}=2\sqrt{N}\)，所以误差尺度约减半。`,
          md`Monte Carlo error is often \(O(1/\sqrt{N})\). Replacing \(N\) with \(4N\) changes the denominator to \(\sqrt{4N}=2\sqrt{N}\), so the error scale is roughly halved.`,
        ),
        misconceptionTags: ['monte-carlo-linear-error'],
      },
    ],
    misconceptions: [
      {
        id: 'monte-carlo-linear-error',
        statement: copy(
          'Monte Carlo 样本翻倍，误差就会减半。',
          'Doubling Monte Carlo samples halves the error.',
        ),
        correction: copy(
          md`典型误差通常按 \(1/\sqrt{N}\) 缩小；要让误差约减半，常常需要 \(4\) 倍样本。`,
          md`Typical error usually shrinks like \(1/\sqrt{N}\); roughly halving it often takes \(4\) times as many samples.`,
        ),
        example: copy(
          md`如果 \(1000\) 个样本的误差量级约为 \(0.03\)，那么 \(4000\) 个样本更可能接近 \(0.015\)，不是 \(0.0075\)。`,
          md`If \(1000\) samples have an error scale near \(0.03\), \(4000\) samples are more likely near \(0.015\), not \(0.0075\).`,
        ),
      },
      {
        id: 'monte-carlo-random-means-unrepeatable',
        statement: copy(
          '随机实验只要能复现，就不是真正的随机采样。',
          'If a random experiment is reproducible, it is not really random sampling.',
        ),
        correction: copy(
          '数值实验常用伪随机数：它们在统计上模拟随机抽样，同时通过 seed 保持可复现。',
          'Numerical experiments often use pseudorandom numbers: they statistically mimic random sampling while remaining reproducible through a seed.',
        ),
        example: copy(
          '训练模型时固定 seed 可以复现实验；更换 seed 可以检查结论是否依赖偶然样本。',
          'Fixing a seed can reproduce a training run; changing the seed checks whether a conclusion depends on one accidental sample path.',
        ),
      },
    ],
  }
}
