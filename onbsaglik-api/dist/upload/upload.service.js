"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const uuid_1 = require("uuid");
const path = require("path");
let UploadService = class UploadService {
    constructor(cfg) {
        this.cfg = cfg;
        this.s3 = new client_s3_1.S3Client({
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
    async uploadFile(buffer, originalName, mimeType) {
        const ext = path.extname(originalName);
        const key = `products/${(0, uuid_1.v4)()}${ext}`;
        await this.s3.send(new client_s3_1.PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            Body: buffer,
            ContentType: mimeType,
            ACL: 'public-read',
        }));
        return `${this.cdnUrl}/${key}`;
    }
    async getPresignedUrl(fileName, mimeType) {
        const ext = path.extname(fileName);
        const key = `products/${(0, uuid_1.v4)()}${ext}`;
        const url = await (0, s3_request_presigner_1.getSignedUrl)(this.s3, new client_s3_1.PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            ContentType: mimeType,
        }), { expiresIn: 3600 });
        return { url, key };
    }
    async deleteFile(key) {
        await this.s3.send(new client_s3_1.DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
    }
};
exports.UploadService = UploadService;
exports.UploadService = UploadService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], UploadService);
//# sourceMappingURL=upload.service.js.map