import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUserEntries() {
  const targetUserId = 'cmguwovqh00002ug05waoqexl';

  console.log(`Checking entries for user: ${targetUserId}\n`);

  const entries = await prisma.foodEntry.findMany({
    where: {
      userId: targetUserId,
    },
    orderBy: {
      date: 'desc',
    },
  });

  console.log(`Found ${entries.length} total entries for this user\n`);

  if (entries.length > 0) {
    entries.forEach((entry, idx) => {
      const localDate = new Date(entry.date);
      console.log(`${idx + 1}. ${entry.foodName}`);
      console.log(`   Date (UTC): ${entry.date.toISOString()}`);
      console.log(
        `   Date (Local IST): ${localDate.toLocaleString('en-IN', {
          timeZone: 'Asia/Kolkata',
        })}`
      );
      console.log(`   Meal Type: ${entry.mealType}`);
      console.log('');
    });
  } else {
    console.log('No entries found for this user.');
    console.log('\nLet me check all users in the database...\n');

    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    console.log(`Found ${allUsers.length} users:`);
    for (const user of allUsers) {
      const userEntries = await prisma.foodEntry.count({
        where: { userId: user.id },
      });
      console.log(
        `- ${user.name} (${user.email}): ${userEntries} food entries`
      );
    }
  }

  await prisma.$disconnect();
}

checkUserEntries().catch(console.error);
