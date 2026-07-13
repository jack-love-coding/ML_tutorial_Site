"""Deterministic 90-second Q-learning strategy-formation lesson."""

import json
from pathlib import Path

from manim import Arrow, Circle, FadeIn, FadeOut, Group, LEFT, MathTex, RIGHT, Scene, Square, Text, UP, VGroup, Write, interpolate_color

from palette import BACKGROUND, BLUE, CHINESE_FONT, CYAN, GREEN, GRID, INK, MUTED, ORANGE, PAPER, PINK, RED, YELLOW


START = (3, 0)
GOAL = (0, 3)
OBSTACLES = {(1, 1), (2, 2)}
FIXTURE = json.loads((Path(__file__).resolve().parents[3] / "public/manim/ai-overview/experiment-fixture.json").read_text(encoding="utf-8"))
TRAINING_SNAPSHOTS = FIXTURE["qLearning"]["snapshots"]
ACTION_OFFSETS = {"up": (-1, 0), "right": (0, 1), "down": (1, 0), "left": (0, -1)}


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
        title = Text("固定参数训练：episode 1 → 5 → 20 → 50", font=CHINESE_FONT, font_size=34, color=INK).to_edge(UP, buff=0.3)
        legend = Text(
            "格子颜色：红=负 Q、浅色=0、绿=正 Q｜蓝箭头=policy｜黄线=本轮实际轨迹",
            font=CHINESE_FONT, font_size=20, color=INK,
        ).to_edge((0, -1, 0), buff=0.18)
        self.play(FadeIn(title), FadeIn(legend), run_time=1.0)
        current_snapshot = None
        for snapshot in TRAINING_SNAPSHOTS:
            snapshot_group = self._snapshot_group(snapshot)
            if current_snapshot is not None:
                self.play(FadeOut(current_snapshot), run_time=0.35)
            self.play(FadeIn(snapshot_group), run_time=0.85)
            self.wait(4.0)
            current_snapshot = snapshot_group
        self._training_group = VGroup(title, legend, current_snapshot)

    def _evaluation(self, grid, cells):
        self.play(FadeOut(Group(*self.mobjects)), run_time=0.6)
        title = Text("评估时关闭探索：exploration rate = 0", font=CHINESE_FONT, font_size=37, color=INK).to_edge(UP, buff=0.3)
        left_grid, left_cells = self._make_grid()
        left_grid.scale(0.72).shift(3.3 * LEFT)
        right_grid, right_cells = self._make_grid()
        right_grid.scale(0.72).shift(3.3 * RIGHT)
        first_snapshot = TRAINING_SNAPSHOTS[0]
        final_snapshot = TRAINING_SNAPSHOTS[-1]
        learned_path = self._policy_trajectory(final_snapshot["policy"])
        left_label = VGroup(
            Text("episode 1 实际探索", font=CHINESE_FONT, font_size=21, color=RED),
            Text("26 步，reward=-25", font=CHINESE_FONT, font_size=20, color=RED),
        ).arrange((0, -1, 0), buff=0.1).next_to(left_grid, (0, -1, 0), buff=0.22)
        right_label = VGroup(
            Text("学习后的 greedy policy", font=CHINESE_FONT, font_size=21, color=GREEN),
            Text("6 步到达，reward=+5", font=CHINESE_FONT, font_size=20, color=GREEN),
        ).arrange((0, -1, 0), buff=0.1).next_to(right_grid, (0, -1, 0), buff=0.22)
        self.play(FadeIn(title), FadeIn(left_grid), FadeIn(right_grid), FadeIn(left_label), FadeIn(right_label), run_time=1.3)
        explored = self._path_arrows(left_cells, self._cells(first_snapshot["trajectory"]), color=RED, stroke_width=3)
        stable = self._path_arrows(right_cells, learned_path)
        self.play(FadeIn(explored), FadeIn(stable), run_time=1.5)
        self._eval_group = VGroup(title, left_grid, right_grid, left_label, right_label, explored, stable)

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

    def _snapshot_group(self, snapshot):
        grid, cells = self._make_grid()
        grid.shift(3.0 * LEFT)
        q_table = snapshot["qTable"]
        max_abs = max(abs(value) for values in q_table.values() for value in values.values()) or 1
        for state, values in q_table.items():
            row, column = (int(part) for part in state.split(","))
            if (row, column) == GOAL:
                continue
            value = max(values.values())
            color = interpolate_color(PAPER, GREEN if value >= 0 else RED, min(abs(value) / max_abs, 1))
            cells[(row, column)].set_fill(color, opacity=0.85)

        policy_arrows = self._policy_arrows(cells, snapshot["policy"])
        trajectory = self._path_arrows(cells, self._cells(snapshot["trajectory"]), color=YELLOW, stroke_width=4)
        status = "到达目标" if snapshot["reachedGoal"] else "未到达目标"
        card = VGroup(
            Text(f"episode {snapshot['episode']}", font=CHINESE_FONT, font_size=30, color=BLUE),
            Text(f"轨迹步数：{len(snapshot['trajectory']) - 1}", font=CHINESE_FONT, font_size=22, color=INK),
            Text(f"累计 reward：{snapshot['cumulativeReward']}", font=CHINESE_FONT, font_size=22, color=INK),
            Text(f"状态：{status}", font=CHINESE_FONT, font_size=22, color=GREEN if snapshot["reachedGoal"] else ORANGE),
            Text("格子颜色来自实际 Q table", font=CHINESE_FONT, font_size=20, color=MUTED),
            Text("蓝箭头来自同一张表的 greedy policy", font=CHINESE_FONT, font_size=20, color=MUTED),
        ).arrange((0, -1, 0), aligned_edge=(-1, 0, 0), buff=0.2).move_to(3.05 * RIGHT)
        return VGroup(grid, policy_arrows, trajectory, card)

    def _policy_arrows(self, cells, policy):
        arrows = VGroup()
        for state, action in policy.items():
            row, column = (int(part) for part in state.split(","))
            if (row, column) == GOAL:
                continue
            dr, dc = ACTION_OFFSETS[action]
            center = cells[(row, column)].get_center()
            vector = (dc * 0.34, -dr * 0.34, 0)
            arrows.add(Arrow(center, center + vector, buff=0.02, color=BLUE, stroke_width=3, max_tip_length_to_length_ratio=0.35))
        return arrows

    def _policy_trajectory(self, policy):
        current = START
        path = [current]
        for _ in range(32):
            if current == GOAL:
                break
            dr, dc = ACTION_OFFSETS[policy[f"{current[0]},{current[1]}"]]
            candidate = (current[0] + dr, current[1] + dc)
            if candidate[0] not in range(4) or candidate[1] not in range(4) or candidate in OBSTACLES:
                candidate = current
            current = candidate
            path.append(current)
        return path

    def _cells(self, trajectory):
        return [(cell["row"], cell["column"]) for cell in trajectory]

    def _path_arrows(self, cells, path, color=YELLOW, stroke_width=6):
        arrows = VGroup()
        for start, end in zip(path, path[1:]):
            a = cells[start].get_center()
            b = cells[end].get_center()
            if start == end:
                arrows.add(Circle(radius=0.17, color=color, stroke_width=stroke_width).move_to(a))
            else:
                arrows.add(Arrow(a, b, buff=0.18, color=color, stroke_width=stroke_width, max_tip_length_to_length_ratio=0.25))
        return arrows

    def _advance_to(self, timestamp):
        remaining = timestamp - float(self.renderer.time)
        if remaining > 0:
            self.wait(remaining)
