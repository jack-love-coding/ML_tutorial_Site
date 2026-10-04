# %% setup
"""Frozen SMS reference: keep the CSV and split.json beside this file/Notebook."""
from pathlib import Path
import hashlib
import json

import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, confusion_matrix, f1_score, make_scorer
from sklearn.metrics import precision_score, recall_score, roc_auc_score
from sklearn.model_selection import GridSearchCV, StratifiedKFold
from sklearn.pipeline import Pipeline

dataset_path = Path("sms-spam.csv")
protocol = json.loads(Path("split.json").read_text(encoding="utf-8"))
assert hashlib.sha256(dataset_path.read_bytes()).hexdigest() == protocol["dataset"]["sha256"], "Wrong CSV version"
df = pd.read_csv(dataset_path).set_index("sms_id")
assert set(df["label"]) == {"ham", "spam"}
group_keys = df["message"].map(lambda text: " ".join(text.casefold().split()))
assert df.groupby(group_keys)["label"].nunique().max() == 1, "Conflicting duplicate labels"
representative_ids = group_keys.drop_duplicates().index.tolist()
partitions = protocol["partitions"]
all_ids = [row_id for ids in partitions.values() for row_id in ids]
assert len(all_ids) == len(set(all_ids)) == len(representative_ids)
assert set(all_ids) == set(representative_ids), "Split must use each deduplicated message once"

X_train, y_train = df.loc[partitions["train"], "message"], df.loc[partitions["train"], "label"]
X_valid, y_valid = df.loc[partitions["validation"], "message"], df.loc[partitions["validation"], "label"]
X_test, y_test = df.loc[partitions["test"], "message"], df.loc[partitions["test"], "label"]
print({name: len(ids) for name, ids in partitions.items()})

# %% vectorizer
# Raw text enters the Pipeline; each CV training fold learns its own vocabulary.
pipeline = Pipeline([
    ("tfidf", TfidfVectorizer(min_df=2, ngram_range=(1, 2))),
    ("classifier", LogisticRegression(solver="liblinear", max_iter=1000, random_state=42)),
])
cv = StratifiedKFold(n_splits=3, shuffle=True, random_state=42)
scorer = make_scorer(f1_score, pos_label="spam", zero_division=0)
print([name for name, _ in pipeline.steps])

# %% fit
search = GridSearchCV(
    pipeline, {"classifier__C": [0.5, 1.0, 2.0]},
    scoring=scorer, cv=cv, n_jobs=1, refit=True,
)
search.fit(X_train, y_train)
model = search.best_estimator_
cv_results = [
    {"C": float(params["classifier__C"]), "meanF1": round(float(mean), 8), "stdF1": round(float(std), 8)}
    for params, mean, std in zip(search.cv_results_["params"], search.cv_results_["mean_test_score"], search.cv_results_["std_test_score"])
]
training_shape = list(model.named_steps["tfidf"].transform(X_train).shape)
print({"cv": cv_results, "trainingMatrixShape": training_shape})

# %% threshold
def metrics(labels, scores, threshold):
    # Keep the same string labels as y; do not compare integer predictions with spam/ham.
    predicted = np.where(scores >= threshold, "spam", "ham")
    tn, fp, fn, tp = map(int, confusion_matrix(labels, predicted, labels=["ham", "spam"]).ravel())
    return {
        "confusion": {"TP": tp, "FP": fp, "TN": tn, "FN": fn},
        "precision": round(float(precision_score(labels, predicted, pos_label="spam", zero_division=0)), 8),
        "recall": round(float(recall_score(labels, predicted, pos_label="spam", zero_division=0)), 8),
        "f1": round(float(f1_score(labels, predicted, pos_label="spam", zero_division=0)), 8),
        "accuracy": round(float(accuracy_score(labels, predicted)), 8),
        "auc": round(float(roc_auc_score(labels == "spam", scores)), 8),
        "cost": 5 * fp + fn,
    }

positive_column = list(model.classes_).index("spam")
score_valid = model.predict_proba(X_valid)[:, positive_column]
threshold_sweep = [
    {"threshold": value / 100, **metrics(y_valid, score_valid, value / 100)}
    for value in range(10, 91, 5)
]
# Predeclared tie break: lower cost, fewer false positives, then a higher threshold.
selected = min(threshold_sweep, key=lambda row: (row["cost"], row["confusion"]["FP"], -row["threshold"]))
threshold = selected["threshold"]
print({"selectionSplit": "validation", **selected})

# %% evaluate
# The model and threshold are fixed before test is read. No refit or reselection follows.
score_test = model.predict_proba(X_test)[:, positive_column]
locked_test = metrics(y_test, score_test, threshold)
reference_summary = {
    "contractVersion": "classification-project-sms-v1",
    "sourceRows": len(df), "uniqueMessages": len(representative_ids),
    "excludedDuplicateRows": len(df) - len(representative_ids),
    "counts": {name: len(ids) for name, ids in partitions.items()},
    "labelCounts": {name: {label: int(count) for label, count in df.loc[ids, "label"].value_counts().items()} for name, ids in partitions.items()},
    "trainingMatrixShape": training_shape,
    "majorityValidationAccuracy": round(float((y_valid == y_train.mode().iloc[0]).mean()), 8),
    "cv": cv_results, "selectedC": float(search.best_params_["classifier__C"]),
    "costs": {"falsePositive": 5, "falseNegative": 1},
    "thresholdSweep": threshold_sweep,
    "validation": selected, "lockedTest": locked_test,
    "policy": {"modelSelectionSplit": "train-cv", "thresholdSelectionSplit": "validation", "testEvaluations": 1, "testReselectionAllowed": False},
}
print({"lockedThreshold": threshold, "lockedTest": locked_test})

# %% review
# Inspect validation errors for possible future work, keeping the final test aggregate fixed.
pred_valid = np.where(score_valid >= threshold, "spam", "ham")
review = pd.DataFrame({"sms_id": X_valid.index, "label": y_valid.to_numpy(), "score": score_valid, "pred": pred_valid})
false_positive = review[(review["label"] == "ham") & (review["pred"] == "spam")].sort_values("score", ascending=False)
false_negative = review[(review["label"] == "spam") & (review["pred"] == "ham")].sort_values("score")
reference_summary["validationErrorExamples"] = [
    {"kind": kind, "sms_id": int(row.sms_id), "score": round(float(row.score), 12)}
    for kind, rows in [("FP", false_positive), ("FN", false_negative)]
    for row in rows.head(3).itertuples()
]
validation_predictions = [
    {"sms_id": int(row.sms_id), "label": row.label, "score": round(float(row.score), 12)}
    for row in review.itertuples()
]
print(json.dumps(reference_summary, ensure_ascii=False, sort_keys=True))
