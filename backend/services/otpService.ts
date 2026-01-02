import otpModel from "../models/otpModel";

// Generate 6-digit OTP
export const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Save OTP to database
export const saveOTP = async (
    email: string,
    otp: string,
    userData: {
        firstName: string;
        lastName: string;
        password: string;
        gender?: string;
        phone?: string;
        address?: string;
    }
): Promise<void> => {
    // Delete any existing OTP for this email
    await otpModel.deleteMany({ email });

    // Create new OTP document (expires in 5 minutes)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    await otpModel.create({
        email,
        otp,
        userData,
        expiresAt,
        attempts: 0
    });
};

// Verify OTP
export const verifyOTP = async (email: string, otp: string): Promise<{
    isValid: boolean;
    userData?: {
        firstName: string;
        lastName: string;
        password: string;
        gender?: string;
        phone?: string;
        address?: string;
    };
    message: string;
}> => {
    // Find OTP document
    const otpDoc = await otpModel.findOne({ email });

    if (!otpDoc) {
        return {
            isValid: false,
            message: "Mã OTP không tồn tại hoặc đã hết hạn"
        };
    }

    // Check if OTP is expired
    if (new Date() > otpDoc.expiresAt) {
        await otpModel.deleteOne({ email });
        return {
            isValid: false,
            message: "Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới"
        };
    }

    // Check attempts (max 3 attempts)
    if (otpDoc.attempts >= 3) {
        await otpModel.deleteOne({ email });
        return {
            isValid: false,
            message: "Bạn đã nhập sai quá nhiều lần. Vui lòng yêu cầu mã OTP mới"
        };
    }

    // Verify OTP
    if (otpDoc.otp !== otp) {
        otpDoc.attempts += 1;
        await otpDoc.save();
        return {
            isValid: false,
            message: `Mã OTP không đúng. Bạn còn ${3 - otpDoc.attempts} lần thử`
        };
    }

    // OTP is valid - return userData and delete OTP
    const userData = otpDoc.userData;
    await otpModel.deleteOne({ email });

    return {
        isValid: true,
        userData,
        message: "Mã OTP hợp lệ"
    };
};

// Delete OTP (cleanup)
export const deleteOTP = async (email: string): Promise<void> => {
    await otpModel.deleteOne({ email });
};

