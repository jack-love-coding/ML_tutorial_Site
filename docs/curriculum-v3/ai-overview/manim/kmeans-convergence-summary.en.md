# K-means convergence — English summary

This silent Chinese video starts with 12 unlabeled learner points measured by accuracy and mean response time. With `K=3` and seed `3103`, it selects the same three existing points as the desktop lab. One learner point is connected to every center to demonstrate squared-distance comparison, after which all points are assigned to their nearest center.

The video computes one center explicitly by averaging x and y coordinates separately, then moves all centers to the exact means. The within-group squared-distance total falls from 2441 to 1293.5. A second assignment/recomputation pass leaves both assignments and centers unchanged, so this run converges at iteration 2. The ending stresses that convergence does not make a grouping uniquely correct: K and initialization affect results, and people must interpret the groups.
