// Generated from the frozen SMS reference. Do not edit by hand.
export const classificationProjectCode = {
  "setup": "\"\"\"Frozen SMS reference: keep the CSV and split.json beside this file/Notebook.\"\"\"\nfrom pathlib import Path\nimport hashlib\nimport json\n\nimport numpy as np\nimport pandas as pd\nfrom sklearn.feature_extraction.text import TfidfVectorizer\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.metrics import accuracy_score, confusion_matrix, f1_score, make_scorer\nfrom sklearn.metrics import precision_score, recall_score, roc_auc_score\nfrom sklearn.model_selection import GridSearchCV, StratifiedKFold\nfrom sklearn.pipeline import Pipeline\n\ndataset_path = Path(\"sms-spam.csv\")\nprotocol = json.loads(Path(\"split.json\").read_text(encoding=\"utf-8\"))\nassert hashlib.sha256(dataset_path.read_bytes()).hexdigest() == protocol[\"dataset\"][\"sha256\"], \"Wrong CSV version\"\ndf = pd.read_csv(dataset_path).set_index(\"sms_id\")\nassert set(df[\"label\"]) == {\"ham\", \"spam\"}\ngroup_keys = df[\"message\"].map(lambda text: \" \".join(text.casefold().split()))\nassert df.groupby(group_keys)[\"label\"].nunique().max() == 1, \"Conflicting duplicate labels\"\nrepresentative_ids = group_keys.drop_duplicates().index.tolist()\npartitions = protocol[\"partitions\"]\nall_ids = [row_id for ids in partitions.values() for row_id in ids]\nassert len(all_ids) == len(set(all_ids)) == len(representative_ids)\nassert set(all_ids) == set(representative_ids), \"Split must use each deduplicated message once\"\n\nX_train, y_train = df.loc[partitions[\"train\"], \"message\"], df.loc[partitions[\"train\"], \"label\"]\nX_valid, y_valid = df.loc[partitions[\"validation\"], \"message\"], df.loc[partitions[\"validation\"], \"label\"]\nX_test, y_test = df.loc[partitions[\"test\"], \"message\"], df.loc[partitions[\"test\"], \"label\"]\nprint({name: len(ids) for name, ids in partitions.items()})\n",
  "vectorizer": "# Raw text enters the Pipeline; each CV training fold learns its own vocabulary.\npipeline = Pipeline([\n    (\"tfidf\", TfidfVectorizer(min_df=2, ngram_range=(1, 2))),\n    (\"classifier\", LogisticRegression(solver=\"liblinear\", max_iter=1000, random_state=42)),\n])\ncv = StratifiedKFold(n_splits=3, shuffle=True, random_state=42)\nscorer = make_scorer(f1_score, pos_label=\"spam\", zero_division=0)\nprint([name for name, _ in pipeline.steps])\n",
  "fit": "search = GridSearchCV(\n    pipeline, {\"classifier__C\": [0.5, 1.0, 2.0]},\n    scoring=scorer, cv=cv, n_jobs=1, refit=True,\n)\nsearch.fit(X_train, y_train)\nmodel = search.best_estimator_\ncv_results = [\n    {\"C\": float(params[\"classifier__C\"]), \"meanF1\": round(float(mean), 8), \"stdF1\": round(float(std), 8)}\n    for params, mean, std in zip(search.cv_results_[\"params\"], search.cv_results_[\"mean_test_score\"], search.cv_results_[\"std_test_score\"])\n]\ntraining_shape = list(model.named_steps[\"tfidf\"].transform(X_train).shape)\nprint({\"cv\": cv_results, \"trainingMatrixShape\": training_shape})\n",
  "threshold": "def metrics(labels, scores, threshold):\n    # Keep the same string labels as y; do not compare integer predictions with spam/ham.\n    predicted = np.where(scores >= threshold, \"spam\", \"ham\")\n    tn, fp, fn, tp = map(int, confusion_matrix(labels, predicted, labels=[\"ham\", \"spam\"]).ravel())\n    return {\n        \"confusion\": {\"TP\": tp, \"FP\": fp, \"TN\": tn, \"FN\": fn},\n        \"precision\": round(float(precision_score(labels, predicted, pos_label=\"spam\", zero_division=0)), 8),\n        \"recall\": round(float(recall_score(labels, predicted, pos_label=\"spam\", zero_division=0)), 8),\n        \"f1\": round(float(f1_score(labels, predicted, pos_label=\"spam\", zero_division=0)), 8),\n        \"accuracy\": round(float(accuracy_score(labels, predicted)), 8),\n        \"auc\": round(float(roc_auc_score(labels == \"spam\", scores)), 8),\n        \"cost\": 5 * fp + fn,\n    }\n\npositive_column = list(model.classes_).index(\"spam\")\nscore_valid = model.predict_proba(X_valid)[:, positive_column]\nthreshold_sweep = [\n    {\"threshold\": value / 100, **metrics(y_valid, score_valid, value / 100)}\n    for value in range(10, 91, 5)\n]\n# Predeclared tie break: lower cost, fewer false positives, then a higher threshold.\nselected = min(threshold_sweep, key=lambda row: (row[\"cost\"], row[\"confusion\"][\"FP\"], -row[\"threshold\"]))\nthreshold = selected[\"threshold\"]\nprint({\"selectionSplit\": \"validation\", **selected})\n",
  "evaluate": "# The model and threshold are fixed before test is read. No refit or reselection follows.\nscore_test = model.predict_proba(X_test)[:, positive_column]\nlocked_test = metrics(y_test, score_test, threshold)\nreference_summary = {\n    \"contractVersion\": \"classification-project-sms-v1\",\n    \"sourceRows\": len(df), \"uniqueMessages\": len(representative_ids),\n    \"excludedDuplicateRows\": len(df) - len(representative_ids),\n    \"counts\": {name: len(ids) for name, ids in partitions.items()},\n    \"labelCounts\": {name: {label: int(count) for label, count in df.loc[ids, \"label\"].value_counts().items()} for name, ids in partitions.items()},\n    \"trainingMatrixShape\": training_shape,\n    \"majorityValidationAccuracy\": round(float((y_valid == y_train.mode().iloc[0]).mean()), 8),\n    \"cv\": cv_results, \"selectedC\": float(search.best_params_[\"classifier__C\"]),\n    \"costs\": {\"falsePositive\": 5, \"falseNegative\": 1},\n    \"thresholdSweep\": threshold_sweep,\n    \"validation\": selected, \"lockedTest\": locked_test,\n    \"policy\": {\"modelSelectionSplit\": \"train-cv\", \"thresholdSelectionSplit\": \"validation\", \"testEvaluations\": 1, \"testReselectionAllowed\": False},\n}\nprint({\"lockedThreshold\": threshold, \"lockedTest\": locked_test})\n",
  "review": "# Inspect validation errors for possible future work, keeping the final test aggregate fixed.\npred_valid = np.where(score_valid >= threshold, \"spam\", \"ham\")\nreview = pd.DataFrame({\"sms_id\": X_valid.index, \"label\": y_valid.to_numpy(), \"score\": score_valid, \"pred\": pred_valid})\nfalse_positive = review[(review[\"label\"] == \"ham\") & (review[\"pred\"] == \"spam\")].sort_values(\"score\", ascending=False)\nfalse_negative = review[(review[\"label\"] == \"spam\") & (review[\"pred\"] == \"ham\")].sort_values(\"score\")\nreference_summary[\"validationErrorExamples\"] = [\n    {\"kind\": kind, \"sms_id\": int(row.sms_id), \"score\": round(float(row.score), 12)}\n    for kind, rows in [(\"FP\", false_positive), (\"FN\", false_negative)]\n    for row in rows.head(3).itertuples()\n]\nvalidation_predictions = [\n    {\"sms_id\": int(row.sms_id), \"label\": row.label, \"score\": round(float(row.score), 12)}\n    for row in review.itertuples()\n]\nprint(json.dumps(reference_summary, ensure_ascii=False, sort_keys=True))\n"
} as const
export const classificationProjectReference = {
  "contractVersion": "classification-project-sms-v1",
  "sourceRows": 5574,
  "uniqueMessages": 5159,
  "excludedDuplicateRows": 415,
  "counts": {
    "test": 1032,
    "train": 3095,
    "validation": 1032
  },
  "labelCounts": {
    "test": {
      "ham": 904,
      "spam": 128
    },
    "train": {
      "ham": 2710,
      "spam": 385
    },
    "validation": {
      "ham": 903,
      "spam": 129
    }
  },
  "trainingMatrixShape": [
    3095,
    7612
  ],
  "majorityValidationAccuracy": 0.875,
  "cv": [
    {
      "C": 0.5,
      "meanF1": 0.43789721,
      "stdF1": 0.02122492
    },
    {
      "C": 1.0,
      "meanF1": 0.75961353,
      "stdF1": 0.03909668
    },
    {
      "C": 2.0,
      "meanF1": 0.84613037,
      "stdF1": 0.02253309
    }
  ],
  "selectedC": 2.0,
  "costs": {
    "falsePositive": 5,
    "falseNegative": 1
  },
  "thresholdSweep": [
    {
      "threshold": 0.1,
      "confusion": {
        "TP": 122,
        "FP": 53,
        "TN": 850,
        "FN": 7
      },
      "precision": 0.69714286,
      "recall": 0.94573643,
      "f1": 0.80263158,
      "accuracy": 0.94186047,
      "auc": 0.98789994,
      "cost": 272
    },
    {
      "threshold": 0.15,
      "confusion": {
        "TP": 119,
        "FP": 22,
        "TN": 881,
        "FN": 10
      },
      "precision": 0.84397163,
      "recall": 0.92248062,
      "f1": 0.88148148,
      "accuracy": 0.96899225,
      "auc": 0.98789994,
      "cost": 120
    },
    {
      "threshold": 0.2,
      "confusion": {
        "TP": 118,
        "FP": 11,
        "TN": 892,
        "FN": 11
      },
      "precision": 0.91472868,
      "recall": 0.91472868,
      "f1": 0.91472868,
      "accuracy": 0.97868217,
      "auc": 0.98789994,
      "cost": 66
    },
    {
      "threshold": 0.25,
      "confusion": {
        "TP": 116,
        "FP": 7,
        "TN": 896,
        "FN": 13
      },
      "precision": 0.94308943,
      "recall": 0.89922481,
      "f1": 0.92063492,
      "accuracy": 0.98062016,
      "auc": 0.98789994,
      "cost": 48
    },
    {
      "threshold": 0.3,
      "confusion": {
        "TP": 112,
        "FP": 4,
        "TN": 899,
        "FN": 17
      },
      "precision": 0.96551724,
      "recall": 0.86821705,
      "f1": 0.91428571,
      "accuracy": 0.97965116,
      "auc": 0.98789994,
      "cost": 37
    },
    {
      "threshold": 0.35,
      "confusion": {
        "TP": 107,
        "FP": 2,
        "TN": 901,
        "FN": 22
      },
      "precision": 0.98165138,
      "recall": 0.82945736,
      "f1": 0.89915966,
      "accuracy": 0.97674419,
      "auc": 0.98789994,
      "cost": 32
    },
    {
      "threshold": 0.4,
      "confusion": {
        "TP": 104,
        "FP": 2,
        "TN": 901,
        "FN": 25
      },
      "precision": 0.98113208,
      "recall": 0.80620155,
      "f1": 0.88510638,
      "accuracy": 0.97383721,
      "auc": 0.98789994,
      "cost": 35
    },
    {
      "threshold": 0.45,
      "confusion": {
        "TP": 103,
        "FP": 1,
        "TN": 902,
        "FN": 26
      },
      "precision": 0.99038462,
      "recall": 0.79844961,
      "f1": 0.88412017,
      "accuracy": 0.97383721,
      "auc": 0.98789994,
      "cost": 31
    },
    {
      "threshold": 0.5,
      "confusion": {
        "TP": 96,
        "FP": 1,
        "TN": 902,
        "FN": 33
      },
      "precision": 0.98969072,
      "recall": 0.74418605,
      "f1": 0.84955752,
      "accuracy": 0.96705426,
      "auc": 0.98789994,
      "cost": 38
    },
    {
      "threshold": 0.55,
      "confusion": {
        "TP": 94,
        "FP": 1,
        "TN": 902,
        "FN": 35
      },
      "precision": 0.98947368,
      "recall": 0.72868217,
      "f1": 0.83928571,
      "accuracy": 0.96511628,
      "auc": 0.98789994,
      "cost": 40
    },
    {
      "threshold": 0.6,
      "confusion": {
        "TP": 89,
        "FP": 0,
        "TN": 903,
        "FN": 40
      },
      "precision": 1.0,
      "recall": 0.68992248,
      "f1": 0.81651376,
      "accuracy": 0.96124031,
      "auc": 0.98789994,
      "cost": 40
    },
    {
      "threshold": 0.65,
      "confusion": {
        "TP": 80,
        "FP": 0,
        "TN": 903,
        "FN": 49
      },
      "precision": 1.0,
      "recall": 0.62015504,
      "f1": 0.76555024,
      "accuracy": 0.95251938,
      "auc": 0.98789994,
      "cost": 49
    },
    {
      "threshold": 0.7,
      "confusion": {
        "TP": 67,
        "FP": 0,
        "TN": 903,
        "FN": 62
      },
      "precision": 1.0,
      "recall": 0.51937984,
      "f1": 0.68367347,
      "accuracy": 0.93992248,
      "auc": 0.98789994,
      "cost": 62
    },
    {
      "threshold": 0.75,
      "confusion": {
        "TP": 56,
        "FP": 0,
        "TN": 903,
        "FN": 73
      },
      "precision": 1.0,
      "recall": 0.43410853,
      "f1": 0.60540541,
      "accuracy": 0.92926357,
      "auc": 0.98789994,
      "cost": 73
    },
    {
      "threshold": 0.8,
      "confusion": {
        "TP": 38,
        "FP": 0,
        "TN": 903,
        "FN": 91
      },
      "precision": 1.0,
      "recall": 0.29457364,
      "f1": 0.45508982,
      "accuracy": 0.91182171,
      "auc": 0.98789994,
      "cost": 91
    },
    {
      "threshold": 0.85,
      "confusion": {
        "TP": 23,
        "FP": 0,
        "TN": 903,
        "FN": 106
      },
      "precision": 1.0,
      "recall": 0.17829457,
      "f1": 0.30263158,
      "accuracy": 0.89728682,
      "auc": 0.98789994,
      "cost": 106
    },
    {
      "threshold": 0.9,
      "confusion": {
        "TP": 9,
        "FP": 0,
        "TN": 903,
        "FN": 120
      },
      "precision": 1.0,
      "recall": 0.06976744,
      "f1": 0.13043478,
      "accuracy": 0.88372093,
      "auc": 0.98789994,
      "cost": 120
    }
  ],
  "validation": {
    "threshold": 0.45,
    "confusion": {
      "TP": 103,
      "FP": 1,
      "TN": 902,
      "FN": 26
    },
    "precision": 0.99038462,
    "recall": 0.79844961,
    "f1": 0.88412017,
    "accuracy": 0.97383721,
    "auc": 0.98789994,
    "cost": 31
  },
  "lockedTest": {
    "confusion": {
      "TP": 103,
      "FP": 0,
      "TN": 904,
      "FN": 25
    },
    "precision": 1.0,
    "recall": 0.8046875,
    "f1": 0.89177489,
    "accuracy": 0.97577519,
    "auc": 0.99573078,
    "cost": 25
  },
  "policy": {
    "modelSelectionSplit": "train-cv",
    "thresholdSelectionSplit": "validation",
    "testEvaluations": 1,
    "testReselectionAllowed": false
  },
  "validationErrorExamples": [
    {
      "kind": "FP",
      "sms_id": 4730,
      "score": 0.590651410563
    },
    {
      "kind": "FN",
      "sms_id": 4145,
      "score": 0.043627949817
    },
    {
      "kind": "FN",
      "sms_id": 69,
      "score": 0.048897807269
    },
    {
      "kind": "FN",
      "sms_id": 870,
      "score": 0.056234585523
    }
  ]
} as const
