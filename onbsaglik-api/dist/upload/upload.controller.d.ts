import { UploadService } from './upload.service';
export declare class UploadController {
    private readonly service;
    constructor(service: UploadService);
    uploadImage(file: Express.Multer.File): Promise<{
        url: string;
    }>;
    getPresignedUrl(filename: string, mimetype: string): Promise<{
        url: string;
        key: string;
    }>;
}
