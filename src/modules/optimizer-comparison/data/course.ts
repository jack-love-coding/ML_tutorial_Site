import type { LocalizedCopy } from '../../../types/ml'

export type OptimizerCourseBlockKind =
  | 'question'
  | 'intuition'
  | 'math-state'
  | 'numpy-code'
  | 'real-output'
  | 'prediction'
  | 'animation'
  | 'interaction'
  | 'observation'
  | 'misconception'
  | 'conclusion'

export interface OptimizerCourseBlock {
  kind: OptimizerCourseBlockKind
  title: LocalizedCopy
  body: LocalizedCopy
  code?: string
}

export interface OptimizerCourseChapter {
  id: 'training-loop' | 'sgd-batch-noise' | 'momentum-rmsprop' | 'adam-weight-decay' | 'learning-rate-schedules' | 'curve-diagnosis'
  title: LocalizedCopy
  blocks: readonly OptimizerCourseBlock[]
  media?: readonly ('sgd' | 'momentum' | 'rmsprop' | 'adam')[]
}

const loc = (zhCN: string, en: string): LocalizedCopy => ({ 'zh-CN': zhCN, en })

const block = (kind: OptimizerCourseBlockKind, zhCN: string, en: string, code?: string): OptimizerCourseBlock => ({
  kind,
  title: loc(
    ({ question: '问题', intuition: '直觉', 'math-state': '数学与状态', 'numpy-code': 'NumPy 代码', 'real-output': '真实输出', prediction: '先预测', animation: '动画', interaction: '互动', observation: '观察', misconception: '常见误区', conclusion: '结论' } as const)[kind],
    ({ question: 'Question', intuition: 'Intuition', 'math-state': 'Math and state', 'numpy-code': 'NumPy code', 'real-output': 'Published output', prediction: 'Predict first', animation: 'Animation', interaction: 'Interact', observation: 'Observe', misconception: 'Misconception', conclusion: 'Conclusion' } as const)[kind],
  ),
  body: loc(zhCN, en),
  code,
})

const trainingLoop = [
  block('question', '一次参数更新里，模型先做什么，优化器又在什么时候读取梯度？', 'In one parameter update, what happens first, and when does the optimizer read gradients?'),
  block('intuition', '把训练想成一张收据：预测是商品，损失是总价，反向传播写下每个参数应承担的变化，最后一步才真正付款。在 PyTorch 写法中，这一段是 `loss.backward()`，付款是 `optimizer.step()`。', 'Treat training as a receipt: prediction is the item, loss is the total, backprop records each parameter’s change, and only the final step pays. In PyTorch notation, that recording is `loss.backward()` and payment is `optimizer.step()`.'),
  block('math-state', String.raw`$$\theta_{t+1}=\theta_t-\eta\nabla_\theta L(\theta_t)$$` + '\n状态起点是参数 ' + String.raw`$\theta_t$` + '；没有 `zero_grad()`，上一轮梯度会留在收据上。', String.raw`$$\theta_{t+1}=\theta_t-\eta\nabla_\theta L(\theta_t)$$` + '\nThe state begins with parameters ' + String.raw`$\theta_t$` + '; without `zero_grad()`, last round’s gradient remains on the receipt.'),
  block('numpy-code', '下面的 NumPy 版本只做一个标量更新，变量名与状态公式一致。', 'This NumPy version makes one scalar update with names matching the state equation.', "theta = 0.50\ngrad = 0.12\nlr = 0.05\ntheta = theta - lr * grad\nprint(round(theta, 3))"),
  block('real-output', '已发布轨迹的第 0 次更新从训练损失 `0.500973` 开始；40 次更新均由共享引擎产生。', 'The published trajectory begins at training loss `0.500973` at update 0; all 40 updates come from the shared engine.'),
  block('prediction', '在点击下一步前，预测：若先执行 `step()` 再清梯度，下一轮会使用哪一轮的梯度？', 'Before stepping, predict: if `step()` comes before clearing gradients, which round’s gradients are used next?'),
  block('animation', '动画把 forward → loss → zero_grad → backward → step 标成一条可暂停的账本流程。', 'The animation labels forward → loss → zero_grad → backward → step as one pausable ledger.'),
  block('interaction', '用训练账本逐步推进，观察每一步读取和写入的状态。', 'Advance the training ledger step by step and observe each state read and write.'),
  block('observation', '只有 `backward` 写出当前梯度后，`step` 才有可用的更新方向。', 'Only after `backward` writes current gradients does `step` have an update direction.'),
  block('misconception', '优化器不直接“看 loss 后猜参数”；它接收的是反向传播写在参数上的梯度。', 'An optimizer does not directly “look at loss and guess parameters”; it receives gradients written by backprop.'),
  block('conclusion', '训练循环给出了所有优化器共享的时间顺序；下一章只改变梯度来自多少样本。', 'The training loop fixes the order shared by every optimizer; the next chapter changes how many samples supply the gradient.'),
] as const

const sgdBatchNoise = [
  block('question', '为什么同一模型用更小 batch 时，曲线会更抖？', 'Why does the same model produce a shakier curve with a smaller batch?'),
  block('intuition', '全量梯度像看完整张地图；mini-batch 像每次只看几条街，方向仍有用，但会带有抽样噪声。', 'A full gradient is a whole map; a mini-batch is a few streets at a time—still useful direction, but with sampling noise.'),
  block('math-state', String.raw`$$g_B=\frac{1}{|B|}\sum_{i\in B}\nabla_\theta\ell_i,\quad \theta\leftarrow\theta-\eta g_B$$` + '\niteration 是一次更新；epoch 是数据被遍历一轮。', String.raw`$$g_B=\frac{1}{|B|}\sum_{i\in B}\nabla_\theta\ell_i,\quad \theta\leftarrow\theta-\eta g_B$$` + '\nAn iteration is one update; an epoch is one pass through data.'),
  block('numpy-code', '同一更新规则只替换梯度估计。', 'The same update rule only replaces the gradient estimate.', "batch_grad = grads[batch_ids].mean(axis=0)\nweights -= learning_rate * batch_grad\nprint('updates this epoch:', len(grads) // len(batch_ids))"),
  block('real-output', '发布的固定圆形任务在相同 40 次更新预算下同时保存了 matched 与 practical 两种比较视图，避免把不同第一步幅度当成优化器差异。', 'The published fixed-circle task stores matched and practical views under the same 40-update budget, avoiding a mistaken optimizer conclusion from unequal first steps.'),
  block('prediction', '预测 batch 从 512 改为 16 后：一轮 epoch 中更新次数会变多还是变少？', 'Predict after changing batch size from 512 to 16: will updates per epoch increase or decrease?'),
  block('animation', 'SGD 动画用同一地形展示平滑的大批量方向与抖动的小批量方向。', 'The SGD animation shows smooth large-batch and jittery small-batch directions on one terrain.'),
  block('interaction', '切换批量大小并逐步播放同一条训练收据；数值异常会停在最后一个有限状态。', 'Switch batch sizes and step through the same training receipt; numerical anomalies stop at the last finite state.'),
  block('observation', '小 batch 不等于“错误更新”：它只是更有方差的梯度估计，同时改变每个 epoch 的更新次数。', 'A small batch is not a “wrong update”: it is a higher-variance gradient estimate and changes updates per epoch.'),
  block('misconception', '不能只看横轴上的 epoch 比较不同 batch；还要写清横轴是 update、样本数还是 epoch。', 'Do not compare batches by epoch alone; state whether the axis is updates, samples, or epochs.'),
  block('conclusion', 'SGD 的关键选择是梯度估计的噪声与成本；下一章给更新加上历史状态。', 'SGD’s key choice is the noise/cost of its gradient estimate; the next chapter adds history to the update.'),
] as const

const momentumRmsprop = [
  block('question', '峡谷中反复横跳时，应该积累方向，还是缩小某些参数的步长？', 'In a zig-zagging ravine, should we accumulate direction or shrink some parameter steps?'),
  block('intuition', 'Momentum 记住连续的前进方向；RMSProp 记住每个坐标的平方梯度大小。两个记忆解决不同问题。', 'Momentum remembers persistent direction; RMSProp remembers squared-gradient scale per coordinate. The two memories solve different problems.'),
  block('math-state', String.raw`$$v_t=\beta v_{t-1}+g_t,\quad \theta\leftarrow\theta-\eta v_t$$` + '\n' + String.raw`$$s_t=\alpha s_{t-1}+(1-\alpha)g_t^2,\quad \theta\leftarrow\theta-\eta g_t/(\sqrt{s_t}+\epsilon)$$`, String.raw`$$v_t=\beta v_{t-1}+g_t,\quad \theta\leftarrow\theta-\eta v_t$$` + '\n' + String.raw`$$s_t=\alpha s_{t-1}+(1-\alpha)g_t^2,\quad \theta\leftarrow\theta-\eta g_t/(\sqrt{s_t}+\epsilon)$$`),
  block('numpy-code', '两种状态都必须在每个参数更新后保存。', 'Both states must be retained after every parameter update.', "velocity = beta * velocity + grad\nsquare_avg = alpha * square_avg + (1 - alpha) * grad ** 2\nprint(velocity, square_avg)"),
  block('real-output', '共享引擎采用 PyTorch 的首次 Momentum buffer 语义，并以 `sqrt(s) + eps` 计算 RMSProp 分母；这是已发布轨迹的生成规则。', 'The shared engine uses PyTorch’s first Momentum-buffer semantics and `sqrt(s) + eps` for the RMSProp denominator; these generate the published trajectories.'),
  block('prediction', '预测：若某一坐标连续出现大梯度，RMSProp 的有效步长会变大还是变小？', 'Predict: if one coordinate repeatedly has large gradients, does RMSProp’s effective step grow or shrink?'),
  block('animation', 'Momentum 与 RMSProp 两段媒体可以暂停、按标记跳转，并始终保留文字解释。', 'Momentum and RMSProp media can pause and seek by marker, while keeping a text explanation available.'),
  block('interaction', '在峡谷场景逐步观察速度向量与平方梯度历史，不必依赖颜色判断状态。', 'In the ravine scene, step through velocity and squared-gradient history without relying on color alone.'),
  block('observation', 'Momentum 主要改变方向的连续性；RMSProp 主要改变各坐标的相对尺度。', 'Momentum mainly changes directional continuity; RMSProp mainly changes relative scale per coordinate.'),
  block('misconception', 'RMSProp 不是“把所有学习率变小”，它对每个参数使用不同的有效分母。', 'RMSProp is not “making every learning rate smaller”; it uses a different effective denominator for each parameter.'),
  block('conclusion', '状态让更新不只依赖当前梯度；Adam 会把两类历史放进同一规则。', 'State makes an update depend on more than the current gradient; Adam combines both kinds of history.'),
] as const

const adamWeightDecay = [
  block('question', 'Adam 的一阶、二阶矩和 weight decay 是同一个旋钮吗？', 'Are Adam’s first/second moments and weight decay the same knob?'),
  block('intuition', 'Adam 同时有“往哪里走”的平滑记忆和“每一维走多远”的尺度记忆；正则化则是另一件事。', 'Adam has a smoothed memory of where to move and a scale memory of how far per dimension; regularization is separate.'),
  block('math-state', String.raw`$$m_t=\beta_1m_{t-1}+(1-\beta_1)g_t,\quad v_t=\beta_2v_{t-1}+(1-\beta_2)g_t^2$$` + '\n' + String.raw`$$\hat m_t=m_t/(1-\beta_1^t),\quad \hat v_t=v_t/(1-\beta_2^t)$$` + '\nAdamW 在自适应更新之外衰减权重。', String.raw`$$m_t=\beta_1m_{t-1}+(1-\beta_1)g_t,\quad v_t=\beta_2v_{t-1}+(1-\beta_2)g_t^2$$` + '\n' + String.raw`$$\hat m_t=m_t/(1-\beta_1^t),\quad \hat v_t=v_t/(1-\beta_2^t)$$` + '\nAdamW decays weights outside the adaptive update.'),
  block('numpy-code', '偏差校正在第一个更新也需要用到时间步 $t$。', 'Bias correction needs the time step $t$ even on the first update.', "t += 1\nm = b1 * m + (1 - b1) * grad\nv = b2 * v + (1 - b2) * grad ** 2\nparam *= 1 - lr * weight_decay\nparam -= lr * (m / (1 - b1 ** t)) / (np.sqrt(v / (1 - b2 ** t)) + eps)"),
  block('real-output', '发布轨迹记录 Adam 的原始与校正后矩以及每次恰好递增一次的 `t`；AdamW 的衰减不进入矩累积。', 'Published trajectories record Adam’s raw/corrected moments and `t` increasing exactly once per update; AdamW decay stays out of moment accumulation.'),
  block('prediction', '预测：把 weight decay 增大而不改 lr，会直接改变哪一种目标——更新步幅、参数偏好，还是 batch 大小？', 'Predict: increasing weight decay without changing lr directly changes which target—step size, parameter preference, or batch size?'),
  block('animation', 'Adam 状态动画把 $m$、$v$、$\\hat m$、$\\hat v$ 和 decoupled decay 分开标示。', 'The Adam state animation distinguishes $m$, $v$, $\\hat m$, $\\hat v$, and decoupled decay.'),
  block('interaction', '逐步比较 L2 与 AdamW：它们都约束权重，但进入更新规则的位置不同。', 'Step through L2 and AdamW: both constrain weights, but enter the update rule in different places.'),
  block('observation', 'Adam 常是实用起点，不是保证最优的结论；学习率和衰减仍需在验证集上预先确定。', 'Adam is often a practical starting point, not a guarantee of best results; learning rate and decay still need predeclared validation choices.'),
  block('misconception', '把 Adam、L2 和 AdamW 混成一个“正则化算法”会掩盖它们改变的是哪一步。', 'Collapsing Adam, L2, and AdamW into one “regularization algorithm” hides which step each changes.'),
  block('conclusion', '区分状态与衰减后，下一章把学习率本身变成随时间变化的计划。', 'After separating state from decay, the next chapter turns the learning rate into a time-varying plan.'),
] as const

const schedules = [
  block('question', '为什么训练前期和后期常常不应使用同一个学习率？', 'Why should early and late training often avoid the same learning rate?'),
  block('intuition', '前期需要跨过较大的地形，后期需要在较小区域精细调整；learning rate schedule 是时间表，不是新优化器。', 'Early training needs to cross broader terrain, while late training needs fine adjustment; a learning rate schedule is a timetable, not a new optimizer.'),
  block('math-state', 'constant：$\\eta_t=\\eta$；step：$\\eta_t=\\eta\\gamma^{\\lfloor t/k\\rfloor}$；warmup + cosine 先线性升高再平滑降低。调度器读取更新次数。', 'constant: $\\eta_t=\\eta$; step: $\\eta_t=\\eta\\gamma^{\\lfloor t/k\\rfloor}$; warmup + cosine rises linearly then decays smoothly. The scheduler reads update count.'),
  block('numpy-code', '先应用优化器更新，再推进调度器。', 'Apply the optimizer update before advancing the scheduler.', "for update in range(total_updates):\n    params = step(params, grad, lr)\n    lr = schedule(update + 1)\nprint(round(lr, 6))"),
  block('real-output', '共享引擎发布 constant、step、warmup-cosine 三种有限值守卫的计划；无效步长或非有限参数会明确停止。', 'The shared engine publishes constant, step, and warmup-cosine schedules with finite-value guards; invalid steps or non-finite parameters stop explicitly.'),
  block('prediction', '预测：若 Step decay 的 `gamma=0.5` 且到达边界，下一次学习率会是原来的多少？', 'Predict: with Step decay `gamma=0.5`, what fraction of the old learning rate follows a boundary?'),
  block('animation', '没有自动播放的替代文字：从 warmup 的小步开始，到余弦尾部的细调结束。', 'A non-autoplay text alternative: start with warmup’s small steps and finish with cosine’s fine adjustments.'),
  block('interaction', '选择三个计划之一，再用播放、暂停、单步与重置检查每一步学习率。', 'Choose one of three plans, then use play, pause, step, and reset to inspect each learning rate.'),
  block('observation', 'loss 曲线平台不自动证明需要某个 schedule；它提示你提出一次只改学习率计划的验证。', 'A loss curve plateau does not automatically prove one schedule is needed; it suggests a test changing only the learning-rate plan.'),
  block('misconception', 'scheduler.step() 放错相对位置会让时间表偏一格；教程固定为 optimizer step 之后。', 'Putting `scheduler.step()` in the wrong relative position shifts the timetable; this course fixes it after optimizer step.'),
  block('conclusion', '现在可以读懂曲线里的时间信号；最后一章把受控比较与真实迁移放在一起。', 'You can now read time signals in curves; the final chapter brings controlled comparison and real transfer together.'),
] as const

const diagnosis = [
  block('question', '面对一条曲线，怎样避免把“某优化器更好”说成普遍规律？', 'How can you avoid turning one curve into a universal “this optimizer is better” claim?'),
  block('intuition', '先做受控的圆形 MLP 比较，再看真实 Banknote 迁移；两者回答不同问题。', 'First make a controlled circle-MLP comparison, then inspect real Banknote transfer; they answer different questions.'),
  block('math-state', '四个优化器共享固定 $2\\to4\\to1$ tanh MLP、初始化、batch 顺序与 40 次更新预算。matched 视图匹配第一步更新范数；practical 视图使用预先声明的实用设置。', 'All four optimizers share a fixed $2\\to4\\to1$ tanh MLP, initialization, batch order, and 40-update budget. The matched view matches first-step update norms; the practical view uses predeclared practical settings.'),
  block('numpy-code', '配置在碰 test 分区前冻结，测试只在冻结后评估一次。', 'Configuration freezes before touching the test partition; testing happens once after the freeze.', "selection = {'optimizer': 'adamw', 'lr': 0.01}\n# choose using train / validation only\nfreeze(selection)\ntest_metrics = evaluate_once(test_split, selection)"),
  block('real-output', 'Banknote 迁移使用 train/validation/test = `960/206/206`，标准化只在训练集拟合；冻结选择是 AdamW，`lr=0.01`。课程不以 test 分区选参。', 'Banknote transfer uses train/validation/test = `960/206/206`, fitting standardization on train only; the frozen choice is AdamW, `lr=0.01`. The course never selects with the test partition.'),
  block('prediction', '先选一个现象：发散、batch 噪声、峡谷横跳或平台。只提出一个下一次要改的变量。', 'Choose one symptom first: divergence, batch noise, ravine zig-zag, or plateau. Propose only one variable for the next run.'),
  block('animation', '回看四段短媒体时，重点不是选冠军，而是说清每段状态改变了哪一种更新行为。', 'When revisiting the four short media pieces, the goal is not to crown a winner but to name which update behavior each state changes.'),
  block('interaction', '在受控 MLP 的 matched/practical 视图和 Banknote 表格之间切换；所有显示数来自已发布资产或共享引擎。', 'Switch between matched/practical controlled-MLP views and the Banknote table; all displayed values come from published assets or the shared engine.'),
  block('observation', '一个设置在固定预算下更平滑，不代表它在所有数据、预算或目标上都最好。受控比较说明机制，迁移说明边界。', 'A setting smoother under one fixed budget is not best for all data, budgets, or goals. Controlled comparison shows mechanism; transfer shows limits.'),
  block('misconception', '在测试集上反复选择优化器会泄漏测试信息；同时改模型、数据和 optimizer 也无法归因。', 'Repeated optimizer selection on the test set leaks test information; changing model, data, and optimizer together also destroys attribution.'),
  block('conclusion', '带着“现象 → 一个可能原因 → 一个变量 → 预期”的记录，进入 CNN，继续在形状与训练约束下做可复现实验。', 'Carry a “symptom → one plausible cause → one variable → expectation” record into CNN, where reproducible experiments continue under shape and training constraints.'),
] as const

export const optimizerCourseChapters: readonly OptimizerCourseChapter[] = [
  { id: 'training-loop', title: loc('训练循环：先写梯度，再更新参数', 'Training loop: write gradients, then update'), blocks: trainingLoop },
  { id: 'sgd-batch-noise', title: loc('SGD 与 batch 噪声', 'SGD and batch noise'), blocks: sgdBatchNoise, media: ['sgd'] },
  { id: 'momentum-rmsprop', title: loc('Momentum 与 RMSProp 状态', 'Momentum and RMSProp state'), blocks: momentumRmsprop, media: ['momentum', 'rmsprop'] },
  { id: 'adam-weight-decay', title: loc('Adam、L2 与 AdamW', 'Adam, L2, and AdamW'), blocks: adamWeightDecay, media: ['adam'] },
  { id: 'learning-rate-schedules', title: loc('学习率计划', 'Learning-rate schedules'), blocks: schedules },
  { id: 'curve-diagnosis', title: loc('曲线诊断与真实迁移', 'Curve diagnosis and real transfer'), blocks: diagnosis },
]

export const optimizerCourseReferences = [
  { href: 'https://pytorch.org/docs/stable/optim.html', label: loc('PyTorch 优化器文档', 'PyTorch optimizer documentation') },
  { href: 'https://d2l.ai/chapter_optimization/index.html', label: loc('动手学深度学习：优化', 'Dive into Deep Learning: optimization') },
] as const

export const optimizerCourseDownloads = [
  { path: '/notebooks/optimizer-comparison/optimizer-comparison.zh-CN.ipynb', label: loc('已执行 NumPy Notebook（中文）', 'Executed NumPy notebook (Chinese)'), kind: 'notebook' },
  { path: '/notebooks/optimizer-comparison/optimizer-comparison-trajectories.json', label: loc('受控 MLP 轨迹', 'Controlled MLP trajectories'), kind: 'json' },
  { path: '/datasets/optimizer-comparison/benchmark-manifest.json', label: loc('比较配置清单', 'Comparison manifest'), kind: 'json' },
  { path: '/datasets/optimizer-comparison/banknote-transfer.json', label: loc('冻结的 Banknote 评估', 'Frozen Banknote evaluation'), kind: 'json' },
] as const
