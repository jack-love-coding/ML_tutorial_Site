# Lesson 4: Derivatives and Error Change

## 1. Opening: Which Way Does Error Move Here? {#derivatives-opening}

The verified batch has MSE 2.5, but that single value does not say how loss changes near the current parameters. The opening question asks: if one parameter moves slightly while X, targets, and all other parameters stay fixed, does loss rise, fall, or stay locally flat? We will compare symmetric nearby evaluations rather than update the model. A central-difference estimate is a measurement of local sensitivity; it is **not gradient descent**. The lesson connects average change, derivatives, partial derivatives, finite-step failure, and a separate motion example. Exercises are formative and not graded.

## 2. Recap: Average Change, MSE, and Controlled Variables {#derivatives-recap}

Average rate compares two separated points: [F(theta+h)-F(theta)]/h. MSE summarizes residual squares for the fixed batch. A controlled experiment changes one factor while fixing the rest. Derivatives combine these ideas by shrinking a local observation window. The current prediction chain remains x,w,b -> y_hat, followed by y_hat,y -> L. A derivative does not feed target into prediction; it repeatedly evaluates the same valid loss function at neighboring parameter values.

## 3. Shared Task: From x,w,b to y_hat,y,L {#derivatives-shared-task}

Define $L(w,b)=\operatorname{MSE}(Xw+b,y)$ for fixed X and y. At w=[4,-1], b=5, predictions are [10,5] and L=2.5. To probe $w_1$, make a copied parameter vector, change only coordinate 0, recompute predictions and loss, and restore the baseline for every evaluation. Repeat independently for $w_2$ and b. The local sensitivities are approximately [0,-5] for w and -1 for b. These numbers describe slope at the current state; they are not new weights and do not by themselves choose a step size.

## 4. Intuition: Local Motion Slope and Loss Terrain {#derivatives-intuition}

A derivative is the slope of a local linear approximation. On a motion graph it reads velocity near one time; on a loss landscape it reads how loss responds near one parameter value. Positive sensitivity means increasing that parameter slightly tends to increase loss; negative means increasing it slightly tends to decrease loss; near zero means locally flat along that coordinate. None is a global guarantee. A curve can turn, a nonsmooth point can lack one derivative, and a step far outside the local neighborhood can contradict the tangent prediction.

## 5. Formal Contract: Derivatives, Partials, and Central Difference {#derivatives-formal}

A scalar derivative is $f'(a)=\lim_{h\to0}[f(a+h)-f(a)]/h$. For a loss slice, the numerator is $L(\theta+h)-L(\theta-h)$. Central difference uses symmetric sides: $f'(a)\approx[f(a+h)-f(a-h)]/(2h)$. For $L(w_1,w_2,b)$, $\partial L/\partial w_2$ changes only w2 while holding w1,b,X,y fixed. Units are auditable: if loss has minutes² and w2 has minutes/hint units, the derivative unit is minutes² divided by the weight unit. Central difference is a numerical approximation, an analytic derivative follows symbolic rules, and automatic differentiation composes local derivatives along a computation graph. They can check one another without being the same implementation.

### Deeper 1: Rate is not change

The derivative value is a rate, not a loss change. Only after choosing a small step may we use $\Delta L\approx(\partial L/\partial\theta)\Delta\theta$. Here dL/dw2=-5 and Delta w2=0.01 give Delta L approximately -5*0.01=-0.05. Saying “loss decreases by 5” confuses rate with change. A partial derivative is a coordinate slice. The gradient vector [dL/dw1,dL/dw2,dL/db]=[0, -5, -1] collects local rates along all parameter axes; the gradient is not a parameter and not an updated parameter.

### Deeper 2: Where every MSE derivative factor comes from

For residual $r_i=\hat y_i-y_i$, squaring contributes local factor $2r_i$. Prediction $w^Tx_i+b$ contributes X_ij for w_j and 1 for bias. Averaging n samples contributes 1/n. Therefore $\partial L/\partial w_j=(2/n)\sum_i r_iX_{ij}$ and $\partial L/\partial b=(2/n)\sum_i r_i$. The 2 comes from squaring, 1/n comes from averaging, r_i is prediction minus target, X_ij carries parameter change into prediction, and bias contributes 1. This factor ledger checks units, sign, and shape before a full chain-rule course. Numerical difference, analytic derivation, and automatic differentiation are independent evidence. If they disagree, verify the same MSE definition, residual direction, same parameter, and same batch.

## 6. Example One: Check Three Loss Sensitivities {#derivatives-worked-shared}

Current L=2.5, residuals r=[1,-2], and X=[[2,3],[1,4]]. With factor 2/2, dL/dw1=1*2+(-2)*1=0, dL/dw2=1*3+(-2)*4=-5, and dL/db=1+(-2)=-1. Thus the sensitivity vector is [0,-5,-1]. The negative sign means a small increase tends to lower loss locally. For Delta w2=0.01, linear approximation predicts Delta L about -0.05.

Check w2=-0.99: predictions [10.03,5.04], residuals [1.03,-1.96], and L=(1.0609+3.8416)/2=2.45125. Actual change -0.04875 is close to -0.05. With w1=4 and b=5 fixed, the explicit slice is $L(w2)=((4+3w2)^2+(2+4w2)^2)/2=12.5w2^2+20w2+10$. Its derivative 25w2+20 equals -5 at w2=-1, and its slice minimum is -0.8; that is not a global claim about all parameters. With w fixed, $L(b)=((b-4)^2+(b-7)^2)/2$, whose derivative 2b-11 equals -1 at b=5. Both loss polynomials independently verify the residual formula.

## 7. Example Two: Local Slope of Motion {#derivatives-worked-auxiliary}

Take `s(t) = t^2` meters and inspect it near `t=3` seconds with `h = 0.1`. Then $s(3.1)=9.61$ and $s(2.9)=8.41$, so the central difference is $(9.61-8.41)/0.2=6$. Therefore `slope_at_3 = 6` meters/second. Analytically, $(3+h)^2-(3-h)^2=12h$; division by $2h$ also gives 6. Here the derivative describes local position change with respect to time. In the shared task, the derivative describes local loss change with respect to a parameter. Both use “small input change to output rate,” but their physical units and task meanings differ.

## 8. Code Translation: Wrap the Probed Parameter {#derivatives-code}

The probed parameter is wrapped as a one-argument function, and every plus/minus evaluation starts from the same unmodified baseline. The complete copyable implementation is:

```python
import numpy as np

X = np.array([[2., 3.], [1., 4.]])
y = np.array([9., 7.])
w = np.array([4., -1.])
b = 5.

def mse_for(candidate_w, candidate_b):
    y_hat = X @ candidate_w + candidate_b
    return np.mean((y_hat - y) ** 2)

def central_difference(fn, theta, h=1e-4):
    if not np.isfinite(theta) or not np.isfinite(h) or h <= 0:
        raise ValueError("theta and positive h must be finite")
    return (fn(theta + h) - fn(theta - h)) / (2 * h)

dw2 = central_difference(
    lambda candidate: mse_for(np.array([w[0], candidate]), b), w[1]
)
print(dw2)  # about -5.0
```

The closure must replace exactly one parameter. Mutating shared `w` would allow the left and right evaluations to contaminate one another. During debugging, print `theta-h, L_minus, theta+h, L_plus` and verify the denominator is $2h$.

### Complete estimates, no side effects, and safety boundaries

```python
gradient_w = []
for j in range(w.size):
    def loss_for_weight(candidate, j=j):
        candidate_w = w.copy()
        candidate_w[j] = candidate
        return mse_for(candidate_w, b)
    gradient_w.append(central_difference(loss_for_weight, w[j]))

gradient_b = central_difference(lambda candidate: mse_for(w, candidate), b)
print(gradient_w, gradient_b)  # about [0.0, -5.0], -1.0
```

Each candidate uses `candidate_w = w.copy()`, so both sides start at the same center and the original parameters remain [4,-1]. Step, center, left result, and right result must all be finite, and h must be positive. An extremely small h can make theta+h indistinguishable from theta in floating-point arithmetic; smaller is not automatically more reliable. The default $10^{-4}$ is a reproducible starting point for this scale, not a universal constant.

## 9. Controlled Experiment: Change h, Not the Question {#derivatives-experiment}

Controlled experiment: keep X, y, baseline parameters, and derivative formula fixed; vary only h through 1, 0.1, 0.01, 1e-4, and a very tiny value. Record L(theta+h), L(theta-h), numerator, denominator, and estimate. A stable middle range should approach the analytic sensitivity; a broad window can bias a nonlinear loss, and an extremely tiny window can show floating-point noise. Formative feedback asks whether only h changed, whether each evaluation started from a fresh copy, and whether the conclusion reports stability rather than declaring the smallest h automatically best.

## 10. Misconceptions: Boundaries of Local Information {#derivatives-misconceptions}

### Before misconceptions: Rebuild the difference from left and right losses

At w2=-0.9, predictions [10.3,5.4], residuals [1.3,-1.6], and loss 2.125. At w2=-1.1, predictions [9.7,4.6], residuals [0.7,-2.4], and loss 3.125. Their central difference (2.125-3.125)/0.2=-5. The right side lowers average loss even though sample one worsens. For bias, residuals [1.1,-1.9] give 2.41 and [0.9,-2.1] give 2.61, yielding -1. For w1, residuals [1.2,-1.9] give 2.525 and [0.8,-2.1] also give 2.525, yielding zero without proving no future effect.

### Valid range of the local linear approximation

Derivative -5 predicts that step 0.1 changes loss by -0.5, giving 2.0, while actual loss is 2.125 because of curvature. Step 0.01 predicts 2.45 and actual is 2.45125. Increasing w2 by 1 would predict impossible negative MSE -2.5, showing the local model was used too far. Re-evaluate the true function after any large proposed change.

### Interface between numerical derivatives and future optimization

The estimator accepts loss function, center, and h and returns slope. A future updater also needs parameter, gradient, and learning rate: new_theta=theta-learning_rate*gradient. Keep estimate_gradient and update_parameters separate. A correct gradient with a large learning rate can overshoot; one lower training loss does not guarantee validation improvement.

### Reading checkpoint

Read dL/dw1=0 as first-order local flatness, dL/dw2=-5 as a small right move tending to lower loss, and dL/db=-1 likewise. Every statement needs current, local, and small. Draw candidate parameters -> Xw+b -> predictions -> fixed-target MSE, with central difference calling the whole loss chain twice. Applying it only to prediction estimates prediction sensitivity; putting target into Xw+b breaks the information boundary.

### Misconception 1: A negative derivative means the parameter is negative

Parameter and derivative both have signs, but w2=-1 has derivative -5 while positive b=5 has derivative -1. The sign describes local change direction, not parameter sign. Repair with: “when the parameter moves slightly right, how does loss move?”

### Misconception 2: A zero derivative proves a global optimum

A familiar parabola encourages this claim, but dL/dw1=0 only says the current one-coordinate slice is first-order flat with other quantities fixed. Check other partials, neighboring losses, and curve shape before discussing optimum.

### Misconception 3: A numerical derivative is gradient descent

They appear together in training code, but central difference only returns -5; it chooses no update and does not modify w2. Keep estimate_gradient and update_parameters as separately tested functions with separate inputs and outputs.

## 11. Three-Layer Practice: Symbols to Local Experiments {#derivatives-practice}

These exercises are formative and ungraded.

### Layer one: concept distinctions

Exercise 1A Does derivative -5 guarantee that increasing w2 by 1 reduces loss by exactly 5?

Hint: A derivative is a local linear approximation.

Reference reasoning: It does not guarantee a large step. It supports sufficiently small changes near the current point; curvature makes distant behavior depart from the tangent. [Review](#derivatives-formal)

Exercise 1B Why must other parameters be held fixed while calculating a partial derivative?

Hint: Consider attribution.

Reference reasoning: If several quantities change together, the loss difference cannot be attributed to the specified parameter and is no longer that partial derivative. [Review](#derivatives-shared-task)

Exercise 1C Can a numerical derivative and analytic derivative check each other?

Hint: They reach the same local quantity by different paths.

Reference reasoning: Yes. A stable central difference should approach the analytic result; a clear mismatch indicates an error in the formula or implementation. [Review](#derivatives-formal)

### Layer two: hand calculation and code reading

Exercise 2A With h=0.5, calculate the central difference of t^2 at 2.

Hint: Calculate 2.5^2 and 1.5^2.

Reference reasoning: (6.25-2.25)/1=4, matching analytic slope 2t=4. [Review](#derivatives-worked-auxiliary)

Exercise 2B What happens if the denominator is incorrectly written as h?

Hint: The left and right points are separated by 2h.

Reference reasoning: The result doubles; the motion example incorrectly gives 12 instead of 6. [Review](#derivatives-code)

Exercise 2C Use residuals [1,-2] to calculate dL/db.

Hint: Here 2/n=1.

Reference reasoning: 1+(-2)=-1 because bias affects every prediction with coefficient one. [Review](#derivatives-worked-shared)

### Layer three: open observation

Exercise 3A Record the numerical derivative for w2 across multiple h values.

Hint: Use a log scale and preserve enough decimal places.

Reference reasoning: Find a stable region near -5. Jitter at extremely small h is evidence of floating cancellation. [Review](#derivatives-experiment)

Exercise 3B Draw a loss table near w2 and mark the current tangent direction.

Hint: Hold other parameters fixed.

Reference reasoning: The current slope is negative, so a small move right initially lowers loss. The table is a complete fallback when animation is unavailable. [Review](#derivatives-intuition)

Exercise 3C Design a test that detects mutation of the shared array.

Hint: Copy and compare parameters before and after the call.

Reference reasoning: Save `w_before=w.copy()`, then assert `np.array_equal(w,w_before)` after estimation and repeat the call to require the same result. [Review](#derivatives-code)

## 12. Summary and NumPy Handoff {#derivatives-handoff}

The NumPy handoff contains a fully auditable derivative contract: fixed X=[[2,3],[1,4]], targets [9,7], baseline w=[4,-1], b=5, predictions [10,5], MSE 2.5, central-difference sensitivities approximately w=[0,-5] and b=-1, and a documented h sweep. The next lesson must reproduce these outputs with array shape and finite checks, fresh copies for perturbations, and real failure messages. It must retain the sentence that central difference is not gradient descent and must not introduce a learning-rate update into this measurement task.
