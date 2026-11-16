import csv
import random
from pathlib import Path

random.seed(42)

DATASET_PATH = Path(__file__).parent / "career_role_dataset.csv"

job_roles = {
    "Data Analyst": {
        "skills": [
            "SQL", "Excel", "Power BI", "Tableau", "Python",
            "Statistics", "Data Cleaning", "Data Visualization",
            "Pandas", "Reporting", "Google Sheets"
        ],
        "tasks": [
            "analyzed business data and prepared reports",
            "created dashboards to track company performance",
            "cleaned customer data and identified trends",
            "used statistics to support business decisions",
            "prepared sales reports using Excel and SQL"
        ]
    },

    "Data Scientist": {
        "skills": [
            "Python", "Machine Learning", "Statistics", "Pandas",
            "NumPy", "Scikit-learn", "Jupyter", "Deep Learning",
            "Data Cleaning", "Feature Engineering", "Model Evaluation"
        ],
        "tasks": [
            "trained machine learning models using datasets",
            "developed predictive models and evaluated performance",
            "used statistical methods to analyze data",
            "prepared data features for machine learning",
            "built classification models using Python"
        ]
    },

    "Web Developer": {
        "skills": [
            "HTML", "CSS", "JavaScript", "React", "TypeScript",
            "Vite", "Tailwind CSS", "Responsive Design", "Git",
            "Frontend Testing", "UI Development"
        ],
        "tasks": [
            "developed responsive websites and web pages",
            "created interactive user interfaces",
            "built reusable React components",
            "converted designs into functional web pages",
            "developed frontend features for a website"
        ]
    },

    "Backend Developer": {
        "skills": [
            "Python", "FastAPI", "Django", "REST API",
            "PostgreSQL", "SQL", "SQLAlchemy", "Docker",
            "Authentication", "Node.js", "Database Design"
        ],
        "tasks": [
            "developed backend services and API endpoints",
            "connected applications to relational databases",
            "implemented authentication and user registration",
            "created REST APIs for web applications",
            "managed database operations and server logic"
        ]
    },

    "Mobile Developer": {
        "skills": [
            "Flutter", "Dart", "Firebase", "Android", "iOS",
            "Mobile UI", "State Management", "SQLite",
            "REST API", "App Testing", "Push Notifications"
        ],
        "tasks": [
            "developed cross platform mobile applications",
            "created mobile screens and application navigation",
            "connected mobile applications to Firebase",
            "built mobile interfaces using Flutter and Dart",
            "tested applications on Android and iOS"
        ]
    }
}

rows = []

for role, information in job_roles.items():
    for number in range(100):
        selected_skills = random.sample(
            information["skills"],
            k=random.randint(5, 9)
        )

        task = random.choice(information["tasks"])

        resume_text = (
            "Skills: "
            + ", ".join(selected_skills)
            + ". Experience: "
            + task
            + ". Academic project: "
            + random.choice([
                "completed a software development project",
                "worked with a small project team",
                "developed an application for a university project",
                "prepared technical documentation and project reports"
            ])
            + "."
        )

        rows.append({
            "resume_text": resume_text,
            "job_role": role
        })

random.shuffle(rows)

with open(DATASET_PATH, "w", newline="", encoding="utf-8") as file:
    writer = csv.DictWriter(
        file,
        fieldnames=["resume_text", "job_role"]
    )
    writer.writeheader()
    writer.writerows(rows)

print("Dataset created successfully!")
print("Total examples:", len(rows))
print("Saved to:", DATASET_PATH)

for role in job_roles:
    print(role, ":", sum(1 for row in rows if row["job_role"] == role))
