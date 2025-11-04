import imageCompression from 'browser-image-compression';

export async function compressImage(file) {
  const options = {
    maxSizeMB: 1, // Max 1MB file size
    maxWidthOrHeight: 1920, // Max dimension
    useWebWorker: true, // Don't block UI
    fileType: 'image/webp', // Modern format
    initialQuality: 0.8, // 80% quality
    exifOrientation: undefined, // Auto-detect and fix rotation
  };

  try {
    const compressedFile = await imageCompression(file, options);
    console.log(
      `Compressed: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(
        compressedFile.size /
        1024 /
        1024
      ).toFixed(2)}MB`
    );
    return compressedFile;
  } catch (error) {
    console.error('Compression failed:', error);
    return file; // Fallback to original
  }
}

// Mobile-optimized version
export async function compressImageMobile(file) {
  const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);
  const isLargeFile = file.size > 5 * 1024 * 1024; // 5MB

  const options = {
    maxSizeMB: isMobile && isLargeFile ? 0.5 : 1,
    maxWidthOrHeight: isMobile ? 1280 : 1920,
    useWebWorker: true,
    fileType: 'image/webp',
  };

  return await imageCompression(file, options);
}
