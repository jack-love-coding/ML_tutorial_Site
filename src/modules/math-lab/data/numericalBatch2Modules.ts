import type {
  LocalizedCopy,
  MathConcept,
  MathLabModule,
  MathLabSection,
  MathLabTocItem,
  SourceReference,
  VisualAsset,
} from '../types/mathLab.ts'

const md = String.raw

const copy = (zhCN: string, en: string): LocalizedCopy => ({ 'zh-CN': zhCN, en })

function section(
  id: string,
  title: LocalizedCopy,
  content: LocalizedCopy,
  placements: Pick<MathLabSection, 'visualIds' | 'labIds'> = {},
): MathLabSection {
  return { id, level: 2, title, content, ...placements }
}

function tocFor(item: MathLabSection): MathLabTocItem {
  return { id: item.id, level: item.level, title: item.title }
}

function insertAfterOpening<T>(items: readonly T[], additions: readonly T[]): T[] {
  if (!items.length) return [...additions]
  return [items[0]!, ...additions, ...items.slice(1)]
}

function keepFirstLabPlacement(sections: readonly MathLabSection[]): MathLabSection[] {
  const seen = new Set<string>()
  return sections.map((item) => {
    if (!item.labIds?.length) return item
    const labIds = item.labIds.filter((labId) => {
      if (seen.has(labId)) return false
      seen.add(labId)
      return true
    })
    return labIds.length ? { ...item, labIds } : { ...item, labIds: undefined }
  })
}

const routeBridgeVisual: VisualAsset = {
  id: 'numerical-representation-cases-illustration',
  type: 'image',
  title: copy('两种矩阵问题：保存空白与重建结构', 'Two matrix problems: skipping blanks and reconstructing structure'),
  assetPath: '/math-lab/numerical-methods/sparse-pca-two-cases.png',
  transcript: copy(
    '左侧是 5,574 行短信与 1,881 列 token 组成的稀疏 TF-IDF 矩阵，只有实际出现的词被存入 CSR。右侧是 2,927 行 Ames 房屋与八个标准化数值特征组成的 dense 矩阵，PCA 旋转坐标轴并按解释方差保留方向。两者是相邻章节的两个案例，不是把短信矩阵直接送入普通 PCA。',
    'The left side shows a sparse TF-IDF matrix with 5,574 messages and 1,881 token columns; CSR stores only words that occur. The right side shows a dense matrix of 2,927 Ames homes and eight standardized numeric features; PCA rotates the axes and retains directions by explained variance. These are two adjacent cases, not a pipeline that sends the SMS matrix directly into ordinary PCA.',
  ),
  learningPurpose: copy(
    '区分“利用零元素很多的结构”和“利用特征相关的结构”。',
    'Separate exploiting many zero entries from exploiting correlated feature structure.',
  ),
  alt: copy(
    '短信 token 稀疏矩阵进入 CSR，与 Ames 数值特征矩阵进入 PCA 的并列教学图。',
    'Side-by-side teaching diagram: an SMS token matrix enters CSR while an Ames numeric feature matrix enters PCA.',
  ),
  caption: copy(
    '稀疏表示减少对零元素的存储；PCA 用较少的新坐标近似 dense 数据。两章解决不同问题。',
    'Sparse representation avoids storing zeros; PCA approximates dense data with fewer new coordinates. The chapters solve different problems.',
  ),
}

const sparseAnimation: VisualAsset = {
  id: 'sms-csr-matvec-video',
  type: 'manim-video',
  title: copy('从短信 token 到 CSR 行窗口', 'From SMS tokens to a CSR row window'),
  assetPath: '/manim/numerical-methods/sms-csr-matvec.mp4',
  posterPath: '/manim/numerical-methods/sms-csr-matvec-poster.png',
  transcript: copy(
    '动画从稀疏 token 方格开始，扩展到 5,574×1,881 的 TF-IDF 矩阵。画面只把实际出现的 token 变成非零方块，随后依次排成 data、indices 和 indptr。固定第 17 行使用区间 [283,299)，只访问 16 个非零项完成点积；手写循环与 library CSR 结果完全一致。最后比较 79.992 MiB 的 dense float64 与 0.820 MiB 的 CSR 数组，并明确这只是存储比较，本章也没有训练分类器。',
    'The animation begins with a sparse token grid and expands to a 5,574-by-1,881 TF-IDF matrix. Only tokens that occur become nonzero cells, which are then arranged into data, indices, and indptr. Fixed row 17 uses interval [283,299), visiting only 16 entries for its dot product; the direct loop exactly matches the library CSR result. The ending compares 79.992 MiB of dense float64 storage with 0.820 MiB of CSR arrays, explicitly as a storage comparison. No classifier is trained in this lesson.',
  ),
  learningPurpose: copy(
    '把 token 出现、CSR 三个数组和矩阵向量乘法的访问路径连成一个可追踪过程。',
    'Connect token occurrence, the three CSR arrays, and the access path of matrix-vector multiplication.',
  ),
  alt: copy(
    '短信 token 方格转换为 CSR 的 data、indices、indptr，并扫描一行非零窗口。',
    'SMS token cells become CSR data, indices, and indptr arrays, followed by one nonzero row-window scan.',
  ),
  caption: copy(
    '真实固定输出：shape=[5574,1881]，nnz=69798，dense/CSR=97.55×。',
    'Locked real output: shape=[5574,1881], nnz=69798, dense/CSR=97.55×.',
  ),
}

const pcaAnimation: VisualAsset = {
  id: 'ames-pca-projection-video',
  type: 'manim-video',
  title: copy('Ames 八维特征的 PCA 投影与重建', 'PCA projection and reconstruction for eight Ames features'),
  assetPath: '/manim/numerical-methods/ames-pca-projection.mp4',
  posterPath: '/manim/numerical-methods/ames-pca-projection-poster.png',
  transcript: copy(
    '动画先列出八个房屋特征的不同单位，再展示逐列标准化。标准化矩阵 Z 通过协方差特征分解和 SVD 得到相同主方向；二维示意解释坐标旋转，同时明确真实计算发生在八维。只保留两个方向累计解释 71.7312%，标准化重建 RMSE 为 0.531684；保留四个方向达到 92.1506%，RMSE 降为 0.280168。结尾强调标准化与阈值必须写清楚，并说明房价标签没有参与方向计算。',
    'The animation first lists the different units of eight housing features, then standardizes each column. Covariance eigendecomposition and the SVD recover the same principal directions; a 2D schematic explains the axis rotation while labeling the real computation as eight-dimensional. Keeping two directions explains 71.7312% with standardized reconstruction RMSE 0.531684; four directions reach 92.1506% and reduce RMSE to 0.280168. The ending makes the scaling and threshold contracts explicit and states that sale price never determines the directions.',
  ),
  learningPurpose: copy(
    '把标准化、SVD、解释方差、载荷和重建误差放进同一条数值链。',
    'Place standardization, the SVD, explained variance, loadings, and reconstruction error in one numerical chain.',
  ),
  alt: copy(
    '八列 Ames 标准化特征经过 SVD 后投影到主方向，并比较两维与四维重建。',
    'Eight standardized Ames feature columns pass through the SVD, project onto principal directions, and compare two- and four-dimensional reconstructions.',
  ),
  caption: copy(
    'PCA 不读取房价标签；这里优化的是整体平方重建误差，不是预测误差。',
    'PCA does not read the sale-price target; it minimizes overall squared reconstruction error, not prediction error.',
  ),
}

const uciSmsSource: SourceReference = {
  label: copy('UCI SMS Spam Collection', 'UCI SMS Spam Collection'),
  href: 'https://archive.ics.uci.edu/dataset/228/sms+spam+collection',
  license: 'CC BY 4.0',
  usage: copy(
    '使用全部 5,574 条消息制作本地 UTF-8 CSV；保留标签、顺序、原文和重复记录。',
    'All 5,574 messages are materialized as a local UTF-8 CSV while preserving labels, order, text, and duplicates.',
  ),
}

const sparseConcept: MathConcept = {
  id: 'sms-tfidf-csr-contract',
  name: copy('短信 TF-IDF 的 CSR 合同', 'CSR contract for SMS TF-IDF'),
  formulaLatex: '\\rho=\\frac{\\operatorname{nnz}(X)}{mn}',
  variables: [
    { symbol: 'X', description: copy('5,574×1,881 的 TF-IDF 矩阵。', 'The 5,574-by-1,881 TF-IDF matrix.') },
    { symbol: '\\operatorname{nnz}(X)', description: copy('实际存储的 69,798 个非零权重。', 'The 69,798 nonzero weights that are actually stored.') },
    { symbol: '\\rho', description: copy('非零密度，本例约 0.66571%。', 'Nonzero density, about 0.66571% here.') },
  ],
  plainExplanation: copy(
    '每条短信只出现词表中的少量 token，因此一行只需存十几个非零权重，而不是 1,881 个位置。',
    'Each message contains only a small fraction of the vocabulary, so a row stores roughly a dozen weights instead of 1,881 positions.',
  ),
  geometricIntuition: copy(
    '高维空间中的每条短信都靠近许多坐标超平面；CSR 记录它离开哪些零平面。',
    'Each message in high-dimensional space lies on many coordinate hyperplanes; CSR records the axes on which it leaves zero.',
  ),
  numericalExample: copy(
    '69,798 个非零项把约 79.992 MiB 的 dense 数组压到约 0.820 MiB 的 CSR 数组。',
    '69,798 nonzeros reduce about 79.992 MiB of dense storage to about 0.820 MiB of CSR arrays.',
  ),
  codeExample: `start, end = X.indptr[row], X.indptr[row + 1]
total = sum(X.data[k] * vector[X.indices[k]] for k in range(start, end))`,
  codeOutput: copy('第 17 行窗口 [283,299)，16 项；与 SciPy 差值 0。', 'Row 17 uses [283,299), 16 entries; difference from SciPy is 0.'),
  modelConnection: copy(
    '词袋、TF-IDF、推荐系统与图邻接矩阵都依赖“只访问出现的连接”。',
    'Bag-of-words, TF-IDF, recommenders, and graph adjacency matrices all rely on visiting only present connections.',
  ),
}

const pcaConcept: MathConcept = {
  id: 'ames-pca-reconstruction-contract',
  name: copy('Ames PCA 的解释方差与重建', 'Explained variance and reconstruction in Ames PCA'),
  formulaLatex: 'Z_k=ZV_k,\\quad \\hat Z=Z_kV_k^T',
  variables: [
    { symbol: 'Z', description: copy('2,927×8 的标准化房屋特征矩阵。', 'The standardized 2,927-by-8 housing feature matrix.') },
    { symbol: 'V_k', description: copy('前 k 个右奇异向量组成的主方向。', 'Principal directions formed by the first k right singular vectors.') },
    { symbol: '\\hat Z', description: copy('从 k 个得分重建的标准化特征。', 'Standardized features reconstructed from k scores.') },
  ],
  plainExplanation: copy(
    'PCA 把八个相关特征改写为八个正交方向，再按每个方向携带的方差决定保留多少。',
    'PCA rewrites eight correlated features as eight orthogonal directions and retains directions according to their variance.',
  ),
  geometricIntuition: copy(
    '先旋转坐标轴，再把较短方向压扁；被压掉的正交距离形成重建误差。',
    'Rotate the axes, then flatten shorter directions; discarded orthogonal distances become reconstruction error.',
  ),
  numericalExample: copy(
    '两个方向解释 71.7312% 方差；四个方向解释 92.1506%，重建 RMSE 从 0.531684 降到 0.280168。',
    'Two directions explain 71.7312% of variance; four explain 92.1506%, reducing reconstruction RMSE from 0.531684 to 0.280168.',
  ),
  codeExample: `U, s, Vt = np.linalg.svd(Z, full_matrices=False)
ratio = s**2 / np.sum(s**2)
scores = Z @ Vt[:k].T
reconstructed = scores @ Vt[:k]`,
  codeOutput: copy('k90=4 · 累计解释方差=92.1506% · RMSE=0.280168', 'k90=4 · cumulative explained variance=92.1506% · RMSE=0.280168'),
  modelConnection: copy(
    'PCA 可用于检查数值特征冗余、压缩 dense 表示和可视化 embedding，但不能替代下游任务评估。',
    'PCA can inspect numeric-feature redundancy, compress dense representations, and visualize embeddings, but it cannot replace downstream evaluation.',
  ),
}

const sparseSections = [
  section(
    'v3-sparse-sms-contract',
    copy('真实案例合同：5,574 条短信如何变成列', 'Real case contract: How 5,574 messages become columns'),
    copy(
      md`本章使用 UCI SMS Spam Collection 的本地快照：5,574 条消息，其中 ham 4,827 条、spam 747 条。CSV 保留原始顺序、原文和 403 条重复消息；这里不清洗、不去重，也不训练分类器。标签只说明语料组成。

固定表示合同如下：全部文本转小写，token 正则为 **[a-z0-9']+**，只保留至少出现在 5 条消息中的 token。排序后的词表共有 1,881 列。第 $i$ 条消息是第 $i$ 行，第 $j$ 个 token 是第 $j$ 列，因此原始计数矩阵和 TF-IDF 矩阵的 shape 都是

$$
X\in\mathbb R^{5574\times1881}.
$$

IDF 固定为

$$
\operatorname{idf}_j=\log\frac{1+n}{1+\operatorname{df}_j}+1,
$$

随后每行做 L2 归一化。词表、列顺序、IDF 和归一化必须一起锁定，否则两个 shape 相同的矩阵也可能表示不同坐标。`,
      md`This lesson uses a local UCI SMS Spam Collection snapshot: 5,574 messages, with 4,827 ham and 747 spam rows. The CSV preserves source order, original text, and 403 duplicate messages. We do not clean, deduplicate, or train a classifier; labels only describe corpus composition.

The representation contract is fixed: lowercase all text, tokenize with **[a-z0-9']+**, and retain tokens that occur in at least five messages. The sorted vocabulary contains 1,881 columns. Message $i$ is row $i$, token $j$ is column $j$, so both the count and TF-IDF matrices have shape

$$
X\in\mathbb R^{5574\times1881}.
$$

IDF is fixed as

$$
\operatorname{idf}_j=\log\frac{1+n}{1+\operatorname{df}_j}+1,
$$

followed by row-wise L2 normalization. Vocabulary, column order, IDF, and normalization must be locked together; equal shapes alone do not imply equal coordinates.`,
    ),
    { visualIds: [routeBridgeVisual.id] },
  ),
  section(
    'v3-sparse-sms-storage-output',
    copy('固定运行结果：0.66571% 的位置非零', 'Locked output: 0.66571% of positions are nonzero'),
    copy(
      md`运行结果得到 $\operatorname{nnz}(X)=69,798$，平均每行只有 12.5221 个非零项，密度为

$$
\rho=\frac{69798}{5574\times1881}=0.00665713\approx0.66571\%.
$$

若用 float64 dense 数组，所有位置约占 79.992 MiB。真实 SciPy CSR 数组同时计算 data、indices 和 indptr 后占 0.820 MiB，dense/CSR 约为 97.55 倍。这个比较没有隐藏索引开销。

稀疏格式不是无条件获胜：当密度升高、访问方式不按行、需要频繁插入，或硬件更偏好连续 dense 运算时，索引和间接访问可能抵消优势。选择格式要同时看 nnz、访问模式和后续算子。`,
      md`The executed result gives $\operatorname{nnz}(X)=69,798$, only 12.5221 nonzeros per row on average, and density

$$
\rho=\frac{69798}{5574\times1881}=0.00665713\approx0.66571\%.
$$

A float64 dense array would occupy about 79.992 MiB. The real SciPy CSR arrays occupy 0.820 MiB after counting data, indices, and indptr together, a dense/CSR ratio of about 97.55. Index overhead is not hidden.

Sparse storage does not win unconditionally. Higher density, non-row access, frequent insertion, or hardware optimized for contiguous dense operations can let indexing and indirection erase the gain. Choose a format using nnz, access patterns, and downstream operators together.`,
    ),
  ),
  section(
    'v3-sparse-sms-matvec',
    copy('一行 CSR 点积：只访问 [283,299)', 'One CSR row dot product: Visit only [283,299)'),
    copy(
      md`对固定第 17 行，indptr 给出窗口 ([283,299))。因此这一行只访问 16 个 data/indices 对：

$$
(Xv)_{17}=\sum_{k=283}^{298}\operatorname{data}_k\,v_{\operatorname{indices}_k}.
$$

手写循环与 X @ v 的绝对差为 0。这不是证明所有稀疏库永远逐项完全相同，而是确认当前 CSR 坐标、权重和访问区间与库实现一致。动画先追踪这一行，再把工作量从 dense 的所有位置对比到 CSR 的 nnz。`,
      md`For fixed row 17, indptr gives interval ([283,299)), so the row visits only 16 data/index pairs:

$$
(Xv)_{17}=\sum_{k=283}^{298}\operatorname{data}_k\,v_{\operatorname{indices}_k}.
$$

The manual loop and X @ v differ by exactly 0. This does not claim that every sparse library always agrees bit-for-bit; it confirms that the current CSR coordinates, weights, and row interval match the library operation. The animation follows this row before comparing dense work over all positions with CSR work over nnz.`,
    ),
    { visualIds: [sparseAnimation.id] },
  ),
  section(
    'v3-sparse-to-pca-boundary',
    copy('下一章边界：普通 PCA 不是稀疏存储的直接后续算子', 'Next-chapter boundary: Ordinary PCA is not a direct sparse-storage operator'),
    copy(
      md`稀疏矩阵与 PCA 相邻，是为了比较两种结构，不是建议把短信 TF-IDF 直接转成 dense 再做普通 PCA。中心化通常会把原本的零变成非零，破坏稀疏性；高维稀疏文本常改用不显式中心化的 Truncated SVD。

下一章换回 dense 的 Ames 数值特征，专门研究“多列相关时，能否用更少的新坐标保留大部分变化”。`,
      md`Sparse matrices and PCA are adjacent to compare two structures, not to recommend densifying SMS TF-IDF and applying ordinary PCA. Centering usually turns stored zeros into nonzeros and destroys sparsity; high-dimensional sparse text often uses uncentered Truncated SVD instead.

The next lesson returns to dense Ames numeric features and asks whether correlated columns can be represented by fewer new coordinates while retaining most variation.`,
    ),
  ),
]

const pcaSections = [
  section(
    'v3-pca-ames-contract',
    copy('真实案例合同：八个标准化 Ames 特征', 'Real case contract: Eight standardized Ames features'),
    copy(
      md`本章复用 2,927 行 Ames 快照，并选择整体质量、一层面积、二层面积、居住面积、地下室面积、车库容量、车库面积和售出时房龄八列。房价不进入 PCA 方向计算。

因为评分、平方英尺、车辆数和年数的单位不同，先对每列做

$$
Z_{ij}=\frac{F_{ij}-\mu_j}{s_j}.
$$

这里 $\mu_j$ 与 $s_j$ 使用当前完整教学快照计算，因为本章只分析表示，不报告泛化性能。若 PCA 进入预测流水线，均值、尺度和 components 都必须只在训练集上拟合，再原样应用到验证集和新样本。`,
      md`This lesson reuses the 2,927-row Ames snapshot and selects overall quality, first-floor area, second-floor area, living area, basement area, garage capacity, garage area, and age at sale. Sale price does not enter the PCA direction calculation.

Because scores, square feet, car counts, and years use different units, every column is standardized first:

$$
Z_{ij}=\frac{F_{ij}-\mu_j}{s_j}.
$$

Here $\mu_j$ and $s_j$ are computed from the complete teaching snapshot because this lesson studies representation and reports no generalization metric. If PCA enters a predictive pipeline, means, scales, and components must be fit on training data only and then reused unchanged for validation and new examples.`,
    ),
    { visualIds: [routeBridgeVisual.id] },
  ),
  section(
    'v3-pca-ames-spectrum-output',
    copy('固定运行结果：两个方向保留 71.7312%', 'Locked output: Two directions retain 71.7312%'),
    copy(
      md`对标准化矩阵 $Z\in\mathbb R^{2927\times8}$ 做 $Z=U\Sigma V^T$。前四项解释方差分别是 51.8076%、19.9236%、12.1351% 和 8.2843%。因此：

| 保留方向数 | 累计解释方差 | 标准化逐元素重建 RMSE |
| ---: | ---: | ---: |
| 2 | 71.7312% | 0.531684 |
| 4 | 92.1506% | 0.280168 |

达到至少 90% 需要四个方向。这里的 RMSE 衡量 $Z$ 与 $\hat Z$ 的标准化特征差，不是房价预测误差。SVD 方差与协方差矩阵特征值的最大差为 $1.332\times10^{-15}$，说明两条计算路径数值对齐。`,
      md`Apply $Z=U\Sigma V^T$ to standardized $Z\in\mathbb R^{2927\times8}$. The first four explained ratios are 51.8076%, 19.9236%, 12.1351%, and 8.2843%. Therefore:

| Retained directions | Cumulative explained variance | Standardized elementwise reconstruction RMSE |
| ---: | ---: | ---: |
| 2 | 71.7312% | 0.531684 |
| 4 | 92.1506% | 0.280168 |

Four directions are required to reach at least 90%. This RMSE compares standardized features $Z$ and $\hat Z$; it is not a sale-price prediction error. SVD variance and covariance eigenvalues differ by at most $1.332\times10^{-15}$, showing that the two computational routes align numerically.`,
    ),
    { visualIds: [pcaAnimation.id] },
  ),
  section(
    'v3-pca-ames-loadings',
    copy('载荷：新方向由哪些原始列组成', 'Loadings: Which original columns compose each direction'),
    copy(
      md`PC1 最大绝对载荷来自车库容量 (0.4097)、车库面积 (0.4079)、整体质量 (0.4023) 和地下室面积 (0.3658)，可读成一条“整体规模与配置共同增加”的方向。PC2 则由二层面积 (0.7623) 主导，同时与地下室面积 (-0.3578) 和一层面积 (-0.3477) 形成对比，更像“垂直空间与一层/地下空间的分配”。

这只是对当前标准化列的数学描述，不自动生成因果解释。整个主方向乘以 (-1) 后，scores 和 loadings 会一起翻转，但子空间、解释方差和重建都不变。`,
      md`PC1's largest absolute loadings come from garage capacity (0.4097), garage area (0.4079), overall quality (0.4023), and basement area (0.3658), suggesting a joint size-and-amenity direction. PC2 is dominated by second-floor area (0.7623) and contrasts it with basement area (-0.3578) and first-floor area (-0.3477), resembling a vertical-versus-lower-level allocation direction.

This is a mathematical description of the current standardized columns, not an automatic causal explanation. Multiplying a complete direction by (-1) flips both scores and loadings, while leaving the subspace, explained variance, and reconstruction unchanged.`,
    ),
  ),
  section(
    'v3-pca-to-finite-difference',
    copy('下一步：从线性投影进入数值导数', 'Next: From linear projection to numerical derivatives'),
    copy(
      md`到这里，线性系统、条件数、稀疏访问和 PCA 都可以用矩阵运算精确写出。下一章进入有限差分：当导数没有直接给出，怎样用函数值近似变化率，并在截断误差与浮点舍入误差之间选择步长。`,
      md`Linear systems, conditioning, sparse access, and PCA can all be written as explicit matrix operations. The next lesson moves to finite differences: when derivatives are not directly available, how can function values approximate a rate of change, and how should step size balance truncation and floating-point roundoff?`,
    ),
  ),
]

function enhanceSparse(moduleDefinition: MathLabModule): MathLabModule {
  const insertedSections = keepFirstLabPlacement(insertAfterOpening(moduleDefinition.sections, sparseSections))
  return {
    ...moduleDefinition,
    estimatedMinutes: Math.max(moduleDefinition.estimatedMinutes, 70),
    learningObjectives: [
      copy('从真实文本构造稳定词表，并解释矩阵每一行、每一列和每个非零值。', 'Build a stable vocabulary from real text and explain every row, column, and nonzero value in the matrix.'),
      copy('使用真实数组字节数比较 dense、COO 与 CSR，而不是忽略索引开销。', 'Compare dense, COO, and CSR using real array bytes rather than hiding index overhead.'),
      ...moduleDefinition.learningObjectives,
    ],
    aiModelConnections: [
      copy('文本向量化先把 token 变成稳定列坐标，稀疏线性代数才能把巨大词表送入后续模型。', 'Text vectorization first turns tokens into stable columns so sparse linear algebra can feed large vocabularies into later models.'),
      ...moduleDefinition.aiModelConnections,
    ],
    concepts: [sparseConcept, ...moduleDefinition.concepts],
    sections: insertedSections,
    toc: insertAfterOpening(moduleDefinition.toc, sparseSections.map(tocFor)),
    visuals: [routeBridgeVisual, sparseAnimation, ...moduleDefinition.visuals],
    sourceReferences: [uciSmsSource, ...(moduleDefinition.sourceReferences ?? [])],
    importedAssetPaths: [
      ...(moduleDefinition.importedAssetPaths ?? []),
      routeBridgeVisual.assetPath!,
      sparseAnimation.assetPath!,
      sparseAnimation.posterPath!,
    ],
  }
}

function enhancePca(moduleDefinition: MathLabModule): MathLabModule {
  const insertedSections = keepFirstLabPlacement(insertAfterOpening(moduleDefinition.sections, pcaSections))
  return {
    ...moduleDefinition,
    estimatedMinutes: Math.max(moduleDefinition.estimatedMinutes, 75),
    learningObjectives: [
      copy('在八维 Ames 数值特征上核对标准化、SVD、解释方差和重建误差。', 'Check standardization, the SVD, explained variance, and reconstruction error on eight-dimensional Ames numeric features.'),
      copy('使用载荷解释新坐标，同时避免把符号或相关方向误写成因果关系。', 'Interpret new coordinates with loadings without treating signs or correlated directions as causal relations.'),
      ...moduleDefinition.learningObjectives,
    ],
    aiModelConnections: [
      copy('PCA 用无标签重建目标压缩 dense 特征；是否有助于模型仍需单独验证。', 'PCA compresses dense features using an unlabeled reconstruction objective; whether it helps a model remains a separate question.'),
      ...moduleDefinition.aiModelConnections,
    ],
    concepts: [pcaConcept, ...moduleDefinition.concepts],
    sections: insertedSections,
    toc: insertAfterOpening(moduleDefinition.toc, pcaSections.map(tocFor)),
    visuals: [routeBridgeVisual, pcaAnimation, ...moduleDefinition.visuals],
    importedAssetPaths: [
      ...(moduleDefinition.importedAssetPaths ?? []),
      routeBridgeVisual.assetPath!,
      pcaAnimation.assetPath!,
      pcaAnimation.posterPath!,
    ],
  }
}

export function enhanceNumericalBatch2Module(moduleDefinition: MathLabModule): MathLabModule {
  if (moduleDefinition.id === 'sparse-matrices') return enhanceSparse(moduleDefinition)
  if (moduleDefinition.id === 'pca') return enhancePca(moduleDefinition)
  return moduleDefinition
}
