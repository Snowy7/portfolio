export interface Project {
  title: string;
  description: string;
  tags: string[];
  image: string;
  link: string;
  github: string;
}

export interface Skill {
  name: string;
  level: number; // 0-100
  category: string;
}

export interface Experience {
  role: string;
  company: string;
  period: string;
  description: string;
}

export const profile = {
  name: "Islam",
  title: "Full Stack Web Developer",
  tagline: "Building elegant digital experiences from front to back.",
  bio: "I'm a passionate full-stack developer with 5+ years of experience crafting performant, accessible web applications. I love turning complex problems into simple, beautiful solutions. When I'm not coding, you'll find me exploring new technologies and contributing to open source.",
  email: "islam@example.dev",
  github: "https://github.com/islam",
  linkedin: "https://linkedin.com/in/islam",
  twitter: "https://twitter.com/islam_dev",
  location: "Remote / Worldwide",
  avatar: "https://api.dicebear.com/9.x/initials/svg?seed=Islam&backgroundColor=0f172a&textColor=f8fafc&fontSize=40",
};

export const projects: Project[] = [
  {
    title: "CloudSync Dashboard",
    description:
      "A real-time cloud infrastructure monitoring dashboard with live metrics, alerting, and team collaboration features. Built with React, Node.js, and WebSockets.",
    tags: ["React", "Node.js", "WebSocket", "PostgreSQL", "Docker"],
    image: "https://picsum.photos/seed/cloudsync/800/500",
    link: "https://cloudsync.example.dev",
    github: "https://github.com/islam/cloudsync",
  },
  {
    title: "ShopFlow E-Commerce",
    description:
      "A full-featured e-commerce platform with cart management, Stripe payments, admin panel, and inventory tracking. Handles 10k+ daily transactions.",
    tags: ["Next.js", "TypeScript", "Stripe", "MongoDB", "Redis"],
    image: "https://picsum.photos/seed/shopflow/800/500",
    link: "https://shopflow.example.dev",
    github: "https://github.com/islam/shopflow",
  },
  {
    title: "DevConnect Social",
    description:
      "A developer-focused social platform for sharing code snippets, articles, and collaborating on projects. Features real-time chat and markdown support.",
    tags: ["Vue.js", "Express", "Socket.io", "MySQL", "AWS"],
    image: "https://picsum.photos/seed/devconnect/800/500",
    link: "https://devconnect.example.dev",
    github: "https://github.com/islam/devconnect",
  },
  {
    title: "TaskForge PM Tool",
    description:
      "An agile project management tool with Kanban boards, sprint planning, time tracking, and automated reporting for development teams.",
    tags: ["Angular", "NestJS", "GraphQL", "PostgreSQL", "Terraform"],
    image: "https://picsum.photos/seed/taskforge/800/500",
    link: "https://taskforge.example.dev",
    github: "https://github.com/islam/taskforge",
  },
  {
    title: "HealthPulse API",
    description:
      "A RESTful API platform for healthcare data management, supporting FHIR standards, real-time patient monitoring, and secure data exchange.",
    tags: ["Python", "FastAPI", "Docker", "Kubernetes", "GCP"],
    image: "https://picsum.photos/seed/healthpulse/800/500",
    link: "https://healthpulse.example.dev",
    github: "https://github.com/islam/healthpulse",
  },
  {
    title: "BudgetWise Finance",
    description:
      "A personal finance tracker with AI-powered spending insights, budget planning, and visual analytics. Integrates with major banking APIs.",
    tags: ["Svelte", "Go", "TensorFlow", "PostgreSQL", "Plaid"],
    image: "https://picsum.photos/seed/budgetwise/800/500",
    link: "https://budgetwise.example.dev",
    github: "https://github.com/islam/budgetwise",
  },
];

export const skills: Skill[] = [
  { name: "TypeScript", level: 95, category: "Languages" },
  { name: "JavaScript", level: 95, category: "Languages" },
  { name: "Python", level: 85, category: "Languages" },
  { name: "Go", level: 70, category: "Languages" },
  { name: "React", level: 92, category: "Frontend" },
  { name: "Vue.js", level: 90, category: "Frontend" },
  { name: "Next.js", level: 88, category: "Frontend" },
  { name: "Tailwind CSS", level: 93, category: "Frontend" },
  { name: "Node.js", level: 90, category: "Backend" },
  { name: "Express", level: 88, category: "Backend" },
  { name: "NestJS", level: 80, category: "Backend" },
  { name: "GraphQL", level: 82, category: "Backend" },
  { name: "PostgreSQL", level: 87, category: "Database" },
  { name: "MongoDB", level: 85, category: "Database" },
  { name: "Redis", level: 78, category: "Database" },
  { name: "Docker", level: 85, category: "DevOps" },
  { name: "AWS", level: 80, category: "DevOps" },
  { name: "CI/CD", level: 82, category: "DevOps" },
];

export const experience: Experience[] = [
  {
    role: "Senior Full Stack Developer",
    company: "TechNova Solutions",
    period: "2023 - Present",
    description:
      "Leading a team of 6 developers building enterprise SaaS products. Architected microservices handling 2M+ requests/day. Reduced deployment time by 70% through CI/CD optimization.",
  },
  {
    role: "Full Stack Developer",
    company: "DigitalCraft Agency",
    period: "2021 - 2023",
    description:
      "Built 20+ client projects ranging from e-commerce platforms to healthcare dashboards. Introduced automated testing practices, achieving 90%+ code coverage across projects.",
  },
  {
    role: "Frontend Developer",
    company: "StartupHub Inc.",
    period: "2020 - 2021",
    description:
      "Developed responsive web applications using React and Vue.js. Improved Core Web Vitals scores by 40% through performance optimization and modern build tooling.",
  },
];

export const skillCategories = [...new Set(skills.map((s) => s.category))];

export interface BlogPost {
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  tags: string[];
  slug: string;
}

export const blogPosts: BlogPost[] = [
  {
    title: "Why I Switched from REST to tRPC (and When I Didn't)",
    excerpt:
      "After years of building REST APIs, I gave tRPC a real shot on a production project. Here's what surprised me and where REST still wins.",
    date: "Feb 12, 2026",
    readTime: "6 min",
    tags: ["TypeScript", "API Design"],
    slug: "trpc-vs-rest",
  },
  {
    title: "The CSS Trick That Changed How I Build Layouts",
    excerpt:
      "One line of CSS replaced 40 lines of JavaScript in my layout system. A deep dive into modern CSS subgrid and when to reach for it.",
    date: "Jan 28, 2026",
    readTime: "4 min",
    tags: ["CSS", "Frontend"],
    slug: "css-subgrid-layouts",
  },
  {
    title: "Deploying at 2AM: Lessons from Production Incidents",
    excerpt:
      "Three war stories from real production outages, what went wrong, and the monitoring setup that now lets me sleep at night.",
    date: "Jan 10, 2026",
    readTime: "8 min",
    tags: ["DevOps", "War Stories"],
    slug: "production-incidents",
  },
  {
    title: "Building a CLI Tool in Go as a Node.js Developer",
    excerpt:
      "What happens when a JavaScript developer tries Go for the first time. Spoiler: the error handling grew on me.",
    date: "Dec 15, 2025",
    readTime: "5 min",
    tags: ["Go", "CLI"],
    slug: "go-cli-tool",
  },
];

export const interests = [
  "Open Source",
  "Mechanical Keyboards",
  "Coffee Brewing",
  "Hiking",
  "Sci-Fi Books",
  "Game Dev (hobby)",
  "Photography",
  "Chess",
];

export const currentlyDoing = {
  reading: "Designing Data-Intensive Applications",
  learning: "Rust & WebAssembly",
  building: "A real-time collaboration engine",
  listening: "Lo-fi hip hop, obviously",
};
