# ML Atlas

ML Atlas 是一个基于 Vue 3、TypeScript、Vite 的机器学习教学站点。项目面向零基础或基础薄弱的学生，用图文教程、互动实验、可视化和 checkpoint 帮助学生把数学、数据处理、模型训练行为连成一条可复习的学习路径。

## 学习地图

- Math Lab：向量、矩阵、Taylor 展开、概率、优化、SVD/PCA、自动微分和深度架构数学。
- Data Lab：数值特征、类别特征、清洗、EDA、数据划分、复杂度和正则化。
- ML Models：loss、gradient descent、linear regression、logistic regression、classification 和 MLP。
- Deep Learning：当前以 MLP 和深度结构数学作为入口，后续继续扩展 CNN、Attention、Transformer 和 optimizer 对比。

## 开发命令

```bash
npm install
npm run dev
npm test
npm run build
npm run build:pages
npm run security:audit
```

## 验收重点

- 课程内容应同时提供 `zh-CN` 和 `en` 文案。
- 新增数学、数据变换、评分和训练模拟逻辑时，需要补充 `tests/*.test.*`。
- public 资源路径应使用以 `/` 开头的路径，并兼容 GitHub Pages `BASE_URL`。
- 不要提交 `node_modules/`、`dist/`、`.cache/`、`.playwright-cli/` 或临时截图。
