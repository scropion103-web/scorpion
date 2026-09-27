import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Category } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

type SeedProduct = {
  slug: string;
  category: Category;
  color: string;
  shape: number;
  price50: number;
  price100: number;
  salePercent?: number;
  nameAr: string;
  nameEn: string;
  notesAr: string[];
  notesEn: string[];
};

const PRODUCTS: SeedProduct[] = [
  { slug: "oud-of-the-night", category: Category.MEN, color: "#1B1A17", shape: 0, price50: 850, price100: 1400,
    nameAr: "عود الليل", nameEn: "Oud of the Night", notesAr: ["عود", "عنبر", "فانيليا"], notesEn: ["Oud", "Amber", "Vanilla"] },
  { slug: "cedar-wood", category: Category.MEN, color: "#3B2A1E", shape: 1, price50: 780, price100: 1290, salePercent: 15,
    nameAr: "خشب الأرز", nameEn: "Cedar Wood", notesAr: ["أرز", "فلفل أسود", "جلد"], notesEn: ["Cedar", "Black pepper", "Leather"] },
  { slug: "faris", category: Category.MEN, color: "#26343F", shape: 3, price50: 720, price100: 1190,
    nameAr: "فارس", nameEn: "Faris", notesAr: ["برغموت", "لافندر", "مسك"], notesEn: ["Bergamot", "Lavender", "Musk"] },
  { slug: "taif-rose", category: Category.WOMEN, color: "#6B2F3F", shape: 2, price50: 800, price100: 1320,
    nameAr: "ورد الطائف", nameEn: "Taif Rose", notesAr: ["ورد طائفي", "فانيليا", "مسك أبيض"], notesEn: ["Taif rose", "Vanilla", "White musk"] },
  { slug: "dawn-jasmine", category: Category.WOMEN, color: "#8A6A3A", shape: 0, price50: 760, price100: 1250, salePercent: 20,
    nameAr: "ياسمين الفجر", nameEn: "Dawn Jasmine", notesAr: ["ياسمين", "برتقال", "صندل"], notesEn: ["Jasmine", "Orange", "Sandalwood"] },
  { slug: "pearl", category: Category.WOMEN, color: "#4C3A57", shape: 1, price50: 690, price100: 1150,
    nameAr: "لؤلؤة", nameEn: "Pearl", notesAr: ["إجاص", "زنبق", "عنبر"], notesEn: ["Pear", "Lily", "Amber"] },
  { slug: "cardamom-coffee", category: Category.UNISEX, color: "#4A2F20", shape: 3, price50: 740, price100: 1220,
    nameAr: "قهوة وهيل", nameEn: "Cardamom Coffee", notesAr: ["قهوة", "هيل", "كراميل"], notesEn: ["Coffee", "Cardamom", "Caramel"] },
  { slug: "cloud-musk", category: Category.UNISEX, color: "#5B6470", shape: 2, price50: 680, price100: 1120, salePercent: 10,
    nameAr: "مسك الغيم", nameEn: "Cloud Musk", notesAr: ["مسك", "كشمير", "خشب أبيض"], notesEn: ["Musk", "Cashmere", "White wood"] },
  { slug: "evening-incense", category: Category.UNISEX, color: "#2E3B34", shape: 0, price50: 820, price100: 1350,
    nameAr: "بخور المساء", nameEn: "Evening Incense", notesAr: ["بخور", "ريحان", "خشب الصندل"], notesEn: ["Incense", "Basil", "Sandalwood"] },
  { slug: "desert-gold", category: Category.NICHE, color: "#7A5626", shape: 1, price50: 1650, price100: 2700,
    nameAr: "ذهب الصحراء", nameEn: "Desert Gold", notesAr: ["زعفران", "عود", "جلد"], notesEn: ["Saffron", "Oud", "Leather"] },
  { slug: "royal-amber", category: Category.NICHE, color: "#5E2B26", shape: 3, price50: 1800, price100: 2950,
    nameAr: "عنبر ملكي", nameEn: "Royal Amber", notesAr: ["عنبر", "لبان", "باتشولي"], notesEn: ["Amber", "Frankincense", "Patchouli"] },
  { slug: "saffron-secret", category: Category.NICHE, color: "#1B1A17", shape: 2, price50: 1700, price100: 2800, salePercent: 15,
    nameAr: "سرّ الزعفران", nameEn: "Saffron Secret", notesAr: ["زعفران", "ورد", "مسك أسود"], notesEn: ["Saffron", "Rose", "Black musk"] },
];

async function main() {
  // settings row
  await prisma.setting.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } });

  // products
  for (const [i, p] of PRODUCTS.entries()) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: { ...p, salePercent: p.salePercent ?? 0, stock50: 25, stock100: 25, sortOrder: i, isFeatured: i % 4 === 0 },
    });
  }

  // welcome coupon
  await prisma.coupon.upsert({
    where: { code: "WELCOME15" },
    update: {},
    create: { code: "WELCOME15", percent: 15 },
  });

  // first admin
  const email = (process.env.ADMIN_EMAIL ?? "admin@perfumecafe.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "ChangeMe123!";
  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: process.env.ADMIN_NAME ?? "Admin",
      role: "ADMIN",
      passwordHash: await bcrypt.hash(password, 12),
    },
  });

  console.log(`✔ Seed complete. Admin: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
