# Daily Picture Upload Feature - Technical Specification

## Overview

This document outlines the architecture, implementation strategy, and technical details for adding daily progress picture uploads to the calorie tracker application.

---

## 1. Feature Requirements

### Core Functionality

- Users can upload one picture per day as part of their daily log
- Pictures should be viewable in a timeline/gallery format
- Basic editing capabilities (crop, rotate, filters, face blur)
- Integration with existing weight tracking for visual progress comparison
- Free users: 7 pictures total (one-time limit), Pro users: unlimited

### User Experience Goals

- Seamless integration with existing Daily Log Modal
- Works perfectly on mobile devices (camera + gallery)
- Fast uploads (client-side compression)
- Privacy-focused (face blur, secure storage)

---

## 2. Architecture Design

### Storage Strategy: Cloudflare R2

**Why Cloudflare R2:**

- ✅ **Zero egress fees** - unlimited free bandwidth
- ✅ **Free tier:** 10 GB storage/month FREE forever
- ✅ S3-compatible API (easy integration, battle-tested)
- ✅ Global CDN built-in (Cloudflare's network)
- ✅ Excellent performance and reliability
- ✅ Cost-effective: $0.015/GB/month ($15/TB)
- ✅ No minimum fees - pay only what you use
- ✅ Automatic HTTPS

**How it works:**

- Upload via S3-compatible API to R2 bucket
- Access via R2.dev public URLs or custom domain
- Served from Cloudflare's global edge network
- Automatic caching and optimization

**Pricing:**

- Storage: $0.015/GB/month
- Class A operations (uploads): $4.50/million requests
- Class B operations (downloads): $0.36/million requests
- Egress: **FREE** (unlimited)
- Free tier: 10 GB storage + 1M Class A + 10M Class B requests/month

**Alternative for Testing:**

- Store in local filesystem during development
- Migrate to Cloudflare R2 before production

---

## 3. Database Schema

### Separate DailyPicture Table (Selected Approach)

```prisma
model DailyPicture {
  id              String    @id @default(cuid())
  userId          String
  date            DateTime  @db.Date
  originalUrl     String    // Full resolution image (WebP format)
  thumbnailUrl    String    // Optimized thumbnail (WebP format)
  uploadedAt      DateTime  @default(now())
  fileSize        Int       // Size in bytes
  width           Int       // Original width
  height          Int       // Original height
  metadata        Json?     // Additional metadata if needed
  dailyLogId      String?

  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  dailyLog        DailyLog? @relation(fields: [dailyLogId], references: [id], onDelete: SetNull)

  @@unique([userId, date])
  @@index([userId, date])
  @@index([userId])
}

// Extend User model
model User {
  // ... existing fields
  dailyPictures   DailyPicture[]
  pictureCount    Int       @default(0)  // Track total pictures uploaded
}

// Extend DailyLog model
model DailyLog {
  // ... existing fields
  dailyPictures   DailyPicture[]
}
```

**Why separate table:**

- ✅ Better data organization
- ✅ Can extend to multiple pictures per day in future
- ✅ Easier to query picture history
- ✅ Clean separation of concerns
- ✅ Optimized indexes for picture queries

---

## 4. Frontend Implementation

### Component Structure

```
client/src/
├── components/
│   ├── DailyLogModal.jsx (existing - extend with picture tab)
│   ├── PictureUploadTab.jsx (new)
│   ├── PhotoEditor.jsx (new)
│   ├── PictureGallery.jsx (new - for Insights page)
│   └── PictureThumbnail.jsx (new)
├── services/
│   └── pictureService.js (new)
└── utils/
    ├── imageCompression.js (new)
    └── imageEffects.js (new)
```

### User Flow

```
Dashboard → Click "Log Weight & Water & Picture"
              ↓
Daily Log Modal opens with 3 tabs: [Weight] [Water] [Picture]
              ↓
User switches to "Picture" tab
              ↓
Options: [Take Photo] [Upload from Gallery]
              ↓
User selects/takes photo
              ↓
Photo Editor opens:
  - Crop & rotate
  - Apply filters
  - Blur face (privacy)
  - Preview
              ↓
User confirms → Client-side compression
              ↓
Upload to cloud storage (with progress bar)
              ↓
Success → Show thumbnail in Daily Log card
              ↓
Click thumbnail → View full image modal
              ↓
Options: [View Full Size] [Compare with Date] [Delete]
```

### DailyLogModal Extension

```jsx
// Extended modal with picture tab
const DailyLogModal = ({ isOpen, onClose, selectedDate, onLogAdded }) => {
  const [activeTab, setActiveTab] = useState('weight'); // 'weight' | 'water' | 'picture'

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Tabs>
        <Tab onClick={() => setActiveTab('weight')}>Weight</Tab>
        <Tab onClick={() => setActiveTab('water')}>Water</Tab>
        <Tab onClick={() => setActiveTab('picture')}>Picture</Tab>
      </Tabs>

      {activeTab === 'weight' && <WeightInput />}
      {activeTab === 'water' && <WaterInput />}
      {activeTab === 'picture' && <PictureUploadTab date={selectedDate} />}
    </Modal>
  );
};
```

### Dashboard Display

```jsx
// In Dashboard.jsx - Daily Log Card
<Card>
  <div className='daily-log-grid'>
    <div className='weight-display'>
      <Scale /> {dailyLog?.weight} kg
    </div>
    <div className='water-display'>
      <Droplet /> {dailyLog?.waterIntake} ml
    </div>
    {/* NEW: Picture thumbnail */}
    {dailyLog?.thumbnailUrl && (
      <div
        className='picture-thumbnail'
        onClick={() => openFullImage(dailyLog.pictureUrl)}>
        <img src={dailyLog.thumbnailUrl} alt='Daily progress' />
        <Camera className='overlay-icon' />
      </div>
    )}
  </div>
</Card>
```

---

## 5. Backend Implementation

### API Endpoints

```javascript
// POST /api/daily-log/picture
// Upload picture for a specific date
router.post(
  '/picture',
  authMiddleware,
  upload.single('image'), // Multer middleware
  async (req, res) => {
    // 1. Validate image (type, size)
    // 2. Convert to WebP (handles HEIC automatically)
    // 3. Optimize if size > threshold (e.g., 500KB)
    // 4. Generate server-side thumbnail (WebP)
    // 5. Upload both to Bunny Storage
    // 6. Save URLs to database
    // 7. Update user picture count
    // 8. Return URLs
  }
);

// GET /api/daily-log/:date/picture
// Get picture for a specific date
router.get('/:date/picture', authMiddleware, async (req, res) => {
  // Fetch picture URLs from database
  // Return Bunny CDN URLs
});

// DELETE /api/daily-log/picture/:date
// Delete picture for a specific date
router.delete('/picture/:date', authMiddleware, async (req, res) => {
  // Delete from Bunny Storage
  // Remove from database
  // Decrement user picture count
});

// GET /api/daily-log/pictures/history
// Get all pictures for timeline/gallery
router.get('/pictures/history', authMiddleware, async (req, res) => {
  // Pagination support
  // Filter by date range
  // Return array of pictures with CDN URLs
});

// GET /api/user/picture-quota
// Check remaining picture uploads for free users
router.get('/picture-quota', authMiddleware, async (req, res) => {
  // Return: { used: 5, limit: 7, remaining: 2 }
});
```

### Service Layer

```javascript
// server/src/services/r2StorageService.js
const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} = require('@aws-sdk/client-s3');

class R2StorageService {
  constructor() {
    this.client = new S3Client({
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT, // e.g., https://<account-id>.r2.cloudflarestorage.com
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    });
    this.bucketName = process.env.R2_BUCKET_NAME;
    this.publicUrl = process.env.R2_PUBLIC_URL; // e.g., https://your-bucket.r2.dev or custom domain
  }

  async uploadImage(buffer, fileName, folder = 'daily-pictures') {
    const key = `${folder}/${fileName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: buffer,
      ContentType: 'image/webp',
      CacheControl: 'public, max-age=31536000', // Cache for 1 year
    });

    await this.client.send(command);

    // Return public URL
    return `${this.publicUrl}/${key}`;
  }

  async deleteImage(fileName, folder = 'daily-pictures') {
    const key = `${folder}/${fileName}`;

    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    await this.client.send(command);
  }

  async getImage(fileName, folder = 'daily-pictures') {
    const key = `${folder}/${fileName}`;

    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    const response = await this.client.send(command);
    return response.Body;
  }
}

// server/src/services/imageProcessingService.js
const sharp = require('sharp');

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

// server/src/services/dailyPictureService.js
class DailyPictureService {
  constructor() {
    this.r2Storage = new R2StorageService();
    this.imageProcessor = new ImageProcessingService();
  }

  async uploadDailyPicture(userId, date, file) {
    // 1. Check subscription limits
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isPro: true, pictureCount: true },
    });

    if (!user.isPro && user.pictureCount >= 7) {
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
      select: { isPro: true, pictureCount: true },
    });

    if (user.isPro) {
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
```

### Middleware

```javascript
// server/src/middleware/imageUpload.js
const multer = require('multer');

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

module.exports = upload;
```

---

## 6. Client-Side Image Processing

### Image Format Handling

**Server-Side Conversion to WebP:**

- All uploaded images are automatically converted to WebP format on the server
- WebP is supported by all modern browsers (Chrome, Firefox, Safari 14+, Edge)
- Handles HEIC (iPhone photos) automatically - Sharp converts HEIC → WebP
- Reduces file size by 25-35% compared to JPEG
- Maintains high quality at smaller file sizes

**Browser Support:**
| Browser | WebP Support |
|---------|--------------|
| Chrome | ✅ All versions |
| Firefox | ✅ 65+ |
| Safari | ✅ 14+ (iOS 14+) |
| Edge | ✅ All versions |
| Opera | ✅ All versions |

**Fallback:** Not needed - 99%+ browser coverage as of 2025

### Compression Library: browser-image-compression

**Why this library:**

- ✅ Works perfectly on iOS and Android
- ✅ Handles EXIF orientation automatically
- ✅ Uses Web Workers (non-blocking)
- ✅ Lightweight (~10KB)
- ✅ Client-side pre-compression reduces server load

**Installation:**

```bash
npm install browser-image-compression
```

**Implementation:**

```javascript
// client/src/utils/imageCompression.js
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
      `Compressed: ${file.size / 1024 / 1024}MB → ${
        compressedFile.size / 1024 / 1024
      }MB`
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
```

### Mobile Compatibility

| Feature     | iOS Safari | Android Chrome   | Support      |
| ----------- | ---------- | ---------------- | ------------ |
| Canvas API  | iOS 5+     | Android 4+       | ✅ Excellent |
| FileReader  | iOS 5+     | Android 4+       | ✅ Excellent |
| Web Workers | iOS 5+     | Android 4.4+     | ✅ Excellent |
| WebP output | iOS 14+    | All versions     | ✅ Good      |
| HEIC input  | Native     | Needs conversion | ⚠️ Partial   |

**Key Benefits on Mobile:**

- Saves user's mobile data
- Faster uploads on cellular networks
- Better battery life
- Reduced server costs

---

## 7. Photo Editing Features

### Recommended Approach: Phased Implementation

#### **Phase 1: MVP (Free & Lightweight)**

**Library:** react-easy-crop + CSS filters

- **Bundle size:** ~15KB
- **Features:**
  - Crop with pinch-to-zoom
  - Rotate
  - Basic filters (via CSS)
  - Manual blur region selection

```bash
npm install react-easy-crop
```

```jsx
// client/src/components/PhotoEditor.jsx
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../utils/cropImage';

const PhotoEditor = ({ image, onSave, onCancel }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [filter, setFilter] = useState('none');

  const filters = {
    none: '',
    vivid: 'saturate(1.3) contrast(1.1) brightness(1.05)',
    bw: 'grayscale(1)',
    vintage: 'sepia(0.5) contrast(1.2)',
    warm: 'saturate(1.1) brightness(1.05) hue-rotate(-5deg)',
  };

  const handleSave = async () => {
    const croppedImage = await getCroppedImg(
      image,
      croppedAreaPixels,
      rotation
    );

    const finalImage = await applyFilter(croppedImage, filters[filter]);
    onSave(finalImage);
  };

  return (
    <div className='photo-editor'>
      <div className='editor-canvas' style={{ filter: filters[filter] }}>
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={3 / 4}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onRotationChange={setRotation}
          onCropComplete={onCropComplete}
        />
      </div>

      <div className='editor-controls'>
        {/* Zoom slider */}
        <input
          type='range'
          value={zoom}
          min={1}
          max={3}
          step={0.1}
          onChange={(e) => setZoom(Number(e.target.value))}
        />

        {/* Rotation */}
        <button onClick={() => setRotation(rotation + 90)}>Rotate 90°</button>

        {/* Filters */}
        <div className='filter-buttons'>
          {Object.keys(filters).map((f) => (
            <button
              key={f}
              className={filter === f ? 'active' : ''}
              onClick={() => setFilter(f)}>
              {f}
            </button>
          ))}
        </div>

        {/* Actions */}
        <button onClick={onCancel}>Cancel</button>
        <button onClick={handleSave}>Save</button>
      </div>
    </div>
  );
};
```

#### **Phase 2: Enhanced Features (Still Free)**

**Library:** Filerobot Image Editor or Tui Image Editor

- **Bundle size:** ~200KB
- **Features:**
  - All Phase 1 features
  - Advanced filters (20+ presets)
  - Drawing/annotations
  - Text overlay
  - Built-in blur tool
  - Brightness/contrast/saturation adjustments

```bash
npm install react-filerobot-image-editor
```

#### **Phase 3: Premium (Pro Users Only)**

**Library:** Pintura Image Editor

- **Cost:** $249-$999 (one-time)
- **Features:**
  - Professional-grade editing
  - Perfect mobile UX
  - Auto face detection + blur
  - Stickers and effects
  - Before/after comparison
  - Export multiple formats

### Face Blurring Implementation

**Simple Approach (Manual):**

```javascript
// User selects region to blur
// Apply Gaussian blur using Canvas API

export async function applyBlur(image, blurRegion) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // Draw original image
  ctx.drawImage(image, 0, 0);

  // Apply blur filter to selected region
  ctx.filter = 'blur(20px)';
  ctx.drawImage(
    image,
    blurRegion.x,
    blurRegion.y,
    blurRegion.width,
    blurRegion.height,
    blurRegion.x,
    blurRegion.y,
    blurRegion.width,
    blurRegion.height
  );

  return canvas.toDataURL('image/webp');
}
```

**Advanced Approach (Auto-detect):**

```bash
npm install face-api.js
```

```javascript
import * as faceapi from 'face-api.js';

// Load models (do this once on app init)
await faceapi.nets.tinyFaceDetector.loadFromUri('/models');

// Detect faces
const detections = await faceapi.detectAllFaces(
  image,
  new faceapi.TinyFaceDetectorOptions()
);

// Auto-blur detected faces
detections.forEach((detection) => {
  const box = detection.box;
  applyBlur(image, {
    x: box.x,
    y: box.y,
    width: box.width,
    height: box.height,
  });
});
```

**Note:** face-api.js is ~2MB, so only load for Pro users or lazy-load when needed.

---

## 8. Integration with Insights Page

### Picture Timeline/Gallery

```jsx
// client/src/pages/Insights.jsx (extend existing)
const Insights = () => {
  const [pictureHistory, setPictureHistory] = useState([]);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [selectedDates, setSelectedDates] = useState([]);

  useEffect(() => {
    loadPictureHistory();
  }, []);

  return (
    <div className='insights-page'>
      {/* Existing weight graph */}
      <WeightGraph />

      {/* NEW: Picture Timeline */}
      <Card>
        <h2>Progress Photos</h2>

        <div className='timeline-controls'>
          <button onClick={() => setComparisonMode(!comparisonMode)}>
            {comparisonMode ? 'Timeline View' : 'Compare Photos'}
          </button>
        </div>

        {comparisonMode ? (
          <ComparisonView
            pictures={pictureHistory}
            selectedDates={selectedDates}
            onSelectDate={handleDateSelect}
          />
        ) : (
          <PictureGallery
            pictures={pictureHistory}
            onPictureClick={handlePictureClick}
          />
        )}
      </Card>

      {/* NEW: Combined View - Weight graph with picture markers */}
      <Card>
        <h2>Visual Progress</h2>
        <WeightGraphWithPictures
          weightData={weightHistory}
          pictures={pictureHistory}
        />
      </Card>
    </div>
  );
};
```

### Comparison Features

- **Side-by-side:** Select 2 dates, show pictures side by side
- **Slider overlay:** Interactive before/after slider
- **Grid view:** 4, 9, or 16 pictures in grid for overview
- **Weight overlay:** Show weight value on each picture

---

## 9. Security & Privacy

### Security Measures

1. **File Validation:**

   - Check MIME type (not just extension)
   - Scan file headers for actual image data
   - Limit file size (10MB max before processing)
   - Server validates again after upload

2. **Cloudflare R2 Security:**

   - HTTPS by default
   - S3-compatible access controls
   - Optional presigned URLs for time-limited access
   - DDoS protection via Cloudflare's network
   - Optional custom domain with additional security rules

3. **User Isolation:**

   - Pictures stored in user-specific folders (`users/{userId}/`)
   - API checks userId matches authenticated user
   - No cross-user access possible

4. **Deletion:**
   - Cascade delete when user deletes account
   - Soft delete option (keep for 30 days) - optional feature
   - GDPR compliance (right to be forgotten)

### Privacy Features

1. **Face Blur Tool:**

   - Built-in blur/pixelate option
   - Auto-detect faces (Pro feature)
   - Manual region selection (Free)

2. **Privacy Mode:**

   - Option to make pictures private
   - Don't show in any shared reports
   - Password-protected gallery

3. **Local Preview:**
   - Preview edits locally before upload
   - No upload until user confirms
   - Option to discard without saving

---

## 10. Subscription & Monetization

### Free Tier

- **Limit:** 7 pictures total (one-time limit, not per month)
- **Resolution:** Optimized automatically (max 1920px if larger)
- **Storage:** Lifetime retention (within the 7 picture limit)
- **Features:** Basic crop + rotate + filters
- **Format:** WebP (automatic conversion from any format including HEIC)
- **Message:** "You've used X of 7 pictures. Upgrade to Pro for unlimited uploads."

### Pro Tier

- **Limit:** Unlimited pictures
- **Resolution:** Full resolution preserved (still converted to WebP for efficiency)
- **Storage:** Lifetime retention
- **Features:** All editing features + face blur + AI analysis (future)
- **Before/After:** Automatic progress compilations
- **Export:** Download as video/GIF (future feature)

### Implementation

```javascript
// Subscription check before upload
const canUploadPicture = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isPro: true, pictureCount: true },
  });

  if (user.isPro) {
    return { allowed: true, unlimited: true };
  }

  // Check free tier limit (7 total)
  if (user.pictureCount >= 7) {
    return {
      allowed: false,
      message:
        'Free tier limit reached (7 pictures total). Upgrade to Pro for unlimited pictures.',
      used: user.pictureCount,
      limit: 7,
    };
  }

  return {
    allowed: true,
    remaining: 7 - user.pictureCount,
    used: user.pictureCount,
    limit: 7,
  };
};
```

### Frontend Display

```jsx
// Show quota in upload interface
const PictureUploadTab = ({ userId }) => {
  const [quota, setQuota] = useState(null);

  useEffect(() => {
    fetchQuota();
  }, []);

  const fetchQuota = async () => {
    const data = await api.get('/user/picture-quota');
    setQuota(data);
  };

  return (
    <div>
      {!quota?.unlimited && (
        <div className='quota-banner'>
          <p>
            📸 {quota?.used} / {quota?.limit} pictures used
          </p>
          {quota?.remaining <= 2 && (
            <p className='warning'>
              Only {quota?.remaining} upload{quota?.remaining !== 1 ? 's' : ''}{' '}
              remaining!
              <button onClick={() => navigate('/upgrade')}>
                Upgrade to Pro
              </button>
            </p>
          )}
        </div>
      )}
      {/* Upload interface */}
    </div>
  );
};
```

---

## 11. Performance Optimization

### Server-Side Processing

**Image Optimization Strategy:**

```javascript
// Only optimize if file size > 500KB
const OPTIMIZATION_THRESHOLD = 500 * 1024; // 500KB

if (fileSize > OPTIMIZATION_THRESHOLD) {
  // Resize if too large (max 1920px)
  // Compress with WebP (quality: 80)
  // Reduce file size by 25-50%
} else {
  // Just convert to WebP for consistency
  // Maintain original quality (quality: 85)
}
```

**Thumbnail Generation:**

- **Server-side generation** (recommended for consistency)
- Generate 300x300 square thumbnail
- WebP format, quality: 75
- Stored alongside original in Bunny Storage
- Faster page loads (thumbnails are 10-20KB vs 200KB+ originals)

**Why server-side thumbnails:**

- ✅ Consistent quality across all devices
- ✅ Reduces client-side processing
- ✅ Thumbnails cached on CDN
- ✅ Mobile devices don't need to process
- ✅ Instant display on subsequent visits

**Alternative - Client-side thumbnails:**

- ❌ Inconsistent results across devices
- ❌ Extra work for mobile devices
- ❌ Need to re-generate on each view
- ✅ Saves one server request during upload
- **Verdict:** Server-side is better for user experience

### Client-Side

1. **Lazy Loading:**

   ```jsx
   const PhotoEditor = lazy(() => import('./components/PhotoEditor'));
   // Only load when user clicks "Edit"
   ```

2. **Progressive Image Loading:**

   ```jsx
   <img
     src={thumbnailUrl} // Load thumbnail first
     onClick={() => setFullImage(originalUrl)} // Load full on click
     loading='lazy'
   />
   ```

3. **Image Caching:**
   ```javascript
   // Browser automatically caches images from R2
   // Cloudflare CDN sets optimal cache headers
   // Images cached globally at edge locations
   // Near-instant delivery worldwide
   ```

### Server-Side (Cloudflare R2)

1. **Automatic CDN Caching:**

   - Images automatically cached at Cloudflare's global edge locations
   - First request: pulls from R2 bucket, caches at edge
   - Subsequent requests: served from nearest edge location (sub-50ms globally)
   - No configuration needed - works automatically
   - Free unlimited egress bandwidth

2. **Image Optimization:**

   ```javascript
   const sharp = require('sharp');

   // Conditional optimization
   async function processImage(buffer) {
     const fileSize = buffer.length;

     if (fileSize < 500 * 1024) {
       // Small file - just convert to WebP
       return await sharp(buffer).webp({ quality: 85 }).toBuffer();
     } else {
       // Large file - optimize
       return await sharp(buffer)
         .resize(1920, 1920, { fit: 'inside' })
         .webp({ quality: 80 })
         .toBuffer();
     }
   }
   ```

3. **Batch Operations:**

   ```javascript
   // Load multiple pictures in one request
   GET /api/daily-log/pictures/batch?dates=2025-01-01,2025-01-02,2025-01-03
   ```

4. **WebP Benefits:**
   - 25-35% smaller than JPEG
   - Supports transparency (like PNG)
   - Better compression algorithm
   - Automatic conversion from any input format (JPEG, PNG, HEIC, etc.)

---

## 12. Implementation Roadmap

### Phase 1: MVP (Week 1-2)

- [ ] Create DailyPicture table migration
- [ ] Set up Cloudflare R2 bucket and credentials
- [ ] Install AWS SDK for S3-compatible access (@aws-sdk/client-s3)
- [ ] Install Sharp for image processing
- [ ] Basic upload API endpoint with WebP conversion
- [ ] Implement optimization logic (skip if < 500KB)
- [ ] Server-side thumbnail generation
- [ ] Client-side compression (browser-image-compression)
- [ ] Simple crop with react-easy-crop
- [ ] Display thumbnail in Dashboard
- [ ] Picture quota tracking (7 for free users)

### Phase 2: Cloudflare R2 Integration (Week 3)

- [ ] Upload to R2 (originals + thumbnails)
- [ ] Implement deletion from R2
- [ ] Configure R2 public access or custom domain
- [ ] Test HEIC to WebP conversion
- [ ] Add picture quota API endpoint
- [ ] Show remaining uploads in UI
- [ ] Handle upload errors gracefully
- [ ] Set up proper cache headers

### Phase 3: Editing Features (Week 4)

- [ ] Photo editor modal
- [ ] Filters (CSS-based)
- [ ] Rotation
- [ ] Manual blur tool
- [ ] Preview before upload
- [ ] Mobile optimization

### Phase 4: Gallery & Insights (Week 5)

- [ ] Picture timeline in Insights page
- [ ] Side-by-side comparison feature
- [ ] Weight graph with picture markers
- [ ] Picture history API with pagination
- [ ] Batch loading for performance

### Phase 5: Premium Features (Week 6+)

- [ ] Enforce 7-picture limit for free users
- [ ] Upgrade flow from picture upload
- [ ] Advanced editor (Filerobot or Pintura)
- [ ] Auto face detection + blur (future)
- [ ] Progress video generation (future)
- [ ] Export options (future)

---

## 13. Dependencies & Cost Estimates

### NPM Packages (Client)

```json
{
  "browser-image-compression": "^2.0.2",
  "react-easy-crop": "^5.0.4",
  "react-filerobot-image-editor": "^4.0.0"
}
```

**Total bundle size:** ~200KB

### NPM Packages (Server)

```json
{
  "multer": "^1.4.5-lts.1",
  "sharp": "^0.33.0",
  "@aws-sdk/client-s3": "^3.400.0"
}
```

### Monthly Cost Estimates (Cloudflare R2)

#### Free Tier (Included Every Month)

- **Storage:** 10 GB/month FREE
- **Class A Operations:** 1 million requests/month FREE
- **Class B Operations:** 10 million requests/month FREE
- **Egress:** Unlimited FREE

#### Beyond Free Tier Pricing

**Storage**

- **Pricing:** $0.015/GB/month ($15/TB)
- **Estimate for 1K active users:**
  - Assuming 4 pictures/month average, 500KB each after optimization
  - Total: 1K users × 4 pics × 500KB = ~2GB/month
  - **Storage cost:** $0 (within 10GB free tier)

**Class A Operations (Uploads)**

- **Pricing:** $4.50/million requests
- **Estimate for 1K users:**
  - 1K users × 8 uploads/month (original + thumbnail × 4 pics) = 8K requests
  - **Operations cost:** $0 (within 1M free tier)

**Class B Operations (Downloads/Views)**

- **Pricing:** $0.36/million requests
- **Estimate for 1K users:**
  - Thumbnail views: 1K users × 100 views/month = 100K requests
  - Full image views: 1K users × 10 views/month = 10K requests
  - Total: ~110K requests/month
  - **Operations cost:** $0 (within 10M free tier)

**Egress (Bandwidth)**

- **Pricing:** FREE (unlimited)
- No charges regardless of traffic volume! 🎉

#### Total Cost Analysis

**For 1K active users: $0/month** ✅ (stays within free tier)

**For 10K active users:**

- Storage: ~20GB = (20-10) × $0.015 = **$0.15/month**
- Operations: Still within free tier = **$0**
- Egress: FREE = **$0**
- **Total: ~$0.15/month**

**For 100K users:**

- Storage: ~200GB = (200-10) × $0.015 = **$2.85/month**
- Class A Operations: ~800K requests = **$0** (within free tier)
- Class B Operations: ~11M requests = (11-10) × $0.36 = **$0.36/month**
- Egress: FREE = **$0**
- **Total: ~$3.21/month**

**Comparison with AWS S3:**

- AWS S3: ~$23/month for 1K users
- **Cloudflare R2 is FREE for small-medium apps** ✅
- **Zero egress fees = massive savings at scale** ✅

---

## 14. Monitoring & Analytics

### Metrics to Track

1. **Upload success rate**
2. **Average file size (before/after compression)**
3. **Upload time (by device type)**
4. **WebP conversion stats (from HEIC, JPEG, PNG)**
5. **Optimization stats (how many skipped vs optimized)**
6. **Feature usage:**
   - % users who upload pictures
   - Average pictures per user
   - Free users hitting 7-picture limit
   - Editing features used
7. **Storage costs per user**
8. **API error rates**
9. **Cloudflare R2 performance:**
   - Cache hit rate
   - Request latency by region
   - Class A/B operation counts

### Implementation

```javascript
// Track events
analytics.track('picture_uploaded', {
  userId,
  date,
  originalSize: file.size,
  originalFormat: metadata.format, // JPEG, PNG, HEIC, etc.
  compressedSize: compressed.size,
  compressionRatio: (1 - compressed.size / file.size) * 100,
  wasOptimized: compressed.size < 500 * 1024 ? false : true,
  deviceType: isMobile ? 'mobile' : 'desktop',
  editingUsed: ['crop', 'filter'],
  uploadTime: endTime - startTime,
});

// Track quota limits
analytics.track('picture_quota_limit_reached', {
  userId,
  pictureCount: 7,
  isPro: false,
});
```

---

## 15. Potential Future Enhancements

### AI-Powered Features

- **Body measurement estimation:** Use computer vision to estimate measurements
- **Progress score:** AI-generated progress score based on visual changes
- **Pose guidance:** AR overlay to help users take consistent photos

### Social Features

- **Share progress:** Generate shareable before/after images
- **Community:** Anonymous progress sharing (opt-in)
- **Achievements:** Badges for consistency (30-day photo streak)

### Advanced Analytics

- **Body composition estimation:** Estimate body fat % from photos
- **Muscle mass tracking:** Visual muscle development analysis
- **Posture analysis:** Track posture improvements

### Export Options

- **Progress video:** Auto-generate time-lapse video
- **PDF report:** Generate report with pictures + weight graph
- **Instagram stories:** Auto-format for social media

---

## 16. Accessibility Considerations

1. **Alt text for all images**
2. **Keyboard navigation in photo editor**
3. **Screen reader support for upload status**
4. **High contrast mode for editing controls**
5. **Touch target sizes (44px minimum on mobile)**

---

## Summary

This feature adds significant value to the calorie tracker by enabling visual progress tracking alongside weight data. The phased approach allows for quick MVP launch while maintaining flexibility for future enhancements.

**Key Strengths:**

- ✅ Works perfectly on mobile (where users take most photos)
- ✅ Privacy-focused (face blur, secure storage)
- ✅ **FREE for small-medium apps** (Cloudflare R2 free tier: 10GB)
- ✅ **Zero egress fees** - unlimited bandwidth at no cost
- ✅ Monetizable (7 free pictures, unlimited for Pro)
- ✅ Scalable architecture
- ✅ Automatic format conversion (HEIC → WebP)
- ✅ Smart optimization (only if needed)
- ✅ Server-side thumbnails for consistent quality
- ✅ S3-compatible API (battle-tested, widely supported)

**Key Technical Decisions:**

1. **Cloudflare R2 Storage** - FREE tier + zero egress fees + S3-compatible
2. **Separate DailyPicture table** - Better organization and scalability
3. **WebP format** - Universal browser support, 25-35% smaller files
4. **Server-side thumbnails** - Consistent quality, better UX
5. **Conditional optimization** - Don't over-process small files
6. **7 picture limit for free users** - One-time limit (not per month)

**Next Steps:**

1. Review and approve this specification
2. Set up Cloudflare R2 bucket (free account)
3. Get R2 access credentials (Access Key ID + Secret)
4. Create database migration for DailyPicture table
5. Implement Phase 1 MVP
6. Test HEIC conversion on iOS devices
7. Test on real mobile devices (iOS/Android)
8. Gather user feedback
9. Iterate based on usage data

---

**Document Version:** 2.0  
**Last Updated:** November 3, 2025  
**Changes from v1.1:**

- ✅ Switched from Bunny CDN to Cloudflare R2
- ✅ Updated to S3-compatible API using AWS SDK
- ✅ Zero egress fees (vs Bunny's $0.01/GB)
- ✅ Better free tier: 10GB storage + 1M/10M operations FREE
- ✅ Cost estimate: $0 for small apps (vs $1-2 with Bunny)
- ✅ Same features, better economics
