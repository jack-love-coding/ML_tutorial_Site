import type {
  CheckpointReportField,
  CheckpointReportPrompt,
  ExperimentEvidence,
  LocalizedCopy,
  MathLabModuleId,
  ObservationPromptConfig,
} from '../types/mathLab'
import { linearAlgebraRouteModuleIds } from './learningRoutes.ts'

function copy(zh: string, en: string): LocalizedCopy {
  return { 'zh-CN': zh, en }
}

function fields(
  setup: LocalizedCopy,
  observation: LocalizedCopy,
  explanation: LocalizedCopy,
  nextStep: LocalizedCopy,
): CheckpointReportField[] {
  return [
    { key: 'setup', label: copy('设置', 'Setup'), guidingPrompt: setup, minLength: 8 },
    { key: 'observation', label: copy('观察', 'Observation'), guidingPrompt: observation, minLength: 8 },
    { key: 'explanation', label: copy('解释', 'Explanation'), guidingPrompt: explanation, minLength: 12 },
    { key: 'nextStep', label: copy('下一步', 'Next Step'), guidingPrompt: nextStep, minLength: 8 },
  ]
}

function evidence(
  moduleId: MathLabModuleId,
  sourceId: string,
  summary: LocalizedCopy,
  metrics: ExperimentEvidence['metrics'],
  prompt: LocalizedCopy,
): ExperimentEvidence {
  return { moduleId, sourceId, summary, metrics, prompt }
}

export const linearAlgebraCheckpointReportPrompts: CheckpointReportPrompt[] = [
  {
    id: 'feature-space-report',
    routeId: 'linear-algebra-route',
    moduleId: 'linear-algebra-feature-space',
    title: copy('对象如何变成向量？', 'How does an object become a vector?'),
    task: copy(
      '调整一组学习记录，说明它的特征坐标如何形成一个向量。',
      'Adjust one learner record and explain how its feature coordinates form a vector.',
    ),
    staticEvidence: evidence(
      'linear-algebra-feature-space',
      'feature-vector-story-lab',
      copy(
        '同一个对象可以被写成一组有顺序的特征坐标，模型读取的是这些坐标而不是原始叙述。',
        'The same object becomes an ordered set of feature coordinates; the model reads those coordinates rather than the raw story.',
      ),
      [
        { label: copy('对象', 'Object'), value: copy('学习状态 / 商品 / 用户', 'learner state / product / user') },
        { label: copy('坐标数量', 'Coordinate count'), value: 3 },
      ],
      copy(
        '指出每个坐标对应的语义，并说明改变一个坐标会怎样改变模型看到的对象。',
        'Name the meaning of each coordinate and explain how changing one coordinate changes the object seen by the model.',
      ),
    ),
    fields: fields(
      copy('你调整了哪条学习记录和哪些特征？', 'Which learner record and features did you adjust?'),
      copy('坐标变化后，向量在特征空间里的位置怎样移动？', 'After the coordinates changed, how did the vector move in feature space?'),
      copy('为什么这个对象可以被模型当作向量处理？', 'Why can the model treat this object as a vector?'),
      copy('下一步你会检查哪个特征是否需要缩放、清洗或重新定义？', 'Which feature would you inspect next for scaling, cleaning, or redefinition?'),
    ),
    exportTitle: copy('向量与样本表示报告', 'Vectors and Sample Representation Report'),
  },
  {
    id: 'distance-similarity-report',
    routeId: 'linear-algebra-route',
    moduleId: 'linear-algebra-distance-similarity',
    title: copy('为什么近不一定更像？', 'Why can near and similar disagree?'),
    task: copy(
      '改变维度权重，比较距离排序和角度相似度排序。',
      'Change dimension weights and compare distance ranking with angle-similarity ranking.',
    ),
    staticEvidence: evidence(
      'linear-algebra-distance-similarity',
      'vector-similarity-lab',
      copy(
        '欧氏距离关注坐标差的大小，cosine similarity 更关注方向；缩放和权重会改变它们的排序。',
        'Euclidean distance focuses on coordinate-gap magnitude, while cosine similarity focuses more on direction; scaling and weights can change their rankings.',
      ),
      [
        { label: copy('欧氏距离', 'Euclidean distance'), value: '||a - b||_2' },
        { label: copy('余弦相似度', 'cosine similarity'), value: 'a dot b / (||a|| ||b||)' },
      ],
      copy(
        '记录最近 pair 和最像 pair 是否相同，并解释哪个度量更适合当前任务。',
        'Record whether the closest pair and most similar pair match, then explain which metric fits the task.',
      ),
    ),
    fields: fields(
      copy('你调整了哪些维度权重或向量坐标？', 'Which dimension weights or vector coordinates did you adjust?'),
      copy('最近 pair 和最像 pair 是否一致？排序哪里发生了变化？', 'Did the closest pair and most similar pair agree? Where did the ranking change?'),
      copy('用距离和角度的区别解释这次变化。', 'Explain the change using the difference between distance and angle.'),
      copy('如果这是检索或推荐任务，你下一步会选哪种度量并验证什么？', 'If this were retrieval or recommendation, which metric would you choose next and what would you validate?'),
    ),
    exportTitle: copy('距离与相似度报告', 'Distance and Similarity Report'),
  },
  {
    id: 'matrix-transform-report',
    routeId: 'linear-algebra-route',
    moduleId: 'linear-algebra-matrix-transformations',
    title: copy('矩阵怎样混合输入坐标？', 'How does a matrix mix input coordinates?'),
    task: copy(
      '调整输入向量和矩阵列，说明输出如何由列向量加权混合得到。',
      'Adjust an input vector and matrix columns, then explain how the output is built as a weighted column mixture.',
    ),
    staticEvidence: evidence(
      'linear-algebra-matrix-transformations',
      'matrix-transform-lab',
      copy(
        '矩阵乘法可以看成按输入坐标给列向量加权，再把这些方向相加。',
        'Matrix multiplication can be read as weighting matrix columns by input coordinates and adding those directions.',
      ),
      [
        { label: copy('列组合', 'Ax = x1 a1 + x2 a2'), value: 'A x' },
        { label: copy('加权列混合', 'weighted column mixture'), value: copy('输入坐标作为权重', 'input coordinates as weights') },
      ],
      copy(
        '把输出拆成两列的贡献，说明哪一列主导了移动方向。',
        'Break the output into two column contributions and explain which column dominated the movement.',
      ),
    ),
    fields: fields(
      copy('你设置了怎样的矩阵列和输入向量？', 'What matrix columns and input vector did you set?'),
      copy('输出点主要沿哪一列的方向移动？', 'Which column direction did the output move along most?'),
      copy('用列向量线性组合解释 Ax 的结果。', 'Explain the result of Ax as a linear combination of columns.'),
      copy('下一步你会如何把这个解释连接到一层线性模型？', 'How would you connect this explanation to one linear model layer next?'),
    ),
    exportTitle: copy('矩阵变换报告', 'Matrix Transformation Report'),
  },
  {
    id: 'rank-null-space-report',
    routeId: 'linear-algebra-route',
    moduleId: 'linear-algebra-rank-null-space',
    title: copy('信息什么时候被压扁？', 'When does information get flattened?'),
    task: copy(
      '让矩阵列从独立变成接近共线，观察 rank、column space 和 null space 的变化。',
      'Move matrix columns from independent to nearly collinear and observe changes in rank, column space, and null space.',
    ),
    staticEvidence: evidence(
      'linear-algebra-rank-null-space',
      'matrix-column-space-lab',
      copy(
        'rank 描述输出空间的有效维度；null space 描述哪些输入方向被矩阵压到零或无法区分。',
        'Rank describes the effective output dimension; null space describes input directions that the matrix crushes to zero or cannot distinguish.',
      ),
      [
        { label: copy('秩切换', 'rank 1 / rank 2'), value: copy('线 / 平面', 'line / plane') },
        { label: copy('空间对照', 'column space vs null space'), value: copy('保留方向 / 消失方向', 'kept directions / vanished directions') },
      ],
      copy(
        '指出 rank 降低时丢失的是哪类方向，并连接到重复特征或推荐盲区。',
        'Name which directions are lost when rank drops, and connect that to duplicated features or recommendation blind spots.',
      ),
    ),
    fields: fields(
      copy('你怎样设置两列，让它们独立或接近共线？', 'How did you set the two columns to be independent or nearly collinear?'),
      copy('rank、column space 和 null direction 出现了什么变化？', 'What changed in rank, column space, and null direction?'),
      copy('为什么共线列会让某些输入差异无法被输出看见？', 'Why do collinear columns make some input differences invisible in the output?'),
      copy('下一步你会检查哪些特征是否重复或造成盲区？', 'Which features would you inspect next for duplication or blind spots?'),
    ),
    exportTitle: copy('Rank 与 Null Space 报告', 'Rank and Null Space Report'),
  },
  {
    id: 'eigen-stable-direction-report',
    routeId: 'linear-algebra-route',
    moduleId: 'eigenvalues-eigenvectors',
    title: copy('什么方向会保持稳定？', 'Which direction stays stable?'),
    task: copy(
      '运行 power iteration，说明向量为什么逐渐贴近矩阵的稳定方向。',
      'Run power iteration and explain why the vector moves toward a stable direction of the matrix.',
    ),
    staticEvidence: evidence(
      'eigenvalues-eigenvectors',
      'eigen-power-iteration-lab',
      copy(
        '反复应用同一个矩阵时，主特征方向会主导长期行为；Rayleigh quotient 和 residual 帮助检查是否接近特征向量。',
        'When the same matrix is applied repeatedly, the dominant eigen-direction drives long-term behavior; the Rayleigh quotient and residual help check whether the vector is near an eigenvector.',
      ),
      [
        { label: copy('迭代方法', 'power iteration'), value: copy('重复归一化', 'repeated normalization') },
        { label: copy('稳定读数', 'Rayleigh quotient / residual'), value: copy('lambda 估计 / 误差', 'lambda estimate / error') },
      ],
      copy(
        '记录向量方向、Rayleigh quotient 和 residual 的变化，解释稳定方向的含义。',
        'Record changes in vector direction, Rayleigh quotient, and residual, then explain what the stable direction means.',
      ),
    ),
    fields: fields(
      copy('你选择了什么初始向量或矩阵设置？', 'What initial vector or matrix setting did you choose?'),
      copy('迭代后方向、Rayleigh quotient 或 residual 怎样变化？', 'How did direction, Rayleigh quotient, or residual change after iteration?'),
      copy('为什么这个方向可以被称为矩阵的稳定方向？', 'Why can this direction be called a stable direction of the matrix?'),
      copy('下一步你会怎样把稳定方向连接到 PageRank 或表示传播？', 'How would you connect stable directions to PageRank or representation propagation next?'),
    ),
    exportTitle: copy('特征向量稳定方向报告', 'Eigenvector Stable Direction Report'),
  },
  {
    id: 'svd-low-rank-report',
    routeId: 'linear-algebra-route',
    moduleId: 'svd',
    title: copy('低秩近似保留了什么？', 'What does a low-rank approximation keep?'),
    task: copy(
      '改变保留秩 k，比较图像或矩阵结构的保留能量、细节和误差。',
      'Change kept rank k and compare retained energy, detail, and error in the image or matrix structure.',
    ),
    staticEvidence: evidence(
      'svd',
      'svd-low-rank-lab',
      copy(
        'SVD 把矩阵拆成按强度排序的方向层；保留前 k 层通常保留主要结构，同时丢掉较弱细节或噪声。',
        'SVD decomposes a matrix into strength-ordered directional layers; keeping the first k layers usually preserves main structure while dropping weaker detail or noise.',
      ),
      [
        { label: copy('保留秩', 'Kept rank'), value: 'k' },
        { label: copy('误差读数', 'Error readout'), value: 'sigma_{k+1}' },
      ],
      copy(
        '说明 k 改变时，保留能量、重建质量和误差读数如何一起变化。',
        'Explain how retained energy, reconstruction quality, and error readout move together as k changes.',
      ),
    ),
    fields: fields(
      copy('你把保留秩 k 设成多少？比较了哪些 k 值？', 'What kept rank k did you use? Which k values did you compare?'),
      copy('保留能量、重建细节和误差读数发生了什么变化？', 'What changed in retained energy, reconstruction detail, and error readout?'),
      copy('为什么大的 singular value 层会先保留主要结构？', 'Why do layers with large singular values preserve the main structure first?'),
      copy('下一步你会怎样选择 k 并检查下游质量？', 'How would you choose k next and check downstream quality?'),
    ),
    exportTitle: copy('SVD 低秩近似报告', 'SVD Low-Rank Report'),
  },
  {
    id: 'pca-centered-projection-report',
    routeId: 'linear-algebra-route',
    moduleId: 'pca',
    title: copy('PCA 为什么要先中心化？', 'Why must PCA center first?'),
    task: copy(
      '调整整体平移和保留维度，说明中心化、主方向和投影误差的关系。',
      'Adjust common shift and kept dimension, then explain the relationship among centering, principal directions, and projection error.',
    ),
    staticEvidence: evidence(
      'pca',
      'pca-projection-lab',
      copy(
        'PCA 寻找最大方差方向来做投影和压缩；它需要先中心化，并且主成分不是分类器。',
        'PCA finds maximum-variance directions for projection and compression; it needs centering first, and principal components are not classifiers.',
      ),
      [
        { label: copy('预处理', 'center first'), value: copy('减去均值', 'subtract the mean') },
        { label: copy('边界提醒', 'not a classifier'), value: copy('方差方向不等于类别边界', 'variance direction is not a class boundary') },
      ],
      copy(
        '记录中心化前后主方向和重建误差的变化，说明 PCA 能做什么、不能做什么。',
        'Record how principal directions and reconstruction error change before and after centering, then explain what PCA can and cannot do.',
      ),
    ),
    fields: fields(
      copy('你调整了哪些平移、离群点或保留维度设置？', 'Which shift, outlier, or kept-dimension settings did you adjust?'),
      copy('中心化、主方向和重建误差有什么变化？', 'What changed in centering, principal directions, and reconstruction error?'),
      copy('为什么 PCA 的最大方差方向不等于分类边界？', 'Why is PCA’s maximum-variance direction not the same as a classification boundary?'),
      copy('下一步你会怎样验证投影是否保留任务需要的信息？', 'How would you validate next whether the projection keeps task-relevant information?'),
    ),
    exportTitle: copy('PCA 中心化投影报告', 'PCA Centered Projection Report'),
  },
]

const promptByModuleId = new Map(linearAlgebraCheckpointReportPrompts.map((prompt) => [prompt.moduleId, prompt]))

export const checkpointReportByModuleId = Object.fromEntries(promptByModuleId) as Partial<Record<MathLabModuleId, CheckpointReportPrompt>>

export function checkpointReportForModule(moduleId: MathLabModuleId) {
  return promptByModuleId.get(moduleId)
}

export const observationPrompts: ObservationPromptConfig[] = [
  {
    id: 'distance-observe-metric-change',
    moduleId: 'linear-algebra-distance-similarity',
    title: copy('先制造一次排序变化', 'Create one ranking change first'),
    body: copy('调节维度权重，观察最近 pair 和最像 pair 是否一致。', 'Adjust dimension weights and observe whether the closest pair and most similar pair agree.'),
    targetLabId: 'vector-similarity-lab',
  },
  {
    id: 'rank-observe-collapse',
    moduleId: 'linear-algebra-rank-null-space',
    title: copy('把平面压成线', 'Flatten a plane to a line'),
    body: copy('让两列接近共线，观察 rank、列空间和 null direction。', 'Make two columns nearly collinear and observe rank, column space, and null direction.'),
    targetLabId: 'matrix-column-space-lab',
  },
  {
    id: 'svd-observe-k',
    moduleId: 'svd',
    title: copy('改变保留秩 k', 'Change kept rank k'),
    body: copy('把 k 从 1 调到 3，比较保留能量和误差。', 'Move k from 1 to 3 and compare retained energy with error.'),
    targetLabId: 'svd-low-rank-lab',
  },
  {
    id: 'pca-observe-centering',
    moduleId: 'pca',
    title: copy('先看中心化再看投影', 'Check centering before projection'),
    body: copy('调整体平移和保留维度，观察主方向和重建误差。', 'Adjust common shift and kept dimension, then observe principal directions and reconstruction error.'),
    targetLabId: 'pca-projection-lab',
  },
]

const observationPromptByModuleId = new Map(observationPrompts.map((prompt) => [prompt.moduleId, prompt]))

export function observationPromptForModule(moduleId: MathLabModuleId) {
  return observationPromptByModuleId.get(moduleId)
}

for (const moduleId of linearAlgebraRouteModuleIds) {
  if (!promptByModuleId.has(moduleId)) {
    throw new Error(`Missing checkpoint report prompt for ${moduleId}`)
  }
}
