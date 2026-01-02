import mongoose from "mongoose";

const resetPasswordSchema = new mongoose.Schema({
    email: { type: String, required: true, index: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false }, // Mark email as verified after OTP verification
    verifiedAt: { type: Date, default: null }, // When OTP was verified
    createdAt: { type: Date, default: Date.now }
}, { minimize: false });

// Auto delete expired documents (TTL index)
resetPasswordSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const resetPasswordModel = mongoose.models.resetPassword || mongoose.model("resetPassword", resetPasswordSchema);

export default resetPasswordModel;

