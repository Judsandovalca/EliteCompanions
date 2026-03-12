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

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
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

    const companion = await prisma.companion.create({
      data: {
        name: `${name}`,
        age,
        bio: `Hi, I'm ${name}. I love meeting new people and creating unforgettable experiences. Based in ${city}.`,
        tagline: `${ethnicity} beauty in ${city}`,
        ethnicity,
        bodyType: pick(BODY_TYPES),
        hairColor,
        eyeColor: pick(EYE_COLORS),
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
              thumbUrl: `https://picsum.photos/seed/comp${i}/200/267`,
              mediumUrl: `https://picsum.photos/seed/comp${i}/600/800`,
              fullUrl: `https://picsum.photos/seed/comp${i}/1200/1600`,
              width: 200,
              height: 267,
              blurHash: "LEHV6nWB2yk8pyo0adR*.7kCMdnj",
              isPrimary: true,
            },
            {
              position: 1,
              s3Key: `companions/${i}/second.webp`,
              thumbUrl: `https://picsum.photos/seed/comp${i}b/200/267`,
              mediumUrl: `https://picsum.photos/seed/comp${i}b/600/800`,
              fullUrl: `https://picsum.photos/seed/comp${i}b/1200/1600`,
              width: 200,
              height: 267,
              blurHash: "LGF5]+Yk^6#M@-5c,1J5@[or[Q6.",
              isPrimary: false,
            },
          ],
        },
        categories: {
          create: [
            { categoryId: pick(categories).id },
            ...(Math.random() > 0.5 ? [{ categoryId: pick(categories).id }] : []),
          ],
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
