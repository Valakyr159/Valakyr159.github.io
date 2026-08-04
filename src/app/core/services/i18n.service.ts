import { Injectable, signal, computed } from '@angular/core';

export type Language = 'en' | 'es';

// Translation dictionaries
const translations = {
  en: {
    nav: {
      home: 'Home',
      projects: 'Projects',
      chatbot: 'RAG Chatbot',
      switchTheme: 'Toggle theme',
      switchLang: 'Switch to Spanish',
      langCode: 'ES'
    },
    home: {
      available: 'Available for projects',
      title: 'AI Solutions Architect',
      description: 'Full Stack Software Engineer and Machine Learning Engineer with hands-on experience in ERP development, web integrations, and AI/ML systems.',
      viewProjects: 'View projects',
      downloadCV: 'Download CV'
    },
    about: {
      title: 'About me',
      p1: 'Full Stack Software Engineer and Machine Learning Engineer with hands-on experience in NetSuite ERP development, web integrations, and AI/ML systems. Proficient in Angular, Node.js, TypeScript, Python, and SuiteScript.',
      p2: 'Skilled in LLM orchestration, RAG pipelines, and AI Agents. Experienced delivering LATAM financial compliance solutions in Agile/Scrum global teams.',
      stats: {
        years: 'Years Exp.',
        tech: 'Technologies',
        projects: 'Projects',
        courses: 'Courses'
      }
    },
    skills: {
      title: 'Technical',
      titleHighlight: 'Stack',
      subtitle: 'Technologies and tools I use to build world-class solutions.',
      frontend: 'Frontend',
      backend: 'Backend',
      ai: 'AI / ML',
      cloud: 'Cloud & DevOps',
      db: 'Databases & Tools'
    },
    experience: {
      title: 'Professional',
      titleHighlight: 'Experience',
      sutherland: 'Customer Support Specialist',
      sutherlandDesc1: 'Delivered high-tier bilingual technical support with strong SLA compliance.',
      sutherlandDesc2: 'Strengthened cross-cultural communication and structured problem-solving skills.',
      bringitDesc1: "Selected for the 'Make Your Mark' program focused on NetSuite ERP architecture and cloud systems.",
      bringitDesc2: 'Architected integrations using Angular, Node.js, and PostgreSQL bridging ERP data with external business applications.',
      bringitDesc3: 'Engineered financial localization reporting engines for LATAM regulatory compliance.',
      bringitDesc4: 'Built and maintained complex server-side business logic using JavaScript, TypeScript, and SuiteScript.',
      bringitDesc5: 'Collaborated in Agile/Scrum methodologies within cross-functional, international development teams.'
    },
    education: {
      title: 'Education &',
      titleHighlight: 'Training',
      completed: 'Completed',
      inProgress: 'In progress',
      senaTitle: 'Software Analysis and Development Technologist',
      senaDesc: 'Comprehensive program covering software analysis, development methodologies, databases, and programming fundamentals.',
      platziTitle: 'Continuous Learning — 100+ Courses',
      platziDesc: 'AI/ML, Data Science, Full Stack Development. Continuous professional development across modern web technologies and artificial intelligence.'
    },
    projects: {
      title: 'Featured',
      titleHighlight: 'Projects',
      subtitle: 'A selection of my best recent work.',
      viewAll: 'View all projects',
      live: 'Live',
      completed: 'Completed',
      featured: 'Featured',
      openApp: 'Open App',
      chatbotDesc: 'Upload a PDF and chat with it. Ephemeral RAG with LlamaIndex + Groq streaming.',
      ragDesc: 'End-to-end Retrieval-Augmented Generation pipeline using LangChain for querying document repositories.',
      agentDesc: 'LLM Orchestration platform using ReAct architecture for executing autonomous sequential tools.',
      back: 'Back to Home'
    },
    chatbot: {
      title: 'Chatbot',
      subtitle: 'Upload a PDF and ask questions about its content. (MCP Architecture)',
      connected: 'Connected to MCP',
      disconnected: 'Disconnected',
      clearSession: 'Clear session',
      docContext: 'Context Document',
      processing: 'Processing document...',
      processingSub: 'Extracting text and generating embeddings',
      dropzoneTitle: 'Upload a PDF',
      dropzoneDesc: 'Drag and drop here, or click to select a file.',
      docLoaded: 'Document Loaded',
      info: 'Information',
      infoDesc: 'The document has been processed, chunked, and vectorized in memory for this session.',
      helloTitle: 'Hello! I am the RAG Chatbot',
      helloDesc: 'Upload a PDF document in the left panel and ask me whatever you need to know. I will search the document to give you an accurate answer.',
      inputPlaceholder: 'Type your question here...',
      connectingText: 'Communicating with MCP server...',
      prompts: [
        'Give me a summary of the PDF',
        'What are the main topics?',
        'Who is the author?'
      ]
    }
  },
  es: {
    nav: {
      home: 'Inicio',
      projects: 'Proyectos',
      chatbot: 'Chatbot RAG',
      switchTheme: 'Cambiar tema',
      switchLang: 'Switch to English',
      langCode: 'EN'
    },
    home: {
      available: 'Disponible para proyectos',
      title: 'AI Solutions Architect',
      description: 'Full Stack Software Engineer y Machine Learning Engineer con experiencia práctica en desarrollo ERP, integraciones web y sistemas de IA/ML.',
      viewProjects: 'Ver proyectos',
      downloadCV: 'Descargar CV'
    },
    about: {
      title: 'Sobre mí',
      p1: 'Full Stack Software Engineer y Machine Learning Engineer con experiencia práctica en desarrollo ERP en NetSuite, integraciones web y sistemas de IA/ML. Competente en Angular, Node.js, TypeScript, Python y SuiteScript.',
      p2: 'Habilidades en orquestación de LLMs, pipelines RAG y Agentes de IA. Experiencia entregando soluciones de cumplimiento financiero para LATAM en equipos globales Ágiles/Scrum.',
      stats: {
        years: 'Años Exp.',
        tech: 'Tecnologías',
        projects: 'Proyectos',
        courses: 'Cursos'
      }
    },
    skills: {
      title: 'Stack',
      titleHighlight: 'Técnico',
      subtitle: 'Tecnologías y herramientas que utilizo para construir soluciones de nivel world-class.',
      frontend: 'Frontend',
      backend: 'Backend',
      ai: 'IA / ML',
      cloud: 'Cloud & DevOps',
      db: 'Bases de Datos'
    },
    experience: {
      title: 'Experiencia',
      titleHighlight: 'Profesional',
      sutherland: 'Customer Support Specialist',
      sutherlandDesc1: 'Soporte técnico bilingüe de alto nivel con estricto cumplimiento de SLAs.',
      sutherlandDesc2: 'Fortalecimiento de comunicación intercultural y resolución estructurada de problemas.',
      bringitDesc1: "Seleccionado para el programa 'Make Your Mark' enfocado en arquitectura ERP NetSuite y sistemas cloud.",
      bringitDesc2: 'Diseño de integraciones usando Angular, Node.js y PostgreSQL conectando datos del ERP con aplicaciones de negocio externas.',
      bringitDesc3: 'Desarrollo de motores de reportes de localización financiera para LATAM: Exógenos (Colombia), SAT (México), PLE (Perú).',
      bringitDesc4: 'Construcción y mantenimiento de lógica de negocio del lado del servidor usando JavaScript, TypeScript y SuiteScript.',
      bringitDesc5: 'Colaboración bajo metodologías Agile/Scrum en equipos de desarrollo internacionales multidisciplinarios.'
    },
    education: {
      title: 'Educación y',
      titleHighlight: 'Formación',
      completed: 'Completado',
      inProgress: 'En curso',
      senaTitle: 'Tecnólogo en Análisis y Desarrollo de Software',
      senaDesc: 'Programa integral que abarca análisis de software, metodologías de desarrollo, bases de datos y fundamentos de programación.',
      platziTitle: 'Aprendizaje Continuo — 100+ Cursos',
      platziDesc: 'IA/ML, Data Science, Desarrollo Full Stack. Desarrollo profesional continuo en tecnologías web modernas e inteligencia artificial.'
    },
    projects: {
      title: 'Proyectos',
      titleHighlight: 'Destacados',
      subtitle: 'Una selección de mis mejores trabajos recientes.',
      viewAll: 'Ver todos los proyectos',
      live: 'En vivo',
      completed: 'Completado',
      featured: 'Destacado',
      openApp: 'Abrir App',
      chatbotDesc: 'Sube un PDF y conversa con él. RAG efímero con LlamaIndex + Groq streaming.',
      ragDesc: 'Pipeline end-to-end de Retrieval-Augmented Generation con LangChain para consulta de repositorios documentales.',
      agentDesc: 'Plataforma de orquestación LLM usando arquitectura ReAct para la ejecución de herramientas autónomas.',
      back: 'Volver al Inicio'
    },
    chatbot: {
      title: 'Chatbot',
      subtitle: 'Sube un PDF y haz preguntas sobre su contenido. (Arquitectura MCP)',
      connected: 'Conectado a MCP',
      disconnected: 'Desconectado',
      clearSession: 'Limpiar sesión',
      docContext: 'Documento Contexto',
      processing: 'Procesando documento...',
      processingSub: 'Extrayendo texto y creando embeddings',
      dropzoneTitle: 'Sube un PDF',
      dropzoneDesc: 'Arrastra y suelta aquí, o haz clic para seleccionar un archivo.',
      docLoaded: 'Documento Cargado',
      info: 'Información',
      infoDesc: 'El documento ha sido procesado, dividido en fragmentos y vectorizado en memoria para esta sesión.',
      helloTitle: '¡Hola! Soy el Chatbot RAG',
      helloDesc: 'Sube un documento PDF en el panel izquierdo y pregúntame lo que necesites saber. Buscaré en el documento para darte una respuesta precisa.',
      inputPlaceholder: 'Escribe tu pregunta aquí...',
      connectingText: 'Conectando con el servidor MCP...',
      prompts: [
        'Dame un resumen del PDF',
        '¿Cuáles son los temas principales?',
        '¿De qué trata este documento?'
      ]
    }
  }
};

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly KEY = 'lang';
  
  // Default language is English as requested
  currentLang = signal<Language>('en');

  // Computed signals for easy access in templates
  t = computed(() => translations[this.currentLang()]);

  constructor() {
    const saved = localStorage.getItem(this.KEY) as Language;
    if (saved && (saved === 'en' || saved === 'es')) {
      this.currentLang.set(saved);
    }
  }

  toggle(): void {
    const newLang = this.currentLang() === 'en' ? 'es' : 'en';
    this.currentLang.set(newLang);
    localStorage.setItem(this.KEY, newLang);
  }
  
  setLang(lang: Language): void {
    this.currentLang.set(lang);
    localStorage.setItem(this.KEY, lang);
  }
}
