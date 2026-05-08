import { luDecompositionOriginalZh } from './luDecompositionOriginalZh.ts'
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
    'lu-decomposition-linear-systems',
    copy('从“撤销”线性变换到求解方程组', 'From Undoing a Linear Map to Solving a System'),
    copy(
      md`上一章把矩阵 \(A\) 读成线性变换：输入 \(\mathbf{x}\) 经过 \(A\) 后得到 \(\mathbf{b}\)。这一章反过来问：如果只知道输出 \(\mathbf{b}\)，怎样找回输入 \(\mathbf{x}\)？

$$
A\mathbf{x}=\mathbf{b}.
$$

这就是线性方程组。直接去算 \(A^{-1}\mathbf{b}\) 看起来很自然，但在数值计算里通常不是好做法：显式求逆更贵，误差也更容易被放大。实际软件库更常做的是**分解矩阵，再求解三角系统**。

LU 分解的核心承诺是把一个一般矩阵写成

$$
A=LU,
$$

其中 \(L\) 是下三角矩阵，\(U\) 是上三角矩阵。于是原问题变成

$$
LU\mathbf{x}=\mathbf{b}.
$$

引入中间向量 \(\mathbf{y}=U\mathbf{x}\)，求解就拆成两步：

$$
L\mathbf{y}=\mathbf{b},\qquad U\mathbf{x}=\mathbf{y}.
$$

这个拆法的价值不只是“公式好看”。如果同一个矩阵 \(A\) 要配很多个不同右端项 \(\mathbf{b}_1,\mathbf{b}_2,\ldots\)，先分解一次 \(A\)，后面每个右端项都只需要两次三角求解。科学计算、图模型、推荐系统、二阶优化和最小二乘后端都会频繁遇到这种模式。`,
      md`The previous chapter read a matrix \(A\) as a linear map: an input \(\mathbf{x}\) is sent to an output \(\mathbf{b}\). This chapter asks the inverse question: if the output \(\mathbf{b}\) is known, how do we recover the input \(\mathbf{x}\)?

$$
A\mathbf{x}=\mathbf{b}.
$$

This is a linear system. It may be tempting to compute \(A^{-1}\mathbf{b}\) directly, but numerical software usually avoids forming the inverse: it is more expensive and can amplify error. A more practical route is to **factor the matrix, then solve triangular systems**.

LU factorization writes a general matrix as

$$
A=LU,
$$

where \(L\) is lower triangular and \(U\) is upper triangular. The original problem becomes

$$
LU\mathbf{x}=\mathbf{b}.
$$

Introduce the intermediate vector \(\mathbf{y}=U\mathbf{x}\). The solve splits into two steps:

$$
L\mathbf{y}=\mathbf{b},\qquad U\mathbf{x}=\mathbf{y}.
$$

The value is not cosmetic. If the same matrix \(A\) is paired with many right-hand sides \(\mathbf{b}_1,\mathbf{b}_2,\ldots\), factor \(A\) once and then use two triangular solves for each right-hand side. Scientific computing, graph models, recommender systems, second-order optimization, and least-squares backends all use this pattern repeatedly.`,
    ),
  ),
  section(
    'lu-decomposition-triangular-solves',
    copy('为什么三角系统容易解', 'Why Triangular Systems Are Easy to Solve'),
    copy(
      md`三角矩阵的优势来自“变量顺序”。对上三角系统

$$
U\mathbf{x}=\mathbf{b},
\qquad
U=
\begin{bmatrix}
U_{11}&U_{12}&\cdots&U_{1n}\\
0&U_{22}&\cdots&U_{2n}\\
\vdots&\vdots&\ddots&\vdots\\
0&0&\cdots&U_{nn}
\end{bmatrix},
$$

最后一行只含 \(x_n\)，所以可以先求

$$
x_n=\frac{b_n}{U_{nn}}.
$$

再往上一行一行回代：

$$
x_i=\frac{b_i-\sum_{j=i+1}^{n}U_{ij}x_j}{U_{ii}},
\qquad i=n-1,n-2,\ldots,1.
$$

下三角系统则反过来从第一行开始前代：

$$
x_i=\frac{b_i-\sum_{j=1}^{i-1}L_{ij}x_j}{L_{ii}},
\qquad i=1,2,\ldots,n.
$$

如果 \(L\) 采用 LU 中常见的单位对角线形式，\(L_{ii}=1\)，前代还少了除法。两种三角求解都只需要 \(\mathcal{O}(n^2)\) 次运算；相比之下，对一般矩阵做一次 LU 分解需要 \(\mathcal{O}(n^3)\)。因此当分解完成后，单次求解就便宜很多。

**手算例子。** 对

$$
\begin{bmatrix}
2&3&1\\
0&4&2\\
0&0&5
\end{bmatrix}
\begin{bmatrix}x_1\\x_2\\x_3\end{bmatrix}
=
\begin{bmatrix}9\\10\\15\end{bmatrix},
$$

先由最后一行得 \(x_3=3\)，再由第二行得 \(4x_2+2\cdot3=10\)，所以 \(x_2=1\)。第一行给出 \(2x_1+3\cdot1+3=9\)，所以 \(x_1=1.5\)。`,
      md`The advantage of a triangular matrix is variable order. For an upper triangular system

$$
U\mathbf{x}=\mathbf{b},
\qquad
U=
\begin{bmatrix}
U_{11}&U_{12}&\cdots&U_{1n}\\
0&U_{22}&\cdots&U_{2n}\\
\vdots&\vdots&\ddots&\vdots\\
0&0&\cdots&U_{nn}
\end{bmatrix},
$$

the last row contains only \(x_n\), so start with

$$
x_n=\frac{b_n}{U_{nn}}.
$$

Then work upward by back substitution:

$$
x_i=\frac{b_i-\sum_{j=i+1}^{n}U_{ij}x_j}{U_{ii}},
\qquad i=n-1,n-2,\ldots,1.
$$

A lower triangular system works in the opposite direction, starting from the first row:

$$
x_i=\frac{b_i-\sum_{j=1}^{i-1}L_{ij}x_j}{L_{ii}},
\qquad i=1,2,\ldots,n.
$$

When \(L\) has the unit diagonal commonly used in LU, \(L_{ii}=1\), forward substitution avoids those divisions. Both triangular solves cost only \(\mathcal{O}(n^2)\) operations. A general LU factorization costs \(\mathcal{O}(n^3)\), so once the factorization is available, each solve is much cheaper.

**Worked example.** For

$$
\begin{bmatrix}
2&3&1\\
0&4&2\\
0&0&5
\end{bmatrix}
\begin{bmatrix}x_1\\x_2\\x_3\end{bmatrix}
=
\begin{bmatrix}9\\10\\15\end{bmatrix},
$$

the last row gives \(x_3=3\). The second row gives \(4x_2+2\cdot3=10\), so \(x_2=1\). The first row gives \(2x_1+3\cdot1+3=9\), so \(x_1=1.5\).`,
    ),
  ),
  section(
    'lu-decomposition-factorization',
    copy('LU 分解把消元过程保存下来', 'LU Factorization Stores Elimination'),
    copy(
      md`LU 分解不是凭空出现的矩阵乘法，它记录了高斯消元的过程。以单位下三角 \(L\) 为约定时，

$$
L=
\begin{bmatrix}
1&0&\cdots&0\\
L_{21}&1&\cdots&0\\
\vdots&\vdots&\ddots&\vdots\\
L_{n1}&L_{n2}&\cdots&1
\end{bmatrix},
\qquad
U=
\begin{bmatrix}
U_{11}&U_{12}&\cdots&U_{1n}\\
0&U_{22}&\cdots&U_{2n}\\
\vdots&\vdots&\ddots&\vdots\\
0&0&\cdots&U_{nn}
\end{bmatrix}.
$$

\(U\) 是消元后得到的上三角矩阵，\(L\) 保存每一步用到的消元乘子。单位对角线让分解在满足条件时具有标准形式；如果主元没有出问题，\(A=LU\) 就能唯一确定这一组 \(L,U\)。

二维情况能看清全部结构。令

$$
A=
\begin{bmatrix}
a_{11}&a_{12}\\
a_{21}&a_{22}
\end{bmatrix}.
$$

若第一个主元 \(a_{11}\ne0\)，取

$$
L=
\begin{bmatrix}
1&0\\
\ell_{21}&1
\end{bmatrix},
\qquad
U=
\begin{bmatrix}
a_{11}&a_{12}\\
0&u_{22}
\end{bmatrix}.
$$

比较 \(A=LU\) 得到

$$
\ell_{21}=\frac{a_{21}}{a_{11}},
\qquad
u_{22}=a_{22}-\ell_{21}a_{12}.
$$

这里 \(u_{22}\) 是二维 Schur 补。它也是第二个主元；如果它接近 \(0\)，即使 \(a_{11}\) 非零，回代也会非常敏感。`,
      md`LU factorization is not an arbitrary matrix product; it stores Gaussian elimination. With the unit lower triangular convention,

$$
L=
\begin{bmatrix}
1&0&\cdots&0\\
L_{21}&1&\cdots&0\\
\vdots&\vdots&\ddots&\vdots\\
L_{n1}&L_{n2}&\cdots&1
\end{bmatrix},
\qquad
U=
\begin{bmatrix}
U_{11}&U_{12}&\cdots&U_{1n}\\
0&U_{22}&\cdots&U_{2n}\\
\vdots&\vdots&\ddots&\vdots\\
0&0&\cdots&U_{nn}
\end{bmatrix}.
$$

\(U\) is the upper triangular matrix left by elimination, and \(L\) stores the multipliers used during elimination. The unit diagonal makes the factorization standard; when the pivots behave, \(A=LU\) uniquely determines these \(L,U\).

The \(2\times2\) case shows the structure clearly. Let

$$
A=
\begin{bmatrix}
a_{11}&a_{12}\\
a_{21}&a_{22}
\end{bmatrix}.
$$

If the first pivot \(a_{11}\ne0\), choose

$$
L=
\begin{bmatrix}
1&0\\
\ell_{21}&1
\end{bmatrix},
\qquad
U=
\begin{bmatrix}
a_{11}&a_{12}\\
0&u_{22}
\end{bmatrix}.
$$

Comparing entries in \(A=LU\) gives

$$
\ell_{21}=\frac{a_{21}}{a_{11}},
\qquad
u_{22}=a_{22}-\ell_{21}a_{12}.
$$

Here \(u_{22}\) is the \(2\times2\) Schur complement. It is also the second pivot; if it is near \(0\), back substitution becomes very sensitive even when \(a_{11}\) is nonzero.`,
    ),
  ),
  section(
    'lu-decomposition-worked-example',
    copy('例题：分解一次，再两步求解', 'Worked Example: Factor Once, Then Solve in Two Steps'),
    copy(
      md`考虑

$$
A=
\begin{bmatrix}
4&2\\
3&5
\end{bmatrix},
\qquad
\mathbf{b}=
\begin{bmatrix}
6\\
7
\end{bmatrix}.
$$

第一个主元是 \(4\)，消元乘子为

$$
\ell_{21}=\frac{3}{4}=0.75.
$$

第二个主元为

$$
u_{22}=5-0.75\cdot2=3.5.
$$

因此

$$
L=
\begin{bmatrix}
1&0\\
0.75&1
\end{bmatrix},
\qquad
U=
\begin{bmatrix}
4&2\\
0&3.5
\end{bmatrix}.
$$

先解 \(L\mathbf{y}=\mathbf{b}\)：

$$
y_1=6,\qquad y_2=7-0.75\cdot6=2.5.
$$

再解 \(U\mathbf{x}=\mathbf{y}\)：

$$
x_2=\frac{2.5}{3.5}=\frac{5}{7},
\qquad
x_1=\frac{6-2x_2}{4}=\frac{8}{7}.
$$

所以

$$
\mathbf{x}=
\begin{bmatrix}
8/7\\
5/7
\end{bmatrix}.
$$

下面的实验台使用同一个 \(2\times2\) 结构。移动第一个主元、下方元素、第二个主元和右端项，观察 \(L\)、\(U\)、中间向量 \(\mathbf{y}\)、解 \(\mathbf{x}\)、残差和复用收益如何一起变化。`,
      md`Consider

$$
A=
\begin{bmatrix}
4&2\\
3&5
\end{bmatrix},
\qquad
\mathbf{b}=
\begin{bmatrix}
6\\
7
\end{bmatrix}.
$$

The first pivot is \(4\), so the elimination multiplier is

$$
\ell_{21}=\frac{3}{4}=0.75.
$$

The second pivot is

$$
u_{22}=5-0.75\cdot2=3.5.
$$

Therefore

$$
L=
\begin{bmatrix}
1&0\\
0.75&1
\end{bmatrix},
\qquad
U=
\begin{bmatrix}
4&2\\
0&3.5
\end{bmatrix}.
$$

First solve \(L\mathbf{y}=\mathbf{b}\):

$$
y_1=6,\qquad y_2=7-0.75\cdot6=2.5.
$$

Then solve \(U\mathbf{x}=\mathbf{y}\):

$$
x_2=\frac{2.5}{3.5}=\frac{5}{7},
\qquad
x_1=\frac{6-2x_2}{4}=\frac{8}{7}.
$$

So

$$
\mathbf{x}=
\begin{bmatrix}
8/7\\
5/7
\end{bmatrix}.
$$

The lab below uses the same \(2\times2\) structure. Move the first pivot, lower entry, second pivot, and right-hand side to see how \(L\), \(U\), the intermediate vector \(\mathbf{y}\), the solution \(\mathbf{x}\), the residual, and the reuse gain move together.`,
    ),
    { labIds: ['lu-decomposition-solve-lab'] },
  ),
  section(
    'lu-decomposition-algorithm-and-cost',
    copy('算法和成本：先贵后便宜', 'Algorithm and Cost: Expensive First, Cheap Later'),
    copy(
      md`一般 \(n\times n\) 矩阵的 LU 分解可以递归地看成“取一个主元，再分解剩下的 Schur 补”。把矩阵分块为

$$
A=
\begin{bmatrix}
a_{11}&\mathbf{a}_{12}\\
\mathbf{a}_{21}&A_{22}
\end{bmatrix}.
$$

如果 \(a_{11}\ne0\)，第一步给出

$$
u_{11}=a_{11},\qquad
\mathbf{u}_{12}=\mathbf{a}_{12},\qquad
\boldsymbol{\ell}_{21}=\frac{\mathbf{a}_{21}}{a_{11}},
$$

剩余部分需要继续分解

$$
S_{22}=A_{22}-\boldsymbol{\ell}_{21}\mathbf{u}_{12}.
$$

这个 \(S_{22}\) 就是 Schur 补。它把“已经用第一个主元解释掉的部分”从右下角矩阵里扣掉。对 \(S_{22}\) 重复同样过程，就得到完整的 \(L\) 和 \(U\)。

成本结构很重要：

| 操作 | 典型成本 | 直觉 |
| --- | --- | --- |
| LU 分解 | \(\mathcal{O}(n^3)\) | 消元要更新二维块 |
| 前代或回代 | \(\mathcal{O}(n^2)\) | 只沿三角结构逐行求解 |
| 已有 LU 后解一个新 \(\mathbf{b}\) | \(\mathcal{O}(n^2)\) | 复用 \(L,U\) |

所以 LU 的优势最明显地出现在“同一个 \(A\)，很多个 \(\mathbf{b}\)”的场景。若每个右端项都重新分解，代价近似乘上右端项个数；若保存 \(L,U\)，只需要一次 \(\mathcal{O}(n^3)\) 预处理，后面每次是 \(\mathcal{O}(n^2)\)。`,
      md`For a general \(n\times n\) matrix, LU factorization can be read recursively: choose a pivot, then factor the remaining Schur complement. Partition the matrix as

$$
A=
\begin{bmatrix}
a_{11}&\mathbf{a}_{12}\\
\mathbf{a}_{21}&A_{22}
\end{bmatrix}.
$$

If \(a_{11}\ne0\), the first step gives

$$
u_{11}=a_{11},\qquad
\mathbf{u}_{12}=\mathbf{a}_{12},\qquad
\boldsymbol{\ell}_{21}=\frac{\mathbf{a}_{21}}{a_{11}},
$$

and the remaining part must factor

$$
S_{22}=A_{22}-\boldsymbol{\ell}_{21}\mathbf{u}_{12}.
$$

This \(S_{22}\) is the Schur complement. It removes the part already explained by the first pivot from the lower-right block. Repeating the same process on \(S_{22}\) produces the full \(L\) and \(U\).

The cost structure matters:

| Operation | Typical cost | Intuition |
| --- | --- | --- |
| LU factorization | \(\mathcal{O}(n^3)\) | Elimination updates two-dimensional blocks |
| Forward or back substitution | \(\mathcal{O}(n^2)\) | Solve row by row through triangular structure |
| Solve a new \(\mathbf{b}\) after LU is known | \(\mathcal{O}(n^2)\) | Reuse \(L,U\) |

LU is most valuable in the "same \(A\), many \(\mathbf{b}\)" setting. Refactoring for each right-hand side roughly multiplies the factorization cost by the number of right-hand sides. Keeping \(L,U\) pays one \(\mathcal{O}(n^3)\) preprocessing cost and then uses \(\mathcal{O}(n^2)\) work per solve.`,
    ),
  ),
  section(
    'lu-decomposition-pivoting',
    copy('主元和 LUP：什么时候需要换行', 'Pivots and LUP: When Rows Need to Move'),
    copy(
      md`普通 \(A=LU\) 需要每一步主元不为 \(0\)，并且在有限精度计算中还希望主元不要太小。主元太小会让消元乘子变大，舍入误差随之放大。部分主元法（partial pivoting）会在当前列中选择绝对值较大的元素换到主元位置。

换行可以用置换矩阵 \(P\) 表示。带主元的分解写成

$$
PA=LU.
$$

求解 \(A\mathbf{x}=\mathbf{b}\) 时，先把方程左侧同乘 \(P\)：

$$
PA\mathbf{x}=P\mathbf{b}.
$$

因为 \(PA=LU\)，所以实际步骤是

$$
L\mathbf{y}=P\mathbf{b},\qquad U\mathbf{x}=\mathbf{y}.
$$

**失败例子。** 矩阵

$$
A=
\begin{bmatrix}
0&1\\
2&1
\end{bmatrix}
$$

没有以第一行开头的普通 LU 分解，因为第一个主元是 \(0\)。但交换两行后得到

$$
P A=
\begin{bmatrix}
2&1\\
0&1
\end{bmatrix},
\qquad
P=
\begin{bmatrix}
0&1\\
1&0
\end{bmatrix}.
$$

这时可以令 \(L=I\)、\(U=PA\)。实际数值库默认使用类似策略，而不是盲目相信原始行顺序。需要注意，LUP 也不能拯救真正奇异的矩阵；如果 \(U\) 的对角线上最终出现 \(0\) 或非常接近 \(0\) 的主元，系统可能无唯一解或数值上不可靠。`,
      md`Plain \(A=LU\) requires every pivot to be nonzero, and in finite precision we also want pivots not to be too small. A tiny pivot creates large elimination multipliers, which can amplify rounding error. Partial pivoting chooses a larger-magnitude entry in the current column and swaps that row into the pivot position.

Row swaps are represented by a permutation matrix \(P\). With pivoting, the factorization is

$$
PA=LU.
$$

To solve \(A\mathbf{x}=\mathbf{b}\), multiply the system by \(P\):

$$
PA\mathbf{x}=P\mathbf{b}.
$$

Since \(PA=LU\), the actual steps are

$$
L\mathbf{y}=P\mathbf{b},\qquad U\mathbf{x}=\mathbf{y}.
$$

**Failure example.** The matrix

$$
A=
\begin{bmatrix}
0&1\\
2&1
\end{bmatrix}
$$

has no plain LU factorization using the first row first, because the first pivot is \(0\). After swapping the two rows,

$$
P A=
\begin{bmatrix}
2&1\\
0&1
\end{bmatrix},
\qquad
P=
\begin{bmatrix}
0&1\\
1&0
\end{bmatrix}.
$$

Now we can take \(L=I\) and \(U=PA\). Numerical libraries use this kind of strategy by default instead of trusting the original row order blindly. LUP still cannot rescue a truly singular matrix; if the diagonal of \(U\) eventually contains a zero or near-zero pivot, the system may have no unique solution or may be numerically unreliable.`,
    ),
  ),
  section(
    'lu-decomposition-ml-connection',
    copy('机器学习和数值库里的 LU', 'LU Inside Machine Learning and Numerical Libraries'),
    copy(
      md`LU 很少作为机器学习课程里最醒目的概念出现，但它经常躲在数值后端里。

**最小二乘和线性模型。** 线性回归、局部二次近似和一些校准问题会产生线性系统。实际库会根据矩阵结构选择 LU、QR、Cholesky 或 SVD；LU 的优势是通用性强，尤其适合一般方阵系统。

**Newton 类方法和隐式层。** Newton 法每步需要求解

$$
H\Delta\theta=-\nabla L(\theta).
$$

这里 \(H\) 或近似 Hessian 固定后，可能会重复求多个右端项。分解一次再复用三角求解，可以明显降低重复成本。

**特征值和逆迭代。** 后续章节的 inverse iteration 不会真的构造 \(A^{-1}\)。它通常先分解 \(A-\sigma I\)，然后每次迭代都做一次线性求解。这样每步从“求逆”变成“复用分解后的三角求解”。

**图和推荐系统。** 图拉普拉斯、稀疏线性系统、隐式反馈推荐和科学模拟都可能产生巨大线性系统。本章的 LU 是密集矩阵版本的直觉基础；下一章会进一步关心稀疏结构如何节省存储和运算。`,
      md`LU is rarely the most visible concept in a machine-learning course, but it often sits inside numerical backends.

**Least squares and linear models.** Linear regression, local quadratic approximations, and some calibration problems produce linear systems. Libraries choose between LU, QR, Cholesky, or SVD depending on matrix structure. LU is useful as a general-purpose method for square systems.

**Newton-type methods and implicit layers.** A Newton step solves

$$
H\Delta\theta=-\nabla L(\theta).
$$

If \(H\) or an approximate Hessian is reused with multiple right-hand sides, factoring once and reusing triangular solves can reduce repeated cost substantially.

**Eigenvalues and inverse iteration.** Later, inverse iteration will not explicitly build \(A^{-1}\). It typically factors \(A-\sigma I\), then solves a linear system at each iteration. Each step becomes "reuse the factorization and do triangular solves" instead of "compute an inverse."

**Graphs and recommender systems.** Graph Laplacians, sparse linear systems, implicit-feedback recommenders, and scientific simulations can all produce large linear systems. This chapter gives the dense-matrix intuition; the next chapter asks how sparse structure saves storage and computation.`,
    ),
  ),
  section(
    'lu-decomposition-review',
    copy('复习问题', 'Review Questions'),
    copy(
      md`1. 为什么数值计算通常不通过显式求 \(A^{-1}\) 来解 \(A\mathbf{x}=\mathbf{b}\)？
2. 有了 \(A=LU\) 后，为什么要先解 \(L\mathbf{y}=\mathbf{b}\)，再解 \(U\mathbf{x}=\mathbf{y}\)？
3. 前代和回代分别从矩阵的哪一端开始？
4. 在 \(2\times2\) 情况下，\(\ell_{21}\) 和 \(u_{22}\) 如何由 \(A\) 的元素计算？
5. 为什么 \(u_{22}\) 接近 \(0\) 会让回代不可靠？
6. LU 分解和一次三角求解的复杂度分别是多少？
7. 同一个 \(A\) 对多个右端项求解时，为什么 LU 分解可以复用？
8. 什么情况下普通 LU 会失败，但 LUP 可以通过换行继续？
9. \(PA=LU\) 中的 \(P\) 对方程 \(A\mathbf{x}=\mathbf{b}\) 的右端项有什么影响？
10. 在 Newton 法、逆迭代或推荐系统中，LU 思想分别对应什么重复计算？`,
      md`1. Why does numerical computing usually avoid explicitly forming \(A^{-1}\) to solve \(A\mathbf{x}=\mathbf{b}\)?
2. After \(A=LU\), why solve \(L\mathbf{y}=\mathbf{b}\) first and then \(U\mathbf{x}=\mathbf{y}\)?
3. Which end of the matrix do forward and back substitution start from?
4. In the \(2\times2\) case, how are \(\ell_{21}\) and \(u_{22}\) computed from entries of \(A\)?
5. Why does \(u_{22}\) near \(0\) make back substitution unreliable?
6. What are the costs of LU factorization and one triangular solve?
7. Why can LU be reused when the same \(A\) has multiple right-hand sides?
8. When can plain LU fail while LUP succeeds by swapping rows?
9. In \(PA=LU\), what does \(P\) do to the right-hand side of \(A\mathbf{x}=\mathbf{b}\)?
10. In Newton's method, inverse iteration, or recommender systems, what repeated computation does the LU idea support?`,
    ),
  ),
]

const supplementalSectionIds = new Set([
  'lu-decomposition-worked-example',
  'lu-decomposition-ml-connection',
])

function cleanImportedLectureContent(source: string): string {
  return source
    .replace(
      /<div class="toasts warning mb-4">\s*<div class="title[\s\S]*?<\/div>\s*<div class="content[\s\S]*?<\/div>\s*<\/div>/g,
      '',
    )
    .replace(/\n\$\n([\s\S]*?)\n\.\$\n/g, '\n$\n$1\n$\n')
}

function repairImportedSection(importedSection: MathLabSection): MathLabSection {
  return {
    ...importedSection,
    content: copy(
      luDecompositionOriginalZh[importedSection.id] ?? cleanImportedLectureContent(importedSection.content['zh-CN']),
      cleanImportedLectureContent(importedSection.content.en),
    ),
  }
}

function buildSections(importedSections: MathLabSection[]): MathLabSection[] {
  return [
    ...importedSections.map(repairImportedSection),
    ...sections.filter((item) => supplementalSectionIds.has(item.id)),
  ]
}

export function buildLuDecompositionModule(importedModule: MathLabModule): MathLabModule {
  const repairedSections = buildSections(importedModule.sections)

  return {
    ...importedModule,
    title: copy('用 LU 分解求解线性方程', 'LU Decomposition for Solving Linear Equations'),
    subtitle: copy(
      '把一般线性系统拆成可复用的前代和回代步骤，并理解主元为什么决定稳定性。',
      'Split a general linear system into reusable forward and back substitution, and see why pivots control stability.',
    ),
    estimatedMinutes: 40,
    prerequisites: ['vectors-matrices-norms'],
    aiModelConnections: [
      copy(
        '最小二乘、Newton 类优化、逆迭代和图结构计算都会反复求解线性系统；LU 的价值是分解一次、求解多次。',
        'Least squares, Newton-type optimization, inverse iteration, and graph computations repeatedly solve linear systems; LU matters because it factors once and solves many times.',
      ),
      copy(
        '主元和残差读数帮助判断数值后端是否可靠，而不只是判断矩阵在代数上是否可逆。',
        'Pivot and residual readouts help judge whether a numerical backend is reliable, not merely whether a matrix is algebraically invertible.',
      ),
    ],
    learningObjectives: [
      copy(md`解释线性系统 \(A\mathbf{x}=\mathbf{b}\) 为什么可以看成撤销一个线性变换。`, md`Explain why a linear system \(A\mathbf{x}=\mathbf{b}\) can be read as undoing a linear map.`),
      copy('用前代和回代求解下三角、上三角系统。', 'Use forward and back substitution to solve lower and upper triangular systems.'),
      copy(md`从 \(2\times2\) 例子推导 \(A=LU\)、消元乘子和 Schur 补。`, md`Derive \(A=LU\), the elimination multiplier, and the Schur complement from a \(2\times2\) example.`),
      copy(md`说明 LU 分解的 \(\mathcal{O}(n^3)\) 成本、三角求解的 \(\mathcal{O}(n^2)\) 成本和多右端项复用收益。`, md`Explain the \(\mathcal{O}(n^3)\) cost of LU, the \(\mathcal{O}(n^2)\) cost of triangular solves, and the reuse gain for multiple right-hand sides.`),
      copy('识别普通 LU 失败或不稳定时，为什么需要部分主元和 LUP。', 'Recognize why partial pivoting and LUP are needed when plain LU fails or becomes unstable.'),
    ],
    concepts: [
      {
        id: 'lu-factorization-core',
        name: copy('LU 分解', 'LU Factorization'),
        formulaLatex: 'A=LU',
        variables: [
          {
            symbol: 'A',
            description: copy('原始方阵，代表要撤销的线性变换。', 'The original square matrix, representing the linear map to undo.'),
          },
          {
            symbol: 'L',
            description: copy('单位下三角矩阵，保存消元乘子，并用于前代。', 'A unit lower triangular matrix that stores elimination multipliers and is used for forward substitution.'),
          },
          {
            symbol: 'U',
            description: copy('上三角矩阵，保存消元后的系统，并用于回代。', 'An upper triangular matrix that stores the eliminated system and is used for back substitution.'),
          },
        ],
        plainExplanation: copy(
          '先把困难矩阵分解成两个有顺序结构的矩阵，求解时就可以逐个变量读出答案。',
          'Factor the hard matrix into two ordered structures so the solve can reveal variables one at a time.',
        ),
        geometricIntuition: copy(
          '消元先清掉某些方向上的耦合，再用三角结构沿固定顺序还原坐标。',
          'Elimination removes coupling in selected directions, then triangular structure restores coordinates in a fixed order.',
        ),
        numericalExample: copy(
          md`若 \(A=\begin{bmatrix}4&2\\3&5\end{bmatrix}\)，则 \(L=\begin{bmatrix}1&0\\0.75&1\end{bmatrix}\)、\(U=\begin{bmatrix}4&2\\0&3.5\end{bmatrix}\)。`,
          md`If \(A=\begin{bmatrix}4&2\\3&5\end{bmatrix}\), then \(L=\begin{bmatrix}1&0\\0.75&1\end{bmatrix}\) and \(U=\begin{bmatrix}4&2\\0&3.5\end{bmatrix}\).`,
        ),
        codeExample:
          'import numpy as np\n\nL = np.array([[1.0, 0.0], [0.75, 1.0]])\nU = np.array([[4.0, 2.0], [0.0, 3.5]])\nb = np.array([6.0, 7.0])\ny = np.linalg.solve(L, b)\nx = np.linalg.solve(U, y)\nprint(x)  # [1.14285714, 0.71428571]',
        modelConnection: copy(
          '当优化器、物理模拟或图算法反复使用同一个系数矩阵时，LU 可以把昂贵分解和便宜求解分离。',
          'When optimizers, simulations, or graph algorithms repeatedly use the same coefficient matrix, LU separates expensive factorization from cheap solves.',
        ),
      },
      {
        id: 'lup-pivoting-core',
        name: copy('带部分主元的 LUP 分解', 'LUP Factorization with Partial Pivoting'),
        formulaLatex: 'PA=LU',
        variables: [
          {
            symbol: 'P',
            description: copy('置换矩阵，记录为了选择可靠主元而做的换行。', 'A permutation matrix recording row swaps made to choose reliable pivots.'),
          },
          {
            symbol: 'PA',
            description: copy('换行后的矩阵，再对它执行 LU 分解。', 'The row-swapped matrix that is then factored by LU.'),
          },
        ],
        plainExplanation: copy(
          '当原始第一行给出零主元或小主元时，先换行再分解通常更可靠。',
          'When the original row order gives a zero or tiny pivot, swapping rows before factoring is usually more reliable.',
        ),
        geometricIntuition: copy(
          '换行不改变方程的解，只改变计算顺序，让消元从更稳的方向开始。',
          'A row swap does not change the solution; it changes computation order so elimination starts from a more stable direction.',
        ),
        numericalExample: copy(
          md`矩阵 \(\begin{bmatrix}0&1\\2&1\end{bmatrix}\) 普通 LU 第一主元为 \(0\)，但交换两行后可继续。`,
          md`The matrix \(\begin{bmatrix}0&1\\2&1\end{bmatrix}\) has first pivot \(0\) for plain LU, but a row swap lets the factorization proceed.`,
        ),
        modelConnection: copy(
          '数值库默认使用主元策略，是为了让模型训练或科学计算中的线性求解更抗舍入误差。',
          'Numerical libraries use pivoting by default to make linear solves in model training or scientific computing more resistant to rounding error.',
        ),
      },
    ],
    sections: repairedSections,
    toc: repairedSections.map((item) => ({
      id: item.id,
      level: item.level,
      title: item.title,
    })),
    visuals: [],
    labs: [
      {
        id: 'lu-decomposition-solve-lab',
        title: copy('LU 消元、主元和残差实验', 'LU Elimination, Pivot, and Residual Lab'),
        type: 'interactive-visual',
        componentName: 'LuDecompositionLab',
        successCriteria: [
          copy(
            md`能从 \(a_{11}\)、\(a_{21}\) 读出消元乘子 \(\ell_{21}=a_{21}/a_{11}\)。`,
            md`Read the elimination multiplier \(\ell_{21}=a_{21}/a_{11}\) from \(a_{11}\) and \(a_{21}\).`,
          ),
          copy(
            md`能解释为什么 \(u_{22}=a_{22}-\ell_{21}a_{12}\) 接近 \(0\) 时求解会敏感。`,
            md`Explain why the solve becomes sensitive when \(u_{22}=a_{22}-\ell_{21}a_{12}\) is near \(0\).`,
          ),
          copy('能观察到改变右端项只改变前代/回代结果，不需要重新分解矩阵。', 'Observe that changing the right-hand side changes the forward/back solve results without refactoring the matrix.'),
        ],
      },
    ],
    quizzes: [
      {
        id: 'lu-solve-order',
        type: 'single-choice',
        prompt: copy(
          md`已知 \(A=LU\)，解 \(A\mathbf{x}=\mathbf{b}\) 的正确顺序是什么？`,
          md`Given \(A=LU\), what is the correct order for solving \(A\mathbf{x}=\mathbf{b}\)?`,
        ),
        choices: [
          {
            id: 'forward-back',
            label: copy(md`先解 \(L\mathbf{y}=\mathbf{b}\)，再解 \(U\mathbf{x}=\mathbf{y}\)。`, md`First solve \(L\mathbf{y}=\mathbf{b}\), then solve \(U\mathbf{x}=\mathbf{y}\).`),
          },
          {
            id: 'inverse-first',
            label: copy(md`先显式计算 \(A^{-1}\)，再乘以 \(\mathbf{b}\)。`, md`First explicitly compute \(A^{-1}\), then multiply by \(\mathbf{b}\).`),
          },
          {
            id: 'back-forward',
            label: copy(md`先解 \(U\mathbf{y}=\mathbf{b}\)，再解 \(L\mathbf{x}=\mathbf{y}\)。`, md`First solve \(U\mathbf{y}=\mathbf{b}\), then solve \(L\mathbf{x}=\mathbf{y}\).`),
          },
        ],
        answer: 'forward-back',
        explanation: copy(
          md`因为 \(LU\mathbf{x}=\mathbf{b}\)。令 \(\mathbf{y}=U\mathbf{x}\)，先通过前代解 \(L\mathbf{y}=\mathbf{b}\)，再通过回代解 \(U\mathbf{x}=\mathbf{y}\)。`,
          md`Since \(LU\mathbf{x}=\mathbf{b}\), set \(\mathbf{y}=U\mathbf{x}\). Solve \(L\mathbf{y}=\mathbf{b}\) by forward substitution, then solve \(U\mathbf{x}=\mathbf{y}\) by back substitution.`,
        ),
        misconceptionTags: ['lu-explicit-inverse'],
        revisitVisualId: 'lu-decomposition-solve-lab',
      },
      {
        id: 'lu-worked-x2',
        type: 'numeric',
        prompt: copy(
          md`对 \(A=\begin{bmatrix}4&2\\3&5\end{bmatrix}\)、\(\mathbf{b}=(6,7)\)，上文 LU 求解得到的 \(x_2\) 是多少？`,
          md`For \(A=\begin{bmatrix}4&2\\3&5\end{bmatrix}\) and \(\mathbf{b}=(6,7)\), what is \(x_2\) from the LU solve above?`,
        ),
        answer: 0.714285714,
        tolerance: 0.001,
        explanation: copy(
          md`前代得到 \(y_2=2.5\)，第二个主元 \(u_{22}=3.5\)，所以 \(x_2=2.5/3.5=5/7\approx0.714\)。`,
          md`Forward substitution gives \(y_2=2.5\), and the second pivot is \(u_{22}=3.5\), so \(x_2=2.5/3.5=5/7\approx0.714\).`,
        ),
        misconceptionTags: ['lu-substitution-order'],
      },
      {
        id: 'lu-pivoting-purpose',
        type: 'single-choice',
        prompt: copy('部分主元 pivoting 主要解决什么问题？', 'What problem does partial pivoting mainly address?'),
        choices: [
          {
            id: 'stable-pivot',
            label: copy('避免零主元或过小主元导致消元不可靠。', 'It avoids zero or tiny pivots that make elimination unreliable.'),
          },
          {
            id: 'make-symmetric',
            label: copy('把所有矩阵都变成对称矩阵。', 'It turns every matrix into a symmetric matrix.'),
          },
          {
            id: 'reduce-dimension',
            label: copy('把高维数据降到二维。', 'It reduces high-dimensional data to two dimensions.'),
          },
        ],
        answer: 'stable-pivot',
        explanation: copy(
          md`换行选择当前列里更可靠的主元。它不改变方程解，但会改变消元顺序，降低零主元或小主元带来的失败风险。`,
          md`Row swaps choose a more reliable pivot in the current column. They do not change the solution, but they change elimination order and reduce failures from zero or tiny pivots.`,
        ),
        misconceptionTags: ['lu-always-exists'],
      },
    ],
    misconceptions: [
      {
        id: 'lu-explicit-inverse',
        statement: copy(
          md`解 \(A\mathbf{x}=\mathbf{b}\) 最好先算出 \(A^{-1}\)。`,
          md`The best way to solve \(A\mathbf{x}=\mathbf{b}\) is to compute \(A^{-1}\) first.`,
        ),
        correction: copy(
          '数值计算通常直接分解并求解，避免显式求逆带来的额外成本和误差放大。',
          'Numerical computing usually factors and solves directly, avoiding the extra cost and error amplification of explicitly forming the inverse.',
        ),
        example: copy(
          md`有 \(A=LU\) 时，直接做 \(L\mathbf{y}=\mathbf{b}\)、\(U\mathbf{x}=\mathbf{y}\)，不需要构造 \(A^{-1}\)。`,
          md`With \(A=LU\), solve \(L\mathbf{y}=\mathbf{b}\) and \(U\mathbf{x}=\mathbf{y}\) directly; no explicit \(A^{-1}\) is needed.`,
        ),
      },
      {
        id: 'lu-always-exists',
        statement: copy(
          '任何可逆矩阵都能按原始行顺序做普通 LU 分解。',
          'Every invertible matrix has a plain LU factorization in its original row order.',
        ),
        correction: copy(
          '普通 LU 可能遇到零主元或小主元；实际求解常用 LUP，通过换行选择更可靠主元。',
          'Plain LU can hit zero or tiny pivots; practical solvers often use LUP and swap rows to choose more reliable pivots.',
        ),
        example: copy(
          md`\(\begin{bmatrix}0&1\\2&1\end{bmatrix}\) 可逆，但第一个主元为 \(0\)，必须先换行。`,
          md`\(\begin{bmatrix}0&1\\2&1\end{bmatrix}\) is invertible, but its first pivot is \(0\), so a row swap is needed.`,
        ),
      },
      {
        id: 'lu-invertible-means-stable',
        statement: copy(
          '矩阵只要可逆，LU 求解就一定数值稳定。',
          'As long as a matrix is invertible, LU solving is numerically stable.',
        ),
        correction: copy(
          '可逆只说明存在唯一解；小主元、病态矩阵和舍入误差仍可能让数值解不可靠。',
          'Invertible only means a unique solution exists; tiny pivots, ill-conditioning, and rounding error can still make the numerical solution unreliable.',
        ),
        example: copy(
          md`当 \(u_{22}\) 接近 \(0\) 时，\(x_2=y_2/u_{22}\) 会放大 \(y_2\) 中很小的误差。`,
          md`When \(u_{22}\) is near \(0\), \(x_2=y_2/u_{22}\) amplifies tiny errors in \(y_2\).`,
        ),
      },
    ],
  }
}
