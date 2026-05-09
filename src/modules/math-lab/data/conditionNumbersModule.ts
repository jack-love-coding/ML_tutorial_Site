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
    'condition-numbers-learning-objectives',
    copy('学习目标', 'Learning Objectives'),
    copy(
      md`读完这一章后，你应该能把“矩阵可逆”和“数值上可靠”区分开来。本章关注两个问题：怎样计算条件数，以及条件数大时输出误差会怎样放大。我们会把这条主线连接到线性系统、残差、有效数字和机器学习训练稳定性。

你需要掌握：

- 计算方阵的条件数 \(\kappa(A)=\|A\|\|A^{-1}\|\)，并说明常见的 \(\kappa_1\)、\(\kappa_2\)、\(\kappa_\infty\) 分别依赖哪种矩阵范数。
- 用条件数给出线性系统 \(A\mathbf{x}=\mathbf{b}\) 中右端扰动和矩阵扰动造成的相对解误差上界。
- 解释为什么 \(\kappa(A)\ge 1\)，为什么正交矩阵在 2-范数下有最优条件数，为什么奇异矩阵按约定有 \(\kappa(A)=\infty\)。
- 区分残差 \( \mathbf{r}=\mathbf{b}-A\hat{\mathbf{x}} \) 与真实误差 \( \Delta\mathbf{x}=\hat{\mathbf{x}}-\mathbf{x} \)。
- 使用“若输入有 \(s\) 位有效数字且 \(\kappa(A)\approx 10^w\)，输出大约保留 \(s-w\) 位有效数字”的经验规则。
- 把条件数连接到特征缩放、病态最小二乘、狭长 Hessian 谷地和训练不稳定。

本章的核心直觉很短：条件数不是算法的速度指标，而是问题本身对输入误差的敏感度指标。算法可以让残差很小，但如果问题病态，小残差仍可能对应很差的解。`,
      md`By the end of this chapter, you should be able to separate "invertible" from "numerically reliable." The chapter focuses on two questions: how to compute a condition number, and how a large condition number amplifies output error. We connect that thread to linear systems, residuals, significant digits, and training stability in machine learning.

You should be able to:

- Compute the condition number of a square matrix, \(\kappa(A)=\|A\|\|A^{-1}\|\), and explain how \(\kappa_1\), \(\kappa_2\), and \(\kappa_\infty\) depend on different matrix norms.
- Use a condition number to bound relative solution error caused by right-hand-side perturbations and matrix perturbations in \(A\mathbf{x}=\mathbf{b}\).
- Explain why \(\kappa(A)\ge 1\), why orthogonal matrices have optimal 2-norm conditioning, and why singular matrices are assigned \(\kappa(A)=\infty\) by convention.
- Distinguish the residual \(\mathbf{r}=\mathbf{b}-A\hat{\mathbf{x}}\) from the true error \(\Delta\mathbf{x}=\hat{\mathbf{x}}-\mathbf{x}\).
- Use the rule of thumb: if the input has \(s\) correct decimal digits and \(\kappa(A)\approx 10^w\), then the solution has about \(s-w\) correct decimal digits.
- Connect conditioning to feature scaling, ill-conditioned least squares, narrow Hessian valleys, and unstable training.

The core intuition is short: a condition number is not an algorithm speed measure. It measures the sensitivity of the problem itself to input error. An algorithm can produce a small residual, but if the problem is ill-conditioned, that small residual can still correspond to a poor solution.`,
    ),
  ),
  section(
    'condition-numbers-numerical-experiments',
    copy('数值实验为什么需要敏感性分析', 'Why Numerical Experiments Need Sensitivity Analysis'),
    copy(
      md`数值计算的输入通常并不完美。最常见的两类不确定性是：

- 有限精度表示带来的舍入误差。
- 采样、测量或数据收集带来的输入误差。

一旦选择了数值方法，我们真正想知道的是：输入中这么小的误差会在输出中变成多大？方法是否对输入扰动敏感？

在线性系统里，这个问题可以写得很具体。设

$$
A\mathbf{x}=\mathbf{b}
$$

是原问题。如果右端项 \(\mathbf{b}\) 里有一个小扰动 \(\Delta\mathbf{b}\)，新的系统就是

$$
A\hat{\mathbf{x}}=\mathbf{b}+\Delta\mathbf{b}.
$$

我们关心的不是 \(\Delta\mathbf{b}\) 的绝对大小，而是它相对于 \(\mathbf{b}\) 的大小；同理，输出误差也要相对于真实解 \(\mathbf{x}\) 来衡量：

$$
\frac{\|\Delta\mathbf{b}\|}{\|\mathbf{b}\|},
\qquad
\frac{\|\Delta\mathbf{x}\|}{\|\mathbf{x}\|},
\qquad
\Delta\mathbf{x}=\hat{\mathbf{x}}-\mathbf{x}.
$$

条件数要回答的问题就是：这两个相对量之间最坏会差多少倍？`,
      md`Numerical inputs are rarely perfect. Two common sources of uncertainty are:

- Roundoff error from finite-precision representation.
- Input error from sampling, measurement, or data collection.

Once a numerical method is chosen, the question is: how much output error should we expect from a small input error? Is the method, or the problem, sensitive to perturbations in the input?

For a linear system this question can be written concretely. Let

$$
A\mathbf{x}=\mathbf{b}
$$

be the original problem. If the right-hand side \(\mathbf{b}\) has a small perturbation \(\Delta\mathbf{b}\), the new system is

$$
A\hat{\mathbf{x}}=\mathbf{b}+\Delta\mathbf{b}.
$$

The important quantity is not the absolute size of \(\Delta\mathbf{b}\), but its size relative to \(\mathbf{b}\). Likewise, output error is measured relative to the exact solution:

$$
\frac{\|\Delta\mathbf{b}\|}{\|\mathbf{b}\|},
\qquad
\frac{\|\Delta\mathbf{x}\|}{\|\mathbf{x}\|},
\qquad
\Delta\mathbf{x}=\hat{\mathbf{x}}-\mathbf{x}.
$$

The condition number answers this question: in the worst case, how many times larger can the relative output error be than the relative input error?`,
    ),
  ),
  section(
    'condition-numbers-sensitivity-of-solutions-of-linear-systems-and-error-bound',
    copy('线性系统解的敏感性与误差界', 'Sensitivity of Linear-System Solutions and Error Bounds'),
    copy(
      md`设 \(A\) 非奇异，\(\mathbf{x}\) 是

$$
A\mathbf{x}=\mathbf{b}
$$

的解，\(\hat{\mathbf{x}}\) 是扰动系统

$$
A\hat{\mathbf{x}}=\mathbf{b}+\Delta\mathbf{b}
$$

的解。令

$$
\Delta\mathbf{x}=\hat{\mathbf{x}}-\mathbf{x}.
$$

将 \(A\hat{\mathbf{x}}\) 写成 \(A(\mathbf{x}+\Delta\mathbf{x})\)，得到

$$
A\mathbf{x}+A\Delta\mathbf{x}=\mathbf{b}+\Delta\mathbf{b}.
$$

因为 \(A\mathbf{x}=\mathbf{b}\)，所以

$$
A\Delta\mathbf{x}=\Delta\mathbf{b},
\qquad
\Delta\mathbf{x}=A^{-1}\Delta\mathbf{b}.
$$

接下来比较相对输出误差和相对输入误差：

$$
\begin{aligned}
\frac{\|\Delta\mathbf{x}\|/\|\mathbf{x}\|}{\|\Delta\mathbf{b}\|/\|\mathbf{b}\|}
&=
\frac{\|\Delta\mathbf{x}\|\,\|\mathbf{b}\|}{\|\mathbf{x}\|\,\|\Delta\mathbf{b}\|}\\
&=
\frac{\|A^{-1}\Delta\mathbf{b}\|\,\|A\mathbf{x}\|}{\|\mathbf{x}\|\,\|\Delta\mathbf{b}\|}\\
&\le
\frac{\|A^{-1}\|\,\|\Delta\mathbf{b}\|\,\|A\|\,\|\mathbf{x}\|}{\|\mathbf{x}\|\,\|\Delta\mathbf{b}\|}\\
&=\|A^{-1}\|\|A\|.
\end{aligned}
$$

这里用到了诱导矩阵范数的性质

$$
\|A\mathbf{x}\|\le \|A\|\,\|\mathbf{x}\|.
$$

于是得到右端项扰动的经典误差界：

$$
\frac{\|\Delta\mathbf{x}\|}{\|\mathbf{x}\|}
\le
\operatorname{cond}(A)\frac{\|\Delta\mathbf{b}\|}{\|\mathbf{b}\|}.
$$

如果扰动不在 \(\mathbf{b}\)，而是在矩阵本身，即

$$
(A+E)\hat{\mathbf{x}}=\mathbf{b},
$$

类似地可以得到

$$
\frac{\|\Delta\mathbf{x}\|}{\|\mathbf{x}\|}
\le
\operatorname{cond}(A)\frac{\|E\|}{\|A\|}.
$$

这些不等式都是上界，而不是承诺每次都会达到。它们告诉我们：若已知输入相对误差，就可以用条件数估计输出相对误差的最坏规模。

**小例题。** 一个矩阵最好的可能条件数是多少？不能小于 \(1\)，因为

$$
\operatorname{cond}(A)=\|A\|\|A^{-1}\|\ge \|AA^{-1}\|=\|I\|=1.
$$

因此最优值是 \(\operatorname{cond}(A)=1\)。单位矩阵就是这样的例子。`,
      md`Let \(A\) be nonsingular. Let \(\mathbf{x}\) solve

$$
A\mathbf{x}=\mathbf{b},
$$

and let \(\hat{\mathbf{x}}\) solve the perturbed system

$$
A\hat{\mathbf{x}}=\mathbf{b}+\Delta\mathbf{b}.
$$

Define

$$
\Delta\mathbf{x}=\hat{\mathbf{x}}-\mathbf{x}.
$$

Writing \(A\hat{\mathbf{x}}\) as \(A(\mathbf{x}+\Delta\mathbf{x})\) gives

$$
A\mathbf{x}+A\Delta\mathbf{x}=\mathbf{b}+\Delta\mathbf{b}.
$$

Since \(A\mathbf{x}=\mathbf{b}\),

$$
A\Delta\mathbf{x}=\Delta\mathbf{b},
\qquad
\Delta\mathbf{x}=A^{-1}\Delta\mathbf{b}.
$$

Now compare relative output error with relative input error:

$$
\begin{aligned}
\frac{\|\Delta\mathbf{x}\|/\|\mathbf{x}\|}{\|\Delta\mathbf{b}\|/\|\mathbf{b}\|}
&=
\frac{\|\Delta\mathbf{x}\|\,\|\mathbf{b}\|}{\|\mathbf{x}\|\,\|\Delta\mathbf{b}\|}\\
&=
\frac{\|A^{-1}\Delta\mathbf{b}\|\,\|A\mathbf{x}\|}{\|\mathbf{x}\|\,\|\Delta\mathbf{b}\|}\\
&\le
\frac{\|A^{-1}\|\,\|\Delta\mathbf{b}\|\,\|A\|\,\|\mathbf{x}\|}{\|\mathbf{x}\|\,\|\Delta\mathbf{b}\|}\\
&=\|A^{-1}\|\|A\|.
\end{aligned}
$$

This uses the induced-matrix-norm property

$$
\|A\mathbf{x}\|\le \|A\|\,\|\mathbf{x}\|.
$$

So the classic right-hand-side perturbation bound is

$$
\frac{\|\Delta\mathbf{x}\|}{\|\mathbf{x}\|}
\le
\operatorname{cond}(A)\frac{\|\Delta\mathbf{b}\|}{\|\mathbf{b}\|}.
$$

If the perturbation is in the matrix instead of the right-hand side,

$$
(A+E)\hat{\mathbf{x}}=\mathbf{b},
$$

a similar argument gives

$$
\frac{\|\Delta\mathbf{x}\|}{\|\mathbf{x}\|}
\le
\operatorname{cond}(A)\frac{\|E\|}{\|A\|}.
$$

These inequalities are upper bounds, not promises that every perturbation reaches the bound. They tell us the worst-case scale of output error when the input relative error is known.

**Small example.** What is the best possible condition number of a matrix? It cannot be below \(1\), because

$$
\operatorname{cond}(A)=\|A\|\|A^{-1}\|\ge \|AA^{-1}\|=\|I\|=1.
$$

So the optimal value is \(\operatorname{cond}(A)=1\). The identity matrix is such an example.`,
    ),
    { labIds: ['condition-number-amplification-lab'] },
  ),
  section(
    'condition-numbers-condition-number',
    copy('条件数的定义、范数与例子', 'Condition Number Definition, Norms, and Examples'),
    copy(
      md`条件数是衡量“求解线性系统对输入变化有多敏感”的量。对非奇异方阵 \(A\)，定义为

$$
\operatorname{cond}(A)=\kappa(A)=\|A\|\|A^{-1}\|.
$$

这也是求解 \(A\mathbf{x}=\mathbf{b}\) 的条件数。条件数大的矩阵称为病态矩阵（ill-conditioned）；条件数小的矩阵称为良态矩阵（well-conditioned）。如果 \(A\) 奇异，\(A^{-1}\) 不存在，通常约定

$$
\operatorname{cond}(A)=\infty.
$$

### 诱导矩阵范数

诱导矩阵范数定义为

$$
\|A\|_p=\max_{\|\mathbf{x}\|_p=1}\|A\mathbf{x}\|_p.
$$

因此条件数也要说明使用哪种范数：

$$
\operatorname{cond}_p(A)=\|A\|_p\|A^{-1}\|_p.
$$

常用几种情况是：

| 范数 | 计算方式 |
| --- | --- |
| \(1\)-范数 | \(\|A\|_1=\max_j\sum_{i=1}^n |a_{ij}|\)，最大绝对列和 |
| \(\infty\)-范数 | \(\|A\|_\infty=\max_i\sum_{j=1}^n |a_{ij}|\)，最大绝对行和 |
| \(2\)-范数 | \(\|A\|_2=\max_k\sigma_k\)，最大奇异值 |

在 2-范数下，

$$
\kappa_2(A)=\frac{\sigma_{\max}(A)}{\sigma_{\min}(A)}.
$$

这个形式最容易连接几何直觉：矩阵把单位圆变成椭圆，最大奇异值是最长半轴，最小奇异值是最短半轴。长短差越悬殊，逆变换越容易把短方向上的噪声拉长。

### 正交矩阵的条件数

如果 \(A\) 是正交矩阵，那么 \(A^{-1}=A^T\)，并且在 2-范数下 \(\|A\|_2=\|A^T\|_2=1\)。因此

$$
\operatorname{cond}_2(A)=\|A\|_2\|A^{-1}\|_2
=\|A\|_2\|A^T\|_2=1.
$$

这说明正交矩阵在 2-范数下具有最优条件数。

### 需要记住的性质

- 对任何非奇异矩阵 \(A\)，\(\operatorname{cond}(A)\ge 1\)。
- 对单位矩阵 \(I\)，\(\operatorname{cond}(I)=1\)。
- 对任意非零标量 \(\gamma\)，\(\operatorname{cond}(\gamma A)=\operatorname{cond}(A)\)。整体缩放不会改变条件数。
- 对对角矩阵 \(D\)，\(\operatorname{cond}(D)=\frac{\max_i |d_i|}{\min_i |d_i|}\)。
- 条件数大说明矩阵接近奇异；条件数接近 \(1\) 说明远离奇异。
- 行列式不是判断“接近奇异”的好指标。整体缩放能让行列式很大或很小，却不一定改变条件数。

**手算例题。** 对

$$
A=
\begin{bmatrix}
100&0&0\\
0&13&0\\
0&0&0.5
\end{bmatrix},
$$

在 2-范数下，对角元素的绝对值就是奇异值。因此

$$
\operatorname{cond}_2(A)=\frac{100}{0.5}=200.
$$

也可以先写出

$$
A^{-1}=
\begin{bmatrix}
1/100&0&0\\
0&1/13&0\\
0&0&2
\end{bmatrix},
$$

于是 \(\|A\|_2=100\)、\(\|A^{-1}\|_2=2\)，乘积仍为 \(200\)。`,
      md`A condition number measures how sensitive the solution of a linear system is to changes in the input. For a nonsingular square matrix \(A\), it is defined as

$$
\operatorname{cond}(A)=\kappa(A)=\|A\|\|A^{-1}\|.
$$

This is also the condition number associated with solving \(A\mathbf{x}=\mathbf{b}\). A matrix with a large condition number is called ill-conditioned; a matrix with a small condition number is called well-conditioned. If \(A\) is singular, \(A^{-1}\) does not exist, and by convention

$$
\operatorname{cond}(A)=\infty.
$$

### Induced Matrix Norms

The induced matrix norm is

$$
\|A\|_p=\max_{\|\mathbf{x}\|_p=1}\|A\mathbf{x}\|_p.
$$

So a condition number should specify the norm:

$$
\operatorname{cond}_p(A)=\|A\|_p\|A^{-1}\|_p.
$$

Common cases are:

| Norm | Computation |
| --- | --- |
| \(1\)-norm | \(\|A\|_1=\max_j\sum_{i=1}^n |a_{ij}|\), the largest absolute column sum |
| \(\infty\)-norm | \(\|A\|_\infty=\max_i\sum_{j=1}^n |a_{ij}|\), the largest absolute row sum |
| \(2\)-norm | \(\|A\|_2=\max_k\sigma_k\), the largest singular value |

Under the 2-norm,

$$
\kappa_2(A)=\frac{\sigma_{\max}(A)}{\sigma_{\min}(A)}.
$$

This form gives the cleanest geometric intuition: a matrix maps the unit circle to an ellipse. The largest singular value is the longest semiaxis, and the smallest singular value is the shortest semiaxis. The more unequal those lengths are, the more the inverse can stretch noise in the short direction.

### Condition Number of Orthogonal Matrices

If \(A\) is orthogonal, then \(A^{-1}=A^T\), and under the 2-norm \(\|A\|_2=\|A^T\|_2=1\). Therefore

$$
\operatorname{cond}_2(A)=\|A\|_2\|A^{-1}\|_2
=\|A\|_2\|A^T\|_2=1.
$$

Orthogonal matrices have optimal 2-norm conditioning.

### Things to Remember

- For any nonsingular matrix \(A\), \(\operatorname{cond}(A)\ge 1\).
- For the identity matrix \(I\), \(\operatorname{cond}(I)=1\).
- For any nonzero scalar \(\gamma\), \(\operatorname{cond}(\gamma A)=\operatorname{cond}(A)\). Overall scaling does not change conditioning.
- For any diagonal matrix \(D\), \(\operatorname{cond}(D)=\frac{\max_i |d_i|}{\min_i |d_i|}\).
- A large condition number means the matrix is close to singular; a condition number near \(1\) means it is far from singular.
- The determinant is not a good indicator of near singularity. Overall scaling can make a determinant huge or tiny without necessarily changing the condition number.

**Worked example.** For

$$
A=
\begin{bmatrix}
100&0&0\\
0&13&0\\
0&0&0.5
\end{bmatrix},
$$

the absolute diagonal entries are the singular values. Therefore

$$
\operatorname{cond}_2(A)=\frac{100}{0.5}=200.
$$

Equivalently,

$$
A^{-1}=
\begin{bmatrix}
1/100&0&0\\
0&1/13&0\\
0&0&2
\end{bmatrix},
$$

so \(\|A\|_2=100\), \(\|A^{-1}\|_2=2\), and the product is still \(200\).`,
    ),
  ),
  section(
    'condition-numbers-geometric-ml-intuition',
    copy('从几何直觉到机器学习稳定性', 'From Geometric Intuition to Machine-Learning Stability'),
    copy(
      md`条件数大的常见几何原因是：矩阵把空间压得很扁。若 \(A\) 把单位圆变成一条很细的椭圆，那么某个方向上的信息几乎被压没了。求解 \(A\mathbf{x}=\mathbf{b}\) 相当于应用逆变换 \(A^{-1}\)，而逆变换会把这个被压扁的方向重新拉长。于是右端项 \(\mathbf{b}\) 中很小的噪声，也可能变成 \(\mathbf{x}\) 中很大的变化。

对 \(2\times2\) 矩阵，另一个直观读法是“列向量是否几乎平行”。如果两列几乎平行，很多不同的系数组合都能产生相近的输出向量。此时给定 \(\mathbf{b}\) 后，系统很难稳定地区分到底应该使用哪组系数。

机器学习中会反复遇到同一个问题：

**特征缩放。** 如果一个特征以米为单位，另一个以毫米为单位，同一个线性模型的设计矩阵可能出现尺度差异。优化器会在狭长的损失谷地里来回震荡，学习率也更难选择。标准化或归一化特征常常能降低这类病态性。

**病态最小二乘。** 当两个特征高度相关时，设计矩阵 \(X\) 的列接近平行。最小二乘的法方程使用 \(X^T X\)，并且

$$
\operatorname{cond}(X^TX)=\operatorname{cond}(X)^2
$$

在 2-范数下成立。因此法方程会把病态性平方放大，这也是数值库常改用 QR 或 SVD 的原因。

**二阶优化。** Newton 法或拟 Newton 法会遇到 Hessian 或近似 Hessian。若曲率在不同方向上差异巨大，Hessian 条件数很大，步长会对梯度误差、舍入误差和阻尼策略非常敏感。

**训练不稳定。** 梯度范数爆炸、特征尺度混乱、层归一化前后的尺度变化，都可以用“某些方向被放大太多、某些方向被压得太小”来理解。条件数提供的是一个数值稳定性的语言，而不只是线性代数练习。`,
      md`A common geometric reason for a large condition number is that the matrix flattens space. If \(A\) maps the unit circle to a very thin ellipse, information in one direction has nearly disappeared. Solving \(A\mathbf{x}=\mathbf{b}\) applies the inverse map \(A^{-1}\), and that inverse stretches the flattened direction back out. Tiny noise in \(\mathbf{b}\) can therefore become a large change in \(\mathbf{x}\).

For a \(2\times2\) matrix, another useful reading is whether the columns are nearly parallel. If two columns are nearly parallel, many different coefficient combinations produce nearly the same output vector. Given \(\mathbf{b}\), the system has trouble stably distinguishing which coefficient combination should be used.

Machine learning repeatedly meets the same issue:

**Feature scaling.** If one feature is measured in meters and another in millimeters, the design matrix for the same linear model can have severe scale mismatch. Optimizers can bounce through a narrow loss valley, and learning-rate choice becomes harder. Standardizing or normalizing features often reduces this kind of ill-conditioning.

**Ill-conditioned least squares.** When two features are highly correlated, the columns of the design matrix \(X\) are nearly parallel. The normal equations use \(X^TX\), and under the 2-norm,

$$
\operatorname{cond}(X^TX)=\operatorname{cond}(X)^2.
$$

The normal equations therefore square the conditioning problem, which is why numerical libraries often prefer QR or SVD.

**Second-order optimization.** Newton and quasi-Newton methods encounter a Hessian or approximate Hessian. If curvature differs greatly across directions, the Hessian is ill-conditioned, and the step becomes sensitive to gradient error, roundoff, and damping strategy.

**Training instability.** Exploding gradients, inconsistent feature scales, and scale changes around normalization layers can all be read as "some directions are amplified too much while others are compressed too much." Condition numbers provide a language for numerical stability, not just a linear-algebra exercise.`,
    ),
  ),
  section(
    'condition-numbers-residual-vs-error',
    copy('残差与误差不是一回事', 'Residual and Error Are Not the Same Thing'),
    copy(
      md`对线性系统 \(A\mathbf{x}=\mathbf{b}\)，近似解 \(\hat{\mathbf{x}}\) 的残差向量定义为

$$
\mathbf{r}=\mathbf{b}-A\hat{\mathbf{x}}.
$$

如果 \(\hat{\mathbf{x}}\) 实际上满足扰动系统

$$
A\hat{\mathbf{x}}=\mathbf{b}+\Delta\mathbf{b},
$$

那么

$$
\mathbf{r}=\mathbf{b}-(\mathbf{b}+\Delta\mathbf{b})=-\Delta\mathbf{b}.
$$

因此右端项扰动的误差界也可以写成

$$
\frac{\|\Delta\mathbf{x}\|}{\|\mathbf{x}\|}
\le
\operatorname{cond}(A)\frac{\|\mathbf{r}\|}{\|\mathbf{b}\|}.
$$

这句话非常重要：小相对残差

$$
\frac{\|\mathbf{r}\|}{\|\mathbf{b}\|}
$$

只有在 \(A\) 条件良好时，才自动意味着小相对误差。残差衡量的是近似解代回方程后满足方程的程度；误差衡量的是近似解离真实解有多远。真实解通常未知，所以实际计算中常看残差，但不能把两者混为一谈。

**手算例题。** 令

$$
A=
\begin{bmatrix}
13&0&0\\
0&1&0\\
0&0&15
\end{bmatrix}.
$$

若相对残差为 \(10^{-4}\)，使用 2-范数时

$$
\operatorname{cond}_2(A)=\frac{15}{1}=15.
$$

因此相对输出误差的上界为

$$
\frac{\|\Delta\mathbf{x}\|}{\|\mathbf{x}\|}
\le
15\cdot 10^{-4}.
$$

注意这仍然是上界。它说明“最多可能被放大到这个量级”，不是说明真实误差一定等于 \(15\cdot 10^{-4}\)。`,
      md`For a linear system \(A\mathbf{x}=\mathbf{b}\), the residual vector of an approximate solution \(\hat{\mathbf{x}}\) is

$$
\mathbf{r}=\mathbf{b}-A\hat{\mathbf{x}}.
$$

If \(\hat{\mathbf{x}}\) actually satisfies the perturbed system

$$
A\hat{\mathbf{x}}=\mathbf{b}+\Delta\mathbf{b},
$$

then

$$
\mathbf{r}=\mathbf{b}-(\mathbf{b}+\Delta\mathbf{b})=-\Delta\mathbf{b}.
$$

So the right-hand-side perturbation bound can also be written as

$$
\frac{\|\Delta\mathbf{x}\|}{\|\mathbf{x}\|}
\le
\operatorname{cond}(A)\frac{\|\mathbf{r}\|}{\|\mathbf{b}\|}.
$$

This statement matters: a small relative residual

$$
\frac{\|\mathbf{r}\|}{\|\mathbf{b}\|}
$$

implies small relative error only when \(A\) is well-conditioned. The residual measures how well the approximate solution satisfies the equation after substitution. The error measures how close the approximate solution is to the exact solution. The exact solution is usually unknown, so residuals are practical, but residual and error are not the same thing.

**Worked example.** Let

$$
A=
\begin{bmatrix}
13&0&0\\
0&1&0\\
0&0&15
\end{bmatrix}.
$$

If the relative residual is \(10^{-4}\), then under the 2-norm,

$$
\operatorname{cond}_2(A)=\frac{15}{1}=15.
$$

Therefore the relative output error is bounded by

$$
\frac{\|\Delta\mathbf{x}\|}{\|\mathbf{x}\|}
\le
15\cdot 10^{-4}.
$$

This is still an upper bound. It says the error can be amplified up to this scale; it does not say the actual error must equal \(15\cdot 10^{-4}\).`,
    ),
  ),
  section(
    'condition-numbers-alternative-definitions-of-relative-residual',
    copy('相对残差的几种定义', 'Alternative Definitions of Relative Residual'),
    copy(
      md`教材和软件文档中有几种相关量都被称为“相对残差”。最常见的一种是

$$
\frac{\|\mathbf{r}\|}{\|\mathbf{b}\|}.
$$

从误差出发，也可以推导另一种形式。因为

$$
\begin{aligned}
\|\Delta\mathbf{x}\|
&=\|\hat{\mathbf{x}}-\mathbf{x}\|\\
&=\|A^{-1}A\hat{\mathbf{x}}-A^{-1}\mathbf{b}\|\\
&=\|A^{-1}(A\hat{\mathbf{x}}-\mathbf{b})\|\\
&=\|A^{-1}\mathbf{r}\|\\
&\le \|A^{-1}\|\,\|\mathbf{r}\|\\
&=\operatorname{cond}(A)\frac{\|\mathbf{r}\|}{\|A\|}.
\end{aligned}
$$

于是

$$
\|\Delta\mathbf{x}\|\le
\operatorname{cond}(A)\frac{\|\mathbf{r}\|}{\|A\|}.
$$

两边再除以 \(\|\mathbf{x}\|\)，得到

$$
\frac{\|\Delta\mathbf{x}\|}{\|\mathbf{x}\|}
\le
\operatorname{cond}(A)
\frac{\|\mathbf{r}\|}{\|A\|\,\|\mathbf{x}\|}.
$$

这里的

$$
\frac{\|\mathbf{r}\|}{\|A\|\,\|\mathbf{x}\|}
$$

也会被称为相对残差。数学上它有用，但包含未知的真实解 \(\mathbf{x}\)，实际计算不方便。因为

$$
\|\mathbf{b}\|=\|A\mathbf{x}\|\le \|A\|\,\|\mathbf{x}\|,
$$

所以

$$
\frac{\|\mathbf{r}\|}{\|A\|\,\|\mathbf{x}\|}
\le
\frac{\|\mathbf{r}\|}{\|\mathbf{b}\|}.
$$

如果把分母中的真实解换成近似解，还会得到可计算的量

$$
\frac{\|\mathbf{r}\|}{\|A\|\,\|\hat{\mathbf{x}}\|}.
$$

这时左边不再严格是相对于真实解的误差，但右边常可作为合理估计。实际阅读文档时，要根据上下文判断“relative residual”指的是哪一种。`,
      md`Several related quantities may be called "relative residual" in textbooks and software documentation. The most common one is

$$
\frac{\|\mathbf{r}\|}{\|\mathbf{b}\|}.
$$

Starting from the error gives another form. Since

$$
\begin{aligned}
\|\Delta\mathbf{x}\|
&=\|\hat{\mathbf{x}}-\mathbf{x}\|\\
&=\|A^{-1}A\hat{\mathbf{x}}-A^{-1}\mathbf{b}\|\\
&=\|A^{-1}(A\hat{\mathbf{x}}-\mathbf{b})\|\\
&=\|A^{-1}\mathbf{r}\|\\
&\le \|A^{-1}\|\,\|\mathbf{r}\|\\
&=\operatorname{cond}(A)\frac{\|\mathbf{r}\|}{\|A\|},
\end{aligned}
$$

we have

$$
\|\Delta\mathbf{x}\|\le
\operatorname{cond}(A)\frac{\|\mathbf{r}\|}{\|A\|}.
$$

Dividing by \(\|\mathbf{x}\|\) gives

$$
\frac{\|\Delta\mathbf{x}\|}{\|\mathbf{x}\|}
\le
\operatorname{cond}(A)
\frac{\|\mathbf{r}\|}{\|A\|\,\|\mathbf{x}\|}.
$$

The quantity

$$
\frac{\|\mathbf{r}\|}{\|A\|\,\|\mathbf{x}\|}
$$

is also called a relative residual. It is mathematically useful, but it contains the unknown exact solution \(\mathbf{x}\), so it is not convenient in computation. Since

$$
\|\mathbf{b}\|=\|A\mathbf{x}\|\le \|A\|\,\|\mathbf{x}\|,
$$

we get

$$
\frac{\|\mathbf{r}\|}{\|A\|\,\|\mathbf{x}\|}
\le
\frac{\|\mathbf{r}\|}{\|\mathbf{b}\|}.
$$

Replacing the unknown exact solution with the approximate one gives the computable quantity

$$
\frac{\|\mathbf{r}\|}{\|A\|\,\|\hat{\mathbf{x}}\|}.
$$

The left-hand side is no longer exactly the relative error with respect to the true solution, but the right-hand side can still provide a reasonable estimate. When reading documentation, infer which "relative residual" is meant from the context.`,
    ),
  ),
  section(
    'condition-numbers-gaussian-elimination-with-partial-pivoting-is-guaranteed-to-produce-a-small-residual',
    copy('带部分主元的高斯消元为何仍需看条件数', 'Why Partial Pivoting Still Needs Conditioning'),
    copy(
      md`带部分主元的高斯消元在数值线性代数中很常见。关键要点是：使用带部分主元的高斯消元和回代求解 \(A\mathbf{x}=\mathbf{b}\)，得到近似解 \(\hat{\mathbf{x}}\) 时，残差通常满足

$$
\frac{\|\mathbf{r}\|}{\|A\|\,\|\hat{\mathbf{x}}\|}
\le
\frac{\|E\|}{\|A\|}
\le
c\epsilon_{\text{mach}}.
$$

这里 \(E\) 是后向误差，它由

$$
(A+E)\hat{\mathbf{x}}=\mathbf{b}
$$

定义；\(c\) 是与矩阵和消元过程有关的系数，\(\epsilon_{\text{mach}}\) 是机器精度。带部分主元时，\(c\) 通常较小；没有主元策略时，\(c\) 可能非常大。

这说明带部分主元的高斯消元通常可以保证**小相对残差**。但这不等于保证解准确。准确性还要乘上条件数：

$$
\text{相对解误差}
\lesssim
\kappa(A)\times \text{相对残差}.
$$

因此一个稳健求解器可以把“算出来的解精确满足某个非常接近的系统”，但如果原问题病态，这个近似系统的解仍可能离原系统真实解很远。这就是后向稳定性与前向误差之间的区别。`,
      md`Gaussian elimination with partial pivoting is standard in numerical linear algebra. The key point is: when it is used with back substitution to solve \(A\mathbf{x}=\mathbf{b}\), the computed solution \(\hat{\mathbf{x}}\) usually has residual satisfying

$$
\frac{\|\mathbf{r}\|}{\|A\|\,\|\hat{\mathbf{x}}\|}
\le
\frac{\|E\|}{\|A\|}
\le
c\epsilon_{\text{mach}}.
$$

Here \(E\) is the backward error defined by

$$
(A+E)\hat{\mathbf{x}}=\mathbf{b},
$$

\(c\) is a coefficient related to the matrix and the elimination process, and \(\epsilon_{\text{mach}}\) is machine epsilon. With partial pivoting, \(c\) is typically small; without pivoting, \(c\) can be arbitrarily large.

This says that Gaussian elimination with partial pivoting typically guarantees a **small relative residual**. It does not guarantee an accurate solution. Accuracy still involves the condition number:

$$
\text{relative solution error}
\lesssim
\kappa(A)\times \text{relative residual}.
$$

A stable solver can compute a solution that exactly satisfies a very nearby system, but if the original problem is ill-conditioned, the solution of that nearby system can still be far from the exact solution of the original system. This is the distinction between backward stability and forward error.`,
    ),
  ),
  section(
    'condition-numbers-accuracy-rule-of-thumb-for-conditioning',
    copy('有效数字经验规则', 'Accuracy Rule of Thumb for Conditioning'),
    copy(
      md`设使用带部分主元的高斯消元和回代求解

$$
A\mathbf{x}=\mathbf{b},
$$

得到计算解 \(\hat{\mathbf{x}}\)。如果 \(A\) 和 \(\mathbf{b}\) 的输入数据大约有 \(s\) 位十进制有效数字，并且

$$
\operatorname{cond}(A)\approx 10^w,
$$

那么解向量 \(\hat{\mathbf{x}}\) 的元素大约保留

$$
s-w
$$

位有效数字。

这条规则不是精确位数保证，而是实用估计。它来自“条件数大约放大 \(10^w\) 倍相对误差”的直觉：输入误差若是 \(10^{-s}\)，输出误差规模可能到 \(10^{w-s}\)，所以有效数字减少约 \(w\) 位。

**手算例题。** 若

$$
\operatorname{cond}(A)=10^{10},
$$

并且使用 IEEE double precision，输入接近机器精度。因为

$$
\epsilon_{\text{mach}}\approx 2.2\times 10^{-16},
$$

输入大约有 \(16\) 位十进制有效数字。于是解大约保留

$$
16-10=6
$$

位有效数字。

这个例子也解释了为什么训练和建模前要关心尺度：如果设计矩阵或 Hessian 的条件数已经吃掉了大部分有效数字，再好的后续步骤也只能在受损的信息上工作。`,
      md`Suppose Gaussian elimination with partial pivoting and back substitution is used to solve

$$
A\mathbf{x}=\mathbf{b},
$$

giving a computed solution \(\hat{\mathbf{x}}\). If the entries of \(A\) and \(\mathbf{b}\) are accurate to about \(s\) decimal digits, and

$$
\operatorname{cond}(A)\approx 10^w,
$$

then the entries of \(\hat{\mathbf{x}}\) are accurate to about

$$
s-w
$$

decimal digits.

This is not an exact digit guarantee; it is a practical estimate. It comes from the idea that the condition number can amplify relative error by about \(10^w\). If the input error scale is \(10^{-s}\), the output error scale can be around \(10^{w-s}\), so roughly \(w\) digits are lost.

**Worked example.** If

$$
\operatorname{cond}(A)=10^{10},
$$

and IEEE double precision is used, the input is close to machine precision. Since

$$
\epsilon_{\text{mach}}\approx 2.2\times 10^{-16},
$$

the input has about \(16\) correct decimal digits. The solution therefore has about

$$
16-10=6
$$

correct decimal digits.

This example also explains why scale matters before training or modeling. If the design matrix or Hessian has already consumed most useful digits through poor conditioning, later steps can only work with damaged information.`,
    ),
  ),
  section(
    'condition-numbers-review-questions',
    copy('复习问题', 'Review Questions'),
    copy(
      md`1. 条件数的定义是什么？每个范数符号代表什么？
2. 求解 \(A\mathbf{x}=\mathbf{b}\) 时，右端项相对误差怎样通过条件数影响相对解误差？
3. 如果扰动发生在矩阵 \(A\) 上，误差界怎样写？
4. 对给定 \(p\)-范数，怎样计算 \(\operatorname{cond}_p(A)\)？
5. 条件数应该越小越好还是越大越好？为什么最小可能值是 \(1\)？
6. 正交矩阵的 2-范数条件数是多少？为什么？
7. 对角矩阵的条件数怎样计算？
8. 如果 \(A\) 和 \(\mathbf{b}\) 有 \(s\) 位有效数字，且 \(\kappa(A)\approx 10^w\)，解大约有多少位有效数字？
9. 小残差是否保证解准确？还需要什么条件？
10. 带部分主元的高斯消元通常保证什么？它不能单独保证什么？
11. 为什么行列式不是判断接近奇异的可靠指标？
12. 在特征缩放、最小二乘和 Hessian 中，条件数分别对应什么学习风险？`,
      md`1. What is the definition of a condition number? What does each norm symbol mean?
2. When solving \(A\mathbf{x}=\mathbf{b}\), how does relative right-hand-side error affect relative solution error through the condition number?
3. If the perturbation is in the matrix \(A\), how is the error bound written?
4. For a given \(p\)-norm, how do you compute \(\operatorname{cond}_p(A)\)?
5. Do you want a small or large condition number? Why is the smallest possible value \(1\)?
6. What is the 2-norm condition number of an orthogonal matrix, and why?
7. How do you compute the condition number of a diagonal matrix?
8. If \(A\) and \(\mathbf{b}\) have \(s\) correct digits and \(\kappa(A)\approx 10^w\), about how many correct digits does the solution have?
9. Does a small residual guarantee an accurate solution? What else is needed?
10. What does Gaussian elimination with partial pivoting usually guarantee, and what does it not guarantee by itself?
11. Why is the determinant not a reliable indicator of near singularity?
12. In feature scaling, least squares, and Hessians, what learning risk does conditioning describe?`,
    ),
  ),
]

export function buildConditionNumbersModule(importedModule: MathLabModule): MathLabModule {
  return {
    ...importedModule,
    title: copy('条件数与敏感性', 'Condition Numbers'),
    subtitle: copy(
      '判断输入中的微小误差会在解中被放大多少，并理解为什么小残差不总是好答案。',
      'Measure how much tiny input errors can be amplified in the solution, and why a small residual is not always a good answer.',
    ),
    estimatedMinutes: 46,
    prerequisites: ['vectors-matrices-norms', 'lu-decomposition'],
    aiModelConnections: [
      copy(
        '特征缩放、病态最小二乘和狭长 Hessian 谷地都可以看作误差或梯度在某些方向被过度放大的问题。',
        'Feature scaling, ill-conditioned least squares, and narrow Hessian valleys can all be read as error or gradient amplification in selected directions.',
      ),
      copy(
        '条件数解释了为什么数值库偏好 QR、SVD、归一化和主元策略，而不只是“矩阵可逆就求解”。',
        'Conditioning explains why numerical libraries prefer QR, SVD, normalization, and pivoting strategies instead of merely solving whenever a matrix is invertible.',
      ),
    ],
    learningObjectives: [
      copy(md`计算并解释 \(\kappa(A)=\|A\|\|A^{-1}\|\)。`, md`Compute and interpret \(\kappa(A)=\|A\|\|A^{-1}\|\).`),
      copy('用条件数量化右端项扰动、矩阵扰动和残差对解误差的影响。', 'Use condition numbers to quantify how right-hand-side perturbations, matrix perturbations, and residuals affect solution error.'),
      copy('说明正交矩阵、对角矩阵、奇异矩阵和近奇异矩阵的条件数行为。', 'Explain the conditioning behavior of orthogonal, diagonal, singular, and nearly singular matrices.'),
      copy(md`使用 \(s-w\) 经验规则估计有效数字损失。`, md`Use the \(s-w\) rule of thumb to estimate lost correct digits.`),
      copy('把条件数连接到特征缩放、病态最小二乘和训练稳定性。', 'Connect conditioning to feature scaling, ill-conditioned least squares, and training stability.'),
    ],
    concepts: [
      {
        id: 'condition-number-core',
        name: copy('矩阵条件数', 'Matrix Condition Number'),
        formulaLatex: '\\kappa(A)=\\|A\\|\\|A^{-1}\\|',
        variables: [
          {
            symbol: 'A',
            description: copy('非奇异方阵，表示要求解或撤销的线性变换。', 'A nonsingular square matrix representing the linear map to solve or undo.'),
          },
          {
            symbol: '\\|A\\|',
            description: copy('矩阵在所选范数下最多能放大向量多少。', 'How much the matrix can amplify vectors under the chosen norm.'),
          },
          {
            symbol: '\\|A^{-1}\\|',
            description: copy('逆变换最多能放大误差多少。', 'How much the inverse map can amplify error.'),
          },
        ],
        plainExplanation: copy(
          '条件数衡量输入相对误差在最坏情况下可能被放大成多大的输出相对误差。',
          'A condition number measures how much relative input error can become relative output error in the worst case.',
        ),
        geometricIntuition: copy(
          '如果矩阵把单位圆压成细长椭圆，逆变换就会沿短轴方向强烈拉伸噪声。',
          'If a matrix flattens the unit circle into a thin ellipse, the inverse strongly stretches noise along the short axis.',
        ),
        numericalExample: copy(
          md`对 \(D=\operatorname{diag}(100,13,0.5)\)，\(\kappa_2(D)=100/0.5=200\)。`,
          md`For \(D=\operatorname{diag}(100,13,0.5)\), \(\kappa_2(D)=100/0.5=200\).`,
        ),
        codeExample:
          'import numpy as np\n\nA = np.array([[1.0, 1.0], [1.0, 1.0001]])\nprint(np.linalg.cond(A))',
        modelConnection: copy(
          '高度相关的特征列、尺度差异巨大的输入和病态 Hessian 都会让训练或求解对微小误差敏感。',
          'Highly correlated feature columns, mismatched input scales, and ill-conditioned Hessians make training or solving sensitive to tiny errors.',
        ),
      },
      {
        id: 'residual-error-bound',
        name: copy('残差到误差的条件数界', 'Residual-to-Error Bound'),
        formulaLatex: '\\frac{\\|\\Delta\\mathbf{x}\\|}{\\|\\mathbf{x}\\|}\\le \\kappa(A)\\frac{\\|\\mathbf{r}\\|}{\\|\\mathbf{b}\\|}',
        variables: [
          {
            symbol: '\\mathbf{r}',
            description: copy(md`残差 \(\mathbf{b}-A\hat{\mathbf{x}}\)，衡量近似解代回方程的违背程度。`, md`Residual \(\mathbf{b}-A\hat{\mathbf{x}}\), measuring how much the approximate solution violates the equation.`),
          },
          {
            symbol: '\\Delta\\mathbf{x}',
            description: copy(md`真实解误差 \(\hat{\mathbf{x}}-\mathbf{x}\)。`, md`True solution error \(\hat{\mathbf{x}}-\mathbf{x}\).`),
          },
        ],
        plainExplanation: copy(
          '残差小只说明方程被满足得好；是否代表解接近真实值，还要看条件数。',
          'A small residual only says the equation is nearly satisfied; whether the solution is close to the truth also depends on conditioning.',
        ),
        geometricIntuition: copy(
          '残差位于输出空间，误差位于输入/解空间；逆变换会把输出空间的小残差拉回解空间。',
          'The residual lives in output space, while the error lives in solution space; the inverse map pulls a small output residual back into solution space.',
        ),
        numericalExample: copy(
          md`若 \(\kappa(A)=15\)、相对残差为 \(10^{-4}\)，则相对误差上界为 \(15\times10^{-4}\)。`,
          md`If \(\kappa(A)=15\) and the relative residual is \(10^{-4}\), the relative error is bounded by \(15\times10^{-4}\).`,
        ),
        modelConnection: copy(
          '训练或拟合时看到一个很小的数值残差，不等于参数估计已经可靠；特征相关性仍可能放大参数误差。',
          'A tiny numerical residual in training or fitting does not automatically make parameter estimates reliable; feature correlation can still amplify parameter error.',
        ),
      },
    ],
    sections,
    toc: sections.map(({ id, level, title }) => ({ id, level, title })),
    visuals: [],
    labs: [
      {
        id: 'condition-number-amplification-lab',
        title: copy('条件数误差放大实验', 'Condition Number Error Amplification Lab'),
        type: 'interactive-visual',
        componentName: 'ConditionNumbersLab',
        successCriteria: [
          copy(md`能解释列向量夹角变小时，\(\kappa_2(A)\) 为什么快速变大。`, md`Explain why \(\kappa_2(A)\) grows quickly as the column angle becomes small.`),
          copy('能比较相对输入误差、相对残差和相对解误差的差别。', 'Compare relative input error, relative residual, and relative solution error.'),
          copy(md`能用 \(s-w\) 规则估算有效数字损失。`, md`Use the \(s-w\) rule to estimate lost correct digits.`),
        ],
      },
    ],
    quizzes: [
      {
        id: 'condition-best-value',
        type: 'single-choice',
        prompt: copy('一个非奇异矩阵最好的可能条件数是多少？', 'What is the best possible condition number of a nonsingular matrix?'),
        choices: [
          {
            id: 'one',
            label: copy('\\(1\\)', '\\(1\\)'),
          },
          {
            id: 'zero',
            label: copy('\\(0\\)', '\\(0\\)'),
          },
          {
            id: 'negative',
            label: copy('小于 \\(0\\)', 'Less than \\(0\\)'),
          },
          {
            id: 'large',
            label: copy('越大越好', 'As large as possible'),
          },
        ],
        answer: 'one',
        explanation: copy(
          md`对非奇异矩阵，\(\kappa(A)=\|A\|\|A^{-1}\|\ge\|AA^{-1}\|=\|I\|=1\)。条件数越小越好，最优值是 \(1\)。`,
          md`For a nonsingular matrix, \(\kappa(A)=\|A\|\|A^{-1}\|\ge\|AA^{-1}\|=\|I\|=1\). Smaller is better, and the optimum is \(1\).`,
        ),
        misconceptionTags: ['condition-number-large-is-good'],
      },
      {
        id: 'condition-diagonal-example',
        type: 'numeric',
        prompt: copy(
          md`对 \(D=\operatorname{diag}(100,13,0.5)\)，\(\kappa_2(D)\) 是多少？`,
          md`For \(D=\operatorname{diag}(100,13,0.5)\), what is \(\kappa_2(D)\)?`,
        ),
        answer: 200,
        tolerance: 0.001,
        explanation: copy(
          md`对角矩阵在 2-范数下的条件数是最大绝对对角元素除以最小绝对对角元素，即 \(100/0.5=200\)。`,
          md`For a diagonal matrix under the 2-norm, the condition number is the largest absolute diagonal entry divided by the smallest one, \(100/0.5=200\).`,
        ),
        misconceptionTags: ['condition-diagonal'],
      },
      {
        id: 'condition-small-residual',
        type: 'single-choice',
        prompt: copy('小相对残差什么时候能可靠暗示小相对解误差？', 'When does a small relative residual reliably suggest a small relative solution error?'),
        choices: [
          {
            id: 'well-conditioned',
            label: copy('当矩阵条件良好，也就是条件数较小时。', 'When the matrix is well-conditioned, meaning the condition number is small.'),
          },
          {
            id: 'always',
            label: copy('永远可以；残差和误差是同一个量。', 'Always; residual and error are the same quantity.'),
          },
          {
            id: 'det-large',
            label: copy('只要行列式很大。', 'Whenever the determinant is large.'),
          },
        ],
        answer: 'well-conditioned',
        explanation: copy(
          md`误差界包含因子 \(\kappa(A)\)。小残差要乘上小条件数，才会给出小误差上界。`,
          md`The error bound contains the factor \(\kappa(A)\). A small residual gives a small error bound only when the condition number is also small.`,
        ),
        misconceptionTags: ['condition-residual-equals-error'],
      },
    ],
    misconceptions: [
      {
        id: 'condition-invertible-stable',
        statement: copy('矩阵只要可逆，求解就一定数值稳定。', 'As long as a matrix is invertible, solving is numerically stable.'),
        correction: copy(
          '可逆只说明存在唯一解；如果矩阵接近奇异，逆变换仍会严重放大输入误差。',
          'Invertible only means a unique solution exists; if the matrix is nearly singular, the inverse can still strongly amplify input error.',
        ),
        example: copy(
          md`两列几乎平行的矩阵可能仍可逆，但 \(\sigma_{\min}\) 很小，\(\kappa_2(A)=\sigma_{\max}/\sigma_{\min}\) 很大。`,
          md`A matrix with nearly parallel columns may still be invertible, but \(\sigma_{\min}\) is tiny and \(\kappa_2(A)=\sigma_{\max}/\sigma_{\min}\) is large.`,
        ),
      },
      {
        id: 'condition-residual-equals-error',
        statement: copy('残差很小就说明解一定很准确。', 'A tiny residual means the solution must be accurate.'),
        correction: copy(
          '残差在输出空间衡量方程满足程度；解误差还要经过 \(A^{-1}\) 拉回解空间，可能被条件数放大。',
          'Residual measures equation satisfaction in output space; solution error is pulled back through \(A^{-1}\) and can be amplified by the condition number.',
        ),
        example: copy(
          md`若相对残差为 \(10^{-8}\)，但 \(\kappa(A)=10^8\)，误差上界可能达到 \(O(1)\)。`,
          md`If the relative residual is \(10^{-8}\) but \(\kappa(A)=10^8\), the error bound can be \(O(1)\).`,
        ),
      },
      {
        id: 'condition-determinant-test',
        statement: copy('行列式大小可以直接判断矩阵是否接近奇异。', 'The determinant size directly tells whether a matrix is nearly singular.'),
        correction: copy(
          '行列式受整体尺度强烈影响；条件数更关注最大和最小拉伸比例，通常更适合判断数值敏感性。',
          'The determinant is strongly affected by overall scaling; the condition number compares maximum and minimum stretching and is usually better for numerical sensitivity.',
        ),
        example: copy(
          md`把单位矩阵乘以 \(10^{-6}\) 后行列式很小，但 \(\kappa(I\cdot10^{-6})=1\)。整体缩放没有让问题变病态。`,
          md`Multiplying the identity by \(10^{-6}\) gives a tiny determinant, but \(\kappa(10^{-6}I)=1\). Overall scaling did not make the problem ill-conditioned.`,
        ),
      },
    ],
  }
}
