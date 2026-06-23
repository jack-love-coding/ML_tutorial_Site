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
      '参考特征方向、矩阵反复作用和几何直觉的组织方式。',
      'Reference for organizing eigen directions, repeated matrix action, and geometric intuition.',
    ),
  },
  d2lLinearAlgebra: {
    label: copy('Dive into Deep Learning：线性代数', 'Dive into Deep Learning: Linear Algebra'),
    href: 'https://d2l.ai/chapter_preliminaries/linear-algebra.html',
    usage: copy(
      '参考机器学习预备线性代数中的矩阵和特征结构表述。',
      'Reference for matrix and spectral-structure notation in machine-learning preliminaries.',
    ),
  },
  mml: {
    label: copy('Mathematics for Machine Learning', 'Mathematics for Machine Learning'),
    href: 'https://mml-book.github.io/',
    usage: copy(
      '参考特征值、向量空间和机器学习联系的边界。',
      'Reference for eigenvalues, vector spaces, and machine-learning connections.',
    ),
  },
} satisfies Record<string, SourceReference>

const sections: MathLabSection[] = [
  section(
    'eigenvalues-eigenvectors-learning-objectives',
    copy('学习目标', 'Learning Objectives'),
    copy(
      md`读完这一章后，你应该能把“矩阵会怎样改变方向”转化成可计算的问题：

- 解释特征值、特征向量和特征方程 \(A\mathbf{x}=\lambda\mathbf{x}\) 的含义。
- 用特征多项式和零空间手算小矩阵的特征值与特征向量。
- 判断什么情况下矩阵可以对角化，并说明 \(A=XDX^{-1}\) 的作用。
- 推导平移矩阵、逆矩阵、平移逆矩阵的特征值变化。
- 运行几步归一化幂迭代，并用 Rayleigh quotient 从近似特征向量估计特征值。
- 说明幂迭代、逆迭代和 shifted inverse iteration 的收敛条件、失败情形与计算成本。

本章的核心问题是：如果反复应用同一个线性变换，哪些方向会留下来，哪些方向会被放大或衰减？这也是 PCA、PageRank、谱聚类和许多训练动力学分析背后的共同语言。`,
      md`By the end of this chapter, you should be able to turn the question "how does a matrix change directions?" into computable steps:

- Explain eigenvalues, eigenvectors, and the eigen equation \(A\mathbf{x}=\lambda\mathbf{x}\).
- Compute eigenvalues and eigenvectors of a small matrix using the characteristic polynomial and nullspaces.
- Decide when a matrix is diagonalizable and explain the role of \(A=XDX^{-1}\).
- Derive how eigenvalues change under shifts, inverses, and shifted inverses.
- Run several steps of normalized power iteration and use the Rayleigh quotient to estimate an eigenvalue from an approximate eigenvector.
- Explain convergence conditions, failure cases, and costs for power iteration, inverse iteration, and shifted inverse iteration.

The central question is: if the same linear transformation is applied repeatedly, which directions remain, and which directions are amplified or damped? This is the shared language behind PCA, PageRank, spectral clustering, and many analyses of training dynamics.`,
    ),
  ),
  section(
    'eigenvalues-eigenvectors-definition-and-small-example',
    copy('特征方向：只缩放、不转向', 'Eigen Directions: Scaling Without Turning'),
    copy(
      md`设 \(A\) 是 \(n\times n\) 矩阵。若存在非零向量 \(\mathbf{x}\) 和标量 \(\lambda\)，使得

$$
A\mathbf{x}=\lambda\mathbf{x},
$$

则 \(\lambda\) 是 \(A\) 的特征值，\(\mathbf{x}\) 是对应的特征向量。这个方程的几何意思是：\(A\) 作用后，\(\mathbf{x}\) 仍在原来的直线上，只是被缩放、翻转或压扁到零。特征向量不能是零向量，因为零向量没有方向；但若 \(\mathbf{x}\) 是特征向量，任意非零倍数 \(c\mathbf{x}\) 仍是同一个特征方向。

特征值和特征向量可以是实数，也可以是复数。即使 \(A\) 的所有元素都是实数，也可能出现复特征值；这时对应特征向量也需要放在 \(\mathbb{C}^n\) 中理解。实际数值计算里，我们通常按模长排序：

$$
|\lambda_1|\ge |\lambda_2|\ge \dotsb \ge |\lambda_n|,
$$

并把特征向量归一化为 \(\|\mathbf{x}\|=1\)，这样便于比较方向而不是比较任意缩放。

### 特征多项式

把特征方程移到一边：

$$
(A-\lambda I)\mathbf{x}=0.
$$

因为 \(\mathbf{x}\ne 0\)，矩阵 \(A-\lambda I\) 必须有非零零空间，也就是不可逆。因此特征值满足

$$
p(\lambda)=\det(A-\lambda I)=0.
$$

\(p(\lambda)\) 称为特征多项式，次数为 \(n\)。对很小的矩阵，解这个多项式很适合手算；对大矩阵，这通常不是好的数值算法。一个重要原因是：当 \(n\ge 5\) 时，一般多项式根没有统一的闭式公式，而且直接求根对舍入误差很敏感。

### 手算例子

考虑

$$
A=\begin{bmatrix}2&1\\4&2\end{bmatrix}.
$$

特征多项式为

$$
\det(A-\lambda I)=
\det\begin{bmatrix}2-\lambda&1\\4&2-\lambda\end{bmatrix}
=(2-\lambda)^2-4
=\lambda(\lambda-4).
$$

所以特征值是 \(\lambda_1=0\) 和 \(\lambda_2=4\)。接着分别求零空间：

$$
\lambda=0:\quad
A\mathbf{x}=0
\quad\Rightarrow\quad
\mathbf{x}=\begin{bmatrix}1\\-2\end{bmatrix}.
$$

$$
\lambda=4:\quad
(A-4I)\mathbf{x}=0
\quad\Rightarrow\quad
\mathbf{x}=\begin{bmatrix}1\\2\end{bmatrix}.
$$

这里的 \(\begin{bmatrix}1\\2\end{bmatrix}\) 和 \(\begin{bmatrix}0.5\\1\end{bmatrix}\) 表示同一个特征方向；特征向量的长度可以改，方向不能改。`,
      md`Let \(A\) be an \(n\times n\) matrix. If there is a nonzero vector \(\mathbf{x}\) and a scalar \(\lambda\) such that

$$
A\mathbf{x}=\lambda\mathbf{x},
$$

then \(\lambda\) is an eigenvalue of \(A\), and \(\mathbf{x}\) is a corresponding eigenvector. Geometrically, after \(A\) acts on \(\mathbf{x}\), the vector stays on the same line. It may be stretched, shrunk, flipped, or mapped to zero. The eigenvector cannot be the zero vector because the zero vector has no direction; however, if \(\mathbf{x}\) is an eigenvector, every nonzero multiple \(c\mathbf{x}\) represents the same eigen direction.

Eigenvalues and eigenvectors may be real or complex. A real matrix can have complex eigenvalues; in that case the corresponding eigenvectors live in \(\mathbb{C}^n\). In numerical work, eigenvalues are often ordered by magnitude,

$$
|\lambda_1|\ge |\lambda_2|\ge \dotsb \ge |\lambda_n|,
$$

and eigenvectors are normalized so that \(\|\mathbf{x}\|=1\). This lets us compare directions instead of arbitrary scaling.

### Characteristic Polynomial

Move the eigen equation to one side:

$$
(A-\lambda I)\mathbf{x}=0.
$$

Because \(\mathbf{x}\ne 0\), the matrix \(A-\lambda I\) must have a nontrivial nullspace, so it is singular. Therefore eigenvalues satisfy

$$
p(\lambda)=\det(A-\lambda I)=0.
$$

\(p(\lambda)\) is the characteristic polynomial and has degree \(n\). For very small matrices, solving this polynomial is a good hand calculation. For large matrices, it is usually not a good numerical algorithm. One reason is that general polynomial roots have no closed-form formula for degree \(n\ge 5\), and direct root finding can be sensitive to rounding error.

### Hand Calculation

Consider

$$
A=\begin{bmatrix}2&1\\4&2\end{bmatrix}.
$$

The characteristic polynomial is

$$
\det(A-\lambda I)=
\det\begin{bmatrix}2-\lambda&1\\4&2-\lambda\end{bmatrix}
=(2-\lambda)^2-4
=\lambda(\lambda-4).
$$

So the eigenvalues are \(\lambda_1=0\) and \(\lambda_2=4\). Then solve the corresponding nullspaces:

$$
\lambda=0:\quad
A\mathbf{x}=0
\quad\Rightarrow\quad
\mathbf{x}=\begin{bmatrix}1\\-2\end{bmatrix}.
$$

$$
\lambda=4:\quad
(A-4I)\mathbf{x}=0
\quad\Rightarrow\quad
\mathbf{x}=\begin{bmatrix}1\\2\end{bmatrix}.
$$

The vectors \(\begin{bmatrix}1\\2\end{bmatrix}\) and \(\begin{bmatrix}0.5\\1\end{bmatrix}\) describe the same eigen direction. The length can change; the direction cannot.`,
    ),
  ),
  section(
    'eigenvalues-eigenvectors-diagonalization',
    copy('对角化：在特征方向坐标系里看矩阵', 'Diagonalization: View the Matrix in Eigen Coordinates'),
    copy(
      md`如果 \(A\) 有 \(n\) 个线性无关的特征向量 \(\mathbf{x}_1,\dotsc,\mathbf{x}_n\)，把它们作为列组成矩阵

$$
X=\begin{bmatrix}|&&|\\\mathbf{x}_1&\dotsb&\mathbf{x}_n\\|&&|\end{bmatrix},
\qquad
D=\begin{bmatrix}
\lambda_1&&\\
&\ddots&\\
&&\lambda_n
\end{bmatrix}.
$$

于是

$$
AX=XD.
$$

因为这些特征向量线性无关，\(X\) 可逆，所以得到相似变换

$$
A=XDX^{-1},
\qquad
X^{-1}AX=D.
$$

这叫对角化。直觉上，\(X^{-1}\) 先把向量坐标转换到特征向量基底，\(D\) 只按各个特征值缩放坐标，\(X\) 再把坐标转换回原空间。若矩阵可以对角化，分析 \(A^k\)、微分方程、Markov 链长期行为和 PCA 方差方向都会简单很多。

### 能对角化与不能对角化

一个 \(n\times n\) 矩阵可对角化，当且仅当它有 \(n\) 个线性无关的特征向量。若一个矩阵有 \(n\) 个互异特征值，它一定可对角化；但互异特征值只是充分条件，不是必要条件。

例如

$$
A=\begin{bmatrix}1&1&0\\1&0&1\\0&1&1\end{bmatrix}
$$

可以通过某个可逆的特征向量矩阵 \(X\) 被化为

$$
X^{-1}AX=
\begin{bmatrix}
-1&0&0\\
0&1&0\\
0&0&2
\end{bmatrix}.
$$

相反，Jordan 块

$$
A=\begin{bmatrix}1&1\\0&1\end{bmatrix}
$$

只有一个线性无关的特征方向。虽然它的唯一特征值是 \(1\)，但对应特征向量不够组成可逆矩阵 \(X\)，所以不能对角化。这类特征向量数量不足的矩阵称为 defective matrix。

### 需要记住的事实

- 特征值可以是 \(0\)、负数、实数或复数。
- \(\lambda=0\) 表示 \(A\) 有非零零空间，因此 \(A\) 不可逆。
- 同一个特征值可能有重数；真正决定可对角化的是线性无关特征向量的数量。
- 秩亏矩阵仍可能可对角化，例如某些对角矩阵有零特征值但有完整坐标轴特征向量。

Python 中常见的接口会把特征向量作为矩阵的列返回：

~~~python
import numpy as np
import numpy.linalg as la

def diagonalize(A):
    m, n = np.shape(A)
    if m != n:
        return None

    evals, evecs = la.eig(A)  # eigenvectors are columns
    if la.matrix_rank(evecs) != n:
        return None

    D = np.diag(evals)
    X = evecs
    return D, X
~~~`,
      md`If \(A\) has \(n\) linearly independent eigenvectors \(\mathbf{x}_1,\dotsc,\mathbf{x}_n\), place them as the columns of

$$
X=\begin{bmatrix}|&&|\\\mathbf{x}_1&\dotsb&\mathbf{x}_n\\|&&|\end{bmatrix},
\qquad
D=\begin{bmatrix}
\lambda_1&&\\
&\ddots&\\
&&\lambda_n
\end{bmatrix}.
$$

Then

$$
AX=XD.
$$

Because the eigenvectors are linearly independent, \(X\) is invertible, and we get the similarity transform

$$
A=XDX^{-1},
\qquad
X^{-1}AX=D.
$$

This is diagonalization. Intuitively, \(X^{-1}\) converts coordinates into the eigenvector basis, \(D\) only scales each coordinate by its eigenvalue, and \(X\) converts back to the original space. When a matrix is diagonalizable, analyzing \(A^k\), differential equations, long-run Markov behavior, and PCA variance directions becomes much easier.

### Diagonalizable and Not Diagonalizable

An \(n\times n\) matrix is diagonalizable if and only if it has \(n\) linearly independent eigenvectors. If a matrix has \(n\) distinct eigenvalues, then it is diagonalizable; distinct eigenvalues are sufficient, not necessary.

For example,

$$
A=\begin{bmatrix}1&1&0\\1&0&1\\0&1&1\end{bmatrix}
$$

can be transformed by an invertible eigenvector matrix \(X\) into

$$
X^{-1}AX=
\begin{bmatrix}
-1&0&0\\
0&1&0\\
0&0&2
\end{bmatrix}.
$$

By contrast, the Jordan block

$$
A=\begin{bmatrix}1&1\\0&1\end{bmatrix}
$$

has only one linearly independent eigen direction. Its only eigenvalue is \(1\), but it does not have enough eigenvectors to form an invertible matrix \(X\), so it is not diagonalizable. A matrix with too few independent eigenvectors is called defective.

### Facts Worth Keeping

- Eigenvalues can be \(0\), negative, real, or complex.
- \(\lambda=0\) means \(A\) has a nontrivial nullspace, so \(A\) is not invertible.
- The same eigenvalue can have multiplicity; diagonalizability depends on the number of linearly independent eigenvectors.
- A rank-deficient matrix may still be diagonalizable, for example a diagonal matrix with a zero entry but a full coordinate eigenbasis.

Common Python interfaces return eigenvectors as columns:

~~~python
import numpy as np
import numpy.linalg as la

def diagonalize(A):
    m, n = np.shape(A)
    if m != n:
        return None

    evals, evecs = la.eig(A)  # eigenvectors are columns
    if la.matrix_rank(evecs) != n:
        return None

    D = np.diag(evals)
    X = evecs
    return D, X
~~~`,
    ),
  ),
  section(
    'eigenvalues-eigenvectors-shifts-and-inverses',
    copy('平移、缩放和求逆怎样改变特征值', 'How Shifts, Scaling, and Inverses Change Eigenvalues'),
    copy(
      md`很多算法不是直接对 \(A\) 做特征计算，而是对 \(A-\sigma I\)、\(A^{-1}\) 或 \((A-\sigma I)^{-1}\) 做迭代。原因是这些变换会系统地改变特征值，却保留原来的特征向量方向。

若

$$
A\mathbf{x}=\lambda\mathbf{x},
$$

则标量缩放 \(cA\) 满足

$$
(cA)\mathbf{x}=c\lambda\mathbf{x}.
$$

矩阵平移满足

$$
(A-\sigma I)\mathbf{x}
=A\mathbf{x}-\sigma\mathbf{x}
=(\lambda-\sigma)\mathbf{x}.
$$

若 \(A\) 可逆，则 \(\lambda\ne 0\)，并且

$$
A^{-1}\mathbf{x}=\frac{1}{\lambda}\mathbf{x}.
$$

进一步，若 \(A-\sigma I\) 可逆，则

$$
(A-\sigma I)^{-1}\mathbf{x}
=\frac{1}{\lambda-\sigma}\mathbf{x}.
$$

这些关系解释了 shifted inverse iteration 的直觉：如果 \(\sigma\) 靠近某个特征值 \(\lambda_c\)，那么 \(\frac{1}{\lambda_c-\sigma}\) 的模会变得很大。对 \((A-\sigma I)^{-1}\) 做幂迭代，就会优先放大“离 \(\sigma\) 最近的特征值”对应的特征向量。

**小例子。** 若 \(A\) 有特征值 \(5\)，对应特征向量为 \(\mathbf{x}\)。取 \(\sigma=3\)，则

$$
(A-3I)^{-1}\mathbf{x}=\frac{1}{5-3}\mathbf{x}=\frac{1}{2}\mathbf{x}.
$$

特征向量没变，特征值从 \(5\) 变成了 \(\frac{1}{2}\)。`,
      md`Many algorithms do not compute eigen information from \(A\) directly. They iterate with \(A-\sigma I\), \(A^{-1}\), or \((A-\sigma I)^{-1}\). The reason is that these transformations change eigenvalues in a controlled way while preserving the eigenvector directions.

If

$$
A\mathbf{x}=\lambda\mathbf{x},
$$

then scalar multiplication gives

$$
(cA)\mathbf{x}=c\lambda\mathbf{x}.
$$

A shift gives

$$
(A-\sigma I)\mathbf{x}
=A\mathbf{x}-\sigma\mathbf{x}
=(\lambda-\sigma)\mathbf{x}.
$$

If \(A\) is invertible, then \(\lambda\ne 0\), and

$$
A^{-1}\mathbf{x}=\frac{1}{\lambda}\mathbf{x}.
$$

Furthermore, if \(A-\sigma I\) is invertible, then

$$
(A-\sigma I)^{-1}\mathbf{x}
=\frac{1}{\lambda-\sigma}\mathbf{x}.
$$

These identities explain shifted inverse iteration. If \(\sigma\) is close to some eigenvalue \(\lambda_c\), then \(\frac{1}{\lambda_c-\sigma}\) has large magnitude. Power iteration applied to \((A-\sigma I)^{-1}\) preferentially amplifies the eigenvector whose eigenvalue is closest to \(\sigma\).

**Small example.** Suppose \(A\) has eigenvalue \(5\) with eigenvector \(\mathbf{x}\). With \(\sigma=3\),

$$
(A-3I)^{-1}\mathbf{x}=\frac{1}{5-3}\mathbf{x}=\frac{1}{2}\mathbf{x}.
$$

The eigenvector is unchanged, while the eigenvalue changes from \(5\) to \(\frac{1}{2}\).`,
    ),
  ),
  section(
    'eigenvalues-eigenvectors-power-iteration',
    copy('幂迭代：反复相乘找主特征方向', 'Power Iteration: Repeated Multiplication Finds the Dominant Direction'),
    copy(
      md`若 \(A\) 可对角化，任意初始向量 \(\mathbf{x}_0\) 都可以写成特征向量的线性组合：

$$
\mathbf{x}_0=\alpha_1\mathbf{u}_1+\alpha_2\mathbf{u}_2+\dotsb+\alpha_n\mathbf{u}_n.
$$

反复乘 \(A\) 后，

$$
A^k\mathbf{x}_0
=\lambda_1^k\left(
\alpha_1\mathbf{u}_1
+\alpha_2\left(\frac{\lambda_2}{\lambda_1}\right)^k\mathbf{u}_2
+\dotsb
+\alpha_n\left(\frac{\lambda_n}{\lambda_1}\right)^k\mathbf{u}_n
\right).
$$

如果存在严格主导特征值

$$
|\lambda_1|>|\lambda_2|\ge\dotsb\ge|\lambda_n|,
$$

并且初始向量在 \(\mathbf{u}_1\) 方向上的系数 \(\alpha_1\ne 0\)，那么比值 \(\left|\lambda_i/\lambda_1\right|^k\) 会逐渐衰减，方向会接近主特征向量。

把这个想法放进 PageRank：每个网页把重要性沿链接分给其他网页，整张网络就像一个转移矩阵。反复乘这个矩阵，不是在背公式，而是在模拟“重要性流动很多轮以后还会剩下什么方向”。最后稳定下来的方向就是网页重要性的长期结构。

直接使用 \(\mathbf{x}_k=A\mathbf{x}_{k-1}\) 会遇到数值尺度问题：若 \(|\lambda_1|>1\)，向量范数会爆炸；若 \(|\lambda_1|<1\)，向量范数会趋近零。因此实际使用归一化幂迭代：

$$
\mathbf{y}_k=A\mathbf{x}_{k-1},
\qquad
\mathbf{x}_k=\frac{\mathbf{y}_k}{\|\mathbf{y}_k\|}.
$$

下面的实验台使用同一思想。增大迭代次数时，路径会朝主特征方向靠近；把矩阵换成谱间隔较小的版本时，\(|\lambda_2|/|\lambda_1|\) 变大，收敛就会明显变慢。`,
      md`If \(A\) is diagonalizable, an initial vector \(\mathbf{x}_0\) can be expanded in the eigenvector basis:

$$
\mathbf{x}_0=\alpha_1\mathbf{u}_1+\alpha_2\mathbf{u}_2+\dotsb+\alpha_n\mathbf{u}_n.
$$

After repeated multiplication,

$$
A^k\mathbf{x}_0
=\lambda_1^k\left(
\alpha_1\mathbf{u}_1
+\alpha_2\left(\frac{\lambda_2}{\lambda_1}\right)^k\mathbf{u}_2
+\dotsb
+\alpha_n\left(\frac{\lambda_n}{\lambda_1}\right)^k\mathbf{u}_n
\right).
$$

If there is a strict dominant eigenvalue

$$
|\lambda_1|>|\lambda_2|\ge\dotsb\ge|\lambda_n|,
$$

and the initial vector has a nonzero component \(\alpha_1\ne 0\) in the dominant eigenvector direction, then the ratios \(\left|\lambda_i/\lambda_1\right|^k\) decay, and the direction approaches the dominant eigenvector.

Place the same idea inside PageRank: each page sends importance through its outgoing links, so the whole web acts like a transition matrix. Repeated multiplication is not formula memorization; it simulates which direction remains after importance has flowed for many rounds. The stable direction becomes the long-run structure of page importance.

Using \(\mathbf{x}_k=A\mathbf{x}_{k-1}\) directly creates a numerical scale problem: if \(|\lambda_1|>1\), the norm grows; if \(|\lambda_1|<1\), the norm shrinks toward zero. So practical power iteration normalizes every step:

$$
\mathbf{y}_k=A\mathbf{x}_{k-1},
\qquad
\mathbf{x}_k=\frac{\mathbf{y}_k}{\|\mathbf{y}_k\|}.
$$

The lab below uses this same idea. As the iteration count grows, the path approaches the dominant eigen direction. When you switch to a matrix with a smaller spectral gap, \(|\lambda_2|/|\lambda_1|\) becomes larger, and convergence visibly slows.`,
    ),
    { labIds: ['eigen-power-iteration-lab'] },
  ),
  section(
    'eigenvalues-eigenvectors-rayleigh-and-failure-cases',
    copy('Rayleigh quotient 与幂迭代边界条件', 'Rayleigh Quotient and Power-Iteration Boundary Cases'),
    copy(
      md`幂迭代给出的是近似特征向量。若已经有一个方向 \(\mathbf{u}\)，可以用 Rayleigh quotient 估计对应特征值：

$$
\lambda(\mathbf{u})=
\frac{\mathbf{u}^T A\mathbf{u}}{\mathbf{u}^T\mathbf{u}}.
$$

当 \(\mathbf{u}\) 是精确特征向量时，这个比值正好等于对应特征值。实验台里的 \(\lambda\) 读数就是当前归一化向量的 Rayleigh quotient；residual 读数来自

$$
\|A\mathbf{u}-\lambda(\mathbf{u})\mathbf{u}\|_2.
$$

residual 越小，说明当前方向越接近真正的特征方向。

幂迭代有清楚的边界条件：

- 若主导特征值为正，归一化向量通常收敛到一个固定方向。
- 若主导特征值为负，方向会在正负两个相反向量之间交替，但它们代表同一条特征直线。
- 若主导特征值是一对复共轭值，实向量迭代可能呈现旋转行为，而不是收敛到一个实向量。
- 若 \(|\lambda_1|=|\lambda_2|\)，主导方向不唯一；同号相等时可能收敛到主特征子空间中的某个方向，异号或复共轭时可能持续振荡。
- 若初始向量完全没有主特征向量分量，精确数学中会错过主方向；但浮点计算中的舍入误差通常会引入一个极小主方向分量，之后仍可能被放大。

因此，“幂迭代会找到最大特征值”不是无条件结论。它依赖谱间隔、初始向量、归一化方式和数值精度。`,
      md`Power iteration gives an approximate eigenvector. Once we have a direction \(\mathbf{u}\), the corresponding eigenvalue can be estimated with the Rayleigh quotient:

$$
\lambda(\mathbf{u})=
\frac{\mathbf{u}^T A\mathbf{u}}{\mathbf{u}^T\mathbf{u}}.
$$

If \(\mathbf{u}\) is an exact eigenvector, this quotient equals the eigenvalue exactly. The \(\lambda\) readout in the lab is the Rayleigh quotient of the current normalized vector. The residual readout is

$$
\|A\mathbf{u}-\lambda(\mathbf{u})\mathbf{u}\|_2.
$$

A smaller residual means the current direction is closer to a true eigen direction.

Power iteration has clear boundary cases:

- If the dominant eigenvalue is positive, the normalized vector usually converges to a fixed direction.
- If the dominant eigenvalue is negative, the vector alternates between opposite signs, but those signs represent the same eigen line.
- If the dominant eigenvalues form a complex conjugate pair, a real-vector iteration can rotate instead of converging to one real vector.
- If \(|\lambda_1|=|\lambda_2|\), the dominant direction is not unique; equal same-sign values may converge inside a dominant eigenspace, while opposite signs or complex conjugates may keep oscillating.
- If the initial vector has exactly no component in the dominant eigenvector direction, exact arithmetic would miss that direction. In floating-point arithmetic, rounding usually introduces a tiny dominant component, which can then be amplified.

So "power iteration finds the largest eigenvalue" is not unconditional. It depends on spectral separation, the initial vector, normalization, and numerical precision.`,
    ),
  ),
  section(
    'eigenvalues-eigenvectors-inverse-shifted-and-costs',
    copy('逆迭代、平移逆迭代与成本', 'Inverse Iteration, Shifted Inverse Iteration, and Costs'),
    copy(
      md`要找最小模特征值对应的特征向量，可以对 \(A^{-1}\) 做幂迭代。因为 \(A^{-1}\) 的特征值是 \(1/\lambda_i\)，原矩阵里模最小的特征值会在逆矩阵里变成模最大的特征值。归一化逆迭代写成

$$
\mathbf{x}_{k+1}
=\frac{A^{-1}\mathbf{x}_k}{\|A^{-1}\mathbf{x}_k\|}.
$$

实际实现时不要显式计算 \(A^{-1}\)。每一步求解线性系统

$$
A\mathbf{y}_k=\mathbf{x}_k,
\qquad
\mathbf{x}_{k+1}=\frac{\mathbf{y}_k}{\|\mathbf{y}_k\|}.
$$

如果先做一次 LU 分解，预处理成本约为 \(O(n^3)\)，之后每步三角求解约为 \(O(n^2)\)。这就是前面 LU 章节与本章相连的地方。

若想找靠近某个 \(\sigma\) 的特征值对应方向，就使用平移逆迭代：

$$
\mathbf{x}_{k+1}
=\frac{(A-\sigma I)^{-1}\mathbf{x}_k}
{\|(A-\sigma I)^{-1}\mathbf{x}_k\|}.
$$

Rayleigh quotient iteration 进一步把 shift 更新为当前 Rayleigh quotient：

$$
\sigma_k=\frac{\mathbf{x}_k^T A\mathbf{x}_k}{\mathbf{x}_k^T\mathbf{x}_k},
\qquad
\mathbf{x}_{k+1}
=\frac{(A-\sigma_k I)^{-1}\mathbf{x}_k}
{\|(A-\sigma_k I)^{-1}\mathbf{x}_k\|}.
$$

常见迭代方法的成本与收敛直觉可以概括为：

| 方法 | 目标 | 典型成本 | 收敛由什么控制 |
| --- | --- | --- | --- |
| Power method | 最大模特征值方向 | \(O(kn^2)\) | \(|\lambda_2|/|\lambda_1|\) |
| Inverse power method | 最小模特征值方向 | \(O(n^3+kn^2)\) | 最小两个模特征值的分离程度 |
| Shifted inverse power method | 最靠近 \(\sigma\) 的特征值方向 | \(O(n^3+kn^2)\) | 离 \(\sigma\) 最近和次近特征值的距离比 |

这里 \(k\) 是迭代次数。谱间隔越大，收敛通常越快；目标特征值和竞争特征值越接近，迭代越慢。`,
      md`To find the eigenvector associated with the smallest-magnitude eigenvalue, apply power iteration to \(A^{-1}\). Since the eigenvalues of \(A^{-1}\) are \(1/\lambda_i\), the smallest-magnitude eigenvalue of \(A\) becomes the largest-magnitude eigenvalue of \(A^{-1}\). Normalized inverse iteration is

$$
\mathbf{x}_{k+1}
=\frac{A^{-1}\mathbf{x}_k}{\|A^{-1}\mathbf{x}_k\|}.
$$

In practice, do not form \(A^{-1}\). Solve a linear system each step:

$$
A\mathbf{y}_k=\mathbf{x}_k,
\qquad
\mathbf{x}_{k+1}=\frac{\mathbf{y}_k}{\|\mathbf{y}_k\|}.
$$

With one LU factorization, preprocessing costs about \(O(n^3)\), and each triangular solve costs about \(O(n^2)\). This is where the LU chapter connects directly to eigenvalue computation.

To find the eigenvector whose eigenvalue is closest to a chosen \(\sigma\), use shifted inverse iteration:

$$
\mathbf{x}_{k+1}
=\frac{(A-\sigma I)^{-1}\mathbf{x}_k}
{\|(A-\sigma I)^{-1}\mathbf{x}_k\|}.
$$

Rayleigh quotient iteration updates the shift to the current Rayleigh quotient:

$$
\sigma_k=\frac{\mathbf{x}_k^T A\mathbf{x}_k}{\mathbf{x}_k^T\mathbf{x}_k},
\qquad
\mathbf{x}_{k+1}
=\frac{(A-\sigma_k I)^{-1}\mathbf{x}_k}
{\|(A-\sigma_k I)^{-1}\mathbf{x}_k\|}.
$$

The usual cost and convergence picture is:

| Method | Target | Typical cost | Convergence controlled by |
| --- | --- | --- | --- |
| Power method | Largest-magnitude eigenvalue direction | \(O(kn^2)\) | \(|\lambda_2|/|\lambda_1|\) |
| Inverse power method | Smallest-magnitude eigenvalue direction | \(O(n^3+kn^2)\) | Separation of the two smallest-magnitude eigenvalues |
| Shifted inverse power method | Eigenvalue closest to \(\sigma\) | \(O(n^3+kn^2)\) | Distance ratio between the closest and second-closest eigenvalues to \(\sigma\) |

Here \(k\) is the number of iterations. Larger spectral separation usually means faster convergence; when the target eigenvalue and its competitor are close, iteration slows down.`,
    ),
  ),
  section(
    'eigenvalues-eigenvectors-orthogonal-bases',
    copy('正交基：让谱计算更稳定', 'Orthogonal Bases Make Spectral Computation More Stable'),
    copy(
      md`特征值算法常和正交矩阵一起出现。方阵 \(Q\) 的列向量若两两正交且范数为 \(1\)，则称 \(Q\) 为正交矩阵：

$$
\mathbf{q}_i^T\mathbf{q}_j=0\quad(i\ne j),
\qquad
\|\mathbf{q}_i\|=1.
$$

等价地，

$$
Q^TQ=QQ^T=I,
\qquad
Q^{-1}=Q^T.
$$

正交矩阵有几个重要性质：\(Q^T\) 仍是正交矩阵，\(\det(Q)=\pm 1\)，并且二范数条件数 \(\kappa_2(Q)=1\)。这意味着它不会在二范数意义下放大相对误差。许多数值特征值算法喜欢使用正交变换，原因就是它们能改变坐标系而不过度放大舍入误差。

Gram-Schmidt 过程可以把一组线性无关向量 \(\mathbf{x}_1,\dotsc,\mathbf{x}_n\) 变成正交向量：

$$
\begin{aligned}
\mathbf{v}_1&=\mathbf{x}_1,\\
\mathbf{v}_2&=\mathbf{x}_2-\frac{\langle\mathbf{v}_1,\mathbf{x}_2\rangle}{\|\mathbf{v}_1\|^2}\mathbf{v}_1,\\
\mathbf{v}_3&=\mathbf{x}_3-\frac{\langle\mathbf{v}_1,\mathbf{x}_3\rangle}{\|\mathbf{v}_1\|^2}\mathbf{v}_1-\frac{\langle\mathbf{v}_2,\mathbf{x}_3\rangle}{\|\mathbf{v}_2\|^2}\mathbf{v}_2,\\
&\vdots\\
\mathbf{v}_n&=\mathbf{x}_n-\sum_{i=1}^{n-1}
\frac{\langle\mathbf{v}_i,\mathbf{x}_n\rangle}{\|\mathbf{v}_i\|^2}\mathbf{v}_i.
\end{aligned}
$$

再把每个 \(\mathbf{v}_i\) 除以自己的范数，就得到一组标准正交基。这个过程本身不是求特征值的唯一方法，但它解释了为什么“保持方向互相垂直”对 QR、SVD、PCA 和稳定的谱计算很重要。`,
      md`Eigenvalue algorithms often appear together with orthogonal matrices. A square matrix \(Q\) is orthogonal when its columns are mutually orthogonal and each has norm \(1\):

$$
\mathbf{q}_i^T\mathbf{q}_j=0\quad(i\ne j),
\qquad
\|\mathbf{q}_i\|=1.
$$

Equivalently,

$$
Q^TQ=QQ^T=I,
\qquad
Q^{-1}=Q^T.
$$

Orthogonal matrices have useful properties: \(Q^T\) is orthogonal, \(\det(Q)=\pm 1\), and the 2-norm condition number is \(\kappa_2(Q)=1\). That means an orthogonal change of coordinates does not amplify relative error in the 2-norm. Many numerical eigenvalue algorithms prefer orthogonal transformations because they change coordinates without unnecessarily magnifying rounding error.

The Gram-Schmidt process turns linearly independent vectors \(\mathbf{x}_1,\dotsc,\mathbf{x}_n\) into orthogonal vectors:

$$
\begin{aligned}
\mathbf{v}_1&=\mathbf{x}_1,\\
\mathbf{v}_2&=\mathbf{x}_2-\frac{\langle\mathbf{v}_1,\mathbf{x}_2\rangle}{\|\mathbf{v}_1\|^2}\mathbf{v}_1,\\
\mathbf{v}_3&=\mathbf{x}_3-\frac{\langle\mathbf{v}_1,\mathbf{x}_3\rangle}{\|\mathbf{v}_1\|^2}\mathbf{v}_1-\frac{\langle\mathbf{v}_2,\mathbf{x}_3\rangle}{\|\mathbf{v}_2\|^2}\mathbf{v}_2,\\
&\vdots\\
\mathbf{v}_n&=\mathbf{x}_n-\sum_{i=1}^{n-1}
\frac{\langle\mathbf{v}_i,\mathbf{x}_n\rangle}{\|\mathbf{v}_i\|^2}\mathbf{v}_i.
\end{aligned}
$$

Normalizing each \(\mathbf{v}_i\) gives an orthonormal basis. This process is not the only route to eigenvalues, but it explains why keeping directions perpendicular matters for QR, SVD, PCA, and stable spectral computation.`,
    ),
  ),
  section(
    'eigenvalues-eigenvectors-ml-connections',
    copy('机器学习里的谱结构', 'Spectral Structure in Machine Learning'),
    copy(
      md`特征值和特征向量不是孤立的线性代数技巧，它们描述“反复作用后留下来的结构”。在机器学习和 AI 中，这种结构经常直接出现：

- **PCA。** 协方差矩阵的最大特征值对应最大方差方向；对应特征向量就是第一主成分方向。
- **PageRank 与 Markov 链。** 稳定分布满足 \(P\mathbf{x}=\mathbf{x}\)，也就是特征值 \(1\) 对应的特征向量。
- **谱聚类。** 图 Laplacian 的小特征值和对应特征向量揭示图中容易分开的簇结构。
- **训练动力学。** Hessian 的特征值描述局部曲率；大正特征值方向很陡，接近零的方向很平，负特征值方向意味着 saddle 或下降方向。
- **深度网络稳定性。** 权重矩阵或 Jacobian 的谱半径会影响信号、梯度和迭代状态是放大还是衰减。

一个实用判断是：只要问题里出现“反复乘同一个矩阵”“长期稳定分布”“最大方差方向”“局部曲率方向”或“图的低频结构”，就应该想到谱分析。`,
      md`Eigenvalues and eigenvectors are not isolated linear algebra tricks. They describe the structure that remains after repeated action. In machine learning and AI, that structure appears directly:

- **PCA.** The largest eigenvalue of a covariance matrix corresponds to the maximum-variance direction; the corresponding eigenvector is the first principal component.
- **PageRank and Markov chains.** A stationary distribution satisfies \(P\mathbf{x}=\mathbf{x}\), so it is an eigenvector for eigenvalue \(1\).
- **Spectral clustering.** Small eigenvalues of a graph Laplacian and their eigenvectors reveal cluster structure that is easy to separate.
- **Training dynamics.** Eigenvalues of the Hessian describe local curvature; large positive directions are steep, near-zero directions are flat, and negative directions indicate a saddle or descent direction.
- **Deep-network stability.** The spectral radius of a weight matrix or Jacobian affects whether signals, gradients, and iterative states amplify or decay.

A practical rule: when a problem involves repeated multiplication by the same matrix, a long-run stationary distribution, a maximum-variance direction, local curvature directions, or low-frequency graph structure, spectral analysis is probably nearby.`,
    ),
  ),
  section(
    'eigenvalues-eigenvectors-review-questions',
    copy('复习问题', 'Review Questions'),
    copy(
      md`- 什么是特征值/特征向量对？为什么特征向量不能是零向量？
- 若 \(\mathbf{v}\) 是 \(A\) 的特征向量，非零倍数 \(c\mathbf{v}\) 是否仍是特征向量？
- \(cA\)、\(A-\sigma I\)、\(A^{-1}\)、\((A-\sigma I)^{-1}\) 的特征值如何由 \(A\) 的特征值推出？
- 什么叫矩阵可对角化？互异特征值、线性无关特征向量和 defective matrix 之间是什么关系？
- 归一化幂迭代为什么需要每一步除以范数？
- 幂迭代会收敛到 \(A\) 的哪个特征方向？什么时候可能失败或振荡？
- 已经得到近似特征向量后，如何用 Rayleigh quotient 估计特征值？
- 逆迭代和平移逆迭代分别瞄准哪个特征值方向？为什么实际实现里通常求解线性系统而不是显式求逆？
- 幂迭代和逆迭代的收敛速度分别受哪些特征值间距控制？
- 正交矩阵为什么对数值稳定有帮助？`,
      md`- What is an eigenvalue/eigenvector pair? Why can the eigenvector not be the zero vector?
- If \(\mathbf{v}\) is an eigenvector of \(A\), is every nonzero multiple \(c\mathbf{v}\) still an eigenvector?
- How do the eigenvalues of \(cA\), \(A-\sigma I\), \(A^{-1}\), and \((A-\sigma I)^{-1}\) follow from the eigenvalues of \(A\)?
- What does it mean for a matrix to be diagonalizable? How are distinct eigenvalues, independent eigenvectors, and defective matrices related?
- Why does normalized power iteration divide by a norm every step?
- Which eigen direction does power iteration converge to? When can it fail or oscillate?
- Given an approximate eigenvector, how can the Rayleigh quotient estimate the eigenvalue?
- Which eigen directions do inverse iteration and shifted inverse iteration target? Why do implementations usually solve linear systems instead of forming an inverse explicitly?
- Which eigenvalue gaps control the convergence of power iteration and inverse iteration?
- Why do orthogonal matrices help numerical stability?`,
    ),
  ),
]

export function buildEigenvaluesModule(base: MathLabModule): MathLabModule {
  return {
    ...base,
    title: copy('特征值与特征向量', 'Eigenvalues and Eigenvectors'),
    subtitle: copy(
      '寻找在线性变换下只缩放、不改变方向的特殊结构。',
      'Find the special directions that are only scaled under a linear transformation.',
    ),
    estimatedMinutes: 26,
    prerequisites: ['linear-algebra-rank-null-space'],
    sourceReferences: [sources.essenceLinearAlgebra, sources.d2lLinearAlgebra, sources.mml],
    aiModelConnections: [
      copy(
        'PCA 用协方差矩阵的特征向量找到最大方差方向。',
        'PCA uses eigenvectors of a covariance matrix to find maximum-variance directions.',
      ),
      copy(
        'PageRank 和 Markov 链把稳定分布读成特征值 1 的特征向量。',
        'PageRank and Markov chains read stationary distributions as eigenvectors for eigenvalue 1.',
      ),
      copy(
        'Hessian 和 Jacobian 的特征值帮助判断训练中的曲率、稳定性和梯度传播。',
        'Eigenvalues of Hessians and Jacobians help diagnose curvature, stability, and gradient propagation during training.',
      ),
    ],
    learningObjectives: [
      copy(md`解释 \(A\mathbf{x}=\lambda\mathbf{x}\) 的几何意义。`, md`Explain the geometry of \(A\mathbf{x}=\lambda\mathbf{x}\).`),
      copy('用特征多项式和零空间手算小矩阵的特征对。', 'Compute eigenpairs of small matrices using characteristic polynomials and nullspaces.'),
      copy(md`判断矩阵是否可对角化，并读懂 \(A=XDX^{-1}\)。`, md`Decide whether a matrix is diagonalizable and interpret \(A=XDX^{-1}\).`),
      copy('推导平移、求逆和平移求逆对特征值的影响。', 'Derive how shifts, inverses, and shifted inverses change eigenvalues.'),
      copy('运行幂迭代并用 Rayleigh quotient 估计特征值。', 'Run power iteration and estimate eigenvalues with the Rayleigh quotient.'),
    ],
    concepts: [
      {
        id: 'eigenpair',
        name: copy('特征值与特征向量', 'Eigenvalue and Eigenvector'),
        formulaLatex: 'A\\mathbf{x}=\\lambda\\mathbf{x}',
        variables: [
          {
            symbol: '\\mathbf{x}',
            description: copy('非零特征向量；变换后仍在同一方向线上。', 'Nonzero eigenvector; it stays on the same line after transformation.'),
          },
          {
            symbol: '\\lambda',
            description: copy('特征值；描述该方向被缩放、翻转或压扁的倍数。', 'Eigenvalue; the scale, flip, or collapse factor along that direction.'),
          },
        ],
        plainExplanation: copy(
          '特征方向是矩阵作用后不会转向的方向。',
          'An eigen direction is a direction that the matrix does not turn away from.',
        ),
        geometricIntuition: copy(
          '大多数向量会被旋到新方向；特征向量只沿自己的直线移动。',
          'Most vectors rotate into new directions; an eigenvector only moves along its own line.',
        ),
        numericalExample: copy(
          md`对 \(A=\begin{bmatrix}2&1\\4&2\end{bmatrix}\)，\(\lambda=4\) 的一个特征向量是 \([1,2]^T\)。`,
          md`For \(A=\begin{bmatrix}2&1\\4&2\end{bmatrix}\), one eigenvector for \(\lambda=4\) is \([1,2]^T\).`,
        ),
        codeExample:
          'import numpy as np\n\nA = np.array([[2, 1], [4, 2]])\nvalues, vectors = np.linalg.eig(A)\nprint(values)\nprint(vectors)  # eigenvectors are columns',
        modelConnection: copy(
          'PCA、PageRank、谱聚类和 Hessian 曲率分析都在寻找这种“保留下来的方向”。',
          'PCA, PageRank, spectral clustering, and Hessian curvature analysis all look for these preserved directions.',
        ),
      },
      {
        id: 'characteristic-polynomial',
        name: copy('特征多项式', 'Characteristic Polynomial'),
        formulaLatex: 'p(\\lambda)=\\det(A-\\lambda I)',
        variables: [
          {
            symbol: 'p(\\lambda)',
            description: copy('特征值必须使这个多项式为零。', 'Eigenvalues are roots of this polynomial.'),
          },
          {
            symbol: 'A-\\lambda I',
            description: copy('有非零零空间时才能产生特征向量。', 'It must have a nontrivial nullspace to produce an eigenvector.'),
          },
        ],
        plainExplanation: copy(
          md`特征值让 \(A-\lambda I\) 变成不可逆矩阵。`,
          md`An eigenvalue makes \(A-\lambda I\) singular.`,
        ),
        geometricIntuition: copy(
          '把“方向不变”转化成“某个矩阵有非零零空间”。',
          'It turns "direction is preserved" into "a certain matrix has a nonzero nullspace."',
        ),
        numericalExample: copy(
          md`\(\det\begin{bmatrix}2-\lambda&1\\4&2-\lambda\end{bmatrix}=\lambda(\lambda-4)\)。`,
          md`\(\det\begin{bmatrix}2-\lambda&1\\4&2-\lambda\end{bmatrix}=\lambda(\lambda-4)\).`,
        ),
        modelConnection: copy(
          '手算特征多项式适合小矩阵；大型模型里的谱信息通常靠迭代算法近似。',
          'Characteristic polynomials are good for small hand calculations; spectral information in large models is usually approximated by iterative algorithms.',
        ),
      },
      {
        id: 'rayleigh-quotient',
        name: copy('Rayleigh Quotient', 'Rayleigh Quotient'),
        formulaLatex: '\\lambda(\\mathbf{u})=\\frac{\\mathbf{u}^T A\\mathbf{u}}{\\mathbf{u}^T\\mathbf{u}}',
        variables: [
          {
            symbol: '\\mathbf{u}',
            description: copy('当前的近似特征向量。', 'The current approximate eigenvector.'),
          },
          {
            symbol: '\\lambda(\\mathbf{u})',
            description: copy('由当前方向估计出的特征值。', 'The eigenvalue estimate read from the current direction.'),
          },
        ],
        plainExplanation: copy(
          'Rayleigh quotient 把一个方向上的矩阵作用读成一个标量缩放。',
          'The Rayleigh quotient reads the action of a matrix along one direction as a scalar scale.',
        ),
        geometricIntuition: copy(
          '方向越接近真正特征向量，这个标量越接近真实特征值。',
          'The closer the direction is to a true eigenvector, the closer this scalar is to the true eigenvalue.',
        ),
        numericalExample: copy(
          md`若 \(\mathbf{u}\) 已归一化，则 \(\lambda(\mathbf{u})=\mathbf{u}^TA\mathbf{u}\)。`,
          md`If \(\mathbf{u}\) is normalized, then \(\lambda(\mathbf{u})=\mathbf{u}^TA\mathbf{u}\).`,
        ),
        modelConnection: copy(
          '优化中常用它估计 Hessian 在某个方向上的曲率。',
          'In optimization, it estimates Hessian curvature along a chosen direction.',
        ),
      },
    ],
    sections,
    toc: sections.map(({ id, level, title }) => ({ id, level, title })),
    visuals: [],
    labs: [
      {
        id: 'eigen-power-iteration-lab',
        title: copy('幂迭代主方向实验台', 'Power Iteration Dominant Direction Lab'),
        type: 'interactive-visual',
        componentName: 'NumericalMiniLab',
        successCriteria: [
          copy('能解释迭代次数增加时路径为什么靠近主特征方向。', 'Explain why the path approaches the dominant eigen direction as iterations increase.'),
          copy('能用谱比值读数判断收敛快慢。', 'Use the spectral-ratio readout to judge convergence speed.'),
          copy('能用 residual 判断当前方向是否接近特征向量。', 'Use the residual to judge whether the current direction is close to an eigenvector.'),
        ],
      },
    ],
    quizzes: [
      {
        id: 'eigen-preserved-direction',
        type: 'single-choice',
        prompt: copy(md`特征向量经过矩阵 \(A\) 作用后，最关键的性质是什么？`, md`What is the key property of an eigenvector after \(A\) acts on it?`),
        choices: [
          {
            id: 'same-line',
            label: copy('仍在同一条方向线上，只发生缩放或翻转。', 'It stays on the same line, only scaled or flipped.'),
          },
          {
            id: 'same-coordinates',
            label: copy('每个坐标都保持完全不变。', 'Every coordinate remains exactly unchanged.'),
          },
          {
            id: 'zero-vector',
            label: copy('一定被映射为零向量。', 'It must be mapped to the zero vector.'),
          },
        ],
        answer: 'same-line',
        explanation: copy(
          md`特征方程 \(A\mathbf{x}=\lambda\mathbf{x}\) 要求方向线不变，但长度和符号可以改变。`,
          md`The equation \(A\mathbf{x}=\lambda\mathbf{x}\) preserves the direction line, while length and sign may change.`,
        ),
        misconceptionTags: ['eigen-coordinate-fixed'],
      },
      {
        id: 'eigen-small-matrix-dominant-value',
        type: 'numeric',
        prompt: copy(
          md`对 \(A=\begin{bmatrix}2&1\\4&2\end{bmatrix}\)，特征多项式是 \(\lambda(\lambda-4)\)。最大模特征值是多少？`,
          md`For \(A=\begin{bmatrix}2&1\\4&2\end{bmatrix}\), the characteristic polynomial is \(\lambda(\lambda-4)\). What is the largest-magnitude eigenvalue?`,
        ),
        answer: 4,
        tolerance: 0,
        explanation: copy(
          '两个特征值是 0 和 4；最大模特征值为 4。',
          'The eigenvalues are 0 and 4; the largest-magnitude eigenvalue is 4.',
        ),
        misconceptionTags: ['eigen-characteristic-polynomial'],
      },
      {
        id: 'eigen-shifted-inverse-value',
        type: 'numeric',
        prompt: copy(
          md`若 \(A\) 的某个特征值为 \(5\)，取 \(\sigma=3\)，则 \((A-\sigma I)^{-1}\) 在同一特征向量上的特征值是多少？`,
          md`If \(A\) has eigenvalue \(5\) and \(\sigma=3\), what is the corresponding eigenvalue of \((A-\sigma I)^{-1}\)?`,
        ),
        answer: 0.5,
        tolerance: 1e-12,
        explanation: copy(
          md`平移逆矩阵的特征值为 \(1/(\lambda-\sigma)=1/(5-3)=0.5\)。`,
          md`A shifted inverse has eigenvalue \(1/(\lambda-\sigma)=1/(5-3)=0.5\).`,
        ),
        misconceptionTags: ['eigen-shift-inverse'],
      },
      {
        id: 'eigen-power-iteration-condition',
        type: 'single-choice',
        prompt: copy('幂迭代快速收敛通常需要什么？', 'What usually helps power iteration converge quickly?'),
        choices: [
          {
            id: 'large-gap',
            label: copy(md`存在严格主导特征值，且 \(|\lambda_2|/|\lambda_1|\) 较小。`, md`A strict dominant eigenvalue with small \(|\lambda_2|/|\lambda_1|\).`),
          },
          {
            id: 'all-equal',
            label: copy('所有特征值模长完全相同。', 'All eigenvalues have exactly the same magnitude.'),
          },
          {
            id: 'no-normalization',
            label: copy('迭代时永远不要归一化。', 'Never normalize during iteration.'),
          },
        ],
        answer: 'large-gap',
        explanation: copy(
          md`误差的主导比例通常接近 \(|\lambda_2|/|\lambda_1|\)。这个比例越小，非主方向衰减越快。`,
          md`The dominant error ratio is usually close to \(|\lambda_2|/|\lambda_1|\). The smaller it is, the faster non-dominant directions decay.`,
        ),
        misconceptionTags: ['eigen-power-always-converges'],
        revisitVisualId: 'eigen-power-iteration-lab',
      },
    ],
    misconceptions: [
      {
        id: 'eigen-coordinate-fixed',
        statement: copy('特征向量经过矩阵作用后，每个坐标都不变。', 'Each coordinate of an eigenvector stays unchanged after matrix multiplication.'),
        correction: copy(
          md`特征向量保留的是方向线，不是坐标值；坐标可以按 \(\lambda\) 缩放，也可以翻转符号。`,
          md`An eigenvector preserves its direction line, not its coordinate values; coordinates may be scaled by \(\lambda\) or sign-flipped.`,
        ),
        example: copy(
          md`若 \(A\mathbf{x}=4\mathbf{x}\)，坐标变为原来的 4 倍，但方向线相同。`,
          md`If \(A\mathbf{x}=4\mathbf{x}\), the coordinates become four times larger, but the direction line is unchanged.`,
        ),
      },
      {
        id: 'eigen-distinct-required',
        statement: copy('矩阵只有在所有特征值互异时才可对角化。', 'A matrix is diagonalizable only when all eigenvalues are distinct.'),
        correction: copy(
          '互异特征值保证可对角化，但不是必要条件；关键是是否有足够多线性无关的特征向量。',
          'Distinct eigenvalues guarantee diagonalizability, but they are not required; the key is having enough linearly independent eigenvectors.',
        ),
        example: copy(
          md`单位矩阵的所有特征值都等于 1，但任意坐标轴方向都可作为特征向量，所以它可对角化。`,
          md`The identity matrix has only eigenvalue 1, but every coordinate direction is an eigenvector, so it is diagonalizable.`,
        ),
      },
      {
        id: 'eigen-power-always-converges',
        statement: copy('幂迭代总会稳定收敛到一个特征向量。', 'Power iteration always converges to a stable eigenvector.'),
        correction: copy(
          '它需要主导特征值、合适初始分量和数值归一化；相同模长、负主特征值或复共轭主特征值都可能导致振荡。',
          'It needs a dominant eigenvalue, a suitable initial component, and normalization; equal magnitudes, negative dominant values, or complex conjugate dominant values can cause oscillation.',
        ),
        example: copy(
          md`若主导特征值为负，归一化迭代可能在 \(\mathbf{u}\) 与 \(-\mathbf{u}\) 之间交替。`,
          md`If the dominant eigenvalue is negative, normalized iteration may alternate between \(\mathbf{u}\) and \(-\mathbf{u}\).`,
        ),
      },
    ],
  }
}
