import express from "express";
import { loginUser, logoutUser, registerUser, verifyOTPAndRegister, resendOTP, forgotPassword, verifyResetPasswordOTP, resetPassword, refreshAccessToken, getUserProfile, updateUserProfile, changePassword, uploadAvatar, deleteAvatar } from "../controllers/userController";
import { verifyToken } from "../middleware/authMiddleware";
import { upload } from "../middleware/uploadMiddleware";

const userRouter = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         email:
 *           type: string
 *         gender:
 *           type: string
 *           enum: [male, female, other]
 *         phone:
 *           type: string
 *         address:
 *           type: string
 *         role:
 *           type: string
 *           enum: [user, admin]
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *         - password
 *         - confirmPassword
 *       properties:
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         email:
 *           type: string
 *         password:
 *           type: string
 *           description: "Password must be at least 8 characters, contain uppercase, lowercase, number, and special character"
 *           example: "Password123!"
 *         confirmPassword:
 *           type: string
 *           example: "Password123!"
 *         gender:
 *           type: string
 *           enum: [male, female, other]
 *           description: "Optional - User gender"
 *         phone:
 *           type: string
 *         address:
 *           type: string
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *         password:
 *           type: string
 */

/**
 * @swagger
 * /api/user/register:
 *   post:
 *     summary: "Register a new account"
 *     description: Send registration information to receive OTP code via email. Phone and address are optional.
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *           examples:
 *             default:
 *               value:
 *                 firstName: "John"
 *                 lastName: "Doe"
 *                 email: "john@example.com"
 *                 password: "Password123!"
 *                 confirmPassword: "Password123!"
 *                 gender: "male"
 *                 phone: "0123456789"
 *                 address: "123 Main Street"
 *     responses:
 *       200:
 *         description: OTP sent successfully to email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra email và nhập mã OTP để hoàn tất đăng ký."
 *                 data:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                       example: "john@example.com"
 *                     expiresIn:
 *                       type: number
 *                       example: 300
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Vui lòng điền đầy đủ thông tin"
 *       500:
 *         description: Failed to send email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Không thể gửi email. Vui lòng thử lại sau"
 */
userRouter.post("/register", registerUser);

/**
 * @swagger
 * /api/user/verify-otp:
 *   post:
 *     summary: "Verify OTP and complete registration"
 *     description: Enter OTP code received via email to complete registration and receive access tokens
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *               otp:
 *                 type: string
 *                 pattern: "^[0-9]{6}$"
 *                 example: "123456"
 *           examples:
 *             default:
 *               value:
 *                 email: "john@example.com"
 *                 otp: "123456"
 *     responses:
 *       201:
 *         description: Registration successful, tokens returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Đăng ký thành công"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     accessToken:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     refreshToken:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Invalid OTP or validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   examples:
 *                     invalidOtp:
 *                       value: "Mã OTP không đúng. Bạn còn 2 lần thử"
 *                     expiredOtp:
 *                       value: "Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới"
 *                     emailExists:
 *                       value: "Email đã được sử dụng"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Lỗi server, vui lòng thử lại sau"
 */
userRouter.post("/verify-otp", verifyOTPAndRegister);

/**
 * @swagger
 * /api/user/resend-otp:
 *   post:
 *     summary: "Resend OTP code"
 *     description: Request a new OTP code if the previous one expired or was not received. Only works if there is a pending registration for the email.
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *           examples:
 *             default:
 *               value:
 *                 email: "john@example.com"
 *     responses:
 *       200:
 *         description: New OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Mã OTP mới đã được gửi đến email của bạn. Vui lòng kiểm tra email và nhập mã OTP để hoàn tất đăng ký."
 *                 data:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                       example: "john@example.com"
 *                     expiresIn:
 *                       type: number
 *                       example: 300
 *       400:
 *         description: Validation error or OTP expired
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   examples:
 *                     invalidEmail:
 *                       value: "Email không hợp lệ"
 *                     expiredOtp:
 *                       value: "Mã OTP đã hết hạn. Vui lòng đăng ký lại"
 *       404:
 *         description: No pending OTP found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Không tìm thấy mã OTP. Vui lòng đăng ký lại"
 *       500:
 *         description: Failed to send email or server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Không thể gửi email. Vui lòng thử lại sau"
 */
userRouter.post("/resend-otp", resendOTP);

/**
 * @swagger
 * /api/user/login:
 *   post:
 *     summary: User login
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid email or password
 */
userRouter.post("/login", loginUser);

/**
 * @swagger
 * /api/user/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Invalid refresh token
 */
userRouter.post("/refresh-token", refreshAccessToken);

/**
 * @swagger
 * /api/user/logout:
 *   post:
 *     summary: User logout
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Invalid token
 */
userRouter.post("/logout", verifyToken, logoutUser);

/**
 * @swagger
 * /api/user/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User information
 *       401:
 *         description: Invalid token
 */
userRouter.get("/profile", verifyToken, getUserProfile);

/**
 * @swagger
 * /api/user/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Invalid token
 */
userRouter.put("/profile", verifyToken, updateUserProfile);

/**
 * @swagger
 * /api/user/password:
 *   put:
 *     summary: Change password
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       401:
 *         description: Current password is incorrect
 */
userRouter.put("/password", verifyToken, changePassword);

/**
 * @swagger
 * /api/user/forgot-password:
 *   post:
 *     summary: "Request password reset OTP"
 *     description: Send OTP code to email for password reset. If email exists, OTP will be sent. For security, the response is the same whether email exists or not.
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *           examples:
 *             default:
 *               value:
 *                 email: "john@example.com"
 *     responses:
 *       200:
 *         description: OTP sent successfully (if email exists)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Mã OTP đặt lại mật khẩu đã được gửi đến email của bạn. Vui lòng kiểm tra email và nhập mã OTP để đặt lại mật khẩu."
 *                 data:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                       description: "FE should save this email and send it in verify-reset-otp and reset-password APIs"
 *                       example: "john@example.com"
 *                     expiresIn:
 *                       type: number
 *                       example: 600
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Email không hợp lệ"
 *       500:
 *         description: Failed to send email or server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Không thể gửi email. Vui lòng thử lại sau"
 */
userRouter.post("/forgot-password", forgotPassword);

/**
 * @swagger
 * /api/user/verify-reset-otp:
 *   post:
 *     summary: "Verify reset password OTP"
 *     description: Step 2 - Verify OTP code received via email. FE should send the email saved from forgot-password API.
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: "Email saved from forgot-password API"
 *                 example: "john@example.com"
 *               otp:
 *                 type: string
 *                 pattern: "^[0-9]{6}$"
 *                 example: "123456"
 *           examples:
 *             default:
 *               value:
 *                 email: "john@example.com"
 *                 otp: "123456"
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Mã OTP hợp lệ. Bạn có thể đặt lại mật khẩu."
 *                 data:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                       description: "Email to use in reset-password API"
 *                       example: "john@example.com"
 *       400:
 *         description: Invalid OTP or validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   examples:
 *                     invalidOtp:
 *                       value: "Mã OTP không đúng. Bạn còn 2 lần thử"
 *                     expiredOtp:
 *                       value: "Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Lỗi server, vui lòng thử lại sau"
 */
userRouter.post("/verify-reset-otp", verifyResetPasswordOTP);

/**
 * @swagger
 * /api/user/reset-password:
 *   post:
 *     summary: "Reset password"
 *     description: Step 3 - Set new password after OTP verification. FE should send the email saved from forgot-password API.
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: "Email saved from forgot-password API"
 *                 example: "john@example.com"
 *               newPassword:
 *                 type: string
 *                 description: "Password must be at least 8 characters, contain uppercase, lowercase, number, and special character"
 *                 example: "NewPassword123!"
 *               confirmPassword:
 *                 type: string
 *                 example: "NewPassword123!"
 *           examples:
 *             default:
 *               value:
 *                 email: "john@example.com"
 *                 newPassword: "NewPassword123!"
 *                 confirmPassword: "NewPassword123!"
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại với mật khẩu mới."
 *       400:
 *         description: Email not verified, validation error, or password mismatch
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   examples:
 *                     passwordMismatch:
 *                       value: "Mật khẩu nhập lại không khớp"
 *                     samePassword:
 *                       value: "Mật khẩu mới phải khác mật khẩu hiện tại"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Không tìm thấy người dùng"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Lỗi server, vui lòng thử lại sau"
 */
userRouter.post("/reset-password", resetPassword);

/**
 * @swagger
 * /api/user/avatar:
 *   post:
 *     summary: "Upload avatar from file"
 *     description: Upload avatar image from file. Old avatar will be automatically deleted. Image will be auto-resized to 500x500 and optimized.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - avatar
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: "Image file (max 5MB)"
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Upload avatar thành công"
 *                 data:
 *                   type: object
 *                   properties:
 *                     avatar:
 *                       type: string
 *                       format: uri
 *                       example: "https://res.cloudinary.com/..."
 *       400:
 *         description: No file provided or invalid file
 *       401:
 *         description: Invalid token
 *       500:
 *         description: Server error
 */
userRouter.post("/avatar", verifyToken, upload.single("avatar"), uploadAvatar);

/**
 * @swagger
 * /api/user/avatar:
 *   delete:
 *     summary: "Delete avatar"
 *     description: Delete user's avatar. Avatar will be removed from Cloudinary and database.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Avatar deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Xóa avatar thành công"
 *       400:
 *         description: User has no avatar
 *       401:
 *         description: Invalid token
 *       500:
 *         description: Server error
 */
userRouter.delete("/avatar", verifyToken, deleteAvatar);

export default userRouter;
