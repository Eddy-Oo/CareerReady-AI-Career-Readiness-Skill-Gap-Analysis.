import type { Career } from "../types";

export const CAREERS: Career[] = [
  {
    id: "software-developer",
    title: "Software Developer",
    description:
      "Designs, builds and maintains software applications using a variety of programming languages and engineering practices.",
    requiredTechnicalSkills: ["Python", "Java", "Git", "SQL", "Testing", "REST API", "Data Structures"],
    requiredSoftSkills: ["Problem Solving", "Communication", "Teamwork", "Time Management"],
    recommendedExperience: "0–2 years (entry level) to 4+ years (mid level); internships count as relevant experience.",
    technologies: ["Java", "Python", "Git", "JUnit", "Docker", "Linux"],
    responsibilities: [
      "Write clean, maintainable code across the application stack",
      "Participate in code reviews and agile ceremonies",
      "Write and maintain automated tests",
      "Debug and resolve production issues",
    ],
    salaryRange: "$70k – $130k",
    outlook: "Strong growth (≈17% through 2033)",
  },
  {
    id: "frontend-developer",
    title: "Frontend Developer",
    description:
      "Builds the user-facing interfaces of web applications with a focus on usability, performance and accessibility.",
    requiredTechnicalSkills: ["HTML", "CSS", "JavaScript", "React", "Git", "REST API", "Testing"],
    requiredSoftSkills: ["Creativity", "Communication", "Attention to Detail", "Teamwork"],
    recommendedExperience: "0–3 years; portfolio of shipped web interfaces strongly preferred.",
    technologies: ["React", "TypeScript", "Tailwind CSS", "Next.js", "Vite", "Jest"],
    responsibilities: [
      "Implement responsive, accessible UI components",
      "Collaborate with designers and backend engineers",
      "Optimize application performance and load times",
      "Maintain front-end testing and CI pipelines",
    ],
    salaryRange: "$65k – $125k",
    outlook: "Steady growth (≈16% through 2033)",
  },
  {
    id: "backend-developer",
    title: "Backend Developer",
    description:
      "Develops server-side logic, databases and APIs that power web and mobile applications.",
    requiredTechnicalSkills: ["Python", "SQL", "REST API", "Git", "Testing", "System Design", "Docker"],
    requiredSoftSkills: ["Problem Solving", "Communication", "Teamwork", "Critical Thinking"],
    recommendedExperience: "1–4 years building production APIs and services.",
    technologies: ["Python", "Node.js", "PostgreSQL", "Redis", "Docker", "AWS"],
    responsibilities: [
      "Design and implement RESTful and gRPC APIs",
      "Model and optimize database schemas",
      "Ensure security, scalability and reliability of services",
      "Instrument services with logging and monitoring",
    ],
    salaryRange: "$75k – $140k",
    outlook: "Strong growth (≈17% through 2033)",
  },
  {
    id: "full-stack-developer",
    title: "Full Stack Developer",
    description:
      "Works across the entire web stack — from database design and APIs to polished user interfaces.",
    requiredTechnicalSkills: ["JavaScript", "React", "Node.js", "SQL", "Git", "REST API", "Testing"],
    requiredSoftSkills: ["Problem Solving", "Communication", "Adaptability", "Teamwork"],
    recommendedExperience: "1–5 years shipping features end-to-end.",
    technologies: ["React", "Node.js", "TypeScript", "MongoDB", "PostgreSQL", "Docker"],
    responsibilities: [
      "Deliver features from database to browser",
      "Own technical decisions across the stack",
      "Integrate third-party services and APIs",
      "Mentor junior developers",
    ],
    salaryRange: "$80k – $150k",
    outlook: "Strong growth (≈17% through 2033)",
  },
  {
    id: "data-scientist",
    title: "Data Scientist",
    description:
      "Extracts insights from data using statistics, machine learning and visualization to drive business decisions.",
    requiredTechnicalSkills: ["Python", "SQL", "Statistics", "Machine Learning", "Pandas", "Data Visualization"],
    requiredSoftSkills: ["Communication", "Critical Thinking", "Problem Solving", "Creativity"],
    recommendedExperience: "1–4 years of applied data analysis or research experience.",
    technologies: ["Python", "Pandas", "NumPy", "scikit-learn", "Tableau", "Jupyter"],
    responsibilities: [
      "Formulate business questions as data problems",
      "Build and validate predictive models",
      "Communicate findings to non-technical stakeholders",
      "Design experiments and A/B tests",
    ],
    salaryRange: "$85k – $155k",
    outlook: "Very strong growth (≈36% through 2033)",
  },
  {
    id: "machine-learning-engineer",
    title: "Machine Learning Engineer",
    description:
      "Designs, trains, deploys and maintains machine learning models at production scale.",
    requiredTechnicalSkills: ["Python", "Machine Learning", "Deep Learning", "Statistics", "Git", "Docker", "Model Deployment"],
    requiredSoftSkills: ["Problem Solving", "Critical Thinking", "Communication", "Adaptability"],
    recommendedExperience: "2–5 years building and shipping ML systems.",
    technologies: ["Python", "PyTorch", "TensorFlow", "MLflow", "Kubernetes", "AWS"],
    responsibilities: [
      "Prototype, train and evaluate models",
      "Build training and inference pipelines",
      "Monitor model performance and drift",
      "Optimize models for latency and cost",
    ],
    salaryRange: "$100k – $180k",
    outlook: "Very strong growth (≈26% through 2033)",
  },
  {
    id: "ai-engineer",
    title: "AI Engineer",
    description:
      "Builds applications powered by generative AI, LLMs and advanced AI techniques such as NLP and computer vision.",
    requiredTechnicalSkills: ["Python", "Machine Learning", "NLP", "Generative AI", "REST API", "Git", "Cloud Computing"],
    requiredSoftSkills: ["Creativity", "Problem Solving", "Communication", "Adaptability"],
    recommendedExperience: "1–4 years in AI/ML application development.",
    technologies: ["Python", "LangChain", "OpenAI API", "Hugging Face", "FastAPI", "Vector Databases"],
    responsibilities: [
      "Design LLM-powered features and agents",
      "Build RAG pipelines and prompt systems",
      "Evaluate model outputs and safety",
      "Integrate AI services into production apps",
    ],
    salaryRange: "$100k – $185k",
    outlook: "Rapidly emerging field with exceptional demand",
  },
  {
    id: "cybersecurity-analyst",
    title: "Cybersecurity Analyst",
    description:
      "Protects systems and data by monitoring, detecting and responding to security threats and vulnerabilities.",
    requiredTechnicalSkills: ["Network Security", "Security Analysis", "Linux", "Python", "Vulnerability Assessment", "Scripting"],
    requiredSoftSkills: ["Critical Thinking", "Attention to Detail", "Communication", "Time Management"],
    recommendedExperience: "1–4 years in SOC, IT security or audit roles.",
    technologies: ["SIEM", "Wireshark", "Kali Linux", "Nessus", "Splunk", "Python"],
    responsibilities: [
      "Monitor and triage security alerts",
      "Conduct vulnerability assessments",
      "Respond to and document incidents",
      "Harden systems and enforce policies",
    ],
    salaryRange: "$80k – $140k",
    outlook: "Very strong growth (≈33% through 2033)",
  },
  {
    id: "cloud-engineer",
    title: "Cloud Engineer",
    description:
      "Designs, builds and operates cloud infrastructure and services, enabling scalable and reliable platforms.",
    requiredTechnicalSkills: ["AWS", "Docker", "Kubernetes", "CI/CD", "Linux", "Networking", "Terraform"],
    requiredSoftSkills: ["Problem Solving", "Teamwork", "Communication", "Adaptability"],
    recommendedExperience: "2–5 years in DevOps, SRE or infrastructure roles.",
    technologies: ["AWS", "Terraform", "Kubernetes", "GitHub Actions", "Prometheus", "Ansible"],
    responsibilities: [
      "Provision and manage cloud resources as code",
      "Automate deployments and rollbacks",
      "Ensure high availability and cost efficiency",
      "Document architecture and runbooks",
    ],
    salaryRange: "$90k – $160k",
    outlook: "Strong growth (≈16% through 2033)",
  },
  {
    id: "mobile-application-developer",
    title: "Mobile Application Developer",
    description:
      "Creates native and cross-platform mobile applications for iOS and Android devices.",
    requiredTechnicalSkills: ["Flutter", "React Native", "Dart", "Git", "REST API", "Testing"],
    requiredSoftSkills: ["Creativity", "Attention to Detail", "Communication", "Problem Solving"],
    recommendedExperience: "1–4 years shipping mobile apps to app stores.",
    technologies: ["Flutter", "React Native", "Kotlin", "Swift", "Firebase", "Fastlane"],
    responsibilities: [
      "Build responsive mobile UIs and animations",
      "Integrate device APIs and third-party SDKs",
      "Optimize performance and battery usage",
      "Publish and maintain apps on app stores",
    ],
    salaryRange: "$75k – $140k",
    outlook: "Steady growth (≈15% through 2033)",
  },
  {
    id: "database-administrator",
    title: "Database Administrator",
    description:
      "Ensures the performance, security and reliability of databases that store critical organizational data.",
    requiredTechnicalSkills: ["SQL", "Database Design", "MySQL", "PostgreSQL", "Linux", "Scripting", "Security Analysis"],
    requiredSoftSkills: ["Attention to Detail", "Problem Solving", "Communication", "Time Management"],
    recommendedExperience: "2–5 years managing production databases.",
    technologies: ["PostgreSQL", "MySQL", "Oracle", "pgAdmin", "Bash", "Backup Tools"],
    responsibilities: [
      "Install, upgrade and patch database systems",
      "Tune queries and manage performance",
      "Implement backup and recovery procedures",
      "Manage access control and audits",
    ],
    salaryRange: "$75k – $135k",
    outlook: "Stable demand (≈8% through 2033)",
  },
  {
    id: "ui-ux-designer",
    title: "UI/UX Designer",
    description:
      "Designs intuitive, accessible and visually appealing digital experiences grounded in user research.",
    requiredTechnicalSkills: ["Figma", "Prototyping", "User Research", "HTML", "CSS", "Design Systems"],
    requiredSoftSkills: ["Creativity", "Communication", "Empathy", "Attention to Detail"],
    recommendedExperience: "1–4 years designing digital products; portfolio required.",
    technologies: ["Figma", "Adobe XD", "Sketch", "Storybook", "Maze", "Tailwind CSS"],
    responsibilities: [
      "Run user research and usability testing",
      "Create wireframes, prototypes and visual designs",
      "Build and maintain design systems",
      "Partner closely with engineering on handoff",
    ],
    salaryRange: "$70k – $130k",
    outlook: "Steady growth (≈10% through 2033)",
  },
];

export function getCareer(id: string | null | undefined): Career | undefined {
  if (!id) return undefined;
  return CAREERS.find((c) => c.id === id);
}
