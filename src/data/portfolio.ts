export interface ProjectLink {
  label: string;
  url: string;
}

export interface Project {
  title: string;
  description: string;
  tags: string[];
  image: string;
  links: ProjectLink[];
  status: string;
  role: string;
  year: number;
  featured: boolean;
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
  location: string;
  description: string;
  logo?: string;
}

export const profile = {
  name: "Islam Azzam",
  title: "Software Developer & Network Engineer",
  tagline:
    "Building crisp systems across web, apps, games, and telecommunications.",
  bio: "Network & Telecom Engineering student with extensive experience in software development, game design, and embedded systems. 50+ projects spanning multiplayer games, autonomous vehicles, and full-stack applications. Led an autonomous vehicle to 2nd place at Shell Eco-Marathon Poland 2025.",
  email: "snowydev7@gmail.com",
  github: "https://github.com/Snowy7",
  linkedin: "https://www.linkedin.com/in/islam-azzam-6a3449205/",
  twitter: "https://twitter.com/snowy7x",
  medium: "https://medium.com/@snowy7",
  itch: "https://snowy7.itch.io",
  location: "Doha, Qatar",
  phone: "+974 74479336",
  university: "University of Doha for Science and Technology (UDST)",
  degree: "B.Sc. Electrical Engineering — Telecom & Networks",
};

export const projects: Project[] = [
  {
    title: "The Cube",
    description:
      "Cooperative FPS where up to 4 players infiltrate procedurally generated office complexes in a high-stakes virtual heist. Dual timer system, reputation mechanics, and Steam integration.",
    tags: ["Unity", "C#", "Multiplayer", "Steam", "Procedural Generation"],
    image: "/images/projects/the-cube/cover.png",
    links: [
      { label: "Steam", url: "https://store.steampowered.com/app/3148890" },
    ],
    status: "In Development",
    role: "Project Leader & Lead Programmer",
    year: 2024,
    featured: true,
  },
  {
    title: "Shell Eco-Marathon — 2nd Place",
    description:
      "Autonomous Urban Concept vehicle that secured 2nd place at Shell Eco-Marathon Poland 2025. Full navigation, LiDAR obstacle avoidance, and precision parking with ±5cm accuracy.",
    tags: ["Python", "C++", "ROS2", "LiDAR", "JETSON AGX"],
    image: "/images/projects/shell-eco/cover.webp",
    links: [
      {
        label: "Competition",
        url: "https://www.shellecomarathon.com/2025-programme/autonomous-urban-concept.html",
      },
    ],
    status: "Completed",
    role: "Autonomous Team Leader",
    year: 2025,
    featured: true,
  },
  {
    title: "Celestial Escape",
    description:
      "3-day game jam project that won Best Quality award at Spoilz Game Studio jam. Space-themed puzzle adventure with polished mechanics, visuals, and audio.",
    tags: ["Unity", "C#", "Shader Graph", "Game Jam"],
    image: "/images/projects/celestial-escape/cover.png",
    links: [{ label: "Play", url: "https://imhorror.itch.io/ce" }],
    status: "Completed",
    role: "Game Developer",
    year: 2023,
    featured: true,
  },
  {
    title: "Body Parts",
    description:
      "Solo game jam entry that swept all major awards — Best Polish, Best Theme, and Most Fun at SGN Game Jam. Creative body-swapping mechanic with comedic elements.",
    tags: ["Unity", "C#", "2D Animation", "Solo Dev"],
    image: "/images/projects/body-parts/cover.png",
    links: [
      { label: "Play", url: "https://snowy7.itch.io/body-parts" },
    ],
    status: "Completed",
    role: "Solo Developer",
    year: 2022,
    featured: true,
  },
  {
    title: "Handyman Service App",
    description:
      "Three-module service platform: user app for ordering services, worker app for fulfillment, and admin dashboard for management. Real-time matching and payment integration.",
    tags: ["React Native", "Node.js", "MongoDB", "Firebase"],
    image: "/images/projects/handyman/cover.jpg",
    links: [],
    status: "Completed",
    role: "Full Stack Developer",
    year: 2023,
    featured: true,
  },
  {
    title: "Bright Future Website",
    description:
      "Modern corporate landing page with responsive design, smooth Framer Motion animations, and professional presentation. SEO optimized.",
    tags: ["Next.js", "React", "Tailwind", "Framer Motion"],
    image: "/images/projects/brightfuture/cover.png",
    links: [{ label: "Live", url: "https://brightfuture.qa" }],
    status: "Live",
    role: "Web Developer",
    year: 2023,
    featured: false,
  },
  {
    title: "SGN Website",
    description:
      "Landing page for Saudi Game Network featuring event listings, workshop info, and community showcase. Gaming-themed dark mode design.",
    tags: ["Next.js", "React", "Tailwind", "TypeScript"],
    image: "/images/projects/sgn/cover.png",
    links: [{ label: "Live", url: "https://saad-gn.netlify.app/" }],
    status: "Live",
    role: "Web Developer",
    year: 2024,
    featured: false,
  },
  {
    title: "Almanadeeb Website",
    description:
      "Corporate landing page with professional design, service portfolio, contact form integration, and multi-language support (Arabic/English).",
    tags: ["Next.js", "React", "Tailwind", "TypeScript"],
    image: "/images/projects/almanadeeb/cover.png",
    links: [{ label: "Live", url: "https://almanadeeb.com" }],
    status: "Live",
    role: "Web Developer",
    year: 2023,
    featured: false,
  },
];

export const skills: Skill[] = [
  // Programming Languages
  { name: "C#", level: 95, category: "Languages" },
  { name: "JavaScript", level: 95, category: "Languages" },
  { name: "Python", level: 90, category: "Languages" },
  { name: "C++", level: 80, category: "Languages" },
  { name: "Java", level: 75, category: "Languages" },
  { name: "SQL", level: 80, category: "Languages" },
  // Game Development
  { name: "Unity", level: 95, category: "Game Dev" },
  { name: "Multiplayer Systems", level: 90, category: "Game Dev" },
  { name: "Shader Programming", level: 85, category: "Game Dev" },
  { name: "Game Design", level: 85, category: "Game Dev" },
  { name: "Physics Simulation", level: 80, category: "Game Dev" },
  // Web Development
  { name: "React / Next.js", level: 90, category: "Web" },
  { name: "Node.js", level: 90, category: "Web" },
  { name: "Tailwind CSS", level: 85, category: "Web" },
  { name: "HTML & CSS", level: 95, category: "Web" },
  { name: "RESTful APIs", level: 85, category: "Web" },
  // Engineering
  { name: "Embedded Systems", level: 85, category: "Engineering" },
  { name: "Autonomous Systems", level: 85, category: "Engineering" },
  { name: "LiDAR / Sensors", level: 80, category: "Engineering" },
  { name: "ROS2", level: 75, category: "Engineering" },
  { name: "Circuit Design", level: 75, category: "Engineering" },
  // Tools
  { name: "Git & GitHub", level: 90, category: "Tools" },
  { name: "Docker", level: 80, category: "Tools" },
  { name: "React Native", level: 80, category: "Tools" },
  { name: "Firebase", level: 75, category: "Tools" },
];

export const experience: Experience[] = [
  {
    role: "Project Leader & Lead Programmer",
    company: "Limeless Inc.",
    period: "Sep 2023 — Present",
    location: "KSA (Remote)",
    description:
      "Leading development of multiplayer FPS 'The Cube' for Steam. Architected multiplayer networking with client-server architecture, created custom tools pipeline, and led team coordination for the flagship title.",
    logo: "/images/companies/limeless.jpg",
  },
  {
    role: "Autonomous Team Leader",
    company: "Shell Eco-Marathon (UDST Team)",
    period: "Nov 2024 — Jul 2025",
    location: "Poland",
    description:
      "Led autonomous systems to 2nd place at Shell Eco-Marathon Poland 2025. Developed algorithms for navigation, obstacle avoidance, and parking. Integrated LiDAR and ultrasonic sensors with ±5cm precision.",
    logo: "/images/companies/shell.svg",
  },
  {
    role: "Events Head & Workshop Presenter",
    company: "SGN (Saudi Game Network)",
    period: "Oct 2022 — Jul 2024",
    location: "Remote",
    description:
      "Presented workshops on multiplayer game dev in Unity, computer graphics, and shaders. Hosted game competition finals and managed events for the gaming community.",
    logo: "/images/companies/sgn.png",
  },
  {
    role: "Web Developer",
    company: "Bright Future",
    period: "Oct 2021 — Oct 2023",
    location: "Doha, Qatar",
    description:
      "Built websites, mobile apps, and backend servers for client businesses. Delivered full-stack solutions including the Afia healthcare site, BrightFuture corporate site, and CIRP organization platform.",
    logo: "/images/companies/brightfuture.webp",
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
    title: "How We Got 2nd Place at Shell Eco-Marathon",
    excerpt:
      "The story of building an autonomous vehicle from scratch — LiDAR integration, sensor fusion, and what went wrong (and right) during competition day.",
    date: "Jul 2025",
    readTime: "8 min",
    tags: ["Autonomous", "Engineering"],
    slug: "shell-eco-marathon",
  },
  {
    title: "Multiplayer Networking in Unity: What I Learned",
    excerpt:
      "After shipping a co-op FPS, here are the hard lessons about client-server architecture, prediction, and why you should never trust the client.",
    date: "Mar 2025",
    readTime: "6 min",
    tags: ["Unity", "Networking"],
    slug: "unity-multiplayer",
  },
  {
    title: "Winning 3 Awards in 72 Hours",
    excerpt:
      "A game jam postmortem on Body Parts — how scoping, polish, and a weird body-swapping mechanic swept Best Polish, Best Theme, and Most Fun.",
    date: "Jan 2023",
    readTime: "5 min",
    tags: ["Game Jam", "Postmortem"],
    slug: "body-parts-postmortem",
  },
  {
    title: "From React Native to Full Stack",
    excerpt:
      "Building a three-module service platform taught me more about architecture than any course. Here's how I structured the Handyman app.",
    date: "Sep 2023",
    readTime: "5 min",
    tags: ["React Native", "Full Stack"],
    slug: "handyman-architecture",
  },
];

export const interests = [
  "Game Development",
  "Autonomous Systems",
  "Multiplayer Networking",
  "Open Source",
  "Embedded Systems",
  "Competitive Gaming",
  "3D Graphics & Shaders",
  "Robotics",
];

export const currentlyDoing = {
  reading: "Game Engine Architecture by Jason Gregory",
  learning: "ROS2 & Advanced Sensor Fusion",
  building: "The Cube — multiplayer FPS for Steam",
  listening: "Lo-fi beats & game soundtracks",
};
