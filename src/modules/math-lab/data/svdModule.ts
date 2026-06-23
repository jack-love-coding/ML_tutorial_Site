import type { LocalizedCopy, MathLabModule, MathLabSection, SourceReference } from '../types/mathLab'

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

const sources = {
  essenceLinearAlgebra: {
    label: copy('3Blue1Brown：线性代数的本质', '3Blue1Brown: Essence of Linear Algebra'),
    href: 'https://www.3blue1brown.com/topics/linear-algebra',
    usage: copy(
      '参考把矩阵分解读成方向和缩放的视觉组织方式。',
      'Reference for visual organization of matrix decompositions as directions and scaling.',
    ),
  },
  d2lLinearAlgebra: {
    label: copy('Dive into Deep Learning：线性代数', 'Dive into Deep Learning: Linear Algebra'),
    href: 'https://d2l.ai/chapter_preliminaries/linear-algebra.html',
    usage: copy(
      '参考机器学习中矩阵分解、范数和低秩结构的基础表达。',
      'Reference for matrix decompositions, norms, and low-rank structure in machine learning.',
    ),
  },
  mml: {
    label: copy('Mathematics for Machine Learning', 'Mathematics for Machine Learning'),
    href: 'https://mml-book.github.io/',
    usage: copy(
      '参考 SVD、矩阵近似和降维之间的机器学习联系。',
      'Reference for SVD, matrix approximation, dimensionality reduction, and machine-learning links.',
    ),
  },
} satisfies Record<string, SourceReference>

const sections: MathLabSection[] = [
  section(
    'svd-learning-objectives',
    copy('学习目标', 'Learning Objectives'),
    copy(
      md`读完这一章后，你应该能把“矩阵如何作用在所有方向上”拆成方向、尺度和方向三个部分：

- 构造并识别 SVD 中的 \(U\)、\(\Sigma\)、\(V\)。
- 说明左奇异向量、右奇异向量和奇异值分别来自 \(AA^T\)、\(A^TA\) 和它们的非零特征值。
- 区分 full SVD 与 reduced SVD，并说清楚它们的矩阵形状。
- 用小型数值例子计算 \(A^TA\)、奇异值、\(V_R\)、\(\Sigma_R\) 和 \(U_R\)。
- 用奇异值判断 rank、effective rank、range、null space、pseudoinverse 和 2-范数条件数。
- 解释低秩近似为什么保留前几个奇异值，以及误差 \(\|A-A_k\|_2=\sigma_{k+1}\) 的意义。
- 使用已知 SVD 解方阵线性系统，并比较分解成本与求解成本。

本章的核心问题是：即使矩阵不是方阵、不可对角化，甚至不可逆，我们还能不能找到一组稳定的正交方向来描述它？SVD 的答案是可以，而且这组方向直接连接到压缩、降维、推荐系统、去噪和病态问题诊断。`,
      md`By the end of this chapter, you should be able to break "how a matrix acts on all directions" into directions, scales, and directions again:

- Construct and identify the \(U\), \(\Sigma\), and \(V\) pieces in an SVD.
- Explain how left singular vectors, right singular vectors, and singular values come from \(AA^T\), \(A^TA\), and their nonzero eigenvalues.
- Distinguish full SVD from reduced SVD and state the matrix shapes in each case.
- Compute \(A^TA\), singular values, \(V_R\), \(\Sigma_R\), and \(U_R\) for a small numerical example.
- Use singular values to read rank, effective rank, range, null space, the pseudoinverse, and the 2-norm condition number.
- Explain why low-rank approximation keeps the leading singular values and what the error identity \(\|A-A_k\|_2=\sigma_{k+1}\) means.
- Use a known SVD to solve a square linear system and compare factorization cost with solve cost.

The central question is: even when a matrix is rectangular, non-diagonalizable, or non-invertible, can we still find stable orthogonal directions that describe it? SVD says yes, and those directions connect directly to compression, dimensionality reduction, recommender systems, denoising, and diagnosing ill-conditioned problems.`,
    ),
  ),
  section(
    'svd-from-eigenvectors-to-two-bases',
    copy('从特征向量到两个正交基', 'From Eigenvectors to Two Orthogonal Bases'),
    copy(
      md`特征值章节研究的是方阵中的特殊方向：若 \(A\mathbf{x}=\lambda\mathbf{x}\)，矩阵作用后方向不变，只发生缩放。这个观点很强，但它有明显限制：矩阵要是方阵，而且要有足够多线性无关的特征向量，才能用 \(A=XDX^{-1}\) 这样的对角化来完整描述。

SVD 放宽了这些要求。对任意实矩阵 \(A\in\mathbb{R}^{m\times n}\)，都存在

$$
A=U\Sigma V^T.
$$

这里 \(V\) 给出输入空间 \(\mathbb{R}^n\) 的一组正交方向，\(U\) 给出输出空间 \(\mathbb{R}^m\) 的一组正交方向，\(\Sigma\) 只负责沿这些配对方向缩放。等价地说，

$$
AV=U\Sigma,
\qquad
A\mathbf{v}_i=\sigma_i\mathbf{u}_i.
$$

这句话是 SVD 最重要的直觉：不是要求同一个方向经过 \(A\) 后还留在同一条线上，而是允许输入方向 \(\mathbf{v}_i\) 被送到输出方向 \(\mathbf{u}_i\)，中间只乘一个非负尺度 \(\sigma_i\)。因此 SVD 能处理矩形矩阵，也能处理 rank deficient 的矩阵。

本节需要掌握的几个结构可以合并成下面的读法：

- \(U\) 是 \(m\times m\) 正交矩阵，列向量称为 left singular vectors。
- \(V\) 是 \(n\times n\) 正交矩阵，列向量称为 right singular vectors。
- \(\Sigma\) 是 \(m\times n\) 对角形矩阵，主对角线上放非负奇异值。
- 奇异值按 \(\sigma_1\ge\sigma_2\ge\dotsb\ge 0\) 排序，\(U\) 和 \(V\) 的列也按同样顺序配对。

把矩阵想成“三步动作”很有用：先用 \(V^T\) 把输入旋到 right singular vector 坐标系，再用 \(\Sigma\) 沿坐标轴缩放或压扁，最后用 \(U\) 把结果旋到输出空间。`,
      md`The eigenvalue chapter studied special directions for square matrices: if \(A\mathbf{x}=\lambda\mathbf{x}\), the direction is preserved and only the scale changes. That viewpoint is powerful, but it has limits. The matrix must be square, and it must have enough linearly independent eigenvectors before a diagonalization such as \(A=XDX^{-1}\) can describe the whole map.

SVD relaxes those requirements. For every real matrix \(A\in\mathbb{R}^{m\times n}\), there is a factorization

$$
A=U\Sigma V^T.
$$

Here \(V\) gives an orthogonal basis for the input space \(\mathbb{R}^n\), \(U\) gives an orthogonal basis for the output space \(\mathbb{R}^m\), and \(\Sigma\) only scales along paired directions. Equivalently,

$$
AV=U\Sigma,
\qquad
A\mathbf{v}_i=\sigma_i\mathbf{u}_i.
$$

This is the key intuition for SVD: it does not require an input direction to stay on the same line after \(A\) acts. Instead, input direction \(\mathbf{v}_i\) is sent to output direction \(\mathbf{u}_i\), scaled by a nonnegative number \(\sigma_i\). That is why SVD works for rectangular matrices and rank-deficient matrices.

These structural facts combine into this reading:

- \(U\) is an \(m\times m\) orthogonal matrix; its columns are the left singular vectors.
- \(V\) is an \(n\times n\) orthogonal matrix; its columns are the right singular vectors.
- \(\Sigma\) is an \(m\times n\) diagonal-shaped matrix with nonnegative singular values on the main diagonal.
- Singular values are ordered as \(\sigma_1\ge\sigma_2\ge\dotsb\ge 0\), and the columns of \(U\) and \(V\) are paired in the same order.

It is useful to view a matrix as a three-step action: \(V^T\) rotates the input into right-singular-vector coordinates, \(\Sigma\) stretches or collapses along coordinate axes, and \(U\) rotates the result into the output space.`,
    ),
  ),
  section(
    'svd-where-the-pieces-come-from',
    copy('奇异值和奇异向量从哪里来', 'Where Singular Values and Singular Vectors Come From'),
    copy(
      md`SVD 的各个部分可以从两个对称半正定矩阵读出。若

$$
A=U\Sigma V^T,
$$

则

$$
AA^T
=U\Sigma V^T(V\Sigma^TU^T)
=U(\Sigma\Sigma^T)U^T,
$$

所以 \(U\) 的列是 \(AA^T\) 的特征向量。类似地，

$$
A^TA
=V(\Sigma^T\Sigma)V^T,
$$

所以 \(V\) 的列是 \(A^TA\) 的特征向量。由于 \(\Sigma^T\Sigma\) 和 \(\Sigma\Sigma^T\) 的非零对角元素都是 \(\sigma_i^2\)，\(A^TA\) 与 \(AA^T\) 有相同的非零特征值，奇异值就是这些非零特征值的平方根。

这也解释了为什么奇异值总是非负。对任意非零向量 \(\mathbf{x}\)，

$$
\mathbf{x}^T(A^TA)\mathbf{x}=\|A\mathbf{x}\|_2^2\ge 0,
$$

所以 \(A^TA\) 是 positive semidefinite，特征值非负；取平方根得到的 \(\sigma_i\) 也非负。

如果 \(\sigma_i=0\)，那么对应方向被 \(A\) 压扁。若一个 \(m\times n\) 矩阵只有 \(r\) 个非零奇异值，则

$$
\operatorname{rank}(A)=r.
$$

在浮点计算里，完全的零值经常变成非常小的非零值。因此实际判断 rank 时会给一个容差：小于容差的奇异值视为数值上的零，这就是 effective rank。`,
      md`The pieces of an SVD can be read from two symmetric positive semidefinite matrices. If

$$
A=U\Sigma V^T,
$$

then

$$
AA^T
=U\Sigma V^T(V\Sigma^TU^T)
=U(\Sigma\Sigma^T)U^T,
$$

so the columns of \(U\) are eigenvectors of \(AA^T\). Similarly,

$$
A^TA
=V(\Sigma^T\Sigma)V^T,
$$

so the columns of \(V\) are eigenvectors of \(A^TA\). Since the nonzero diagonal entries of \(\Sigma^T\Sigma\) and \(\Sigma\Sigma^T\) are \(\sigma_i^2\), the matrices \(A^TA\) and \(AA^T\) have the same nonzero eigenvalues, and the singular values are their square roots.

This also explains why singular values are always nonnegative. For every nonzero vector \(\mathbf{x}\),

$$
\mathbf{x}^T(A^TA)\mathbf{x}=\|A\mathbf{x}\|_2^2\ge 0,
$$

so \(A^TA\) is positive semidefinite and has nonnegative eigenvalues. Taking square roots gives nonnegative \(\sigma_i\).

If \(\sigma_i=0\), the corresponding direction is collapsed by \(A\). If an \(m\times n\) matrix has only \(r\) nonzero singular values, then

$$
\operatorname{rank}(A)=r.
$$

In floating-point computation, exact zeros often become tiny nonzero values. Practical rank decisions therefore use a tolerance: singular values below the tolerance are treated as numerical zeros. This is the effective rank.`,
    ),
  ),
  section(
    'svd-full-reduced-and-cost',
    copy('Full SVD、Reduced SVD 与计算成本', 'Full SVD, Reduced SVD, and Cost'),
    copy(
      md`Full SVD 保留完整的 \(U\) 和 \(V\)：

$$
U\in\mathbb{R}^{m\times m},\qquad
\Sigma\in\mathbb{R}^{m\times n},\qquad
V\in\mathbb{R}^{n\times n}.
$$

但是很多时候，\(\Sigma\) 的大部分区域只是零。若 \(k=\min(m,n)\)，reduced SVD 写成

$$
A=U_R\Sigma_RV_R^T,
$$

其中

$$
U_R\in\mathbb{R}^{m\times k},\qquad
\Sigma_R\in\mathbb{R}^{k\times k},\qquad
V_R\in\mathbb{R}^{n\times k}.
$$

当 \(m\ge n\) 时，\(U_R\) 是 \(m\times n\)，\(\Sigma_R\) 和 \(V_R\) 都只保留 \(n\) 个相关方向；当 \(m\le n\) 时，\(U_R\) 是 \(m\times m\)，\(\Sigma_R\) 是 \(m\times m\)，\(V_R\) 是 \(n\times m\)。图中突出的 reduced 部分就是实际参与乘法的紧凑因子。

![Reduced SVD diagram](/math-lab/cs357-assets/figs/reduced_svd.svg)

任意 \(m\times n\) 矩阵的 SVD 分解成本可粗略写为

$$
O(m^2n+n^3),
$$

更精细的写法常带一个算法相关常数 \(\alpha(m^2n+n^3)\)，\(\alpha\) 可能在 4 到 10 或更高。直觉上，SVD 比 LU 更贵；虽然方阵情形下它们都有 \(O(n^3)\) 级别的分解成本，但 SVD 的常数通常更大。换来的好处是：SVD 对 rank deficient、接近奇异、非方阵的问题更有诊断力。

![SVD cost graph](/math-lab/cs357-assets/figs/svd_graph.png)`,
      md`Full SVD keeps complete \(U\) and \(V\):

$$
U\in\mathbb{R}^{m\times m},\qquad
\Sigma\in\mathbb{R}^{m\times n},\qquad
V\in\mathbb{R}^{n\times n}.
$$

In many applications, however, most of \(\Sigma\) is just zero. If \(k=\min(m,n)\), the reduced SVD is

$$
A=U_R\Sigma_RV_R^T,
$$

where

$$
U_R\in\mathbb{R}^{m\times k},\qquad
\Sigma_R\in\mathbb{R}^{k\times k},\qquad
V_R\in\mathbb{R}^{n\times k}.
$$

When \(m\ge n\), \(U_R\) is \(m\times n\), while \(\Sigma_R\) and \(V_R\) keep only the \(n\) relevant directions. When \(m\le n\), \(U_R\) is \(m\times m\), \(\Sigma_R\) is \(m\times m\), and \(V_R\) is \(n\times m\). In the reduced SVD diagram, the highlighted reduced part is the compact set of factors that actually participates in the multiplication.

![Reduced SVD diagram](/math-lab/cs357-assets/figs/reduced_svd.svg)

The cost of computing an SVD of an arbitrary \(m\times n\) matrix is often summarized as

$$
O(m^2n+n^3),
$$

or more specifically as \(\alpha(m^2n+n^3)\), where the algorithm-dependent constant \(\alpha\) may range from 4 to 10 or more. Intuitively, SVD is more expensive than LU. For square matrices both have \(O(n^3)\) factorization cost, but SVD usually has a larger constant. The payoff is that SVD is much more diagnostic for rank-deficient, nearly singular, and rectangular problems.

![SVD cost graph](/math-lab/cs357-assets/figs/svd_graph.png)`,
    ),
  ),
  section(
    'svd-computing-the-lecture-example',
    copy('手算路径：从 A^T A 到 reduced SVD', 'Hand Path: From A^T A to Reduced SVD'),
    copy(
      md`下面的数值例子从一个 \(5\times 3\) 矩阵开始：

$$
A=\begin{bmatrix}
3&2&3\\
8&8&2\\
8&7&4\\
1&8&7\\
6&4&7
\end{bmatrix}.
$$

第一步计算

$$
A^TA=
\begin{bmatrix}
174&158&106\\
158&197&134\\
106&134&127
\end{bmatrix}.
$$

接着求 \(A^TA\) 的特征值和特征向量。特征值约为

$$
\lambda_1=437.479,\qquad
\lambda_2=42.6444,\qquad
\lambda_3=17.8766.
$$

奇异值是平方根：

$$
\sigma_1=20.916,\qquad
\sigma_2=6.53207,\qquad
\sigma_3=4.22807.
$$

把 \(A^TA\) 的单位特征向量作为列，得到

$$
V_R=
\begin{bmatrix}
0.585051&-0.710399&0.391212\\
0.652648&0.126068&-0.747098\\
0.481418&0.692415&0.537398
\end{bmatrix},
$$

并构造

$$
\Sigma_R=
\begin{bmatrix}
20.916&0&0\\
0&6.53207&0\\
0&0&4.22807
\end{bmatrix}.
$$

最后用

$$
U_R=AV_R\Sigma_R^{-1}
$$

得到 reduced SVD 的左奇异向量。这个公式来自 \(AV_R=U_R\Sigma_R\)：右奇异向量告诉你输入方向，乘上 \(A\) 后得到输出方向的缩放版本，再除以对应奇异值就得到单位左奇异向量。

这个例子也给出一个重要检查：如果 \(\sigma_i\) 很小，计算 \(1/\sigma_i\) 会放大误差；如果 \(\sigma_i=0\)，就不能在普通逆里取倒数，必须改用 pseudoinverse。`,
      md`The numerical example begins with a \(5\times 3\) matrix:

$$
A=\begin{bmatrix}
3&2&3\\
8&8&2\\
8&7&4\\
1&8&7\\
6&4&7
\end{bmatrix}.
$$

First compute

$$
A^TA=
\begin{bmatrix}
174&158&106\\
158&197&134\\
106&134&127
\end{bmatrix}.
$$

Then compute the eigenvalues and eigenvectors of \(A^TA\). The eigenvalues are approximately

$$
\lambda_1=437.479,\qquad
\lambda_2=42.6444,\qquad
\lambda_3=17.8766.
$$

The singular values are the square roots:

$$
\sigma_1=20.916,\qquad
\sigma_2=6.53207,\qquad
\sigma_3=4.22807.
$$

Placing the unit eigenvectors of \(A^TA\) as columns gives

$$
V_R=
\begin{bmatrix}
0.585051&-0.710399&0.391212\\
0.652648&0.126068&-0.747098\\
0.481418&0.692415&0.537398
\end{bmatrix},
$$

and

$$
\Sigma_R=
\begin{bmatrix}
20.916&0&0\\
0&6.53207&0\\
0&0&4.22807
\end{bmatrix}.
$$

Finally,

$$
U_R=AV_R\Sigma_R^{-1}
$$

gives the left singular vectors for the reduced SVD. This formula comes from \(AV_R=U_R\Sigma_R\): the right singular vectors give input directions; after multiplying by \(A\), each direction becomes a scaled output direction; dividing by the corresponding singular value gives a unit left singular vector.

This example also gives an important numerical check. If \(\sigma_i\) is tiny, computing \(1/\sigma_i\) amplifies error. If \(\sigma_i=0\), it cannot be inverted in the ordinary sense, and the pseudoinverse must be used instead.`,
    ),
  ),
  section(
    'svd-rank-range-nullspace-pseudoinverse',
    copy('秩、值域、零空间与伪逆', 'Rank, Range, Null Space, and Pseudoinverse'),
    copy(
      md`SVD 可以写成 outer product 的和：

$$
A=\sum_{i=1}^{s}\sigma_i\mathbf{u}_i\mathbf{v}_i^T,
\qquad
s=\min(m,n).
$$

这个公式把矩阵拆成一层层 rank-one 模式。非零奇异值的个数就是矩阵秩。如果只有 \(r\) 个非零奇异值，那么

$$
\operatorname{rank}(A)=r.
$$

右奇异向量给出零空间信息：与零奇异值对应的 \(V\) 的列张成 null space，

$$
\operatorname{null}(A)=
\operatorname{span}\{\mathbf{v}_{r+1},\dotsc,\mathbf{v}_n\}.
$$

左奇异向量给出值域信息：与非零奇异值对应的 \(U\) 的列张成 range，

$$
\operatorname{range}(A)=
\operatorname{span}\{\mathbf{u}_1,\dotsc,\mathbf{u}_r\}.
$$

伪逆只对非零奇异值取倒数：

$$
(\Sigma^+)_{ii}=
\begin{cases}
1/\sigma_i,&\sigma_i\ne 0,\\
0,&\sigma_i=0.
\end{cases}
$$

若

$$
A=U\Sigma V^T,
$$

则 Moore-Penrose pseudoinverse 为

$$
A^+=V\Sigma^+U^T.
$$

这保留了“可逆方向”的反向作用，同时不会尝试恢复已经被压成零的方向。最小二乘、欠定系统、推荐系统的矩阵补全和许多数值库的稳定求解都依赖这个思想。`,
      md`SVD can be written as a sum of outer products:

$$
A=\sum_{i=1}^{s}\sigma_i\mathbf{u}_i\mathbf{v}_i^T,
\qquad
s=\min(m,n).
$$

This formula decomposes a matrix into rank-one patterns. The number of nonzero singular values is the rank. If only \(r\) singular values are nonzero, then

$$
\operatorname{rank}(A)=r.
$$

The right singular vectors identify the null space: the columns of \(V\) corresponding to zero singular values span the null space,

$$
\operatorname{null}(A)=
\operatorname{span}\{\mathbf{v}_{r+1},\dotsc,\mathbf{v}_n\}.
$$

The left singular vectors identify the range: the columns of \(U\) corresponding to nonzero singular values span the range,

$$
\operatorname{range}(A)=
\operatorname{span}\{\mathbf{u}_1,\dotsc,\mathbf{u}_r\}.
$$

The pseudoinverse takes reciprocals only for nonzero singular values:

$$
(\Sigma^+)_{ii}=
\begin{cases}
1/\sigma_i,&\sigma_i\ne 0,\\
0,&\sigma_i=0.
\end{cases}
$$

If

$$
A=U\Sigma V^T,
$$

then the Moore-Penrose pseudoinverse is

$$
A^+=V\Sigma^+U^T.
$$

This reverses the action along directions that can be reversed, without trying to reconstruct directions that were collapsed to zero. Least squares, underdetermined systems, recommender matrix completion, and many stable numerical-library solvers rely on this idea.`,
    ),
  ),
  section(
    'svd-norm-condition-and-solving',
    copy('2-范数、条件数与用 SVD 解方程', '2-Norm, Conditioning, and Solving with SVD'),
    copy(
      md`SVD 让矩阵 2-范数变得直接：

$$
\|A\|_2
=\max_{\|\mathbf{x}\|_2=1}\|A\mathbf{x}\|_2
=\sigma_1.
$$

原因是 \(U\) 和 \(V\) 都是正交矩阵，它们不改变 2-范数；真正改变长度的只有 \(\Sigma\)，而最大放大倍数就是最大的奇异值。对满秩方阵，

$$
\|A^{-1}\|_2=\frac{1}{\sigma_n},
$$

其中 \(\sigma_n\) 是最小奇异值。因此 2-范数条件数为

$$
\kappa_2(A)=\|A\|_2\|A^{-1}\|_2
=\frac{\sigma_{\max}}{\sigma_{\min}}.
$$

若矩阵 rank deficient，则 \(\sigma_{\min}=0\)，条件数按惯例视为 \(\infty\)。对非方阵或秩亏矩阵，也常用 pseudoinverse 读出可逆方向中的最大误差放大：

$$
\|A^+\|_2=\frac{1}{\sigma_r},
$$

其中 \(\sigma_r\) 是最小的非零奇异值；零矩阵是例外，此时 \(\|A^+\|_2=0\)。

若 \(A\) 是 \(n\times n\) 方阵并且已经有 SVD，要解 \(A\mathbf{x}=\mathbf{b}\)，可以写成

$$
U\Sigma V^T\mathbf{x}=\mathbf{b}.
$$

左乘 \(U^T\)：

$$
\Sigma V^T\mathbf{x}=U^T\mathbf{b}.
$$

先解对角系统

$$
\Sigma\mathbf{y}=U^T\mathbf{b},
$$

再令

$$
\mathbf{x}=V\mathbf{y}.
$$

如果 SVD 已经算好，一次求解约为 \(O(n^2)\)；但 SVD 分解本身约为 \(O(n^3)\)，且常数通常比 LU 大。因此在普通良态方阵求解中 LU 更常用；在需要判断 rank、处理病态问题或同时连接最小二乘时，SVD 更有价值。`,
      md`SVD makes the matrix 2-norm direct:

$$
\|A\|_2
=\max_{\|\mathbf{x}\|_2=1}\|A\mathbf{x}\|_2
=\sigma_1.
$$

The reason is that \(U\) and \(V\) are orthogonal matrices, so they do not change the 2-norm. The only length change comes from \(\Sigma\), and the largest stretch is the largest singular value. For a full-rank square matrix,

$$
\|A^{-1}\|_2=\frac{1}{\sigma_n},
$$

where \(\sigma_n\) is the smallest singular value. Therefore the 2-norm condition number is

$$
\kappa_2(A)=\|A\|_2\|A^{-1}\|_2
=\frac{\sigma_{\max}}{\sigma_{\min}}.
$$

If the matrix is rank deficient, then \(\sigma_{\min}=0\), and the condition number is treated as \(\infty\). For rectangular or rank-deficient matrices, the pseudoinverse similarly reads the largest error amplification among reversible directions:

$$
\|A^+\|_2=\frac{1}{\sigma_r},
$$

where \(\sigma_r\) is the smallest nonzero singular value. The zero matrix is the exception; then \(\|A^+\|_2=0\).

If \(A\) is an \(n\times n\) square matrix and its SVD is already known, solve \(A\mathbf{x}=\mathbf{b}\) by writing

$$
U\Sigma V^T\mathbf{x}=\mathbf{b}.
$$

Multiply by \(U^T\):

$$
\Sigma V^T\mathbf{x}=U^T\mathbf{b}.
$$

First solve the diagonal system

$$
\Sigma\mathbf{y}=U^T\mathbf{b},
$$

then set

$$
\mathbf{x}=V\mathbf{y}.
$$

Once the SVD is available, one solve costs about \(O(n^2)\). But computing the SVD costs about \(O(n^3)\), with a larger constant than LU in typical square cases. LU is usually preferred for ordinary well-conditioned square solves; SVD is more valuable when rank, ill conditioning, or least-squares structure must be diagnosed.`,
    ),
  ),
  section(
    'svd-low-rank-approximation-and-ml',
    copy('低秩近似：保留最大的信息方向', 'Low-Rank Approximation: Keep the Largest Information Directions'),
    copy(
      md`SVD 的 outer product 展开给出一个自然的近似：

$$
A_k=\sum_{i=1}^{k}\sigma_i\mathbf{u}_i\mathbf{v}_i^T.
$$

这就是 rank-\(k\) 近似。它保留最大的 \(k\) 个奇异值和对应方向，丢掉较小的模式。对 induced 2-norm，Eckart-Young 定理告诉我们这是最好的 rank-\(k\) 近似，并且

$$
\|A-A_k\|_2=\sigma_{k+1}.
$$

也就是说，保留到第 \(k\) 个方向后，最坏方向上的剩余误差正好由下一个奇异值控制。若关心能量或 Frobenius norm，常看

$$
\frac{\sum_{i=1}^{k}\sigma_i^2}{\sum_i\sigma_i^2},
$$

这表示前 \(k\) 个方向保留了多少平方能量。

下面的实验台把原矩阵、rank-\(k\) 近似和残差并排显示。切换奇异值谱会看到三类情况：五行三列数值例子中前三个奇异值逐渐下降；图像压缩型谱中前几个方向解释大部分能量；病态矩阵型谱中最小奇异值很小，条件数读数会迅速变大。

![Low rank approximations](/math-lab/cs357-assets/figs/lowrank.png)

图片压缩可以把灰度图看成矩阵。大的奇异值通常保留主要轮廓和大块结构，小的奇异值保留纹理、边缘细节，也可能混入噪声。用户-物品评分矩阵也是类似语言：少数强方向可能对应动作片偏好、文艺片偏好或价格敏感度。低秩近似不是“随便丢掉小数字”，而是在任务允许时保留最强结构。

在 ML / AI 中，低秩近似不是装饰性技巧，而是具体工程工具：

- 图像压缩把像素矩阵近似为少数 rank-one 模式。
- 推荐系统把用户-物品评分矩阵分解成少数潜在兴趣方向。
- 去噪会丢掉小奇异值对应的弱模式，但这需要判断小奇异值是噪声还是真实稀有结构。
- PCA 直接使用 centered data matrix 的 SVD，把 \(V\) 的前几列作为主方向。
- 大模型权重分析和低秩适配会观察权重更新是否集中在少数奇异方向。`,
      md`The outer-product expansion of SVD gives a natural approximation:

$$
A_k=\sum_{i=1}^{k}\sigma_i\mathbf{u}_i\mathbf{v}_i^T.
$$

This is the rank-\(k\) approximation. It keeps the largest \(k\) singular values and paired directions, discarding smaller patterns. For the induced 2-norm, the Eckart-Young theorem says this is the best rank-\(k\) approximation, and

$$
\|A-A_k\|_2=\sigma_{k+1}.
$$

So after keeping the first \(k\) directions, the worst-direction residual is controlled exactly by the next singular value. If energy or Frobenius norm is the focus, a common readout is

$$
\frac{\sum_{i=1}^{k}\sigma_i^2}{\sum_i\sigma_i^2},
$$

which measures how much squared energy the first \(k\) directions retain.

The lab below shows the original matrix, the rank-\(k\) approximation, and the residual side by side. Switching the singular-value spectrum shows three cases: the 5-by-3 example has three gradually decreasing singular values; the image-compression spectrum concentrates energy in the leading directions; the ill-conditioned spectrum has a tiny smallest singular value, so the condition-number readout grows quickly.

![Low rank approximations](/math-lab/cs357-assets/figs/lowrank.png)

Image compression can read a grayscale image as a matrix. Large singular values often preserve the main silhouette and large structures; small singular values preserve texture and edge detail, and may also contain noise. A user-item rating matrix uses similar language: a few strong directions may correspond to action-movie preference, art-film preference, or price sensitivity. Low-rank approximation is not "dropping small numbers at random"; it keeps the strongest structure when the task allows it.

In ML and AI, low-rank approximation is not decorative. It is an engineering tool:

- Image compression approximates a pixel matrix by a small number of rank-one patterns.
- Recommender systems factor a user-item rating matrix into a few latent-interest directions.
- Denoising discards weak modes tied to small singular values, although one must decide whether a small singular value is noise or a rare real structure.
- PCA directly uses the SVD of a centered data matrix and takes the leading columns of \(V\) as principal directions.
- Large-model weight analysis and low-rank adaptation inspect whether weight updates concentrate in a small number of singular directions.`,
    ),
    { labIds: ['svd-low-rank-lab'] },
  ),
  section(
    'svd-review-questions',
    copy('复习问题', 'Review Questions'),
    copy(
      md`- 对 \(A=U\Sigma V^T\)，\(U\)、\(\Sigma\)、\(V\) 分别是什么形状？full SVD 和 reduced SVD 有什么不同？
- 为什么 \(V\) 的列来自 \(A^TA\) 的特征向量，而 \(U\) 的列来自 \(AA^T\) 的特征向量？
- 奇异值为什么一定非负？为什么它们是 \(A^TA\) 或 \(AA^T\) 非零特征值的平方根？
- 已知 \(A^TA\) 的特征值为 \(437.479,42.6444,17.8766\)，奇异值大约是多少？
- 如何用奇异值判断 rank 和 effective rank？容差选择会怎样影响结论？
- 与零奇异值对应的 right singular vectors 描述什么空间？与非零奇异值对应的 left singular vectors 描述什么空间？
- 如何从 SVD 写出 Moore-Penrose pseudoinverse？
- 为什么 \(\|A\|_2=\sigma_1\)，以及 \(\kappa_2(A)=\sigma_{\max}/\sigma_{\min}\)？
- 为什么 best rank-\(k\) approximation 的 2-范数误差是 \(\sigma_{k+1}\)？
- 如果已经算好 SVD，怎样解 \(A\mathbf{x}=\mathbf{b}\)？为什么这不代表 SVD 总是解方阵系统的首选算法？`,
      md`- For \(A=U\Sigma V^T\), what are the shapes of \(U\), \(\Sigma\), and \(V\)? How do full SVD and reduced SVD differ?
- Why do the columns of \(V\) come from eigenvectors of \(A^TA\), while the columns of \(U\) come from eigenvectors of \(AA^T\)?
- Why are singular values always nonnegative? Why are they square roots of the nonzero eigenvalues of \(A^TA\) or \(AA^T\)?
- If the eigenvalues of \(A^TA\) are \(437.479,42.6444,17.8766\), what are the approximate singular values?
- How do singular values determine rank and effective rank? How can the tolerance change the conclusion?
- What space is described by right singular vectors associated with zero singular values? What space is described by left singular vectors associated with nonzero singular values?
- How do you write the Moore-Penrose pseudoinverse from an SVD?
- Why is \(\|A\|_2=\sigma_1\), and why is \(\kappa_2(A)=\sigma_{\max}/\sigma_{\min}\)?
- Why is the 2-norm error of the best rank-\(k\) approximation equal to \(\sigma_{k+1}\)?
- If the SVD is already computed, how do you solve \(A\mathbf{x}=\mathbf{b}\)? Why does that not mean SVD is always the first choice for square systems?`,
    ),
  ),
]

export function buildSvdModule(base: MathLabModule): MathLabModule {
  return {
    ...base,
    title: copy('奇异值分解（SVD）', 'Singular Value Decomposition (SVD)'),
    subtitle: copy(
      '把任意矩阵拆成输入方向、非负尺度和输出方向。',
      'Decompose any matrix into input directions, nonnegative scales, and output directions.',
    ),
    estimatedMinutes: 28,
    prerequisites: ['eigenvalues-eigenvectors', 'linear-algebra-rank-null-space'],
    sourceReferences: [sources.essenceLinearAlgebra, sources.d2lLinearAlgebra, sources.mml],
    aiModelConnections: [
      copy(
        '低秩 SVD 是图像压缩、推荐系统和矩阵补全的核心工具。',
        'Low-rank SVD is a core tool for image compression, recommender systems, and matrix completion.',
      ),
      copy(
        'PCA 可以通过 centered data matrix 的 SVD 得到主方向，而不必先显式形成协方差矩阵。',
        'PCA can obtain principal directions from the SVD of a centered data matrix without explicitly forming the covariance matrix first.',
      ),
      copy(
        '最小奇异值和条件数帮助判断训练特征、线性层或最小二乘问题是否病态。',
        'The smallest singular value and condition number help diagnose ill-conditioned features, linear layers, and least-squares problems.',
      ),
    ],
    learningObjectives: [
      copy(md`构造并解释 \(A=U\Sigma V^T\)。`, md`Construct and interpret \(A=U\Sigma V^T\).`),
      copy('识别 left singular vectors、right singular vectors 和 singular values 的来源。', 'Identify where left singular vectors, right singular vectors, and singular values come from.'),
      copy('区分 full SVD、reduced SVD 和 low-rank approximation。', 'Distinguish full SVD, reduced SVD, and low-rank approximation.'),
      copy('用奇异值判断 rank、pseudoinverse、2-范数和条件数。', 'Use singular values to read rank, the pseudoinverse, the 2-norm, and condition numbers.'),
      copy('把 SVD 连接到最小二乘、PCA、压缩、推荐和去噪。', 'Connect SVD to least squares, PCA, compression, recommenders, and denoising.'),
    ],
    concepts: [
      {
        id: 'singular-value-decomposition',
        name: copy('奇异值分解', 'Singular Value Decomposition'),
        formulaLatex: 'A=U\\Sigma V^T',
        variables: [
          {
            symbol: 'U',
            description: copy('输出空间中的正交基；列向量是 left singular vectors。', 'An orthogonal basis in the output space; columns are left singular vectors.'),
          },
          {
            symbol: '\\Sigma',
            description: copy('非负奇异值构成的对角形矩阵。', 'A diagonal-shaped matrix of nonnegative singular values.'),
          },
          {
            symbol: 'V',
            description: copy('输入空间中的正交基；列向量是 right singular vectors。', 'An orthogonal basis in the input space; columns are right singular vectors.'),
          },
        ],
        plainExplanation: copy(
          'SVD 把矩阵作用读成先换输入坐标、再按方向缩放、最后换输出坐标。',
          'SVD reads a matrix action as input-coordinate rotation, directional scaling, then output-coordinate rotation.',
        ),
        geometricIntuition: copy(
          md`每个 right singular vector \(\mathbf{v}_i\) 被送到对应的 left singular vector \(\mathbf{u}_i\)，长度乘以 \(\sigma_i\)。`,
          md`Each right singular vector \(\mathbf{v}_i\) is sent to the paired left singular vector \(\mathbf{u}_i\), scaled by \(\sigma_i\).`,
        ),
        numericalExample: copy(
          md`数值例子中 \(A^TA\) 的特征值 \(437.479,42.6444,17.8766\) 给出奇异值 \(20.916,6.53207,4.22807\)。`,
          md`In the numerical example, eigenvalues \(437.479,42.6444,17.8766\) of \(A^TA\) give singular values \(20.916,6.53207,4.22807\).`,
        ),
        codeExample:
          'import numpy as np\n\nA = np.array([[3., 2., 3.], [8., 8., 2.], [8., 7., 4.], [1., 8., 7.], [6., 4., 7.]])\nU, S, Vt = np.linalg.svd(A, full_matrices=False)\nprint(S)',
        modelConnection: copy(
          'PCA、推荐系统、去噪和低秩模型更新都依赖奇异方向和奇异值强度。',
          'PCA, recommender systems, denoising, and low-rank model updates all rely on singular directions and singular-value strength.',
        ),
      },
      {
        id: 'rank-from-singular-values',
        name: copy('由奇异值读取秩', 'Rank from Singular Values'),
        formulaLatex: '\\operatorname{rank}(A)=\\#\\{i:\\sigma_i>0\\}',
        variables: [
          {
            symbol: '\\sigma_i',
            description: copy('第 i 个奇异值；为零表示对应方向被压扁。', 'The i-th singular value; zero means the corresponding direction is collapsed.'),
          },
          {
            symbol: '\\#',
            description: copy('满足条件的奇异值数量。', 'The number of singular values satisfying the condition.'),
          },
        ],
        plainExplanation: copy(
          '矩阵保留下来的独立方向数量等于非零奇异值数量。',
          'The number of independent directions kept by the matrix equals the number of nonzero singular values.',
        ),
        geometricIntuition: copy(
          '零奇异值对应的输入方向进入 null space；非零奇异值对应的输出方向张成 range。',
          'Input directions with zero singular values enter the null space; output directions with nonzero singular values span the range.',
        ),
        numericalExample: copy(
          md`若奇异值为 \(14,14,0\)，rank 为 \(2\)。`,
          md`If the singular values are \(14,14,0\), the rank is \(2\).`,
        ),
        modelConnection: copy(
          '有效秩帮助判断 embedding、权重矩阵或评分矩阵是否真的使用了很多独立方向。',
          'Effective rank helps diagnose whether embeddings, weight matrices, or rating matrices truly use many independent directions.',
        ),
      },
      {
        id: 'svd-pseudoinverse',
        name: copy('Moore-Penrose 伪逆', 'Moore-Penrose Pseudoinverse'),
        formulaLatex: 'A^+=V\\Sigma^+U^T',
        variables: [
          {
            symbol: '\\Sigma^+',
            description: copy('只对非零奇异值取倒数，零奇异值仍保持为零。', 'Reciprocals of nonzero singular values, while zero singular values remain zero.'),
          },
          {
            symbol: 'A^+',
            description: copy('在可恢复方向上反向作用的广义逆。', 'A generalized inverse that reverses recoverable directions.'),
          },
        ],
        plainExplanation: copy(
          '伪逆不会假装能恢复已经被矩阵压成零的方向。',
          'The pseudoinverse does not pretend to recover directions that the matrix has collapsed to zero.',
        ),
        geometricIntuition: copy(
          '大奇异值方向容易反向恢复；小奇异值方向反向恢复会放大噪声。',
          'Directions with large singular values are easy to reverse; directions with tiny singular values amplify noise when reversed.',
        ),
        numericalExample: copy(
          md`若 \(\Sigma=\operatorname{diag}(5,0)\)，则 \(\Sigma^+=\operatorname{diag}(1/5,0)\)。`,
          md`If \(\Sigma=\operatorname{diag}(5,0)\), then \(\Sigma^+=\operatorname{diag}(1/5,0)\).`,
        ),
        modelConnection: copy(
          '最小二乘和欠定线性系统常用伪逆选择稳定或最小范数解。',
          'Least-squares and underdetermined linear systems often use the pseudoinverse to select stable or minimum-norm solutions.',
        ),
      },
      {
        id: 'svd-low-rank',
        name: copy('最佳低秩近似', 'Best Low-Rank Approximation'),
        formulaLatex: 'A_k=\\sum_{i=1}^{k}\\sigma_i\\mathbf{u}_i\\mathbf{v}_i^T',
        variables: [
          {
            symbol: 'k',
            description: copy('保留的奇异方向数量。', 'The number of singular directions retained.'),
          },
          {
            symbol: '\\sigma_{k+1}',
            description: copy('2-范数下的最佳 rank-k 近似误差。', 'The best rank-k approximation error in the 2-norm.'),
          },
        ],
        plainExplanation: copy(
          '低秩近似保留最大的信息模式，丢掉较弱模式。',
          'Low-rank approximation keeps the strongest information modes and discards weaker ones.',
        ),
        geometricIntuition: copy(
          '每个 rank-one 外积是一层模式；奇异值越大，该层越重要。',
          'Each rank-one outer product is one pattern layer; a larger singular value makes that layer more important.',
        ),
        numericalExample: copy(
          md`若 \(\sigma=[9,3,1]\)，rank-1 近似的 2-范数误差是 \(3\)。`,
          md`If \(\sigma=[9,3,1]\), the rank-1 approximation error in the 2-norm is \(3\).`,
        ),
        modelConnection: copy(
          '低秩近似直接用于图像压缩、推荐系统、PCA 和低秩模型适配。',
          'Low-rank approximation is used directly in image compression, recommender systems, PCA, and low-rank model adaptation.',
        ),
      },
    ],
    sections,
    toc: sections.map(({ id, level, title }) => ({ id, level, title })),
    visuals: [],
    labs: [
      {
        id: 'svd-low-rank-lab',
        title: copy('SVD 低秩近似实验台', 'SVD Low-Rank Approximation Lab'),
        type: 'interactive-visual',
        componentName: 'NumericalMiniLab',
        successCriteria: [
          copy('能解释保留秩 k 增加时，能量保留为什么上升。', 'Explain why retained energy increases as kept rank k grows.'),
          copy(md`能用 \(\sigma_{k+1}\) 读出 2-范数近似误差。`, md`Use \(\sigma_{k+1}\) to read the 2-norm approximation error.`),
          copy('能用最小非零奇异值判断条件数和病态风险。', 'Use the smallest nonzero singular value to judge conditioning risk.'),
        ],
      },
    ],
    quizzes: [
      {
        id: 'svd-rectangular-factorization',
        type: 'single-choice',
        prompt: copy('SVD 最重要的适用范围是什么？', 'What is the key scope of SVD?'),
        choices: [
          {
            id: 'any-rectangular',
            label: copy('任意实矩阵，包括矩形矩阵。', 'Any real matrix, including rectangular matrices.'),
          },
          {
            id: 'square-diagonalizable',
            label: copy('只能用于可对角化方阵。', 'Only diagonalizable square matrices.'),
          },
          {
            id: 'symmetric-only',
            label: copy('只能用于对称矩阵。', 'Only symmetric matrices.'),
          },
        ],
        answer: 'any-rectangular',
        explanation: copy(
          md`SVD 对任意 \(m\times n\) 实矩阵存在；它用输入空间和输出空间的两组正交基连接矩阵作用。`,
          md`SVD exists for every real \(m\times n\) matrix; it connects the matrix action with orthogonal bases in the input and output spaces.`,
        ),
        misconceptionTags: ['svd-square-only'],
      },
      {
        id: 'svd-singular-value-from-eigenvalue',
        type: 'numeric',
        prompt: copy(
          md`若 \(A^TA\) 的某个特征值为 \(25\)，对应奇异值是多少？`,
          md`If an eigenvalue of \(A^TA\) is \(25\), what is the corresponding singular value?`,
        ),
        answer: 5,
        tolerance: 0,
        explanation: copy(
          md`奇异值是 \(A^TA\) 或 \(AA^T\) 非零特征值的非负平方根，所以是 \(5\)。`,
          md`A singular value is the nonnegative square root of a nonzero eigenvalue of \(A^TA\) or \(AA^T\), so it is \(5\).`,
        ),
        misconceptionTags: ['svd-negative-singular-values'],
      },
      {
        id: 'svd-low-rank-error',
        type: 'numeric',
        prompt: copy(
          md`若奇异值为 \(9,3,1\)，最佳 rank-1 近似的 2-范数误差是多少？`,
          md`If the singular values are \(9,3,1\), what is the 2-norm error of the best rank-1 approximation?`,
        ),
        answer: 3,
        tolerance: 0,
        explanation: copy(
          md`最佳 rank-\(k\) 近似满足 \(\|A-A_k\|_2=\sigma_{k+1}\)。当 \(k=1\) 时误差为 \(\sigma_2=3\)。`,
          md`The best rank-\(k\) approximation satisfies \(\|A-A_k\|_2=\sigma_{k+1}\). For \(k=1\), the error is \(\sigma_2=3\).`,
        ),
        misconceptionTags: ['svd-low-rank-error'],
        revisitVisualId: 'svd-low-rank-lab',
      },
      {
        id: 'svd-condition-number',
        type: 'single-choice',
        prompt: copy(md`哪个表达式给出满秩方阵的 \(\kappa_2(A)\)？`, md`Which expression gives \(\kappa_2(A)\) for a full-rank square matrix?`),
        choices: [
          {
            id: 'ratio',
            label: copy(md`\(\sigma_{\max}/\sigma_{\min}\)`, md`\(\sigma_{\max}/\sigma_{\min}\)`),
          },
          {
            id: 'sum',
            label: copy(md`\(\sum_i\sigma_i\)`, md`\(\sum_i\sigma_i\)`),
          },
          {
            id: 'det',
            label: copy('行列式的绝对值。', 'The absolute value of the determinant.'),
          },
        ],
        answer: 'ratio',
        explanation: copy(
          md`2-范数下 \(\|A\|_2=\sigma_{\max}\)，\(\|A^{-1}\|_2=1/\sigma_{\min}\)，所以条件数是二者比值。`,
          md`In the 2-norm, \(\|A\|_2=\sigma_{\max}\) and \(\|A^{-1}\|_2=1/\sigma_{\min}\), so the condition number is their ratio.`,
        ),
        misconceptionTags: ['svd-determinant-conditioning'],
      },
    ],
    misconceptions: [
      {
        id: 'svd-square-only',
        statement: copy('SVD 只适用于方阵。', 'SVD only works for square matrices.'),
        correction: copy(
          md`SVD 对任意 \(m\times n\) 矩阵存在；矩形矩阵只是让 \(U\)、\(\Sigma\)、\(V\) 的形状不同。`,
          md`SVD exists for every \(m\times n\) matrix; rectangular matrices only change the shapes of \(U\), \(\Sigma\), and \(V\).`,
        ),
        example: copy(
          '用户-物品评分矩阵通常是矩形矩阵，SVD 仍可用来找潜在兴趣方向。',
          'User-item rating matrices are usually rectangular, and SVD can still find latent-interest directions.',
        ),
      },
      {
        id: 'svd-small-values-are-always-noise',
        statement: copy('小奇异值一定都是噪声，可以无条件删除。', 'Small singular values are always noise and can be deleted unconditionally.'),
        correction: copy(
          '小奇异值表示弱方向；它可能是噪声，也可能是稀有但重要的结构。是否截断取决于任务、误差容忍度和验证结果。',
          'A small singular value marks a weak direction; it may be noise, or it may be a rare but important structure. Truncation depends on the task, error tolerance, and validation.',
        ),
        example: copy(
          md`图像压缩中丢掉小 \(\sigma_i\) 常常可接受；异常检测中，小能量方向可能正是异常信号所在。`,
          md`In image compression, dropping small \(\sigma_i\) is often acceptable; in anomaly detection, a low-energy direction may contain the anomaly signal.`,
        ),
      },
      {
        id: 'svd-invertible-means-stable',
        statement: copy('只要所有奇异值非零，反向求解就数值稳定。', 'As long as all singular values are nonzero, reversing the system is numerically stable.'),
        correction: copy(
          md`稳定性还取决于最小奇异值有多小。若 \(\sigma_{\min}\) 很小，\(\kappa_2(A)\) 很大，反向求解会放大噪声。`,
          md`Stability also depends on how small the smallest singular value is. If \(\sigma_{\min}\) is tiny, \(\kappa_2(A)\) is large, and solving backward amplifies noise.`,
        ),
        example: copy(
          md`奇异值 \(10,10^{-8}\) 的矩阵可逆，但 \(\kappa_2=10^9\)，输入中的微小误差可能被显著放大。`,
          md`A matrix with singular values \(10,10^{-8}\) is invertible, but \(\kappa_2=10^9\), so tiny input errors may be greatly amplified.`,
        ),
      },
    ],
  }
}
