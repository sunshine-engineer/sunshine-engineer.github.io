import { defineCollection, reference } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const common = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(true),
  cover: z.string().optional(),
});
const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: common.extend({
    repository: z.url(),
    status: z.enum(['In progress', 'Portfolio prototype', 'Complete']),
    featuredOrder: z.number().int().positive().optional(),
    demo: z.url().optional(),
    video: reference('videos').optional(),
  }),
});
const articles = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/articles' }),
  schema: common.extend({
    published: z.coerce.date(),
    updated: z.coerce.date().optional(),
  }),
});
const videos = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/videos' }),
  schema: common
    .extend({
      published: z.coerce.date(),
      youtubeId: z
        .string()
        .regex(/^[A-Za-z0-9_-]{11}$/)
        .optional(),
      project: reference('projects').optional(),
      article: reference('articles').optional(),
    })
    .refine((data) => data.draft || Boolean(data.youtubeId), {
      message: 'Published videos need a YouTube video ID.',
    }),
});
export const collections = { projects, articles, videos };
