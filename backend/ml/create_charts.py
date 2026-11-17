
from pathlib import Path
from collections import Counter
import re

import joblib
import pandas as pd
import matplotlib.pyplot as plt

from sklearn.model_selection import train_test_split
from sklearn.metrics import confusion_matrix, ConfusionMatrixDisplay


BASE_DIR = Path(__file__).parent
DATASET_PATH = BASE_DIR / "career_role_dataset.csv"
MODEL_PATH = BASE_DIR / "artifacts" / "career_role_model.joblib"
OUTPUT_DIR = BASE_DIR / "artifacts"

OUTPUT_DIR.mkdir(exist_ok=True)

print("Loading dataset and trained model...")

data = pd.read_csv(DATASET_PATH)
model = joblib.load(MODEL_PATH)

# 1. Career role distribution
role_counts = data["job_role"].value_counts().sort_values()

plt.figure(figsize=(11, 7))
role_counts.plot(kind="barh")
plt.title("Career Role Dataset Distribution")
plt.xlabel("Number of Examples")
plt.ylabel("Career Role")
plt.tight_layout()
plt.savefig(OUTPUT_DIR / "career_role_distribution.png", dpi=200)
plt.close()

print("Career role chart created.")

# Extract skills from the resume_text column
skill_counts = Counter()
role_skill_counts = {}

for _, row in data.iterrows():
    role = row["job_role"]
    resume = str(row["resume_text"])

    match = re.search(
        r"Skills:\s*(.*?)\.\s*Experience:",
        resume
    )

    if match:
        skills = [
            skill.strip()
            for skill in match.group(1).split(",")
            if skill.strip()
        ]

        skill_counts.update(skills)

        if role not in role_skill_counts:
            role_skill_counts[role] = Counter()

        role_skill_counts[role].update(skills)

# 2. Most common skills
top_skills = skill_counts.most_common(20)

skill_names = [item[0] for item in top_skills]
skill_values = [item[1] for item in top_skills]

plt.figure(figsize=(11, 8))
plt.barh(skill_names[::-1], skill_values[::-1])
plt.title("Top 20 Most Common Skills")
plt.xlabel("Number of Occurrences")
plt.ylabel("Skill")
plt.tight_layout()
plt.savefig(OUTPUT_DIR / "skill_frequency.png", dpi=200)
plt.close()

print("Skill frequency chart created.")

# 3. Skill distribution across career roles
top_skill_names = [
    skill for skill, count in skill_counts.most_common(20)
]

roles = sorted(data["job_role"].unique())

heatmap_data = []

for role in roles:
    heatmap_data.append([
        role_skill_counts.get(role, Counter()).get(skill, 0)
        for skill in top_skill_names
    ])

plt.figure(figsize=(16, 9))
plt.imshow(heatmap_data, aspect="auto")
plt.colorbar(label="Number of Occurrences")
plt.xticks(
    range(len(top_skill_names)),
    top_skill_names,
    rotation=65,
    ha="right"
)
plt.yticks(range(len(roles)), roles)
plt.title("Skill Distribution by Career Role")
plt.xlabel("Skills")
plt.ylabel("Career Role")
plt.tight_layout()
plt.savefig(OUTPUT_DIR / "skill_role_heatmap.png", dpi=200)
plt.close()

print("Skill distribution chart created.")

# 4. ML feature importance from Logistic Regression
tfidf = model.named_steps["tfidf"]
classifier = model.named_steps["classifier"]

feature_names = tfidf.get_feature_names_out()
coefficients = classifier.coef_

# Find the strongest absolute coefficient for each feature
importance_values = abs(coefficients).max(axis=0)

top_indices = importance_values.argsort()[-20:]

top_feature_names = feature_names[top_indices]
top_importance_values = importance_values[top_indices]

plt.figure(figsize=(11, 8))
plt.barh(top_feature_names, top_importance_values)
plt.title("Top 20 ML Feature Importance")
plt.xlabel("Absolute Logistic Regression Coefficient")
plt.ylabel("TF-IDF Feature")
plt.tight_layout()
plt.savefig(OUTPUT_DIR / "feature_importance.png", dpi=200)
plt.close()

print("Feature importance chart created.")

# 5. Confusion matrix
X = data["resume_text"]
y = data["job_role"]

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

predictions = model.predict(X_test)

labels = sorted(data["job_role"].unique())

matrix = confusion_matrix(
    y_test,
    predictions,
    labels=labels
)

display = ConfusionMatrixDisplay(
    confusion_matrix=matrix,
    display_labels=labels
)

fig, ax = plt.subplots(figsize=(14, 12))

display.plot(
    ax=ax,
    xticks_rotation=90,
    cmap="Blues",
    colorbar=True
)

plt.title("Career Role Prediction Confusion Matrix")
plt.tight_layout()
plt.savefig(OUTPUT_DIR / "confusion_matrix.png", dpi=200)
plt.close()

print("Confusion matrix created.")

print("\nAll charts created successfully!")

print("Saved in:", OUTPUT_DIR)
