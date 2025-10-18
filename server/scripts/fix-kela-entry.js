import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixKelaEntry() {
  console.log('=== Fixing "1 kela" entry date ===\n');

  // Find the kela entry
  const entry = await prisma.foodEntry.findFirst({
    where: {
      foodName: '1 kela',
    },
  });

  if (!entry) {
    console.log('Entry not found!');
    return;
  }

  console.log('Found entry:');
  console.log(`  Food: ${entry.foodName}`);
  console.log(`  Current date (UTC): ${entry.date.toISOString()}`);
  console.log(
    `  Current date (IST): ${entry.date.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
    })}`
  );

  // Should be Oct 16, 2025 at midnight UTC
  const correctDate = new Date('2025-10-16T00:00:00.000Z');

  console.log(`\n  Correct date (UTC): ${correctDate.toISOString()}`);
  console.log(
    `  Correct date (IST): ${correctDate.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
    })}`
  );

  console.log('\nUpdating...');

  await prisma.foodEntry.update({
    where: { id: entry.id },
    data: { date: correctDate },
  });

  console.log('✅ Entry updated successfully!');

  await prisma.$disconnect();
}

fixKelaEntry().catch(console.error);
