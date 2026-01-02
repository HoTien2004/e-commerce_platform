import resetPasswordModel from "../models/resetPasswordModel";

// Generate 6-digit OTP
export const generateResetOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Save reset password OTP to database
export const saveResetOTP = async (email: string, otp: string): Promise<void> => {
    // Delete any existing reset OTP for this email
    await resetPasswordModel.deleteMany({ email });

    // Create new reset OTP document (expires in 10 minutes)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    await resetPasswordModel.create({
        email,
        otp,
        expiresAt,
        attempts: 0
    });
};

// Verify reset password OTP (Step 2: Verify OTP only, mark as verified)
export const verifyResetOTP = async (email: string, otp: string): Promise<{
    isValid: boolean;
    message: string;
}> => {
    // Find reset OTP document
    const resetOTPDoc = await resetPasswordModel.findOne({ email });

    if (!resetOTPDoc) {
        return {
            isValid: false,
            message: "Mã OTP không tồn tại hoặc đã hết hạn"
        };
    }

    // Check if OTP is expired
    if (new Date() > resetOTPDoc.expiresAt) {
        await resetPasswordModel.deleteOne({ email });
        return {
            isValid: false,
            message: "Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới"
        };
    }

    // Check attempts (max 3 attempts)
    if (resetOTPDoc.attempts >= 3) {
        await resetPasswordModel.deleteOne({ email });
        return {
            isValid: false,
            message: "Bạn đã nhập sai quá nhiều lần. Vui lòng yêu cầu mã OTP mới"
        };
    }

    // Verify OTP
    if (resetOTPDoc.otp !== otp) {
        resetOTPDoc.attempts += 1;
        await resetOTPDoc.save();
        return {
            isValid: false,
            message: `Mã OTP không đúng. Bạn còn ${3 - resetOTPDoc.attempts} lần thử`
        };
    }

    // OTP is valid - mark as verified (don't delete yet, will be deleted after password reset)
    resetOTPDoc.isVerified = true;
    resetOTPDoc.verifiedAt = new Date();
    await resetOTPDoc.save();

    return {
        isValid: true,
        message: "Mã OTP hợp lệ"
    };
};

// Check if email is verified for password reset (Step 3: Check before resetting password)
export const isEmailVerifiedForReset = async (email: string): Promise<boolean> => {
    const resetOTPDoc = await resetPasswordModel.findOne({ 
        email, 
        isVerified: true 
    });

    if (!resetOTPDoc) {
        return false;
    }

    // Check if verification is still valid (within 10 minutes of verification)
    const now = new Date();
    const verifiedAt = resetOTPDoc.verifiedAt || resetOTPDoc.createdAt;
    const timeDiff = now.getTime() - verifiedAt.getTime();
    const minutesDiff = timeDiff / (1000 * 60);

    // Verification valid for 10 minutes
    if (minutesDiff > 10) {
        await resetPasswordModel.deleteOne({ email });
        return false;
    }

    return true;
};

// Delete reset OTP (cleanup)
export const deleteResetOTP = async (email: string): Promise<void> => {
    await resetPasswordModel.deleteOne({ email });
};

