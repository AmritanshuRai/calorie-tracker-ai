import prisma from './src/lib/prisma.js';

async function checkExerciseLogs() {
  try {
    const logs = await prisma.openAILog.findMany({
      where: {
        endpoint: '/api/exercise/parse',
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
      select: {
        id: true,
        createdAt: true,
        model: true,
        input: true,
        inputTokens: true,
        outputTokens: true,
        totalTokens: true,
        totalCost: true,
        status: true,
      },
    });

    console.log('\n📊 Exercise Parsing Logs:');
    console.log('='.repeat(80));
    console.log(`Found ${logs.length} exercise parsing logs`);
    console.log('='.repeat(80));

    logs.forEach((log, i) => {
      console.log(`\n${i + 1}. ${log.createdAt.toISOString()}`);
      console.log(`   Model: ${log.model}`);
      console.log(`   Input: ${log.input.substring(0, 100)}...`);
      console.log(
        `   Tokens: ${log.totalTokens} (in: ${log.inputTokens}, out: ${log.outputTokens})`
      );
      console.log(`   Cost: $${log.totalCost?.toFixed(6) || '0.000000'}`);
      console.log(`   Status: ${log.status}`);
    });

    console.log('\n' + '='.repeat(80) + '\n');

    // Count all OpenAI logs
    const totalLogs = await prisma.openAILog.count();
    console.log(`📈 Total OpenAI logs in database: ${totalLogs}`);

    // Count by endpoint
    const byEndpoint = await prisma.openAILog.groupBy({
      by: ['endpoint'],
      _count: true,
    });

    console.log('\n📍 Logs by endpoint:');
    byEndpoint.forEach(({ endpoint, _count }) => {
      console.log(`   ${endpoint || '(null)'}: ${_count}`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkExerciseLogs();
