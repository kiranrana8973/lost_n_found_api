"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.itemVideoMulterOptions = exports.itemPhotoMulterOptions = exports.profilePictureMulterOptions = void 0;
const multer_1 = require("multer");
const path_1 = require("path");
const common_1 = require("@nestjs/common");
const ALLOWED_IMAGE_MIMES = [
    'image/jpeg',
    'image/png',
    'image/gif',
];
const ALLOWED_VIDEO_MIMES = [
    'video/mp4',
    'video/x-msvideo',
    'video/quicktime',
    'video/x-ms-wmv',
];
const imageFilter = (_req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new common_1.BadRequestException('Image format not supported.'), false);
    }
    if (!ALLOWED_IMAGE_MIMES.includes(file.mimetype)) {
        return cb(new common_1.BadRequestException('Invalid image MIME type.'), false);
    }
    cb(null, true);
};
const videoFilter = (_req, file, cb) => {
    if (!file.originalname.match(/\.(mp4|avi|mov|wmv)$/i)) {
        return cb(new common_1.BadRequestException('Video format not supported.'), false);
    }
    if (!ALLOWED_VIDEO_MIMES.includes(file.mimetype)) {
        return cb(new common_1.BadRequestException('Invalid video MIME type.'), false);
    }
    cb(null, true);
};
exports.profilePictureMulterOptions = {
    storage: (0, multer_1.diskStorage)({
        destination: 'public/profile_pictures',
        filename: (_req, file, cb) => {
            cb(null, `pro-pic-${Date.now()}${(0, path_1.extname)(file.originalname)}`);
        },
    }),
    fileFilter: imageFilter,
    limits: { fileSize: 2 * 1024 * 1024 },
};
exports.itemPhotoMulterOptions = {
    storage: (0, multer_1.diskStorage)({
        destination: 'public/item_photos',
        filename: (_req, file, cb) => {
            cb(null, `itm-pic-${Date.now()}${(0, path_1.extname)(file.originalname)}`);
        },
    }),
    fileFilter: imageFilter,
    limits: { fileSize: 2 * 1024 * 1024 },
};
exports.itemVideoMulterOptions = {
    storage: (0, multer_1.diskStorage)({
        destination: 'public/item_videos',
        filename: (_req, file, cb) => {
            cb(null, `item-vid-${Date.now()}${(0, path_1.extname)(file.originalname)}`);
        },
    }),
    fileFilter: videoFilter,
    limits: { fileSize: 50 * 1024 * 1024 },
};
//# sourceMappingURL=multer-config.factory.js.map