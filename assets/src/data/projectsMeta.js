// ✏️ Project facts — the single source of truth (pure data, no asset imports).
// `i18nIndex` points at the matching entry in projects.items of the locale files, so the
// DISPLAY order (`order`) can change without reordering the translated arrays.
export const PROJECTS_META = [
  {
    i18nIndex: 0,
    _id: 'project-one',
    title: 'Project One',
    subtitle: 'What it is in a few words',
    description: 'One or two sentences about the product.',
    tags: ['React', 'Node.js', 'PostgreSQL'],
    liveUrl: 'https://example.com/',   // null when there is no public demo
    color: '#5b8cff',
    order: 1,
  },
  {
    i18nIndex: 1,
    _id: 'project-two',
    title: 'Project Two',
    subtitle: 'Another product',
    description: 'One or two sentences about the product.',
    tags: ['Next.js', 'MongoDB'],
    liveUrl: null,
    color: '#ff6b9d',
    order: 2,
  },
]
