# Manim Animation: Q-learning strategy formation

## Overview

Build Q-learning from grid coordinates, weighted correction, discounted future value, and state/action/reward transitions. The beginner should leave understanding that Q values estimate long-term state–action value, rewards arrive after actions, exploration is used only during training, and a greedy policy is evaluated separately.

**Total concepts:** 7
**Progression:** grid coordinates → weighted correction → future discounted value → state/action/reward → Q-value update → exploration/exploitation → Q-learning strategy formation
**Exact duration:** 90 seconds
**Contract:** 4×4 grid; start `(3,0)`; goal `(0,3)`; obstacles `(1,1),(2,2)`; rewards `+10/-1/-3`; seed `7107`; α=0.5; γ=0.9; training ε=0.3; episodes 50; evaluation ε=0.

## Animation Requirements

- Use Manim Community Edition and `QLearningStrategy(Scene)` at 1920×1080 and 30 fps.
- Use `PingFang SC` for Chinese; formula objects use raw strings. Keep the ML Atlas background and palette.
- Pair every cell color with a textual symbol: CYAN start, GREEN goal, RED obstacle. The reward legend must always state goal, ordinary step, and collision values in that order.
- Episode snapshots must be captured from one continuous committed-engine run: one RNG seeded once with 7107 and one Q table updated through all 50 episodes. Record the actual episode 1, 5, 20, and 50 trajectory, cumulative reward, reached-goal state, Q table, and derived greedy policy. Do not restart training between snapshots or invent monotonic reward.
- Distinguish the training episode snapshot from greedy evaluation. Evaluation disables exploration and consumes no randomness.

## Scene Sequence

### Scene 1: Environment and reward legend
**Timestamp:** 0:00–0:08

Fade in a 4×4 grid titled `4×4 世界：从起点走到目标`. Mark start `(3,0)` CYAN with `起点 S`, goal `(0,3)` GREEN with `目标 G`, and obstacles `(1,1),(2,2)` RED with `障碍 ■`. Beside the grid show `奖励：到达 +10｜普通一步 -1｜碰撞 -3` and `固定 seed=7107`. Rewards are environment responses after an action. A collision leaves the agent in the same state. Keep the values exact and in the same semantic order as the desktop lab.

### Scene 2: State, actions, and Q value
**Timestamp:** 0:08–0:18

Focus the start cell and draw four BLUE action arrows for up, right, down, and left. Display `state：当前位置`, `action：上、右、下、左`, and `Q(s,a)：在状态 s 做动作 a，之后继续行动的长期价值估计`. This definition is crucial: Q is neither a success count nor the immediate reward alone. The four arrows express available action choices even where a boundary attempt would leave the cell unchanged. Preserve enough empty space for the formula transition.

### Scene 3: One action and one numerical Q update
**Timestamp:** 0:18–0:34

Clear the grid and write the Chinese relation `新估计 = 旧估计 + 学习率 ×（目标 − 旧估计）`. Transform attention to raw `r"Q(s,a)\leftarrow Q(s,a)+\alpha[r+\gamma\max_{a'}Q(s',a')-Q(s,a)]"`. Substitute the approved numerical teaching example line by line: old `Q(s,right)=2`; action right returns `r=+10`; next best value is `4`; `target=10+0.9×4=13.6`; `correction=13.6-2=11.6`; `Qnew=2+0.5×11.6=7.8`. Use ORANGE for reward, BLUE for target, PINK for correction, and GREEN for the new value. End with `reward 不是监督标签；Q value 也不等于即时 reward` in RED.

### Scene 4: Exploration versus current best action
**Timestamp:** 0:34–0:44

Create two labeled panels. On the left, ORANGE `探索 exploration` with `偶尔试不同动作，发现未知路线`. On the right, GREEN `利用 best action` with `选择当前 Q value 最大的动作`. Below both show `训练固定 exploration rate = 0.3`. Do not animate ε to a different value. The contrast should convey why training sometimes chooses a non-greedy action while preserving deterministic replay through the supplied seeded random generator.

### Scene 5: Episode 1, 5, 20, and 50 snapshots
**Timestamp:** 0:44–1:10

Restore the grid and title it `固定参数训练：episode 1 → 5 → 20 → 50`. Reveal four fixture-backed snapshot cards. Every snapshot, including episode 1, must show its actual trajectory in YELLOW, the actual cumulative reward and reached-goal status, the complete end-of-episode Q table as red/neutral/green cell color, and the greedy policy derived from that same table as BLUE arrows. Exact records from the single continuous stream are: episode 1, 26 steps, cumulative reward -25, reaches goal; episode 5, 17 steps, reward -6, reaches goal; episode 20, 6 steps, reward +5, reaches goal; episode 50, 12 steps, reward -1, reaches goal. Do not imply stochastic episode reward improves monotonically. Q-value color is an estimate cue, not a reward-color legend.

### Scene 6: Greedy evaluation without exploration
**Timestamp:** 1:10–1:22

Display `评估时关闭探索：exploration rate = 0`. Place two small grids side by side. On the left reuse the fixture's actual episode 1 exploratory trajectory and label it `episode 1 实际探索` plus `26 步，reward=-25`. On the right derive the greedy path from the episode 50 Q table: `up,up,up,right,right,right`, six steps, cumulative reward +5. Draw both paths and label the right side `学习后的 greedy policy` plus `6 步到达，reward=+5`. The comparison separates a real exploratory training trajectory from exploration-free policy evaluation.

### Scene 7: Transfer to next-exercise choice
**Timestamp:** 1:22–1:30

Clear the grids and map the mechanism back to the course application. Reveal `state：当前掌握状态`, `action：选择练习难度`, `reward：稍后的学习改善`, and `policy：在每种掌握状态下选择下一步`. Finish with the RED guardrail `策略仍需安全约束；奖励设计错误会鼓励意外行为。` This is a conceptual mapping, not a second simulator and not a claim that the grid policy is directly deployable. The final frame keeps all four mappings and the safety note legible.

## Final Notes

The silent video contains Chinese labels. Its paired English file is explicitly a summary. The transcript follows the seven exact time intervals. Poster extraction uses the transfer frame; keyframes capture the environment/reward legend, numerical update, training snapshots, and greedy evaluation from the final approved MP4.

## Foundation-to-target directing notes

The grid is a finite state space. Row increases downward and column increases to the right, matching the TypeScript environment. Start is `(3,0)` and goal is `(0,3)`; this coordinate convention must remain internal even though the learner mainly sees the grid. Obstacles at `(1,1)` and `(2,2)` are blocked destinations. A collision does not move the agent and returns `−3`; a boundary attempt also does not move the agent but returns the ordinary step reward `−1`. The opening legend shows only the three approved reward categories and does not add a boundary category.

The state/action scene introduces four actions around one current cell. These arrows describe the action set, not four guaranteed transitions. At a boundary or obstacle, the environment may return the same state. Define Q value with a continuation phrase so it cannot be mistaken for immediate reward: it estimates taking one action now and continuing afterward. Keep this definition visible before any update equation appears.

The weighted-correction foundation should make the full equation less intimidating. Begin with `new = old + learning rate × (target − old)`. Then reveal that the Q target is immediate reward plus discounted best next-state value. In the numeric example, preserve the exact order: old value 2; reward +10; next best 4; discount 0.9; target 13.6; target-minus-old correction 11.6; learning rate 0.5; new value 7.8. The word `correction` labels the unscaled target difference in the approved course copy, so do not replace it with the already multiplied increment 5.8.

Exploration and exploitation are action-selection modes, not two different Q tables. Training keeps ε at 0.3, α at 0.5, and γ at 0.9. Seed 7107 controls the random sequence. Avoid a slider animation because the video shares one fixed run with the lab. At evaluation, ε becomes exactly zero and the random source is not consumed. This train/evaluate separation must be visible in both headings and timing.

Create the seeded RNG and empty Q table exactly once. Run episodes 1 through 50 without resetting either stream, deep-cloning the Q table and deriving its deterministic argmax policy only after episodes 1, 5, 20, and 50. Display exact episode steps and rewards: `26/−25`, `17/−6`, `6/+5`, and `12/−1`. All four reach the goal. Episode 1 therefore must say `到达目标`; it must not use a fabricated failure status. Preserve these facts in source, fixture, transcript, and labels.

Policy arrows summarize `argmax` action values. They are not the exploratory training trajectory and they are not probabilities. The stable evaluation route after 50 episodes is six actions: up, up, up, right, right, right. Ordinary steps contribute five times `−1`, and entering the goal contributes `+10`, giving cumulative reward `+5`. The left evaluation grid is not an invented all-zero rollout: it is the actual episode 1 trajectory already recorded in the fixture, allowing the learner to compare exploration with the final greedy policy without fabricated data.

The final learning-assistant mapping is conceptual. Mastery corresponds to state, difficulty choice to action, and later learning improvement to reward. This is not permission to deploy the grid's Q table for real learners. Keep the safety sentence visible: reward misspecification and missing constraints can encourage unintended behavior. The transfer completes the pedagogical loop by relating the abstract mechanism back to the opening course application without creating a second simulator.

For accessibility, state, goal, and obstacles use words and symbols as well as fill colors. Policy arrows have a distinct shape. Every numerical reward is printed with a sign. Chinese vector glyphs and raw LaTeX must stay within safe margins at 1080p. Static keyframes provide the reward legend, numerical substitution, training records, and greedy evaluation, while the English summary accurately describes the Chinese video rather than presenting itself as an alternate localized render.
