import rss from '@astrojs/rss';
import { published } from '../lib/content';
import { href, profile } from '../config';
export async function GET() {
  return rss({
    title: 'Sunny — Field notes',
    description: profile.description,
    site: 'https://sunshine-engineer.github.io',
    items: (await published('articles'))
      .sort((a, b) => b.data.published.valueOf() - a.data.published.valueOf())
      .map((article) => ({
        title: article.data.title,
        description: article.data.summary,
        pubDate: article.data.published,
        link: href(`articles/${article.id}/`),
      })),
  });
}
