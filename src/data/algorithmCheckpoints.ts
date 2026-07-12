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
      'ai-overview-training-loop-order',
      copy('哪一个顺序正确描述了从一行数据到未见数据评估的机器学习闭环？', 'Which order correctly traces the ML loop from one data row to evaluation on unseen data?'),
      [
        choice('loop', '数据 → 特征/目标 → 模型 → 预测 → 误差 → 参数更新 → 未见数据评估', 'Data → feature/target → model → prediction → error → parameter update → unseen-data evaluation'),
        choice('test-update', '数据 → 未见数据评估 → 参数更新 → 预测', 'Data → unseen-data evaluation → parameter update → prediction'),
        choice('answer-copy', '目标 → 把答案复制为预测 → 跳过误差与更新', 'Target → copy the answer as prediction → skip error and update'),
      ],
      'loop',
      copy(
        '正确顺序先定义特征与目标，再预测、计算误差和更新，最后才在未见数据上检查迁移。误区“测试集也能用来更新”会把最终检查变成训练反馈；误区“复制答案”则没有学到可迁移参数。',
        'The correct order defines features and target, then predicts, measures error, updates, and only afterward checks transfer on unseen data. The “update on test data” misconception turns the final check into training feedback; the “copy the answer” misconception learns no transferable parameters.',
      ),
      ['test-data-as-training-feedback', 'prediction-as-answer-copy'],
      'ml-common-language',
    ),
    checkpoint(
      'ai-overview-field-roles',
      copy('记录“L-07，练习 3 小时，历史 62 分，下一次 68 分”中，第一版单特征模型的 ID、x、y 分别是什么？', 'In “L-07, 3 practice hours, historical score 62, next score 68,” what are ID, x, and y for the first one-feature model?'),
      [
        choice('roles', 'ID=L-07，x=3 小时练习时长，y=68 下一次分数。', 'ID=L-07, x=3 hours of practice, y=68 next score.'),
        choice('id-feature', 'x=L-07，因为任何数字或编号都能当特征。', 'x=L-07 because every number or code can be a feature.'),
        choice('history-target', 'y=62，因为历史分数在目标之前出现。', 'y=62 because historical score appears before the target.'),
      ],
      'roles',
      copy(
        'L-07 只标识记录；第一版明确选择练习时长为 x，下一次分数是要预测的 y。误区“数字列都是特征”忽略了字段语义；误区“先出现的就是目标”混淆了候选特征与预测目标。',
        'L-07 only identifies the record; the first model explicitly selects practice duration as x and predicts next score y. The “all numeric columns are features” misconception ignores field meaning; the “earlier field is the target” misconception confuses a candidate feature with the prediction target.',
      ),
      ['identifier-as-feature', 'candidate-feature-as-target'],
      'ml-common-language',
    ),
    checkpoint(
      'ai-overview-paradigm-signal',
      copy(
        '同时判断三个新场景的范式与信号：①预测明日电力需求；②把新闻按主题分组；③根据路口等待时间连续调节交通灯。哪组对应关系完整正确？',
        'Classify three new scenarios and their signals together: (1) predict tomorrow’s electricity demand, (2) group news by topic, and (3) adjust traffic lights sequentially from intersection waiting time. Which complete mapping is correct?',
      ),
      [
        choice(
          'three-signals-correct',
          '电力：监督学习，历史真实需求是 label；新闻：无监督学习，内容相似度是结构信号；交通：强化学习，等待时间变化形成 reward。',
          'Electricity: supervised, observed historical demand is the label; news: unsupervised, content similarity is the structural signal; traffic: reinforcement, waiting-time reward follows signal-control actions.',
        ),
        choice(
          'signals-swapped',
          '电力靠等待时间 reward；新闻靠人工主题 label；交通靠内容相似度聚类。',
          'Electricity uses waiting-time reward; news uses human topic labels; traffic clusters by content similarity.',
        ),
        choice(
          'all-supervised',
          '三者都是监督学习，因为任何数字或分组结果都能当作预先给定的 label。',
          'All three are supervised because any number or grouping result can be treated as a pre-attached label.',
        ),
      ],
      'three-signals-correct',
      copy(
        '电力需求有历史真实数值作为 label，因此学习输入到需求的监督映射；新闻没有主题答案时，以内容相似度寻找结构；交通控制在连续行动后观察等待时间变化，并把它转成 reward 来学习策略。误区“交换信号”忽略了信号属于哪个数据流程；误区“输出数字或分组就都是 label”混淆了观察答案、结构准则与行动后奖励。',
        'Electricity demand has observed historical values as labels, so it learns a supervised mapping from inputs to demand. News without topic answers uses content similarity to discover structure. Traffic control observes waiting-time change after sequential actions and turns it into reward for learning a policy. The “swap the signals” misconception ignores which data flow produces each signal; the “every number or group is a label” misconception confuses observed answers, structural criteria, and post-action reward.',
      ),
      ['learning-signals-swapped', 'every-output-is-a-label'],
      'learning-paradigms',
    ),
    checkpoint(
      'ai-overview-kmeans-direction',
      copy('一个新点被重新分到右上方簇后，该簇的 K-means 中心应向哪里移动？', 'After a new point is reassigned to the upper-right cluster, where should its K-means center move?'),
      [
        choice('member-mean', '朝该簇所有成员的新均值移动。', 'Toward the new mean of all cluster members.'),
        choice('farthest', '朝该簇最远的单个点移动。', 'Toward the single farthest point in the cluster.'),
        choice('origin', '固定朝坐标原点移动，与成员无关。', 'Always toward the origin, independent of members.'),
      ],
      'member-mean',
      copy(
        'K-means 的 recomputation 用簇内所有成员的坐标均值。误区“追最远点”把中心更新误当成边界搜索；误区“朝原点”忽略了中心完全由当前成员决定。',
        'K-means recomputation uses the coordinate mean of all members. The “chase the farthest point” misconception confuses center update with boundary search; the “move to origin” misconception ignores that current members determine the center.',
      ),
      ['center-chases-extreme', 'center-ignores-members'],
      'unsupervised-kmeans',
    ),
    checkpoint(
      'ai-overview-q-value-direction',
      copy('旧 Q value 为 2，行动后得到 +10，下一状态还有正的未来价值。按课程中的更新，这个 Q value 通常向哪个方向变化？', 'An old Q value is 2, the action receives +10, and the next state has positive future value. In the course update, which direction does this Q value usually move?'),
      [
        choice('rise', '上升，因为 target 高于旧值，修正量为正。', 'It rises because the target exceeds the old value, giving a positive correction.'),
        choice('fall', '下降，因为任何 reward 都是训练误差，必须从旧值中减去。', 'It falls because every reward is training error and must be subtracted.'),
        choice('unchanged', '不变，因为 Q value 只能记录即时 reward。', 'It stays unchanged because a Q value can only record immediate reward.'),
      ],
      'rise',
      copy(
        '正奖励与正未来价值使 target 高于旧值，所以本例 Q value 上升。误区“reward 是要减掉的误差”混淆奖励与监督 loss；误区“Q 只等于即时 reward”忽略了折扣后的未来价值。',
        'Positive reward plus positive future value puts the target above the old value, so this Q value rises. The “reward is an error to subtract” misconception confuses reward with supervised loss; the “Q equals immediate reward” misconception omits discounted future value.',
      ),
      ['reward-as-loss', 'q-value-as-immediate-reward'],
      'reinforcement-q-learning',
    ),
  ],
  'python-notebook': [
    checkpoint(
      'python-notebook-array-shape',
      copy('老师问：为什么 sklearn 里单个特征也常常要写成二维 X？', 'Teacher question: why does sklearn often need a two-dimensional X even for one feature?'),
      [
        choice('samples-features', '因为 X 的 shape 要表达“样本数、特征数”，例如 (3, 1)。', 'Because X shape represents samples and features, for example (3, 1).'),
        choice('faster', '因为二维数组一定比一维数组训练更快。', 'Because two-dimensional arrays always train faster than one-dimensional arrays.'),
        choice('target', '因为 y 也必须写成二维矩阵。', 'Because y must also be written as a two-dimensional matrix.'),
      ],
      'samples-features',
      copy(
        '模型需要知道哪一维是样本、哪一维是特征。一个一维数组 (3,) 只说明有 3 个数；reshape 成 (3, 1) 才清楚表达“3 个样本，每个样本 1 个特征”。',
        'The model needs to know which dimension is samples and which is features. A one-dimensional array (3,) only says there are 3 numbers; reshaping to (3, 1) says 3 samples with 1 feature each.',
      ),
      ['array-shape-confusion'],
      'numpy-arrays',
    ),
    checkpoint(
      'python-notebook-sklearn-split',
      copy('训练一个 sklearn 小模型时，哪一步应该先发生？', 'When training a small sklearn model, which step should happen first?'),
      [
        choice('split-first', '先 train_test_split，再 fit 模型。', 'Run train_test_split first, then fit the model.'),
        choice('fit-first', '先在全体数据上 fit，再划分训练和测试。', 'Fit on all data first, then split train and test.'),
        choice('metric-first', '先算 mean_absolute_error，再训练模型。', 'Compute mean_absolute_error first, then train the model.'),
      ],
      'split-first',
      copy(
        '先划分数据，是为了让测试集保留期末考试的作用。fit 如果看过全体数据，测试集就已经参与训练流程，后面的指标会偏乐观。',
        'Splitting first preserves the test set as a final exam. If fit sees all data, the test set has joined the training workflow and later metrics become too optimistic.',
      ),
      ['split-after-fit'],
      'sklearn-small-model',
    ),
  ],
  'housing-price-project': [
    checkpoint(
      'housing-project-leakage',
      copy('房价预测项目中，为什么测试集只能 transform，不能 fit_transform？', 'In the housing project, why should test data use transform rather than fit_transform?'),
      [
        choice('avoid-leakage', '因为清洗和缩放规则只能从训练集学习，测试集不能参与制定规则。', 'Because cleaning and scaling rules should be learned from training data only; test data must not help define them.'),
        choice('same-result', '因为 transform 和 fit_transform 永远得到完全相同的结果。', 'Because transform and fit_transform always produce exactly the same result.'),
        choice('no-labels', '因为测试集没有特征，只有标签。', 'Because the test set has no features, only labels.'),
      ],
      'avoid-leakage',
      copy(
        'fit_transform 会学习规则并应用规则。如果在测试集上 fit，就等于让测试集的信息进入预处理决策，形成数据泄漏。测试集应该只使用训练集已经学到的规则。',
        'fit_transform learns rules and applies them. Fitting on test data lets test information enter preprocessing decisions, causing leakage. Test data should only use rules already learned from training data.',
      ),
      ['preprocessing-leakage'],
      'cleaning-splits',
    ),
    checkpoint(
      'housing-project-evaluation',
      copy('只报告一个 MAE，为什么还不足以完成房价预测复盘？', 'Why is reporting only MAE not enough for the housing-project review?'),
      [
        choice('need-error-cases', '还要看 R²、最大误差样本和系统性偏差，才能决定下一轮怎么改。', 'We also need R², largest-error cases, and systematic bias to decide the next iteration.'),
        choice('mae-perfect', '因为 MAE 已经包含所有复盘信息，所以不需要看别的。', 'Because MAE already contains all review information, so nothing else is needed.'),
        choice('only-r2', '因为回归项目只能看 R²，不能看 MAE。', 'Because regression projects can only use R² and not MAE.'),
      ],
      'need-error-cases',
      copy(
        'MAE 有业务单位，能说明平均差多少；R² 说明整体解释能力；错误样本告诉你模型在哪些区域失败。复盘要能推出下一步实验，不能只停在一个分数。',
        'MAE has business units and shows average miss; R² summarizes explanatory power; error cases show where the model fails. A review should lead to the next experiment, not stop at one score.',
      ),
      ['single-metric-review'],
      'evaluation',
    ),
  ],
  'classification-project': [
    checkpoint(
      'classification-project-vectorizer-leakage',
      copy('垃圾邮件项目中，为什么 TfidfVectorizer 应该放进 Pipeline？', 'In the spam project, why should TfidfVectorizer live inside a Pipeline?'),
      [
        choice('fit-train-only', '因为词表和 IDF 权重只能从训练数据学习，交叉验证时每一折也要保持隔离。', 'Because vocabulary and IDF weights should be learned from training data only, including inside each cross-validation fold.'),
        choice('make-dense', '因为 Pipeline 会自动把稀疏矩阵变成密集矩阵，所以模型一定更准。', 'Because Pipeline automatically turns sparse matrices dense, so the model is always more accurate.'),
        choice('skip-split', '因为用了 Pipeline 就不需要 train_test_split。', 'Because Pipeline removes the need for train_test_split.'),
      ],
      'fit-train-only',
      copy(
        '文本向量化也会学习数据规则。若在全体数据上先 fit 词表或 IDF，再切分，就让测试集词分布进入训练流程。Pipeline 能把向量化和分类器绑在一起，帮助交叉验证和调参时保持训练/测试隔离。',
        'Text vectorization learns rules from data. If vocabulary or IDF is fit on all data before splitting, test word distribution enters training. A Pipeline binds vectorization and classifier so cross-validation and tuning preserve train/test separation.',
      ),
      ['text-vectorizer-leakage'],
      'text-to-features',
    ),
    checkpoint(
      'classification-project-threshold-cost',
      copy('如果业务更怕漏掉真正的 spam，通常应该如何调整阈值？', 'If the business fears missed spam more, how should the threshold usually move?'),
      [
        choice('lower-threshold', '降低正类阈值，抓住更多 spam，但接受更多误拦风险。', 'Lower the positive threshold to catch more spam while accepting more false-block risk.'),
        choice('raise-threshold', '提高正类阈值，这一定会同时提升 precision 和 recall。', 'Raise the positive threshold; this must improve both precision and recall.'),
        choice('ignore-threshold', '阈值不会影响预测类别，只会影响训练速度。', 'Threshold does not affect predicted labels; it only affects training speed.'),
      ],
      'lower-threshold',
      copy(
        '阈值把概率改写成类别。降低阈值通常会扩大预测正类范围，提高 recall，但可能带来更多 false positives。这个取舍要由错误成本决定，而不是由 accuracy 单独决定。',
        'The threshold turns probability into class decisions. Lowering it usually expands predicted positives and raises recall, but can add false positives. Error cost, not accuracy alone, should drive the tradeoff.',
      ),
      ['threshold-cost-confusion'],
      'scores-thresholds',
    ),
  ],
  'model-selection': [
    checkpoint(
      'model-selection-test-peeking',
      copy('比较 8 组超参数时，为什么不应该反复在 test set 上挑最高分？', 'When comparing 8 hyperparameter settings, why should you not repeatedly choose by test-set score?'),
      [
        choice('test-becomes-validation', 'test set 会变成选择反馈，最终分数不再是诚实的泛化估计。', 'The test set becomes selection feedback, so the final score is no longer an honest generalization estimate.'),
        choice('test-has-no-labels', '因为 test set 永远不能有标签。', 'Because a test set can never have labels.'),
        choice('cv-unneeded', '因为只要用了 GridSearchCV，就完全不需要保留 test set。', 'Because once GridSearchCV is used, no test set is needed at all.'),
      ],
      'test-becomes-validation',
      copy(
        'validation 或 CV 用来选择方案；test set 用来在选择结束后估计一次。如果你反复用 test 分数挑参数，它就参与了决策，最后分数会偏向这套 test set。',
        'Validation or CV is for choosing a workflow; the test set estimates once after selection ends. If you repeatedly choose parameters by test score, test data joins the decision process and the final score is biased toward that test set.',
      ),
      ['test-set-peeking'],
      'validation-role',
    ),
    checkpoint(
      'model-selection-pipeline-cv',
      copy('做 cross-validation 时，为什么 StandardScaler 应该放进 Pipeline？', 'During cross-validation, why should StandardScaler be inside a Pipeline?'),
      [
        choice('fold-isolation', '因为每一折的 scaler 只能从训练折 fit，验证折只能 transform。', 'Because each fold should fit the scaler on training folds only, while the validation fold is transformed only.'),
        choice('same-score', '因为放不放 Pipeline 分数永远完全相同。', 'Because scores are always exactly identical with or without Pipeline.'),
        choice('skip-cv', '因为 Pipeline 会自动替代 cross_val_score。', 'Because Pipeline automatically replaces cross_val_score.'),
      ],
      'fold-isolation',
      copy(
        'Scaler 会学习均值和方差。如果先在全体开发集上 fit，再做 CV，每一轮验证折的信息都已经进入预处理。Pipeline 让 scaler 和模型在每一折内部重新 fit，减少泄漏。',
        'A scaler learns means and variances. If it is fit on the full development set before CV, every validation fold has already influenced preprocessing. Pipeline refits scaler and model inside each fold, reducing leakage.',
      ),
      ['cv-preprocessing-leakage'],
      'pipeline-leakage',
    ),
  ],
  'tree-forest': [
    checkpoint(
      'tree-forest-depth-overfit',
      copy('为什么一棵没有限制深度的决策树可能训练分数很高、验证分数却下降？', 'Why can an unlimited-depth decision tree score high on training but drop on validation?'),
      [
        choice('memorize-noise', '它可能把噪声和偶然样本切成很多小叶子，记住训练集细节。', 'It may carve noise and accidental samples into many tiny leaves, memorizing training details.'),
        choice('needs-scaling', '因为树模型必须先做 StandardScaler，否则一定不能泛化。', 'Because tree models must use StandardScaler first or they cannot generalize.'),
        choice('no-capacity', '因为树越深，模型容量越低。', 'Because deeper trees have lower model capacity.'),
      ],
      'memorize-noise',
      copy(
        '深树容量更高，训练集通常更容易拟合到很细。没有 max_depth、min_samples_leaf 或剪枝控制时，它可能追随噪声，导致验证表现不稳。',
        'A deep tree has higher capacity and can fit training data very finely. Without max_depth, min_samples_leaf, or pruning control, it may follow noise and make validation performance unstable.',
      ),
      ['deep-tree-always-better'],
      'depth-overfitting',
    ),
    checkpoint(
      'tree-forest-importance-causality',
      copy('随机森林显示 zipcode 很重要，最合理的解读是什么？', 'A random forest says zipcode is important. What is the safest interpretation?'),
      [
        choice('model-reliance', '模型经常依赖 zipcode 做 split，但这不证明 zipcode 本身造成目标变化。', 'The model often relies on zipcode for splits, but that does not prove zipcode itself causes target changes.'),
        choice('direct-cause', 'zipcode 一定是目标变化的直接原因。', 'Zipcode must be the direct cause of target changes.'),
        choice('ignore-errors', '只要 importance 高，就不需要看错误样本和领域知识。', 'If importance is high, there is no need to inspect errors or domain knowledge.'),
      ],
      'model-reliance',
      copy(
        'feature importance 是模型依赖线索，不是因果证据。zipcode 可能代理收入、地段、学校或采样方式；复盘时要结合错误样本、领域知识和更稳健的重要性检查。',
        'Feature importance is evidence of model reliance, not causality. Zipcode may proxy for income, location, school quality, or sampling. Review it with error cases, domain knowledge, and more robust importance checks.',
      ),
      ['importance-equals-causality'],
      'feature-importance',
    ),
  ],
  'cnn-visualization': [
    checkpoint(
      'cnn-visualization-parameter-sharing',
      copy('为什么 3×3 卷积通常比把整张图片接到全连接层更省参数？', 'Why does a 3×3 convolution usually use fewer parameters than connecting the whole image to a dense layer?'),
      [
        choice('shared-local-kernel', '卷积只看局部窗口，并在空间位置共享同一组 kernel 权重。', 'Convolution sees local windows and shares the same kernel weights across spatial positions.'),
        choice('one-weight-per-pixel', '因为卷积会给每个像素位置单独学习一套完全不同的权重。', 'Because convolution learns a completely different weight set for every pixel position.'),
        choice('no-parameters', '因为卷积层没有可训练参数。', 'Because convolution layers have no trainable parameters.'),
      ],
      'shared-local-kernel',
      copy(
        '卷积层的参数量来自 kernel size、输入 channel 和输出 filter 数，而不是每个空间位置都重新学权重。局部连接和参数共享是 CNN 省参数的核心。',
        'A convolution layer parameter count comes from kernel size, input channels, and output filters, not from learning new weights at every spatial position. Local connectivity and weight sharing are the key.',
      ),
      ['cnn-parameter-sharing-confusion'],
      'channels-feature-maps',
    ),
    checkpoint(
      'cnn-visualization-shape',
      copy('输入宽度 5、kernel size 3、padding 1、stride 1 时，输出宽度是多少？', 'With input width 5, kernel size 3, padding 1, and stride 1, what is the output width?'),
      [
        choice('five', '5，因为 (5 + 2×1 - 3) / 1 + 1 = 5。', '5, because (5 + 2×1 - 3) / 1 + 1 = 5.'),
        choice('three', '3，因为 kernel 是 3，所以输出一定是 3。', '3, because the kernel is 3, so output must be 3.'),
        choice('one', '1，因为卷积会把整张图压成一个数。', '1, because convolution compresses the whole image into one number.'),
      ],
      'five',
      copy(
        '常见输出尺寸公式是 floor((in + 2p - k) / s) + 1。这里 padding 保留了边缘，所以空间宽度保持为 5。',
        'The common output-size formula is floor((in + 2p - k) / s) + 1. Here padding preserves the border, so spatial width remains 5.',
      ),
      ['cnn-shape-formula-confusion'],
      'padding-stride-shape',
    ),
  ],
  'sequence-embedding-bridge': [
    checkpoint(
      'sequence-embedding-token-axis',
      copy('老师问：为什么 token id 轴 T 不能直接看成表格里的特征列？', 'Teacher question: why should the token-id axis T not be read as feature columns in a table?'),
      [
        choice('ordered-token-axis', 'T 表示同一样本里的有序 token 位置，token id 只是词表索引。', 'T represents ordered token positions inside one sample, and a token id is only a vocabulary index.'),
        choice('feature-axis', 'T 表示一组连续数值特征，id 越大语义越强。', 'T represents continuous numeric features, and larger ids mean stronger semantics.'),
        choice('batch-axis', 'T 表示 batch 里有多少条样本。', 'T represents how many samples are in the batch.'),
      ],
      'ordered-token-axis',
      copy(
        '序列里的 T 是位置轴：第 1 个 token、第 2 个 token、第 3 个 token。token id 的数字大小只是词表编号，不像面积、温度或价格那样自带数值距离。',
        'In a sequence, T is the position axis: token 1, token 2, token 3. Token-id magnitude is only a vocabulary index, not a numeric distance like area, temperature, or price.',
      ),
      ['token-id-as-feature-confusion'],
      'token-ids',
    ),
    checkpoint(
      'sequence-embedding-position-role',
      copy('embedding lookup 之后，position 和 attention mask 分别补了什么？', 'After embedding lookup, what do position and attention mask add?'),
      [
        choice('order-visibility', 'position 补顺序，mask 控制 padding、未来 token 等位置是否可见。', 'Position adds order; mask controls whether positions such as padding or future tokens are visible.'),
        choice('replace-values', 'position 会替代 token embedding，mask 会生成最终分类标签。', 'Position replaces token embeddings, and mask creates the final class label.'),
        choice('remove-batch', 'position 和 mask 的作用是去掉 batch 维度。', 'Position and mask remove the batch dimension.'),
      ],
      'order-visibility',
      copy(
        'embedding 说明每个 token 当前是什么向量；position 让模型知道顺序；attention mask 告诉后续 attention 哪些位置可以参与计算，哪些要屏蔽。',
        'Embeddings say what vector each token currently has; position gives order; attention mask tells later attention which positions can participate and which should be blocked.',
      ),
      ['position-mask-role-confusion'],
      'positions-and-masks',
    ),
  ],
  'attention-transformer': [
    checkpoint(
      'attention-transformer-softmax-dimension',
      copy('自注意力的 score matrix 中，softmax 通常沿哪个方向做？', 'In a self-attention score matrix, along which direction is softmax usually applied?'),
      [
        choice('per-query-row', '每个 query 的一行，对所有 key 分配注意力权重。', 'Across each query row, allocating attention weights over all keys.'),
        choice('whole-matrix', '整个矩阵一次性 softmax，让所有格子总和为 1。', 'Over the whole matrix at once, making all cells sum to 1.'),
        choice('value-dimension', '只对 V 的 channel 做 softmax，和 Q/K score 无关。', 'Only over V channels, unrelated to Q/K scores.'),
      ],
      'per-query-row',
      copy(
        '每个 query 都有自己的注意力预算，所以通常对 score matrix 的最后一个维度做 softmax，也就是每一行在所有 key 上归一化。',
        'Each query has its own attention budget, so softmax is usually applied over the last dimension of the score matrix, normalizing each row over all keys.',
      ),
      ['attention-softmax-axis-confusion'],
      'softmax-weighted-sum',
    ),
    checkpoint(
      'attention-transformer-qkv-role',
      copy('Q/K/V 中，哪一部分最终被 attention 权重加权求和？', 'In Q/K/V attention, which part is finally combined by the attention weights?'),
      [
        choice('value', 'Value，Q/K 用来算相关性分数，权重最后乘到 V 上。', 'Value: Q/K compute relevance scores, and the weights are applied to V.'),
        choice('query', 'Query，因为 query 表示当前 token，所以输出只能来自 Q。', 'Query, because it represents the current token, so output must come only from Q.'),
        choice('key', 'Key，因为 key 被匹配，所以 key 就是最终答案。', 'Key, because keys are matched, so keys are the final answer.'),
      ],
      'value',
      copy(
        'Q 和 K 的点积产生 score，softmax 产生权重；这些权重用于加权求和 V，得到每个 token 的新表示。',
        'Q and K dot products create scores, softmax creates weights, and those weights combine V to produce the new representation for each token.',
      ),
      ['qkv-role-confusion'],
      'qkv-scores',
    ),
  ],
  'optimizer-comparison': [
    checkpoint(
      'optimizer-comparison-loop-order',
      copy('PyTorch 训练循环里，下面哪个顺序最合理？', 'In a PyTorch training loop, which order is most reasonable?'),
      [
        choice('zero-backward-step', 'optimizer.zero_grad() -> loss.backward() -> optimizer.step()。', 'optimizer.zero_grad() -> loss.backward() -> optimizer.step().'),
        choice('step-before-backward', 'optimizer.step() -> loss.backward() -> optimizer.zero_grad()。', 'optimizer.step() -> loss.backward() -> optimizer.zero_grad().'),
        choice('backward-never-clear', 'loss.backward() 之后永远不用清梯度。', 'After loss.backward(), gradients never need clearing.'),
      ],
      'zero-backward-step',
      copy(
        '先清掉上一轮累计梯度，再用 backward 写入当前梯度，最后 optimizer.step() 根据当前梯度和内部状态更新参数。',
        'Clear accumulated gradients first, use backward to write current gradients, then optimizer.step() updates parameters from current gradients and internal state.',
      ),
      ['optimizer-loop-order-confusion'],
      'training-loop',
    ),
    checkpoint(
      'optimizer-comparison-learning-rate',
      copy('如果 loss 曲线反复跳高、震荡甚至出现 NaN，最先怀疑哪个旋钮？', 'If the loss curve repeatedly spikes, oscillates, or becomes NaN, which knob should you suspect first?'),
      [
        choice('lr-too-large', 'learning rate 可能太大，步子跨过了稳定下降区域。', 'The learning rate may be too large, stepping past the stable descent region.'),
        choice('batch-always-zero', 'batch size 必须设为 0，才能稳定。', 'Batch size must be 0 to become stable.'),
        choice('more-epochs-only', '只要增加 epochs，一定能解决震荡。', 'Adding more epochs always fixes oscillation.'),
      ],
      'lr-too-large',
      copy(
        '震荡、跳高或 NaN 常见于学习率过大或数值不稳定。下一步通常是降低 lr、检查梯度爆炸，再考虑 schedule 或 optimizer。',
        'Oscillation, spikes, or NaN often point to too high a learning rate or numerical instability. The next step is usually reducing lr, checking exploding gradients, then considering schedule or optimizer changes.',
      ),
      ['learning-rate-diagnosis-confusion'],
      'learning-rate-schedules',
    ),
  ],
  'llm-rag': [
    checkpoint(
      'llm-rag-not-training',
      copy('为什么说 RAG 通常不等于让模型“学会”新知识？', 'Why is RAG usually not the same as making the model learn new knowledge?'),
      [
        choice('context-at-answer-time', 'RAG 在回答时检索并提供外部上下文，通常不改变模型参数。', 'RAG retrieves and provides external context at answer time and usually does not change model parameters.'),
        choice('changes-weights', 'RAG 每次问答都会重新训练模型权重。', 'RAG retrains model weights on every question.'),
        choice('no-documents', 'RAG 不需要任何外部文档，只靠 prompt。', 'RAG needs no external documents and only uses prompts.'),
      ],
      'context-at-answer-time',
      copy(
        'RAG 的核心是 retrieval + context assembly + generation。它把相关资料放进上下文，让回答有依据；这和 fine-tuning 改变参数是不同机制。',
        'RAG is retrieval + context assembly + generation. It places relevant material into context so the answer can be grounded; this differs from fine-tuning, which changes parameters.',
      ),
      ['rag-equals-finetuning'],
      'rag-is-not-training',
    ),
    checkpoint(
      'llm-rag-failure-source',
      copy('如果正确资料没有被召回，回答缺事实，最可能先排查哪一层？', 'If the correct material was not retrieved and the answer lacks facts, which layer should you inspect first?'),
      [
        choice('retrieval', 'retrieval：chunking、embedding、top_k 或 reranking 可能有问题。', 'retrieval: chunking, embedding, top_k, or reranking may be wrong.'),
        choice('style-only', '只改回答语气，因为事实一定已经在上下文里。', 'Only change response style because the facts must already be in context.'),
        choice('metric-only', '只换最终评分表，不需要看检索片段。', 'Only change the final scoring sheet and do not inspect retrieved passages.'),
      ],
      'retrieval',
      copy(
        '如果关键资料没有进 context，生成模型再强也很难 grounded。先检查 chunk size、overlap、embedding、top_k 和 reranking，再改 prompt。',
        'If key material never enters context, even a strong generator cannot answer groundedly. Inspect chunk size, overlap, embeddings, top_k, and reranking before changing the prompt.',
      ),
      ['rag-failure-misdiagnosis'],
      'chunking-retrieval',
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
