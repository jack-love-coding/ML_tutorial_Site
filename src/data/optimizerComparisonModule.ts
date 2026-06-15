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

function simulateOptimizerComparison(): ModuleSimulation {
  return {
    snapshots: [
      {
        step: 0,
        loss: 0,
        accuracy: 0,
        derivedMetrics: {
          moduleType: 'optimizer-comparison',
          referenceIds: [
            'REF-D2L-OPTIMIZATION',
            'REF-PYTORCH-OPTIMIZATION',
            'REF-PYTORCH-OPTIM',
            'REF-CS231N-NN3',
          ],
        },
      },
    ],
  }
}

export const optimizerComparisonModule: AlgorithmModuleDefinition = {
  slug: 'optimizer-comparison',
  route: '/learn/optimizer-comparison',
  titleKey: 'modules.optimizerComparison.title',
  kickerKey: 'modules.optimizerComparison.kicker',
  introKey: 'modules.optimizerComparison.intro',
  summaryKey: 'modules.optimizerComparison.summary',
  theme: '#fff7ed',
  accent: '#ea580c',
  checkpoints: algorithmCheckpointsBySlug['optimizer-comparison'],
  chapters: [
    chapter(
      'training-loop',
      'modules.optimizerComparison.sections.trainingLoop.title',
      loc(
        `优化器章节要先把训练循环说清楚：forward 得到预测，loss 计分，backward 计算梯度，optimizer 更新参数。

### PyTorch 最小节奏
~~~python
for X, y in train_loader:
    pred = model(X)
    loss = loss_fn(pred, y)

    optimizer.zero_grad()
    loss.backward()
    optimizer.step()
~~~

` + `\`zero_grad()\`` + ` 清掉上一轮梯度，` + `\`loss.backward()\`` + ` 把梯度写到参数上，` + `\`optimizer.step()\`` + ` 按优化器规则更新参数。

### 为什么这章接在 gradient descent 后面
gradient descent 给你最基本的“沿负梯度走”。现代优化器则回答更实际的问题：mini-batch 梯度有噪声怎么办、峡谷地形会左右震荡怎么办、每个参数是否该用不同步长。

### 老师会先问
优化器看到的是 loss 本身，还是参数上的梯度？它真正使用的是梯度、学习率、历史动量和内部状态。

### Ref ID
REF-PYTORCH-OPTIMIZATION、REF-PYTORCH-OPTIM`,
        `An optimizer chapter should start by making the training loop explicit: forward produces predictions, loss scores them, backward computes gradients, and the optimizer updates parameters.

### Minimal PyTorch rhythm
~~~python
for X, y in train_loader:
    pred = model(X)
    loss = loss_fn(pred, y)

    optimizer.zero_grad()
    loss.backward()
    optimizer.step()
~~~

` + `\`zero_grad()\`` + ` clears gradients from the previous round, ` + `\`loss.backward()\`` + ` writes gradients onto parameters, and ` + `\`optimizer.step()\`` + ` updates parameters according to the optimizer rule.

### Why this follows gradient descent
Gradient descent gives the basic idea of moving along negative gradients. Modern optimizers answer more practical questions: what to do with noisy mini-batch gradients, how to reduce zig-zagging in ravines, and whether each parameter should get its own step size.

### Teacher question
Does the optimizer see the loss itself, or the gradients on parameters? It actually uses gradients, learning rate, momentum history, and internal state.

### Ref ID
REF-PYTORCH-OPTIMIZATION, REF-PYTORCH-OPTIM`,
      ),
      loc(
        '训练循环的四步是 forward、loss、backward、optimizer step。',
        'The training loop rhythm is forward, loss, backward, optimizer step.',
      ),
      loc(
        '在右侧 loop 阶段，把 zero_grad、loss.backward() 和 optimizer.step() 放到正确顺序。',
        'Use the loop stage to place zero_grad, loss.backward(), and optimizer.step() in order.',
      ),
    ),
    chapter(
      'sgd-batch-noise',
      'modules.optimizerComparison.sections.sgdBatchNoise.title',
      loc(
        `SGD 的直觉不是“更差的梯度下降”，而是用小批量样本估计全量梯度。

### batch size 改变什么
- batch size 小：更新更频繁，梯度更 noisy，loss 曲线更抖。
- batch size 大：梯度更稳定，但每步计算更重，可能更容易陷入尖锐区域。

~~~python
optimizer = torch.optim.SGD(
    model.parameters(),
    lr=0.05,
)
~~~

在同一 loss landscape 上，full batch 轨迹通常更平滑；mini-batch 或 stochastic 轨迹会抖动，但这种噪声有时能帮助逃离差的局部结构。

### iteration 和 epoch
iteration 是一次参数更新。epoch 是训练集被看过一轮。换 batch size 会改变每个 epoch 里有多少次更新，所以画训练曲线时要说明横轴是什么。

### Ref ID
REF-D2L-OPTIMIZATION、REF-CS231N-NN3`,
        `SGD is not "worse gradient descent". It estimates the full gradient with a small batch of samples.

### What batch size changes
- Small batch size: more frequent updates, noisier gradients, shakier loss curves.
- Large batch size: more stable gradients, heavier computation per step, and sometimes sharper solutions.

~~~python
optimizer = torch.optim.SGD(
    model.parameters(),
    lr=0.05,
)
~~~

On the same loss landscape, full-batch paths are usually smoother; mini-batch or stochastic paths shake more, but this noise can sometimes help escape bad local structure.

### Iteration and epoch
An iteration is one parameter update. An epoch means the training set has been seen once. Changing batch size changes how many updates happen per epoch, so training curves should say what the x-axis means.

### Ref ID
REF-D2L-OPTIMIZATION, REF-CS231N-NN3`,
      ),
      loc(
        'SGD 用 mini-batch 估计梯度；batch size 同时影响噪声、更新频率和训练曲线。',
        'SGD estimates gradients with mini-batches; batch size affects noise, update frequency, and training curves.',
      ),
      loc(
        '在右侧 sgd 阶段，比较 batch size 16 和 512 的 loss 曲线会怎样不同。',
        'Use the sgd stage to compare how loss curves differ for batch size 16 and 512.',
      ),
    ),
    chapter(
      'momentum-rmsprop',
      'modules.optimizerComparison.sections.momentumRmsprop.title',
      loc(
        `Momentum 和 RMSProp 都是在修正朴素 SGD 的实际问题，但修正角度不同。

### Momentum：保留方向惯性
Momentum 给更新加入速度项，让连续一致的方向累积，来回震荡的方向互相抵消：

$$v_t=\\beta v_{t-1}+g_t$$

$$\\theta_t=\\theta_{t-1}-\\eta v_t$$

在狭长谷地里，它能减少左右摆动，让路径更快沿谷底方向前进。

### RMSProp：按参数调步长
RMSProp 跟踪梯度平方的移动平均，对经常出现大梯度的参数缩小步长，对梯度较小的参数保留更大相对步长。

~~~python
momentum = torch.optim.SGD(model.parameters(), lr=0.01, momentum=0.9)
rmsprop = torch.optim.RMSprop(model.parameters(), lr=0.001)
~~~

### 老师会先问
这个优化器是在改变梯度方向、改变每个参数的步长，还是两者都有？

### Ref ID
REF-D2L-OPTIMIZATION、REF-PYTORCH-OPTIM`,
        `Momentum and RMSProp both fix practical problems in plain SGD, but from different angles.

### Momentum: keep directional inertia
Momentum adds a velocity term, so directions that stay consistent accumulate while oscillating directions cancel:

$$v_t=\\beta v_{t-1}+g_t$$

$$\\theta_t=\\theta_{t-1}-\\eta v_t$$

In a narrow ravine, it can reduce side-to-side bouncing and move faster along the valley.

### RMSProp: tune step size per parameter
RMSProp tracks a moving average of squared gradients. Parameters with repeatedly large gradients receive smaller steps; parameters with smaller gradients keep larger relative steps.

~~~python
momentum = torch.optim.SGD(model.parameters(), lr=0.01, momentum=0.9)
rmsprop = torch.optim.RMSprop(model.parameters(), lr=0.001)
~~~

### Teacher question
Is this optimizer changing the gradient direction, changing each parameter's step size, or both?

### Ref ID
REF-D2L-OPTIMIZATION, REF-PYTORCH-OPTIM`,
      ),
      loc(
        'Momentum 用历史方向减震，RMSProp 用梯度平方历史调每个参数的步长。',
        'Momentum damps oscillation with direction history, while RMSProp uses squared-gradient history to tune per-parameter steps.',
      ),
      loc(
        '在右侧 momentum 阶段，解释为什么狭长谷地会让普通 SGD 左右摆动。',
        'Use the momentum stage to explain why a narrow ravine makes plain SGD zig-zag.',
      ),
    ),
    chapter(
      'adam-weight-decay',
      'modules.optimizerComparison.sections.adamWeightDecay.title',
      loc(
        `Adam 可以看成把 Momentum 的一阶矩估计和 RMSProp 的二阶矩估计结合起来。

### Adam 跟踪什么
它维护两个移动平均：
- $m_t$：梯度的一阶矩，像 momentum。
- $v_t$：梯度平方的二阶矩，像 adaptive step size。

~~~python
optimizer = torch.optim.AdamW(
    model.parameters(),
    lr=3e-4,
    weight_decay=0.01,
    betas=(0.9, 0.999),
)
~~~

### weight decay 不是学习率
learning rate 控制沿优化方向走多远；weight_decay 惩罚过大的权重，让模型不要把参数推得太极端。AdamW 把 weight decay 和 Adam 的自适应更新解耦，实践中很常见。

### 想一想
Adam 经常是稳健起点，但不是免调参按钮。学习率过大仍然会发散，weight decay 过强也会欠拟合。

### Ref ID
REF-D2L-OPTIMIZATION、REF-PYTORCH-OPTIM、REF-CS231N-NN3`,
        `Adam can be understood as combining Momentum's first-moment estimate with RMSProp's second-moment estimate.

### What Adam tracks
It maintains two moving averages:
- $m_t$: first moment of gradients, similar to momentum.
- $v_t$: second moment of squared gradients, similar to adaptive step size.

~~~python
optimizer = torch.optim.AdamW(
    model.parameters(),
    lr=3e-4,
    weight_decay=0.01,
    betas=(0.9, 0.999),
)
~~~

### Weight decay is not learning rate
Learning rate controls how far to move along the update direction; weight_decay penalizes overly large weights so the model does not push parameters to extremes. AdamW decouples weight decay from Adam's adaptive update and is common in practice.

### Think about it
Adam is often a robust starting point, but it is not a no-tuning button. Too high a learning rate can still diverge, and too much weight decay can underfit.

### Ref ID
REF-D2L-OPTIMIZATION, REF-PYTORCH-OPTIM, REF-CS231N-NN3`,
      ),
      loc(
        'Adam 结合一阶动量和二阶自适应尺度；AdamW 常把 weight decay 解耦。',
        'Adam combines first-moment momentum and second-moment adaptive scaling; AdamW commonly decouples weight decay.',
      ),
      loc(
        '在右侧 adam 阶段，把 lr、betas 和 weight_decay 分别解释成不同旋钮。',
        'Use the adam stage to explain lr, betas, and weight_decay as different knobs.',
      ),
    ),
    chapter(
      'learning-rate-schedules',
      'modules.optimizerComparison.sections.learningRateSchedules.title',
      loc(
        `很多训练失败不是模型结构错了，而是 learning rate 曲线不合适。

### 四种常见曲线信号
- 太小：loss 缓慢下降，训练很久仍未到好区域。
- 太大：loss 震荡、跳高，甚至出现 NaN。
- 合适：前期下降明显，后期逐渐变平。
- schedule：先用较大学习率探索，再逐步衰减做细调。

~~~python
scheduler = torch.optim.lr_scheduler.StepLR(
    optimizer,
    step_size=10,
    gamma=0.5,
)

for epoch in range(epochs):
    train_one_epoch()
    scheduler.step()
~~~

### warmup 的直觉
大模型或不稳定任务里，训练初期直接用目标学习率可能太猛。warmup 让学习率从小到大，先稳定进入训练状态。

### Ref ID
REF-D2L-OPTIMIZATION、REF-CS231N-NN3、REF-PYTORCH-OPTIM`,
        `Many training failures come from the learning-rate curve rather than the model architecture.

### Four common curve signals
- Too small: loss decreases slowly and takes too long to reach a useful region.
- Too large: loss oscillates, spikes, or even becomes NaN.
- Reasonable: loss drops clearly at first and then gradually flattens.
- Schedule: use a larger learning rate for exploration, then decay for fine adjustment.

~~~python
scheduler = torch.optim.lr_scheduler.StepLR(
    optimizer,
    step_size=10,
    gamma=0.5,
)

for epoch in range(epochs):
    train_one_epoch()
    scheduler.step()
~~~

### Warmup intuition
For large models or unstable tasks, starting at the target learning rate can be too aggressive. Warmup grows the rate gradually so training enters a stable regime first.

### Ref ID
REF-D2L-OPTIMIZATION, REF-CS231N-NN3, REF-PYTORCH-OPTIM`,
      ),
      loc(
        'learning rate schedule 是训练过程中的步长计划，不是换一个模型。',
        'A learning-rate schedule is a step-size plan during training, not a different model.',
      ),
      loc(
        '在右侧 schedule 阶段，根据一条 loss 曲线判断学习率可能太小、太大还是需要衰减。',
        'Use the schedule stage to diagnose whether a loss curve suggests too small, too large, or decaying learning rate.',
      ),
    ),
    chapter(
      'curve-diagnosis',
      'modules.optimizerComparison.sections.curveDiagnosis.title',
      loc(
        `优化器对比最终要回到可复现实验：同一任务、同一初始化策略、同一 metric，只改变一个旋钮。

### 复盘表该写什么
| 实验 | optimizer | lr | batch size | weight decay | 观察 |
| --- | --- | --- | --- | --- | --- |
| A | SGD | 0.1 | 32 | 0 | loss 震荡 |
| B | Momentum | 0.1 | 32 | 0 | 下降更快但仍抖 |
| C | AdamW | 0.001 | 32 | 0.01 | 更稳定 |

### 读曲线而不是背结论
同一个 optimizer 在不同任务上会有不同表现。你要学会从 loss 曲线、train/validation gap、梯度爆炸、NaN 和收敛速度推断下一步调什么。

### 下一步路径
回到 MLP 或 CNN 章节，用同一模型比较 SGD、Momentum、RMSProp、Adam 和 schedule。不要一次改模型、数据增强、优化器和 batch size，否则复盘会失真。

### Ref ID
REF-CS231N-NN3、REF-D2L-OPTIMIZATION、REF-PYTORCH-OPTIMIZATION`,
        `Optimizer comparison should end with reproducible experiments: same task, same initialization strategy, same metric, and one knob changed at a time.

### What a review table records
| Experiment | optimizer | lr | batch size | weight decay | Observation |
| --- | --- | --- | --- | --- | --- |
| A | SGD | 0.1 | 32 | 0 | loss oscillates |
| B | Momentum | 0.1 | 32 | 0 | faster but still noisy |
| C | AdamW | 0.001 | 32 | 0.01 | more stable |

### Read curves, not slogans
The same optimizer can behave differently across tasks. Learn to infer the next adjustment from loss curves, train/validation gap, exploding gradients, NaN, and convergence speed.

### Next path
Return to MLP or CNN and compare SGD, Momentum, RMSProp, Adam, and schedules on the same model. Do not change model, augmentation, optimizer, and batch size all at once, or the review becomes misleading.

### Ref ID
REF-CS231N-NN3, REF-D2L-OPTIMIZATION, REF-PYTORCH-OPTIMIZATION`,
      ),
      loc(
        '优化器对比要控制变量：同一任务只改 optimizer、lr、batch size 或 weight decay 中的一项。',
        'Optimizer comparison needs controlled variables: on the same task, change only optimizer, lr, batch size, or weight decay.',
      ),
      loc(
        '在右侧 diagnose 阶段，写一条“曲线现象 -> 可能原因 -> 下一步实验”的记录。',
        'Use the diagnose stage to write one "curve pattern -> likely cause -> next experiment" note.',
      ),
    ),
  ],
  controls: [],
  presets: [],
  sourceNote: loc(
    '统一资料入口：REF-D2L-OPTIMIZATION、REF-PYTORCH-OPTIMIZATION、REF-PYTORCH-OPTIM、REF-CS231N-NN3。',
    'Centralized references: REF-D2L-OPTIMIZATION, REF-PYTORCH-OPTIMIZATION, REF-PYTORCH-OPTIM, REF-CS231N-NN3.',
  ),
  createDefaultConfig: () => ({
    playbackMs: 900,
  }),
  simulate: simulateOptimizerComparison,
}
