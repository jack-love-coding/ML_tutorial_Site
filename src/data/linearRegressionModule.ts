import type { AlgorithmModuleDefinition, LocalizedCopy } from '../types/ml'
import { simulateLinearRegression } from '../simulations/linearRegression'

function loc(zhCN: string, en: string): LocalizedCopy {
  return { 'zh-CN': zhCN, en }
}

interface LinearRegressionTeachingFrame {
  coreQuestion: LocalizedCopy
  concept: LocalizedCopy
  workedExample: LocalizedCopy
  formula: LocalizedCopy
  commonMistake: LocalizedCopy
  visualAnimation: LocalizedCopy
  experimentDesign: LocalizedCopy
  sourceReference: LocalizedCopy
}

function withTeachingFrame(base: LocalizedCopy, frame: LinearRegressionTeachingFrame): LocalizedCopy {
  return loc(
    `${base['zh-CN']}

### 核心问题
${frame.coreQuestion['zh-CN']}

### 概念直觉
${frame.concept['zh-CN']}

### 手算例子
${frame.workedExample['zh-CN']}

### 公式
${frame.formula['zh-CN']}

### 常见误解
${frame.commonMistake['zh-CN']}

### 插图与动画
${frame.visualAnimation['zh-CN']}

### 交互实验设计
${frame.experimentDesign['zh-CN']}

### 来源参考
${frame.sourceReference['zh-CN']}`,
    `${base.en}

### Core Question
${frame.coreQuestion.en}

### Concept Intuition
${frame.concept.en}

### Worked Example
${frame.workedExample.en}

### Formula
${frame.formula.en}

### Common Mistake
${frame.commonMistake.en}

### Diagram and Animation
${frame.visualAnimation.en}

### Interactive Experiment Design
${frame.experimentDesign.en}

### Source References
${frame.sourceReference.en}`,
  )
}

const linearRegressionTeachingFrames: Record<string, LinearRegressionTeachingFrame> = {
  'fit-line': {
    coreQuestion: loc(
      '一条回归线到底在表达什么关系，斜率和截距分别负责哪一部分？',
      'What relationship does one regression line express, and what roles do slope and intercept play?',
    ),
    concept: loc(
      `知识点：线性回归先把“输入变大时输出怎样变”写成一条可解释的趋势线。斜率控制方向和变化速度，截距控制整条线的基线位置。`,
      `Key idea: linear regression turns "how the output changes as the input grows" into an interpretable trend line. The slope controls direction and rate; the intercept controls the baseline shift.`,
    ),
    workedExample: loc(
      `若 $w=1.5, b=35$，面积 $50m^2$ 的预测房价是 $1.5\\times50+35=110$ 万；面积 $100m^2$ 的预测是 $185$ 万。面积增加 $50m^2$，预测增加 $75$ 万，正好由斜率 $w$ 决定。`,
      `If $w=1.5$ and $b=35$, a $50m^2$ home predicts $1.5\\times50+35=110$; a $100m^2$ home predicts $185$. The extra $50m^2$ adds $75$, exactly controlled by the slope $w$.`,
    ),
    formula: loc(
      `$$\\hat{y}=wx+b,\\quad \\Delta\\hat{y}=w\\Delta x$$

$\\hat{y}$ 是预测值，$x$ 是输入特征，$w$ 是单位输入变化带来的预测变化，$b$ 是整体偏移。`,
      `$$\\hat{y}=wx+b,\\quad \\Delta\\hat{y}=w\\Delta x$$

$\\hat{y}$ is the prediction, $x$ is the input feature, $w$ is the prediction change per input unit, and $b$ is the global offset.`,
    ),
    commonMistake: loc(
      `不要把截距 $b$ 当成“0 平方米房子的真实价格”。它主要是让整条线在当前数据范围内能放到合适高度。`,
      `Do not read the intercept $b$ as the real price of a zero-area home. Its main job is to place the line at the right height over the observed data range.`,
    ),
    visualAnimation: loc(
      `实验卡会用小图把散点、趋势线、斜率箭头和截距抬升分开标出；播放训练时，线会旋转和平移，帮助学生把参数变化看成几何动作。`,
      `The lab adds a mini diagram for dots, the trend line, the slope arrow, and the intercept lift. During playback, the line rotates and shifts so parameter changes become geometric motion.`,
    ),
    experimentDesign: loc(
      `使用“面积主导”预设，先保持无离群点，再逐步播放训练。观察：线的角度是否贴近数据云，截距是否把整体高度调准。`,
      `Use the baseline preset without outliers, then play training step by step. Watch whether the line angle matches the cloud and whether the intercept places the line at the right height.`,
    ),
    sourceReference: loc(
      `D2L 线性回归章节；CS357 最小二乘中的线性拟合视角；站内前置【损失函数】。`,
      `D2L linear regression; the CS357 least-squares view of linear fitting; the site's earlier Loss Functions lesson.`,
    ),
  },
  'residual-loss': {
    coreQuestion: loc(
      '直线画出来以后，怎样把每个样本的偏差汇总成一个可优化的数？',
      'After the line is drawn, how do per-sample deviations become one optimizable number?',
    ),
    concept: loc(
      `知识点：残差保留了“预测偏高还是偏低”的方向，MSE 把残差平方后求平均，得到训练真正要下降的目标。`,
      `Key idea: residuals keep the direction of the error, while MSE squares and averages residuals into the objective training tries to reduce.`,
    ),
    workedExample: loc(
      `三个样本的残差分别是 $5,-10,15$ 万，则

$$\\text{MSE}=\\frac{5^2+(-10)^2+15^2}{3}=116.7$$

同样的残差绝对值平均为 $10$，这也解释了 MSE 为什么会更强调大误差。`,
      `If three residuals are $5,-10,15$, then

$$\\text{MSE}=\\frac{5^2+(-10)^2+15^2}{3}=116.7$$

The corresponding mean absolute residual is $10$, which shows why MSE emphasizes large mistakes more strongly.`,
    ),
    formula: loc(
      `$$e_i=\\hat{y}_i-y_i,\\quad \\text{MSE}=\\frac{1}{N}\\sum_{i=1}^{N}e_i^2$$

$e_i$ 是第 $i$ 个样本的残差，$N$ 是样本数。平方会消掉正负号，同时放大大残差。`,
      `$$e_i=\\hat{y}_i-y_i,\\quad \\text{MSE}=\\frac{1}{N}\\sum_{i=1}^{N}e_i^2$$

$e_i$ is the residual for sample $i$, and $N$ is the sample count. Squaring removes the sign and amplifies large residuals.`,
    ),
    commonMistake: loc(
      `不要只看残差正负来判断模型好坏。训练目标看的是所有残差经过损失规则后的合计。`,
      `Do not judge fit quality only from residual signs. Training cares about the aggregate after residuals pass through the loss rule.`,
    ),
    visualAnimation: loc(
      `本章小图会让竖直残差线闪烁，并把“残差 -> 平方 -> 平均”的路径画出来；离群点开启后，大残差会更醒目。`,
      `The mini diagram pulses the vertical residual segment and shows the path from residual to square to average. With the outlier enabled, the large residual becomes visually dominant.`,
    ),
    experimentDesign: loc(
      `打开离群点强度滑杆，比较同一条线下普通样本和离群样本的残差长度，再观察 MSE 是否被少数大误差拉高。`,
      `Adjust the outlier strength slider, compare ordinary residuals with the outlier residual, and watch whether MSE is pulled upward by a few large errors.`,
    ),
    sourceReference: loc(
      `Google Machine Learning Crash Course 的损失直觉；D2L 线性回归目标函数；站内【损失函数：MSE/MAE】。`,
      `Google Machine Learning Crash Course loss intuition; D2L's linear-regression objective; the site's MSE/MAE lesson.`,
    ),
  },
  'training-motion': {
    coreQuestion: loc(
      '梯度下降怎样同时改变斜率、截距，并让 MSE 逐步下降？',
      'How does gradient descent change slope and intercept together while reducing MSE?',
    ),
    concept: loc(
      `知识点：训练不是一次性找出完美直线，而是反复计算当前误差对参数的方向建议，再沿负梯度更新参数。`,
      `Key idea: training does not find the perfect line in one jump. It repeatedly asks how current errors push the parameters, then updates along the negative gradient.`,
    ),
    workedExample: loc(
      `若当前 $w=1.20, b=30$，梯度为 $\\frac{\\partial L}{\\partial w}=-0.8, \\frac{\\partial L}{\\partial b}=0.4$，学习率 $\\eta=0.1$，则

$$w'=1.20-0.1(-0.8)=1.28$$
$$b'=30-0.1(0.4)=29.96$$

斜率变大，截距略降，这就是一小步参数更新。`,
      `If $w=1.20$, $b=30$, the gradient is $\\frac{\\partial L}{\\partial w}=-0.8$, $\\frac{\\partial L}{\\partial b}=0.4$, and $\\eta=0.1$, then

$$w'=1.20-0.1(-0.8)=1.28$$
$$b'=30-0.1(0.4)=29.96$$

The slope increases and the intercept nudges down: one small parameter update.`,
    ),
    formula: loc(
      `$$w_{t+1}=w_t-\\eta\\frac{\\partial \\text{MSE}}{\\partial w},\\quad b_{t+1}=b_t-\\eta\\frac{\\partial \\text{MSE}}{\\partial b}$$

$\\eta$ 是学习率，偏导数告诉当前参数该如何影响损失。`,
      `$$w_{t+1}=w_t-\\eta\\frac{\\partial \\text{MSE}}{\\partial w},\\quad b_{t+1}=b_t-\\eta\\frac{\\partial \\text{MSE}}{\\partial b}$$

$\\eta$ is the learning rate, and the partial derivatives describe how the current parameters affect the loss.`,
    ),
    commonMistake: loc(
      `不要以为梯度是在直接移动数据点。数据不动，动的是参数；参数一动，预测线才跟着变。`,
      `Do not think the gradient moves the data points. The data stays fixed; the parameters move, and the prediction line changes because of that.`,
    ),
    visualAnimation: loc(
      `本章会同时展示“数据空间里的直线移动”和“参数空间里的路径移动”，当前参数点会随播放脉冲高亮。`,
      `This chapter shows both the moving line in data space and the path in parameter space, with the current parameter point pulsing during playback.`,
    ),
    experimentDesign: loc(
      `先播放默认训练，再调大学习率。比较损失下降速度、参数轨迹平滑度，以及直线是否出现明显来回摆动。`,
      `Play the default training, then increase the learning rate. Compare loss speed, path smoothness, and whether the line starts swinging back and forth.`,
    ),
    sourceReference: loc(
      `D2L 线性回归训练循环；站内【梯度下降：负梯度和学习率】。`,
      `D2L's linear-regression training loop; the site's Gradient Descent lesson on negative gradients and learning rate.`,
    ),
  },
  'model-limits': {
    coreQuestion: loc(
      '什么时候问题不在优化，而在“一条直线”本身表达能力不够？',
      'When is the issue not optimization, but the limited expressivity of one straight line?',
    ),
    concept: loc(
      `知识点：线性模型的预测形状被模型族限制住。若真实关系弯曲，再多训练轮数也只能在直线族里找折中。`,
      `Key idea: a linear model is constrained by its model family. If the true relationship bends, more epochs can only find a compromise inside the family of straight lines.`,
    ),
    workedExample: loc(
      `假设高面积样本真实价为 $390$ 万，而直线预测 $360$ 万，残差为 $-30$ 万。若相邻高面积样本都类似偏低，就不是单个噪声点，而是系统性弯曲没有被模型表达出来。`,
      `Suppose a large home is actually $390$ but the line predicts $360$, giving a residual of $-30$. If neighboring large homes are also underpredicted, this is not one noisy point; it is systematic curvature the model cannot express.`,
    ),
    formula: loc(
      `线性模型满足：

$$\\hat{y}=wx+b,\\quad \\frac{d^2\\hat{y}}{dx^2}=0$$

第二个式子提醒我们：这条线没有弯曲能力。`,
      `A linear model satisfies:

$$\\hat{y}=wx+b,\\quad \\frac{d^2\\hat{y}}{dx^2}=0$$

The second statement is the warning: this model has no curvature.`,
    ),
    commonMistake: loc(
      `不要把所有高残差都归因于“还没训练够”。先看残差是否有结构性方向，再判断是不是模型能力不足。`,
      `Do not blame every large residual on insufficient training. First check whether residuals have a systematic pattern, then ask whether model capacity is the bottleneck.`,
    ),
    visualAnimation: loc(
      `小图会把弯曲数据和一条直线叠在一起，并用连续偏离的残差段提示“系统性误差”。`,
      `The mini diagram overlays curved data with one straight line and uses repeated residual segments to mark systematic error.`,
    ),
    experimentDesign: loc(
      `切换“线性边界”预设，观察高面积端是否持续偏离。若损失趋稳但残差仍有方向，说明应该换特征或模型，而不是只加训练轮数。`,
      `Switch to the limits preset and inspect whether the high-area end stays biased. If loss stabilizes while residuals keep a direction, change features or model family instead of only adding epochs.`,
    ),
    sourceReference: loc(
      `D2L 模型选择与线性模型限制；CS357 最小二乘拟合残差视角；下一课【逻辑回归】的线性打分桥接。`,
      `D2L model selection and linear-model limits; the CS357 residual view of least squares; the bridge to the next Logistic Regression lesson.`,
    ),
  },
  multivariate: {
    coreQuestion: loc(
      '多个特征进入模型后，每个权重怎样解释自己的贡献？',
      'When multiple features enter the model, how does each weight explain its own contribution?',
    ),
    concept: loc(
      `知识点：多元线性回归把一条线扩展成高维空间里的平面或超平面。每个权重对应一个特征方向上的倾斜程度。`,
      `Key idea: multivariate linear regression extends a line into a plane or hyperplane. Each weight controls tilt along one feature direction.`,
    ),
    workedExample: loc(
      `若 $w_{area}=1.4, w_{age}=-2.5, b=60$，面积 $100m^2$、房龄 $10$ 年的预测为：

$$1.4\\times100-2.5\\times10+60=175$$

同样面积下，房龄每增加 1 年，预测少 $2.5$ 万。`,
      `If $w_{area}=1.4$, $w_{age}=-2.5$, and $b=60$, a $100m^2$ home aged $10$ years predicts:

$$1.4\\times100-2.5\\times10+60=175$$

At the same area, one extra year of age reduces the prediction by $2.5$.`,
    ),
    formula: loc(
      `$$\\hat{y}=w_1x_1+w_2x_2+\\cdots+w_dx_d+b$$

$d$ 是特征数量，$w_j$ 表示第 $j$ 个特征在其它特征不变时对预测的线性贡献。`,
      `$$\\hat{y}=w_1x_1+w_2x_2+\\cdots+w_dx_d+b$$

$d$ is the number of features, and $w_j$ is the linear contribution of feature $j$ when the others are held fixed.`,
    ),
    commonMistake: loc(
      `不要直接比较不同量纲下的权重大小。面积、房龄、距离等单位不同，权重大小要结合特征尺度理解。`,
      `Do not compare raw weights across features with different units. Area, age, and distance have different scales, so weight magnitude needs feature-scale context.`,
    ),
    visualAnimation: loc(
      `3D 视图会显示点云、回归平面和每个点到平面的残差段；播放时平面会同时旋转、升降。`,
      `The 3D view shows the point cloud, regression plane, and residual segments to the plane. During playback, the plane rotates and shifts together.`,
    ),
    experimentDesign: loc(
      `使用“面积 + 房龄平面”预设，观察面积权重通常把平面抬高，房龄权重通常把平面压低。`,
      `Use the area-plus-age preset and watch the area weight usually lift the plane while the age weight usually pulls it down.`,
    ),
    sourceReference: loc(
      `D2L 多特征线性回归；CS357 设计矩阵和最小二乘。`,
      `D2L multifeature linear regression; CS357 design matrices and least squares.`,
    ),
  },
  polynomial: {
    coreQuestion: loc(
      '为什么多项式回归能画曲线，却仍然属于“线性参数”模型？',
      'Why can polynomial regression draw curves while still being linear in its parameters?',
    ),
    concept: loc(
      `知识点：我们没有把权重变成非线性，而是把输入扩展成 $x,x^2,x^3$ 等新特征。模型对这些新特征仍然做线性加权。`,
      `Key idea: we do not make the weights nonlinear. We expand the input into features like $x,x^2,x^3$, then linearly weight those features.`,
    ),
    workedExample: loc(
      `令 $\\hat{y}=3x-0.5x^2+4$。当 $x=2$ 时：

$$\\hat{y}=3\\times2-0.5\\times4+4=8$$

虽然图像会弯，但参数 $3,-0.5,4$ 仍然只是一组线性相加的系数。`,
      `Let $\\hat{y}=3x-0.5x^2+4$. At $x=2$:

$$\\hat{y}=3\\times2-0.5\\times4+4=8$$

The graph bends, but the parameters $3,-0.5,4$ are still linearly added coefficients.`,
    ),
    formula: loc(
      `$$\\phi(x)=[x,x^2,x^3],\\quad \\hat{y}=\\mathbf{w}^{\\top}\\phi(x)+b$$

$\\phi(x)$ 是特征扩展；只要模型对 $\\mathbf{w}$ 仍然线性，就仍可使用线性模型训练直觉。`,
      `$$\\phi(x)=[x,x^2,x^3],\\quad \\hat{y}=\\mathbf{w}^{\\top}\\phi(x)+b$$

$\\phi(x)$ is the feature expansion. As long as the model remains linear in $\\mathbf{w}$, the linear-model training intuition still applies.`,
    ),
    commonMistake: loc(
      `不要把“曲线图像”直接等同于“非线性参数模型”。多项式回归的非线性来自特征，不来自参数相乘。`,
      `Do not equate a curved graph with a nonlinear-parameter model. Polynomial regression gets curvature from features, not from multiplying parameters together.`,
    ),
    visualAnimation: loc(
      `小图会展示 $x,x^2,x^3$ 三个特征柱如何合成曲线；阶数升高时，曲线会变得更灵活。`,
      `The mini diagram shows $x,x^2,x^3$ feature bars combining into a curve. As degree increases, the curve becomes more flexible.`,
    ),
    experimentDesign: loc(
      `把阶数从 1 调到 2、3、5，观察残差下降的同时，曲线是否开始追逐局部波动。`,
      `Move the degree from 1 to 2, 3, and 5. Watch residuals fall, then check whether the curve starts chasing local wiggles.`,
    ),
    sourceReference: loc(
      `D2L 多项式回归与欠拟合/过拟合；CS357 线性最小二乘中的特征列视角。`,
      `D2L polynomial regression and underfit/overfit; the CS357 view of feature columns in linear least squares.`,
    ),
  },
  overfitting: {
    coreQuestion: loc(
      '为什么训练误差继续下降，验证误差却可能变差？',
      'Why can training error keep falling while validation error gets worse?',
    ),
    concept: loc(
      `知识点：过拟合发生在模型容量超过稳定规律所需时。模型把训练集里的噪声也当成规律，导致没见过的数据表现变差。`,
      `Key idea: overfitting happens when model capacity exceeds what the stable pattern needs. The model treats training noise as signal and performs worse on unseen data.`,
    ),
    workedExample: loc(
      `比较两组结果：

| 模型 | 训练 MSE | 验证 MSE |
|---|---:|---:|
| 二阶多项式 | 25 | 30 |
| 六阶多项式 | 12 | 80 |

六阶模型训练更好，但泛化明显更差。`,
      `Compare two outcomes:

| Model | Train MSE | Validation MSE |
|---|---:|---:|
| Degree 2 | 25 | 30 |
| Degree 6 | 12 | 80 |

The degree-6 model fits training better but generalizes much worse.`,
    ),
    formula: loc(
      `泛化判断至少要同时看：

$$\\text{Train MSE}=\\frac{1}{N_{train}}\\sum e_i^2,\\quad \\text{Val MSE}=\\frac{1}{N_{val}}\\sum e_i^2$$

两者分叉时，训练集读数就不能单独作为成功证据。`,
      `Generalization requires reading both:

$$\\text{Train MSE}=\\frac{1}{N_{train}}\\sum e_i^2,\\quad \\text{Val MSE}=\\frac{1}{N_{val}}\\sum e_i^2$$

When they split, the training metric alone is not evidence of success.`,
    ),
    commonMistake: loc(
      `不要把“训练误差最低”当成“模型最好”。如果验证误差升高，模型可能正在记住训练噪声。`,
      `Do not treat "lowest training error" as "best model." If validation error rises, the model may be memorizing training noise.`,
    ),
    visualAnimation: loc(
      `实验卡会同时画训练/验证误差曲线；当验证曲线抬头时，过拟合提示会和弯折曲线一起出现。`,
      `The lab draws train and validation error curves together. When the validation curve rises, the overfitting cue appears with the increasingly wavy fit.`,
    ),
    experimentDesign: loc(
      `使用“高阶过拟合”预设，先播放到后半段，再降低阶数或噪声，比较两条误差曲线是否重新靠近。`,
      `Use the high-degree overfit preset, play into the later epochs, then lower degree or noise and compare whether the two error curves move closer again.`,
    ),
    sourceReference: loc(
      `D2L 模型选择、过拟合和欠拟合；Google MLCC 泛化与验证集诊断。`,
      `D2L model selection, overfitting, and underfitting; Google MLCC generalization and validation diagnostics.`,
    ),
  },
  regularization: {
    coreQuestion: loc(
      '正则化怎样在“拟合训练数据”和“保持模型克制”之间做取舍？',
      'How does regularization trade off fitting the training data against keeping the model restrained?',
    ),
    concept: loc(
      `知识点：正则化把参数大小也写进目标函数。它允许训练误差稍高一点，换取更平滑、更稳定的模型。`,
      `Key idea: regularization puts parameter size into the objective. It may accept slightly higher training error in exchange for a smoother and more stable model.`,
    ),
    workedExample: loc(
      `若当前 MSE 为 $24$，使用 L2 正则，$\\lambda=0.5$，权重为 $[3,1]$：

$$\\text{loss}=24+0.5(3^2+1^2)=29$$

较大的权重会让总损失上升，训练就会倾向于把权重压小。`,
      `If MSE is $24$, L2 regularization uses $\\lambda=0.5$, and weights are $[3,1]$:

$$\\text{loss}=24+0.5(3^2+1^2)=29$$

Large weights raise the total loss, so training is encouraged to shrink them.`,
    ),
    formula: loc(
      `$$L_{ridge}=\\text{MSE}+\\lambda\\sum_j w_j^2,\quad L_{lasso}=\\text{MSE}+\\lambda\\sum_j |w_j|$$

L2 倾向于整体缩小权重；L1 更容易把部分权重推到 0。`,
      `$$L_{ridge}=\\text{MSE}+\\lambda\\sum_j w_j^2,\quad L_{lasso}=\\text{MSE}+\\lambda\\sum_j |w_j|$$

L2 tends to shrink weights overall; L1 more readily pushes some weights to zero.`,
    ),
    commonMistake: loc(
      `不要期待正则化一定降低训练误差。它优化的是“训练损失 + 参数惩罚”的总目标，而不是单独追求训练 MSE 最小。`,
      `Do not expect regularization to always lower training error. It optimizes the combined objective, not training MSE alone.`,
    ),
    visualAnimation: loc(
      `小图会把大权重柱逐步压短，并用曲线从抖动到平滑的变化说明正则化如何限制模型自由度。`,
      `The mini diagram shrinks large weight bars and shows a wavy curve becoming smoother to explain how regularization limits freedom.`,
    ),
    experimentDesign: loc(
      `在“正则化约束”预设里切换 none、L1、L2，并逐步增大 $\\lambda$。重点比较权重范数、有效权重数量和验证 MSE。`,
      `In the regularized preset, switch between none, L1, and L2 while increasing $\\lambda$. Compare weight norm, active weight count, and validation MSE.`,
    ),
    sourceReference: loc(
      `D2L 权重衰减和正则化；CS357 最小二乘稳定性与病态问题；站内【梯度下降】学习率与参数路径。`,
      `D2L weight decay and regularization; CS357 least-squares stability and ill-conditioning; the site's Gradient Descent lesson on learning rate and parameter paths.`,
    ),
  },
}

export const linearRegressionModule: AlgorithmModuleDefinition = {
  slug: 'linear-regression',
  route: '/learn/linear-regression',
  titleKey: 'modules.linearRegression.title',
  kickerKey: 'modules.linearRegression.kicker',
  introKey: 'modules.linearRegression.intro',
  summaryKey: 'modules.linearRegression.summary',
  theme: '#edf7f2',
  accent: '#db6c3a',
  chapters: [
    {
      id: 'fit-line',
      eyebrowKey: 'common.chapter',
      titleKey: 'modules.linearRegression.sections.fitLine.title',
      markdown: loc(
        `在线性回归里，我们先不急着谈训练算法，而是先问一个更朴素的问题：如果横轴是房屋面积，纵轴是房价，一条直线到底在表达什么？

$$\\hat{y}=wx+b$$

- $x$ 是面积
- $w$ 是斜率，表示面积每增加 1 平方米，预测价格大约增加多少
- $b$ 是截距，表示整条线被整体抬高或压低了多少

散点是一个个真实样本，直线是模型对“总体趋势”的概括。  
本章最重要的直觉是：回归线不是装饰物，而是模型对面积和价格关系的正式表达。`,
        `In linear regression, do not start with the optimizer. Start with the simpler question: if area is on the x-axis and price is on the y-axis, what is a line actually saying?

$$\\hat{y}=wx+b$$

- $x$ is the area
- $w$ is the slope, telling us how much price changes per extra square meter
- $b$ is the intercept, shifting the whole line up or down

The dots are real houses. The line is the model’s summary of the overall trend.  
The key intuition in this chapter is that the regression line is the model’s formal statement about the relationship itself.`,
      ),
      callout: loc(
        '先盯住散点和直线的相对位置，不急着看损失公式。',
        'Start with the relative position of the dots and the line before focusing on loss.',
      ),
      experimentPrompt: loc(
        '先用“面积主导”预设，观察每个点离回归线有多远，再想一想斜率和截距分别在控制什么。',
        'Use the baseline preset first and ask what the slope and intercept are each controlling.',
      ),
      presetId: 'baseline-fit',
      metricEmphasis: ['loss'],
    },
    {
      id: 'residual-loss',
      eyebrowKey: 'common.chapter',
      titleKey: 'modules.linearRegression.sections.residualLoss.title',
      markdown: loc(
        `直线画出来之后，下一步就要问：它画得好不好？

每个点到直线的竖直距离，就是这个样本的残差。  
残差告诉我们单个样本错了多少，而 **MSE** 把所有残差平方后取平均，变成训练时真正优化的目标：

$$\\text{MSE}=\\frac{1}{N}\\sum_i (\\hat{y}_i-y_i)^2$$

为什么这里主讲 MSE？

- 它会放大大误差，让模型认真修正明显偏离的样本
- 它和后面的梯度更新配合得很自然
- 它能和你前面学过的 loss function 内容直接接上

MAE 仍然会作为对比出现，但本模块把它放在提醒位置，而不是展开第二套训练流程。`,
        `Once the line is drawn, the next question is: how good is it?

The vertical distance from each point to the line is the residual.  
Residuals describe per-sample error, while **MSE** averages the squared residuals into the objective that training actually minimizes:

$$\\text{MSE}=\\frac{1}{N}\\sum_i (\\hat{y}_i-y_i)^2$$

Why focus on MSE here?

- it amplifies larger mistakes
- it works naturally with gradient-based updates
- it connects directly to the earlier loss-function lesson

MAE still appears as a comparison, but this module keeps it in that comparison role instead of building a second full training flow.`,
      ),
      callout: loc(
        '先看残差，再看 MSE 怎样把所有样本的误差重新汇总成一个训练目标。',
        'Look at residuals first, then watch MSE aggregate them into one objective.',
      ),
      experimentPrompt: loc(
        '打开离群点后，观察残差线和 MSE 是否会立刻被少数大误差拖着走。',
        'Enable the outlier and see how quickly a few large residuals start to dominate MSE.',
      ),
      presetId: 'residual-focus',
      metricEmphasis: ['loss'],
    },
    {
      id: 'training-motion',
      eyebrowKey: 'common.chapter',
      titleKey: 'modules.linearRegression.sections.trainingMotion.title',
      markdown: loc(
        `有了目标函数之后，线性回归的训练就不再神秘了：它只是不断微调斜率和截距，让 MSE 下降。

本章最值得看的不是“线又动了一下”，而是：

- 斜率如何逐步朝正确方向旋转
- 截距如何上下平移，把整条线推向数据云
- 损失如何随着这些小更新逐渐下降

如果学生能把参数平面上的轨迹，和数据空间里的直线移动连起来，后面再看逻辑回归就会轻松很多。`,
        `Once the objective is clear, linear-regression training stops feeling mysterious: it just keeps adjusting slope and intercept to reduce MSE.

The important thing here is not merely that the line moves. It is that:

- the slope rotates toward a better direction
- the intercept shifts the whole line up or down
- the loss falls as those small updates accumulate

If students can connect the parameter trajectory to the line movement in data space, logistic regression becomes much easier later.`,
      ),
      callout: loc(
        '一边看左侧的直线，一边看右侧参数轨迹。同一轮更新，要在两个视图里同时读懂。',
        'Read the line and the parameter trajectory together. One update should make sense in both views.',
      ),
      experimentPrompt: loc(
        '点击播放后，再改学习率和训练轮数，比较“收敛更快”和“抖动更大”之间的取舍。',
        'Play the training, then adjust learning rate and epochs to compare faster movement with less stable updates.',
      ),
      presetId: 'training-playback',
      metricEmphasis: ['loss'],
    },
    {
      id: 'model-limits',
      eyebrowKey: 'common.chapter',
      titleKey: 'modules.linearRegression.sections.modelLimits.title',
      markdown: loc(
        `线性回归最重要的边界，不在“有没有训练够”，而在“它只能表达一条线”。

如果房价和面积的关系本身带一点弯曲，或者数据里混入了明显离群点，那么再努力训练，模型也只能在“一条直线”这个表达框架里妥协。

这时学生应该看见两件事：

1. 损失可能已经下降了很多，但仍然留有系统性误差
2. 问题不一定出在优化器，更可能出在线性模型的表达能力

逻辑回归同样从线性打分出发，但它预测的不是连续房价，而是类别概率。  
两者共享“参数在推动决策”的直觉，只是任务、损失和输出解释不同。`,
        `The most important limit of linear regression is not whether we trained long enough. It is that the model can only express one line.

If the relationship between area and price bends slightly, or if the dataset contains a strong outlier, training harder still leaves the model inside a single straight-line family.

Students should notice two things:

1. loss may fall a lot while systematic error remains
2. the bottleneck may be model expressivity rather than the optimizer

Logistic regression also starts from a linear score, but it predicts class probability rather than continuous price.  
The parameter intuition carries over, while the task, the loss, and the output meaning change.`,
      ),
      callout: loc(
        '明确区分“优化没做好”和“模型本身不够表达”。',
        'Separate insufficient optimization from insufficient model expressivity.',
      ),
      experimentPrompt: loc(
        '切到“线性边界”预设后，观察高面积样本为什么会系统性偏离回归线，然后顺着桥接卡进入逻辑回归。',
        'Switch to the limits preset and inspect why larger homes drift systematically away from the line.',
      ),
      presetId: 'limits-bridge',
      metricEmphasis: ['loss'],
    },
    {
      id: 'multivariate',
      eyebrowKey: 'common.chapter',
      titleKey: 'modules.linearRegression.sections.multivariate.title',
      markdown: loc(
        `真实房价很少只由面积决定。把房龄也放进来之后，模型不再是一条线，而是一个平面：

$$\hat{y}=w_1x_{\text{area}}+w_2x_{\text{age}}+b$$

- $w_1$ 仍然描述面积增加时，预测价格怎样变化
- $w_2$ 描述房龄增加时，预测价格怎样变化
- $b$ 仍然是整体基线

多元线性回归的重点不是“公式变长了”，而是每个权重都在解释一个特征对预测的贡献。`,
        `Real housing prices rarely depend on area alone. Once age is added, the model becomes a plane instead of one line:

$$\hat{y}=w_1x_{\text{area}}+w_2x_{\text{age}}+b$$

- $w_1$ describes how price changes with area
- $w_2$ describes how price changes with age
- $b$ remains the baseline shift

The point of multivariate regression is not a longer formula. It is that each weight explains one feature's contribution.`,
      ),
      callout: loc(
        '看 3D 点云和平面：面积把平面往上推，房龄通常把平面往下拉。',
        'Read the 3D cloud and plane: area usually lifts the plane, while age usually pulls it down.',
      ),
      experimentPrompt: loc(
        '播放训练，观察回归平面怎样同时调整面积权重、房龄权重和截距。',
        'Play training and watch the plane adjust area weight, age weight, and intercept together.',
      ),
      presetId: 'multivariate-plane',
      metricEmphasis: ['loss'],
    },
    {
      id: 'polynomial',
      eyebrowKey: 'common.chapter',
      titleKey: 'modules.linearRegression.sections.polynomial.title',
      markdown: loc(
        `如果面积和房价的关系有弯曲趋势，模型可以继续保持“线性参数”，但把输入特征扩展成多项式：

$$\hat{y}=w_1x+w_2x^2+w_3x^3+b$$

它仍然是对参数线性的模型，只是特征不再只有原始面积。这样一来，直线可以变成曲线，模型表达能力明显增强。`,
        `If the relationship between area and price bends, the model can stay linear in parameters while expanding the input into polynomial features:

$$\hat{y}=w_1x+w_2x^2+w_3x^3+b$$

The model is still linear in its weights, but the features are no longer just raw area. The line can become a curve.`,
      ),
      callout: loc(
        '调多项式阶数，观察同一套线性权重怎样画出更弯的曲线。',
        'Adjust polynomial degree and watch linear weights draw a more flexible curve.',
      ),
      experimentPrompt: loc(
        '把阶数从 2 调到 5，对比曲线表达能力提升后，残差是否更容易被压低。',
        'Move degree from 2 to 5 and compare how added flexibility changes residuals.',
      ),
      presetId: 'polynomial-curve',
      metricEmphasis: ['loss'],
    },
    {
      id: 'overfitting',
      eyebrowKey: 'common.chapter',
      titleKey: 'modules.linearRegression.sections.overfitting.title',
      markdown: loc(
        `模型越复杂，不一定越好。高阶多项式可能把训练样本贴得很近，却在没见过的验证样本上表现变差。

这就是过拟合：模型记住了训练数据里的细碎波动，却没有学到更稳定的规律。

本章要同时看两条曲线：训练误差和验证误差。训练误差下降不代表泛化能力一定变好。`,
        `A more complex model is not automatically better. A high-degree polynomial may hug training samples closely while doing worse on validation samples.

That is overfitting: the model memorizes small training fluctuations instead of learning a stable pattern.

Read two curves together here: training error and validation error. Falling training error does not guarantee better generalization.`,
      ),
      callout: loc(
        '重点看训练 MSE 和验证 MSE 是否开始分叉。',
        'Watch whether training MSE and validation MSE start to split apart.',
      ),
      experimentPrompt: loc(
        '使用高阶多项式播放训练，观察曲线是否为了贴合训练点而变得过度弯折。',
        'Use a high-degree polynomial and watch whether the curve bends too much to chase training points.',
      ),
      presetId: 'overfit-warning',
      metricEmphasis: ['loss'],
    },
    {
      id: 'regularization',
      eyebrowKey: 'common.chapter',
      titleKey: 'modules.linearRegression.sections.regularization.title',
      markdown: loc(
        `正则化是在损失函数里加入“别让参数太夸张”的提醒。

L2 会惩罚权重平方，让权重整体变小；L1 会惩罚权重绝对值，更容易把一部分权重推向 0。

$$\text{loss}=\text{MSE}+\lambda\cdot\text{penalty}(w)$$

它不只是让训练误差更低，而是在训练误差和泛化能力之间做更稳的取舍。`,
        `Regularization adds a reminder to the loss: do not let the weights become too extreme.

L2 penalizes squared weights and shrinks them overall. L1 penalizes absolute weights and more easily pushes some weights toward zero.

$$\text{loss}=\text{MSE}+\lambda\cdot\text{penalty}(w)$$

The goal is not merely lower training error. It is a better tradeoff between fit and generalization.`,
      ),
      callout: loc(
        '切换 L1 / L2，比较权重范数、有效权重数量和验证误差。',
        'Switch L1 / L2 and compare weight norm, active weights, and validation error.',
      ),
      experimentPrompt: loc(
        '增大正则强度，观察曲线如何变平滑，以及哪些权重被压小。',
        'Increase regularization strength and watch the curve smooth out as weights shrink.',
      ),
      presetId: 'regularized-balance',
      metricEmphasis: ['loss'],
    },
  ],
  controls: [
    { key: 'learningRate', type: 'range', labelKey: 'controls.learningRate', category: 'optimization', min: 0.02, max: 0.24, step: 0.01, format: 'number' },
    { key: 'epochs', type: 'range', labelKey: 'controls.epochs', category: 'optimization', min: 16, max: 72, step: 2, format: 'integer' },
    { key: 'playbackMs', type: 'range', labelKey: 'controls.animationSpeed', category: 'playback', min: 70, max: 260, step: 10, format: 'speed' },
    { key: 'datasetNoise', type: 'range', labelKey: 'controls.datasetNoise', category: 'data', min: 0, max: 0.35, step: 0.01, format: 'number' },
    { key: 'outlierStrength', type: 'range', labelKey: 'controls.outlierStrength', category: 'data', min: 0, max: 120, step: 2, format: 'number' },
    { key: 'featureNoise', type: 'range', labelKey: 'controls.featureNoise', category: 'data', min: 0, max: 0.45, step: 0.01, format: 'number' },
    { key: 'polynomialDegree', type: 'range', labelKey: 'controls.polynomialDegree', category: 'architecture', min: 1, max: 7, step: 1, format: 'integer' },
    { key: 'lambda', type: 'range', labelKey: 'controls.lambda', category: 'optimization', min: 0, max: 0.8, step: 0.01, format: 'number' },
    { key: 'validationSplit', type: 'range', labelKey: 'controls.validationSplit', category: 'data', min: 0.18, max: 0.48, step: 0.01, format: 'percent' },
    {
      key: 'regularizationType',
      type: 'select',
      labelKey: 'controls.regularizationType',
      category: 'optimization',
      options: [
        { value: 'none', labelKey: 'controls.options.none' },
        { value: 'l1', labelKey: 'controls.options.l1' },
        { value: 'l2', labelKey: 'controls.options.l2' },
      ],
    },
  ],
  presets: [
    {
      id: 'baseline-fit',
      label: loc('面积主导', 'Baseline fit'),
      description: loc('低噪声、无离群点，先把“散点 + 直线”这层关系看清楚。', 'Low noise and no outlier so the scatter-line relationship is easy to read.'),
      config: {
        scenario: 'linear',
        learningRate: 0.11,
        epochs: 36,
        datasetNoise: 0.05,
        includeOutlier: false,
        outlierStrength: 36,
        initialSlope: -0.3,
        initialIntercept: 0.52,
      },
    },
    {
      id: 'residual-focus',
      label: loc('残差放大镜', 'Residual focus'),
      description: loc('打开离群点，让残差线和 MSE 的变化更容易被看见。', 'Enable an outlier so the residuals and MSE response become more visible.'),
      config: {
        scenario: 'linear',
        learningRate: 0.1,
        epochs: 34,
        datasetNoise: 0.11,
        includeOutlier: true,
        outlierStrength: 54,
        initialSlope: -0.24,
        initialIntercept: 0.5,
      },
    },
    {
      id: 'training-playback',
      label: loc('训练动态', 'Training playback'),
      description: loc('让斜率和截距从明显错误的位置开始，方便观察参数如何一路收敛。', 'Start the line from a clearly wrong state so the parameter trajectory is easy to follow.'),
      config: {
        scenario: 'linear',
        learningRate: 0.14,
        epochs: 48,
        datasetNoise: 0.08,
        includeOutlier: false,
        outlierStrength: 42,
        initialSlope: -0.42,
        initialIntercept: 0.64,
      },
    },
    {
      id: 'limits-bridge',
      label: loc('线性边界', 'Limits bridge'),
      description: loc('让高面积样本略带弯曲，再叠加离群点，观察“一条线不够”时会发生什么。', 'Bend the larger-home samples slightly and add an outlier to show the limit of one line.'),
      config: {
        scenario: 'curved',
        learningRate: 0.12,
        epochs: 44,
        datasetNoise: 0.07,
        includeOutlier: true,
        outlierStrength: 46,
        initialSlope: -0.28,
        initialIntercept: 0.54,
      },
    },
    {
      id: 'multivariate-plane',
      label: loc('面积 + 房龄平面', 'Area + age plane'),
      description: loc('加入房龄特征，让一条线扩展成 3D 空间里的回归平面。', 'Add home age so one line becomes a regression plane in 3D.'),
      config: {
        scenario: 'multivariate',
        learningRate: 0.08,
        epochs: 46,
        featureNoise: 0.08,
        datasetNoise: 0.08,
        includeOutlier: false,
      },
    },
    {
      id: 'polynomial-curve',
      label: loc('二次曲线拟合', 'Quadratic curve'),
      description: loc('用二次特征表达轻微弯曲的面积-房价关系。', 'Use a quadratic feature to express a gently curved area-price relationship.'),
      config: {
        scenario: 'polynomial',
        learningRate: 0.07,
        epochs: 54,
        datasetNoise: 0.1,
        polynomialDegree: 2,
        validationSplit: 0.32,
        regularizationType: 'none',
        lambda: 0,
      },
    },
    {
      id: 'overfit-warning',
      label: loc('高阶过拟合', 'High-degree overfit'),
      description: loc('用六阶曲线观察训练误差下降和验证误差分叉。', 'Use a sixth-degree curve to watch training and validation errors split.'),
      config: {
        scenario: 'overfit',
        learningRate: 0.06,
        epochs: 70,
        datasetNoise: 0.18,
        polynomialDegree: 6,
        validationSplit: 0.35,
        regularizationType: 'none',
        lambda: 0,
      },
    },
    {
      id: 'regularized-balance',
      label: loc('正则化约束', 'Regularized balance'),
      description: loc('在高阶曲线上切换 L1 / L2，观察权重收缩与验证误差。', 'Switch L1 / L2 on a high-degree curve and compare weight shrinkage with validation error.'),
      config: {
        scenario: 'regularized',
        learningRate: 0.055,
        epochs: 70,
        datasetNoise: 0.16,
        polynomialDegree: 6,
        validationSplit: 0.35,
        regularizationType: 'l2',
        lambda: 0.28,
      },
    },
  ],
  createDefaultConfig: () => ({
    learningRate: 0.11,
    epochs: 36,
    playbackMs: 120,
    datasetNoise: 0.05,
    outlierStrength: 36,
    includeOutlier: false,
    scenario: 'linear',
    initialSlope: -0.3,
    initialIntercept: 0.52,
    featureNoise: 0.08,
    polynomialDegree: 2,
    validationSplit: 0.32,
    regularizationType: 'none',
    lambda: 0,
  }),
  simulate: simulateLinearRegression,
}

linearRegressionModule.chapters = linearRegressionModule.chapters.map((chapter) => {
  const frame = linearRegressionTeachingFrames[chapter.id]
  if (!frame) return chapter

  return {
    ...chapter,
    markdown: withTeachingFrame(chapter.markdown, frame),
  }
})
