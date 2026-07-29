import type { DownloadableCourseAsset } from './amesNumericalNotebook.ts'
import type { LocalizedCopy, MathLabModuleId } from '../types/mathLab.ts'

export const numericalBatch4ChapterIds = [
  'optimization',
  'training-diagnostics',
] as const satisfies readonly MathLabModuleId[]

export interface NumericalBatch4NotebookCompanion {
  id: 'banknote-logistic-optimization' | 'banknote-training-diagnostics'
  moduleId: (typeof numericalBatch4ChapterIds)[number]
  title: LocalizedCopy
  description: LocalizedCopy
  notebook: DownloadableCourseAsset
  dataset: DownloadableCourseAsset
  requirements: DownloadableCourseAsset
  supportingDownloads: readonly DownloadableCourseAsset[]
  outputId: 'banknote-logistic-optimization-summary' | 'banknote-training-diagnostics-summary'
  codeTitle: LocalizedCopy
  codeExample: string
  codeOutput: LocalizedCopy
}

const copy = (zhCN: string, en: string): LocalizedCopy => ({ 'zh-CN': zhCN, en })

const notebook: DownloadableCourseAsset = {
  publicPath: '/notebooks/numerical-methods/banknote-logistic-optimization.zh-CN.ipynb',
  filename: 'banknote-logistic-optimization.zh-CN.ipynb',
  label: copy('下载已运行的 Banknote 优化 Notebook', 'Download the executed Banknote optimization Notebook'),
  description: copy(
    '一个中文 Notebook 从本地数据校验、稳定 BCE 与梯度检查连续运行到五条轨迹、库端点和诊断报告。',
    'One Chinese Notebook runs continuously from local-data checks, stable BCE, and gradient checking through five traces, the library endpoint, and the diagnostic report.',
  ),
}

const dataset: DownloadableCourseAsset = {
  publicPath: '/datasets/numerical-methods/banknote-authentication.csv',
  filename: 'banknote-authentication.csv',
  label: copy('下载固定 Banknote 数据快照', 'Download the fixed Banknote dataset snapshot'),
  description: copy(
    '1,372 行、四个连续特征、0/1 类别和固定 train/validation/test 标签；运行时不访问远程 UCI。',
    '1,372 rows with four continuous features, 0/1 classes, and fixed train/validation/test labels; runtime never contacts UCI.',
  ),
}

const requirements: DownloadableCourseAsset = {
  publicPath: '/notebooks/numerical-methods/requirements.txt',
  filename: 'requirements.txt',
  label: copy('下载精确 Python 环境版本', 'Download exact Python requirements'),
  description: copy(
    '锁定 NumPy、pandas、SciPy、scikit-learn 与 Jupyter 执行版本。',
    'Pins NumPy, pandas, SciPy, scikit-learn, and the Jupyter execution stack.',
  ),
}

const traceJson: DownloadableCourseAsset = {
  publicPath: '/notebooks/numerical-methods/batch-4-outputs/banknote-training-traces.json',
  filename: 'banknote-training-traces.json',
  label: copy('下载完整 JSON 训练轨迹', 'Download complete JSON training traces'),
  description: copy(
    '包含五条运行的配置、每个接受的有限状态、最佳 validation 与终止元数据。',
    'Contains all five configurations, every accepted finite state, best validation, and terminal metadata.',
  ),
}

const traceCsv: DownloadableCourseAsset = {
  publicPath: '/notebooks/numerical-methods/batch-4-outputs/banknote-training-traces.csv',
  filename: 'banknote-training-traces.csv',
  label: copy('下载规范化 CSV 训练轨迹', 'Download normalized CSV training traces'),
  description: copy(
    '一行一个已接受的有限状态，便于表格审计与跨运行比较；失败尝试保留在 JSON 终止记录中。',
    'One accepted finite state per row for tabular auditing and cross-run comparison; failed attempts remain in JSON terminal records.',
  ),
}

const dictionary: DownloadableCourseAsset = {
  publicPath: '/datasets/numerical-methods/banknote-authentication-data-dictionary.json',
  filename: 'banknote-authentication-data-dictionary.json',
  label: copy('下载数据字典与来源说明', 'Download the data dictionary and source notes'),
  description: copy(
    '记录七列 schema、source-spelled curtosis、类别语义边界、DOI 与 CC BY 4.0 归属。',
    'Documents the seven-column schema, source-spelled curtosis, class-meaning boundary, DOI, and CC BY 4.0 attribution.',
  ),
}

const optimizationSummary: DownloadableCourseAsset = {
  publicPath: '/notebooks/numerical-methods/batch-4-outputs/optimization-summary.json',
  filename: 'optimization-summary.json',
  label: copy('下载优化章节结果摘要', 'Download the optimization chapter summary'),
  description: copy(
    '稳定 BCE、梯度检查、Armijo、五条运行、终止 fixtures 与最终选择规则的锁定结果。',
    'Locked stable-BCE, gradient-check, Armijo, five-run, terminal-fixture, and final-selection results.',
  ),
}

const diagnosticsSummary: DownloadableCourseAsset = {
  publicPath: '/notebooks/numerical-methods/batch-4-outputs/training-diagnostics-summary.json',
  filename: 'training-diagnostics-summary.json',
  label: copy('下载训练诊断章节结果摘要', 'Download the training-diagnostics chapter summary'),
  description: copy(
    '五条四步诊断链、最终测试报告与 scikit-learn 端点检查。',
    'Five four-step diagnostic chains, the final test report, and the scikit-learn endpoint check.',
  ),
}

const shared = { notebook, dataset, requirements }

const companions = {
  optimization: {
    ...shared,
    id: 'banknote-logistic-optimization',
    moduleId: 'optimization',
    title: copy('同一案例 · 第 1 步：稳定目标、步长与停止', 'One case · Part I: Stable objective, steps, and stopping'),
    description: copy(
      '从固定 CSV 重新计算 train-only 标准化与五条手写逻辑回归轨迹；页面显示关键里程碑，Notebook 和下载保留完整运行。',
      'Recompute train-only standardization and five manual logistic-regression traces from the fixed CSV. The page shows milestones; the Notebook and downloads retain complete runs.',
    ),
    supportingDownloads: [optimizationSummary, traceJson, traceCsv, dictionary],
    outputId: 'banknote-logistic-optimization-summary',
    codeTitle: copy('手写优化链：稳定 BCE 到明确终止', 'Manual optimization chain: Stable BCE to explicit terminal state'),
    codeExample: `def stable_bce(logits, targets):
    return np.mean(np.logaddexp(0.0, logits) - targets * logits)

def loss_and_grad(X, y, theta, l2=1e-3):
    ...

def armijo_step(state, initial_step=32.0, c=1e-4, rho=0.5):
    ...

def should_stop(previous, current, checkpoint):
    ...

runs = [train_logistic(dataset, preset) for preset in RUN_PRESETS]`,
    codeOutput: copy(
      `起点 BCE=0.6931471806
raw-fixed：best iter 52 · terminal validation-patience@112
standardized-too-small：max-iterations@500
standardized-stable：gradient-norm@484
standardized-too-large：best iter 13 · validation-patience@73
standardized-armijo：先拒绝 32、接受 16 · gradient-norm@48`,
      `start BCE=0.6931471806
raw-fixed: best iter 52 · terminal validation-patience@112
standardized-too-small: max-iterations@500
standardized-stable: gradient-norm@484
standardized-too-large: best iter 13 · validation-patience@73
standardized-armijo: reject 32, accept 16 · gradient-norm@48`,
    ),
  },
  'training-diagnostics': {
    ...shared,
    id: 'banknote-training-diagnostics',
    moduleId: 'training-diagnostics',
    title: copy('同一案例 · 第 2 步：从曲线到单变量实验', 'One case · Part II: From curves to a one-variable experiment'),
    description: copy(
      '同一批五条 trace 被整理为可见现象、可能原因、只改一个变量与预期下一次运行，并连接到唯一合格最终模型的测试端点。',
      'The same five traces become visible symptom, plausible cause, one variable change, and expected next run, then connect to the test endpoint of the sole eligible final model.',
    ),
    supportingDownloads: [diagnosticsSummary, traceJson, traceCsv, dictionary],
    outputId: 'banknote-training-diagnostics-summary',
    codeTitle: copy('受控比较与最终端点', 'Controlled comparison and final endpoint'),
    codeExample: `for diagnostic in diagnostics:
    print(diagnostic["visible"])
    print(diagnostic["plausibleCause"])
    print(diagnostic["changeOneVariable"])
    print(diagnostic["expectedNextRun"])

assert selected_run_id == "standardized-armijo"
assert final_report["threshold"] == 0.5`,
    codeOutput: copy(
      `selected=standardized-armijo · checkpoint=48
test BCE=0.0551101232 · accuracy=0.9805825243 · ROC-AUC=0.9994279176
confusion matrix=[[110,4],[0,92]]
与 scikit-learn 预测一致率=1.0 · 仅比较端点`,
      `selected=standardized-armijo · checkpoint=48
test BCE=0.0551101232 · accuracy=0.9805825243 · ROC-AUC=0.9994279176
confusion matrix=[[110,4],[0,92]]
prediction agreement with scikit-learn=1.0 · endpoint only`,
    ),
  },
} as const satisfies Record<(typeof numericalBatch4ChapterIds)[number], NumericalBatch4NotebookCompanion>

export function numericalBatch4NotebookForModule(
  moduleId: MathLabModuleId,
): NumericalBatch4NotebookCompanion | undefined {
  return companions[moduleId as (typeof numericalBatch4ChapterIds)[number]]
}
