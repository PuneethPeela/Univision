const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required to run the script.');
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting credentials update...');
  
  // Hash passwords
  const demoHash = await bcrypt.hash('demo123', 12);
  const adminHash = await bcrypt.hash('admin123', 12);
  
  // 1. Update demo@example.com
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: { passwordHash: demoHash },
    create: {
      email: 'demo@example.com',
      name: 'Demo Scholar',
      passwordHash: demoHash,
      gpa: 3.8,
      sat: 1450,
      major: 'Computer Science'
    }
  });
  console.log('Updated demo scholar user:', demoUser.email);

  // 2. Update/Create peelapuneeth@gmail.com
  const adminUser = await prisma.user.upsert({
    where: { email: 'peelapuneeth@gmail.com' },
    update: { passwordHash: adminHash },
    create: {
      email: 'peelapuneeth@gmail.com',
      name: 'Evaluator Admin',
      passwordHash: adminHash,
      gpa: 4.0,
      sat: 1600,
      major: 'Computer Science'
    }
  });
  console.log('Updated evaluator admin user:', adminUser.email);
  console.log('Database credentials sync completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error running script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
