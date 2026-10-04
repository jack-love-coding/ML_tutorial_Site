import type { LocalizedCopy, MathLabModule, MathLabSection, VisualAsset } from '../types/mathLab.ts'

const copy = (zhCN: string, en: string): LocalizedCopy => ({ 'zh-CN': zhCN, en })

// Final lesson body. Maintain this provider directly; no historical enhancer applies to it.
const sections: MathLabSection[] = [
  {
    id: "descent-loss-valley-case",
    level: 2,
    title: copy("案例：loss valley 和负梯度", "Case: Loss Valley and Negative Gradient"),
    content: copy("把 loss 想成山谷。梯度指向上坡最快，负梯度指向局部下坡方向。训练不是一跳到底，而是在 loss valley 中根据当前局部地图迈步。", "Imagine loss as a valley landscape. The gradient points toward fastest uphill increase, while the negative gradient points locally downhill. Training does not jump to the bottom in one move. It reads the local map at the current parameter position and takes one update step. This case links the derivative sign, the gradient vector, and visible training behavior in the same story."),
    visualIds: ["learning-rate-image", "learning-rate-video"],
    labIds: ["calculus-gradient-path-lab"],
  },
  {
    id: "v3-descent-shared-update",
    level: 2,
    title: copy("同一起点的一次更新：负号不等于参数一定变小", "One Update from the Same Start: Subtraction Does Not Mean Every Parameter Shrinks"),
    content: copy(`当前梯度是 **grad_w=[0,-5]**、**grad_b=-1**。取学习率 0.05，更新为 **w_new = [4,-0.75]**、**b_new = 5.05**。\\(w_2\\) 和 \\(b\\) 都变大，因为它们的梯度为负，而更新规则减去负数。第一项保持 4，因为当前 \\(w_1\\) 梯度为 0。

新预测是 **[10.8,6.05]**，新残差是 **[1.8,-0.95]**，MSE 从 2.5 降到 2.07125。这个结果同时核对方向、步长和真实函数值。只看参数变大或变小没有意义；必须重新前向计算，确认 loss 对这次有限步长的响应。`, `The current gradients are grad_w=[0,-5] and grad_b=-1. With learning rate 0.05, the updated values are w_new=[4,-0.75] and b_new=5.05. Both \\(w_2\\) and \\(b\\) increase because their gradients are negative and the update subtracts a negative number. The first weight stays at 4 because its current gradient is zero.

New predictions are [10.8,6.05], residuals are [1.8,-0.95], and MSE falls from 2.5 to 2.07125. This checks direction, step size, and the real function value together. Parameter values becoming larger or smaller is not the criterion; run the forward calculation again and inspect how loss responds to the finite step.`),
  },
  {
    id: "descent-minus-sign",
    level: 2,
    title: copy("减号：subtract 不等于参数都变小", "Minus Sign: Subtract Does Not Mean Every Parameter Gets Smaller"),
    content: copy("公式里的 subtract 是减去梯度方向，不表示 not every parameter gets smaller。若梯度分量为负，减去它会让对应参数变大。真正目标是 loss 下降。", "The subtract operation removes the uphill gradient direction, but it does not mean every parameter gets smaller. If a gradient component is negative, subtracting it increases that parameter. The correct object to watch is loss, not whether every parameter value decreased. This distinction matters when reading optimizer logs, because healthy training can include some parameters increasing while the objective falls."),
  },
  {
    id: "v3-descent-rate-comparison",
    level: 2,
    title: copy("同一方向、两个学习率：0.05 下降，0.10 反而上升", "One Direction, Two Learning Rates: 0.05 Descends, 0.10 Rises"),
    content: copy(`把学习率改成 0.10，方向仍是负梯度，参数变为 **w=[4,-0.5]**、**b=5.1**，但新 MSE 是 3.385，比起点更高。原因不是梯度方向算反了，而是有限步长跨过了当前局部近似适用的区域。局部最速下降只对足够小的移动给出一阶保证。

因此一次训练步应记录旧 loss、gradient norm、learning rate、更新量和新 loss。若 loss 上升，先缩小步长并核对梯度，再考虑曲率、batch 噪声或实现错误。学习率不是装饰性超参数，它把局部斜率换算成真实位移。`, `Change the learning rate to 0.10. The direction remains the negative gradient and parameters become w=[4,-0.5], b=5.1, yet the new MSE is 3.385, higher than the starting value. The gradient was not reversed; the finite step crossed beyond the region where the current local approximation was reliable. Steepest local descent gives a first-order guarantee only for a sufficiently small move.

A training step should therefore retain old loss, gradient norm, learning rate, parameter change, and new loss. When loss rises, reduce the step and verify gradients before investigating curvature, batch noise, or implementation errors. Learning rate is the conversion from local slope to an actual displacement.`),
  },
  {
    id: "descent-learning-rate",
    level: 2,
    title: copy("学习率：震荡和发散", "Learning Rate: Oscillation and Divergence"),
    content: copy("学习率决定沿负梯度走多远。学习率太小会慢，合适会下降，过大可能跨过谷底造成震荡，严重时 divergence。中文锚点是学习率、震荡和发散。", "The learning rate decides how far to move along the negative gradient. Too small can be stable but slow. A suitable value descends gradually. Too large can overshoot the valley, produce oscillation, or cause divergence. The loss curve is the evidence: if updates repeatedly cross the valley or grow worse, the step size no longer matches the local landscape."),
  },
  {
    id: "v3-descent-numpy-output",
    level: 2,
    title: copy("代码核对：更新前后都重新计算真实 MSE", "Code Check: Recompute the True MSE Before and After Updating"),
    content: copy(`代码只计算一次起点梯度，然后从同一个 **w0,b0** 分别尝试两个学习率。这样 0.05 与 0.10 的比较不会互相继承参数状态。若第二次试验从第一次更新后的参数继续走，它回答的是两步训练，而不是学习率控制实验。

运行输出清楚展示：相同梯度、相同方向，不同有限步长可以产生相反的 loss 结果。实际训练循环每一步都要重新计算梯度，因为参数改变后，原来的局部斜率不再代表新位置。`, `The code computes the starting gradient once and tries two learning rates from the same w0,b0. This prevents the 0.05 and 0.10 trials from inheriting state from one another. Starting the second trial after the first update would test two training steps rather than a controlled learning-rate comparison.

The output shows that the same gradient and direction can produce opposite loss outcomes under different finite step sizes. A real training loop recomputes gradients after every update because the old local slope no longer describes the new parameter position.`),
  },
  {
    id: "v3-descent-summary",
    level: 2,
    title: copy("本章小结：训练步是测量、决策、移动、复算", "Summary: A Training Step Measures, Decides, Moves, and Re-evaluates"),
    content: copy(`完整一步不是一条孤立公式：先用当前参数前向计算，再得到 loss 和梯度；学习率把梯度变成更新量；参数移动后重新计算真实 loss。负梯度提供局部下降方向，学习率决定是否把这个方向变成有效移动。

下一章不再总用完整两行平均。它会分别查看单样本梯度 **[4,6,2]** 和 **[-4,-16,-4]**，解释为什么随机抽到不同样本会给出不同更新方向，以及这些方向平均后怎样回到全批量梯度 **[0,-5,-1]**。`, `A complete step is not one isolated formula. Run the forward pass at current parameters, obtain loss and gradients, convert gradients into an update with the learning rate, move parameters, then recompute true loss. The negative gradient gives a local descent direction; the learning rate determines whether that direction becomes an effective move.

Review Questions: What four stages make one complete training step? Why can a correct negative-gradient direction still increase loss? What must be recomputed after parameters move?

The next chapter stops averaging both examples every time. It inspects sample gradients [4,6,2] and [-4,-16,-4], explains why randomly selecting different examples produces different update directions, and shows how their average returns to the full-batch gradient [0,-5,-1].`),
  },
]

const visuals: VisualAsset[] = [
  {
    id: "learning-rate-image",
    type: "image",
    title: copy("学习率行为图", "Learning-Rate Behavior Image"),
    assetPath: "/math-lab/generated/beginner-learning-rate-behavior-longform.png",
    transcript: copy("三条轨迹对比小、合适和过大学习率。", "Three paths compare small, suitable, and too-large learning rates."),
    alt: copy("三条轨迹对比小、合适和过大学习率。", "Three paths compare small, suitable, and too-large learning rates."),
    caption: copy("三条轨迹对比小、合适和过大学习率。", "Three paths compare small, suitable, and too-large learning rates."),
    learningPurpose: copy("复用既有微积分视觉资产，把抽象公式连接到可观察图像。", "Reuse an existing calculus visual asset to connect abstract formulas with observable images."),
  },
  {
    id: "learning-rate-video",
    type: "manim-video",
    title: copy("学习率行为动画", "Learning-Rate Behavior Video"),
    assetPath: "/manim/math-lab/beginner-learning-rate-behavior.mp4",
    posterPath: "/manim/math-lab/beginner-learning-rate-behavior.svg",
    transcript: copy("动画对比稳定下降、震荡和发散。", "The animation compares stable descent, oscillation, and divergence."),
    alt: copy("动画对比稳定下降、震荡和发散。", "The animation compares stable descent, oscillation, and divergence."),
    caption: copy("动画对比稳定下降、震荡和发散。", "The animation compares stable descent, oscillation, and divergence."),
    learningPurpose: copy("复用既有 Manim 动画展示连续变化过程。", "Reuse an existing Manim animation to show a continuous-change process."),
  },
]

export const calculusGradientDescentModule: MathLabModule = {
  id: "calculus-gradient-descent",
  enhancementTier: "interactive",
  title: copy("梯度下降", "Gradient Descent"),
  subtitle: copy("沿负梯度方向走，用学习率控制每一步长度。", "Walk along the negative gradient and use learning rate to control step length."),
  difficulty: "foundation",
  estimatedMinutes: 60,
  prerequisites: ["calculus-partial-derivatives-gradients"],
  aiModelConnections: [
    copy("训练的核心更新就是让参数沿负梯度降低 loss。", "The core training update moves parameters along the negative gradient to reduce loss."),
  ],
  learningObjectives: [
    copy("解释负梯度为什么用于下降。", "Explain why the negative gradient is used for descent."),
    copy("区分方向和学习率步长。", "Separate direction from learning-rate step size."),
    copy("识别震荡和发散。", "Recognize oscillation and divergence."),
  ],
  concepts: [
    {
      id: "negative-gradient-step",
      name: copy("负梯度步", "Negative-Gradient Step"),
      formulaLatex: "\\theta_{new}=\\theta-\\eta\\nabla L(\\theta)",
      variables: [
        {
          symbol: "\\theta",
          description: copy("当前参数。", "Current parameters."),
        },
        {
          symbol: "\\eta",
          description: copy("学习率。", "Learning rate."),
        },
        {
          symbol: "\\nabla L",
          description: copy("loss 梯度。", "Loss gradient."),
        },
      ],
      plainExplanation: copy("从参数中减去学习率乘梯度。", "Subtract learning rate times gradient from parameters."),
      geometricIntuition: copy("像沿 loss 山谷的下坡方向迈步。", "Like stepping downhill in a loss valley."),
      numericalExample: copy("梯度 \\([3,-2]\\)、学习率 0.1，更新为 \\([-0.3,0.2]\\)。", "Gradient \\([3,-2]\\) with learning rate 0.1 gives update \\([-0.3,0.2]\\)."),
      modelConnection: copy("优化器围绕方向和步长组织更新。", "Optimizers organize updates around direction and step size."),
      codeExample: `import numpy as np

X = np.array([[2.0, 3.0], [1.0, 4.0]])
targets = np.array([9.0, 7.0])
w0 = np.array([4.0, -1.0])
b0 = 5.0

def evaluate(w, b):
    predictions = X @ w + b
    residuals = predictions - targets
    return float(np.mean(residuals ** 2))

residuals = X @ w0 + b0 - targets
grad_w = (2 / X.shape[0]) * X.T @ residuals
grad_b = float(2 * residuals.mean())

print("start_loss =", evaluate(w0, b0))
print("gradient =", grad_w.tolist(), grad_b)
for learning_rate in (0.05, 0.10):
    w1 = w0 - learning_rate * grad_w
    b1 = b0 - learning_rate * grad_b
    print(
        "lr =", learning_rate,
        "params =", w1.tolist(), round(b1, 6),
        "loss =", round(evaluate(w1, b1), 6),
    )`,
      codeOutput: copy(`start_loss = 2.5
gradient = [0.0, -5.0] -1.0
lr = 0.05 params = [4.0, -0.75] 5.05 loss = 2.07125
lr = 0.1 params = [4.0, -0.5] 5.1 loss = 3.385`, `start_loss = 2.5
gradient = [0.0, -5.0] -1.0
lr = 0.05 params = [4.0, -0.75] 5.05 loss = 2.07125
lr = 0.1 params = [4.0, -0.5] 5.1 loss = 3.385`),
    },
  ],
  labs: [
    {
      id: "calculus-gradient-path-lab",
      title: copy("梯度路径实验", "Gradient Path Lab"),
      type: "interactive-visual",
      componentName: "MathGradientLab",
      successCriteria: [
        copy("能指出梯度、负梯度和更新方向。", "Identify gradient, negative gradient, and update direction."),
        copy("能比较学习率过小、合适和过大的轨迹。", "Compare paths for too-small, suitable, and too-large learning rates."),
      ],
    },
  ],
  quizzes: [
    {
      id: "descent-subtract-gradient",
      type: "single-choice",
      prompt: copy("为什么要减去梯度？", "Why subtract the gradient?"),
      choices: [
        {
          id: "downhill",
          label: copy("梯度指向上坡，负梯度更可能降低 loss。", "The gradient points uphill, so the negative gradient is more likely to reduce loss."),
        },
        {
          id: "distractor",
          label: copy("保证所有参数变小。", "It guarantees every parameter gets smaller."),
        },
      ],
      answer: "downhill",
      explanation: copy("减号选择方向，不保证每个参数都变小。", "The minus sign chooses direction; it does not guarantee every parameter shrinks."),
      misconceptionTags: ["minus-means-parameters-smaller"],
      revisitVisualId: "learning-rate-video",
    },
    {
      id: "descent-large-learning-rate",
      type: "single-choice",
      prompt: copy("学习率过大常导致什么？", "What can a too-large learning rate cause?"),
      choices: [
        {
          id: "oscillation",
          label: copy("oscillation 或 divergence。", "Oscillation or divergence."),
        },
        {
          id: "distractor",
          label: copy("一定更快收敛。", "Always faster convergence."),
        },
      ],
      answer: "oscillation",
      explanation: copy("过大步长会跨过谷底，破坏局部下降假设。", "Oversized steps can cross the valley and break the local descent assumption."),
      misconceptionTags: ["learning-rate-is-speed-only"],
      revisitVisualId: "learning-rate-image",
    },
  ],
  misconceptions: [
    {
      id: "minus-means-parameters-smaller",
      statement: copy("减号表示所有参数变小。", "The minus sign means all parameters get smaller."),
      correction: copy("负梯度目标是让 loss 降低，参数可大可小。", "The negative gradient aims to reduce loss; parameters can increase or decrease."),
      example: copy("梯度为负时减去它会让参数变大。", "If the gradient is negative, subtracting it increases the parameter."),
    },
    {
      id: "learning-rate-is-speed-only",
      statement: copy("学习率只是速度，越大越好。", "Learning rate is only speed, so larger is better."),
      correction: copy("学习率是步长，过大可能震荡或发散。", "Learning rate is step size; too large can oscillate or diverge."),
      example: copy("一步跨过谷底后可能来回跳。", "A step can overshoot the valley and bounce back."),
    },
  ],
  accent: "#ea580c",
  theme: "#fff7ed",
  sourceReferences: [
    {
      label: copy("3Blue1Brown Essence of Calculus", "3Blue1Brown Essence of Calculus"),
      href: "https://www.3blue1brown.com/topics/calculus",
      usage: copy("参考局部变化、割线、切线和微积分直觉的视觉组织方式。", "Reference for the visual organization of local change, secants, tangents, and calculus intuition."),
    },
    {
      label: copy("Dive into Deep Learning Optimization Algorithms", "Dive into Deep Learning Optimization Algorithms"),
      href: "https://d2l.ai/chapter_optimization/index.html",
      license: "CC BY-SA 4.0",
      usage: copy("参考梯度下降、随机梯度和优化算法的机器学习表述。", "Reference for machine-learning explanations of gradient descent, stochastic gradients, and optimization algorithms."),
    },
    {
      label: copy("Mathematics for Machine Learning", "Mathematics for Machine Learning"),
      href: "https://mml-book.github.io/",
      usage: copy("参考微积分、梯度和优化与机器学习参数学习之间的关系。", "Reference for relationships between calculus, gradients, optimization, and machine-learning parameter learning."),
    },
  ],
  sourceNoteFile: "math-lab-calculus-route-sources.md",
  sections,
  visuals,
  toc: sections.map(({ id, level, title }) => ({ id, level, title })),
  importedAssetPaths: visuals.flatMap(visual => [visual.assetPath, visual.posterPath]).filter((path): path is string => Boolean(path)),
  // The shared course order supplies these navigation fields during assembly.
  order: 0,
  nextModuleIds: [],
}
