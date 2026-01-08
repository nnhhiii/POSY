import slugify from 'slugify';

export function camelCaseToSnakeCase(s: string): string {
  return s.replace(/([A-Z])/g, (letter) => `_${letter.toLowerCase()}`);
}

export function getSlug(s: string): string {
  return slugify(s, {
    locale: 'vi',
    lower: true,
    remove: undefined,
    replacement: '-',
    strict: true,
    trim: true,
  });
}
