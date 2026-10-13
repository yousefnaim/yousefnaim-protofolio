// ✏️ Replace every value with your own. Pure data (no React / asset imports) so the
// /api/chat assistant can read it on the server too.
export const SITE = {
  name: 'Your Name',                // shown in the loader, aria labels, assistant
  nameAr: 'اسمك',
  firstName: 'Your',                // giant hero name (two lines)
  lastName: 'Name',
  firstNameAr: 'اسمك',
  lastNameAr: 'عائلتك',
  brandEn: 'YN',                    // initials in the nav logo
  brandAr: 'اسمك',
  location: 'City, Country',
  city: 'City',                     // footer clock label
  timeZone: 'UTC',            // any IANA zone, e.g. 'Europe/Berlin'
}

export const CONTACT = {
  email: 'you@example.com',
  phone: '+000 000 000 000',
  whatsapp: 'https://wa.me/000000000000',
  gmail: 'https://mail.google.com/mail/?view=cm&fs=1&to=you@example.com',
  // https://www.emailjs.com — public identifiers only (these are designed to be public).
  // Leave blank to disable the form.
  emailjs: { service: '', template: '', key: '' },
}

// Tech names stay in English in both languages; 3 columns, grouped like skills.categories
export const STACK = [
  ['React', 'TypeScript', 'Node.js', 'Express'],
  ['PostgreSQL', 'MongoDB', 'Prisma', 'REST APIs'],
  ['Tailwind CSS', 'React Native', 'Git', 'Docker'],
]
export const TOOLS = ['Figma', 'VS Code', 'npm', 'Firebase']
