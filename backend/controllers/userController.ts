import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import userModel from "../models/userModel";
import { generateOTP, saveOTP, verifyOTP, deleteOTP } from "../services/otpService";
import { sendOTPEmail, sendResetPasswordEmail } from "../services/emailService";
import { generateResetOTP, saveResetOTP, verifyResetOTP, deleteResetOTP, isEmailVerifiedForReset } from "../services/resetPasswordService";
import { uploadImageFromBuffer, deleteImage } from "../services/cloudinaryService";
import otpModel from "../models/otpModel";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "default_refresh_secret";

// Validate password strength
const validatePasswordStrength = (password: string): { isValid: boolean; message: string } => {
    // Minimum 8 characters
    if (password.length < 8) {
        return {
            isValid: false,
            message: "Mật khẩu phải có ít nhất 8 ký tự"
        };
    }

    // At least one uppercase letter
    if (!/[A-Z]/.test(password)) {
        return {
            isValid: false,
            message: "Mật khẩu phải có ít nhất 1 chữ cái viết hoa"
        };
    }

    // At least one lowercase letter
    if (!/[a-z]/.test(password)) {
        return {
            isValid: false,
            message: "Mật khẩu phải có ít nhất 1 chữ cái viết thường"
        };
    }

    // At least one number
    if (!/[0-9]/.test(password)) {
        return {
            isValid: false,
            message: "Mật khẩu phải có ít nhất 1 chữ số"
        };
    }

    // At least one special character
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        return {
            isValid: false,
            message: "Mật khẩu phải có ít nhất 1 ký tự đặc biệt (!@#$%^&*...)"
        };
    }

    return {
        isValid: true,
        message: "Mật khẩu hợp lệ"
    };
};

// Create access token
const createAccessToken = (id: string): string => {
    return jwt.sign({ id }, JWT_SECRET, { expiresIn: "1h" });
}

// Create refresh token
const createRefreshToken = (id: string): string => {
    return jwt.sign({ id }, JWT_REFRESH_SECRET, { expiresIn: "7d" });
}

// Login user
const loginUser = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập email và mật khẩu"
            });
        }

        // Validate email format
        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Email không hợp lệ"
            });
        }

        // Find user by email
        const user = await userModel.findOne({ email: email } as any);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Email hoặc mật khẩu không đúng"
            });
        }

        // Compare password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Email hoặc mật khẩu không đúng"
            });
        }

        // Create tokens
        const accessToken = createAccessToken(user._id.toString());
        const refreshToken = createRefreshToken(user._id.toString());

        // Save refresh token to database
        user.refreshToken = refreshToken;
        await user.save();

        // Return result
        return res.status(200).json({
            success: true,
            message: "Đăng nhập thành công",
            data: {
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    gender: user.gender,
                    phone: user.phone,
                    address: user.address,
                    avatar: user.avatar,
                    role: user.role
                },
                accessToken,
                refreshToken
            }
        });

    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi server, vui lòng thử lại sau"
        });
    }
}

const logoutUser = async (req: Request, res: Response): Promise<Response> => {
    try {
        const userId = (req as any).userId;
        const user = await userModel.findOne({ _id: userId } as any);
        if (user) {
            user.refreshToken = null;
            await user.save();
        }
        return res.status(200).json({
            success: true,
            message: "Đăng xuất thành công"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Lỗi server"
        });
    }
};

// Refresh access token
const refreshAccessToken = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: "Refresh token không được cung cấp"
            });
        }

        // Verify refresh token
        let decoded: any;
        try {
            decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: "Refresh token không hợp lệ hoặc đã hết hạn"
            });
        }

        // Find user and check if refresh token matches
        const user = await userModel.findOne({ _id: decoded.id } as any);
        if (!user || user.refreshToken !== refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Refresh token không hợp lệ"
            });
        }

        // Generate new access token
        const newAccessToken = createAccessToken(user._id.toString());

        return res.status(200).json({
            success: true,
            message: "Token đã được làm mới",
            data: {
                accessToken: newAccessToken
            }
        });

    } catch (error) {
        console.error("Refresh token error:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi server, vui lòng thử lại sau"
        });
    }
}

// Register user - Step 1: Send registration info and receive OTP
const registerUser = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { firstName, lastName, email, password, confirmPassword, gender, phone, address } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !email || !password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng điền đầy đủ thông tin"
            });
        }

        // Validate email format
        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Email không hợp lệ"
            });
        }

        // Validate password match
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Mật khẩu nhập lại không khớp"
            });
        }

        // Validate password strength
        const passwordValidation = validatePasswordStrength(password);
        if (!passwordValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: passwordValidation.message
            });
        }

        // Check if email already exists
        const existingUser = await userModel.findOne({ email: email } as any);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email đã được sử dụng"
            });
        }

        // Generate OTP
        const otpCode = generateOTP();

        // Validate gender if provided
        if (gender && !["male", "female", "other"].includes(gender)) {
            return res.status(400).json({
                success: false,
                message: "Giới tính không hợp lệ. Vui lòng chọn: male, female, hoặc other"
            });
        }

        // Save OTP with user data
        await saveOTP(email, otpCode, {
            firstName,
            lastName,
            password,
            gender: gender || undefined,
            phone: phone || undefined,
            address: address || undefined
        });

        // Send OTP email
        try {
            await sendOTPEmail(email, otpCode);
        } catch (emailError) {
            // If email fails, delete OTP
            await deleteOTP(email);
            return res.status(500).json({
                success: false,
                message: "Không thể gửi email. Vui lòng thử lại sau"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra email và nhập mã OTP để hoàn tất đăng ký.",
            data: {
                email,
                expiresIn: 300 // 5 minutes in seconds
            }
        });

    } catch (error) {
        console.error("Register error:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi server, vui lòng thử lại sau"
        });
    }
}

// Verify OTP and complete registration - Step 2
const verifyOTPAndRegister = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { email, otp } = req.body;

        // Validate required fields
        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập email và mã OTP"
            });
        }

        // Validate email format
        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Email không hợp lệ"
            });
        }

        // Verify OTP
        const otpResult = await verifyOTP(email, otp);

        if (!otpResult.isValid) {
            return res.status(400).json({
                success: false,
                message: otpResult.message
            });
        }

        // OTP is valid, get user data
        const userData = otpResult.userData;
        if (!userData) {
            return res.status(500).json({
                success: false,
                message: "Lỗi xử lý dữ liệu"
            });
        }

        // Check if user already exists (double check)
        const existingUser = await userModel.findOne({ email: email } as any);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email đã được sử dụng"
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);

        // Create new user
        const newUser = new userModel({
            firstName: userData.firstName,
            lastName: userData.lastName,
            email,
            password: hashedPassword,
            gender: userData.gender || null,
            phone: userData.phone || null,
            address: userData.address || null
        });

        const savedUser = await newUser.save();

        // Create tokens
        const accessToken = createAccessToken(savedUser._id.toString());
        const refreshToken = createRefreshToken(savedUser._id.toString());

        // Save refresh token to database
        savedUser.refreshToken = refreshToken;
        await savedUser.save();

        // Return result (without password)
        return res.status(201).json({
            success: true,
            message: "Đăng ký thành công",
            data: {
                user: {
                    id: savedUser._id,
                    firstName: savedUser.firstName,
                    lastName: savedUser.lastName,
                    email: savedUser.email,
                    gender: savedUser.gender,
                    phone: savedUser.phone,
                    address: savedUser.address
                },
                accessToken,
                refreshToken
            }
        });

    } catch (error) {
        console.error("Verify OTP and register error:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi server, vui lòng thử lại sau"
        });
    }
}

// Get user profile
const getUserProfile = async (req: Request, res: Response): Promise<Response> => {
    try {
        const userId = (req as any).userId;

        const user = await userModel.findOne({ _id: userId } as any);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy người dùng"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Lấy thông tin thành công",
            data: {
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    gender: user.gender,
                    phone: user.phone,
                    address: user.address,
                    avatar: user.avatar
                }
            }
        });

    } catch (error) {
        console.error("Get profile error:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi server, vui lòng thử lại sau"
        });
    }
}

// Update user profile
const updateUserProfile = async (req: Request, res: Response): Promise<Response> => {
    try {
        const userId = (req as any).userId;
        const { firstName, lastName, email, gender, phone, address } = req.body;

        const user = await userModel.findOne({ _id: userId } as any);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy người dùng"
            });
        }

        // Validate email if provided
        if (email && !validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Email không hợp lệ"
            });
        }

        // Check if email is already used by another user
        if (email && email !== user.email) {
            const existingUser = await userModel.findOne({ email: email } as any);
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: "Email đã được sử dụng"
                });
            }
        }

        // Validate gender if provided
        if (gender && !["male", "female", "other"].includes(gender)) {
            return res.status(400).json({
                success: false,
                message: "Giới tính không hợp lệ. Vui lòng chọn: male, female, hoặc other"
            });
        }

        // Update fields (only update if provided)
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (email) user.email = email;
        if (gender !== undefined) user.gender = gender || null;
        if (phone !== undefined) user.phone = phone || null;
        if (address !== undefined) user.address = address || null;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Cập nhật thông tin thành công",
            data: {
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    gender: user.gender,
                    phone: user.phone,
                    address: user.address,
                    avatar: user.avatar
                }
            }
        });

    } catch (error) {
        console.error("Update profile error:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi server, vui lòng thử lại sau"
        });
    }
}

// Change password
const changePassword = async (req: Request, res: Response): Promise<Response> => {
    try {
        const userId = (req as any).userId;
        const { currentPassword, newPassword, confirmPassword } = req.body;

        // Validate required fields
        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng điền đầy đủ thông tin"
            });
        }

        // Validate password match
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Mật khẩu mới nhập lại không khớp"
            });
        }

        // Validate password strength
        const passwordValidation = validatePasswordStrength(newPassword);
        if (!passwordValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: passwordValidation.message
            });
        }

        // Find user
        const user = await userModel.findOne({ _id: userId } as any);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy người dùng"
            });
        }

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Mật khẩu hiện tại không đúng"
            });
        }

        // Check if new password is same as current
        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
            return res.status(400).json({
                success: false,
                message: "Mật khẩu mới phải khác mật khẩu hiện tại"
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Đổi mật khẩu thành công"
        });

    } catch (error) {
        console.error("Change password error:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi server, vui lòng thử lại sau"
        });
    }
}

// Resend OTP for registration
const resendOTP = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { email } = req.body;

        // Validate required fields
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập email"
            });
        }

        // Validate email format
        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Email không hợp lệ"
            });
        }

        // Find existing OTP document (check if user has pending registration)
        const existingOTP = await otpModel.findOne({ email });

        if (!existingOTP) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy mã OTP. Vui lòng đăng ký lại"
            });
        }

        // Check if OTP is expired
        if (new Date() > existingOTP.expiresAt) {
            // Delete expired OTP
            await otpModel.deleteOne({ email });
            return res.status(400).json({
                success: false,
                message: "Mã OTP đã hết hạn. Vui lòng đăng ký lại"
            });
        }

        // Get userData from existing OTP
        const userData = existingOTP.userData;

        // Generate new OTP
        const newOTP = generateOTP();

        // Save new OTP (this will delete the old one automatically via saveOTP)
        await saveOTP(email, newOTP, {
            firstName: userData.firstName,
            lastName: userData.lastName,
            password: userData.password,
            gender: userData.gender || undefined,
            phone: userData.phone || undefined,
            address: userData.address || undefined
        });

        // Send new OTP email
        try {
            await sendOTPEmail(email, newOTP);
        } catch (emailError) {
            // If email fails, delete OTP
            await deleteOTP(email);
            return res.status(500).json({
                success: false,
                message: "Không thể gửi email. Vui lòng thử lại sau"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Mã OTP mới đã được gửi đến email của bạn. Vui lòng kiểm tra email và nhập mã OTP để hoàn tất đăng ký.",
            data: {
                email,
                expiresIn: 300 // 5 minutes in seconds
            }
        });

    } catch (error) {
        console.error("Resend OTP error:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi server, vui lòng thử lại sau"
        });
    }
}

// Forgot password - Step 1: Request reset password OTP
const forgotPassword = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { email } = req.body;

        // Validate required fields
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập email"
            });
        }

        // Validate email format
        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Email không hợp lệ"
            });
        }

        // Check if user exists
        const user = await userModel.findOne({ email: email } as any);
        if (!user) {
            // Don't reveal if email exists or not (security best practice)
            return res.status(200).json({
                success: true,
                message: "Nếu email tồn tại trong hệ thống, mã OTP đặt lại mật khẩu đã được gửi đến email của bạn"
            });
        }

        // Generate reset OTP
        const resetOTP = generateResetOTP();

        // Save reset OTP
        await saveResetOTP(email, resetOTP);

        // Send reset password email
        try {
            await sendResetPasswordEmail(email, resetOTP, user.firstName);
        } catch (emailError) {
            // If email fails, delete OTP
            await deleteResetOTP(email);
            return res.status(500).json({
                success: false,
                message: "Không thể gửi email. Vui lòng thử lại sau"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Mã OTP đặt lại mật khẩu đã được gửi đến email của bạn. Vui lòng kiểm tra email và nhập mã OTP để đặt lại mật khẩu.",
            data: {
                email, // FE sẽ lưu email này và gửi lại ở các bước tiếp theo
                expiresIn: 600 // 10 minutes in seconds
            }
        });

    } catch (error) {
        console.error("Forgot password error:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi server, vui lòng thử lại sau"
        });
    }
}

// Verify reset password OTP - Step 2: Verify OTP only
const verifyResetPasswordOTP = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { email, otp } = req.body;

        // Validate required fields
        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập email và mã OTP"
            });
        }

        // Validate email format
        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Email không hợp lệ"
            });
        }

        // Verify reset OTP
        const otpResult = await verifyResetOTP(email, otp);

        if (!otpResult.isValid) {
            return res.status(400).json({
                success: false,
                message: otpResult.message
            });
        }

        return res.status(200).json({
            success: true,
            message: "Mã OTP hợp lệ. Bạn có thể đặt lại mật khẩu.",
            data: {
                email // FE tiếp tục dùng email này cho bước 3
            }
        });

    } catch (error) {
        console.error("Verify reset password OTP error:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi server, vui lòng thử lại sau"
        });
    }
}

// Reset password - Step 3: Reset password (after OTP verified)
const resetPassword = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { email, newPassword, confirmPassword } = req.body;

        // Validate required fields
        if (!email || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng điền đầy đủ thông tin"
            });
        }

        // Validate email format
        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Email không hợp lệ"
            });
        }

        // Validate password match
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Mật khẩu nhập lại không khớp"
            });
        }

        // Validate password strength
        const passwordValidation = validatePasswordStrength(newPassword);
        if (!passwordValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: passwordValidation.message
            });
        }

        // Check if email is verified for password reset
        const isVerified = await isEmailVerifiedForReset(email);
        if (!isVerified) {
            return res.status(400).json({
                success: false,
                message: "Email chưa được xác thực OTP. Vui lòng xác thực OTP trước."
            });
        }

        // Find user
        const user = await userModel.findOne({ email: email } as any);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy người dùng"
            });
        }

        // Check if new password is same as current password
        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
            return res.status(400).json({
                success: false,
                message: "Mật khẩu mới phải khác mật khẩu hiện tại"
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        user.password = hashedPassword;
        await user.save();

        // Delete reset OTP document after successful password reset
        await deleteResetOTP(email);

        return res.status(200).json({
            success: true,
            message: "Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại với mật khẩu mới."
        });

    } catch (error) {
        console.error("Reset password error:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi server, vui lòng thử lại sau"
        });
    }
}

// Upload avatar from file
const uploadAvatar = async (req: Request, res: Response): Promise<Response> => {
    try {
        const userId = (req as any).userId;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng chọn file ảnh"
            });
        }

        const user = await userModel.findOne({ _id: userId } as any);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy người dùng"
            });
        }

        // Delete old avatar if exists
        if (user.avatarPublicId) {
            try {
                await deleteImage(user.avatarPublicId);
            } catch (error) {
                console.error("Error deleting old avatar:", error);
                // Continue even if deletion fails
            }
        }

        // Upload new avatar to Cloudinary
        const uploadResult = await uploadImageFromBuffer(
            req.file.buffer,
            "avatars",
            `user-${userId}`
        );

        // Update user avatar
        user.avatar = uploadResult.url;
        user.avatarPublicId = uploadResult.publicId;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Upload avatar thành công",
            data: {
                avatar: user.avatar
            }
        });

    } catch (error) {
        console.error("Upload avatar error:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi server, vui lòng thử lại sau"
        });
    }
}

// Delete avatar
const deleteAvatar = async (req: Request, res: Response): Promise<Response> => {
    try {
        const userId = (req as any).userId;

        const user = await userModel.findOne({ _id: userId } as any);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy người dùng"
            });
        }

        if (!user.avatar || !user.avatarPublicId) {
            return res.status(400).json({
                success: false,
                message: "Bạn chưa có avatar để xóa"
            });
        }

        // Delete from Cloudinary
        try {
            await deleteImage(user.avatarPublicId);
        } catch (error) {
            console.error("Error deleting avatar from Cloudinary:", error);
            // Continue to remove from database even if Cloudinary deletion fails
        }

        // Remove avatar from user
        user.avatar = null;
        user.avatarPublicId = null;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Xóa avatar thành công"
        });

    } catch (error) {
        console.error("Delete avatar error:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi server, vui lòng thử lại sau"
        });
    }
}

export {
    loginUser,
    logoutUser,
    registerUser,
    verifyOTPAndRegister,
    resendOTP,
    forgotPassword,
    verifyResetPasswordOTP,
    resetPassword,
    refreshAccessToken,
    getUserProfile,
    updateUserProfile,
    changePassword,
    uploadAvatar,
    deleteAvatar
};