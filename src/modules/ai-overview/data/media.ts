import type { AiOverviewMediaAsset } from '../types'

const loc = (zhCN: string, en: string) => ({ 'zh-CN': zhCN, en })

type CardSpec = {
  id: string
  availability?: AiOverviewMediaAsset['availability']
  chapterId: AiOverviewMediaAsset['chapterId']
  title: readonly [string, string]
  caption: readonly [string, string]
  englishSummary: string
  labels: readonly [
    readonly [string, string],
    readonly [string, string],
    readonly [string, string],
    readonly [string, string],
  ]
}

const card = (spec: CardSpec): AiOverviewMediaAsset => {
  const [problem, information, method, output] = spec.labels
  const content = {
    id: spec.id,
    kind: 'imagegen' as const,
    chapterId: spec.chapterId,
    title: loc(...spec.title),
    caption: loc(...spec.caption),
    englishSummary: spec.englishSummary,
    bilingualLabels: [
      loc(`问题：${problem[0]}`, `Problem: ${problem[1]}`),
      loc(`已有信息：${information[0]}`, `Available information: ${information[1]}`),
      loc(`怎么学：${method[0]}`, `How it learns: ${method[1]}`),
      loc(`输出：${output[0]}`, `Output: ${output[1]}`),
    ],
  }
  return spec.availability === 'deferred'
    ? { ...content, availability: 'deferred', publicPath: null }
    : { ...content, availability: 'available', publicPath: `/ai-overview/generated/${spec.id}.png` }
}

export const aiOverviewMediaAssets: readonly AiOverviewMediaAsset[] = [
  {
    id: 'ai-overview-hero',
    kind: 'imagegen',
    availability: 'available',
    publicPath: '/ai-overview/generated/ai-learning-overview-hero.png',
    chapterId: 'three-problems',
    title: loc('AI 学习全景', 'AI learning overview'),
    caption: loc(
      '趋势、聚类和路径箭头把三种学习范式放进同一张课程地图。',
      'Trend, cluster, and path cues place the three learning paradigms on one course map.',
    ),
    englishSummary: 'A learner and screen-based assistant inspect one map linking prediction, pattern discovery, and sequential decisions.',
    bilingualLabels: [loc('AI 学习全景', 'AI learning overview')],
  },
  card({
    id: 'score-prediction', chapterId: 'three-problems',
    title: ['得分预测', 'Score prediction'],
    caption: ['模型从练习记录预测下一次得分，并用真实得分提供监督信号。', 'A model predicts the next score from practice records and uses the observed score as supervision.'],
    englishSummary: 'Supervised learning connects practice duration and historical scores to one next-score prediction, then compares it with the observed result.',
    labels: [
      ['预测下一次练习得分', 'Predict the next practice score'],
      ['练习时长、历史得分', 'Practice duration and historical scores'],
      ['比较预测分数与真实得分', 'Compare the predicted and observed scores'],
      ['一个预测分数', 'One predicted score'],
    ],
  }),
  card({
    id: 'pattern-discovery', chapterId: 'three-problems',
    title: ['模式发现', 'Pattern discovery'],
    caption: ['没有预先给定群组名称时，模型按表现与答题时间发现相似结构。', 'Without predefined group names, a model discovers similar structure from performance and response time.'],
    englishSummary: 'Unsupervised learning groups nearby learner records by accuracy and average response time without target labels.',
    labels: [
      ['发现相似学习模式', 'Discover similar learning patterns'],
      ['正确率、平均答题时间', 'Accuracy and average response time'],
      ['把相似的学习者分到一起', 'Group similar learners together'],
      ['若干学习者群组', 'Several learner groups'],
    ],
  }),
  card({
    id: 'exercise-selection', chapterId: 'three-problems',
    title: ['练习选择', 'Exercise selection'],
    caption: ['系统根据当前状态选择练习，再用奖励调整下一次行动。', 'The system chooses an exercise from the current state, then uses reward to adjust its next action.'],
    englishSummary: 'Reinforcement learning links learner state, an exercise action, and reward feedback into a sequential policy.',
    labels: [
      ['选择下一道练习', 'Choose the next exercise'],
      ['当前掌握状态、可选难度', 'Current mastery state and available difficulty levels'],
      ['根据奖励调整下一次选择', 'Use reward to adjust the next choice'],
      ['下一步练习策略', 'A next-exercise policy'],
    ],
  }),
  card({
    id: 'house-price', chapterId: 'supervised-linear-regression',
    title: ['房价预测', 'House-price prediction'],
    caption: ['直线回归比较预测价格与历史成交价，并依据残差寻找更合适的直线。', 'Linear regression compares predicted prices with historical sales and uses residuals to seek a better line.'],
    englishSummary: 'Observed area-price pairs, a candidate line, and residuals show regression fitting rather than memorization.',
    labels: [
      ['预测一套房屋的价格', 'Predict the price of a house'],
      ['房屋面积、历史成交价', 'House area and historical sale prices'],
      ['比较预测与真实价格，寻找更合适的直线', 'Compare predicted and observed prices to find a better line'],
      ['预测房价', 'A predicted house price'],
    ],
  }),
  card({
    id: 'user-segmentation', chapterId: 'unsupervised-kmeans',
    title: ['用户分群', 'User segmentation'],
    caption: ['K-means 反复分配用户并更新中心，在不命名群组的前提下发现相似行为。', 'K-means repeatedly assigns users and updates centers to find similar behavior without naming the groups.'],
    englishSummary: 'Color-plus-shape clusters, assignment lines, and moving centers illustrate the K-means update loop.',
    labels: [
      ['发现行为相似的用户', 'Find users with similar behavior'],
      ['访问频率、平均消费', 'Visit frequency and average spending'],
      ['反复分组并更新群组中心', 'Repeat grouping and update group centers'],
      ['若干用户群组', 'Several user groups'],
    ],
  }),
  card({
    id: 'spam-detection', chapterId: 'learning-paradigms',
    title: ['垃圾邮件识别', 'Spam detection'],
    caption: ['历史人工标签为邮件分类提供监督信号，但模型判断并不代表绝对确定。', 'Historical human labels supervise email classification without implying perfect certainty.'],
    englishSummary: 'Email-content features and historical labels support a supervised choice between spam and normal mail.',
    labels: [
      ['判断邮件是否为垃圾邮件', 'Decide whether an email is spam'],
      ['邮件内容、发件信息、历史标签', 'Email content, sender information, and historical labels'],
      ['比较模型判断与人工标签', 'Compare model decisions with human labels'],
      ['垃圾邮件或正常邮件', 'Spam or normal mail'],
    ],
  }),
  card({
    id: 'electricity-demand', chapterId: 'learning-paradigms',
    title: ['用电量预测', 'Electricity-demand prediction'],
    caption: ['时间有序的历史用电和天气信息支持下一时段预测，再与真实用电量比较。', 'Time-ordered usage and weather information support a next-period forecast that is compared with observed demand.'],
    englishSummary: 'A time series, weather cues, uncertainty, and a later observed value illustrate supervised demand forecasting.',
    labels: [
      ['预测下一时段的用电量', 'Predict electricity demand for the next period'],
      ['历史用电、时间、天气', 'Historical usage, time, and weather'],
      ['比较预测值与真实用电量', 'Compare the forecast with observed electricity demand'],
      ['一个用电量预测值', 'One electricity-demand forecast'],
    ],
  }),
  card({
    id: 'news-topics', chapterId: 'learning-paradigms',
    title: ['新闻主题分组', 'News-topic grouping'],
    caption: ['模型根据标题和关键词的相似性反复调整主题分组，不依赖预先给定的主题标签。', 'A model repeatedly adjusts topic groups from headline and keyword similarity without predefined topic labels.'],
    englishSummary: 'Abstract news cards move into unlabeled topic groups encoded by both color and shape.',
    labels: [
      ['把内容相似的新闻放在一起', 'Group news items with similar content'],
      ['新闻标题、正文关键词', 'News headlines and body keywords'],
      ['比较内容相似性并反复调整分组', 'Compare content similarity and repeatedly adjust groups'],
      ['若干新闻主题群组', 'Several news-topic groups'],
    ],
  }),
  card({
    id: 'color-compression', chapterId: 'learning-paradigms',
    title: ['图片颜色压缩', 'Image color compression'],
    caption: ['相近像素颜色围绕中心色分组，在保留图像结构的同时减少调色板。', 'Similar pixel colors group around center colors, reducing the palette while preserving image structure.'],
    englishSummary: 'Palette clustering replaces nearby colors with center swatches while keeping the original pixel-grid structure.',
    labels: [
      ['用更少的颜色表示图片', 'Represent an image with fewer colors'],
      ['每个像素的颜色', 'The color of each pixel'],
      ['把相近颜色分组并用中心颜色替换', 'Group nearby colors and replace them with center colors'],
      ['颜色更少的压缩图片', 'A compressed image with fewer colors'],
    ],
  }),
  card({
    id: 'robot-control', chapterId: 'learning-paradigms',
    title: ['机械臂控制', 'Robot-arm control'],
    caption: ['机械臂尝试动作，并根据抓取成功或失败得到奖励以更新控制策略。', 'A robot arm attempts actions and uses success-or-failure rewards to update its control policy.'],
    englishSummary: 'A non-humanoid industrial arm links joint state and action choices to grasping rewards and future policy updates.',
    labels: [
      ['让机械臂稳定抓取物体', 'Make a robot arm grasp an object reliably'],
      ['物体位置、机械臂状态、可选动作', 'Object position, arm state, and available actions'],
      ['尝试动作，根据抓取成功或失败获得奖励', 'Try actions and receive reward from grasping success or failure'],
      ['机械臂控制策略', 'A robot-arm control policy'],
    ],
  }),
  card({
    id: 'traffic-signals', availability: 'deferred', chapterId: 'learning-paradigms',
    title: ['交通信号调度', 'Traffic-signal scheduling'],
    caption: ['调度器尝试安全的信号切换，并根据车辆等待时间变化获得奖励。', 'A scheduler tries safe signal changes and receives reward from changes in vehicle waiting time.'],
    englishSummary: 'A safe four-way signal phase, queue state, switching actions, and waiting-time reward form a reinforcement-learning loop.',
    labels: [
      ['减少路口车辆等待时间', 'Reduce vehicle waiting time at an intersection'],
      ['各方向车流、当前信号、可选切换动作', 'Traffic in each direction, current signals, and available switching actions'],
      ['尝试调度方案，根据等待时间变化获得奖励', 'Try schedules and receive reward from changes in waiting time'],
      ['交通信号控制策略', 'A traffic-signal control policy'],
    ],
  }),
]
