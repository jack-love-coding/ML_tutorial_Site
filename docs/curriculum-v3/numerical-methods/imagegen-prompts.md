# Numerical Methods image-generation record

## Shared Ames route illustration

- Public asset: `/math-lab/numerical-methods/ames-numerical-methods-chain.png`
- SHA-256: `47b7ae839a1ec670a9169fce6997473cf6b472c0859e5428dabfd4887489114c`
- Generated: 2026-07-20 with the Codex `imagegen` skill
- Learning role: route orientation only. Formulas, shapes, and numerical results remain authoritative in the typed lesson, executed Notebook, and Manim animations.

Prompt:

> 为中文机器学习教学网站 ML Atlas 制作一张专业、清晰、科学感的 16:9 横向教学插图，主题是“Ames 房价数值方法链”。画面从左到右形成连续流程：左侧是抽象化的房屋数据表与房屋图标，中间偏左是点云投影到平面与垂直残差线，中间偏右是矩阵经过三角分解形成 L、U 两个三角矩阵，右侧是圆形被线性变换拉成椭圆并出现近乎平行的两根特征箭头。只出现四组简短且准确的简体中文文字：顶部标题“Ames 数值方法链”，三个阶段标签“最小二乘”“LU 分解”“条件数”。不要出现其他文字、数字或伪公式。暖白背景，深海军蓝文字，蓝绿色主色，橙色只用于警示敏感方向；高对比度、留白充分、无渐变或仅极轻微渐变、扁平矢量信息图风格，适合教学页面首图，不要照片质感，不要人物，不要水印，不要品牌 logo。

## Sparse matrix and PCA case illustration

- Public asset: `/math-lab/numerical-methods/sparse-pca-two-cases.png`
- SHA-256: `61fdf91088593c24d30109fbde0d0fcb4139064471853f6fa57fcff7c0edbcc9`
- Generated: 2026-07-20 with the Codex `imagegen` skill
- Learning role: distinguish two independent applications. The left half explains sparse text storage; the right half explains PCA on a separate dense housing table. The graphic must never imply that the SMS matrix is sent into the Ames PCA example.

Prompt:

> 为中文机器学习教学网站 ML Atlas 生成一张 16:9 横向科学信息图，主题是“两个独立的数值计算案例”，不是一个前后相连的流水线。画面左右严格分栏，中间有清晰竖向分隔线，左右之间绝对不要画连接箭头。左侧案例：顶部仅用清晰准确的中文标题“稀疏文本 / CSR”。表现一张短信词项矩阵，绝大多数格子为空，少数青绿色和橙色格子有值；随后只在左侧内部用向下箭头拆解为 CSR 的 data、indices、indptr 三条紧凑数组。加入两个数据徽标，文字必须完全准确：“5574 × 1881”和“nnz = 69798”。右侧案例：顶部仅用清晰准确的中文标题“数值特征 / PCA”。表现一张稠密的 8 列房屋数值特征表，列之间用柔和相关线暗示相关性；随后只在右侧内部用向下箭头投影到旋转后的主轴坐标系，多个点云沿 PC1、PC2 分布，并显示从 8 维压缩到 4 维的概念。加入两个数据徽标，文字必须完全准确：“2927 × 8”和“k = 4 → 92.15%”。整体风格：现代、克制、专业的大学级科学教材插图；米白背景、深海军蓝文字、青绿为主、少量橙色强调；二维平面矢量感，线条清楚，适合网页正文；信息层次清晰，高对比度，留白充足。不要人物，不要 3D，不要装饰性图标，不要品牌 Logo，不要水印，不要长段文字，不要伪代码，不要英文说明。除上述标题和四个数据徽标外，不生成其他文字。
