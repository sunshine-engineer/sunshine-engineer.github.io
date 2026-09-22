export const profile = {
  name: 'Sunny Sharma',
  title: 'Applied GenAI & Data Engineer',
  description:
    'Sunny Sharma — Applied GenAI & Data Engineer. Approximately four years in enterprise data engineering, with independent projects in RAG, Python APIs, tool-using agents, and natural-language SQL. Based in Delhi NCR.',
  github: 'https://github.com/sunshine-engineer',
  email: 'sunny_sharma2022@outlook.com',
  linkedin: 'https://www.linkedin.com/in/sunny-sharma2022',
  resume: '', // Add public/resume.pdf, then set this to 'resume.pdf'.
};
export function href(path = '') {
  return `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}
