# Historical function exercises

Archived from the pre-textbook authoring source. Historical reference material, not a current student route or assessment requirement.


These exercises are formative, not graded, and not evidence of course completion. For each one, state the rule you used before opening the hint and reference reasoning.

### Layer one: concept distinctions

**Exercise 1A** Classify features, weights, bias, prediction, and target as sample input, model parameter, function output, or supervisory feedback.

**Hint:** Ask where each value comes from when predicting a new deployed sample.

**Reference reasoning:** Features come from the sample; weights and bias are model parameters; prediction is the output; target is supervisory feedback used after prediction and must not enter predict_one.

[Review: shared prediction task](#shared-prediction-task)

**Exercise 1B** If two different feature inputs both produce prediction = 10, is the rule still a function?

**Hint:** Separate many inputs sharing one output from one complete input producing several outputs.

**Reference reasoning:** Yes. A function may be many-to-one; it requires one unique output for each complete legal input when parameters are fixed.

[Review: mapping intuition](#mapping-intuition)

**Exercise 1C** Someone claims that training changes weights, so the prediction rule is not a function. How do you respond?

**Hint:** Separate one forward pass from multiple parameter states during training.

**Reference reasoning:** Inputs and current parameters are fixed in each forward pass, so output is unique. Training simply visits a sequence of mappings with different parameter states.

[Review: formal definition](#formal-definition)

### Layer two: calculation and code reading

**Exercise 2A** Keep features and weights fixed, change only bias from 5 to 2, and compute prediction and residual.

**Hint:** The two feature contributions remain 8 and -3.

**Reference reasoning:** Weighted sum stays 5; prediction becomes 7 and residual is $7-9=-2$. Reducing bias by 3 reduces prediction by 3.

[Review: complete hand calculation](#worked-prediction)

**Exercise 2B** Read `return [feature * weight for feature, weight in zip(features, weights)]` and identify its output shape and missing logic.

**Hint:** Substitute [2,3] and [4,-1], then compare the result with the required scalar prediction.

**Reference reasoning:** It returns [8,-3], neither sums nor adds bias, and lacks a length check. zip may silently truncate. Validate length, then use sum(...) + bias.

[Review: Python translation](#python-translation)

**Exercise 2C** Without running code, complete predictions for $w_1=3,3.5,4$.

**Hint:** Simplify the rule to $2w_1+2$ first.

**Reference reasoning:** The outputs are 8, 9, and 10. A value of 3.5 fits this sample but does not prove it is best for all samples.

[Review: controlled experiment](#controlled-experiment)

### Layer three: open observation

**Exercise 3A** Plot $2w_1+2$ for $x_1=2$, then change only $x_1$ to 1 and plot the second line.

**Hint:** Simplify the second rule independently; do not change any other number.

**Reference reasoning:** The second line is $w_1+2$. Both intercepts are 2, while slopes are 2 and 1. Feature value controls sensitivity to its corresponding weight in this rule.

[Review: controlled experiment](#controlled-experiment)

**Exercise 3B** Choose new $s_0,v$ for the motion function; change only $v$, then restore it and change only $s_0$.

**Hint:** Velocity controls successive position differences; initial position controls the value at $t=0$.

**Reference reasoning:** Changing $v$ changes slope. Changing $s_0$ translates the line without changing slope. Record chosen numbers and fixed quantities, not merely “the graph changed.”

[Review: motion graph](#worked-motion-example)

**Exercise 3C** Design a minimal debug log that distinguishes feature-order mismatch, missing bias, and target leakage into prediction.

**Hint:** Record names, lengths or shapes, paired contributions, weighted sum, bias, and final prediction; log target separately.

**Reference reasoning:** Print semantic feature order, weights, lengths, contributions, weighted_sum, bias, and prediction, then target and residual on a separate line. Wrong pairing reveals order; a correct weighted sum but missing 5 reveals bias; target inside the prediction expression reveals leakage.

[Review: Python translation](#python-translation)
