# ML Atlas

ML Atlas 是一个基于 Vue 3、TypeScript、Vite 的机器学习教学站点。项目面向零基础或基础薄弱的学生，用图文教程、互动实验、可视化和 checkpoint 帮助学生把数学、数据处理、模型训练行为连成一条可复习的学习路径。

## AI 基础主课程

- 规范入口：`/courses/ai-foundation`。
- 课程架构：A 数据与编程基础、B 机器学习核心、C 深度学习/CV/NLP、D Transformer/LLM，共 25 个大纲单元、50 个参考学时。
- 当前发布：A 编六个单元已形成“核心问题—代码—现有资源—实践—误区—checkpoint—成果自检”学习闭环；B—D 编只展示阶段目标和建设状态。
- Support Lenses：Math Lab、Data Lab、算法讲解和项目实战作为按需深入资源，服务主课程，不与主课程争夺默认起点。
- Progress：课程步骤和成果自检写入新的本地进度层；原有算法、Math Lab、Data Lab 和 Learning Progress V2 数据保持兼容。

旧 `/spine`、`/learn/*`、Math Lab 和 Data Lab 深链全部保留。Default Spine 继续作为旧知识地图和兼容入口，不再承担首页默认学习路径。

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
