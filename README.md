# ML Atlas

ML Atlas 是一个基于 Vue 3、TypeScript、Vite 的机器学习教学站点。项目面向零基础或基础薄弱的学生，用图文教程、互动实验、可视化和 checkpoint 帮助学生把数学、数据处理、模型训练行为连成一条可复习的学习路径。

## 学习地图

- Default Spine：默认从 AI 总览、Python notebook、原始数据、特征、损失、训练动态、泛化、表格模型、MLP、CNN 和序列/Embedding 桥接走到 Attention/Transformer 入门。
- Support Lenses：Math Lab、Data Lab、ML Models 和 Deep Learning Lens 作为按需补课入口，服务主线阶段，不再和默认路线并列抢起点。
- Projects：房价预测和分类筛查项目作为推荐验证，帮助学习者把清洗、特征、模型选择和指标复盘串起来。
- Progress：当前进度页保留本地进度与继续学习入口；学习闭环、账号和数据库能力等后端配套会在后续阶段再扩展。

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
