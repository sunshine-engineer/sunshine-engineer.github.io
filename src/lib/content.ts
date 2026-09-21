import { getCollection, type CollectionKey } from 'astro:content';
export async function published<C extends CollectionKey>(collection: C) {
  return getCollection(collection, ({ data }) => !data.draft);
}
export const dateLabel = (date: Date) =>
  new Intl.DateTimeFormat('en', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
