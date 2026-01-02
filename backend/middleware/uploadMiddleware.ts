import multer from "multer";

// File filter - only allow images
const fileFilter = (req: any, file: any, cb: multer.FileFilterCallback) => {
    // Check if file is an image
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Chỉ cho phép upload file ảnh!"));
    }
};

// Configure multer with memory storage (for Cloudinary upload)
export const upload = multer({
    storage: multer.memoryStorage(), // Store in memory, not disk
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max file size
    }
});

