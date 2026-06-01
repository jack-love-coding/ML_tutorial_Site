import type { AlgorithmModuleDefinition, LocalizedCopy, ModuleSimulation, StorySection } from '../types/ml'
import { algorithmCheckpointsBySlug } from './algorithmCheckpoints'

function loc(zhCN: string, en: string): LocalizedCopy {
  return { 'zh-CN': zhCN, en }
}

function chapter(
  id: string,
  titleKey: string,
  markdown: LocalizedCopy,
  callout: LocalizedCopy,
  experimentPrompt: LocalizedCopy,
): StorySection {
  return {
    id,
    eyebrowKey: 'common.chapter',
    titleKey,
    markdown,
    callout,
    experimentPrompt,
  }
}

function simulatePythonNotebook(): ModuleSimulation {
  return {
    snapshots: [
      {
        step: 0,
        loss: 0,
        accuracy: 0,
        derivedMetrics: {
          moduleType: 'notebook-companion',
          referenceIds: [
            'REF-NUMPY-BEGINNER',
            'REF-PANDAS-GETTING-STARTED',
            'REF-PYTHON-DS-HANDBOOK',
            'REF-SKLEARN-GETTING-STARTED',
          ],
        },
      },
    ],
  }
}

export const pythonNotebookModule: AlgorithmModuleDefinition = {
  slug: 'python-notebook',
  route: '/learn/python-notebook',
  titleKey: 'modules.pythonNotebook.title',
  kickerKey: 'modules.pythonNotebook.kicker',
  introKey: 'modules.pythonNotebook.intro',
  summaryKey: 'modules.pythonNotebook.summary',
  theme: '#f3f7ff',
  accent: '#2f6fed',
  checkpoints: algorithmCheckpointsBySlug['python-notebook'],
  chapters: [
    chapter(
      'notebook-rhythm',
      'modules.pythonNotebook.sections.notebookRhythm.title',
      loc(
        `notebook 不是把代码粘成一长串的地方。它更像实验记录本：一格提出问题，一格准备数据，一格计算，一格画图，一格写下你看到什么。

### 老师会先问
这一个 cell 的目的是什么？如果你答不上来，先不要运行。初学者最常见的混乱，不是不会写 Python，而是不知道每一格代码在证明哪件事。

一个干净的复现实验通常按这个顺序写：

1. **导入工具**：NumPy、pandas、sklearn、绘图库。
2. **固定随机性**：设置 random_state，让结果可以重跑。
3. **构造或读取数据**：小例子可以手写数组，项目再读 CSV。
4. **检查形状和列名**：先看 shape、head、describe。
5. **训练或计算**：只让模型接触训练数据。
6. **评估和记录**：写下指标，也写下你不满意的地方。

### 一个 notebook cell 的小模板
~~~python
# 这个 cell 要回答：面积和房价是不是大致同向变化？
import pandas as pd

df = pd.read_csv("housing.csv")
df[["median_income", "median_house_value"]].head()
~~~

### 想一想
如果一个 notebook 重跑一遍就报错，或者结果忽高忽低，它就不是一个可靠的实验。复现不是仪式感，它是在保护你不要被偶然结果骗到。

### Ref ID
REF-NUMPY-BEGINNER、REF-PANDAS-GETTING-STARTED、REF-PYTHON-DS-HANDBOOK`,
        `A notebook is not a place to paste one long script. Treat it as an experiment log: one cell asks a question, one prepares data, one computes, one visualizes, and one records what you saw.

### Teacher question
What is this cell trying to prove? If you cannot answer, do not run it yet. Beginners are often not confused by Python syntax; they are confused because each cell has no purpose.

A clean reproducible experiment usually follows this order:

1. **Import tools**: NumPy, pandas, sklearn, and plotting libraries.
2. **Fix randomness**: set random_state so results can be rerun.
3. **Create or read data**: small examples can be handwritten arrays; projects read CSV.
4. **Inspect shape and columns**: check shape, head, and describe first.
5. **Train or compute**: let the model see training data only.
6. **Evaluate and record**: write down metrics and what still feels unsatisfactory.

### A small cell template
~~~python
# This cell answers: do income and house value move roughly together?
import pandas as pd

df = pd.read_csv("housing.csv")
df[["median_income", "median_house_value"]].head()
~~~

### Think about it
If a notebook fails when rerun or gives unstable results without explanation, it is not a reliable experiment. Reproducibility protects you from being fooled by accidental results.

### Ref ID
REF-NUMPY-BEGINNER, REF-PANDAS-GETTING-STARTED, REF-PYTHON-DS-HANDBOOK`,
      ),
      loc(
        '把 notebook 当实验记录本：每个 cell 都要能说清楚“我在验证什么”。',
        'Treat a notebook as an experiment log: every cell should say what it is checking.',
      ),
      loc(
        '看右侧 notebook 卡片，先按“问题、数据、计算、观察、复现”给每个 cell 标上用途。',
        'Use the notebook cards on the right to label each cell as question, data, compute, observe, or reproduce.',
      ),
    ),
    chapter(
      'numpy-arrays',
      'modules.pythonNotebook.sections.numpyArrays.title',
      loc(
        `NumPy 数组是把数学里的向量和矩阵放进 Python 的第一步。先别急着记 API，老师会先问：这个数组有几行几列？每个位置代表什么？

### 从 list 到 np.array
Python list 可以装数字，但它不懂向量化计算。NumPy 的 \`np.array\` 会把一组数字变成有 shape 的数值对象。

~~~python
import numpy as np

area = np.array([50, 80, 120])
price = np.array([180, 260, 420])

residual = price - 3.2 * area
mse = np.mean(residual ** 2)
area.shape
~~~

这段代码对应站内线性回归实验里的三个动作：拿到特征，算预测和真实值的差，再把误差合成一个 MSE。

### shape 比你想象得重要
\`shape\` 不是细节。模型通常期待二维特征矩阵：\`(样本数, 特征数)\`。一个一维数组 \`(3,)\` 和一个三行一列的矩阵 \`(3, 1)\` 看起来都像三组数字，但给 sklearn 时含义不同。

~~~python
X = area.reshape(-1, 1)
y = price
X.shape  # (3, 1)
~~~

### 想一想
如果你把“3 个样本、1 个特征”错写成“1 个样本、3 个特征”，模型其实还会运行，但它学到的问题已经变了。数组形状就是实验题目的一部分。

### Ref ID
REF-NUMPY-BEGINNER、REF-PYTHON-DS-HANDBOOK`,
        `NumPy arrays are the first step in bringing vectors and matrices into Python. Do not start by memorizing APIs. Ask what the rows and columns mean.

### From list to np.array
Python lists can store numbers, but they do not express vectorized numerical operations well. NumPy's \`np.array\` turns numbers into objects with shape.

~~~python
import numpy as np

area = np.array([50, 80, 120])
price = np.array([180, 260, 420])

residual = price - 3.2 * area
mse = np.mean(residual ** 2)
area.shape
~~~

This mirrors three actions in the site's linear regression lab: collect features, compare predictions with targets, and combine errors into MSE.

### Shape matters
\`shape\` is not a detail. Models usually expect a two-dimensional feature matrix: \`(n_samples, n_features)\`. A one-dimensional array \`(3,)\` and a three-row one-column matrix \`(3, 1)\` may look similar, but they mean different things to sklearn.

~~~python
X = area.reshape(-1, 1)
y = price
X.shape  # (3, 1)
~~~

### Think about it
If you accidentally turn "3 samples with 1 feature" into "1 sample with 3 features", the code may still run, but the question has changed. Array shape is part of the experiment definition.

### Ref ID
REF-NUMPY-BEGINNER, REF-PYTHON-DS-HANDBOOK`,
      ),
      loc(
        '先问 shape，再问公式。数组形状错了，后面的训练解释都会偏。',
        'Ask about shape before formulas. If the array shape is wrong, the training story drifts.',
      ),
      loc(
        '在右侧 cell 列表里找到 reshape 那一步，解释为什么 sklearn 需要二维 X。',
        'Find the reshape cell on the right and explain why sklearn needs a two-dimensional X.',
      ),
    ),
    chapter(
      'pandas-tables',
      'modules.pythonNotebook.sections.pandasTables.title',
      loc(
        `pandas 表格对应真实项目里的 CSV。你可以把 DataFrame 想成一张带列名、索引和类型信息的实验表。

### 从 CSV 到 DataFrame
~~~python
import pandas as pd

df = pd.read_csv("housing.csv")
df.shape
df.head()
df.describe()
~~~

老师会先问：哪一列是目标？哪些列是特征？有没有缺失值？数值列和类别列要不要分开处理？

### 表格操作要服务建模
pandas 不只是“看数据”。它帮你把原始 CSV 变成模型能读的材料：

- 选列：\`df[["median_income", "housing_median_age"]]\`
- 过滤：\`df[df["median_income"] > 5]\`
- 检查缺失：\`df.isna().sum()\`
- 分组观察：\`df.groupby("ocean_proximity")["median_house_value"].mean()\`
- 快速画图：\`df.hist()\`

### 和 NumPy 的关系
pandas 擅长保留列名和表格语义，NumPy 擅长做密集数值计算。进入 sklearn 前，你经常会从 DataFrame 里选出特征列，再让模型拿到数值矩阵。

### 想一想
如果你不知道每一列的含义，只看相关系数或模型分数，很容易把“地理位置”“收入”“房龄”这些现实问题压扁成一堆数字。EDA 的作用，就是先把数字重新接回现实。

### Ref ID
REF-PANDAS-GETTING-STARTED、REF-PYTHON-DS-HANDBOOK`,
        `pandas tables correspond to CSV files in real projects. Think of a DataFrame as an experiment table with column names, an index, and data types.

### From CSV to DataFrame
~~~python
import pandas as pd

df = pd.read_csv("housing.csv")
df.shape
df.head()
df.describe()
~~~

Ask which column is the target, which columns are features, whether there are missing values, and whether numeric and categorical columns need different handling.

### Table operations should serve modeling
pandas is not only for looking at data. It helps turn raw CSV into model-ready material:

- Select columns: \`df[["median_income", "housing_median_age"]]\`
- Filter rows: \`df[df["median_income"] > 5]\`
- Check missing values: \`df.isna().sum()\`
- Group and compare: \`df.groupby("ocean_proximity")["median_house_value"].mean()\`
- Make quick plots: \`df.hist()\`

### Relationship to NumPy
pandas preserves column names and table meaning. NumPy is strong at dense numerical computation. Before sklearn, you often select feature columns from a DataFrame and pass a numerical matrix to the model.

### Think about it
If you do not know what each column means, correlations and model scores become detached from reality. EDA reconnects numbers to the real problem.

### Ref ID
REF-PANDAS-GETTING-STARTED, REF-PYTHON-DS-HANDBOOK`,
      ),
      loc(
        'DataFrame 不是模型本身，它是你理解数据、选择特征和发现风险的工作台。',
        'A DataFrame is not the model. It is the workbench for understanding data, selecting features, and finding risks.',
      ),
      loc(
        '看右侧 pandas cell，指出哪些 cell 是在看形状，哪些是在看分布，哪些是在找缺失值。',
        'Use the pandas cells on the right to identify which cells inspect shape, distributions, and missing values.',
      ),
    ),
    chapter(
      'sklearn-small-model',
      'modules.pythonNotebook.sections.sklearnSmallModel.title',
      loc(
        `现在把 NumPy 和 pandas 接到 sklearn。目标很朴素：sklearn 训练一个小模型，不追求分数漂亮，只追求把训练流程跑通。

### 一个最小线性回归
~~~python
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error

features = ["median_income"]
target = "median_house_value"

X = df[features]
y = df[target]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

model = LinearRegression()
model.fit(X_train, y_train)

pred = model.predict(X_test)
mae = mean_absolute_error(y_test, pred)
~~~

### 每一行在做什么
\`train_test_split\` 先把练习题和考试题分开。\`LinearRegression\` 创建模型。\`fit\` 只看训练集。\`predict\` 在测试集上输出预测。\`mean_absolute_error\` 把预测和真实房价的平均偏差算出来。

老师会先问：你有没有在划分之后才训练？有没有把测试集拿去 fit？如果这两个问题答不清，模型分数先不要相信。

### 小模型的价值
第一个模型不一定要强。它的作用是 baseline：以后你换特征、换清洗策略、换模型，都要先问有没有超过这个最简单版本。

### Ref ID
REF-SKLEARN-GETTING-STARTED、REF-SKLEARN-LINEAR-MODELS、REF-INRIA-SKLEARN-MOOC`,
        `Now connect NumPy and pandas to sklearn. Train a small model first. The goal is not a beautiful score, but a complete training workflow.

### A minimal linear regression
~~~python
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error

features = ["median_income"]
target = "median_house_value"

X = df[features]
y = df[target]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

model = LinearRegression()
model.fit(X_train, y_train)

pred = model.predict(X_test)
mae = mean_absolute_error(y_test, pred)
~~~

### What each line does
\`train_test_split\` separates practice questions from exam questions. \`LinearRegression\` creates the model. \`fit\` sees only the training set. \`predict\` produces test predictions. \`mean_absolute_error\` computes the average prediction miss.

Ask whether training happened after the split and whether the test set was used in fit. If those answers are unclear, do not trust the score yet.

### Why small models matter
The first model does not need to be strong. It is the baseline. Later, when you change features, cleaning, or model family, ask whether you actually beat this simple version.

### Ref ID
REF-SKLEARN-GETTING-STARTED, REF-SKLEARN-LINEAR-MODELS, REF-INRIA-SKLEARN-MOOC`,
      ),
      loc(
        '第一个 sklearn 模型的目标是跑通 split、fit、predict、metric，而不是立刻追求高分。',
        'The first sklearn model is about split, fit, predict, and metric, not chasing a high score.',
      ),
      loc(
        '在右侧 notebook cell 中找到 split、fit、predict、metric 四步，说明每一步不能和哪一步混在一起。',
        'Find split, fit, predict, and metric in the notebook cells, then explain which steps must stay separate.',
      ),
    ),
    chapter(
      'reproducible-handoff',
      'modules.pythonNotebook.sections.reproducibleHandoff.title',
      loc(
        `能运行一次不算复现。能关掉 notebook、重新打开、从上到下运行，得到同样结构的结果，才算进入下一章项目。

### 交付前自查
- 数据从哪里来？是手写、CSV，还是 sklearn dataset？
- 随机划分有没有 \`random_state\`？
- 特征列和目标列有没有写清楚？
- \`fit\` 有没有只在训练数据上发生？
- 指标有没有说明单位和含义？
- markdown cell 有没有写出观察，而不是只留下代码？

### 一个老师会接受的结尾
“这个 baseline 只用了 median_income 一个特征。测试集 MAE 仍然很高，说明单一特征解释不了全部房价差异。下一步应该加入更多数值列，检查缺失值，再考虑类别列和 Pipeline。”

这段话比一个孤零零的分数有用，因为它说明了实验边界和下一步。

### Ref ID
REF-NUMPY-BEGINNER、REF-PANDAS-GETTING-STARTED、REF-SKLEARN-GETTING-STARTED、REF-PYTHON-DS-HANDBOOK`,
        `Running once is not reproducibility. Closing the notebook, reopening it, running from top to bottom, and getting the same kind of result is the standard for moving into the next project.

### Handoff checklist
- Where does the data come from: handwritten values, CSV, or an sklearn dataset?
- Does the random split have \`random_state\`?
- Are feature columns and target columns named clearly?
- Does \`fit\` happen only on training data?
- Does the metric explain its unit and meaning?
- Do markdown cells record observations, not only code?

### A useful ending
"This baseline uses only median_income. Test MAE is still high, so one feature cannot explain all housing-price variation. Next, add more numeric columns, inspect missing values, then consider categorical columns and Pipeline."

That is more useful than a lonely score because it states the experiment boundary and the next step.

### Ref ID
REF-NUMPY-BEGINNER, REF-PANDAS-GETTING-STARTED, REF-SKLEARN-GETTING-STARTED, REF-PYTHON-DS-HANDBOOK`,
      ),
      loc(
        '复现实验的交付物不是一串 cell，而是一段能解释数据、模型、指标和下一步的记录。',
        'The deliverable is not a stack of cells. It is a record that explains data, model, metric, and next step.',
      ),
      loc(
        '用右侧 checklist 检查 notebook 是否能从头运行，并指出最容易出错的一个环节。',
        'Use the checklist on the right to verify whether the notebook can run top to bottom and identify the most fragile step.',
      ),
    ),
  ],
  controls: [],
  presets: [],
  sourceNote: loc(
    '统一资料入口：REF-NUMPY-BEGINNER、REF-PANDAS-GETTING-STARTED、REF-PYTHON-DS-HANDBOOK、REF-SKLEARN-GETTING-STARTED。',
    'Centralized references: REF-NUMPY-BEGINNER, REF-PANDAS-GETTING-STARTED, REF-PYTHON-DS-HANDBOOK, REF-SKLEARN-GETTING-STARTED.',
  ),
  createDefaultConfig: () => ({
    playbackMs: 900,
  }),
  simulate: simulatePythonNotebook,
}
