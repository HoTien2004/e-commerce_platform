import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
    email: { type: String, required: true, index: true },
    otp: { type: String, required: true },
    userData: {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        password: { type: String, required: true },
        gender: { type: String, enum: ["male", "female", "other"], default: null },
        phone: { type: String, default: null },
        address: { type: String, default: null }
    },
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
}, { minimize: false });

// Auto delete expired documents (TTL index)
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const otpModel = mongoose.models.otp || mongoose.model("otp", otpSchema);

export default otpModel;

