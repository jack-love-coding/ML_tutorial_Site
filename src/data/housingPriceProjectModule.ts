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

function simulateHousingProject(): ModuleSimulation {
  return {
    snapshots: [
      {
        step: 0,
        loss: 0,
        accuracy: 0,
        derivedMetrics: {
          moduleType: 'end-to-end-project',
          referenceIds: [
            'REF-INRIA-NUMERICAL-PIPELINE',
            'REF-SKLEARN-CALIFORNIA-HOUSING',
            'REF-SKLEARN-COLUMN-TRANSFORMER',
            'REF-SKLEARN-COMMON-PITFALLS',
            'REF-SKLEARN-LINEAR-MODELS',
          ],
        },
      },
    ],
  }
}

export const housingPriceProjectModule: AlgorithmModuleDefinition = {
  slug: 'housing-price-project',
  route: '/learn/housing-price-project',
  titleKey: 'modules.housingPriceProject.title',
  kickerKey: 'modules.housingPriceProject.kicker',
  introKey: 'modules.housingPriceProject.intro',
  summaryKey: 'modules.housingPriceProject.summary',
  theme: '#fff7ed',
  accent: '#d97706',
  checkpoints: algorithmCheckpointsBySlug['housing-price-project'],
  chapters: [
    chapter(
      'csv-to-frame',
      'modules.housingPriceProject.sections.csvToFrame.title',
      loc(
        `这一章只做一件事：把第一个端到端项目走完整。路线先写在最前面：

**CSV -> EDA -> 清洗 -> 线性回归 -> 评估 -> 复盘**

### 从房价预测开始
房价预测适合作为第一个项目，因为问题足够具体：给定一个地区的收入、房龄、房间数、地理信息等特征，预测房价。它也是回归任务，和前面线性回归章节能接上。

如果用 sklearn 的 California housing 数据集，可以先把它整理成类似 CSV 的 DataFrame，再按项目方式读取：

~~~python
import pandas as pd
from sklearn.datasets import fetch_california_housing

housing = fetch_california_housing(as_frame=True)
df = housing.frame
df.to_csv("housing.csv", index=False)

df = pd.read_csv("housing.csv")
df.shape
df.head()
~~~

### 老师会先问
目标列是哪一列？每一行代表一个什么样本？特征有没有可能在现实里不可获得？如果业务问题都没说清楚，模型训练再顺也只是技术演示。

### 想一想
CSV 不是项目起点的全部。真正的起点是问题定义：我们预测的是哪个时间点、哪个区域、哪种房价，预测结果准备给谁用？

### Ref ID
REF-SKLEARN-CALIFORNIA-HOUSING、REF-INRIA-SKLEARN-MOOC`,
        `This chapter does one thing: walk through the first end-to-end project. Keep the route visible:

**CSV -> EDA -> cleaning -> linear regression -> evaluation -> review**

### Start with housing-price prediction
Housing-price prediction is a useful first project because the problem is concrete: given features such as income, house age, room counts, and geography, predict a house-value target. It is a regression task, so it connects to the linear regression chapter.

With sklearn's California housing dataset, you can first turn the dataset into a CSV-like DataFrame and then read it as a project file:

~~~python
import pandas as pd
from sklearn.datasets import fetch_california_housing

housing = fetch_california_housing(as_frame=True)
df = housing.frame
df.to_csv("housing.csv", index=False)

df = pd.read_csv("housing.csv")
df.shape
df.head()
~~~

### Teacher question
Which column is the target? What does each row represent? Could every feature be available in the real use case? If the problem is unclear, smooth training is only a technical demo.

### Think about it
CSV is not the whole project starting point. The real starting point is problem definition: what time, what region, what target, and who will use the prediction?

### Ref ID
REF-SKLEARN-CALIFORNIA-HOUSING, REF-INRIA-SKLEARN-MOOC`,
      ),
      loc(
        '先把项目路线写清楚：CSV -> EDA -> 清洗 -> 线性回归 -> 评估 -> 复盘。',
        'Start by making the project route explicit: CSV -> EDA -> cleaning -> linear regression -> evaluation -> review.',
      ),
      loc(
        '看右侧项目流水线，先指出 CSV 读入后最应该确认的三件事：行、列、目标。',
        'Use the project pipeline on the right to name the first three checks after reading CSV: rows, columns, target.',
      ),
    ),
    chapter(
      'eda-first-pass',
      'modules.housingPriceProject.sections.edaFirstPass.title',
      loc(
        `EDA 不是漂亮图表集合。它是在训练前问数据：“你大概长什么样？哪里可能会坑我？”

### 第一轮 EDA 做什么
~~~python
df.info()
df.describe()
df.isna().sum()
df["MedHouseVal"].hist()
df.plot.scatter(x="MedInc", y="MedHouseVal", alpha=0.2)
~~~

这一轮先看四类信号：

- **规模**：多少行、多少列，够不够训练和测试。
- **类型**：数值列、类别列、目标列分别是什么。
- **缺失和异常**：哪些列有空值，分布有没有奇怪尖峰。
- **关系**：收入、房龄、位置和房价有没有明显联系。

### 老师会先问
你看到的每张图，能不能转成一句建模判断？比如“房价目标有上限截断迹象，所以 MAE 和残差图要重点看高价区域”。如果图只停留在好看，它还没有进入项目。

### Ref ID
REF-INRIA-NUMERICAL-PIPELINE、REF-PANDAS-GETTING-STARTED、REF-SKLEARN-CALIFORNIA-HOUSING`,
        `EDA is not a gallery of attractive charts. It asks the data what it looks like and where it may mislead you.

### First-pass EDA
~~~python
df.info()
df.describe()
df.isna().sum()
df["MedHouseVal"].hist()
df.plot.scatter(x="MedInc", y="MedHouseVal", alpha=0.2)
~~~

The first pass checks four signals:

- **Scale**: how many rows and columns, and whether that is enough for training and testing.
- **Type**: which columns are numeric, categorical, and target.
- **Missing and unusual values**: where nulls exist and whether distributions have strange spikes.
- **Relationships**: whether income, age, location, and value show visible links.

### Teacher question
Can each chart become one modeling decision? For example: "The target appears capped, so MAE and residual plots deserve attention in high-value regions." If a chart only looks nice, it has not joined the project yet.

### Ref ID
REF-INRIA-NUMERICAL-PIPELINE, REF-PANDAS-GETTING-STARTED, REF-SKLEARN-CALIFORNIA-HOUSING`,
      ),
      loc(
        'EDA 的结果要能变成建模决定，否则只是截图。',
        'EDA should become modeling decisions. Otherwise it is only screenshots.',
      ),
      loc(
        '在右侧 EDA 阶段卡里，挑一个检查项说明它会影响清洗、特征还是评估。',
        'Pick one EDA stage card on the right and explain whether it affects cleaning, features, or evaluation.',
      ),
    ),
    chapter(
      'cleaning-splits',
      'modules.housingPriceProject.sections.cleaningSplits.title',
      loc(
        `清洗最容易犯的错，是在切分数据前就把全体数据拿来学习规则。这样会发生数据泄漏。

### 先切分，再学习清洗规则
~~~python
from sklearn.model_selection import train_test_split

X = df.drop(columns=["MedHouseVal"])
y = df["MedHouseVal"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)
~~~

划分之后，训练集才可以用来学习均值、中位数、缩放参数、类别词表。测试集只能用训练集学到的规则做 \`transform\`。

### fit_transform 和 transform 的区别
\`fit_transform\` 是“学习规则并应用规则”。\`transform\` 是“只应用已经学到的规则”。在训练集上可以 \`fit_transform\`，在测试集上应该只 \`transform\`。

~~~python
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

numeric_features = ["MedInc", "HouseAge", "AveRooms", "AveOccup"]

numeric_pipeline = Pipeline([
    ("imputer", SimpleImputer(strategy="median")),
    ("scaler", StandardScaler()),
])

preprocess = ColumnTransformer([
    ("num", numeric_pipeline, numeric_features),
])

X_train_ready = preprocess.fit_transform(X_train)
X_test_ready = preprocess.transform(X_test)
~~~

### 想一想
如果你用全体数据的中位数填补训练集缺失值，测试集的信息已经悄悄进入训练过程。分数可能变好，但那不是模型更聪明，是实验不干净。

### Ref ID
REF-SKLEARN-COLUMN-TRANSFORMER、REF-SKLEARN-COMMON-PITFALLS、REF-INRIA-NUMERICAL-PIPELINE`,
        `The most common cleaning mistake is learning preprocessing rules from all data before splitting. That creates data leakage.

### Split first, then learn cleaning rules
~~~python
from sklearn.model_selection import train_test_split

X = df.drop(columns=["MedHouseVal"])
y = df["MedHouseVal"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)
~~~

After the split, only the training set should learn medians, scaling parameters, and category vocabularies. The test set should only receive \`transform\` using rules learned from training data.

### fit_transform versus transform
\`fit_transform\` means learn rules and apply them. \`transform\` means only apply already learned rules. Use \`fit_transform\` on training data and \`transform\` on test data.

~~~python
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

numeric_features = ["MedInc", "HouseAge", "AveRooms", "AveOccup"]

numeric_pipeline = Pipeline([
    ("imputer", SimpleImputer(strategy="median")),
    ("scaler", StandardScaler()),
])

preprocess = ColumnTransformer([
    ("num", numeric_pipeline, numeric_features),
])

X_train_ready = preprocess.fit_transform(X_train)
X_test_ready = preprocess.transform(X_test)
~~~

### Think about it
If you fill training missing values using the median of the full dataset, test information has entered training. The score may improve, but that is not a smarter model. It is a dirty experiment.

### Ref ID
REF-SKLEARN-COLUMN-TRANSFORMER, REF-SKLEARN-COMMON-PITFALLS, REF-INRIA-NUMERICAL-PIPELINE`,
      ),
      loc(
        '清洗规则只能从训练集学习。测试集是用来检验的，不是用来帮你调清洗策略的。',
        'Cleaning rules must be learned from training data. Test data checks the project; it should not help tune cleaning.',
      ),
      loc(
        '在右侧 pipeline 中指出哪一步可以 fit，哪一步只能 transform。',
        'Use the pipeline on the right to identify where fitting is allowed and where only transform is allowed.',
      ),
    ),
    chapter(
      'linear-baseline',
      'modules.housingPriceProject.sections.linearBaseline.title',
      loc(
        `线性回归是第一个 baseline。它不一定最强，但它足够透明，能让你看清项目有没有跑通。

### 用 Pipeline 把预处理和模型绑在一起
~~~python
from sklearn.linear_model import LinearRegression
from sklearn.pipeline import Pipeline

model = Pipeline([
    ("preprocess", preprocess),
    ("regressor", LinearRegression()),
])

model.fit(X_train, y_train)
pred = model.predict(X_test)
~~~

Pipeline 的好处，是把“先清洗再训练”变成一个整体。之后你做交叉验证、调参或换模型，预处理不会散落在 notebook 的不同 cell 里。

### 老师会先问
这个 baseline 输在哪里？是特征太少，关系不够线性，还是目标本身噪声很大？不要急着换复杂模型，先说清楚简单模型失败的原因。

### Ref ID
REF-SKLEARN-LINEAR-MODELS、REF-SKLEARN-COLUMN-TRANSFORMER、REF-INRIA-NUMERICAL-PIPELINE`,
        `Linear regression is the first baseline. It may not be strongest, but it is transparent enough to show whether the project workflow is sound.

### Bind preprocessing and model with Pipeline
~~~python
from sklearn.linear_model import LinearRegression
from sklearn.pipeline import Pipeline

model = Pipeline([
    ("preprocess", preprocess),
    ("regressor", LinearRegression()),
])

model.fit(X_train, y_train)
pred = model.predict(X_test)
~~~

Pipeline turns preprocessing and training into one object. Later, when you cross-validate, tune, or replace the model, preprocessing does not scatter across notebook cells.

### Teacher question
Where does this baseline fail? Are features too weak, is the relationship not linear, or is the target noisy? Do not rush to a complex model before explaining why the simple one fails.

### Ref ID
REF-SKLEARN-LINEAR-MODELS, REF-SKLEARN-COLUMN-TRANSFORMER, REF-INRIA-NUMERICAL-PIPELINE`,
      ),
      loc(
        'baseline 的价值不是高分，而是给后续改动一个诚实参照。',
        'A baseline is not about a high score. It gives later changes an honest reference point.',
      ),
      loc(
        '看右侧线性回归阶段，说明 Pipeline 为什么比散落的预处理 cell 更安全。',
        'Use the linear regression stage on the right to explain why Pipeline is safer than scattered preprocessing cells.',
      ),
    ),
    chapter(
      'evaluation',
      'modules.housingPriceProject.sections.evaluation.title',
      loc(
        `评估不是只看一个分数。房价预测至少要同时看 MAE、R² 和错误样本。

### 基本评估代码
~~~python
from sklearn.metrics import mean_absolute_error, r2_score

pred = model.predict(X_test)
mae = mean_absolute_error(y_test, pred)
r2 = r2_score(y_test, pred)

errors = pd.DataFrame({
    "actual": y_test,
    "pred": pred,
    "error": y_test - pred,
})
errors["abs_error"] = errors["error"].abs()
errors.sort_values("abs_error", ascending=False).head()
~~~

### 指标怎么读
MAE 告诉你平均差多少，单位和目标一致。R² 告诉你模型比“总猜平均值”解释了多少方差。两者都要看，因为一个有业务单位，一个给出整体解释能力。

### 老师会先问
误差最大的样本集中在哪些区域？高价房是不是预测偏低？低收入区域是不是系统性偏差更大？如果你只报 MAE，不看错误样本，项目还没有复盘。

### Ref ID
REF-SKLEARN-LINEAR-MODELS、REF-INRIA-NUMERICAL-PIPELINE、REF-SKLEARN-USER-GUIDE`,
        `Evaluation is not one score. Housing-price prediction should look at MAE, R², and error cases together.

### Basic evaluation code
~~~python
from sklearn.metrics import mean_absolute_error, r2_score

pred = model.predict(X_test)
mae = mean_absolute_error(y_test, pred)
r2 = r2_score(y_test, pred)

errors = pd.DataFrame({
    "actual": y_test,
    "pred": pred,
    "error": y_test - pred,
})
errors["abs_error"] = errors["error"].abs()
errors.sort_values("abs_error", ascending=False).head()
~~~

### Reading the metrics
MAE tells you the average miss in the same unit as the target. R² tells you how much variance the model explains compared with always predicting the mean. Read both because one has business units and one summarizes explanatory power.

### Teacher question
Where are the largest errors? Are high-value homes underpredicted? Are low-income regions systematically worse? If you report MAE without inspecting error cases, the project has not been reviewed.

### Ref ID
REF-SKLEARN-LINEAR-MODELS, REF-INRIA-NUMERICAL-PIPELINE, REF-SKLEARN-USER-GUIDE`,
      ),
      loc(
        '评估要同时看业务单位、整体解释力和错误样本。',
        'Evaluation should combine business-unit error, overall explanatory power, and error cases.',
      ),
      loc(
        '在右侧评估阶段，指出 MAE、R² 和最大误差样本各回答什么问题。',
        'Use the evaluation stage on the right to say what MAE, R², and largest-error cases each answer.',
      ),
    ),
    chapter(
      'review-next-iteration',
      'modules.housingPriceProject.sections.reviewNextIteration.title',
      loc(
        `复盘不是写一句“模型表现一般”。复盘要把下一步说具体。

### 一个可执行的复盘
你可以这样写：

“当前 Pipeline 使用数值列和 LinearRegression。MAE 说明平均误差仍然偏大，R² 说明线性关系只能解释一部分变化。误差样本显示高价区域预测偏低。下一轮先检查目标截断和地理特征，再尝试加入更多特征或 Ridge/Lasso，最后用交叉验证比较稳定性。”

### 下一轮可以改什么
- **数据**：更多特征、异常值处理、目标变换。
- **预处理**：数值缩放、类别编码、缺失值策略。
- **模型**：Ridge、Lasso、树模型或集成模型。
- **评估**：交叉验证、分组误差、残差图。

### 想一想
如果每次改动都同时改数据、特征、模型和指标，你很难知道是哪一步带来了变化。第一批项目要学会慢一点，一次只改一两件事。

### Ref ID
REF-SKLEARN-COMMON-PITFALLS、REF-SKLEARN-CV、REF-SKLEARN-LINEAR-MODELS`,
        `A review is not "the model is okay." A review should make the next step concrete.

### An actionable review
You can write:

"The current Pipeline uses numeric columns and LinearRegression. MAE shows the average error is still large, and R² shows a linear relationship explains only part of the variation. Error cases suggest high-value regions are underpredicted. Next, inspect target capping and geography, then try more features or Ridge/Lasso, and compare stability with cross-validation."

### What to change next
- **Data**: more features, outlier handling, target transformation.
- **Preprocessing**: scaling, categorical encoding, missing-value policy.
- **Model**: Ridge, Lasso, tree models, or ensembles.
- **Evaluation**: cross-validation, group-wise error, residual plots.

### Think about it
If every iteration changes data, features, model, and metric at the same time, you will not know what caused the change. Early projects should move more slowly: change one or two things at a time.

### Ref ID
REF-SKLEARN-COMMON-PITFALLS, REF-SKLEARN-CV, REF-SKLEARN-LINEAR-MODELS`,
      ),
      loc(
        '复盘必须能推出下一步实验，否则它只是项目总结。',
        'A review must lead to the next experiment. Otherwise it is only a summary.',
      ),
      loc(
        '跟着右侧复盘卡，把下一轮改动分成数据、预处理、模型和评估四类。',
        'Use the review cards on the right to group next changes into data, preprocessing, model, and evaluation.',
      ),
    ),
  ],
  controls: [],
  presets: [],
  sourceNote: loc(
    '统一资料入口：REF-INRIA-NUMERICAL-PIPELINE、REF-SKLEARN-CALIFORNIA-HOUSING、REF-SKLEARN-COLUMN-TRANSFORMER、REF-SKLEARN-COMMON-PITFALLS、REF-SKLEARN-LINEAR-MODELS。',
    'Centralized references: REF-INRIA-NUMERICAL-PIPELINE, REF-SKLEARN-CALIFORNIA-HOUSING, REF-SKLEARN-COLUMN-TRANSFORMER, REF-SKLEARN-COMMON-PITFALLS, REF-SKLEARN-LINEAR-MODELS.',
  ),
  createDefaultConfig: () => ({
    playbackMs: 900,
  }),
  simulate: simulateHousingProject,
}
