"""Deterministic 90-second Q-learning strategy-formation lesson."""

from manim import Arrow, FadeIn, FadeOut, Group, LEFT, MathTex, RIGHT, Scene, Square, Text, UP, VGroup, Write

from palette import BACKGROUND, BLUE, CHINESE_FONT, CYAN, GREEN, GRID, INK, MUTED, ORANGE, PINK, RED, YELLOW


START = (3, 0)
GOAL = (0, 3)
OBSTACLES = {(1, 1), (2, 2)}
LEARNED_PATH = [(3, 0), (2, 0), (1, 0), (0, 0), (0, 1), (0, 2), (0, 3)]
SNAPSHOTS = [(1, 26, -25, False), (5, 17, -6, True), (20, 6, 5, True), (50, 12, -1, True)]


class QLearningStrategy(Scene):
    """Approved storyboard 9.3, matching seed 7107 and the desktop lab."""

    def construct(self):
        self.camera.background_color = BACKGROUND
        grid, cells = self._environment()
        self._advance_to(8)
        self._state_actions(grid, cells)
        self._advance_to(18)
        self._numeric_update()
        self._advance_to(34)
        self._exploration()
        self._advance_to(44)
        self._training_snapshots(grid, cells)
        self._advance_to(70)
        self._evaluation(grid, cells)
        self._advance_to(82)
        self._transfer()
        self._advance_to(90)

    def _make_grid(self):
        cells = {}
        squares = VGroup()
        for row in range(4):
            for column in range(4):
                cell = Square(side_length=1.15, color=INK, stroke_width=2)
                cell.move_to(((column - 1.5) * 1.15 - 1.4, (1.5 - row) * 1.15 - 0.15, 0))
                if (row, column) in OBSTACLES:
                    cell.set_fill(RED, opacity=0.8)
                elif (row, column) == START:
                    cell.set_fill(CYAN, opacity=0.65)
                elif (row, column) == GOAL:
                    cell.set_fill(GREEN, opacity=0.75)
                else:
                    cell.set_fill(BACKGROUND, opacity=1)
                cells[(row, column)] = cell
                squares.add(cell)
        return squares, cells

    def _environment(self):
        title = Text("4×4 世界：从起点走到目标", font=CHINESE_FONT, font_size=41, color=INK).to_edge(UP, buff=0.3)
        grid, cells = self._make_grid()
        grid.shift(1.0 * LEFT)
        labels = VGroup(
            Text("起点 S", font=CHINESE_FONT, font_size=23, color=CYAN),
            Text("目标 G", font=CHINESE_FONT, font_size=23, color=GREEN),
            Text("障碍 ■", font=CHINESE_FONT, font_size=23, color=RED),
            Text("奖励：到达 +10｜普通一步 -1｜碰撞 -3", font=CHINESE_FONT, font_size=24, color=INK),
            Text("固定 seed=7107", font=CHINESE_FONT, font_size=22, color=MUTED),
        ).arrange((0, -1, 0), aligned_edge=(-1, 0, 0), buff=0.3).to_edge(RIGHT, buff=0.55)
        self.play(FadeIn(title), FadeIn(grid), run_time=1.4)
        self.play(FadeIn(labels), run_time=1.2)
        self._env_group = VGroup(title, labels)
        return grid, cells

    def _state_actions(self, grid, cells):
        self.play(FadeOut(self._env_group), run_time=0.5)
        title = Text("状态 state、动作 action 与 Q value", font=CHINESE_FONT, font_size=37, color=INK).to_edge(UP, buff=0.3)
        center = cells[START].get_center()
        arrows = VGroup(
            Arrow(center, center + (0, 0.8, 0), buff=0.2, color=BLUE),
            Arrow(center, center + (0.8, 0, 0), buff=0.2, color=BLUE),
            Arrow(center, center + (0, -0.8, 0), buff=0.2, color=BLUE),
            Arrow(center, center + (-0.8, 0, 0), buff=0.2, color=BLUE),
        )
        copy = VGroup(
            Text("state：当前位置", font=CHINESE_FONT, font_size=25, color=CYAN),
            Text("action：上、右、下、左", font=CHINESE_FONT, font_size=25, color=BLUE),
            Text("Q(s,a)：在状态 s 做动作 a，之后继续行动的长期价值估计", font=CHINESE_FONT, font_size=23, color=INK),
        ).arrange((0, -1, 0), aligned_edge=(-1, 0, 0), buff=0.35).to_edge(RIGHT, buff=0.28)
        self.play(FadeIn(title), FadeIn(arrows), FadeIn(copy), run_time=1.4)
        self._state_group = VGroup(title, arrows, copy)

    def _numeric_update(self):
        self.play(FadeOut(Group(*self.mobjects)), run_time=0.6)
        title = Text("一次行动如何更新 Q value？", font=CHINESE_FONT, font_size=40, color=INK).to_edge(UP, buff=0.3)
        relation = Text("新估计 = 旧估计 + 学习率 ×（目标 − 旧估计）", font=CHINESE_FONT, font_size=29, color=BLUE)
        formula = MathTex(r"Q(s,a)\leftarrow Q(s,a)+\alpha[r+\gamma\max_{a'}Q(s',a')-Q(s,a)]", color=INK).scale(0.72)
        values = VGroup(
            MathTex(r"Q_{old}=2,\quad r=+10,\quad \max Q(s',a')=4", color=ORANGE).scale(0.72),
            MathTex(r"target=10+0.9\times4=13.6", color=BLUE).scale(0.78),
            MathTex(r"correction=13.6-2=11.6", color=PINK).scale(0.78),
            MathTex(r"Q_{new}=2+0.5\times11.6=7.8", color=GREEN).scale(0.82),
        ).arrange((0, -1, 0), buff=0.23)
        group = VGroup(relation, formula, values).arrange((0, -1, 0), buff=0.4)
        self.play(FadeIn(title), FadeIn(relation), run_time=1.0)
        self.play(Write(formula), run_time=1.4)
        for item in values:
            self.play(Write(item), run_time=0.85)
        warning = Text("reward 不是监督标签；Q value 也不等于即时 reward", font=CHINESE_FONT, font_size=25, color=RED).to_edge((0, -1, 0), buff=0.28)
        self.play(FadeIn(warning), run_time=0.8)

    def _exploration(self):
        self.play(FadeOut(Group(*self.mobjects)), run_time=0.6)
        title = Text("探索，还是选择当前最优动作？", font=CHINESE_FONT, font_size=41, color=INK).to_edge(UP, buff=0.55)
        explore = VGroup(
            Text("探索 exploration", font=CHINESE_FONT, font_size=32, color=ORANGE),
            Text("偶尔试不同动作，发现未知路线", font=CHINESE_FONT, font_size=25, color=MUTED),
        ).arrange((0, -1, 0), buff=0.28).shift(3.2 * LEFT)
        exploit = VGroup(
            Text("利用 best action", font=CHINESE_FONT, font_size=32, color=GREEN),
            Text("选择当前 Q value 最大的动作", font=CHINESE_FONT, font_size=25, color=MUTED),
        ).arrange((0, -1, 0), buff=0.28).shift(3.2 * RIGHT)
        fixed = Text("训练固定 exploration rate = 0.3", font=CHINESE_FONT, font_size=28, color=BLUE).to_edge((0, -1, 0), buff=0.6)
        self.play(FadeIn(title), FadeIn(explore), FadeIn(exploit), run_time=1.3)
        self.play(FadeIn(fixed), run_time=0.8)

    def _training_snapshots(self, grid, cells):
        self.play(FadeOut(Group(*self.mobjects)), run_time=0.6)
        grid, cells = self._make_grid()
        grid.shift(3.0 * LEFT)
        title = Text("固定参数训练：episode 1 → 5 → 20 → 50", font=CHINESE_FONT, font_size=34, color=INK).to_edge(UP, buff=0.3)
        self.play(FadeIn(title), FadeIn(grid), run_time=1.0)
        cards = VGroup()
        for episode, steps, reward, reached in SNAPSHOTS:
            status = "到达目标" if reached else "尚未形成稳定策略"
            card = VGroup(
                Text(f"episode {episode}", font=CHINESE_FONT, font_size=24, color=BLUE),
                Text(f"轨迹步数 {steps}｜累计 reward {reward}", font=CHINESE_FONT, font_size=20, color=INK),
                Text(status, font=CHINESE_FONT, font_size=19, color=GREEN if reached else ORANGE),
            ).arrange((0, -1, 0), aligned_edge=(-1, 0, 0), buff=0.12)
            cards.add(card)
        cards.arrange((0, -1, 0), aligned_edge=(-1, 0, 0), buff=0.32).to_edge(RIGHT, buff=0.3)
        for index, card in enumerate(cards):
            self.play(FadeIn(card), run_time=0.8)
            if index > 0:
                path = LEARNED_PATH[: min(len(LEARNED_PATH), index + 4)]
                arrows = self._path_arrows(cells, path)
                self.play(FadeIn(arrows), run_time=0.7)
                self.play(FadeOut(arrows), run_time=0.35)
        legend = Text("Q value 越高，策略箭头越明确", font=CHINESE_FONT, font_size=23, color=PINK).to_edge((0, -1, 0), buff=0.2)
        self.play(FadeIn(legend), run_time=0.8)
        self._training_group = VGroup(title, grid, cards, legend)

    def _evaluation(self, grid, cells):
        self.play(FadeOut(Group(*self.mobjects)), run_time=0.6)
        title = Text("评估时关闭探索：exploration rate = 0", font=CHINESE_FONT, font_size=37, color=INK).to_edge(UP, buff=0.3)
        left_grid, left_cells = self._make_grid()
        left_grid.scale(0.72).shift(3.3 * LEFT)
        right_grid, right_cells = self._make_grid()
        right_grid.scale(0.72).shift(3.3 * RIGHT)
        left_label = Text("初始：反复撞边，8 步 reward=-8", font=CHINESE_FONT, font_size=22, color=RED).next_to(left_grid, (0, -1, 0), buff=0.25)
        right_label = Text("学习后：6 步到达，reward=+5", font=CHINESE_FONT, font_size=22, color=GREEN).next_to(right_grid, (0, -1, 0), buff=0.25)
        self.play(FadeIn(title), FadeIn(left_grid), FadeIn(right_grid), FadeIn(left_label), FadeIn(right_label), run_time=1.3)
        stable = self._path_arrows(right_cells, LEARNED_PATH)
        self.play(FadeIn(stable), run_time=1.5)
        self._eval_group = VGroup(title, left_grid, right_grid, left_label, right_label, stable)

    def _transfer(self):
        self.play(FadeOut(Group(*self.mobjects)), run_time=0.6)
        title = Text("映射回学习助手：选择下一道练习", font=CHINESE_FONT, font_size=40, color=INK).to_edge(UP, buff=0.55)
        flow = VGroup(
            Text("state：当前掌握状态", font=CHINESE_FONT, font_size=30, color=CYAN),
            Text("action：选择练习难度", font=CHINESE_FONT, font_size=30, color=BLUE),
            Text("reward：稍后的学习改善", font=CHINESE_FONT, font_size=30, color=ORANGE),
            Text("policy：在每种掌握状态下选择下一步", font=CHINESE_FONT, font_size=30, color=GREEN),
        ).arrange((0, -1, 0), aligned_edge=(-1, 0, 0), buff=0.38)
        note = Text("策略仍需安全约束；奖励设计错误会鼓励意外行为。", font=CHINESE_FONT, font_size=24, color=RED).to_edge((0, -1, 0), buff=0.35)
        self.play(FadeIn(title), run_time=0.8)
        for item in flow:
            self.play(FadeIn(item), run_time=0.6)
        self.play(FadeIn(note), run_time=0.7)

    def _path_arrows(self, cells, path):
        arrows = VGroup()
        for start, end in zip(path, path[1:]):
            a = cells[start].get_center()
            b = cells[end].get_center()
            arrows.add(Arrow(a, b, buff=0.18, color=YELLOW, stroke_width=6, max_tip_length_to_length_ratio=0.25))
        return arrows

    def _advance_to(self, timestamp):
        remaining = timestamp - float(self.renderer.time)
        if remaining > 0:
            self.wait(remaining)
