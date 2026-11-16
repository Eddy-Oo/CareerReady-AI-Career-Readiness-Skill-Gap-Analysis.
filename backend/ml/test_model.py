from pathlib import Path
import joblib

BASE_DIR = Path(__file__).parent
MODEL_PATH = BASE_DIR / "artifacts" / "career_role_model.joblib"

model = joblib.load(MODEL_PATH)

test_resumes = [
    """
    Skills: SQL, Excel, Power BI, Tableau, Statistics.
    Experience: analyzed business data and created company reports.
    """,

    """
    Skills: Python, Machine Learning, Pandas, NumPy,
    Scikit-learn, Statistics.
    Experience: trained predictive models using datasets.
    """,

    """
    Skills: HTML, CSS, JavaScript, React, TypeScript.
    Experience: developed responsive websites and user interfaces.
    """,

    """
    Skills: Python, FastAPI, PostgreSQL, SQLAlchemy, Docker.
    Experience: developed backend services and REST API endpoints.
    """,

    """
    Skills: Flutter, Dart, Firebase, Android, iOS.
    Experience: developed cross platform mobile applications.
    """
]

print("\n========== CAREER ROLE PREDICTIONS ==========")

for number, resume in enumerate(test_resumes, start=1):
    prediction = model.predict([resume])[0]

    probabilities = model.predict_proba([resume])[0]
    classes = model.classes_

    print("\nTest", number)
    print("Predicted job role:", prediction)

    print("Top 3 possible roles:")

    top_indexes = probabilities.argsort()[::-1][:3]

    for index in top_indexes:
        print(
            classes[index],
            "-",
            round(probabilities[index] * 100, 2),
            "%"
        )
