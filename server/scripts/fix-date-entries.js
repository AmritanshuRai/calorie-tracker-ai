import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixDates() {
  console.log('=== Fixing Food Entry Dates ===\n');

  const userId = 'cmgv6yd6t0000tr0f3s80tzos';

  // Get all entries for this user
  const entries = await prisma.foodEntry.findMany({
    where: { userId },
    orderBy: { date: 'asc' },
  });

  console.log(`Found ${entries.length} entries to check:\n`);

  for (const entry of entries) {
    const currentDate = new Date(entry.date);
    const istDate = new Date(
      currentDate.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
    );

    // Get the IST date components
    const istYear = parseInt(
      currentDate.toLocaleString('en-US', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
      })
    );
    const istMonth = parseInt(
      currentDate.toLocaleString('en-US', {
        timeZone: 'Asia/Kolkata',
        month: '2-digit',
      })
    );
    const istDay = parseInt(
      currentDate.toLocaleString('en-US', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
      })
    );

    // Create a UTC date for the same calendar day
    const correctedDate = new Date(
      Date.UTC(istYear, istMonth - 1, istDay, 0, 0, 0, 0)
    );

    console.log(`${entry.foodName}:`);
    console.log(`  Current (UTC): ${currentDate.toISOString()}`);
    console.log(
      `  Current (IST): ${currentDate.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
      })}`
    );
    console.log(
      `  IST Date: ${istYear}-${String(istMonth).padStart(2, '0')}-${String(
        istDay
      ).padStart(2, '0')}`
    );
    console.log(`  Corrected (UTC): ${correctedDate.toISOString()}`);
    console.log(
      `  Will update: ${
        currentDate.toISOString() !== correctedDate.toISOString()
      }`
    );
    console.log('');
  }

  console.log(
    '\n⚠️  This will normalize all dates to UTC midnight for their IST calendar day.'
  );
  console.log('Press Ctrl+C to cancel, or wait 5 seconds to proceed...\n');

  await new Promise((resolve) => setTimeout(resolve, 5000));

  console.log('Updating entries...\n');

  let updated = 0;
  for (const entry of entries) {
    const currentDate = new Date(entry.date);

    // Get the IST date components
    const istYear = parseInt(
      currentDate.toLocaleString('en-US', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
      })
    );
    const istMonth = parseInt(
      currentDate.toLocaleString('en-US', {
        timeZone: 'Asia/Kolkata',
        month: '2-digit',
      })
    );
    const istDay = parseInt(
      currentDate.toLocaleString('en-US', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
      })
    );

    // Create a UTC date for the same calendar day
    const correctedDate = new Date(
      Date.UTC(istYear, istMonth - 1, istDay, 0, 0, 0, 0)
    );

    if (currentDate.toISOString() !== correctedDate.toISOString()) {
      await prisma.foodEntry.update({
        where: { id: entry.id },
        data: { date: correctedDate },
      });
      console.log(
        `✅ Updated ${entry.foodName}: ${correctedDate.toISOString()}`
      );
      updated++;
    }
  }

  console.log(`\n✅ Updated ${updated} entries!`);

  // Verify
  console.log('\nVerifying...');
  const verifyEntries = await prisma.foodEntry.findMany({
    where: {
      userId,
      date: {
        gte: new Date('2025-10-18T00:00:00.000Z'),
        lte: new Date('2025-10-18T23:59:59.999Z'),
      },
    },
  });

  console.log(`\nEntries now in Oct 18 UTC range: ${verifyEntries.length}`);
  verifyEntries.forEach((e) => {
    console.log(`- ${e.foodName}: ${e.date.toISOString()}`);
  });

  await prisma.$disconnect();
}

fixDates().catch(console.error);
