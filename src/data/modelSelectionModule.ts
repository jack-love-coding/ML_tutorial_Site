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

function simulateModelSelection(): ModuleSimulation {
  return {
    snapshots: [
      {
        step: 0,
        loss: 0,
        accuracy: 0,
        derivedMetrics: {
          moduleType: 'model-selection-cross-validation',
          referenceIds: [
            'REF-SKLEARN-CV',
            'REF-SKLEARN-GRIDSEARCHCV',
            'REF-SKLEARN-COMMON-PITFALLS',
            'REF-INRIA-SKLEARN-MOOC',
          ],
        },
      },
    ],
  }
}

export const modelSelectionModule: AlgorithmModuleDefinition = {
  slug: 'model-selection',
  route: '/learn/model-selection',
  titleKey: 'modules.modelSelection.title',
  kickerKey: 'modules.modelSelection.kicker',
  introKey: 'modules.modelSelection.intro',
  summaryKey: 'modules.modelSelection.summary',
  theme: '#eef2ff',
  accent: '#4f46e5',
  checkpoints: algorithmCheckpointsBySlug['model-selection'],
  chapters: [
    chapter(
      'one-split-risk',
      'modules.modelSelection.sections.oneSplitRisk.title',
      loc(
        `模型选择的第一条规则：不要把一次 train/test split 当成最终真理。

同一个模型、同一批数据，只要随机切分不同，测试分数就可能上下波动。数据少、类别不平衡、异常值集中或样本顺序有结构时，这种波动会更明显。

### 为什么一次 split 会骗你
假设房价数据里有少量特别贵的区域。如果这批样本刚好更多进入 test set，MAE 会变大；如果它们更多进入 train set，模型可能更容易学到这些区域，测试分数又会变好。模型没有突然变聪明，评价样本变了。

~~~python
from sklearn.model_selection import train_test_split
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_absolute_error

scores = []
for seed in range(5):
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=seed
    )
    model = Ridge(alpha=1.0)
    model.fit(X_train, y_train)
    pred = model.predict(X_test)
    scores.append(mean_absolute_error(y_test, pred))

scores
~~~

### 老师会先问
你看到的是模型差异，还是切分运气？如果只跑一次 split，就很难回答这个问题。

### Ref ID
REF-SKLEARN-CV、REF-INRIA-SKLEARN-MOOC`,
        `The first rule of model selection: do not treat one train/test split as final truth.

With the same model and the same dataset, test scores can move when the random split changes. The movement becomes larger when the dataset is small, classes are imbalanced, outliers cluster, or sample order has structure.

### Why one split can mislead
Suppose a housing dataset contains a small number of very expensive regions. If more of those rows land in the test set, MAE rises; if more land in training, the model may learn them and test score improves. The model did not suddenly become smarter. The evaluation sample changed.

~~~python
from sklearn.model_selection import train_test_split
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_absolute_error

scores = []
for seed in range(5):
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=seed
    )
    model = Ridge(alpha=1.0)
    model.fit(X_train, y_train)
    pred = model.predict(X_test)
    scores.append(mean_absolute_error(y_test, pred))

scores
~~~

### Teacher question
Are you seeing a model difference, or split luck? If you run only one split, that question is hard to answer.

### Ref ID
REF-SKLEARN-CV, REF-INRIA-SKLEARN-MOOC`,
      ),
      loc(
        '一次 split 只是一次抽样。模型选择要看分数是否稳定，而不是只看某个幸运分数。',
        'One split is one sample. Model selection should ask whether the score is stable, not whether one lucky score looks good.',
      ),
      loc(
        '在右侧流程里先看 split 阶段：同一个模型换 5 个 random_state，分数为什么会波动？',
        'Use the split stage on the right: why can the same model get different scores under five random_state values?',
      ),
    ),
    chapter(
      'validation-role',
      'modules.modelSelection.sections.validationRole.title',
      loc(
        `模型选择需要把“训练参数”“挑模型”“最终估计泛化”分开。最朴素的做法是 train / validation / test 三段式。

### 三份数据各做什么
- **train**：学习模型参数，例如线性模型的权重。
- **validation**：比较模型族、超参数、阈值和特征方案。
- **test**：最后只用一次，用来估计选定流程的泛化表现。

如果你在 test set 上反复比较 Ridge、Lasso、树模型和阈值，test set 就已经变成了 validation set。最后分数会越来越像“对这套 test set 的适应”，而不是对新数据的估计。

~~~python
X_dev, X_test, y_dev, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

X_train, X_valid, y_train, y_valid = train_test_split(
    X_dev, y_dev, test_size=0.25, random_state=42
)
~~~

### 想一想
开发集 dev 可以被你反复用来训练和选择；test set 像封好的期末卷。只有当选择已经结束，才打开它。

### Ref ID
REF-SKLEARN-CV、REF-SKLEARN-COMMON-PITFALLS`,
        `Model selection needs to separate parameter fitting, model choice, and final generalization estimation. The simplest version is train / validation / test.

### What each split does
- **train**: learn model parameters, such as linear weights.
- **validation**: compare model families, hyperparameters, thresholds, and feature plans.
- **test**: use once at the end to estimate generalization for the selected workflow.

If you repeatedly compare Ridge, Lasso, tree models, and thresholds on the test set, the test set has become a validation set. The final score becomes adaptation to that test set rather than an estimate on new data.

~~~python
X_dev, X_test, y_dev, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

X_train, X_valid, y_train, y_valid = train_test_split(
    X_dev, y_dev, test_size=0.25, random_state=42
)
~~~

### Think about it
The development set can be used repeatedly for training and selection; the test set is a sealed final exam. Open it only after selection has ended.

### Ref ID
REF-SKLEARN-CV, REF-SKLEARN-COMMON-PITFALLS`,
      ),
      loc(
        'validation 是用来做选择的，test 是用来做最后估计的。两者混用，分数就不再诚实。',
        'Validation is for choices; test is for the final estimate. Mixing them makes the score dishonest.',
      ),
      loc(
        '在右侧 validation 阶段，把 train、validation、test 分别放到“学习、选择、最终估计”三个位置。',
        'Use the validation stage to place train, validation, and test under fitting, choosing, and final estimation.',
      ),
    ),
    chapter(
      'cross-validation',
      'modules.modelSelection.sections.crossValidation.title',
      loc(
        `交叉验证把“只用一个 validation set”改成“轮流做多次验证”。这样既能看到平均表现，也能看到稳定性。

### K-fold CV 的直觉
把开发集分成 K 份。每一轮拿其中 1 份做验证，其余 K-1 份做训练。最后把 K 个分数取平均，也看标准差。

~~~python
from sklearn.model_selection import cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import Ridge

model = make_pipeline(StandardScaler(), Ridge(alpha=1.0))

scores = cross_val_score(
    model,
    X_dev,
    y_dev,
    cv=5,
    scoring="neg_mean_absolute_error",
)

mae_scores = -scores
mae_scores.mean(), mae_scores.std()
~~~

### 为什么要看 std
平均分告诉你模型通常怎样；标准差告诉你它对数据切分是否敏感。两个模型平均分接近时，稳定性更好的那个往往更值得继续检查。

### Ref ID
REF-SKLEARN-CV、REF-INRIA-SKLEARN-MOOC`,
        `Cross-validation changes "use one validation set" into "validate several times by rotation." This shows both average performance and stability.

### K-fold CV intuition
Split the development set into K parts. In each round, one part is validation and the other K-1 parts are training. Average the K scores and inspect the standard deviation.

~~~python
from sklearn.model_selection import cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import Ridge

model = make_pipeline(StandardScaler(), Ridge(alpha=1.0))

scores = cross_val_score(
    model,
    X_dev,
    y_dev,
    cv=5,
    scoring="neg_mean_absolute_error",
)

mae_scores = -scores
mae_scores.mean(), mae_scores.std()
~~~

### Why inspect std
The mean tells you typical performance; the standard deviation tells you how sensitive the workflow is to data splits. When two models have similar mean scores, the more stable one often deserves a closer look.

### Ref ID
REF-SKLEARN-CV, REF-INRIA-SKLEARN-MOOC`,
      ),
      loc(
        '交叉验证不只是多跑几次。它让你同时看到平均表现和切分敏感度。',
        'Cross-validation is not merely running more times. It reveals average performance and split sensitivity together.',
      ),
      loc(
        '在右侧 CV 阶段，解释 5 个 fold 分数里 mean 和 std 分别回答什么问题。',
        'Use the CV stage to explain what the mean and std of five fold scores answer.',
      ),
    ),
    chapter(
      'pipeline-leakage',
      'modules.modelSelection.sections.pipelineLeakage.title',
      loc(
        `交叉验证最容易被数据泄漏污染的地方，是预处理。错误流程通常是：先对全体数据 \`fit_transform\`，再做 CV。正确流程是：把预处理放进 Pipeline，让每一折只在训练折里 \`fit\`。

### 错误流程：先全量缩放
~~~python
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import cross_val_score

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X_dev)

scores = cross_val_score(Ridge(alpha=1.0), X_scaled, y_dev, cv=5)
~~~

这里的 \`scaler.fit_transform(X_dev)\` 已经看过所有开发集，包括每一轮本应被留出的验证折。

### 正确流程：Pipeline 内部学习规则
~~~python
from sklearn.pipeline import make_pipeline

model = make_pipeline(StandardScaler(), Ridge(alpha=1.0))
scores = cross_val_score(model, X_dev, y_dev, cv=5)
~~~

Pipeline 会在每一折中重新 fit scaler 和模型。验证折只被 transform，不参与学习缩放参数。

### 老师会先问
每个会学习规则的步骤，到底是在训练折里 fit，还是提前看过了验证折？这是判断泄漏的核心问题。

### Ref ID
REF-SKLEARN-COMMON-PITFALLS、REF-SKLEARN-CV`,
        `The easiest way to contaminate cross-validation is preprocessing. The wrong workflow is to \`fit_transform\` all data first, then run CV. The correct workflow is to put preprocessing inside a Pipeline so each fold fits only on its training part.

### Wrong workflow: scale all data first
~~~python
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import cross_val_score

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X_dev)

scores = cross_val_score(Ridge(alpha=1.0), X_scaled, y_dev, cv=5)
~~~

Here \`scaler.fit_transform(X_dev)\` has already seen the whole development set, including the validation fold that should be held out in each round.

### Correct workflow: learn rules inside Pipeline
~~~python
from sklearn.pipeline import make_pipeline

model = make_pipeline(StandardScaler(), Ridge(alpha=1.0))
scores = cross_val_score(model, X_dev, y_dev, cv=5)
~~~

Pipeline refits the scaler and model inside each fold. The validation fold is transformed only; it does not help learn scaling parameters.

### Teacher question
For every step that learns rules, did it fit inside the training fold, or did it already see the validation fold? That is the core leakage question.

### Ref ID
REF-SKLEARN-COMMON-PITFALLS, REF-SKLEARN-CV`,
      ),
      loc(
        'CV 只可靠到每一折的隔离可靠。预处理如果提前看过验证折，CV 分数就会偏乐观。',
        'CV is only as reliable as fold isolation. If preprocessing saw the validation fold early, CV scores become too optimistic.',
      ),
      loc(
        '在右侧 leakage 阶段，对比“全量缩放再 CV”和“Pipeline 内部 CV”，指出哪一步泄漏。',
        'Use the leakage stage to compare scale-before-CV with Pipeline-inside-CV and identify the leaking step.',
      ),
    ),
    chapter(
      'grid-search',
      'modules.modelSelection.sections.gridSearch.title',
      loc(
        `GridSearchCV 把“手动试几个超参数”变成可复查的搜索流程。它会对每组参数做交叉验证，再用平均分选择候选。

### 用参数网格搜索 Ridge
~~~python
from sklearn.model_selection import GridSearchCV

pipe = make_pipeline(StandardScaler(), Ridge())

param_grid = {
    "ridge__alpha": [0.01, 0.1, 1.0, 10.0, 100.0],
}

search = GridSearchCV(
    pipe,
    param_grid=param_grid,
    cv=5,
    scoring="neg_mean_absolute_error",
)

search.fit(X_dev, y_dev)
search.best_params_
-search.best_score_
~~~

### 从表格到热力图
\`cv_results_\` 里保存了每组参数的 \`mean_test_score\`、\`std_test_score\` 和排名。如果有两个超参数，可以把它们做成 grid search 热力图：横轴一个超参数，纵轴另一个超参数，颜色表示 CV 分数。

### 想一想
GridSearchCV 选择的是“在这组候选和这套 CV 规则下最好的参数”。它不代表宇宙最优，也不代表你可以继续偷看 test set。

### Ref ID
REF-SKLEARN-GRIDSEARCHCV、REF-SKLEARN-CV`,
        `GridSearchCV turns "try a few hyperparameters manually" into an auditable search workflow. It cross-validates each parameter set and chooses candidates by mean score.

### Searching Ridge parameters
~~~python
from sklearn.model_selection import GridSearchCV

pipe = make_pipeline(StandardScaler(), Ridge())

param_grid = {
    "ridge__alpha": [0.01, 0.1, 1.0, 10.0, 100.0],
}

search = GridSearchCV(
    pipe,
    param_grid=param_grid,
    cv=5,
    scoring="neg_mean_absolute_error",
)

search.fit(X_dev, y_dev)
search.best_params_
-search.best_score_
~~~

### From table to heatmap
\`cv_results_\` stores \`mean_test_score\`, \`std_test_score\`, and ranking for every parameter set. With two hyperparameters, this can become a grid-search heatmap: one hyperparameter on the x-axis, one on the y-axis, and color as CV score.

### Think about it
GridSearchCV chooses the best parameter under this candidate grid and this CV rule. It is not universal optimality, and it does not give permission to keep peeking at the test set.

### Ref ID
REF-SKLEARN-GRIDSEARCHCV, REF-SKLEARN-CV`,
      ),
      loc(
        'Grid search 的价值是可复查：候选参数、CV 规则、评分函数和选择结果都写在明处。',
        'Grid search is valuable because it is auditable: candidate parameters, CV rule, scoring function, and selection result are explicit.',
      ),
      loc(
        '在右侧 grid 阶段，指出 param_grid、mean_test_score、best_params_ 分别代表什么。',
        'Use the grid stage to explain what param_grid, mean_test_score, and best_params_ represent.',
      ),
    ),
    chapter(
      'final-refit',
      'modules.modelSelection.sections.finalRefit.title',
      loc(
        `模型选择结束后，才轮到最终测试。不要把 test set 拿来继续挑参数。

### 最终评估怎么写
默认情况下，\`GridSearchCV(refit=True)\` 会用开发集重新训练最佳参数对应的 Pipeline。然后你只在 test set 上评估一次。

~~~python
from sklearn.metrics import mean_absolute_error

best_model = search.best_estimator_
test_pred = best_model.predict(X_test)
test_mae = mean_absolute_error(y_test, test_pred)

summary = {
    "best_params": search.best_params_,
    "cv_mae": -search.best_score_,
    "test_mae": test_mae,
}
summary
~~~

### 复盘要看三个信号
- **CV mean**：开发集上平均表现如何。
- **CV std**：分数是否对切分敏感。
- **test score**：最终保留样本上的一次估计是否和 CV 大致一致。

如果 test 分数明显差很多，先不要立刻继续调 test。回到数据、切分策略、特征和错误样本，写出新的实验计划。

### Ref ID
REF-SKLEARN-GRIDSEARCHCV、REF-SKLEARN-COMMON-PITFALLS、REF-INRIA-SKLEARN-MOOC`,
        `Only after model selection ends does final testing begin. Do not use the test set to keep choosing parameters.

### Writing final evaluation
By default, \`GridSearchCV(refit=True)\` retrains the best-parameter Pipeline on the development set. Then evaluate once on the test set.

~~~python
from sklearn.metrics import mean_absolute_error

best_model = search.best_estimator_
test_pred = best_model.predict(X_test)
test_mae = mean_absolute_error(y_test, test_pred)

summary = {
    "best_params": search.best_params_,
    "cv_mae": -search.best_score_,
    "test_mae": test_mae,
}
summary
~~~

### Review three signals
- **CV mean**: average performance on the development set.
- **CV std**: whether score is sensitive to splits.
- **test score**: whether one final held-out estimate roughly matches CV.

If the test score is much worse, do not immediately tune against test. Return to data, split strategy, features, and error cases, then write a new experiment plan.

### Ref ID
REF-SKLEARN-GRIDSEARCHCV, REF-SKLEARN-COMMON-PITFALLS, REF-INRIA-SKLEARN-MOOC`,
      ),
      loc(
        '最终测试是给已经选定的流程做一次估计，不是再开一轮调参。',
        'Final testing estimates the already selected workflow. It is not another tuning round.',
      ),
      loc(
        '在右侧 final 阶段，比较 CV mean、CV std 和 test score，判断下一步是接受、排查还是重新设计实验。',
        'Use the final stage to compare CV mean, CV std, and test score, then decide whether to accept, investigate, or redesign.',
      ),
    ),
  ],
  controls: [],
  presets: [],
  sourceNote: loc(
    '统一资料入口：REF-SKLEARN-CV、REF-SKLEARN-GRIDSEARCHCV、REF-SKLEARN-COMMON-PITFALLS、REF-INRIA-SKLEARN-MOOC。',
    'Centralized references: REF-SKLEARN-CV, REF-SKLEARN-GRIDSEARCHCV, REF-SKLEARN-COMMON-PITFALLS, REF-INRIA-SKLEARN-MOOC.',
  ),
  createDefaultConfig: () => ({
    playbackMs: 900,
  }),
  simulate: simulateModelSelection,
}
