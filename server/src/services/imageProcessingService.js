import sharp from 'sharp';

class ImageProcessingService {
  // Threshold for optimization (500KB)
  static OPTIMIZATION_THRESHOLD = 500 * 1024;

  async convertToWebP(buffer) {
    // Convert any format (including HEIC) to WebP
    // WebP is supported by all modern browsers
    return await sharp(buffer).webp({ quality: 85 }).toBuffer();
  }

  async optimizeImage(buffer) {
    const metadata = await sharp(buffer).metadata();
    const fileSize = buffer.length;

    // Skip optimization if already below threshold
    if (fileSize < ImageProcessingService.OPTIMIZATION_THRESHOLD) {
      return {
        buffer: await this.convertToWebP(buffer),
        wasOptimized: false,
        originalSize: fileSize,
        optimizedSize: fileSize,
        metadata: {
          width: metadata.width,
          height: metadata.height,
          format: metadata.format,
        },
      };
    }

    // Optimize: resize if too large, compress
    let optimized = sharp(buffer);

    // Resize if dimensions are too large (max 1920px)
    if (metadata.width > 1920 || metadata.height > 1920) {
      optimized = optimized.resize(1920, 1920, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    // Convert to WebP with progressive quality
    const optimizedBuffer = await optimized.webp({ quality: 80 }).toBuffer();

    return {
      buffer: optimizedBuffer,
      wasOptimized: true,
      originalSize: fileSize,
      optimizedSize: optimizedBuffer.length,
      metadata: {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
      },
    };
  }

  async generateThumbnail(buffer, size = 300) {
    // Server-side thumbnail generation
    // Generate square thumbnail with WebP format
    return await sharp(buffer)
      .resize(size, size, { fit: 'cover' })
      .webp({ quality: 75 })
      .toBuffer();
  }
}

export default ImageProcessingService;
