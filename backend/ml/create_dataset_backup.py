
import csv
import random
from pathlib import Path
from collections import Counter

random.seed(42)

DATASET_PATH = Path(__file__).parent / "career_role_dataset.csv"

job_roles = {
    "Data Analyst": {
        "skills": [
            "SQL", "Excel", "Power BI", "Tableau", "Python",
            "Statistics", "Data Cleaning", "Data Visualization",
            "Pandas", "Reporting", "Google Sheets", "Business Intelligence"
        ],
        "tasks": [
            "analyzed business data and prepared reports",
            "created dashboards to track company performance",
            "cleaned customer data and identified trends",
            "used statistics to support business decisions",
            "prepared sales reports using Excel and SQL",
            "analyzed survey results and presented findings",
            "monitored key performance indicators"
        ],
        "projects": [
            "created a sales performance dashboard",
            "analyzed customer purchasing behavior",
            "prepared a university business analytics report",
            "built a dashboard for monthly company performance"
        ]
    },

    "Data Scientist": {
        "skills": [
            "Python", "Machine Learning", "Statistics", "Pandas",
            "NumPy", "Scikit-learn", "Jupyter", "Deep Learning",
            "Data Cleaning", "Feature Engineering", "Model Evaluation",
            "Matplotlib", "Seaborn"
        ],
        "tasks": [
            "trained machine learning models using datasets",
            "developed predictive models and evaluated performance",
            "used statistical methods to analyze data",
            "prepared data features for machine learning",
            "built classification models using Python",
            "performed exploratory data analysis",
            "compared machine learning algorithms"
        ],
        "projects": [
            "built a customer churn prediction model",
            "created a student performance prediction project",
            "analyzed datasets using Python and Jupyter",
            "developed a classification model for academic research"
        ]
    },

    "Web Developer": {
        "skills": [
            "HTML", "CSS", "JavaScript", "React", "TypeScript",
            "Vite", "Tailwind CSS", "Responsive Design", "Git",
            "Frontend Testing", "UI Development", "REST API"
        ],
        "tasks": [
            "developed responsive websites and web pages",
            "created interactive user interfaces",
            "built reusable React components",
            "converted designs into functional web pages",
            "developed frontend features for a website",
            "connected frontend applications to REST APIs",
            "improved website usability and performance"
        ],
        "projects": [
            "created a responsive online shopping website",
            "built a university information website",
            "developed a student portal interface",
            "created a web application using React"
        ]
    },

    "Backend Developer": {
        "skills": [
            "Python", "FastAPI", "Django", "REST API",
            "PostgreSQL", "SQL", "SQLAlchemy", "Docker",
            "Authentication", "Node.js", "Database Design",
            "Git", "API Testing"
        ],
        "tasks": [
            "developed backend services and API endpoints",
            "connected applications to relational databases",
            "implemented authentication and user registration",
            "created REST APIs for web applications",
            "managed database operations and server logic",
            "tested API responses and handled errors",
            "implemented data validation and security"
        ],
        "projects": [
            "built a user authentication system",
            "developed a backend for an online ordering application",
            "created REST API services for a university project",
            "connected a web application to PostgreSQL"
        ]
    },

    "Mobile Developer": {
        "skills": [
            "Flutter", "Dart", "Firebase", "Android", "iOS",
            "Mobile UI", "State Management", "SQLite",
            "REST API", "App Testing", "Push Notifications",
            "Git"
        ],
        "tasks": [
            "developed cross-platform mobile applications",
            "created mobile screens and application navigation",
            "connected mobile applications to Firebase",
            "built mobile interfaces using Flutter and Dart",
            "tested applications on Android and iOS",
            "integrated REST APIs into mobile applications",
            "implemented mobile application state management"
        ],
        "projects": [
            "developed a mobile task management application",
            "created a student attendance application",
            "built a mobile application using Flutter",
            "developed a location tracking mobile application"
        ]
    },

    "UI/UX Designer": {
        "skills": [
            "Figma", "Wireframing", "Prototyping", "User Research",
            "User Testing", "Design Systems", "User Flows",
            "Adobe XD", "Visual Design", "Typography",
            "Interaction Design", "Accessibility"
        ],
        "tasks": [
            "designed user-friendly application interfaces",
            "created wireframes and interactive prototypes",
            "conducted user research and usability testing",
            "improved application navigation and user experience",
            "created reusable interface components",
            "prepared design specifications for developers"
        ],
        "projects": [
            "designed a university mobile application prototype",
            "created an online shopping website interface",
            "developed a dashboard design system",
            "prepared user flows for a booking application"
        ]
    },

    "Data Engineer": {
        "skills": [
            "Python", "SQL", "ETL", "Apache Spark", "Airflow",
            "Data Warehousing", "PostgreSQL", "MongoDB",
            "Data Pipelines", "Docker", "AWS", "Data Modeling"
        ],
        "tasks": [
            "built data pipelines for processing large datasets",
            "developed ETL workflows for business data",
            "prepared data for analytics and reporting",
            "managed data warehouse operations",
            "automated data processing tasks",
            "integrated data from multiple sources"
        ],
        "projects": [
            "created an automated data pipeline",
            "built an ETL process for sales information",
            "developed a data warehouse for reporting",
            "processed large datasets using Apache Spark"
        ]
    },

    "Machine Learning Engineer": {
        "skills": [
            "Python", "Scikit-learn", "TensorFlow", "PyTorch",
            "Machine Learning", "Feature Engineering",
            "Model Evaluation", "Model Deployment",
            "MLflow", "Docker", "NumPy", "Pandas"
        ],
        "tasks": [
            "trained and evaluated machine learning models",
            "prepared machine learning models for deployment",
            "optimized model performance using experiments",
            "developed automated model training pipelines",
            "processed datasets for machine learning",
            "monitored model performance and prediction results"
        ],
        "projects": [
            "deployed a machine learning classification model",
            "built an image recognition prototype",
            "created a model training pipeline",
            "developed a predictive analytics application"
        ]
    },

    "AI Engineer": {
        "skills": [
            "Python", "Generative AI", "Large Language Models",
            "Prompt Engineering", "RAG", "Vector Databases",
            "LangChain", "Hugging Face", "TensorFlow",
            "PyTorch", "API Integration", "NLP"
        ],
        "tasks": [
            "developed applications using generative AI models",
            "integrated large language models into applications",
            "created retrieval augmented generation workflows",
            "designed prompts for AI-powered applications",
            "developed natural language processing solutions",
            "tested and evaluated AI-generated responses"
        ],
        "projects": [
            "built an AI-powered question answering application",
            "created a document chatbot using RAG",
            "developed an AI career advice application",
            "integrated a language model into a web application"
        ]
    },

    "DevOps Engineer": {
        "skills": [
            "Docker", "Kubernetes", "Linux", "CI/CD",
            "GitHub Actions", "Jenkins", "AWS",
            "Infrastructure as Code", "Terraform",
            "Monitoring", "Bash", "Git"
        ],
        "tasks": [
            "automated application deployment workflows",
            "managed containerized application environments",
            "maintained CI/CD pipelines",
            "monitored application performance and availability",
            "configured development and production environments",
            "automated infrastructure management tasks"
        ],
        "projects": [
            "created a CI/CD pipeline for a web application",
            "containerized an application using Docker",
            "deployed services to a cloud environment",
            "configured automated testing and deployment"
        ]
    },

    "Cloud Engineer": {
        "skills": [
            "AWS", "Microsoft Azure", "Google Cloud",
            "Terraform", "Linux", "Networking",
            "Cloud Security", "Docker", "Kubernetes",
            "Cloud Storage", "IAM", "Monitoring"
        ],
        "tasks": [
            "configured cloud infrastructure for applications",
            "managed cloud storage and computing resources",
            "implemented cloud security and access controls",
            "monitored cloud services and system availability",
            "deployed applications to cloud platforms",
            "automated cloud infrastructure provisioning"
        ],
        "projects": [
            "deployed a web application to cloud infrastructure",
            "configured cloud storage for application files",
            "created an automated cloud environment",
            "implemented cloud monitoring for a project"
        ]
    },

    "Cybersecurity Analyst": {
        "skills": [
            "Network Security", "SIEM", "Linux",
            "Vulnerability Assessment", "Incident Response",
            "Wireshark", "Nmap", "Firewalls",
            "Security Monitoring", "Python",
            "Risk Assessment", "Access Control"
        ],
        "tasks": [
            "monitored systems for potential security threats",
            "performed vulnerability assessments",
            "analyzed network traffic for suspicious activity",
            "reviewed security logs and incident reports",
            "implemented security controls for systems",
            "documented cybersecurity risks and findings"
        ],
        "projects": [
            "performed a network security assessment",
            "analyzed network traffic using Wireshark",
            "created a basic security monitoring project",
            "documented vulnerabilities in a test environment"
        ]
    },

    "QA / Test Engineer": {
        "skills": [
            "Manual Testing", "Selenium", "Pytest",
            "API Testing", "Automation Testing",
            "Test Cases", "Bug Tracking", "Postman",
            "Regression Testing", "Java", "Python",
            "Software Testing"
        ],
        "tasks": [
            "tested application features and documented defects",
            "created test cases for software requirements",
            "automated repetitive software testing tasks",
            "performed API testing and validation",
            "conducted regression testing before releases",
            "reported bugs and worked with developers"
        ],
        "projects": [
            "created automated tests for a web application",
            "tested REST API endpoints using Postman",
            "prepared a software quality assurance report",
            "developed a test suite using Selenium"
        ]
    },

    "Business Analyst": {
        "skills": [
            "Excel", "SQL", "Power BI", "Tableau",
            "Requirements Analysis", "Business Process Modeling",
            "Data Analysis", "Documentation",
            "Stakeholder Management", "Jira",
            "Process Improvement", "Reporting"
        ],
        "tasks": [
            "gathered business requirements from stakeholders",
            "analyzed business processes and identified improvements",
            "prepared reports to support business decisions",
            "documented system requirements and workflows",
            "analyzed business performance indicators",
            "communicated project requirements to development teams"
        ],
        "projects": [
            "prepared requirements for a university information system",
            "analyzed business processes for an online store",
            "created a business performance dashboard",
            "documented requirements for a booking system"
        ]
    },

    "Digital Marketing Specialist": {
        "skills": [
            "SEO", "Google Analytics", "Content Marketing",
            "Social Media Marketing", "Digital Advertising",
            "Google Ads", "Keyword Research",
            "Email Marketing", "Content Strategy",
            "Campaign Management", "Analytics",
            "Copywriting"
        ],
        "tasks": [
            "planned digital marketing campaigns",
            "analyzed website traffic and campaign performance",
            "optimized website content for search engines",
            "managed social media marketing activities",
            "researched keywords and audience interests",
            "prepared marketing performance reports"
        ],
        "projects": [
            "created a social media marketing campaign",
            "analyzed website traffic using Google Analytics",
            "prepared an SEO improvement plan",
            "developed a digital content marketing strategy"
        ]
    }
}

experience_templates = [
    "experience includes {task}",
    "worked on projects where the main responsibility was to {task}",
    "practical experience includes work to {task}",
    "supported a project team to {task}",
    "completed project work involving how to {task}"
]

academic_projects = [
    "completed a university project involving {project}",
    "worked with a small project team to {project}",
    "prepared technical documentation while developing work to {project}",
    "created a practical portfolio project to {project}",
    "applied technical skills in a project to {project}"
]

rows = []

for role, information in job_roles.items():
    for number in range(100):
        selected_skills = random.sample(
            information["skills"],
            k=random.randint(5, min(9, len(information["skills"])))
        )

        task = random.choice(information["tasks"])
        project = random.choice(information["projects"])

        experience = random.choice(experience_templates).format(task=task)
        academic_project = random.choice(
            academic_projects
        ).format(project=project)

        resume_text = (
            "Skills: "
            + ", ".join(selected_skills)
            + ". Experience: "
            + experience
            + ". Academic project: "
            + academic_project
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

role_counts = Counter(row["job_role"] for row in rows)

print("\nDataset created successfully!")
print("Total examples:", len(rows))
print("Number of career roles:", len(role_counts))
print("Saved to:", DATASET_PATH)
print("\nExamples per career role:")

for role in job_roles:
    print(f"{role}: {role_counts[role]}")

print("\nDataset validation:")
print("Duplicate resume descriptions:", len(rows) - len(set(
    row["resume_text"] for row in rows
)))
print("Expected examples:", len(job_roles) * 100)
print("Actual examples:", len(rows))
