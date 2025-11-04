import multer from 'multer';

const storage = multer.memoryStorage(); // Store in memory for processing

const fileFilter = (req, file, cb) => {
  // Accept all common image formats including HEIC
  // Sharp will handle conversion to WebP
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif',
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Invalid file type. Only JPEG, PNG, WebP, and HEIC images allowed.'
      )
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max before processing
  },
});

export default upload;
