import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';

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

export default R2StorageService;
