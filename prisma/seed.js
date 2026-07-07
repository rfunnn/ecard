'use strict';
const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');

const adapter = new PrismaMariaDb(process.env.DATABASE_URL);
const prisma = new PrismaClient({ adapter });

const templates = [
  {
    slug: 'wedding-classic',
    name: 'Wedding Classic',
    nameMs: 'Perkahwinan Klasik',
    category: 'WEDDING',
    thumbnail: '',
    sortOrder: 1,
    defaultConfig: {
      primaryColor: '#D4AF37',
      secondaryColor: '#FFF8E7',
      accentColor: '#8B6914',
      bgColor: '#1a0a00',
      titleFont: 'Playfair Display',
      bodyFont: 'Lato',
      titleSize: 32,
      bodySize: 15,
      titleColor: '#D4AF37',
      bodyColor: '#F5E6C8',
      textAlign: 'center',
      bgOpacity: 0.85,
    },
  },
  {
    slug: 'wedding-modern',
    name: 'Wedding Modern',
    nameMs: 'Perkahwinan Moden',
    category: 'WEDDING',
    thumbnail: '',
    sortOrder: 2,
    defaultConfig: {
      primaryColor: '#C0A050',
      secondaryColor: '#F0E8D0',
      accentColor: '#806830',
      bgColor: '#0d0d0d',
      titleFont: 'Cinzel',
      bodyFont: 'Montserrat',
      titleSize: 28,
      bodySize: 14,
      titleColor: '#C0A050',
      bodyColor: '#E8DCC8',
      textAlign: 'center',
      bgOpacity: 0.9,
    },
  },
  {
    slug: 'birthday-fun',
    name: 'Birthday Fun',
    nameMs: 'Hari Jadi Ceria',
    category: 'BIRTHDAY',
    thumbnail: '',
    sortOrder: 3,
    defaultConfig: {
      primaryColor: '#8B5CF6',
      secondaryColor: '#EDE9FE',
      accentColor: '#6D28D9',
      bgColor: '#0a0a1a',
      titleFont: 'Dancing Script',
      bodyFont: 'Lato',
      titleSize: 36,
      bodySize: 15,
      titleColor: '#A78BFA',
      bodyColor: '#E0D9FF',
      textAlign: 'center',
      bgOpacity: 0.85,
    },
  },
  {
    slug: 'birthday-elegant',
    name: 'Birthday Elegant',
    nameMs: 'Hari Jadi Elegan',
    category: 'BIRTHDAY',
    thumbnail: '',
    sortOrder: 4,
    defaultConfig: {
      primaryColor: '#EC4899',
      secondaryColor: '#FDF2F8',
      accentColor: '#BE185D',
      bgColor: '#1a0011',
      titleFont: 'Great Vibes',
      bodyFont: 'Lato',
      titleSize: 40,
      bodySize: 14,
      titleColor: '#F9A8D4',
      bodyColor: '#FCE7F3',
      textAlign: 'center',
      bgOpacity: 0.88,
    },
  },
  {
    slug: 'corporate-pro',
    name: 'Corporate Professional',
    nameMs: 'Korporat Profesional',
    category: 'CORPORATE',
    thumbnail: '',
    sortOrder: 5,
    defaultConfig: {
      primaryColor: '#10B981',
      secondaryColor: '#ECFDF5',
      accentColor: '#059669',
      bgColor: '#0a1a0a',
      titleFont: 'Montserrat',
      bodyFont: 'Open Sans',
      titleSize: 28,
      bodySize: 14,
      titleColor: '#6EE7B7',
      bodyColor: '#D1FAE5',
      textAlign: 'left',
      bgOpacity: 0.9,
    },
  },
  {
    slug: 'generic-classic',
    name: 'Generic Classic',
    nameMs: 'Umum Klasik',
    category: 'GENERIC',
    thumbnail: '',
    sortOrder: 6,
    defaultConfig: {
      primaryColor: '#D4AF37',
      secondaryColor: '#FFF8E7',
      accentColor: '#8B6914',
      bgColor: '#0a0a0a',
      titleFont: 'Playfair Display',
      bodyFont: 'Lato',
      titleSize: 30,
      bodySize: 15,
      titleColor: '#D4AF37',
      bodyColor: '#F5E6C8',
      textAlign: 'center',
      bgOpacity: 0.85,
    },
  },
];

async function main() {
  console.log('Seeding templates...');
  for (const t of templates) {
    await prisma.template.upsert({
      where: { slug: t.slug },
      update: { name: t.name, nameMs: t.nameMs, defaultConfig: t.defaultConfig, sortOrder: t.sortOrder },
      create: t,
    });
    console.log(`  ✓ ${t.nameMs}`);
  }
  console.log('Done!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
