import type { ExtractedKeywords } from "./types";

const HARD_SKILLS: Record<string, string> = {
  // Languages
  typescript: "TypeScript",
  javascript: "JavaScript",
  python: "Python",
  java: "Java",
  kotlin: "Kotlin",
  swift: "Swift",
  "c#": "C#",
  "c++": "C++",
  golang: "Go",
  go: "Go",
  rust: "Rust",
  ruby: "Ruby",
  php: "PHP",
  scala: "Scala",
  // Frontend
  react: "React",
  "react.js": "React",
  reactjs: "React",
  "next.js": "Next.js",
  nextjs: "Next.js",
  vue: "Vue.js",
  "vue.js": "Vue.js",
  vuejs: "Vue.js",
  angular: "Angular",
  svelte: "Svelte",
  "three.js": "Three.js",
  threejs: "Three.js",
  // Backend
  "node.js": "Node.js",
  nodejs: "Node.js",
  express: "Express",
  fastapi: "FastAPI",
  django: "Django",
  spring: "Spring",
  laravel: "Laravel",
  trpc: "tRPC",
  graphql: "GraphQL",
  "rest api": "REST API",
  restful: "REST API",
  grpc: "gRPC",
  // Databases
  postgresql: "PostgreSQL",
  postgres: "PostgreSQL",
  mysql: "MySQL",
  mongodb: "MongoDB",
  sqlite: "SQLite",
  redis: "Redis",
  elasticsearch: "Elasticsearch",
  dynamodb: "DynamoDB",
  // Cloud / Infra
  aws: "AWS",
  azure: "Azure",
  gcp: "GCP",
  "google cloud": "GCP",
  docker: "Docker",
  kubernetes: "Kubernetes",
  k8s: "Kubernetes",
  terraform: "Terraform",
  "ci/cd": "CI/CD",
  cicd: "CI/CD",
  jenkins: "Jenkins",
  "github actions": "GitHub Actions",
  // Mobile
  "react native": "React Native",
  flutter: "Flutter",
  android: "Android",
  ios: "iOS",
  // Testing
  jest: "Jest",
  cypress: "Cypress",
  playwright: "Playwright",
  pytest: "pytest",
  junit: "JUnit",
  // Tools & practices
  git: "Git",
  agile: "Agile",
  scrum: "Scrum",
  jira: "Jira",
  figma: "Figma",
  storybook: "Storybook",
  webpack: "Webpack",
  vite: "Vite",
  // Data / AI
  sql: "SQL",
  "machine learning": "Machine Learning",
  ml: "Machine Learning",
  "deep learning": "Deep Learning",
  nlp: "NLP",
  "natural language processing": "NLP",
  pandas: "Pandas",
  numpy: "NumPy",
  tensorflow: "TensorFlow",
  pytorch: "PyTorch",
  // Architecture
  microservices: "Microservices",
  "micro-services": "Microservices",
  "event-driven": "Event-Driven Architecture",
  serverless: "Serverless",
  "design patterns": "Design Patterns",
  "solid principles": "SOLID Principles",
  tdd: "TDD",
  "test-driven": "TDD",
  ddd: "DDD",
  "domain-driven": "DDD",
};

const SOFT_SKILLS: Record<string, string> = {
  communication: "Communication",
  leadership: "Leadership",
  teamwork: "Teamwork",
  "team player": "Teamwork",
  collaboration: "Collaboration",
  "problem solving": "Problem Solving",
  "problem-solving": "Problem Solving",
  analytical: "Analytical Thinking",
  "critical thinking": "Critical Thinking",
  mentoring: "Mentoring",
  mentorship: "Mentoring",
  coaching: "Coaching",
  initiative: "Initiative",
  proactive: "Proactive",
  adaptable: "Adaptability",
  adaptability: "Adaptability",
  ownership: "Ownership",
  "attention to detail": "Attention to Detail",
  "self-motivated": "Self-Motivated",
  organized: "Organized",
  "time management": "Time Management",
  creativity: "Creativity",
  innovative: "Innovation",
  innovation: "Innovation",
  "cross-functional": "Cross-Functional Collaboration",
  stakeholders: "Stakeholder Management",
  "stakeholder management": "Stakeholder Management",
};

const DOMAINS: Record<string, string> = {
  fintech: "FinTech",
  "financial technology": "FinTech",
  finance: "Finance",
  banking: "Banking",
  healthcare: "Healthcare",
  ecommerce: "E-Commerce",
  "e-commerce": "E-Commerce",
  saas: "SaaS",
  "b2b": "B2B",
  "b2c": "B2C",
  logistics: "Logistics",
  edtech: "EdTech",
  "media & entertainment": "Media & Entertainment",
  marketplace: "Marketplace",
  "public sector": "Public Sector",
  government: "Public Sector",
  startup: "Startup",
  enterprise: "Enterprise",
  cybersecurity: "Cybersecurity",
  security: "Security",
};

const SENIORITY: Record<string, string> = {
  junior: "Junior",
  senior: "Senior",
  "senior-level": "Senior",
  lead: "Lead",
  "tech lead": "Tech Lead",
  principal: "Principal",
  staff: "Staff Engineer",
  architect: "Architect",
  manager: "Engineering Manager",
  "engineering manager": "Engineering Manager",
  "head of": "Head of Engineering",
  vp: "VP Engineering",
  "vice president": "VP Engineering",
  mid: "Mid-Level",
  "mid-level": "Mid-Level",
};

const WORK_MODE: Record<string, string> = {
  remote: "Remote",
  "fully remote": "Remote",
  hybrid: "Hybrid",
  "on-site": "On-Site",
  onsite: "On-Site",
  "in-office": "On-Site",
  "part-time": "Part-Time",
  "full-time": "Full-Time",
  contract: "Contract",
  freelance: "Freelance",
};

const LANGUAGES: Record<string, string> = {
  english: "English",
  german: "German",
  deutsch: "German",
  french: "French",
  spanish: "Spanish",
  "bilingual": "Bilingual",
  "native speaker": "Native Speaker",
  fluent: "Fluent",
  "c1": "C1",
  "c2": "C2",
  "b2": "B2",
};

function matchDict(text: string, dict: Record<string, string>): string[] {
  const found = new Set<string>();
  for (const [alias, canonical] of Object.entries(dict)) {
    const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`(?<![a-z0-9])${escaped}(?![a-z0-9])`, "gi");
    if (pattern.test(text)) {
      found.add(canonical);
    }
  }
  return Array.from(found).sort();
}

export function extractJobKeywords(jobDescription: string): ExtractedKeywords {
  const text = jobDescription.toLowerCase();
  return {
    hardSkills: matchDict(text, HARD_SKILLS),
    softSkills: matchDict(text, SOFT_SKILLS),
    domains: matchDict(text, DOMAINS),
    seniority: matchDict(text, SENIORITY),
    workMode: matchDict(text, WORK_MODE),
    languages: matchDict(text, LANGUAGES),
  };
}
