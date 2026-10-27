// The CV's content, one field per fact; the page is src/pages/cv.astro and
// the pieces src/components/cv/. the PDF in Colin's notes is the other copy of these facts.

export const name = "Colin Cheung";
export const role =
  "Senior Software Engineer · Technical Lead · Glasgow, UK · remote";
export const lede =
  "Senior engineer who leads projects end to end as a hands-on IC, from solo delivery to technical lead for 3–4 engineer sub-teams, on EDF Energy's debt platform (1.6M accounts a day). Nine years across energy, media and travel, strongest in TypeScript/Node.js and event-driven AWS serverless. Known for simplifying architecture, shortening feedback loops and making teams measurably faster with AI-assisted development.";

export const contact = [
  { label: "colincheung25@gmail.com", href: "mailto:colincheung25@gmail.com" },
  {
    label: "linkedin.com/in/colin-cheung",
    href: "https://www.linkedin.com/in/colin-cheung/",
  },
  { label: "github.com/ColinCee", href: "https://github.com/ColinCee" },
];

export type Point = { pre: string; hl?: string; post?: string };
export type Ym = { mon: string; yr: string };
export type Role = {
  id: string;
  co: string;
  pos: string;
  contract?: boolean;
  from: Ym;
  to?: Ym;
  current?: boolean;
  result: string;
  ctx: string;
  points: Point[];
  stack: string[];
};

export const experience: Role[] = [
  {
    id: "edf",
    co: "EDF Energy",
    result: "1.6M accounts a day",
    pos: "Senior Software Engineer",
    contract: true,
    from: { mon: "Apr", yr: "2023" },
    current: true,
    ctx: "Hands-on technical lead on the Retail/Debt platform.",
    points: [
      {
        pre: "Senior engineer on the 8-person Retail/Debt team: technical lead for project sub-teams of three or four, and the team's lead on engineering standards and technical direction, on a platform processing ",
        hl: "1.6M accounts daily",
        post: ".",
      },
      {
        pre: "Initiated and led the move from service-owned staging tables and event handlers to an event-sourced shared-state model: ",
        hl: "every account change is now auditable",
        post: ", day-to-day operations and incident investigation are simpler, and new services build on one source of truth instead of a distributed monolith.",
      },
      {
        pre: "Migrated a large monorepo from AWS CodePipeline to GitHub Actions with Turborepo, ",
        hl: "cutting build and test cycles from 30 → 5 minutes",
        post: ".",
      },
      {
        pre: "Led AI-assisted development adoption (Copilot, reusable agent skills, repository instructions, PR review experiments). Proof point: a like-for-like workflow project shipped with ",
        hl: "3 engineers in 1 month; the previous one took 6 engineers 2 months",
        post: ".",
      },
      {
        pre: "Built operational visibility from scratch: business metrics and structured logs into Dynatrace with dashboards for health, resilience and failure patterns, plus a Bolt.js Slack bot reporting batch-job status in real time from the event stream.",
      },
      {
        pre: "Raised team standards through TypeScript migration patterns, Zod runtime validation and documented examples; automated DynamoDB backup policies, ",
        hl: "cutting storage spend",
        post: ".",
      },
    ],
    stack: [
      "TypeScript",
      "Node.js",
      "Python",
      "AWS Lambda",
      "EventBridge",
      "DynamoDB",
      "GitHub Actions",
      "Turborepo",
      "Terraform",
    ],
  },
  {
    id: "bbc",
    co: "BBC",
    result: "CI-log digging, up to −90%",
    pos: "Senior Software Engineer",
    contract: true,
    from: { mon: "Nov", yr: "2022" },
    to: { mon: "Apr", yr: "2023" },
    ctx: "Developer tooling for a BBC engineering team.",
    points: [
      {
        pre: "Built a serverless AWS CDK pipeline tracking build-failure statistics, giving the team data to target CI/CD improvements.",
      },
      {
        pre: "Automated pull-request coverage reporting, ",
        hl: "cutting time spent digging through CI logs by up to 90%",
        post: ".",
      },
    ],
    stack: ["Node.js", "React", "AWS CDK", "Serverless"],
  },
  {
    id: "hopper",
    co: "Hopper",
    result: "100k+ requests a day",
    pos: "Senior Software Engineer",
    from: { mon: "Mar", yr: "2022" },
    to: { mon: "Oct", yr: "2022" },
    ctx: "Backend services for post-booking customer support.",
    points: [
      {
        pre: "Shipped cross-vertical VIP support in the post-booking journey, ",
        hl: "increasing related-service visibility by 200%",
        post: ".",
      },
      {
        pre: "Built Scala microservices handling ",
        hl: "100k+ daily requests",
        post: " with multi-tenant workflows over gRPC and Pub/Sub, plus Terraform-managed Datadog SLOs and alerts.",
      },
    ],
    stack: [
      "Scala",
      "GCP",
      "Kubernetes",
      "gRPC",
      "Pub/Sub",
      "Terraform",
      "Datadog",
    ],
  },
  {
    id: "hometree",
    co: "Hometree",
    result: "Checkout flow, led end to end",
    pos: "Senior Software Engineer",
    from: { mon: "Jun", yr: "2021" },
    to: { mon: "Mar", yr: "2022" },
    ctx: "Full-stack lead in a fast-moving home-services startup.",
    points: [
      {
        pre: "Led the React and TypeScript redesign of a business-critical checkout flow, and introduced Cypress E2E testing, CloudWatch alarms, Buildkite CI/CD, RDS Proxy and MikroORM.",
      },
    ],
    stack: ["React", "TypeScript", "Node.js", "AWS", "Cypress", "Buildkite"],
  },
  {
    id: "skyscanner",
    co: "Skyscanner",
    result: "8 h sync → 2 min",
    pos: "Software Engineer",
    from: { mon: "Feb", yr: "2020" },
    to: { mon: "Apr", yr: "2021" },
    ctx: "HR automation and internal tooling.",
    points: [
      {
        pre: "Built Lambda/SQS automation syncing HRMS data to Active Directory, ",
        hl: "cutting sync time from 8 hours → 2 minutes",
        post: "; built a serverless Slack bot for interactive employee feedback.",
      },
    ],
    stack: ["Python", "React", "AWS Lambda", "SQS", "Docker"],
  },
  {
    id: "podfather",
    co: "PodFather",
    result: "10k+ drivers",
    pos: "Software Engineer",
    from: { mon: "Jul", yr: "2017" },
    to: { mon: "Feb", yr: "2020" },
    ctx: "Android and backend for an electronic proof-of-delivery platform.",
    points: [
      {
        pre: "Developed Android and backend features for a platform used by ",
        hl: "10k+ drivers",
        post: "; improved image capture performance by 300% and migrated terabytes of image data from MySQL to AWS S3.",
      },
    ],
    stack: ["PHP", "Android", "MySQL", "TypeScript", "Node.js", "Docker"],
  },
];

export const skills: { label: string; items: string[] }[] = [
  {
    label: "Languages & runtimes",
    items: ["TypeScript", "Node.js", "Python", "Scala", "SQL"],
  },
  {
    label: "AWS & cloud",
    items: [
      "Lambda",
      "API Gateway",
      "EventBridge",
      "SQS",
      "DynamoDB",
      "CDK",
      "Terraform",
      "Docker",
      "Cloudflare",
    ],
  },
  {
    label: "Architecture",
    items: [
      "Event-driven",
      "Event sourcing",
      "Distributed workflows",
      "REST",
      "gRPC",
    ],
  },
  {
    label: "Delivery & ops",
    items: [
      "GitHub Actions",
      "Turborepo",
      "CI/CD",
      "Dynatrace",
      "Datadog",
      "Grafana",
      "Prometheus",
      "Loki",
    ],
  },
  {
    label: "AI-assisted engineering",
    items: [
      "GitHub Copilot",
      "Claude Code",
      "Agent skills",
      "Repository instructions",
      "Gemini API",
    ],
  },
  {
    label: "Frontend & testing",
    items: [
      "React",
      "Astro",
      "Vite",
      "Tailwind",
      "Playwright",
      "Cypress",
      "Vitest",
    ],
  },
];

export const education = {
  school: "University of Strathclyde",
  meta: "Glasgow, UK · 2013–2018",
  degree: "BEng Computer & Electronic Systems",
  honours: "1st Class Honours",
  note: "Dissertation on reinforcement learning for video games: DQN, Double DQN, prioritised experience replay and dueling networks in GVGAI.",
};

export const projects = [
  {
    name: "anki-chinese",
    href: "https://github.com/ColinCee/anki-chinese",
    desc: "Python CLI and terminal UI (~20k lines, 55 test files) that builds Anki decks from canonical character data: pinyin and jyutping generation, Gemini-generated example sentences, pluggable TTS providers with rate limiting and retries, and preview-first live card activation over AnkiConnect. Built for my own Mandarin study.",
    stack: "Python · Typer · Textual · Gemini · AnkiConnect",
  },
  {
    name: "colincheung.dev",
    href: "https://github.com/ColinCee/astro-blog",
    desc: "This site: Astro on Cloudflare Workers with GitHub Actions deploys. Writing on real problems, including shrinking a 4.5 GB JSONL dataset to 221 MB with Parquet and cutting ts-jest test times.",
    stack: "Astro · Cloudflare Workers · GitHub Actions",
  },
];
