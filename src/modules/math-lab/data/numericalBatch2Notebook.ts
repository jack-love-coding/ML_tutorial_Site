import type { DownloadableCourseAsset } from './amesNumericalNotebook.ts'
import type { LocalizedCopy, MathLabModuleId } from '../types/mathLab.ts'

export const numericalBatch2ChapterIds = [
  'sparse-matrices',
  'pca',
] as const satisfies readonly MathLabModuleId[]

export interface NumericalBatch2NotebookCompanion {
  id: 'sms-sparse-methods' | 'ames-pca-methods'
  moduleId: (typeof numericalBatch2ChapterIds)[number]
  title: LocalizedCopy
  description: LocalizedCopy
  notebook: DownloadableCourseAsset
  dataset: DownloadableCourseAsset
  requirements: DownloadableCourseAsset
  outputId: 'sms-sparse-summary' | 'ames-pca-summary'
  codeTitle: LocalizedCopy
  codeExample: string
  codeOutput: LocalizedCopy
}

const copy = (zhCN: string, en: string): LocalizedCopy => ({ 'zh-CN': zhCN, en })

const requirements: DownloadableCourseAsset = {
  publicPath: '/notebooks/numerical-methods/requirements.txt',
  filename: 'requirements.txt',
  label: copy('下载 Python 环境版本', 'Download pinned Python requirements'),
  description: copy(
    '锁定 NumPy、pandas、SciPy 与 Jupyter 执行版本。',
    'Pins the NumPy, pandas, SciPy, and Jupyter execution versions.',
  ),
}

const companions = {
  'sparse-matrices': {
    id: 'sms-sparse-methods',
    moduleId: 'sparse-matrices',
    title: copy('真实文本案例：从 5,574 条短信到 CSR', 'Real text case: From 5,574 messages to CSR'),
    description: copy(
      '使用 UCI SMS Spam Collection 的本地 CC BY 4.0 快照。Notebook 固定 token 规则、最低文档频率、IDF 和 L2 归一化，手写词表与 CSR 检查；本章只研究表示和存储，不训练分类器。',
      'Uses a local CC BY 4.0 snapshot of the UCI SMS Spam Collection. The Notebook fixes tokenization, minimum document frequency, IDF, and L2 normalization, then builds the vocabulary and checks CSR manually. This lesson studies representation and storage; it does not train a classifier.',
    ),
    notebook: {
      publicPath: '/notebooks/numerical-methods/sparse-matrices-sms.zh-CN.ipynb',
      filename: 'sparse-matrices-sms.zh-CN.ipynb',
      label: copy('下载已运行的稀疏矩阵 Notebook', 'Download the executed sparse-matrix Notebook'),
      description: copy(
        '与 sms-spam.csv 放在同一目录即可独立重新运行。',
        'Place it beside sms-spam.csv to rerun it independently.',
      ),
    },
    dataset: {
      publicPath: '/datasets/numerical-methods/sms-spam.csv',
      filename: 'sms-spam.csv',
      label: copy('下载 UCI 短信快照', 'Download the UCI SMS snapshot'),
      description: copy(
        '5,574 行原始短信；保留 UCI 标签、顺序和重复记录，不在本章中清洗。',
        '5,574 original messages with UCI labels, order, and duplicates preserved; no cleaning is performed in this lesson.',
      ),
    },
    requirements,
    outputId: 'sms-sparse-summary',
    codeTitle: copy('短信 TF-IDF：确定性词表与 CSR', 'SMS TF-IDF: deterministic vocabulary and CSR'),
    codeExample: `documents = [TOKEN_PATTERN.findall(text.lower()) for text in sms["message"]]
document_frequency = Counter()
for tokens in documents:
    document_frequency.update(set(tokens))

vocabulary = sorted(token for token, df in document_frequency.items() if df >= 5)
token_to_column = {token: column for column, token in enumerate(vocabulary)}

counts_csr = sparse.csr_matrix(
    (values, (rows, columns)),
    shape=(len(documents), len(vocabulary)),
    dtype=np.float64,
)
idf = np.log((1 + counts_csr.shape[0]) / (1 + document_frequency_array)) + 1
tfidf = sparse.diags(1 / row_norms) @ counts_csr.multiply(idf)`,
    codeOutput: copy(
      `shape = [5574, 1881] · nnz = 69798
密度 = 0.66571% · 平均每行非零项 = 12.5221
dense float64 = 79.992 MiB · CSR = 0.820 MiB
dense / CSR = 97.55x
第 17 行手写点积与 SciPy 差值 = 0.000e+0`,
      `shape = [5574, 1881] · nnz = 69798
density = 0.66571% · average nonzeros per row = 12.5221
dense float64 = 79.992 MiB · CSR = 0.820 MiB
dense / CSR = 97.55x
row 17 manual-dot versus SciPy difference = 0.000e+0`,
    ),
  },
  pca: {
    id: 'ames-pca-methods',
    moduleId: 'pca',
    title: copy('Ames 案例：八个特征如何变成主方向', 'Ames case: How eight features become principal directions'),
    description: copy(
      '复用前几章的 2,927 行 Ames 快照。Notebook 对八个房屋特征标准化后直接做 SVD，标签不会参与主方向计算；页面固定展示解释方差、载荷和重建误差。',
      'Reuses the 2,927-row Ames snapshot from the preceding lessons. The Notebook standardizes eight housing features and applies the SVD directly; the target never determines the principal directions. The page locks explained variance, loadings, and reconstruction error.',
    ),
    notebook: {
      publicPath: '/notebooks/numerical-methods/pca-ames.zh-CN.ipynb',
      filename: 'pca-ames.zh-CN.ipynb',
      label: copy('下载已运行的 PCA Notebook', 'Download the executed PCA Notebook'),
      description: copy(
        '与 ames-housing-numeric.csv 放在同一目录即可独立重新运行。',
        'Place it beside ames-housing-numeric.csv to rerun it independently.',
      ),
    },
    dataset: {
      publicPath: '/datasets/numerical-methods/ames-housing-numeric.csv',
      filename: 'ames-housing-numeric.csv',
      label: copy('下载 Ames 数值快照', 'Download the Ames numeric snapshot'),
      description: copy(
        '与最小二乘章节相同的 2,927 行固定数据，方便逐章复用。',
        'The same fixed 2,927-row data used by the least-squares lesson for chapter-to-chapter continuity.',
      ),
    },
    requirements,
    outputId: 'ames-pca-summary',
    codeTitle: copy('Ames PCA：标准化、SVD、投影与重建', 'Ames PCA: standardization, SVD, projection, and reconstruction'),
    codeExample: `F = ames[FEATURES].to_numpy(dtype=float)
Z = (F - F.mean(axis=0)) / F.std(axis=0, ddof=0)
U, singular_values, Vt = np.linalg.svd(Z, full_matrices=False)

component_variance = singular_values**2 / (len(Z) - 1)
explained_ratio = component_variance / component_variance.sum()
k90 = np.searchsorted(np.cumsum(explained_ratio), 0.90) + 1

basis = Vt[:k90].T
scores = Z @ basis
reconstructed = scores @ basis.T
rmse = np.sqrt(np.mean((Z - reconstructed) ** 2))`,
    codeOutput: copy(
      `shape = [2927, 8]
前四项解释方差 = [51.8076%, 19.9236%, 12.1351%, 8.2843%]
两个主成分累计解释 = 71.7312% · 标准化重建 RMSE = 0.531684
达到至少 90% 需要 4 个主成分 · RMSE = 0.280168
max |SVD 方差 − 协方差特征值| = 1.332e-15`,
      `shape = [2927, 8]
first four explained ratios = [51.8076%, 19.9236%, 12.1351%, 8.2843%]
two-component cumulative variance = 71.7312% · standardized reconstruction RMSE = 0.531684
four components reach at least 90% · RMSE = 0.280168
max |SVD variance − covariance eigenvalue| = 1.332e-15`,
    ),
  },
} as const satisfies Record<(typeof numericalBatch2ChapterIds)[number], NumericalBatch2NotebookCompanion>

export function numericalBatch2NotebookForModule(
  moduleId: MathLabModuleId,
): NumericalBatch2NotebookCompanion | undefined {
  return companions[moduleId as (typeof numericalBatch2ChapterIds)[number]]
}
