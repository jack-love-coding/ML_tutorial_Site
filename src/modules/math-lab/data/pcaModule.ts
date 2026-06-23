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
      '参考用方向、投影和坐标变化解释 PCA 的视觉直觉。',
      'Reference for visual intuition around directions, projections, and coordinate changes in PCA.',
    ),
  },
  d2lLinearAlgebra: {
    label: copy('Dive into Deep Learning：线性代数', 'Dive into Deep Learning: Linear Algebra'),
    href: 'https://d2l.ai/chapter_preliminaries/linear-algebra.html',
    usage: copy(
      '参考机器学习预备知识中矩阵、范数和降维相关表达。',
      'Reference for matrix, norm, and dimensionality-reduction notation in machine-learning preliminaries.',
    ),
  },
  mml: {
    label: copy('Mathematics for Machine Learning', 'Mathematics for Machine Learning'),
    href: 'https://mml-book.github.io/',
    usage: copy(
      '参考 PCA、SVD 和高维数据表示之间的机器学习联系。',
      'Reference for links among PCA, SVD, and high-dimensional data representation in machine learning.',
    ),
  },
} satisfies Record<string, SourceReference>

const sections: MathLabSection[] = [
  section(
    'pca-learning-objectives',
    copy('学习目标', 'Learning Objectives'),
    copy(
      md`读完这一章后，你应该能把“高维数据能不能用更少坐标表示”转化成清楚的线性代数步骤。主线是：先中心化数据，再用协方差矩阵或 SVD 找到方差最大的正交方向，最后只保留前 \(k\) 个方向做投影。

你需要掌握：

- 说明 PCA 为什么要把每个特征列减去均值，并把中心化后的数据记为 \(X\)。
- 写出协方差矩阵 \(\operatorname{Cov}(X)=\frac{1}{m-1}X^TX\)，并解释对角线、迹和总方差。
- 用协方差矩阵的特征向量解释主方向，用特征值或奇异值解释每个方向保留的方差。
- 区分直接删除原始特征和用线性组合生成新特征 \(F_i^*\) 的差别。
- 用 SVD 写出 \(X=U\Sigma V^T\)、投影 \(Z=XV_k\)，以及解释方差比例。
- 说清 PCA 的收益和代价：压缩、去噪、可视化更方便，但新坐标轴可能失去原始特征语义。
- 避免把 PCA 当成分类器；它只看无标签数据的方差结构。`,
      md`By the end of this chapter, you should be able to turn "can high-dimensional data be represented with fewer coordinates?" into precise linear-algebra steps. The thread is: center the data, use a covariance matrix or the SVD to find orthogonal maximum-variance directions, then keep only the first \(k\) directions for projection.

You should be able to:

- Explain why PCA subtracts the mean from every feature column and writes the centered data as \(X\).
- Write the covariance matrix \(\operatorname{Cov}(X)=\frac{1}{m-1}X^TX\), and interpret the diagonal, trace, and total variance.
- Interpret covariance eigenvectors as principal directions, and eigenvalues or singular values as variance retained by each direction.
- Distinguish directly dropping original features from creating new features \(F_i^*\) as linear combinations.
- Use the SVD form \(X=U\Sigma V^T\), the projection \(Z=XV_k\), and explained-variance ratios.
- State the benefits and costs of PCA: compression, denoising, and visualization become easier, but new axes may lose original feature meaning.
- Avoid treating PCA as a classifier; it only sees variance structure in unlabeled data.`,
    ),
  ),
  section(
    'pca-what-problem-it-solves',
    copy('从删除特征到重新造坐标轴', 'From Dropping Features to Rebuilding Axes'),
    copy(
      md`PCA（Principal Component Analysis，主成分分析）解决的不是“给数据贴标签”，而是“用更少的坐标保留尽可能多的数据变化”。形式上，它寻找一个正交线性变换，把数据转到新的坐标系中，使第一坐标方向上的投影方差最大，第二坐标方向在与第一方向正交的约束下方差次大，依此类推。

设有 \(m\) 个样本、\(30\) 个细胞特征，数据矩阵可以写成

$$
A=
\begin{bmatrix}
\vdots&\vdots&\vdots\\
F_1&\cdots&F_{30}\\
\vdots&\vdots&\vdots
\end{bmatrix}.
$$

如果很多特征高度相关，最直接的降维办法是删列，例如只保留前 \(10\) 个原始特征：

$$
A^*=
\begin{bmatrix}
\vdots&\vdots&\vdots\\
F_1&\cdots&F_{10}\\
\vdots&\vdots&\vdots
\end{bmatrix}.
$$

这个做法的好处是语义清楚：\(F_1\) 仍是原来的 \(F_1\)。坏处也很明显：被删掉的 \(20\) 列信息完全丢失。

PCA 换一种思路。它不挑几个原始列，而是构造新的特征

$$
F_j^*=\sum_{i=1}^{n}a_{ij}F_i,
$$

让这些新特征彼此正交，且按方差从大到小排列。这样可以只保留 \(F_1^*,F_2^*,\ldots,F_k^*\)，仍然利用所有原始列的信息。代价是：新坐标通常是许多原始特征的线性组合，不再像“细胞半径”“纹理强度”那样容易解释。`,
      md`PCA, or Principal Component Analysis, does not assign labels to data. It asks: "Can fewer coordinates keep as much variation as possible?" Formally, it finds an orthogonal linear transformation to a new coordinate system so that the first coordinate has the greatest projection variance, the second coordinate has the next greatest variance subject to being orthogonal to the first, and so on.

Suppose we have \(m\) samples and \(30\) cell features. The data matrix can be written

$$
A=
\begin{bmatrix}
\vdots&\vdots&\vdots\\
F_1&\cdots&F_{30}\\
\vdots&\vdots&\vdots
\end{bmatrix}.
$$

If many features are highly correlated, the most direct dimensionality reduction is to drop columns, for example keeping only the first \(10\) original features:

$$
A^*=
\begin{bmatrix}
\vdots&\vdots&\vdots\\
F_1&\cdots&F_{10}\\
\vdots&\vdots&\vdots
\end{bmatrix}.
$$

That approach keeps semantics clear: \(F_1\) is still the original \(F_1\). The weakness is equally clear: information in the \(20\) dropped columns is gone.

PCA takes a different route. It builds new features

$$
F_j^*=\sum_{i=1}^{n}a_{ij}F_i,
$$

so that these new features are mutually orthogonal and ordered by decreasing variance. We can then keep \(F_1^*,F_2^*,\ldots,F_k^*\) while still using information from all original columns. The cost is interpretability: a new coordinate is usually a linear combination of many original features, no longer as easy to name as "cell radius" or "texture intensity."`,
    ),
  ),
  section(
    'pca-centering-and-covariance',
    copy('中心化与协方差矩阵', 'Centering and the Covariance Matrix'),
    copy(
      md`PCA 的第一步是中心化数据。对数据矩阵 \(A\) 的每个特征列 \(F_i\)，计算均值 \(\bar F_i\)，再从该列所有条目中减去它。中心化后的矩阵记为 \(X\)，每一列均值为 \(0\)。

这一步不是形式主义。若不中心化，PCA 会把“数据云离原点有多远”混进“数据云自己往哪个方向展开”。PCA 要找的是相对于数据平均位置的变化方向。

二维例子中，六个点是

$$
p_0=(8.6,18.0),\quad p_1=(3.4,20.6),\quad p_2=(4.6,19.7),
$$

$$
p_3=(3.4,11.4),\quad p_4=(5.4,20.3),\quad p_5=(2.2,12.4).
$$

它们的平均点约为

$$
\bar p=(4.6,17.1).
$$

中心化就是把每个点改写为 \(p_i-\bar p\)，让新点云围绕原点展开。

![中心化前后的二维点云](/math-lab/cs357-assets/figs/pca_center_combined.png)

若 \(X\) 是 \(m\times n\) 的中心化数据矩阵，样本在行、特征在列，则协方差矩阵定义为

$$
\operatorname{Cov}(X)=\frac{1}{m-1}X^TX.
$$

它的含义可以分层读：

| 量 | 解释 |
| --- | --- |
| 对角线 \(a_{ii}\) | 第 \(i\) 个特征自身的方差 |
| 非对角线 \(a_{ij}\) | 特征 \(i\) 与特征 \(j\) 的共同变化方向 |
| \(\operatorname{trace}(\operatorname{Cov}(X))\) | 所有特征方差之和，也叫总方差 |
| \(a_{ii}/\operatorname{trace}\) | 单个原始特征解释的总方差比例 |

原始特征高度相关时，协方差矩阵会有较大的非对角线项。PCA 的目标是转到一个新坐标系，在那里协方差矩阵变成对角形：新坐标之间没有协方差，且方差从大到小排列。`,
      md`The first PCA step is centering. For each feature column \(F_i\) of the data matrix \(A\), compute its mean \(\bar F_i\) and subtract that mean from every entry in the column. The centered matrix is written \(X\), and every feature column has mean \(0\).

This is not cosmetic. Without centering, PCA mixes "how far the cloud is from the origin" with "which directions the cloud varies along." PCA should find variation around the data's average position.

In a two-dimensional example, the six points are

$$
p_0=(8.6,18.0),\quad p_1=(3.4,20.6),\quad p_2=(4.6,19.7),
$$

$$
p_3=(3.4,11.4),\quad p_4=(5.4,20.3),\quad p_5=(2.2,12.4).
$$

Their mean point is approximately

$$
\bar p=(4.6,17.1).
$$

Centering rewrites every point as \(p_i-\bar p\), so the new cloud spreads around the origin.

![Centered and uncentered two-dimensional point cloud](/math-lab/cs357-assets/figs/pca_center_combined.png)

If \(X\) is an \(m\times n\) centered data matrix with samples in rows and features in columns, the covariance matrix is

$$
\operatorname{Cov}(X)=\frac{1}{m-1}X^TX.
$$

Read it in layers:

| Quantity | Meaning |
| --- | --- |
| Diagonal \(a_{ii}\) | Variance of feature \(i\) with itself |
| Off-diagonal \(a_{ij}\) | Joint variation between features \(i\) and \(j\) |
| \(\operatorname{trace}(\operatorname{Cov}(X))\) | Sum of all feature variances, or total variance |
| \(a_{ii}/\operatorname{trace}\) | Fraction of total variance explained by one original feature |

When original features are strongly correlated, the covariance matrix has large off-diagonal entries. PCA aims to rotate into a new coordinate system where the covariance matrix becomes diagonal: new coordinates have zero covariance and are ordered by decreasing variance.`,
    ),
    { visualIds: ['pca-centering-projection-video'] },
  ),
  section(
    'pca-diagonalization-and-projection',
    copy('从协方差对角化到主方向投影', 'From Covariance Diagonalization to Principal Projections'),
    copy(
      md`因为 \(\operatorname{Cov}(X)\) 是对称矩阵，它可以用正交特征向量对角化。写作

$$
\operatorname{Cov}(X)=\frac{1}{m-1}X^TX
=\frac{1}{m-1}VDV^T.
$$

这里 \(V\) 的列是 \(X^TX\) 的正交特征向量，也是数据的主方向；\(D\) 的对角线条目按从大到小排列。最大的特征值对应最大方差，关联的特征向量就是第一主方向。

如果只保留前 \(k\) 个方向，把它们组成 \(V_k\)，则 PCA 降维投影为

$$
Z=XV_k.
$$

此时 \(Z\) 是 \(m\times k\) 的新数据矩阵。第 \(j\) 列 \(Z_j\) 是每个样本沿第 \(j\) 个主方向的坐标。若要回到原始特征空间中的近似点，可以写

$$
\hat X=ZV_k^T=XV_kV_k^T.
$$

保留方向越多，重建误差越小；但维度和存储也越大。下面的实验台把这个取舍可视化：蓝点是中心化后的数据，橙点是只保留前 \(k\) 个主方向后重建的位置，红色虚线段就是丢掉的正交残差。整体平移滑块会改变被减去的均值，但中心化后的主方向保持不变。`,
      md`Because \(\operatorname{Cov}(X)\) is symmetric, it can be diagonalized with orthogonal eigenvectors:

$$
\operatorname{Cov}(X)=\frac{1}{m-1}X^TX
=\frac{1}{m-1}VDV^T.
$$

The columns of \(V\) are orthogonal eigenvectors of \(X^TX\), also called principal directions. The diagonal entries of \(D\) are ordered from large to small. The largest eigenvalue corresponds to the largest variance, and its eigenvector is the first principal direction.

If we keep only the first \(k\) directions and place them in \(V_k\), the PCA projection is

$$
Z=XV_k.
$$

Now \(Z\) is an \(m\times k\) transformed data matrix. Column \(Z_j\) contains each sample's coordinate along principal direction \(j\). To reconstruct an approximation in the original feature space, write

$$
\hat X=ZV_k^T=XV_kV_k^T.
$$

Keeping more directions reduces reconstruction error, but increases dimension and storage. The lab below makes this tradeoff visible: blue points are centered data, orange points are reconstructions after keeping the first \(k\) directions, and red dashed segments are discarded orthogonal residuals. The common-shift control changes the removed mean, while the centered principal directions stay the same.`,
    ),
    { labIds: ['pca-projection-lab'] },
  ),
  section(
    'pca-svd-route-and-explained-variance',
    copy('SVD 路径与解释方差', 'The SVD Route and Explained Variance'),
    copy(
      md`实际计算 PCA 时，很多数值库不先显式形成协方差矩阵，而是直接对中心化数据做 reduced SVD：

$$
X=U\Sigma V^T.
$$

原因是

$$
X^TX=V\Sigma^T\Sigma V^T.
$$

所以 \(X^TX\) 的特征向量就是 \(V\) 的列，也就是 \(X\) 的右奇异向量。第 \(j\) 个方向的方差是

$$
\lambda_j=\frac{\sigma_j^2}{m-1}.
$$

投影到全部主方向时，

$$
XV=U\Sigma.
$$

只投影到前 \(k\) 个主方向时，

$$
Z=XV_k.
$$

解释方差比例用来决定 \(k\)：

$$
\text{explained}(k)
=
\frac{\sum_{j=1}^{k}\sigma_j^2}{\sum_{j=1}^{r}\sigma_j^2}.
$$

**数值例子。** 若中心化数据的奇异值是 \(\sigma_1=6\)、\(\sigma_2=3\)、\(\sigma_3=1\)，总方差比例由平方决定。只保留第一主成分时，

$$
\frac{6^2}{6^2+3^2+1^2}
=
\frac{36}{46}
\approx 78.3\%.
$$

保留前两个主成分时，比例变为 \((36+9)/46\approx97.8\%\)。这说明“保留几个成分”不是凭感觉，而是由奇异值平方的尾部能量决定。`,
      md`In practical PCA, many numerical libraries do not explicitly form the covariance matrix first. They compute a reduced SVD of the centered data:

$$
X=U\Sigma V^T.
$$

The reason is

$$
X^TX=V\Sigma^T\Sigma V^T.
$$

Thus the eigenvectors of \(X^TX\) are the columns of \(V\), the right singular vectors of \(X\). The variance in direction \(j\) is

$$
\lambda_j=\frac{\sigma_j^2}{m-1}.
$$

Projection onto all principal directions gives

$$
XV=U\Sigma.
$$

Projection onto the first \(k\) directions gives

$$
Z=XV_k.
$$

Explained variance is used to choose \(k\):

$$
\text{explained}(k)
=
\frac{\sum_{j=1}^{k}\sigma_j^2}{\sum_{j=1}^{r}\sigma_j^2}.
$$

**Numerical example.** If centered data has singular values \(\sigma_1=6\), \(\sigma_2=3\), and \(\sigma_3=1\), variance fractions are determined by squares. Keeping only the first principal component gives

$$
\frac{6^2}{6^2+3^2+1^2}
=
\frac{36}{46}
\approx 78.3\%.
$$

Keeping the first two components gives \((36+9)/46\approx97.8\%\). This shows that choosing how many components to keep is not guesswork; it is controlled by the tail energy of squared singular values.`,
    ),
  ),
  section(
    'pca-algorithm-and-terminology',
    copy('PCA 算法与术语边界', 'PCA Algorithm and Terminology Boundaries'),
    copy(
      md`设原始数据矩阵为 \(A\in\mathbb{R}^{m\times n}\)，目标是得到 \(m\times k\) 的低维表示。一个稳定的 PCA 流程是：

1. 对每个特征列减去均值，得到中心化矩阵 \(X\)。
2. 对 \(X\) 做 reduced SVD：\(X=U\Sigma V^T\)。
3. 把 \(V\) 的列读成主方向，把 \(\sigma_j^2/(m-1)\) 读成第 \(j\) 个方向上的方差。
4. 根据解释方差比例选择 \(k\)。
5. 计算低维表示 \(Z=XV_k\)。
6. 若需要近似回到原空间，计算 \(\hat X=ZV_k^T\)，再把均值加回去。

术语上要小心。“principal components” 在不同材料里有时指方向 \(V\) 的列，有时指投影后的新坐标 \(Z\)，有时也会泛指方差值 \(\sigma_j^2\) 或 \(\lambda_j\)。为了避免混淆，本章采用：

- **主方向 / principal directions：** \(V\) 的列。
- **主成分坐标 / component scores：** \(Z=XV_k\) 中的列。
- **解释方差 / explained variance：** 由 \(\lambda_j\) 或 \(\sigma_j^2\) 计算的方差比例。

代码骨架如下，假设样本在行、特征在列：

~~~python
import numpy as np

X = A - A.mean(axis=0, keepdims=True)
U, S, Vt = np.linalg.svd(X, full_matrices=False)
k = 2
Vk = Vt[:k].T
Z = X @ Vk
explained = (S[:k] ** 2).sum() / (S ** 2).sum()
~~~

真实项目还会在 PCA 前做特征缩放。若一个特征用米计量、另一个用毫米计量，较大尺度会主导方差，PCA 很可能只是在读单位差异，而不是读真实结构。`,
      md`Let the raw data matrix be \(A\in\mathbb{R}^{m\times n}\), and suppose the goal is an \(m\times k\) low-dimensional representation. A stable PCA workflow is:

1. Subtract the mean of each feature column to obtain the centered matrix \(X\).
2. Compute a reduced SVD: \(X=U\Sigma V^T\).
3. Read the columns of \(V\) as principal directions, and read \(\sigma_j^2/(m-1)\) as variance in direction \(j\).
4. Choose \(k\) using explained variance.
5. Compute the low-dimensional representation \(Z=XV_k\).
6. If an approximation in the original space is needed, compute \(\hat X=ZV_k^T\), then add the mean back.

Terminology needs care. In different materials, "principal components" may refer to the directions in \(V\), the projected coordinates \(Z\), or even the variance values \(\sigma_j^2\) or \(\lambda_j\). To avoid ambiguity, this chapter uses:

- **Principal directions:** the columns of \(V\).
- **Component scores:** the columns of \(Z=XV_k\).
- **Explained variance:** variance fractions computed from \(\lambda_j\) or \(\sigma_j^2\).

A code skeleton, assuming samples are rows and features are columns:

~~~python
import numpy as np

X = A - A.mean(axis=0, keepdims=True)
U, S, Vt = np.linalg.svd(X, full_matrices=False)
k = 2
Vk = Vt[:k].T
Z = X @ Vk
explained = (S[:k] ** 2).sum() / (S ** 2).sum()
~~~

Real projects often scale features before PCA. If one feature is measured in meters and another in millimeters, the larger scale can dominate variance, and PCA may read unit differences rather than real structure.`,
    ),
  ),
  section(
    'pca-ml-connections-and-failure-modes',
    copy('机器学习里的用途与失败场景', 'Machine-Learning Uses and Failure Modes'),
    copy(
      md`PCA 在机器学习里常见，但它的适用边界也很清楚。

Embedding 可视化是 PCA 最容易被误用也最有用的场景之一。把几百维句子向量投到二维，可以快速看到主题簇、离群点和批次效应；但这张图不是最终证明，因为 PCA 只保留最大方差方向。若分类信息藏在低方差方向，PCA 的第一张图可能很好看，却没有解释真正的标签差异。

**特征压缩。** 对高度相关的传感器、图像块、词频或中间表示，PCA 可以用更少维度保存大部分方差，减少后续模型的输入维度。

**去噪。** 若信号主要集中在大奇异值方向，而噪声分散在小方差方向，保留前几个主成分可以滤掉一部分噪声。

**推荐与矩阵分解直觉。** PCA 和 SVD 共享“用低秩结构解释数据”的思想；用户-物品矩阵、协同过滤和 embedding 分析都常用这种语言。

失败场景同样重要：

- PCA 不看标签，所以最大方差方向不一定最能分类。
- PCA 是线性方法；若数据位于弯曲流形上，一条直线或一个平面可能不是好表示。
- PCA 对特征尺度敏感；未缩放的单位差异会改变主方向。
- PCA 新坐标是线性组合，压缩后可能失去原始特征可解释性。
- 如果方差大的方向主要是噪声或批次效应，PCA 会认真保留这个错误结构。

实践中，一个负责任的 PCA 报告至少说明：是否中心化、是否缩放、保留了多少解释方差、前几个主方向由哪些原始特征主导，以及降维后的任务是否真的变好。`,
      md`PCA is common in machine learning, but its boundaries are clear.

Embedding visualization is one of the most useful and most easily misused PCA scenarios. Projecting hundreds-dimensional sentence vectors to two dimensions can quickly reveal topic clusters, outliers, and batch effects; but the plot is not final proof because PCA keeps maximum-variance directions. If class information lies in a low-variance direction, the first PCA plot may look clean while missing the real label difference.

**Feature compression.** For correlated sensors, image patches, word counts, or internal representations, PCA can keep most variance in fewer dimensions and reduce the input size for later models.

**Denoising.** If signal is concentrated in large-singular-value directions while noise spreads through low-variance directions, keeping the first few components can remove part of the noise.

**Recommendation and matrix-factorization intuition.** PCA and SVD share the idea of explaining data with low-rank structure; user-item matrices, collaborative filtering, and embedding analysis often use this language.

Failure modes matter just as much:

- PCA ignores labels, so the highest-variance direction may not be the best classification direction.
- PCA is linear; if data lies on a curved manifold, one line or plane may not represent it well.
- PCA is sensitive to feature scale; unscaled unit differences can change principal directions.
- PCA coordinates are linear combinations, so compression can lose original feature interpretability.
- If the large-variance direction is mainly noise or a batch effect, PCA will faithfully preserve that wrong structure.

A responsible PCA report should state at least: whether data was centered, whether features were scaled, how much explained variance was retained, which original features dominate the first directions, and whether the downstream task actually improved after reduction.`,
    ),
  ),
  section(
    'pca-review-questions',
    copy('复习问题', 'Review Questions'),
    copy(
      md`1. PCA 为什么必须先中心化数据？
2. \(\operatorname{Cov}(X)=\frac{1}{m-1}X^TX\) 的对角线和迹分别表示什么？
3. 为什么直接删除原始特征和 PCA 生成新特征不是同一件事？
4. 协方差矩阵的最大特征值和第一主方向有什么关系？
5. 已知 \(X=U\Sigma V^T\)，为什么 \(V\) 的列就是 PCA 主方向？
6. 投影 \(Z=XV_k\) 的形状是什么？\(V_k\) 的列数由什么决定？
7. 如何用奇异值计算前 \(k\) 个主成分的解释方差比例？
8. “principal components” 在不同上下文可能指哪些量？怎样避免混淆？
9. PCA 为什么不能保证找到最适合分类的方向？
10. 在什么情况下特征缩放会改变 PCA 的结论？
11. 若只保留一个主方向，重建误差对应被丢弃的哪个几何部分？
12. 在 embedding 可视化、去噪或推荐系统中，PCA 分别扮演什么角色？`,
      md`1. Why must PCA center the data first?
2. What do the diagonal and trace of \(\operatorname{Cov}(X)=\frac{1}{m-1}X^TX\) represent?
3. Why is directly dropping original features different from creating new PCA features?
4. How is the largest covariance eigenvalue related to the first principal direction?
5. Given \(X=U\Sigma V^T\), why are the columns of \(V\) the PCA directions?
6. What is the shape of \(Z=XV_k\), and what decides the number of columns in \(V_k\)?
7. How do singular values determine the explained-variance ratio for the first \(k\) components?
8. What can "principal components" mean in different contexts, and how can ambiguity be avoided?
9. Why does PCA not guarantee the best classification direction?
10. When can feature scaling change the PCA result?
11. If only one principal direction is kept, what geometric part becomes reconstruction error?
12. What role does PCA play in embedding visualization, denoising, or recommender-system intuition?`,
    ),
  ),
]

export function buildPcaModule(base: MathLabModule): MathLabModule {
  return {
    ...base,
    enhancementTier: 'interactive',
    title: copy('主成分分析（PCA）', 'Principal Component Analysis (PCA)'),
    subtitle: copy(
      '把中心化数据转到最大方差方向，用更少坐标保留主要结构。',
      'Rotate centered data into maximum-variance directions and keep the main structure with fewer coordinates.',
    ),
    difficulty: 'advanced',
    estimatedMinutes: 34,
    prerequisites: ['svd', 'eigenvalues-eigenvectors', 'linear-algebra-rank-null-space'],
    sourceReferences: [sources.essenceLinearAlgebra, sources.d2lLinearAlgebra, sources.mml],
    aiModelConnections: [
      copy(
        'PCA 常用于 embedding 可视化、特征压缩和去噪：它把高维数据投影到解释方差最大的低维子空间。',
        'PCA is common for embedding visualization, feature compression, and denoising: it projects high-dimensional data onto a low-dimensional subspace with maximum explained variance.',
      ),
      copy(
        '它不是监督分类器；若标签方向不是最大方差方向，PCA 可能保留了变化最多但不最有判别力的坐标。',
        'It is not a supervised classifier; if labels do not align with maximum variance, PCA may keep the most variable but not the most discriminative coordinates.',
      ),
    ],
    learningObjectives: [
      copy('解释 PCA 为什么先对每个特征列中心化。', 'Explain why PCA centers every feature column first.'),
      copy(md`从 \(\operatorname{Cov}(X)=\frac{1}{m-1}X^TX\) 读出方差、协方差和总方差。`, md`Read variance, covariance, and total variance from \(\operatorname{Cov}(X)=\frac{1}{m-1}X^TX\).`),
      copy('把协方差矩阵的特征向量解释为主方向。', 'Interpret covariance eigenvectors as principal directions.'),
      copy(md`用 SVD 说明 \(V\) 的列、奇异值平方和解释方差之间的关系。`, md`Use the SVD to relate columns of \(V\), squared singular values, and explained variance.`),
      copy(md`计算低维表示 \(Z=XV_k\)，并解释保留 \(k\) 个方向的代价。`, md`Compute the low-dimensional representation \(Z=XV_k\) and explain the tradeoff of keeping \(k\) directions.`),
      copy('区分 PCA 降维、去噪、可视化和监督分类。', 'Distinguish PCA dimensionality reduction, denoising, visualization, and supervised classification.'),
    ],
    concepts: [
      {
        id: 'pca-centered-projection',
        name: copy('中心化投影', 'Centered Projection'),
        formulaLatex: 'Z=XV_k',
        variables: [
          {
            symbol: 'X',
            description: copy('每个特征列已减去均值的中心化数据矩阵。', 'The centered data matrix after subtracting each feature-column mean.'),
          },
          {
            symbol: 'V_k',
            description: copy('前 k 个主方向组成的正交矩阵。', 'The orthogonal matrix formed by the first k principal directions.'),
          },
          {
            symbol: 'Z',
            description: copy('投影后的低维主成分坐标。', 'The low-dimensional component scores after projection.'),
          },
        ],
        plainExplanation: copy(
          'PCA 先把数据云移到均值为零的位置，再把坐标轴转向方差最大的方向。',
          'PCA first moves the cloud to zero mean, then rotates axes toward directions of greatest variance.',
        ),
        geometricIntuition: copy(
          '保留一个主方向时，每个点被压到一条线上；被压掉的垂直距离就是重建误差。',
          'Keeping one direction presses each point onto a line; the discarded perpendicular distance is reconstruction error.',
        ),
        numericalExample: copy(
          md`若奇异值为 \(6,3,1\)，保留第一方向解释 \(36/(36+9+1)\approx78.3\%\) 的方差。`,
          md`If singular values are \(6,3,1\), keeping the first direction explains \(36/(36+9+1)\approx78.3\%\) of variance.`,
        ),
        codeExample:
          'import numpy as np\n\nX = A - A.mean(axis=0, keepdims=True)\nU, S, Vt = np.linalg.svd(X, full_matrices=False)\nk = 2\nZ = X @ Vt[:k].T\nprint((S[:k] ** 2).sum() / (S ** 2).sum())',
        modelConnection: copy(
          'embedding 可视化和特征压缩常用这个投影，把高维表示变成少数几个可检查坐标。',
          'Embedding visualization and feature compression use this projection to turn high-dimensional representations into a few inspectable coordinates.',
        ),
      },
      {
        id: 'pca-covariance-diagonalization',
        name: copy('协方差对角化', 'Covariance Diagonalization'),
        formulaLatex: '\\operatorname{Cov}(X)=\\frac{1}{m-1}X^TX=V\\Lambda V^T',
        variables: [
          {
            symbol: '\\Lambda',
            description: copy('对角线上的特征值，表示各主方向的方差。', 'Diagonal eigenvalues giving variance along each principal direction.'),
          },
          {
            symbol: 'V',
            description: copy('正交主方向矩阵。', 'Orthogonal matrix of principal directions.'),
          },
        ],
        plainExplanation: copy(
          'PCA 找到一个坐标系，让新特征之间的协方差为零，并按方差大小排序。',
          'PCA finds a coordinate system where new features have zero covariance and are ordered by variance.',
        ),
        geometricIntuition: copy(
          '协方差矩阵描述点云椭圆的形状；特征向量就是椭圆长轴和短轴。',
          'The covariance matrix describes the shape of the data ellipse; eigenvectors are its long and short axes.',
        ),
        numericalExample: copy(
          md`若 \(\lambda_1=8,\lambda_2=2\)，第一主方向解释 \(8/(8+2)=80\%\) 的总方差。`,
          md`If \(\lambda_1=8,\lambda_2=2\), the first direction explains \(8/(8+2)=80\%\) of total variance.`,
        ),
        modelConnection: copy(
          '去噪时，小方差方向常被视为噪声候选；但这需要结合领域知识确认。',
          'In denoising, small-variance directions are often noise candidates, but domain knowledge must confirm that assumption.',
        ),
      },
      {
        id: 'pca-svd-explained-variance',
        name: copy('SVD 与解释方差', 'SVD and Explained Variance'),
        formulaLatex: '\\text{explained}(k)=\\frac{\\sum_{j=1}^{k}\\sigma_j^2}{\\sum_{j=1}^{r}\\sigma_j^2}',
        variables: [
          {
            symbol: '\\sigma_j',
            description: copy('中心化数据矩阵的第 j 个奇异值。', 'The j-th singular value of the centered data matrix.'),
          },
          {
            symbol: 'r',
            description: copy('非零奇异值数量，也就是数值秩。', 'The number of nonzero singular values, the numerical rank.'),
          },
        ],
        plainExplanation: copy(
          '奇异值平方越大，该方向承载的数据变化越多。',
          'The larger the squared singular value, the more data variation that direction carries.',
        ),
        geometricIntuition: copy(
          '选择 k 就是在决定保留椭圆的哪些轴，以及丢掉尾部能量多少。',
          'Choosing k decides which axes of the data ellipse to keep and how much tail energy to discard.',
        ),
        numericalExample: copy(
          md`若前两个奇异值平方占总和 \(97.8\%\)，二维投影通常比一维投影保留更多结构。`,
          md`If the first two squared singular values cover \(97.8\%\), a 2D projection usually preserves more structure than a 1D projection.`,
        ),
        modelConnection: copy(
          '低秩推荐、图像压缩和权重矩阵分析都使用类似的能量保留判断。',
          'Low-rank recommendation, image compression, and weight-matrix analysis use similar retained-energy criteria.',
        ),
      },
    ],
    sections,
    toc: sections.map(({ id, level, title }) => ({ id, level, title })),
    visuals: [
      {
        id: 'pca-centering-projection-video',
        type: 'manim-video',
        title: copy('PCA 中心化与投影', 'PCA Centering and Projection'),
        assetPath: '/manim/math-lab/pca-centering-projection.mp4',
        posterPath: '/manim/math-lab/pca-centering-projection.svg',
        transcript: copy(
          md`动画先标出原始点云的均值，再把点云平移到均值为零的位置；随后沿最大方差方向投影。请把这个顺序记牢：不先中心化，PCA 读到的会混入“离原点多远”。`,
          md`The animation first marks the mean of the raw point cloud, moves the cloud to zero mean, and then projects along the maximum-variance direction. Keep the order: without centering first, PCA also reads "how far the cloud is from the origin."`,
        ),
        learningPurpose: copy(
          '把中心化、主方向和投影误差连成一个连续动作，帮助学生理解 PCA 为什么不是直接删特征。',
          'Connect centering, principal direction, and projection into one continuous action, helping learners see why PCA is not just dropping features.',
        ),
      },
    ],
    labs: [
      {
        id: 'pca-projection-lab',
        title: copy('PCA 投影与解释方差实验', 'PCA Projection and Explained Variance Lab'),
        type: 'interactive-visual',
        componentName: 'PcaProjectionLab',
        successCriteria: [
          copy('能解释整体平移为什么会被中心化消除。', 'Explain why a common shift is removed by centering.'),
          copy(md`能把蓝点到橙点的距离对应到 \(\hat X=XV_kV_k^T\) 的重建误差。`, md`Map the distance from blue to orange points to reconstruction error in \(\hat X=XV_kV_k^T\).`),
          copy('能根据解释方差读数判断是否需要保留第二个主方向。', 'Use the explained-variance readout to decide whether the second principal direction should be kept.'),
        ],
      },
    ],
    quizzes: [
      {
        id: 'pca-centering-purpose',
        type: 'single-choice',
        prompt: copy('PCA 为什么要先对特征列中心化？', 'Why does PCA center feature columns first?'),
        choices: [
          {
            id: 'remove-mean',
            label: copy('让算法分析围绕均值的变化方向，而不是数据离原点的平移。', 'To analyze variation around the mean instead of translation away from the origin.'),
          },
          {
            id: 'make-labels',
            label: copy('为了自动生成分类标签。', 'To automatically generate class labels.'),
          },
          {
            id: 'increase-rank',
            label: copy('为了保证矩阵一定满秩。', 'To guarantee that the matrix has full rank.'),
          },
        ],
        answer: 'remove-mean',
        explanation: copy(
          '中心化把共同平移从数据中去掉，使协方差只描述围绕平均位置的展开方向。',
          'Centering removes the common translation, so covariance describes spread around the mean position.',
        ),
        misconceptionTags: ['pca-centering-optional'],
      },
      {
        id: 'pca-explained-variance-numeric',
        type: 'numeric',
        prompt: copy(
          md`若奇异值为 \(6,3,1\)，只保留第一主成分时解释方差比例约为多少？请填小数，保留三位即可。`,
          md`If singular values are \(6,3,1\), what explained-variance ratio is kept by the first component? Enter a decimal, about three digits.`,
        ),
        answer: 0.783,
        tolerance: 0.002,
        explanation: copy(
          md`解释方差由奇异值平方决定：\(6^2/(6^2+3^2+1^2)=36/46\approx0.783\)。`,
          md`Explained variance uses squared singular values: \(6^2/(6^2+3^2+1^2)=36/46\approx0.783\).`,
        ),
        misconceptionTags: ['pca-singular-values-not-squared'],
      },
      {
        id: 'pca-labels-vs-variance',
        type: 'single-choice',
        prompt: copy('PCA 选择第一主方向时主要看什么？', 'What does PCA mainly use when choosing the first principal direction?'),
        choices: [
          {
            id: 'variance',
            label: copy('无标签数据在该方向上的方差。', 'The variance of unlabeled data along that direction.'),
          },
          {
            id: 'class-separation',
            label: copy('分类标签之间的间隔。', 'The margin between class labels.'),
          },
          {
            id: 'feature-name',
            label: copy('特征名称是否容易解释。', 'Whether the feature name is easy to interpret.'),
          },
        ],
        answer: 'variance',
        explanation: copy(
          'PCA 不使用标签；方差最大的方向不一定是最能分类的方向。',
          'PCA does not use labels; the maximum-variance direction is not necessarily the best classification direction.',
        ),
        misconceptionTags: ['pca-is-classifier'],
        revisitVisualId: 'pca-projection-lab',
      },
    ],
    misconceptions: [
      {
        id: 'pca-is-classifier',
        statement: copy('PCA 会自动找到最能分类的方向。', 'PCA automatically finds the best classification direction.'),
        correction: copy(
          'PCA 是无监督降维，只优化方差保留，不优化标签分离。',
          'PCA is unsupervised dimensionality reduction; it optimizes retained variance, not label separation.',
        ),
        example: copy(
          '如果类别差异沿低方差方向出现，PCA 的第一主方向可能反而忽略分类信息。',
          'If class differences lie in a low-variance direction, the first PCA direction may ignore the class information.',
        ),
      },
      {
        id: 'pca-centering-optional',
        statement: copy('PCA 中心化可有可无，因为 SVD 会自动处理均值。', 'Centering is optional in PCA because the SVD automatically handles the mean.'),
        correction: copy(
          'SVD 只分解你给它的矩阵；若没有先减均值，主方向会受到整体平移影响。',
          'The SVD only decomposes the matrix it receives; without subtracting the mean, principal directions are affected by translation.',
        ),
        example: copy(
          md`把所有点都加上同一个向量会改变未中心化矩阵的 \(A^TA\)，但不会改变中心化后的协方差。`,
          md`Adding the same vector to every point changes \(A^TA\) without centering, but does not change the centered covariance.`,
        ),
      },
      {
        id: 'pca-components-are-original-features',
        statement: copy('PCA 保留的主成分就是原来的某几个特征列。', 'The components kept by PCA are simply some original feature columns.'),
        correction: copy(
          'PCA 主方向通常是原始特征的线性组合；这保留了相关特征的共同信息，但会降低可解释性。',
          'PCA directions are usually linear combinations of original features; this keeps shared information from correlated features but reduces interpretability.',
        ),
        example: copy(
          md`新特征可能形如 \(F_1^*=0.5F_1+0.4F_2-0.1F_3+\cdots\)，不再对应一个单独原始测量。`,
          md`A new feature might look like \(F_1^*=0.5F_1+0.4F_2-0.1F_3+\cdots\), no longer one original measurement.`,
        ),
      },
    ],
    accent: '#0f766e',
    theme: '#e6fbf6',
  }
}
