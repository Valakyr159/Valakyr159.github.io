export interface CvData {
  personal: PersonalInfo;
  skills: SkillCategory[];
  experience: Experience[];
  education: Education[];
  projects: Project[];
  typewriterRoles: string[];
}

export interface PersonalInfo {
  fullName: string;
  initials: string;
  location: string;
  phone: string;
  email: string;
  linkedin: string;
  github: string;
  role: string;
  englishLevel: string;
}

export interface SkillCategory {
  key: 'frontend' | 'backend' | 'ai' | 'cloud' | 'db';
  name: string;
  colorClass: string;
  accentVar: string;
  icon: string;
  skills: string[];
}

export interface Experience {
  id: 'bringit' | 'sutherland';
  company: string;
  role: string;
  period: string;
  tags: string[];
}

export interface Education {
  id: 'sena' | 'platzi';
  institution: string;
  title: string;
  period: string;
  status: 'completed' | 'in-progress';
  description: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  tags: string[];
  category: 'ai-ml' | 'fullstack' | 'frontend';
  status: 'live' | 'completed' | 'in-progress';
  featured: boolean;
  route?: string;
  github?: string;
  demo?: string;
  image?: string;
  date: string;
}

export const CV_DATA: CvData = {
  personal: {
    fullName: 'Javier Eduardo Morón Mendoza',
    initials: 'JM',
    location: 'Bogotá, Colombia',
    phone: '+57 316 624 9193',
    email: 'javiermoron159@hotmail.com',
    linkedin: 'https://linkedin.com/in/valakyr159',
    github: 'https://github.com/valakyr159',
    role: 'Full Stack Software Engineer & Machine Learning Engineer',
    englishLevel: 'C1 Advanced',
  },

  typewriterRoles: [
    'Full Stack Engineer',
    'Machine Learning Engineer',
    'AI Solutions Architect',
    'NetSuite Developer',
  ],

  skills: [
    {
      key: 'frontend',
      name: 'Frontend',
      colorClass: 'accent-indigo',
      accentVar: '--accent-indigo',
      icon: 'layers',
      skills: [
        'Angular',
        'React',
        'Vue.js',
        'TypeScript',
        'JavaScript',
        'Tailwind CSS',
        'HTML5',
        'CSS3',
      ],
    },
    {
      key: 'backend',
      name: 'Backend',
      colorClass: 'accent-violet',
      accentVar: '--accent-violet',
      icon: 'server',
      skills: [
        'Node.js',
        'Express.js',
        'FastAPI',
        'Python',
        '.NET Core',
        'ASP.NET',
        'SuiteScript',
        'C#',
      ],
    },
    {
      key: 'ai',
      name: 'AI / ML',
      colorClass: 'accent-cyan',
      accentVar: '--accent-cyan',
      icon: 'brain',
      skills: [
        'LangChain',
        'LlamaIndex',
        'RAG Systems',
        'AI Agents',
        'Prompt Engineering',
        'Groq',
        'NumPy',
        'Pandas',
      ],
    },
    {
      key: 'cloud',
      name: 'Cloud & DevOps',
      colorClass: 'accent-teal',
      accentVar: '--accent-cyan',
      icon: 'cloud',
      skills: [
        'Azure',
        'AWS',
        'Google Cloud',
        'Firebase',
        'Docker',
        'Git',
        'GitHub',
        'CI/CD',
      ],
    },
    {
      key: 'db',
      name: 'Databases & Tools',
      colorClass: 'accent-slate',
      accentVar: '--accent-indigo',
      icon: 'database',
      skills: [
        'PostgreSQL',
        'SQL Server',
        'MongoDB',
        'ChromaDB',
        'Pinecone',
        'Jupyter',
        'SQL',
        'Matplotlib',
      ],
    },
  ],

  experience: [
    {
      id: 'bringit',
      company: 'Bring IT',
      role: 'NetSuite Software Engineer',
      period: 'Sep 2024 – Apr 2026',
      tags: ['Angular', 'Node.js', 'TypeScript', 'PostgreSQL', 'SuiteScript', 'Scrum'],
    },
    {
      id: 'sutherland',
      company: 'Sutherland',
      role: 'Customer Support Specialist',
      period: '2022 – 2024',
      tags: ['Technical Support', 'Bilingual', 'SLA', 'Problem Solving'],
    },
  ],

  education: [
    {
      id: 'sena',
      institution: 'SENA — Servicio Nacional de Aprendizaje',
      title: 'Software Analysis and Development Technologist',
      period: '2020 – 2022',
      status: 'completed',
      description:
        'Comprehensive program covering software analysis, development methodologies, databases, and programming fundamentals.',
    },
    {
      id: 'platzi',
      institution: 'Platzi',
      title: 'Continuous Learning — 100+ Courses',
      period: '2019 – Present',
      status: 'in-progress',
      description:
        'AI/ML, Data Science, Full Stack Development. Continuous professional development across modern web technologies and artificial intelligence.',
    },
  ],

  projects: [
    {
      id: 'chatbot-rag',
      title: 'Chatbot RAG en Tiempo Real',
      description:
        'Sube un PDF y conversa con él. RAG efímero con LlamaIndex + Groq streaming.',
      longDescription:
        'Sistema de chat con inteligencia artificial que permite subir documentos PDF y hacer preguntas sobre su contenido en tiempo real. Utiliza Retrieval-Augmented Generation (RAG) con vectores efímeros que se eliminan al cerrar la sesión, garantizando la privacidad del usuario.',
      tags: ['Angular 19', 'FastAPI', 'MCP', 'LlamaIndex', 'Groq', 'PyMuPDF', 'SSE', 'Tailwind CSS'],
      category: 'ai-ml',
      status: 'live',
      featured: true,
      route: '/chatbot',
      github: 'https://github.com/valakyr159',
      date: '2026',
    },
    {
      id: 'caza-casas',
      title: 'Mily Caza Casas',
      description:
        'PWA gratuita para buscar arriendos en Bogotá: scraping diario automatizado + alta manual, notificaciones por Telegram y filtros pet-friendly.',
      longDescription:
        'Monorepo con frontend Angular, un scraper con Playwright que corre a diario vía GitHub Actions, y backend en Supabase (Postgres, Auth, Edge Functions). Dashboard con anuncios nuevos del día, favoritos, mapa y notificaciones automáticas por Telegram.',
      tags: ['Angular', 'Supabase', 'Playwright', 'Gemini Flash 2.5', 'Telegram', 'Tailwind CSS', 'GitHub Actions', 'PWA'],
      category: 'fullstack',
      status: 'live',
      featured: true,
      demo: 'https://caza-casas.vercel.app',
      image: '/project-shots/caza-casas.png',
      date: '2026',
    },
    {
      id: 'patitas-a-la-obra',
      title: 'Patitas a la Obra',
      description:
        'PWA de remodelación de interiores con chatbot IA (Mily): visión on-device y RAG contra inventario real vía arquitectura MCP.',
      longDescription:
        'Sube una foto de tu espacio y la app segmenta la imagen on-device, recomienda materiales reales de un catálogo vía RAG, y genera previews con IA generativa (Gemini) del resultado. Incluye agendamiento de citas con notificaciones automáticas por Telegram y email.',
      tags: ['Angular 19', 'Supabase', 'MCP', 'Hugging Face Transformers', 'RAG', 'Gemini', 'Telegram', 'PWA'],
      category: 'ai-ml',
      status: 'live',
      featured: true,
      demo: 'https://patitas-a-la-obra.vercel.app',
      image: '/project-shots/patitas-a-la-obra.png',
      date: '2026',
    },
    {
      id: 'bares-rock',
      title: 'Bares Rock',
      description: 'Próximamente.',
      tags: [],
      category: 'fullstack',
      status: 'in-progress',
      featured: false,
      date: '2026',
    },
    {
      id: 'netsuite-cert-prep',
      title: 'NetSuite Cert Prep',
      description:
        'Simulador de examen para la certificación NetSuite SuiteFoundation, con temporizador, navegación entre preguntas y varios bancos de preguntas.',
      longDescription:
        'App Angular standalone que permite elegir un set de preguntas (varias fuentes), configurar si se muestran las respuestas al instante o al final, aleatorizar el orden, y hacer seguimiento del progreso con un temporizador circular y un panel de navegación de preguntas.',
      tags: ['Angular 18', 'TypeScript', 'Tailwind CSS'],
      category: 'frontend',
      status: 'live',
      featured: false,
      github: 'https://github.com/valakyr159/netsuite-cert-prep',
      demo: 'https://netsuite-cert-prep.vercel.app',
      image: '/project-shots/netsuite-cert-prep.png',
      date: '2024',
    },
  ],
};
