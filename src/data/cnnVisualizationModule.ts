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

function simulateCnnVisualization(): ModuleSimulation {
  return {
    snapshots: [
      {
        step: 0,
        loss: 0,
        accuracy: 0,
          derivedMetrics: {
          moduleType: 'cnn-visualization',
          referenceIds: [
            'REF-CNN-EXPLAINER',
            'REF-CS231N-CNN',
            'REF-D2L-CNN',
            'REF-PYTORCH-CV-TRANSFER',
            'REF-CONV-ARITHMETIC',
          ],
        },
      },
    ],
  }
}

export const cnnVisualizationModule: AlgorithmModuleDefinition = {
  slug: 'cnn-visualization',
  route: '/learn/cnn-visualization',
  titleKey: 'modules.cnnVisualization.title',
  kickerKey: 'modules.cnnVisualization.kicker',
  introKey: 'modules.cnnVisualization.intro',
  summaryKey: 'modules.cnnVisualization.summary',
  theme: '#eff6ff',
  accent: '#2563eb',
  checkpoints: algorithmCheckpointsBySlug['cnn-visualization'],
  chapters: [
    chapter(
      'image-volume',
      'modules.cnnVisualization.sections.imageVolume.title',
      loc(
        `CNN 的第一步不是“识别猫狗”，而是把图片看成一个三维数值体：高度、宽度和 channel。

### 图片在模型里是什么
一张 RGB 图片可以写成 $H \\times W \\times C$。例如 $32 \\times 32 \\times 3$ 表示 32 像素高、32 像素宽、3 个颜色通道。

普通全连接层会让每个输出神经元连接整张图片。CNN 则先做 local receptive field：一个 kernel 只看局部小窗口，但在整张图上共享同一组权重。

### 为什么这不是图片魔法
CNN 仍然是可微模型：卷积层和全连接层有可训练参数，ReLU 和 pooling 改变信号流，最后用 loss 和反向传播训练。真正的新假设是：图像里的局部结构可以复用。

### 本页实验台怎样读
右侧实验台使用 Tiny VGG 风格的小型 CNN，在浏览器里对一张 $64 \\times 64 \\times 3$ 图片做真实 forward pass。你可以上传本地图片，模型会中心裁剪、缩放并归一化；图片不会离开浏览器。

### 老师会先问
这个模型看见的是像素矩阵，还是人类脑中的“物体”？先回答这个问题，后面的 kernel、feature map 和分类头才不会神秘化。

### Ref ID
REF-CNN-EXPLAINER、REF-CS231N-CNN、REF-D2L-CNN`,
        `The first step in a CNN is not "recognizing cats and dogs". It is reading an image as a 3D numeric volume: height, width, and channels.

### What is an image inside the model?
An RGB image can be written as $H \\times W \\times C$. For example, $32 \\times 32 \\times 3$ means 32 pixels high, 32 pixels wide, and 3 color channels.

A fully connected layer lets each output neuron connect to the whole image. A CNN first uses local receptive fields: one kernel sees a small local window, while the same weights are shared across the image.

### Why this is not image magic
A CNN is still a differentiable model: convolutional and fully connected layers have trainable parameters, ReLU and pooling change signal flow, and loss plus backpropagation train the system. The new assumption is that local visual structure can be reused.

### How to read the lab
The lab on the right uses a Tiny VGG-style small CNN and runs a real browser-side forward pass on a $64 \\times 64 \\times 3$ image. You can upload a local image; the model center-crops, resizes, and normalizes it without sending the image away from the browser.

### Teacher question
Does the model see a pixel matrix, or the human idea of an "object"? Answering that first keeps kernels, feature maps, and classifier heads concrete.

### Ref ID
REF-CNN-EXPLAINER, REF-CS231N-CNN, REF-D2L-CNN`,
      ),
      loc(
        'CNN 把图片当作 H × W × C 的数值体，用局部连接和参数共享降低复杂度。',
        'A CNN reads an image as an H × W × C volume and reduces complexity through local connectivity and weight sharing.',
      ),
      loc(
        '在右侧 volume 阶段，先说清一张 32×32×3 图片在模型里有哪三个维度。',
        'Use the volume stage to name the three dimensions of a 32×32×3 image inside the model.',
      ),
    ),
    chapter(
      'kernel-convolution',
      'modules.cnnVisualization.sections.kernelConvolution.title',
      loc(
        `卷积层最核心的动作是：拿一个小 kernel 在图片上滑动，每到一个位置就算一次加权和。

### 5x5 小图手算
假设输入是一张灰度小图，kernel 是 $3 \\times 3$。输出左上角一个位置来自：

$$z=\\sum_{i=1}^{3}\\sum_{j=1}^{3}x_{ij}k_{ij}+b$$

然后 ReLU 可能把它变成：

$$a=\\max(0,z)$$

这个过程在整张图上重复，同一个 kernel 权重被反复使用，所以叫参数共享。

~~~python
import torch.nn as nn

conv = nn.Conv2d(
    in_channels=1,
    out_channels=8,
    kernel_size=3,
    padding=1,
)
~~~

### 想一想
kernel 本身不是固定边缘检测器。训练开始时它只是参数；经过 loss.backward() 和优化器更新后，它才逐渐学出对任务有用的响应。

### 实验台动作
点击 Conv 层中的一个节点，再移动 row/col。公式视图会把输入 patch、kernel、逐 channel 乘积、bias 和 ReLU 前后的数值对齐。

### Ref ID
REF-CNN-EXPLAINER、REF-CS231N-CNN、REF-D2L-CNN`,
        `The core action of a convolution layer is simple: slide a small kernel over the image and compute one weighted sum at each location.

### Manual computation on a 5x5 image
Suppose the input is a grayscale image and the kernel is $3 \\times 3$. The upper-left output position comes from:

$$z=\\sum_{i=1}^{3}\\sum_{j=1}^{3}x_{ij}k_{ij}+b$$

Then ReLU may turn it into:

$$a=\\max(0,z)$$

This repeats across the image. The same kernel weights are reused at every spatial location, which is weight sharing.

~~~python
import torch.nn as nn

conv = nn.Conv2d(
    in_channels=1,
    out_channels=8,
    kernel_size=3,
    padding=1,
)
~~~

### Think about it
A kernel is not born as a fixed edge detector. At initialization it is just parameters; after loss.backward() and optimizer updates, it learns responses useful for the task.

### Lab action
Click a node in a Conv layer, then move row/col. The formula view aligns the input patch, kernel, per-channel products, bias, and values before and after ReLU.

### Ref ID
REF-CNN-EXPLAINER, REF-CS231N-CNN, REF-D2L-CNN`,
      ),
      loc(
        'kernel 滑过图像，局部加权和生成 feature map；同一组权重在空间上复用。',
        'A kernel slides over the image, local weighted sums create a feature map, and one weight set is reused spatially.',
      ),
      loc(
        '在右侧 kernel 阶段，挑一个 3×3 patch，写出它和 kernel 点乘后怎样得到一个输出格。',
        'Use the kernel stage to pick one 3×3 patch and explain how its dot product with the kernel creates one output cell.',
      ),
    ),
    chapter(
      'padding-stride-shape',
      'modules.cnnVisualization.sections.paddingStrideShape.title',
      loc(
        `CNN 可视化入门必须让学生能算 shape。否则网络结构会变成一串看不懂的层名。

### 输出尺寸公式
对一维方向，常见卷积输出尺寸可以写成：

$$\\mathrm{out}=\\left\\lfloor\\frac{\\mathrm{in}+2p-k}{s}\\right\\rfloor+1$$

这里：
- $p$ 是 padding。
- $k$ 是 kernel size。
- $s$ 是 stride。

如果输入宽度是 5，kernel 是 3，padding 是 1，stride 是 1，那么输出宽度还是 5。如果 stride 改成 2，输出尺寸会变小，因为 kernel 每次跳过更多位置。

### 为什么 padding 有教学价值
padding 不是为了“补数据”。它决定边缘像素能不能参与足够多的局部计算，也决定空间尺寸是否保留。

### 老师会先问
这层改变了空间尺寸，还是只改变了 channel 数？能分清这两件事，才算真的读懂 CNN shape。

### 实验台动作
沿着 Overview 单步播放：valid convolution 会缩小空间尺寸，MaxPool 会用 $2\\times2$ window 再降采样，Flatten 会把空间坐标改写成向量索引。

### Ref ID
REF-CNN-EXPLAINER、REF-CONV-ARITHMETIC、REF-D2L-CNN`,
        `A CNN introduction should teach students to calculate shapes. Otherwise the architecture becomes a list of mysterious layer names.

### Output-size formula
For one spatial direction, a common convolution output size is:

$$\\mathrm{out}=\\left\\lfloor\\frac{\\mathrm{in}+2p-k}{s}\\right\\rfloor+1$$

Here:
- $p$ is padding.
- $k$ is kernel size.
- $s$ is stride.

If the input width is 5, kernel is 3, padding is 1, and stride is 1, the output width remains 5. If stride becomes 2, the output shrinks because the kernel skips more positions.

### Why padding matters pedagogically
Padding is not "adding fake data" for its own sake. It controls whether border pixels participate in enough local computations and whether spatial size is preserved.

### Teacher question
Did this layer change spatial size, channel count, or both? Being able to separate those is the beginning of reading CNN shape.

### Lab action
Step through the Overview: valid convolution shrinks spatial size, MaxPool downsamples with a $2\\times2$ window, and Flatten rewrites spatial coordinates as vector indices.

### Ref ID
REF-CNN-EXPLAINER, REF-CONV-ARITHMETIC, REF-D2L-CNN`,
      ),
      loc(
        'padding、kernel 和 stride 决定输出尺寸；channel 数由 filter 个数决定。',
        'Padding, kernel size, and stride determine spatial output size; the number of filters determines channels.',
      ),
      loc(
        '在右侧 shape 阶段，试算输入 5、kernel 3、padding 1、stride 1 的输出尺寸。',
        'Use the shape stage to compute the output size for input 5, kernel 3, padding 1, and stride 1.',
      ),
    ),
    chapter(
      'channels-feature-maps',
      'modules.cnnVisualization.sections.channelsFeatureMaps.title',
      loc(
        `一层 CNN 通常不只学一个 kernel，而是学很多个 filter。每个 filter 生成一张 feature map，堆起来就是输出 channel。

### channel 怎样变化
如果输入是 $32 \\times 32 \\times 3$，第一层有 16 个 $3 \\times 3$ filter，padding=1，stride=1，那么输出是 $32 \\times 32 \\times 16$。

参数数量不是 $32 \\times 32 \\times 3 \\times 16$，而是：

$$3 \\times 3 \\times 3 \\times 16 + 16$$

最后的 $+16$ 是每个 filter 一个 bias。和同尺寸全连接层相比，卷积靠局部连接和参数共享大幅减少参数。

### feature map 直觉
浅层 feature map 可能响应边缘、颜色块或纹理；深层 feature map 更像组合出来的局部形状。不要把它理解成手写规则，它是训练出来的中间表示。

### 实验台动作
切换不同 filter 和颜色尺度：activation 颜色看响应强弱，weights 颜色看连接权重，logit 颜色看分类头的原始分数。

### Ref ID
REF-CNN-EXPLAINER、REF-CS231N-CNN、REF-D2L-CNN`,
        `A CNN layer usually learns many filters, not just one kernel. Each filter creates one feature map, and stacking them gives the output channels.

### How channels change
If the input is $32 \\times 32 \\times 3$, the first layer has 16 filters of size $3 \\times 3$, padding=1, and stride=1, then the output is $32 \\times 32 \\times 16$.

The parameter count is not $32 \\times 32 \\times 3 \\times 16$, but:

$$3 \\times 3 \\times 3 \\times 16 + 16$$

The final $+16$ means one bias per filter. Compared with a same-size fully connected layer, convolution uses local connectivity and weight sharing to reduce parameters dramatically.

### Feature-map intuition
Early feature maps may respond to edges, color blobs, or textures; deeper feature maps can behave like combinations of local shapes. Do not treat them as handwritten rules. They are learned intermediate representations.

### Lab action
Switch filters and color scales: activation color shows response strength, weights color shows connection weights, and logit color shows raw classifier-head scores.

### Ref ID
REF-CNN-EXPLAINER, REF-CS231N-CNN, REF-D2L-CNN`,
      ),
      loc(
        'filter 个数决定输出 channel；参数数量按 kernel、输入 channel 和输出 channel 计算。',
        'The number of filters sets output channels; parameter count comes from kernel size, input channels, and output channels.',
      ),
      loc(
        '先在挑战里预测输出 shape 和 Conv2d 参数量，再对比把整张图接到全连接层的参数量。',
        'First predict output shape and Conv2d parameter count in the challenge, then compare with connecting the whole image to a dense layer.',
      ),
    ),
    chapter(
      'pooling-classifier-head',
      'modules.cnnVisualization.sections.poolingClassifierHead.title',
      loc(
        `CNN 主干会逐步把局部纹理变成更抽象的 feature map，最后还要接分类头。

### 常见小结构
~~~python
model = nn.Sequential(
    nn.Conv2d(3, 16, kernel_size=3, padding=1),
    nn.ReLU(),
    nn.MaxPool2d(kernel_size=2),
    nn.Conv2d(16, 32, kernel_size=3, padding=1),
    nn.ReLU(),
    nn.AdaptiveAvgPool2d((1, 1)),
    nn.Flatten(),
    nn.Linear(32, 10),
)
~~~

MaxPool2d 会降低空间尺寸，让后续层用更少计算看更大的感受野。AdaptiveAvgPool2d((1, 1)) 把每个 channel 汇总成一个数，Linear 层再输出类别分数。

### 分类头在做什么
分类头不是在“看原图”。它读取的是 CNN 主干提炼出的表示。训练时，分类损失会把信号反传到前面的卷积层，让它们学会哪些局部模式对最终类别有用。

### Softmax 在实验台里做什么
Dense 层先产生 logits，Softmax 再把这些原始分数转成和为 1 的类别概率。最高概率是当前预测，但它不是对世界的保证。

### 想一想
如果池化太 aggressive，空间信息会丢失；如果完全不降采样，计算量和过拟合风险可能上升。

### Ref ID
REF-CNN-EXPLAINER、REF-CS231N-CNN、REF-D2L-CNN`,
        `A CNN backbone gradually turns local textures into more abstract feature maps, then a classifier head turns the representation into class scores.

### A common small structure
~~~python
model = nn.Sequential(
    nn.Conv2d(3, 16, kernel_size=3, padding=1),
    nn.ReLU(),
    nn.MaxPool2d(kernel_size=2),
    nn.Conv2d(16, 32, kernel_size=3, padding=1),
    nn.ReLU(),
    nn.AdaptiveAvgPool2d((1, 1)),
    nn.Flatten(),
    nn.Linear(32, 10),
)
~~~

MaxPool2d reduces spatial size so later layers can see larger receptive fields with less computation. AdaptiveAvgPool2d((1, 1)) summarizes each channel as one number, and the Linear layer outputs class scores.

### What does the classifier head read?
The head is not reading the original image. It reads the representation extracted by the CNN backbone. During training, classification loss sends signal backward into earlier convolution layers so they learn local patterns useful for the final class.

### What does Softmax do in the lab?
The Dense layer first creates logits, then Softmax converts those raw scores into class probabilities that sum to 1. The highest probability is the current prediction, not a guarantee about the world.

### Think about it
If pooling is too aggressive, spatial information disappears; if no downsampling happens, computation and overfitting risk can rise.

### Ref ID
REF-CNN-EXPLAINER, REF-CS231N-CNN, REF-D2L-CNN`,
      ),
      loc(
        '卷积主干提取 feature map，pooling 控制空间尺寸，分类头把表示变成类别分数。',
        'The convolutional backbone extracts feature maps, pooling controls spatial size, and the head turns representation into class scores.',
      ),
      loc(
        '在右侧 head 阶段，追踪 Conv2d -> ReLU -> MaxPool2d -> Linear 每一步改变了什么。',
        'Use the head stage to trace what changes at Conv2d -> ReLU -> MaxPool2d -> Linear.',
      ),
    ),
    chapter(
      'transfer-learning-review',
      'modules.cnnVisualization.sections.transferLearningReview.title',
      loc(
        `第一版 CNN 章节不需要马上训练大型视觉模型，但要知道真实项目常用 transfer learning。

### 迁移学习的项目骨架
一个常见流程是：加载预训练 backbone，替换最后分类头，先冻结大部分参数，只训练新 head；数据更充分后，再小学习率 fine-tune 部分高层。

~~~python
for param in backbone.parameters():
    param.requires_grad = False

classifier = nn.Linear(num_features, num_classes)
~~~

### 为什么适合入门项目
从零训练 CNN 需要更多数据和计算。迁移学习把已经学到的通用视觉特征当作起点，让学生能把注意力放在数据划分、增强、评估和错误样本上。

### 复盘卡
- 输入 shape 是否清楚？
- 训练/验证划分是否隔离？
- 数据增强是否只作用于训练集？
- 错误样本集中在哪些类别或场景？
- 上传图片的预测是否和训练类别一致？如果不一致，是模型能力问题、数据分布问题，还是类别定义问题？

### Ref ID
REF-CNN-EXPLAINER、REF-PYTORCH-CV-TRANSFER、REF-CS231N-CNN`,
        `The first CNN chapter does not need to train a large vision model immediately, but students should know that real projects often use transfer learning.

### Transfer-learning skeleton
A common flow is: load a pretrained backbone, replace the final classifier head, freeze most parameters first, train the new head, then fine-tune selected higher layers with a smaller learning rate when data is sufficient.

~~~python
for param in backbone.parameters():
    param.requires_grad = False

classifier = nn.Linear(num_features, num_classes)
~~~

### Why this suits an entry project
Training a CNN from scratch needs more data and compute. Transfer learning starts from general visual features, so students can focus on data splits, augmentation, evaluation, and error examples.

### Review card
- Is input shape clear?
- Are train and validation isolated?
- Does augmentation apply only to training?
- Which classes or scenes dominate errors?
- Does the uploaded-image prediction match the training classes? If not, is the issue model capacity, data distribution, or class definition?

### Ref ID
REF-CNN-EXPLAINER, REF-PYTORCH-CV-TRANSFER, REF-CS231N-CNN`,
      ),
      loc(
        '迁移学习不是跳过 CNN 原理，而是把已有视觉表示当作项目起点。',
        'Transfer learning does not skip CNN principles; it starts a project from an existing visual representation.',
      ),
      loc(
        '在右侧 transfer 阶段，说明冻结 backbone 和替换 classifier head 分别解决什么问题。',
        'Use the transfer stage to explain what freezing the backbone and replacing the classifier head each solve.',
      ),
    ),
  ],
  controls: [],
  presets: [],
  sourceNote: loc(
    '统一资料入口：REF-CNN-EXPLAINER、REF-CS231N-CNN、REF-D2L-CNN、REF-PYTORCH-CV-TRANSFER、REF-CONV-ARITHMETIC。',
    'Centralized references: REF-CNN-EXPLAINER, REF-CS231N-CNN, REF-D2L-CNN, REF-PYTORCH-CV-TRANSFER, REF-CONV-ARITHMETIC.',
  ),
  createDefaultConfig: () => ({
    playbackMs: 900,
  }),
  simulate: simulateCnnVisualization,
}
