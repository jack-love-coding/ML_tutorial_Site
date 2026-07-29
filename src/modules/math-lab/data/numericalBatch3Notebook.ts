import type { DownloadableCourseAsset } from './amesNumericalNotebook.ts'
import type { LocalizedCopy, MathLabModuleId } from '../types/mathLab.ts'

export const numericalBatch3ChapterIds = [
  'finite-difference-methods',
  'nonlinear-equations',
] as const satisfies readonly MathLabModuleId[]

export interface NumericalBatch3NotebookCompanion {
  id: 'logit-calibration-finite-difference' | 'logit-calibration-root-finding'
  moduleId: (typeof numericalBatch3ChapterIds)[number]
  title: LocalizedCopy
  description: LocalizedCopy
  notebook: DownloadableCourseAsset
  dataset: DownloadableCourseAsset
  requirements: DownloadableCourseAsset
  outputId: 'finite-difference-calibration-summary' | 'nonlinear-calibration-summary'
  codeTitle: LocalizedCopy
  codeExample: string
  codeOutput: LocalizedCopy
}

const copy = (zhCN: string, en: string): LocalizedCopy => ({ 'zh-CN': zhCN, en })

const notebook: DownloadableCourseAsset = {
  publicPath: '/notebooks/numerical-methods/logit-bias-calibration.zh-CN.ipynb',
  filename: 'logit-bias-calibration.zh-CN.ipynb',
  label: copy('下载已运行的偏置校准 Notebook', 'Download the executed bias-calibration Notebook'),
  description: copy(
    '与固定 fixture 放在同一目录即可从有限差分连续运行到非线性求根。',
    'Place it beside the fixed fixture to rerun the continuous finite-difference and root-finding case.',
  ),
}

const dataset: DownloadableCourseAsset = {
  publicPath: '/datasets/numerical-methods/logit-calibration-fixture.json',
  filename: 'logit-calibration-fixture.json',
  label: copy('下载 12 个 logit 的固定数据', 'Download the fixed 12-logit fixture'),
  description: copy(
    '项目编写的确定性教学数据，不含个人数据，也不代表生产分布。',
    'A project-authored deterministic teaching fixture with no personal data or production-population claim.',
  ),
}

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
  'finite-difference-methods': {
    id: 'logit-calibration-finite-difference',
    moduleId: 'finite-difference-methods',
    title: copy('同一条残差曲线（上）：用函数值检查局部斜率', 'One residual curve, part I: Check local slope with function values'),
    description: copy(
      '12 个固定 logit 加上标量偏置 b 后，平均概率与 0.62 的差记为 F(b)。本章在 b=0.35 比较前向与中心差分，完整扫描 h=10⁻¹ 到 10⁻¹²，并与可解析导数对照。',
      'A scalar bias b is added to 12 fixed logits, and F(b) is the gap between mean probability and 0.62. At b=0.35, this lesson compares forward and central differences over h=10⁻¹ through 10⁻¹² against the analytic derivative.',
    ),
    notebook,
    dataset,
    requirements,
    outputId: 'finite-difference-calibration-summary',
    codeTitle: copy('步长扫描：截断误差与浮点相消', 'Step sweep: truncation error and floating-point cancellation'),
    codeExample: `def residual(b):
    return expit(logits + b).mean() - target_rate

def residual_derivative(b):
    probabilities = expit(logits + b)
    return np.mean(probabilities * (1.0 - probabilities))

for exponent in range(-1, -13, -1):
    h = 10.0 ** exponent
    forward = (residual(b0 + h) - residual(b0)) / h
    central = (residual(b0 + h) - residual(b0 - h)) / (2.0 * h)`,
    codeOutput: copy(
      `b₀=0.35 · F(b₀)=-0.06078698810485639
解析导数=0.1630982543997438
前向差分最佳采样 h=1e-7 · 绝对误差=6.083e-10
中心差分最佳采样 h=1e-5 · 绝对误差=2.339e-12
h=1e-12 时中心差分误差回升到 6.200e-5`,
      `b₀=0.35 · F(b₀)=-0.06078698810485639
analytic derivative=0.1630982543997438
best sampled forward h=1e-7 · absolute error=6.083e-10
best sampled central h=1e-5 · absolute error=2.339e-12
at h=1e-12, central-difference error rises to 6.200e-5`,
    ),
  },
  'nonlinear-equations': {
    id: 'logit-calibration-root-finding',
    moduleId: 'nonlinear-equations',
    title: copy('同一条残差曲线（下）：求出平均概率等于 0.62 的偏置', 'One residual curve, part II: Solve for mean probability 0.62'),
    description: copy(
      '沿用上一章完全相同的 F(b)，在 [-4,4] 内求 F(b)=0。页面并列展示二分、Newton 与割线法的固定迭代结果，并区分函数求值、导数求值、残差和步长。',
      'Using exactly the same F(b) as the previous lesson, solve F(b)=0 inside [-4,4]. The page compares locked bisection, Newton, and secant results while separating function evaluations, derivative evaluations, residual, and step size.',
    ),
    notebook,
    dataset,
    requirements,
    outputId: 'nonlinear-calibration-summary',
    codeTitle: copy('三个求根器：同一停止条件，不同信息成本', 'Three root solvers: one stopping contract, different information costs'),
    codeExample: `bracket = (-4.0, 4.0)
newton_start = 0.0
secant_starts = (-1.0, 1.0)

bisection = bisection_trace(residual, bracket)
newton = newton_trace(residual, residual_derivative, newton_start)
secant = secant_trace(residual, secant_starts)

assert abs(residual(newton["root"])) <= 1e-11`,
    codeOutput: copy(
      `根 b*=0.730290740297536 · 平均概率=0.619999999995351
二分法：37 次更新 · 39 次函数求值
Newton：3 次更新 · 4 次函数求值 + 4 次导数求值
割线法：5 次更新 · 7 次函数求值
失败检查：无异号区间会拒绝；饱和区 Newton 会离开保护域`,
      `root b*=0.730290740297536 · mean probability=0.619999999995351
bisection: 37 updates · 39 function evaluations
Newton: 3 updates · 4 function + 4 derivative evaluations
secant: 5 updates · 7 function evaluations
failure checks: reject a non-sign-changing bracket; saturated Newton leaves the safeguard domain`,
    ),
  },
} as const satisfies Record<(typeof numericalBatch3ChapterIds)[number], NumericalBatch3NotebookCompanion>

export function numericalBatch3NotebookForModule(
  moduleId: MathLabModuleId,
): NumericalBatch3NotebookCompanion | undefined {
  return companions[moduleId as (typeof numericalBatch3ChapterIds)[number]]
}
