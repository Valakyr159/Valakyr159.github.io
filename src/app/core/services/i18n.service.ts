import { Injectable, signal, computed } from '@angular/core';

export type Language = 'en' | 'es' | 'pt';

// Static language metadata for the selector — names are proper nouns and
// stay the same regardless of the currently active language.
export const LANGUAGES: { code: Language; label: string; name: string }[] = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'es', label: 'ES', name: 'Español' },
  { code: 'pt', label: 'PT', name: 'Português' },
];

interface ProjectTranslation {
  title: string;
  description: string;
  longDescription?: string;
}

// Translation dictionaries
const translations = {
  en: {
    nav: {
      home: 'Home',
      projects: 'Projects',
      chatbot: 'RAG Chatbot',
      switchTheme: 'Toggle theme',
      language: 'Language'
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
      p2: 'Skilled in LLM orchestration, RAG pipelines, and AI Agents. Experienced delivering LATAM financial compliance solutions and internal engineering tools in Agile/Scrum global teams. Advanced English (C1).',
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
      items: {
        bringit: {
          highlights: [
            "Selected for the 'Make Your Mark' program focused on NetSuite ERP architecture and cloud systems.",
            "Automated Exógenos regulatory reporting by building an end-to-end synchronization system between NetSuite's native database and an external PostgreSQL database, then delivered an embedded Angular application that lets finance users generate compliant reports on demand — eliminating a manual, error-prone process.",
            'Built an internal automated testing platform for QA: a second embedded Angular tool that lets the QA team create, manage, and run their own regression test suites against SuiteScript customizations, reducing the risk of production regressions.',
            'Architected integrations using Angular, Node.js, and PostgreSQL bridging ERP data with external business applications.',
            'Engineered financial localization reporting engines for LATAM regulatory compliance: Exógenos (Colombia), SAT (Mexico), PLE (Peru).',
            'Built and maintained complex server-side business logic using JavaScript, TypeScript, and SuiteScript.',
            'Collaborated in Agile/Scrum methodologies within cross-functional, international development teams.'
          ]
        },
        sutherland: {
          highlights: [
            'Delivered high-tier bilingual technical support with strong SLA compliance.',
            'Strengthened cross-cultural communication and structured problem-solving skills.'
          ]
        }
      }
    },
    education: {
      title: 'Education &',
      titleHighlight: 'Training',
      completed: 'Completed',
      inProgress: 'In progress',
      items: {
        sena: {
          title: 'Software Analysis and Development Technologist',
          description: 'Comprehensive program covering software analysis, development methodologies, databases, and programming fundamentals.'
        },
        platzi: {
          title: 'Continuous Learning — 100+ Courses',
          description: 'AI/ML, Data Science, Full Stack Development. Continuous professional development across modern web technologies and artificial intelligence.'
        }
      }
    },
    projects: {
      title: 'Featured',
      titleHighlight: 'Projects',
      subtitle: 'A selection of my best recent work.',
      viewAll: 'View all projects',
      pageTitle: 'My',
      pageTitleHighlight: 'Projects',
      pageSubtitle: 'Explore my portfolio of projects. From cloud architectures and AI automations to modern, optimized user interfaces.',
      live: 'Live',
      completed: 'Completed',
      inProgress: 'In Development',
      featured: 'Featured',
      openApp: 'Open App',
      screenshotAlt: 'screenshot',
      items: {
        'chatbot-rag': {
          title: 'Real-Time RAG Chatbot',
          description: 'Upload a PDF and chat with it. Ephemeral RAG with LlamaIndex + Groq streaming.',
          longDescription: 'AI-powered chat system that lets you upload PDF documents and ask questions about their content in real time. Uses Retrieval-Augmented Generation (RAG) with ephemeral vectors that are deleted when the session ends, guaranteeing user privacy.'
        },
        'caza-casas': {
          title: 'Mily Caza Casas',
          description: 'Free PWA for finding rentals in Bogotá: automated daily scraping plus manual listings, Telegram notifications, and pet-friendly filters.',
          longDescription: 'Monorepo with an Angular frontend, a Playwright scraper running daily via GitHub Actions, and a Supabase backend (Postgres, Auth, Edge Functions). Dashboard with the day’s new listings, favorites, a map, and automatic Telegram notifications. Includes a chat assistant powered by Gemini Flash 2.5 to help users find rentals.'
        },
        'patitas-a-la-obra': {
          title: 'Patitas a la Obra',
          description: 'Interior remodeling PWA with an AI chatbot (Mily): on-device vision and RAG against real inventory via MCP architecture.',
          longDescription: 'Upload a photo of your space and the app segments the image on-device, recommends real materials from a catalog via RAG, and generates a preview of the result with generative AI (Gemini). Includes appointment scheduling with automatic Telegram and email notifications.'
        },
        'bares-rock': {
          title: 'Bares Rock',
          description: 'Coming soon.'
        },
        'netsuite-cert-prep': {
          title: 'NetSuite Cert Prep',
          description: 'Exam simulator for the NetSuite SuiteFoundation certification, with a timer, question navigation, and multiple question banks.',
          longDescription: 'Standalone Angular app that lets you pick a question set (multiple sources), choose whether answers are shown instantly or at the end, randomize the order, and track progress with a circular timer and a question navigation panel.'
        }
      } as Record<string, ProjectTranslation>
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
      uploadFirstHint: 'Upload a PDF first to start asking questions.',
      enterHint: 'Press Enter to send, Shift+Enter for a new line.',
      invalidFile: 'Please upload PDF files only.',
      uploadError: 'Error uploading the file. Make sure the backend is running.',
      confirmClear: 'Are you sure you want to clear the current session? The PDF and chat history will be deleted.',
      prompts: [
        'Give me a summary of the PDF',
        'What are the main topics?',
        'Who is the author?'
      ]
    },
    footer: {
      rights: 'All rights reserved.'
    }
  },
  es: {
    nav: {
      home: 'Inicio',
      projects: 'Proyectos',
      chatbot: 'Chatbot RAG',
      switchTheme: 'Cambiar tema',
      language: 'Idioma'
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
      p2: 'Habilidades en orquestación de LLMs, pipelines RAG y Agentes de IA. Experiencia entregando soluciones de cumplimiento financiero y herramientas internas de ingeniería para LATAM en equipos globales Ágiles/Scrum. Inglés avanzado (C1).',
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
      db: 'Bases de Datos y Herramientas'
    },
    experience: {
      title: 'Experiencia',
      titleHighlight: 'Profesional',
      items: {
        bringit: {
          highlights: [
            "Seleccionado para el programa 'Make Your Mark' enfocado en arquitectura ERP NetSuite y sistemas cloud.",
            'Automatización del reporte regulatorio de Exógenos: diseñé y construí un sistema de sincronización end-to-end entre la base de datos nativa de NetSuite y una base de datos externa en PostgreSQL, y entregué una aplicación Angular embebida que permite a los usuarios de finanzas generar reportes conformes bajo demanda, eliminando un proceso manual y propenso a errores.',
            'Construcción de una plataforma interna de pruebas automatizadas para QA: una segunda herramienta Angular embebida que permite al equipo de QA crear, gestionar y ejecutar sus propias suites de pruebas de regresión sobre las personalizaciones de SuiteScript, reduciendo el riesgo de regresiones en producción.',
            'Diseño de integraciones usando Angular, Node.js y PostgreSQL conectando datos del ERP con aplicaciones de negocio externas.',
            'Desarrollo de motores de reportes de localización financiera para LATAM: Exógenos (Colombia), SAT (México), PLE (Perú).',
            'Construcción y mantenimiento de lógica de negocio del lado del servidor usando JavaScript, TypeScript y SuiteScript.',
            'Colaboración bajo metodologías Agile/Scrum en equipos de desarrollo internacionales multidisciplinarios.'
          ]
        },
        sutherland: {
          highlights: [
            'Soporte técnico bilingüe de alto nivel con estricto cumplimiento de SLAs.',
            'Fortalecimiento de comunicación intercultural y resolución estructurada de problemas.'
          ]
        }
      }
    },
    education: {
      title: 'Educación y',
      titleHighlight: 'Formación',
      completed: 'Completado',
      inProgress: 'En curso',
      items: {
        sena: {
          title: 'Tecnólogo en Análisis y Desarrollo de Software',
          description: 'Programa integral que abarca análisis de software, metodologías de desarrollo, bases de datos y fundamentos de programación.'
        },
        platzi: {
          title: 'Aprendizaje Continuo — 100+ Cursos',
          description: 'IA/ML, Data Science, Desarrollo Full Stack. Desarrollo profesional continuo en tecnologías web modernas e inteligencia artificial.'
        }
      }
    },
    projects: {
      title: 'Proyectos',
      titleHighlight: 'Destacados',
      subtitle: 'Una selección de mis mejores trabajos recientes.',
      viewAll: 'Ver todos los proyectos',
      pageTitle: 'Mis',
      pageTitleHighlight: 'Proyectos',
      pageSubtitle: 'Explora mi portfolio de proyectos. Desde arquitecturas cloud y automatizaciones con IA, hasta interfaces de usuario modernas y optimizadas.',
      live: 'En vivo',
      completed: 'Completado',
      inProgress: 'En desarrollo',
      featured: 'Destacado',
      openApp: 'Abrir App',
      screenshotAlt: 'captura de pantalla',
      items: {
        'chatbot-rag': {
          title: 'Chatbot RAG en Tiempo Real',
          description: 'Sube un PDF y conversa con él. RAG efímero con LlamaIndex + Groq streaming.',
          longDescription: 'Sistema de chat con inteligencia artificial que permite subir documentos PDF y hacer preguntas sobre su contenido en tiempo real. Utiliza Retrieval-Augmented Generation (RAG) con vectores efímeros que se eliminan al cerrar la sesión, garantizando la privacidad del usuario.'
        },
        'caza-casas': {
          title: 'Mily Caza Casas',
          description: 'PWA gratuita para buscar arriendos en Bogotá: scraping diario automatizado + alta manual, notificaciones por Telegram y filtros pet-friendly.',
          longDescription: 'Monorepo con frontend Angular, un scraper con Playwright que corre a diario vía GitHub Actions, y backend en Supabase (Postgres, Auth, Edge Functions). Dashboard con anuncios nuevos del día, favoritos, mapa y notificaciones automáticas por Telegram. Incluye un asistente de chat impulsado por Gemini Flash 2.5 para ayudar a los usuarios a encontrar arriendos.'
        },
        'patitas-a-la-obra': {
          title: 'Patitas a la Obra',
          description: 'PWA de remodelación de interiores con chatbot IA (Mily): visión on-device y RAG contra inventario real vía arquitectura MCP.',
          longDescription: 'Sube una foto de tu espacio y la app segmenta la imagen on-device, recomienda materiales reales de un catálogo vía RAG, y genera previews con IA generativa (Gemini) del resultado. Incluye agendamiento de citas con notificaciones automáticas por Telegram y email.'
        },
        'bares-rock': {
          title: 'Bares Rock',
          description: 'Próximamente.'
        },
        'netsuite-cert-prep': {
          title: 'NetSuite Cert Prep',
          description: 'Simulador de examen para la certificación NetSuite SuiteFoundation, con temporizador, navegación entre preguntas y varios bancos de preguntas.',
          longDescription: 'App Angular standalone que permite elegir un set de preguntas (varias fuentes), configurar si se muestran las respuestas al instante o al final, aleatorizar el orden, y hacer seguimiento del progreso con un temporizador circular y un panel de navegación de preguntas.'
        }
      } as Record<string, ProjectTranslation>
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
      uploadFirstHint: 'Sube un PDF primero para empezar a preguntar.',
      enterHint: 'Presiona Enter para enviar, Shift+Enter para nueva línea.',
      invalidFile: 'Por favor, sube únicamente archivos PDF.',
      uploadError: 'Error al subir el archivo. Asegúrate de que el backend esté ejecutándose.',
      confirmClear: '¿Estás seguro de que deseas limpiar la sesión actual? Se borrará el PDF y el historial de chat.',
      prompts: [
        'Dame un resumen del PDF',
        '¿Cuáles son los temas principales?',
        '¿De qué trata este documento?'
      ]
    },
    footer: {
      rights: 'Todos los derechos reservados.'
    }
  },
  pt: {
    nav: {
      home: 'Início',
      projects: 'Projetos',
      chatbot: 'Chatbot RAG',
      switchTheme: 'Alternar tema',
      language: 'Idioma'
    },
    home: {
      available: 'Disponível para projetos',
      title: 'AI Solutions Architect',
      description: 'Full Stack Software Engineer e Machine Learning Engineer com experiência prática em desenvolvimento de ERP, integrações web e sistemas de IA/ML.',
      viewProjects: 'Ver projetos',
      downloadCV: 'Baixar CV'
    },
    about: {
      title: 'Sobre mim',
      p1: 'Full Stack Software Engineer e Machine Learning Engineer com experiência prática em desenvolvimento de ERP NetSuite, integrações web e sistemas de IA/ML. Proficiente em Angular, Node.js, TypeScript, Python e SuiteScript.',
      p2: 'Experiência em orquestração de LLMs, pipelines RAG e Agentes de IA. Experiência entregando soluções de conformidade financeira e ferramentas internas de engenharia para a América Latina em equipes globais Agile/Scrum. Inglês avançado (C1).',
      stats: {
        years: 'Anos Exp.',
        tech: 'Tecnologias',
        projects: 'Projetos',
        courses: 'Cursos'
      }
    },
    skills: {
      title: 'Stack',
      titleHighlight: 'Técnico',
      subtitle: 'Tecnologias e ferramentas que uso para construir soluções de nível world-class.',
      frontend: 'Frontend',
      backend: 'Backend',
      ai: 'IA / ML',
      cloud: 'Cloud & DevOps',
      db: 'Bancos de Dados e Ferramentas'
    },
    experience: {
      title: 'Experiência',
      titleHighlight: 'Profissional',
      items: {
        bringit: {
          highlights: [
            "Selecionado para o programa 'Make Your Mark', focado em arquitetura ERP NetSuite e sistemas em nuvem.",
            'Automatização do relatório regulatório Exógenos: projetei e construí um sistema de sincronização end-to-end entre o banco de dados nativo do NetSuite e um banco de dados externo em PostgreSQL, e entreguei uma aplicação Angular embutida que permite à equipe financeira gerar relatórios em conformidade sob demanda, eliminando um processo manual e propenso a erros.',
            'Construção de uma plataforma interna de testes automatizados para QA: uma segunda ferramenta Angular embutida que permite à equipe de QA criar, gerenciar e executar suas próprias suítes de testes de regressão sobre as personalizações do SuiteScript, reduzindo o risco de regressões em produção.',
            'Arquitetou integrações usando Angular, Node.js e PostgreSQL conectando dados do ERP com aplicações de negócio externas.',
            'Desenvolveu motores de relatórios de localização financeira para conformidade regulatória na América Latina: Exógenos (Colômbia), SAT (México), PLE (Peru).',
            'Construiu e manteve lógica de negócio complexa no lado do servidor usando JavaScript, TypeScript e SuiteScript.',
            'Colaborou em metodologias Agile/Scrum em equipes de desenvolvimento internacionais multidisciplinares.'
          ]
        },
        sutherland: {
          highlights: [
            'Prestou suporte técnico bilíngue de alto nível com forte cumprimento de SLAs.',
            'Fortaleceu a comunicação intercultural e habilidades estruturadas de resolução de problemas.'
          ]
        }
      }
    },
    education: {
      title: 'Educação e',
      titleHighlight: 'Formação',
      completed: 'Concluído',
      inProgress: 'Em andamento',
      items: {
        sena: {
          title: 'Tecnólogo em Análise e Desenvolvimento de Software',
          description: 'Programa abrangente que cobre análise de software, metodologias de desenvolvimento, bancos de dados e fundamentos de programação.'
        },
        platzi: {
          title: 'Aprendizado Contínuo — 100+ Cursos',
          description: 'IA/ML, Data Science, Desenvolvimento Full Stack. Desenvolvimento profissional contínuo em tecnologias web modernas e inteligência artificial.'
        }
      }
    },
    projects: {
      title: 'Projetos',
      titleHighlight: 'em Destaque',
      subtitle: 'Uma seleção dos meus melhores trabalhos recentes.',
      viewAll: 'Ver todos os projetos',
      pageTitle: 'Meus',
      pageTitleHighlight: 'Projetos',
      pageSubtitle: 'Explore meu portfólio de projetos. De arquiteturas em nuvem e automações com IA a interfaces de usuário modernas e otimizadas.',
      live: 'Ao vivo',
      completed: 'Concluído',
      inProgress: 'Em desenvolvimento',
      featured: 'Destaque',
      openApp: 'Abrir App',
      screenshotAlt: 'captura de tela',
      items: {
        'chatbot-rag': {
          title: 'Chatbot RAG em Tempo Real',
          description: 'Envie um PDF e converse com ele. RAG efêmero com LlamaIndex + streaming via Groq.',
          longDescription: 'Sistema de chat com inteligência artificial que permite enviar documentos PDF e fazer perguntas sobre seu conteúdo em tempo real. Utiliza Retrieval-Augmented Generation (RAG) com vetores efêmeros que são excluídos ao encerrar a sessão, garantindo a privacidade do usuário.'
        },
        'caza-casas': {
          title: 'Mily Caza Casas',
          description: 'PWA gratuito para buscar aluguéis em Bogotá: scraping diário automatizado + cadastro manual, notificações via Telegram e filtros pet-friendly.',
          longDescription: 'Monorepo com frontend em Angular, um scraper com Playwright que roda diariamente via GitHub Actions, e backend em Supabase (Postgres, Auth, Edge Functions). Dashboard com os novos anúncios do dia, favoritos, mapa e notificações automáticas via Telegram. Inclui um assistente de chat baseado em Gemini Flash 2.5 para ajudar os usuários a encontrar aluguéis.'
        },
        'patitas-a-la-obra': {
          title: 'Patitas a la Obra',
          description: 'PWA de reforma de interiores com chatbot de IA (Mily): visão on-device e RAG contra inventário real via arquitetura MCP.',
          longDescription: 'Envie uma foto do seu ambiente e o app segmenta a imagem on-device, recomenda materiais reais de um catálogo via RAG, e gera prévias do resultado com IA generativa (Gemini). Inclui agendamento de visitas com notificações automáticas via Telegram e e-mail.'
        },
        'bares-rock': {
          title: 'Bares Rock',
          description: 'Em breve.'
        },
        'netsuite-cert-prep': {
          title: 'NetSuite Cert Prep',
          description: 'Simulador de exame para a certificação NetSuite SuiteFoundation, com temporizador, navegação entre questões e vários bancos de questões.',
          longDescription: 'App Angular standalone que permite escolher um conjunto de questões (várias fontes), configurar se as respostas aparecem na hora ou no final, randomizar a ordem, e acompanhar o progresso com um temporizador circular e um painel de navegação de questões.'
        }
      } as Record<string, ProjectTranslation>
    },
    chatbot: {
      title: 'Chatbot',
      subtitle: 'Envie um PDF e faça perguntas sobre o conteúdo dele. (Arquitetura MCP)',
      connected: 'Conectado ao MCP',
      disconnected: 'Desconectado',
      clearSession: 'Limpar sessão',
      docContext: 'Documento de Contexto',
      processing: 'Processando documento...',
      processingSub: 'Extraindo texto e gerando embeddings',
      dropzoneTitle: 'Envie um PDF',
      dropzoneDesc: 'Arraste e solte aqui, ou clique para selecionar um arquivo.',
      docLoaded: 'Documento Carregado',
      info: 'Informação',
      infoDesc: 'O documento foi processado, dividido em fragmentos e vetorizado em memória para esta sessão.',
      helloTitle: 'Olá! Eu sou o Chatbot RAG',
      helloDesc: 'Envie um documento PDF no painel esquerdo e me pergunte o que precisar saber. Vou buscar no documento para te dar uma resposta precisa.',
      inputPlaceholder: 'Digite sua pergunta aqui...',
      connectingText: 'Conectando ao servidor MCP...',
      uploadFirstHint: 'Envie um PDF primeiro para começar a fazer perguntas.',
      enterHint: 'Pressione Enter para enviar, Shift+Enter para nova linha.',
      invalidFile: 'Por favor, envie apenas arquivos PDF.',
      uploadError: 'Erro ao enviar o arquivo. Verifique se o backend está em execução.',
      confirmClear: 'Tem certeza de que deseja limpar a sessão atual? O PDF e o histórico de chat serão apagados.',
      prompts: [
        'Me dê um resumo do PDF',
        'Quais são os principais tópicos?',
        'Quem é o autor?'
      ]
    },
    footer: {
      rights: 'Todos os direitos reservados.'
    }
  }
};

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly KEY = 'lang';
  readonly languages = LANGUAGES;

  // Default language is English as requested
  currentLang = signal<Language>('en');

  // Computed signals for easy access in templates
  t = computed(() => translations[this.currentLang()]);

  constructor() {
    const saved = localStorage.getItem(this.KEY) as Language;
    if (saved && (saved === 'en' || saved === 'es' || saved === 'pt')) {
      this.currentLang.set(saved);
    }
  }

  toggle(): void {
    const order: Language[] = ['en', 'es', 'pt'];
    const next = order[(order.indexOf(this.currentLang()) + 1) % order.length];
    this.setLang(next);
  }

  setLang(lang: Language): void {
    this.currentLang.set(lang);
    localStorage.setItem(this.KEY, lang);
  }
}
