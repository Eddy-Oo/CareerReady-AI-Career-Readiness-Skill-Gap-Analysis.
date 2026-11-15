import type { SkillCategory } from "../types";

/**
 * Skill knowledge base used by the local NLP fallback engine.
 * Each entry maps a canonical skill name to detection aliases (lower-case).
 * The FastAPI backend uses spaCy + sentence-transformers; this table powers
 * the deterministic rule-based extractor so the demo works without a backend.
 */
export interface SkillDefinition {
  name: string;
  category: SkillCategory;
  aliases: string[];
}

export const SKILL_DB: SkillDefinition[] = [
  // Programming Languages
  {
    name: "Python",
    category: "Programming Languages",
    aliases: ["python", "python3", "py"],
  },
  {
    name: "Java",
    category: "Programming Languages",
    aliases: ["java", "java se", "javafx"],
  },
  {
    name: "JavaScript",
    category: "Programming Languages",
    aliases: ["javascript", "js", "es6", "ecmascript"],
  },
  {
    name: "TypeScript",
    category: "Programming Languages",
    aliases: ["typescript", "ts"],
  },
  {
    name: "C++",
    category: "Programming Languages",
    aliases: ["c++", "cpp", "c plus plus"],
  },
  {
    name: "C#",
    category: "Programming Languages",
    aliases: ["c#", "csharp", "c sharp", ".net", "asp.net"],
  },
  { name: "C", category: "Programming Languages", aliases: [" c ", "(c)"] },
  {
    name: "Go",
    category: "Programming Languages",
    aliases: ["golang", " go "],
  },
  { name: "Rust", category: "Programming Languages", aliases: ["rust"] },
  { name: "Kotlin", category: "Programming Languages", aliases: ["kotlin"] },
  {
    name: "Swift",
    category: "Programming Languages",
    aliases: ["swift", "swiftui"],
  },
  {
    name: "PHP",
    category: "Programming Languages",
    aliases: ["php", "laravel"],
  },
  {
    name: "Ruby",
    category: "Programming Languages",
    aliases: ["ruby", "rails", "ruby on rails"],
  },
  { name: "Scala", category: "Programming Languages", aliases: ["scala"] },
  {
    name: "R",
    category: "Programming Languages",
    aliases: [" r ", "r language", "ggplot2"],
  },
  { name: "MATLAB", category: "Programming Languages", aliases: ["matlab"] },
  { name: "Dart", category: "Programming Languages", aliases: ["dart"] },
  {
    name: "SQL",
    category: "Programming Languages",
    aliases: [
      "sql",
      "pl/sql",
      "tsql",
      "t-sql",
      "mysql",
      "postgresql",
      "sqlite",
    ],
  },
  {
    name: "Bash",
    category: "Programming Languages",
    aliases: ["bash", "shell scripting", "shell script", "linux shell"],
  },
  { name: "Perl", category: "Programming Languages", aliases: ["perl"] },
  {
    name: "Assembly",
    category: "Programming Languages",
    aliases: ["assembly", "x86 assembly"],
  },

  // Web Development
  {
    name: "HTML",
    category: "Web Development",
    aliases: ["html", "html5", "semantic html"],
  },
  {
    name: "CSS",
    category: "Web Development",
    aliases: ["css", "css3", "sass", "scss", "less"],
  },
  {
    name: "React",
    category: "Web Development",
    aliases: ["react", "react.js", "reactjs", "react js"],
  },
  {
    name: "Angular",
    category: "Web Development",
    aliases: ["angular", "angularjs"],
  },
  {
    name: "Vue.js",
    category: "Web Development",
    aliases: ["vue", "vue.js", "vuejs"],
  },
  {
    name: "Next.js",
    category: "Web Development",
    aliases: ["next.js", "nextjs", "next js"],
  },
  {
    name: "Node.js",
    category: "Web Development",
    aliases: ["node.js", "nodejs", "node js", "node"],
  },
  {
    name: "Express.js",
    category: "Web Development",
    aliases: ["express", "express.js", "expressjs"],
  },
  { name: "Django", category: "Web Development", aliases: ["django"] },
  { name: "Flask", category: "Web Development", aliases: ["flask"] },
  {
    name: "Tailwind CSS",
    category: "Web Development",
    aliases: ["tailwind", "tailwind css"],
  },
  { name: "Bootstrap", category: "Web Development", aliases: ["bootstrap"] },
  {
    name: "GraphQL",
    category: "Web Development",
    aliases: ["graphql", "apollo graphql"],
  },
  {
    name: "REST API",
    category: "Web Development",
    aliases: [
      "rest api",
      "restful",
      "rest apis",
      "rest endpoints",
      "api development",
    ],
  },
  { name: "jQuery", category: "Web Development", aliases: ["jquery"] },
  {
    name: "Webpack",
    category: "Web Development",
    aliases: ["webpack", "vite", "rollup"],
  },
  {
    name: "Redux",
    category: "Web Development",
    aliases: ["redux", "zustand", "mobx"],
  },
  { name: "Svelte", category: "Web Development", aliases: ["svelte"] },
  {
    name: "WebSockets",
    category: "Web Development",
    aliases: ["websocket", "websockets", "socket.io"],
  },

  // Mobile Development
  { name: "Flutter", category: "Mobile Development", aliases: ["flutter"] },
  {
    name: "React Native",
    category: "Mobile Development",
    aliases: ["react native", "reactnative"],
  },
  {
    name: "Android Development",
    category: "Mobile Development",
    aliases: ["android", "android studio", "android development"],
  },
  {
    name: "iOS Development",
    category: "Mobile Development",
    aliases: ["ios", "ios development", "xcode", "cocoa touch"],
  },
  { name: "Ionic", category: "Mobile Development", aliases: ["ionic"] },
  { name: "Xamarin", category: "Mobile Development", aliases: ["xamarin"] },
  {
    name: "Mobile UI Design",
    category: "Mobile Development",
    aliases: ["mobile ui", "mobile design"],
  },

  // Database
  { name: "MySQL", category: "Database", aliases: ["mysql"] },
  {
    name: "PostgreSQL",
    category: "Database",
    aliases: ["postgresql", "postgres"],
  },
  {
    name: "MongoDB",
    category: "Database",
    aliases: ["mongodb", "mongo", "mongoose"],
  },
  { name: "Redis", category: "Database", aliases: ["redis"] },
  {
    name: "Oracle Database",
    category: "Database",
    aliases: ["oracle", "oracle db", "oracle database"],
  },
  { name: "SQLite", category: "Database", aliases: ["sqlite"] },
  {
    name: "SQL Server",
    category: "Database",
    aliases: ["sql server", "mssql", "microsoft sql"],
  },
  {
    name: "Firebase",
    category: "Database",
    aliases: ["firebase", "firestore", "realtime database"],
  },
  {
    name: "Cassandra",
    category: "Database",
    aliases: ["cassandra", "apache cassandra"],
  },
  { name: "DynamoDB", category: "Database", aliases: ["dynamodb"] },
  {
    name: "Database Design",
    category: "Database",
    aliases: [
      "database design",
      "schema design",
      "data modeling",
      "er diagram",
      "normalization",
    ],
  },
  {
    name: "Data Warehousing",
    category: "Database",
    aliases: [
      "data warehouse",
      "data warehousing",
      "etl",
      "snowflake",
      "redshift",
    ],
  },

  // Data Science
  { name: "Pandas", category: "Data Science", aliases: ["pandas"] },
  { name: "NumPy", category: "Data Science", aliases: ["numpy"] },
  {
    name: "Statistics",
    category: "Data Science",
    aliases: [
      "statistics",
      "statistical analysis",
      "inferential statistics",
      "hypothesis testing",
      "probability",
    ],
  },
  {
    name: "Data Visualization",
    category: "Data Science",
    aliases: [
      "data visualization",
      "visualisation",
      "matplotlib",
      "seaborn",
      "plotly",
      "tableau",
      "power bi",
      "d3.js",
      "d3",
    ],
  },
  {
    name: "Excel",
    category: "Data Science",
    aliases: ["excel", "spreadsheets", "pivot table"],
  },
  {
    name: "Jupyter",
    category: "Data Science",
    aliases: ["jupyter", "jupyter notebook", "google colab"],
  },
  {
    name: "Feature Engineering",
    category: "Data Science",
    aliases: ["feature engineering", "feature selection"],
  },
  {
    name: "A/B Testing",
    category: "Data Science",
    aliases: ["a/b testing", "ab testing", "split testing"],
  },
  {
    name: "Data Wrangling",
    category: "Data Science",
    aliases: [
      "data wrangling",
      "data cleaning",
      "data preprocessing",
      "data transformation",
    ],
  },
  {
    name: "Scikit-learn",
    category: "Data Science",
    aliases: ["scikit-learn", "sklearn", "scikit learn"],
  },

  // Artificial Intelligence
  {
    name: "Machine Learning",
    category: "Artificial Intelligence",
    aliases: [
      "machine learning",
      "supervised learning",
      "unsupervised learning",
      "ml models",
      "regression models",
      "classification models",
    ],
  },
  {
    name: "Deep Learning",
    category: "Artificial Intelligence",
    aliases: ["deep learning", "neural networks", "cnn", "rnn", "lstm"],
  },
  {
    name: "TensorFlow",
    category: "Artificial Intelligence",
    aliases: ["tensorflow"],
  },
  {
    name: "PyTorch",
    category: "Artificial Intelligence",
    aliases: ["pytorch"],
  },
  {
    name: "NLP",
    category: "Artificial Intelligence",
    aliases: [
      "nlp",
      "natural language processing",
      "text classification",
      "tokenization",
      "spacy",
      "spaCy",
      "nltk",
    ],
  },
  {
    name: "Computer Vision",
    category: "Artificial Intelligence",
    aliases: [
      "computer vision",
      "image processing",
      "opencv",
      "object detection",
    ],
  },
  {
    name: "Generative AI",
    category: "Artificial Intelligence",
    aliases: [
      "generative ai",
      "genai",
      "gen ai",
      "large language models",
      "llm",
      "llms",
      "prompt engineering",
      "gpt",
      "transformers",
      "hugging face",
      "huggingface",
      "rag",
      "langchain",
    ],
  },
  {
    name: "Reinforcement Learning",
    category: "Artificial Intelligence",
    aliases: ["reinforcement learning", "q-learning", "policy gradient"],
  },
  {
    name: "Model Deployment",
    category: "Artificial Intelligence",
    aliases: [
      "model deployment",
      "mlops",
      "model serving",
      "mlflow",
      "model monitoring",
    ],
  },
  {
    name: "Speech Recognition",
    category: "Artificial Intelligence",
    aliases: ["speech recognition", "voice recognition", "asr"],
  },

  // Cybersecurity
  {
    name: "Network Security",
    category: "Cybersecurity",
    aliases: [
      "network security",
      "firewall",
      "ids",
      "ips",
      "vpn",
      "network monitoring",
    ],
  },
  {
    name: "Ethical Hacking",
    category: "Cybersecurity",
    aliases: [
      "ethical hacking",
      "penetration testing",
      "pen testing",
      "pentest",
      "bug bounty",
      "kali linux",
      "metasploit",
      "burp suite",
    ],
  },
  {
    name: "Cryptography",
    category: "Cybersecurity",
    aliases: ["cryptography", "encryption", "tls", "ssl", "hashing"],
  },
  {
    name: "Security Analysis",
    category: "Cybersecurity",
    aliases: [
      "security analysis",
      "siem",
      "splunk",
      "log analysis",
      "threat analysis",
      "incident response",
      "soc analyst",
    ],
  },
  {
    name: "Vulnerability Assessment",
    category: "Cybersecurity",
    aliases: [
      "vulnerability assessment",
      "vulnerability scanning",
      "nessus",
      "openvas",
      "cve",
    ],
  },
  {
    name: "IAM",
    category: "Cybersecurity",
    aliases: [
      "iam",
      "identity and access management",
      "oauth",
      "sso",
      "active directory",
    ],
  },
  {
    name: "Application Security",
    category: "Cybersecurity",
    aliases: [
      "application security",
      "appsec",
      "owasp",
      "sql injection",
      "xss",
      "secure coding",
    ],
  },
  {
    name: "Compliance",
    category: "Cybersecurity",
    aliases: ["compliance", "iso 27001", "gdpr", "nist", "soc 2"],
  },

  // Cloud Computing
  {
    name: "AWS",
    category: "Cloud Computing",
    aliases: [
      "aws",
      "amazon web services",
      "ec2",
      "s3",
      "lambda",
      "cloudformation",
    ],
  },
  {
    name: "Azure",
    category: "Cloud Computing",
    aliases: ["azure", "microsoft azure"],
  },
  {
    name: "Google Cloud",
    category: "Cloud Computing",
    aliases: ["gcp", "google cloud", "google cloud platform"],
  },
  {
    name: "Docker",
    category: "Cloud Computing",
    aliases: ["docker", "containerization", "containers"],
  },
  {
    name: "Kubernetes",
    category: "Cloud Computing",
    aliases: ["kubernetes", "k8s", "helm"],
  },
  {
    name: "Terraform",
    category: "Cloud Computing",
    aliases: ["terraform", "infrastructure as code", "iac", "pulumi"],
  },
  {
    name: "CI/CD",
    category: "Cloud Computing",
    aliases: [
      "ci/cd",
      "cicd",
      "jenkins",
      "github actions",
      "gitlab ci",
      "continuous integration",
      "continuous delivery",
      "pipeline automation",
    ],
  },
  {
    name: "Serverless",
    category: "Cloud Computing",
    aliases: ["serverless", "aws lambda", "azure functions", "cloud functions"],
  },
  {
    name: "Linux",
    category: "Cloud Computing",
    aliases: ["linux", "ubuntu", "unix", "centos"],
  },
  {
    name: "Networking",
    category: "Cloud Computing",
    aliases: [
      "networking",
      "tcp/ip",
      "dns",
      "load balancing",
      "subnetting",
      "vpc",
    ],
  },

  // Development Tools
  {
    name: "Git",
    category: "Development Tools",
    aliases: ["git", "github", "gitlab", "bitbucket", "version control"],
  },
  {
    name: "VS Code",
    category: "Development Tools",
    aliases: ["vs code", "vscode", "visual studio code"],
  },
  {
    name: "Agile/Scrum",
    category: "Development Tools",
    aliases: ["agile", "scrum", "kanban", "sprint", "jira"],
  },
  {
    name: "Testing",
    category: "Development Tools",
    aliases: [
      "unit testing",
      "integration testing",
      "jest",
      "pytest",
      "junit",
      "test-driven",
      "tdd",
      "cypress",
      "selenium",
      "testing frameworks",
    ],
  },
  {
    name: "Debugging",
    category: "Development Tools",
    aliases: ["debugging", "debugger", "profiling", "chrome devtools"],
  },
  {
    name: "DevOps",
    category: "Development Tools",
    aliases: ["devops", "sre", "site reliability"],
  },
  {
    name: "Microservices",
    category: "Development Tools",
    aliases: [
      "microservices",
      "microservices architecture",
      "service-oriented",
    ],
  },
  {
    name: "System Design",
    category: "Development Tools",
    aliases: [
      "system design",
      "software architecture",
      "design patterns",
      "scalability",
    ],
  },

  // Soft Skills
  {
    name: "Communication",
    category: "Soft Skills",
    aliases: [
      "communication",
      "communicate",
      "presentation skills",
      "public speaking",
      "technical writing",
    ],
  },
  {
    name: "Teamwork",
    category: "Soft Skills",
    aliases: [
      "teamwork",
      "team player",
      "collaboration",
      "collaborate",
      "cross-functional",
    ],
  },
  {
    name: "Leadership",
    category: "Soft Skills",
    aliases: [
      "leadership",
      "led a team",
      "mentored",
      "mentoring",
      "team lead",
      "captain",
    ],
  },
  {
    name: "Problem Solving",
    category: "Soft Skills",
    aliases: [
      "problem solving",
      "problem-solving",
      "troubleshooting",
      "analytical thinking",
    ],
  },
  {
    name: "Critical Thinking",
    category: "Soft Skills",
    aliases: ["critical thinking", "decision making", "evaluating"],
  },
  {
    name: "Time Management",
    category: "Soft Skills",
    aliases: ["time management", "prioritiz", "deadlines", "met deadlines"],
  },
  {
    name: "Adaptability",
    category: "Soft Skills",
    aliases: [
      "adaptability",
      "adapted to",
      "flexible",
      "fast-paced environment",
    ],
  },
  {
    name: "Creativity",
    category: "Soft Skills",
    aliases: ["creativity", "creative", "innovative", "innovation"],
  },
  {
    name: "Work Ethic",
    category: "Soft Skills",
    aliases: [
      "work ethic",
      "self-motivated",
      "proactive",
      "detail-oriented",
      "attention to detail",
    ],
  },
  {
    name: "Interpersonal Skills",
    category: "Soft Skills",
    aliases: [
      "interpersonal",
      "stakeholder",
      "client-facing",
      "customer service",
    ],
  },

  {
    name: "Data Analysis",
    category: "Data Science",
    aliases: ["data analysis", "data analytics"],
  },
  {
    name: "Troubleshooting",
    category: "Development Tools",
    aliases: ["troubleshooting", "troubleshoot"],
  },
  {
    name: "Software Deployment",
    category: "Development Tools",
    aliases: ["software deployment", "software rollout", "software rollouts"],
  },
];

/** Word-boundary-safe matcher for an alias inside raw text (lower-cased). */
export function aliasMatches(textLower: string, alias: string): boolean {
  const a = alias.trim().toLowerCase();
  if (!a) return false;
  if (a.startsWith(" ") || a.endsWith(" ")) {
    return textLower.includes(a);
  }
  const escaped = a
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\//g, "\\/");
  const re = new RegExp(`(?<![a-z0-9+#])${escaped}(?![a-z0-9+#])`, "i");
  return re.test(textLower);
}
