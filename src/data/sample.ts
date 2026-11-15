import type { Career, CareerMatch, ReadinessResult, ResumeAnalysis, RoadmapPhase, AIRecommendation } from "../types";

/** A realistic sample resume used for offline demo mode. */
export const SAMPLE_RESUME_FILENAME = "Amina_Yusuf_Resume.pdf";

export const SAMPLE_RESUME_TEXT = `AMINA YUSUF
amina.yusuf@university.edu | +1 (555) 123-4567 | linkedin.com/in/aminayusuf | github.com/aminayusuf

EDUCATION
Bachelor of Science in Computer Science — State University, GPA 3.6/4.0
Graduation: June 2026 | Relevant coursework: Data Structures, Databases, Machine Learning, Operating Systems

EXPERIENCE
Software Engineering Intern — FinTech Labs (Summer 2025)
- Built REST APIs with Python and Flask serving 10k+ daily requests
- Wrote unit tests with pytest, raising coverage from 62% to 88%
- Collaborated in an Agile team of 6 using Git and GitHub for version control
- Presented demo to stakeholders, improving onboarding documentation

Web Developer (Part-time) — University IT Department (2024–2025)
- Developed responsive web pages with HTML, CSS, JavaScript and React
- Managed content in MySQL and optimized slow queries
- Communicated requirements with non-technical staff

PROJECTS
- SmartCampus: A full-stack course planner using React, Node.js, Express and MongoDB
- Sentiment Analyzer: NLP pipeline in Python using spaCy and scikit-learn to classify reviews
- Task Tracker: REST API with Flask and SQLite, containerized with Docker

TECHNICAL SKILLS
Languages: Python, Java, JavaScript, SQL, Bash
Web: React, HTML, CSS, Node.js, Express.js, REST API
Databases: MySQL, MongoDB, SQLite
Tools: Git, GitHub, Docker, Linux, VS Code, Agile/Scrum, Testing (pytest, Jest)

SOFT SKILLS
Communication, Teamwork, Problem Solving, Time Management, Adaptability

CERTIFICATIONS
- Cisco Networking Academy: Introduction to Cybersecurity (2024)
`;

export const SAMPLE_ANALYSIS: ResumeAnalysis = {
  id: "sample-analysis",
  fileName: SAMPLE_RESUME_FILENAME,
  analyzedAt: "2026-10-28T09:30:00.000Z",
  extractedSkills: [],
  technicalSkills: [],
  softSkills: [],
  education: [
    {
      degree: "Bachelor of Science in Computer Science",
      institution: "State University",
      year: "June 2026",
      details: "GPA 3.6/4.0 · Coursework: Data Structures, Databases, Machine Learning, Operating Systems",
    },
  ],
  experiences: [
    {
      title: "Software Engineering Intern",
      organization: "FinTech Labs",
      duration: "Summer 2025",
      summary:
        "Built REST APIs with Python and Flask, wrote pytest tests (62% → 88% coverage), collaborated in an Agile team of 6 with Git.",
    },
    {
      title: "Web Developer (Part-time)",
      organization: "University IT Department",
      duration: "2024–2025",
      summary:
        "Developed responsive pages with React, managed MySQL content, communicated with non-technical stakeholders.",
    },
  ],
  projects: [
    "SmartCampus — full-stack course planner (React, Node.js, Express, MongoDB)",
    "Sentiment Analyzer — NLP pipeline (spaCy, scikit-learn)",
    "Task Tracker — Flask REST API with SQLite, containerized with Docker",
  ],
  keywords: ["REST API", "Agile", "pytest", "Git", "Docker"],
  rawTextPreview: SAMPLE_RESUME_TEXT.slice(0, 600),
  source: "local",
};

export const SAMPLE_HISTORY = [
  { id: "h1", date: "2026-10-28", careerTitle: "Full Stack Developer", readiness: 74, matched: 7, missing: 3, fileName: "Amina_Yusuf_Resume.pdf" },
  { id: "h2", date: "2026-10-21", careerTitle: "Backend Developer", readiness: 68, matched: 6, missing: 4, fileName: "Amina_Yusuf_Resume.pdf" },
  { id: "h3", date: "2026-10-14", careerTitle: "Data Scientist", readiness: 52, matched: 4, missing: 6, fileName: "Amina_Yusuf_Resume.pdf" },
];

export const DEFAULT_PROFILE = {
  fullName: "Amina Yusuf",
  email: "amina.yusuf@university.edu",
  university: "State University",
  degree: "B.Sc. Computer Science",
  graduationYear: "2026",
  careerInterests: ["Full Stack Developer", "AI Engineer"],
  technicalSkills: ["Python", "Java", "JavaScript", "SQL", "React", "Git"],
  experienceLevel: "intermediate" as const,
  bio: "Final-year CS student focused on full-stack engineering and applied AI.",
  avatarColor: "#2563EB",
};

/** Sample roadmap used when the generative backend is unavailable. */
export const SAMPLE_ROADMAP: RoadmapPhase[] = [
  {
    id: "phase-1",
    phaseNumber: 1,
    title: "Python Fundamentals",
    objectives: [
      "Master variables, control flow, functions and OOP",
      "Write small command-line scripts confidently",
      "Understand virtual environments and pip",
    ],
    resources: [
      { title: "Python for Everybody (Coursera)", url: "https://www.coursera.org/specializations/python", type: "course" },
      { title: "Official Python Tutorial", url: "https://docs.python.org/3/tutorial/", type: "documentation" },
    ],
    estimatedTime: "3–4 weeks",
    skills: ["Python"],
  },
  {
    id: "phase-2",
    phaseNumber: 2,
    title: "Statistics",
    objectives: [
      "Understand descriptive and inferential statistics",
      "Run hypothesis tests and interpret p-values",
      "Explain distributions, correlation and regression",
    ],
    resources: [
      { title: "Khan Academy Statistics & Probability", url: "https://www.khanacademy.org/math/statistics-probability", type: "course" },
      { title: "Think Stats (free book)", url: "https://greenteapress.com/thinkstats2/html/", type: "book" },
    ],
    estimatedTime: "4–5 weeks",
    skills: ["Statistics"],
  },
  {
    id: "phase-3",
    phaseNumber: 3,
    title: "Data Analysis with Pandas",
    objectives: [
      "Load, clean and transform tabular data",
      "Use groupby, merges and time series tools",
      "Communicate findings with clear summaries",
    ],
    resources: [
      { title: "Pandas Official Getting Started", url: "https://pandas.pydata.org/docs/user_guide/10min.html", type: "documentation" },
      { title: "Kaggle Pandas Course", url: "https://www.kaggle.com/learn/pandas", type: "course" },
    ],
    estimatedTime: "3 weeks",
    skills: ["Pandas"],
  },
  {
    id: "phase-4",
    phaseNumber: 4,
    title: "Machine Learning",
    objectives: [
      "Understand supervised vs unsupervised learning",
      "Train and evaluate regression and classification models",
      "Avoid overfitting with cross-validation",
    ],
    resources: [
      { title: "Andrew Ng — Machine Learning (Coursera)", url: "https://www.coursera.org/learn/machine-learning", type: "course" },
      { title: "scikit-learn User Guide", url: "https://scikit-learn.org/stable/user_guide.html", type: "documentation" },
    ],
    estimatedTime: "6–8 weeks",
    skills: ["Machine Learning"],
  },
  {
    id: "phase-5",
    phaseNumber: 5,
    title: "Data Visualization",
    objectives: [
      "Choose the right chart for the message",
      "Build dashboards with Matplotlib/Seaborn or Tableau",
      "Present insights to a non-technical audience",
    ],
    resources: [
      { title: "Matplotlib Tutorials", url: "https://matplotlib.org/stable/tutorials/index.html", type: "documentation" },
      { title: "Storytelling with Data (book)", url: "https://www.storytellingwithdata.com/", type: "book" },
    ],
    estimatedTime: "2–3 weeks",
    skills: ["Data Visualization"],
  },
  {
    id: "phase-6",
    phaseNumber: 6,
    title: "Portfolio Projects",
    objectives: [
      "Ship 2–3 end-to-end projects on GitHub",
      "Write clear READMEs with screenshots and results",
      "Prepare project stories for interviews",
    ],
    resources: [
      { title: "Kaggle Datasets", url: "https://www.kaggle.com/datasets", type: "practice" },
      { title: "GitHub README Guide", url: "https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes", type: "documentation" },
    ],
    estimatedTime: "4–6 weeks",
    skills: ["Data Visualization", "Machine Learning", "Pandas"],
  },
];

export const SAMPLE_RECOMMENDATIONS: AIRecommendation[] = [
  {
    id: "r1",
    type: "roadmap",
    title: "Follow a 6-phase learning roadmap",
    body: "Your strongest foundation is Python and JavaScript. Follow the phases in order: Python fundamentals → statistics → pandas → machine learning → data visualization → portfolio projects. Spend 6–8 hours per week and you will close the gap in roughly 5 months.",
    priority: "high",
  },
  {
    id: "r2",
    type: "technology",
    title: "Add SQL depth and PostgreSQL to your toolkit",
    body: "You have used MySQL and SQLite, but job descriptions for data roles ask for strong SQL and often PostgreSQL. Practice window functions, CTEs and query optimization on SQLZoo, then build one project on PostgreSQL.",
    priority: "high",
  },
  {
    id: "r3",
    type: "project",
    title: "Build an end-to-end sales forecasting app",
    body: "Combine your full-stack skills with your data goals: a FastAPI backend that trains a scikit-learn model, a React dashboard that visualizes predictions, and Docker for deployment. This single project demonstrates pandas, machine learning, data visualization and REST API skills.",
    priority: "high",
  },
  {
    id: "r4",
    type: "study_plan",
    title: "Weekly study plan (10 hours/week)",
    body: "Weekdays: 1 hour of theory (course lectures). Saturday: 2 hours of hands-on coding. Sunday: 1 hour of review + notes. Rotate every three weeks between a new topic, project work and spaced-repetition review of older topics.",
    priority: "medium",
  },
  {
    id: "r5",
    type: "interview",
    title: "Prepare for technical interviews",
    body: "Practice 2 easy + 1 medium coding problem three times per week on LeetCode, focusing on arrays, strings, hash maps and recursion. Be ready to explain one project in 2 minutes using the STAR format, and review statistics fundamentals (bias-variance tradeoff, cross-validation).",
    priority: "medium",
  },
  {
    id: "r6",
    type: "career_advice",
    title: "Make your experience visible",
    body: "Your internship shows production impact (62% → 88% test coverage). Quantify every bullet point on your resume with numbers, and add a GitHub profile README that links your three best projects. Recruiters scan for measurable outcomes within 6 seconds.",
    priority: "low",
  },
];

export const SAMPLE_JOB_DESCRIPTION = `Data Scientist — Growth Analytics
Remote · Full-time

We are looking for a Data Scientist to join our growth team. You will analyze large datasets, build predictive models and communicate insights to product teams.

Requirements:
- Bachelor's degree in Computer Science, Statistics, Mathematics or related field
- 2+ years of experience in data science or analytics
- Strong Python and SQL skills, including pandas and data wrangling
- Experience with machine learning (scikit-learn, classification, regression)
- Solid understanding of statistics and hypothesis testing
- Experience with data visualization tools (Tableau, Power BI or Matplotlib)
- Excellent communication and collaboration skills
- Familiarity with cloud platforms (AWS or GCP) is a plus`;

export const DEMO_CAREER_MATCHES = (titles: [string, string, string, string, string]): CareerMatch[] => [];
