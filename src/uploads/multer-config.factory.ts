import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';

const imageFilter = (_req: any, file: Express.Multer.File, cb: any) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
    return cb(new BadRequestException('Image format not supported.'), false);
  }
  cb(null, true);
};

const videoFilter = (_req: any, file: Express.Multer.File, cb: any) => {
  if (!file.originalname.match(/\.(mp4|avi|mov|wmv)$/i)) {
    return cb(new BadRequestException('Video format not supported.'), false);
  }
  cb(null, true);
};

export const profilePictureMulterOptions: MulterOptions = {
  storage: diskStorage({
    destination: 'public/profile_pictures',
    filename: (_req, file, cb) => {
      cb(null, `pro-pic-${Date.now()}${extname(file.originalname)}`);
    },
  }),
  fileFilter: imageFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
};

export const itemPhotoMulterOptions: MulterOptions = {
  storage: diskStorage({
    destination: 'public/item_photos',
    filename: (_req, file, cb) => {
      cb(null, `itm-pic-${Date.now()}${extname(file.originalname)}`);
    },
  }),
  fileFilter: imageFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
};

export const itemVideoMulterOptions: MulterOptions = {
  storage: diskStorage({
    destination: 'public/item_videos',
    filename: (_req, file, cb) => {
      cb(null, `item-vid-${Date.now()}${extname(file.originalname)}`);
    },
  }),
  fileFilter: videoFilter,
  limits: { fileSize: 50 * 1024 * 1024 },
};
