const md = String.raw

export const luDecompositionOriginalZh: Record<string, string> = {
  'lu-decomposition-learning-objectives': md`- 理解线性方程组的用途。
- 使用已知数据，为实际问题建立线性方程组。
- 描述分解 \(\mathbf{A}=\mathbf{LU}\)。
- 比较 LU 分解与矩阵-矩阵乘法等其他操作的计算成本。
- 实现一个 LU 分解算法。
- 已知 \(\mathbf{A}\) 的 LU 分解后，求解系统 \(\mathbf{Ax}=\mathbf{b}\)。
- 举出需要主元选取的矩阵例子。
- 实现一个 LUP 分解算法。
- 手工计算 LU 和 LUP 分解。
- 使用库函数计算并使用 LU 分解。`,

  'lu-decomposition-basic-idea-the-undo-button-for-linear-operations': md`矩阵-向量乘法可以这样理解：给定数据 \(\mathbf{x}\) 和算子 \(\mathbf{A}\)，我们可以求出 \(\mathbf{y}\)，使得 \(\mathbf{y}=\mathbf{Ax}\)：

$$
\mathbf{x} \hspace{5mm} {\xRightarrow[\text{transformation}]{A}} \hspace{5mm} \mathbf{y}
$$

如果我们知道的是 \(\mathbf{y}\)，但不知道 \(\mathbf{x}\)，就需要把这个变换“撤销”：

$$
\mathbf{y} \hspace{5mm} {\xRightarrow[?]{A^{-1}}} \hspace{5mm} \mathbf{x}
\hspace{3cm}
\textbf{Solve}\hspace{3mm} Ax=y \hspace{3mm}\text{for}\hspace{3mm}\mathbf{x}
$$

### 示例：撤销这个变换

假设已知算子 \(\mathbf{A}\)、已知数据 \(\mathbf{y}\)，未知数据 \(\mathbf{x}\) 满足关系 \(\mathbf{y}=\mathbf{Ax}\)。给定

$$
\textbf{A} =
\begin{bmatrix}
1 & 2 \\
3 & 4
\end{bmatrix}\hspace{5mm}
\textbf{x} =
\begin{bmatrix}
x_1 \\
x_2
\end{bmatrix}\hspace{5mm}\text{and}\hspace{5mm}
\textbf{y} =
\begin{bmatrix}
5 \\
11
\end{bmatrix}.
$$

怎样求出 \(\textbf{x}=[x_1,x_2]^T\)？

<details>
    <summary><strong>答案</strong></summary>

我们建立下面的线性方程组：

$$
\begin{cases}
    x_1 + 2x_2 = 5\\
    3x_1 + 4x_2 = 11
\end{cases}
$$

因此解为

$$
\begin{cases}
    x_1 = 1\\
    x_2 = 2
\end{cases}
\hspace{5mm}\text{, or}\hspace{5mm}
\textbf{x} =
\begin{bmatrix}
1 \\
2
\end{bmatrix}.
$$

</details>

### 示例：图像模糊与恢复

一张显示 SSN 编号的原始图像可以存储为一个二维实数数组，数组中的数在 \(0\) 和 \(1\) 之间：\(0\) 表示白色像素，\(1\) 表示黑色像素。假设图像有 \(40\) 行像素和 \(100\) 列像素。我们可以把这个二维数组展平成一个一维数组 \(\mathbf{x}\)，其维度为 \(4000\)。然后对数据 \(\mathbf{x}\) 应用模糊操作：

$$
\mathbf{y} = \mathbf{A}\mathbf{x},
$$

其中 \(\mathbf{A}\) 是模糊算子，\(\mathbf{y}\) 是模糊后的图像。

<div class="figure"> <img src="/math-lab/cs357-assets/figs/ssn_blur.png" width=800/> </div>

为了“撤销”模糊并恢复原始图像，我们用模糊算子 \(\mathbf{A}\) 和模糊图像 \(\mathbf{y}\) 来求解一个线性方程组。下图展示了 \(\mathbf{y}\) 没有噪声（“clean data”）时的恢复变换：

<div class="figure"> <img src="/math-lab/cs357-assets/figs/ssn_undo_blur.png" width=800/> </div>

在存在一定噪声的情况下，也有可能恢复 \(\mathbf{x}\)：

<div class="figure"> <img src="/math-lab/cs357-assets/figs/ssn_undo_blur_noise.png" width=800/> </div>

要回答“我们可以加入多少噪声而仍能恢复出有意义的原始信息？”以及“这个逆向变换会在什么时候失败？”，就需要理解本课程后面会讨论的“撤销”操作的敏感性。`,

  'lu-decomposition-back-substitution-algorithm-for-upper-triangular-systems': md`为了实际求解 \(\mathbf{Ax}=\mathbf{b}\)，可以先从一个“更容易”的方程组开始。考虑三角矩阵：**回代算法**求解线性系统 \(\mathbf{Ux}=\mathbf{b}\)，其中 \(\mathbf{U}\) 是上三角矩阵。

上三角线性系统 \(\mathbf{U}\mathbf{x}=\mathbf{b}\) 可以写成矩阵形式：

$$
\begin{bmatrix}
U_{11} & U_{12} & \ldots & U_{1n} \\
0 & U_{22} & \ldots & U_{2n} \\
\vdots & \vdots & \ddots & \vdots \\
0 & 0 & \ldots & U_{nn}
\end{bmatrix}
\begin{bmatrix}
x_1 \\ x_2 \\ \vdots \\ x_n
\end{bmatrix}
=
\begin{bmatrix}
b_1 \\ b_2 \\ \vdots \\ b_n
\end{bmatrix}.
$$

也可以把上三角系统 \(\mathbf{U}x=b\) 写成线性方程组：

$$
\begin{matrix}
U_{11} x_1 & + & U_{12} x_2 & + & \ldots & + & U_{1n} x_n & = & b_1 \\
           &   & U_{22} x_2 & + & \ldots & + & U_{2n} x_n & = & b_2 \\
           &   &            &   & \ddots &   & \vdots     & = & \vdots \\
           &   &            &   &        &   & U_{nn} x_n & = & b_n.
\end{matrix}
$$

回代从最底部往上求解：

$$
\begin{aligned}
x_n &= \frac{b_n}{U_{nn}} \\
x_{n-1} &= \frac{b_{n-1} - U_{n-1,n} x_n}{U_{n-1,n-1}} \\
&\vdots \\
x_1 &= \frac{b_1 - \sum_{j=2}^n U_{1j} x_j}{U_{11}}.
\end{aligned}
$$

因此通式为

$$
x_n = \frac{b_n}{U_{nn}};
\hspace{1cm}
x_i = \frac{b_i - \sum_{j=i+1}^n U_{ij} x_j}{U_{ii}}
\hspace{5mm}
\text{for } i=n-1,n-2,\ldots,1.
$$

注意，这个过程包含 \(n\) 次除法、\(\frac{n(n-1)}{2}\) 次减法/加法，以及 \(\frac{n(n-1)}{2}\) 次乘法，所以**计算复杂度**是 \(\mathbf{O(n^2)}\)。

另一种写法是把 \(\mathbf{U}x=b\) 写成 \(\mathbf{U}\) 的列向量线性组合：

$$
x_1 \hspace{1mm} \textbf{U}[:,1]
+ x_2 \hspace{1mm} \textbf{U}[:,2]
+ \ldots
+ x_n \hspace{1mm} \textbf{U}[:,n]
= \textbf{b}.
$$

回代算法的性质如下：

1. 如果任意对角元素 \(U_{ii}\) 为零，那么系统是奇异的，无法求解。
2. 如果 \(\mathbf{U}\) 的所有对角元素都非零，那么系统有唯一解。
3. 当 \(n\to\infty\) 时，回代算法的运算次数为 \(O(n^2)\)。

求解 \(\mathbf{Ux}=\mathbf{b}\) 的回代算法代码为：

~~~python
import numpy as np
def back_sub(U, b):
    """x = back_sub(U, b) 是 U x = b 的解
       U 必须是上三角矩阵
       b 必须是与 U 主维度相同的向量
    """
    n = U.shape[0]
    x = np.zeros(n)
    for i in range(n-1, -1, -1):
        tmp = b[i]
        for j in range(i+1, n):
            tmp -= U[i,j] * x[j]
        x[i] = tmp / U[i,i]
    return x
~~~

### 示例：上三角系统的回代

$$
\begin{bmatrix}
2 & 3 & 1 & 1 \\
0 & 2 & 2 & 3 \\
0 & 0 & 6 & 4 \\
0 & 0 & 0 & 2
\end{bmatrix}
\begin{bmatrix}
x_1 \\ x_2 \\ x_3 \\ x_4
\end{bmatrix}
=
\begin{bmatrix}
2 \\ 2 \\ 6 \\ 4
\end{bmatrix}.
$$

怎样求 \(x=[x_1,x_2,x_3,x_4]^T\)？

<details>
    <summary><strong>答案</strong></summary>

$$
2x_4 = 4 \Rightarrow x_4 = \frac{4}{2} = 2
$$

$$
6x_3 + 4x_4 = 6 \Rightarrow x_3 = \frac{6 - 4(2)}{6} = -\frac{1}{3}
$$

$$
2x_2 + 2x_3 + 3x_4 = 2
\Rightarrow
x_2 = \frac{2 - 2(-\frac{1}{3}) - 3(2)}{2} = -\frac{5}{3}
$$

$$
2x_1 + 3x_2 + x_3 + x_4 = 2
\Rightarrow
x_1 = \frac{2 - 3(-\frac{5}{3}) - (-\frac{1}{3}) - 2}{2} = \frac{8}{3}
$$

</details>`,

  'lu-decomposition-forward-substitution-algorithm-for-lower-triangular-systems': md`**前代算法**求解线性系统 \(\mathbf{Lx}=\mathbf{b}\)，其中 \(\mathbf{L}\) 是下三角矩阵。它可以看作回代算法的反向版本。

下三角线性系统 \(\mathbf{L}\mathbf{x}=\mathbf{b}\) 可以写成矩阵形式：

$$
\begin{bmatrix}
L_{11} & 0 & \ldots & 0 \\
L_{21} & L_{22} & \ldots & 0 \\
\vdots & \vdots & \ddots & 0 \\
L_{n1} & L_{n2} & \ldots & L_{nn}
\end{bmatrix}
\begin{bmatrix}
x_1 \\ x_2 \\ \vdots \\ x_n
\end{bmatrix}
=
\begin{bmatrix}
b_1 \\ b_2 \\ \vdots \\ b_n
\end{bmatrix}.
$$

也可以写成线性方程组：

$$
\begin{matrix}
L_{11} x_1 &   &               &   &        &   &               & = & b_1 \\
L_{21} x_1 & + & L_{22} x_2 &   &        &   &               & = & b_2 \\
\vdots     & + & \vdots     & + & \ddots &   &               & = & \vdots \\
L_{n1} x_1 & + & L_{n2} x_2 & + & \ldots & + & L_{nn} x_n & = & b_n.
\end{matrix}
$$

前代算法从最上面开始，依次求出每个变量。数学上写作

$$
\begin{aligned}
x_1 &= \frac{b_1}{L_{11}} \\
x_2 &= \frac{b_2 - L_{21} x_1}{L_{22}} \\
&\vdots \\
x_n &= \frac{b_n - \sum_{j=1}^{n-1} L_{nj} x_j}{L_{nn}}.
\end{aligned}
$$

通式为

$$
x_1 = \frac{b_1}{L_{11}};
\hspace{1cm}
x_i = \frac{b_i - \sum_{j=1}^{i-1} L_{ij} x_j}{L_{ii}}
\hspace{5mm}
\text{for } i=2,3,\ldots,n.
$$

同样，这里有 \(n\) 次除法、\(\frac{n(n-1)}{2}\) 次减法/加法，以及 \(\frac{n(n-1)}{2}\) 次乘法，所以**计算复杂度**也是 \(\mathbf{O(n^2)}\)。

前代算法的性质如下：

1. 如果任意对角元素 \(L_{ii}\) 为零，那么系统是奇异的，无法求解。
2. 如果 \(\mathbf{L}\) 的所有对角元素都非零，那么系统有唯一解。
3. 当 \(n\to\infty\) 时，前代算法的运算次数为 \(O(n^2)\)。

求解 \(\mathbf{Lx}=\mathbf{b}\) 的前代算法代码为：

~~~python
import numpy as np
def forward_sub(L, b):
    """x = forward_sub(L, b) 是 L x = b 的解
       L 必须是下三角矩阵
       b 必须是与 L 主维度相同的向量
    """
    n = L.shape[0]
    x = np.zeros(n)
    for i in range(n):
        tmp = b[i]
        for j in range(i):
            tmp -= L[i,j] * x[j]
        x[i] = tmp / L[i,i]
    return x
~~~

### 示例：下三角系统的前代

$$
\begin{bmatrix}
2 & 0 & 0 & 0 \\
3 & 2 & 0 & 0 \\
1 & 2 & 6 & 0 \\
1 & 3 & 4 & 2
\end{bmatrix}
\begin{bmatrix}
x_1 \\ x_2 \\ x_3 \\ x_4
\end{bmatrix}
=
\begin{bmatrix}
2 \\ 2 \\ 6 \\ 4
\end{bmatrix}.
$$

怎样求 \(x=[x_1,x_2,x_3,x_4]^T\)？

<details>
    <summary><strong>答案</strong></summary>

$$
2x_1 = 2 \Rightarrow x_1 = 1
$$

$$
3x_1 + 2x_2 = 2 \Rightarrow x_2 = \frac{2-3}{2} = -0.5
$$

$$
1x_1 + 2x_2 + 6x_3 = 6 \Rightarrow x_3 = \frac{6-1+1}{6} = 1
$$

$$
1x_1 + 3x_2 + 4x_3 + 2x_4 = 4
\Rightarrow
x_4 = \frac{4-1+1.5-4}{2} = 0.25
$$

</details>`,

  'lu-decomposition-lu-decomposition-definition': md`当 \(\mathbf{A}\) 不是三角矩阵时，为了求解 \(\mathbf{Ax}=\mathbf{b}\)，可以先做 LU 分解。给定一个 \(n\times n\) 矩阵 \(\mathbf{A}\)，矩阵 \(\mathbf{A}\) 的 **LU 分解**是一对矩阵 \(\mathbf{L}\) 和 \(\mathbf{U}\)，满足：

1. \(\mathbf{A}=\mathbf{LU}\)
2. \(\mathbf{L}\) 是下三角矩阵，并且所有对角元素都等于 \(1\)
3. \(\mathbf{U}\) 是上三角矩阵

$$
\begin{bmatrix}
1 & 0 & \ldots & 0 \\
L_{21} & 1 & \ldots & 0 \\
\vdots & \vdots & \ddots & \vdots \\
L_{n1} & L_{n2} & \ldots & 1
\end{bmatrix}
\begin{bmatrix}
u_{11} & U_{12} & \ldots & U_{1n} \\
0 & U_{22} & \ldots & U_{2n} \\
\vdots & \vdots & \ddots & \vdots \\
0 & 0 & \ldots & U_{nn}
\end{bmatrix}
=
\begin{bmatrix}
A_{11} & A_{12} & \ldots & A_{1n} \\
A_{21} & A_{22} & \ldots & A_{2n} \\
\vdots & \vdots & \ddots & \vdots \\
A_{n1} & A_{n2} & \ldots & A_{nn}
\end{bmatrix}.
$$

LU 分解的性质如下：

1. 矩阵 \(\mathbf{A}\) 的 LU 分解不一定存在。
2. 如果 LU 分解存在，那么它是唯一的。
3. LU 分解提供了一种高效求解线性方程组的方法。
4. \(\mathbf{L}\) 的所有对角元素设为 \(1\)，是为了让 LU 分解唯一。这个选择有一定任意性（也可以规定 \(\mathbf{U}\) 的对角线为 \(1\)），但单位下三角的 \(\mathbf{L}\) 是标准约定。
5. 术语 **decomposition** 和 **factorization** 在这里可以互换，意思都是把一个矩阵写成两个或更多矩阵的乘积，并且这些矩阵通常满足某些指定性质，例如下三角/上三角。

### 示例：LU 分解

考虑一个 \(3\times3\) 矩阵

$$
A =
\begin{bmatrix}
1 & 2 & 2 \\
4 & 4 & 2 \\
4 & 6 & 4
\end{bmatrix}.
$$

它的 LU 分解为

$$
\mathbf{A}=\mathbf{LU}=
\begin{bmatrix}
1 & 0 & 0 \\
4 & 1 & 0 \\
4 & 0.5 & 1
\end{bmatrix}
\begin{bmatrix}
1 & 2 & 2 \\
0 & -4 & -6 \\
0 & 0 & -1
\end{bmatrix}.
$$`,

  'lu-decomposition-solving-lu-decomposed-linear-systems': md`如果知道矩阵 \(\mathbf{A}\) 的 LU 分解，就可以把前代和回代结合起来求解线性系统 \(\mathbf{Ax}=\mathbf{b}\)。用方程写就是：

$$
\begin{aligned}
\mathbf{Ax} &= \mathbf{b} \\
\mathbf{LUx} &= \mathbf{b} \\
\mathbf{Ux} &= \mathbf{L}^{-1}\mathbf{b} \\
\mathbf{x} &= \mathbf{U}^{-1}(\mathbf{L}^{-1}\mathbf{b}).
\end{aligned}
$$

也就是说，我们先用前代计算 \(\mathbf{L}^{-1}\mathbf{b}\)，再用回代计算 \(\mathbf{x}=\mathbf{U}^{-1}(\mathbf{L}^{-1}\mathbf{b})\)。

等价地，可以引入一个新向量 \(\mathbf{y}\)，定义为 \(\mathbf{y}=\mathbf{Ux}\)。假设已知矩阵 \(\mathbf{A}\) 的 LU 分解，就可以把一般系统

$$
\mathbf{LUx=b}
$$

拆成两个三角系统：

$$
\mathbf{Ly=b}
\hspace{5mm}
{\xRightarrow{\text{Solve for } \mathbf{y}}}
\hspace{5mm}
\text{Forward substitution with complexity } O(n^2)
$$

$$
\mathbf{Ux=y}
\hspace{5mm}
{\xRightarrow{\text{Solve for } \mathbf{x}}}
\hspace{5mm}
\text{Back substitution with complexity } O(n^2)
$$

因此，我们把 \(\mathbf{Ax}=\mathbf{b}\) 替换成了**两个**线性系统：\(\mathbf{Ly}=\mathbf{b}\) 和 \(\mathbf{Ux}=\mathbf{y}\)。这两个线性系统可以依次用前代和回代求解。

LU 求解算法的运算次数为 \(O(n^2)\)，其中 \(n\to\infty\)。

求解线性系统 \(\mathbf{LUx}=\mathbf{b}\) 的 **LU solve algorithm** 代码为：

~~~python
import numpy as np
def lu_solve(L, U, b):
    """x = lu_solve(L, U, b) 是 L U x = b 的解
       L 必须是下三角矩阵
       U 必须是与 L 同样大小的上三角矩阵
       b 必须是与 L 主维度相同的向量
    """
    y = forward_sub(L, b)
    x = back_sub(U, y)
    return x
~~~`,

  'lu-decomposition-the-lu-decomposition-algorithm': md`给定矩阵 \(\mathbf{A}\)，可以用很多不同算法寻找 LU 分解中的 \(\mathbf{L}\) 和 \(\mathbf{U}\)。这里使用 **recursive leading-row-column LU algorithm**。先看最简单的 \(2\times2\) 矩阵：

<div class="figure"> <img src="/math-lab/cs357-assets/figs/lu_2x2.png" width=500/> </div>

当 \(\mathbf{A}\) 是 \(n\times n\) 矩阵时，也可以用类似思想把 \(\mathbf{A}\) 写成分块形式：

<div class="figure"> <img src="/math-lab/cs357-assets/figs/lu_nxn_block.png" width=300/> </div>

于是 \(\mathbf{A}=\mathbf{LU}\) 可以改写为

$$
\begin{aligned}
\begin{bmatrix}
a_{11} & \boldsymbol{a}_{12} \\
\boldsymbol{a}_{21} & \mathbf{A}_{22}
\end{bmatrix}
&=
\begin{bmatrix}
1 & \boldsymbol{0} \\
\boldsymbol{\ell}_{21} & \mathbf{L}_{22}
\end{bmatrix}
\begin{bmatrix}
u_{11} & \boldsymbol{u}_{12} \\
\boldsymbol{0} & \mathbf{U}_{22}
\end{bmatrix}
\\
&=
\begin{bmatrix}
u_{11} & \boldsymbol{u}_{12} \\
u_{11}\boldsymbol{\ell}_{21} &
(\boldsymbol{\ell}_{21}\boldsymbol{u}_{12}+\mathbf{L}_{22}\mathbf{U}_{22})
\end{bmatrix}.
\end{aligned}
$$

在上面的 \(n\times n\) 分块形式中，\(a_{11}\) 是标量，\(\boldsymbol{a}_{12}\) 是 \(1\times(n-1)\) 行向量，\(\boldsymbol{a}_{21}\) 是 \((n-1)\times1\) 列向量，\(\mathbf{A}_{22}\) 是 \((n-1)\times(n-1)\) 矩阵。

比较上面分块矩阵等式两边的元素，可以得到

$$
\begin{aligned}
a_{11} &= u_{11} \\
\boldsymbol{a}_{12} &= \boldsymbol{u}_{12} \\
\boldsymbol{a}_{21} &= u_{11}\boldsymbol{\ell}_{21} \\
A_{22} &= \boldsymbol{\ell}_{21}\boldsymbol{u}_{12}+\mathbf{L}_{22}\mathbf{U}_{22}.
\end{aligned}
$$

把这四个方程重排，就能求出 \(\mathbf{L}\) 和 \(\mathbf{U}\) 的组成部分：

$$
\begin{aligned}
u_{11} &= a_{11}\\
\boldsymbol{u}_{12} &= \boldsymbol{a}_{12} \\
\boldsymbol{\ell}_{21} &= \frac{1}{u_{11}}\boldsymbol{a}_{21} \\
\mathbf{L}_{22}\mathbf{U}_{22}
&=
\underbrace{
\mathbf{A}_{22}-\boldsymbol{a}_{21}(a_{11})^{-1}\boldsymbol{a}_{12}
}_{\text{Schur complement } S_{22}}.
\end{aligned}
$$

注意：

1. \(\mathbf{U}\) 的第一行就是 \(\mathbf{A}\) 的第一行。
2. \(\mathbf{L}\) 的第一列是 \(\frac{\text{the first column of  }\textbf{A}}{u_{11}}\)。
3. \(\mathbf{L}_{22}\mathbf{U}_{22}\) 还需要继续分解。

换句话说，前三个方程可以直接算出 \(\mathbf{L}\) 和 \(\mathbf{U}\) 的第一行与第一列。最后一个方程的右侧可以计算出来，它给出 \(\mathbf{A}\) 的 **Schur 补** \(S_{22}\)。于是我们得到方程 \(\mathbf{L}_{22}\mathbf{U}_{22}=\mathbf{S}_{22}\)，这又是一个 \((n-1)\times(n-1)\) 的 LU 分解问题，可以递归求解。

求 \(\mathbf{A}=\mathbf{LU}\) 中 \(\mathbf{L}\) 和 \(\mathbf{U}\) 的 **recursive leading-row-column LU algorithm** 代码为：

~~~python
import numpy as np
def lu_decomp(A):
    """(L, U) = lu_decomp(A) 是 A = L U 的 LU 分解
       A 是任意方阵
       L 是对角线上为 1 的下三角矩阵
       U 是上三角矩阵
    """
    n = A.shape[0]

    # 初始化 L 和 U；L 的对角线从 1 开始
    L = np.eye(n)
    U = np.zeros((n, n))

    for i in range(n):
        # 计算 U 矩阵（上三角）
        for j in range(i, n):
            U[i, j] = A[i, j] - np.dot(L[i, :i], U[:i, j])

        # 计算 L 矩阵（下三角）
        for j in range(i + 1, n):
            if U[i, i] == 0:
                raise ZeroDivisionError("遇到零主元，无法分解。")
            L[j, i] = (A[j, i] - np.dot(L[j, :i], U[:i, i])) / U[i, i]

    return L, U
~~~

除法次数：

$$
(n-1)+(n-2)+\ldots+1=\frac{n(n-1)}{2}.
$$

乘法次数：

$$
(n-1)^2+(n-2)^2+\ldots+1^2
=\frac{n^3}{3}-\frac{n^2}{2}+\frac{n}{6}.
$$

减法次数：

$$
(n-1)^2+(n-2)^2+\ldots+1^2
=\frac{n^3}{3}-\frac{n^2}{2}+\frac{n}{6}.
$$

因此，当 \(n\to\infty\) 时，recursive leading-row-column LU decomposition algorithm 的运算次数为 \(\mathbf{O(n^3)}\)。

### 示例：LU 分解

考虑矩阵

$$
\mathbf{A} =
\begin{bmatrix}
2 & 8 & 4 & 1 \\
1 & 2 & 3 & 3 \\
1 & 2 & 6 & 2 \\
1 & 3 & 4 & 2
\end{bmatrix}.
$$

怎样求这个矩阵的 LU 分解？

<details>
    <summary><strong>答案</strong></summary>

这里用 \(\mathbf{M}\) 记录还需要递归分解的矩阵，例如第一步中的 \(\mathbf{L}_{22}\mathbf{U}_{22}\)。

\(\mathbf{U}\) 的第一行是 \(\mathbf{A}\) 的第一行。

\(\mathbf{L}\) 的第一列是 \(\frac{\text{the first column of  }\textbf{A}}{u_{11}}\)。

并且由于

$$
\mathbf{L}_{22}\mathbf{U}_{22}
=
\mathbf{A}_{22}
-\boldsymbol{a}_{21}(a_{11})^{-1}\boldsymbol{a}_{12},
$$

第一步后得到如下结果。这里用张量积符号 \(\otimes\) 表示两个向量的外积：

$$
\textbf{L} =
\begin{bmatrix}
1 & 0 & 0 & 0 \\
\textbf{0.5} & 1 & 0 & 0 \\
\textbf{0.5} & ? & 1 & 0 \\
\textbf{0.5} & ? & ? & 1
\end{bmatrix}; \hspace{5mm}
\textbf{U} =
\begin{bmatrix}
2 & \textbf{8} & \textbf{4} & \textbf{1} \\
0 & ? & ? & ? \\
0 & 0 & ? & ? \\
0 & 0 & 0 & ?
\end{bmatrix}; \hspace{5mm}
\textbf{M} =
\begin{bmatrix}
2 & 3 & 3 \\
2 & 6 & 2 \\
3 & 4 & 2
\end{bmatrix}
-
\begin{bmatrix}
0.5 \\
0.5 \\
0.5
\end{bmatrix}
\otimes
\begin{bmatrix}
8 \\
4 \\
1
\end{bmatrix}
=
\begin{bmatrix}
-2 & 1 & 2.5 \\
-2 & 4 & 1.5 \\
-1 & 2 & 1.5
\end{bmatrix}.
$$

类似地，第二个递归步骤为

$$
\textbf{L} =
\begin{bmatrix}
1 & 0 & 0 & 0 \\
0.5 & 1 & 0 & 0 \\
0.5 & \textbf{1} & 1 & 0 \\
0.5 & \textbf{0.5} & ? & 1
\end{bmatrix}; \hspace{5mm}
\textbf{U} =
\begin{bmatrix}
2 & 8 & 4 & 1 \\
0 & -2 & \textbf{1} & \textbf{2.5} \\
0 & 0 & ? & ? \\
0 & 0 & 0 & ?
\end{bmatrix}; \hspace{5mm}
\textbf{M} =
\begin{bmatrix}
4 & 1.5 \\
2 & 1.5
\end{bmatrix}
-
\begin{bmatrix}
1 \\
0.5
\end{bmatrix}
\otimes
\begin{bmatrix}
1 \\
2.5
\end{bmatrix}
=
\begin{bmatrix}
3 & -1 \\
1.5 & 0.25
\end{bmatrix}.
$$

下一步为

$$
\textbf{L} =
\begin{bmatrix}
1 & 0 & 0 & 0 \\
0.5 & 1 & 0 & 0 \\
0.5 & 1 & 1 & 0 \\
0.5 & 0.5 & \textbf{0.5} & 1
\end{bmatrix}; \hspace{5mm}
\textbf{U} =
\begin{bmatrix}
2 & 8 & 4 & 1 \\
0 & -2 & 1 & 2.5 \\
0 & 0 & 3 & \textbf{-1} \\
0 & 0 & 0 & ?
\end{bmatrix}; \hspace{5mm}
\textbf{M} =
\begin{bmatrix}
0.25
\end{bmatrix}
-
\begin{bmatrix}
0.5
\end{bmatrix}
\otimes
\begin{bmatrix}
-1
\end{bmatrix}
=
\begin{bmatrix}
0.75
\end{bmatrix}.
$$

最终结果为

$$
\textbf{L} =
\begin{bmatrix}
1 & 0 & 0 & 0 \\
0.5 & 1 & 0 & 0 \\
0.5 & 1 & 1 & 0 \\
0.5 & 0.5 & 0.5 & 1
\end{bmatrix}; \hspace{5mm}
\textbf{U} =
\begin{bmatrix}
2 & 8 & 4 & 1 \\
0 & -2 & 1 & 2.5 \\
0 & 0 & 3 & -1 \\
0 & 0 & 0 & 0.75
\end{bmatrix}.
$$

</details>

### 示例：LU 分解失败的矩阵

下面这个矩阵没有 LU 分解：

$$
\mathbf{A} =
\begin{bmatrix}
2 & 8 & 4 & 1 \\
1 & 4 & 3 & 3 \\
1 & 2 & 6 & 2 \\
1 & 3 & 4 & 2
\end{bmatrix}.
$$

为什么？

<details>
    <summary><strong>答案</strong></summary>

LU 分解的第一步如下。这里用张量积符号 \(\otimes\) 表示两个向量的外积：

$$
\textbf{L} =
\begin{bmatrix}
1 & 0 & 0 & 0 \\
\textbf{0.5} & 1 & 0 & 0 \\
\textbf{0.5} & ? & 1 & 0 \\
\textbf{0.5} & ? & ? & 1
\end{bmatrix}; \hspace{5mm}
\textbf{U} =
\begin{bmatrix}
2 & 8 & 4 & 1 \\
0 & ? & ? & ? \\
0 & 0 & ? & ? \\
0 & 0 & 0 & ?
\end{bmatrix}; \hspace{5mm}
\mathbf{L}_{22}\mathbf{U}_{22} =
\begin{bmatrix}
4 & 3 & 3 \\
2 & 6 & 2 \\
3 & 4 & 2
\end{bmatrix}
-
\begin{bmatrix}
0.5 \\
0.5 \\
0.5
\end{bmatrix}
\otimes
\begin{bmatrix}
8 \\
4 \\
1
\end{bmatrix}
=
\begin{bmatrix}
\textbf{0} & 1 & 2.5 \\
-2 & 4 & 1.5 \\
-1 & 2 & 1.5
\end{bmatrix}.
$$

下一次更新下三角矩阵时会出现除以零。因此 LU 分解失败，\(\mathbf{A}\) 没有普通 LU 分解。

</details>`,

  'lu-decomposition-solving-linear-systems-using-lu-decomposition': md`把上面的几节合起来，就得到一个求解系统 \(\mathbf{Ax}=\mathbf{b}\) 的算法：先计算 \(\mathbf{A}\) 的 LU 分解，再用前代和回代求出 \(\mathbf{x}\)。

这个算法的性质如下：

1. 即使 \(\mathbf{A}\) 可逆，算法也可能失败。
2. 当 \(n\to\infty\) 时，算法的运算次数为 \(\mathcal{O}(n^3)\)。

**使用 LU 分解的线性求解器**代码为：

~~~python
import numpy as np
def linear_solve_without_pivoting(A, b):
    """x = linear_solve_without_pivoting(A, b) 是 A x = b 的解（不使用主元选取）
       A 是任意矩阵
       b 是与 A 主维度相同的向量
       x 是与 A 主维度相同的向量
    """
    (L, U) = lu_decomp(A)
    x = lu_solve(L, U, b)
    return x
~~~`,

  'lu-decomposition-pivoting': md`当矩阵 \(\mathbf{A}\) 的左上角元素为零，或者相对于其他元素非常小时，LU 分解可能失败。**主元选取**是一种缓解这个问题的策略：通过重排行和/或列，把较大的元素放到左上角位置。

主元选取算法有很多种。最常见的是 **full pivoting**、**partial pivoting** 和 **scaled partial pivoting**。这里我们只详细讨论 **partial pivoting**。

1. **Partial pivoting** 只重新排列 \(\mathbf{A}\) 的行，列保持不动。

<div class="figure"> <img src="/math-lab/cs357-assets/figs/partialPivoting.png" width=500/> </div>

2. **Full pivoting** 同时重新排列行和列。

<div class="figure"> <img src="/math-lab/cs357-assets/figs/fullPivoting.png" width=500/> </div>

3. **Scaled partial pivoting** 在不真正重排列的情况下近似 full pivoting。`,

  'lu-decomposition-lu-decomposition-with-partial-pivoting': md`一个 \(n\times n\) 矩阵 \(\mathbf{A}\) 的**带部分主元的 LU 分解（LUP）**是一组三个矩阵 \(\mathbf{L}\)、\(\mathbf{U}\)、\(\mathbf{P}\)，满足：

1. \(\mathbf{PA}=\mathbf{LU}\)
2. \(\mathbf{L}\) 是 \(n\times n\) 下三角矩阵，所有对角元素都等于 \(1\)
3. \(\mathbf{U}\) 是 \(n\times n\) 上三角矩阵
4. \(\mathbf{P}\) 是 \(n\times n\) 置换矩阵

LUP 分解的性质如下：

1. 置换矩阵 \(\mathbf{P}\) 的作用是重排 \(\mathbf{A}\) 的行。它试图把较大的元素放到 \(\mathbf{A}\) 以及递归子矩阵的左上角位置，避免除以很小或为零的元素。
2. 对任意矩阵 \(\mathbf{A}\)，LUP 分解总是存在。
3. 矩阵 \(\mathbf{A}\) 的 LUP 分解不唯一。
4. 相比不带主元选取的 LU 分解，LUP 分解提供了更稳健的线性系统求解方法，并且计算成本大致相同。

对任意矩阵 \(A\)，带部分主元的 LU 分解都可以完成：假设算法在第 \(k\) 阶段，当前第 \(k\) 列在对角线及其下方没有非零元素。这时已经没有其他可做的主元交换，算法会在 \(U\) 的对角线上留下一个零。注意，此时矩阵 \(U\) 是奇异的，矩阵 \(A\) 也是奇异的。后续使用 \(U\) 做回代会失败，但 LU 分解本身仍然完成了。`,

  'lu-decomposition-solving-lup-decomposition-linear-systems': md`已知矩阵 \(\mathbf{A}\) 的 LUP 分解后，可以先应用 \(\mathbf{P}\)，再使用 LU 求解器来求解线性系统 \(\mathbf{Ax}=\mathbf{b}\)。从方程

$$
\mathbf{Ax}=\mathbf{b}
$$

开始，两边同乘 \(\mathbf{P}\)，得到

$$
\begin{aligned}
\mathbf{Ax} &= \mathbf{b} \\
\mathbf{PAx} &= \mathbf{Pb} \\
\mathbf{LUx} &= \mathbf{Pb}.
\end{aligned}
$$

求解线性系统 \(\mathbf{LUx}=\mathbf{Pb}\) 的 **LUP solve algorithm** 代码为：

~~~python
import numpy as np
def lup_solve(L, U, P, b):
    """x = lup_solve(L, U, P, b) 是 L U x = P b 的解
       L 必须是下三角矩阵
       U 必须是与 L 形状相同的上三角矩阵
       P 必须是与 L 形状相同的置换矩阵
       b 必须是与 L 主维度相同的向量
    """
    z = np.dot(P, b)
    x = lu_solve(L, U, z)
    return x
~~~

当 \(n\to\infty\) 时，LUP solve algorithm 的运算次数为 \(\mathcal{O}(n^2)\)。`,

  'lu-decomposition-the-lup-decomposition-algorithm': md`就像 LU 分解有不同算法一样，寻找 LUP 分解也有不同算法。这里使用 **recursive leading-row-column LUP algorithm**。

这个算法是一种递归方法，用来寻找 \(\mathbf{L}\)、\(\mathbf{U}\) 和 \(\mathbf{P}\)，使得 \(\mathbf{PA}=\mathbf{LU}\)。步骤如下。

1. 首先选择 \(i\)，使得 \(\mathbf{A}\) 的第 \(i\) 行拥有绝对值最大的第一列元素。也就是说，对所有 \(j\)，有 \(\vert A_{i1}\vert\ge\vert A_{j1}\vert\)。令 \(\mathbf{P}_1\) 为把第 \(i\) 行移动到第一行、其余行保持原相对顺序的置换矩阵。可以显式写成

$$
\mathbf{P}_1 =
\begin{bmatrix}
0_{1(i-1)}     & 1 & 0_{1(n-i)} \\
I_{(i-1)(i-1)} & 0 & 0_{(i-1)(n-i)} \\
0_{(n-i)(i-1)} & 0 & I_{(n-i)(n-i)}
\end{bmatrix}
=
\begin{bmatrix}
0      & \ldots & 0      & 1      & 0      & \ldots & 0 \\
1      & \ldots & 0      & 0      & 0      & \ldots & 0 \\
\vdots & \ddots & \vdots & \vdots & \vdots & \ldots & 0 \\
0      & \ldots & 1      & 0      & 0      & \ldots & 0 \\
0      & \ldots & 0      & 0      & 1      & \ldots & 0 \\
\vdots & \ddots & \vdots & \vdots & \vdots & \ldots & 0 \\
0      & \ldots & 0      & 0      & 0      & \ldots & 1
\end{bmatrix}.
$$

2. 用 \(\bar{\mathbf{A}}\) 表示已经选主元后的 \(\mathbf{A}\)，即 \(\bar{\mathbf{A}}=\mathbf{P}_1\mathbf{A}\)。

3. 令 \(\mathbf{P}_2\) 为一个置换矩阵，它保持第一行不动，但会置换其他所有行。可以写成

$$
\mathbf{P}_2 =
\begin{bmatrix}
1              & \boldsymbol{0} \\
\boldsymbol{0} & P_{22}
\end{bmatrix},
$$

其中 \(\mathbf{P}_{22}\) 是 \((n-1)\times(n-1)\) 的置换矩阵。

4. 把未知的完整置换矩阵 \(\mathbf{P}\) 分解为 \(\mathbf{P}_2\) 和 \(\mathbf{P}_1\) 的乘积，即 \(\mathbf{P}=\mathbf{P}_2\mathbf{P}_1\)。于是

$$
\mathbf{P}A=\mathbf{P}_2\mathbf{P}_1A=\mathbf{P}_2\bar{\mathbf{A}},
$$

这表示先把 \(\mathbf{A}\) 的第 \(i\) 行移到最上面，再置换剩余行。这是一个完全一般的置换矩阵 \(\mathbf{P}\)，而这种分解是递归算法能够成立的关键。

5. 使用分解 \(\mathbf{P}=\mathbf{P}_2\mathbf{P}_1\)，把 LUP 分解写成分块形式：

$$
\begin{aligned}
\mathbf{PA} &= \mathbf{LU} \\
\mathbf{P_2}\bar{\mathbf{A}} &= \mathbf{LU} \\
\begin{bmatrix}
1              & \boldsymbol{0} \\
\boldsymbol{0} & \mathbf{P}_{22}
\end{bmatrix}
\begin{bmatrix}
\bar{a}_{11} & \bar{\boldsymbol{a}}_{12} \\
\bar{\boldsymbol{a}}_{21} & \bar{\mathbf{A}}_{22}
\end{bmatrix}
&=
\begin{bmatrix}
1 & \boldsymbol{0} \\
\boldsymbol{\ell}_{21} & \mathbf{L}_{22}
\end{bmatrix}
\begin{bmatrix}
u_{11} & \boldsymbol{u}_{12} \\
\boldsymbol{0} & \mathbf{U}_{22}
\end{bmatrix}
\\
\begin{bmatrix}
\bar{a}_{11} & \bar{\boldsymbol{a}}_{12} \\
\mathbf{P}_{22}\bar{\boldsymbol{a}}_{21} & \mathbf{P}_{22}\bar{\mathbf{A}}_{22}
\end{bmatrix}
&=
\begin{bmatrix}
u_{11} & \boldsymbol{u}_{12} \\
u_{11}\boldsymbol{\ell}_{21} &
(\boldsymbol{\ell}_{21}\boldsymbol{u}_{12}+\mathbf{L}_{22}\mathbf{U}_{22})
\end{bmatrix}.
\end{aligned}
$$

6. 比较上面矩阵中的对应元素，得到

$$
\begin{aligned}
\bar{a}_{11} &= u_{11} \\
\bar{\boldsymbol{a}}_{12} &= \boldsymbol{u}_{12} \\
\mathbf{P}_{22}\bar{\boldsymbol{a}}_{21} &= u_{11}\boldsymbol{\ell}_{21} \\
\mathbf{P}_{22}\bar{A}_{22}
&=
\boldsymbol{\ell}_{21}\boldsymbol{u}_{12}
+\mathbf{L}_{22}\mathbf{U}_{22}.
\end{aligned}
$$

7. 把前三个方程代入最后一个方程并整理，得到

$$
\mathbf{P}_{22}
\underbrace{
\Bigl(\bar{A}_{22}
-\bar{\boldsymbol{a}}_{21}(\bar{a}_{11})^{-1}\bar{\boldsymbol{a}}_{12}\Bigr)
}_{\text{Schur complement } \mathbf{S}_{22}}
=
\mathbf{L}_{22}\mathbf{U}_{22}.
$$

8. 对 \(S_{22}\) 递归求 LUP 分解，得到 \(\mathbf{L}_{22}\)、\(\mathbf{U}_{22}\) 和 \(\mathbf{P}_{22}\)，它们满足上面的方程。

9. 利用上面的方程求出 \(\mathbf{L}\) 和 \(\mathbf{U}\) 的第一行和第一列：

$$
\begin{aligned}
u_{11} &= \bar{a}_{11} \\
\boldsymbol{u}_{12} &= \bar{\boldsymbol{a}}_{12} \\
\boldsymbol{\ell}_{21}
&=
\frac{1}{\bar{a}_{11}}\mathbf{P}_{22}\bar{\boldsymbol{a}}_{21}.
\end{aligned}
$$

10. 最后根据这些组成部分重建完整矩阵 \(\mathbf{L}\)、\(\mathbf{U}\) 和 \(\mathbf{P}\)。

在代码中，寻找带部分主元的 LU 分解的 **recursive leading-row-column LUP algorithm** 为：

~~~python
import numpy as np
def lup_decomp(A):
    """(L, U, P) = lup_decomp(A) 是满足 P A = L U 的 LUP 分解
       A 是任意矩阵
       L 是与 A 形状相同、对角线上为 1 的下三角矩阵
       U 是与 A 形状相同的上三角矩阵
       P 是与 A 形状相同的置换矩阵
    """
    n = A.shape[0]
    if n == 1:
        L = np.array([[1]])
        U = A.copy()
        P = np.array([[1]])
        return (L, U, P)

    i = np.argmax(A[:,0])
    A_bar = np.vstack([A[i,:], A[:i,:], A[(i+1):,:]])

    A_bar11 = A_bar[0,0]
    A_bar12 = A_bar[0,1:]
    A_bar21 = A_bar[1:,0]
    A_bar22 = A_bar[1:,1:]

    S22 = A_bar22 - np.dot(A_bar21, A_bar12) / A_bar11

    (L22, U22, P22) = lup_decomp(S22)

    L11 = 1
    U11 = A_bar11

    L12 = np.zeros(n-1)
    U12 = A_bar12.copy()

    L21 = np.dot(P22, A_bar21) / A_bar11
    U21 = np.zeros(n-1)

    L = np.block([[L11, L12], [L21, L22]])
    U = np.block([[U11, U12], [U21, U22]])
    P = np.block([
        [np.zeros((1, i-1)), 1,                  np.zeros((1, n-i))],
        [P22[:,:(i-1)],      np.zeros((n-1, 1)), P22[:,i:]]
    ])
    return (L, U, P)
~~~

recursive leading-row-column LUP decomposition algorithm 的性质如下：

1. 当 \(n\to\infty\) 时，算法的计算复杂度（运算次数）为 \(\mathcal{O}(n^3)\)。
2. 代码最后计算 \(\mathbf{P}\) 的步骤并不是通过构造并相乘 \(\mathbf{P}_2\) 和 \(\mathbf{P}_1\) 完成的。因为那样会是一个 \(\mathcal{O}(n^3)\) 步骤，使整个算法变成 \(\mathcal{O}(n^4)\)。相反，代码利用 \(\mathbf{P}_2\) 和 \(\mathbf{P}_1\) 的特殊结构，用 \(\mathcal{O}(n^2)\) 的工作量计算 \(\mathbf{P}\)。`,

  'lu-decomposition-solving-general-linear-systems-using-lup-decomposition': md`和普通 LU 分解一样，我们也可以用 LUP 分解求解线性系统 \(\mathbf{Ax}=\mathbf{b}\)。这就是 **linear solver using LUP decomposition** 算法。

这个算法的性质如下：

1. 算法可能失败。特别是当 \(\mathbf{A}\) 是奇异的（或在有限精度下表现为奇异）时，\(U\) 的对角线上会出现零。
2. LU 分解需要 \(\mathcal{O}(n^3)\) 次操作，而求解 \(Ly=b\) 和 \(Ux=y\) 都需要 \(\mathcal{O}(n^2)\) 次操作，因此整个算法的总操作次数为 \(\mathbf{\mathcal{O}(n^3)}\)，其中 \(n\to\infty\)。
3. 我们把分解步骤和真正的求解步骤分离开。这样在工程应用中，如果需要用同一个矩阵求解多个线性系统，就有可能复用同一次 LU 分解。

**使用 LUP 分解的线性求解器**代码为：

~~~python
import numpy as np
def linear_solve(A, b):
    """x = linear_solve(A, b) 是 A x = b 的解（使用部分主元）
       A 是任意矩阵
       b 是与 A 主维度相同的向量
       x 是与 A 主维度相同的向量
    """
    (L, U, P) = lup_decomp(A)
    x = lup_solve(L, U, P, b)
    return x
~~~

### 示例：LUP 分解

考虑矩阵

$$
\mathbf{A} =
\begin{bmatrix}
2 & 1 & 1 & 0 \\
4 & 3 & 3 & 1 \\
8 & 7 & 9 & 5 \\
6 & 7 & 9 & 8
\end{bmatrix}.
$$

怎样求这个矩阵的 LUP 分解？

<details>
    <summary><strong>答案</strong></summary>

这里用 \(\overline{\mathbf{M}}\) 记录还需要递归分解的矩阵，例如第一步中的 \(\mathbf{L}_{22}\mathbf{U}_{22}\)。张量积符号 \(\otimes\) 表示两个向量的外积。

第一步：

$$
\mathbf{P\overline{M}} =
\begin{bmatrix}
0 & 0 & 1 & 0 \\
0 & 1 & 0 & 0 \\
1 & 0 & 0 & 0 \\
0 & 0 & 0 & 1
\end{bmatrix}
\begin{bmatrix}
2 & 1 & 1 & 0 \\
4 & 3 & 3 & 1 \\
8 & 7 & 9 & 5 \\
6 & 7 & 9 & 8
\end{bmatrix}
=
\begin{bmatrix}
8 & 7 & 9 & 5 \\
4 & 3 & 3 & 1 \\
2 & 1 & 0 & 0 \\
6 & 7 & 9 & 8
\end{bmatrix}.
$$

$$
\textbf{L} =
\begin{bmatrix}
1 & 0 & 0 & 0 \\
\textbf{0.5} & 1 & 0 & 0 \\
\textbf{0.25} & ? & 1 & 0 \\
\textbf{0.75} & ? & ? & 1
\end{bmatrix}; \hspace{5mm}
\textbf{U} =
\begin{bmatrix}
8 & \textbf{7} & \textbf{9} & \textbf{5} \\
0 & ? & ? & ? \\
0 & 0 & ? & ? \\
0 & 0 & 0 & ?
\end{bmatrix}; \hspace{5mm}
\overline{\mathbf{M}} =
\begin{bmatrix}
3 & 3 & 1 \\
1 & 0 & 0 \\
7 & 9 & 8
\end{bmatrix}
-
\begin{bmatrix}
0.5 \\
0.25 \\
0.75
\end{bmatrix}
\otimes
\begin{bmatrix}
7 \\
9 \\
5
\end{bmatrix}
=
\begin{bmatrix}
-0.5 & -1.5 & -1.5 \\
-0.75 & -1.25 & -1.25 \\
1.75 & 2.25 & 4.25
\end{bmatrix}.
$$

类似地，第二个递归步骤为

$$
\mathbf{P\overline{M}} =
\begin{bmatrix}
0 & 0 & 1 \\
0 & 1 & 0 \\
1 & 0 & 0
\end{bmatrix}
\begin{bmatrix}
-0.5 & -1.5 & -1.5 \\
-0.75 & -1.25 & -1.25 \\
1.75 & 2.25 & 4.25
\end{bmatrix}
=
\begin{bmatrix}
1.75 & 2.25 & 4.25 \\
-0.75 & -1.25 & -1.25 \\
-0.5 & -1.5 & -1.5
\end{bmatrix}.
$$

$$
\textbf{L} =
\begin{bmatrix}
1 & 0 & 0 & 0 \\
\textbf{0.75} & 1 & 0 & 0 \\
0.25 & \textbf{-0.428} & 1 & 0 \\
\textbf{0.5} & \textbf{-0.285} & ? & 1
\end{bmatrix}; \hspace{5mm}
\textbf{U} =
\begin{bmatrix}
8 & 7 & 9 & 5 \\
0 & \textbf{1.75} & \textbf{2.25} & \textbf{4.25} \\
0 & 0 & ? & ? \\
0 & 0 & 0 & ?
\end{bmatrix}.
$$

$$
\overline{\mathbf{M}} =
\begin{bmatrix}
-1.25 & -1.25 \\
-1.5 & -1.5
\end{bmatrix}
-
\begin{bmatrix}
-0.428 \\
-0.285
\end{bmatrix}
\otimes
\begin{bmatrix}
2.25 \\
4.25
\end{bmatrix}
=
\begin{bmatrix}
-0.287 & 0.569 \\
-0.8587 & -0.2887
\end{bmatrix}.
$$

下一步为

$$
\mathbf{P\overline{M}} =
\begin{bmatrix}
0 & 1 \\
1 & 0
\end{bmatrix}
\begin{bmatrix}
-0.287 & 0.569 \\
-0.8587 & -0.2887
\end{bmatrix}
=
\begin{bmatrix}
-0.8587 & -0.2887 \\
-0.287 & 0.569
\end{bmatrix}.
$$

$$
\textbf{L} =
\begin{bmatrix}
1 & 0 & 0 & 0 \\
0.75 & 1 & 0 & 0 \\
\textbf{0.5} & \textbf{-0.285} & 1 & 0 \\
\textbf{0.25} & \textbf{-0.428} & \textbf{0.334} & 1
\end{bmatrix}; \hspace{5mm}
\textbf{U} =
\begin{bmatrix}
8 & 7 & 9 & 5 \\
0 & 1.75 & 2.25 & 4.25 \\
0 & 0 & \textbf{-0.86} & \textbf{-0.29} \\
0 & 0 & 0 & ?
\end{bmatrix}; \hspace{5mm}
\overline{\mathbf{M}} =
\begin{bmatrix}
0.569
\end{bmatrix}
-
\begin{bmatrix}
0.334
\end{bmatrix}
\otimes
\begin{bmatrix}
-0.29
\end{bmatrix}
=
\begin{bmatrix}
0.67
\end{bmatrix}.
$$

最终结果为

$$
\textbf{L} =
\begin{bmatrix}
1 & 0 & 0 & 0 \\
0.75 & 1 & 0 & 0 \\
0.5 & -0.285 & 1 & 0 \\
0.25 & -0.428 & 0.334 & 1
\end{bmatrix}; \hspace{5mm}
\textbf{U} =
\begin{bmatrix}
8 & 7 & 9 & 5 \\
0 & 1.75 & 2.25 & 4.25 \\
0 & 0 & -0.86 & -0.29 \\
0 & 0 & 0 & 0.67
\end{bmatrix}; \hspace{5mm}
\textbf{P} =
\begin{bmatrix}
0 & 0 & 1 & 0 \\
0 & 0 & 0 & 1 \\
0 & 1 & 0 & 0 \\
1 & 0 & 0 & 0
\end{bmatrix}.
$$

</details>

### 示例：LUP 分解成功但 LU 分解失败的矩阵

考虑一个没有 LU 分解的矩阵：

$$
\mathbf{A} =
\begin{bmatrix}
0 & 1 \\
2 & 1
\end{bmatrix}.
$$

怎样求它的 LUP 分解？

<details>
    <summary><strong>答案</strong></summary>

要求 \(\mathbf{A}\) 的 LUP 分解，先写出置换矩阵 \(\mathbf{P}\)，把第二行移到最上面，使左上角元素有尽可能大的绝对值。于是

$$
\overbrace{\begin{bmatrix}
0 & 1 \\
1 & 0
\end{bmatrix}}^{P}
\overbrace{\begin{bmatrix}
0 & 1 \\
2 & 1
\end{bmatrix}}^{A}
=
\overbrace{\begin{bmatrix}
2 & 1 \\
0 & 1
\end{bmatrix}}^{\bar{A}}
=
\overbrace{\begin{bmatrix}
1 & 0 \\
0 & 1
\end{bmatrix}}^{L}
\overbrace{\begin{bmatrix}
2 & 1 \\
0 & 1
\end{bmatrix}}^{U}.
$$

</details>`,

  'lu-decomposition-review-questions': md`1. 给定分解 \(\mathbf{PA}=\mathbf{LU}\)，怎样求解系统 \(\mathbf{A}\mathbf{x}=\mathbf{b}\)？
2. 理解求解三角系统的过程，并求解一个三角系统例子。
3. 识别并理解实现前代、回代和 LU 分解的 Python 代码。
4. LU 分解什么时候存在？
5. LUP 分解什么时候存在？
6. \(\mathbf{P}\)、\(\mathbf{L}\) 和 \(\mathbf{U}\) 分别有什么特殊性质？
7. 能否为奇异矩阵找到 LUP 分解？
8. 如果用奇异矩阵 \(\mathbf{A}\) 求解系统 \(\mathbf{A}\mathbf{x}=\mathbf{b}\)，会发生什么？
9. 手工计算一个小矩阵的 LU 分解。
10. 求解线性系统时，为什么要使用主元选取？
11. 怎样选择主元元素？
12. 一个给定的置换矩阵乘到另一个矩阵上时，会产生什么影响？
13. 矩阵-矩阵乘法的成本是多少？
14. 计算 LU 或 LUP 分解的成本是多少？
15. 前代或回代的成本是多少？
16. 对一般矩阵求解 \(\mathbf{A}\mathbf{x}=\mathbf{b}\) 的成本是多少？
17. 对三角矩阵求解 \(\mathbf{A}\mathbf{x}=\mathbf{b}\) 的成本是多少？
18. 对同一个矩阵 \(\mathbf{A}\) 和多个右端项向量 \(\mathbf{b}_i\)，求解 \(\mathbf{A}\mathbf{x}=\mathbf{b}_i\) 的成本是多少？
19. 给定一个耗时 \(\mathcal{O}(n^k)\) 的过程，如果把输入规模加倍（即把 \(n\) 加倍），运行时间会怎样变化？如果把输入规模变成三倍呢？`,
}
