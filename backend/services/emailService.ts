import nodemailer from "nodemailer";

// Create transporter for Gmail SMTP
const createTransporter = () => {
    return nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_APP_PASSWORD // Gmail App Password
        }
    });
};

// Send OTP email
export const sendOTPEmail = async (email: string, otp: string): Promise<void> => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `"E-commerce Platform" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Mã OTP đăng ký tài khoản",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Xác thực đăng ký tài khoản</h2>
                    <p>Xin chào,</p>
                    <p>Cảm ơn bạn đã đăng ký tài khoản. Vui lòng sử dụng mã OTP sau để hoàn tất đăng ký:</p>
                    <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px;">
                        <h1 style="color: #007bff; font-size: 32px; letter-spacing: 5px; margin: 0;">${otp}</h1>
                    </div>
                    <p><strong>Mã OTP này có hiệu lực trong 5 phút.</strong></p>
                    <p>Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="color: #666; font-size: 12px;">Email này được gửi tự động, vui lòng không trả lời.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`OTP email sent to ${email}`);
    } catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Failed to send OTP email");
    }
};

// Send reset password OTP email
export const sendResetPasswordEmail = async (email: string, otp: string, firstName: string): Promise<void> => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `"E-commerce Platform" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Mã OTP đặt lại mật khẩu",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Đặt lại mật khẩu</h2>
                    <p>Xin chào ${firstName},</p>
                    <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Vui lòng sử dụng mã OTP sau để đặt lại mật khẩu:</p>
                    <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px;">
                        <h1 style="color: #dc3545; font-size: 32px; letter-spacing: 5px; margin: 0;">${otp}</h1>
                    </div>
                    <p><strong>Mã OTP này có hiệu lực trong 10 phút.</strong></p>
                    <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này. Tài khoản của bạn vẫn an toàn.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="color: #666; font-size: 12px;">Email này được gửi tự động, vui lòng không trả lời.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`Reset password OTP email sent to ${email}`);
    } catch (error) {
        console.error("Error sending reset password email:", error);
        throw new Error("Failed to send reset password email");
    }
};

