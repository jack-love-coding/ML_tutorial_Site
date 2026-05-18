import type { AlgorithmModuleDefinition, LocalizedCopy, StorySection } from '../types/ml'
import { simulateGradientDescent } from '../simulations/gradientDescent'
import {
  defaultGradientLossFunctionId,
  getGradientLossFunctionDefinition,
} from '../simulations/gradientLossFunctions'
import { algorithmCheckpointsBySlug } from './algorithmCheckpoints'

const defaultFunction = getGradientLossFunctionDefinition(defaultGradientLossFunctionId)

function loc(zhCN: string, en: string): LocalizedCopy {
  return { 'zh-CN': zhCN, en }
}

function teachingBlocks(
  concept: LocalizedCopy,
  workedExample: LocalizedCopy,
  formula: LocalizedCopy,
  commonMistake: LocalizedCopy,
  rememberThis: LocalizedCopy,
) {
  return { concept, workedExample, formula, commonMistake, rememberThis }
}

const chapters: StorySection[] = [
  {
    id: 'loss-function',
    eyebrowKey: 'common.chapter',
    titleKey: 'modules.gradientDescent.sections.lossFunction.title',
    markdown: loc(
      '先把优化问题看成一张“参数地图”，再去谈更新规则。',
      'Treat optimization as a map over parameter space before talking about update rules.',
    ),
    teachingBlocks: teachingBlocks(
      loc(
        `梯度下降真正优化的不是“动作本身”，而是一个目标函数 $L(\\mathbf{w})$。  
参数空间里的每一个点，都代表一组模型参数；损失函数会把这个点映射成一个数值。数值越低，通常表示模型行为越接近我们想要的目标。

所以你可以把优化理解成一张地形图：

- 一个点 = 一组参数
- 高度 = 这组参数下的损失
- 山谷 = 较好的参数区域
- 山脊、鞍点、多井 = 不同的优化难点

先有这张地图，后面才谈得上“应该往哪走、一次走多远”。`,
        `Gradient descent does not truly optimize motion. It optimizes an objective function $L(\\mathbf{w})$.  
Every point in parameter space stands for one parameter setting, and the loss maps that setting to a number. Lower numbers usually mean the model behaves more like we want.

So think of optimization as a landscape:

- one point = one parameter setting
- height = the loss at that setting
- valleys = better parameter regions
- ridges, saddles, and wells = different optimization challenges

The map comes first. Only then does it make sense to ask where to move or how far to step.`,
      ),
      loc(
        `看一个简单二次碗：$L(x, y)=0.45(x-0.3)^2+0.85(y+0.45)^2$。

如果比较三个点：

- 点 A: $(2.4, -1.8)$，离低谷很远，所以损失较高
- 点 B: $(1.0, -0.9)$，更靠近谷底，所以损失明显下降
- 点 C: $(0.3, -0.45)$，正好在最低点，所以损失最小

这一步最重要的直觉是：  
**优化不是直接在“预测值”上乱试，而是在参数空间里给每个候选参数打分。**`,
        `Consider a simple quadratic bowl: $L(x, y)=0.45(x-0.3)^2+0.85(y+0.45)^2$.

Compare three points:

- point A: $(2.4, -1.8)$ sits far from the basin, so the loss is high
- point B: $(1.0, -0.9)$ is closer to the floor, so the loss drops
- point C: $(0.3, -0.45)$ sits at the minimum, so the loss is smallest

The key intuition is this:  
**optimization is not random guessing on outputs. It is scoring candidate parameter settings inside parameter space.**`,
      ),
      loc(
        `我们希望找到让损失尽量小的参数，因此写成：

$$\\min_{\\mathbf{w}} L(\\mathbf{w})$$

这行公式的意思很朴素：

- $\\mathbf{w}$ 是当前参数
- $L(\\mathbf{w})$ 是这组参数对应的损失
- $\\min$ 表示我们想找“更低”的地方

后面所有梯度、学习率、batch 噪声，都是围绕这一个目标服务的。`,
        `We want parameter values that make the loss as small as possible, so we write:

$$\\min_{\\mathbf{w}} L(\\mathbf{w})$$

This formula says:

- $\\mathbf{w}$ is the current parameter vector
- $L(\\mathbf{w})$ is the loss at that parameter setting
- $\\min$ means we are searching for lower terrain

Everything that follows, from gradients to learning rates to noisy batches, serves this one objective.`,
      ),
      loc(
        `**常见误解**  
不要把“损失函数”理解成某种可有可无的公式装饰。  
如果评分规则变了，什么算“更好”的参数就会变；优化路径、收敛位置，甚至模型偏好都会跟着变。`,
        `**Common mistake**  
Do not treat the loss as decorative math.  
Change the scoring rule, and you change what counts as a better parameter setting. The path, the destination, and even the model preference can all change with it.`,
      ),
      loc(
        `先问“什么参数更好”，再问“怎样走到那里”。  
损失函数是地图，梯度下降只是地图上的移动规则。`,
        `First ask what makes a parameter setting better. Then ask how to move there.  
The loss is the map. Gradient descent is only the movement rule on that map.`,
      ),
    ),
    callout: loc(
      '先别急着调学习率。先比较地形本身，再问自己：这张地图想把参数推向哪里？',
      'Do not tune the learning rate first. Compare the landscape itself and ask where it wants the parameters to go.',
    ),
    experimentPrompt: loc(
      '先只切换函数和起点，暂时别动其它超参数，观察路径会怎样因为地形而改变。',
      'Change only the function and the start point first. Leave the other hyperparameters fixed and watch how the path changes with the terrain.',
    ),
    layoutMode: 'embedded-lab',
    embeddedLabId: 'gradient-loss-lab',
    presetId: 'stable-convergence',
    recommendedFunctionId: 'quadratic-bowl',
    focusTarget: 'surface',
    linkedInsightIds: ['gradient-function'],
    metricEmphasis: ['loss', 'status'],
  },
  {
    id: 'landscape',
    eyebrowKey: 'common.chapter',
    titleKey: 'modules.gradientDescent.sections.landscape.title',
    markdown: loc(
      '把 3D 曲面和 2D 等高线对上号，轨迹才会开始“有地形感”。',
      'Once the 3D surface and 2D contour map line up in your head, trajectories start feeling like terrain response.',
    ),
    teachingBlocks: teachingBlocks(
      loc(
        `3D 曲面强调“高度”，2D 等高线强调“形状”。  
它们画的是同一个损失函数，只是视角不同。

3D 曲面帮你回答：

- 哪里高，哪里低？
- 谷底是直的还是弯的？
- 有没有明显的鞍点或局部坑？

2D 等高线帮你回答：

- 哪些区域变化快？
- 哪条方向更陡？
- 路径为什么会左右摆动而不是笔直冲向终点？`,
        `The 3D surface emphasizes height. The 2D contour map emphasizes shape.  
They describe the same loss function from different viewpoints.

The 3D surface helps you see:

- where the terrain is high or low
- whether a valley is straight or curved
- whether saddles or local wells are present

The contour map helps you see:

- where the loss changes quickly
- which direction is steeper
- why the path zig-zags instead of heading straight to the end`,
      ),
      loc(
        `设想你站在峡谷侧壁：

- 如果等高线很密，说明你附近“高度变化”很快
- 如果谷地方向很长很窄，说明一个方向陡、另一个方向平

这时路径常常会这样走：

1. 先在陡方向上来回越过谷底
2. 再慢慢沿着谷底前进

所以你看到的折线路径，不是随机抖动，而是在回应地形各个方向的难易程度。`,
        `Imagine starting on the wall of a narrow ravine:

- dense contours mean the local height changes quickly
- a long thin valley means one direction is steep while the other is flat

The path often behaves like this:

1. it first overshoots across the steep direction
2. then it slowly progresses along the valley floor

So the broken-looking path is not random noise. It is the optimizer responding to how hard or easy each direction is.`,
      ),
      loc(
        `等高线表示“同损失值”的点集，因此常写成：

$$L(x, y)=c$$

这里的 $c$ 是某个固定常数。  
如果两点在同一条等高线上，说明它们的损失一样高；  
如果等高线之间挤得很密，说明稍微移动一点，损失就会变化很多。`,
        `A contour line is the set of points with the same loss value, so we write:

$$L(x, y)=c$$

Here $c$ is a fixed constant.  
If two points lie on the same contour, they have the same loss.  
If contours are tightly packed, a small move changes the loss a lot.`,
      ),
      loc(
        `**常见误解**  
不要把等高线图看成“另一种数据图”。  
它不是和 3D 曲面无关的替代品，而是同一张地形图从上往下看的结果。`,
        `**Common mistake**  
Do not think of the contour plot as a separate chart.  
It is not an alternative to the 3D surface. It is the same terrain viewed from above.`,
      ),
      loc(
        `3D 曲面负责建立“高低”直觉，2D 等高线负责解释“路径”直觉。  
看懂这两个视角的对应关系，轨迹才真正开始有意义。`,
        `The 3D surface builds height intuition. The 2D contour map explains path intuition.  
Once those two views align, the trajectory starts to make sense.`,
      ),
    ),
    callout: loc(
      '优先看等高线间距和谷地方向，它们会直接塑造路径形状。',
      'Focus first on contour spacing and valley direction. They directly shape the path.',
    ),
    experimentPrompt: loc(
      '把起点拖到谷地侧壁，再观察路径是否先左右摆动，随后才贴近谷底。',
      'Drag the start point onto a valley wall and watch whether the path zig-zags before settling into the valley floor.',
    ),
    presetId: 'ravine-zigzag',
    recommendedFunctionId: 'tilted-ravine',
    focusTarget: 'contour',
    linkedInsightIds: ['gradient-topology', 'gradient-function'],
    metricEmphasis: ['loss', 'referenceDistance'],
  },
  {
    id: 'gradient-rule',
    eyebrowKey: 'common.chapter',
    titleKey: 'modules.gradientDescent.sections.gradientRule.title',
    markdown: loc(
      '先分清偏导、梯度、负梯度，更新规则才不只是死记公式。',
      'Separate partial derivatives, the gradient, and the negative gradient so the update rule stops feeling like memorized syntax.',
    ),
    teachingBlocks: teachingBlocks(
      loc(
        `偏导数告诉我们：只沿某一个坐标方向轻轻挪动时，损失会怎样变化。  
把所有偏导数收集起来，就得到梯度：

$$\\nabla L(\\mathbf{w})=\\left[\\frac{\\partial L}{\\partial w_1}, \\frac{\\partial L}{\\partial w_2}, \\dots \\right]$$

梯度指向当前位置“上升最快”的方向。  
如果我们想让损失下降，就必须往它的反方向走，也就是**负梯度方向**。`,
        `A partial derivative tells us how the loss changes when we nudge only one coordinate direction.  
Collect all of those partial derivatives together, and we get the gradient:

$$\\nabla L(\\mathbf{w})=\\left[\\frac{\\partial L}{\\partial w_1}, \\frac{\\partial L}{\\partial w_2}, \\dots \\right]$$

The gradient points in the direction of steepest local increase.  
If we want the loss to go down, we must move in the opposite direction: the **negative gradient**.`,
      ),
      loc(
        `用一个最小手算例子：

$$L(x, y)=x^2+2y^2$$

在点 $(1, -0.5)$：

- $\\frac{\\partial L}{\\partial x}=2x=2$
- $\\frac{\\partial L}{\\partial y}=4y=-2$

所以梯度是：

$$\\nabla L(1, -0.5)=(2, -2)$$

如果学习率 $\\eta=0.1$，那一步更新就是：

$$
(x, y)_{\\text{next}}
=(1, -0.5)-0.1(2, -2)
=(0.8, -0.3)
$$

注意这里不是“朝梯度走”，而是**减去梯度**。`,
        `Use a minimal worked example:

$$L(x, y)=x^2+2y^2$$

At the point $(1, -0.5)$:

- $\\frac{\\partial L}{\\partial x}=2x=2$
- $\\frac{\\partial L}{\\partial y}=4y=-2$

So the gradient is:

$$\\nabla L(1, -0.5)=(2, -2)$$

If the learning rate is $\\eta=0.1$, one update gives:

$$
(x, y)_{\\text{next}}
=(1, -0.5)-0.1(2, -2)
=(0.8, -0.3)
$$

Notice that we do not move “with” the gradient. We subtract it.`,
      ),
      loc(
        `梯度下降的核心更新式是：

$$\\mathbf{w}_{t+1}=\\mathbf{w}_t-\\eta\\nabla L(\\mathbf{w}_t)$$

其中：

- $\\mathbf{w}_t$ 是当前参数
- $\\nabla L(\\mathbf{w}_t)$ 是当前位置的梯度
- $\\eta$ 是学习率，负责决定这次走多远

所以这行公式其实可以翻译成一句白话：  
**先问当前位置上升最快的方向，再朝反方向走一小步。**`,
        `The core update rule of gradient descent is:

$$\\mathbf{w}_{t+1}=\\mathbf{w}_t-\\eta\\nabla L(\\mathbf{w}_t)$$

Here:

- $\\mathbf{w}_t$ is the current parameter vector
- $\\nabla L(\\mathbf{w}_t)$ is the local gradient
- $\\eta$ is the learning rate that decides how far to move

So the plain-language version is:  
**find the direction of steepest local rise, then take a small step in the opposite direction.**`,
      ),
      loc(
        `**常见误解**  
不要说“梯度就是下降方向”。  
梯度本身指向的是上升最快方向；真正让损失下降的，是负梯度。`,
        `**Common mistake**  
Do not say “the gradient is the descent direction.”  
The gradient itself points uphill. Descent happens because we move along the negative gradient.`,
      ),
      loc(
        `偏导告诉你每个坐标各自怎么变；梯度把它们合成一个局部方向建议。  
梯度下降的关键不是“看箭头”，而是“沿反方向走”。`,
        `Partial derivatives tell you what each coordinate wants to do. The gradient combines them into one local direction recommendation.  
Gradient descent works because we move against that arrow, not with it.`,
      ),
    ),
    callout: loc(
      '同时盯住当前点和梯度箭头。箭头不是装饰，而是当前位置的局部更新建议。',
      'Watch the current point and the gradient arrow together. The arrow is the local update recommendation.',
    ),
    experimentPrompt: loc(
      '先播放几步，再切到单步模式，观察梯度方向和长度如何随着位置变化。',
      'Play a few steps, then switch to single-step mode and observe how the direction and length change with position.',
    ),
    presetId: 'stable-convergence',
    recommendedFunctionId: 'quadratic-bowl',
    focusTarget: 'gradient',
    linkedInsightIds: ['gradient-status'],
    metricEmphasis: ['gradientNorm', 'stepSize'],
  },
  {
    id: 'learning-rate',
    eyebrowKey: 'common.chapter',
    titleKey: 'modules.gradientDescent.sections.learningRate.title',
    markdown: loc(
      '同一个方向建议，步子走多大，会决定你是稳步下坡还是来回震荡。',
      'The same direction recommendation can lead to steady descent or violent oscillation depending on how large the step is.',
    ),
    teachingBlocks: teachingBlocks(
      loc(
        `学习率 $\\eta$ 决定一次更新走多远。  
如果方向选对了，但步子太小，训练会很慢；  
如果方向选对了，但步子太大，就会越过谷底，甚至直接发散。

所以学习率不是“越大越快越好”，而是在速度和稳定之间做取舍。`,
        `The learning rate $\\eta$ decides how far one update travels.  
If the direction is correct but the step is too small, training is slow.  
If the direction is correct but the step is too large, the optimizer overshoots the valley floor or even diverges.

So the learning rate is not “bigger is always better.” It is a tradeoff between speed and stability.`,
      ),
      loc(
        `假设当前位置梯度范数约为 $\\|\\nabla L\\|=3$：

- 如果 $\\eta=0.05$，那一步的长度大约是 $0.15$
- 如果 $\\eta=0.4$，那一步的长度大约是 $1.2$

在宽而平滑的碗里，大一点的步长可能还能忍受；  
但在狭长峡谷里，$1.2$ 这种步长往往会直接跨过谷底，导致路径左右来回反弹。`,
        `Suppose the current gradient norm is about $\\|\\nabla L\\|=3$:

- if $\\eta=0.05$, the step length is about $0.15$
- if $\\eta=0.4$, the step length is about $1.2$

Inside a wide smooth bowl, a larger step may still be tolerable.  
Inside a narrow ravine, a step like $1.2$ often jumps across the valley floor and creates a bouncing trajectory.`,
      ),
      loc(
        `更新量可以写成：

$$\\Delta \\mathbf{w}=-\\eta\\nabla L(\\mathbf{w})$$

如果只关心这一步大概有多长，可以看：

$$\\|\\Delta \\mathbf{w}\\| \\approx \\eta\\|\\nabla L(\\mathbf{w})\\|$$

这解释了为什么同一个地形里，学习率一调大，路径马上就会从“贴谷滑行”变成“跨谷震荡”。`,
        `The update can be written as:

$$\\Delta \\mathbf{w}=-\\eta\\nabla L(\\mathbf{w})$$

If you only care about how long the step is, look at:

$$\\|\\Delta \\mathbf{w}\\| \\approx \\eta\\|\\nabla L(\\mathbf{w})\\|$$

That is why increasing the learning rate can immediately turn a valley-following path into an oscillating one.`,
      ),
      loc(
        `**常见误解**  
不要把学习率理解成“训练速度”的同义词。  
它控制的是参数空间里的步长，不是墙上时钟走得多快。步长太大反而可能让你更慢，因为会不停越界、回摆甚至发散。`,
        `**Common mistake**  
Do not treat the learning rate as a synonym for training speed.  
It controls step length in parameter space, not wall-clock speed. A step that is too large can actually slow you down because it keeps overshooting or diverging.`,
      ),
      loc(
        `学习率决定的不是“敢不敢动”，而是“每次动多少”。  
好学习率让路径稳定接近低谷；坏学习率让路径不断越界。`,
        `The learning rate does not decide whether to move. It decides how far to move.  
A good one lets the path settle into the valley. A bad one keeps pushing the path across it.`,
      ),
    ),
    callout: loc(
      '这一章要比的不是单纯谁更快，而是谁能在够快的同时保持稳定。',
      'The point of this chapter is not raw speed alone. It is speed with stability.',
    ),
    experimentPrompt: loc(
      '先打开“峡谷锯齿”预设，再逐步降低学习率，观察路径何时从震荡变成贴谷下降。',
      'Open the ravine preset, then lower the learning rate gradually and watch when the path stops oscillating.',
    ),
    presetId: 'ravine-zigzag',
    recommendedFunctionId: 'tilted-ravine',
    focusTarget: 'trajectory',
    linkedInsightIds: ['gradient-status', 'gradient-speed'],
    metricEmphasis: ['stepSize', 'loss'],
  },
  {
    id: 'saddle-local-minima',
    eyebrowKey: 'common.chapter',
    titleKey: 'modules.gradientDescent.sections.saddleLocalMinima.title',
    markdown: loc(
      '小梯度、低损失、真正最优，这三件事必须分开理解。',
      'Small gradient, low loss, and true optimum must be kept separate in your head.',
    ),
    teachingBlocks: teachingBlocks(
      loc(
        `一看到梯度变小，初学者很容易以为“训练结束了”。  
但优化里至少要分清三件事：

- 梯度小：局部地看，附近变化不大
- 损失低：当前位置的数值确实不错
- 真正最优：这是你想找的最好位置

鞍点附近可以梯度很小，但并不是好解；  
非凸地形里也可能有很多局部低谷，起点不同，最后会落在不同地方。`,
        `When the gradient becomes small, beginners often assume training is done.  
But optimization requires separating at least three ideas:

- small gradient: the surface is locally flat-ish
- low loss: the current value is numerically good
- true optimum: this is actually the best place you want

Near a saddle, the gradient can be small without being a good solution.  
On a non-convex surface, different starts can also end in different local basins.`,
      ),
      loc(
        `看最简单的鞍点原型：

$$L(x, y)=x^2-y^2$$

在原点 $(0, 0)$，梯度确实是 $0$。  
但如果你沿 $x$ 方向走，损失会上升；沿 $y$ 方向走，损失会下降。  
这说明原点不是“谷底”，只是一个上坡和下坡方向交叉的地方。

再看多井地形：  
从左上角和右下角出发，最终可能掉进完全不同的局部低谷。`,
        `Look at the simplest saddle prototype:

$$L(x, y)=x^2-y^2$$

At the origin $(0, 0)$, the gradient really is $0$.  
But move along the $x$ direction and the loss rises; move along the $y$ direction and the loss falls.  
So the origin is not a valley floor. It is only a crossing point between uphill and downhill directions.

Now look at a multi-well surface:  
starting from the upper left versus the lower right can send optimization into entirely different local basins.`,
      ),
      loc(
        `这也是为什么我们常写：

$$\\lVert \\nabla L(\\mathbf{w}) \\rVert \\approx 0 \\;\\not\\Rightarrow\\; \\mathbf{w} \\text{ is optimal}$$

梯度范数接近 0，只能说明“局部变化变小了”。  
它不能单独证明你已经到了全局最优，甚至不能保证你在一个好的局部最优里。`,
        `This is why we often write:

$$\\lVert \\nabla L(\\mathbf{w}) \\rVert \\approx 0 \\;\\not\\Rightarrow\\; \\mathbf{w} \\text{ is optimal}$$

A small gradient norm only tells you that the local change has become small.  
It does not prove that you reached the global optimum, or even a good local one.`,
      ),
      loc(
        `**常见误解**  
不要把“梯度已经很小”直接翻译成“训练已经完成”。  
优化不仅看数值，还要看几何结构：你在谷底、平台、鞍点，还是某个局部井里？`,
        `**Common mistake**  
Do not translate “the gradient is small” into “training is finished.”  
Optimization is geometric as well as numeric: are you in a valley, on a plateau, near a saddle, or trapped in a local well?`,
      ),
      loc(
        `小梯度只是线索，不是结论。  
要判断优化是否真的成功，必须同时看地形结构、损失值和起点依赖。`,
        `A small gradient is only a clue, not a verdict.  
To judge optimization well, you must look at geometry, loss level, and start-point dependence together.`,
      ),
    ),
    callout: loc(
      '请把“小梯度”“低损失”和“真正最优”分开，它们并不是同义词。',
      'Separate small gradient, low loss, and true optimum. They are not synonyms.',
    ),
    experimentPrompt: loc(
      '分别试试“鞍点停滞”和“局部最小值”预设，再改变起点比较最终落到哪里。',
      'Try the saddle preset and the local-minimum preset, then change the start point and compare where optimization ends.',
    ),
    presetId: 'multiwell-trap',
    recommendedFunctionId: 'multi-well',
    focusTarget: 'reference',
    linkedInsightIds: ['gradient-topology', 'gradient-function'],
    metricEmphasis: ['gradientNorm', 'referenceDistance', 'status'],
  },
  {
    id: 'noise-and-batch',
    eyebrowKey: 'common.chapter',
    titleKey: 'modules.gradientDescent.sections.noiseAndBatch.title',
    markdown: loc(
      '噪声不会只让轨迹更乱，它会改变你对“是否收敛”的判断。',
      'Noise does more than make the path messy. It changes what convergence looks like.',
    ),
    teachingBlocks: teachingBlocks(
      loc(
        `在真实训练里，梯度并不总是来自整批数据。  
如果你用 full batch、mini-batch 或 stochastic 更新，同一张地形上的路径会明显不同。

- full batch：方向更稳定，轨迹更平滑
- mini-batch：方向会轻微抖动
- stochastic：方向波动最大，但最接近“样本级更新”的体验

所以“轨迹发抖”不一定意味着坏事，它可能只是采样更 noisy。`,
        `In real training, the gradient does not always come from the full dataset.  
With full-batch, mini-batch, or stochastic updates, the same landscape can produce visibly different paths.

- full batch: more stable direction, smoother path
- mini-batch: modest jitter
- stochastic: largest variation, closest to sample-level updates

So a shaky trajectory is not automatically a bad sign. It may simply reflect noisier sampling.`,
      ),
      loc(
        `假设三个小批次在同一点给出的梯度分别是：

- $2.0$
- $1.8$
- $2.2$

那 full batch 会更像使用平均值 $2.0$；  
而 stochastic update 可能这一轮拿到 $1.8$，下一轮又拿到 $2.2$。

结果就是：

- 总体方向仍然大致朝向低谷
- 但每一步的轨迹更抖、更不平滑`,
        `Suppose three small batches produce these gradients at the same point:

- $2.0$
- $1.8$
- $2.2$

Then full-batch descent behaves more like the average value $2.0$;  
stochastic descent may use $1.8$ on one step and $2.2$ on the next.

The result is:

- the overall direction still points roughly downhill
- but the step-to-step path becomes shakier and less smooth`,
      ),
      loc(
        `一个常见的抽象写法是：

$$g_t = \\nabla L(\\mathbf{w}_t) + \\epsilon_t$$

这里：

- $\\nabla L(\\mathbf{w}_t)$ 是“理想的平均梯度”
- $\\epsilon_t$ 表示采样带来的噪声

所以 noisy gradient 不是“完全错误的方向”，而是“围绕真实方向抖动的近似方向”。`,
        `A common abstract form is:

$$g_t = \\nabla L(\\mathbf{w}_t) + \\epsilon_t$$

Here:

- $\\nabla L(\\mathbf{w}_t)$ is the ideal average gradient
- $\\epsilon_t$ represents sampling noise

So a noisy gradient is not a totally wrong direction. It is an approximate direction that jitters around the true one.`,
      ),
      loc(
        `**常见误解**  
不要把“轨迹抖动”直接看成“训练失败”。  
真正要比较的是：长期趋势是否往下、最终损失是否合理、抖动是否来自 batch 噪声而不是学习率失控。`,
        `**Common mistake**  
Do not interpret jitter as immediate failure.  
The real questions are: is the long-run trend still downward, is the final loss reasonable, and is the wobble caused by batch noise rather than an unstable learning rate?`,
      ),
      loc(
        `batch mode 改变的不是目标函数，而是你每一步对梯度的估计方式。  
因此它改变的是“路径气质”，不一定改变你最终想去的方向。`,
        `Batch mode does not change the objective itself. It changes how each step estimates the gradient.  
So it changes the style of the path, not necessarily the direction you ultimately want to go.`,
      ),
    ),
    callout: loc(
      '切换 batch mode 时，优先看轨迹抖动和长期趋势，而不是只盯着某一步。',
      'When switching batch mode, watch the jitter and the long-run trend rather than any single step.',
    ),
    experimentPrompt: loc(
      '保持函数和学习率不变，只切换 full、mini-batch 和 stochastic，比较三条路径的差异。',
      'Keep the function and learning rate fixed, then switch between full, mini-batch, and stochastic updates.',
    ),
    presetId: 'noisy-path',
    recommendedFunctionId: 'rosenbrock',
    focusTarget: 'trajectory',
    linkedInsightIds: ['gradient-speed', 'gradient-status'],
    metricEmphasis: ['loss', 'status'],
  },
]

export const gradientDescentModule: AlgorithmModuleDefinition = {
  slug: 'gradient-descent',
  route: '/learn/gradient-descent',
  titleKey: 'modules.gradientDescent.title',
  kickerKey: 'modules.gradientDescent.kicker',
  introKey: 'modules.gradientDescent.intro',
  summaryKey: 'modules.gradientDescent.summary',
  theme: '#f4efe3',
  accent: '#ff7d4d',
  checkpoints: algorithmCheckpointsBySlug['gradient-descent'],
  chapters,
  controls: [
    {
      key: 'learningRate',
      type: 'range',
      labelKey: 'controls.learningRate',
      category: 'optimization',
      min: 0.01,
      max: 0.75,
      step: 0.01,
      format: 'number',
    },
    {
      key: 'batchMode',
      type: 'select',
      labelKey: 'controls.batchMode',
      category: 'optimization',
      options: [
        { value: 'full', labelKey: 'controls.options.fullBatch' },
        { value: 'mini-batch', labelKey: 'controls.options.miniBatch' },
        { value: 'stochastic', labelKey: 'controls.options.stochastic' },
      ],
    },
    {
      key: 'iterations',
      type: 'range',
      labelKey: 'controls.iterations',
      category: 'optimization',
      min: 24,
      max: 100,
      step: 1,
      format: 'integer',
    },
    {
      key: 'playbackMs',
      type: 'range',
      labelKey: 'controls.animationSpeed',
      category: 'playback',
      min: 60,
      max: 280,
      step: 10,
      format: 'speed',
    },
  ],
  presets: [
    {
      id: 'stable-convergence',
      label: loc('稳定收敛', 'Stable convergence'),
      description: loc(
        '在标准凸碗里用适中的学习率稳定下坡，适合建立第一眼直觉。',
        'A moderate learning rate on a convex bowl for the cleanest first descent.',
      ),
      config: {
        lossFunction: 'quadratic-bowl',
        learningRate: 0.18,
        startX: 2.4,
        startY: -1.8,
        batchMode: 'full',
      },
    },
    {
      id: 'ravine-zigzag',
      label: loc('峡谷锯齿', 'Ravine zig-zag'),
      description: loc(
        '狭长谷地配上偏大的学习率，会让轨迹在谷地两侧来回横跳。',
        'A narrow ravine plus a larger learning rate creates the classic zig-zag path.',
      ),
      config: {
        lossFunction: 'tilted-ravine',
        learningRate: 0.28,
        startX: 2.2,
        startY: 2.1,
        batchMode: 'full',
      },
    },
    {
      id: 'saddle-stall',
      label: loc('鞍点停滞', 'Saddle stall'),
      description: loc(
        '从鞍点附近出发时，梯度会变小，但这并不代表真的进入低谷。',
        'Starting near a saddle produces small gradients without reaching a good basin.',
      ),
      config: {
        lossFunction: 'saddle',
        learningRate: 0.14,
        startX: 0.45,
        startY: 0.55,
        batchMode: 'full',
      },
    },
    {
      id: 'multiwell-trap',
      label: loc('局部最小值', 'Local minimum trap'),
      description: loc(
        '换不同起点会落进不同低谷，是讲非凸优化最直观的一组实验。',
        'Different starts fall into different basins, making non-convex optimization easy to see.',
      ),
      config: {
        lossFunction: 'multi-well',
        learningRate: 0.11,
        startX: 2.1,
        startY: -1.9,
        batchMode: 'mini-batch',
      },
    },
    {
      id: 'noisy-path',
      label: loc('噪声路径', 'Noisy path'),
      description: loc(
        '把随机噪声带回轨迹里，比较它和全量梯度下降的差异。',
        'Bring noise back into the path and compare it with full-batch descent.',
      ),
      config: {
        lossFunction: 'rosenbrock',
        learningRate: 0.045,
        startX: -1.5,
        startY: 1.8,
        batchMode: 'stochastic',
      },
    },
  ],
  createDefaultConfig: () => ({
    lossFunction: defaultGradientLossFunctionId,
    learningRate: defaultFunction.recommendedLearningRate,
    startX: defaultFunction.defaultStart.x,
    startY: defaultFunction.defaultStart.y,
    batchMode: 'full',
    iterations: 56,
    playbackMs: 110,
  }),
  simulate: simulateGradientDescent,
}
