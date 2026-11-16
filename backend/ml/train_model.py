from pathlib import Path
import json
import joblib
import pandas as pd

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline

BASE_DIR = Path(__file__).parent
DATASET_PATH = BASE_DIR / "career_role_dataset.csv"
ARTIFACT_DIR = BASE_DIR / "artifacts"
MODEL_PATH = ARTIFACT_DIR / "career_role_model.joblib"


def main():
    print("Loading dataset...")

    data = pd.read_csv(DATASET_PATH)

    X = data["resume_text"]
    y = data["job_role"]

    print("Total dataset records:", len(data))

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=42,
        stratify=y
    )

    model = Pipeline([
        (
            "tfidf",
            TfidfVectorizer(
                lowercase=True,
                ngram_range=(1, 2),
                min_df=2
            )
        ),
        (
            "classifier",
            LogisticRegression(
		solver="lbfgs",
                max_iter=2000,
                class_weight="balanced",
                random_state=42
            )
        )
    ])

    print("\nTraining ML model...")
    model.fit(X_train, y_train)

    print("Testing ML model...")
    predictions = model.predict(X_test)

    accuracy = accuracy_score(y_test, predictions)

    print("\n========== MODEL RESULTS ==========")
    print("Training records:", len(X_train))
    print("Testing records:", len(X_test))
    print("Accuracy:", round(accuracy * 100, 2), "%")

    print("\nClassification Report:")
    print(classification_report(y_test, predictions))

    ARTIFACT_DIR.mkdir(exist_ok=True)

    joblib.dump(model, MODEL_PATH)

    metrics = {
        "accuracy": float(accuracy),
        "training_records": len(X_train),
        "testing_records": len(X_test),
        "job_roles": sorted(y.unique().tolist()),
        "dataset_type": "synthetic"
    }

    with open(
        ARTIFACT_DIR / "evaluation_metrics.json",
        "w",
        encoding="utf-8"
    ) as file:
        json.dump(metrics, file, indent=4)

    print("\nModel saved to:", MODEL_PATH)
    print("Training completed successfully!")


if __name__ == "__main__":
    main()
