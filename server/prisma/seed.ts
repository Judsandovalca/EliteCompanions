import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CATEGORIES = [
  { name: "VIP", slug: "vip", description: "Premium VIP companions" },
  { name: "Dinner Date", slug: "dinner-date", description: "Perfect dinner companions" },
  { name: "Travel", slug: "travel", description: "Travel companions" },
  { name: "Events", slug: "events", description: "Event and party companions" },
  { name: "New", slug: "new", description: "Newly joined companions" },
];

const CITIES = ["Miami", "New York", "Los Angeles", "Las Vegas", "Chicago", "Houston", "Dallas", "Atlanta"];
const ETHNICITIES = ["Latina", "European", "Asian", "African", "Middle Eastern", "Mixed"];
const BODY_TYPES = ["Slim", "Athletic", "Curvy", "Petite"];
const HAIR_COLORS = ["Blonde", "Brunette", "Black", "Red", "Auburn"];
const EYE_COLORS = ["Brown", "Blue", "Green", "Hazel"];
const NAMES = [
  "Sofia", "Isabella", "Valentina", "Camila", "Natasha", "Adriana", "Elena", "Gabriella",
  "Victoria", "Alessandra", "Lucia", "Daniela", "Mia", "Catalina", "Bianca", "Serena",
  "Tatiana", "Angelica", "Veronica", "Monica", "Carmen", "Rosa", "Diana", "Juliana",
];

const HAIR_TAGS: Record<string, string> = {
  Blonde: "rubia", Brunette: "morena", Black: "pelinegra", Red: "pelirroja", Auburn: "cobriza",
};
const EYE_TAGS: Record<string, string> = {
  Brown: "ojosmarrones", Blue: "ojosazules", Green: "ojosverdes", Hazel: "ojosavellana",
};
const BODY_TAGS: Record<string, string> = {
  Slim: "delgada", Athletic: "fitness", Curvy: "curvilinea", Petite: "petite",
};
const EXTRA_TAGS = ["universitaria", "ejecutiva", "bilingue", "viajes", "nocturna", "elegante", "natural", "sensual", "discreta", "cariñosa"];

// Verified bikini/swimwear model photos from Unsplash
const UNSPLASH_PHOTOS = [
  "photo-1668177943187-77f57d96c692",
  "photo-1713433366641-4138ec16c909",
  "photo-1525713542480-f82dc1e28a17",
  "photo-1645764039609-f17851e0248c",
  "photo-1637526997367-d44a21b2c3c3",
  "photo-1696919424602-b1b4949d0f8b",
  "photo-1511744548432-8037f30bf0c9",
  "photo-1619909803031-a87eb74d3d48",
  "photo-1617492675022-a9a5e036f1b2",
  "photo-1696919424559-e835b3c10dbe",
  "photo-1696919424494-8cd51e319008",
  "photo-1696919424693-ce40deea1d59",
  "photo-1695640427350-f801badad8df",
  "photo-1680920708923-43bb5ec2e1e2",
  "photo-1642503576185-0812b76b5d35",
  "photo-1712927200161-9c0ce5c41d0b",
  "photo-1712927200177-4e839b3dc53e",
  "photo-1651605472795-8c5a9934ae99",
  "photo-1616147503419-500e80be8447",
  "photo-1622912496991-dbed807c72f2",
  "photo-1696608080235-a5b343cd1421",
  "photo-1568047555866-aff737829e07",
  "photo-1626904617311-a09446554c2b",
  "photo-1628538184867-c91cd11e2d78",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function unsplashUrl(photoId: string, w: number, h: number): string {
  return `https://images.unsplash.com/${photoId}?w=${w}&h=${h}&fit=crop&crop=faces,center&auto=format&q=80`;
}

async function main() {
  // Clear existing data
  await prisma.categoriesOnCompanions.deleteMany();
  await prisma.companionImage.deleteMany();
  await prisma.companion.deleteMany();
  await prisma.category.deleteMany();

  // Seed categories
  const categories = await Promise.all(
    CATEGORIES.map((c) => prisma.category.create({ data: c }))
  );

  // Seed companions
  for (let i = 0; i < 48; i++) {
    const name = NAMES[i % NAMES.length];
    const city = pick(CITIES);
    const ethnicity = pick(ETHNICITIES);
    const hairColor = pick(HAIR_COLORS);
    const age = rand(21, 35);

    const bodyType = pick(BODY_TYPES);
    const eyeColor = pick(EYE_COLORS);

    const tags: string[] = [
      HAIR_TAGS[hairColor],
      EYE_TAGS[eyeColor],
      BODY_TAGS[bodyType],
      ...EXTRA_TAGS.filter(() => Math.random() > 0.7),
    ].filter(Boolean);

    const companion = await prisma.companion.create({
      data: {
        name: `${name}`,
        age,
        bio: `Hi, I'm ${name}. I love meeting new people and creating unforgettable experiences. Based in ${city}.`,
        tagline: `${ethnicity} beauty in ${city}`,
        ethnicity,
        bodyType,
        hairColor,
        eyeColor,
        tags,
        height: rand(155, 180),
        languages: ["English", ...(Math.random() > 0.5 ? ["Spanish"] : [])],
        services: ["Dinner Date", "Events", ...(Math.random() > 0.5 ? ["Travel"] : [])],
        availability: "Available",
        city,
        country: "US",
        pricePerHour: rand(200, 800) * 100, // in cents
        rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
        reviewCount: rand(0, 50),
        verified: Math.random() > 0.3,
        featured: Math.random() > 0.7,
        images: {
          create: [
            {
              position: 0,
              s3Key: `companions/${i}/primary.webp`,
              thumbUrl: unsplashUrl(UNSPLASH_PHOTOS[i % UNSPLASH_PHOTOS.length], 200, 267),
              mediumUrl: unsplashUrl(UNSPLASH_PHOTOS[i % UNSPLASH_PHOTOS.length], 600, 800),
              fullUrl: unsplashUrl(UNSPLASH_PHOTOS[i % UNSPLASH_PHOTOS.length], 1200, 1600),
              width: 600,
              height: 800,
              blurHash: "LEHV6nWB2yk8pyo0adR*.7kCMdnj",
              isPrimary: true,
            },
            {
              position: 1,
              s3Key: `companions/${i}/second.webp`,
              thumbUrl: unsplashUrl(UNSPLASH_PHOTOS[(i + 12) % UNSPLASH_PHOTOS.length], 200, 267),
              mediumUrl: unsplashUrl(UNSPLASH_PHOTOS[(i + 12) % UNSPLASH_PHOTOS.length], 600, 800),
              fullUrl: unsplashUrl(UNSPLASH_PHOTOS[(i + 12) % UNSPLASH_PHOTOS.length], 1200, 1600),
              width: 600,
              height: 800,
              blurHash: "LGF5]+Yk^6#M@-5c,1J5@[or[Q6.",
              isPrimary: false,
            },
          ],
        },
        categories: {
          create: (() => {
            const first = pick(categories);
            const rest = categories.filter((c) => c.id !== first.id);
            const entries = [{ categoryId: first.id }];
            if (Math.random() > 0.5 && rest.length > 0) {
              entries.push({ categoryId: pick(rest).id });
            }
            return entries;
          })(),
        },
      },
    });
  }

  const count = await prisma.companion.count();
  console.log(`Seeded ${count} companions and ${CATEGORIES.length} categories`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
