import type { LocalizedCopy, MathLabModuleId } from '../types/mathLab.ts'

export const amesNumericalChapterIds = [
  'least-squares-fitting',
  'lu-decomposition',
  'condition-numbers',
] as const satisfies readonly MathLabModuleId[]

export interface DownloadableCourseAsset {
  publicPath: string
  filename: string
  label: LocalizedCopy
  description: LocalizedCopy
}

export interface AmesNumericalNotebookCompanion {
  id: 'ames-housing-numerical-methods'
  moduleId: (typeof amesNumericalChapterIds)[number]
  title: LocalizedCopy
  description: LocalizedCopy
  notebook: DownloadableCourseAsset
  dataset: DownloadableCourseAsset
  requirements: DownloadableCourseAsset
  outputId:
    | 'ames-least-squares-summary'
    | 'ames-lu-summary'
    | 'ames-conditioning-summary'
  codeTitle: LocalizedCopy
  codeExample: string
  codeOutput: LocalizedCopy
}

const copy = (zhCN: string, en: string): LocalizedCopy => ({ 'zh-CN': zhCN, en })

export const amesNumericalNotebookAsset: DownloadableCourseAsset = {
  publicPath: '/notebooks/numerical-methods/ames-housing-numerical-methods.zh-CN.ipynb',
  filename: 'ames-housing-numerical-methods.zh-CN.ipynb',
  label: copy('下载已运行的完整 Notebook', 'Download the complete executed Notebook'),
  description: copy(
    '包含最小二乘、LUP、条件数三部分及页面同款输出。与 CSV 下载到同一目录即可重新运行。',
    'Includes least squares, LUP, conditioning, and the page outputs. Put it beside the downloaded CSV to rerun it.',
  ),
}

export const amesNumericalDatasetAsset: DownloadableCourseAsset = {
  publicPath: '/datasets/numerical-methods/ames-housing-numeric.csv',
  filename: 'ames-housing-numeric.csv',
  label: copy('下载 Ames 数值快照', 'Download the Ames numeric snapshot'),
  description: copy(
    '2,927 行固定数值数据；已完成列选择和异常记录排除，不在课程中重复清洗。',
    'A fixed 2,927-row numeric snapshot with reviewed columns and invalid records removed before the lesson.',
  ),
}

export const amesNumericalRequirementsAsset: DownloadableCourseAsset = {
  publicPath: '/notebooks/numerical-methods/requirements.txt',
  filename: 'requirements.txt',
  label: copy('下载 Python 环境版本', 'Download pinned Python requirements'),
  description: copy(
    '锁定 NumPy、pandas、SciPy 与 Jupyter 执行版本。',
    'Pins the NumPy, pandas, SciPy, and Jupyter execution versions.',
  ),
}

const shared = {
  id: 'ames-housing-numerical-methods' as const,
  notebook: amesNumericalNotebookAsset,
  dataset: amesNumericalDatasetAsset,
  requirements: amesNumericalRequirementsAsset,
}

const companions = {
  'least-squares-fitting': {
    ...shared,
    moduleId: 'least-squares-fitting',
    title: copy('同一案例 · 第 1 步：从房屋表格到最小二乘', 'One case · Step 1: From housing table to least squares'),
    description: copy(
      '下面的代码从本地快照构造五个标准化特征与截距列。逐行累加正规方程负责揭示结构，`np.linalg.lstsq` 负责给出库基准。页面只摘录关键输出，完整中间量保留在 Notebook。',
      'The code builds five standardized features plus an intercept from the local snapshot. Row-wise normal-equation accumulation exposes the structure, while `np.linalg.lstsq` supplies the library baseline. The page shows key outputs; the Notebook retains every intermediate.',
    ),
    outputId: 'ames-least-squares-summary',
    codeTitle: copy('Ames 最小二乘：最小实现与库基准', 'Ames least squares: minimal implementation and library baseline'),
    codeExample: `FEATURES = [
    "overall_quality", "living_area_sqft", "basement_sqft",
    "garage_area_sqft", "house_age_at_sale",
]
F = ames[FEATURES].to_numpy(dtype=float)
Z = (F - F.mean(axis=0)) / F.std(axis=0, ddof=0)
X = np.column_stack([np.ones(len(Z)), Z])
y = ames["sale_price_usd"].to_numpy(dtype=float) / 1000

G = np.zeros((X.shape[1], X.shape[1]))
c = np.zeros(X.shape[1])
for row, target in zip(X, y, strict=True):
    G += np.outer(row, row)
    c += row * target
beta_normal = np.linalg.solve(G, c)
beta_lstsq, _, rank, _ = np.linalg.lstsq(X, y, rcond=None)`,
    codeOutput: copy(
      `rows = 2927 · rank = 6
β（千美元）= [180.840006, 28.882212, 26.776014, 14.874714, 10.106863, -10.010762]
RMSE = 35.834182 · MAE = 23.872932 · R² = 0.79880768
max |正规方程解 − lstsq 解| = 2.888e-12`,
      `rows = 2927 · rank = 6
β (kUSD) = [180.840006, 28.882212, 26.776014, 14.874714, 10.106863, -10.010762]
RMSE = 35.834182 · MAE = 23.872932 · R² = 0.79880768
max |normal-equation solution − lstsq solution| = 2.888e-12`,
    ),
  },
  'lu-decomposition': {
    ...shared,
    moduleId: 'lu-decomposition',
    title: copy('同一案例 · 第 2 步：分解一次，复用多个目标', 'One case · Step 2: Factor once, reuse across targets'),
    description: copy(
      '这一章不再换矩阵：左侧就是上一章的 6×6 Gram 矩阵。手写 LUP 展示主元选择、前代和回代；SciPy 用同一个分解先解房价，再解对数房价的右端项。',
      'This chapter keeps the same matrix: the 6×6 Gram matrix from the preceding lesson. Manual LUP exposes pivot selection, forward substitution, and backward substitution; SciPy reuses one factorization for both price and log-price right-hand sides.',
    ),
    outputId: 'ames-lu-summary',
    codeTitle: copy('Ames 正规方程：手写 LUP 与 SciPy', 'Ames normal system: manual LUP and SciPy'),
    codeExample: `G = X.T @ X
c_price = X.T @ y_price_kusd

P, L, U, pivot_rows = lup_factor_manual(G)
z = forward_substitution(L, P @ c_price)
beta_manual = backward_substitution(U, z)

factor = scipy.linalg.lu_factor(G)
beta_scipy = scipy.linalg.lu_solve(factor, c_price)
c_log_price = X.T @ np.log(ames["sale_price_usd"])
beta_log_price = scipy.linalg.lu_solve(factor, c_log_price)`,
    codeOutput: copy(
      `system shape = [6, 6] · pivot rows = [0, 1, 2, 3, 4]
β（千美元）= [180.840006, 28.882212, 26.776014, 14.874714, 10.106863, -10.010762]
||PG − LU||∞ = 4.547e-13 · ||Gβ − c||∞ = 1.455e-11
max |手写 LUP − SciPy| = 7.105e-15
复用分解后的 log(price) 截距 = 12.02122130`,
      `system shape = [6, 6] · pivot rows = [0, 1, 2, 3, 4]
β (kUSD) = [180.840006, 28.882212, 26.776014, 14.874714, 10.106863, -10.010762]
||PG − LU||∞ = 4.547e-13 · ||Gβ − c||∞ = 1.455e-11
max |manual LUP − SciPy| = 7.105e-15
reused-factor log(price) intercept = 12.02122130`,
    ),
  },
  'condition-numbers': {
    ...shared,
    moduleId: 'condition-numbers',
    title: copy('同一案例 · 第 3 步：先问问题是否敏感', 'One case · Step 3: Ask whether the problem is sensitive'),
    description: copy(
      '先比较未缩放与标准化的 Ames 设计矩阵，再加入一个明确标注为“诊断场景”的近重复列。条件数由奇异值比值手算，并与 `np.linalg.cond` 对照；真实快照本身不会被改写。',
      'We compare the unscaled and standardized Ames designs, then add an explicitly labeled diagnostic near-duplicate column. The condition number is computed from singular values and checked against `np.linalg.cond`; the real snapshot itself is never modified.',
    ),
    outputId: 'ames-conditioning-summary',
    codeTitle: copy('Ames 条件数：尺度、正规方程与近共线性', 'Ames conditioning: scale, normal equations, and near-collinearity'),
    codeExample: `def cond_from_singular_values(A):
    sigma = np.linalg.svd(A, compute_uv=False)
    return sigma[0] / sigma[-1]

kappa_raw = cond_from_singular_values(X_raw)
kappa_scaled = np.linalg.cond(X_scaled)
kappa_gram = np.linalg.cond(X_scaled.T @ X_scaled)

noise = np.sin(ames["ames_order"].to_numpy() * 0.017)
noise = (noise - noise.mean()) / noise.std(ddof=0)
near_duplicate = Z[:, 1] + 1e-4 * noise
X_near = np.column_stack([X_scaled, near_duplicate])
kappa_near = np.linalg.cond(X_near)`,
    codeOutput: copy(
      `κ₂(未缩放 X) = 13044.220254
κ₂(标准化 X) = 3.222571
κ₂(XᵀX) = 10.384962 ≈ κ₂(X)²
κ₂(加入近重复列) = 26644.503135
目标相对扰动 1e-5 → 系数相对变化 0.00329613（放大约 329.61 倍）
2×2 诊断：解 [1, 1] → [0, 2]`,
      `κ₂(unscaled X) = 13044.220254
κ₂(standardized X) = 3.222571
κ₂(XᵀX) = 10.384962 ≈ κ₂(X)²
κ₂(with near-duplicate column) = 26644.503135
relative target perturbation 1e-5 → relative coefficient change 0.00329613 (about 329.61×)
2×2 diagnostic: solution [1, 1] → [0, 2]`,
    ),
  },
} as const satisfies Record<(typeof amesNumericalChapterIds)[number], AmesNumericalNotebookCompanion>

export function amesNumericalNotebookForModule(
  moduleId: MathLabModuleId,
): AmesNumericalNotebookCompanion | undefined {
  return companions[moduleId as (typeof amesNumericalChapterIds)[number]]
}
