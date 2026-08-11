/**
 * Cloudflare R2 görsel yükleme servisi.
 * AWS S3 SDK ile R2'ye uyumlu çalışır.
 */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuid } from 'uuid';
import * as path from 'path';

@Injectable()
export class UploadService {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly cdnUrl: string;

  constructor(private readonly cfg: ConfigService) {
    // R2, AWS S3 API'si ile uyumlu — sadece endpoint değişiyor
    this.s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${cfg.get('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: cfg.get('R2_ACCESS_KEY_ID') ?? '',
        secretAccessKey: cfg.get('R2_SECRET_ACCESS_KEY') ?? '',
      },
    });
    this.bucket = cfg.get('R2_BUCKET_NAME') ?? 'onbsaglik-media';
    this.cdnUrl = cfg.get('R2_CDN_URL') ?? '';
  }

  /** Dosyayı doğrudan R2'ye yükle, CDN URL'si döndür */
  async uploadFile(buffer: Buffer, originalName: string, mimeType: string): Promise<string> {
    const ext = path.extname(originalName);
    const key = `products/${uuid()}${ext}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
        // Herkese açık okuma izni
        ACL: 'public-read',
      }),
    );

    return `${this.cdnUrl}/${key}`;
  }

  /** Daha sonra frontend'den doğrudan yükleme için ön-imzalı URL üret */
  async getPresignedUrl(fileName: string, mimeType: string): Promise<{ url: string; key: string }> {
    const ext = path.extname(fileName);
    const key = `products/${uuid()}${ext}`;

    const url = await getSignedUrl(
      this.s3,
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ContentType: mimeType,
      }),
      { expiresIn: 3600 },
    );

    return { url, key };
  }

  /** R2'den dosya sil */
  async deleteFile(key: string): Promise<void> {
    await this.s3.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }
}
