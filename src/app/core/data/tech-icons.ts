import {
  siAngular,
  siReact,
  siVuedotjs,
  siTypescript,
  siJavascript,
  siTailwindcss,
  siHtml5,
  siCss,
  siNodedotjs,
  siExpress,
  siFastapi,
  siPython,
  siDotnet,
  siLangchain,
  siNumpy,
  siPandas,
  siGooglecloud,
  siFirebase,
  siDocker,
  siGit,
  siGithub,
  siGithubactions,
  siPostgresql,
  siMongodb,
  siJupyter,
  siSupabase,
  siGooglegemini,
  siTelegram,
  siHuggingface,
} from 'simple-icons';

interface TechIcon {
  title: string;
  path: string;
}

// Keyword -> icon. Matched against the lowercased tag text with `includes()`,
// longest keyword first, so e.g. "GitHub Actions" resolves before "GitHub" or "Git".
const TECH_ICONS: Record<string, TechIcon> = {
  'github actions': siGithubactions,
  'google cloud': siGooglecloud,
  'hugging face': siHuggingface,
  typescript: siTypescript,
  javascript: siJavascript,
  postgresql: siPostgresql,
  tailwind: siTailwindcss,
  supabase: siSupabase,
  telegram: siTelegram,
  langchain: siLangchain,
  mongodb: siMongodb,
  firebase: siFirebase,
  fastapi: siFastapi,
  jupyter: siJupyter,
  angular: siAngular,
  express: siExpress,
  python: siPython,
  github: siGithub,
  docker: siDocker,
  gemini: siGooglegemini,
  numpy: siNumpy,
  pandas: siPandas,
  html5: siHtml5,
  react: siReact,
  '.net': siDotnet,
  node: siNodedotjs,
  vue: siVuedotjs,
  git: siGit,
  css: siCss,
};

const KEYWORDS = Object.keys(TECH_ICONS).sort((a, b) => b.length - a.length);

export function getTechIcon(tag: string): TechIcon | null {
  const normalized = tag.toLowerCase();
  const keyword = KEYWORDS.find(k => normalized.includes(k));
  return keyword ? TECH_ICONS[keyword] : null;
}
