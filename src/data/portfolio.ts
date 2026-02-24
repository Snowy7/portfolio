export interface ProjectLink {
  label: string;
  url: string;
}

export interface Project {
  slug: string;
  title: string;
  description: string;
  longDescription?: string;
  tags: string[];
  image: string;
  gallery?: string[];
  links: ProjectLink[];
  status: string;
  role: string;
  year: number;
  duration?: string;
  featured: boolean;
  highlights?: string[];
  category: "web" | "game" | "engineering" | "mobile";
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
  bio: "Network & Telecom Engineering student with 8+ years of coding experience spanning web platforms, multiplayer games, AI tools, and autonomous vehicles. Led an autonomous vehicle to 2nd place at Shell Eco-Marathon Poland 2025.",
  email: "snowydev7@gmail.com",
  github: "https://github.com/Snowy7",
  linkedin: "https://www.linkedin.com/in/islam-azzam-6a3449205/",
  twitter: "https://twitter.com/snowy7x",
  medium: "https://medium.com/@snowy7",
  itch: "https://snowy77x.itch.io",
  location: "Doha, Qatar",
  phone: "+974 74479336",
  university: "University of Doha for Science and Technology (UDST)",
  degree: "B.Sc. Electrical Engineering — Telecom & Networks",
  avatar:
    "https://api.dicebear.com/9.x/initials/svg?seed=IA&backgroundColor=0a0a0a&textColor=22c55e&fontSize=36",
};

// ─── Projects ───────────────────────────────────────────────
// Ordered: Web first, then tools, then games, then engineering

export const projects: Project[] = [
  // ── Web ──
  {
    slug: "sanad",
    title: "SANAD",
    description:
      "AI-powered university advisor that helps students discover, match with, and apply to 150+ universities worldwide. Chat-based UI with smart matching and scholarship recommendations.",
    longDescription:
      "SANAD is an AI-powered platform that revolutionizes the university discovery process. Students chat with an AI advisor to get instant answers about programs, requirements, scholarships, and deadlines. The platform analyzes student profiles to recommend best-fit universities and guides them through every step of the application process. Built to serve 10K+ students across 30+ countries.",
    tags: ["Next.js", "React", "AI", "TypeScript", "Tailwind"],
    image: "/images/projects/sanad/cover.svg",
    links: [{ label: "Live", url: "https://asksanad.com" }],
    status: "Live",
    role: "Full Stack Developer",
    year: 2025,
    duration: "3 months",
    featured: true,
    highlights: [
      "AI chatbot for university admissions guidance",
      "Smart matching algorithm across 150+ universities",
      "Helped 10K+ students find programs in 30+ countries",
      "Real-time scholarship and deadline tracking",
    ],
    category: "web",
  },
  {
    slug: "heyrabit",
    title: "HeyRabit",
    description:
      "The operating system for startups and the programs that back them. AI copilots for idea validation, pitch decks, and smart matchmaking with incubators across Qatar & MENA.",
    longDescription:
      "HeyRabit is a comprehensive startup ecosystem platform built for the MENA region. It connects startups with incubators, accelerators, and funding opportunities through AI-powered matchmaking. Features include an AI Idea Generator for venture validation, a Pitch Deck Studio for investor-ready presentations, and an Impact Dashboard for portfolio tracking. Integrated with HubSpot, Salesforce, and government innovation portals.",
    tags: ["React", "TypeScript", "AI", "Tailwind", "Node.js"],
    image: "/images/projects/heyrabit/cover.svg",
    links: [{ label: "Live", url: "https://heyrabit.com" }],
    status: "Live",
    role: "Full Stack Developer",
    year: 2025,
    duration: "4 months",
    featured: true,
    highlights: [
      "AI copilots for idea validation and pitch deck creation",
      "Smart matchmaking with 150+ programs and incubators",
      "Impact dashboard with pipeline analytics and mentor tracking",
      "Arabic and English product experience with regional compliance",
    ],
    category: "web",
  },
  {
    slug: "noor-quran",
    title: "Noor — Quran Companion",
    description:
      "A beautiful PWA for reading, listening to, and memorizing the Quran. Features offline support, prayer times, Qibla compass, and memorization progress tracking.",
    longDescription:
      "Noor is a Progressive Web App designed to be a complete Quran companion. It provides a clean, distraction-free reading experience with multiple reciters, verse-by-verse audio playback, and a structured memorization (Hifz) system with progress tracking. The app works fully offline, includes prayer time calculations based on location, and features a Qibla compass. Designed with both light and dark themes.",
    tags: ["React", "TypeScript", "PWA", "Tailwind", "Offline"],
    image: "/images/projects/noor/cover.svg",
    links: [{ label: "Live", url: "https://quran.snowydev.xyz" }],
    status: "Live",
    role: "Solo Developer",
    year: 2025,
    duration: "2 months",
    featured: true,
    highlights: [
      "Full offline support as installable PWA",
      "Multiple reciters with verse-by-verse playback",
      "Memorization tracking with spaced repetition",
      "Prayer times and Qibla compass",
    ],
    category: "web",
  },
  {
    slug: "snist",
    title: "Snist",
    description:
      "AI-powered Unity development assistant. Generate C# code, manage scenes, and design levels through natural language. Ships as a Unity Editor plugin.",
    longDescription:
      "Snist is an AI assistant built specifically for Unity developers. It integrates directly into the Unity Editor and allows developers to generate C# scripts, manage scenes, inspect components, and design levels using natural language prompts. The tool understands Unity's API and generates production-ready code with proper error handling and best practices. Features real-time Editor sync and an asset pipeline for streamlined workflows.",
    tags: ["React", "TypeScript", "AI", "Unity", "C#"],
    image: "/images/projects/snist/cover.svg",
    links: [{ label: "Live", url: "https://snist.dev" }],
    status: "Live",
    role: "Creator & Lead Developer",
    year: 2025,
    duration: "3 months",
    featured: true,
    highlights: [
      "AI-powered C# code generation for Unity",
      "Natural language scene management and level design",
      "Real-time Unity Editor synchronization",
      "Component inspector and asset pipeline tools",
    ],
    category: "web",
  },
  {
    slug: "brightfuture-website",
    title: "Bright Future Website",
    description:
      "Modern corporate landing page with responsive design, smooth Framer Motion animations, and professional presentation. SEO optimized.",
    tags: ["Next.js", "React", "Tailwind", "Framer Motion"],
    image: "/images/projects/brightfuture/cover.png",
    links: [{ label: "Live", url: "https://brightfuture.qa" }],
    status: "Live",
    role: "Web Developer",
    year: 2023,
    duration: "3 weeks",
    featured: false,
    highlights: [
      "Clean, modern corporate design",
      "Fully responsive across all devices",
      "Smooth animations and page transitions",
      "SEO optimized for search visibility",
    ],
    category: "web",
  },
  {
    slug: "sgn-website",
    title: "SGN Website",
    description:
      "Landing page for Saudi Game Network featuring event listings, workshop info, and community showcase. Gaming-themed dark mode design.",
    tags: ["Next.js", "React", "Tailwind", "TypeScript"],
    image: "/images/projects/sgn/cover.png",
    links: [{ label: "Live", url: "https://saad-gn.netlify.app/" }],
    status: "Live",
    role: "Web Developer",
    year: 2024,
    duration: "4 weeks",
    featured: false,
    highlights: [
      "Event management and listing system",
      "Community showcase and member profiles",
      "Workshop registration functionality",
      "Gaming-themed design with dark mode",
    ],
    category: "web",
  },
  {
    slug: "almanadeeb-website",
    title: "Almanadeeb Website",
    description:
      "Corporate landing page with professional design, service portfolio, contact form integration, and multi-language support (Arabic/English).",
    tags: ["Next.js", "React", "Tailwind", "TypeScript"],
    image: "/images/projects/almanadeeb/cover.png",
    links: [{ label: "Live", url: "https://almanadeeb.com" }],
    status: "Live",
    role: "Web Developer",
    year: 2023,
    duration: "3 weeks",
    featured: false,
    highlights: [
      "Professional corporate design language",
      "Service portfolio with detailed descriptions",
      "Contact form integration",
      "Multi-language support (Arabic/English)",
    ],
    category: "web",
  },
  // ── Mobile ──
  {
    slug: "handyman-app",
    title: "Handyman Service App",
    description:
      "Three-module service platform: user app for ordering services, worker app for fulfillment, and admin dashboard for management. Real-time matching and payment integration.",
    tags: ["React Native", "Node.js", "MongoDB", "Firebase"],
    image: "/images/projects/handyman/cover.jpg",
    links: [],
    status: "Completed",
    role: "Full Stack Developer",
    year: 2023,
    duration: "4 months",
    featured: false,
    highlights: [
      "Three integrated platforms: User App, Worker App, Admin Dashboard",
      "Real-time service matching and tracking",
      "Payment integration and processing",
      "Rating and review system for quality assurance",
    ],
    category: "mobile",
  },
  // ── Games ──
  {
    slug: "the-cube",
    title: "The Cube",
    description:
      "Cooperative FPS where up to 4 players infiltrate procedurally generated office complexes in a high-stakes virtual heist. Dual timer system, reputation mechanics, and Steam integration.",
    longDescription:
      "The Cube is a cooperative first-person shooter where you and up to three friends are trapped in a high-stakes virtual heist. Tasked by an unseen patron, your mission is to infiltrate the office complex of Mr. Z, gather critical data, and escape before time runs out. Each level is procedurally generated with fresh challenges every playthrough. The game features dual timers and a reputation system that influences your mission time — failure is real, and being left behind means facing the consequences alone.",
    tags: ["Unity", "C#", "Multiplayer", "Steam", "Procedural Generation"],
    image: "/images/projects/the-cube/cover.png",
    links: [
      { label: "Steam", url: "https://store.steampowered.com/app/3148890" },
    ],
    status: "In Development",
    role: "Project Leader & Lead Programmer",
    year: 2024,
    duration: "12+ months",
    featured: true,
    highlights: [
      "Cooperative multiplayer for up to 4 players",
      "Procedurally generated levels with randomized layouts",
      "Dual timer system: shared mission + individual survival",
      "Dynamic reputation system affecting difficulty",
      "Custom multiplayer networking architecture",
    ],
    category: "game",
  },
  {
    slug: "celestial-escape",
    title: "Celestial Escape",
    description:
      "3-day game jam project that won Best Quality award at Spoilz Game Studio jam. Space-themed puzzle adventure with polished mechanics, visuals, and audio.",
    tags: ["Unity", "C#", "Shader Graph", "Game Jam"],
    image: "/images/projects/celestial-escape/cover.png",
    gallery: [
      "/images/projects/celestial-escape/gallery1.png",
      "/images/projects/celestial-escape/gallery2.png",
      "/images/projects/celestial-escape/gallery3.png",
    ],
    links: [{ label: "Play", url: "https://imhorror.itch.io/ce" }],
    status: "Completed",
    role: "Game Developer",
    year: 2023,
    duration: "3 days (Game Jam)",
    featured: false,
    highlights: [
      "Won Best Quality Award at Spoilz Game Studio Jam",
      "Built in 72 hours with teammate",
      "Innovative puzzle mechanics and level design",
      "Polished visuals, audio, and game feel",
    ],
    category: "game",
  },
  {
    slug: "body-parts",
    title: "Body Parts",
    description:
      "Solo game jam entry that swept all major awards — Best Polish, Best Theme, and Most Fun at SGN Game Jam. Creative body-swapping mechanic with comedic elements.",
    tags: ["Unity", "C#", "2D Animation", "Solo Dev"],
    image: "/images/projects/body-parts/cover.png",
    gallery: [
      "/images/projects/body-parts/gallery1.png",
      "/images/projects/body-parts/gallery2.png",
    ],
    links: [{ label: "Play", url: "https://snowy77x.itch.io/body-parts" }],
    status: "Completed",
    role: "Solo Developer",
    year: 2022,
    duration: "3 days (Game Jam)",
    featured: false,
    highlights: [
      "Won 3 Awards: Best Polish, Best Theme, Most Fun",
      "Solo development in 72 hours",
      "Creative body-swapping game mechanic",
      "Highly polished game feel and comedic elements",
    ],
    category: "game",
  },
  // ── Engineering ──
  {
    slug: "shell-eco-marathon",
    title: "Shell Eco-Marathon — 2nd Place",
    description:
      "Autonomous Urban Concept vehicle that secured 2nd place at Shell Eco-Marathon Poland 2025. Full navigation, LiDAR obstacle avoidance, and precision parking with ±5cm accuracy.",
    longDescription:
      "Led the autonomous systems team for UDST's Urban Concept vehicle at Shell Eco-Marathon Poland 2025. The system integrates LiDAR, ultrasonic sensors, and computer vision on a JETSON AGX platform running ROS2. Developed algorithms for lane following, obstacle detection and avoidance, and precision autonomous parking. Successfully competed against international teams to secure 2nd place in the autonomous category.",
    tags: ["Python", "C++", "ROS2", "LiDAR", "JETSON AGX"],
    image: "/images/projects/shell-eco/cover.webp",
    gallery: [
      "/images/projects/shell-eco/gallery1.webp",
      "/images/projects/shell-eco/gallery2.png",
      "/images/projects/shell-eco/gallery3.jpg",
    ],
    links: [
      {
        label: "Competition",
        url: "https://www.shellecomarathon.com/2025-programme/autonomous-urban-concept.html",
      },
    ],
    status: "Completed",
    role: "Autonomous Team Leader",
    year: 2025,
    duration: "8 months",
    featured: true,
    highlights: [
      "2nd place at Shell Eco-Marathon Poland 2025",
      "Full autonomous navigation competing internationally",
      "LiDAR + ultrasonic sensor fusion with ±5cm accuracy",
      "Real-time obstacle detection and avoidance",
      "Precision autonomous parking system",
    ],
    category: "engineering",
  },
];

export const featuredProjects = projects.filter((p) => p.featured);

export const skills: Skill[] = [
  // Programming Languages
  { name: "C#", level: 95, category: "Languages" },
  { name: "JavaScript", level: 95, category: "Languages" },
  { name: "TypeScript", level: 90, category: "Languages" },
  { name: "Python", level: 90, category: "Languages" },
  { name: "C++", level: 80, category: "Languages" },
  { name: "SQL", level: 80, category: "Languages" },
  // Web Development
  { name: "React / Next.js", level: 90, category: "Web" },
  { name: "Node.js", level: 90, category: "Web" },
  { name: "Tailwind CSS", level: 85, category: "Web" },
  { name: "HTML & CSS", level: 95, category: "Web" },
  { name: "RESTful APIs", level: 85, category: "Web" },
  // Game Development
  { name: "Unity", level: 95, category: "Game Dev" },
  { name: "Multiplayer Systems", level: 90, category: "Game Dev" },
  { name: "Shader Programming", level: 85, category: "Game Dev" },
  { name: "Game Design", level: 85, category: "Game Dev" },
  { name: "Physics Simulation", level: 80, category: "Game Dev" },
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

export const interests = [
  "Game Development",
  "Web Platforms",
  "Autonomous Systems",
  "AI & Machine Learning",
  "Multiplayer Networking",
  "Anime & Manga",
  "3D Graphics & Shaders",
  "Robotics",
];

export const currentlyDoing = {
  reading: "Game Engine Architecture by Jason Gregory",
  learning: "ROS2 & Advanced Sensor Fusion",
  building: "The Cube — multiplayer FPS for Steam",
  listening: "Lo-fi beats & game soundtracks",
};
