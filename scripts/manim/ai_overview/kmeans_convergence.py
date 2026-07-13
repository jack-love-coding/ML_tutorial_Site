"""Deterministic 88-second K-means convergence lesson."""

from manim import Axes, Create, Dot, FadeIn, FadeOut, Group, LEFT, Line, MathTex, RIGHT, Scene, Text, UP, VGroup, Write

from palette import BACKGROUND, BLUE, CHINESE_FONT, CYAN, GREEN, INK, MUTED, ORANGE, PINK, RED, YELLOW


POINTS = [(92, 28), (88, 33), (95, 37), (76, 64), (72, 71), (81, 68), (48, 31), (43, 37), (51, 42), (61, 88), (56, 82), (65, 93)]
INITIAL_CENTERS = [(43, 37), (88, 33), (56, 82)]
FINAL_CENTERS = [(47.3333333333, 36.6666666667), (91.6666666667, 32.6666666667), (68.5, 77.6666666667)]
ASSIGNMENTS = [1, 1, 1, 2, 2, 2, 0, 0, 0, 2, 2, 2]
CLUSTER_COLORS = [CYAN, PINK, ORANGE]


class KMeansConvergence(Scene):
    """Approved storyboard 9.2, matching K=3 and seed 3103."""

    def construct(self):
        self.camera.background_color = BACKGROUND
        axes, points = self._unlabeled_points()
        self._advance_to(8)
        centers = self._initialize(axes)
        self._advance_to(16)
        self._one_assignment(axes, points, centers)
        self._advance_to(28)
        self._all_assignments(points)
        self._advance_to(38)
        centers = self._move_centers(axes, centers)
        self._advance_to(52)
        self._repeat_and_curve(axes, points, centers)
        self._advance_to(72)
        self._converged()
        self._advance_to(80)
        self._interpretation()
        self._advance_to(88)

    def _base_axes(self):
        return Axes(
            x_range=[35, 100, 10], y_range=[20, 100, 20], x_length=9.4, y_length=5.6,
            axis_config={"color": MUTED, "include_ticks": True}, tips=False,
        ).shift(0.45 * LEFT)

    def _unlabeled_points(self):
        title = Text("没有分组答案，这些学习者有相似模式吗？", font=CHINESE_FONT, font_size=40, color=INK).to_edge(UP, buff=0.35)
        axes = self._base_axes()
        labels = axes.get_axis_labels(
            Text("正确率", font=CHINESE_FONT, font_size=23, color=MUTED),
            Text("平均答题时间", font=CHINESE_FONT, font_size=23, color=MUTED),
        )
        points = VGroup(*[Dot(axes.c2p(x, y), radius=0.1, color=BLUE) for x, y in POINTS])
        self.play(FadeIn(title), Create(axes), FadeIn(labels), run_time=1.7)
        self.play(*[FadeIn(point) for point in points], run_time=1.7)
        self._title = title
        self._labels = labels
        return axes, points

    def _initialize(self, axes):
        self.play(FadeOut(self._title), run_time=0.5)
        title = Text("设 K=3；固定 seed=3103，从已有点选 3 个中心", font=CHINESE_FONT, font_size=31, color=INK).to_edge(UP, buff=0.28)
        centers = VGroup(*[
            Dot(axes.c2p(x, y), radius=0.17, color=CLUSTER_COLORS[index], stroke_width=4, stroke_color=INK)
            for index, (x, y) in enumerate(INITIAL_CENTERS)
        ])
        tags = VGroup(*[
            Text(f"中心 {index + 1}", font=CHINESE_FONT, font_size=19, color=CLUSTER_COLORS[index]).next_to(center, UP, buff=0.12)
            for index, center in enumerate(centers)
        ])
        self.play(FadeIn(title), *[FadeIn(center) for center in centers], *[FadeIn(tag) for tag in tags], run_time=1.5)
        self._title = title
        self._center_tags = tags
        return centers

    def _one_assignment(self, axes, points, centers):
        self.play(FadeOut(VGroup(self._title, self._center_tags)), run_time=0.5)
        title = Text("分配：把一个点交给最近的中心", font=CHINESE_FONT, font_size=34, color=INK).to_edge(UP, buff=0.28)
        focus_index = 6
        focus = points[focus_index]
        lines = VGroup(*[Line(focus.get_center(), center.get_center(), color=CLUSTER_COLORS[index], stroke_width=3) for index, center in enumerate(centers)])
        equation = MathTex(r"d^2=(x-c_x)^2+(y-c_y)^2", color=INK).scale(0.76).to_corner(UP + RIGHT, buff=0.38)
        values = Text("到中心 1 最近 → 分到第 1 组", font=CHINESE_FONT, font_size=24, color=CYAN).next_to(equation, (0, -1, 0), buff=0.25)
        self.play(FadeIn(title), Create(lines), Write(equation), run_time=1.5)
        self.play(focus.animate.set_color(CYAN).scale(1.35), FadeIn(values), run_time=1.0)
        self.wait(0.7)
        self.play(FadeOut(VGroup(title, lines, equation, values)), focus.animate.scale(1 / 1.35), run_time=0.7)

    def _all_assignments(self, points):
        title = Text("对 12 个点重复“比较距离 → 分组”", font=CHINESE_FONT, font_size=34, color=INK).to_edge(UP, buff=0.28)
        legend = VGroup(*[
            Text(f"● 第 {index + 1} 组", font=CHINESE_FONT, font_size=23, color=color)
            for index, color in enumerate(CLUSTER_COLORS)
        ]).arrange((0, -1, 0), aligned_edge=LEFT, buff=0.24).to_edge(RIGHT, buff=0.35)
        self.play(FadeIn(title), FadeIn(legend), run_time=0.8)
        for point, assignment in zip(points, ASSIGNMENTS):
            self.play(point.animate.set_color(CLUSTER_COLORS[assignment]), run_time=0.32)
        self._title = title
        self._legend = legend

    def _move_centers(self, axes, centers):
        self.play(FadeOut(VGroup(self._title, self._legend)), run_time=0.5)
        title = Text("更新中心：分别计算横坐标与纵坐标的平均", font=CHINESE_FONT, font_size=32, color=INK).to_edge(UP, buff=0.28)
        math = VGroup(
            MathTex(r"c_x=\frac{48+43+51}{3}=47.33", color=CYAN).scale(0.58),
            MathTex(r"c_y=\frac{31+37+42}{3}=36.67", color=CYAN).scale(0.58),
        ).arrange((0, -1, 0), aligned_edge=LEFT, buff=0.22).to_edge(RIGHT, buff=0.28).shift(1.15 * UP)
        self.play(FadeIn(title), Write(math), run_time=1.4)
        for center, (x, y) in zip(centers, FINAL_CENTERS):
            self.play(center.animate.move_to(axes.c2p(x, y)), run_time=0.8)
        metric = Text("组内距离总和：2441 → 1293.5", font=CHINESE_FONT, font_size=27, color=GREEN).to_edge((0, -1, 0), buff=0.28)
        self.play(FadeIn(metric), run_time=0.8)
        self._move_group = VGroup(title, math, metric)
        return centers

    def _repeat_and_curve(self, axes, points, centers):
        self.play(FadeOut(self._move_group), run_time=0.5)
        title = Text("继续交替：重新分配，再更新中心", font=CHINESE_FONT, font_size=33, color=INK).to_edge(UP, buff=0.28)
        metric_axes = Axes(x_range=[0, 3, 1], y_range=[0, 2600, 500], x_length=4.2, y_length=2.5, tips=False, axis_config={"color": MUTED}).to_corner((1, -1, 0), buff=0.35)
        curve = VGroup(
            Line(metric_axes.c2p(0, 2441), metric_axes.c2p(1, 1293.5), color=GREEN, stroke_width=5),
            Line(metric_axes.c2p(1, 1293.5), metric_axes.c2p(2, 1293.5), color=GREEN, stroke_width=5),
        )
        caption = Text("组内距离总和", font=CHINESE_FONT, font_size=20, color=GREEN).next_to(metric_axes, UP, buff=0.1)
        self.play(FadeIn(title), Create(metric_axes), FadeIn(caption), run_time=1.2)
        self.play(Create(curve[0]), run_time=1.3)
        self.play(*[point.animate.scale(1.08) for point in points], run_time=0.7)
        self.play(*[point.animate.scale(1 / 1.08) for point in points], run_time=0.7)
        self.play(Create(curve[1]), run_time=1.2)
        iteration = Text("迭代 2：分组不再改变，中心不再移动", font=CHINESE_FONT, font_size=25, color=BLUE).to_edge((0, -1, 0), buff=0.25)
        self.play(FadeIn(iteration), run_time=0.8)
        self._repeat_group = VGroup(title, metric_axes, curve, caption, iteration)

    def _converged(self):
        self.play(FadeOut(Group(*self.mobjects)), run_time=0.5)
        title = Text("本次运行已收敛", font=CHINESE_FONT, font_size=52, color=GREEN)
        detail = Text("中心移动≈0，分配保持不变，组内距离总和=1293.5", font=CHINESE_FONT, font_size=27, color=INK)
        group = VGroup(title, detail).arrange((0, -1, 0), buff=0.45)
        self.play(FadeIn(group), run_time=1.2)
        self._converged_group = group

    def _interpretation(self):
        self.play(FadeOut(Group(*self.mobjects)), run_time=0.6)
        title = Text("聚类结果不是唯一答案", font=CHINESE_FONT, font_size=45, color=INK).to_edge(UP, buff=0.65)
        lines = VGroup(
            Text("K 的选择会改变分组粒度", font=CHINESE_FONT, font_size=29, color=BLUE),
            Text("初始中心会影响搜索路径", font=CHINESE_FONT, font_size=29, color=ORANGE),
            Text("群组含义仍需要人来解释", font=CHINESE_FONT, font_size=29, color=GREEN),
        ).arrange((0, -1, 0), aligned_edge=LEFT, buff=0.42)
        self.play(FadeIn(title), run_time=0.8)
        for line in lines:
            self.play(FadeIn(line), run_time=0.65)

    def _advance_to(self, timestamp):
        remaining = timestamp - float(self.renderer.time)
        if remaining > 0:
            self.wait(remaining)
