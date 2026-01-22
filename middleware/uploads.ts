import multer, { FileFilterCallback, StorageEngine } from 'multer';
import path from 'path';
import { Request } from 'express';

const maxSize: number = 2 * 1024 * 1024; // 2MB for images
const maxVideoSize: number = 50 * 1024 * 1024; // 50MB for videos

const storage: StorageEngine = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ): void => {
    if (file.fieldname === 'profilePicture') {
      cb(null, path.join('public', 'profile_pictures'));
    } else if (file.fieldname === 'itemPhoto') {
      cb(null, path.join('public', 'item_photos'));
    } else if (file.fieldname === 'itemVideo') {
      cb(null, path.join('public', 'item_videos'));
    } else {
      cb(new Error('Invalid field name for upload.'), '');
    }
  },
  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ): void => {
    const ext = path.extname(file.originalname);
    let prefix = 'file';
    if (file.fieldname === 'profilePicture') {
      prefix = 'pro-pic';
    } else if (file.fieldname === 'itemPhoto') {
      prefix = 'itm-pic';
    } else if (file.fieldname === 'itemVideo') {
      prefix = 'item-vid';
    }
    cb(null, `${prefix}-${Date.now()}${ext}`);
  },
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  if (file.fieldname === 'itemVideo') {
    if (!file.originalname.match(/\.(mp4|avi|mov|wmv)$/i)) {
      cb(new Error('Video format not supported.'));
      return;
    }
    cb(null, true);
    return;
  } else if (
    file.fieldname === 'profilePicture' ||
    file.fieldname === 'itemPhoto'
  ) {
    console.log('Im here');
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
      cb(new Error('Image format not supported.'));
      return;
    }
    cb(null, true);
    return;
  } else {
    cb(new Error('Invalid field name for upload.'));
    return;
  }
};

// For images (profile pictures and item photos)
export const uploadImage = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: maxSize },
});

// For videos (item videos)
export const uploadVideo = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: maxVideoSize },
});

// Export single upload for backward compatibility
const upload = uploadImage;

export default upload;
