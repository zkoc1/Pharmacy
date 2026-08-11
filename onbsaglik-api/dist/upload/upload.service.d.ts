import { ConfigService } from '@nestjs/config';
export declare class UploadService {
    private readonly cfg;
    private readonly s3;
    private readonly bucket;
    private readonly cdnUrl;
    constructor(cfg: ConfigService);
    uploadFile(buffer: Buffer, originalName: string, mimeType: string): Promise<string>;
    getPresignedUrl(fileName: string, mimeType: string): Promise<{
        url: string;
        key: string;
    }>;
    deleteFile(key: string): Promise<void>;
}
