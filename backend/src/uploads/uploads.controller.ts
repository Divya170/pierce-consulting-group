import { BadRequestException, Controller, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { randomBytes } from 'crypto';
import { mkdirSync } from 'fs';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { ALLOWED_IMAGE_TYPES, MAX_UPLOAD_BYTES, UPLOAD_DIR } from './uploads.constants';

mkdirSync(UPLOAD_DIR, { recursive: true });

@Controller('uploads')
export class UploadsController {
  /** POST /api/uploads (multipart, field "file") → { url: "/uploads/abc.jpg" } */
  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 },
      fileFilter: (_req, file, cb) => {
        if (!ALLOWED_IMAGE_TYPES[file.mimetype]) {
          return cb(new BadRequestException('Upload a JPG, PNG, WebP or AVIF image.'), false);
        }
        cb(null, true);
      },
      storage: diskStorage({
        destination: UPLOAD_DIR,
        filename: (_req, file, cb) => cb(null, `${Date.now()}-${randomBytes(6).toString('hex')}${ALLOWED_IMAGE_TYPES[file.mimetype]}`),
      }),
    }),
  )
  upload(@UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('Choose an image to upload (max 5 MB).');
    return { url: `/uploads/${file.filename}`, size: file.size, type: file.mimetype };
  }
}
