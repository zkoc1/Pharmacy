import { Controller, Post, UploadedFile, UseInterceptors, UseGuards, Get, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly service: UploadService) {}

  /** Admin: görsel yükle — multipart/form-data */
  @Post('image')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 5 * 1024 * 1024 }, // max 5 MB
  }))
  @ApiConsumes('multipart/form-data')
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    const url = await this.service.uploadFile(file.buffer, file.originalname, file.mimetype);
    return { url };
  }

  /** Admin: ön-imzalı URL al (frontend doğrudan R2'ye yüklesin) */
  @Get('presign')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getPresignedUrl(
    @Query('filename') filename: string,
    @Query('mimetype') mimetype: string,
  ) {
    return this.service.getPresignedUrl(filename, mimetype);
  }
}
