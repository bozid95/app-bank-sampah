import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '../src/generated/prisma/client';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

const username = (process.env.ADMIN_USERNAME || 'admin').trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;

if (!password || password.length < 8) {
  console.error('Set ADMIN_PASSWORD (minimal 8 karakter) di .env sebelum seed.');
  process.exit(1);
}

const existing = await prisma.user.findUnique({ where: { username } });
if (existing) {
  console.log(`Admin "${username}" sudah ada, dilewati.`);
} else {
  await prisma.user.create({
    data: { username, passwordHash: await bcrypt.hash(password, 12), role: 'ADMIN' },
  });
  console.log(`Admin "${username}" dibuat.`);
}

const wasteTypes: [string, number][] = [
  ['Plastik botol (PET)', 3000],
  ['Plastik campur', 1000],
  ['Kardus', 1500],
  ['Kertas / HVS', 1800],
  ['Besi', 3500],
  ['Kaleng aluminium', 9000],
  ['Botol kaca', 500],
];
for (const [name, pricePerKg] of wasteTypes) {
  await prisma.wasteType.upsert({ where: { name }, update: {}, create: { name, pricePerKg } });
}
console.log('Jenis sampah awal siap.');

await prisma.$disconnect();
