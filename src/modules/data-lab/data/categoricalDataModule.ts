import type {
  DataConcept,
  DataLabConfig,
  DataLabModule,
  DataLabSection,
  DataMisconception,
  DataQuizItem,
  DataVisualAsset,
  LocalizedCopy,
  SourceReference,
} from '../types/dataLab'

const md = String.raw

function copy(zh: string, en: string): LocalizedCopy {
  return { 'zh-CN': zh, en }
}

function section(
  id: string,
  title: LocalizedCopy,
  content: LocalizedCopy,
  placements: Pick<DataLabSection, 'visualIds' | 'labIds'> = {},
): DataLabSection {
  return { id, title, content, ...placements }
}

function concept(
  id: string,
  name: LocalizedCopy,
  plainExplanation: LocalizedCopy,
  example: LocalizedCopy,
  pandasExample?: string,
): DataConcept {
  return { id, name, plainExplanation, example, pandasExample }
}

function lab(
  id: string,
  title: LocalizedCopy,
  componentName: DataLabConfig['componentName'],
  successCriteria: LocalizedCopy[],
): DataLabConfig {
  return { id, title, componentName, successCriteria }
}

function quiz(
  id: string,
  prompt: LocalizedCopy,
  answer: string,
  correct: LocalizedCopy,
  distractor: LocalizedCopy,
  explanation: LocalizedCopy,
): DataQuizItem {
  return {
    id,
    prompt,
    choices: [
      { id: answer, label: correct },
      { id: 'distractor', label: distractor },
    ],
    answer,
    explanation,
  }
}

function misconception(
  id: string,
  statement: LocalizedCopy,
  correction: LocalizedCopy,
  example: LocalizedCopy,
): DataMisconception {
  return { id, statement, correction, example }
}

function image(
  id: string,
  file: string,
  title: LocalizedCopy,
  caption: LocalizedCopy,
  labels: DataVisualAsset['labels'],
): DataVisualAsset {
  return {
    id,
    type: 'image',
    title,
    assetPath: `/data-lab/generated/${file}`,
    alt: caption,
    caption,
    labels,
  }
}

function video(id: string, file: string, title: LocalizedCopy, caption: LocalizedCopy): DataVisualAsset {
  return {
    id,
    type: 'manim-video',
    title,
    assetPath: `/manim/data-lab/${file}.mp4`,
    posterPath: `/manim/data-lab/${file}.svg`,
    alt: caption,
    caption,
  }
}

const sources = {
  googleCategorical: {
    label: copy('Google MLCC：类别数据', 'Google MLCC: Categorical data'),
    href: 'https://developers.google.com/machine-learning/crash-course/categorical-data',
    license: 'CC BY 4.0',
    usage: copy(
      '校准类别特征的语义边界、词表、稀疏表示和高基数风险。',
      'Calibrates categorical feature semantics, vocabularies, sparse representations, and high-cardinality risk.',
    ),
  },
  googleOneHot: {
    label: copy('Google MLCC：one-hot 编码', 'Google MLCC: One-hot encoding'),
    href: 'https://developers.google.com/machine-learning/crash-course/categorical-data/one-hot-encoding',
    license: 'CC BY 4.0',
    usage: copy(
      '校准类别值到固定向量位置、未知类别和词表协议的教学表达。',
      'Calibrates category-to-position mapping, unknown categories, and vocabulary contracts.',
    ),
  },
  googleIssues: {
    label: copy('Google MLCC：类别数据常见问题', 'Google MLCC: Categorical data issues'),
    href: 'https://developers.google.com/machine-learning/crash-course/categorical-data/issues',
    license: 'CC BY 4.0',
    usage: copy(
      '校准高基数、稀有值、人工标注质量和类别噪声的风险讨论。',
      'Calibrates high cardinality, rare values, human labels, and categorical noise risks.',
    ),
  },
  googleFeatureCrosses: {
    label: copy('Google MLCC：特征交叉', 'Google MLCC: Feature crosses'),
    href: 'https://developers.google.com/machine-learning/crash-course/categorical-data/feature-crosses',
    license: 'CC BY 4.0',
    usage: copy(
      '校准类别组合特征、维度增长、局部规则和稀疏性风险。',
      'Calibrates crossed categorical features, dimension growth, local rules, and sparsity risk.',
    ),
  },
  pandasCategorical: {
    label: copy('pandas：Categorical data', 'pandas: Categorical data'),
    href: 'https://pandas.pydata.org/docs/user_guide/categorical.html',
    license: 'BSD-3-Clause',
    usage: copy(
      '校准类别 dtype、类别集合、顺序类别和内存/语义边界。',
      'Calibrates categorical dtype, category sets, ordered categories, and memory/semantic boundaries.',
    ),
  },
  pandasGetDummies: {
    label: copy('pandas：get_dummies', 'pandas: get_dummies'),
    href: 'https://pandas.pydata.org/docs/reference/api/pandas.get_dummies.html',
    license: 'BSD-3-Clause',
    usage: copy(
      '校准 one-hot 展开、列名协议、dummy_na 和稀疏输出的工程接口。',
      'Calibrates one-hot expansion, column naming, dummy_na, and sparse-output interface details.',
    ),
  },
  sklearnOneHot: {
    label: copy('scikit-learn：OneHotEncoder', 'scikit-learn: OneHotEncoder'),
    href: 'https://scikit-learn.org/stable/modules/generated/sklearn.preprocessing.OneHotEncoder.html',
    license: 'BSD-3-Clause',
    usage: copy(
      '校准 fit/transform、handle_unknown、低频类别和稀疏矩阵输出的训练/预测契约。',
      'Calibrates fit/transform, handle_unknown, infrequent categories, and sparse matrix serving contracts.',
    ),
  },
  sklearnHasher: {
    label: copy('scikit-learn：FeatureHasher', 'scikit-learn: FeatureHasher'),
    href: 'https://scikit-learn.org/stable/modules/generated/sklearn.feature_extraction.FeatureHasher.html',
    license: 'BSD-3-Clause',
    usage: copy(
      '校准哈希桶、碰撞、无词表编码和高基数类别的权衡。',
      'Calibrates hash buckets, collisions, vocabulary-free encoding, and high-cardinality tradeoffs.',
    ),
  },
} satisfies Record<string, SourceReference>

export const categoricalDataModule: DataLabModule = {
  id: 'categorical-data-processing',
  order: 5,
  title: copy('类别数据处理与编码', 'Categorical Data Processing and Encoding'),
  subtitle: copy(
    '把城市、设备、邮编、标签集合和组合规则变成稳定、可复用、可解释的模型输入。',
    'Turn cities, devices, ZIP codes, tag sets, and crossed rules into stable, reusable, interpretable model inputs.',
  ),
  accent: '#0f766e',
  theme: '#e8f7f3',
  estimatedMinutes: 58,
  learningObjectives: [
    copy(
      '判断一列是连续数值、类别、序数、ID、文本还是标签集合，并解释为什么数字外观不等于数值语义。',
      'Decide whether a column is continuous numeric, categorical, ordinal, ID, text, or a tag set, and explain why numeric-looking values are not always numeric features.',
    ),
    copy(
      '设计训练集词表、低频合并和 OOV 策略，并保证验证、测试、线上预测复用同一套编码协议。',
      'Design train-time vocabulary, rare-category grouping, and OOV policy, then reuse the same encoding contract for validation, test, and serving.',
    ),
    copy(
      '解释索引编码、one-hot、multi-hot、稀疏表示、哈希和 embedding 的适用边界。',
      'Explain the boundaries among index encoding, one-hot, multi-hot, sparse representation, hashing, and embeddings.',
    ),
    copy(
      '识别高基数类别、人工标注噪声、类别漂移和数据泄漏对模型训练的影响。',
      'Recognize how high cardinality, noisy human labels, category drift, and leakage affect model training.',
    ),
    copy(
      '计算类别特征交叉后的维度增长，并判断交叉是否表达任务相关的局部规则。',
      'Compute dimension growth after categorical feature crosses and judge whether a cross expresses a task-relevant local rule.',
    ),
    copy(
      '能把教学概念落到 pandas 与 scikit-learn 的工程接口：get_dummies、Categorical、OneHotEncoder 与 FeatureHasher。',
      'Map the concepts to pandas and scikit-learn interfaces: get_dummies, Categorical, OneHotEncoder, and FeatureHasher.',
    ),
  ],
  concepts: [
    concept(
      'categorical-semantics',
      copy('类别语义', 'Categorical Semantics'),
      copy(
        '类别值表示成员关系，而不是距离或大小。邮编、城市名、设备型号、产品类型都可以被分组比较，但不能直接拿来求平均或解释为“越大越强”。',
        'Categorical values represent membership, not distance or magnitude. ZIP codes, cities, device models, and product types can be grouped, but should not be averaged or read as larger-is-stronger signals.',
      ),
      copy(
        '邮编 10001 与 94110 的差不是地理距离；房间数 2 与 4 的差才有数量含义。',
        'The gap between ZIP codes 10001 and 94110 is not geographic distance; the gap between 2 and 4 rooms is quantitative.',
      ),
    ),
    concept(
      'train-vocabulary',
      copy('训练词表', 'Train-time Vocabulary'),
      copy(
        '词表是类别编码的输入协议：每个保留类别对应一个稳定位置。词表必须从训练集学习，随后固定下来，不能在验证或线上预测时临时扩宽。',
        'A vocabulary is the input contract for categorical encoding: each kept category maps to a stable position. It is learned from training data and then frozen; validation and serving must not widen it opportunistically.',
      ),
      copy(
        '训练阶段只有 north、south、west，就不能在测试阶段因为出现 harbor 而悄悄新增一列。',
        'If training only saw north, south, and west, test-time harbor should not silently add a new column.',
      ),
      "encoder = OneHotEncoder(handle_unknown='ignore').fit(train[['district']])",
    ),
    concept(
      'one-hot-sparse',
      copy('one-hot 与稀疏表示', 'One-hot and Sparse Representation'),
      copy(
        'one-hot 把一个类别展开为多个 0/1 指示器。宽度等于词表大小，但每个样本通常只激活一个位置，因此工程上常用稀疏矩阵存储非零位置。',
        'One-hot expands one category into several 0/1 indicators. Width equals vocabulary size, but each example usually activates one position, so sparse matrices store only nonzero positions in practice.',
      ),
      copy(
        'district=south 在 [north, south, west, OOV] 中编码为 [0,1,0,0]，稀疏形式只需记录索引 1。',
        'district=south under [north, south, west, OOV] becomes [0,1,0,0]; sparse form only needs index 1.',
      ),
      "pd.get_dummies(df['district'], dtype=int)",
    ),
    concept(
      'multi-hot-tags',
      copy('multi-hot 标签集合', 'Multi-hot Tag Sets'),
      copy(
        '一个样本可能同时属于多个类别，例如房源标签含 school、subway、park。此时不是选择一个位置，而是在同一词表中激活多个位置。',
        'One example can belong to multiple categories, such as a listing tagged school, subway, and park. The encoding activates multiple positions in the same vocabulary.',
      ),
      copy(
        'amenities=[subway, school] 会同时点亮 subway 和 school 两个槽位。',
        'amenities=[subway, school] activates both the subway and school slots.',
      ),
    ),
    concept(
      'rare-oov',
      copy('低频桶与 OOV', 'Rare Buckets and OOV'),
      copy(
        '低频类别可以合并进 RARE 桶，预测时从未见过的类别进入 OOV 桶或全零策略。关键不是选哪个名字，而是训练和预测必须遵守同一规则。',
        'Rare categories can collapse into a RARE bucket, while unseen serving categories go to OOV or an all-zero policy. The key is not the bucket name but using one rule consistently across training and serving.',
      ),
      copy(
        'harbor 训练中只出现一次时可进 RARE；airport 从未训练出现时应进 OOV。',
        'harbor can enter RARE if it appears once in training; airport should enter OOV if never seen in training.',
      ),
    ),
    concept(
      'feature-cross',
      copy('类别特征交叉', 'Categorical Feature Cross'),
      copy(
        '特征交叉把两个或多个类别组合成更具体的局部规则。它能表达“某街区 × 某房型”这类模式，但维度通常按词表大小相乘增长。',
        'A feature cross combines two or more categorical values into a more specific local rule. It can express patterns such as district × property type, but dimension often grows by multiplying vocabulary sizes.',
      ),
      copy(
        '5 个街区和 4 个房型交叉后最多产生 20 个组合槽位。',
        'Five districts crossed with four property types can create up to 20 combination slots.',
      ),
      "df['district_x_type'] = df['district'] + '_' + df['property_type']",
    ),
  ],
  sections: [
    section(
      'semantics-first',
      copy('先判断语义，再选择编码', 'Decide Semantics Before Encoding'),
      copy(
        md`类别数据处理的第一步不是调用 one-hot，而是判断这一列的值代表什么。能求平均、比较距离、解释增减幅度的列才适合连续数值处理；只表示成员身份的列应按类别处理。很多列看起来像数字，却没有连续数值语义，例如邮编、用户 ID、设备型号、行业代码、车牌尾号。把这些列直接转成 number 会制造虚假的顺序和距离。

教学上要让学生先问三个问题：这些值能不能做加减？两个值之间的差有没有业务解释？模型上线时会不会遇到训练中没出现过的新成员？如果答案是否定或不确定，通常要进入类别处理路径：清洗拼写、固定词表、决定低频与未知类别策略，再把类别翻译成模型可读的数值向量。`,
        md`The first step in categorical data processing is not calling one-hot encoding; it is deciding what the column means. A column belongs on the continuous numeric path only when averages, distances, and increments have real task meaning. Values that only identify membership should be treated as categories. Many columns look numeric but are not continuous quantities: ZIP codes, user IDs, device models, industry codes, and license suffixes create fake order if parsed as numbers.

For teaching, ask three questions first: can these values be added or subtracted, does the difference between two values mean anything, and will serving encounter members unseen during training? If the answer is no or uncertain, the column usually belongs on the categorical path: clean variants, freeze a vocabulary, choose rare and unknown-category policy, then translate membership into a numeric vector.`,
      ),
      { visualIds: ['categorical-semantics-image'] },
    ),
    section(
      'vocabulary-contract',
      copy('词表是训练与预测之间的协议', 'Vocabulary Is a Train/Serve Contract'),
      copy(
        md`词表定义“哪些类别占据哪些向量位置”。这件事必须发生在训练数据上，并在验证、测试和线上预测阶段复用。若验证集或线上流量临时新增列，模型权重并没有对应的新参数；若类别顺序变化，同一个权重会被错误地解释给另一个类别。类别编码因此不是局部表格技巧，而是模型输入契约。

可靠流程通常包括：规范化大小写与空白、合并同义拼写、统计训练频次、保留高频类别、把低频类别合并到 RARE，并把预测时未见过的类别映射到 OOV 或全零。pandas 的 Categorical dtype 可以表达固定类别集合；scikit-learn 的 OneHotEncoder 用 fit 学词表、transform 复用词表。教学中要强调 fit 只能看训练集。`,
        md`A vocabulary defines which category occupies which vector position. It must be learned from training data and reused for validation, test, and online prediction. If validation or serving silently adds new columns, the model has no corresponding weights. If category order changes, one learned weight is assigned to the wrong category. Categorical encoding is therefore not a local table trick; it is a model input contract.

A reliable workflow usually normalizes case and whitespace, merges spelling variants, counts train frequencies, keeps common categories, collapses rare categories into RARE, and maps serving-time unknowns to OOV or all-zero. pandas Categorical can express a fixed category set; scikit-learn OneHotEncoder learns categories during fit and reuses them during transform. The teaching rule is simple: fit sees training data only.`,
      ),
      { visualIds: ['categorical-one-hot-flow-video'] },
    ),
    section(
      'encoding-choices',
      copy('索引、one-hot、multi-hot 与稀疏矩阵', 'Index, One-hot, Multi-hot, and Sparse Matrices'),
      copy(
        md`把类别映射成整数索引只是查表步骤，不等于模型可以直接读这个整数。若把 north=0、south=1、west=2 直接喂给线性模型，模型会看到一个不存在的顺序和距离。one-hot 通过“每个类别一个指示器”避免这种伪顺序；multi-hot 用同一词表表达一个样本同时拥有多个标签。

one-hot 的代价是维度变宽。若词表有 10,000 个城市，每个样本只激活 1 个位置，密集数组会浪费大量空间。稀疏矩阵只记录非零位置和数值，因此更贴合类别特征。教学中可以同时展示密集向量 [0,0,1,0] 和稀疏表示 {2:1}，让学生理解“数学上宽，工程上稀疏”。`,
        md`Mapping categories to integer indices is only a lookup step; it does not mean the model should consume the integer as a magnitude. If north=0, south=1, and west=2 are fed directly into a linear model, the model sees fake order and distance. One-hot avoids that pseudo-order by giving each category its own indicator. Multi-hot uses the same vocabulary when one example owns several tags at once.

The cost is width. If a vocabulary contains 10,000 cities and each example activates one position, dense arrays waste memory. Sparse matrices record only nonzero positions and values, which is a natural fit for categorical features. A useful teaching move is to show both dense [0,0,1,0] and sparse {2:1}, so students see that the representation is mathematically wide but operationally sparse.`,
      ),
      { visualIds: ['categorical-vocabulary-image'], labIds: ['categorical-encoding-lab'] },
    ),
    section(
      'high-cardinality',
      copy('高基数类别需要单独处理', 'High Cardinality Needs Separate Treatment'),
      copy(
        md`高基数列有大量不同取值，例如用户 ID、商品 ID、URL、搜索词、设备指纹。直接 one-hot 会得到巨大稀疏空间，并且很多取值只有极少训练样本，模型很容易记住偶然关联。并非所有高基数列都应丢弃；它们可能含有强信号，但必须谨慎处理。

常见策略包括：把明显的身份列用于连接、去重、分组统计或泄漏检查，而不是直接建模；保留高频类别并合并长尾；使用哈希桶换取固定维度，但接受碰撞；在深度模型中学习 embedding，但把 embedding 当作需要数据量和正则化支撑的参数化表示，而不是免费压缩。无论使用哪种策略，都要检查训练/验证差距和线上新类别比例。`,
        md`High-cardinality columns have many distinct values: user IDs, product IDs, URLs, search queries, and device fingerprints. Direct one-hot creates a huge sparse space, and many values have very few training examples, making memorization easy. Not every high-cardinality column should be dropped; some carry strong signal, but they need deliberate handling.

Common strategies include using identity columns for joins, deduplication, grouped statistics, or leakage checks instead of direct modeling; keeping frequent categories while grouping the tail; using hashing to get fixed width while accepting collisions; and learning embeddings in deep models, treating them as parameterized representations that require enough data and regularization, not free compression. Whatever the strategy, inspect train/validation gap and the rate of new serving categories.`,
      ),
    ),
    section(
      'labels-and-drift',
      copy('人工标签、类别漂移与泄漏', 'Human Labels, Category Drift, and Leakage'),
      copy(
        md`类别特征经常来自人工流程或业务系统：人工标注的主题、客服选择的原因、商家填写的品类、规则系统打出的风险标签。这些列不一定稳定。不同标注者可能使用不同标准，业务枚举会改名或拆分，某些标签可能只在事后才知道。如果预测时不可用，或直接包含目标答案，它就是泄漏。

严谨的类别处理需要记录来源、时间点和可用性。训练时看起来很强的类别列，要问它是否在真实预测时已经存在；分布随时间变化时，要监控 OOV 比例、低频桶占比、类别频率排序和标注一致性。类别数据不是静态字典，而是会随产品、地区、规则和人发生变化的输入接口。`,
        md`Categorical features often come from human or business processes: human topic labels, support reasons, merchant-entered categories, or risk tags produced by a rules system. These columns are not automatically stable. Different annotators may use different standards, business enums may be renamed or split, and some labels are only known after the outcome. If a feature is unavailable at prediction time or directly contains the answer, it is leakage.

Rigorous handling records source, timestamp, and availability. When a categorical column looks very predictive, ask whether it already exists at real prediction time. As distributions move, monitor OOV rate, rare-bucket share, category frequency rank, and label agreement. Categorical data is not a static dictionary; it is an input interface shaped by product, region, rules, and people.`,
      ),
    ),
    section(
      'feature-crosses',
      copy('特征交叉表达局部规则，也放大稀疏性', 'Feature Crosses Express Local Rules and Expand Sparsity'),
      copy(
        md`单个类别特征只能表达一个维度的成员关系。特征交叉把多个成员关系组合起来，例如 district × property_type、country × device、query_term × ad_category。这样线性模型也能学习局部规则：某个街区的 loft 可能不同于同一街区的 apartment，也不同于其他街区的 loft。

交叉的风险是维度乘法增长。若 district 有 80 个值、property_type 有 20 个值，完整交叉空间有 1,600 个槽位；再加一个 30 类特征就变成 48,000。很多组合训练样本极少，容易过拟合。教学中应要求每个交叉回答两个问题：它表达的业务假设是什么？样本量是否足够支撑这些局部参数？`,
        md`A single categorical feature expresses membership along one dimension. A feature cross combines memberships, such as district × property_type, country × device, or query_term × ad_category. This lets even a linear model learn local rules: lofts in one district can behave differently from apartments in that district and from lofts elsewhere.

The risk is multiplicative dimension growth. If district has 80 values and property_type has 20, the full crossed space has 1,600 slots; adding a 30-category feature creates 48,000. Many combinations have few training examples, which invites overfitting. In teaching, every cross should answer two questions: what business hypothesis does it express, and is there enough data to support those local parameters?`,
      ),
      { visualIds: ['categorical-cross-image', 'categorical-cross-video'] },
    ),
    section(
      'engineering-handoff',
      copy('把教学概念交付成可复用管道', 'Deliver Concepts as a Reusable Pipeline'),
      copy(
        md`一个可靠的类别数据管道应保存规则，而不只是保存展开后的表：清洗规则、训练词表、低频阈值、OOV 策略、列顺序、稀疏格式、哈希桶数、交叉列表以及 fit 时使用的数据版本。这样模型重新训练、线上预测和问题回溯时，才能判断变化来自数据分布、词表策略还是模型本身。

pandas 适合展示数据语义和快速 EDA；scikit-learn 的编码器适合表达 fit/transform 契约；线上系统需要同样的规范化、查表和未知值处理。类别编码的最终目标不是“把字符串变成数字”这么简单，而是让每一次训练和每一次预测都按同一份可审计协议解释类别。`,
        md`A reliable categorical pipeline saves rules, not only the expanded table: cleaning rules, training vocabulary, rare threshold, OOV policy, column order, sparse format, hash bucket count, cross list, and the data version used during fit. Then retraining, serving, and incident review can determine whether behavior changed because of data distribution, vocabulary policy, or the model.

pandas is useful for data semantics and quick EDA; scikit-learn encoders express the fit/transform contract; production systems need the same normalization, lookup, and unknown handling. The goal of categorical encoding is not merely converting strings to numbers. It is making every training run and every prediction interpret categories through one auditable protocol.`,
      ),
    ),
  ],
  visuals: [
    image(
      'categorical-semantics-image',
      'categorical-semantics.png',
      copy('类别语义判定图', 'Categorical semantic decision map'),
      copy(
        '先判断一列是否有可解释的大小和距离；没有数值语义的数字型列应进入类别处理路径。',
        'First decide whether a column has meaningful magnitude and distance; numeric-looking columns without quantitative semantics belong on the categorical path.',
      ),
      [
        { id: 'raw-table', x: 14, y: 74, label: copy('原始列值', 'Raw column values') },
        { id: 'decision', x: 52, y: 46, label: copy('语义判断', 'Semantic decision') },
        { id: 'magnitude', x: 83, y: 41, label: copy('连续数值路径', 'Continuous numeric path') },
        { id: 'membership', x: 83, y: 78, label: copy('类别成员路径', 'Categorical membership path') },
        { id: 'id-warning', x: 51, y: 18, label: copy('数字外观不等于数值意义', 'Numeric-looking is not numeric meaning') },
      ],
    ),
    image(
      'categorical-vocabulary-image',
      'categorical-vocabulary-one-hot.png',
      copy('词表到 one-hot 与 OOV', 'Vocabulary to one-hot and OOV'),
      copy(
        '训练词表决定固定槽位；低频类别进入 RARE，预测时新类别进入 OOV 或既定未知值策略。',
        'The train vocabulary defines fixed slots; rare categories enter RARE, and serving-time unknowns enter OOV or the chosen unknown policy.',
      ),
      [
        { id: 'raw-categories', x: 10, y: 14, label: copy('训练类别', 'Train categories') },
        { id: 'rare-tail', x: 10, y: 85, label: copy('长尾低频', 'Long tail') },
        { id: 'vocab', x: 47, y: 13, label: copy('固定词表', 'Frozen vocabulary') },
        { id: 'one-hot', x: 82, y: 13, label: copy('one-hot 槽位', 'one-hot slots') },
        { id: 'sparse', x: 82, y: 56, label: copy('稀疏非零位置', 'Sparse nonzero positions') },
        { id: 'oov', x: 28, y: 71, label: copy('RARE / OOV 桶', 'RARE / OOV bucket') },
      ],
    ),
    image(
      'categorical-cross-image',
      'categorical-feature-cross-sparsity.png',
      copy('特征交叉与稀疏高维', 'Feature crosses and sparse high dimension'),
      copy(
        '两个 one-hot 类别交叉后形成组合网格，向量宽度按词表大小相乘增长，但每个样本通常只激活少数槽位。',
        'Crossing two one-hot categorical features creates a combination grid; width grows by multiplying vocabularies, while each example usually activates very few slots.',
      ),
      [
        { id: 'left-feature', x: 8, y: 30, label: copy('类别 A', 'Category A') },
        { id: 'right-feature', x: 8, y: 61, label: copy('类别 B', 'Category B') },
        { id: 'cartesian', x: 48, y: 24, label: copy('笛卡尔组合网格', 'Cartesian grid') },
        { id: 'active-pair', x: 52, y: 51, label: copy('一个激活组合', 'One active pair') },
        { id: 'wide-vector', x: 82, y: 49, label: copy('高维稀疏向量', 'Wide sparse vector') },
        { id: 'risk', x: 50, y: 91, label: copy('维度增长与过拟合风险', 'Dimension growth and overfitting risk') },
      ],
    ),
    video(
      'categorical-one-hot-flow-video',
      'categorical-one-hot-flow',
      copy('词表编码过程动画', 'Vocabulary encoding animation'),
      copy(
        'Manim 动画展示类别值如何经过训练词表、低频桶和 OOV 策略变成 one-hot 与稀疏位置。',
        'Manim animation showing category values moving through a train vocabulary, rare/OOV policy, one-hot cells, and sparse indices.',
      ),
    ),
    video(
      'categorical-cross-video',
      'feature-cross-sparsity',
      copy('类别交叉稀疏性动画', 'Feature-cross sparsity animation'),
      copy(
        'Manim 动画展示两个类别词表交叉后，组合空间如何扩张，而单个样本只激活少量位置。',
        'Manim animation showing how two categorical vocabularies expand into a crossed space while one example activates very few positions.',
      ),
    ),
  ],
  labs: [
    lab('categorical-encoding-lab', copy('类别编码实验室', 'Categorical Encoding Lab'), 'CategoricalEncodingLab', [
      copy(
        '能解释训练词表、低频桶和 OOV 如何改变向量宽度与激活位置。',
        'Explain how vocabulary, rare buckets, and OOV policy change vector width and active positions.',
      ),
      copy(
        '能区分 one-hot、multi-hot、特征交叉和哈希桶各自解决的问题。',
        'Distinguish the problems solved by one-hot, multi-hot, feature crosses, and hash buckets.',
      ),
      copy(
        '能把实验中的编码选择对应到 pandas 或 scikit-learn 的工程接口。',
        'Map the lab encoding choices to pandas or scikit-learn interfaces.',
      ),
    ]),
  ],
  quizzes: [
    quiz(
      'zip-code-semantics',
      copy('邮编 94110 应该直接当连续数值输入线性模型吗？', 'Should ZIP code 94110 be fed directly as a continuous numeric feature?'),
      'categorical',
      copy('不应该。它主要表示区域成员关系，而不是可解释的大小或距离。', 'No. It mainly represents area membership, not meaningful magnitude or distance.'),
      copy('应该，因为它由数字组成。', 'Yes, because it is written with digits.'),
      copy(
        '数字外观不等于数值语义；邮编差值通常没有可建模的连续含义。',
        'Numeric appearance is not numeric semantics; ZIP-code differences usually have no continuous modeling meaning.',
      ),
    ),
    quiz(
      'vocab-fit-scope',
      copy('类别词表应该从哪部分数据学习？', 'Which data should learn the categorical vocabulary?'),
      'train',
      copy('训练集。验证、测试和预测阶段复用训练词表。', 'Training data. Validation, test, and serving reuse the train vocabulary.'),
      copy('所有数据，包括测试集和线上新类别。', 'All data, including test and new serving categories.'),
      copy(
        '词表是模型输入协议，不能让测试集或未来流量提前改变输入空间。',
        'Vocabulary is an input contract; test data and future traffic must not reshape the input space.',
      ),
    ),
    quiz(
      'multi-hot-case',
      copy('一个样本同时有 subway 和 school 两个标签时，最自然的编码是哪种？', 'If one example has both subway and school tags, which encoding is most natural?'),
      'multi-hot',
      copy('multi-hot，因为同一词表中可以同时激活多个槽位。', 'Multi-hot, because multiple slots can be active in one vocabulary.'),
      copy('普通索引编码，只保留其中一个标签。', 'Plain index encoding, keeping only one tag.'),
      copy(
        '标签集合不是互斥类别；丢掉其中一个标签会损失信息。',
        'A tag set is not mutually exclusive; dropping one tag loses information.',
      ),
    ),
    quiz(
      'cross-dimension',
      copy('8 个街区与 5 个房型完整交叉后最多有多少组合槽位？', 'How many slots can a full cross of 8 districts and 5 property types create?'),
      'forty',
      copy('40 个。交叉维度按词表大小相乘。', '40. Crossed dimension multiplies vocabulary sizes.'),
      copy('13 个。只需要把两个词表长度相加。', '13. You only add the two vocabulary sizes.'),
      copy(
        '类别交叉表达组合成员关系，完整空间是笛卡尔积。',
        'A categorical cross represents combination membership, so the full space is a Cartesian product.',
      ),
    ),
  ],
  misconceptions: [
    misconception(
      'integer-index-safe',
      copy('把类别映射成 0、1、2 后，模型就能直接理解它们。', 'After mapping categories to 0, 1, and 2, the model can directly understand them.'),
      copy(
        '整数索引只是查表编号；直接输入会制造虚假顺序。线性模型通常需要 one-hot、multi-hot、哈希或 embedding 等表示。',
        'Integer indices are lookup IDs; feeding them directly creates fake order. Linear models usually need one-hot, multi-hot, hashing, or embeddings.',
      ),
      copy('north=0、south=1、west=2 不表示 west 比 north 大两倍。', 'north=0, south=1, west=2 does not mean west is twice north.'),
    ),
    misconception(
      'oov-rare-afterthought',
      copy('OOV 和低频类别可以等线上出问题后再处理。', 'OOV and rare categories can be handled later after serving breaks.'),
      copy(
        '未知类别策略是输入协议的一部分，必须在训练前设计并测试。否则线上新值会造成列错位、全零含义不清或错误降级。',
        'Unknown-category policy is part of the input contract and must be designed before training. Otherwise serving values can cause column drift, ambiguous all-zero rows, or bad fallback behavior.',
      ),
      copy('训练没见过 airport 时，预测管道仍然必须知道它该进入 OOV。', 'If airport was unseen during training, the serving pipeline still must know to map it to OOV.'),
    ),
    misconception(
      'cross-always-better',
      copy('特征交叉越多，模型一定越好。', 'More feature crosses always make the model better.'),
      copy(
        '交叉增加表达能力，也增加维度、稀疏性和过拟合风险。只有能说明业务假设并有足够样本支撑的交叉才值得保留。',
        'Crosses add expressiveness, but also dimension, sparsity, and overfitting risk. Keep crosses only when they express a clear task hypothesis and have enough samples.',
      ),
      copy('街区 × 房型可能有意义；用户 ID × 时间戳 往往只是在记忆样本。', 'district × property type may be meaningful; user ID × timestamp often memorizes examples.'),
    ),
    misconception(
      'hashing-no-cost',
      copy('哈希可以解决高基数问题，而且没有代价。', 'Hashing solves high cardinality with no cost.'),
      copy(
        '哈希提供固定宽度且不需要保存完整词表，但不同类别可能碰撞到同一桶。桶数、碰撞率和可解释性都需要权衡。',
        'Hashing gives fixed width without storing a full vocabulary, but different categories can collide into the same bucket. Bucket count, collision rate, and interpretability are tradeoffs.',
      ),
      copy('airport 和 harbor 可能落入同一个桶，模型无法区分这次碰撞。', 'airport and harbor may land in the same bucket, and the model cannot distinguish that collision.'),
    ),
  ],
  sourceReferences: [
    sources.googleCategorical,
    sources.googleOneHot,
    sources.googleIssues,
    sources.googleFeatureCrosses,
    sources.pandasCategorical,
    sources.pandasGetDummies,
    sources.sklearnOneHot,
    sources.sklearnHasher,
  ],
}
