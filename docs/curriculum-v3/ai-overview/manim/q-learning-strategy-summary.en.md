# Q-learning strategy formation — English summary

This silent Chinese video introduces a deterministic 4×4 teaching environment with start, goal, obstacles, and rewards `+10/-1/-3`. It distinguishes state, action, reward, and the long-term action-value estimate `Q(s,a)`. One numerical update uses old value 2, reward 10, next best value 4, learning rate 0.5, and discount factor 0.9 to obtain target 13.6 and new value 7.8.

Training keeps exploration at 0.3 and uses seed `7107`. Snapshots at episodes 1, 5, 20, and 50 demonstrate that a stochastic final-episode reward need not improve monotonically. Greedy evaluation then disables exploration: the learned policy reaches the goal in six steps with cumulative reward +5. The final mapping treats learner mastery as state, exercise difficulty as action, and later learning improvement as reward, while retaining a warning that policy safety depends on reward design and constraints.
