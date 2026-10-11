# 得分预测插图 v2

2026-10-11 使用 Codex 内置 imagegen，以已存在的 v1 卡片为风格参考重新绘制；没有使用 API key、SDK 或命令行生成。保留原图，新的运行时文件为 `public/ai-overview/generated/score-prediction-v2.png`。

目的：旧图用未标坐标含义的上升折线表达得分预测，并把中文四项要点写进图片。v2 分开“历史记录训练”和“新样本预测”，不使用虚构数值图或嵌字；读图顺序、符号意义和四项要点由现有双语媒体 schema 提供。

生成后检查：上方三个历史记录都有时钟与实心星；下方新记录只有时钟；固定模型输出空心星；方向明确、无中文／英文嵌字、无数值刻度。模型图标只作类比，不表示特定算法架构。时钟表示时长而非时刻；锁表示本次预测不更新参数，均在正文说明。

原始生成文件：`/Users/jackky/.codex/generated_images/01a1017d-5b66-7752-be94-221b7ddfd05f/exec-3b10336c-18dd-4e8a-95f3-76a596699c59.png`。此路径仅作制作溯源，页面使用 public 相对路径并经过 `withPublicBase`。内容哈希、旧版记录与当前 prompt 在 [assets.json](assets.json) 中。

## 最终提示词

```text
Redraw this ML Atlas educational illustration. Preserve the restrained warm ivory background, dark navy outlines, blue/teal/violet accent palette and polished flat textbook illustration style, but replace the entire composition. This must teach the distinction between training on past labeled examples and predicting from a new input. Landscape image, 3:2 aspect ratio, very clean at 360px width. Exactly TWO large horizontal lanes with ample whitespace, separated by a thin subtle horizontal rule. TOP lane: at left, three vertically stacked simple cards, each showing a small clock icon paired with a filled green star icon (past practice duration paired with observed score). A single clear arrow goes right from this group into a blue rounded rectangular model block bearing only a simple adjustable-sliders icon; a small curved adjustment arrow wraps beside that block to indicate learning. BOTTOM lane: at left ONE simple new-record card showing a clock icon only, with NO star and NO target. A clear one-way arrow goes right into a visually identical blue model block, now bearing a small padlock badge to show its parameters are fixed. One clear arrow from this block to a single large hollow violet star inside an outlined circular badge, representing a predicted score, visually distinct from the green filled observed stars. Keep these three bottom elements aligned. All arrows must connect the intended groups, no arrows between the two lanes, no decorative charts, no axes, no upward trend line, no brain or neural network wallpaper. The picture is an analogy, not a quantitative graph. Absolutely NO text, letters, numerals, formulas, captions, lower information cards, titles, watermarks, logos or pseudo-text anywhere. The application will supply all explanatory bilingual labels as HTML outside the bitmap. Use large simple shapes, strong contrast and distinct filled versus hollow forms, not color alone. No realistic people are needed. This is a precise teaching diagram with only the described elements.
```
