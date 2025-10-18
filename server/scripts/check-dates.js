import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDates() {
  console.log('Checking all food entries in database...\n');

  const entries = await prisma.foodEntry.findMany({
    orderBy: {
      date: 'desc',
    },
    take: 20,
  });

  console.log(`Found ${entries.length} recent entries:\n`);

  entries.forEach((entry, idx) => {
    const localDate = new Date(entry.date);
    console.log(`${idx + 1}. ${entry.foodName}`);
    console.log(`   Date (UTC): ${entry.date.toISOString()}`);
    console.log(
      `   Date (Local): ${localDate.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
      })}`
    );
    console.log(`   User ID: ${entry.userId}`);
    console.log(`   Meal Type: ${entry.mealType}`);
    console.log('');
  });

  // Check for entries on Oct 18, 2025
  console.log('\n=== Checking for Oct 18, 2025 entries ===');

  const oct18Entries = await prisma.foodEntry.findMany({
    where: {
      date: {
        gte: new Date('2025-10-18T00:00:00.000Z'),
        lte: new Date('2025-10-18T23:59:59.999Z'),
      },
    },
  });

  console.log(`Found ${oct18Entries.length} entries on Oct 18 (UTC)`);
  oct18Entries.forEach((entry) => {
    console.log(`- ${entry.foodName}: ${entry.date.toISOString()}`);
  });

  // Check for entries that might be on Oct 17 in UTC but Oct 18 in IST
  console.log('\n=== Checking for Oct 17 evening entries (IST night) ===');

  const oct17EveningEntries = await prisma.foodEntry.findMany({
    where: {
      date: {
        gte: new Date('2025-10-17T18:30:00.000Z'), // Oct 18 00:00 IST
        lt: new Date('2025-10-18T00:00:00.000Z'), // Oct 18 05:30 IST
      },
    },
  });

  console.log(
    `Found ${oct17EveningEntries.length} entries on Oct 17 evening (which is Oct 18 in IST)`
  );
  oct17EveningEntries.forEach((entry) => {
    const localDate = new Date(entry.date);
    console.log(`- ${entry.foodName}`);
    console.log(`  UTC: ${entry.date.toISOString()}`);
    console.log(
      `  IST: ${localDate.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
      })}`
    );
  });

  await prisma.$disconnect();
}

checkDates().catch(console.error);
