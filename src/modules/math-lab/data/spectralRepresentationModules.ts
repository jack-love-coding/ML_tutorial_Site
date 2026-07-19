import type {
  LocalizedCopy,
  MathConcept,
  MathLabModule,
  MathLabSection,
  SourceReference,
} from '../types/mathLab.ts'

const md = String.raw
const copy = (zhCN: string, en: string): LocalizedCopy => ({ 'zh-CN': zhCN, en })

const leastSquaresSources = [
  {
    label: copy('NumPy：线性最小二乘求解', 'NumPy: Linear Least-Squares Solver'),
    href: 'https://numpy.org/doc/stable/reference/generated/numpy.linalg.lstsq.html',
    usage: copy(
      '核对 np.linalg.lstsq 的返回值、rank 与奇异值语义。',
      'Reference for np.linalg.lstsq return values, rank, and singular-value semantics.',
    ),
  },
  {
    label: copy('Mathematics for Machine Learning', 'Mathematics for Machine Learning'),
    href: 'https://mml-book.github.io/',
    usage: copy(
      '参考最小二乘、投影、伪逆与机器学习之间的联系。',
      'Reference for links among least squares, projection, pseudoinverses, and machine learning.',
    ),
  },
] satisfies SourceReference[]

function section(
  id: string,
  zhTitle: string,
  enTitle: string,
  zhContent: string,
  enContent: string,
  placements: Pick<MathLabSection, 'visualIds' | 'labIds'> = {},
): MathLabSection {
  return {
    id,
    level: 2,
    title: copy(zhTitle, enTitle),
    content: copy(zhContent, enContent),
    ...placements,
  }
}

function withToc(moduleDefinition: MathLabModule): MathLabModule {
  return {
    ...moduleDefinition,
    toc: moduleDefinition.sections.map(({ id, level, title }) => ({ id, level, title })),
  }
}

function withConceptCode(
  concepts: readonly MathConcept[],
  conceptId: string,
  codeExample: string,
  output: string,
): MathConcept[] {
  return concepts.map((concept) => concept.id === conceptId
    ? { ...concept, codeExample, codeOutput: copy(output, output) }
    : concept)
}

function insertAfter(
  sections: readonly MathLabSection[],
  targetId: string,
  additions: readonly MathLabSection[],
): MathLabSection[] {
  const nextSections: MathLabSection[] = []
  let inserted = false

  for (const currentSection of sections) {
    nextSections.push(currentSection)
    if (currentSection.id === targetId) {
      nextSections.push(...additions)
      inserted = true
    }
  }

  if (!inserted) {
    throw new Error(`Missing section insertion target: ${targetId}`)
  }

  return nextSections
}

const sharedDataCode = md`import numpy as np

X = np.array([
    [-3.0, -1.0],
    [-1.0, -3.0],
    [ 1.0,  3.0],
    [ 3.0,  1.0],
])
targets = np.array([-7.0, -4.0, 5.0, 7.0])

if X.ndim != 2 or targets.ndim != 1:
    raise ValueError("X must be 2D and targets must be 1D")
if X.shape[0] != targets.shape[0]:
    raise ValueError("X and targets need the same number of rows")
if not np.isfinite(X).all() or not np.isfinite(targets).all():
    raise ValueError("data must contain only finite values")`

const leastSquaresCode = md`${sharedDataCode}

weights, _, rank, singular_values = np.linalg.lstsq(X, targets, rcond=None)
predictions = X @ weights
residual = targets - predictions
orthogonality = X.T @ residual
orthogonality[np.abs(orthogonality) < 1e-12] = 0.0

print("X shape =", X.shape)
print("rank =", rank)
print("weights =", np.round(weights, 6).tolist())
print("predictions =", np.round(predictions, 6).tolist())
print("residual =", np.round(residual, 6).tolist())
print("SSE =", round(float(residual @ residual), 6))
print("X.T @ residual =", np.round(orthogonality, 6).tolist())`

const leastSquaresOutput = 'X shape = (4, 2)\nrank = 2\nweights = [2.0625, 0.8125]\npredictions = [-7.0, -4.5, 4.5, 7.0]\nresidual = [0.0, 0.5, 0.5, 0.0]\nSSE = 0.5\nX.T @ residual = [0.0, 0.0]'

const eigenCode = md`import numpy as np

X = np.array([
    [-3.0, -1.0],
    [-1.0, -3.0],
    [ 1.0,  3.0],
    [ 3.0,  1.0],
])

if X.ndim != 2 or X.shape[0] < 2 or not np.isfinite(X).all():
    raise ValueError("X needs at least two finite rows")
if not np.allclose(X.mean(axis=0), 0.0):
    raise ValueError("this example expects centered columns")

covariance = X.T @ X / (X.shape[0] - 1)
values, vectors = np.linalg.eigh(covariance)
order = np.argsort(values)[::-1]
values, vectors = values[order], vectors[:, order]

# Eigenvector signs are arbitrary; choose a stable display convention.
for column in range(vectors.shape[1]):
    first_nonzero = np.flatnonzero(np.abs(vectors[:, column]) > 1e-12)[0]
    if vectors[first_nonzero, column] < 0:
        vectors[:, column] *= -1

direction = np.array([1.0, 0.0])
for _ in range(4):
    direction = covariance @ direction
    direction /= np.linalg.norm(direction)
rayleigh = float(direction @ covariance @ direction)

print("covariance =", np.round(covariance, 6).tolist())
print("eigenvalues =", np.round(values, 6).tolist())
print("eigenvectors =", np.round(vectors, 6).tolist())
print("power direction =", np.round(direction, 6).tolist())
print("Rayleigh quotient =", round(rayleigh, 6))`

const eigenOutput = 'covariance = [[6.666667, 4.0], [4.0, 6.666667]]\neigenvalues = [10.666667, 2.666667]\neigenvectors = [[0.707107, 0.707107], [0.707107, -0.707107]]\npower direction = [0.709864, 0.704339]\nRayleigh quotient = 10.666545'

const svdCode = md`import numpy as np

X = np.array([
    [-3.0, -1.0],
    [-1.0, -3.0],
    [ 1.0,  3.0],
    [ 3.0,  1.0],
])

if X.ndim != 2 or not np.isfinite(X).all():
    raise ValueError("X must be a finite 2D matrix")

U, singular_values, Vt = np.linalg.svd(X, full_matrices=False)
energy_ratio = singular_values ** 2 / np.sum(singular_values ** 2)
rank_one = (U[:, :1] * singular_values[:1]) @ Vt[:1]
error = float(np.linalg.norm(X - rank_one, ord="fro"))

print("X shape =", X.shape)
print("U, S, Vt shapes =", U.shape, singular_values.shape, Vt.shape)
print("singular values =", np.round(singular_values, 6).tolist())
print("energy ratio =", np.round(energy_ratio, 6).tolist())
print("rank-1 reconstruction =", np.round(rank_one, 6).tolist())
print("Frobenius error =", round(error, 6))`

const svdOutput = 'X shape = (4, 2)\nU, S, Vt shapes = (4, 2) (2,) (2, 2)\nsingular values = [5.656854, 2.828427]\nenergy ratio = [0.8, 0.2]\nrank-1 reconstruction = [[-2.0, -2.0], [-2.0, -2.0], [2.0, 2.0], [2.0, 2.0]]\nFrobenius error = 2.828427'

const pcaCode = md`import numpy as np

X_raw = np.array([
    [-3.0, -1.0],
    [-1.0, -3.0],
    [ 1.0,  3.0],
    [ 3.0,  1.0],
])

if X_raw.ndim != 2 or not np.isfinite(X_raw).all():
    raise ValueError("X_raw must be a finite 2D matrix")

mean = X_raw.mean(axis=0, keepdims=True)
X = X_raw - mean
_, singular_values, Vt = np.linalg.svd(X, full_matrices=False)

# Singular-vector signs are arbitrary; stabilize printed coordinates.
for row in range(Vt.shape[0]):
    first_nonzero = np.flatnonzero(np.abs(Vt[row]) > 1e-12)[0]
    if Vt[row, first_nonzero] < 0:
        Vt[row] *= -1

scores = X @ Vt.T
explained_ratio = singular_values ** 2 / np.sum(singular_values ** 2)
rank_one = scores[:, :1] @ Vt[:1] + mean
rmse = float(np.sqrt(np.mean((X_raw - rank_one) ** 2)))

print("mean =", np.round(mean[0], 6).tolist())
print("components =", np.round(Vt, 6).tolist())
print("scores =", np.round(scores, 6).tolist())
print("explained ratio =", np.round(explained_ratio, 6).tolist())
print("rank-1 reconstruction =", np.round(rank_one, 6).tolist())
print("elementwise RMSE =", round(rmse, 6))`

const pcaOutput = 'mean = [0.0, 0.0]\ncomponents = [[0.707107, 0.707107], [0.707107, -0.707107]]\nscores = [[-2.828427, -1.414214], [-2.828427, 1.414214], [2.828427, -1.414214], [2.828427, 1.414214]]\nexplained ratio = [0.8, 0.2]\nrank-1 reconstruction = [[-2.0, -2.0], [-2.0, -2.0], [2.0, 2.0], [2.0, 2.0]]\nelementwise RMSE = 1.0'

const leastSquaresSharedSection = section(
  'v3-least-squares-shared-data',
  '共同数据：四个样本怎样变成一个拟合问题',
  'Shared Data: Turn Four Samples into a Fitting Problem',
  md`从本章到 PCA 都使用同一个中心化数据矩阵

$$
X=\begin{bmatrix}-3&-1\\-1&-3\\1&3\\3&1\end{bmatrix},
\qquad
\mathbf{y}=\begin{bmatrix}-7\\-4\\5\\7\end{bmatrix}.
$$

每一行是一条样本，每一列是一种已经中心化的特征。当前任务是用一个没有截距项的线性模型 $\hat{\mathbf y}=X\mathbf w$ 解释标签。shape 账本是 $X:(4,2)$、$\mathbf w:(2,)$、$\hat{\mathbf y}:(4,)$：两个参数需要同时解释四个观测，因此这是超定系统，通常不能让四个残差都等于零。

手算从 $X^TX=\begin{bmatrix}20&12\\12&20\end{bmatrix}$ 和 $X^T\mathbf y=[51,41]^T$ 开始。解正规方程得到 $\mathbf w=[2.0625,0.8125]^T$，预测是 $[-7,-4.5,4.5,7]^T$。第二、三个样本各留下 $0.5$ 的残差，残差平方和为 $0.5$。这正是“最好拟合”而不是“每点穿过”的区别。`,
  md`This chapter through PCA uses one centered data matrix:

$$
X=\begin{bmatrix}-3&-1\\-1&-3\\1&3\\3&1\end{bmatrix},
\qquad
\mathbf{y}=\begin{bmatrix}-7\\-4\\5\\7\end{bmatrix}.
$$

Each row is an example and each column is an already-centered feature. The current task uses a linear model without an intercept, $\hat{\mathbf y}=X\mathbf w$, to explain the labels. The shape ledger is $X:(4,2)$, $\mathbf w:(2,)$, and $\hat{\mathbf y}:(4,)$. Two parameters must account for four observations, so this overdetermined system will not usually make every residual zero.

The hand calculation starts from $X^TX=\begin{bmatrix}20&12\\12&20\end{bmatrix}$ and $X^T\mathbf y=[51,41]^T$. Solving the normal equations gives $\mathbf w=[2.0625,0.8125]^T$ and predictions $[-7,-4.5,4.5,7]^T$. Examples two and three each retain residual $0.5$, for a sum of squared errors of $0.5$. That is the distinction between best fit and passing through every point.`,
  { labIds: ['least-squares-residual-lab'] },
)

const leastSquaresOutputSection = section(
  'v3-least-squares-numpy-output',
  'NumPy 核验：解、预测与残差正交必须同时成立',
  'NumPy Check: Solution, Prediction, and Residual Orthogonality Must Agree',
  md`运行代码不显式计算 $(X^TX)^{-1}$，而是调用 **np.linalg.lstsq** 直接求解。页面保留完整输出，让权重、预测、残差和手算可以逐项核对。最关键的一行是 **X.T @ residual = [0,0]**：残差不为零，却与 $X$ 的每一列都正交，因此任何沿模型列空间的小调整都不能继续降低平方误差。

这个条件也给出调试顺序。如果权重看似合理但 $X^T\mathbf r$ 明显不接近零，应检查 residual 的符号、样本轴、标签顺序和求解器输入。若 $X^T\mathbf r\approx0$ 但参数随微小数据扰动剧烈变化，则问题更可能是共线性或小奇异值，而不是最优性条件没有满足。`,
  md`The code avoids explicitly forming $(X^TX)^{-1}$ and calls **np.linalg.lstsq** directly. Complete output is retained so weights, predictions, residuals, and the hand calculation can be compared line by line. The crucial line is **X.T @ residual = [0,0]**: the residual is nonzero but orthogonal to every column of $X$, so no small adjustment inside the model's column space can further reduce squared error.

This condition also gives a debugging order. If weights look plausible but $X^T\mathbf r$ is clearly nonzero, inspect residual sign, sample axis, label order, and solver inputs. If $X^T\mathbf r\approx0$ while parameters change violently under small perturbations, collinearity or a small singular value is more likely than a failed optimality condition.`,
)

const leastSquaresSummarySection = section(
  'v3-least-squares-summary',
  '本章小结：从监督目标交给数据自身的几何',
  'Summary: Hand the Supervised Objective to Data Geometry',
  md`最小二乘使用了标签 $\mathbf y$，回答“哪组参数最能预测目标”。它把预测限制在 $X$ 的列空间内，并用残差正交刻画最优解。需要记住的边界是：最小二乘解不等于精确解；正规方程便于推导但可能放大条件数；实际代码优先使用 **lstsq**、QR 或 SVD，而不是显式求逆。

下一章暂时放下标签，只研究同一个 $X$ 的内部结构。因为 $X$ 不是方阵，不能直接对它做通常意义的特征分解；我们先形成方阵协方差 $X^TX/(m-1)$，再问哪些方向经过这个变换后只被缩放。`,
  md`Least squares uses labels $\mathbf y$ and asks which parameters best predict a target. It restricts predictions to the column space of $X$ and characterizes the optimum through residual orthogonality. Keep three boundaries clear: a least-squares solution is not necessarily an exact solution; normal equations are useful for derivation but can square the condition number; production code should prefer **lstsq**, QR, or SVD over an explicit inverse.

The next chapter sets labels aside and studies the internal structure of the same $X$. Because $X$ is rectangular, it does not have the usual eigendecomposition. We first form the square covariance matrix $X^TX/(m-1)$ and then ask which directions are only scaled by that transformation.`,
)

const eigenSharedSection = section(
  'v3-eigen-shared-covariance',
  '共同数据：协方差把四个样本汇总成方向变换',
  'Shared Data: Covariance Summarizes Four Samples as a Directional Transform',
  md`继续使用已经中心化的 $X$。样本协方差为

$$
C=\frac{1}{m-1}X^TX=
\begin{bmatrix}6.666667&4\\4&6.666667\end{bmatrix}.
$$

它是 $2\times2$ 对称方阵：输入一个特征空间方向，输出该方向与数据变化结构相互作用后的新方向。解 $C\mathbf v=\lambda\mathbf v$ 得到特征值 $10.666667$ 和 $2.666667$；对应方向可取 $[0.707107,0.707107]^T$ 与 $[0.707107,-0.707107]^T$。第一方向沿“两列同增同减”，承载的方差是第二方向的四倍。

特征向量的正负号没有唯一性：$\mathbf v$ 和 $-\mathbf v$ 表示同一条轴。代码为了稳定显示，约定第一个非零坐标为正；这只是输出约定，不是新的数学条件。若测试直接要求某个库永远返回同一符号，会把正确结果误判为错误。`,
  md`Continue with the already-centered $X$. Its sample covariance is

$$
C=\frac{1}{m-1}X^TX=
\begin{bmatrix}6.666667&4\\4&6.666667\end{bmatrix}.
$$

This is a $2\times2$ symmetric square matrix: it accepts a direction in feature space and returns how that direction interacts with the data's variation structure. Solving $C\mathbf v=\lambda\mathbf v$ gives eigenvalues $10.666667$ and $2.666667$, with directions that may be chosen as $[0.707107,0.707107]^T$ and $[0.707107,-0.707107]^T$. The first direction follows both columns moving together and carries four times the variance of the second.

Eigenvector signs are not unique: $\mathbf v$ and $-\mathbf v$ describe the same axis. The code adopts a stable display convention in which the first nonzero coordinate is positive. This is an output convention, not an additional mathematical constraint. A test that demands the library always return one sign would reject valid results.`,
  { labIds: ['eigen-power-iteration-lab'] },
)

const eigenOutputSection = section(
  'v3-eigen-numpy-output',
  'NumPy 核验：精确分解与幂迭代读到同一主方向',
  'NumPy Check: Exact Decomposition and Power Iteration Find the Same Direction',
  md`**np.linalg.eigh** 专门处理实对称矩阵，返回实数特征值和正交特征向量。代码将特征值按从大到小排序，同时从 $[1,0]^T$ 开始做四次归一化幂迭代。得到的方向约为 $[0.709864,0.704339]^T$，已经接近精确主方向；Rayleigh quotient 为 $10.666545$，也接近最大特征值。

幂迭代之所以在这里很快，是因为幅值比 $|\lambda_2/\lambda_1|=0.25$。若两个最大特征值幅值相同、初始向量刚好与主方向正交，或者矩阵的主结构不是单一实方向，简单幂迭代就可能缓慢、振荡或无法选出唯一方向。库函数结果和迭代过程分别回答“分解是什么”和“算法怎样靠近它”。`,
  md`**np.linalg.eigh** is specialized for real symmetric matrices and returns real eigenvalues with orthogonal eigenvectors. The code sorts values from largest to smallest and also runs four normalized power iterations from $[1,0]^T$. The resulting direction, approximately $[0.709864,0.704339]^T$, is already close to the exact dominant direction; its Rayleigh quotient, $10.666545$, is close to the largest eigenvalue.

Power iteration is fast here because $|\lambda_2/\lambda_1|=0.25$. If the largest magnitudes tie, the initial vector is exactly orthogonal to the dominant direction, or the dominant structure is not a single real direction, basic power iteration can be slow, oscillate, or fail to choose a unique direction. The library result answers what the decomposition is, while the iteration shows how an algorithm approaches it.`,
)

const eigenSummarySection = section(
  'v3-eigen-summary',
  '本章小结：方阵的一套坐标还不够处理原始数据表',
  'Summary: One Coordinate System for a Square Matrix Is Not Yet Enough',
  md`特征分解为方阵寻找保持方向，协方差的主特征向量因此成为最大方差轴。对称矩阵带来实特征值与正交方向，但一般方阵可能有复数特征值、缺少完整特征向量，幂迭代也需要清楚的谱间隔。

原始 $X$ 是 $4\times2$：它把二维特征方向送到四维样本空间，输入与输出不在同一空间。下一章用 SVD 同时寻找两套正交基，让任意矩形矩阵都能写成“输入方向 → 非负缩放 → 输出方向”。`,
  md`Eigendecomposition finds preserved directions of a square matrix, so the dominant eigenvector of covariance becomes the maximum-variance axis. Symmetric matrices provide real eigenvalues and orthogonal directions, while a general square matrix may have complex values or lack a complete eigenbasis, and power iteration still needs a useful spectral gap.

The original $X$ is $4\times2$: it sends two-dimensional feature directions into a four-dimensional sample space, so input and output do not share one coordinate system. The next chapter uses SVD to find two orthogonal bases, expressing any rectangular matrix as input directions, nonnegative scaling, and output directions.`,
)

const svdSharedSection = section(
  'v3-svd-shared-data',
  '共同数据：让矩形数据表也拥有方向分解',
  'Shared Data: Give a Rectangular Data Table a Directional Decomposition',
  md`对同一个 $X\in\mathbb R^{4\times2}$ 做 reduced SVD：

$$
X=U\Sigma V^T,
\qquad
U:(4,2),\ \Sigma:(2,2),\ V^T:(2,2).
$$

奇异值是 $[5.656854,2.828427]$。它们分别是 $X^TX$ 特征值 $[32,8]$ 的平方根；若改看样本协方差，还要再除以 $m-1=3$，才得到上一章的 $[10.666667,2.666667]$。因此“奇异值”“奇异值平方”和“协方差特征值”相关，却不能混用。

保留第一个奇异方向得到 rank-1 重建：前两行都变成 $[-2,-2]$，后两行都变成 $[2,2]$。它保留两列共同变化的主结构，丢掉沿 $[1,-1]$ 的差异；Frobenius 误差正好等于被丢弃的第二奇异值 $2.828427$。`,
  md`Apply a reduced SVD to the same $X\in\mathbb R^{4\times2}$:

$$
X=U\Sigma V^T,
\qquad
U:(4,2),\ \Sigma:(2,2),\ V^T:(2,2).
$$

The singular values are $[5.656854,2.828427]$. They are square roots of eigenvalues $[32,8]$ of $X^TX$. To obtain the sample-covariance eigenvalues from the previous chapter, divide the squares by $m-1=3$, giving $[10.666667,2.666667]$. Singular values, squared singular values, and covariance eigenvalues are related but not interchangeable.

Keeping the first singular direction gives a rank-one reconstruction: both first rows become $[-2,-2]$ and both last rows become $[2,2]$. It preserves the shared movement of the two columns and discards variation along $[1,-1]$. The Frobenius error equals the omitted second singular value, $2.828427$.`,
  { visualIds: ['svd-low-rank-reconstruction-video'], labIds: ['svd-low-rank-lab'] },
)

const svdOutputSection = section(
  'v3-svd-numpy-output',
  'NumPy 核验：shape、能量比例与低秩误差',
  'NumPy Check: Shapes, Energy Ratios, and Low-Rank Error',
  md`代码使用 **full_matrices=False**，因为后续只需要与非零奇异方向对应的 reduced factors。输出先核对三个 shape，再计算 $\sigma_i^2/\sum_j\sigma_j^2=[0.8,0.2]$。这里第一方向占 80% 的平方 Frobenius 能量；不能写成 $5.656854/(5.656854+2.828427)$，后者使用奇异值本身，只会得到错误的三分之二。

Eckart–Young 结论说明：在所有 rank-1 矩阵中，截断 SVD 同时给出最小 Frobenius 误差和最小 2-范数误差。它不保证对每个单元格、每个群体或下游分类任务都最优。若小奇异方向承载稀有但关键的标签信息，只按重建能量截断仍可能伤害模型。`,
  md`The code uses **full_matrices=False** because later calculations need only reduced factors associated with supported singular directions. Output first verifies all three shapes and then computes $\sigma_i^2/\sum_j\sigma_j^2=[0.8,0.2]$. The first direction carries 80% of squared Frobenius energy. Computing $5.656854/(5.656854+2.828427)$ would incorrectly use singular values themselves and return two thirds.

The Eckart–Young result says truncated SVD minimizes both Frobenius and spectral-norm error among all rank-one matrices. It does not promise the best error for every cell, every population group, or a downstream classifier. A small singular direction may carry rare but important label information, so truncating purely by reconstruction energy can still damage a model.`,
)

const svdSummarySection = section(
  'v3-svd-summary',
  '本章小结：SVD 提供工具，PCA 决定怎样使用',
  'Summary: SVD Supplies the Tool; PCA Defines the Use',
  md`SVD 适用于任意矩形矩阵，right singular vectors 描述输入特征方向，left singular vectors 描述对应的样本方向，奇异值描述每对方向的缩放强度。非零奇异值数量给出 rank，小奇异值揭示不稳定方向，截断 SVD 给出受 rank 限制的最佳整体重建。

下一章把这套分解用于一个具体统计目标：先中心化样本，再按方差从大到小选择 right singular vectors 作为新坐标轴。SVD 是分解算法；PCA 是围绕中心化、方差解释、投影和重建组成的降维流程。`,
  md`SVD applies to any rectangular matrix. Right singular vectors describe feature-space directions, left singular vectors describe paired sample-space directions, and singular values give their scaling strengths. The number of nonzero singular values gives rank, small values reveal unstable directions, and truncated SVD gives the best overall reconstruction under a rank constraint.

The next chapter uses this decomposition for a specific statistical objective: center examples, then choose right singular vectors in descending variance order as new coordinate axes. SVD is a factorization algorithm; PCA is a dimensionality-reduction workflow built from centering, variance interpretation, projection, and reconstruction.`,
)

const pcaSharedSection = section(
  'v3-pca-shared-data',
  '共同数据：从分解结果得到主成分坐标',
  'Shared Data: Turn the Factorization into Principal-Component Coordinates',
  md`这组 $X$ 的列均值恰好是 $[0,0]$，所以中心化不会改变数值；真实数据仍必须先计算训练集均值并减去它。PCA 取 SVD 的 right singular vectors 作为 components，再计算 scores：

$$
Z=XV=
\begin{bmatrix}
-2.828427&-1.414214\\
-2.828427& 1.414214\\
 2.828427&-1.414214\\
 2.828427& 1.414214
\end{bmatrix}.
$$

components 是新坐标轴，scores 是每个样本在新轴上的坐标，两者不能都含糊地叫“主成分”。第一列 scores 将样本分成负、正两组，解释 80% 方差；第二列记录每组内部沿反向变化的差异，解释 20%。只保留第一列并投回原空间，就得到上一章完全相同的 rank-1 重建。`,
  md`The columns of this $X$ already have mean $[0,0]$, so centering does not change the values. Real data must still subtract means learned from the training set. PCA takes the SVD right singular vectors as components and computes scores:

$$
Z=XV=
\begin{bmatrix}
-2.828427&-1.414214\\
-2.828427& 1.414214\\
 2.828427&-1.414214\\
 2.828427& 1.414214
\end{bmatrix}.
$$

Components are the new coordinate axes, while scores are example coordinates on those axes. Calling both of them simply principal components creates ambiguity. The first score column separates negative and positive examples and explains 80% of variance. The second records within-group opposite movement and explains 20%. Keeping only the first column and projecting back produces exactly the same rank-one reconstruction as the SVD chapter.`,
  { visualIds: ['pca-centering-projection-video'], labIds: ['pca-projection-lab'] },
)

const pcaOutputSection = section(
  'v3-pca-numpy-output',
  'NumPy 核验：中心化、投影、解释比例与重建闭环',
  'NumPy Check: Close the Centering, Projection, Variance, and Reconstruction Loop',
  md`代码显式保留 mean、components、scores、explained ratio 和 reconstruction。完整闭环是：用训练均值中心化 $X$；求 components；计算 $Z=XV$；选择前 $k$ 列；用 $Z_kV_k^T+\mu$ 回到原坐标。只打印二维散点图而不保存均值和 components，无法对新样本复用同一个变换，也无法检查图上的轴究竟代表什么。

rank-1 重建的逐元素 RMSE 为 $1.0$。这与 Frobenius 误差 $2.828427$ 不冲突，因为矩阵共有 8 个元素：$2.828427/\sqrt8=1$。指标的归一化方式必须一起写出，否则同一个误差会看起来像两个不同结果。`,
  md`The code explicitly retains the mean, components, scores, explained ratio, and reconstruction. The complete loop is: center $X$ with training means, find components, compute $Z=XV$, select the first $k$ columns, then return to original coordinates with $Z_kV_k^T+\mu$. A two-dimensional scatter plot without saved means and components cannot transform new examples consistently or explain what its axes represent.

The elementwise RMSE of the rank-one reconstruction is $1.0$. This does not conflict with Frobenius error $2.828427$, because the matrix contains eight elements and $2.828427/\sqrt8=1$. Error normalization must be stated; otherwise one reconstruction appears to have two unrelated results.`,
)

const pcaSummarySection = section(
  'v3-pca-summary',
  '本章小结：PCA 保留最大方差，不读取标签',
  'Summary: PCA Keeps Maximum Variance Without Reading Labels',
  md`PCA 的四步是中心化、求方向、投影、按需要重建。当前数据第一方向解释 80% 方差，保留它能获得最小整体平方重建误差；但 PCA 从未读取 targets，因此不能据此声称它找到了最适合预测 $\mathbf y$ 的方向。最大方差、最小重建误差和最佳分类边界是三个不同目标。

应用时还要固定预处理合同：均值与可选的缩放参数只从训练集估计；验证集和新样本复用这些参数；components 的符号可能翻转但子空间不变；选择 $k$ 时同时查看解释方差、重建质量、可解释性和下游任务结果。至此，同一个 $X$ 已经走完监督拟合、方阵谱结构、矩形分解与无监督降维的完整链条。`,
  md`PCA consists of centering, finding directions, projecting, and reconstructing when needed. The first direction in this data explains 80% of variance, and keeping it minimizes overall squared reconstruction error. PCA never reads the targets, however, so this does not show that it found the best direction for predicting $\mathbf y$. Maximum variance, minimum reconstruction error, and best classification boundary are different objectives.

Real use also needs a fixed preprocessing contract: learn means and optional scaling parameters only from training data; reuse them for validation and new examples; allow component signs to flip while recognizing the same subspace; and choose $k$ using explained variance, reconstruction quality, interpretability, and downstream results together. The shared $X$ has now completed a full path through supervised fitting, square-matrix spectral structure, rectangular factorization, and unsupervised reduction.`,
)

function enhanceLeastSquares(moduleDefinition: MathLabModule): MathLabModule {
  const sectionsWithoutReview = moduleDefinition.sections.filter(
    ({ id }) => id !== 'least-squares-fitting-review-questions',
  )
  const withSharedData = insertAfter(
    sectionsWithoutReview,
    'least-squares-fitting-learning-objectives',
    [leastSquaresSharedSection],
  )
  const withOutput = insertAfter(
    withSharedData,
    'least-squares-fitting-normal-equations-projection',
    [leastSquaresOutputSection],
  )

  return withToc({
    ...moduleDefinition,
    estimatedMinutes: 70,
    prerequisites: [
      'linear-algebra-feature-space',
      'linear-algebra-matrix-transformations',
    ],
    sourceReferences: moduleDefinition.sourceReferences?.length
      ? moduleDefinition.sourceReferences
      : leastSquaresSources,
    concepts: withConceptCode(
      moduleDefinition.concepts,
      'least-squares-residual-objective',
      leastSquaresCode,
      leastSquaresOutput,
    ),
    sections: [...withOutput, leastSquaresSummarySection],
  })
}

function enhanceEigenvalues(moduleDefinition: MathLabModule): MathLabModule {
  const sectionsWithoutReview = moduleDefinition.sections.filter(
    ({ id }) => id !== 'eigenvalues-eigenvectors-review-questions',
  )
  const withSharedData = insertAfter(
    sectionsWithoutReview,
    'eigenvalues-eigenvectors-learning-objectives',
    [eigenSharedSection],
  )
  const withOutput = insertAfter(
    withSharedData,
    'eigenvalues-eigenvectors-power-iteration',
    [eigenOutputSection],
  )

  return withToc({
    ...moduleDefinition,
    estimatedMinutes: 65,
    concepts: withConceptCode(
      moduleDefinition.concepts,
      'eigenpair',
      eigenCode,
      eigenOutput,
    ),
    sections: [...withOutput, eigenSummarySection],
  })
}

function enhanceSvd(moduleDefinition: MathLabModule): MathLabModule {
  const sectionsWithoutReview = moduleDefinition.sections.filter(({ id }) => id !== 'svd-review-questions')
  const withSharedData = insertAfter(sectionsWithoutReview, 'svd-learning-objectives', [svdSharedSection])
  const withOutput = insertAfter(
    withSharedData,
    'svd-low-rank-approximation-and-ml',
    [svdOutputSection],
  )

  return withToc({
    ...moduleDefinition,
    estimatedMinutes: 65,
    prerequisites: [
      'least-squares-fitting',
      'eigenvalues-eigenvectors',
      'linear-algebra-rank-null-space',
    ],
    concepts: withConceptCode(
      moduleDefinition.concepts,
      'singular-value-decomposition',
      svdCode,
      svdOutput,
    ),
    sections: [...withOutput, svdSummarySection],
  })
}

function enhancePca(moduleDefinition: MathLabModule): MathLabModule {
  const sectionsWithoutReview = moduleDefinition.sections.filter(({ id }) => id !== 'pca-review-questions')
  const withSharedData = insertAfter(sectionsWithoutReview, 'pca-learning-objectives', [pcaSharedSection])
  const withOutput = insertAfter(
    withSharedData,
    'pca-svd-route-and-explained-variance',
    [pcaOutputSection],
  )

  return withToc({
    ...moduleDefinition,
    estimatedMinutes: 60,
    prerequisites: [
      'svd',
      'least-squares-fitting',
      'eigenvalues-eigenvectors',
      'linear-algebra-rank-null-space',
    ],
    concepts: withConceptCode(
      moduleDefinition.concepts,
      'pca-centered-projection',
      pcaCode,
      pcaOutput,
    ),
    sections: [...withOutput, pcaSummarySection],
  })
}

export function enhanceSpectralRepresentationModule(
  moduleDefinition: MathLabModule,
): MathLabModule {
  if (moduleDefinition.id === 'least-squares-fitting') return enhanceLeastSquares(moduleDefinition)
  if (moduleDefinition.id === 'eigenvalues-eigenvectors') return enhanceEigenvalues(moduleDefinition)
  if (moduleDefinition.id === 'svd') return enhanceSvd(moduleDefinition)
  if (moduleDefinition.id === 'pca') return enhancePca(moduleDefinition)
  return moduleDefinition
}
