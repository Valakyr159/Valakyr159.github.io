export interface CvData {
  personal: PersonalInfo;
  summary: string;
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
  name: string;
  colorClass: string;
  accentVar: string;
  icon: string;
  skills: string[];
}

export interface Experience {
  company: string;
  role: string;
  period: string;
  highlights: string[];
  tags: string[];
}

export interface Education {
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

  summary:
    'Full Stack Software Engineer and Machine Learning Engineer with hands-on experience in NetSuite ERP development, web integrations, and AI/ML systems. Proficient in Angular, Node.js, TypeScript, Python, and SuiteScript. Skilled in LLM orchestration, RAG pipelines, and AI Agents. Experienced delivering LATAM financial compliance solutions in Agile/Scrum global teams.',

  typewriterRoles: [
    'Full Stack Engineer',
    'Machine Learning Engineer',
    'AI Solutions Architect',
    'NetSuite Developer',
  ],

  skills: [
    {
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
      company: 'Bring IT',
      role: 'NetSuite Software Engineer',
      period: 'Sep 2024 – Apr 2026',
      highlights: [
        "Selected for the 'Make Your Mark' program focused on NetSuite ERP architecture and cloud systems.",
        'Architected integrations using Angular, Node.js, and PostgreSQL bridging ERP data with external business applications.',
        'Engineered financial localization reporting engines for LATAM regulatory compliance: Exógenos (Colombia), SAT (Mexico), PLE (Peru).',
        'Built and maintained complex server-side business logic using JavaScript, TypeScript, and SuiteScript.',
        'Collaborated in Agile/Scrum methodologies within cross-functional, international development teams.',
      ],
      tags: ['Angular', 'Node.js', 'TypeScript', 'PostgreSQL', 'SuiteScript', 'Scrum'],
    },
    {
      company: 'Sutherland',
      role: 'Customer Support Specialist',
      period: '2022 – 2024',
      highlights: [
        'Delivered high-tier bilingual technical support with strong SLA compliance.',
        'Strengthened cross-cultural communication and structured problem-solving skills.',
      ],
      tags: ['Technical Support', 'Bilingual', 'SLA', 'Problem Solving'],
    },
  ],

  education: [
    {
      institution: 'SENA — Servicio Nacional de Aprendizaje',
      title: 'Software Analysis and Development Technologist',
      period: '2020 – 2022',
      status: 'completed',
      description:
        'Comprehensive program covering software analysis, development methodologies, databases, and programming fundamentals.',
    },
    {
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
      tags: ['Angular 19', 'FastAPI', 'LlamaIndex', 'Groq', 'PyMuPDF', 'SSE', 'Tailwind CSS'],
      category: 'ai-ml',
      status: 'live',
      featured: true,
      route: '/chatbot',
      github: 'https://github.com/valakyr159',
      date: '2026',
    },
    {
      id: 'patitas-a-la-obra',
      title: 'Patitas a la Obra',
      description:
        'PWA de remodelación de interiores con chatbot IA (Mily): visión on-device y RAG contra inventario real vía arquitectura MCP.',
      longDescription:
        'Sube una foto de tu espacio y la app segmenta la imagen on-device, recomienda materiales reales de un catálogo vía RAG, y genera previews con IA generativa (Gemini) del resultado. Incluye agendamiento de citas con notificaciones automáticas por Telegram y email.',
      tags: ['Angular 19', 'Supabase', 'MCP', 'Hugging Face Transformers', 'RAG', 'Gemini', 'PWA'],
      category: 'ai-ml',
      status: 'live',
      featured: true,
      demo: 'https://patitas-a-la-obra.vercel.app',
      date: '2026',
    },
    {
      id: 'caza-casas',
      title: 'Mily Caza Casas',
      description:
        'PWA gratuita para buscar arriendos en Bogotá: scraping diario automatizado + alta manual, notificaciones por Telegram y filtros pet-friendly.',
      longDescription:
        'Monorepo con frontend Angular, un scraper con Playwright que corre a diario vía GitHub Actions, y backend en Supabase (Postgres, Auth, Edge Functions). Dashboard con anuncios nuevos del día, favoritos, mapa y notificaciones automáticas por Telegram.',
      tags: ['Angular', 'Supabase', 'Playwright', 'Tailwind CSS', 'GitHub Actions', 'PWA'],
      category: 'fullstack',
      status: 'live',
      featured: true,
      demo: 'https://caza-casas.vercel.app',
      date: '2026',
    },
    {
      id: 'rag-document-retrieval',
      title: 'RAG & Document Retrieval System',
      description:
        'Pipeline end-to-end de Retrieval-Augmented Generation con LangChain para consulta de repositorios documentales.',
      tags: ['LangChain', 'Python', 'RAG', 'Embeddings', 'Vector DBs'],
      category: 'ai-ml',
      status: 'completed',
      featured: false,
      github: 'https://github.com/valakyr159',
      date: '2025',
    },
    {
      id: 'llm-api-integration',
      title: 'LLM API Integration & Benchmarking',
      description:
        'Configuración y benchmarking de APIs LLM comerciales y open-source con Prompt Engineering avanzado para outputs estructurados.',
      tags: ['Python', 'LLM APIs', 'Prompt Engineering', 'Groq', 'OpenAI'],
      category: 'ai-ml',
      status: 'completed',
      featured: false,
      github: 'https://github.com/valakyr159',
      date: '2025',
    },
    {
      id: 'data-science-pipelines',
      title: 'Data Science Pipelines',
      description:
        'Workflows de datos con Python, Pandas, NumPy y PostgreSQL. Entornos de modelos ML con Anaconda y Jupyter.',
      tags: ['Python', 'Pandas', 'NumPy', 'PostgreSQL', 'Jupyter', 'Matplotlib'],
      category: 'ai-ml',
      status: 'completed',
      featured: false,
      github: 'https://github.com/valakyr159',
      date: '2024',
    },
  ],
};
