export type PhraseMap = { phrases: string[]; value: string };

export const COMPANY_TRAIT_SIGNALS: PhraseMap[] = [
  {
    phrases: [
      "ownership",
      "own your work",
      "take ownership",
      "owner mindset",
      "you own",
      "personal ownership",
    ],
    value: "ownership mindset",
  },
  {
    phrases: [
      "autonomous",
      "self-directed",
      "independent",
      "autonomy",
      "self-starter",
      "self-managed",
    ],
    value: "autonomy",
  },
  {
    phrases: [
      "small team",
      "lean team",
      "startup",
      "early stage",
      "fast-growing",
      "seed stage",
      "series a",
      "series b",
      "fast-paced",
      "high-growth",
    ],
    value: "startup adaptability",
  },
  {
    phrases: [
      "cross-functional",
      "cross functional",
      "collaborate across teams",
      "work with designers",
      "work with product",
      "multidisciplinary",
    ],
    value: "cross-functional collaboration",
  },
  {
    phrases: [
      "mentoring",
      "mentor developers",
      "coaching",
      "grow the team",
      "develop junior",
      "technical leadership",
      "lead engineers",
      "engineering mentor",
    ],
    value: "engineering leadership",
  },
  {
    phrases: [
      "long-term",
      "sustainable",
      "maintainability",
      "maintainable",
      "technical debt",
      "clean code",
      "code quality",
      "engineering excellence",
    ],
    value: "long-term engineering mindset",
  },
  {
    phrases: [
      "user-centric",
      "customer focus",
      "user experience",
      "product impact",
      "product mindset",
      "outcome-driven",
      "value for users",
      "customer success",
    ],
    value: "product mindset",
  },
  {
    phrases: [
      "core platform",
      "developer experience",
      "devex",
      "internal tools",
      "developer productivity",
    ],
    value: "platform engineering",
  },
  {
    phrases: [
      "scale",
      "scalable",
      "high-traffic",
      "millions of users",
      "high availability",
      "distributed",
      "high performance",
    ],
    value: "scale-focused engineering",
  },
  {
    phrases: [
      "accessibility",
      "a11y",
      "wcag",
      "inclusive design",
      "screen reader",
      "keyboard navigation",
    ],
    value: "accessibility focus",
  },
  {
    phrases: [
      "performance",
      "optimization",
      "core web vitals",
      "lighthouse",
      "rendering performance",
      "bundle size",
    ],
    value: "performance engineering",
  },
  {
    phrases: [
      "collaborative culture",
      "great team culture",
      "open and inclusive",
      "diverse team",
      "supportive environment",
      "flat hierarchy",
    ],
    value: "collaborative culture",
  },
];

export const ENGINEERING_CULTURE_SIGNALS: PhraseMap[] = [
  {
    phrases: [
      "ci/cd",
      "continuous integration",
      "continuous deployment",
      "github actions",
      "jenkins",
      "pipelines",
    ],
    value: "engineering maturity (CI/CD culture)",
  },
  {
    phrases: ["code review", "pull request", "pr process", "pair programming"],
    value: "collaborative code quality practices",
  },
  {
    phrases: [
      "tdd",
      "test-driven",
      "testing culture",
      "well-tested",
      "test coverage",
      "automated testing",
    ],
    value: "test-first engineering culture",
  },
  {
    phrases: ["microservices", "service-oriented", "event-driven", "event sourcing"],
    value: "distributed systems mindset",
  },
  {
    phrases: ["documentation", "design docs", "rfcs", "architectural decision", "runbooks"],
    value: "documentation culture",
  },
  {
    phrases: ["open source", "contribute to oss", "inner source", "open-source"],
    value: "open source culture",
  },
  {
    phrases: ["agile", "scrum", "sprint", "kanban", "lean methodology"],
    value: "agile delivery process",
  },
  {
    phrases: [
      "observability",
      "monitoring",
      "logging",
      "tracing",
      "alerting",
      "on-call",
      "sre",
      "site reliability",
    ],
    value: "production excellence mindset",
  },
];

export const INFERRED_PRIORITY_SIGNALS: PhraseMap[] = [
  {
    phrases: [
      "frontend",
      "front-end",
      "ui development",
      "user interface",
      "react developer",
      "next.js",
      "vue developer",
      "web components",
    ],
    value: "frontend craft",
  },
  {
    phrases: [
      "backend",
      "back-end",
      "api development",
      "server-side",
      "node.js developer",
      "python developer",
      "microservice",
      "rest api",
      "graphql backend",
    ],
    value: "backend engineering",
  },
  {
    phrases: [
      "full-stack",
      "fullstack",
      "end-to-end engineering",
      "across the stack",
      "both frontend and backend",
    ],
    value: "full-stack delivery",
  },
  {
    phrases: [
      "machine learning",
      "ml engineer",
      "ai engineer",
      "data science",
      "deep learning",
      "llm",
      "large language model",
      "nlp",
      "computer vision",
    ],
    value: "AI/ML engineering",
  },
  {
    phrases: [
      "mobile",
      "ios developer",
      "android developer",
      "react native",
      "flutter",
      "native app",
    ],
    value: "mobile engineering",
  },
  {
    phrases: [
      "infrastructure",
      "devops",
      "sre",
      "platform engineer",
      "kubernetes",
      "docker",
      "terraform",
      "cloud architect",
    ],
    value: "infrastructure and DevOps",
  },
  {
    phrases: [
      "lead engineer",
      "tech lead",
      "senior engineer",
      "principal engineer",
      "staff engineer",
      "engineering manager",
      "head of engineering",
    ],
    value: "technical leadership",
  },
  {
    phrases: [
      "product engineer",
      "growth engineering",
      "user acquisition",
      "conversion",
      "a/b testing",
      "retention",
    ],
    value: "product-focused delivery",
  },
];
