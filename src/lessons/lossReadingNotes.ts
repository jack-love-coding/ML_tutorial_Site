import type { AppLocale, StorySection } from '../types/ml'

export function sectionCompanionCopy(locale: AppLocale, section?: StorySection) {
  if (!section) return undefined

  if (locale === 'zh-CN') {
    const sectionNotes: Record<string, { title: string; body: string }> = {
      'why-loss': {
        title: '这一章要建立的直觉',
        body: '先把“误差”和“损失”分开。误差只是差距，损失是我们主动选择的评分规则；规则一变，后面的优化目标也会跟着变。',
      },
      'regression-losses': {
        title: '这一章要看的重点',
        body: '离群点是最好的放大镜。它会立刻暴露 MSE 和 MAE 在真实数据上会形成怎样不同的拟合偏好。',
      },
      'classification-losses': {
        title: '这一章要看的重点',
        body: '不要只盯着 0 和 1。交叉熵真正惩罚的是“错误时有多自信”，以及“正确时是否足够自信”。',
      },
      'likelihood-intuition': {
        title: '这一章要建立的直觉',
        body: '似然是在比较“哪个参数更能解释这批数据”。它不是在问参数本身有多可能，而是在给候选参数做解释力排名。',
      },
      'negative-log': {
        title: '这一章要看的重点',
        body: '把很多个小概率连乘之后，数字会迅速变得很小；取对数再加负号，是把这个概率比较问题翻译成稳定、可优化的损失。',
      },
      'mle-bridge': {
        title: '这一章要建立的桥梁',
        body: '把 loss 看成 negative log-likelihood 之后，损失函数就不再是凭经验挑的公式，而是有概率来源的建模假设。',
      },
    }

    return sectionNotes[section.id]
  }

  const sectionNotes: Record<string, { title: string; body: string }> = {
    'why-loss': {
      title: 'The intuition to build here',
      body: 'Separate error from loss. Error is the gap; loss is the scoring rule we choose for that gap, and the rule changes the objective.',
    },
    'regression-losses': {
      title: 'What to focus on here',
      body: 'Outliers are the fastest way to see the difference. They immediately expose how MSE and MAE prefer different fits on real data.',
    },
    'classification-losses': {
      title: 'What to focus on here',
      body: 'Do not stop at right versus wrong. Cross-entropy is really about how confident the model is when it is right or disastrously wrong.',
    },
    'likelihood-intuition': {
      title: 'The intuition to build here',
      body: 'Likelihood ranks parameter candidates by explanatory power. It is not asking how likely the parameter is by itself.',
    },
    'negative-log': {
      title: 'What to focus on here',
      body: 'Products of many small probabilities shrink quickly. Logs and the minus sign rewrite that comparison as a stable optimization objective.',
    },
    'mle-bridge': {
      title: 'The bridge to build here',
      body: 'Once loss becomes negative log-likelihood, the formula stops feeling arbitrary and starts feeling like a modeling choice.',
    },
  }

  return sectionNotes[section.id]
}

export function lessonBridgeFor(locale: AppLocale, section?: StorySection) {
  if (!section) return undefined
  if (section.id === 'likelihood-intuition' || section.id === 'negative-log') return undefined

  const isOptimizationBridge =
    section.id === 'why-loss' || section.id === 'regression-losses'

  return locale === 'zh-CN'
    ? isOptimizationBridge
      ? {
          route: '/learn/gradient-descent',
          eyebrow: '下一课',
          title: '把损失函数放进梯度下降的地形里',
          body: '当你已经知道误差如何被写成目标函数，下一步就是观察优化器怎样沿着这张地形往下走。',
          cta: '进入梯度下降',
        }
      : {
          route: '/learn/logistic-regression',
          eyebrow: '应用桥接',
          title: '在逻辑回归里看见交叉熵真正工作',
          body: '把这里的概率惩罚直觉带进分类模型，你会更容易理解为什么边界会这样移动。',
          cta: '进入逻辑回归',
        }
    : isOptimizationBridge
      ? {
          route: '/learn/gradient-descent',
          eyebrow: 'Next lesson',
          title: 'See loss functions become optimization landscapes',
          body: 'Once loss is concrete, the next step is watching an optimizer move across that surface.',
          cta: 'Open Gradient Descent',
        }
      : {
          route: '/learn/logistic-regression',
          eyebrow: 'Application bridge',
          title: 'Watch cross-entropy drive a real classifier',
          body: 'Carry this probability-penalty intuition into logistic regression and the boundary story becomes much clearer.',
          cta: 'Open Logistic Regression',
        }
}

