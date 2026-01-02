import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

// Configure Cloudinary (lazy initialization)
const configureCloudinary = () => {
    if (!cloudinary.config().cloud_name) {
        // Option 1: Use CLOUDINARY_URL (single variable - preferred)
        if (process.env.CLOUDINARY_URL) {
            try {
                // Parse CLOUDINARY_URL: cloudinary://api_key:api_secret@cloud_name
                const url = process.env.CLOUDINARY_URL;
                const match = url.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);

                if (match) {
                    const [, apiKey, apiSecret, cloudName] = match;
                    cloudinary.config({
                        cloud_name: cloudName,
                        api_key: apiKey,
                        api_secret: apiSecret
                    });
                    console.log("✅ Cloudinary configured using CLOUDINARY_URL");
                    return;
                } else {
                    console.error("❌ Invalid CLOUDINARY_URL format. Expected: cloudinary://api_key:api_secret@cloud_name");
                }
            } catch (error) {
                console.error("❌ Error parsing CLOUDINARY_URL:", error);
            }
        }

        // Option 2: Use separate variables
        if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
            console.error("❌ Cloudinary configuration missing:");
            console.error("CLOUDINARY_URL:", process.env.CLOUDINARY_URL ? `✅ Set (${process.env.CLOUDINARY_URL.substring(0, 20)}...)` : "❌ Missing");
            console.error("CLOUDINARY_CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME ? "✅ Set" : "❌ Missing");
            console.error("CLOUDINARY_API_KEY:", process.env.CLOUDINARY_API_KEY ? "✅ Set" : "❌ Missing");
            console.error("CLOUDINARY_API_SECRET:", process.env.CLOUDINARY_API_SECRET ? "✅ Set" : "❌ Missing");
            throw new Error("Cloudinary configuration is missing. Please provide either CLOUDINARY_URL or all three: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET");
        }

        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });

        console.log("✅ Cloudinary configured using separate variables");
    }
};

// Upload image from file buffer
export const uploadImageFromBuffer = async (
    buffer: Buffer,
    folder: string = "avatars",
    publicId?: string
): Promise<{ url: string; publicId: string }> => {
    configureCloudinary(); // Ensure Cloudinary is configured

    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: folder,
                public_id: publicId,
                resource_type: "image",
                transformation: [
                    { width: 500, height: 500, crop: "fill", gravity: "face" }, // Auto crop to face, resize to 500x500
                    { quality: "auto" }, // Auto optimize quality
                    { format: "auto" } // Auto format (webp if supported)
                ]
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else if (result) {
                    resolve({
                        url: result.secure_url,
                        publicId: result.public_id
                    });
                } else {
                    reject(new Error("Upload failed"));
                }
            }
        );

        // Convert buffer to stream
        const readableStream = new Readable();
        readableStream.push(buffer);
        readableStream.push(null);
        readableStream.pipe(uploadStream);
    });
};

// Upload image from URL
export const uploadImageFromUrl = async (
    imageUrl: string,
    folder: string = "avatars",
    publicId?: string
): Promise<{ url: string; publicId: string }> => {
    configureCloudinary(); // Ensure Cloudinary is configured

    try {
        const result = await cloudinary.uploader.upload(imageUrl, {
            folder: folder,
            public_id: publicId,
            resource_type: "image",
            transformation: [
                { width: 500, height: 500, crop: "fill", gravity: "face" },
                { quality: "auto" },
                { format: "auto" }
            ]
        });

        return {
            url: result.secure_url,
            publicId: result.public_id
        };
    } catch (error) {
        throw new Error("Failed to upload image from URL");
    }
};

// Delete image from Cloudinary
export const deleteImage = async (publicId: string): Promise<void> => {
    configureCloudinary(); // Ensure Cloudinary is configured

    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        throw new Error("Failed to delete image");
    }
};

// Extract public ID from Cloudinary URL
export const extractPublicIdFromUrl = (url: string): string | null => {
    try {
        // Cloudinary URL format: https://res.cloudinary.com/{cloud_name}/image/upload/{version}/{public_id}.{format}
        const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
        if (match && match[1]) {
            // Remove folder prefix if exists
            return match[1].replace(/^avatars\//, "");
        }
        return null;
    } catch (error) {
        return null;
    }
};

