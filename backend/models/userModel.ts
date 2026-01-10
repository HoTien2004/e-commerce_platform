import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    gender: { type: String, enum: ["male", "female", "other"], default: null },
    phone: { type: String, default: null },
    address: { type: String, default: null },
    role: { type: String, enum: ["user", "admin"], default: "user" },// Protected admin cannot be deleted
    refreshToken: { type: String, default: null },
    avatar: { type: String, default: null }, // Cloudinary URL
    avatarPublicId: { type: String, default: null }, // Cloudinary public ID for deletion
    cartId: { type: mongoose.Schema.Types.ObjectId, ref: 'cart', default: null }
}, { minimize: false });

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;