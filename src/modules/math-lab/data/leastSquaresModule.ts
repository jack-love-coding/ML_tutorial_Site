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
    'least-squares-fitting-learning-objectives',
    copy('学习目标', 'Learning Objectives'),
    copy(
      md`学完本章后，你应该能把“给一堆带噪声的数据画一条最好曲线”翻译成线性代数和优化问题。本章的主线是：从数据拟合建立 \(A\mathbf{x}\cong\mathbf{b}\)，用残差平方和定义线性最小二乘，再分别理解正规方程和 SVD 解法。

你需要掌握：

- 从数据点 \((t_i,y_i)\) 和基函数构造设计矩阵 \(A\)、参数向量 \(\mathbf{x}\) 与观测向量 \(\mathbf{b}\)。
- 解释为什么 \(m>n\) 的超定系统通常没有精确解，而最小二乘问题总能找到一个残差最小的解。
- 写出目标函数 \(\min_{\mathbf{x}}\|\mathbf{b}-A\mathbf{x}\|_2^2\)，并把残差 \( \mathbf{r}=\mathbf{b}-A\mathbf{x} \) 读成预测误差向量。
- 从一阶条件推出正规方程 \(A^TA\mathbf{x}=A^T\mathbf{b}\)，并用投影视角解释 \(A^T\mathbf{r}=0\)。
- 区分最小二乘拟合和插值：拟合追求趋势，插值要求穿过全部点。
- 说明正规方程、Cholesky、QR 与 SVD 在成本和稳定性上的取舍，特别是 \(\operatorname{cond}(A^TA)=\operatorname{cond}(A)^2\) 的风险。
- 用 SVD 和伪逆表达最小二乘解，理解零奇异值对应无法由模型解释的残差方向。
- 区分“关于参数线性”的最小二乘和非线性最小二乘，并把它连接到线性回归、校准、推荐、去噪和模型训练。`,
      md`After this chapter, you should be able to translate "fit the best curve through noisy data" into linear algebra and optimization. The chapter's thread is: build \(A\mathbf{x}\cong\mathbf{b}\) from data fitting, define linear least squares through squared residuals, then understand both normal equations and the SVD solution.

You should be able to:

- Build a design matrix \(A\), parameter vector \(\mathbf{x}\), and observation vector \(\mathbf{b}\) from data points \((t_i,y_i)\) and basis functions.
- Explain why an overdetermined system with \(m>n\) usually has no exact solution, while a least-squares problem always has a residual-minimizing solution.
- Write the objective \(\min_{\mathbf{x}}\|\mathbf{b}-A\mathbf{x}\|_2^2\), and read the residual \( \mathbf{r}=\mathbf{b}-A\mathbf{x} \) as the prediction-error vector.
- Derive the normal equations \(A^TA\mathbf{x}=A^T\mathbf{b}\) from first-order optimality, and interpret \(A^T\mathbf{r}=0\) as a projection condition.
- Distinguish least-squares fitting from interpolation: fitting pursues a trend, while interpolation passes through every point.
- Explain tradeoffs among normal equations, Cholesky, QR, and SVD, especially the risk that \(\operatorname{cond}(A^TA)=\operatorname{cond}(A)^2\).
- Express the least-squares solution with the SVD and pseudoinverse, and understand how zero singular values describe residual directions the model cannot explain.
- Distinguish least squares that is linear in the parameters from nonlinear least squares, and connect the idea to linear regression, calibration, recommendation, denoising, and model training.`,
    ),
  ),
  section(
    'least-squares-fitting-data-to-system',
    copy('从散点数据到超定线性系统', 'From Data Points to an Overdetermined System'),
    copy(
      md`最小二乘拟合从一个朴素任务开始：给定 \(m\) 个数据点

$$
\{(t_1,y_1),(t_2,y_2),\ldots,(t_m,y_m)\},
$$

希望找一条直线

$$
y=x_0+x_1t
$$

尽量贴近这些点。若把每个数据点都当成一条方程，就得到

$$
y_i=x_0+x_1t_i,\qquad i=1,\ldots,m.
$$

写成矩阵形式：

$$
\begin{bmatrix}
1&t_1\\
1&t_2\\
\vdots&\vdots\\
1&t_m
\end{bmatrix}
\begin{bmatrix}
x_0\\
x_1
\end{bmatrix}
=
\begin{bmatrix}
y_1\\
y_2\\
\vdots\\
y_m
\end{bmatrix}.
$$

简写为

$$
A\mathbf{x}=\mathbf{b}.
$$

这里 \(A\) 是 \(m\times n\) 设计矩阵，\(\mathbf{x}\) 是 \(n\) 个待定参数，\(\mathbf{b}\) 是 \(m\) 个观测值。若 \(\mathbf{b}\) 正好在 \(A\) 的列空间 \(range(A)\) 中，就存在精确解。但真实数据常含噪声，且 \(m>n\)：方程数多于未知数，这类系统称为超定系统。通常 \(\mathbf{b}\notin range(A)\)，所以精确等式不成立。

因此更合适的写法是

$$
A\mathbf{x}\cong\mathbf{b}.
$$

这个符号的含义不是“随便差不多”，而是：在模型能表达的所有向量 \(A\mathbf{x}\) 中，找离 \(\mathbf{b}\) 最近的那个。`,
      md`Least-squares fitting starts with a simple task: given \(m\) data points

$$
\{(t_1,y_1),(t_2,y_2),\ldots,(t_m,y_m)\},
$$

find a line

$$
y=x_0+x_1t
$$

that stays close to them. Treating every point as one equation gives

$$
y_i=x_0+x_1t_i,\qquad i=1,\ldots,m.
$$

In matrix form:

$$
\begin{bmatrix}
1&t_1\\
1&t_2\\
\vdots&\vdots\\
1&t_m
\end{bmatrix}
\begin{bmatrix}
x_0\\
x_1
\end{bmatrix}
=
\begin{bmatrix}
y_1\\
y_2\\
\vdots\\
y_m
\end{bmatrix}.
$$

We write this as

$$
A\mathbf{x}=\mathbf{b}.
$$

Here \(A\) is the \(m\times n\) design matrix, \(\mathbf{x}\) contains the \(n\) unknown parameters, and \(\mathbf{b}\) contains the \(m\) observations. If \(\mathbf{b}\) lies exactly in the column space \(range(A)\), an exact solution exists. Real data usually contains noise, and \(m>n\): there are more equations than unknowns. Such a system is overdetermined. Usually \(\mathbf{b}\notin range(A)\), so the exact equality cannot be satisfied.

A better notation is therefore

$$
A\mathbf{x}\cong\mathbf{b}.
$$

That symbol does not mean "approximately by taste." It means: among all vectors \(A\mathbf{x}\) the model can express, find the one closest to \(\mathbf{b}\).`,
    ),
  ),
  section(
    'least-squares-fitting-residual-objective',
    copy('残差平方和定义“最好”', 'Squared Residuals Define "Best"'),
    copy(
      md`残差向量定义为

$$
\mathbf{r}=\mathbf{b}-A\mathbf{x}.
$$

线性最小二乘选择让残差 2-范数平方最小的参数：

$$
\min_{\mathbf{x}}\|\mathbf{r}\|_2^2
=
\min_{\mathbf{x}}\|\mathbf{b}-A\mathbf{x}\|_2^2.
$$

它有几个重要性质：

- 最小二乘问题总能取得一个最小残差解。
- 若 \(A\) 满列秩，也就是 \(rank(A)=n\)，这个解唯一。
- 平方目标让大残差受到更高惩罚，也让目标函数成为关于 \(\mathbf{x}\) 的光滑二次函数。

**手算例题。** 用三个点 \((1,1.2),(2,1.9),(3,1.0)\) 拟合直线 \(y=x_0+x_1t\)。设计矩阵和观测向量是

$$
A=
\begin{bmatrix}
1&1\\
1&2\\
1&3
\end{bmatrix},
\qquad
\mathbf{b}=
\begin{bmatrix}
1.2\\
1.9\\
1.0
\end{bmatrix}.
$$

若先试 \(\mathbf{x}=[1,0]^T\)，预测是 \([1,1,1]^T\)，残差是 \([0.2,0.9,0]^T\)，残差平方和为 \(0.85\)。最小二乘会在所有截距和斜率中继续搜索，直到残差向量最短。

下面的实验台把这个目标函数变成可操作对象。蓝线是你当前选择的截距和斜率，绿色虚线是正规方程给出的最优线，红色虚线段是各点的残差。调节最后一个点的扰动时，观察离群点如何改变最优斜率以及残差平方和。`,
      md`Define the residual vector as

$$
\mathbf{r}=\mathbf{b}-A\mathbf{x}.
$$

Linear least squares chooses parameters that minimize the squared 2-norm of the residual:

$$
\min_{\mathbf{x}}\|\mathbf{r}\|_2^2
=
\min_{\mathbf{x}}\|\mathbf{b}-A\mathbf{x}\|_2^2.
$$

Several facts matter:

- A least-squares problem always attains a minimum-residual solution.
- If \(A\) has full column rank, \(rank(A)=n\), the solution is unique.
- Squaring gives large residuals extra weight and makes the objective a smooth quadratic function of \(\mathbf{x}\).

**Worked example.** Fit the line \(y=x_0+x_1t\) to the three points \((1,1.2),(2,1.9),(3,1.0)\). The design matrix and observation vector are

$$
A=
\begin{bmatrix}
1&1\\
1&2\\
1&3
\end{bmatrix},
\qquad
\mathbf{b}=
\begin{bmatrix}
1.2\\
1.9\\
1.0
\end{bmatrix}.
$$

If we first try \(\mathbf{x}=[1,0]^T\), the prediction is \([1,1,1]^T\), the residual is \([0.2,0.9,0]^T\), and the sum of squared residuals is \(0.85\). Least squares keeps searching across all intercepts and slopes until the residual vector is shortest.

The lab below makes that objective manipulable. The blue line is your current intercept and slope, the green dashed line is the optimal line from the normal equations, and the red dashed segments are residuals. Change the last-point lift to see how an outlier changes the optimal slope and the sum of squared residuals.`,
    ),
    { labIds: ['least-squares-residual-lab'] },
  ),
  section(
    'least-squares-fitting-normal-equations-projection',
    copy('正规方程与投影视角', 'Normal Equations and the Projection View'),
    copy(
      md`把目标函数展开：

$$
\phi(\mathbf{x})
=
\|\mathbf{b}-A\mathbf{x}\|_2^2
=
(\mathbf{b}-A\mathbf{x})^T(\mathbf{b}-A\mathbf{x})
$$

$$
=
\mathbf{b}^T\mathbf{b}
-2\mathbf{x}^TA^T\mathbf{b}
+\mathbf{x}^TA^TA\mathbf{x}.
$$

对 \(\mathbf{x}\) 求梯度并令其为零：

$$
\nabla\phi(\mathbf{x})
=
-2A^T\mathbf{b}+2A^TA\mathbf{x}
=0.
$$

得到 \(n\times n\) 的正规方程：

$$
A^TA\mathbf{x}=A^T\mathbf{b}.
$$

如果 \(A\) 满列秩，\(A^TA\) 可逆，唯一解可写成

$$
\mathbf{x}=(A^TA)^{-1}A^T\mathbf{b}.
$$

二阶条件也很直接：Hessian 为

$$
H=2A^TA.
$$

满列秩时它正定，因此驻点就是唯一最小点。

几何上，最小二乘是在把 \(\mathbf{b}\) 投影到 \(A\) 的列空间。令 \(\hat{\mathbf{b}}=A\mathbf{x}\)。最优残差

$$
\mathbf{r}=\mathbf{b}-\hat{\mathbf{b}}
$$

必须垂直于 \(A\) 的每一列，也就是

$$
A^T\mathbf{r}=A^T(\mathbf{b}-A\mathbf{x})=0.
$$

这正好又给出正规方程。这个垂直条件是本章最重要的直觉：最优预测不一定等于观测，但剩下的误差已经没有任何沿模型列空间可以继续改进的方向。`,
      md`Expand the objective:

$$
\phi(\mathbf{x})
=
\|\mathbf{b}-A\mathbf{x}\|_2^2
=
(\mathbf{b}-A\mathbf{x})^T(\mathbf{b}-A\mathbf{x})
$$

$$
=
\mathbf{b}^T\mathbf{b}
-2\mathbf{x}^TA^T\mathbf{b}
+\mathbf{x}^TA^TA\mathbf{x}.
$$

Differentiate with respect to \(\mathbf{x}\) and set the gradient to zero:

$$
\nabla\phi(\mathbf{x})
=
-2A^T\mathbf{b}+2A^TA\mathbf{x}
=0.
$$

This gives the \(n\times n\) normal equations:

$$
A^TA\mathbf{x}=A^T\mathbf{b}.
$$

If \(A\) has full column rank, \(A^TA\) is invertible and the unique solution can be written

$$
\mathbf{x}=(A^TA)^{-1}A^T\mathbf{b}.
$$

The second-order condition is also direct: the Hessian is

$$
H=2A^TA.
$$

With full column rank it is positive definite, so the stationary point is the unique minimizer.

Geometrically, least squares projects \(\mathbf{b}\) onto the column space of \(A\). Let \(\hat{\mathbf{b}}=A\mathbf{x}\). The optimal residual

$$
\mathbf{r}=\mathbf{b}-\hat{\mathbf{b}}
$$

must be orthogonal to every column of \(A\), so

$$
A^T\mathbf{r}=A^T(\mathbf{b}-A\mathbf{x})=0.
$$

That is exactly the normal equation again. This orthogonality condition is the chapter's key intuition: the best prediction need not equal the observation, but the remaining error has no direction inside the model column space that can improve it further.`,
    ),
  ),
  section(
    'least-squares-fitting-vs-interpolation',
    copy('拟合不是插值：趋势和噪声要分开', 'Fitting Is Not Interpolation: Separate Trend from Noise'),
    copy(
      md`拟合和插值都从数据点 \((t_i,y_i)\) 出发，并都可以选择基函数的线性组合。但目标完全不同。

| 问题 | 要求 | 典型矩阵形状 | 适合场景 |
| --- | --- | --- | --- |
| 插值 | 函数精确穿过每个点 | 方阵，通常需要 \(m\) 个线性无关基函数 | 数据近似无噪声，要求重现采样点 |
| 最小二乘拟合 | 函数捕捉整体趋势，允许点有残差 | 高矩阵，\(m\gg n\) 很常见 | 数据有噪声，模型参数少于样本数 |

一个典型场景是：用 300 个带噪声数据点拟合二次函数

$$
y=x_0+x_1t+x_2t^2.
$$

参数只有三个，却有 300 个观测值。强行插值意味着要用足够复杂的函数追随噪声；最小二乘则说，我们只让模型学习可解释的低维趋势。

这也是平方损失的代价所在：离群点的残差会被平方放大，因此它们能强烈拉动拟合线。实际机器学习里，如果离群点很多，可能要考虑加权最小二乘、Huber loss、分位数回归或数据清洗。最小二乘是基线，不是所有噪声模型的答案。`,
      md`Fitting and interpolation both start from data points \((t_i,y_i)\), and both may choose a linear combination of basis functions. Their goals are different.

| Problem | Requirement | Typical matrix shape | Good use case |
| --- | --- | --- | --- |
| Interpolation | The function passes exactly through every point | Square matrix, usually requiring \(m\) linearly independent basis functions | Data is nearly noiseless and sample values must be reproduced |
| Least-squares fitting | The function captures the overall trend while allowing residuals | Tall matrix, often \(m\gg n\) | Data is noisy and the model has fewer parameters than samples |

A typical scenario is fitting 300 noisy data points with a quadratic

$$
y=x_0+x_1t+x_2t^2.
$$

There are only three parameters but 300 observations. Forcing interpolation would require a function complex enough to chase noise. Least squares instead says: learn the low-dimensional trend the model can explain.

This also reveals the cost of squared loss: outlier residuals are squared, so they can pull the fit strongly. In practical machine learning, many outliers may call for weighted least squares, Huber loss, quantile regression, or data cleaning. Least squares is a baseline, not the answer to every noise model.`,
    ),
  ),
  section(
    'least-squares-fitting-computational-methods',
    copy('计算方法：正规方程快，但会放大病态', 'Computational Methods: Normal Equations Are Fast but Can Square Ill-Conditioning'),
    copy(
      md`正规方程把 \(m\times n\) 的超定问题变成 \(n\times n\) 的方阵问题。构造 \(A^TA\) 的成本是

$$
\mathcal{O}(mn^2),
$$

对 \(A^TA\) 做 Cholesky 或类似分解的成本是

$$
\mathcal{O}(n^3).
$$

在典型数据拟合中 \(m\gg n\)，所以主导成本常是 \(\mathcal{O}(mn^2)\)。这就是正规方程吸引人的地方：实现直接，矩阵小。

风险也同样明确：

$$
\operatorname{cond}(A^TA)=\operatorname{cond}(A)^2.
$$

如果 \(A\) 的列接近平行，或者特征尺度差异很大，正规方程会把原本已经不好的条件数平方，导致参数对噪声极端敏感。实践中的数值库通常更偏好 QR 或 SVD：

- **正规方程 + Cholesky：** 快，适合条件良好、规模适中的问题。
- **QR 分解：** 不显式形成 \(A^TA\)，通常比正规方程更稳定，是线性最小二乘的常用默认选择。
- **SVD：** 最稳健，能处理秩亏和近秩亏，还能显式读出哪些方向由小奇异值支撑；代价更高。

这和机器学习里的特征缩放直接相连。若一列特征以“米”为单位，另一列以“毫米”为单位，设计矩阵的列尺度差异会影响条件数，从而影响线性回归系数的可靠性。`,
      md`Normal equations turn an \(m\times n\) overdetermined problem into an \(n\times n\) square problem. Forming \(A^TA\) costs

$$
\mathcal{O}(mn^2),
$$

and a Cholesky-like factorization of \(A^TA\) costs

$$
\mathcal{O}(n^3).
$$

In typical data-fitting problems \(m\gg n\), so the dominant cost is often \(\mathcal{O}(mn^2)\). That is why normal equations are tempting: they are simple and the matrix is small.

The risk is just as clear:

$$
\operatorname{cond}(A^TA)=\operatorname{cond}(A)^2.
$$

If the columns of \(A\) are nearly parallel, or feature scales are very different, normal equations square an already poor condition number, making parameters highly sensitive to noise. Numerical libraries often prefer QR or SVD in practice:

- **Normal equations + Cholesky:** fast and direct, suitable for well-conditioned moderate problems.
- **QR factorization:** avoids explicitly forming \(A^TA\), usually more stable than normal equations, and is a common default for linear least squares.
- **SVD:** most robust, handles rank deficiency and near rank deficiency, and exposes which directions are supported by small singular values; it costs more.

This connects directly to feature scaling in machine learning. If one feature is measured in meters and another in millimeters, the design-matrix column scales affect conditioning and therefore the reliability of linear-regression coefficients.`,
    ),
  ),
  section(
    'least-squares-fitting-svd-solution',
    copy('SVD、伪逆与残差公式', 'SVD, the Pseudoinverse, and the Residual Formula'),
    copy(
      md`SVD 给出另一种解法。设

$$
A=U\Sigma V^T.
$$

因为正交矩阵不改变 2-范数，可以把目标函数旋转到奇异向量坐标中。令

$$
\mathbf{y}=V^T\mathbf{x},
\qquad
\mathbf{z}=U^T\mathbf{b}.
$$

问题变成

$$
\min_{\mathbf{y}}\|\mathbf{z}-\Sigma\mathbf{y}\|_2^2.
$$

由于 \(\Sigma\) 是对角形，每个方向可以单独处理：

$$
y_i=
\begin{cases}
\dfrac{z_i}{\sigma_i}, & \sigma_i\ne 0,\\
0, & \sigma_i=0.
\end{cases}
$$

再变回原坐标：

$$
\mathbf{x}=V\mathbf{y}
=
\sum_{\sigma_i\ne 0}\frac{\mathbf{u}_i^T\mathbf{b}}{\sigma_i}\mathbf{v}_i.
$$

用伪逆写就是

$$
\mathbf{x}=V\Sigma^+U^T\mathbf{b}.
$$

\(\Sigma^+\) 的构造很简单：把非零奇异值取倒数，零奇异值保持为零，并转置矩阵形状。若已经给定 reduced SVD，那么计算

$$
\mathbf{z}=U_R^T\mathbf{b},\qquad
\mathbf{y}=\Sigma_R^+\mathbf{z},\qquad
\mathbf{x}=V\mathbf{y}
$$

的总成本是 \(\mathcal{O}(mn)\)，因为第一步矩阵向量乘法主导；当然，前提是 reduced SVD 已经算好。

SVD 还能直接读出最小残差。如果前 \(r\) 个奇异值非零，那么最优残差平方为

$$
\|\mathbf{b}-A\mathbf{x}\|_2^2
=
\sum_{i=r+1}^{m}(\mathbf{u}_i^T\mathbf{b})^2.
$$

也就是说，\(\mathbf{b}\) 在 \(A\) 的列空间之外的正交方向上投影了多少，最小残差就剩多少。这个公式把“模型无法解释的部分”说得非常具体。`,
      md`The SVD gives another solution. Let

$$
A=U\Sigma V^T.
$$

Because orthogonal matrices preserve the 2-norm, we can rotate the objective into singular-vector coordinates. Define

$$
\mathbf{y}=V^T\mathbf{x},
\qquad
\mathbf{z}=U^T\mathbf{b}.
$$

The problem becomes

$$
\min_{\mathbf{y}}\|\mathbf{z}-\Sigma\mathbf{y}\|_2^2.
$$

Since \(\Sigma\) is diagonal, each direction can be handled independently:

$$
y_i=
\begin{cases}
\dfrac{z_i}{\sigma_i}, & \sigma_i\ne 0,\\
0, & \sigma_i=0.
\end{cases}
$$

Transform back:

$$
\mathbf{x}=V\mathbf{y}
=
\sum_{\sigma_i\ne 0}\frac{\mathbf{u}_i^T\mathbf{b}}{\sigma_i}\mathbf{v}_i.
$$

With the pseudoinverse,

$$
\mathbf{x}=V\Sigma^+U^T\mathbf{b}.
$$

\(\Sigma^+\) is built by reciprocating the nonzero singular values, leaving zero singular values as zero, and transposing the matrix shape. If a reduced SVD is already given, then computing

$$
\mathbf{z}=U_R^T\mathbf{b},\qquad
\mathbf{y}=\Sigma_R^+\mathbf{z},\qquad
\mathbf{x}=V\mathbf{y}
$$

costs \(\mathcal{O}(mn)\), because the first matrix-vector multiply dominates; of course, this assumes the reduced SVD has already been computed.

The SVD also reveals the minimum residual directly. If the first \(r\) singular values are nonzero, then the optimal squared residual is

$$
\|\mathbf{b}-A\mathbf{x}\|_2^2
=
\sum_{i=r+1}^{m}(\mathbf{u}_i^T\mathbf{b})^2.
$$

In words: whatever component of \(\mathbf{b}\) lies in orthogonal directions outside the column space of \(A\) remains as the least possible residual. This formula makes the "part the model cannot explain" precise.`,
    ),
  ),
  section(
    'least-squares-fitting-linear-vs-nonlinear',
    copy('线性与非线性最小二乘看的是参数', 'Linear Versus Nonlinear Least Squares Is About Parameters'),
    copy(
      md`“线性最小二乘”里的线性，是指模型关于参数 \(\mathbf{x}\) 线性，不是指它关于输入 \(t\) 一定是直线。

例如多项式拟合

$$
f(t,\mathbf{x})=x_1+x_2t+x_3t^2+\cdots+x_nt^{n-1}
$$

关于 \(t\) 可以是高次曲线，但关于参数 \(x_1,\ldots,x_n\) 是线性组合，因此仍然是线性最小二乘。

反过来，如果参数出现在指数、乘积或非线性函数内部，例如

$$
f(t,\mathbf{x})=x_1e^{x_2t}+x_3e^{x_4t},
$$

那么它关于参数非线性，就属于非线性最小二乘。线性最小二乘有闭式解和成熟分解方法；非线性最小二乘通常要用 Gauss-Newton、Levenberg-Marquardt 或一般优化方法迭代求解。

在 ML / AI 中，本章直接对应：

- **线性回归。** 用设计矩阵 \(X\) 和标签 \(y\) 求最小平方误差参数。
- **特征工程与基函数模型。** 多项式特征、径向基、one-hot 编码都可以形成新的设计矩阵。
- **推荐和矩阵分解。** 固定一侧因子时，交替最小二乘会反复解很多个线性最小二乘子问题。
- **去噪与校准。** 用低维模型解释观测，残差保留测量噪声或模型误差。
- **训练稳定性。** 特征缩放、共线性和小奇异值决定参数是否对噪声敏感。`,
      md`The word "linear" in linear least squares means linear in the parameters \(\mathbf{x}\), not necessarily linear in the input \(t\).

For example, polynomial fitting

$$
f(t,\mathbf{x})=x_1+x_2t+x_3t^2+\cdots+x_nt^{n-1}
$$

can be a high-degree curve in \(t\), but it is a linear combination of the parameters \(x_1,\ldots,x_n\). It is still a linear least-squares problem.

In contrast, if parameters appear inside exponentials, products, or other nonlinear functions, for example

$$
f(t,\mathbf{x})=x_1e^{x_2t}+x_3e^{x_4t},
$$

then the problem is nonlinear in the parameters and becomes nonlinear least squares. Linear least squares has closed-form expressions and mature factorization methods; nonlinear least squares usually needs iterative methods such as Gauss-Newton, Levenberg-Marquardt, or general optimization.

In ML / AI, this chapter appears in:

- **Linear regression.** Solve for squared-error parameters using a design matrix \(X\) and labels \(y\).
- **Feature engineering and basis models.** Polynomial features, radial bases, and one-hot encodings all form new design matrices.
- **Recommendation and matrix factorization.** Alternating least squares repeatedly solves linear least-squares subproblems when one factor is fixed.
- **Denoising and calibration.** A low-dimensional model explains observations while residuals retain measurement noise or model error.
- **Training stability.** Feature scaling, collinearity, and small singular values decide whether parameters are noise-sensitive.`,
    ),
  ),
  section(
    'least-squares-fitting-review-questions',
    copy('复习问题', 'Review Questions'),
    copy(
      md`1. 线性最小二乘最小化的量是什么？
2. 给定数据点和模型 \(y=x_0+x_1t\)，如何构造 \(A\mathbf{x}\cong\mathbf{b}\)？
3. 为什么 \(m>n\) 的系统通常没有精确解？
4. 最小二乘解什么时候唯一？
5. 残差 \( \mathbf{r}=\mathbf{b}-A\mathbf{x} \) 在最优点满足什么正交条件？
6. 如何从 \(\nabla\|\mathbf{b}-A\mathbf{x}\|_2^2=0\) 推出正规方程？
7. 拟合和插值的目标有什么根本区别？
8. 为什么正规方程可能让数值条件变差？
9. 已知 \(A=U\Sigma V^T\)，如何用 SVD 写出最小二乘解？
10. SVD 如何给出最小残差的大小？
11. reduced SVD 已知时，为什么求解成本可以是 \(\mathcal{O}(mn)\)？
12. 判断 \(y=a\cos(t)+b\) 是否为线性最小二乘时，应该看 \(t\) 还是看参数 \(a,b\)？`,
      md`1. What quantity does linear least squares minimize?
2. Given data points and the model \(y=x_0+x_1t\), how do you construct \(A\mathbf{x}\cong\mathbf{b}\)?
3. Why does a system with \(m>n\) usually have no exact solution?
4. When is the least-squares solution unique?
5. What orthogonality condition does the residual \( \mathbf{r}=\mathbf{b}-A\mathbf{x} \) satisfy at the optimum?
6. How do the normal equations follow from \(\nabla\|\mathbf{b}-A\mathbf{x}\|_2^2=0\)?
7. What is the fundamental goal difference between fitting and interpolation?
8. Why can normal equations worsen numerical conditioning?
9. Given \(A=U\Sigma V^T\), how do you write the least-squares solution with the SVD?
10. How does the SVD reveal the size of the minimum residual?
11. If the reduced SVD is already known, why can solving cost \(\mathcal{O}(mn)\)?
12. To decide whether \(y=a\cos(t)+b\) is linear least squares, should you inspect \(t\) or the parameters \(a,b\)?`,
    ),
  ),
]

export function buildLeastSquaresModule(base: MathLabModule): MathLabModule {
  return {
    ...base,
    enhancementTier: 'interactive',
    title: copy('最小二乘拟合', 'Least Squares Fitting'),
    subtitle: copy(
      '把有噪声的数据拟合成残差最小的投影问题，并比较正规方程与 SVD 解法。',
      'Turn noisy data fitting into a minimum-residual projection problem, then compare normal equations with the SVD solution.',
    ),
    difficulty: 'advanced',
    estimatedMinutes: 36,
    prerequisites: ['optimization', 'vectors-matrices-norms', 'condition-numbers'],
    aiModelConnections: [
      copy(
        '线性回归、校准、去噪和交替最小二乘推荐系统都把“预测误差”写成设计矩阵上的最小二乘问题。',
        'Linear regression, calibration, denoising, and alternating-least-squares recommenders all write prediction error as a least-squares problem over a design matrix.',
      ),
      copy(
        '特征缩放、共线性和小奇异值会让拟合系数对噪声敏感，因此最小二乘也是理解训练稳定性的入口。',
        'Feature scaling, collinearity, and small singular values make fitted coefficients noise-sensitive, so least squares is also an entry point for training stability.',
      ),
    ],
    learningObjectives: [
      copy(md`从一组数据和基函数构造超定系统 \(A\mathbf{x}\cong\mathbf{b}\)。`, md`Construct an overdetermined system \(A\mathbf{x}\cong\mathbf{b}\) from data and basis functions.`),
      copy('解释残差向量、残差平方和以及解存在性和唯一性条件。', 'Explain the residual vector, sum of squared residuals, and existence and uniqueness conditions.'),
      copy('从一阶最优条件和投影视角推导正规方程。', 'Derive the normal equations from first-order optimality and from projection geometry.'),
      copy('区分最小二乘拟合与插值，并说明平方损失对离群点的敏感性。', 'Distinguish least-squares fitting from interpolation and explain squared loss sensitivity to outliers.'),
      copy('比较正规方程、QR 与 SVD 在成本和数值稳定性上的取舍。', 'Compare normal equations, QR, and SVD by computational cost and numerical stability.'),
      copy('用 SVD/伪逆写出最小二乘解，并读出无法解释的残差方向。', 'Write the least-squares solution with the SVD/pseudoinverse and read residual directions the model cannot explain.'),
    ],
    concepts: [
      {
        id: 'least-squares-residual-objective',
        name: copy('残差平方和目标', 'Sum of Squared Residuals Objective'),
        formulaLatex: '\\min_{\\mathbf{x}}\\|\\mathbf{b}-A\\mathbf{x}\\|_2^2',
        variables: [
          {
            symbol: 'A',
            description: copy('设计矩阵，每列是一种基函数或特征方向。', 'Design matrix; each column is a basis function or feature direction.'),
          },
          {
            symbol: '\\mathbf{b}',
            description: copy('观测值或标签向量。', 'Observation or label vector.'),
          },
          {
            symbol: '\\mathbf{x}',
            description: copy('需要拟合的参数。', 'Parameters to be fitted.'),
          },
        ],
        plainExplanation: copy(
          '最小二乘寻找模型能表达的预测中离观测整体最近的一个。平方会特别惩罚大残差。',
          'Least squares finds the expressible prediction closest to the observations overall. Squaring penalizes large residuals strongly.',
        ),
        geometricIntuition: copy(
          md`所有 \(A\mathbf{x}\) 形成 \(A\) 的列空间；最优预测是 \(\mathbf{b}\) 在这个空间上的最近点。`,
          md`All vectors \(A\mathbf{x}\) form the column space of \(A\); the optimal prediction is the closest point to \(\mathbf{b}\) in that space.`,
        ),
        numericalExample: copy(
          md`若残差为 \([0.2,0.9,0]^T\)，残差平方和为 \(0.2^2+0.9^2=0.85\)。`,
          md`If the residual is \([0.2,0.9,0]^T\), the sum of squared residuals is \(0.2^2+0.9^2=0.85\).`,
        ),
        codeExample: 'import numpy as np\n\nA = np.array([[1, 1], [1, 2], [1, 3]], dtype=float)\nb = np.array([1.2, 1.9, 1.0])\nx, *_ = np.linalg.lstsq(A, b, rcond=None)\nprint(x)',
        modelConnection: copy(
          '监督学习中的均方误差训练就是残差平方和除以样本数后的版本。',
          'Mean-squared-error training in supervised learning is the sum of squared residuals divided by the sample count.',
        ),
      },
      {
        id: 'least-squares-normal-equations',
        name: copy('正规方程', 'Normal Equations'),
        formulaLatex: 'A^TA\\mathbf{x}=A^T\\mathbf{b}',
        variables: [
          {
            symbol: 'A^TA',
            description: copy(md`由设计矩阵列内积组成的 \(n\times n\) 对称矩阵。`, md`An \(n\times n\) symmetric matrix of design-column inner products.`),
          },
          {
            symbol: 'A^T\\mathbf{b}',
            description: copy('观测向量在每个列方向上的投影强度。', 'Projection strength of the observation vector onto each column direction.'),
          },
        ],
        plainExplanation: copy(
          '正规方程说：最优点处，残差和每个模型列方向都正交。',
          'The normal equations say: at the optimum, the residual is orthogonal to every model-column direction.',
        ),
        geometricIntuition: copy(
          '如果残差还沿某个列方向有分量，就能继续调整参数降低误差；最优时这种分量必须为零。',
          'If the residual still has a component along a column direction, parameters can be adjusted to lower error; at the optimum that component must vanish.',
        ),
        numericalExample: copy(
          md`满列秩时可写 \(\mathbf{x}=(A^TA)^{-1}A^T\mathbf{b}\)，但实际代码通常避免显式求逆。`,
          md`With full column rank, \(\mathbf{x}=(A^TA)^{-1}A^T\mathbf{b}\), but real code usually avoids an explicit inverse.`,
        ),
        modelConnection: copy(
          '线性回归闭式解、局部二次模型和许多校准问题都以正规方程为起点。',
          'Closed-form linear regression, local quadratic models, and many calibration problems start from the normal equations.',
        ),
      },
      {
        id: 'least-squares-svd-pseudoinverse',
        name: copy('SVD 伪逆解', 'SVD Pseudoinverse Solution'),
        formulaLatex: '\\mathbf{x}=V\\Sigma^+U^T\\mathbf{b}',
        variables: [
          {
            symbol: '\\Sigma^+',
            description: copy('把非零奇异值取倒数后得到的伪逆对角矩阵。', 'The pseudoinverse diagonal matrix formed by reciprocating nonzero singular values.'),
          },
          {
            symbol: 'U,V',
            description: copy('输出空间和参数空间中的正交方向。', 'Orthogonal directions in output space and parameter space.'),
          },
        ],
        plainExplanation: copy(
          'SVD 把问题拆成独立方向：可靠方向除以奇异值，零奇异值方向不能被模型解释。',
          'The SVD separates independent directions: supported directions divide by singular values, while zero-singular directions cannot be explained by the model.',
        ),
        geometricIntuition: copy(
          '小奇异值方向像很薄的长谷，观测噪声会被倒数放大到参数里。',
          'Small-singular-value directions behave like thin valleys; observation noise is amplified into parameters by reciprocal scaling.',
        ),
        numericalExample: copy(
          md`若 \(\sigma_i=0.01\)，对应方向上的 \(u_i^T\mathbf{b}\) 会被放大 \(100\) 倍进入参数。`,
          md`If \(\sigma_i=0.01\), the component \(u_i^T\mathbf{b}\) is amplified by \(100\) in the parameter direction.`,
        ),
        modelConnection: copy(
          'SVD 最小二乘支撑岭回归、低秩去噪和推荐系统中对病态方向的诊断。',
          'SVD least squares supports ridge-regression intuition, low-rank denoising, and diagnostics for ill-conditioned recommender directions.',
        ),
      },
    ],
    sections,
    toc: sections.map(({ id, level, title }) => ({ id, level, title })),
    visuals: [],
    labs: [
      {
        id: 'least-squares-residual-lab',
        title: copy('残差与正规方程实验', 'Residual and Normal Equations Lab'),
        type: 'interactive-visual',
        componentName: 'NumericalMiniLab',
        successCriteria: [
          copy(md`能把红色残差段对应到 \(\mathbf{r}=\mathbf{b}-A\mathbf{x}\)。`, md`Map the red residual segments to \(\mathbf{r}=\mathbf{b}-A\mathbf{x}\).`),
          copy('能调节斜率和截距，让当前 SSE 接近最优 SSE。', 'Adjust slope and intercept so the current SSE approaches the best SSE.'),
          copy(md`能解释为什么最优线处 \(A^T\mathbf{r}\) 接近零。`, md`Explain why \(A^T\mathbf{r}\) is near zero at the optimal line.`),
        ],
      },
    ],
    quizzes: [
      {
        id: 'least-squares-objective',
        type: 'single-choice',
        prompt: copy('线性最小二乘最小化的核心量是什么？', 'What is the core quantity minimized by linear least squares?'),
        choices: [
          { id: 'sse', label: copy(md`残差平方和 \(\|\mathbf{b}-A\mathbf{x}\|_2^2\)`, md`The sum of squared residuals \(\|\mathbf{b}-A\mathbf{x}\|_2^2\)`) },
          { id: 'sum-x', label: copy('参数之和', 'The sum of parameters') },
          { id: 'sample-index', label: copy('样本编号之和', 'The sum of sample indices') },
        ],
        answer: 'sse',
        explanation: copy(
          md`残差衡量预测 \(A\mathbf{x}\) 和观测 \(\mathbf{b}\) 的差；最小二乘最小化残差 2-范数的平方。`,
          md`The residual measures the difference between prediction \(A\mathbf{x}\) and observation \(\mathbf{b}\); least squares minimizes the squared 2-norm of that residual.`,
        ),
        misconceptionTags: ['least-squares-objective'],
      },
      {
        id: 'least-squares-normal-condition',
        type: 'single-choice',
        prompt: copy('最小二乘最优点处，残差满足哪个几何条件？', 'At the least-squares optimum, which geometric condition does the residual satisfy?'),
        choices: [
          { id: 'orthogonal', label: copy(md`残差与 \(A\) 的列空间正交`, md`The residual is orthogonal to the column space of \(A\)`) },
          { id: 'zero-always', label: copy('残差一定为零', 'The residual is always zero') },
          { id: 'parallel', label: copy(md`残差与 \(\mathbf{b}\) 平行`, md`The residual is parallel to \(\mathbf{b}\)`) },
        ],
        answer: 'orthogonal',
        explanation: copy(
          md`正规方程可写成 \(A^T(\mathbf{b}-A\mathbf{x})=0\)，即每个列方向与残差的内积都是零。`,
          md`The normal equations can be written \(A^T(\mathbf{b}-A\mathbf{x})=0\), so every column direction has zero inner product with the residual.`,
        ),
        misconceptionTags: ['least-squares-perfect-fit'],
      },
      {
        id: 'least-squares-linear-parameters',
        type: 'single-choice',
        prompt: copy(md`拟合 \(y=a\cos(t)+b\) 时，若未知参数是 \(a,b\)，这是线性还是非线性最小二乘？`, md`When fitting \(y=a\cos(t)+b\), with unknown parameters \(a,b\), is this linear or nonlinear least squares?`),
        choices: [
          { id: 'linear', label: copy('线性最小二乘', 'Linear least squares') },
          { id: 'nonlinear', label: copy('非线性最小二乘', 'Nonlinear least squares') },
          { id: 'neither', label: copy('无法构造最小二乘问题', 'No least-squares problem can be formed') },
        ],
        answer: 'linear',
        explanation: copy(
          md`虽然 \(\cos(t)\) 关于输入 \(t\) 非线性，但模型关于参数 \(a,b\) 是线性组合。`,
          md`Although \(\cos(t)\) is nonlinear in the input \(t\), the model is a linear combination of the parameters \(a,b\).`,
        ),
        misconceptionTags: ['least-squares-linear-in-input'],
      },
    ],
    misconceptions: [
      {
        id: 'least-squares-perfect-fit',
        statement: copy('最小二乘拟合一定会穿过所有数据点。', 'A least-squares fit always passes through every data point.'),
        correction: copy(
          '最小二乘寻找整体残差最小的可表达预测；有噪声或超定时，残差通常不为零。',
          'Least squares finds the expressible prediction with minimum overall residual; with noise or an overdetermined system, residuals are usually nonzero.',
        ),
        example: copy(
          md`若 \(m=300,n=3\)，二次模型只有三个参数，通常不会精确命中 300 个带噪声点。`,
          md`If \(m=300,n=3\), a quadratic model has only three parameters and usually will not hit 300 noisy points exactly.`,
        ),
      },
      {
        id: 'least-squares-normal-equations-always-best',
        statement: copy('正规方程有闭式解，所以总是最好的数值算法。', 'Normal equations have a closed form, so they are always the best numerical algorithm.'),
        correction: copy(
          '正规方程实现简单，但会把条件数平方；病态问题通常更适合 QR、SVD 或正则化。',
          'Normal equations are simple, but they square the condition number; ill-conditioned problems usually call for QR, SVD, or regularization.',
        ),
        example: copy(
          md`若 \(\operatorname{cond}(A)=10^6\)，则 \(\operatorname{cond}(A^TA)=10^{12}\)，许多有效数字会被噪声吞掉。`,
          md`If \(\operatorname{cond}(A)=10^6\), then \(\operatorname{cond}(A^TA)=10^{12}\), so many useful digits can be lost to noise.`,
        ),
      },
      {
        id: 'least-squares-linear-in-input',
        statement: copy(md`只要曲线关于输入 \(t\) 是弯的，就不是线性最小二乘。`, md`If the curve is nonlinear in input \(t\), it cannot be linear least squares.`),
        correction: copy(
          md`线性最小二乘看的是参数是否线性出现；多项式基函数和 \(\cos(t)\) 都可以形成线性参数模型。`,
          md`Linear least squares checks whether the parameters enter linearly; polynomial bases and \(\cos(t)\) can both form linear-parameter models.`,
        ),
        example: copy(
          md`模型 \(f(t,\mathbf{x})=x_1+x_2t+x_3t^2\) 关于 \(t\) 是二次，但关于 \(x_1,x_2,x_3\) 是线性的。`,
          md`The model \(f(t,\mathbf{x})=x_1+x_2t+x_3t^2\) is quadratic in \(t\), but linear in \(x_1,x_2,x_3\).`,
        ),
      },
    ],
    accent: '#2563eb',
    theme: '#edf4ff',
  }
}
