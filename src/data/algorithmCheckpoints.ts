import type { AlgorithmCheckpointItem, ModuleSlug } from '../types/ml'

function copy(zhCN: string, en: string) {
  return { 'zh-CN': zhCN, en }
}

function checkpoint(
  id: string,
  prompt: ReturnType<typeof copy>,
  choices: AlgorithmCheckpointItem['choices'],
  answer: string,
  explanation: ReturnType<typeof copy>,
  misconceptionTags: string[],
  revisitChapterId: string,
): AlgorithmCheckpointItem {
  return {
    id,
    prompt,
    choices,
    answer,
    explanation,
    misconceptionTags,
    revisitChapterId,
  }
}

function choice(id: string, zhCN: string, en: string) {
  return {
    id,
    label: copy(zhCN, en),
  }
}

export const algorithmCheckpointsBySlug: Record<ModuleSlug, AlgorithmCheckpointItem[]> = {
  'ai-overview': [
    checkpoint(
      'ai-overview-task-type',
      copy('老师问：如果我们拿历史房屋数据来预测成交价，这道题先归入哪类 ML 任务？', 'Teacher question: if we predict sale price from historical house data, what ML task type is it?'),
      [
        choice('supervised-regression', '监督学习中的回归：有输入特征，也有连续数值标签。', 'Supervised regression: there are input features and continuous numeric labels.'),
        choice('unsupervised', '无监督学习：因为我们不需要给模型答案。', 'Unsupervised learning: because we do not need to give the model answers.'),
        choice('generative', '生成式 AI：因为模型最后会输出一个数字。', 'Generative AI: because the model outputs a number.'),
      ],
      'supervised-regression',
      copy(
        '看任务类型时，先问“训练时有没有标准答案”。这里的历史成交价就是标签 y，而且它是连续数值，所以这是监督学习中的回归。注意：模型输出一个数字，不等于它就是生成式 AI。',
        'When classifying the task, first ask whether training has answer keys. Historical sale price is the label y, and it is continuous, so this is supervised regression. Outputting a number does not make the task generative AI.',
      ),
      ['task-type-confusion'],
      'learning-types',
    ),
    checkpoint(
      'ai-overview-training-flow',
      copy('老师追问：为什么不能在 test set 上反复调参？', 'Teacher follow-up: why should you not tune repeatedly on the test set?'),
      [
        choice('leakage', '测试集会变成反馈来源，最终分数不再可靠估计泛化。', 'The test set becomes feedback, so the final score no longer reliably estimates generalization.'),
        choice('faster', '因为这样训练速度会变慢，但分数仍然可靠。', 'Because it slows training down, but the score remains reliable.'),
        choice('labels', '因为 test set 不能有标签。', 'Because a test set cannot have labels.'),
      ],
      'leakage',
      copy(
        '训练集像练习册，验证集像平时测验，测试集像最后考试。你如果一边看期末试卷一边改复习策略，分数当然可能变好，但它已经不能诚实反映泛化能力了。',
        'The training set is practice, validation is a quiz, and test is the final exam. If you keep looking at the final exam while changing strategy, the score may improve, but it no longer honestly estimates generalization.',
      ),
      ['test-set-tuning'],
      'training-flow',
    ),
  ],
  'loss-functions': [
    checkpoint(
      'loss-error-rule',
      copy('同一个预测误差为什么可能对应不同的 loss？', 'Why can the same prediction error map to different losses?'),
      [
        choice('rule', 'loss 是我们主动选择的评分规则。', 'Loss is the scoring rule we choose.'),
        choice('raw-gap', 'loss 永远等于预测值和真实值的原始差。', 'Loss always equals the raw prediction-target gap.'),
        choice('accuracy', 'loss 只关心分类是否正确。', 'Loss only cares whether classification is correct.'),
      ],
      'rule',
      copy(
        '误差只是差距；loss 决定如何惩罚这个差距。MSE、MAE、交叉熵会把同一类错误改写成不同训练信号。',
        'Error is the gap; loss decides how to penalize it. MSE, MAE, and cross-entropy turn similar errors into different training signals.',
      ),
      ['error-equals-loss'],
      'why-loss',
    ),
    checkpoint(
      'loss-nll-scale',
      copy('为什么 likelihood 常被改写成 negative log-likelihood？', 'Why is likelihood often rewritten as negative log-likelihood?'),
      [
        choice('stable-minimize', '把连乘概率改成稳定的加和目标，并适配最小化训练。', 'It turns probability products into stable sums and matches minimization.'),
        choice('change-model', '它会把原来的概率模型换成完全不同的模型。', 'It changes the original probabilistic model into a different model.'),
        choice('remove-probability', '它删除了概率含义，只保留分类准确率。', 'It removes probability meaning and keeps only accuracy.'),
      ],
      'stable-minimize',
      copy(
        '取对数把连乘变加和，负号把最大化似然改成最小化损失；比较的参数偏好没有改变。',
        'The log turns products into sums, and the minus sign changes maximum likelihood into loss minimization without changing the parameter preference.',
      ),
      ['nll-changes-problem'],
      'negative-log',
    ),
  ],
  'gradient-descent': [
    checkpoint(
      'gd-learning-rate-stability',
      copy('学习率过大时，优化轨迹最可能出现什么现象？', 'What is most likely when the learning rate is too large?'),
      [
        choice('overshoot', '反复越过谷底，loss 震荡甚至发散。', 'It overshoots the valley, causing oscillation or divergence.'),
        choice('always-faster', '一定更快收敛到同一个最优点。', 'It always converges faster to the same optimum.'),
        choice('zero-gradient', '梯度会自动变成 0。', 'The gradient automatically becomes zero.'),
      ],
      'overshoot',
      copy(
        '学习率控制每一步的距离。过大时方向可能仍对，但步子跨过低点，曲线会来回震荡。',
        'The learning rate controls step size. If it is too large, the direction can be right while the step repeatedly jumps past the low point.',
      ),
      ['learning-rate-always-faster'],
      'learning-rate',
    ),
    checkpoint(
      'gd-nonconvex-start',
      copy('在非凸地形里，换初始点为什么会改变最终结果？', 'Why can changing the start point change the final result on a non-convex landscape?'),
      [
        choice('basin', '不同起点可能进入不同低谷、平台或鞍点附近。', 'Different starts can enter different basins, plateaus, or saddle regions.'),
        choice('same-global', '梯度下降总能保证找到全局最小值。', 'Gradient descent always guarantees the global minimum.'),
        choice('no-effect', '初始点只影响第一步，不影响后续轨迹。', 'The starting point affects only the first step, not the trajectory.'),
      ],
      'basin',
      copy(
        '非凸优化没有统一的全局保证。起点、学习率和地形结构会共同决定轨迹进入哪个区域。',
        'Non-convex optimization has no universal global guarantee. Start point, learning rate, and landscape shape jointly determine the region reached.',
      ),
      ['local-equals-global'],
      'saddle-local-minima',
    ),
  ],
  'linear-regression': [
    checkpoint(
      'linear-residual-mse',
      copy('在线性回归中，残差和 MSE 的关系是什么？', 'In linear regression, how are residuals and MSE related?'),
      [
        choice('aggregate', '残差是单个样本误差；MSE 把残差平方后取平均。', 'A residual is one example error; MSE averages squared residuals.'),
        choice('same', '残差和 MSE 是同一个数。', 'Residual and MSE are the same number.'),
        choice('classification', 'MSE 只统计分类是否正确。', 'MSE only counts whether classification is correct.'),
      ],
      'aggregate',
      copy(
        '残差让你看见每个点错了多少；MSE 把整批残差合成训练时要优化的目标。',
        'Residuals show each point-level error; MSE combines the batch into the objective optimized during training.',
      ),
      ['residual-equals-loss'],
      'residual-loss',
    ),
    checkpoint(
      'linear-regularization-validation',
      copy('正则化为什么可能让训练误差变大，但验证表现更稳定？', 'Why can regularization raise training error while stabilizing validation performance?'),
      [
        choice('tradeoff', '它优化训练误差和参数惩罚的合成目标，限制过度弯曲或过大权重。', 'It optimizes training error plus a parameter penalty, limiting excessive curvature or weights.'),
        choice('always-train', '它一定会同时降低训练误差和验证误差。', 'It always lowers both training and validation error.'),
        choice('data-cleaning', '它会自动清洗异常值和缺失值。', 'It automatically cleans outliers and missing values.'),
      ],
      'tradeoff',
      copy(
        '正则化不追求训练集误差最低，而是在拟合和复杂度之间做交换，常用于压低验证 gap。',
        'Regularization does not chase the lowest training error. It trades fit against complexity and often reduces the validation gap.',
      ),
      ['regularization-always-lowers-train-error'],
      'regularization',
    ),
  ],
  'logistic-regression': [
    checkpoint(
      'logistic-score-sigmoid',
      copy('逻辑回归里线性打分 z 和 sigmoid 概率的关系是什么？', 'In logistic regression, how does the linear score z relate to sigmoid probability?'),
      [
        choice('map', 'z 可以是任意实数，sigmoid 把它压到 0 到 1 的概率。', 'z can be any real number; sigmoid compresses it into a probability between 0 and 1.'),
        choice('same', 'z 本身已经是概率。', 'z is already a probability.'),
        choice('threshold-only', 'sigmoid 只负责选择阈值，不改变数值范围。', 'Sigmoid only chooses the threshold and does not change the range.'),
      ],
      'map',
      copy(
        '线性层给证据分数，sigmoid 把分数读成正类概率；边界附近通常接近 0.5。',
        'The linear layer gives an evidence score, and sigmoid reads it as positive-class probability. Near the boundary it is usually close to 0.5.',
      ),
      ['score-is-probability'],
      'sigmoid-probability',
    ),
    checkpoint(
      'logistic-threshold-confidence',
      copy('调整分类阈值会直接改变什么？', 'What does changing the classification threshold directly change?'),
      [
        choice('decisions', '同一批概率会被改写成不同的预测类别，进而改变 precision/recall。', 'The same probabilities become different predicted labels, changing precision and recall.'),
        choice('training', '已经训练好的权重会立刻重新训练。', 'The trained weights immediately retrain themselves.'),
        choice('labels', '真实标签会自动改变。', 'The true labels automatically change.'),
      ],
      'decisions',
      copy(
        '阈值是概率到类别的决策规则。模型分数不变时，阈值仍会移动预测正例数量和错误类型。',
        'The threshold is the decision rule from probability to class. Even with unchanged scores, it changes predicted positives and error types.',
      ),
      ['threshold-is-fixed'],
      'threshold-decisions',
    ),
  ],
  classification: [
    checkpoint(
      'classification-precision-recall',
      copy('降低正类阈值通常会怎样影响 recall 和 precision？', 'How does lowering the positive threshold usually affect recall and precision?'),
      [
        choice('recall-up', '预测为正的样本更多，recall 往往升高，但 precision 可能下降。', 'More examples are predicted positive, so recall often rises while precision may fall.'),
        choice('both-up', 'precision 和 recall 一定同时升高。', 'Precision and recall must both rise.'),
        choice('no-change', '只要模型分数不变，所有分类指标都不会变。', 'If model scores do not change, all classification metrics stay fixed.'),
      ],
      'recall-up',
      copy(
        '阈值控制预测正例的范围。放宽阈值通常抓到更多真阳性，也可能带来更多假阳性。',
        'The threshold controls the predicted-positive region. Relaxing it often catches more true positives while adding false positives.',
      ),
      ['precision-recall-no-tradeoff'],
      'precisionRecall',
    ),
    checkpoint(
      'classification-roc-calibration',
      copy('AUC 高但校准差，说明什么？', 'What does high AUC but poor calibration mean?'),
      [
        choice('ranking-not-probability', '排序能力不错，但概率数值不一定可信。', 'Ranking is good, but the probability values may not be trustworthy.'),
        choice('perfect', '模型已经在所有方面完美。', 'The model is perfect in every way.'),
        choice('useless', '模型完全不能区分类别。', 'The model cannot separate classes at all.'),
      ],
      'ranking-not-probability',
      copy(
        'AUC 主要看排序质量；校准看“预测 0.8 的样本是否真的约 80% 为正”。两者不是同一个诊断。',
        'AUC mainly measures ranking quality; calibration asks whether examples predicted as 0.8 are positive about 80% of the time. They are different diagnostics.',
      ),
      ['auc-equals-calibration'],
      'biasCalibration',
    ),
  ],
  mlp: [
    checkpoint(
      'mlp-hidden-representation',
      copy('MLP 为什么能处理逻辑回归难以分开的 XOR 或圆环结构？', 'Why can an MLP handle XOR or circular structures that logistic regression struggles with?'),
      [
        choice('rewrite', '隐藏层把输入重写成更容易由输出层读取的表示。', 'Hidden layers rewrite the input into a representation the output layer can read more easily.'),
        choice('threshold', '它只是把逻辑回归阈值固定为 0。', 'It only fixes the logistic-regression threshold at 0.'),
        choice('no-loss', '它不需要损失函数。', 'It does not need a loss function.'),
      ],
      'rewrite',
      copy(
        'MLP 的核心不是魔法曲线，而是隐藏层提供新的中间表示，让最后一层更容易组合出非线性边界。',
        'The core of an MLP is not a magic curve. Hidden layers provide intermediate representations that make nonlinear boundaries easier to combine.',
      ),
      ['mlp-is-just-threshold'],
      'hiddenRepresentation',
    ),
    checkpoint(
      'mlp-capacity-generalization',
      copy('为什么更多隐藏单元可能提升训练表现，也可能带来过拟合？', 'Why can more hidden units improve training performance while increasing overfitting risk?'),
      [
        choice('capacity-risk', '容量更高能表达更复杂边界，也更容易追随训练噪声。', 'Higher capacity can express richer boundaries and more easily follow training noise.'),
        choice('always-generalizes', '隐藏单元越多，验证表现一定越好。', 'More hidden units always improve validation performance.'),
        choice('less-capacity', '隐藏单元越多，模型容量越低。', 'More hidden units lower model capacity.'),
      ],
      'capacity-risk',
      copy(
        '容量提高会减少欠拟合风险，但是否泛化要看验证曲线、正则化、噪声和训练轮数。',
        'More capacity can reduce underfitting, but generalization depends on validation curves, regularization, noise, and training duration.',
      ),
      ['capacity-equals-generalization'],
      'capacityGeneralization',
    ),
  ],
}
