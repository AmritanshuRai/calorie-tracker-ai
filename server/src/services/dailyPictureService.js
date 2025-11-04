import { PrismaClient } from '@prisma/client';
import R2StorageService from './r2StorageService.js';
import ImageProcessingService from './imageProcessingService.js';

const prisma = new PrismaClient();

class DailyPictureService {
  constructor() {
    this.r2Storage = new R2StorageService();
    this.imageProcessor = new ImageProcessingService();
  }

  async uploadDailyPicture(userId, date, file) {
    // 1. Check subscription limits
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionStatus: true, pictureCount: true },
    });

    const isPro = user.subscriptionStatus === 'active';

    if (!isPro && user.pictureCount >= 7) {
      throw new Error(
        'Free tier limit reached (7 pictures max). Upgrade to Pro for unlimited.'
      );
    }

    // 2. Optimize image
    const optimized = await this.imageProcessor.optimizeImage(file.buffer);

    // 3. Generate thumbnail (server-side)
    const thumbnail = await this.imageProcessor.generateThumbnail(
      optimized.buffer
    );

    // 4. Upload to Cloudflare R2
    const fileName = `${userId}_${date}`;
    const originalUrl = await this.r2Storage.uploadImage(
      optimized.buffer,
      `${fileName}.webp`,
      `users/${userId}/originals`
    );
    const thumbnailUrl = await this.r2Storage.uploadImage(
      thumbnail,
      `${fileName}_thumb.webp`,
      `users/${userId}/thumbnails`
    );

    // 5. Save to database
    const dailyPicture = await prisma.dailyPicture.create({
      data: {
        userId,
        date: new Date(date),
        originalUrl,
        thumbnailUrl,
        fileSize: optimized.optimizedSize,
        width: optimized.metadata.width,
        height: optimized.metadata.height,
        metadata: {
          wasOptimized: optimized.wasOptimized,
          originalSize: optimized.originalSize,
          originalFormat: optimized.metadata.format,
        },
      },
    });

    // 6. Increment user picture count
    await prisma.user.update({
      where: { id: userId },
      data: { pictureCount: { increment: 1 } },
    });

    return dailyPicture;
  }

  async getDailyPicture(userId, date) {
    return await prisma.dailyPicture.findUnique({
      where: {
        userId_date: {
          userId,
          date: new Date(date),
        },
      },
    });
  }

  async deleteDailyPicture(userId, date) {
    const picture = await this.getDailyPicture(userId, date);
    if (!picture) throw new Error('Picture not found');

    // Delete from Cloudflare R2
    const originalFileName = picture.originalUrl.split('/').pop();
    const thumbnailFileName = picture.thumbnailUrl.split('/').pop();

    await this.r2Storage.deleteImage(
      originalFileName,
      `users/${userId}/originals`
    );
    await this.r2Storage.deleteImage(
      thumbnailFileName,
      `users/${userId}/thumbnails`
    );

    // Delete from database
    await prisma.dailyPicture.delete({
      where: { id: picture.id },
    });

    // Decrement user picture count
    await prisma.user.update({
      where: { id: userId },
      data: { pictureCount: { decrement: 1 } },
    });
  }

  async getPictureHistory(
    userId,
    { startDate, endDate, limit = 50, offset = 0 }
  ) {
    const where = { userId };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    return await prisma.dailyPicture.findMany({
      where,
      orderBy: { date: 'desc' },
      take: limit,
      skip: offset,
      include: {
        dailyLog: {
          select: { weight: true, weightUnit: true },
        },
      },
    });
  }

  async getPictureQuota(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionStatus: true, pictureCount: true },
    });

    const isPro = user.subscriptionStatus === 'active';

    if (isPro) {
      return {
        used: user.pictureCount,
        limit: -1, // unlimited
        remaining: -1,
      };
    }

    return {
      used: user.pictureCount,
      limit: 7,
      remaining: Math.max(0, 7 - user.pictureCount),
    };
  }
}

export default DailyPictureService;
