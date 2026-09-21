export const profile = {
  name: 'Sunny',
  title: 'Data engineering foundations. Applied AI curiosity.',
  description:
    'Four years in production data engineering. Now building and studying practical generative AI systems, with an emphasis on evidence, reliability, and clear technical decisions.',
  github: 'https://github.com/sunshine-engineer',
  email: 'sunny_sharma2022@outlook.com',
  linkedin: 'https://www.linkedin.com/in/sunny-sharma2022',
  resume: '', // Add public/resume.pdf, then set this to 'resume.pdf'.
};
export function href(path = '') {
  return `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}
