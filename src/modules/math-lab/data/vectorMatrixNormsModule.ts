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
    'vectors-matrices-norms-zero-base-story',
    copy('零基础先看：数据为什么会变成箭头', 'Zero-Base First Look: Why Data Becomes Arrows'),
    copy(
      md`先不要把线性代数想成一堆大表格。对 AI 来说，线性代数最朴素的问题是：**怎样把很多信息放进同一个空间里比较、混合和移动？**

![线性代数入门故事：数据卡片变成向量、向量组合、矩阵变换和长度测量](/math-lab/generated/beginner-linear-algebra-story.png)

向量可以先理解成带方向的位移：从“起点”走到“终点”，要向右走多少、向上走多少、还要沿其他特征轴走多少。这样读时，\((3,4)\) 不是两个互不相关的数字，而是“向右 3、向上 4”的一步移动；它的长度是 \(5\)，因为这一步和直角三角形的斜边一样长。

一张图片可以被拆成像素数，一句话可以被模型变成 embedding，一个学生的学习记录也可以被写成一排特征数。这一排数就是向量。两个数不是两个抽屉，而是同一个点在两个方向上的坐标；更多数字只是把平面扩展成更高维的特征空间。把它画成箭头后，你能直观看到两件事：箭头指向哪里，以及箭头有多长。

矩阵不是“更大的表格”，而是一台空间变形器。矩阵的列向量就是新坐标轴：第一列告诉原来的横轴会去哪里，第二列告诉原来的纵轴会去哪里。它会把每个方向拉伸、旋转、压扁或混合。神经网络里的线性层 \(Wx+b\) 就在反复做这种事：先把输入特征混合成新的方向，再交给后面的非线性模块判断。

这一章只需要先抓住三句话：

1. 向量回答“这个样本在特征空间里的方向和位置是什么？”
2. 点积回答“两个方向有多同向？”
3. 矩阵回答“如果把整个空间这样变形，样本会去哪里？”

公式会让这些问题可计算；图像和实验先让这些问题可看见。`,
      md`Do not start by treating linear algebra as a pile of big tables. For AI, the simplest question is: **how can many pieces of information live in one space so we can compare, mix, and move them?**

![Beginner linear algebra story: data cards become vectors, vector combinations, matrix transforms, and length measurement](/math-lab/generated/beginner-linear-algebra-story.png)

A vector can first be understood as a displacement with direction: from a start point to an end point, how far do you move right, up, and along any other feature axes? With that reading, \((3,4)\) is not two unrelated numbers; it is "move 3 right and 4 up." Its length is \(5\), the same hypotenuse idea from a right triangle.

An image can become pixel numbers, a sentence can become an embedding, and a learner profile can become a row of feature values. That row is a vector. The important mental shift is that two numbers are not two storage boxes; they are two coordinates of one point in one space. More numbers extend the plane into a higher-dimensional feature space. Once you draw the vector as an arrow, you can see two things immediately: where it points and how long it is.

A matrix is not just a bigger table; it is a space transformer. Its columns are the new coordinate axes: the first column tells where the old horizontal axis lands, and the second column tells where the old vertical axis lands. It can stretch, rotate, flatten, or mix directions. A neural-network linear layer \(Wx+b\) repeatedly does this: mix input features into new directions, then pass them to nonlinear parts of the model.

Keep three starter sentences in mind:

1. A vector asks, "where is this sample in feature space?"
2. A dot product asks, "how aligned are these two directions?"
3. A matrix asks, "where does a sample go if the whole space is transformed this way?"

Formulas make these questions computable; images and labs make them visible first.`,
    ),
  ),
  section(
    'vectors-matrices-norms-learning-objectives',
    copy('全章地图：从向量到矩阵再到范数', 'Chapter Map: From Vectors to Matrices to Norms'),
    copy(
      md`这一章把线性代数中最常见的三个对象连成一条线：

1. **向量**把信息写成有顺序的数字，也可以看成空间里的方向和长度。
2. **矩阵**把向量变成另一个向量；在几何上，它移动基向量，于是整个空间跟着变形。
3. **范数**把向量或矩阵的“大小”变成一个非负数，用来比较距离、误差和放大倍数。

![无文字的向量、矩阵变换和范数直觉插图](/math-lab/generated/vector-matrix-norms-illustration.png)

读这一章时，不要把矩阵先理解成数字表。更可靠的读法是：矩阵的每一列告诉你一个基方向会被送到哪里；输入向量的坐标告诉你要把这些列按什么比例相加。这个观点会在后面的 LU、条件数、特征值、SVD 和 PCA 中反复出现。

本章结束时，你应该能够完成本章基础要求的六件事，并在此基础上建立几何直觉：

- 理解 vector space、basis、span、linear independence 与 inner product 的定义。
- 识别 linear transformation，并知道为什么平移不是线性变换。
- 识别零矩阵、单位矩阵、对角矩阵、三角矩阵、置换矩阵和分块矩阵。
- 熟练执行矩阵-向量乘法，并能同时按“行内积”和“列线性组合”解释它。
- 把有限维空间之间的线性变换表示成矩阵。
- 计算向量和矩阵的大小，包括 \(1\)-范数、\(2\)-范数、\(\infty\)-范数、Frobenius 范数与诱导矩阵范数。

在机器学习中，文本 embedding、图像特征、模型权重、梯度和激活值几乎都以向量或矩阵的形式存在。范数则回答一个更工程化的问题：两个表示有多远？权重有多大？梯度是否爆炸？线性层是否把噪声放大了？`,
      md`This chapter connects the three most common objects in linear algebra:

1. **Vectors** store ordered numerical information and can also be read as directions with lengths.
2. **Matrices** turn vectors into other vectors; geometrically, they move the basis vectors, so the whole space follows.
3. **Norms** turn the size of a vector or matrix into a nonnegative number, letting us compare distance, error, and amplification.

![Text-free intuition image for vectors, matrix transformations, and norms](/math-lab/generated/vector-matrix-norms-illustration.png)

Do not begin by reading a matrix as a table of numbers. A stronger reading is this: each column tells where one basis direction goes, and the input vector says how to combine those moved columns. The same viewpoint reappears in LU, condition numbers, eigenvalues, SVD, and PCA.

By the end of this chapter you should be able to meet the chapter's core goals and add geometric intuition:

- Understand vector spaces, basis, span, linear independence, and inner products.
- Identify linear transformations and explain why translation is not linear.
- Recognize zero, identity, diagonal, triangular, permutation, and block matrices.
- Perform matrix-vector multiplication and explain it both as row inner products and as a column combination.
- Represent finite-dimensional linear transformations as matrices.
- Evaluate vector and matrix magnitudes, including \(1\)-, \(2\)-, \(\infty\)-, Frobenius, and induced matrix norms.

In machine learning, text embeddings, image features, model weights, gradients, and activations are almost always vectors or matrices. Norms answer the engineering questions around them: how far apart are two representations, how large are the weights, is the gradient exploding, and does a linear layer amplify noise?`,
    ),
  ),
  section(
    'vectors-matrices-norms-vectors-span-basis',
    copy('向量：坐标、线性组合与 span', 'Vectors: Coordinates, Linear Combinations, and Span'),
    copy(
      md`一个 \(n\) 维向量是一个有顺序的数字数组：

$$
\mathbf{x}=
\begin{bmatrix}
x_1\\
x_2\\
\vdots\\
x_n
\end{bmatrix}.
$$

在数据语境中，\(\mathbf{x}\) 可以是一张图片的像素、一个词的 embedding、一位用户的特征，也可以是一组模型参数。在几何语境中，\(\mathbf{x}\) 是从原点出发的箭头。两种读法并不矛盾：数字给出坐标，坐标给出空间中的位置和方向。

如果你是第一次见向量，可以先把它当成“带方向的清单”。清单里的每个数字都必须回答同一个样本在某个方向上走了多少。例如学习记录 \([2,5]\) 可以读成“本周练习 2 次、测验错 5 题”。这不是两个孤立抽屉，而是一个学习状态点；当另一个学生是 \([4,1]\) 时，两点之间的差 \([2,-4]\) 就是“多练 2 次、少错 4 题”的变化方向。

向量空间要求两个动作保持封闭：向量相加仍在空间里，向量乘以标量仍在空间里。最重要的操作是**线性组合**：

$$
c_1\mathbf{v}_1+c_2\mathbf{v}_2+\cdots+c_k\mathbf{v}_k.
$$

所有可能的线性组合形成这组向量的 **span**。如果两支二维向量方向不同，它们的 span 通常覆盖整个平面；如果一支向量只是另一支的倍数，它们只能覆盖一条线。这个直觉比背诵定义更重要：span 问的是“这些方向能到达哪里”。

如果一组向量既能覆盖整个空间，又没有多余方向，它们就是一组 **basis**。例如 \(\mathbb{R}^2\) 的标准基为

$$
\mathbf{e}_1=\begin{bmatrix}1\\0\end{bmatrix},
\qquad
\mathbf{e}_2=\begin{bmatrix}0\\1\end{bmatrix}.
$$

任何二维向量都能写成

$$
\begin{bmatrix}x\\y\end{bmatrix}
=x\mathbf{e}_1+y\mathbf{e}_2.
$$

这句话也解释了坐标的含义：坐标不是向量本身的全部故事，而是“相对于当前基向量，要混合多少”。换一组基，同一个几何向量会有不同坐标。

更正式地说，向量空间 \(V\) 配合标量域 \(F\) 后，需要满足一组代数规则。下面这些规则不是为了增加术语负担，而是为了保证“线性组合”这种操作稳定可靠：

| 规则 | 含义 |
| --- | --- |
| 加法封闭 | 若 \(\mathbf{v},\mathbf{w}\in V\)，则 \(\mathbf{v}+\mathbf{w}\in V\) |
| 数乘封闭 | 若 \(\alpha\in F,\mathbf{v}\in V\)，则 \(\alpha\mathbf{v}\in V\) |
| 结合律 | \((\mathbf{u}+\mathbf{v})+\mathbf{w}=\mathbf{u}+(\mathbf{v}+\mathbf{w})\)，且 \((\alpha\beta)\mathbf{u}=\alpha(\beta\mathbf{u})\) |
| 零向量 | 存在 \(\mathbf{0}\)，使得 \(\mathbf{0}+\mathbf{u}=\mathbf{u}\) |
| 加法逆元 | 每个 \(\mathbf{u}\) 都有 \(-\mathbf{u}\)，使得 \(\mathbf{u}+(-\mathbf{u})=\mathbf{0}\) |
| 分配律 | \((\alpha+\beta)\mathbf{u}=\alpha\mathbf{u}+\beta\mathbf{u}\)，\(\alpha(\mathbf{u}+\mathbf{v})=\alpha\mathbf{u}+\alpha\mathbf{v}\) |
| 单位元 | \(1\mathbf{u}=\mathbf{u}\) |

线性无关也必须保留：如果

$$
\alpha_1\mathbf{v}_1+\alpha_2\mathbf{v}_2+\cdots+\alpha_k\mathbf{v}_k=\mathbf{0}
$$

只有平凡解 \(\alpha_1=\alpha_2=\cdots=\alpha_k=0\)，这组向量就是线性无关的；否则线性相关，其中至少一个方向可以由其他方向混合出来。basis 总是线性无关的，否则坐标就不会唯一。

**手算例子。** 令

$$
\mathbf{v}_1=\begin{bmatrix}2\\1\end{bmatrix},
\qquad
\mathbf{v}_2=\begin{bmatrix}-1\\1\end{bmatrix}.
$$

向量

$$
3\mathbf{v}_1+2\mathbf{v}_2
=3\begin{bmatrix}2\\1\end{bmatrix}
+2\begin{bmatrix}-1\\1\end{bmatrix}
=\begin{bmatrix}4\\5\end{bmatrix}.
$$

所以 \(\begin{bmatrix}4\\5\end{bmatrix}\) 是这两个方向的一种混合结果。下面的视频用运动展示“组合方向、覆盖区域、误差向量长度”这三个动作。`,
      md`An \(n\)-dimensional vector is an ordered array of numbers:

$$
\mathbf{x}=
\begin{bmatrix}
x_1\\
x_2\\
\vdots\\
x_n
\end{bmatrix}.
$$

In data, \(\mathbf{x}\) might be image pixels, a word embedding, user features, or model parameters. In geometry, \(\mathbf{x}\) is an arrow from the origin. These readings agree: numbers give coordinates, and coordinates give a position and direction in space.

If this is your first time seeing vectors, treat one as a directional list. Each number answers how far the same example moves along one axis. For example, a learning record \([2,5]\) can mean "2 practice sessions this week and 5 quiz mistakes." Those are not isolated boxes; they are one learning-state point. If another learner is \([4,1]\), the difference \([2,-4]\) means "2 more practice sessions and 4 fewer mistakes," a direction of change.

A vector space is closed under two actions: adding vectors stays in the space, and multiplying by a scalar stays in the space. The central operation is a **linear combination**:

$$
c_1\mathbf{v}_1+c_2\mathbf{v}_2+\cdots+c_k\mathbf{v}_k.
$$

All possible linear combinations form the **span** of the vectors. If two 2D vectors point in different directions, their span usually covers the whole plane. If one vector is only a multiple of the other, they cover only a line. This is the intuition to keep: span asks where these directions can reach.

If a set of vectors covers the whole space without redundant directions, it is a **basis**. For example, the standard basis of \(\mathbb{R}^2\) is

$$
\mathbf{e}_1=\begin{bmatrix}1\\0\end{bmatrix},
\qquad
\mathbf{e}_2=\begin{bmatrix}0\\1\end{bmatrix}.
$$

Every 2D vector can be written as

$$
\begin{bmatrix}x\\y\end{bmatrix}
=x\mathbf{e}_1+y\mathbf{e}_2.
$$

That also explains what coordinates mean: coordinates are not the whole vector story; they say how much of each basis direction to mix. Change the basis and the same geometric vector can get different coordinates.

More formally, a vector space \(V\) with scalar field \(F\) must satisfy algebraic rules. These rules are not extra vocabulary for its own sake; they make linear combinations stable and reliable:

| Rule | Meaning |
| --- | --- |
| Closure under addition | If \(\mathbf{v},\mathbf{w}\in V\), then \(\mathbf{v}+\mathbf{w}\in V\) |
| Closure under scalar multiplication | If \(\alpha\in F,\mathbf{v}\in V\), then \(\alpha\mathbf{v}\in V\) |
| Associativity | \((\mathbf{u}+\mathbf{v})+\mathbf{w}=\mathbf{u}+(\mathbf{v}+\mathbf{w})\), and \((\alpha\beta)\mathbf{u}=\alpha(\beta\mathbf{u})\) |
| Zero vector | There is a \(\mathbf{0}\) such that \(\mathbf{0}+\mathbf{u}=\mathbf{u}\) |
| Additive inverse | Each \(\mathbf{u}\) has \(-\mathbf{u}\), with \(\mathbf{u}+(-\mathbf{u})=\mathbf{0}\) |
| Distributivity | \((\alpha+\beta)\mathbf{u}=\alpha\mathbf{u}+\beta\mathbf{u}\), and \(\alpha(\mathbf{u}+\mathbf{v})=\alpha\mathbf{u}+\alpha\mathbf{v}\) |
| Unit scalar | \(1\mathbf{u}=\mathbf{u}\) |

Linear independence also matters. If

$$
\alpha_1\mathbf{v}_1+\alpha_2\mathbf{v}_2+\cdots+\alpha_k\mathbf{v}_k=\mathbf{0}
$$

has only the trivial solution \(\alpha_1=\alpha_2=\cdots=\alpha_k=0\), the vectors are linearly independent. Otherwise they are linearly dependent, and at least one direction can be mixed from the others. A basis is always linearly independent; otherwise coordinates would not be unique.

**Worked example.** Let

$$
\mathbf{v}_1=\begin{bmatrix}2\\1\end{bmatrix},
\qquad
\mathbf{v}_2=\begin{bmatrix}-1\\1\end{bmatrix}.
$$

Then

$$
3\mathbf{v}_1+2\mathbf{v}_2
=3\begin{bmatrix}2\\1\end{bmatrix}
+2\begin{bmatrix}-1\\1\end{bmatrix}
=\begin{bmatrix}4\\5\end{bmatrix}.
$$

So \(\begin{bmatrix}4\\5\end{bmatrix}\) is one mixture of these two directions. The video below uses motion to connect direction mixing, reachable regions, and the size of an error vector.`,
    ),
    { visualIds: ['vector-span-norm-video'] },
  ),
  section(
    'vectors-matrices-norms-dot-product-similarity',
    copy('点积：把夹角读成相似度', 'Dot Product: Reading Angle as Similarity'),
    copy(
      md`在实向量空间里，**内积**是一个把两个向量映射成实数的函数：

$$
\langle\cdot,\cdot\rangle:V\times V\to\mathbb{R}.
$$

它需要满足四个性质：

| 性质 | 公式 |
| --- | --- |
| 正性 | \(\langle\mathbf{u},\mathbf{u}\rangle\ge 0\) |
| 确定性 | \(\langle\mathbf{u},\mathbf{u}\rangle=0\) 当且仅当 \(\mathbf{u}=\mathbf{0}\) |
| 对称性 | \(\langle\mathbf{u},\mathbf{v}\rangle=\langle\mathbf{v},\mathbf{u}\rangle\) |
| 线性 | \(\langle \alpha\mathbf{u}+\beta\mathbf{v},\mathbf{w}\rangle=\alpha\langle\mathbf{u},\mathbf{w}\rangle+\beta\langle\mathbf{v},\mathbf{w}\rangle\) |

如果 \(\langle\mathbf{u},\mathbf{v}\rangle=0\)，两个向量称为正交。正交不是“没有长度”，而是“在对方方向上没有投影”。

在 \(\mathbb{R}^n\) 中，标准内积就是点积：

$$
\mathbf{x}^{\top}\mathbf{y}
=
\sum_{i=1}^{n}x_i y_i.
$$

点积有一个几何解释：

$$
\mathbf{x}^{\top}\mathbf{y}
=
\|\mathbf{x}\|_2\|\mathbf{y}\|_2\cos\theta,
$$

其中 \(\theta\) 是两个向量的夹角。这个公式把点积从“逐项相乘再相加”变成了三个可解释因素：

| 因素 | 含义 |
| --- | --- |
| \(\|\mathbf{x}\|_2\) | 第一个向量的长度 |
| \(\|\mathbf{y}\|_2\) | 第二个向量的长度 |
| \(\cos\theta\) | 方向是否一致 |

如果两个向量方向接近，\(\cos\theta>0\)，点积为正；如果接近垂直，点积接近 \(0\)；如果方向相反，点积为负。把长度影响除掉，就得到机器学习中常见的 cosine similarity：

$$
\operatorname{cosine}(\mathbf{x},\mathbf{y})
=
\frac{\mathbf{x}^{\top}\mathbf{y}}{\|\mathbf{x}\|_2\|\mathbf{y}\|_2}.
$$

这就是文本 embedding 搜索常用余弦相似度的原因：很多时候我们关心语义方向是否接近，而不是向量整体长度是否更大。

投影把“一个向量在另一个方向上有多少分量”写成公式。把 \(\mathbf{x}\) 投影到 \(\mathbf{y}\) 上：

$$
\operatorname{proj}_{\mathbf{y}}(\mathbf{x})
=
\frac{\mathbf{x}^{\top}\mathbf{y}}{\mathbf{y}^{\top}\mathbf{y}}\mathbf{y}.
$$

如果 \(\mathbf{x}^{\top}\mathbf{y}\) 很大，投影就长；如果点积为 \(0\)，投影退化为零向量。

**手算例子。** 对

$$
\mathbf{a}=\begin{bmatrix}3\\4\end{bmatrix},
\qquad
\mathbf{b}=\begin{bmatrix}4\\0\end{bmatrix},
$$

有

$$
\mathbf{a}^{\top}\mathbf{b}=3\cdot4+4\cdot0=12,
\qquad
\|\mathbf{a}\|_2=5,\quad \|\mathbf{b}\|_2=4.
$$

因此

$$
\cos\theta=\frac{12}{5\cdot4}=0.6,
\qquad
\theta\approx 53.1^\circ.
$$

拖动下面实验里的两个端点，观察夹角接近 \(90^\circ\) 时点积和余弦如何变化。`,
      md`In a real vector space, an **inner product** is a function that maps two vectors to a real number:

$$
\langle\cdot,\cdot\rangle:V\times V\to\mathbb{R}.
$$

It must satisfy four properties:

| Property | Formula |
| --- | --- |
| Positivity | \(\langle\mathbf{u},\mathbf{u}\rangle\ge 0\) |
| Definiteness | \(\langle\mathbf{u},\mathbf{u}\rangle=0\) if and only if \(\mathbf{u}=\mathbf{0}\) |
| Symmetry | \(\langle\mathbf{u},\mathbf{v}\rangle=\langle\mathbf{v},\mathbf{u}\rangle\) |
| Linearity | \(\langle \alpha\mathbf{u}+\beta\mathbf{v},\mathbf{w}\rangle=\alpha\langle\mathbf{u},\mathbf{w}\rangle+\beta\langle\mathbf{v},\mathbf{w}\rangle\) |

If \(\langle\mathbf{u},\mathbf{v}\rangle=0\), the vectors are orthogonal. Orthogonal does not mean "no length"; it means "no projection in the other direction."

In \(\mathbb{R}^n\), the standard inner product is the dot product:

$$
\mathbf{x}^{\top}\mathbf{y}
=
\sum_{i=1}^{n}x_i y_i.
$$

The dot product has a geometric reading:

$$
\mathbf{x}^{\top}\mathbf{y}
=
\|\mathbf{x}\|_2\|\mathbf{y}\|_2\cos\theta,
$$

where \(\theta\) is the angle between the vectors. This turns the dot product from "multiply entries and add" into three interpretable factors:

| Factor | Meaning |
| --- | --- |
| \(\|\mathbf{x}\|_2\) | Length of the first vector |
| \(\|\mathbf{y}\|_2\) | Length of the second vector |
| \(\cos\theta\) | Whether directions agree |

If the directions are close, \(\cos\theta>0\), so the dot product is positive. If the vectors are nearly perpendicular, the dot product is near \(0\). If they point in opposite directions, it is negative. Removing the effect of length gives the cosine similarity used throughout machine learning:

$$
\operatorname{cosine}(\mathbf{x},\mathbf{y})
=
\frac{\mathbf{x}^{\top}\mathbf{y}}{\|\mathbf{x}\|_2\|\mathbf{y}\|_2}.
$$

This is why text embedding search often uses cosine similarity: the semantic direction can matter more than the raw vector length.

Projection writes "how much of one vector lies along another direction" as a formula. The projection of \(\mathbf{x}\) onto \(\mathbf{y}\) is

$$
\operatorname{proj}_{\mathbf{y}}(\mathbf{x})
=
\frac{\mathbf{x}^{\top}\mathbf{y}}{\mathbf{y}^{\top}\mathbf{y}}\mathbf{y}.
$$

If \(\mathbf{x}^{\top}\mathbf{y}\) is large, the projection is long. If the dot product is \(0\), the projection becomes the zero vector.

**Worked example.** For

$$
\mathbf{a}=\begin{bmatrix}3\\4\end{bmatrix},
\qquad
\mathbf{b}=\begin{bmatrix}4\\0\end{bmatrix},
$$

we get

$$
\mathbf{a}^{\top}\mathbf{b}=3\cdot4+4\cdot0=12,
\qquad
\|\mathbf{a}\|_2=5,\quad \|\mathbf{b}\|_2=4.
$$

Therefore

$$
\cos\theta=\frac{12}{5\cdot4}=0.6,
\qquad
\theta\approx 53.1^\circ.
$$

Drag the two endpoints in the lab below and watch what happens to the dot product and cosine when the angle approaches \(90^\circ\).`,
    ),
    { visualIds: ['vector-dot-product-video'], labIds: ['vector-dot-product-lab'] },
  ),
  section(
    'vectors-matrices-norms-matrix-transformations',
    copy('矩阵：看列向量如何移动空间', 'Matrices: Watch Columns Move Space'),
    copy(
      md`一个矩阵可以表示一个线性变换。线性变换必须保留两件事：

$$
T(\mathbf{u}+\mathbf{v})=T(\mathbf{u})+T(\mathbf{v}),
\qquad
T(c\mathbf{v})=cT(\mathbf{v}).
$$

这意味着直线仍然变成直线，原点仍然留在原点。平移 \(T(\mathbf{x})=\mathbf{x}+\mathbf{b}\) 不是线性变换，因为它把原点移走了；机器学习里的仿射层 \(W\mathbf{x}+\mathbf{b}\) 是“先线性变换，再平移”。

矩阵-向量乘法有两种读法。第一种按行读：

$$
(A\mathbf{x})_i=\sum_{j=1}^{n}a_{ij}x_j.
$$

第二种按列读：

$$
A\mathbf{x}
=
x_1\mathbf{a}_1+x_2\mathbf{a}_2+\cdots+x_n\mathbf{a}_n,
$$

其中 \(\mathbf{a}_j\) 是矩阵 \(A\) 的第 \(j\) 列。列读法更接近几何：\(\mathbf{x}\) 的每个坐标告诉我们要拿多少第 \(j\) 个输出方向。

二维时，矩阵的两列就是标准基向量的去向：

$$
A\mathbf{e}_1=\mathbf{a}_1,
\qquad
A\mathbf{e}_2=\mathbf{a}_2.
$$

一旦知道 \(\mathbf{e}_1\) 和 \(\mathbf{e}_2\) 被送到哪里，整个网格都会随之确定。determinant 则衡量单位面积如何缩放：\(|\det(A)|\) 是面积缩放因子；如果 \(\det(A)=0\)，二维区域被压成线或点，信息不可逆。

**手算例子。** 令

$$
A=
\begin{bmatrix}
2&1\\
0&3
\end{bmatrix},
\qquad
\mathbf{x}=
\begin{bmatrix}
4\\
-1
\end{bmatrix}.
$$

按列读：

$$
A\mathbf{x}
=4\begin{bmatrix}2\\0\end{bmatrix}
-1\begin{bmatrix}1\\3\end{bmatrix}
=
\begin{bmatrix}7\\-3\end{bmatrix}.
$$

下面的视频和实验都围绕同一件事：移动矩阵的列向量，观察整个空间、单位圆和 determinant 如何变化。`,
      md`A matrix can represent a linear transformation. A linear transformation preserves two rules:

$$
T(\mathbf{u}+\mathbf{v})=T(\mathbf{u})+T(\mathbf{v}),
\qquad
T(c\mathbf{v})=cT(\mathbf{v}).
$$

This means lines stay lines and the origin stays fixed. A translation \(T(\mathbf{x})=\mathbf{x}+\mathbf{b}\) is not linear because it moves the origin. A machine-learning affine layer \(W\mathbf{x}+\mathbf{b}\) is "linear transform first, shift second."

Matrix-vector multiplication has two readings. The row reading is

$$
(A\mathbf{x})_i=\sum_{j=1}^{n}a_{ij}x_j.
$$

The column reading is

$$
A\mathbf{x}
=
x_1\mathbf{a}_1+x_2\mathbf{a}_2+\cdots+x_n\mathbf{a}_n,
$$

where \(\mathbf{a}_j\) is column \(j\) of \(A\). The column reading is closer to geometry: each coordinate of \(\mathbf{x}\) tells how much of the \(j\)-th output direction to use.

In 2D, the two columns are exactly where the standard basis vectors go:

$$
A\mathbf{e}_1=\mathbf{a}_1,
\qquad
A\mathbf{e}_2=\mathbf{a}_2.
$$

Once you know where \(\mathbf{e}_1\) and \(\mathbf{e}_2\) land, the whole grid is determined. The determinant measures area scaling: \(|\det(A)|\) is the area factor. If \(\det(A)=0\), a 2D region collapses to a line or a point, so information cannot be inverted.

**Worked example.** Let

$$
A=
\begin{bmatrix}
2&1\\
0&3
\end{bmatrix},
\qquad
\mathbf{x}=
\begin{bmatrix}
4\\
-1
\end{bmatrix}.
$$

By columns,

$$
A\mathbf{x}
=4\begin{bmatrix}2\\0\end{bmatrix}
-1\begin{bmatrix}1\\3\end{bmatrix}
=
\begin{bmatrix}7\\-3\end{bmatrix}.
$$

The video and lab below both focus on one idea: move the matrix columns and watch the whole space, unit circle, and determinant change.`,
    ),
    { visualIds: ['matrix-transform-video'], labIds: ['matrix-transform-lab'] },
  ),
  section(
    'vectors-matrices-norms-special-matrices-rank-representation',
    copy('特殊矩阵、秩与线性变换表示', 'Special Matrices, Rank, and Representing Linear Transformations'),
    copy(
      md`矩阵作为线性变换的观点不能替代原有的矩阵类型和计算规则；它只是让这些规则更容易读。下面这些对象是后续章节会反复使用的基础。

| 类型 | 形式与含义 |
| --- | --- |
| 零矩阵 \(\mathbf{0}_{mn}\) | \(m\times n\) 矩阵，所有元素都是 \(0\)。 |
| 单位矩阵 \(I_n\) | 对角线为 \(1\)、其他位置为 \(0\)；满足 \(AI=A\)、\(I\mathbf{x}=\mathbf{x}\)。 |
| 对角矩阵 \(D\) | 非对角元素为 \(0\)，只按坐标方向缩放。 |
| 下三角矩阵 \(L\) | 主对角线上方全为 \(0\)，是 LU 分解里的核心对象。 |
| 上三角矩阵 \(U\) | 主对角线下方全为 \(0\)，可用回代快速求解。 |
| 置换矩阵 \(P\) | 每行每列恰好一个 \(1\)，其余为 \(0\)；\(P\mathbf{x}\) 会重排向量元素，且 \(P^{-1}=P^\top\)。 |
| 分块矩阵 | 把大矩阵切成子矩阵块，如 \(\begin{bmatrix}A&B\\C&D\end{bmatrix}\)，便于表达结构。 |

例如 \(4\times 4\) 单位矩阵为

$$
I_4=
\begin{bmatrix}
1&0&0&0\\
0&1&0&0\\
0&0&1&0\\
0&0&0&1
\end{bmatrix}.
$$

它的作用不是“改变”矩阵或向量，而是保留原对象：\(AI=A\)、\(I\mathbf{x}=\mathbf{x}\)。类似地，\(3\times 4\) 零矩阵可以写成

$$
\mathbf{0}_{34}=
\begin{bmatrix}
0&0&0&0\\
0&0&0&0\\
0&0&0&0
\end{bmatrix}.
$$

三角矩阵的结构也要保留：一个 \(n\times n\) 三角矩阵有 \(n(n-1)/2\) 个位置必须为零，另有 \(n(n+1)/2\) 个位置允许非零。零矩阵、单位矩阵和对角矩阵同时是下三角和上三角矩阵。

置换矩阵的例子是

$$
P=
\begin{bmatrix}
0&1&0&0\\
0&0&0&1\\
1&0&0&0\\
0&0&1&0
\end{bmatrix}.
$$

若 \(\mathbf{x}=[1,2,3,4]^\top\)，则

$$
P\mathbf{x}=[2,4,1,3]^\top.
$$

更一般地，如果 \(P_{ij}=1\)，那么 \((P\mathbf{x})_i=x_j\)。这就是为什么置换矩阵常用于行交换、主元选取和重新排序。分块矩阵也不只是排版技巧；当非对角块为零时，它变成 block diagonal matrix，表示若干子问题可以分开处理。

矩阵的 **rank** 是线性无关列的数量；也等于线性无关行的数量。若 \(A\in\mathbb{R}^{m\times n}\)，则

$$
\operatorname{rank}(A)\le \min(m,n).
$$

当等号成立时，矩阵 full rank；否则 rank deficient。方阵 \(A\) 可逆，意味着存在 \(A^{-1}\) 使得

$$
AA^{-1}=A^{-1}A=I.
$$

方阵可逆当且仅当它 full rank；不可逆的方阵称为 singular matrix。

矩阵-向量乘法需要同时会按行和按列计算。若 \(A\in\mathbb{R}^{m\times n}\)、\(\mathbf{x}\in\mathbb{R}^{n}\)，输出 \(\mathbf{b}=A\mathbf{x}\in\mathbb{R}^{m}\) 的第 \(i\) 个分量是

$$
b_i=\sum_{j=1}^{n}a_{ij}x_j.
$$

按列则是

$$
A\mathbf{x}=x_1\mathbf{a}_1+x_2\mathbf{a}_2+\cdots+x_n\mathbf{a}_n.
$$

**矩阵-向量计算例。** 令

$$
A=
\begin{bmatrix}
1&7&8&4\\
-5&3&2&2\\
0&5&6&6
\end{bmatrix},
\qquad
\mathbf{x}=
\begin{bmatrix}
1\\2\\0\\-4
\end{bmatrix}.
$$

按列组合：

$$
A\mathbf{x}
=1\begin{bmatrix}1\\-5\\0\end{bmatrix}
+2\begin{bmatrix}7\\3\\5\end{bmatrix}
+0\begin{bmatrix}8\\2\\6\end{bmatrix}
-4\begin{bmatrix}4\\2\\6\end{bmatrix}
=
\begin{bmatrix}-1\\-7\\-14\end{bmatrix}.
$$

线性变换的矩阵表示也必须保留。假设 \(V\) 的基为 \(\mathbf{v}_1,\mathbf{v}_2,\mathbf{v}_3\)，\(W\) 的基为 \(\mathbf{w}_1,\mathbf{w}_2\)，并且

$$
f(\mathbf{v}_1)=\mathbf{w}_1,\qquad
f(\mathbf{v}_2)=5\mathbf{w}_1-\mathbf{w}_2,\qquad
f(\mathbf{v}_3)=2\mathbf{w}_1+2\mathbf{w}_2.
$$

那么 \(f\) 在这两组基下的矩阵为

$$
\begin{bmatrix}
1&5&2\\
0&-1&2
\end{bmatrix}.
$$

矩阵表示依赖基的选择；换基后，同一个线性变换会写成不同矩阵。

常见二维算子也值得记住：

$$
\text{rotation: }
\begin{bmatrix}
\cos\theta&-\sin\theta\\
\sin\theta&\cos\theta
\end{bmatrix},
\qquad
\text{scale: }
\begin{bmatrix}
a&0\\
0&b
\end{bmatrix},
$$

$$
\text{reflection through origin: }
\begin{bmatrix}
-1&0\\
0&-1
\end{bmatrix}.
$$

平移

$$
\mathbf{y}=
\begin{bmatrix}
1&0\\
0&1
\end{bmatrix}
\mathbf{x}
+
\begin{bmatrix}
a\\b
\end{bmatrix}
$$

不是线性变换，因为它不把原点留在原点；这也是为什么神经网络层 \(W\mathbf{x}+\mathbf{b}\) 被称为仿射变换，而不是纯线性变换。`,
      md`Reading a matrix as a linear transformation should not replace the original matrix types and computation rules. It should make them easier to read. The following objects are used repeatedly in later chapters.

| Type | Form and meaning |
| --- | --- |
| Zero matrix \(\mathbf{0}_{mn}\) | An \(m\times n\) matrix whose entries are all \(0\). |
| Identity matrix \(I_n\) | Diagonal entries are \(1\), all others \(0\); it satisfies \(AI=A\) and \(I\mathbf{x}=\mathbf{x}\). |
| Diagonal matrix \(D\) | Off-diagonal entries are \(0\); it scales coordinate directions. |
| Lower triangular matrix \(L\) | All entries above the main diagonal are \(0\); central in LU decomposition. |
| Upper triangular matrix \(U\) | All entries below the main diagonal are \(0\); enables fast back substitution. |
| Permutation matrix \(P\) | Exactly one \(1\) in each row and column; \(P\mathbf{x}\) rearranges vector entries and \(P^{-1}=P^\top\). |
| Block matrix | A large matrix partitioned into submatrices, such as \(\begin{bmatrix}A&B\\C&D\end{bmatrix}\), to expose structure. |

For example, the \(4\times 4\) identity matrix is

$$
I_4=
\begin{bmatrix}
1&0&0&0\\
0&1&0&0\\
0&0&1&0\\
0&0&0&1
\end{bmatrix}.
$$

Its job is not to change a matrix or vector but to preserve it: \(AI=A\) and \(I\mathbf{x}=\mathbf{x}\). Similarly, the \(3\times 4\) zero matrix is

$$
\mathbf{0}_{34}=
\begin{bmatrix}
0&0&0&0\\
0&0&0&0\\
0&0&0&0
\end{bmatrix}.
$$

The structure of triangular matrices should also be kept: an \(n\times n\) triangular matrix has \(n(n-1)/2\) entries that must be zero and \(n(n+1)/2\) entries that may be nonzero. Zero, identity, and diagonal matrices are both lower triangular and upper triangular.

An example of a permutation matrix is

$$
P=
\begin{bmatrix}
0&1&0&0\\
0&0&0&1\\
1&0&0&0\\
0&0&1&0
\end{bmatrix}.
$$

If \(\mathbf{x}=[1,2,3,4]^\top\), then

$$
P\mathbf{x}=[2,4,1,3]^\top.
$$

More generally, if \(P_{ij}=1\), then \((P\mathbf{x})_i=x_j\). This is why permutation matrices are used for row swaps, pivoting, and reordering. Block matrices are also more than formatting; when the off-diagonal blocks are zero, a block diagonal matrix represents subproblems that can be handled separately.

The **rank** of a matrix is the number of linearly independent columns; it is also the number of linearly independent rows. If \(A\in\mathbb{R}^{m\times n}\), then

$$
\operatorname{rank}(A)\le \min(m,n).
$$

When equality holds, the matrix is full rank; otherwise it is rank deficient. A square matrix \(A\) is invertible when there is an \(A^{-1}\) such that

$$
AA^{-1}=A^{-1}A=I.
$$

A square matrix is invertible if and only if it is full rank. A non-invertible square matrix is called singular.

Matrix-vector multiplication should be computable by rows and by columns. If \(A\in\mathbb{R}^{m\times n}\), \(\mathbf{x}\in\mathbb{R}^{n}\), and \(\mathbf{b}=A\mathbf{x}\in\mathbb{R}^{m}\), then

$$
b_i=\sum_{j=1}^{n}a_{ij}x_j.
$$

By columns,

$$
A\mathbf{x}=x_1\mathbf{a}_1+x_2\mathbf{a}_2+\cdots+x_n\mathbf{a}_n.
$$

**Matrix-vector computation example.** Let

$$
A=
\begin{bmatrix}
1&7&8&4\\
-5&3&2&2\\
0&5&6&6
\end{bmatrix},
\qquad
\mathbf{x}=
\begin{bmatrix}
1\\2\\0\\-4
\end{bmatrix}.
$$

By column combination,

$$
A\mathbf{x}
=1\begin{bmatrix}1\\-5\\0\end{bmatrix}
+2\begin{bmatrix}7\\3\\5\end{bmatrix}
+0\begin{bmatrix}8\\2\\6\end{bmatrix}
-4\begin{bmatrix}4\\2\\6\end{bmatrix}
=
\begin{bmatrix}-1\\-7\\-14\end{bmatrix}.
$$

Matrix representations of linear transformations also need to be kept. Suppose \(V\) has basis \(\mathbf{v}_1,\mathbf{v}_2,\mathbf{v}_3\), \(W\) has basis \(\mathbf{w}_1,\mathbf{w}_2\), and

$$
f(\mathbf{v}_1)=\mathbf{w}_1,\qquad
f(\mathbf{v}_2)=5\mathbf{w}_1-\mathbf{w}_2,\qquad
f(\mathbf{v}_3)=2\mathbf{w}_1+2\mathbf{w}_2.
$$

Then the matrix for \(f\) in these bases is

$$
\begin{bmatrix}
1&5&2\\
0&-1&2
\end{bmatrix}.
$$

Matrix representation depends on the chosen bases. Change the bases, and the same linear transformation gets a different matrix.

Common 2D operators are also worth remembering:

$$
\text{rotation: }
\begin{bmatrix}
\cos\theta&-\sin\theta\\
\sin\theta&\cos\theta
\end{bmatrix},
\qquad
\text{scale: }
\begin{bmatrix}
a&0\\
0&b
\end{bmatrix},
$$

$$
\text{reflection through the origin: }
\begin{bmatrix}
-1&0\\
0&-1
\end{bmatrix}.
$$

Translation

$$
\mathbf{y}=
\begin{bmatrix}
1&0\\
0&1
\end{bmatrix}
\mathbf{x}
+
\begin{bmatrix}
a\\b
\end{bmatrix}
$$

is not a linear transformation because it does not keep the origin fixed. This is why a neural-network layer \(W\mathbf{x}+\mathbf{b}\) is called affine, not purely linear.`,
    ),
  ),
  section(
    'vectors-matrices-norms-vector-norms-errors',
    copy('向量范数：把误差变成一个数', 'Vector Norms: Turning Error into One Number'),
    copy(
      md`范数是向量大小的统一语言。一个向量范数 \(\|\cdot\|\) 必须满足：

1. \(\|\mathbf{x}\|\ge 0\)，且只有零向量的范数为 \(0\)。
2. \(\|\alpha\mathbf{x}\|=|\alpha|\|\mathbf{x}\|\)。
3. \(\|\mathbf{x}+\mathbf{y}\|\le \|\mathbf{x}\|+\|\mathbf{y}\|\)。

常见的 \(p\)-范数为

$$
\|\mathbf{x}\|_p=
\left(\sum_{i=1}^{n}|x_i|^p\right)^{1/p},
\qquad p\ge 1.
$$

三种最常见选择各有侧重点：

| 范数 | 公式 | 适合观察什么 |
| --- | --- | --- |
| \(1\)-范数 | \(\|\mathbf{x}\|_1=\sum_i |x_i|\) | 总误差、稀疏性、绝对偏差 |
| \(2\)-范数 | \(\|\mathbf{x}\|_2=\sqrt{\sum_i x_i^2}\) | 欧几里得长度、能量、梯度大小 |
| \(\infty\)-范数 | \(\|\mathbf{x}\|_\infty=\max_i |x_i|\) | 最坏坐标误差 |

**手算例子。** 对

$$
\mathbf{w}=\begin{bmatrix}-3\\5\\0\\1\end{bmatrix},
$$

有

$$
\|\mathbf{w}\|_1=3+5+0+1=9,
$$

$$
\|\mathbf{w}\|_2=\sqrt{(-3)^2+5^2+0^2+1^2}=\sqrt{35}\approx 5.92,
$$

$$
\|\mathbf{w}\|_\infty=\max(3,5,0,1)=5.
$$

用范数衡量向量近似误差时，最常见的两个量是

$$
\text{absolute error}=\|\mathbf{x}_{\text{true}}-\mathbf{x}_{\text{approx}}\|,
$$

$$
\text{relative error}=
\frac{\|\mathbf{x}_{\text{true}}-\mathbf{x}_{\text{approx}}\|}
{\|\mathbf{x}_{\text{true}}\|}.
$$

注意范数不是线性的：通常

$$
\|\mathbf{x}-\mathbf{y}\|\ne \|\mathbf{x}\|-\|\mathbf{y}\|.
$$

例如 \(\mathbf{x}=(3,0)\)、\(\mathbf{y}=(0,4)\) 时，\(\|\mathbf{x}-\mathbf{y}\|_2=5\)，但 \(\|\mathbf{x}\|_2-\|\mathbf{y}\|_2=-1\)。`,
      md`A norm is the common language for vector size. A vector norm \(\|\cdot\|\) must satisfy:

1. \(\|\mathbf{x}\|\ge 0\), and only the zero vector has norm \(0\).
2. \(\|\alpha\mathbf{x}\|=|\alpha|\|\mathbf{x}\|\).
3. \(\|\mathbf{x}+\mathbf{y}\|\le \|\mathbf{x}\|+\|\mathbf{y}\|\).

The common \(p\)-norm is

$$
\|\mathbf{x}\|_p=
\left(\sum_{i=1}^{n}|x_i|^p\right)^{1/p},
\qquad p\ge 1.
$$

The three most common choices emphasize different things:

| Norm | Formula | What it observes well |
| --- | --- | --- |
| \(1\)-norm | \(\|\mathbf{x}\|_1=\sum_i |x_i|\) | Total error, sparsity, absolute deviation |
| \(2\)-norm | \(\|\mathbf{x}\|_2=\sqrt{\sum_i x_i^2}\) | Euclidean length, energy, gradient magnitude |
| \(\infty\)-norm | \(\|\mathbf{x}\|_\infty=\max_i |x_i|\) | Worst coordinate error |

**Worked example.** For

$$
\mathbf{w}=\begin{bmatrix}-3\\5\\0\\1\end{bmatrix},
$$

we get

$$
\|\mathbf{w}\|_1=3+5+0+1=9,
$$

$$
\|\mathbf{w}\|_2=\sqrt{(-3)^2+5^2+0^2+1^2}=\sqrt{35}\approx 5.92,
$$

$$
\|\mathbf{w}\|_\infty=\max(3,5,0,1)=5.
$$

When measuring approximation error, the two most common quantities are

$$
\text{absolute error}=\|\mathbf{x}_{\text{true}}-\mathbf{x}_{\text{approx}}\|,
$$

$$
\text{relative error}=
\frac{\|\mathbf{x}_{\text{true}}-\mathbf{x}_{\text{approx}}\|}
{\|\mathbf{x}_{\text{true}}\|}.
$$

Norms are not linear. In general,

$$
\|\mathbf{x}-\mathbf{y}\|\ne \|\mathbf{x}\|-\|\mathbf{y}\|.
$$

For example, if \(\mathbf{x}=(3,0)\) and \(\mathbf{y}=(0,4)\), then \(\|\mathbf{x}-\mathbf{y}\|_2=5\), while \(\|\mathbf{x}\|_2-\|\mathbf{y}\|_2=-1\).`,
    ),
  ),
  section(
    'vectors-matrices-norms-matrix-norms-amplification',
    copy('矩阵范数：线性层最多会放大多少', 'Matrix Norms: How Much a Linear Layer Can Amplify'),
    copy(
      md`矩阵范数把矩阵的“大小”变成一个数。一个 **general matrix norm** \(\|A\|\) 必须满足：

| 性质 | 公式 |
| --- | --- |
| 非负性 | \(\|A\|\ge 0\) |
| 正定性 | \(\|A\|=0\) 当且仅当 \(A=0\) |
| 齐次性 | \(\|\lambda A\|=|\lambda|\,\|A\|\) |
| 三角不等式 | \(\|A+B\|\le \|A\|+\|B\|\) |

最有解释力的一类是**诱导矩阵范数**，也叫 operator norm。它总是和某个向量范数配对：

$$
\|A\|=\max_{\|\mathbf{x}\|=1}\|A\mathbf{x}\|.
$$

它问的是：在所有单位长度输入里，矩阵最多能把输出长度放大到多少。等价地，

$$
\|A\|=
\max_{\mathbf{x}\ne 0}
\frac{\|A\mathbf{x}\|}{\|\mathbf{x}\|}.
$$

诱导范数除了满足一般矩阵范数的四条性质，还满足两个 submultiplicative 条件：

$$
\|A\mathbf{x}\|\le \|A\|\,\|\mathbf{x}\|.
$$

$$
\|AB\|\le \|A\|\,\|B\|.
$$

第一条说明单个线性层最多怎样放大向量；第二条说明连续乘上多个矩阵时，放大倍数最多怎样相乘。这是数值计算和深度学习都很在意的稳定性语言：如果 \(\|A\|\) 很大，一个很小的输入扰动也可能被放大成明显输出扰动。

Frobenius 范数为

$$
\|A\|_F=\sqrt{\sum_{i,j}a_{ij}^2}.
$$

它像是把矩阵摊平成一个长向量再取 \(2\)-范数；直观、好算，但它不是诱导范数。

**Frobenius 例子。** 对

$$
Q=
\begin{bmatrix}
1&4\\
6&5
\end{bmatrix},
$$

有

$$
\|Q\|_F
=\sqrt{1^2+4^2+6^2+5^2}
=\sqrt{78}
\approx 8.83.
$$

矩阵 \(p\)-范数由向量 \(p\)-范数诱导：

$$
\|A\|_p:=\max_{\|\mathbf{x}\|_p=1}\|A\mathbf{x}\|_p.
$$

三个特殊情形需要会直接计算：

| 范数 | 计算方式 |
| --- | --- |
| \(\|A\|_1\) | 最大绝对列和：\(\max_j \sum_i |a_{ij}|\) |
| \(\|A\|_2\) | 最大奇异值：\(\max_k\sigma_k\) |
| \(\|A\|_\infty\) | 最大绝对行和：\(\max_i \sum_j |a_{ij}|\) |

**\(p\)-范数例子。** 令

$$
C=
\begin{bmatrix}
3&-2\\
-1&3
\end{bmatrix}.
$$

列绝对值和分别为

$$
|3|+|-1|=4,
\qquad
|-2|+|3|=5,
$$

所以

$$
\|C\|_1=5.
$$

行绝对值和分别为

$$
|3|+|-2|=5,
\qquad
|-1|+|3|=4,
$$

所以

$$
\|C\|_\infty=5.
$$

为了计算 \(2\)-范数，需要找 \(C^\top C\) 的最大特征值：

$$
C^\top C=
\begin{bmatrix}
3&-1\\
-2&3
\end{bmatrix}
\begin{bmatrix}
3&-2\\
-1&3
\end{bmatrix}
=
\begin{bmatrix}
10&-9\\
-9&13
\end{bmatrix}.
$$

于是

$$
\det(C^\top C-\lambda I)
=
\det
\begin{bmatrix}
10-\lambda&-9\\
-9&13-\lambda
\end{bmatrix}
=0.
$$

这给出

$$
(10-\lambda)(13-\lambda)-81=0,
\qquad
\lambda^2 - 23\lambda + 49 = 0.
$$

最大特征值是

$$
\lambda_{\max}=\frac{23+3\sqrt{37}}{2},
$$

所以

$$
\|C\|_2
=\sqrt{\lambda_{\max}}
=\sqrt{\frac{23+3\sqrt{37}}{2}}
\approx 4.54.
$$

如果输入误差满足 \(\|\delta\mathbf{x}\|_1\le 0.01\)，那么输出误差有保守界

$$
\|C\delta\mathbf{x}\|_1
\le
\|C\|_1\|\delta\mathbf{x}\|_1
\le
0.05.
$$`,
      md`A matrix norm turns matrix size into one number. A **general matrix norm** \(\|A\|\) must satisfy:

| Property | Formula |
| --- | --- |
| Positivity | \(\|A\|\ge 0\) |
| Definiteness | \(\|A\|=0\) if and only if \(A=0\) |
| Homogeneity | \(\|\lambda A\|=|\lambda|\,\|A\|\) |
| Triangle inequality | \(\|A+B\|\le \|A\|+\|B\|\) |

The most interpretable class is the **induced matrix norm**, also called an operator norm. It is paired with a particular vector norm:

$$
\|A\|=\max_{\|\mathbf{x}\|=1}\|A\mathbf{x}\|.
$$

It asks: among all unit-length inputs, how large can the output become? Equivalently,

$$
\|A\|=
\max_{\mathbf{x}\ne 0}
\frac{\|A\mathbf{x}\|}{\|\mathbf{x}\|}.
$$

Besides the four general matrix-norm properties, induced norms satisfy two submultiplicative conditions:

$$
\|A\mathbf{x}\|\le \|A\|\,\|\mathbf{x}\|.
$$

$$
\|AB\|\le \|A\|\,\|B\|.
$$

The first inequality bounds how much one linear layer can amplify a vector; the second bounds the amplification from multiplying several matrices. This is the language of stability in both numerical computing and deep learning. If \(\|A\|\) is large, a tiny input perturbation can become a visible output perturbation.

The Frobenius norm is

$$
\|A\|_F=\sqrt{\sum_{i,j}a_{ij}^2}.
$$

It is like flattening the matrix into one long vector and taking the \(2\)-norm. It is intuitive and easy to compute, but it is not an induced norm.

**Frobenius example.** For

$$
Q=
\begin{bmatrix}
1&4\\
6&5
\end{bmatrix},
$$

we get

$$
\|Q\|_F
=\sqrt{1^2+4^2+6^2+5^2}
=\sqrt{78}
\approx 8.83.
$$

The matrix \(p\)-norm is induced by the vector \(p\)-norm:

$$
\|A\|_p:=\max_{\|\mathbf{x}\|_p=1}\|A\mathbf{x}\|_p.
$$

Three special cases should be directly computable:

| Norm | Computation |
| --- | --- |
| \(\|A\|_1\) | Maximum absolute column sum: \(\max_j \sum_i |a_{ij}|\) |
| \(\|A\|_2\) | Largest singular value: \(\max_k\sigma_k\) |
| \(\|A\|_\infty\) | Maximum absolute row sum: \(\max_i \sum_j |a_{ij}|\) |

**\(p\)-norm example.** Let

$$
C=
\begin{bmatrix}
3&-2\\
-1&3
\end{bmatrix}.
$$

The absolute column sums are

$$
|3|+|-1|=4,
\qquad
|-2|+|3|=5,
$$

so

$$
\|C\|_1=5.
$$

The absolute row sums are

$$
|3|+|-2|=5,
\qquad
|-1|+|3|=4,
$$

so

$$
\|C\|_\infty=5.
$$

To compute the \(2\)-norm, find the largest eigenvalue of \(C^\top C\):

$$
C^\top C=
\begin{bmatrix}
3&-1\\
-2&3
\end{bmatrix}
\begin{bmatrix}
3&-2\\
-1&3
\end{bmatrix}
=
\begin{bmatrix}
10&-9\\
-9&13
\end{bmatrix}.
$$

Thus

$$
\det(C^\top C-\lambda I)
=
\det
\begin{bmatrix}
10-\lambda&-9\\
-9&13-\lambda
\end{bmatrix}
=0.
$$

This gives

$$
(10-\lambda)(13-\lambda)-81=0,
\qquad
\lambda^2 - 23\lambda + 49 = 0.
$$

The largest eigenvalue is

$$
\lambda_{\max}=\frac{23+3\sqrt{37}}{2},
$$

so

$$
\|C\|_2
=\sqrt{\lambda_{\max}}
=\sqrt{\frac{23+3\sqrt{37}}{2}}
\approx 4.54.
$$

If an input error satisfies \(\|\delta\mathbf{x}\|_1\le 0.01\), then the output error has the conservative bound

$$
\|C\delta\mathbf{x}\|_1
\le
\|C\|_1\|\delta\mathbf{x}\|_1
\le
0.05.
$$`,
    ),
  ),
  section(
    'vectors-matrices-norms-ml-connection',
    copy('机器学习中的具体落点', 'Concrete Machine-Learning Connections'),
    copy(
      md`这一章的对象在机器学习里不是抽象背景，而是每天都会碰到的数据结构。

**Embedding 相似度。** 文本、图片和用户行为都可以被编码成向量。推荐系统或检索系统常比较

$$
\frac{\mathbf{x}^{\top}\mathbf{y}}{\|\mathbf{x}\|_2\|\mathbf{y}\|_2}
$$

来判断两个表示方向是否接近。

**线性层和特征混合。** 神经网络中的全连接层

$$
\mathbf{h}=W\mathbf{x}+\mathbf{b}
$$

先用矩阵 \(W\) 混合特征，再用 bias 平移。看列向量可以理解每个输入特征如何贡献到输出特征；看行向量可以理解每个输出特征如何从输入中取加权和。

**梯度范数。** 优化时常监控 \(\|\nabla L(\theta)\|_2\)。范数太小可能表示接近平坦区或收敛；范数太大可能导致一步更新过猛，需要 clipping 或调整学习率。

**权重范数和正则化。** L2 regularization 惩罚 \(\|W\|_F^2\)，鼓励权重不要过大。它不是在说“每个权重都必须小”，而是在控制整体复杂度和数值尺度。

**稳定性。** 如果一层的矩阵范数很大，输入噪声可能被放大；如果许多层都放大，梯度和激活都可能变得不稳定。这也是谱范数、归一化和 residual 结构在深度模型中反复出现的原因。

一个实用判断是：先问“我在比较方向、长度、总误差，还是最坏误差？”再选点积、余弦、\(1\)-范数、\(2\)-范数或 \(\infty\)-范数。`,
      md`The objects in this chapter are not background abstractions in machine learning. They are everyday data structures.

**Embedding similarity.** Text, images, and user behavior can all be encoded as vectors. Retrieval and recommendation systems often compare

$$
\frac{\mathbf{x}^{\top}\mathbf{y}}{\|\mathbf{x}\|_2\|\mathbf{y}\|_2}
$$

to decide whether two representations point in similar directions.

**Linear layers and feature mixing.** A fully connected neural-network layer

$$
\mathbf{h}=W\mathbf{x}+\mathbf{b}
$$

first mixes features with \(W\), then shifts by the bias. Columns show how each input feature contributes to output features; rows show how each output feature is a weighted sum of inputs.

**Gradient norms.** During optimization, it is common to monitor \(\|\nabla L(\theta)\|_2\). A very small norm can indicate a flat region or convergence. A very large norm can make an update too aggressive, requiring clipping or a learning-rate change.

**Weight norms and regularization.** L2 regularization penalizes \(\|W\|_F^2\), encouraging weights not to become too large. It does not say every individual weight must be tiny; it controls overall scale and complexity.

**Stability.** If a layer has a large matrix norm, input noise can be amplified. If many layers amplify, gradients and activations can become unstable. This is one reason spectral norms, normalization, and residual structures appear repeatedly in deep models.

A practical rule: first ask whether you are comparing direction, length, total error, or worst-case error. Then choose dot product, cosine, \(1\)-norm, \(2\)-norm, or \(\infty\)-norm accordingly.`,
    ),
  ),
  section(
    'vectors-matrices-norms-review',
    copy('复习问题', 'Review Questions'),
    copy(
      md`1. 什么是向量空间？它必须对哪两种运算封闭？
2. 什么是 inner product？给定一个具体函数 \(f(\mathbf{x},\mathbf{y})\) 时，如何判断它是否能作为内积？
3. 点积为正、为零、为负分别说明两个向量夹角有什么特征？为什么 cosine similarity 要除以两个向量长度？
4. 什么是向量范数？一个函数要成为 norm，必须满足哪些性质？
5. 给定一个具体函数 \(f(\mathbf{x})\) 时，如何判断它是否是范数？
6. 什么是 induced matrix norm？它衡量的是矩阵对向量范数的哪种放大？
7. 诱导矩阵范数除了一般矩阵范数性质，还满足哪些 submultiplicative 性质？如何使用 \(\|A\mathbf{x}\|\le \|A\|\|\mathbf{x}\|\)？
8. 对诱导范数，如果已知几组 \(\|\mathbf{x}\|\) 和 \(\|A\mathbf{x}\|\)，如何得到 \(\|A\|\) 的 lower bound？
9. 什么是 Frobenius matrix norm？为什么它不是诱导范数？
10. 给定一个向量，如何计算它的 \(1\)-范数、\(2\)-范数和 \(\infty\)-范数？
11. 给定一个矩阵，如何计算它的 \(1\)-范数、\(2\)-范数和 \(\infty\)-范数？
12. 零矩阵、单位矩阵、对角矩阵、三角矩阵、置换矩阵和分块矩阵各有什么结构特征？特殊矩阵的范数（如对角矩阵、正交矩阵）有什么规律？
13. 如何把 \(A\mathbf{x}\) 同时读成行内积和列向量线性组合？为什么列向量解释了基向量的去向？
14. 为什么平移不是线性变换？有限维空间之间的线性变换如何依赖基的选择表示成矩阵？`,
      md`1. What is a vector space? Under which two operations must it be closed?
2. What is an inner product? Given a concrete function \(f(\mathbf{x},\mathbf{y})\), how can you decide whether it is an inner product?
3. What do positive, zero, and negative dot products say about the angle between two vectors? Why does cosine similarity divide by both vector lengths?
4. What is a vector norm? What properties must a function satisfy to be a norm?
5. Given a concrete function \(f(\mathbf{x})\), how can you decide whether it is a norm?
6. What is an induced matrix norm? What amplification of vector norms does it measure?
7. Besides the general matrix-norm properties, which submultiplicative properties do induced norms satisfy? How do you use \(\|A\mathbf{x}\|\le \|A\|\|\mathbf{x}\|\)?
8. For an induced norm, if you know \(\|\mathbf{x}\|\) and \(\|A\mathbf{x}\|\) for several vectors, how can you obtain a lower bound on \(\|A\|\)?
9. What is the Frobenius matrix norm? Why is it not an induced norm?
10. For a given vector, how do you compute the \(1\)-, \(2\)-, and \(\infty\)-norms?
11. For a given matrix, how do you compute the \(1\)-, \(2\)-, and \(\infty\)-norms?
12. What structural features define zero, identity, diagonal, triangular, permutation, and block matrices? What patterns do norms of special matrices, such as diagonal or orthogonal matrices, follow?
13. How can \(A\mathbf{x}\) be read both as row inner products and as a column-vector linear combination? Why do the columns explain where basis vectors go?
14. Why is translation not a linear transformation? How does the matrix representation of a finite-dimensional linear transformation depend on the chosen bases?`,
    ),
  ),
]

export function buildVectorMatrixNormsModule(importedModule: MathLabModule): MathLabModule {
  return {
    ...importedModule,
    title: copy('向量、矩阵与范数', 'Vectors, Matrices, and Norms'),
    subtitle: copy(
      '把数组读成方向，把矩阵读成空间变换，再用范数量化距离、误差和放大。',
      'Read arrays as directions, matrices as transformations, and norms as distance, error, and amplification.',
    ),
    estimatedMinutes: 38,
    prerequisites: ['monte-carlo'],
    aiModelConnections: [
      copy(
        'Embedding 相似度、线性层权重、梯度范数、正则化和数值稳定性都依赖本章的向量、矩阵与范数语言。',
        'Embedding similarity, linear-layer weights, gradient norms, regularization, and numerical stability all depend on the vector, matrix, and norm language in this chapter.',
      ),
    ],
    learningObjectives: [
      copy('理解 vector space、basis、span、linear independence 和 inner product 的定义与作用。', 'Understand vector spaces, basis, span, linear independence, and inner products.'),
      copy('识别 linear transformation，并解释平移为什么不是线性变换。', 'Identify linear transformations and explain why translation is not linear.'),
      copy('识别零矩阵、单位矩阵、对角矩阵、三角矩阵、置换矩阵和分块矩阵，并说明它们的用途。', 'Recognize zero, identity, diagonal, triangular, permutation, and block matrices and describe their uses.'),
      copy('执行矩阵-向量乘法，并同时用行内积和列向量线性组合解释结果。', 'Perform matrix-vector multiplication and explain it as row inner products and as a column-vector linear combination.'),
      copy('把有限维空间之间的线性变换表示成矩阵，并说明表示依赖基的选择。', 'Represent finite-dimensional linear transformations as matrices and explain the role of the chosen bases.'),
      copy('计算向量范数、Frobenius 范数和诱导矩阵范数，用它们衡量大小、误差和放大。', 'Evaluate vector norms, Frobenius norms, and induced matrix norms to measure magnitude, error, and amplification.'),
    ],
    concepts: [
      {
        id: 'dot-product-cosine-similarity',
        name: copy('点积与余弦相似度', 'Dot Product and Cosine Similarity'),
        formulaLatex: '\\operatorname{cosine}(\\mathbf{x},\\mathbf{y})=\\frac{\\mathbf{x}^{\\top}\\mathbf{y}}{\\|\\mathbf{x}\\|_2\\|\\mathbf{y}\\|_2}',
        variables: [
          {
            symbol: '\\mathbf{x}^{\\top}\\mathbf{y}',
            description: copy('两个向量逐坐标相乘再相加，也等于长度乘以夹角余弦。', 'The coordinate-wise products summed, also equal to lengths times the cosine of the angle.'),
          },
          {
            symbol: '\\|\\mathbf{x}\\|_2',
            description: copy('向量的欧几里得长度。', 'The Euclidean length of the vector.'),
          },
          {
            symbol: '\\theta',
            description: copy('两个向量之间的夹角。', 'The angle between the two vectors.'),
          },
        ],
        plainExplanation: copy(
          '点积把长度和方向一起编码；余弦相似度去掉长度，只保留方向接近程度。',
          'The dot product encodes length and direction together; cosine similarity removes length and keeps directional agreement.',
        ),
        geometricIntuition: copy(
          '同向时为正，垂直时为零，反向时为负；投影长度由点积决定。',
          'It is positive for aligned vectors, zero for perpendicular vectors, and negative for opposite directions; projection length is controlled by the dot product.',
        ),
        numericalExample: copy(
          md`\((3,4)\cdot(4,0)=12\)，长度分别为 \(5\) 和 \(4\)，所以余弦相似度为 \(0.6\)。`,
          md`\((3,4)\cdot(4,0)=12\), with lengths \(5\) and \(4\), so cosine similarity is \(0.6\).`,
        ),
        codeExample:
          'const dot = (a, b) => a.reduce((sum, value, i) => sum + value * b[i], 0)\nconst norm = (a) => Math.hypot(...a)\nconst cosine = (a, b) => dot(a, b) / (norm(a) * norm(b))\n\nconsole.log(cosine([3, 4], [4, 0])) // 0.6',
        modelConnection: copy(
          'Embedding 检索常用余弦相似度判断两个语义向量是否指向相近方向。',
          'Embedding retrieval often uses cosine similarity to decide whether two semantic vectors point in similar directions.',
        ),
      },
      {
        id: 'matrix-as-linear-transform',
        name: copy('矩阵作为线性变换', 'Matrix as Linear Transformation'),
        formulaLatex: 'A\\mathbf{x}=x_1\\mathbf{a}_1+x_2\\mathbf{a}_2+\\cdots+x_n\\mathbf{a}_n',
        variables: [
          {
            symbol: '\\mathbf{a}_j',
            description: copy('矩阵 \(A\) 的第 \(j\) 列，也是第 \(j\) 个基方向的去向。', 'Column \(j\) of \(A\), also where the \(j\)-th basis direction lands.'),
          },
          {
            symbol: 'x_j',
            description: copy('输入向量在第 \(j\) 个基方向上的坐标。', 'The coordinate of the input along the \(j\)-th basis direction.'),
          },
        ],
        plainExplanation: copy(
          '矩阵-向量乘法把输入坐标变成对矩阵列向量的加权混合。',
          'Matrix-vector multiplication turns input coordinates into a weighted mixture of matrix columns.',
        ),
        geometricIntuition: copy(
          '移动基向量会决定整个网格如何被拉伸、剪切、旋转或压扁。',
          'Moving the basis vectors determines how the whole grid stretches, shears, rotates, or collapses.',
        ),
        numericalExample: copy(
          md`若 \(A=\begin{bmatrix}2&1\\0&3\end{bmatrix}\)、\(\mathbf{x}=(4,-1)\)，则 \(A\mathbf{x}=4(2,0)-1(1,3)=(7,-3)\)。`,
          md`If \(A=\begin{bmatrix}2&1\\0&3\end{bmatrix}\) and \(\mathbf{x}=(4,-1)\), then \(A\mathbf{x}=4(2,0)-1(1,3)=(7,-3)\).`,
        ),
        modelConnection: copy(
          '神经网络线性层 \(W\mathbf{x}+\mathbf{b}\) 中，\(W\) 负责混合输入特征。',
          'In a neural-network layer \(W\mathbf{x}+\mathbf{b}\), \(W\) mixes input features.',
        ),
      },
      {
        id: 'induced-matrix-norm',
        name: copy('诱导矩阵范数', 'Induced Matrix Norm'),
        formulaLatex: '\\|A\\|=\\max_{\\|\\mathbf{x}\\|=1}\\|A\\mathbf{x}\\|',
        variables: [
          {
            symbol: '\\|\\mathbf{x}\\|=1',
            description: copy('只观察单位长度输入，排除输入本身大小的影响。', 'Restricts attention to unit-length inputs, removing the effect of input size.'),
          },
          {
            symbol: '\\|A\\mathbf{x}\\|',
            description: copy('矩阵作用后的输出长度。', 'The output length after applying the matrix.'),
          },
        ],
        plainExplanation: copy(
          '诱导范数衡量矩阵对输入范数的最大放大倍数。',
          'An induced norm measures the largest possible amplification of input norm by a matrix.',
        ),
        geometricIntuition: copy(
          '把单位圆送入矩阵后，最长半径就是 \(2\)-范数下的最大拉伸。',
          'After sending the unit circle through a matrix, the longest radius is the maximum stretch in the \(2\)-norm.',
        ),
        numericalExample: copy(
          md`若 \(\|C\|_1=5\) 且 \(\|\delta\mathbf{x}\|_1\le0.01\)，则 \(\|C\delta\mathbf{x}\|_1\le0.05\)。`,
          md`If \(\|C\|_1=5\) and \(\|\delta\mathbf{x}\|_1\le0.01\), then \(\|C\delta\mathbf{x}\|_1\le0.05\).`,
        ),
        modelConnection: copy(
          '矩阵范数帮助判断线性层是否会放大噪声、激活或梯度。',
          'Matrix norms help judge whether a linear layer may amplify noise, activations, or gradients.',
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
        id: 'vector-span-norm-video',
        type: 'manim-video',
        title: copy('从 span 到误差长度', 'From Span to Error Length'),
        assetPath: '/manim/math-lab/vector-span-norm.mp4',
        posterPath: '/manim/math-lab/vector-span-norm.svg',
        transcript: copy(
          md`动画先把两个方向组合成目标向量，再展示方向相关时 span 如何塌成一条线，最后把近似误差读成一个向量长度。`,
          md`The animation combines two directions into a target vector, shows how dependent directions collapse the span to a line, and then reads approximation error as vector length.`,
        ),
        learningPurpose: copy(
          '用动态画面连接 span、线性相关和范数三个容易分散理解的概念。',
          'Use motion to connect span, linear dependence, and norm, three ideas that are easy to learn separately but should be linked.',
        ),
      },
      {
        id: 'vector-dot-product-video',
        type: 'manim-video',
        title: copy('点积如何读取夹角', 'How the Dot Product Reads Angle'),
        assetPath: '/manim/math-lab/vector-dot-product.mp4',
        posterPath: '/manim/math-lab/vector-dot-product.svg',
        transcript: copy(
          md`动画依次展示两个向量夹角很小、接近垂直和方向相反时，点积从正数变到接近零再到负数。`,
          md`The animation shows the dot product moving from positive to near zero to negative as two vectors go from aligned to nearly perpendicular to opposite.`,
        ),
        learningPurpose: copy(
          '把点积从代数计算连接到方向相似度，为 embedding 相似度做准备。',
          'Connect the dot product from algebraic computation to directional similarity, preparing for embedding similarity.',
        ),
      },
      {
        id: 'matrix-transform-video',
        type: 'manim-video',
        title: copy('矩阵移动基向量', 'A Matrix Moves the Basis Vectors'),
        assetPath: '/manim/math-lab/matrix-transform.mp4',
        posterPath: '/manim/math-lab/matrix-transform.svg',
        transcript: copy(
          md`动画展示 \(e_1\)、\(e_2\) 被矩阵送到新位置后，整张网格跟随变形；最后 determinant 接近零时，空间被压扁。`,
          md`The animation shows \(e_1\) and \(e_2\) moving to new positions, the whole grid following, and then the space collapsing when the determinant is near zero.`,
        ),
        learningPurpose: copy(
          '帮助学生把矩阵列向量、基向量去向和 determinant 几何意义连在一起。',
          'Help students connect matrix columns, moved basis vectors, and the geometric meaning of the determinant.',
        ),
      },
    ],
    labs: [
      {
        id: 'vector-dot-product-lab',
        title: copy('向量点积与投影实验', 'Vector Dot Product and Projection Lab'),
        type: 'interactive-visual',
        componentName: 'VectorDotProductLab',
        successCriteria: [
          copy('能解释点积正负号和两个向量夹角之间的关系。', 'Explain the relationship between the sign of the dot product and the angle between two vectors.'),
          copy('能通过拖动端点观察余弦相似度和投影如何变化。', 'Observe how cosine similarity and projection change by dragging endpoints.'),
        ],
      },
      {
        id: 'matrix-transform-lab',
        title: copy('矩阵变换与 determinant 实验', 'Matrix Transform and Determinant Lab'),
        type: 'interactive-visual',
        componentName: 'MatrixTransformLab',
        successCriteria: [
          copy('能根据 \(W\mathbf{e}_1\)、\(W\mathbf{e}_2\) 描述矩阵如何移动空间。', 'Describe how a matrix moves space from \(W\mathbf{e}_1\) and \(W\mathbf{e}_2\).'),
          copy('能解释 determinant 接近零时为什么变换接近不可逆。', 'Explain why a transformation becomes nearly non-invertible when the determinant is near zero.'),
        ],
      },
    ],
    quizzes: [
      {
        id: 'vectors-matrices-norms-beginner-arrow',
        type: 'single-choice',
        prompt: copy('在 AI 数学里，把一排特征数画成箭头，最先帮助我们看见什么？', 'In AI math, what does drawing a row of feature numbers as an arrow help us see first?'),
        choices: [
          {
            id: 'direction-and-length',
            label: copy('样本在特征空间里的方向和长度。', 'The sample direction and length in feature space.'),
          },
          {
            id: 'file-format',
            label: copy('图片文件的压缩格式。', 'The image file compression format.'),
          },
          {
            id: 'random-label',
            label: copy('训练标签一定会被随机打乱。', 'Training labels must be randomly shuffled.'),
          },
        ],
        answer: 'direction-and-length',
        explanation: copy(
          '向量把多项特征放进同一个空间。方向帮助比较相似度，长度帮助比较规模、误差或强度。',
          'A vector places multiple features in one space. Direction supports similarity comparisons, and length supports scale, error, or strength comparisons.',
        ),
        misconceptionTags: ['vector-is-only-list'],
        revisitVisualId: 'vector-dot-product-video',
      },
      {
        id: 'vectors-matrices-norms-dot-sign',
        type: 'single-choice',
        prompt: copy('若两个非零向量的点积为 \(0\)，最直接说明什么？', 'If two nonzero vectors have dot product \(0\), what does that directly indicate?'),
        choices: [
          {
            id: 'orthogonal',
            label: copy('它们互相垂直，方向没有投影重叠。', 'They are perpendicular, with no projection overlap.'),
          },
          {
            id: 'same-length',
            label: copy('它们长度一定相同。', 'They must have the same length.'),
          },
          {
            id: 'same-direction',
            label: copy('它们方向一定相同。', 'They must point in the same direction.'),
          },
        ],
        answer: 'orthogonal',
        explanation: copy(
          md`\(\mathbf{x}^{\top}\mathbf{y}=\|\mathbf{x}\|_2\|\mathbf{y}\|_2\cos\theta\)。非零向量点积为 \(0\) 时，只能是 \(\cos\theta=0\)，即夹角为 \(90^\circ\)。`,
          md`\(\mathbf{x}^{\top}\mathbf{y}=\|\mathbf{x}\|_2\|\mathbf{y}\|_2\cos\theta\). For nonzero vectors, dot product \(0\) means \(\cos\theta=0\), so the angle is \(90^\circ\).`,
        ),
        misconceptionTags: ['dot-product-is-length-only'],
        revisitVisualId: 'vector-dot-product-video',
      },
      {
        id: 'vectors-matrices-norms-column-reading',
        type: 'single-choice',
        prompt: copy('在列向量读法中，\(A\mathbf{x}\) 表示什么？', 'In the column reading, what does \(A\mathbf{x}\) represent?'),
        choices: [
          {
            id: 'column-combination',
            label: copy('用 \(\mathbf{x}\) 的坐标加权混合 \(A\) 的列向量。', 'A weighted mixture of the columns of \(A\), using coordinates from \(\mathbf{x}\).'),
          },
          {
            id: 'entrywise',
            label: copy('把 \(A\) 和 \(\mathbf{x}\) 的对应元素逐个相乘，不求和。', 'Elementwise multiplication of matching entries, with no summation.'),
          },
          {
            id: 'translation',
            label: copy('只表示把所有点平移同一个偏置。', 'Only a uniform translation by a bias vector.'),
          },
        ],
        answer: 'column-combination',
        explanation: copy(
          md`若 \(A=[\mathbf{a}_1\ \mathbf{a}_2\ \cdots\ \mathbf{a}_n]\)，则 \(A\mathbf{x}=x_1\mathbf{a}_1+\cdots+x_n\mathbf{a}_n\)。`,
          md`If \(A=[\mathbf{a}_1\ \mathbf{a}_2\ \cdots\ \mathbf{a}_n]\), then \(A\mathbf{x}=x_1\mathbf{a}_1+\cdots+x_n\mathbf{a}_n\).`,
        ),
        misconceptionTags: ['matrix-vector-entrywise'],
        revisitVisualId: 'matrix-transform-video',
      },
      {
        id: 'vectors-matrices-norms-relative-error',
        type: 'numeric',
        prompt: copy(
          md`真实向量为 \((0,6,-4)\)，近似向量为 \((0,5,-3)\)。用 \(1\)-范数计算相对误差，结果是多少？`,
          md`The true vector is \((0,6,-4)\), and the approximate vector is \((0,5,-3)\). Using the \(1\)-norm, what is the relative error?`,
        ),
        answer: 0.2,
        tolerance: 0.001,
        explanation: copy(
          md`误差向量为 \((0,1,-1)\)，\(1\)-范数为 \(2\)。真实向量的 \(1\)-范数为 \(10\)，所以相对误差为 \(2/10=0.2\)。`,
          md`The error vector is \((0,1,-1)\), whose \(1\)-norm is \(2\). The true vector has \(1\)-norm \(10\), so the relative error is \(2/10=0.2\).`,
        ),
        misconceptionTags: ['norm-error-subtraction'],
      },
    ],
    misconceptions: [
      {
        id: 'vector-is-only-list',
        statement: copy(
          '向量只是一个普通数字列表，没有几何含义。',
          'A vector is only an ordinary list of numbers with no geometric meaning.',
        ),
        correction: copy(
          '同一排数既可以当作数据列表，也可以当作特征空间里的一个方向和位置。AI 学习相似度、误差和线性层时都需要这个几何视角。',
          'The same row of numbers can be a data list and also a direction and position in feature space. AI needs this geometric view for similarity, error, and linear layers.',
        ),
        example: copy(
          md`两个 embedding 的夹角小，通常表示方向接近；这比只逐个看数字更接近“语义相似度”的直觉。`,
          md`If two embeddings have a small angle, their directions are close; that better matches semantic similarity than inspecting each number separately.`,
        ),
      },
      {
        id: 'matrix-vector-entrywise',
        statement: copy(
          '矩阵乘向量就是逐元素相乘。',
          'Matrix-vector multiplication is just elementwise multiplication.',
        ),
        correction: copy(
          '矩阵-向量乘法包含乘法和求和；按列看，它是用输入坐标对矩阵列向量做线性组合。',
          'Matrix-vector multiplication includes products and sums. By columns, it is a linear combination of matrix columns using input coordinates.',
        ),
        example: copy(
          md`\(\begin{bmatrix}2&1\\0&3\end{bmatrix}\begin{bmatrix}4\\-1\end{bmatrix}=4(2,0)-1(1,3)=(7,-3)\)。`,
          md`\(\begin{bmatrix}2&1\\0&3\end{bmatrix}\begin{bmatrix}4\\-1\end{bmatrix}=4(2,0)-1(1,3)=(7,-3)\).`,
        ),
      },
      {
        id: 'norm-error-subtraction',
        statement: copy(
          '两个向量的误差大小可以用两个范数直接相减。',
          'The error between two vectors can be measured by directly subtracting their norms.',
        ),
        correction: copy(
          md`误差应该先做向量差，再取范数：\(\|\mathbf{x}_{\text{true}}-\mathbf{x}_{\text{approx}}\|\)。范数本身不满足可加性。`,
          md`Error should subtract vectors first, then take a norm: \(\|\mathbf{x}_{\text{true}}-\mathbf{x}_{\text{approx}}\|\). Norms are not additive.`,
        ),
        example: copy(
          md`对 \((3,0)\) 和 \((0,4)\)，真实距离是 \(5\)，但 \(3-4=-1\) 根本不是距离。`,
          md`For \((3,0)\) and \((0,4)\), the actual distance is \(5\), while \(3-4=-1\) is not a distance at all.`,
        ),
      },
      {
        id: 'determinant-means-stability',
        statement: copy(
          '矩阵可逆就一定数值稳定。',
          'If a matrix is invertible, it must be numerically stable.',
        ),
        correction: copy(
          '可逆只说明没有完全塌缩；如果矩阵把某些方向压得很薄，逆变换仍可能极大放大误差。',
          'Invertible only means the transform has not collapsed completely. If a matrix compresses some directions strongly, the inverse can still amplify error severely.',
        ),
        example: copy(
          md`当 \(|\det(A)|\) 很小或最小奇异值很小时，求解 \(A\mathbf{x}=\mathbf{b}\) 对输入误差会很敏感。`,
          md`When \(|\det(A)|\) is tiny or the smallest singular value is tiny, solving \(A\mathbf{x}=\mathbf{b}\) can be highly sensitive to input error.`,
        ),
      },
    ],
  }
}
