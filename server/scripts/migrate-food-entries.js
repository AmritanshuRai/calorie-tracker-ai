import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateFoodEntries() {
  const fromUserId = 'cmgv6yd6t0000tr0f3s80tzos'; // amritanshurai13@gmail.com
  const toUserId = 'cmguwovqh00002ug05waoqexl'; // amritanshurai04@gmail.com

  console.log('=== Food Entry Migration Script ===\n');

  // Get source user details
  const fromUser = await prisma.user.findUnique({
    where: { id: fromUserId },
    select: { name: true, email: true },
  });

  const toUser = await prisma.user.findUnique({
    where: { id: toUserId },
    select: { name: true, email: true },
  });

  console.log(`FROM: ${fromUser.name} (${fromUser.email})`);
  console.log(`TO:   ${toUser.name} (${toUser.email})\n`);

  // Get entries to migrate
  const entriesToMigrate = await prisma.foodEntry.findMany({
    where: { userId: fromUserId },
    orderBy: { date: 'asc' },
  });

  console.log(`Found ${entriesToMigrate.length} entries to migrate:\n`);

  entriesToMigrate.forEach((entry, idx) => {
    const localDate = new Date(entry.date);
    console.log(`${idx + 1}. ${entry.foodName}`);
    console.log(
      `   Date: ${localDate.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
      })}`
    );
    console.log(`   Meal: ${entry.mealType}`);
    console.log('');
  });

  // Ask for confirmation
  console.log(
    '\n⚠️  WARNING: This will move all food entries to the new user account.'
  );
  console.log('Press Ctrl+C to cancel, or wait 5 seconds to proceed...\n');

  await new Promise((resolve) => setTimeout(resolve, 5000));

  console.log('Migrating entries...\n');

  // Update all entries
  const result = await prisma.foodEntry.updateMany({
    where: { userId: fromUserId },
    data: { userId: toUserId },
  });

  console.log(`✅ Successfully migrated ${result.count} food entries!`);

  // Verify
  const newCount = await prisma.foodEntry.count({
    where: { userId: toUserId },
  });

  const oldCount = await prisma.foodEntry.count({
    where: { userId: fromUserId },
  });

  console.log(`\nVerification:`);
  console.log(`- New user now has: ${newCount} entries`);
  console.log(`- Old user now has: ${oldCount} entries\n`);

  await prisma.$disconnect();
}

migrateFoodEntries().catch(console.error);
