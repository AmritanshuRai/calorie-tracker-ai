import prisma from './src/lib/prisma.js';

async function checkDatabase() {
  try {
    const subscription = await prisma.subscription.findFirst({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        userId: true,
        dodoSubscriptionId: true,
        status: true,
        cancelledAt: true,
        nextBillingDate: true,
        updatedAt: true,
      },
    });

    console.log('Latest Subscription Record:');
    console.log(JSON.stringify(subscription, null, 2));

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkDatabase();
