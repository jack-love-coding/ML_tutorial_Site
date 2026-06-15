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

function simulateTreeForest(): ModuleSimulation {
  return {
    snapshots: [
      {
        step: 0,
        loss: 0,
        accuracy: 0,
        derivedMetrics: {
          moduleType: 'tree-forest-non-gradient',
          referenceIds: [
            'REF-SKLEARN-TREES',
            'REF-SKLEARN-RANDOM-FOREST',
            'REF-SKLEARN-ENSEMBLE-EXAMPLES',
            'REF-ISLR',
          ],
        },
      },
    ],
  }
}

export const treeForestModule: AlgorithmModuleDefinition = {
  slug: 'tree-forest',
  route: '/learn/tree-forest',
  titleKey: 'modules.treeForest.title',
  kickerKey: 'modules.treeForest.kicker',
  introKey: 'modules.treeForest.intro',
  summaryKey: 'modules.treeForest.summary',
  theme: '#f7fee7',
  accent: '#65a30d',
  checkpoints: algorithmCheckpointsBySlug['tree-forest'],
  chapters: [
    chapter(
      'non-gradient-model',
      'modules.treeForest.sections.nonGradientModel.title',
      loc(
        `到这里你已经看过 loss landscape、梯度下降和线性边界。决策树故意换一条路：它不靠梯度一步步移动参数，而是用一串 if-then split 把数据空间切开。

### 树在问什么问题
一棵分类树会反复问很具体的问题：

- \`income <= 4.2\` 吗？
- \`age <= 30\` 吗？
- \`spam_word_count > 2\` 吗？

每一次 split 都把当前样本分成两组。树的叶子节点保存局部预测：分类任务里通常是多数类别或类别概率，回归任务里通常是目标平均值。

### 和线性模型的区别
线性模型用一条直线或一个超平面总结整体趋势。树模型用很多局部规则拼出分段区域。它不需要特征缩放，也能处理非线性边界，但如果深度不受控，很容易把训练集切得过细。

### 老师会先问
这棵树是在学习一组连续参数，还是在学习一组分裂规则？把这点说清楚，学生才不会误以为所有 ML 都必须靠反向传播。

### Ref ID
REF-SKLEARN-TREES、REF-ISLR`,
        `By now you have seen loss landscapes, gradient descent, and linear boundaries. A decision tree deliberately takes another path: it does not move parameters by gradients. It cuts the data space with a sequence of if-then splits.

### What questions does a tree ask?
A classification tree repeatedly asks concrete questions:

- Is \`income <= 4.2\`?
- Is \`age <= 30\`?
- Is \`spam_word_count > 2\`?

Each split separates the current samples into two groups. A leaf stores a local prediction: usually majority class or class probability for classification, and target mean for regression.

### Difference from linear models
Linear models summarize a global trend with a line or hyperplane. Tree models stitch together local rules into piecewise regions. They do not need feature scaling and can handle nonlinear boundaries, but uncontrolled depth can slice training data too finely.

### Teacher question
Is this tree learning continuous parameters, or a set of splitting rules? That distinction helps students see that not all ML depends on backpropagation.

### Ref ID
REF-SKLEARN-TREES, REF-ISLR`,
      ),
      loc(
        '决策树是规则模型：它用 split 问题把空间切开，而不是沿着 loss landscape 走。',
        'A decision tree is a rule model: it cuts space with split questions instead of walking a loss landscape.',
      ),
      loc(
        '在右侧 tree 阶段，先把一棵树读成一串 if-then 问题，而不是参数更新过程。',
        'Use the tree stage on the right to read a tree as if-then questions rather than parameter updates.',
      ),
    ),
    chapter(
      'rectangular-splits',
      'modules.treeForest.sections.rectangularSplits.title',
      loc(
        `二维可视化里，决策树的 split 很好看：每次只沿着一个特征轴切一刀，所以平面会被切成一块块矩形区域。

### 一个二维例子
假设输入只有两个特征：

- $x_1$：收入
- $x_2$：年龄

第一刀可能是 $x_1 \\le 4.2$，把平面分成左右两半。左半边再切 $x_2 \\le 30$，右半边再切 $x_1 \\le 7.5$。最后每个矩形区域都有自己的预测。

~~~python
from sklearn.tree import DecisionTreeClassifier

tree = DecisionTreeClassifier(max_depth=3, random_state=42)
tree.fit(X_train, y_train)
pred = tree.predict(X_test)
~~~

### 为什么边界像阶梯
因为每个 split 只检查一个特征是否小于某个阈值。模型可以通过很多小矩形拼出弯曲边界，但这个边界通常会有阶梯感。

### 想一想
如果边界特别贴着训练点绕来绕去，它可能不是“理解了模式”，而是在把训练样本切成太多小格子。

### Ref ID
REF-SKLEARN-TREES`,
        `In a 2D visualization, decision-tree splits are easy to see: each split cuts along one feature axis, so the plane becomes rectangular regions.

### A 2D example
Suppose the input has two features:

- $x_1$: income
- $x_2$: age

The first cut might be $x_1 \\le 4.2$, splitting the plane into left and right. The left side may then split by $x_2 \\le 30$, while the right side splits by $x_1 \\le 7.5$. Each final rectangle has its own prediction.

~~~python
from sklearn.tree import DecisionTreeClassifier

tree = DecisionTreeClassifier(max_depth=3, random_state=42)
tree.fit(X_train, y_train)
pred = tree.predict(X_test)
~~~

### Why the boundary looks like stairs
Each split checks whether one feature is below a threshold. Many small rectangles can approximate a curved boundary, but that boundary often looks step-like.

### Think about it
If the boundary wraps tightly around training points, it may not understand the pattern. It may be slicing training samples into too many tiny boxes.

### Ref ID
REF-SKLEARN-TREES`,
      ),
      loc(
        '二维树边界本质是矩形拼图。先看它怎样切空间，再谈复杂度。',
        'A 2D tree boundary is a rectangular mosaic. Read how it cuts space before discussing complexity.',
      ),
      loc(
        '在右侧 split 阶段，想象第一刀沿 x1，第二刀沿 x2，预测区域会怎样变成矩形？',
        'Use the split stage to imagine the first cut along x1 and the second along x2: how do prediction regions become rectangles?',
      ),
    ),
    chapter(
      'split-criteria',
      'modules.treeForest.sections.splitCriteria.title',
      loc(
        `树每次 split 都要回答：哪一刀最值得切？分类树常用 Gini 或 entropy，回归树常用 MSE。

### 先讲直觉
一刀好的分类 split，会让切完后的子节点更“纯”：左边主要是 A 类，右边主要是 B 类。纯度越高，叶子预测越明确。

Gini 和 entropy 都是在衡量混杂程度。它们不是让树沿梯度下降，而是在每个候选 split 上比较“切完是否更纯”。

### 公式只作为校准
对二分类节点，Gini 可以写成：

$$G=1-p_0^2-p_1^2$$

entropy 可以写成：

$$H=-\\sum_k p_k\\log_2 p_k$$

回归树则常看每个子节点内部目标值是否更集中，常见目标是降低均方误差：

$$\\mathrm{MSE}=\\frac{1}{n}\\sum_i(y_i-\\bar{y})^2$$

### 老师会先问
这个 split 是让子节点更纯，还是只是让样本数量变少？如果只追求把节点切小，树很容易过拟合。

### Ref ID
REF-SKLEARN-TREES、REF-ISLR`,
        `Every split asks: which cut is worth making? Classification trees often use Gini or entropy, while regression trees often use MSE.

### Start with intuition
A good classification split makes child nodes more "pure": the left side is mostly class A, and the right side is mostly class B. Higher purity makes leaf predictions clearer.

Gini and entropy both measure mixture. They do not make the tree descend a gradient; they compare whether each candidate split makes children purer.

### Formulas as calibration
For a binary classification node, Gini can be written as:

$$G=1-p_0^2-p_1^2$$

Entropy can be written as:

$$H=-\\sum_k p_k\\log_2 p_k$$

A regression tree asks whether targets inside child nodes become more concentrated. A common target is reducing mean squared error:

$$\\mathrm{MSE}=\\frac{1}{n}\\sum_i(y_i-\\bar{y})^2$$

### Teacher question
Does this split make child nodes purer, or merely smaller? If the tree only tries to make tiny nodes, it can overfit quickly.

### Ref ID
REF-SKLEARN-TREES, REF-ISLR`,
      ),
      loc(
        'Gini、entropy、MSE 都是在给候选 split 排序。先问切完是否更纯，再看公式。',
        'Gini, entropy, and MSE rank candidate splits. Ask whether children become cleaner before staring at formulas.',
      ),
      loc(
        '在右侧 criterion 阶段，比较一个纯节点和一个混杂节点，哪一个更适合做叶子？',
        'Use the criterion stage to compare a pure node with a mixed node: which is more ready to become a leaf?',
      ),
    ),
    chapter(
      'depth-overfitting',
      'modules.treeForest.sections.depthOverfitting.title',
      loc(
        `树模型最容易看懂的过拟合旋钮是 \`max_depth\`。浅树偏简单，深树偏灵活。

### shallow tree、deep tree 怎么比
~~~python
from sklearn.tree import DecisionTreeClassifier

shallow = DecisionTreeClassifier(max_depth=2, random_state=42)
deep = DecisionTreeClassifier(max_depth=None, random_state=42)

shallow.fit(X_train, y_train)
deep.fit(X_train, y_train)
~~~

浅树可能欠拟合：它只切几刀，边界太粗。深树可能训练集分数很高，但验证集下降：它把噪声、异常点和偶然切分都记住了。

### 常见控制项
- \`max_depth\`：树最多几层。
- \`min_samples_leaf\`：叶子至少保留多少样本。
- \`min_samples_split\`：节点至少多少样本才继续切。
- \`ccp_alpha\`：剪枝强度。

### 想一想
树越深，训练分数通常越好；但验证分数不一定更好。树模型特别适合用交叉验证选择复杂度。

### Ref ID
REF-SKLEARN-TREES、REF-SKLEARN-CV`,
        `The easiest overfitting control to see in a tree model is \`max_depth\`. A shallow tree is simpler; a deep tree is more flexible.

### Comparing shallow and deep trees
~~~python
from sklearn.tree import DecisionTreeClassifier

shallow = DecisionTreeClassifier(max_depth=2, random_state=42)
deep = DecisionTreeClassifier(max_depth=None, random_state=42)

shallow.fit(X_train, y_train)
deep.fit(X_train, y_train)
~~~

A shallow tree may underfit: it makes only a few cuts, so the boundary is coarse. A deep tree may score highly on training but drop on validation because it memorizes noise, outliers, and accidental splits.

### Common controls
- \`max_depth\`: maximum tree depth.
- \`min_samples_leaf\`: minimum samples in a leaf.
- \`min_samples_split\`: minimum samples required to split a node.
- \`ccp_alpha\`: pruning strength.

### Think about it
The deeper the tree, the better the training score usually becomes; validation score does not necessarily improve. Tree models are ideal for cross-validating complexity.

### Ref ID
REF-SKLEARN-TREES, REF-SKLEARN-CV`,
      ),
      loc(
        '树深度是容量旋钮。训练分数升高不等于泛化变好。',
        'Tree depth is a capacity knob. A higher training score does not mean better generalization.',
      ),
      loc(
        '在右侧 depth 阶段，对比 shallow tree 和 deep tree：哪一个更可能欠拟合，哪一个更可能过拟合？',
        'Use the depth stage to compare shallow and deep trees: which is more likely to underfit, and which to overfit?',
      ),
    ),
    chapter(
      'random-forest',
      'modules.treeForest.sections.randomForest.title',
      loc(
        `随机森林不是一棵更深的树，而是一组彼此有差异的树。它用 bagging 和 feature randomness 降低单棵树的高方差。

### bagging 的直觉
每棵树都从训练集里抽一个 bootstrap sample：有放回抽样，所以某些样本会重复出现，某些样本不会进入这棵树。

同时，每次 split 只看一部分随机特征，而不是总看全部特征。这样树与树之间会更不一样。

~~~python
from sklearn.ensemble import RandomForestClassifier

forest = RandomForestClassifier(
    n_estimators=200,
    max_features="sqrt",
    random_state=42,
)
forest.fit(X_train, y_train)
pred = forest.predict(X_test)
proba = forest.predict_proba(X_test)
~~~

### 为什么平均能降方差
单棵深树很容易对训练样本细节敏感。很多棵不完全相同的树投票或平均概率，会抵消一部分偶然波动，让边界更稳定。

### Ref ID
REF-SKLEARN-RANDOM-FOREST、REF-SKLEARN-ENSEMBLE-EXAMPLES、REF-ISLR`,
        `A random forest is not one deeper tree. It is a collection of different trees. It uses bagging and feature randomness to reduce the high variance of a single tree.

### Bagging intuition
Each tree draws a bootstrap sample from the training set: sampling with replacement means some rows repeat and some rows do not enter that tree.

At each split, the tree also considers only a random subset of features instead of always seeing every feature. This makes trees more different from one another.

~~~python
from sklearn.ensemble import RandomForestClassifier

forest = RandomForestClassifier(
    n_estimators=200,
    max_features="sqrt",
    random_state=42,
)
forest.fit(X_train, y_train)
pred = forest.predict(X_test)
proba = forest.predict_proba(X_test)
~~~

### Why averaging reduces variance
A single deep tree is sensitive to training details. Many not-quite-identical trees vote or average probabilities, canceling some accidental variation and making the boundary more stable.

### Ref ID
REF-SKLEARN-RANDOM-FOREST, REF-SKLEARN-ENSEMBLE-EXAMPLES, REF-ISLR`,
      ),
      loc(
        '随机森林的关键不是一棵树更聪明，而是很多棵有差异的树一起投票。',
        'A random forest is not one smarter tree; it is many different trees voting together.',
      ),
      loc(
        '在右侧 forest 阶段，解释 bootstrap sample 和随机特征子集怎样让树与树不同。',
        'Use the forest stage to explain how bootstrap samples and random feature subsets make trees differ.',
      ),
    ),
    chapter(
      'feature-importance',
      'modules.treeForest.sections.featureImportance.title',
      loc(
        `随机森林常会输出 feature importance，但这张表很容易被误读。

### 重要性说明什么
常见的 impurity-based importance 衡量某个特征在树的 split 中带来了多少不纯度下降。它能提示模型经常依赖哪些特征。

~~~python
import pandas as pd

importance = pd.Series(
    forest.feature_importances_,
    index=feature_names,
).sort_values(ascending=False)

importance.head()
~~~

### 重要性不等于因果
如果 \`zipcode\` 很重要，它可能只是代理了收入、学校、交通或数据采样方式。模型依赖它，不代表改变邮编会直接造成目标变化。

重要性也可能偏向取值更多、更容易切分的特征；相关特征会互相分摊重要性。项目复盘时，最好把 importance、错误样本、领域知识和 permutation importance 一起看。

### 下一步路径
学完这一章后，再回到模型选择章节，用 CV 比较 shallow tree、deep tree 和 random forest。树模型很适合把“解释性、稳定性、泛化”三件事放在同一张复盘卡上。

### Ref ID
REF-SKLEARN-ENSEMBLE-EXAMPLES、REF-SKLEARN-RANDOM-FOREST、REF-ISLR`,
        `Random forests often output feature importance, but the table is easy to misread.

### What importance says
Common impurity-based importance measures how much a feature reduced impurity across tree splits. It can suggest which features the model often relies on.

~~~python
import pandas as pd

importance = pd.Series(
    forest.feature_importances_,
    index=feature_names,
).sort_values(ascending=False)

importance.head()
~~~

### Importance is not causality
If \`zipcode\` is important, it may proxy for income, school quality, transport, or sampling patterns. The model relying on it does not mean changing zipcode directly causes the target to change.

Importance can also favor features with more possible split points; correlated features may share importance. In a project review, inspect importance, error cases, domain knowledge, and permutation importance together.

### Next path
After this chapter, return to Model Selection and compare shallow tree, deep tree, and random forest with CV. Tree models are a good place to put interpretability, stability, and generalization into one review card.

### Ref ID
REF-SKLEARN-ENSEMBLE-EXAMPLES, REF-SKLEARN-RANDOM-FOREST, REF-ISLR`,
      ),
      loc(
        'feature importance 是模型依赖线索，不是因果结论。',
        'Feature importance is a clue about model reliance, not a causal conclusion.',
      ),
      loc(
        '在右侧 importance 阶段，给一个“高重要性但不代表因果”的解释例子。',
        'Use the importance stage to give an example where high importance does not imply causality.',
      ),
    ),
  ],
  controls: [],
  presets: [],
  sourceNote: loc(
    '统一资料入口：REF-SKLEARN-TREES、REF-SKLEARN-RANDOM-FOREST、REF-SKLEARN-ENSEMBLE-EXAMPLES、REF-ISLR。',
    'Centralized references: REF-SKLEARN-TREES, REF-SKLEARN-RANDOM-FOREST, REF-SKLEARN-ENSEMBLE-EXAMPLES, REF-ISLR.',
  ),
  createDefaultConfig: () => ({
    playbackMs: 900,
  }),
  simulate: simulateTreeForest,
}
