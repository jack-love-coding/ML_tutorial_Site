import type {
  DataConcept,
  DataLabConfig,
  DataLabModule,
  DataLabModuleId,
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
  googleNumerical: {
    label: copy('Google MLCC：数值数据', 'Google MLCC: Numerical data'),
    href: 'https://developers.google.com/machine-learning/crash-course/numerical-data',
    license: 'CC BY 4.0',
    usage: copy('校准数值特征、缩放、分布和特征质量的入门边界。', 'Calibrates beginner boundaries for numerical features, scaling, distributions, and feature quality.'),
  },
  googleScrubbing: {
    label: copy('Google MLCC：数据清洗', 'Google MLCC: Scrubbing'),
    href: 'https://developers.google.com/machine-learning/crash-course/numerical-data/scrubbing',
    license: 'CC BY 4.0',
    usage: copy('校准缺失值、重复、异常和坏数据对模型训练的影响。', 'Calibrates how missing values, duplicates, outliers, and bad data affect model training.'),
  },
  googleNormalization: {
    label: copy('Google MLCC：归一化', 'Google MLCC: Normalization'),
    href: 'https://developers.google.com/machine-learning/crash-course/numerical-data/normalization',
    license: 'CC BY 4.0',
    usage: copy('校准缩放、离群点和数值范围对学习过程的影响。', 'Calibrates how scaling, outliers, and numeric ranges affect learning.'),
  },
  googleCategorical: {
    label: copy('Google MLCC：类别数据', 'Google MLCC: Categorical data'),
    href: 'https://developers.google.com/machine-learning/crash-course/categorical-data',
    license: 'CC BY 4.0',
    usage: copy('校准类别特征、词表、one-hot 和稀疏表示的教学边界。', 'Calibrates categorical features, vocabularies, one-hot encoding, and sparse representations.'),
  },
  pandasIntro: {
    label: copy('pandas：DataFrame 入门', 'pandas: DataFrame intro'),
    href: 'https://pandas.pydata.org/docs/getting_started/intro_tutorials/01_table_oriented.html',
    usage: copy('校准 DataFrame、Series、列选择和表格心智模型。', 'Calibrates the DataFrame, Series, column selection, and table mental model.'),
  },
  pandasMissing: {
    label: copy('pandas：缺失数据', 'pandas: Missing data'),
    href: 'https://pandas.pydata.org/docs/user_guide/missing_data.html',
    usage: copy('校准 `isna`、`notna`、`dropna` 和 `fillna` 的语义。', 'Calibrates `isna`, `notna`, `dropna`, and `fillna` semantics.'),
  },
  pandasGroupby: {
    label: copy('pandas：GroupBy', 'pandas: GroupBy'),
    href: 'https://pandas.pydata.org/docs/user_guide/groupby.html',
    usage: copy('校准 split-apply-combine、聚合和分组统计。', 'Calibrates split-apply-combine, aggregation, and grouped statistics.'),
  },
  pandasVisualization: {
    label: copy('pandas：可视化', 'pandas: Visualization'),
    href: 'https://pandas.pydata.org/docs/user_guide/visualization.html',
    usage: copy('校准表格探索中分布、箱线图、散点和分组图的入口。', 'Calibrates histogram, box, scatter, and grouped plots for table exploration.'),
  },
  pandasDerived: {
    label: copy('pandas：派生列', 'pandas: Derived columns'),
    href: 'https://pandas.pydata.org/docs/getting_started/intro_tutorials/05_add_columns.html',
    usage: copy('校准新增列、表达式和 method chain 的教学用法。', 'Calibrates derived columns, expressions, and method-chain teaching usage.'),
  },
} satisfies Record<string, SourceReference>

function moduleDefinition(input: DataLabModule): DataLabModule {
  return input
}

export const dataLabModules: DataLabModule[] = [
  moduleDefinition({
    id: 'data-types-feature-vectors',
    order: 1,
    title: copy('数据类型与特征表示', 'Data Types and Feature Vectors'),
    subtitle: copy('先判断列的语义，再决定模型应该怎样读取它。', 'Decide what a column means before deciding how a model should read it.'),
    accent: '#2563eb',
    theme: '#edf4ff',
    estimatedMinutes: 28,
    learningObjectives: [
      copy('区分数值、类别、序数、布尔、时间、文本、ID 和缺失值。', 'Distinguish numeric, categorical, ordinal, boolean, datetime, text, ID, and missing values.'),
      copy('解释 feature、label、row、column 和 feature vector 的关系。', 'Explain the relation among features, labels, rows, columns, and feature vectors.'),
      copy('识别邮编、房号、用户 ID 这类“看起来是数字但不是数值大小”的列。', 'Identify columns such as ZIP codes, room IDs, and user IDs that look numeric but are not magnitudes.'),
    ],
    concepts: [
      concept(
        'semantic-type',
        copy('列的语义类型', 'Column Semantic Type'),
        copy('同一列在 CSV 里只是字符串或数字，但在建模里可能代表大小、类别、顺序、时间或身份。语义先于编码。', 'A CSV column may be only strings or numbers, but modeling needs to know whether it represents magnitude, category, order, time, or identity. Semantics comes before encoding.'),
        copy('邮编 94110 和 10001 之间不能做“距离”解释；房价 500 和 700 之间可以。', 'ZIP codes 94110 and 10001 do not have a meaningful distance; prices 500 and 700 do.'),
      ),
      concept(
        'feature-vector',
        copy('特征向量', 'Feature Vector'),
        copy('一行样本经过列选择、编码和缩放后，会变成模型实际读取的一串数。这个向量才是训练算法的直接输入。', 'After column selection, encoding, and scaling, one row becomes a numeric vector. This vector is what the training algorithm reads directly.'),
        copy('类别列 `district=north` 可以变成 one-hot 片段，数值列 `rooms=3` 可以保留为一个缩放后的数字。', '`district=north` can become a one-hot segment, while `rooms=3` can remain one scaled number.'),
        "pd.get_dummies(df[['district']]).join(df[['rooms']])",
      ),
    ],
    sections: [
      section(
        'semantic-before-encoding',
        copy('先问语义，再写代码', 'Ask Semantics Before Writing Code'),
        copy(
          md`数据表的每一列都要先回答一个问题：**这个值之间能不能比较大小、计算距离或求平均？** 如果答案是否定的，它通常不应该直接作为连续数值喂给模型。

- 数值列表示大小，例如面积、温度、价格。
- 类别列表示成员关系，例如城市、产品类型、设备型号。
- 序数列有顺序但间距不一定相等，例如低/中/高风险。
- ID 列主要用于连接、去重或追踪，不应该被模型当成大小。

这个判断决定后续的编码方式，也决定哪些错误会悄悄进入训练。`,
          md`Each column should first answer: **Can these values be compared by magnitude, distance, or average?** If not, the column usually should not enter a model as a continuous numeric feature.

- Numeric columns represent magnitude: area, temperature, price.
- Categorical columns represent membership: city, product type, device model.
- Ordinal columns have order but not necessarily equal spacing: low / medium / high risk.
- ID columns are for joins, deduplication, or tracking, not magnitude.

This decision controls encoding and prevents subtle training mistakes.`,
        ),
        { visualIds: ['data-types-feature-vector-image'] },
      ),
      section(
        'feature-label-split',
        copy('feature 与 label 要分清', 'Separate Features from Labels'),
        copy(
          md`监督学习里，feature 是模型预测时能看到的输入，label 是训练时用来评分的答案。把 label 或由 label 直接派生的列放进 feature，会造成数据泄漏。

一个稳定规则是：**预测时还不知道的列，不能当特征。** 例如预测房屋成交价时，成交后才产生的“最终佣金”不能作为输入。`,
          md`In supervised learning, features are inputs available at prediction time, while the label is the answer used for training feedback. Putting the label, or a direct derivative of the label, into features causes leakage.

A reliable rule: **a column unknown at prediction time cannot be a feature.** If predicting final home price, a post-sale commission is not an input.`,
        ),
        { labIds: ['column-type-lab'] },
      ),
      section(
        'encoding-cost',
        copy('编码会改变维度和成本', 'Encoding Changes Dimension and Cost'),
        copy(
          md`类别列不是免费变成数字。one-hot 会把一个列展开成多个二进制指示器；类别越多，向量越宽。高基数 ID 类列如果直接 one-hot，可能制造巨大稀疏矩阵，却几乎不给模型可泛化的规律。

因此，列选择不是整理表格的琐事，而是决定模型能读到什么、读不到什么，以及训练成本有多高。`,
          md`Categorical columns do not become numbers for free. One-hot encoding expands one column into multiple binary indicators; more categories mean wider vectors. A high-cardinality ID column can create a huge sparse matrix with little generalizable signal.

Column selection is therefore not table housekeeping. It decides what the model can read, what it cannot read, and how expensive training becomes.`,
        ),
        { visualIds: ['data-types-feature-flow-video'] },
      ),
    ],
    visuals: [
      image('data-types-feature-vector-image', 'data-types-feature-vectors.png', copy('从列语义到特征向量', 'From column semantics to feature vector'), copy('原始表格先经过列语义判断，再被编码成模型读取的数值向量。', 'Raw columns are interpreted semantically before becoming numeric vectors for a model.'), [
        { id: 'raw', x: 18, y: 13, label: copy('原始表格', 'Raw table') },
        { id: 'types', x: 49, y: 13, label: copy('列语义', 'Column meaning') },
        { id: 'vector', x: 78, y: 13, label: copy('特征向量', 'Feature vector') },
        { id: 'warning', x: 49, y: 82, label: copy('ID 不等于数值大小', 'ID is not magnitude') },
      ]),
      video('data-types-feature-flow-video', 'data-types-feature-flow', copy('列类型流向特征向量', 'Column types flowing into a feature vector'), copy('动画展示数值、类别和 ID 列在进入模型前的不同处理路径。', 'Animation showing numeric, categorical, and ID columns taking different paths before modeling.')),
    ],
    labs: [
      lab('column-type-lab', copy('列类型分拣器', 'Column Type Sorter'), 'ColumnTypeLab', [
        copy('能解释为什么邮编不应该直接当连续数值。', 'Explain why ZIP codes should not be treated as continuous values.'),
        copy('能说出 one-hot 会如何增加特征维度。', 'Describe how one-hot encoding increases feature dimension.'),
      ]),
    ],
    quizzes: [
      quiz('zip-type', copy('邮编列最安全的初始处理方式是什么？', 'What is the safest first treatment for a ZIP-code column?'), 'category', copy('把它视为类别或地理分组线索。', 'Treat it as categorical or as a geographic grouping signal.'), copy('直接求均值和欧氏距离。', 'Average it and use Euclidean distance.'), copy('邮编的数字差不代表真实空间距离或大小顺序。', 'A numeric ZIP-code difference does not represent meaningful distance or magnitude.')),
    ],
    misconceptions: [
      misconception('numeric-looking', copy('只要 CSV 里是数字，就一定是数值特征。', 'If it is numeric in a CSV, it is a numeric feature.'), copy('数字外观不等于数值语义。ID、邮编、类别编码都可能只是符号。', 'Numeric appearance is not numeric meaning. IDs, ZIP codes, and category codes may be symbols.'), copy('用户 ID 102 比用户 ID 17 大，并不表示用户更“强”或更“贵”。', 'User ID 102 being larger than 17 does not mean the user is stronger or more expensive.')),
    ],
    sourceReferences: [sources.googleNumerical, sources.googleCategorical, sources.pandasIntro],
  }),
  moduleDefinition({
    id: 'data-cleaning-preprocessing',
    order: 2,
    title: copy('数据处理与清洗', 'Data Cleaning and Preprocessing'),
    subtitle: copy('把坏值、缺失、重复和尺度问题变成可检查的流水线。', 'Turn bad values, missingness, duplicates, and scale issues into an auditable pipeline.'),
    accent: '#0f9f7a',
    theme: '#e9f8f5',
    estimatedMinutes: 32,
    learningObjectives: [
      copy('识别缺失值、重复行、越界值、异常值、坏标签和单位混用。', 'Recognize missing values, duplicates, out-of-range values, outliers, bad labels, and mixed units.'),
      copy('用 pandas 语义解释 `isna`、`notna`、`dropna`、`fillna`、`drop_duplicates`、`clip`、`astype` 和 `to_datetime`。', 'Explain pandas semantics for `isna`, `notna`, `dropna`, `fillna`, `drop_duplicates`, `clip`, `astype`, and `to_datetime`.'),
      copy('说明为什么训练与预测阶段必须使用同一套清洗规则。', 'Explain why training and prediction must use the same cleaning rules.'),
    ],
    concepts: [
      concept('cleaning-policy', copy('清洗策略', 'Cleaning Policy'), copy('清洗不是随手修表，而是把“哪些值有效、如何处理无效值”写成可复现规则。', 'Cleaning is not ad hoc table fixing; it is a reproducible policy for valid values and invalid-value handling.'), copy('缺失房间数可以填中位数、单独加缺失指示器，或丢弃该行；选择取决于任务和缺失机制。', 'Missing room count can be median-filled, paired with a missing indicator, or dropped; the choice depends on the task and missingness mechanism.'), "df['rooms'] = df['rooms'].fillna(df['rooms'].median())"),
      concept('preprocessing-fit', copy('预处理必须可复用', 'Preprocessing Must Be Reusable'), copy('训练集上学到的填充值、类别词表和缩放参数，预测时必须复用，不能重新从单条样本估计。', 'Imputation values, category vocabulary, and scaling parameters learned on training data must be reused at prediction time.'), copy('用训练集均值缩放测试集，而不是用测试集重新计算均值。', 'Scale the test set using the training mean rather than recomputing a test mean.'), "train_mean = train['price'].mean()\ntest['price_centered'] = test['price'] - train_mean"),
    ],
    sections: [
      section('quality-scan', copy('先做质量扫描', 'Start with a Quality Scan'), copy(md`进入建模前，先统计每列的缺失比例、唯一值数量、范围、类型和重复行。这个扫描不是为了“美化数据”，而是为了发现会改变训练信号的问题：目标列缺失、单位混用、异常大值、日期解析失败、重复样本和非法类别。`, md`Before modeling, profile each column for missing rate, unique count, range, type, and duplicate rows. This scan is not cosmetic; it finds issues that change training signals: missing labels, mixed units, extreme values, failed date parsing, duplicates, and invalid categories.`), { visualIds: ['data-cleaning-pipeline-image'] }),
      section('missing-values', copy('缺失值要解释，不只是填掉', 'Explain Missingness Before Filling It'), copy(md`缺失值有时只是记录失败，有时本身就是信号。清洗流水线应该记录选择：丢弃、填充、保留缺失类别，或新增一个“是否缺失”的指示列。pandas 里的 ` + '`isna()`' + md` 和 ` + '`notna()`' + md` 用来先定位缺失，` + '`dropna()`' + md` 和 ` + '`fillna()`' + md` 才是后续动作。`, md`Missingness may be a recording failure or a signal. The pipeline should record the choice: drop, fill, keep a missing category, or add a missingness indicator. In pandas, ` + '`isna()`' + md` and ` + '`notna()`' + md` locate missing values; ` + '`dropna()`' + md` and ` + '`fillna()`' + md` act on them.`), { labIds: ['cleaning-pipeline-lab'] }),
      section('outliers-and-types', copy('异常值、类型和单位要一起看', 'Read Outliers, Types, and Units Together'), copy(md`异常值不一定错，但一定要解释。房价 9800 可能是豪宅，也可能是单位从“万元”混进了“千元”。日期列解析失败、布尔列混入字符串、价格列含货币符号，都会让后续分析悄悄变形。`, md`An outlier is not automatically wrong, but it must be explained. A price of 9800 may be a luxury home or a unit mix-up. Failed dates, strings inside boolean columns, and currency symbols inside prices all distort later analysis.`), { visualIds: ['data-cleaning-flow-video'] }),
    ],
    visuals: [
      image('data-cleaning-pipeline-image', 'data-cleaning-preprocessing.png', copy('清洗流水线', 'Cleaning pipeline'), copy('从杂乱表格到可训练表格，中间每一步都应该可复现、可审计。', 'From messy table to training-ready table, every step should be reproducible and auditable.'), [
        { id: 'raw', x: 17, y: 12, label: copy('原始数据', 'Raw data') },
        { id: 'rules', x: 50, y: 12, label: copy('清洗规则', 'Cleaning rules') },
        { id: 'clean', x: 82, y: 12, label: copy('可训练数据', 'Trainable data') },
        { id: 'audit', x: 54, y: 84, label: copy('记录每一步', 'Audit every step') },
      ]),
      video('data-cleaning-flow-video', 'data-cleaning-flow', copy('清洗步骤动画', 'Cleaning steps animation'), copy('动画展示缺失值、重复行、异常值和类型转换如何进入同一条流水线。', 'Animation showing missing values, duplicates, outliers, and type conversion entering one pipeline.')),
    ],
    labs: [
      lab('cleaning-pipeline-lab', copy('清洗流水线实验', 'Cleaning Pipeline Lab'), 'CleaningPipelineLab', [
        copy('能比较填充、丢弃和裁剪对表格形状的影响。', 'Compare how filling, dropping, and clipping affect table shape.'),
        copy('能把每个 pandas 调用对应到一类数据质量问题。', 'Map each pandas call to one data quality issue.'),
      ]),
    ],
    quizzes: [
      quiz('fill-source', copy('预测阶段遇到缺失值时，填充值应该来自哪里？', 'At prediction time, where should an imputation value come from?'), 'training', copy('来自训练阶段记录下来的规则或统计量。', 'From the rule or statistic recorded during training.'), copy('从当前单条预测样本重新估计。', 'Re-estimate it from the single prediction row.'), copy('预处理规则必须训练/预测一致，才能避免分布和语义漂移。', 'Preprocessing rules must match between training and prediction to avoid distribution and semantic drift.')),
    ],
    misconceptions: [
      misconception('delete-all-missing', copy('只要有缺失值，最安全就是删掉整行。', 'If a row has a missing value, deleting it is always safest.'), copy('删除可能引入偏差，也可能浪费样本；要先理解缺失机制和任务风险。', 'Deletion can introduce bias or waste samples; first understand missingness and task risk.'), copy('高收入用户不填收入时，删除这些行会改变样本分布。', 'If high-income users often omit income, deleting those rows changes the sample distribution.')),
    ],
    sourceReferences: [sources.googleScrubbing, sources.googleNormalization, sources.pandasMissing],
  }),
  moduleDefinition({
    id: 'exploratory-data-analysis',
    order: 3,
    title: copy('数据分析与探索', 'Exploratory Data Analysis'),
    subtitle: copy('先看分布、关系和分组，再决定模型假设是否站得住。', 'Inspect distributions, relationships, and groups before trusting modeling assumptions.'),
    accent: '#d65a31',
    theme: '#fff1e8',
    estimatedMinutes: 30,
    learningObjectives: [
      copy('使用描述统计、直方图、箱线图、散点图、相关性和分组统计提出数据问题。', 'Use descriptive statistics, histograms, box plots, scatter plots, correlation, and grouped summaries to ask data questions.'),
      copy('解释为什么平均值可能掩盖偏态、双峰、离群点和群体差异。', 'Explain why means can hide skew, bimodality, outliers, and group differences.'),
      copy('识别数据泄漏和探索阶段的过度解读风险。', 'Recognize leakage and overinterpretation risks during exploration.'),
    ],
    concepts: [
      concept('distribution-first', copy('先看分布', 'Distribution First'), copy('均值只是一个摘要。直方图和箱线图能揭示偏态、长尾、离群点和分组差异。', 'A mean is only one summary. Histograms and box plots reveal skew, tails, outliers, and group differences.'), copy('两组房价均值相同，但一组集中，一组长尾，模型风险完全不同。', 'Two price groups can share a mean while one is concentrated and the other long-tailed, creating different modeling risks.'), "df['price'].describe()\ndf['price'].plot.hist()"),
      concept('grouped-analysis', copy('分组分析', 'Grouped Analysis'), copy('把总体拆成有意义的组，常能发现整体均值看不到的规律。', 'Splitting the population into meaningful groups often reveals patterns hidden by overall averages.'), copy('按街区比较价格均值和样本数，比只看全城平均更适合发现数据覆盖不足。', 'Comparing mean price and count by district is better than one citywide mean for spotting coverage gaps.'), "df.groupby('district')['price'].agg(['count', 'mean'])"),
    ],
    sections: [
      section('describe-is-not-enough', copy('`describe()` 是起点，不是终点', '`describe()` Is a Start, Not the Finish'), copy(md`` + '`describe()`' + md` 能快速给出计数、均值、标准差和分位数，但它不会告诉你分布形状。探索时至少要追问：是否偏态？是否双峰？离群点集中在哪些组？缺失值是否和目标相关？`, md`` + '`describe()`' + md` quickly gives counts, means, standard deviations, and quantiles, but it does not show distribution shape. During exploration, ask: Is it skewed? Bimodal? Where do outliers cluster? Is missingness related to the target?`), { visualIds: ['eda-workbench-image'] }),
      section('relationships', copy('关系图要服务问题', 'Relationship Plots Serve Questions'), copy(md`散点图、相关矩阵和分组柱状图不是为了让页面更丰富，而是为了检验假设。面积和房价是否近似单调？离群点是否只来自某个街区？某个类别是否样本太少？`, md`Scatter plots, correlation matrices, and grouped bars are not decoration. They test assumptions: Is area roughly monotonic with price? Do outliers come from one district? Does a category have too few examples?`), { labIds: ['eda-workbench-lab'] }),
      section('leakage-check', copy('探索时也要防泄漏', 'Check Leakage During EDA'), copy(md`探索越深入，越容易把目标答案泄露进特征。强相关列不一定是好特征；它可能是目标的另一种记录方式，或是预测时不可用的信息。`, md`The deeper the exploration, the easier it is to leak target information into features. A strongly correlated column is not automatically a good feature; it may be another record of the label or unavailable at prediction time.`), { visualIds: ['eda-split-apply-video'] }),
    ],
    visuals: [
      image('eda-workbench-image', 'exploratory-data-analysis.png', copy('探索性数据分析工作台', 'EDA workbench'), copy('同一张表可以从分布、离群点、相关性和分组差异四个角度阅读。', 'One table can be read through distribution, outliers, correlation, and group differences.'), [
        { id: 'distribution', x: 30, y: 12, label: copy('分布', 'Distribution') },
        { id: 'outlier', x: 68, y: 18, label: copy('离群点', 'Outliers') },
        { id: 'groups', x: 78, y: 74, label: copy('分组', 'Groups') },
        { id: 'mean-warning', x: 31, y: 85, label: copy('均值会隐藏形状', 'Mean can hide shape') },
      ]),
      video('eda-split-apply-video', 'eda-split-apply', copy('split-apply-combine 动画', 'Split-apply-combine animation'), copy('动画展示表格如何按类别拆分、分别统计，再组合成分析结果。', 'Animation showing a table split by category, summarized, and recombined into analysis output.')),
    ],
    labs: [
      lab('eda-workbench-lab', copy('EDA 工作台', 'EDA Workbench'), 'EdaWorkbenchLab', [
        copy('能用不同图形解释同一列数据的不同风险。', 'Use different plots to explain different risks in the same column.'),
        copy('能说出 groupby 为什么能揭示总体均值看不到的信息。', 'Explain why groupby can reveal information hidden by overall means.'),
      ]),
    ],
    quizzes: [
      quiz('mean-risk', copy('为什么只看均值可能危险？', 'Why can looking only at a mean be risky?'), 'shape', copy('因为均值可能掩盖分布形状和离群点。', 'Because a mean can hide distribution shape and outliers.'), copy('因为均值永远不能计算。', 'Because means can never be computed.'), copy('均值有用，但它不能替代分布、分位数和分组检查。', 'A mean is useful, but it cannot replace distributions, quantiles, and grouped checks.')),
    ],
    misconceptions: [
      misconception('correlation-causal', copy('相关性高就说明一个变量导致另一个变量。', 'High correlation means one variable causes the other.'), copy('相关性只是共同变化信号，可能来自混杂因素、泄漏或共同趋势。', 'Correlation only signals co-movement; it may come from confounding, leakage, or shared trends.'), copy('成交价和佣金高度相关，但佣金可能在成交后才知道，不能作为预测前特征。', 'Final price and commission may correlate strongly, but commission may be known only after sale.')),
    ],
    sourceReferences: [sources.googleNumerical, sources.pandasVisualization, sources.pandasGroupby],
  }),
  moduleDefinition({
    id: 'pandas-workflow',
    order: 4,
    title: copy('pandas 工作流', 'pandas Workflow'),
    subtitle: copy('把表格操作组织成清晰、可复现、可讲解的 method chain。', 'Organize table operations into clear, reproducible, explainable method chains.'),
    accent: '#7048e8',
    theme: '#f1edff',
    estimatedMinutes: 34,
    learningObjectives: [
      copy('解释 DataFrame、Series、index、列选择、布尔过滤和新增列。', 'Explain DataFrame, Series, index, column selection, boolean filtering, and derived columns.'),
      copy('用等价 pandas 代码描述排序、merge、concat、groupby、pivot 和 method chaining。', 'Describe sort, merge, concat, groupby, pivot, and method chaining with equivalent pandas code.'),
      copy('用表格形状变化检查每一步是否符合预期。', 'Use table-shape changes to check each step.'),
    ],
    concepts: [
      concept('dataframe-series', copy('DataFrame 与 Series', 'DataFrame and Series'), copy('DataFrame 是带列名和索引的二维表；选出一列通常得到 Series，选出多列仍是 DataFrame。', 'A DataFrame is a two-dimensional table with column names and an index; selecting one column usually returns a Series, while selecting multiple columns keeps a DataFrame.'), copy('`df["price"]` 是一列 Series；`df[["district", "price"]]` 是两列表格。', '`df["price"]` is a Series; `df[["district", "price"]]` is a two-column DataFrame.'), "df['price']\ndf[['district', 'price']]"),
      concept('method-chain', copy('Method chain', 'Method Chain'), copy('把选择、过滤、派生列、分组和排序连成一条链，可以让数据处理过程像配方一样可读。', 'Chaining selection, filtering, derived columns, grouping, and sorting makes a data pipeline read like a recipe.'), copy('先过滤有效价格，再添加单价列，最后按街区聚合。', 'Filter valid prices, add price-per-room, then aggregate by district.'), "(\n    df.dropna(subset=['price'])\n      .assign(price_per_room=lambda d: d['price'] / d['rooms'])\n      .groupby('district')['price_per_room'].mean()\n)"),
    ],
    sections: [
      section('read-table-shape', copy('每一步都读 shape', 'Read Shape at Every Step'), copy(md`pandas 代码不只是“能跑”。每一步都应该能说出输入表和输出表的行数、列数、列含义和索引变化。这样调试时才知道是过滤掉了太多行，还是 merge 造成了重复扩张。`, md`pandas code should not only run. Each step should have an expected input/output row count, column count, column meaning, and index behavior. That is how you notice a filter dropping too many rows or a merge expanding duplicates.`), { visualIds: ['pandas-workflow-image'] }),
      section('selection-filter-assign', copy('选择、过滤、新增列', 'Select, Filter, Assign'), copy(md`典型 pandas 流程先缩小列，再用布尔条件过滤行，最后用 ` + '`assign()`' + md` 或直接赋值创建派生列。派生列要有业务含义，不能只是把目标答案换个名字放回特征。`, md`A typical pandas flow narrows columns, filters rows with boolean masks, then creates derived columns with ` + '`assign()`' + md` or direct assignment. Derived columns need task meaning; they must not reinsert the target under another name.`), { labIds: ['pandas-pipeline-lab'] }),
      section('join-group-pivot', copy('连接、分组和透视', 'Join, Group, and Pivot'), copy(md`` + '`merge()`' + md` 用键把表连接起来，` + '`concat()`' + md` 沿行或列拼接同结构数据，` + '`groupby()`' + md` 做 split-apply-combine，` + '`pivot_table()`' + md` 把长表整理成交叉表。每一种操作都可能改变 shape，因此必须检查键是否唯一、类别是否完整、聚合是否合理。`, md`` + '`merge()`' + md` joins tables by keys, ` + '`concat()`' + md` stacks compatible data, ` + '`groupby()`' + md` performs split-apply-combine, and ` + '`pivot_table()`' + md` reshapes long data into cross-tab form. Each operation can change shape, so check key uniqueness, category coverage, and aggregation meaning.`), { visualIds: ['pandas-method-chain-video'] }),
    ],
    visuals: [
      image('pandas-workflow-image', 'pandas-workflow.png', copy('pandas 链式处理', 'pandas method chain'), copy('DataFrame 经过选择、过滤、派生、分组、连接和排序后，形成可复现的数据配方。', 'A DataFrame passes through selection, filtering, derivation, grouping, joining, and sorting as a reproducible recipe.'), [
        { id: 'input', x: 16, y: 13, label: copy('输入 DataFrame', 'Input DataFrame') },
        { id: 'chain', x: 52, y: 13, label: copy('链式步骤', 'method chain') },
        { id: 'output', x: 83, y: 13, label: copy('输出表', 'Output table') },
        { id: 'shape', x: 51, y: 84, label: copy('每步检查 shape', 'Check shape each step') },
      ]),
      video('pandas-method-chain-video', 'pandas-method-chain', copy('pandas 链式处理动画', 'pandas method-chain animation'), copy('动画展示一张表如何经过过滤、派生、分组、连接和排序得到结果。', 'Animation showing a table moving through filter, assign, groupby, merge, and sort.')),
    ],
    labs: [
      lab('pandas-pipeline-lab', copy('pandas Pipeline 模拟器', 'pandas Pipeline Simulator'), 'PandasPipelineLab', [
        copy('能把每个按钮对应到一段 pandas 代码。', 'Map each button to a pandas code snippet.'),
        copy('能用行列数变化判断 pipeline 是否符合预期。', 'Use row/column shape changes to judge whether the pipeline behaves as expected.'),
      ]),
    ],
    quizzes: [
      quiz('series-dataframe', copy('在 pandas 中，单列选择通常返回什么？', 'In pandas, what does selecting one column usually return?'), 'series', copy('Series。', 'A Series.'), copy('一定返回完整 DataFrame。', 'Always a full DataFrame.'), copy('单列和多列选择的返回类型不同，是 pandas 入门中最常见的形状问题。', 'Single-column and multi-column selection return different shapes, a common beginner issue.')),
    ],
    misconceptions: [
      misconception('chain-hard-debug', copy('method chain 越长越专业。', 'The longer a method chain, the more professional it is.'), copy('好的链条应该按概念分段，并在关键 shape 变化处容易检查。', 'A good chain is conceptually segmented and easy to inspect at key shape changes.'), copy('过滤、merge 和 groupby 通常值得分别看中间结果。', 'Filtering, merge, and groupby often deserve intermediate inspection.')),
    ],
    sourceReferences: [sources.pandasIntro, sources.pandasDerived, sources.pandasGroupby],
  }),
]

export const dataLabModuleRegistry = Object.fromEntries(
  dataLabModules.map((moduleDefinition) => [moduleDefinition.id, moduleDefinition]),
) as Record<DataLabModuleId, DataLabModule>
