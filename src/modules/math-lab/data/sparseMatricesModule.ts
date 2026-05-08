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
    'sparse-matrices-dense-matrices',
    copy('Dense 矩阵：所有位置都要存', 'Dense Matrices: Every Position Is Stored'),
    copy(
      md`在 dense 矩阵里，零元素和非零元素一样都会被存下来。一个 \(m\times n\) 矩阵需要保存 \(O(mn)\) 个条目；即使其中大多数是 \(0\)，普通 dense 表示也不会自动跳过它们。

原讲义里的例子是

$$
A=
\begin{bmatrix}
1.0&0&0\\
3.0&4.0&0\\
6.0&0&7.0\\
0&0&10.0
\end{bmatrix}.
$$

如果按行优先（row-major）顺序存储，内存里可以看成一条长数组：

$$
A_{\text{dense}}=
\begin{bmatrix}
1.0&0&0&3.0&4.0&0&6.0&0&7.0&0&0&10.0
\end{bmatrix}.
$$

矩阵形状需要单独保存：

$$
A_{\text{shape}}=(n_{\text{row}},n_{\text{col}})=(4,3).
$$

这种表示最直接，索引 \(A_{ij}\) 很方便，矩阵很小或非零元素很多时也常常最快。但它的缺点同样直接：如果矩阵巨大且大部分位置为 \(0\)，存储这些零元素会浪费内存，许多运算也会把时间花在“乘以零、加上零”上。`,
      md`In a dense matrix, zeros and nonzeros are stored alike. An \(m\times n\) matrix stores \(O(mn)\) entries; even if most entries are \(0\), a standard dense representation does not skip them automatically.

The original lecture example is

$$
A=
\begin{bmatrix}
1.0&0&0\\
3.0&4.0&0\\
6.0&0&7.0\\
0&0&10.0
\end{bmatrix}.
$$

Stored in row-major order, it can be viewed as one long array:

$$
A_{\text{dense}}=
\begin{bmatrix}
1.0&0&0&3.0&4.0&0&6.0&0&7.0&0&0&10.0
\end{bmatrix}.
$$

The matrix shape is stored separately:

$$
A_{\text{shape}}=(n_{\text{row}},n_{\text{col}})=(4,3).
$$

This representation is direct, makes indexing \(A_{ij}\) easy, and is often fastest when the matrix is small or mostly nonzero. Its weakness is also direct: if the matrix is huge and mostly zero, storing zeros wastes memory, and many computations spend time multiplying by zero and adding zero.`,
    ),
  ),
  section(
    'sparse-matrices-nnz-costs',
    copy('Sparse 矩阵：成本跟着 nnz 走', 'Sparse Matrices: Cost Follows nnz'),
    copy(
      md`稀疏矩阵不是“小矩阵”，而是**非零元素很少的矩阵**。常用记号

$$
\operatorname{nnz}(A)
$$

表示矩阵 \(A\) 中非零元素的数量。一个 \(m\times n\) 矩阵如果只有 \(O(\min(m,n))\) 个非零元素，就非常稀疏；在实践里，我们更常用密度

$$
\rho=\frac{\operatorname{nnz}(A)}{mn}
$$

来判断 dense 和 sparse 表示的差距。

稀疏矩阵的目标是：不保存大量零元素，从而降低内存开销，并让计算只围绕非零项移动。原讲义给出了加法成本的对比：

| 表示 | 加两个矩阵 \(P,Q\) 的典型工作量 | 直觉 |
| --- | --- | --- |
| dense | \(O(n(P)+n(Q))\) | 扫描所有位置 |
| sparse | \(O(\operatorname{nnz}(P)+\operatorname{nnz}(Q))\) | 只合并非零项 |

这里 \(n(X)\) 是矩阵 \(X\) 的总元素个数，\(\operatorname{nnz}(X)\) 是非零元素个数。

**数量级例子。** 一个 \(10^6\times10^6\) 的方阵如果每行只有 \(20\) 个非零元素，则

$$
\operatorname{nnz}(A)=2\times10^7,\qquad mn=10^{12}.
$$

按 double dense 存储只算数值就需要约 \(8\times10^{12}\) 字节，也就是数 TiB 级别；而稀疏存储只需要保存 \(2\times10^7\) 个值和相应索引。索引也有开销，但量级已经从 \(n^2\) 降到接近 \(n\)。`,
      md`A sparse matrix is not a small matrix. It is a matrix with relatively few nonzero entries. The notation

$$
\operatorname{nnz}(A)
$$

means the number of nonzero entries in \(A\). An \(m\times n\) matrix with only \(O(\min(m,n))\) nonzeros is extremely sparse; in practice, we often look at the density

$$
\rho=\frac{\operatorname{nnz}(A)}{mn}
$$

to judge the gap between dense and sparse representations.

The goal is to avoid storing many zeros, reducing memory overhead and making computation move around nonzero entries. The original lecture compared addition costs:

| Representation | Typical work to add matrices \(P,Q\) | Intuition |
| --- | --- | --- |
| dense | \(O(n(P)+n(Q))\) | Scan every position |
| sparse | \(O(\operatorname{nnz}(P)+\operatorname{nnz}(Q))\) | Merge nonzero entries |

Here \(n(X)\) is the total number of entries in \(X\), while \(\operatorname{nnz}(X)\) is the number of nonzero entries.

**Scale example.** If a \(10^6\times10^6\) square matrix has only \(20\) nonzeros per row, then

$$
\operatorname{nnz}(A)=2\times10^7,\qquad mn=10^{12}.
$$

Dense double storage for the values alone would require about \(8\times10^{12}\) bytes, several TiB. Sparse storage keeps \(2\times10^7\) values plus indices. Indices have overhead, but the scale has moved from \(n^2\) toward \(n\).`,
    ),
  ),
  section(
    'sparse-matrices-storage-solutions',
    copy('存储格式：同一个矩阵，不同访问方式', 'Storage Formats: Same Matrix, Different Access Patterns'),
    copy(
      md`稀疏矩阵的表示方式很多，例如 Coordinate（COO）、Compressed Sparse Row（CSR）、Block Sparse Row（BSR）、Dictionary of Keys（DOK）等。原讲义重点讲 COO 和 CSR，因为它们分别代表两种常见需求：

| 格式 | 适合做什么 | 代价 |
| --- | --- | --- |
| COO | 构造矩阵、收集三元组、格式转换 | 行访问前通常要排序或转换 |
| CSR | 快速按行访问、稀疏矩阵-向量乘法 | 插入新非零项不如 COO 灵活 |

下面沿用原讲义的 \(5\times5\) 例子：

$$
\mathbf{A}=
\begin{bmatrix}
1.0&0&0&2.0&0\\
3.0&4.0&0&5.0&0\\
6.0&0&7.0&8.0&9.0\\
0&0&10.0&11.0&0\\
0&0&0&0&12.0
\end{bmatrix}.
$$

这个矩阵共有 \(25\) 个位置，但只有 \(12\) 个非零值。dense 表示会保存 \(25\) 个数；COO 需要保存 \(12\) 个值、\(12\) 个行索引、\(12\) 个列索引；CSR 需要保存 \(12\) 个值、\(12\) 个列索引和长度为 \(6\) 的 row pointer。`,
      md`Sparse matrices have many storage formats, including Coordinate (COO), Compressed Sparse Row (CSR), Block Sparse Row (BSR), and Dictionary of Keys (DOK). The original lecture focuses on COO and CSR because they represent two common needs:

| Format | Good for | Cost |
| --- | --- | --- |
| COO | Building matrices, collecting triples, converting formats | Row access usually needs sorting or conversion |
| CSR | Fast row access and sparse matrix-vector products | Inserting new nonzeros is less flexible than COO |

We keep the original \(5\times5\) example:

$$
\mathbf{A}=
\begin{bmatrix}
1.0&0&0&2.0&0\\
3.0&4.0&0&5.0&0\\
6.0&0&7.0&8.0&9.0\\
0&0&10.0&11.0&0\\
0&0&0&0&12.0
\end{bmatrix}.
$$

This matrix has \(25\) positions but only \(12\) nonzero values. Dense storage keeps \(25\) numbers. COO stores \(12\) values, \(12\) row indices, and \(12\) column indices. CSR stores \(12\) values, \(12\) column indices, and a row-pointer array of length \(6\).`,
    ),
  ),
  section(
    'sparse-matrices-coo-format',
    copy('COO：把非零项写成三元组', 'COO: Store Nonzeros as Triples'),
    copy(
      md`COO（Coordinate）格式保存三个等长数组：行索引、列索引和对应的非零值。每个位置的三项一起描述一个非零元素：

$$
(\text{row}[k],\text{col}[k],\text{data}[k]).
$$

COO 不要求一开始就按行排序，所以它很适合从数据流中逐条收集非零项。原讲义给出的一个 COO 顺序是：

$$
\textrm{data}=
\begin{bmatrix}
12.0&9.0&7.0&5.0&1.0&2.0&11.0&3.0&6.0&4.0&8.0&10.0
\end{bmatrix}
$$

$$
\textrm{row}=
\begin{bmatrix}
4&2&2&1&0&0&3&1&2&1&2&3
\end{bmatrix}
$$

$$
\textrm{col}=
\begin{bmatrix}
4&4&2&3&0&3&3&0&0&1&3&2
\end{bmatrix}.
$$

第一组三元组是 \((4,4,12.0)\)，表示矩阵第 \(4\) 行第 \(4\) 列有一个值 \(12.0\)。第二组三元组是 \((2,4,9.0)\)，表示第 \(2\) 行第 \(4\) 列有一个值 \(9.0\)。这里行列下标从 \(0\) 开始。

COO 存储 \(3\operatorname{nnz}\) 个数组元素。它的优势是构造简单；缺点是做“取第 \(i\) 行”这类操作时，需要搜索或先转换成 CSR。

~~~python
import scipy.sparse as sparse

A = [[1., 0., 0., 2., 0.],
     [3., 4., 0., 5., 0.],
     [6., 0., 7., 8., 9.],
     [0., 0., 10., 11., 0.],
     [0., 0., 0., 0., 12.]]

COO = sparse.coo_matrix(A)
data = COO.data
row = COO.row
col = COO.col
CSR = COO.tocsr()
~~~

这段代码保留了原讲义的 SciPy 路径：先把 dense 列表转成 COO，再读取 data、row、col，最后可以转成 CSR。`,
      md`COO (Coordinate) stores three arrays of equal length: row indices, column indices, and nonzero values. The three entries at the same position describe one nonzero:

$$
(\text{row}[k],\text{col}[k],\text{data}[k]).
$$

COO does not require row-sorted data at construction time, so it is useful when nonzeros arrive one by one from a data stream. One order from the original lecture is:

$$
\textrm{data}=
\begin{bmatrix}
12.0&9.0&7.0&5.0&1.0&2.0&11.0&3.0&6.0&4.0&8.0&10.0
\end{bmatrix}
$$

$$
\textrm{row}=
\begin{bmatrix}
4&2&2&1&0&0&3&1&2&1&2&3
\end{bmatrix}
$$

$$
\textrm{col}=
\begin{bmatrix}
4&4&2&3&0&3&3&0&0&1&3&2
\end{bmatrix}.
$$

The first triple is \((4,4,12.0)\), meaning row \(4\), column \(4\) contains \(12.0\). The second triple is \((2,4,9.0)\), meaning row \(2\), column \(4\) contains \(9.0\). The indices here are zero-based.

COO stores \(3\operatorname{nnz}\) array entries. It is easy to build; the drawback is that an operation such as "read row \(i\)" requires searching or converting to CSR first.

~~~python
import scipy.sparse as sparse

A = [[1., 0., 0., 2., 0.],
     [3., 4., 0., 5., 0.],
     [6., 0., 7., 8., 9.],
     [0., 0., 10., 11., 0.],
     [0., 0., 0., 0., 12.]]

COO = sparse.coo_matrix(A)
data = COO.data
row = COO.row
col = COO.col
CSR = COO.tocsr()
~~~

This keeps the SciPy path from the original lecture: convert a dense list to COO, read data, row, and col, and convert to CSR when row-wise operations are needed.`,
    ),
  ),
  section(
    'sparse-matrices-csr-format',
    copy('CSR：用 rowptr 把每一行切出来', 'CSR: Use rowptr to Slice Each Row'),
    copy(
      md`CSR（Compressed Sparse Row，也叫 Yale format）把非零值按行存放。它保存三个数组：

| 数组 | 长度 | 含义 |
| --- | --- | --- |
| \(\textrm{data}\) | \(\operatorname{nnz}\) | 非零值 |
| \(\textrm{col}\) | \(\operatorname{nnz}\) | 每个非零值所在列 |
| \(\textrm{rowptr}\) | \(m+1\) | 第 \(i\) 行在 data/col 中的开始与结束位置 |

row pointer 的递推关系是

$$
\textrm{rowptr}[0]=0,\qquad
\textrm{rowptr}[j]=\textrm{rowptr}[j-1]+\operatorname{nnz}(\textrm{row}_{j-1}).
$$

对上面的矩阵，CSR 表示为

$$
\textrm{data}=
\begin{bmatrix}
1.0&2.0&3.0&4.0&5.0&6.0&7.0&8.0&9.0&10.0&11.0&12.0
\end{bmatrix}
$$

$$
\textrm{col}=
\begin{bmatrix}
0&3&0&1&3&0&2&3&4&2&3&4
\end{bmatrix}
$$

$$
\textrm{rowptr}=
\begin{bmatrix}
0&2&5&9&11&12
\end{bmatrix}.
$$

解释方式是：第 \(0\) 行对应区间 \([\textrm{rowptr}[0],\textrm{rowptr}[1])=[0,2)\)。因此读取 data[0:2] 和 col[0:2]，得到 \((1.0,0)\)、\((2.0,3)\)，表示第 \(0\) 行在第 \(0\) 列有 \(1.0\)，第 \(3\) 列有 \(2.0\)。第 \(1\) 行对应区间 \([2,5)\)，三组 \((3.0,0)\)、\((4.0,1)\)、\((5.0,3)\) 描述了它的三个非零项。

CSR 总共保存 \(2\operatorname{nnz}+m+1\) 个数组元素。相比 COO，它省掉了每个非零项的行索引，改用 \(m+1\) 个 row pointers 来定位行。下面的实验台就是在调节 \(n\)、每行非零数和 COO/CSR 选择时，观察这个成本差异。`,
      md`CSR (Compressed Sparse Row, also called the Yale format) stores nonzeros row by row. It keeps three arrays:

| Array | Length | Meaning |
| --- | --- | --- |
| \(\textrm{data}\) | \(\operatorname{nnz}\) | Nonzero values |
| \(\textrm{col}\) | \(\operatorname{nnz}\) | Column index for each nonzero |
| \(\textrm{rowptr}\) | \(m+1\) | Start and end positions for row \(i\) inside data/col |

The row-pointer recurrence is

$$
\textrm{rowptr}[0]=0,\qquad
\textrm{rowptr}[j]=\textrm{rowptr}[j-1]+\operatorname{nnz}(\textrm{row}_{j-1}).
$$

For the matrix above, CSR is

$$
\textrm{data}=
\begin{bmatrix}
1.0&2.0&3.0&4.0&5.0&6.0&7.0&8.0&9.0&10.0&11.0&12.0
\end{bmatrix}
$$

$$
\textrm{col}=
\begin{bmatrix}
0&3&0&1&3&0&2&3&4&2&3&4
\end{bmatrix}
$$

$$
\textrm{rowptr}=
\begin{bmatrix}
0&2&5&9&11&12
\end{bmatrix}.
$$

Interpret it this way: row \(0\) corresponds to the interval \([\textrm{rowptr}[0],\textrm{rowptr}[1])=[0,2)\). Reading data[0:2] and col[0:2] gives \((1.0,0)\) and \((2.0,3)\), so row \(0\) has \(1.0\) in column \(0\) and \(2.0\) in column \(3\). Row \(1\) corresponds to \([2,5)\), and the triples \((3.0,0)\), \((4.0,1)\), and \((5.0,3)\) describe its three nonzeros.

CSR stores \(2\operatorname{nnz}+m+1\) array entries. Compared with COO, it removes the row index for each nonzero and replaces those indices with \(m+1\) row pointers. The lab below lets you adjust \(n\), nonzeros per row, and COO/CSR format to see that cost difference.`,
    ),
    { labIds: ['sparse-matrix-storage-lab'] },
  ),
  section(
    'sparse-matrices-csr-matrix-vector-product-algorithm',
    copy('CSR 矩阵向量乘法：只扫非零窗口', 'CSR Matrix-Vector Product: Scan Only Nonzero Windows'),
    copy(
      md`CSR 最常见的收益来自稀疏矩阵-向量乘法（SpMV）：

$$
\mathbf{y}=A\mathbf{x}.
$$

对 dense 矩阵，第 \(i\) 行要计算

$$
y_i=\sum_{j=0}^{n-1}A_{ij}x_j,
$$

即使很多 \(A_{ij}\) 是 \(0\)，循环仍会扫过所有列。CSR 改写为只扫描第 \(i\) 行的非零区间：

$$
y_i=\sum_{k=\textrm{rowptr}[i]}^{\textrm{rowptr}[i+1]-1}\textrm{data}[k]\;x_{\textrm{col}[k]}.
$$

原讲义代码可以整理为：

~~~python
import numpy as np

def csr_mat_vec(A, x):
    Ax = np.zeros_like(x)
    for i in range(x.shape[0]):
        for k in range(A.rowptr[i], A.rowptr[i + 1]):
            Ax[i] += A.data[k] * x[A.col[k]]
    return Ax
~~~

**手算例子。** 对本章 \(5\times5\) 矩阵，取 \(\mathbf{x}=[1,2,3,4,5]^T\)。第 \(0\) 行的 CSR 区间是 \([0,2)\)，所以

$$
y_0=1.0\cdot x_0+2.0\cdot x_3=1+8=9.
$$

第 \(2\) 行的区间是 \([5,9)\)，对应列 \(0,2,3,4\)，所以

$$
y_2=6.0\cdot1+7.0\cdot3+8.0\cdot4+9.0\cdot5=104.
$$

如果矩阵每行只有 \(r\) 个非零项，CSR matvec 的工作量大约是 \(O(nr)\)，而 dense matvec 是 \(O(n^2)\)。这就是图算法、有限差分、推荐系统和科学计算喜欢稀疏格式的核心原因。`,
      md`CSR is especially valuable for sparse matrix-vector multiplication (SpMV):

$$
\mathbf{y}=A\mathbf{x}.
$$

For a dense matrix, row \(i\) computes

$$
y_i=\sum_{j=0}^{n-1}A_{ij}x_j,
$$

so the loop scans every column even when many \(A_{ij}\) are zero. CSR rewrites the operation so row \(i\) scans only its nonzero interval:

$$
y_i=\sum_{k=\textrm{rowptr}[i]}^{\textrm{rowptr}[i+1]-1}\textrm{data}[k]\;x_{\textrm{col}[k]}.
$$

The original lecture code can be cleaned up as:

~~~python
import numpy as np

def csr_mat_vec(A, x):
    Ax = np.zeros_like(x)
    for i in range(x.shape[0]):
        for k in range(A.rowptr[i], A.rowptr[i + 1]):
            Ax[i] += A.data[k] * x[A.col[k]]
    return Ax
~~~

**Worked example.** For the chapter's \(5\times5\) matrix, let \(\mathbf{x}=[1,2,3,4,5]^T\). Row \(0\) has CSR interval \([0,2)\), so

$$
y_0=1.0\cdot x_0+2.0\cdot x_3=1+8=9.
$$

Row \(2\) has interval \([5,9)\), with columns \(0,2,3,4\), so

$$
y_2=6.0\cdot1+7.0\cdot3+8.0\cdot4+9.0\cdot5=104.
$$

If each row has only \(r\) nonzeros, CSR matvec costs about \(O(nr)\), while dense matvec costs \(O(n^2)\). That is the core reason sparse formats matter in graph algorithms, finite differences, recommender systems, and scientific computing.`,
    ),
  ),
  section(
    'sparse-matrices-ml-connection',
    copy('机器学习里的稀疏结构', 'Sparse Structure in Machine Learning'),
    copy(
      md`稀疏矩阵之所以重要，不只是因为“省内存”。它把模型里的结构暴露给算法。

**推荐系统。** 用户-物品矩阵通常巨大，但一个用户只评价过很少的物品。若把未观察条目当成 dense 零全部保存，内存会很快失控；用 COO 收集交互、用 CSR/CSC 做按用户或按物品的计算，才是可运行的表示。

**图学习和 PageRank。** 图的邻接矩阵和拉普拉斯矩阵通常每行只含节点的邻居。一次 message passing 或 PageRank 迭代本质上是稀疏矩阵向量乘法或稀疏矩阵特征传播。

**文本和检索。** 词袋、TF-IDF 和高维 one-hot 特征大多为零。稀疏格式让线性模型和相似度计算只看出现过的词，而不是扫描完整词表。

**深度学习中的稀疏 mask。** Attention mask、Mixture-of-Experts 路由和结构化稀疏权重都在问同一件事：哪些连接可以跳过？需要注意的是，稀疏不自动更快。格式、硬件、批量大小和访问模式必须匹配；否则索引开销和不规则内存访问可能吃掉收益。

选择格式时可以用一个实用判断：

| 任务 | 更自然的格式 |
| --- | --- |
| 逐条构造非零项 | COO 或 DOK |
| 反复按行做 \(A\mathbf{x}\) | CSR |
| 反复按列访问或做 \(\mathbf{x}^TA\) | CSC |
| 非零项成小块出现 | BSR |

本章的关键直觉是：先问访问模式，再选存储格式。稀疏矩阵保存的不是“更少的数学”，而是同一个线性算子里真正参与计算的位置。`,
      md`Sparse matrices matter not only because they save memory. They expose structure to algorithms.

**Recommender systems.** A user-item matrix is often huge, while one user has interacted with only a tiny fraction of items. Storing every unobserved entry as a dense zero quickly becomes impossible. COO can collect interactions, while CSR or CSC supports user-wise or item-wise computation.

**Graph learning and PageRank.** Graph adjacency matrices and Laplacians usually contain only the neighbors of each node in each row. A message-passing step or PageRank iteration is essentially sparse matrix-vector multiplication or sparse feature propagation.

**Text and retrieval.** Bag-of-words, TF-IDF, and high-dimensional one-hot features are mostly zero. Sparse formats let linear models and similarity computations look only at words that appear instead of scanning the whole vocabulary.

**Sparse masks in deep learning.** Attention masks, Mixture-of-Experts routing, and structured sparse weights all ask the same question: which connections can be skipped? Sparsity is not automatically faster, though. The format, hardware, batch size, and access pattern must match; otherwise index overhead and irregular memory access can erase the gain.

A practical format choice is:

| Task | More natural format |
| --- | --- |
| Build nonzeros one by one | COO or DOK |
| Repeated row-wise \(A\mathbf{x}\) | CSR |
| Repeated column access or \(\mathbf{x}^TA\) | CSC |
| Nonzeros appear in small blocks | BSR |

The key intuition is: ask about access pattern first, then choose storage. A sparse matrix does not store "less mathematics"; it stores the positions that actually participate in the same linear operator.`,
    ),
  ),
  section(
    'sparse-matrices-review-questions',
    copy('复习问题', 'Review Questions'),
    copy(
      md`1. 什么叫稀疏矩阵？它和矩阵尺寸小有什么区别？
2. dense 表示为什么需要 \(O(mn)\) 个存储位置？
3. \(\operatorname{nnz}(A)\) 和密度 \(\rho=\operatorname{nnz}(A)/(mn)\) 分别说明什么？
4. COO 的 row、col、data 三个数组如何解释一个非零元素？
5. 为什么 COO 适合构造矩阵，但不一定适合快速按行做 matvec？
6. CSR 的 rowptr[i] 和 rowptr[i+1] 如何定位第 \(i\) 行？
7. 对一个给定矩阵，怎样写出它的 CSR 和 COO 表示？
8. 对 \(m\) 行、\(\operatorname{nnz}\) 个非零项的矩阵，CSR 大约存多少个数组元素？
9. 为什么稀疏矩阵向量乘法的工作量更接近 \(\operatorname{nnz}(A)\)，而不是 \(mn\)？
10. 在推荐系统、图学习或文本特征里，稀疏结构具体对应哪些“没有连接”或“没有出现”的信息？`,
      md`1. What does it mean for a matrix to be sparse? How is that different from being small?
2. Why does a dense representation require \(O(mn)\) storage positions?
3. What do \(\operatorname{nnz}(A)\) and density \(\rho=\operatorname{nnz}(A)/(mn)\) tell you?
4. How do the COO arrays row, col, and data describe one nonzero element?
5. Why is COO convenient for construction but not always ideal for fast row-wise matvec?
6. How do rowptr[i] and rowptr[i+1] locate row \(i\) in CSR?
7. Given a matrix, how would you write its CSR and COO representations?
8. For a matrix with \(m\) rows and \(\operatorname{nnz}\) nonzeros, about how many array entries does CSR store?
9. Why is sparse matrix-vector work closer to \(\operatorname{nnz}(A)\) than to \(mn\)?
10. In recommender systems, graph learning, or text features, what "missing connection" or "absent feature" does sparsity represent?`,
    ),
  ),
]

export function buildSparseMatricesModule(importedModule: MathLabModule): MathLabModule {
  return {
    ...importedModule,
    title: copy('稀疏矩阵', 'Sparse Matrices'),
    subtitle: copy(
      '用 nnz、COO 和 CSR 理解如何只存非零项，并让大规模线性代数真正可计算。',
      'Use nnz, COO, and CSR to store only nonzeros and make large-scale linear algebra computable.',
    ),
    estimatedMinutes: 38,
    prerequisites: ['lu-decomposition'],
    aiModelConnections: [
      copy(
        '图学习、推荐系统、文本特征和 attention mask 都依赖稀疏结构来避免扫描海量零项。',
        'Graph learning, recommender systems, text features, and attention masks use sparse structure to avoid scanning huge numbers of zeros.',
      ),
      copy(
        '稀疏格式的收益取决于访问模式：CSR 适合按行 matvec，COO 适合先收集非零三元组。',
        'The gain from sparse formats depends on access pattern: CSR suits row-wise matvec, while COO suits collecting nonzero triples.',
      ),
    ],
    learningObjectives: [
      copy(md`区分 dense 存储的 \(O(mn)\) 成本与 sparse 存储的 \(\operatorname{nnz}(A)\) 成本。`, md`Distinguish dense \(O(mn)\) storage from sparse storage driven by \(\operatorname{nnz}(A)\).`),
      copy('把 COO 三元组解释回原矩阵中的非零位置。', 'Interpret COO triples back into nonzero positions of the original matrix.'),
      copy(md`用 \(\textrm{rowptr}\) 解释 CSR 如何定位每一行的非零区间。`, md`Use \(\textrm{rowptr}\) to explain how CSR locates the nonzero interval for each row.`),
      copy('说明 CSR 矩阵向量乘法为什么只扫描非零项。', 'Explain why CSR matrix-vector multiplication scans only nonzero entries.'),
      copy('把稀疏结构连接到推荐系统、图学习和文本特征。', 'Connect sparse structure to recommender systems, graph learning, and text features.'),
    ],
    concepts: [
      {
        id: 'sparse-nnz-core',
        name: copy('非零元素数量', 'Number of Nonzeros'),
        formulaLatex: '\\operatorname{nnz}(A)\\ll mn',
        variables: [
          {
            symbol: '\\operatorname{nnz}(A)',
            description: copy('矩阵中真正保存并参与多数计算的非零元素数量。', 'The number of nonzero entries stored and used by most sparse computations.'),
          },
          {
            symbol: 'mn',
            description: copy('dense 矩阵的总位置数量。', 'The total number of positions in the dense matrix.'),
          },
        ],
        plainExplanation: copy(
          '稀疏矩阵的规模不能只看行列数；真正决定存储和许多计算成本的是非零项数量。',
          'Sparse matrix scale is not just row and column count; nonzero count drives storage and many compute costs.',
        ),
        geometricIntuition: copy(
          '把空白位置从数据结构里拿掉，算法只沿着实际存在的连接移动。',
          'Remove blank positions from the data structure so algorithms move only along connections that exist.',
        ),
        numericalExample: copy(
          md`若 \(n=10^6\) 且每行 \(20\) 个非零项，则 \(\operatorname{nnz}=2\times10^7\)，远小于 \(10^{12}\)。`,
          md`If \(n=10^6\) and each row has \(20\) nonzeros, then \(\operatorname{nnz}=2\times10^7\), far below \(10^{12}\).`,
        ),
        codeExample:
          'rows = [0, 0, 2]\ncols = [1, 3, 2]\nvals = [4.0, -1.0, 2.5]\nfor r, c, v in zip(rows, cols, vals):\n    print(r, c, v)',
        modelConnection: copy(
          '推荐系统中的用户-物品交互、图中的边、文本中的出现词，都可以看成非零项。',
          'User-item interactions, graph edges, and observed words in text can all be read as nonzero entries.',
        ),
      },
      {
        id: 'sparse-csr-rowptr-core',
        name: copy('CSR 行指针', 'CSR Row Pointer'),
        formulaLatex: '\\textrm{rowptr}[j]=\\textrm{rowptr}[j-1]+\\operatorname{nnz}(\\textrm{row}_{j-1})',
        variables: [
          {
            symbol: '\\textrm{rowptr}[j]',
            description: copy('第 j 行非零区间的边界；相邻两个边界给出一整行。', 'A boundary for row-wise nonzero intervals; adjacent boundaries give one whole row.'),
          },
          {
            symbol: '\\textrm{data},\\textrm{col}',
            description: copy('按行排列的非零值和对应列号。', 'Row-ordered nonzero values and their column indices.'),
          },
        ],
        plainExplanation: copy(
          'CSR 不给每个非零项重复保存行号，而是用 rowptr 告诉你每一行在数组里的切片。',
          'CSR avoids storing a row index for every nonzero; rowptr tells you the slice for each row.',
        ),
        geometricIntuition: copy(
          'rowptr 像目录页：先找到某一行的起止页码，再只读那一小段非零项。',
          'rowptr acts like a table of contents: find the start and end positions for a row, then read only that nonzero segment.',
        ),
        numericalExample: copy(
          md`若 \(\textrm{rowptr}=[0,2,5]\)，第 \(0\) 行用区间 \([0,2)\)，第 \(1\) 行用区间 \([2,5)\)。`,
          md`If \(\textrm{rowptr}=[0,2,5]\), row \(0\) uses interval \([0,2)\), and row \(1\) uses interval \([2,5)\).`,
        ),
        codeExample:
          'def csr_row(data, col, rowptr, i):\n    start, end = rowptr[i], rowptr[i + 1]\n    return list(zip(col[start:end], data[start:end]))',
        modelConnection: copy(
          '图神经网络按节点聚合邻居时，CSR 的一行正好对应一个节点的邻接列表。',
          'When a graph neural network aggregates neighbors by node, one CSR row is exactly one adjacency list.',
        ),
      },
    ],
    sections,
    toc: sections.map((item) => ({
      id: item.id,
      level: item.level,
      title: item.title,
    })),
    visuals: [],
    labs: [
      {
        id: 'sparse-matrix-storage-lab',
        title: copy('稀疏存储与 CSR 行窗口实验', 'Sparse Storage and CSR Row Window Lab'),
        type: 'interactive-visual',
        componentName: 'SparseMatrixLab',
        successCriteria: [
          copy(
            md`能解释为什么 dense 存储随 \(n^2\) 增长，而 CSR 在固定每行非零数时接近随 \(n\) 增长。`,
            md`Explain why dense storage grows like \(n^2\), while CSR is nearly linear in \(n\) when nonzeros per row stay fixed.`,
          ),
          copy(
            md`能用 \([\textrm{rowptr}[i],\textrm{rowptr}[i+1])\) 找到第 \(i\) 行的非零项。`,
            md`Use \([\textrm{rowptr}[i],\textrm{rowptr}[i+1])\) to find the nonzeros in row \(i\).`,
          ),
          copy('能说明 COO 更适合构造，CSR 更适合反复按行计算。', 'Explain why COO is better for construction and CSR for repeated row-wise computation.'),
        ],
      },
    ],
    quizzes: [
      {
        id: 'sparse-definition-nnz',
        type: 'single-choice',
        prompt: copy('判断一个矩阵是否稀疏时，最关键的量是什么？', 'What is the key quantity for judging whether a matrix is sparse?'),
        choices: [
          {
            id: 'nnz',
            label: copy('非零元素数量相对于总位置数量很小。', 'The number of nonzeros is small relative to the total number of positions.'),
          },
          {
            id: 'rows-only',
            label: copy('行数必须很少。', 'The number of rows must be small.'),
          },
          {
            id: 'square',
            label: copy('矩阵必须是方阵。', 'The matrix must be square.'),
          },
        ],
        answer: 'nnz',
        explanation: copy(
          md`稀疏性由 \(\operatorname{nnz}(A)\) 相对于 \(mn\) 的大小决定；矩阵可以非常大但仍然稀疏。`,
          md`Sparsity is determined by \(\operatorname{nnz}(A)\) relative to \(mn\); a matrix can be huge and still sparse.`,
        ),
        misconceptionTags: ['sparse-small-matrix'],
      },
      {
        id: 'sparse-csr-rowptr-interval',
        type: 'single-choice',
        prompt: copy(
          md`若 \(\textrm{rowptr}=[0,2,5,5]\)，第 \(1\) 行的非零项在 data/col 的哪个区间？`,
          md`If \(\textrm{rowptr}=[0,2,5,5]\), which interval in data/col contains the nonzeros of row \(1\)?`,
        ),
        choices: [
          {
            id: 'two-five',
            label: copy(md`\([2,5)\)`, md`\([2,5)\)`),
          },
          {
            id: 'one-two',
            label: copy(md`\([1,2)\)`, md`\([1,2)\)`),
          },
          {
            id: 'zero-five',
            label: copy(md`\([0,5)\)`, md`\([0,5)\)`),
          },
        ],
        answer: 'two-five',
        explanation: copy(
          md`CSR 第 \(i\) 行使用 \([\textrm{rowptr}[i],\textrm{rowptr}[i+1])\)。第 \(1\) 行对应 \([2,5)\)。`,
          md`CSR row \(i\) uses \([\textrm{rowptr}[i],\textrm{rowptr}[i+1])\). Row \(1\) therefore uses \([2,5)\).`,
        ),
        misconceptionTags: ['sparse-rowptr-boundary'],
        revisitVisualId: 'sparse-matrix-storage-lab',
      },
      {
        id: 'sparse-csr-storage-count',
        type: 'numeric',
        prompt: copy(
          md`一个 \(4\) 行矩阵有 \(\operatorname{nnz}=7\)。按原讲义的计数，CSR 保存 \(2\operatorname{nnz}+m+1\) 个数组元素，一共是多少？`,
          md`A matrix has \(4\) rows and \(\operatorname{nnz}=7\). Using the lecture count \(2\operatorname{nnz}+m+1\), how many array entries does CSR store?`,
        ),
        answer: 19,
        tolerance: 0,
        explanation: copy(
          md`代入 \(2\cdot7+4+1=19\)。其中 \(2\operatorname{nnz}\) 来自 data 和 col，\(m+1\) 来自 rowptr。`,
          md`Substitute \(2\cdot7+4+1=19\). The \(2\operatorname{nnz}\) part comes from data and col; the \(m+1\) part comes from rowptr.`,
        ),
        misconceptionTags: ['sparse-index-overhead'],
      },
    ],
    misconceptions: [
      {
        id: 'sparse-small-matrix',
        statement: copy('稀疏矩阵就是尺寸很小的矩阵。', 'A sparse matrix is simply a small matrix.'),
        correction: copy(
          '稀疏矩阵可以非常大；关键是非零元素相对于总位置数量很少。',
          'A sparse matrix can be very large; the key is that nonzeros are few relative to all positions.',
        ),
        example: copy(
          md`一个 \(10^6\times10^6\) 用户-物品矩阵可以巨大但稀疏，因为每个用户只交互过少量物品。`,
          md`A \(10^6\times10^6\) user-item matrix can be huge but sparse because each user interacted with only a small number of items.`,
        ),
      },
      {
        id: 'sparse-rowptr-boundary',
        statement: copy('CSR 的 rowptr 保存每个非零元素的行号。', 'CSR rowptr stores the row index for every nonzero.'),
        correction: copy(
          'rowptr 保存每一行在 data/col 数组中的边界；相邻两个边界给出一行。',
          'rowptr stores row boundaries inside the data/col arrays; adjacent boundaries give one row.',
        ),
        example: copy(
          md`\(\textrm{rowptr}=[0,2,5]\) 表示第 \(0\) 行有两个非零项，第 \(1\) 行有三个非零项。`,
          md`\(\textrm{rowptr}=[0,2,5]\) means row \(0\) has two nonzeros and row \(1\) has three nonzeros.`,
        ),
      },
      {
        id: 'sparse-index-overhead',
        statement: copy('只要矩阵有零元素，稀疏格式就一定更快。', 'As soon as a matrix has zeros, a sparse format is always faster.'),
        correction: copy(
          '稀疏格式还要存索引，并且访问更不规则；只有 nnz 足够小且访问模式匹配时才有明显收益。',
          'Sparse formats also store indices and often access memory irregularly; they help most when nnz is small enough and the access pattern matches the format.',
        ),
        example: copy(
          '如果矩阵已经有 60% 的位置非零，COO/CSR 的索引开销可能让它不如 dense 表示划算。',
          'If 60% of positions are nonzero, COO/CSR index overhead may make sparse storage less attractive than dense storage.',
        ),
      },
    ],
  }
}
